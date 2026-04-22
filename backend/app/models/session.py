from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from datetime import datetime
from ..database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    total_frames = Column(Integer, default=0)
    total_duration_sec = Column(Float, default=0.0)
