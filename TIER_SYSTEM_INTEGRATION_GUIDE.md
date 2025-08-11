# 🎵 Crys Garage - Tier Management System Integration Guide

## 📋 **Overview**

This guide explains how the tier management system has been integrated into the Crys Garage application, allowing each tier (Free, Professional, Advanced) to have its own management system while maintaining the core mastering functionality.

## 🏗️ **System Architecture**

### **Backend Integration**

#### **1. TierController.php**

- **Location**: `crysgarage-backend/app/Http/Controllers/TierController.php`
- **Purpose**: Centralized tier management with methods for:
  - `getTierFeatures()` - Returns tier-specific features and limitations
  - `getTierDashboard()` - Returns tier-specific dashboard data
  - `getTierUploadOptions()` - Returns tier-specific upload options
  - `getTierProcessingOptions()` - Returns tier-specific processing options
  - `getTierStats()` - Returns tier-specific user statistics
  - `upgradeTier()` - Handles tier upgrades

#### **2. Enhanced AudioController.php**

- **Location**: `crysgarage-backend/app/Http/Controllers/AudioController.php`
- **Enhancements**:
  - Tier-based file validation (size, format, genre)
  - Monthly track limit enforcement
  - Credit validation for non-advanced tiers
  - Upgrade prompts when limits are exceeded

#### **3. API Routes**

- **Location**: `crysgarage-backend/routes/api.php`
- **New Endpoints**:
  ```
  GET  /api/tier/features
  GET  /api/tier/dashboard
  GET  /api/tier/upload-options
  GET  /api/tier/processing-options
  GET  /api/tier/stats
  POST /api/tier/upgrade
  ```

### **Frontend Integration**

#### **1. Enhanced Dashboard Components**

##### **FreeTierDashboard.tsx**

- **Features**:
  - Fetches tier-specific data from backend
  - Displays monthly track limits (3 tracks)
  - Shows file size limits (50MB)
  - Displays supported genres (afrobeats, gospel)
  - Upgrade prompts when limits reached
  - Preview-only mode (no downloads)

##### **ProfessionalTierDashboard.tsx**

- **Features**:
  - Enhanced upload capabilities
  - Processing queue display
  - Higher quality processing
  - Download capabilities
  - 20 tracks per month limit
  - 200MB file size limit

##### **AdvancedTierDashboard.tsx**

- **Features**:
  - Unlimited processing
  - Advanced analytics
  - Custom algorithms access
  - All formats and genres
  - Priority support
  - 500MB file size limit

#### **2. API Service Integration**

- **Location**: `crysgarage-frontend/services/api.ts`
- **New Interfaces**:

  ```typescript
  interface TierFeatures {
    name: string;
    max_file_size: number;
    max_tracks_per_month: number;
    supported_formats: string[];
    supported_genres: string[];
    processing_quality: string;
    download_formats: string[];
    features: string[];
    limitations: string[];
  }

  interface TierDashboard {
    user_info: UserInfo;
    audio_stats: AudioStats;
    tier_specific: TierSpecificData;
  }
  ```

- **New API Functions**:
  ```typescript
  export const tierAPI = {
    getTierFeatures: () => Promise<TierFeatures>,
    getTierDashboard: () => Promise<TierDashboard>,
    getTierUploadOptions: () => Promise<TierUploadOptions>,
    getTierProcessingOptions: () => Promise<TierProcessingOptions>,
    getTierStats: () => Promise<TierStats>,
    upgradeTier: (newTier: string) => Promise<UpgradeResponse>,
  };
  ```

#### **3. Free Tier Access Flow**

- **Non-Authenticated Users**:

  - Can access Free Tier Dashboard without signing up
  - See default free tier features and limitations
  - Upload attempts prompt sign-up modal
  - Upgrade attempts prompt sign-up modal
  - Default credits: 3 (free tier limit)

- **Authenticated Users**:
  - Access personalized Free Tier Dashboard
  - See actual user credits and statistics
  - Can upload files within tier limits
  - Can upgrade to paid tiers
  - Real-time tier data from backend

## 🎯 **Tier-Specific Features**

### **🎵 Free Tier**

- **Monthly Tracks**: 3
- **File Size**: 50MB
- **Formats**: WAV, MP3
- **Genres**: Afrobeats, Gospel
- **Quality**: Standard (44.1kHz/16-bit)
- **Downloads**: Preview only
- **Features**: Basic mastering, limited support

### **⚡ Professional Tier**

- **Monthly Tracks**: 20
- **File Size**: 200MB
- **Formats**: WAV, MP3, FLAC
- **Genres**: Afrobeats, Gospel, Hip-Hop, Highlife
- **Quality**: High (48kHz/24-bit)
- **Downloads**: WAV, MP3
- **Features**: Advanced mastering, priority processing, custom settings

### **🚀 Advanced Tier**

