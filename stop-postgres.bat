@echo off
echo Stopping PostgreSQL server...
set PGDATA=%CD%\postgresql-portable\data
set PGBIN=%CD%\postgresql-portable\pgsql\bin

"%PGBIN%\pg_ctl.exe" -D "%PGDATA%" stop

echo PostgreSQL server stopped.
pause
