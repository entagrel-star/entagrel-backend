import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { compile } from 'xdm';
import jwt from 'jsonwebtoken';

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

  // Admin auth: prefer Bearer JWT (signed with JWT_SECRET). For backwards
  // compatibility, if no JWT_SECRET is configured, allow old ADMIN_PASSWORD
  // header 'x-admin-secret' to authenticate.
  const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
  const JWT_SECRET = process.env.JWT_SECRET;
  let authorId: string | undefined;

  if (JWT_SECRET && authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      if (payload && payload.role === 'admin' && payload.id) {
        authorId = payload.id;
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    // fallback: shared ADMIN_PASSWORD header (legacy)
    const adminSecret = req.headers['x-admin-secret'] as string | undefined;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) {
      console.warn('ADMIN_PASSWORD is not configured; publish endpoint is disabled');
      return res.status(500).json({ error: 'Server not configured' });
    }
    if (!adminSecret || adminSecret !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const { id, title, slug, category, description, thumbnail, content, notify } = req.body;
  if (!title || !slug || !content) return res.status(400).json({ error: 'Missing required fields' });

  try {
    let compiledHtml: string | undefined = undefined;
    if ((req.body.contentType || 'mdx') === 'mdx') {
      try {
        const compiled = await compile(content, { jsx: true });
        compiledHtml = String(compiled);
      } catch (e) {
        console.warn('MDX compile failed, storing raw content');
      }
    }

  const createData: any = { title, slug, category: category || 'general', description, thumbnail, content, contentType: req.body.contentType || 'mdx', compiledHtml, authorId };
  const updateData: any = { title, category: category || 'general', description, thumbnail, content, contentType: req.body.contentType || 'mdx', compiledHtml, authorId };

    const blog = await prisma.blog.upsert({
      where: { slug },
      create: createData,
      update: updateData,
    } as any);

    // If notify flag is set, enqueue email jobs instead of sending inline.
    if (notify) {
  const subscribers = await (prisma as any).email.findMany({ where: { unsubscribed: false } });
  const emails = (subscribers as any[]).map((s) => s.email).filter(Boolean) as string[];

      if (emails.length > 0) {
        // Create EmailJob records in batches to avoid large single writes
        const batchSize = 500;
        for (let i = 0; i < emails.length; i += batchSize) {
          const batch = emails.slice(i, i + batchSize);
          const jobs = batch.map((to) => {
            const token = (process.env.JWT_SECRET || process.env.ADMIN_PASSWORD)
              ? jwt.sign({ email: to }, (process.env.JWT_SECRET || process.env.ADMIN_PASSWORD) as string, { expiresIn: '30d' })
              : undefined;
            const unsubscribeLink = token
              ? `${process.env.SITE_URL || ''}/api/unsubscribe?token=${token}`
              : `${process.env.SITE_URL || ''}/api/unsubscribe?email=${encodeURIComponent(to)}`;
            return {
              to,
              subject: `New/Updated blog: ${title}`,
              body: `<p>${description || ''}</p><p><a href="${process.env.SITE_URL || ''}/blog/${slug}">Read the post</a></p><p><a href="${unsubscribeLink}">Unsubscribe</a></p>`,
            };
          });
          await (prisma as any).emailJob.createMany({ data: jobs });
        }
      }
  }

  return res.status(200).json({ success: true, blog });
  } catch (err: any) {
    console.error('publishBlog error:', err?.message || err);
    return res.status(500).json({ error: 'Server error', details: err?.message });
  }
}
