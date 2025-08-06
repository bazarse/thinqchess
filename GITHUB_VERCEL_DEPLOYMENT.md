# 🚀 GitHub & Vercel Deployment Guide

## 📋 Pre-Deployment Checklist

✅ **Tournament System Fixes Completed:**
- Tournament registration data sync fixed
- Category fee updates working (Under 12: ₹500, Under 16: ₹200)
- Registration delete functionality implemented
- Revenue and registration count calculations fixed
- Admin panel real-time updates working

## 🔧 Step 1: GitHub Repository Setup

### Option A: Create New Repository on GitHub
1. Go to [GitHub.com](https://github.com) and login
2. Click "New Repository" (green button)
3. Repository name: `thinqchess-tournament-system`
4. Description: `Complete Chess Tournament Management System with Admin Panel`
5. Set to **Public** or **Private** (your choice)
6. **DO NOT** initialize with README (we already have code)
7. Click "Create Repository"

### Option B: Use Existing Repository
If you already have a repository, get the URL from GitHub.

## 🔗 Step 2: Connect Local Code to GitHub

Run these commands in your terminal:

```bash
# Add GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/thinqchess-tournament-system.git

# Push code to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## 🌐 Step 3: Vercel Deployment

### 3.1 Connect GitHub to Vercel
1. Go to [Vercel.com](https://vercel.com) and login with GitHub
2. Click "New Project"
3. Import your `thinqchess-tournament-system` repository
4. Click "Deploy"

### 3.2 Environment Variables Setup
In Vercel Dashboard → Project Settings → Environment Variables, add:

```env
# Database Configuration
DATABASE_URL=your_postgresql_connection_string
POSTGRES_URL=your_postgresql_connection_string
POSTGRES_PRISMA_URL=your_postgresql_connection_string
POSTGRES_URL_NON_POOLING=your_postgresql_connection_string

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Payment Configuration (if using Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
```

### 3.3 PostgreSQL Database Setup
1. **Vercel Postgres** (Recommended):
   - In Vercel Dashboard → Storage → Create Database
   - Select "Postgres"
   - Copy connection strings to environment variables

2. **Alternative: Supabase**:
   - Go to [Supabase.com](https://supabase.com)
   - Create new project
   - Get connection string from Settings → Database

## 📊 Step 4: Database Migration

After deployment, your app will automatically:
- Create necessary tables on first run
- Initialize with sample data
- Set up admin user

## 🎯 Step 5: Post-Deployment Verification

### Test These Features:
1. **Tournament Registration**: `/tournaments`
2. **Admin Login**: `/admin`
3. **Registration Management**: `/admin/tournaments/1/registrations`
4. **Category Fee Updates**: Test both Under 12 (₹500) and Under 16 (₹200)
5. **Delete Functionality**: Remove test registrations
6. **Revenue Calculations**: Verify total amounts

### Expected URLs:
- **Main Site**: `https://your-app-name.vercel.app`
- **Admin Panel**: `https://your-app-name.vercel.app/admin`
- **Tournaments**: `https://your-app-name.vercel.app/tournaments`

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Check environment variables are set correctly
   - Verify PostgreSQL connection string format

2. **Admin Login Issues**:
   - Ensure ADMIN_USERNAME and ADMIN_PASSWORD are set
   - Check NEXTAUTH_SECRET is configured

3. **Tournament Registration Not Working**:
   - Verify database tables are created
   - Check API routes are deployed correctly

4. **Category Fees Not Updating**:
   - This was fixed in our latest commit
   - Redeploy if needed

## 📱 Features Ready for Production:

✅ **Tournament Management**:
- Create/Edit tournaments with multiple categories
- Dynamic fee calculation based on category selection
- Real-time registration tracking

✅ **Registration System**:
- Multi-step registration form
- Payment integration ready
- Email notifications

✅ **Admin Dashboard**:
- Real-time statistics
- Registration management
- Export functionality
- Delete capabilities

✅ **Database System**:
- Optimized for serverless deployment
- Automatic table creation
- Data persistence

## 🚀 Ready for Launch!

Your tournament system is now production-ready with:
- Fixed tournament registration issues
- Working category fee calculations
- Functional delete operations
- Real-time admin statistics
- Vercel-optimized database system

## 📞 Support

If you encounter any issues during deployment:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test database connectivity
4. Review API route responses

**All critical tournament system issues have been resolved and the application is ready for production deployment!**
