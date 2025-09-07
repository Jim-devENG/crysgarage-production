# Dev Mode Feature

## Overview

Dev Mode is a development feature that allows you to bypass authentication and payment systems during development, providing instant access to all app features without requiring Firebase login or Paystack payments.

## Features

- **Authentication Bypass**: Automatically logs in with a mock user
- **Payment Bypass**: Grants unlimited credits and access to all tiers
- **Dashboard Access**: Direct access to all dashboards without restrictions
- **Console Warnings**: Clear warnings when Dev Mode is active

## Configuration

### Environment Variables

Add to your `.env.local` file:

```bash
# Enable Dev Mode
VITE_DEV_MODE=true

# API Configuration
VITE_API_URL=http://localhost:8000/api
```

### Dev Mode User

When Dev Mode is enabled, the following mock user is automatically used:

```typescript
{
  id: 'dev-user',
  name: 'Dev Mode User',
  email: 'dev@local.test',
  tier: 'advanced',
  credits: Infinity,
  // ... other user properties
}
```

## Usage

### Enabling Dev Mode

1. Set `VITE_DEV_MODE=true` in your `.env.local` file
2. Restart your development server
3. The app will automatically use Dev Mode

### Disabling Dev Mode

1. Set `VITE_DEV_MODE=false` in your `.env.local` file
2. Restart your development server
3. The app will use normal authentication and payment flows

## What Gets Bypassed

### Authentication
- Firebase login/signup
- Google OAuth
- User authentication checks
- Token management

### Payments
- Paystack payment processing
- Credit verification
- Tier access restrictions
- Payment modals

### Dashboard Access
- Direct access to all dashboards
- No authentication required
- No payment required
- Unlimited downloads

## Console Warnings

When Dev Mode is active, you'll see clear warnings in the console:

```
⚠️ Running in Dev Mode: Auth & Payments bypassed
⚠️ Dev Mode User: { ... }
⚠️ Dev Mode Credits: { ... }
```

## Production Safety

- Dev Mode is **automatically disabled** in production builds
- Environment variables are checked at build time
- No production code is affected by Dev Mode
- All original authentication and payment logic remains intact

## Files Modified

- `utils/devMode.ts` - Core Dev Mode utilities
- `services/firebaseAuth.ts` - Firebase authentication bypass
- `services/paymentBypass.ts` - Payment system bypass
- `App.tsx` - Dashboard access logic
- `components/DevModeToggle.tsx` - Development toggle component

## Testing

1. **With Dev Mode ON**:
   - Navigate directly to `/dashboard`, `/professional`, or `/advanced`
   - No login required
   - No payment required
   - Unlimited access

2. **With Dev Mode OFF**:
   - Normal authentication flow
   - Payment required for access
   - Credit system enforced

## Troubleshooting

### Dev Mode Not Working
- Ensure `VITE_DEV_MODE=true` is set in `.env.local`
- Restart your development server
- Check console for Dev Mode warnings

### Still Getting Auth Prompts
- Clear browser localStorage
- Restart development server
- Verify environment variable is set correctly

### Production Issues
- Dev Mode is automatically disabled in production
- Check that `VITE_DEV_MODE` is not set in production environment
- Verify build process doesn't include dev environment variables
