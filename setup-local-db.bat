@echo off
echo ========================================
echo ThinQ Chess - Local PostgreSQL Setup
echo ========================================
echo.

REM Check if PostgreSQL is already installed
where psql >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo PostgreSQL found! Setting up local database...
    goto :setup_db
)

echo PostgreSQL not found. Installing portable version...
echo.

REM Create postgresql directory
if not exist "postgresql" mkdir postgresql
cd postgresql

echo Downloading PostgreSQL portable...
echo Please download PostgreSQL from: https://www.enterprisedb.com/download-postgresql-binaries
echo Extract to the 'postgresql' folder and run this script again.
echo.
pause
exit /b 1

:setup_db
echo Setting up ThinQ Chess database...

REM Create database
createdb -U postgres thinqchess 2>nul

REM Run initialization script
psql -U postgres -d thinqchess -f ../init-local-db.sql

echo.
echo ========================================
echo ✅ Local PostgreSQL Setup Complete!
echo ========================================
echo Database: thinqchess
echo User: postgres
echo Host: localhost
echo Port: 5432
echo.
echo Update your .env.local with:
echo POSTGRES_URL="postgresql://postgres:your-password@localhost:5432/thinqchess"
echo.
echo ========================================
pause
