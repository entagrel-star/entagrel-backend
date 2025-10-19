import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function adminLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const JWT_SECRET = (process.env.JWT_SECRET || process.env.ADMIN_PASSWORD) as string;
    const token = jwt.sign({ role: 'admin', id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '12h' });
    return res.status(200).json({ token });
  } catch (err: any) {
    console.error('adminLogin error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
