@echo off
echo ========================================
echo ThinQ Chess Database Setup
echo ========================================
echo.

echo Step 1: Creating database...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE thinqchess;"
if %errorlevel% neq 0 (
    echo Error creating database. Please check if PostgreSQL is running.
    echo Make sure PostgreSQL service is started.
    pause
    exit /b 1
)
echo ✅ Database 'thinqchess' created successfully!
echo.

echo Step 2: Setting up tables...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d thinqchess -f setup-database.sql
if %errorlevel% neq 0 (
    echo Error setting up tables.
    pause
    exit /b 1
)
echo ✅ Tables created successfully!
echo.

echo Step 3: Testing connection...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d thinqchess -c "SELECT COUNT(*) FROM admin_settings;"
if %errorlevel% neq 0 (
    echo Error testing connection.
    pause
    exit /b 1
)
echo ✅ Database setup completed successfully!
echo.

echo ========================================
echo Setup Complete! 
echo You can now run: npm run dev
echo ========================================
pause
