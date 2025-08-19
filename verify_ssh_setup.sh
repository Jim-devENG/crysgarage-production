#!/bin/bash

# Script to verify SSH key setup on VPS
# Run this on your VPS as root

echo "🔍 Verifying SSH key setup on VPS..."

# Check if .ssh directory exists
if [ -d ~/.ssh ]; then
    echo "✅ ~/.ssh directory exists"
else
    echo "❌ ~/.ssh directory does not exist"
    exit 1
fi

# Check if authorized_keys exists
if [ -f ~/.ssh/authorized_keys ]; then
    echo "✅ ~/.ssh/authorized_keys exists"
    echo "📊 Number of authorized keys: $(wc -l < ~/.ssh/authorized_keys)"
else
    echo "❌ ~/.ssh/authorized_keys does not exist"
    exit 1
fi

# Check permissions
SSH_PERMS=$(stat -c "%a" ~/.ssh)
AUTH_PERMS=$(stat -c "%a" ~/.ssh/authorized_keys)

echo "📁 ~/.ssh permissions: $SSH_PERMS (should be 700)"
echo "🔑 ~/.ssh/authorized_keys permissions: $AUTH_PERMS (should be 600)"

if [ "$SSH_PERMS" = "700" ]; then
    echo "✅ SSH directory permissions are correct"
else
    echo "⚠️ SSH directory permissions should be 700"
fi

if [ "$AUTH_PERMS" = "600" ]; then
    echo "✅ Authorized keys permissions are correct"
else
    echo "⚠️ Authorized keys permissions should be 600"
fi

# Check for GitHub Actions key
if grep -q "github-actions@crysgarage.studio" ~/.ssh/authorized_keys; then
    echo "✅ GitHub Actions SSH key found in authorized_keys"
else
    echo "❌ GitHub Actions SSH key NOT found in authorized_keys"
    echo "🔧 Adding GitHub Actions key..."
    
    # Add the GitHub Actions public key
    echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDoxZeGOKk4CoW7qOh0//0Ejpi7vwHFpq2phs7UTYPEfLE6bl4H9p9SfcDc150V6xTM8MdVnNLtohhLYb0bKPD65QeKEij+DpB4wm3GsU9h3RHuRs5X8RjH6ZLH6o/pRMRDc6xTpObQ8QEf44JEu/EyaPA/VDethIQqQxDDAeubdJrzXSa+44NyW7rDUkE15plU0JQyuu5B6JgS6ELQXV97Fm2jkpF65lTUPt72FeV+aXU1Fya0KqL5olWQlY8/KMV7FV1I8CF5tIhlmateFa2OvdO/jp64JWTTJBiPWY9GQdmZM38KM/ctKg6u1PVRnN4LGb7AnfHfE09juB3/Lnh7dmxXcyB+HpM0Hny/0kOtYDOYjNenLw+g1x1aottYpzby2L5pwLRJ4HZfIY/5MPIIMXr7g0G9hiDQ6NHOPzjark8C2233vdTpGGOQOvF7L3AfafbdSkFXdQnOe2PUeS7mr29zVpn4Gy8O8ax8EoTqlm2P4z593ilL12ER1CGYoqPTUB/k7Pz/UT2CGinb9CK4jpz8rZ2Z1KENJDbkauprjU+QC0Tdjp+uidJkZG5N7rrTllAm2tqxAEYOp5BPRZX056nsjajrSJLjH+doPyyjgueynph/voxq85z51bri25RwkRENhfy2TCXKxqt/DavRNAFqe+IEl+8CcDSPZ2Sp+Q== github-actions@crysgarage.studio" >> ~/.ssh/authorized_keys
    
    # Fix permissions
    chmod 700 ~/.ssh
    chmod 600 ~/.ssh/authorized_keys
    
    echo "✅ GitHub Actions SSH key added successfully"
fi

echo ""
echo "🎯 SSH Setup Verification Complete!"
echo "📋 Next steps:"
echo "1. Make sure the private key is added to GitHub Secrets as 'VPS_SSH_KEY'"
echo "2. Ensure VPS_HOST and VPS_USERNAME secrets are set correctly"
echo "3. Trigger a new deployment to test the connection"
