# Script to add the new SSH public key to VPS
# This will allow the deployment script to connect

param(
    [string]$VPS_HOST = "209.74.80.162",
    [string]$VPS_USER = "root"
)

Write-Host "Adding SSH public key to VPS..." -ForegroundColor Cyan

# Get the public key
$publicKey = Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub"

Write-Host "Public key: $publicKey" -ForegroundColor Green

# Instructions for manual addition
Write-Host "`nTo add this key to your VPS, you need to:" -ForegroundColor Yellow
Write-Host "1. Connect to your VPS using your current method" -ForegroundColor White
Write-Host "2. Run these commands on your VPS:" -ForegroundColor White
Write-Host ""
Write-Host "mkdir -p ~/.ssh" -ForegroundColor Cyan
Write-Host "chmod 700 ~/.ssh" -ForegroundColor Cyan
Write-Host "echo '$publicKey' >> ~/.ssh/authorized_keys" -ForegroundColor Cyan
Write-Host "chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Cyan
Write-Host ""
Write-Host "Once you've added the key, you can run: .\deploy_local.ps1" -ForegroundColor Green

# Alternative: Try to add automatically if password auth is available
Write-Host "`nAlternative: If you have password authentication enabled, I can try to add it automatically." -ForegroundColor Yellow
$tryAutomatic = Read-Host "Do you want me to try adding the key automatically? (y/N)"

if ($tryAutomatic -eq "y" -or $tryAutomatic -eq "Y") {
    Write-Host "Attempting to add key automatically..." -ForegroundColor Cyan
    
    # Create a temporary script for the VPS
    $tempScript = @"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo '$publicKey' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo 'SSH key added successfully!'
"@
    
    # Save to temp file and copy to VPS
    $tempFile = "temp_add_key.sh"
    $tempScript | Out-File -FilePath $tempFile -Encoding UTF8
    
    try {
        # Try to copy and execute
        scp $tempFile "${VPS_USER}@${VPS_HOST}:/tmp/add_key.sh"
        ssh "${VPS_USER}@${VPS_HOST}" "chmod +x /tmp/add_key.sh && /tmp/add_key.sh && rm /tmp/add_key.sh"
        Write-Host "SSH key added successfully!" -ForegroundColor Green
        
        # Clean up
        Remove-Item $tempFile
        
        Write-Host "`nYou can now run: .\deploy_local.ps1" -ForegroundColor Green
    } catch {
        Write-Host "Automatic addition failed. Please add manually using the commands above." -ForegroundColor Red
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
}


