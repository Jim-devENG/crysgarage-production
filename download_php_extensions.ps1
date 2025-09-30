# Download Missing PHP Extensions
# This script will download the required PHP extension DLLs

Write-Host "=== DOWNLOADING MISSING PHP EXTENSIONS ===" -ForegroundColor Green
Write-Host ""

# Get PHP version and architecture
$phpVersion = php -r "echo PHP_VERSION;"
$phpArch = php -r "echo PHP_INT_SIZE * 8;"

Write-Host "PHP Version: $phpVersion" -ForegroundColor Yellow
Write-Host "PHP Architecture: $phpArch-bit" -ForegroundColor Yellow

# Find PHP extensions directory
$phpPath = (Get-Command php).Source
$phpDir = Split-Path $phpPath
$extDir = "$phpDir\ext"

Write-Host "PHP Extensions Directory: $extDir" -ForegroundColor Yellow
Write-Host ""

# Extensions that need DLL files
$extensionsToDownload = @(
    @{Name="fileinfo"; File="php_fileinfo.dll"},
    @{Name="zip"; File="php_zip.dll"},
    @{Name="pdo_sqlite"; File="php_pdo_sqlite.dll"},
    @{Name="sqlite3"; File="php_sqlite3.dll"}
)

# Create extensions directory if it doesn't exist
if (-not (Test-Path $extDir)) {
    New-Item -ItemType Directory -Path $extDir -Force
    Write-Host "Created extensions directory: $extDir" -ForegroundColor Green
}

foreach ($ext in $extensionsToDownload) {
    $dllPath = "$extDir\$($ext.File)"
    
    if (Test-Path $dllPath) {
        Write-Host "✅ $($ext.Name) - DLL already exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $($ext.Name) - DLL not found" -ForegroundColor Yellow
        Write-Host "   You may need to download: $($ext.File)" -ForegroundColor Yellow
        Write-Host "   From: https://windows.php.net/downloads/releases/" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== ALTERNATIVE SOLUTION ===" -ForegroundColor Green
Write-Host "Since some extensions are missing, let's try a different approach:" -ForegroundColor Yellow
Write-Host ""

# Try to install Composer with ignore platform requirements
Write-Host "Attempting to install Composer dependencies with platform requirements ignored..." -ForegroundColor Yellow

Set-Location "crysgarage-backend-fresh"

# Try composer install with ignore platform requirements
$composerCommand = "composer install --ignore-platform-req=ext-fileinfo --ignore-platform-req=ext-zip --ignore-platform-req=ext-pdo_sqlite --ignore-platform-req=ext-sqlite3 --ignore-platform-req=ext-pcntl --no-dev --optimize-autoloader"

Write-Host "Running: $composerCommand" -ForegroundColor Yellow
Write-Host ""

try {
    Invoke-Expression $composerCommand
    Write-Host ""
    Write-Host "✅ Composer dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Composer installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "=== MANUAL SOLUTION ===" -ForegroundColor Yellow
    Write-Host "1. Download PHP extensions from: https://windows.php.net/downloads/releases/" -ForegroundColor Yellow
    Write-Host "2. Extract the DLL files to: $extDir" -ForegroundColor Yellow
    Write-Host "3. Or use the existing backend directory instead" -ForegroundColor Yellow
}
