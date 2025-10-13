// api/saveUser.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

// Create a global prisma client for re-use across requests in dev and prod
const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['error', 'warn'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function saveEmail(req: VercelRequest, res: VercelResponse) {
  console.log("----EMAIL SAVE API HIT----");

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const email_updated = await prisma.email.create({ data: { email } });
    return res.status(200).json({ success: true, email_updated });
  } catch (err) {
    console.error('Prisma error:', err.message || err);
    return res.status(500).json({ error: 'Database error', details: err.message });
  }
}

