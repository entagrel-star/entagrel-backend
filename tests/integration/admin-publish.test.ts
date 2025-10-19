/// <reference types="jest" />
import { PrismaClient } from '@prisma/client';
import { describe, it, beforeAll, afterAll, expect, jest } from '@jest/globals';
import * as bcrypt from 'bcryptjs';
import adminLogin from '../../api/adminLogin';
import publishBlog from '../../api/publishBlog';

/**
 * Lightweight integration test that uses handlers directly.
 * This test requires a test DB (set DATABASE_URL to a test database) and
 * will create/delete data as part of the run.
 */

const prisma = new PrismaClient();

jest.setTimeout(30000);

describe('integration: admin publish', () => {
  const testEmail = process.env.TEST_ADMIN_EMAIL || 'jest-admin@example.com';
  const testPass = process.env.TEST_ADMIN_PASSWORD || 'JestPass!234';
  let adminId: string | undefined;
  const slug = 'jest-integration-' + Date.now();

  beforeAll(async () => {
    const hashed = await bcrypt.hash(testPass, 10);
    const admin = await prisma.admin.upsert({ where: { email: testEmail }, update: { password: hashed }, create: { email: testEmail, password: hashed } } as any);
    adminId = admin.id;
  });

  afterAll(async () => {
    // cleanup created records
    await prisma.blog.deleteMany({ where: { slug } as any });
    await (prisma as any).emailJob.deleteMany({ where: { body: { contains: slug } } });
    await prisma.admin.deleteMany({ where: { email: testEmail } as any });
    await prisma.$disconnect();
  });

  it('logs in and publishes a post with jobs', async () => {
    // login via handler
    const reqLogin: any = { method: 'POST', body: { email: testEmail, password: testPass }, headers: {} };
    const resLogin: any = {};
    resLogin.status = (code: number) => { resLogin._status = code; return resLogin; };
    resLogin.json = (payload: any) => { resLogin._json = payload; return resLogin; };
    await (adminLogin as any)(reqLogin, resLogin);
    expect(resLogin._json?.token).toBeTruthy();
    const token = resLogin._json.token;

    // publish
    const reqPub: any = { method: 'POST', body: { title: 'Jest Post', slug, category: 'Test', content: '# Hi', notify: true }, headers: { authorization: `Bearer ${token}` } };
    const resPub: any = {};
    resPub.status = (code: number) => { resPub._status = code; return resPub; };
    resPub.json = (payload: any) => { resPub._json = payload; return resPub; };
    await (publishBlog as any)(reqPub, resPub);
    expect(resPub._status).toBe(200);

    const jobs = await (prisma as any).emailJob.findMany({ where: { status: 'pending' } });
    expect(jobs.length).toBeGreaterThan(0);
  });
});
