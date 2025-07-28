@echo off
echo ========================================
echo Crys Garage - Setup SSH Keys
========================================
echo Server: 209.74.80.162 (crysgarage.studio)
echo.

echo Step 1: Checking if SSH key already exists...
if exist "%USERPROFILE%\.ssh\id_rsa" (
    echo ✅ SSH key already exists
) else (
    echo Step 2: Generating SSH key...
    ssh-keygen -t rsa -b 4096 -f "%USERPROFILE%\.ssh\id_rsa" -N ""
    echo ✅ SSH key generated
)
echo.

echo Step 3: Copying public key to server...
type "%USERPROFILE%\.ssh\id_rsa.pub" | ssh root@209.74.80.162 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh"
echo ✅ Public key copied to server
echo.

echo Step 4: Testing passwordless connection...
ssh -o ConnectTimeout=10 root@209.74.80.162 "echo 'SSH key authentication successful!'"
echo.

echo Step 5: Setting up SSH config for easier access...
if not exist "%USERPROFILE%\.ssh\config" (
    echo Host crysgarage >> "%USERPROFILE%\.ssh\config"
    echo     HostName 209.74.80.162 >> "%USERPROFILE%\.ssh\config"
    echo     User root >> "%USERPROFILE%\.ssh\config"
    echo     IdentityFile ~/.ssh/id_rsa >> "%USERPROFILE%\.ssh\config"
    echo     ServerAliveInterval 60 >> "%USERPROFILE%\.ssh\config"
    echo     ServerAliveCountMax 3 >> "%USERPROFILE%\.ssh\config"
    echo ✅ SSH config created
) else (
    echo ✅ SSH config already exists
)
echo.

echo Step 6: Testing connection with config...
ssh crysgarage "echo 'Connection with config successful!'"
echo.

echo ========================================
echo SSH key setup complete!
echo ========================================
echo 🔑 You can now use: ssh crysgarage
echo 📝 All deployment scripts will work without passwords
echo 🌐 Test deployment: .\quick_deploy.bat
echo.
pause 