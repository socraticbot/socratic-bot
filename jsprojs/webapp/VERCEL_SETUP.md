# Vercel Deployment Settings Guide

## ✅ Environment Variables

**Only ONE environment variable is required:**

- ✅ `AI_GATEWAY_API_KEY` - **REQUIRED** (you've already set this!)

**Optional (not currently used):**
- `MISTRAL_MODEL` - Not needed (models are hardcoded in `lib/models.ts`)
- `NODE_ENV` - Auto-set by Vercel to `production`
- Other variables (SWARM, WalletConnect, etc.) - For future features, not needed now

## ⚠️ Critical Vercel Settings

### 1. Root Directory
**MUST BE SET TO:** `jsprojs/webapp`

This is the most important setting! The Next.js app is not in the repository root.

**How to set:**
- In the "Root Directory" field, change `./` to `jsprojs/webapp`
- Click "Edit" next to the Root Directory field
- Enter: `jsprojs/webapp`

### 2. Framework Preset
**SHOULD BE:** `Next.js` (not "Other")

**How to set:**
- Click the "Framework Preset" dropdown
- Select "Next.js"
- Vercel will auto-detect and configure:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### 3. Build and Output Settings (Optional to verify)
These should auto-detect, but you can expand "Build and Output Settings" to verify:
- **Build Command:** `npm run build` ✅
- **Output Directory:** `.next` ✅
- **Install Command:** `npm install` ✅
- **Node Version:** `20.x` (auto-selected) ✅

### 4. Environment Variables (Already done ✅)
- `AI_GATEWAY_API_KEY` - Set for Production, Preview, and Development environments

## Summary

**What you've done correctly:**
- ✅ Set `AI_GATEWAY_API_KEY` environment variable

**What you need to adjust:**
1. ⚠️ **Root Directory:** Change from `./` to `jsprojs/webapp`
2. ⚠️ **Framework Preset:** Change from "Other" to "Next.js"

**What's optional:**
- Build settings (auto-detected, but you can verify)
- Other environment variables (not needed for current features)

## After Deployment

Once deployed, test:
1. Landing page loads: `https://your-project.vercel.app/landing`
2. Chat works: `https://your-project.vercel.app/chat`
3. API responds: Check function logs in Vercel dashboard

If you see build errors, the most common issue is the root directory not being set correctly!
