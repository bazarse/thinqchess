# 🔥 Firebase Quick Setup Guide

## 🚨 Current Status
Your app is running in **DEVELOPMENT MODE** with mock data. To enable Firebase real-time features, follow these steps:

## 📋 Step-by-Step Firebase Setup

### 1. 🌐 Firebase Console Setup

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select project: `thinq-79d4a`

2. **Enable Firestore Database:**
   - Click **Firestore Database** in left sidebar
   - Click **Create database**
   - Choose **Start in test mode** (temporary)
   - Select location: `asia-south1` (Mumbai) for India
   - Click **Done**

3. **Enable Authentication:**
   - Click **Authentication** in left sidebar
   - Click **Get started**
   - Go to **Sign-in method** tab
   - Enable **Email/Password** provider
   - Click **Save**

4. **Enable Storage:**
   - Click **Storage** in left sidebar
   - Click **Get started**
   - Choose **Start in test mode**
   - Use same location as Firestore
   - Click **Done**

### 2. 🔒 Security Rules Setup

#### Firestore Rules:
1. Go to **Firestore Database** → **Rules** tab
2. Replace existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for testing
    // IMPORTANT: Change this before production!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publish**

#### Storage Rules:
1. Go to **Storage** → **Rules** tab
2. Replace existing rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write access to all files for testing
    // IMPORTANT: Change this before production!
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publish**

### 3. 🔧 Enable Firebase in Your App

1. **Update Environment Variables:**
   In your `.env.local` file, change:
   ```env
   DEVELOPMENT_MODE="false"
   NEXT_PUBLIC_DEVELOPMENT_MODE="false"
   ```

2. **Restart Your Application:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

### 4. 🎯 Initialize Sample Data

1. **Create Admin User in Firestore:**
   - Go to **Firestore Database** → **Data** tab
   - Click **Start collection**
   - Collection ID: `admin_users`
   - Document ID: `admin-user-1`
   - Add fields:
     ```
     email: "admin@thinqchess.com"
     password_hash: "$2a$10$example_hash_here"
     role: "admin"
     name: "ThinQ Chess Admin"
     created_at: (timestamp) now
     ```

2. **Create Admin Settings:**
   - Create collection: `admin_settings`
   - Document ID: `default-settings`
   - Add fields:
     ```
     tournament_fee: 500
     registration_fee: 400
     max_participants: 50
     countdown_end_date: null
     created_at: (timestamp) now
     ```

3. **Create Sample Discount Codes:**
   - Create collection: `discount_codes`
   - Add documents with fields:
     ```
     code: "TC10"
     discount_percent: 10
     usage_limit: 100
     used_count: 0
     is_active: true
     description: "10% off tournament registration"
     ```

## 🎮 Testing Firebase Features

### Test Real-time Registration Counter:
1. Go to admin dashboard: `http://localhost:3001/admin-control`
2. Login with: `admin@thinqchess.com` / `admin123`
3. You should see live registration count

### Test Tournament Registration:
1. Go to: `http://localhost:3001/tournaments`
2. Fill registration form
3. Use discount code: `TC10`
4. Complete payment (simulated in development)
5. Check admin dashboard for real-time updates

## 🔄 Switch Between Modes

### Development Mode (Mock Data):
```env
DEVELOPMENT_MODE="true"
NEXT_PUBLIC_DEVELOPMENT_MODE="true"
```

### Production Mode (Firebase):
```env
DEVELOPMENT_MODE="false"
NEXT_PUBLIC_DEVELOPMENT_MODE="false"
```

## 🚨 Important Security Notes

⚠️ **Current rules allow full access for testing**
⚠️ **Change security rules before production**
⚠️ **Never expose Firebase config in public repos**

## 🆘 Troubleshooting

### Permission Denied Error:
1. Check if Firestore is enabled
2. Verify security rules are published
3. Ensure collections exist
4. Try development mode first

### App Not Loading:
1. Check environment variables
2. Restart development server
3. Clear browser cache
4. Check browser console for errors

### Firebase Connection Issues:
1. Verify Firebase project ID
2. Check internet connection
3. Ensure Firebase services are enabled
4. Try incognito/private browsing

## 📞 Need Help?

1. Check Firebase Console logs
2. Review browser console errors
3. Test with development mode first
4. Verify all environment variables

**Once Firebase is properly setup, your app will have real-time features! 🚀**
