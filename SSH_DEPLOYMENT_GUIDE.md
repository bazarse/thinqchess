# 🚀 ThinQ Chess - SSH Deployment Guide

## 📋 Upload Files via SSH to Your Server

Since you want to upload the fixes directly via SSH to your server at `93.127.199.194`, here's how to do it:

## 🔧 **Method 1: Direct File Upload via SCP**

### **Step 1: Upload Modified Files**
```bash
# Upload individual files to your server
scp lib/database.js root@93.127.199.194:/path/to/your/thinqchess/lib/
scp lib/simple-db.js root@93.127.199.194:/path/to/your/thinqchess/lib/
scp src/app/api/admin/login/route.js root@93.127.199.194:/path/to/your/thinqchess/src/app/api/admin/login/
scp src/app/admin/gallery/page.jsx root@93.127.199.194:/path/to/your/thinqchess/src/app/admin/gallery/
scp package.json root@93.127.199.194:/path/to/your/thinqchess/
scp .env.production root@93.127.199.194:/path/to/your/thinqchess/
scp server-init.js root@93.127.199.194:/path/to/your/thinqchess/
```

### **Step 2: SSH into Server and Restart**
```bash
# Connect to your server
ssh root@93.127.199.194

# Navigate to your project directory
cd /path/to/your/thinqchess

# Install dependencies (if needed)
npm install

# Initialize database
npm run server:init

# Restart the application
pm2 restart all
# OR if using different process manager:
# npm run start:server
```

## 🔧 **Method 2: Upload All Files at Once**

### **Step 1: Create a Zip File Locally**
```bash
# Create a zip with all modified files
zip -r thinqchess-fixes.zip \
  lib/database.js \
  lib/simple-db.js \
  src/app/api/admin/login/route.js \
  src/app/admin/gallery/page.jsx \
  package.json \
  .env.production \
  server-init.js \
  SERVER_DEPLOYMENT_FIX.md
```

### **Step 2: Upload and Extract on Server**
```bash
# Upload the zip file
scp thinqchess-fixes.zip root@93.127.199.194:/tmp/

# SSH into server
ssh root@93.127.199.194

# Navigate to your project directory
cd /path/to/your/thinqchess

# Extract the files (this will overwrite existing files)
unzip -o /tmp/thinqchess-fixes.zip

# Clean up
rm /tmp/thinqchess-fixes.zip

# Install dependencies and restart
npm install
npm run server:init
pm2 restart all
```

## 🔧 **Method 3: Direct SSH Editing (If you prefer)**

### **Connect to Server and Edit Files Directly**
```bash
# SSH into your server
ssh root@93.127.199.194

# Navigate to project directory
cd /path/to/your/thinqchess

# Edit each file using nano or vim
nano lib/database.js
nano lib/simple-db.js
nano src/app/api/admin/login/route.js
nano src/app/admin/gallery/page.jsx
nano package.json

# Create new files
nano .env.production
nano server-init.js
```

## 🔧 **Method 4: Using rsync (Recommended)**

### **Sync All Changes at Once**
```bash
# From your local project directory, sync all changes
rsync -avz --exclude node_modules --exclude .git \
  ./ root@93.127.199.194:/path/to/your/thinqchess/

# SSH into server and restart
ssh root@93.127.199.194
cd /path/to/your/thinqchess
npm install
npm run server:init
pm2 restart all
```

## 📋 **Important File Contents to Upload:**

### **1. .env.production** (Create this file on server):
```env
# ThinQ Chess Production Environment Variables
NODE_ENV=production
DEVELOPMENT_MODE=false
DATABASE_TYPE=simpledb
DATABASE_PATH=/tmp/database.sqlite
ADMIN_EMAIL=admin@thinqchess.com
ADMIN_PASSWORD=1234
JWT_SECRET=thinqchess-secret-key-2024-production
```

### **2. server-init.js** (Create this file on server):
```javascript
#!/usr/bin/env node
console.log('🚀 ThinQ Chess Server Initialization...');
require('dotenv').config({ path: '.env.production' });
require('dotenv').config({ path: '.env.local' });
const { initializeDatabase } = require('./lib/database.js');

async function initializeServer() {
  try {
    console.log('🔧 Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      DEVELOPMENT_MODE: process.env.DEVELOPMENT_MODE,
      DATABASE_TYPE: process.env.DATABASE_TYPE
    });
    console.log('📊 Initializing database...');
    await initializeDatabase();
    console.log('✅ Server initialization completed successfully!');
    console.log('🎉 ThinQ Chess is ready to serve!');
    console.log('\n🔐 Admin Login Information:');
    console.log('URL: /admin');
    console.log('Username: admin@thinqchess.com OR admin');
    console.log('Password: 1234');
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    process.exit(1);
  }
}
initializeServer();
```

## 🎯 **After Upload - Server Commands:**

```bash
# SSH into your server
ssh root@93.127.199.194

# Navigate to project
cd /path/to/your/thinqchess

# Make server-init.js executable
chmod +x server-init.js

# Install dependencies
npm install

# Initialize database with admin users
node server-init.js

# Restart your application
pm2 restart all
# OR
pm2 stop all && pm2 start ecosystem.config.js
# OR if using npm
npm run start:server
```

## ✅ **Test After Deployment:**

1. **Admin Login**: http://93.127.199.194:3000/admin
   - Try: `admin` / `1234`
   - Try: `admin@thinqchess.com` / `1234`

2. **Gallery Video Upload**: Admin → Gallery → Add YouTube Video

3. **Demo Completion**: Admin → Demo Submissions → Toggle status

## 🔍 **Troubleshooting:**

### **If you get permission errors:**
```bash
# Fix file permissions
chmod -R 755 /path/to/your/thinqchess
chown -R www-data:www-data /path/to/your/thinqchess
```

### **If database issues:**
```bash
# Check if database is created
ls -la /tmp/database.sqlite
# OR
ls -la ./database.sqlite

# Re-initialize if needed
node server-init.js
```

### **Check application logs:**
```bash
pm2 logs
# OR
tail -f /var/log/your-app.log
```

Choose the method that works best for your setup! Method 4 (rsync) is usually the most efficient for multiple file updates.