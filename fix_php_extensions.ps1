# Fix PHP Extensions Script
Write-Host "=== FIXING PHP EXTENSIONS ===" -ForegroundColor Green
Write-Host ""

$phpIniPath = "C:\Users\MIKENZY\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.2_Microsoft.Winget.Source_8wekyb3d8bbwe\php.ini"

# Check if php.ini exists
if (-not (Test-Path $phpIniPath)) {
    Write-Host "❌ PHP.ini file not found at: $phpIniPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PHP.ini file found at: $phpIniPath" -ForegroundColor Green

# Create backup
$backupPath = "$phpIniPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $phpIniPath $backupPath
Write-Host "✅ Backup created: $backupPath" -ForegroundColor Green

# Read the current php.ini content
$content = Get-Content $phpIniPath

# Extensions to enable
$extensionsToEnable = @(
    "fileinfo",
    "zip"
)

Write-Host "🔧 Enabling PHP extensions..." -ForegroundColor Yellow

# Process each extension
foreach ($extension in $extensionsToEnable) {
    $pattern = ";extension=$extension"
    $replacement = "extension=$extension"
    
    # Check if the extension line exists
    $found = $false
    for ($i = 0; $i -lt $content.Length; $i++) {
        if ($content[$i] -eq $pattern) {
            $content[$i] = $replacement
            $found = $true
            Write-Host "   ✅ Enabled: $extension" -ForegroundColor Green
            break
        }
    }
    
    if (-not $found) {
        Write-Host "   ⚠️  Extension $extension not found in commented form" -ForegroundColor Yellow
    }
}

# Write the modified content back to the file
$content | Set-Content $phpIniPath -Encoding UTF8

Write-Host ""
Write-Host "🔍 Verifying extensions..." -ForegroundColor Yellow

# Test PHP to see if extensions are loaded
$phpTest = php -m 2>&1
$extensionsLoaded = @()

foreach ($extension in $extensionsToEnable) {
    if ($phpTest -match $extension) {
        $extensionsLoaded += $extension
        Write-Host "   ✅ $extension: Loaded successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $extension: Still not loaded" -ForegroundColor Red
    }
}

# Check for any remaining warnings
$warnings = $phpTest | Where-Object { $_ -match "Warning.*Unable to load dynamic library" }
if ($warnings) {
    Write-Host ""
    Write-Host "⚠️  Remaining warnings:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host ""
    Write-Host "🎉 No PHP extension warnings found!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== PHP EXTENSIONS FIX COMPLETE ===" -ForegroundColor Green
Write-Host "Extensions enabled: $($extensionsLoaded -join ', ')" -ForegroundColor Gray
Write-Host "Backup saved to: $backupPath" -ForegroundColor Gray