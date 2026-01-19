# Vercel Deployment Guide - Complete Step-by-Step

## Overview

Vercel is the easiest way to deploy Next.js applications. It's free, fast, and requires minimal configuration.

### What is Vercel?
- **Created by**: Makers of Next.js
- **Best for**: Next.js, React, static sites
- **Cost**: Free tier available (generous limits)
- **Setup time**: 5-10 minutes
- **Deployment**: Automatic on every git push (optional)

---

## Phase 1: Prerequisites

### Before You Start, Have Ready:
1. ✅ GitHub account (or GitLab/Bitbucket)
2. ✅ GitHub repository with your project
3. ✅ MongoDB Atlas connection string
4. ✅ Firebase credentials (API keys)
5. ✅ Domain name (optional - Vercel provides free subdomain)

### What Gets Deployed:
- ✅ **Frontend**: Fully deployed to Vercel
- ❌ **Backend**: Needs separate hosting (see options below)
- ✅ **Database**: Uses MongoDB Atlas (same as Hostinger)

---

## Phase 2: Choose Backend Hosting

You have 3 options for your Node.js backend:

### Option A: Vercel Serverless Functions (Recommended)
- **Pros**: Same provider as frontend, auto-scaling, free tier
- **Cons**: Requires refactoring Express to serverless format
- **Time**: 1-2 hours
- **Cost**: Free tier sufficient for small projects

### Option B: Railway (Easiest for Express)
- **Pros**: Deploy Express.js as-is, no refactoring
- **Cons**: Separate platform from frontend
- **Time**: 15 minutes
- **Cost**: $5/month minimum (very cheap)

### Option C: Render (Also Simple)
- **Pros**: Free tier available, simple deployment
- **Cons**: Separate platform
- **Time**: 15 minutes
- **Cost**: Free tier with limitations

**👉 This guide covers Option B (Railway) as it's easiest**

---

## Phase 3: Prepare Your Project for Vercel

### Step 1: Create/Update `.vercelignore`

Create a file named `.vercelignore` in your project root:

```bash
touch .vercelignore
```

Add this content:

```
backend_node
node_modules
.env.local
.env.production.local
.git
.gitignore
README.md
```

### Step 2: Update Frontend Environment Variables

Create `frontend/.env.production` (this is NOT committed to git):

```env
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**For now, use:** `http://localhost:3001` (we'll update after backend is deployed)

### Step 3: Update Backend Environment

In `backend_node/.env`:

```env
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gaming_store
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-email@appspot.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NODE_ENV=production
```

### Step 4: Push to GitHub

```bash
# From project root
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## Phase 4: Deploy Backend to Railway (15 minutes)

### Step 1: Create Railway Account

1. Go to: https://railway.app
2. Click "Sign up with GitHub"
3. Authorize GitHub
4. Create new project

### Step 2: Connect GitHub Repository

1. Click "New Project"
2. Select "GitHub Repo"
3. Search for "Game_Project"
4. Select your repository
5. Click "Deploy"

### Step 3: Configure Backend Service

Railway will detect your Node.js project automatically.

1. Click on the project
2. Go to "Settings"
3. Set startup command:
   ```bash
   cd backend_node && npm install && npm run build && npm run start
   ```

4. Add environment variables:
   - Click "Variables"
   - Add all variables from `backend_node/.env`:
     - PORT=3001
     - MONGODB_URI=...
     - FIREBASE_PROJECT_ID=...
     - FIREBASE_CLIENT_EMAIL=...
     - FIREBASE_PRIVATE_KEY=...
     - NODE_ENV=production

5. Click "Deploy"

### Step 4: Get Backend URL

1. After deployment, click your project
2. Go to "Settings"
3. Find "Domains"
4. Copy the domain (e.g., `https://gaming-store-api-prod.railway.app`)
5. **Save this URL** - you'll need it next

### Verify Backend is Working

```bash
curl https://your-railway-domain/health
```

Should return JSON response with status.

---

## Phase 5: Deploy Frontend to Vercel (5 minutes)

### Step 1: Create Vercel Account

1. Go to: https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access GitHub
5. Complete setup

### Step 2: Import Project

1. After login, click "Add New..." → "Project"
2. Search for "Game_Project"
3. Select your repository
4. Click "Import"

### Step 3: Configure Project Settings

Vercel should auto-detect Next.js. Configure:

**Project Settings:**
- Framework Preset: `Next.js` (should be auto-selected)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Step 4: Add Environment Variables

Before deploying, add environment variables:

1. In Vercel dashboard, go to "Settings"
2. Click "Environment Variables"
3. Add each variable:

```
NEXT_PUBLIC_API_URL = https://your-railway-domain.railway.app
NEXT_PUBLIC_FIREBASE_API_KEY = your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID = your-app-id
```

**Important**: Only add variables that start with `NEXT_PUBLIC_` to Vercel. Others are server-only.

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete (usually 2-3 minutes)
3. You'll see a "Congratulations!" message
4. **Copy your Vercel URL** (e.g., `https://gaming-store.vercel.app`)

### Step 6: Verify Frontend is Working

1. Visit your Vercel URL
2. Homepage should load
3. Check browser console for errors
4. Try navigating between pages

---

## Phase 6: Configure Custom Domain (Optional)

### For Frontend (Vercel)

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow DNS configuration instructions:
   - Point nameservers OR
   - Add A records to your domain registrar
5. Wait 24-48 hours for DNS to propagate
6. Vercel automatically manages SSL

### For Backend (Railway)

1. In Railway dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add custom domain for API
4. Update DNS records at your registrar
5. Enable SSL (Railway handles this)

