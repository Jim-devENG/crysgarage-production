#!/usr/bin/env python3
"""
Run the waitlist backend server
"""
import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8083))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
