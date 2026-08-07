This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

Copy `.env.example` to `.env` and fill in the values for your environment.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes (production) | PostgreSQL connection string |
| `AUTH_SECRET` | Yes (production) | Secret for admin session tokens |
| `ADMIN_EMAIL` | For seed/admin | Admin login email |
| `ADMIN_PASSWORD` | For seed/admin | Admin login password |
| `RESEND_API_KEY` | For email | Resend API key |
| `EMAIL_FROM` | For email | Verified sender, e.g. `Niks Ravins <hello@niksravins.com>` |
| `ADMIN_NOTIFICATION_EMAIL` | Optional | Admin booking alerts (defaults to `hello@niksravins.com`) |

## Booking confirmation emails

After a booking is saved, the app sends:

1. A confirmation email to the client (session details + next steps)
2. A notification email to the admin address

Email delivery uses [Resend](https://resend.com). Bookings are still saved if email delivery fails; failures are logged server-side without exposing secrets to the client.

### Testing emails locally

1. Create a free Resend account and generate an API key.
2. Add to `.env`:
   ```bash
   RESEND_API_KEY=re_xxxxxxxx
   EMAIL_FROM="onboarding@resend.dev"
   ADMIN_NOTIFICATION_EMAIL=your-verified-email@example.com
   ```
3. On Resend's free tier, you can send from `onboarding@resend.dev` only to the email address verified on your Resend account.
4. Run `npm run dev`, complete a booking, and check the Resend dashboard plus your inbox.
5. For production, verify your domain in Resend and set `EMAIL_FROM` to an address on that domain (e.g. `hello@niksravins.com`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
