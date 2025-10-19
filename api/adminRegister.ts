import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function adminRegister(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });
  const { email, password, name } = req.body;
  const setupSecret = req.headers['x-admin-secret'] as string | undefined;
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'Server not configured' });
  if (setupSecret !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({ data: { email, password: hashed, name } });
    return res.status(201).json({ success: true, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err: any) {
    console.error('adminRegister error', err);
    return res.status(500).json({ error: 'DB error', details: err?.message });
  }
}
