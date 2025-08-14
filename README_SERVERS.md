# 🎵 Crys Garage - Server Startup Guide

This guide explains how to start all the servers for the Crys Garage audio mastering application.

## 🚀 Quick Start Options

### Option 1: Simple One-Click Start
```bash
# Double-click one of these files:
start.bat          # Windows Batch file
start.ps1          # PowerShell script
```

### Option 2: Using npm Scripts
```bash
# From the root directory:
npm run start-all        # PowerShell script
npm run start-all-bat    # Batch file
npm run start-frontend   # Frontend only
npm run start-backend    # Backend only
npm run dev              # Frontend + Backend concurrently
```

### Option 3: Manual Script Execution
```bash
# PowerShell (recommended):
powershell -ExecutionPolicy Bypass -File start_all_servers.ps1

# Batch file:
start_all_servers.bat
```

## 📋 What Each Script Does

### 🎯 Main Scripts

#### `start_all_servers.ps1` (PowerShell - Recommended)
- ✅ **Smart Process Management**: Kills existing processes on required ports
- ✅ **Auto-Detection**: Automatically detects and starts available backends
- ✅ **Real-time Monitoring**: Continuously monitors server status
- ✅ **Error Handling**: Comprehensive error handling and recovery
- ✅ **Browser Integration**: Automatically opens the application in your browser
- ✅ **Status Reporting**: Shows detailed status of each server

#### `start_all_servers.bat` (Batch File)
- ✅ **Simple Execution**: Easy to run on any Windows system
- ✅ **Port Management**: Cleans up existing processes
- ✅ **Backend Detection**: Detects Ruby, Node.js, and PHP backends
- ✅ **Status Checking**: Verifies server status after startup

### 🎯 Quick Start Scripts

#### `start.bat` / `start.ps1`
- 🚀 **One-click startup**: Simple launcher for the main scripts
- 🎯 **Easy access**: Just double-click to start everything

## 🔧 Server Configuration

### Frontend Server (Vite)
- **Port**: 5173
- **URL**: http://localhost:5173
- **Framework**: React + TypeScript + Vite
- **Features**: Hot reload, TypeScript compilation, CSS processing

### Backend Servers (Auto-Detected)

#### Ruby Backend
- **Port**: 3000
- **URL**: http://localhost:3000
- **Frameworks Supported**:
  - Rails (Gemfile detected)
  - Sinatra (app.rb detected)
  - Rack (config.ru detected)

#### Node.js Backend
- **Port**: 3001
- **URL**: http://localhost:3001
- **Frameworks Supported**:
  - Express (package.json with start script)
  - Custom server (server.js detected)

#### PHP Backend
- **Port**: 8000
- **URL**: http://localhost:8000
- **Framework**: Built-in PHP server

## 🎛️ Advanced Features

### Real-Time Monitoring
The PowerShell script includes real-time monitoring that:
- 🔄 Checks server status every 10 seconds
- 📊 Displays live status updates
- 🚨 Alerts if servers go down
- 📈 Shows uptime information

### Smart Process Management
- 🧹 Automatically kills conflicting processes
- 🔄 Restarts failed servers
- 🛡️ Prevents port conflicts
- ⚡ Optimized startup sequence

### Error Recovery
- 🔧 Automatic dependency installation
- 🚨 Graceful error handling
- 📝 Detailed error logging
- 🔄 Automatic retry mechanisms

## 🎵 Application Features

Once all servers are running, you'll have access to:

### 🎚️ Advanced Tier Dashboard
- **Real-time Audio Processing**: Web Audio API integration
- **Hardware-Style Controls**: Professional studio interface
- **Free Effects**: 3-Band EQ, Compressor, Stereo Widener, Loudness, Limiter
- **Premium Effects**: G-Mastering Compressor, G-Precision EQ, G-Digital Tape, G-Limiter, G-Multi-Band
- **Advanced Features**: G-Surround, G-Tuner, Solfagio Frequency Tuning
- **Real-time Monitoring**: LUFS, Peak, RMS, Correlation meters
- **Export Options**: Multiple formats and sample rates

### 🎛️ Professional Tier Dashboard
- **Genre-based Processing**: 15+ music genres
- **Automated Mastering**: AI-powered audio enhancement
- **Analysis Tools**: Frequency spectrum, LUFS, peak analysis
- **Export Gate**: Multiple download formats

### 🆓 Free Tier Dashboard
- **Basic Processing**: Essential audio mastering tools
- **Quick Export**: Standard format downloads
- **Credit System**: Track usage and upgrades

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# The scripts automatically handle this, but if you need to manually:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

#### Node.js Not Found
```bash
# Install Node.js from: https://nodejs.org/
node --version
npm --version
```

#### Ruby Not Found
```bash
# Install Ruby from: https://rubyinstaller.org/
ruby --version
gem --version
```

#### PHP Not Found
```bash
# Install PHP from: https://windows.php.net/download/
php --version
```

### Performance Optimization

#### For Better Performance
1. **Close unnecessary applications** before starting servers
2. **Use SSD storage** for faster file access
3. **Increase Node.js memory** if needed:
   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096
   ```

#### For Development
1. **Use the PowerShell script** for better monitoring
2. **Keep the monitoring window open** to track server status
3. **Check browser console** for any frontend errors

## 📱 Browser Compatibility

- ✅ **Chrome**: Full support (recommended)
- ✅ **Firefox**: Full support
- ✅ **Safari**: Full support
- ✅ **Edge**: Full support

## 🔒 Security Notes

- 🔐 **Local Development Only**: These scripts are for local development
- 🚫 **Not for Production**: Do not use these scripts in production environments
- 🔒 **Port Security**: Only opens necessary ports for development
- 🛡️ **Process Isolation**: Each server runs in its own process

## 📞 Support

If you encounter issues:

1. **Check the console output** for error messages
2. **Verify all dependencies** are installed
3. **Restart the scripts** if servers fail to start
4. **Check port availability** if you get port conflicts

## 🎉 Ready to Start!

Choose your preferred method and start creating amazing audio masters with Crys Garage!

```bash
# Quick start (recommended):
npm run start-all

# Or simply double-click:
start.bat
```

---

**Happy Mastering! 🎵✨**