### Update Frontend Environment Variables

Once domains are set up:

1. Go to Vercel dashboard → Settings → Environment Variables
2. Update: `NEXT_PUBLIC_API_URL` to your actual backend domain
3. Click "Save"
4. Redeploy: Click "Deployments" → latest deploy → "Redeploy"

---

## Phase 7: Setup Continuous Deployment (Auto-Deploy)

### For Frontend

Vercel automatically deploys on git push to main:

1. Make changes locally
2. Commit: `git commit -m "Update"`
3. Push: `git push origin main`
4. Vercel automatically builds and deploys (2-3 minutes)

**Watch deployment:**
1. Go to Vercel dashboard
2. Click "Deployments"
3. See real-time build progress
4. Click deployment for logs

### For Backend

Railway also auto-deploys on push:

1. Same workflow as frontend
2. Go to Railway dashboard
3. See deployment logs in real-time

---

## Phase 8: Verify Everything Works

### Test Backend API

```bash
# Health check
curl https://your-railway-url/health

# Should return: {"status": "ok", ...}
```

### Test Frontend Features

1. Visit https://yourdomain.com
2. Test homepage
3. Test products page
4. Try to register account
5. Try to login
6. Add to cart
7. Check if cart persists

### Check Browser Console

1. Right-click → "Inspect"
2. Go to "Console" tab
3. Should see NO red errors
4. May see warnings (normal)

### Monitor Logs

**Frontend Logs (Vercel):**
1. Vercel dashboard → Deployments → Click latest
2. See build logs and deployment logs

**Backend Logs (Railway):**
1. Railway dashboard → Your project
2. See deployment logs in real-time

---

## Phase 9: Production Checklist

Before going public, verify:

- [ ] Frontend loads without errors
- [ ] Backend API responds (curl test)
- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth works
- [ ] Cart functionality works
- [ ] Products display correctly
- [ ] No console errors
- [ ] No 404 errors in logs
- [ ] SSL certificates working (HTTPS)
- [ ] Environment variables set correctly
- [ ] Database connection working

---

## Common Issues & Solutions

### Frontend won't load (404)

**Cause**: Root directory not set correctly in Vercel

**Fix**:
1. Go to Vercel Settings
2. Check "Root Directory" = `frontend`
3. Redeploy

### API calls failing (CORS error)

**Cause**: API URL in environment variables is wrong

**Fix**:
1. Get correct backend URL from Railway
2. Update `NEXT_PUBLIC_API_URL` in Vercel
3. Redeploy frontend

### API calls timing out

**Cause**: Backend not deployed or crashed

**Fix**:
1. Check Railway dashboard
2. Look at deployment logs
3. Restart the service
4. Check environment variables are set

### Build failing

**Cause**: Missing environment variables or build errors

**Fix**:
1. Check build logs in Vercel
2. Look for specific error messages
3. Run `npm run build` locally to reproduce
4. Fix errors, commit, and push

### Database connection errors

**Cause**: MongoDB Atlas not configured

**Fix**:
1. Check MongoDB Atlas cluster is running
2. Verify connection string is correct
3. Check IP whitelist (should allow 0.0.0.0/0)
4. Update .env in Railway

---

## Maintenance & Updates

### Deploy New Changes

```bash
# Make changes locally
nano file.tsx

# Commit
git add .
git commit -m "Update feature"

# Push
git push origin main

# Watch Vercel/Railway auto-deploy
# Check dashboards for build progress
```

### Check Deployment Status

**Vercel:**
1. Dashboard → Deployments
2. See all deployments (new at top)
3. Green ✅ = successful, Red ❌ = failed

**Railway:**
1. Project page
2. See deployments (new at top)
3. Click for detailed logs

### Rollback Previous Deployment

**Vercel:**
1. Go to Deployments
2. Find a previous successful deployment
3. Click "..."
4. Select "Redeploy"

**Railway:**
1. Go to Deployments
2. Select previous version
3. Click "Redeploy"

### Monitor Performance

**Vercel Analytics:**
1. Settings → Analytics
2. View real-time metrics
3. See response times, errors, etc.

**Railway Metrics:**
1. Project page
2. See CPU, memory, network usage
3. View logs for errors

---

## Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel (Frontend) | Yes | $0 |
| Railway (Backend) | Limited | $5-10/month |
| MongoDB Atlas | Yes | $0 (0.5GB) |
| Custom Domain | N/A | $10-15/year |
| **Total** | | **$5-10/month** |

---

## Deployment Timeline

| Step | Time |
|------|------|
| Prepare project | 5 min |
| Create Railway account | 2 min |
| Deploy backend | 10 min |
| Create Vercel account | 2 min |
| Deploy frontend | 5 min |
| Configure environment | 5 min |
| Test everything | 10 min |
| **Total** | **~40 minutes** |

---

## Production Deployment is LIVE! 🎉

Your gaming store is now live and automatically updates every time you push code to GitHub.

**URLs:**
- Frontend: `https://yourdomain.vercel.app` (or custom domain)
- Backend API: `https://yourdomain-api.railway.app`
- Database: MongoDB Atlas (secured)

**What happens next:**
1. Every git push → automatic deployment
2. Vercel builds in 2-3 minutes
3. Railway deploys in 1-2 minutes
4. Your site is live with zero downtime

---

## Support & Help

### Vercel Documentation
https://vercel.com/docs

### Railway Documentation
https://docs.railway.app

### MongoDB Atlas Help
https://docs.mongodb.com/

### Get Help
- Check deployment logs first
- Search error messages online
- Check GitHub Discussions
- Try local reproduction first

---

**Your gaming store is now production-ready! 🚀**
