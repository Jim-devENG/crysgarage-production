// This script will fix the most critical TypeScript errors
// Run this with: npx tsx fix_typescript_errors.ts

import fs from 'fs';
import path from 'path';

// Files to fix with their specific issues
const filesToFix = [
  {
    file: 'crysgarage-frontend/App.tsx',
    fixes: [
      // Remove unused imports
      { from: 'import { audioAPI, authAPI, creditsAPI, API_BASE_URL } from \'./services/api\';', to: 'import { authAPI } from \'./services/api\';' },
      { from: 'import { useMasteringControls } from \'./hooks/useMasteringControls\';', to: '' },
      { from: 'import { APIIntegrationLayer } from \'./components/APIIntegrationLayer\';', to: '' },
      { from: 'import { MobileOptimizations } from \'./components/MobileOptimizations\';', to: '' },
      { from: 'import { AfrocentricDesignSystem } from \'./components/AfrocentricDesignSystem\';', to: '' },
      { from: 'import { Button } from \'./components/ui/button\';', to: '' },
      { from: 'import { Badge } from \'./components/ui/badge\';', to: '' },
      { from: 'import { Progress } from \'./components/ui/progress\';', to: '' },
      { from: 'import { ArrowLeft, Settings, Smartphone, Palette } from \'lucide-react\';', to: '' },
      { from: 'import { AutoAuthFix } from \'./components/AutoAuthFix\';', to: '' },
    ]
  },
  {
    file: 'crysgarage-frontend/components/ProcessingPage.tsx',
    fixes: [
      { from: 'import { Download, Play } from \'lucide-react\';', to: 'import { Download } from \'lucide-react\';' },
      // Fix unused parameters
      { from: 'export function ProcessingPage({ progress, isProcessing, onComplete, onError }: ProcessingPageProps) {', to: 'export function ProcessingPage({ progress, isProcessing }: ProcessingPageProps) {' },
    ]
  },
  {
    file: 'crysgarage-frontend/components/ProfessionalTierDashboard.tsx',
    fixes: [
      { from: 'import { Button } from "./ui/button";', to: '' },
      { from: 'import { Headphones,', to: 'import {' },
    ]
  },
  {
    file: 'crysgarage-frontend/components/ProfileEditModal.tsx',
    fixes: [
      { from: 'import { Calendar,', to: 'import {' },
      { from: 'import { Upload,', to: 'import {' },
    ]
  },
  {
    file: 'crysgarage-frontend/components/SignalFlow.tsx',
    fixes: [
      { from: '{modules.map((module, index) => (', to: '{modules.map((module) => (' },
    ]
  },
  {
    file: 'crysgarage-frontend/components/UserProfile.tsx',
    fixes: [
      { from: 'import { Download,', to: 'import {' },
      { from: 'import { Clock,', to: 'import {' },
      { from: 'import { FileAudio,', to: 'import {' },
    ]
  },
  {
    file: 'crysgarage-frontend/contexts/AppContext.tsx',
    fixes: [
      { from: 'import { authAPI, userAPI, audioAPI, creditsAPI, User, MasteringSession, ProcessingConfiguration } from \'../services/api\';', to: 'import { authAPI, audioAPI, creditsAPI, User, MasteringSession, ProcessingConfiguration } from \'../services/api\';' },
      // Fix unused parameter
      { from: 'const startMastering = async (sessionId: string, genre: string, config: ProcessingConfiguration) => {', to: 'const startMastering = async (sessionId: string, genre: string) => {' },
    ]
  },
  {
    file: 'crysgarage-frontend/hooks/useAddons.ts',
    fixes: [
      { from: 'return addons.filter(addon => {', to: 'return addons.filter(() => {' },
    ]
  },
];

async function fixFile(filePath: string, fixes: Array<{from: string, to: string}>) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    for (const fix of fixes) {
      if (fix.to === '') {
        // Remove the line completely
        content = content.replace(fix.from + '\n', '');
      } else {
        // Replace the line
        content = content.replace(fix.from, fix.to);
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error);
  }
}

async function main() {
  console.log('🔧 Fixing TypeScript errors...');
  
  for (const fileFix of filesToFix) {
    await fixFile(fileFix.file, fileFix.fixes);
  }
  
  console.log('✅ TypeScript fixes completed!');
  console.log('Now run: npm run build');
}

main().catch(console.error); 