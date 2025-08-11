# Crys Garage Frontend

🎵 **Professional Audio Mastering Platform - React Frontend**

A sophisticated React/TypeScript frontend for the Crys Garage audio mastering platform, featuring Afrocentric design and specialized audio processing workflows.

## 🚀 Quick Start

### **Prerequisites**

- Node.js 18+
- npm or yarn

### **Installation**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
crysgarage-frontend/
├── components/           # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── LandingPage.tsx # Marketing homepage
│   ├── Header.tsx      # Navigation header
│   ├── AuthPages.tsx   # Authentication modals
│   └── ...            # Other feature components
├── styles/
│   └── globals.css     # Global styles and Tailwind CSS
├── utils/
│   └── index.ts        # Utility functions
├── App.tsx             # Main application component
├── main.tsx            # React entry point
├── index.html          # HTML template
└── package.json        # Dependencies and scripts
```

## 🎨 Design System

### **Color Palette**

- **Crys Black**: `#0a0a0a` (Primary background)
- **Crys Gold**: `#d4af37` (Accent color)
- **Crys Graphite**: `#2a2a2a` (Secondary elements)
- **Crys White**: `#ffffff` (Text and highlights)

### **Typography**

- **Primary**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (for technical elements)

### **Components**

Built with **shadcn/ui** components for consistency and accessibility.

## 🎵 Features

### **Multi-Tier Dashboard**

- **Free Tier**: Limited trial experience (5 credits)
- **Professional Tier**: Full mastering features
- **Advanced Tier**: Manual controls and real-time editing

### **Audio Processing Workflow**

1. **File Upload** - Drag & drop interface
2. **Genre Selection** - Afrobeats, Gospel, Hip-Hop, Highlife
3. **Processing Configuration** - Quality and preference settings
4. **Real-time Processing** - Progress tracking and visualization
5. **Manual Controls** (Advanced) - Live EQ, compression, limiting
6. **Results & Download** - Multiple format exports

### **African Music Focus**

- **Genre-specific optimization** for African music styles
- **Cultural understanding** in processing algorithms
- **Specialized presets** for regional music characteristics

## 🔧 Development

### **Available Scripts**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### **Environment Variables**

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Crys Garage
VITE_APP_VERSION=1.0.0
```

### **API Integration**

The frontend is configured to proxy API requests to the Laravel backend:

```typescript
// API calls are automatically proxied to http://localhost:8000
const response = await fetch("/api/mastering/process", {
  method: "POST",
  body: formData,
});
```

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile-first** approach
- **Touch-optimized** controls
- **Adaptive layouts** for all screen sizes
- **Progressive enhancement** for older browsers

## 🎛️ Audio Interface

### **Real-time Controls**

- **8-band parametric EQ** with visual feedback
- **Multi-band compression** with real-time meters
- **Stereo width controls** with phase correction
- **True peak limiting** with oversampling

### **Signal Flow Visualization**

- **Real-time waveform** display
- **Processing stage** indicators
- **Audio analysis** visualization
- **Progress tracking** with detailed status

## 🔐 Authentication

### **User Management**

- **Sign up/Sign in** modals
- **Profile management** with tier upgrades
- **Credit tracking** and usage monitoring
- **Session management** with secure tokens

## 📊 Analytics & Monitoring

### **User Analytics**

- **Processing statistics** and usage tracking
- **Performance metrics** and error monitoring
- **User behavior** analysis for optimization

## 🚀 Deployment

### **Build Process**

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The built files will be in the `dist` directory
```

### **Deployment Options**

- **Vercel** (recommended for React apps)
- **Netlify** (static hosting)
- **AWS S3** + CloudFront
- **Traditional hosting** with nginx/Apache

## 🧪 Testing

### **Component Testing**

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm test -- --watch
```

## 📈 Performance

### **Optimizations**

- **Code splitting** with dynamic imports
- **Lazy loading** for heavy components
- **Image optimization** with WebP support
- **Bundle analysis** and tree shaking

### **Caching Strategy**

- **Service worker** for offline support
- **Browser caching** for static assets
- **API response caching** for improved performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the Crys Garage platform and is proprietary software.

## 🎵 About Crys Garage

Crys Garage is a professional audio mastering platform focused on African music styles. Our frontend combines modern web technologies with cultural understanding to deliver exceptional user experiences.

**"Craft the sound, Unleash the future"** 🎶

---

_For support and questions, contact the Crys Garage development team._
