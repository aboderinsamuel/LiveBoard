# Complete Deployment Guide for Collaborative Whiteboard

## Overview
You need to deploy two parts:
1. **Next.js App** → Vercel (frontend)
2. **WebSocket Server** → Railway/Heroku/DigitalOcean (backend)

---

## Step 1: Deploy Next.js App to Vercel

### 1.1 Prepare Your Code
First, make sure your code is on GitHub:

```bash
# If you haven't already, initialize git and push to GitHub
git init
git add .
git commit -m "Initial commit with collaborative whiteboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 1.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js project
5. Click "Deploy" (don't set environment variables yet)

**Your app will be deployed to something like: `https://your-app-name.vercel.app`**

---

## Step 2: Deploy WebSocket Server

Choose one of these options:

### Option A: Railway (Recommended - Easiest)

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the `server.js` file
5. Click "Deploy"

**Your WebSocket server will be at: `https://your-app-name.railway.app`**

### Option B: Heroku

1. Go to [heroku.com](https://heroku.com) and sign up
2. Create a new app
3. Connect your GitHub repository
4. Create a `Procfile` in your project root:
   ```
   web: node server.js
   ```
5. Deploy the app

**Your WebSocket server will be at: `https://your-app-name.herokuapp.com`**

### Option C: DigitalOcean App Platform

1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Create a new App
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set run command: `node server.js`
6. Deploy

**Your WebSocket server will be at: `https://your-app-name.ondigitalocean.app`**

---

## Step 3: Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Settings" → "Environment Variables"
4. Add these variables:

```
NEXT_PUBLIC_WS_URL = wss://your-websocket-server.railway.app
NEXT_PUBLIC_APP_URL = https://your-app-name.vercel.app
```

**Important Notes:**
- Use `wss://` (not `https://`) for WebSocket URLs
- Replace the URLs with your actual deployed URLs
- Make sure to set these for "Production" environment

---

## Step 4: Redeploy Vercel

After setting environment variables:
1. Go to your Vercel project dashboard
2. Click "Deployments" tab
3. Click the three dots on the latest deployment
4. Click "Redeploy"

---

## Step 5: Test Your Deployment

1. Visit your Vercel app URL
2. Create a new whiteboard
3. Click the share button to get an invite link
4. Open the invite link in another browser/incognito window
5. Test real-time collaboration!

---

## Troubleshooting

### WebSocket Connection Issues
- Make sure your WebSocket server is running
- Check that the URL uses `wss://` (secure WebSocket)
- Verify the environment variables are set correctly

### CORS Issues
If you get CORS errors, update your `server.js`:

```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
```

### Environment Variables Not Working
- Make sure to redeploy Vercel after setting environment variables
- Check that variable names start with `NEXT_PUBLIC_`
- Verify the values are correct (no extra spaces)

---

## Cost Estimates

- **Vercel**: Free tier includes 100GB bandwidth/month
- **Railway**: Free tier includes $5 credit/month
- **Heroku**: Free tier discontinued, paid plans start at $7/month
- **DigitalOcean**: App Platform starts at $5/month

**Recommended**: Vercel + Railway (both have generous free tiers)

---

## Quick Commands Reference

```bash
# Local development
npm run dev:full

# Deploy to Vercel (after connecting GitHub)
# Just push to GitHub, Vercel auto-deploys

# Deploy WebSocket server to Railway
# Connect GitHub repo in Railway dashboard
```

---

## Final Checklist

- [ ] Code pushed to GitHub
- [ ] Next.js app deployed to Vercel
- [ ] WebSocket server deployed to Railway/Heroku/DigitalOcean
- [ ] Environment variables set in Vercel
- [ ] Vercel app redeployed
- [ ] Tested collaboration with invite links
- [ ] Real-time drawing works between users

Once you complete these steps, your collaborative whiteboard will be live and accessible to anyone with the invite link!
