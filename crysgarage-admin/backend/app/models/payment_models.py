from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    user_email = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    tier = Column(String, nullable=False)
    credits = Column(Integer, nullable=False)
    payment_reference = Column(String)
    payment_provider = Column(String, default="paystack")
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    payment_metadata = Column(Text)

class PaymentAnalytics(Base):
    __tablename__ = "payment_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)
    total_revenue = Column(Float, default=0)
    total_transactions = Column(Integer, default=0)
    tier_breakdown = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
