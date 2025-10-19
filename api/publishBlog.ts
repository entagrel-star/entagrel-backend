import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

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

export default async function publishBlog(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { id, title, slug, category, description, thumbnail, content, notify } = req.body;
  if (!title || !slug || !content) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const blog = await prisma.blog.upsert({
      where: { slug },
      create: { title, slug, category: category || 'general', description, thumbnail, content },
      update: { title, category: category || 'general', description, thumbnail, content },
    });

    // If notify flag is set, fetch subscribers and send email notifications
    if (notify) {
      const subscribers = await prisma.email.findMany();
      const emails = subscribers.map((s) => s.email).filter(Boolean);

      const transporter = createTransporter();
      if (!transporter) {
        console.warn('SMTP not configured; skipping notifications');
        return res.status(200).json({ blog, notified: false, reason: 'SMTP not configured' });
      }

      // Send in batches of 50
      const batchSize = 50;
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        const mailOptions = {
          from: process.env.EMAIL_FROM || process.env.SMTP_USER,
          to: batch.join(','),
          subject: `New/Updated blog: ${title}`,
          html: `<p>${description || ''}</p><p><a href="${process.env.SITE_URL || ''}/blog/${slug}">Read the post</a></p>`,
        };
        // eslint-disable-next-line no-await-in-loop
        await transporter.sendMail(mailOptions);
      }
    }

    return res.status(200).json({ success: true, blog });
  } catch (err: any) {
    console.error('publishBlog error:', err?.message || err);
    return res.status(500).json({ error: 'Server error', details: err?.message });
  }
}
