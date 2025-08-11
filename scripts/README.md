# Scripts Directory

This directory contains all deployment, configuration, and maintenance scripts for the Crys Garage project.

## 📁 Script Categories

### 🚀 Deployment Scripts

- **deploy_from_repo.bat** - Main deployment script from repository
- **deploy_from_repo_fixed.bat** - Fixed version of main deployment script
- **deploy_simple.bat** - Simplified deployment process
- **fast_deploy.bat** - Quick deployment script
- **fresh_deployment.bat** - Fresh installation deployment
- **quick_deploy.bat** - Rapid deployment script
- **quick_fix_deployment.bat** - Quick deployment fixes
- **update_deployment.bat** - Update existing deployment
- **check_deployment.bat** - Verify deployment status

### 🌐 Frontend Scripts

- **build_and_deploy_frontend.bat** - Build and deploy frontend
- **create_simple_frontend.bat** - Create basic frontend
- **upload_frontend.bat** - Upload frontend files
- **upload_frontend_files.bat** - Upload specific frontend files
- **bypass_build.bat** - Skip build process
- **fix_typescript_and_build.bat** - Fix TypeScript issues and build
- **fix_typescript_errors.ts** - TypeScript error fixes
- **fix_typescript_warnings.ts** - TypeScript warning fixes

### 🔧 Nginx Configuration Scripts

- **fix_nginx.bat** - General nginx fixes
- **fix_nginx_config.bat** - Fix nginx configuration
- **fix_nginx_conflicts.bat** - Resolve nginx conflicts
- **fix_nginx_start.bat** - Fix nginx startup issues
- **fix_main_nginx.bat** - Fix main nginx configuration
- **simple_nginx_fix.bat** - Simple nginx fixes
- **final_nginx_cleanup.bat** - Final nginx cleanup
- **check_nginx_errors.bat** - Check for nginx errors
- **debug_nginx.bat** - Debug nginx issues
- **upload_fixed_nginx.bat** - Upload fixed nginx configuration

### 🔒 SSL/Security Scripts

- **setup_ssl.bat** - Setup SSL certificates
- **fix_ssl.bat** - Fix SSL issues
- **setup_ssh_keys.bat** - Setup SSH keys
- **fix_ssh_config.bat** - Fix SSH configuration

### 🎵 Ruby/Mastering Scripts

- **setup_ruby_service.bat** - Setup Ruby service
- **check_ruby_code.bat** - Check Ruby code
- **fix_ruby_dependencies.bat** - Fix Ruby dependencies
- **fix_mastering_stuck.bat** - Fix stuck mastering process
- **debug_mastering_stuck.bat** - Debug mastering issues
- **monitor_mastering.bat** - Monitor mastering process
- **test_mastering_remote.bat** - Test remote mastering

### 🔍 Debug & Testing Scripts

- **debug_500_error.bat** - Debug 500 errors
- **fix_500_error.bat** - Fix 500 errors
- **fix_all_issues.bat** - Fix all common issues
- **test_passwordless_deployment.bat** - Test passwordless deployment
- **quick_upload.bat** - Quick file upload
- **final_fix.bat** - Final fixes
- **complete_fix.bat** - Complete system fixes

### 🖥️ Service Management

- **start_services.bat** - Start all services
- **start_services.ps1** - PowerShell version of service startup

### 🔐 Authentication Scripts

- **fix_auth_automatically.bat** - Automatic auth fixes
- **fix_auth_automatically.ps1** - PowerShell auth fixes

### 📋 PowerShell Deployment Scripts

- **deploy_to_almalinux.ps1** - Deploy to AlmaLinux
- **deploy_to_almalinux_simple.ps1** - Simple AlmaLinux deployment
- **deploy_to_almalinux_fresh.ps1** - Fresh AlmaLinux deployment
- **deploy_to_vps.ps1** - Deploy to VPS
- **deploy_to_vps.sh** - Shell script for VPS deployment

### ⚙️ Configuration Files

- **nginx_config.conf** - Main nginx configuration
- **nginx_config_fixed.conf** - Fixed nginx configuration
- **nginx_fixed.conf** - Alternative fixed nginx config
- **ssl_config.conf** - SSL configuration
- **vps_config.json** - VPS configuration

### 📚 Documentation

- **AUTH_FIX_README.md** - Authentication fix documentation

### 🔄 Maintenance Scripts

- **update_all_scripts.bat** - Update all scripts
- **fix_redirect_loop.bat** - Fix redirect loops

## 🚀 Quick Start

### For Windows Users:

1. Most scripts are `.bat` files - double-click to run
2. For PowerShell scripts (`.ps1`), right-click and "Run with PowerShell"

### For Linux/Mac Users:

1. Use the `.sh` files for shell scripts
2. Convert `.bat` files to shell scripts as needed

## 📝 Usage Notes

- **Always backup before running deployment scripts**
- **Run scripts as Administrator when required**
- **Check the main project README.md for specific deployment instructions**
- **Some scripts require specific environment variables or configurations**

## 🔧 Script Dependencies

Most scripts assume:

- Git is installed and configured
- Node.js/npm is available (for frontend scripts)
- Ruby is installed (for mastering scripts)
- SSH keys are configured (for deployment scripts)

## 📞 Support

If you encounter issues with any script:

1. Check the error messages
2. Verify all dependencies are installed
3. Ensure you have the correct permissions
4. Review the main project documentation

---

_Last updated: $(Get-Date)_
