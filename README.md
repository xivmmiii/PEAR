# PEAR

PEAR is a Next.js fashion marketplace prototype with MongoDB-backed shopper and seller authentication.

## Local setup

Use Node.js 22 LTS (or the current Node.js LTS) and MongoDB 7+.

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI` to your MongoDB Atlas or local connection string.
3. Set `MONGODB_DB` to the database name you want to use.
4. Generate a long random `AUTH_SECRET`.
5. Install and run:

```bash
npm install
npm run dev
```

Users are stored in the `users` collection with bcrypt password hashes and one of the roles `shopper`, `seller`, or `admin`. Public sign-up allows shopper and seller accounts only; admin accounts must be provisioned separately. Successful authentication creates a seven-day HttpOnly `pear_session` cookie containing a signed role claim.

After signing in, users are sent to `/dashboard`. The dashboard is protected server-side with `requireRole`; unauthenticated users are redirected to sign-in. Use `POST /api/auth/signout` to clear the session.

The app intentionally does not log passwords or return password hashes from API responses.

Optional integrations:

- Online payments require `PAYMENT_PROVIDER_SECRET`.
- Google sign-in requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a matching `GOOGLE_REDIRECT_URI` registered in Google Cloud Console. Without these values, the normal email/password flow remains available.

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
