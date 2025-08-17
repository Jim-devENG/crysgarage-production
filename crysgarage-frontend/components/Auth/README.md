# Fresh Authentication System

A clean, modern authentication system for Crys Garage Studio with comprehensive validation, error handling, and smooth user experience.

## 🚀 Features

### **Components**
- **LoginForm** - Clean login form with validation
- **SignupForm** - Comprehensive signup with password strength indicator
- **AuthModal** - Modal that switches between login and signup
- **AuthExample** - Example implementation

### **Services**
- **authService** - Complete authentication API service
- **tokenService** - Token and user data management
- **AuthContext** - React context for state management

### **Features**
- ✅ **Form Validation** - Real-time validation with error messages
- ✅ **Password Strength** - Visual password strength indicator
- ✅ **Loading States** - Proper loading indicators
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Token Management** - Secure token storage and refresh
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Accessibility** - Keyboard navigation and screen reader support
- ✅ **TypeScript** - Full type safety

## 📦 Installation

The authentication system is already integrated into your project. To use it:

### 1. Wrap your app with AuthProvider

```tsx
// App.tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

### 2. Use the AuthModal component

```tsx
import { AuthModal } from './components/Auth';
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { login, signup, isLoading, error } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
      setShowAuthModal(false);
      // Redirect or show success
    } catch (error) {
      // Error handled by context
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      await signup({ name, email, password });
      setShowAuthModal(false);
      // Redirect or show success
    } catch (error) {
      // Error handled by context
    }
  };

  return (
    <>
      <button onClick={() => setShowAuthModal(true)}>
        Sign In
      </button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
}
```

### 3. Access user data

```tsx
import { useAuth } from './contexts/AuthContext';

function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Tier: {user?.tier}</p>
      <p>Credits: {user?.credits}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
REACT_APP_API_URL=http://localhost:8000
```

### API Endpoints

The system expects these backend endpoints:

- `POST /auth/signin` - Login
- `POST /auth/signup` - Signup
- `POST /auth/signout` - Logout
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `POST /auth/change-password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

## 🎨 Customization

### Styling

The components use Tailwind CSS classes that match your Crys Garage theme:

- `crys-white` - Primary text color
- `crys-light-grey` - Secondary text color
- `crys-gold` - Accent color
- `crys-graphite` - Background color

### Validation Rules

You can customize validation in the form components:

```tsx
// LoginForm.tsx - Email validation
if (!/\S+@\S+\.\S+/.test(email)) {
  errors.email = 'Please enter a valid email';
}

// SignupForm.tsx - Password requirements
if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
  errors.password = 'Password must contain uppercase, lowercase, and number';
}
```

## 🔒 Security Features

- **Token Storage** - Secure localStorage management
- **Password Hashing** - Backend handles password hashing
- **Input Validation** - Client and server-side validation
- **Error Handling** - No sensitive data in error messages
- **Token Refresh** - Automatic token refresh on API calls

## 📱 Responsive Design

The authentication forms are fully responsive:

- **Mobile** - Full-width forms with touch-friendly buttons
- **Tablet** - Centered forms with appropriate spacing
- **Desktop** - Modal forms with backdrop blur

## ♿ Accessibility

- **Keyboard Navigation** - Tab through all form elements
- **Screen Readers** - Proper ARIA labels and descriptions
- **Focus Management** - Clear focus indicators
- **Error Announcements** - Screen reader announces errors

## 🧪 Testing

The components are designed to be easily testable:

```tsx
// Example test
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/Auth';

test('shows login form by default', () => {
  render(
    <AuthProvider>
      <AuthModal isOpen={true} onClose={() => {}} onLogin={() => {}} onSignup={() => {}} />
    </AuthProvider>
  );
  
  expect(screen.getByText('Welcome Back')).toBeInTheDocument();
});
```

## 🚀 Getting Started

1. **Replace old auth** - Remove old authentication components
2. **Add AuthProvider** - Wrap your app with the new provider
3. **Update imports** - Use the new authentication components
4. **Test thoroughly** - Verify all authentication flows work
5. **Customize styling** - Adjust colors and layout as needed

## 📞 Support

If you need help integrating the authentication system:

1. Check the `AuthExample.tsx` for implementation examples
2. Review the `authService.ts` for API integration
3. Look at the `AuthContext.tsx` for state management
4. Test with the provided components first

The system is designed to be drop-in ready and easily customizable for your specific needs!
