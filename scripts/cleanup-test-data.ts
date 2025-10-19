import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/**
 * Cleanup test data created by integration scripts.
 * Defaults must match the emails and slugs used by the integration script.
 */
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.TEST_ADMIN_EMAIL || 'integration-admin@example.com';
  const localAdminEmail = process.env.TEST_ADMIN_EMAIL || 'local-admin@example.com';
  const subEmail = process.env.TEST_SUB_EMAIL || 'integration-subscriber@example.com';

  try {
    console.log('Deleting blogs with slugs starting with integration-post- or jest-integration-');
    const delBlogs = await prisma.blog.deleteMany({ where: { OR: [{ slug: { startsWith: 'integration-post-' } }, { slug: { startsWith: 'jest-integration-' } }] } as any });
    console.log('Deleted blogs:', delBlogs.count ?? delBlogs);

    console.log('Deleting email jobs that reference integration slugs');
    const delJobs = await (prisma as any).emailJob.deleteMany({ where: { OR: [{ body: { contains: 'integration-post-' } }, { body: { contains: 'jest-integration-' } }] } });
    console.log('Deleted email jobs:', delJobs.count ?? delJobs);

    console.log('Deleting test subscribers and admins');
    const delEmails = await prisma.email.deleteMany({ where: { email: { in: [subEmail] } } as any });
    console.log('Deleted emails:', delEmails.count ?? delEmails);
    const delAdmins = await prisma.admin.deleteMany({ where: { email: { in: [adminEmail, localAdminEmail, 'integration-admin@example.com', 'local-admin@example.com'] } } as any });
    console.log('Deleted admins:', delAdmins.count ?? delAdmins);

    console.log('Cleanup completed');
  } catch (e: any) {
    console.error('Cleanup error', e?.message || e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
