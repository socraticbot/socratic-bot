# Vercel Deployment Checklist

## Pre-Deployment Checklist

### ✅ Environment Variables
Ensure these are set in Vercel Dashboard → Project Settings → Environment Variables:

**Required:**
- `AI_GATEWAY_API_KEY` - Vercel AI Gateway API key (starts with `vck_`)

**Optional:**
- `MISTRAL_MODEL` - Model to use (defaults to `mistral/mistral-large-latest`)
- `NODE_ENV` - Set to `production` for production
- `NEXT_PUBLIC_APP_URL` - Public URL (auto-set by Vercel)

### ✅ Build Configuration
- `vercel.json` is configured with Next.js framework
- Build command: `npm run build`
- Output directory: `.next` (default)
- Install command: `npm install`

### ✅ Project Structure
- Root directory: `jsprojs/webapp` (if deploying from monorepo root)
- OR deploy `jsprojs/webapp` as a separate Vercel project

### ✅ Dependencies
All required packages are in `package.json`:
- `next`, `react`, `react-dom`
- `ai`, `@ai-sdk/openai`, `@ai-sdk/mistral`
- `tailwindcss`

### ✅ Static Assets
All images are in `public/`:
- `socraticlogo.png`
- `socraticoffice.png`
- `biases.png`
- `sochat1.png` through `sochat6.png`

### ✅ API Routes
All API routes are in `app/api/`:
- `/api/chat/stream-thoughts` - Main chat endpoint
- `/api/aidata/credits` - Usage tracking
- `/api/aidata/generation` - Generation lookup

## Deployment Steps

### Option 1: Deploy from Monorepo Root
1. In Vercel Dashboard, set **Root Directory** to `jsprojs/webapp`
2. Vercel will automatically detect Next.js
3. Set environment variables
4. Deploy

### Option 2: Deploy as Standalone Project
1. Create new Vercel project
2. Connect to repository
3. Set root directory to `jsprojs/webapp`
4. Set environment variables
5. Deploy

## Post-Deployment

### Domain Configuration
1. Add custom domain in Vercel Dashboard
2. Update DNS records as instructed
3. SSL certificate will be auto-provisioned

### Environment Variables
- Verify all environment variables are set
- Test API endpoints work correctly
- Check `/aidata` page for usage tracking

### Testing
- [ ] Landing page loads correctly
- [ ] Model selector displays all models
- [ ] Chat interface works
- [ ] API routes respond correctly
- [ ] Images load properly
- [ ] Navbar appears on all pages except landing

## Troubleshooting

### Build Errors
- Check Node.js version (Vercel uses Node 20.x by default)
- Verify all dependencies are in `package.json`
- Check for TypeScript errors: `npm run lint`

### Runtime Errors
- Check environment variables are set correctly
- Verify `AI_GATEWAY_API_KEY` is valid
- Check Vercel function logs for API errors

### Image Loading Issues
- Verify all images are in `public/` directory
- Check image paths use `/` prefix (e.g., `/socraticlogo.png`)
- Ensure images are committed to git

## Notes

- Vercel automatically handles Next.js optimizations
- API routes run as serverless functions
- Static assets are served from CDN
- Environment variables are encrypted at rest
