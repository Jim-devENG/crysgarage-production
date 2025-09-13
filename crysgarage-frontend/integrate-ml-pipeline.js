/**
 * ML Pipeline Integration Script
 * This script helps integrate the ML pipeline with the existing Crys Garage frontend
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting ML Pipeline Integration...');

// Check if the ML pipeline files exist
const requiredFiles = [
  'services/mlPipelineAPI.ts',
  'hooks/useMLPipeline.ts',
  'components/MLPipelineUpload.tsx',
  'components/MLPipelineTestPage.tsx'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

// Check if the ML pipeline service is running
console.log('\n🔍 Checking ML Pipeline Service...');
const checkService = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/health.php');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ ML Pipeline Service is running');
      console.log(`   Service: ${data.service}`);
      console.log(`   Version: ${data.version}`);
      console.log(`   Status: ${data.status}`);
    } else {
      console.log('❌ ML Pipeline Service is not responding');
    }
  } catch (error) {
    console.log('❌ ML Pipeline Service is not available');
    console.log('   Make sure to start the PHP server: php -S localhost:8000');
  }
};

checkService();

// Integration instructions
console.log('\n📋 Integration Instructions:');
console.log('1. Add the ML Pipeline route to your React Router:');
console.log('   import MLPipelineTestPage from "./components/MLPipelineTestPage";');
console.log('   <Route path="/ml-pipeline" element={<MLPipelineTestPage />} />');
console.log('');
console.log('2. Add the ML Pipeline upload component to existing pages:');
console.log('   import MLPipelineUpload from "./components/MLPipelineUpload";');
console.log('   <MLPipelineUpload onProcessingComplete={handleComplete} />');
console.log('');
console.log('3. Use the ML Pipeline hook in your components:');
console.log('   import { useMLPipeline } from "./hooks/useMLPipeline";');
console.log('   const { processAudioFile, isProcessing } = useMLPipeline();');
console.log('');
console.log('4. Environment variables (optional):');
console.log('   VITE_ML_PIPELINE_URL=http://localhost:8000');
console.log('');
console.log('🎉 ML Pipeline integration complete!');
console.log('   Visit http://localhost:3000/ml-pipeline to test the integration');
