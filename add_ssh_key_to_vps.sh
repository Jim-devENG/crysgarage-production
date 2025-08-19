#!/bin/bash

# Script to add GitHub Actions SSH public key to VPS
# Run this on your VPS as root

echo "Adding GitHub Actions SSH public key to VPS..."

# The public key content
PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDoxZeGOKk4CoW7qOh0//0Ejpi7vwHFpq2phs7UTYPEfLE6bl4H9p9SfcDc150V6xTM8MdVnNLtohhLYb0bKPD65QeKEij+DpB4wm3GsU9h3RHuRs5X8RjH6ZLH6o/pRMRDc6xTpObQ8QEf44JEu/EyaPA/VDethIQqQxDDAeubdJrzXSa+44NyW7rDUkE15plU0JQyuu5B6JgS6ELQXV97Fm2jkpF65lTUPt72FeV+aXU1Fya0KqL5olWQlY8/KMV7FV1I8CF5tIhlmateFa2OvdO/jp64JWTTJBiPWY9GQdmZM38KM/ctKg6u1PVRnN4LGb7AnfHfE09juB3/Lnh7dmxXcyB+HpM0Hny/0kOtYDOYjNenLw+g1x1aottYpzby2L5pwLRJ4HZfIY/5MPIIMXr7g0G9hiDQ6NHOPzjark8C2233vdTpGGOQOvF7L3AfafbdSkFXdQnOe2PUeS7mr29zVpn4Gy8O8ax8EoTqlm2P4z593ilL12ER1CGYoqPTUB/k7Pz/UT2CGinb9CK4jpz8rZ2Z1KENJDbkauprjU+QC0Tdjp+uidJkZG5N7rrTllAm2tqxAEYOp5BPRZX056nsjajrSJLjH+doPyyjgueynph/voxq85z51bri25RwkRENhfy2TCXKxqt/DavRNAFqe+IEl+8CcDSPZ2Sp+Q== github-actions@crysgarage.studio"

# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh

# Add the public key to authorized_keys
echo "$PUBLIC_KEY" >> ~/.ssh/authorized_keys

# Set proper permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

echo "✅ SSH public key added successfully!"
echo "🔑 Public key added to ~/.ssh/authorized_keys"
echo "📋 You can now use this key for GitHub Actions deployment"
