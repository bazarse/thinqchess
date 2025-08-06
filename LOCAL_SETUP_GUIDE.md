# 🚀 ThinQ Chess - SQLite + Vercel Setup Guide

## ✅ What's Changed
- ❌ **Supabase completely removed**
- ❌ **PostgreSQL removed**
- ✅ **SQLite for local development**
- ✅ **Vercel-compatible deployment**
- ✅ **In-memory database for production**
- ✅ **Pre-populated sample data**

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Git** (for GitHub deployment)

## 🔧 Step 1: Install Dependencies

```bash
# Install all dependencies including SQLite
npm install
```

**Note:** `better-sqlite3` will be automatically installed!

## 🗄️ Step 2: Initialize Database

```bash
# Initialize SQLite database with sample data
npm run setup-db

# Or manually
node init-database.js
```

## 🚀 Step 3: Start Development

```bash
# Start development server
npm run dev
```

**That's it!** Your app is now running with SQLite database! 🎉

## ⚙️ Environment Variables (Optional)

Your `.env.local` file:
```env
# SQLite Database Configuration
DATABASE_TYPE="sqlite"
DATABASE_PATH="./database.sqlite"

# Admin Settings
JWT_SECRET="thinqchess-secret-key-2024"
ADMIN_EMAIL="admin@thinqchess.com"
ADMIN_PASSWORD="1234"

# EmailJS (optional)
NEXT_PUBLIC_EMAILJS_SERVICE_ID="your-service-id"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="your-template-id"
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="your-public-key"

# Razorpay (optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_demo_key"
RAZORPAY_KEY_SECRET="demo_secret_key"
```

## 🔐 Default Admin Login
- **Email:** admin@thinqchess.com
- **Password:** 1234

## 📊 Database Tables Created
- `admin_settings` - Tournament and course settings
- `tournaments` - Tournament information
- `tournament_registrations` - Registration data
- `registrations` - Enhanced registration table
- `demo_requests` - Demo class requests
- `admin_users` - Admin authentication
- `discount_codes` - Discount management
- `gallery_images` - Gallery photos
- `blogs` - Blog posts

## 🌐 Deployment to Vercel

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "SQLite + Vercel setup complete"
git push origin main
```

### **Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Click "Deploy"
4. **That's it!** No database setup needed!

### **How it Works:**
- **Local Development:** File-based SQLite database
- **Vercel Production:** In-memory database with sample data
- **Same code, different database strategy**
- **No external database required!**

## 🔧 Troubleshooting

### Database Connection Issues:
```bash
# Test PostgreSQL connection
psql -U postgres -h localhost -d thinqchess
```

### Reset Database:
```bash
# Drop and recreate database
dropdb -U postgres thinqchess
createdb -U postgres thinqchess
node init-database.js
```

### Check PostgreSQL Service:
```bash
# Windows
net start postgresql-x64-14

# macOS
brew services restart postgresql

# Linux
sudo systemctl status postgresql
```

## 📝 Next Steps

1. ✅ Local development working
2. ✅ Test all features (tournaments, registrations, admin panel)
3. ✅ Push to GitHub
4. ✅ Deploy to Vercel with cloud PostgreSQL

## 🎯 Features Working
- ✅ Tournament registration
- ✅ Course registration  
- ✅ Admin dashboard
- ✅ Blog management
- ✅ Gallery management
- ✅ Discount codes
- ✅ Payment integration (demo)
- ✅ Export functionality
