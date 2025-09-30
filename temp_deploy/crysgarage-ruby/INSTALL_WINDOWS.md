# Crys Garage Ruby Engine - Windows Installation Guide

This guide will help you install Ruby and set up the Crys Garage audio mastering engine on Windows.

## 🚀 Quick Installation

### **Step 1: Install Ruby using RubyInstaller**

1. **Download RubyInstaller**

   - Go to: https://rubyinstaller.org/downloads/
   - Download the latest **Ruby+Devkit** version (e.g., Ruby+Devkit 3.2.x)
   - Choose the **x64** version for 64-bit Windows

2. **Run the Installer**

   - Right-click the downloaded file and "Run as administrator"
   - **Important**: Check these options during installation:
     - ✅ **Add Ruby executables to your PATH**
     - ✅ **Associate .rb and .rbw files with this Ruby installation**
     - ✅ **Use UTF-8 as default external encoding**
   - Click **Install**

3. **Complete the Installation**
   - Wait for the installation to complete
   - Click **Finish** when done

### **Step 2: Verify Ruby Installation**

Open a new **PowerShell** or **Command Prompt** and run:

```powershell
ruby --version
```

You should see output like:

```
ruby 3.2.2p53 (2023-03-30 revision e51014f9c0) [x64-mingw32]
```

### **Step 3: Test the Crys Garage Engine**

Navigate to your Crys Garage Ruby directory:

```powershell
cd "F:\applications\Crys Garage\crysgarage-ruby"
```

Run the test suite:

```powershell
ruby test_mastering.rb
```

## 🔧 Alternative Installation Methods

### **Method 1: Using Chocolatey (if available)**

If you have Chocolatey installed:

```powershell
choco install ruby
```

### **Method 2: Using Scoop (if available)**

If you have Scoop installed:

```powershell
scoop install ruby
```

### **Method 3: Manual Download**

1. Download Ruby from: https://www.ruby-lang.org/en/downloads/
2. Extract to `C:\Ruby32`
3. Add `C:\Ruby32\bin` to your PATH environment variable

## 🧪 Testing Your Installation

### **Basic Ruby Test**

```powershell
# Test Ruby installation
ruby -e "puts 'Hello from Ruby!'"

# Test required gems
ruby -e "require 'json'; puts 'JSON gem works!'"
ruby -e "require 'fileutils'; puts 'FileUtils gem works!'"
```

### **Crys Garage Engine Test**

```powershell
# Run the comprehensive test suite
ruby test_mastering.rb

# Test the mastering engine directly
ruby master_audio.rb --help
```

## 🎵 Using the Audio Mastering Engine

### **Basic Usage**

```powershell
# Process an audio file with default settings
ruby master_audio.rb "path\to\your\audio.wav"

# Process with specific genre
ruby master_audio.rb "audio.wav" --genre afrobeats

# Process with professional tier
ruby master_audio.rb "audio.wav" --tier professional

# Process with custom LUFS target
ruby master_audio.rb "audio.wav" --lufs -16.0
```

### **Supported File Formats**

**Input:**

- WAV (16-bit, 24-bit)
- MP3 (128kbps - 320kbps)
- FLAC (lossless)
- AIFF (16-bit, 24-bit)

**Output:**

- WAV (24-bit, 44.1kHz/48kHz)
- MP3 (320kbps)
- FLAC (lossless)

## 🐛 Troubleshooting

### **Common Issues**

**"ruby is not recognized"**

- Ruby is not in your PATH
- Solution: Reinstall RubyInstaller with "Add to PATH" checked
- Or manually add `C:\Ruby32\bin` to your PATH

**"Permission denied"**

- Run PowerShell as Administrator
- Or check file permissions

**"Missing gems"**

- Ruby gems should be included with RubyInstaller
- If missing, run: `gem install json fileutils`

**"File not found"**

- Ensure you're in the correct directory
- Check file paths (use quotes for paths with spaces)

### **Environment Variables**

If you need to set PATH manually:

1. Open **System Properties** (Win + Pause/Break)
2. Click **Environment Variables**
3. Edit **Path** variable
4. Add: `C:\Ruby32\bin`
5. Click **OK** and restart your terminal

## 📁 Directory Structure

After installation, your directory should look like:

```
crysgarage-ruby/
├── master_audio.rb          # Main mastering engine
├── test_mastering.rb        # Test suite
├── config.json              # Configuration file
├── README.md                # Documentation
├── INSTALL_WINDOWS.md       # This file
├── logs/                    # Processing logs (created automatically)
├── output/                  # Processed files (created automatically)
└── temp/                    # Temporary files (created automatically)
```

## 🎯 Next Steps

1. **Test the engine** with sample audio files
2. **Configure genres** in `config.json`
3. **Integrate with web platform** via API calls
4. **Customize processing** for your specific needs

## 📞 Support

If you encounter issues:

1. Check the **logs** directory for error messages
2. Verify Ruby installation: `ruby --version`
3. Test basic functionality: `ruby test_mastering.rb`
4. Review the main README.md for detailed documentation

---

**🎵 Crys Garage - Craft the sound, Unleash the future**
