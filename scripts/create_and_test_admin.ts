import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import adminLogin from '../api/adminLogin';

const prisma = new PrismaClient();

async function main() {
  const email = 'dev-admin@example.com';
  const password = 'TestPass123!';

  const hashed = await bcrypt.hash(password, 10);

  console.log('Upserting admin...');
  const admin = await prisma.admin.upsert({
    where: { email },
    update: { password: hashed },
    create: { email, password: hashed },
  } as any);

  console.log('Admin upserted:', { id: admin.id, email: admin.email });

  // Call adminLogin handler directly
  const req: any = { method: 'POST', body: { email, password }, headers: {} };
  const res: any = {};
  res.status = (code: number) => { res._status = code; return res; };
  res.json = (payload: any) => { res._json = payload; return res; };

  await (adminLogin as any)(req, res);

  console.log('Login response status:', res._status);
  console.log('Login response json keys:', Object.keys(res._json || {}));
  if (res._json && res._json.token) {
    console.log('JWT received: (first 40 chars) ', String(res._json.token).slice(0,40) + '...');
  } else {
    console.log('Login failed:', res._json);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
