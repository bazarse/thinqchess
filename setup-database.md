# 🚀 ThinQ Chess Database Setup

## Quick Setup Options

### Option 1: Free Cloud PostgreSQL (Recommended)

#### **Supabase (Easiest)**
1. Go to https://supabase.com
2. Create free account
3. Create new project
4. Copy database URL from Settings > Database
5. Add to `.env.local`:
```
POSTGRES_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

#### **Neon (Alternative)**
1. Go to https://neon.tech
2. Create free account
3. Create database
4. Copy connection string
5. Add to `.env.local`

### Option 2: Local PostgreSQL

#### **Windows (PostgreSQL Installer)**
1. Download: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember password you set
4. Create database:
```sql
CREATE DATABASE thinqchess;
```
5. Add to `.env.local`:
```
POSTGRES_URL="postgresql://postgres:your-password@localhost:5432/thinqchess"
```

#### **Docker (If you have Docker)**
```bash
docker run --name thinqchess-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=thinqchess -p 5432:5432 -d postgres:15
```

## Setup Steps

1. **Copy environment file:**
```bash
cp .env.local.example .env.local
```

2. **Update database URL in `.env.local`**

3. **Install dependencies:**
```bash
npm install
```

4. **Run the application:**
```bash
npm run dev
```

5. **Database will auto-initialize on first run!**

## ✅ Ready for Vercel

Once working locally, just push to GitHub and deploy to Vercel. Vercel will automatically provide PostgreSQL database for production.

## Admin Login
- Email: admin@thinqchess.com
- Password: 1234
