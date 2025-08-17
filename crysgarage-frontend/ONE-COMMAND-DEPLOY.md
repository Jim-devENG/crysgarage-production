# 🚀 One-Command Deployment

## **Copy and Paste This Command on Your VPS:**

```bash
cd /var/www/crysgarage-frontend && git pull origin master && npm install && npm run build && cp -r dist/* /var/www/html/ && chmod -R 755 /var/www/html && chown -R www-data:www-data /var/www/html && echo "✅ Deployment Complete! Visit https://crysgarage.studio"
```

## **Or Use the Quick Deploy Script:**

1. **Copy the contents of `quick-deploy.sh`**
2. **Paste it into a file on your VPS**
3. **Make it executable: `chmod +x quick-deploy.sh`**
4. **Run it: `./quick-deploy.sh`**

## **What This Does:**

✅ **Pulls latest changes** from repository  
✅ **Installs dependencies** with npm  
✅ **Builds for production** with optimized files  
✅ **Deploys to web server** with proper permissions  
✅ **Sets correct permissions** for web server  

## **After Running:**

- Visit: `https://crysgarage.studio`
- Look for "Sign In" and "Get Started" buttons in header
- Test the authentication system

## **If You Get Permission Errors:**

Run with sudo:
```bash
sudo cd /var/www/crysgarage-frontend && sudo git pull origin master && sudo npm install && sudo npm run build && sudo cp -r dist/* /var/www/html/ && sudo chmod -R 755 /var/www/html && sudo chown -R www-data:www-data /var/www/html
```