- **Monthly Tracks**: Unlimited
- **File Size**: 500MB
- **Formats**: WAV, MP3, FLAC, AIFF
- **Genres**: All genres
- **Quality**: Master (96kHz/32-bit)
- **Downloads**: WAV, MP3, FLAC
- **Features**: Master quality, unlimited processing, custom algorithms

## 🔄 **Data Flow**

### **1. User Authentication**

```
User Login → Get User Tier → Load Tier-Specific Features
```

### **2. Dashboard Loading**

```
Load Dashboard → Fetch Tier Data → Display Tier-Specific UI
```

### **3. File Upload**

```
Upload Request → Tier Validation → Processing with Tier Settings
```

### **4. Processing**

```
Audio Processing → Tier-Specific Quality → Tier-Specific Output
```

### **5. Free Tier Access Flow**

```
Pricing Page → Click "Start Free Trial" → Free Tier Dashboard
```

### **6. Complete Free Tier Workflow**

```
Upload Audio → AI Mastering → Playback Comparison → Analysis → Download ($2)
```

#### **Step-by-Step Process:**

1. **Upload Your Audio**

   - File validation (WAV, MP3, 50MB limit)
   - Drag & drop interface
   - Progress indicators

2. **AI Mastering Process**

   - Real-time progress bar (0-100%)
   - Processing simulation (~5 seconds)
   - Status updates and completion

3. **Playback Comparison**

   - Side-by-side original vs mastered tracks
   - Independent play/pause controls
   - Progress bars and time display
   - Audio synchronization

4. **Mastering Analysis**

   - Technical metrics:
     - Loudness (-14.2 LUFS)
     - Dynamic Range (12.5 dB)
     - Frequency Balance
     - Stereo Width (85%)
   - AI improvements list
   - Processing time statistics

5. **Download Restriction**
   - WAV format display
   - File size information
   - $2 payment requirement
   - Upgrade prompts for free downloads

## 🧪 **Testing the Integration**

### **Prerequisites**

1. All services running (Frontend, Backend, Ruby)
2. Database properly configured
3. User accounts with different tiers

### **Test Scenarios**

#### **1. Free Tier Access Testing**

```bash
# Start the test script
./test_free_tier_access.bat
```

**Expected Behavior**:

- Non-authenticated users can access Free Tier Dashboard
- "Start Free Trial" button navigates to dashboard
- Free tier features are displayed correctly
- Upload attempts prompt authentication
- Authenticated users see personalized data
- Tier-specific validation works

#### **2. Free Tier Testing**

```bash
# Start the test script
./test_tier_system.bat
```

**Expected Behavior**:

- Dashboard shows "Free Trial Experience" badge
- Credits display: X / 3
- Tracks remaining: X / 3
- Upload disabled when limits reached
- Upgrade prompts when limits exceeded

#### **3. Professional Tier Testing**

**Expected Behavior**:

- Dashboard shows "Professional Tier" badge
- Credits display: X remaining
- Tracks remaining: X / 20
- Processing queue visible
- Download capabilities enabled

#### **4. Advanced Tier Testing**

**Expected Behavior**:

- Dashboard shows "Advanced Tier" badge
- Credits display: ∞ Unlimited
- Tracks remaining: ∞ Unlimited
- Advanced analytics visible
- All features enabled

### **API Testing**

#### **Test Tier Features Endpoint**

```bash
curl -X GET "http://localhost:8000/api/tier/features" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:

```json
{
  "success": true,
  "tier": "free",
  "features": {
    "name": "Free Tier",
    "max_file_size": 50,
    "max_tracks_per_month": 3,
    "supported_formats": ["wav", "mp3"],
    "supported_genres": ["afrobeats", "gospel"],
    "processing_quality": "standard",
    "download_formats": ["wav"],
    "features": [...],
    "limitations": [...]
  }
}
```

#### **Test Tier Dashboard Endpoint**

```bash
curl -X GET "http://localhost:8000/api/tier/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:

```json
{
  "success": true,
  "tier": "free",
  "dashboard": {
    "user_info": {...},
    "audio_stats": {...},
    "tier_specific": {
      "tracks_remaining": 2,
      "upgrade_prompt": true,
      "quick_actions": {...}
    }
  }
}
```

## 🔧 **Configuration**

### **Backend Configuration**

#### **Environment Variables**

```env
# Tier Management
TIER_FREE_TRACKS_LIMIT=3
TIER_PRO_TRACKS_LIMIT=20
TIER_ADVANCED_TRACKS_LIMIT=-1

TIER_FREE_FILE_SIZE=50
TIER_PRO_FILE_SIZE=200
TIER_ADVANCED_FILE_SIZE=500
```

#### **Database Migrations**

Ensure the following tables exist:

- `users` (with `tier` and `credits` columns)
- `audio` (for tracking uploads)
- `audio_qualities` (for quality settings)
- `genres` (for genre support)

### **Frontend Configuration**

#### **API Configuration**

```typescript
// services/api.ts
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
```

#### **Environment Variables**

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_RUBY_SERVICE_URL=http://localhost:4567
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. API Calls Failing**

