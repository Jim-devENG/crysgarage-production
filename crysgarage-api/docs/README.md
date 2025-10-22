# CrysGarage API Documentation

## Professional Audio Mastering API

Welcome to the CrysGarage API! This powerful API allows developers to integrate professional audio mastering capabilities into their applications.

## Quick Start

### Base URL
https://crysgarage.studio/api/v1

### Authentication
Currently, the API is open for testing. Future versions will include API key authentication.

## Available Endpoints

### 1. Health Check
GET /api/health

### 2. API Information  
GET /api/v1/info

### 3. Get Available Tiers
GET /api/v1/tiers

### 4. Master Audio
POST /api/v1/master

### 5. Download Processed File
GET /api/v1/download/{file_id}

### 6. Check Processing Status
GET /api/v1/status/{file_id}

## Supported Formats

### Input Formats
- WAV (recommended)
- MP3
- FLAC
- AAC
- OGG

### Output Formats
- WAV (default)
- MP3
- FLAC

## Processing Tiers

### Free Tier
- Basic mastering with Matchering
- Max file size: 50MB
- Processing time: ~30 seconds

### Professional Tier (Recommended)
- Advanced mastering with AI
- Max file size: 100MB
- Processing time: ~60 seconds

### Advanced Tier
- Premium mastering with custom algorithms
- Max file size: 200MB
- Processing time: ~90 seconds

## Rate Limits

- Free Tier: 10 requests per hour
- Professional Tier: 100 requests per hour
- Advanced Tier: 500 requests per hour

## Support

For API support and questions:
- Email: api@crysgarage.studio
- Documentation: https://crysgarage.studio/api/docs
- Status: https://crysgarage.studio/api/health
