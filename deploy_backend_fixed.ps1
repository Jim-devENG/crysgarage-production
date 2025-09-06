# Deploy Laravel Backend to Server
Write-Host "🚀 Deploying Laravel Backend to Server..." -ForegroundColor Green

# Configuration
$SERVER_IP = "209.74.80.162"
$SERVER_USER = "root"
$BACKEND_DIR = "crysgarage-backend"
$REMOTE_DIR = "/var/www/html"

# Step 1: Create backend directory structure
Write-Host "📁 Creating backend directory structure..." -ForegroundColor Yellow
ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${REMOTE_DIR}/api"
ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${REMOTE_DIR}/storage"
ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${REMOTE_DIR}/bootstrap/cache"

# Step 2: Copy Laravel core files
Write-Host "📋 Copying Laravel core files..." -ForegroundColor Yellow
scp -r "${BACKEND_DIR}/app" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"
scp -r "${BACKEND_DIR}/bootstrap" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"
scp -r "${BACKEND_DIR}/config" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"
scp -r "${BACKEND_DIR}/database" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"
scp -r "${BACKEND_DIR}/lang" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"
scp -r "${BACKEND_DIR}/resources" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"
scp -r "${BACKEND_DIR}/routes" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"
scp -r "${BACKEND_DIR}/storage" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"
scp -r "${BACKEND_DIR}/tests" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"
scp -r "${BACKEND_DIR}/vendor" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"

# Step 3: Copy essential files
Write-Host "📄 Copying essential files..." -ForegroundColor Yellow
scp "${BACKEND_DIR}/artisan" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"
scp "${BACKEND_DIR}/composer.json" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"
scp "${BACKEND_DIR}/composer.lock" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"

# Step 4: Copy environment file
Write-Host "⚙️ Copying environment configuration..." -ForegroundColor Yellow
scp "${BACKEND_DIR}/.env" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/api/"

# Step 5: Set proper permissions
Write-Host "🔐 Setting proper permissions..." -ForegroundColor Yellow
ssh "${SERVER_USER}@${SERVER_IP}" "chown -R nginx:nginx ${REMOTE_DIR}/api"
ssh "${SERVER_USER}@${SERVER_IP}" "chmod -R 755 ${REMOTE_DIR}/api"
ssh "${SERVER_USER}@${SERVER_IP}" "chmod -R 775 ${REMOTE_DIR}/api/storage"
ssh "${SERVER_USER}@${SERVER_IP}" "chmod -R 775 ${REMOTE_DIR}/api/bootstrap/cache"

# Step 6: Clear Laravel caches
Write-Host "🧹 Clearing Laravel caches..." -ForegroundColor Yellow
ssh "${SERVER_USER}@${SERVER_IP}" "cd ${REMOTE_DIR}/api; php artisan config:clear"
ssh "${SERVER_USER}@${SERVER_IP}" "cd ${REMOTE_DIR}/api; php artisan route:clear"
ssh "${SERVER_USER}@${SERVER_IP}" "cd ${REMOTE_DIR}/api; php artisan cache:clear"

# Step 7: Generate application key if needed
Write-Host "🔑 Generating application key..." -ForegroundColor Yellow
ssh "${SERVER_USER}@${SERVER_IP}" "cd ${REMOTE_DIR}/api; php artisan key:generate --force"

Write-Host "✅ Laravel Backend deployed successfully!" -ForegroundColor Green
Write-Host "🌐 Backend available at: https://crysgarage.studio/api/" -ForegroundColor Cyan
Write-Host "🔐 Authentication routes should now work!" -ForegroundColor Cyan