**Symptoms**: Dashboard shows loading indefinitely
**Solutions**:

- Check backend is running on port 8000
- Verify CORS settings in backend
- Check authentication token is valid
- Review browser console for errors

#### **2. Tier Data Not Loading**

**Symptoms**: Dashboard shows default values
**Solutions**:

- Verify user has correct tier assigned
- Check database connection
- Review backend logs for errors
- Ensure API endpoints are accessible

#### **3. File Upload Validation Failing**

**Symptoms**: Uploads rejected unexpectedly
**Solutions**:

- Check file size against tier limits
- Verify file format is supported
- Check monthly track limits
- Review tier validation logic

#### **4. Upgrade Flow Not Working**

**Symptoms**: Upgrade button doesn't work
**Solutions**:

- Check payment modal implementation
- Verify upgrade API endpoint
- Review user tier update logic
- Check database permissions

#### **5. Free Tier Access Not Working**

**Symptoms**: "Start Free Trial" doesn't navigate to dashboard
**Solutions**:

- Check `handleTierSelection` function is called
- Verify `onSelectTier` prop is passed correctly
- Check `currentPage` state updates to 'dashboard'
- Review non-authenticated user flow logic

### **Debug Commands**

#### **Backend Debug**

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Test API endpoints
php artisan route:list --path=api/tier

# Check database
php artisan tinker
>>> App\Models\User::where('tier', 'free')->count();
```

#### **Frontend Debug**

```javascript
// Browser console
// Check tier API calls
console.log("Tier Features:", await tierAPI.getTierFeatures());
console.log("Tier Dashboard:", await tierAPI.getTierDashboard());

// Check user state
console.log("User:", user);
console.log("User Tier:", user.tier);

// Check navigation state
console.log("Current Page:", currentPage);
console.log("Selected Tier:", selectedTier);
```

## 📈 **Monitoring & Analytics**

### **Key Metrics to Track**

- Tier distribution among users
- Upgrade conversion rates
- Feature usage by tier
- Upload success rates
- Processing times by tier
- Free tier access conversions

### **Logging**

The system logs important events:

- Tier upgrades
- Limit violations
- Upload attempts
- Processing completions
- Free tier access attempts

## 🔮 **Future Enhancements**

### **Planned Features**

1. **Tier Analytics Dashboard** - Detailed usage statistics
2. **Custom Tier Presets** - User-defined processing settings
3. **Tier Migration Tools** - Easy tier switching
4. **Usage Alerts** - Notifications when approaching limits
5. **Tier Comparison Tool** - Side-by-side feature comparison
6. **Free Tier Onboarding** - Guided tour for new users

### **Performance Optimizations**

1. **Caching** - Cache tier data to reduce API calls
2. **Lazy Loading** - Load tier-specific features on demand
3. **Batch Processing** - Process multiple uploads efficiently
4. **CDN Integration** - Faster file delivery

## 📚 **Additional Resources**

- [Tier Management System Documentation](./TIER_MANAGEMENT_SYSTEM.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Component Restoration Summary](./COMPONENT_RESTORATION_SUMMARY.md)
- [Backend Controllers](./crysgarage-backend/app/Http/Controllers/)
- [Frontend Components](./crysgarage-frontend/components/)

## 7. Real Mastering Implementation

The system now supports **real mastering** with backend integration:

### Real Mastering Features:
- **Backend Integration**: Laravel backend with Ruby mastering service
- **Real Audio Processing**: Actual mastering algorithms applied
- **Authentic Analysis**: Real metrics from audio processing
- **True Comparison**: Different files for original vs mastered
- **Real Processing Time**: Actual duration of mastering process

### API Configuration:
- **Frontend**: `VITE_API_URL=http://localhost:8000/api`
- **Backend**: Laravel with public upload endpoints
- **Ruby Service**: Audio mastering algorithms
- **Fallback System**: Demo mode if backend unavailable

### Real vs Demo Mode:
| Feature | Demo Mode | Real Mastering |
|---------|-----------|----------------|
| **Audio Processing** | Same file for both | Actually processed audio |
| **Analysis Data** | Hardcoded values | Real metrics from processing |
| **File Sizes** | Simulated difference | Actual processed file sizes |
| **Processing Time** | Fixed 5 seconds | Real processing duration |
| **Quality** | No actual changes | Real audio improvements |
| **Backend** | Not required | Laravel + Ruby services |

### API Endpoints:
- `POST /api/public/upload` - File upload (no auth required)
- `GET /api/public/status/{id}` - Check processing status
- `POST /api/audio/{id}/master` - Start mastering process
- `GET /api/audio/{id}/result` - Get final results

### Testing Real Mastering:
```bash
# Run the test script
./test_real_mastering_fixed.bat

# Check services are running
curl http://localhost:8000
curl http://localhost:4567/health

# Monitor network requests in browser dev tools
# Look for successful calls to localhost:8000
```

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
