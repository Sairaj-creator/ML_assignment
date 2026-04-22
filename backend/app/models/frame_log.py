from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Index
from datetime import datetime
from ..database import Base

class FrameLog(Base):
    __tablename__ = "frame_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.id"))
    frames_processed = Column(Integer, default=0)
    avg_fps = Column(Float, default=0.0)
    avg_latency_ms = Column(Float, default=0.0)
    detections_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('ix_frame_logs_session_created', 'session_id', 'created_at'),
    )
