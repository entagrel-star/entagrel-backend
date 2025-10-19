import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import adminLogin from '../api/adminLogin';
import publishBlog from '../api/publishBlog';

const prisma = new PrismaClient();

async function main() {
  const email = 'e2e-admin@example.com';
  const password = 'E2Epass!234';

  // Ensure JWT secret exists for this test
  if (!process.env.JWT_SECRET) {
    console.log('Setting temporary JWT_SECRET for test');
    process.env.JWT_SECRET = 'e2e_temp_secret_12345';
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.upsert({ where: { email }, update: { password: hashed }, create: { email, password: hashed } } as any);
  console.log('Admin upserted:', admin.id);

  // Ensure there's at least one subscriber to receive notifications
  const subEmail = 'subscriber@example.com';
  await (prisma as any).email.upsert({ where: { email: subEmail }, update: {}, create: { email: subEmail } });
  console.log('Subscriber ensured:', subEmail);

  // Login via handler
  const reqLogin: any = { method: 'POST', body: { email, password }, headers: {} };
  const resLogin: any = {};
  resLogin.status = (code: number) => { resLogin._status = code; return resLogin; };
  resLogin.json = (payload: any) => { resLogin._json = payload; return resLogin; };
  await (adminLogin as any)(reqLogin, resLogin);
  if (!resLogin._json || !resLogin._json.token) throw new Error('Login failed: ' + JSON.stringify(resLogin._json));
  const token = resLogin._json.token;
  console.log('Got token (first 40 chars):', String(token).slice(0,40));

  // Publish via handler (attach Authorization header)
  const content = '# E2E Test Post\nThis is a test';
  const reqPub: any = { method: 'POST', body: { title: 'E2E Post', slug: 'e2e-post', category: 'test', content, notify: true }, headers: { authorization: `Bearer ${token}` } };
  const resPub: any = {};
  resPub.status = (code: number) => { resPub._status = code; return resPub; };
  resPub.json = (payload: any) => { resPub._json = payload; return resPub; };
  await (publishBlog as any)(reqPub, resPub);
  console.log('Publish status:', resPub._status, resPub._json?.success);

  // Check EmailJob count
  const jobs = await (prisma as any).emailJob.findMany({ where: { status: 'pending' } });
  console.log('Pending email jobs count (sample):', jobs.length);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
