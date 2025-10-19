import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

// Reuse global prisma client
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['error', 'warn'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Simple transporter using SMTP credentials from env
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function sendWithSendGrid(emails: string[], title: string, description: string | undefined, slug: string) {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) return null;
  sgMail.setApiKey(key);

  const from = process.env.EMAIL_FROM || process.env.SENDGRID_FROM;

  // Create personalizations for batching (SendGrid allows up to 1000 recipients with BCC-like personalization)
  const msg = {
    from,
    personalizations: [
      {
        to: emails.map((e) => ({ email: e })),
        subject: `New/Updated blog: ${title}`,
      },
    ],
    content: [
      {
        type: 'text/html',
        value: `<p>${description || ''}</p><p><a href="${process.env.SITE_URL || ''}/blog/${slug}">Read the post</a></p>`,
      },
    ],
  } as any;

  return sgMail.send(msg);
}

export default async function publishBlog(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  // Simple admin auth: require header 'x-admin-secret' to match ADMIN_PASSWORD
  const adminSecret = req.headers['x-admin-secret'] as string | undefined;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) {
    console.warn('ADMIN_PASSWORD is not configured; publish endpoint is disabled');
    return res.status(500).json({ error: 'Server not configured' });
  }
  if (!adminSecret || adminSecret !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id, title, slug, category, description, thumbnail, content, notify } = req.body;
  if (!title || !slug || !content) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const blog = await prisma.blog.upsert({
      where: { slug },
      create: { title, slug, category: category || 'general', description, thumbnail, content },
      update: { title, category: category || 'general', description, thumbnail, content },
    });

    // If notify flag is set, enqueue email jobs instead of sending inline.
    if (notify) {
      const subscribers = await prisma.email.findMany();
      const emails = subscribers.map((s) => s.email).filter(Boolean) as string[];

      if (emails.length > 0) {
        // Create EmailJob records in batches to avoid large single writes
        const batchSize = 500;
        for (let i = 0; i < emails.length; i += batchSize) {
          const batch = emails.slice(i, i + batchSize);
          const jobs = batch.map((to) => ({
            to,
            subject: `New/Updated blog: ${title}`,
            body: `<p>${description || ''}</p><p><a href="${process.env.SITE_URL || ''}/blog/${slug}">Read the post</a></p>`,
          }));
          // eslint-disable-next-line no-await-in-loop
          await prisma.emailJob.createMany({ data: jobs });
        }
      }
  }

  return res.status(200).json({ success: true, blog });
  } catch (err: any) {
    console.error('publishBlog error:', err?.message || err);
    return res.status(500).json({ error: 'Server error', details: err?.message });
  }
}
