#!/bin/bash

echo "🔥 Switching to Firebase Authentication..."

# Backup current files
echo "📦 Creating backups..."
cp App.tsx App.backup.tsx
cp components/Header.tsx components/Header.backup.tsx

# Switch to Firebase versions
echo "🔄 Switching to Firebase versions..."
cp AppFirebase.tsx App.tsx
cp components/HeaderFirebase.tsx components/Header.tsx

echo "✅ Successfully switched to Firebase Authentication!"
echo ""
echo "🚀 Next steps:"
echo "1. Make sure Google Authentication is enabled in Firebase Console"
echo "2. Add 'localhost' to authorized domains in Firebase"
echo "3. Run 'npm run dev' to test"
echo ""
echo "📋 To revert back:"
echo "cp App.backup.tsx App.tsx"
echo "cp components/Header.backup.tsx components/Header.tsx"

