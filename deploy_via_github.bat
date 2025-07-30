@echo off
echo 🚀 Crys Garage GitHub Deployment
echo ================================

echo.
echo 📤 Pushing latest changes to GitHub...
git add .
git commit -m "Auto-deploy: $(date)"
git push origin master

echo.
echo 🔧 Setting up VPS deployment...
echo Please run these commands on your VPS (209.74.80.162):
echo.
echo 1. SSH into VPS:
echo    ssh root@209.74.80.162
echo.
echo 2. Set up GitHub deployment:
echo    mkdir -p /var/www/crysgarage-deploy
echo    cd /var/www/crysgarage-deploy
echo    git clone https://github.com/Jim-devENG/Crysgarage.git .
echo    chmod +x deploy.sh
echo    ./deploy.sh
echo.
echo 3. Or run the setup script:
echo    curl -s https://raw.githubusercontent.com/Jim-devENG/Crysgarage/master/setup_github_deployment.sh | bash
echo.
echo ✅ GitHub deployment ready!
echo 🌐 Live site: https://crysgarage.studio
echo.
pause 