# Firebase Authentication Setup Guide

## 🔥 Complete Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: **"Crys Garage"**
4. Enable Google Analytics (optional)
5. Click **"Create project"**

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Click **Google** provider
3. **Enable** it
4. Add authorized domains:
   - `localhost` (for development)
   - `crysgarage.studio` (for production)
5. Click **"Save"**

### 3. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **"Your apps"**
3. Click **"Add app"** → **Web** (</> icon)
4. Register your app with nickname: **"Crys Garage Web"**
5. **Copy the Firebase configuration object**

### 4. Configure Environment Variables

1. Copy `.env.firebase.example` to `.env.local`:
   ```bash
   cp .env.firebase.example .env.local
   ```

2. Replace the values in `.env.local` with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

### 5. Switch to Firebase Authentication

To use Firebase authentication instead of the current system:

1. **Backup your current App.tsx**:
   ```bash
   cp App.tsx App.backup.tsx
   ```

2. **Switch to Firebase App**:
   ```bash
   cp AppFirebase.tsx App.tsx
   ```

3. **Update Header**:
   ```bash
   cp components/HeaderFirebase.tsx components/Header.tsx
   ```

### 6. Test Firebase Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`

3. Click **"Get Started"** or **"Try Free"** buttons

4. Test both:
   - **Google Sign In** (with your Gmail account)
   - **Email/Password** sign up and sign in

### 7. Features Included

✅ **Google Authentication** (Gmail login)  
✅ **Email/Password Authentication**  
✅ **Automatic User Profile Creation**  
✅ **Persistent Authentication State**  
✅ **User Profile Management**  
✅ **Secure Token Management**  
✅ **Responsive Design**  
✅ **Error Handling**  

### 8. Firebase Security Rules (Optional)

For additional security, you can set up Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 9. Production Deployment

1. **Add your production domain** to Firebase authorized domains
2. **Update environment variables** for production
3. **Deploy your app** with the Firebase configuration

### 10. Troubleshooting

**Common Issues:**

- **"Firebase config not found"**: Check your `.env.local` file
- **"Google sign in not working"**: Verify authorized domains in Firebase
- **"User not persisting"**: Check browser localStorage
- **"CORS errors"**: Ensure domains are added to Firebase

**Debug Steps:**

1. Check browser console for errors
2. Verify Firebase configuration in Network tab
3. Check localStorage for `crysgarage_firebase_token` and `crysgarage_firebase_user`
4. Use the "Clear Auth" button to reset authentication state

### 11. Migration from Current System

If you want to migrate existing users:

1. **Export user data** from your current system
2. **Import to Firebase** using Firebase Admin SDK
3. **Update user references** in your database
4. **Test migration** with a few test accounts

---

## 🎯 Next Steps

1. **Set up Firebase project** following steps 1-3
2. **Configure environment variables** (step 4)
3. **Test locally** (step 6)
4. **Deploy to production** (step 9)

Your Firebase authentication will be much more reliable than the current system! 🚀

