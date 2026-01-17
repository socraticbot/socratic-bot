This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Environment Variables

See [ENV_VARIABLES.md](./ENV_VARIABLES.md) for a complete list of required environment variables.

## Deploy on Vercel

This project is configured for deployment on Vercel.

### Initial Setup

1. Push this repository to GitHub
2. Import the project in [Vercel Dashboard](https://vercel.com/dashboard)
3. Select the `jsprojs/webapp` directory as the root
4. Configure environment variables in Vercel dashboard (see ENV_VARIABLES.md)
5. Deploy

### Preview Deployments

Vercel automatically creates preview deployments for:
- Every push to a branch (except main)
- Every pull request

Preview deployments are available at: `https://<project-name>-<hash>.vercel.app`

#### Configuration

Preview deployments use the same environment variables as production by default. To use different variables for previews:

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Set variables with "Preview" environment selected
3. Preview deployments will use these values

### Production Deployment

Production deployments are automatically created when:
- Pushing to `main` branch
- Manually triggering from Vercel dashboard

Production URL will be configured when custom domain is set up (Phase 1.12+).

### Manual Deployment

You can also deploy manually using Vercel CLI:

```bash
npm install -g vercel
vercel
```

For more details, see [Vercel Documentation](https://vercel.com/docs).
