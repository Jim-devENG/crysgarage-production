# Crys Garage - Development Workflow

## 🚀 Quick Development & Deployment

### Your Workflow:

1. **Develop locally** - Make changes to your code
2. **Test locally** - Run `npm run dev` in `crysgarage-frontend/`
3. **Deploy** - Run one of the deployment scripts

### Deployment Scripts:

#### For First Time Setup:

```bash
.\deploy_from_repo_fixed.bat
```

- Pushes to GitHub
- Clones fresh on VPS
- Builds everything from scratch

#### For Regular Updates:

```bash
.\quick_deploy.bat
```

- Pushes to GitHub
- Updates existing VPS installation
- Faster deployment

### 📁 Project Structure:

```
Crys Garage/
├── crysgarage-frontend/     # React app (main development)
├── crysgarage-backend/      # Laravel API
├── crysgarage-ruby/         # Audio processing
└── deployment scripts       # .bat files for deployment
```

### 🔧 Local Development:

#### Frontend (React):

```bash
cd crysgarage-frontend
npm run dev          # Development server
npm run build        # Build for production
```

#### Backend (Laravel):

```bash
cd crysgarage-backend
php artisan serve    # Development server
```

#### Ruby Audio Processor:

```bash
cd crysgarage-ruby
ruby mastering_server.rb
```

### 🌐 Live Website:

- **HTTPS**: https://crysgarage.studio
- **HTTP**: http://crysgarage.studio (redirects to HTTPS)

### 📝 Development Tips:

1. **Always test locally first** - Use `npm run dev` to see changes instantly
2. **Commit frequently** - Small commits make debugging easier
3. **Use the quick deploy** - For most updates, `quick_deploy.bat` is fastest
4. **Check the live site** - Always verify your changes are live

### 🚨 Troubleshooting:

#### If deployment fails:

1. Check GitHub repository is up to date
2. Verify VPS connection: `ssh root@209.74.80.162`
3. Check Nginx status: `ssh root@209.74.80.162 "systemctl status nginx"`

#### If website shows old content:

1. Clear browser cache
2. Check if Nginx is serving the right files
3. Verify the build completed successfully

### 🔄 SSL Certificate:

- Auto-renews monthly
- Covers both `crysgarage.studio` and `www.crysgarage.studio`
- HTTP automatically redirects to HTTPS

### 📊 Monitoring:

- Check website: https://crysgarage.studio
- Check server status: `ssh root@209.74.80.162 "systemctl status nginx"`
- Check logs: `ssh root@209.74.80.162 "tail -f /var/log/nginx/error.log"`

---

**Happy coding! 🎉**
