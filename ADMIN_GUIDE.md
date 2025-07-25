# 🎛️ ThinQ Chess Admin Control Guide

## 🚀 Quick Setup Instructions

### 1. Database Setup (One-time only)
1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Copy the SQL from `lib/db-setup.sql` and run it in your database
4. Your admin panel is ready!

### 2. Admin Control Panel Access
Visit: `https://your-domain.com/admin-control`

**Default Admin Login:**
- Email: `admin@thinqchess.com`
- Password: `admin123`

---

## 🎯 How to Control Your Website

### 🏆 Tournament Registration Control

**To Show "Coming Soon" Page:**
1. Go to `/admin-control`
2. Under "Tournament Registration" section
3. Select "Coming Soon (Show Coming Soon Page)"
4. Click "Save Settings"

**To Activate Tournament Registration:**
1. Select "Active (Show Registration Form)"
2. Click "Save Settings"
3. Tournament registration form will be live!

### 📚 Course Registration Control

**To Show "Coming Soon" Page:**
1. Under "Course Registration" section
2. Select "Coming Soon (Show Coming Soon Page)"
3. Click "Save Settings"

**To Activate Course Registration:**
1. Select "Active (Show Registration Form)"
2. Click "Save Settings"
3. Course registration form will be live!

### 💬 Custom Coming Soon Message

1. Edit the text in "Coming Soon Message" box
2. This message appears on coming soon pages
3. Click "Save Settings" to apply

---

## 📱 Page Status Overview

| Page | URL | Purpose |
|------|-----|---------|
| Tournament | `/tournaments` | Tournament registration & coming soon |
| Course Registration | `/registration` | Student course enrollment |
| Admin Control | `/admin-control` | Control panel for admins |

---

## 🎨 Coming Soon Page Features

✨ **Animated Design** with ThinQ Chess branding
⏰ **Countdown Timer** (automatically set to 30 days)
📧 **Email Subscription** for notifications
🎯 **Tournament Highlights** and preparation tips
📱 **Mobile Responsive** design
🔗 **Quick Links** to demo classes and curriculum

---

## 🛠️ Advanced Features (Coming Soon)

### Phase 1: ✅ Completed
- [x] Coming Soon page with countdown
- [x] Admin control panel
- [x] Dynamic page status control
- [x] Mobile responsive design
- [x] Email subscription system

### Phase 2: 🔄 In Development
- [ ] Tournament fee management
- [ ] Discount code system
- [ ] Gallery management
- [ ] Blog management
- [ ] Excel data export
- [ ] Google Reviews integration

### Phase 3: 📋 Planned
- [ ] Complete admin dashboard
- [ ] User management
- [ ] Analytics and reports
- [ ] Email notifications
- [ ] Payment tracking

---

## 🚨 Important Notes

### Current Status:
- **Tournament Page**: Shows coming soon by default
- **Registration Page**: Shows registration form by default
- **Admin Control**: Accessible at `/admin-control`

### To Change Defaults:
Use the admin control panel to toggle between:
- ✅ Active registration forms
- 🚧 Coming soon pages

### Database Requirements:
- Vercel Postgres database
- Run the SQL setup script once
- All settings stored in `admin_settings` table

---

## 📞 Support & Contact

**For Technical Issues:**
- Check admin control panel first
- Verify database connection
- Contact development team

**For Content Updates:**
- Use admin control panel
- Update coming soon messages
- Toggle page status as needed

**Quick Links:**
- Admin Panel: `/admin-control`
- Tournament Page: `/tournaments`
- Registration Page: `/registration`

---

## 🎯 Quick Actions

### To Announce New Tournament:
1. Set tournament to "Coming Soon"
2. Update coming soon message
3. Set countdown date
4. Activate when ready to accept registrations

### To Close Registrations:
1. Switch to "Coming Soon" mode
2. Update message: "Registration closed. Results coming soon!"
3. Keep admin data for analysis

### To Reopen Registrations:
1. Update tournament settings
2. Switch to "Active" mode
3. Test registration flow
4. Announce to students

---

**🎉 Your ThinQ Chess website is now fully controllable through the admin panel!**
