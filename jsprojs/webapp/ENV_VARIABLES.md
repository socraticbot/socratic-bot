# Environment Variables

This document lists all environment variables required for the Socratic Bot webapp.

## Required Environment Variables

### Vercel AI Gateway
```bash
VERCEL_AI_GATEWAY_API_KEY=your_vercel_ai_gateway_api_key
```
API key for Vercel AI Gateway. Get this from your Vercel dashboard.

### Mistral Model
```bash
MISTRAL_MODEL=mistral/mistral-large-latest
```
Mistral model identifier to use via Vercel AI Gateway. Defaults to `mistral/mistral-large-latest`.

### Swarm
```bash
SWARM_GATEWAY_URL=https://gateway.ethswarm.org
```
Swarm gateway URL. Defaults to public gateway if not set.

### Wallet Authentication
```bash
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```
WalletConnect project ID for wallet connections. Get this from [WalletConnect Cloud](https://cloud.walletconnect.com/).

### Encryption
```bash
ENCRYPTION_SECRET=your_encryption_secret
```
Secret key for encrypting user data before storing in Swarm. Should be a strong random string.

### Environment
```bash
NODE_ENV=development
```
Node environment. Set to `production` for production builds.

### Next.js
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
Public URL of the application. Used for redirects and API calls.

## Setup Instructions

1. Copy this file to `.env.local` in the webapp directory
2. Fill in all required values
3. For production, set these in Vercel dashboard under Project Settings → Environment Variables

## Security Notes

- Never commit `.env.local` or `.env` files
- Use Vercel's environment variables for production secrets
- Rotate secrets regularly
- Use different secrets for development and production
