import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import adminLogin from '../api/adminLogin';
import publishBlog from '../api/publishBlog';

/**
 * Integration script: upsert admin -> login -> publish -> verify jobs
 * Usage: npx ts-node scripts/integration-admin-publish.ts
 * Requires DATABASE_URL in .env. Optional: JWT_SECRET set for token signing.
 */

const prisma = new PrismaClient();

async function main() {
  console.log('Starting integration test...');
  const email = process.env.TEST_ADMIN_EMAIL || 'integration-admin@example.com';
  const password = process.env.TEST_ADMIN_PASSWORD || 'TestPass!234';
  const subEmail = process.env.TEST_SUB_EMAIL || 'integration-subscriber@example.com';
  const cleanup = process.argv.includes('--cleanup');

  // Ensure JWT_SECRET exists for realistic flow
  if (!process.env.JWT_SECRET) {
    console.log('NOTE: JWT_SECRET not set — the script will set a temporary one for this run.');
    process.env.JWT_SECRET = 'integration_temp_secret_12345';
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.upsert({
    where: { email },
    update: { password: hashed },
    create: { email, password: hashed },
  } as any);
  console.log('Admin upserted:', { id: admin.id, email: admin.email });

  // Ensure at least one subscriber
  await (prisma as any).email.upsert({ where: { email: subEmail }, update: {}, create: { email: subEmail } });
  console.log('Subscriber ensured:', subEmail);

  // Login via handler
  const reqLogin: any = { method: 'POST', body: { email, password }, headers: {} };
  const resLogin: any = {};
  resLogin.status = (code: number) => { resLogin._status = code; return resLogin; };
  resLogin.json = (payload: any) => { resLogin._json = payload; return resLogin; };
  await (adminLogin as any)(reqLogin, resLogin);
  if (!resLogin._json || !resLogin._json.token) {
    console.error('Login failed:', resLogin._json);
    process.exit(1);
  }
  const token = resLogin._json.token as string;
  console.log('Login succeeded, token length:', token.length);

  // Publish via handler
  const slug = `integration-post-${Date.now()}`;
  const reqPub: any = {
    method: 'POST',
    body: {
      title: 'Integration Test Post',
      slug,
      category: 'Integration',
      description: 'This post was created by an integration test script.',
      content: '# Integration\nThis is a test post.',
      notify: true,
    },
    headers: { authorization: `Bearer ${token}` },
  };
  const resPub: any = {};
  resPub.status = (code: number) => { resPub._status = code; return resPub; };
  resPub.json = (payload: any) => { resPub._json = payload; return resPub; };
  await (publishBlog as any)(reqPub, resPub);
  console.log('Publish response status:', resPub._status);
  if (!resPub._json || !resPub._json.success) {
    console.error('Publish failed', resPub._json);
    process.exit(1);
  }

  // Verify EmailJob created
  const jobs = await (prisma as any).emailJob.findMany({ where: { status: 'pending' } });
  console.log('Pending email jobs count:', jobs.length);
  if (jobs.length === 0) {
    console.error('No email jobs enqueued — something went wrong');
    process.exit(1);
  }

  console.log('Integration test completed successfully.');

  if (cleanup) {
    console.log('Cleanup requested — deleting test data');
    try {
      await prisma.blog.deleteMany({ where: { slug } as any });
      // remove email jobs that reference the slug in the body
      await (prisma as any).emailJob.deleteMany({ where: { body: { contains: slug } } });
      await (prisma as any).email.deleteMany({ where: { email: subEmail } });
      await prisma.admin.deleteMany({ where: { email } as any });
      console.log('Cleanup finished');
    } catch (e) {
      console.warn('Cleanup error', e);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
