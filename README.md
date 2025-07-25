# Crys Garage

A comprehensive audio processing and garage management system built with Laravel, React, and Ruby.

## Project Structure

This project consists of three main components:

### 1. Backend (Laravel)
- **Location**: `crysgarage-backend/`
- **Purpose**: RESTful API server handling authentication, file uploads, and business logic
- **Key Features**:
  - User authentication and authorization
  - File upload and processing
  - Audio file management
  - API endpoints for frontend communication

### 2. Frontend (React + TypeScript)
- **Location**: `crysgarage-frontend/`
- **Purpose**: Modern web interface with advanced UI components
- **Key Features**:
  - Afrocentric design system
  - Advanced tier dashboard
  - Addons marketplace
  - Real-time audio processing interface
  - Credit system management

### 3. Audio Processor (Ruby)
- **Location**: `crysgarage-ruby/`
- **Purpose**: Audio file processing and manipulation
- **Key Features**:
  - Audio file conversion and processing
  - Background job processing
  - Output management

## Getting Started

### Prerequisites
- PHP 8.0+
- Node.js 16+
- Ruby 3.0+
- Composer
- npm/yarn

### Backend Setup
```bash
cd crysgarage-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Setup
```bash
cd crysgarage-frontend
npm install
npm run dev
```

### Ruby Audio Processor Setup
```bash
cd crysgarage-ruby
bundle install
```

## Features

- **Multi-tier Architecture**: Advanced dashboard for premium users
- **Audio Processing**: Real-time audio file processing and manipulation
- **Addon System**: Marketplace for additional features and tools
- **Credit System**: Manage user credits and usage
- **Modern UI**: Afrocentric design with modern React components
- **Secure Authentication**: Laravel-based authentication system

## Technology Stack

- **Backend**: Laravel 10, PHP 8
- **Frontend**: React 18, TypeScript, Vite
- **Audio Processing**: Ruby, FFmpeg
- **Database**: SQLite (development), MySQL/PostgreSQL (production)
- **Styling**: Tailwind CSS, Custom Design System

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub. 