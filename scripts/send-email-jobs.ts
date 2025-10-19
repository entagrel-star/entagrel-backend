import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';

const prisma = new PrismaClient();

async function main() {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) {
    console.error('SENDGRID_API_KEY not configured');
    process.exit(1);
  }
  sgMail.setApiKey(key);

  // Fetch pending jobs
  const jobs = await prisma.emailJob.findMany({ where: { status: 'pending' }, take: 100 });
  if (jobs.length === 0) {
    console.log('No pending email jobs');
    return;
  }

  for (const job of jobs) {
    try {
      const msg = {
        to: job.to,
        from: process.env.EMAIL_FROM || process.env.SENDGRID_FROM,
        subject: job.subject,
        html: job.body,
      } as any;

      await sgMail.send(msg);

      await prisma.emailJob.update({ where: { id: job.id }, data: { status: 'sent', sentAt: new Date() } });
      console.log('Sent', job.id);
    } catch (err) {
      console.error('Failed', job.id, err);
      const attempts = (job.attempts || 0) + 1;
      const update: any = { attempts };
      if (attempts >= 5) {
        update.status = 'failed';
      }
      await prisma.emailJob.update({ where: { id: job.id }, data: update });
      // simple backoff between sends to avoid throttling
      await new Promise((r) => setTimeout(r, 500 * attempts));
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
