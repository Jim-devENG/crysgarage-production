# Crys Garage - Integrated Audio Mastering System

## 🎵 Overview

Crys Garage is a professional audio mastering platform that integrates three main components:

- **Frontend**: React/TypeScript application with modern UI
- **Backend**: Laravel PHP API for authentication and file management
- **Ruby Service**: Audio processing engine for mastering

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/API    ┌─────────────────┐    HTTP/API    ┌─────────────────┐
│   Frontend      │ ──────────────► │   Laravel       │ ──────────────► │   Ruby Audio    │
│   (React/TS)    │                 │   Backend       │                 │   Processor     │
│   Port: 5173    │                 │   Port: 8000    │                 │   Port: 4567    │
└─────────────────┘                 └─────────────────┘                 └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **PHP** (v8.2 or higher)
- **Ruby** (v3.0 or higher)
- **Composer** (for PHP dependencies)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd crys-garage
   ```

2. **Run the integration script**

   ```bash
   # Windows
   integrate_services.bat

   # Linux/Mac
   ./integrate_services.sh
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Ruby Service: http://localhost:4567

## 📁 Project Structure

```
crys-garage/
├── crysgarage-frontend/          # React/TypeScript frontend
│   ├── src/
│   ├── components/
│   ├── services/
│   └── package.json
├── crysgarage-backend/           # Laravel PHP backend
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── composer.json
├── crysgarage-ruby/              # Ruby audio processing service
│   ├── mastering_server.rb
│   ├── master_audio.rb
│   └── Gemfile
├── .env.unified                  # Unified environment configuration
├── integrate_services.bat        # Integration script
└── INTEGRATION_PLAN.md           # Detailed integration guide
```

## 🔧 Configuration

### Environment Variables

The system uses a unified `.env` file that configures all services:

```env
# Application
APP_NAME="Crys Garage"
APP_ENV=production
APP_URL=https://crysgarage.studio

# Frontend
VITE_API_URL=https://crysgarage.studio/api
VITE_RUBY_SERVICE_URL=https://crysgarage.studio:4567

# Backend
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

# Ruby Service
RUBY_SERVICE_PORT=4567
RUBY_SERVICE_HOST=0.0.0.0
AUDIO_PROCESSING_TIMEOUT=300
MAX_FILE_SIZE=200
```

## 🎯 Features

### Frontend (React/TypeScript)

- ✅ Modern, responsive UI with Tailwind CSS
- ✅ File upload with drag & drop
- ✅ Real-time processing status
- ✅ Audio preview and comparison
- ✅ Download management
- ✅ User authentication
- ✅ Credit system

### Backend (Laravel)

- ✅ RESTful API endpoints
- ✅ JWT authentication
- ✅ File upload handling
- ✅ Database management
- ✅ Credit system
- ✅ User management
- ✅ Processing status tracking

### Ruby Service

- ✅ Audio mastering engine
- ✅ Multiple genre presets (Afrobeats, Gospel, Hip-Hop, Highlife)
- ✅ Professional audio processing
- ✅ Multiple output formats (WAV, MP3, FLAC)
- ✅ Real-time processing status
- ✅ Configurable processing parameters

## 🔄 Audio Processing Flow

1. **Upload**: User uploads audio file through frontend
2. **Validation**: Backend validates file and user permissions
3. **Processing**: Backend sends file to Ruby service for mastering
4. **Status Updates**: Ruby service provides real-time progress updates
5. **Completion**: Processed files are available for download
6. **Download**: User can download mastered audio in multiple formats

## 📡 API Endpoints

### Authentication

- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout

### Audio Processing

- `POST /api/upload` - Upload audio file
- `GET /api/status/{audio_id}` - Get processing status
- `POST /api/mastering/{audio_id}/start` - Start mastering process
- `GET /api/mastering/{audio_id}/results` - Get mastering results

### File Downloads

- `GET /api/audio/{audio_id}/download/{format}` - Download mastered audio
- `GET /api/audio/{audio_id}/original` - Download original audio
- `GET /api/audio/{audio_id}/download-urls` - Get all download URLs

### User Management

- `GET /api/user` - Get current user info
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/stats` - Get user statistics

## 🎵 Audio Processing Features

### Supported Genres

- **Afrobeats**: Optimized for African pop music
- **Gospel**: Optimized for Christian music
- **Hip-Hop**: Optimized for rap and hip-hop
- **Highlife**: Optimized for traditional African music

### Processing Tiers

- **Free**: Basic processing (MP3 output)
- **Professional**: Advanced processing (WAV, MP3, FLAC)
- **Advanced**: Manual controls and highest quality

### Audio Formats

- **Input**: WAV, MP3, FLAC, AIFF
- **Output**: WAV, MP3, FLAC (based on tier)

## 🔒 Security

### Authentication

- JWT token-based authentication
- Secure password hashing
- Session management

### File Security

- File type validation
- Size limits enforcement
- Secure file storage
- Access control

### API Security

- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention

## 🧪 Testing

### Manual Testing

1. **Upload Test**: Upload an audio file and verify processing
2. **Authentication Test**: Test login/logout functionality
3. **Download Test**: Verify file downloads work correctly
4. **Status Test**: Check real-time status updates

### Automated Testing

```bash
# Frontend tests
cd crysgarage-frontend
npm test

# Backend tests
cd crysgarage-backend
php artisan test

# Ruby service tests
cd crysgarage-ruby
ruby test_mastering.rb
```

## 🚀 Deployment

### Development

```bash
# Start all services
integrate_services.bat

# Or start individually
cd crysgarage-frontend && npm run dev
cd crysgarage-backend && php artisan serve
cd crysgarage-ruby && ruby mastering_server.rb
```

### Production

```bash
# Build frontend
cd crysgarage-frontend
npm run build

# Setup backend
cd crysgarage-backend
composer install --no-dev
php artisan migrate
php artisan config:cache

# Start Ruby service
cd crysgarage-ruby
bundle install
ruby mastering_server.rb
```

## 📊 Monitoring

### Health Checks

- Frontend: `GET /health`
- Backend: `GET /api/health`
- Ruby Service: `GET /health`

### Logging

- Laravel logs: `storage/logs/laravel.log`
- Ruby logs: `crysgarage-ruby/logs/`
- Frontend logs: Browser console

### Performance Metrics

- Processing time tracking
- File upload success rates
- API response times
- Error rates

## 🛠️ Troubleshooting

### Common Issues

1. **Ruby service not starting**

   ```bash
   cd crysgarage-ruby
   bundle install
   ruby mastering_server.rb
   ```

2. **Database migration errors**

   ```bash
   cd crysgarage-backend
   php artisan migrate:fresh
   ```

3. **Frontend build errors**

   ```bash
   cd crysgarage-frontend
   npm install
   npm run build
   ```

4. **File permission issues**

   ```bash
   # Windows
   icacls storage /grant "Everyone:(OI)(CI)F" /T

   # Linux/Mac
   chmod -R 755 storage/
   ```

### Debug Mode

Enable debug mode by setting `APP_DEBUG=true` in the `.env` file.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the troubleshooting section
- Review the logs for error messages
- Create an issue in the repository

## 🔄 Updates

To update the system:

1. Pull the latest changes
2. Run the integration script again
3. Test the functionality
4. Deploy to production

---

**Crys Garage Team** - Professional Audio Mastering Platform
