# Crys Garage Development Workflow

## 🎯 Goal: Develop Locally → Test → Deploy to VPS

### Current VPS Configuration:

- **Server**: `209.74.80.162` (SSH: root@209.74.80.162)
- **Path**: `/var/www/crysgarage`
- **Backend Port**: `8000`
- **Frontend Domain**: `crysgarage.studio`
- **API Domain**: `api.crysgarage.studio`

## 🚀 Step 1: Local Development Setup

### 1.1 Test Frontend Locally

```bash
cd crysgarage-frontend
npm install
npm run dev
```

**Test the login modal:**

- Open http://localhost:3000
- Click "Sign In" or "Get Started"
- Try closing with X button
- Try clicking outside modal
- Test demo login: `demo.free@crysgarage.com` / `password`

### 1.2 Test Backend Locally

```bash
cd crysgarage-backend
composer install
php artisan serve --port=8000
```

**Test API endpoints:**

- http://localhost:8000/api/auth/signin
- http://localhost:8000/api/auth/signup

## 🔧 Step 2: Local Issue Identification

### Frontend Issues to Check:

1. **Modal close functionality**
2. **Backdrop click handling**
3. **Demo credentials**
4. **API endpoint configuration**

### Backend Issues to Check:

1. **JSON parsing in AuthController**
2. **Database connection**
3. **CORS configuration**
4. **Middleware setup**

## 📦 Step 3: Automated Deployment Script

### 3.1 Create Deployment Script

```bash
# deploy_to_vps.sh
#!/bin/bash

VPS_HOST="209.74.80.162"
VPS_USER="root"
VPS_PATH="/var/www/crysgarage"

echo "🚀 Deploying Crys Garage to VPS..."

# Build frontend
echo "📦 Building frontend..."
cd crysgarage-frontend
npm run build

# Upload frontend
echo "📤 Uploading frontend..."
scp -r dist/* $VPS_USER@$VPS_HOST:$VPS_PATH/crysgarage-frontend/dist/

# Upload backend
echo "📤 Uploading backend..."
scp -r crysgarage-backend/* $VPS_USER@$VPS_HOST:$VPS_PATH/crysgarage-backend/

# Execute server commands
echo "🔧 Configuring server..."
ssh $VPS_USER@$VPS_HOST << 'EOF'
cd /var/www/crysgarage/crysgarage-backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan db:seed --class=DemoUserSeeder --force
php artisan config:cache
php artisan route:cache
systemctl restart crysgarage-backend
systemctl restart nginx
EOF

echo "✅ Deployment complete!"
```

## 🧪 Step 4: Testing Workflow

### 4.1 Local Testing

```bash
# Test frontend
cd crysgarage-frontend
npm run dev
# Open http://localhost:3000 and test login modal

# Test backend
cd crysgarage-backend
php artisan serve --port=8000
# Test API endpoints with curl or Postman
```

### 4.2 VPS Testing

```bash
# Test live site
curl -I https://crysgarage.studio
curl -I https://api.crysgarage.studio

# Test API endpoints
curl -X POST https://api.crysgarage.studio/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"demo.free@crysgarage.com","password":"password"}'
```

## 🔍 Step 5: Issue Resolution

### Common Issues & Fixes:

#### Frontend Issues:

1. **Modal won't close**

   - Fix: Update `onClose` handlers in `App.tsx`
   - Fix: Add backdrop click in `AuthPages.tsx`

2. **API connection errors**
   - Fix: Update `api.ts` with correct endpoints
   - Fix: Check CORS configuration

#### Backend Issues:

1. **JSON parsing errors**

   - Fix: Update `AuthController.php` with manual JSON parsing
   - Fix: Configure middleware in `bootstrap/app.php`

2. **Database errors**
   - Fix: Run migrations and seeders
   - Fix: Check database permissions

## 📋 Quick Commands

### Local Development:

```bash
# Start frontend
cd crysgarage-frontend && npm run dev

# Start backend
cd crysgarage-backend && php artisan serve --port=8000

# Test both
curl http://localhost:8000/api/auth/signin
```

### VPS Deployment:

```bash
# Quick deploy
./deploy_to_vps.sh

# Manual deploy
cd crysgarage-frontend && npm run build
scp -r dist/* root@209.74.80.162:/var/www/crysgarage/crysgarage-frontend/dist/
```

### VPS Management:

```bash
# Check services
ssh root@209.74.80.162 "systemctl status crysgarage-backend"

# View logs
ssh root@209.74.80.162 "journalctl -u crysgarage-backend -f"

# Restart services
ssh root@209.74.80.162 "systemctl restart crysgarage-backend && systemctl restart nginx"
```

## 🎯 Next Steps

1. **Test locally first** - Identify and fix issues
2. **Create deployment script** - Automate VPS deployment
3. **Set up monitoring** - Track errors and performance
4. **Configure CI/CD** - Automated testing and deployment

This workflow ensures you catch issues locally before deploying to production!
