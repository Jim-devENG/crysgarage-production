# Fix local PHP extensions and configure Laravel to use SQLite, then start server
Write-Host "== Fixing local PHP and Laravel environment =="

$ErrorActionPreference = 'Stop'

function Get-PhpIniPath {
  $line = php --ini | Select-String 'Loaded Configuration File'
  if (-not $line) { throw 'Unable to detect php.ini via php --ini' }
  return $line.ToString().Split(':')[-1].Trim()
}

function Ensure-PHPExtensions {
  param(
    [string]$PhpIni
  )
  if (-not (Test-Path $PhpIni)) { throw "php.ini not found at $PhpIni" }

  Write-Host "Using php.ini: $PhpIni"
  $backup = "$PhpIni.bak.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
  Copy-Item $PhpIni $backup -Force
  Write-Host "Backup created: $backup"

  $lines = Get-Content $PhpIni

  # Ensure extension_dir
  if ($lines -notmatch '^(?i)extension_dir=') {
    Add-Content -Path $PhpIni -Value 'extension_dir=ext'
  }

  $required = @('mbstring','tokenizer','xml','ctype','json','bcmath','fileinfo','zip','pdo_sqlite','sqlite3')
  foreach ($ext in $required) {
    if ($lines -match ("^;?\s*extension=$ext$")) {
      # already present (commented or not) → ensure uncommented
      $lines = $lines -replace ("^;\s*extension=$ext$"), ("extension=$ext")
    } elseif ($lines -notmatch ("^extension=$ext$")) {
      Add-Content -Path $PhpIni -Value ("extension=$ext")
    }
  }

  # Write back updated lines if changed
  $lines | Set-Content -Path $PhpIni -Encoding UTF8

  Write-Host "Verifying PHP modules..."
  php -m | ForEach-Object { $_ }
}

function Configure-LaravelSqlite {
  Push-Location "$(Join-Path $PSScriptRoot '.')"
  try {
    if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env' -Force }
    $env = Get-Content .env
    $hasConn = $false; $hasDb = $false
    $newEnv = @()
    foreach ($l in $env) {
      if ($l -match '^DB_CONNECTION=') { $newEnv += 'DB_CONNECTION=sqlite'; $hasConn=$true }
      elseif ($l -match '^DB_DATABASE=') { $newEnv += 'DB_DATABASE=database/database.sqlite'; $hasDb=$true }
      else { $newEnv += $l }
    }
    if (-not $hasConn) { $newEnv += 'DB_CONNECTION=sqlite' }
    if (-not $hasDb) { $newEnv += 'DB_DATABASE=database/database.sqlite' }
    $newEnv | Set-Content .env -Encoding UTF8

    if (-not (Test-Path 'database')) { New-Item -ItemType Directory -Path 'database' | Out-Null }
    if (-not (Test-Path 'database/database.sqlite')) { New-Item -ItemType File -Path 'database/database.sqlite' | Out-Null }

    Write-Host "Running migrations (ignore if first run fails)..."
    php artisan config:clear | Out-Null
    php artisan cache:clear | Out-Null
    try { php artisan migrate --force } catch { Write-Warning "Migrations failed: $($_.Exception.Message)" }

    Write-Host "Starting Laravel dev server at http://localhost:8000"
    Start-Process powershell -ArgumentList '-NoExit','-Command',"cd '$PWD'; php artisan serve"
  }
  finally {
    Pop-Location
  }
}

# Main
try {
  $ini = Get-PhpIniPath
  Ensure-PHPExtensions -PhpIni $ini
  Push-Location (Join-Path $PSScriptRoot '..')
  Push-Location 'crysgarage-backend-fresh'
  try { Configure-LaravelSqlite } finally { Pop-Location; Pop-Location }
  Write-Host "Done. Laravel should be running on http://localhost:8000"
} catch {
  Write-Error $_
  exit 1
}


