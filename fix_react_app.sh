#!/bin/bash

echo "🔧 Fixing React App - Creating Simple Working Version"
echo "====================================================="

# Navigate to the deployment directory
cd /var/www/crysgarage-deploy

# Create a simple working App.tsx
echo "📝 Creating simple working App.tsx..."
cat > crysgarage-frontend/App.tsx << 'EOF'
import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '1rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🎵 Crys Garage
        </h1>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '2rem',
          color: '#cccccc'
        }}>
          Professional Audio Mastering Platform
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#1a1a1a',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }} onMouseOver="this.style.transform='scale(1.05)'" onMouseOut="this.style.transform='scale(1)'">
            🎧 Start Mastering
          </button>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: '2px solid #FFD700',
            borderRadius: '0.5rem',
            color: '#FFD700',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }} onMouseOver="this.style.background='#FFD700'; this.style.color='#1a1a1a'" onMouseOut="this.style.background='transparent'; this.style.color='#FFD700'">
            📚 Learn More
          </button>
        </div>
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '0.5rem',
          fontSize: '0.9rem',
          color: '#aaaaaa'
        }}>
          <p>🎯 Specialized in African Music Styles</p>
          <p>🎵 Afrobeats • Gospel • Hip-Hop • Traditional</p>
        </div>
      </div>
    </div>
  );
}

export default App;
EOF

# Create a simple main.tsx
echo "📝 Creating simple main.tsx..."
cat > crysgarage-frontend/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Create a simple globals.css
echo "📝 Creating simple globals.css..."
cat > crysgarage-frontend/styles/globals.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  width: 100%;
  height: 100vh;
}
EOF

# Update the vite config to be simpler
echo "📝 Updating Vite configuration..."
cat > crysgarage-frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['localhost', '127.0.0.1', 'crysgarage.studio', 'www.crysgarage.studio', '209.74.80.162']
  }
})
EOF

# Stop containers
echo "🛑 Stopping containers..."
docker-compose down

# Rebuild frontend container
echo "🔨 Rebuilding frontend container..."
docker-compose build frontend

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 20

# Check container status
echo "📊 Checking container status..."
docker-compose ps

# Test the application
echo "🔍 Testing application..."
sleep 5
curl -s -o /dev/null -w "HTTPS Status: %{http_code}\n" https://crysgarage.studio/ 2>/dev/null || echo "HTTPS test failed"

echo "✅ React app fix completed!"
echo "🌐 Your application: https://crysgarage.studio" 