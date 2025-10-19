import { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function unsubscribe(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });

  const token = req.query.token as string | undefined;
  const emailQ = req.query.email as string | undefined;

  let email: string | undefined;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;
      const payload: any = jwt.verify(token, secret as string);
      email = payload?.email;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid token' });
    }
  } else if (emailQ) {
    email = emailQ;
  } else {
    return res.status(400).json({ error: 'Missing token or email' });
  }

  if (!email) return res.status(400).json({ error: 'Missing email' });
  try {
    await prisma.email.updateMany({ where: { email }, data: { unsubscribed: true } });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'DB error', details: err?.message });
  }
}
