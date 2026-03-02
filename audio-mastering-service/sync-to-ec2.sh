#!/bin/bash
# Local script to sync only necessary files to EC2
# Run this from Git Bash on your local PC

KEY_PATH="/c/Users/MIKENZY/Downloads/Crysgarage.pem"
REMOTE_USER="ubuntu"
REMOTE_IP="13.61.34.44"
REMOTE_DEST="/var/www/mastering"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

MODE="full"
if [ "${1:-}" = "--modified" ]; then
    MODE="modified"
fi

echo "🧹 Cleaning up remote directory (optional, but recommended)..."
ssh -i "$KEY_PATH" $REMOTE_USER@$REMOTE_IP "sudo mkdir -p $REMOTE_DEST && sudo chown -R $REMOTE_USER:$REMOTE_USER $REMOTE_DEST"

echo "🚀 Syncing code to EC2 (excluding heavy folders)..."

if [ "$MODE" = "modified" ]; then
    if ! command -v git >/dev/null 2>&1; then
        echo "❌ git not found. Install git or run without --modified."
        exit 1
    fi

    echo "🔎 Detecting modified files via git status..."
    MODIFIED_FILES=$(git status --porcelain | awk '{print $2}')

    if [ -z "$MODIFIED_FILES" ]; then
        echo "✅ No modified files detected. Nothing to sync."
        exit 0
    fi

    echo "📤 Uploading modified files only..."
    echo "$MODIFIED_FILES" | while IFS= read -r rel_path; do
        [ -z "$rel_path" ] && continue

        if [ ! -f "$rel_path" ]; then
            continue
        fi

        remote_dir="$REMOTE_DEST/$(dirname "$rel_path")"
        ssh -i "$KEY_PATH" $REMOTE_USER@$REMOTE_IP "sudo mkdir -p '$remote_dir' && sudo chown -R $REMOTE_USER:$REMOTE_USER '$remote_dir'"
        scp -i "$KEY_PATH" "$rel_path" "$REMOTE_USER@$REMOTE_IP:$REMOTE_DEST/$rel_path"
    done

    echo "✅ Modified-files sync complete!"
    exit 0
fi

# rsync is much better for this as it can exclude folders
# If you don't have rsync in Git Bash, we'll use a zip approach
if command -v rsync >/dev/null 2>&1; then
    rsync -avz -e "ssh -i $KEY_PATH" \
        --exclude 'venv/' \
        --exclude '.venv/' \
        --exclude 'venv312/' \
        --exclude '__pycache__/' \
        --exclude 'logs/' \
        --exclude 'storage/' \
        --exclude '*.wav' \
        --exclude '*.mp3' \
        --exclude '.git/' \
        --exclude 'build/' \
        ./ "$REMOTE_USER@$REMOTE_IP:$REMOTE_DEST/"
else
    echo "⚠️ rsync not found. Using a more selective scp approach..."
    
    # Uploading core files and directories individually to avoid the heavy ones
    scp -i "$KEY_PATH" main.py unified_backend.py requirements.txt .env.aws setup-ec2.sh "$REMOTE_USER@$REMOTE_IP:$REMOTE_DEST/"
    scp -i "$KEY_PATH" -r services/ models/ routes/ config/ utils/ "$REMOTE_USER@$REMOTE_IP:$REMOTE_DEST/"
fi

echo "✅ Sync complete!"
