@echo off
echo ========================================
echo ThinQ Chess - Local PostgreSQL Setup
echo ========================================
echo.

REM Check if PostgreSQL is already installed
where psql >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is already installed!
    goto :setup_database
)

echo PostgreSQL not found. Please install PostgreSQL first.
echo.
echo Download from: https://www.postgresql.org/download/windows/
echo.
echo After installation:
echo 1. Make sure PostgreSQL service is running
echo 2. Remember your postgres user password
echo 3. Run this script again
echo.
pause
exit /b 1

:setup_database
echo Setting up ThinQ Chess database...
echo.

REM Get PostgreSQL password
set /p PGPASSWORD="Enter PostgreSQL password for user 'postgres': "

REM Create database
echo Creating database 'thinqchess'...
createdb -U postgres -h localhost thinqchess 2>nul
if %errorlevel% neq 0 (
    echo Database might already exist, continuing...
)

REM Run SQL setup
echo Setting up tables and data...
psql -U postgres -h localhost -d thinqchess -f setup-database.sql

if %errorlevel% neq 0 (
    echo ❌ Error setting up database tables.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Local PostgreSQL Setup Complete!
echo ========================================
echo Database: thinqchess
echo Host: localhost
echo Port: 5432
echo User: postgres
echo.
echo Update your .env.local file with:
echo POSTGRES_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/thinqchess"
echo.
echo Now run: npm run dev
echo ========================================
pause
