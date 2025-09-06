#!/usr/bin/env node

/**
 * Deployment Setup Helper
 * This script helps you prepare your project for deployment
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 Collaborative Whiteboard Deployment Setup\n");

// Check if package.json exists
if (!fs.existsSync("package.json")) {
  console.error(
    "❌ package.json not found. Make sure you're in the project root."
  );
  process.exit(1);
}

// Check if server.js exists
if (!fs.existsSync("server.js")) {
  console.error(
    "❌ server.js not found. Make sure the WebSocket server file exists."
  );
  process.exit(1);
}

console.log("✅ Project structure looks good!\n");

// Create .env.example for reference
const envExample = `# Environment Variables for Production
# Copy these to your Vercel dashboard

# WebSocket Server URL (from Railway/Heroku/DigitalOcean)
NEXT_PUBLIC_WS_URL=wss://your-websocket-server.railway.app

# Your Vercel App URL
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app

# WebSocket Server Port (for Railway/Heroku deployment)
PORT=3002
`;

fs.writeFileSync(".env.example", envExample);
console.log("📝 Created .env.example file with environment variables template");

// Create Procfile for Heroku
const procfile = `web: node server.js
`;
fs.writeFileSync("Procfile", procfile);
console.log("📝 Created Procfile for Heroku deployment");

// Create railway.json for Railway
const railwayConfig = {
  $schema: "https://railway.app/railway.schema.json",
  build: {
    builder: "NIXPACKS",
  },
  deploy: {
    startCommand: "node server.js",
    restartPolicyType: "ON_FAILURE",
    restartPolicyMaxRetries: 10,
  },
};

fs.writeFileSync("railway.json", JSON.stringify(railwayConfig, null, 2));
console.log("📝 Created railway.json for Railway deployment");

console.log("\n🎯 Next Steps:");
console.log("1. Push your code to GitHub:");
console.log("   git add .");
console.log('   git commit -m "Ready for deployment"');
console.log("   git push origin main");
console.log("");
console.log("2. Deploy to Vercel:");
console.log("   - Go to vercel.com");
console.log("   - Import your GitHub repository");
console.log("   - Deploy");
console.log("");
console.log("3. Deploy WebSocket server:");
console.log("   - Railway: Connect GitHub repo at railway.app");
console.log("   - Heroku: Connect GitHub repo at heroku.com");
console.log("   - DigitalOcean: Create app at cloud.digitalocean.com");
console.log("");
console.log("4. Set environment variables in Vercel:");
console.log("   - NEXT_PUBLIC_WS_URL = wss://your-websocket-server-url");
console.log("   - NEXT_PUBLIC_APP_URL = https://your-vercel-app-url");
console.log("");
console.log("5. Redeploy Vercel and test!");
console.log("");
console.log("📖 See DEPLOYMENT_GUIDE.md for detailed instructions");
