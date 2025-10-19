# Deployment and Environment Variables

This project can be deployed to Vercel (recommended) or any Node-capable host.

Required environment variables

- DATABASE_URL - your MongoDB connection string (used by Prisma)
- VITE_API_URL - the public URL of your deployed API (used by frontend)
- VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY - if using Supabase integrations
- ADMIN_PASSWORD - secret that protects the Admin publish endpoint and admin page

Email delivery (choose one):
- SENDGRID_API_KEY - if using SendGrid (recommended)
- EMAIL_FROM - default `from` address for emails

Optional SMTP fallback (if you don't use SendGrid):
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS

Other useful envs
- SITE_URL - the public site URL (used in newsletter links)

How publishing works

- Admin posts to `/api/publishBlog` with header `x-admin-secret` that equals `ADMIN_PASSWORD`.
- The endpoint upserts the blog entry into the `Blog` model and, if `notify` is true, either sends via SendGrid or SMTP.
- For production-scale email delivery, run the email worker `scripts/send-email-jobs.ts` (see below) and push jobs to the `EmailJob` table instead of sending synchronously.

Running the worker

Locally (with ts-node):

```powershell
# install ts-node if needed
npm run build
npx ts-node scripts/send-email-jobs.ts
```

Or build and run the compiled script:

```powershell
npm run build
node dist/scripts/send-email-jobs.js
```

Prisma

After changing `prisma/schema.prisma` run:

```powershell
npx prisma generate
npx prisma db push # or prisma migrate for SQL databases
```

Security notes

- Protect Admin page with `ADMIN_PASSWORD` and do not expose the password publicly.
- Prefer delegated auth (OAuth/JWT) for multiple authors.
- Avoid placing large interactive code blobs directly in database content as HTML. Use MDX compiled at publish time and serve static assets separately.

Next steps

- Replace inline email sending with job creation (`EmailJob`) and have `publishBlog` enqueue jobs, then the worker processes them.
- Implement server-side MDX compilation (xdm) at publish time and store compiled output for safe client render.
- Add authentication and role management for Admins.
