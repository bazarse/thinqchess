# Complete Form Testing Guide

## 1. Tournament Registration ✅
**URL**: http://localhost:3000/tournaments
**Test Data**:
```
Name: Test Player
Email: test@example.com
Phone: +919876543210
DOB: 2010-05-15 (Under 12 category)
Gender: Male
Category: Under 12 (₹400)
Discount: DEMO10 (10% off)
Final: ₹360
```

## 2. Course Registration 
**URL**: http://localhost:3000/registration
**Test Data**:
```
Student: Test Student
DOB: 2015-01-01
Gender: Male
Classes For: Child

Father: Test Father
Email: father@test.com
Phone: +919876543210

Address: Test Address, Bangalore
State: Karnataka
Country: India
Pincode: 560001

Mode: Online
Heard From: Social Media
```

## 3. Book a Demo
**URL**: http://localhost:3000/book-a-demo
**Test Data**:
```
Parent Name: Test Parent
Email: parent@test.com
Phone: +919876543210
Child Name: Test Child
Age: 8
Chess Training: Yes
State: Karnataka
Country: India
Message: Test demo request
```

## Expected Results:
- ✅ All forms should submit successfully
- ✅ Data should save to database
- ✅ Admin panels should show submissions
- ✅ Email notifications should work

## Admin Verification:
- Tournament: `/admin/registrations`
- Course: `/admin/registrations` 
- Demo: `/admin/demo-submissions`