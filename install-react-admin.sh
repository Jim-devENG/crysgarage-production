#!/bin/bash

# React Admin Installation Script for Crys Garage
echo "🚀 Installing React Admin for Crys Garage Admin Dashboard..."

# Install core React Admin dependencies
npm install react-admin@4.15.0 ra-core@4.15.0 ra-data-simple-rest@4.15.0 ra-ui-materialui@4.15.0

# Install Material-UI dependencies
npm install @mui/material@5.11.0 @mui/icons-material@5.11.0 @emotion/react@11.10.5 @emotion/styled@11.10.5

# Install additional dependencies
npm install axios@1.3.0 date-fns@2.29.3 lodash@4.17.21

# Install TypeScript dependencies
npm install -D @types/lodash@4.14.191

echo "✅ React Admin installation complete!"
echo ""
echo "📁 Files created:"
echo "  - AdminApp.tsx (Main React Admin app)"
echo "  - DataProvider.ts (Backend integration)"
echo "  - AuthProvider.ts (Authentication)"
echo "  - Dashboard.tsx (Admin dashboard)"
echo "  - Users.tsx (User management)"
echo "  - AudioFiles.tsx (Audio file management)"
echo "  - Credits.tsx (Credit management)"
echo "  - IpTracking.tsx (IP tracking)"
echo "  - StorageStats.tsx (Storage monitoring)"
echo "  - ProcessedFiles.tsx (File processing)"
echo "  - Layout.tsx (Custom layout)"
echo "  - Theme.tsx (Crys Garage theme)"
echo ""
echo "🎯 Next steps:"
echo "  1. Copy the created files to your React project"
echo "  2. Import AdminApp in your main App component"
echo "  3. Configure your backend API endpoints"
echo "  4. Set up authentication if needed"
echo ""
echo "🔗 Access your admin dashboard at: /admin"

