@echo off
echo ========================================
echo ThinQ Chess - Local PostgreSQL Setup
echo ========================================
echo.

echo Step 1: Downloading Portable PostgreSQL...
if not exist "postgresql-portable" (
    echo Creating postgresql-portable directory...
    mkdir postgresql-portable
    echo.
    echo Please download PostgreSQL Portable from:
    echo https://get.enterprisedb.com/postgresql/postgresql-15.4-1-windows-x64-binaries.zip
    echo.
    echo Extract it to the 'postgresql-portable' folder
    echo Then run this script again.
    pause
    exit /b 1
)

echo Step 2: Setting up database...
set PGDATA=%CD%\postgresql-portable\data
set PGBIN=%CD%\postgresql-portable\pgsql\bin

if not exist "%PGDATA%" (
    echo Initializing database...
    "%PGBIN%\initdb.exe" -D "%PGDATA%" -U postgres --auth-local=trust --auth-host=md5
)

echo Step 3: Starting PostgreSQL server...
start /B "%PGBIN%\pg_ctl.exe" -D "%PGDATA%" -l "%CD%\postgresql-portable\logfile" start

echo Waiting for server to start...
timeout /t 5 /nobreak > nul

echo Step 4: Creating database and tables...
"%PGBIN%\createdb.exe" -U postgres thinqchess 2>nul
"%PGBIN%\psql.exe" -U postgres -d thinqchess -f init-db.sql

echo.
echo ========================================
echo ✅ Local PostgreSQL Setup Complete!
echo ========================================
echo Database: thinqchess
echo User: postgres
echo Password: (none)
echo Port: 5432
echo.
echo To stop the server: stop-postgres.bat
echo ========================================
pause
