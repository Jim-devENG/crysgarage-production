# Setup Passwordless SSH Access
Write-Host "Setting up passwordless SSH access..." -ForegroundColor Green

# Use the existing github_actions_key
$sshKeyPath = "github_actions_key"
$sshKeyPubPath = "github_actions_key.pub"

# Read the public key
$publicKey = Get-Content $sshKeyPubPath -Raw

Write-Host "Copying SSH key to server..." -ForegroundColor Yellow

# Copy the public key to the server's authorized_keys
ssh -o StrictHostKeyChecking=no root@209.74.80.162 "mkdir -p ~/.ssh && echo '$publicKey' > ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh"

Write-Host "Testing passwordless SSH..." -ForegroundColor Yellow

# Test passwordless SSH
ssh -i $sshKeyPath -o StrictHostKeyChecking=no root@209.74.80.162 "echo 'Passwordless SSH is working!'"

Write-Host "Passwordless SSH setup complete!" -ForegroundColor Green


