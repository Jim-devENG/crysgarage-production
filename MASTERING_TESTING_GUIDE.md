# Crys Garage - Mastering Testing Guide

## 🎵 Testing Mastering When Ruby Doesn't Work Locally

Since the Ruby audio processor doesn't work on your local machine, here are several approaches to test mastering functionality:

## 🚀 **Option 1: Remote Testing (Recommended)**

### Quick Setup:

```bash
.\setup_ruby_service.bat
```

This sets up the Ruby processor as a system service on the VPS.

### Test Mastering:

```bash
.\test_mastering_remote.bat
```

This starts the processor and tests the connection.

### Monitor:

```bash
.\monitor_mastering.bat
```

This shows service status, logs, and health checks.

## 🔧 **Option 2: Manual Remote Testing**

### Start the processor manually:

```bash
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-ruby && nohup ruby mastering_server.rb > /var/log/crysgarage-ruby.log 2>&1 &"
```

### Check if it's running:

```bash
ssh root@209.74.80.162 "netstat -tlnp | grep :4567"
```

### Test the API:

```bash
ssh root@209.74.80.162 "curl -s http://localhost:4567/health"
```

### View logs:

```bash
ssh root@209.74.80.162 "tail -f /var/log/crysgarage-ruby.log"
```

## 📊 **Option 3: Mock Testing**

### Create a mock mastering service for local development:

1. **Create a mock server** in your frontend:

```javascript
// In your API service, add a mock mode
const MOCK_MODE = process.env.NODE_ENV === "development";

export const masteringAPI = {
  startMastering: async (audioFile, config) => {
    if (MOCK_MODE) {
      // Return mock response
      return {
        id: "mock-session-" + Date.now(),
        status: "processing",
        progress: 0,
      };
    }
    // Real API call
    return realMasteringAPI.startMastering(audioFile, config);
  },
};
```

2. **Test the UI flow** locally with mock responses
3. **Deploy to test** the real mastering on the VPS

## 🎯 **Option 4: Staged Testing**

### Phase 1: Local UI Testing

- Test all UI components locally
- Use mock data for mastering responses
- Ensure upload, configuration, and progress UI work

### Phase 2: Remote Integration Testing

- Deploy to VPS
- Test with real audio files
- Monitor the Ruby processor logs

## 📋 **Testing Checklist**

### Before Testing:

- [ ] Ruby processor is running on VPS
- [ ] Port 4567 is open and listening
- [ ] Health endpoint responds
- [ ] Frontend can connect to backend

### During Testing:

- [ ] Upload audio file
- [ ] Configure mastering settings
- [ ] Start processing
- [ ] Monitor progress
- [ ] Download result

### After Testing:

- [ ] Check logs for errors
- [ ] Verify output quality
- [ ] Test different file formats
- [ ] Test error handling

## 🔍 **Debugging Commands**

### Check Ruby processor:

```bash
ssh root@209.74.80.162 "systemctl status crysgarage-ruby"
```

### View live logs:

```bash
ssh root@209.74.80.162 "journalctl -u crysgarage-ruby -f"
```

### Restart service:

```bash
ssh root@209.74.80.162 "systemctl restart crysgarage-ruby"
```

### Check port:

```bash
ssh root@209.74.80.162 "netstat -tlnp | grep :4567"
```

### Test API directly:

```bash
ssh root@209.74.80.162 "curl -X POST http://localhost:4567/master -H 'Content-Type: application/json' -d '{\"test\": true}'"
```

## 🚨 **Common Issues & Solutions**

### Issue: Ruby processor not starting

**Solution:**

```bash
ssh root@209.74.80.162 "cd /var/www/crysgarage/crysgarage-ruby && bundle install"
ssh root@209.74.80.162 "systemctl restart crysgarage-ruby"
```

### Issue: Port 4567 not listening

**Solution:**

```bash
ssh root@209.74.80.162 "firewall-cmd --permanent --add-port=4567/tcp"
ssh root@209.74.80.162 "firewall-cmd --reload"
```

### Issue: Permission denied

**Solution:**

```bash
ssh root@209.74.80.162 "chown -R nginx:nginx /var/www/crysgarage/crysgarage-ruby"
```

## 📈 **Performance Monitoring**

### Monitor CPU usage:

```bash
ssh root@209.74.80.162 "top -p \$(pgrep -f mastering_server)"
```

### Monitor memory:

```bash
ssh root@209.74.80.162 "ps aux | grep mastering_server"
```

### Monitor disk usage:

```bash
ssh root@209.74.80.162 "df -h /var/www/crysgarage/crysgarage-ruby/output"
```

## 🎯 **Best Practices**

1. **Always test locally first** - UI components, state management
2. **Use mock data** for rapid iteration
3. **Deploy frequently** to test integration
4. **Monitor logs** during testing
5. **Test with different file sizes** and formats
6. **Have fallback error handling** in the UI

---

**Happy testing! 🎵**
