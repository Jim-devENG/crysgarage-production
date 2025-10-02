# CrysGarage Waitlist System

Complete waitlist registration system with React frontend, FastAPI backend, and admin dashboard.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Admin         │
│   (React)       │───▶│   (FastAPI)     │◀───│   Dashboard     │
│   Port: 3000    │    │   Port: 8083    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (SQLite)      │
                       └─────────────────┘
```

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd waitlist-backend
pip install -r requirements.txt
python run.py
```
Backend runs on `http://localhost:8083`

### 2. Frontend Setup
```bash
cd waitlist-frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`

### 3. Admin Dashboard Setup
```bash
cd waitlist-admin
npm install
npm run dev
```
Admin runs on `http://localhost:3001`

## 📋 Features

### Frontend (Registration Form)
- ✅ Full Name, Location, Phone, Email fields
- ✅ Category dropdown (Artist, Content Creator, etc.)
- ✅ Form validation (required fields, email format, phone length)
- ✅ Responsive design with CrysGarage branding
- ✅ Automatic WhatsApp redirect after successful registration
- ✅ Success animation and loading states

### Backend (FastAPI)
- ✅ `/api/waitlist/register` - Register new user
- ✅ `/api/waitlist/list` - Get all users
- ✅ `/api/waitlist/count` - Get total count
- ✅ `/api/waitlist/categories` - Get category stats
- ✅ SQLite database with proper schema
- ✅ CORS enabled for frontend communication
- ✅ Email uniqueness validation

### Admin Dashboard
- ✅ View all waitlist registrations in table format
- ✅ Statistics cards (total, categories, today, this week)
- ✅ Category distribution charts
- ✅ CSV export functionality
- ✅ Real-time data refresh
- ✅ Responsive design

## 🔄 User Flow

1. **User visits registration form** → `http://localhost:3000`
2. **Fills out form** → Name, Location, Phone, Email, Category
3. **Clicks "Join Waitlist"** → Form validation runs
4. **Data sent to backend** → `POST /api/waitlist/register`
5. **Backend stores in database** → SQLite with proper schema
6. **Success response** → Frontend shows success message
7. **Auto-redirect to WhatsApp** → `https://chat.whatsapp.com/L1eDQaPVv5L2KZE0754QD3`

## 🎨 Design

- **Brand Colors**: CrysGarage gold (#D4AF37) and black theme
- **Responsive**: Mobile-friendly design with Tailwind CSS
- **Modern UI**: Clean, professional interface
- **Loading States**: Smooth user experience

## 📊 Database Schema

```sql
CREATE TABLE waitlist_users (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    phone VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    category VARCHAR NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration

### Backend Environment Variables
- `DATABASE_URL` - Database connection (default: sqlite:///./waitlist.db)
- `PORT` - Server port (default: 8083)

### Frontend Configuration
- API base URL: `http://localhost:8083`
- WhatsApp group link: `https://chat.whatsapp.com/L1eDQaPVv5L2KZE0754QD3`

## 📱 Categories

- Artist
- Content Creator
- Sound Engineer
- Radio Presenter
- Podcaster
- DJ
- Producer
- Other

## 🚀 Production Deployment

1. **Build frontend**: `npm run build`
2. **Build admin**: `npm run build`
3. **Deploy backend**: Configure production database
4. **Update API URLs**: Point to production backend
5. **Configure CORS**: Update allowed origins

## 📈 Analytics

The admin dashboard provides:
- Total registration count
- Category distribution
- Daily/weekly registrations
- Export functionality for data analysis

## 🔒 Security

- Email uniqueness validation
- Form input validation
- CORS configuration
- SQL injection protection via SQLAlchemy ORM

## 📞 WhatsApp Integration

After successful registration, users are automatically redirected to:
`https://chat.whatsapp.com/L1eDQaPVv5L2KZE0754QD3?mode=ems_share_t`

This creates a seamless flow from registration to community engagement.
