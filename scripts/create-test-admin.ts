import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.TEST_ADMIN_EMAIL || 'local-admin@example.com';
  const password = process.env.TEST_ADMIN_PASSWORD || 'LocalAdmin!234';

  try {
    const hashed = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.upsert({
      where: { email },
      update: { password: hashed },
      create: { email, password: hashed, name: 'Local Admin' } as any,
    } as any);

    console.log('Test admin created/upserted:');
    console.log('  email:', email);
    console.log('  password:', password);
    console.log('  id:', admin.id);
  } catch (err: any) {
    console.error('Failed to create admin:', err?.message || err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
