@echo off
echo Adding crysgarage host to SSH config...
echo. >> "%USERPROFILE%\.ssh\config"
echo Host crysgarage >> "%USERPROFILE%\.ssh\config"
echo     HostName 209.74.80.162 >> "%USERPROFILE%\.ssh\config"
echo     User root >> "%USERPROFILE%\.ssh\config"
echo     IdentityFile ~/.ssh/id_rsa >> "%USERPROFILE%\.ssh\config"
echo     ServerAliveInterval 60 >> "%USERPROFILE%\.ssh\config"
echo     ServerAliveCountMax 3 >> "%USERPROFILE%\.ssh\config"
echo SSH config updated!
echo.
echo Testing connection...
ssh crysgarage "echo SSH key authentication successful!"
echo.
pause 