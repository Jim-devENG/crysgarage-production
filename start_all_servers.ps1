# Crys Garage - Start All Servers Script
# This script starts all the necessary servers for the Crys Garage application

Write-Host "🎵 Starting Crys Garage Servers..." -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to wait for a server to be ready
function Wait-ForServer {
    param([int]$Port, [string]$ServerName)
    Write-Host "⏳ Waiting for $ServerName to be ready on port $Port..." -ForegroundColor Cyan
    $attempts = 0
    $maxAttempts = 30
    
    while ($attempts -lt $maxAttempts) {
        if (Test-Port -Port $Port) {
            Write-Host "✅ $ServerName is ready on port $Port" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
        $attempts++
        Write-Host "   Attempt $attempts/$maxAttempts..." -ForegroundColor Gray
    }
    
    Write-Host "❌ $ServerName failed to start on port $Port" -ForegroundColor Red
    return $false
}

# Kill any existing processes on the ports we need
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Blue

$ports = @(3000, 5173, 8080, 3001) # Common ports for React, Vite, Ruby, etc.
foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    foreach ($processId in $processes) {
        try {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Write-Host "   Killed process on port $port" -ForegroundColor Gray
        }
        catch {
            # Process might already be dead
        }
    }
}

# Start Frontend Server (Vite)
Write-Host "🚀 Starting Frontend Server (Vite)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\crysgarage-frontend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 3

# Check if Ruby backend exists and start it
$rubyBackendPath = Join-Path $PWD "crysgarage-ruby"
if (Test-Path $rubyBackendPath) {
    Write-Host "💎 Starting Ruby Backend Server..." -ForegroundColor Green
    
    # Check if it's a Rails app
    if (Test-Path (Join-Path $rubyBackendPath "Gemfile")) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rubyBackendPath'; bundle install; rails server -p 3000" -WindowStyle Normal
    }
    # Check if it's a Sinatra app
    elseif (Test-Path (Join-Path $rubyBackendPath "app.rb")) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rubyBackendPath'; ruby app.rb" -WindowStyle Normal
    }
    # Check if it's a Rack app
    elseif (Test-Path (Join-Path $rubyBackendPath "config.ru")) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rubyBackendPath'; rackup -p 3000" -WindowStyle Normal
    }
    else {
        Write-Host "⚠️  Ruby backend found but no recognized framework detected" -ForegroundColor Yellow
    }
    Start-Sleep -Seconds 3
}

# Check if Node.js backend exists and start it
$nodeBackendPath = Join-Path $PWD "crysgarage-backend"
if (Test-Path $nodeBackendPath) {
    Write-Host "🟢 Starting Node.js Backend Server..." -ForegroundColor Green
    
    if (Test-Path (Join-Path $nodeBackendPath "package.json")) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$nodeBackendPath'; npm install; npm start" -WindowStyle Normal
    }
    elseif (Test-Path (Join-Path $nodeBackendPath "server.js")) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$nodeBackendPath'; node server.js" -WindowStyle Normal
    }
    else {
        Write-Host "⚠️  Node.js backend found but no package.json or server.js detected" -ForegroundColor Yellow
    }
    Start-Sleep -Seconds 3
}

# Check if PHP backend exists and start it
$phpBackendPath = Join-Path $PWD "crysgarage-php"
if (Test-Path $phpBackendPath) {
    Write-Host "🐘 Starting PHP Backend Server..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$phpBackendPath'; php -S localhost:8000" -WindowStyle Normal
    Start-Sleep -Seconds 3
}

# Wait for servers to be ready
Write-Host "⏳ Waiting for servers to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Check server status
Write-Host "🔍 Checking server status..." -ForegroundColor Blue

$servers = @(
    @{Port = 5173; Name = "Frontend (Vite)"; URL = "http://localhost:5173"},
    @{Port = 3000; Name = "Ruby Backend"; URL = "http://localhost:3000"},
    @{Port = 8000; Name = "PHP Backend"; URL = "http://localhost:8000"},
    @{Port = 3001; Name = "Node.js Backend"; URL = "http://localhost:3001"}
)

foreach ($server in $servers) {
    if (Test-Port -Port $server.Port) {
        Write-Host "✅ $($server.Name) is running at $($server.URL)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($server.Name) is not running" -ForegroundColor Red
    }
}

# Open the main application in browser
Write-Host "🌐 Opening application in browser..." -ForegroundColor Blue
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "🎉 All servers started!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Ruby Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "PHP Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Node.js Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Keep the script running and monitor servers
try {
    while ($true) {
        Start-Sleep -Seconds 10
        Write-Host "🔄 Server status check..." -ForegroundColor Gray
        
        foreach ($server in $servers) {
            if (Test-Port -Port $server.Port) {
                Write-Host "   ✅ $($server.Name) - OK" -ForegroundColor Green
            } else {
                Write-Host "   ❌ $($server.Name) - DOWN" -ForegroundColor Red
            }
        }
        Write-Host ""
    }
}
catch {
    Write-Host "Stopping servers..." -ForegroundColor Red
    # Kill all related processes
    Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*ruby*" -or $_.ProcessName -like "*php*"} | Stop-Process -Force
    Write-Host "✅ All servers stopped" -ForegroundColor Green
}
