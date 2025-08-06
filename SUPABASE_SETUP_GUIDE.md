# 🚀 Supabase Complete Setup Guide

## 🎯 **Migration Complete: Firebase → Supabase**

### **✅ What's Done:**
- ❌ Firebase completely removed
- ❌ PostgreSQL removed  
- ✅ Supabase client installed
- ✅ All database operations migrated
- ✅ Storage operations ready
- ✅ Image upload component updated
- ✅ Real-time subscriptions ready

## 📋 **Step 1: Create Supabase Project**

1. **Go to:** https://supabase.com/
2. **Sign up/Login** with GitHub
3. **Click:** "New Project"
4. **Fill details:**
   - Project Name: `ThinQ Chess`
   - Database Password: `thinqchess123` (save this!)
   - Region: `Southeast Asia (Singapore)`
5. **Click:** "Create new project"
6. **Wait 2-3 minutes** for setup

## 🔑 **Step 2: Get API Keys**

1. **Go to:** Project Settings → API
2. **Copy these values:**
   - **Project URL:** `https://your-project.supabase.co`
   - **Anon Public Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

## ⚙️ **Step 3: Update Environment Variables**

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Development Mode (set to false to use Supabase)
DEVELOPMENT_MODE="false"
NEXT_PUBLIC_DEVELOPMENT_MODE="false"
```

## 🗄️ **Step 4: Create Database Tables**

Go to **SQL Editor** in Supabase and run these commands:

### **Blogs Table:**
```sql
CREATE TABLE blogs (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  slug TEXT UNIQUE NOT NULL,
  author TEXT DEFAULT 'Admin',
  status TEXT DEFAULT 'draft',
  tags TEXT[],
  featured_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Gallery Images Table:**
```sql
CREATE TABLE gallery_images (
  id BIGSERIAL PRIMARY KEY,
  image_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'uncategorized',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Tournament Registrations Table:**
```sql
CREATE TABLE tournament_registrations (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  chess_experience TEXT NOT NULL,
  tournament_type TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Admin Settings Table:**
```sql
CREATE TABLE admin_settings (
  id BIGSERIAL PRIMARY KEY,
  tournament_fee DECIMAL(10,2) DEFAULT 500,
  registration_fee DECIMAL(10,2) DEFAULT 400,
  max_participants INTEGER DEFAULT 50,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO admin_settings (tournament_fee, registration_fee, max_participants)
VALUES (500, 400, 50);
```

## 📁 **Step 5: Create Storage Buckets**

Go to **Storage** in Supabase:

### **Create Buckets:**
1. **Click:** "New bucket"
2. **Create these buckets:**
   - `blog-images` (Public)
   - `gallery-images` (Public)
   - `general-uploads` (Public)

### **Set Bucket Policies:**
For each bucket, go to **Policies** and add:

```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

-- Allow authenticated uploads
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'blog-images');

-- Allow authenticated delete
CREATE POLICY "Authenticated delete" ON storage.objects
FOR DELETE USING (bucket_id = 'blog-images');
```

Repeat for `gallery-images` and `general-uploads`.

## 🔐 **Step 6: Set Row Level Security (RLS)**

Go to **Authentication → Policies** and enable RLS:

### **For blogs table:**
```sql
-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Allow public read for published blogs
CREATE POLICY "Public read published blogs" ON blogs
FOR SELECT USING (status = 'published');

-- Allow all operations for service role
CREATE POLICY "Service role full access" ON blogs
FOR ALL USING (auth.role() = 'service_role');
```

### **For other tables:**
```sql
-- Gallery images - public read
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gallery" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Service role gallery access" ON gallery_images FOR ALL USING (auth.role() = 'service_role');

-- Registrations - service role only
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role registrations" ON tournament_registrations FOR ALL USING (auth.role() = 'service_role');

-- Admin settings - service role only
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role admin settings" ON admin_settings FOR ALL USING (auth.role() = 'service_role');
```

## 🎯 **Step 7: Test Features**

### **Enable Production Mode:**
```env
DEVELOPMENT_MODE="false"
NEXT_PUBLIC_DEVELOPMENT_MODE="false"
```

### **Restart Server:**
```bash
npm run dev
```

### **Test These Features:**
1. **Gallery Upload:** Admin → Gallery → Upload Image
2. **Blog Images:** Admin → Blog → Create Post → Upload Featured Image
3. **Registration:** Frontend → Tournaments → Register
4. **Real-time Updates:** Multiple browser tabs

## ✅ **Success Indicators**

If setup is correct:
- ✅ Gallery shows uploaded images (not mock data)
- ✅ Blog featured images upload and display
- ✅ Registration data appears in admin panel
- ✅ Real-time updates work
- ✅ No console errors

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Supabase not initialized"**
**Solution:** Check environment variables are correct

### **Issue 2: "Row Level Security policy violation"**
**Solution:** Check RLS policies are created properly

### **Issue 3: "Storage bucket not found"**
**Solution:** Create storage buckets and set policies

### **Issue 4: "Upload failed"**
**Solution:** Check storage policies allow uploads

## 🎉 **Migration Benefits**

### **Why Supabase > Firebase:**
- ✅ **PostgreSQL database** - More powerful than Firestore
- ✅ **Real-time subscriptions** - Built-in
- ✅ **File storage** - Integrated with database
- ✅ **SQL queries** - Full SQL support
- ✅ **Better pricing** - More generous free tier
- ✅ **Open source** - No vendor lock-in
- ✅ **Faster development** - Better DX

**Supabase setup complete! Your website is now powered by the best backend! 🚀**
