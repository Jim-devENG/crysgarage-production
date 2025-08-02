@echo off
setlocal enabledelayedexpansion

echo Crys Garage Backup Restoration System
echo =====================================

:: List available backups
echo 📦 Available backups:
if not exist "backups" (
    echo ❌ No backups found
    pause
    exit /b 1
)

set /a counter=0
for /d %%i in (backups\*) do (
    set /a counter+=1
    echo !counter!. %%i
)

:: Get user selection
set /p choice="Select backup to restore (1-%counter%): "

:: Validate selection
if !choice! lss 1 (
    echo ❌ Invalid selection
    pause
    exit /b 1
)

if !choice! gtr %counter% (
    echo ❌ Invalid selection
    pause
    exit /b 1
)

:: Find selected backup
set /a current=0
for /d %%i in (backups\*) do (
    set /a current+=1
    if !current! equ !choice! (
        set "backup_path=%%i"
        goto :restore
    )
)

:restore
echo Restoring from backup: !backup_path!

:: Restore files
if exist "!backup_path!\App.tsx" (
    echo 📄 Restoring App.tsx...
    copy "!backup_path!\App.tsx" "crysgarage-frontend\App.tsx" /Y >nul
)

if exist "!backup_path!\globals.css" (
    echo 🎨 Restoring globals.css...
    copy "!backup_path!\globals.css" "crysgarage-frontend\styles\globals.css" /Y >nul
)

if exist "!backup_path!\docker-compose.yml" (
    echo 🐳 Restoring docker-compose.yml...
    copy "!backup_path!\docker-compose.yml" "docker-compose.yml" /Y >nul
)

echo ✅ Backup restored successfully!
echo 🚀 You can now run the deployment script to push the restored version

pause 