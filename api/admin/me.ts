import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function me(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });

  const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
  const JWT_SECRET = process.env.JWT_SECRET;
  let adminId: string | undefined;

  if (JWT_SECRET && authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      if (payload && payload.role === 'admin' && payload.id) {
        adminId = payload.id;
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    // fallback to header secret
    const adminSecret = req.headers['x-admin-secret'] as string | undefined;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) return res.status(500).json({ error: 'Server not configured' });
    if (!adminSecret || adminSecret !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
    // no admin id available in this mode
  }

  try {
    let admin = null;
    if (adminId) {
      admin = await prisma.admin.findUnique({ where: { id: adminId } });
    }
    const recent = adminId ? await prisma.blog.findMany({ where: { authorId: adminId }, orderBy: { createdAt: 'desc' }, take: 5 }) : [];
    return res.status(200).json({ admin: admin ? { id: admin.id, email: admin.email, name: admin.name } : null, recent });
  } catch (err: any) {
    console.error('admin/me error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
