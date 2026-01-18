# Vercel Deployment Checklist ✅

## Pre-Deployment Verification

### ✅ Build Status
- [x] TypeScript compiles without errors
- [x] Next.js build completes successfully
- [x] All routes generate correctly
- [x] No linting errors

### ✅ Configuration Files
- [x] `vercel.json` - Configured with Next.js framework
- [x] `next.config.ts` - Valid configuration
- [x] `package.json` - All dependencies listed
- [x] `.gitignore` - Excludes node_modules, .env files

### ✅ Environment Variables (Set in Vercel Dashboard)
**Required:**
- [ ] `AI_GATEWAY_API_KEY` - Vercel AI Gateway API key (starts with `vck_`)

**Optional:**
- [ ] `MISTRAL_MODEL` - Model identifier (defaults to `mistral/mistral-large-latest`)
- [ ] `NODE_ENV` - Set to `production` for production

### ✅ Static Assets
All images in `public/` directory:
- [x] `socraticlogo.png` - Main logo
- [x] `socraticoffice.png` - About page image
- [x] `biases.png` - Cognitive biases composite
- [x] `sochat1.png` through `sochat6.png` - Model avatars

### ✅ Pages & Routes
- [x] `/` - Redirects to `/landing`
- [x] `/landing` - Landing page with logo and Begin button
- [x] `/chat` - Main chat interface with model selector
- [x] `/about` - About page with FAQs and office image
- [x] `/learn` - Cognitive biases slider
- [x] `/aidata` - Usage tracking page

### ✅ API Routes
- [x] `/api/chat/stream-thoughts` - Main chat streaming endpoint
- [x] `/api/chat/stream` - Alternative streaming endpoint
- [x] `/api/chat/test` - Test endpoint
- [x] `/api/aidata/credits` - Credit balance
- [x] `/api/aidata/generation` - Generation lookup

### ✅ Components
- [x] `Navbar` - Navigation with logo and links
- [x] `ModelSelector` - Character selection style model picker
- [x] All components properly imported

### ✅ Features
- [x] Model selection with sochat avatars
- [x] Socratic logo in navbar
- [x] Selected model avatar next to tutor responses
- [x] Internal reasoning display with auto-collapse
- [x] Streaming responses
- [x] Usage tracking
- [x] Markdown rendering (bold text)

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import from GitHub
   - Select repository

3. **Configure Project Settings**
   - **Root Directory**: `jsprojs/webapp` ⚠️ IMPORTANT
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add `AI_GATEWAY_API_KEY` (REQUIRED)
   - Optionally add `MISTRAL_MODEL` and `NODE_ENV`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Test the deployment URL

6. **Configure Domain** (After deployment)
   - Go to Project Settings → Domains
   - Add `socratic.bot`
   - Update DNS records as instructed
   - SSL certificate auto-provisioned

## Post-Deployment Testing

- [ ] Landing page loads correctly
- [ ] Navbar appears on all pages (except landing)
- [ ] Model selector displays all 6 models with sochat avatars
- [ ] Chat interface works and streams responses
- [ ] Selected model avatar appears next to tutor messages
- [ ] About page shows office image and all FAQs
- [ ] Learn page displays cognitive biases slider
- [ ] API routes respond correctly
- [ ] Images load properly
- [ ] Usage tracking page works

## Troubleshooting

### Build Fails
- Check environment variables are set
- Verify `AI_GATEWAY_API_KEY` is valid
- Check Vercel build logs for errors
- Ensure root directory is set to `jsprojs/webapp`

### Runtime Errors
- Check function logs in Vercel dashboard
- Verify API routes are working
- Test with `/api/chat/test` endpoint
- Check environment variables are accessible

### Images Not Loading
- Verify all images are in `public/` directory
- Check image paths use `/` prefix
- Ensure images are committed to git

### API Errors
- Verify `AI_GATEWAY_API_KEY` is set correctly
- Check API key is valid and has credits
- Review Vercel function logs

## Notes

- Vercel automatically optimizes Next.js builds
- API routes run as serverless functions
- Static assets served from CDN
- Environment variables encrypted at rest
- Preview deployments created for each PR
- Build warnings about workspace root are harmless
