# CrysGarage Waitlist Backend

FastAPI backend for the CrysGarage waitlist system.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python run.py
```

The API will be available at `http://localhost:8083`

## API Endpoints

- `POST /api/waitlist/register` - Register a new user to the waitlist
- `GET /api/waitlist/list` - Get all waitlist users
- `GET /api/waitlist/count` - Get total registration count
- `GET /api/waitlist/categories` - Get registration count by category
- `GET /health` - Health check

## Environment Variables

- `DATABASE_URL` - Database connection string (default: sqlite:///./waitlist.db)
- `PORT` - Server port (default: 8083)
