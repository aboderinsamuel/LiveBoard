# Deployment Guide for Collaborative Whiteboard

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub

## Deployment Steps

### 1. Deploy the Next.js App to Vercel

1. Connect your GitHub repository to Vercel
2. Set the following environment variables in Vercel:
   - `NEXT_PUBLIC_WS_URL`: Your WebSocket server URL (see step 2)
   - `NEXT_PUBLIC_APP_URL`: Your Vercel app URL

### 2. Deploy the WebSocket Server

The WebSocket server (`server.js`) needs to be deployed separately. Here are your options:

#### Option A: Deploy to Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the `server.js` file
4. Set the environment variable `PORT` to the port Railway provides
5. Copy the Railway URL and set it as `NEXT_PUBLIC_WS_URL` in Vercel

#### Option B: Deploy to Heroku
1. Create a `Procfile` in your project root:
   ```
   web: node server.js
   ```
2. Deploy to Heroku
3. Set the Heroku URL as `NEXT_PUBLIC_WS_URL` in Vercel

#### Option C: Deploy to DigitalOcean App Platform
1. Create a new app in DigitalOcean
2. Connect your repository
3. Set the build command to: `npm install`
4. Set the run command to: `node server.js`
5. Set the DigitalOcean URL as `NEXT_PUBLIC_WS_URL` in Vercel

### 3. Environment Variables

Set these in your Vercel dashboard:

```
NEXT_PUBLIC_WS_URL=wss://your-websocket-server.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4. Testing the Deployment

1. Visit your Vercel app URL
2. Create a new whiteboard
3. Copy the invite link
4. Open the invite link in a new browser/incognito window
5. Test real-time collaboration

## Development Setup

To run locally:

```bash
# Install dependencies
npm install

# Start both the Next.js app and WebSocket server
npm run dev:full

# Or start them separately:
# Terminal 1: npm run dev (Next.js on port 3000)
# Terminal 2: npm run server (WebSocket on port 3002)
```

## Features

- ✅ Real-time collaborative drawing
- ✅ Live cursor tracking
- ✅ Invite link sharing
- ✅ Multiple drawing tools
- ✅ Responsive design
- ✅ Conflict resolution
- ✅ State synchronization

## Troubleshooting

### WebSocket Connection Issues
- Ensure the WebSocket server is running and accessible
- Check that `NEXT_PUBLIC_WS_URL` is set correctly
- Verify CORS settings in the WebSocket server

### State Not Syncing
- Check browser console for errors
- Ensure both users are connected to the same whiteboard ID
- Verify WebSocket connection status in the UI

### Invite Links Not Working
- Ensure the app URL is set correctly in environment variables
- Check that the whiteboard ID is being passed correctly in the URL
