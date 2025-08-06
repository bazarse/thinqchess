@echo off
echo 🚀 Pushing ThinqChess Tournament System to GitHub...
echo.

echo ✅ Setting up remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/bazarse/thinqchess.git

echo ✅ Checking git status...
git status

echo ✅ Pushing to GitHub repository...
git push -u origin main

echo.
echo 🎉 Code successfully pushed to GitHub!
echo 📍 Repository: https://github.com/bazarse/thinqchess
echo.
echo 🚀 Next Steps:
echo 1. Go to https://vercel.com and login with GitHub
echo 2. Click "New Project" 
echo 3. Import the "thinqchess" repository
echo 4. Deploy with default settings
echo.
echo ✅ All tournament system fixes are included:
echo   - Registration data sync fixed
echo   - Category fee updates working (Under 12: ₹500, Under 16: ₹200)
echo   - Delete functionality implemented
echo   - Revenue calculations accurate
echo   - Admin panel real-time updates
echo.
pause
