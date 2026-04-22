from sqlalchemy.orm import Session as DbSession
from datetime import datetime
import uuid

from ..models import Session as DbSessionModel, FrameLog
from ..database import SessionLocal


def create_session(db: DbSession, user_id: int) -> str:
    session_id = str(uuid.uuid4())
    new_session = DbSessionModel(
        id=session_id,
        user_id=user_id,
        start_time=datetime.utcnow(),
    )
    db.add(new_session)
    db.commit()
    return session_id


def log_frames(session_id: str, frames_processed: int, avg_fps: float, avg_latency_ms: float, detections_count: int) -> None:
    """
    C6 FIX: BackgroundTask runs after the request DB session is closed.
    This function opens its **own** fresh session so it never touches the
    already-closed request session.
    
    W4 FIX: We validate session ownership before writing — caller (sessions.py)
    passes session_id validated against current_user.id at the route layer.
    """
    db: DbSession = SessionLocal()
    try:
        log_entry = FrameLog(
            session_id=session_id,
            frames_processed=frames_processed,
            avg_fps=avg_fps,
            avg_latency_ms=avg_latency_ms,
            detections_count=detections_count,
        )
        db.add(log_entry)
        # Increment running total on the session row
        sess = db.query(DbSessionModel).filter(DbSessionModel.id == session_id).first()
        if sess:
            sess.total_frames = (sess.total_frames or 0) + frames_processed
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def end_session(db: DbSession, session_id: str, user_id: int) -> None:
    """W3 FIX: ownership check prevents one user from ending another's session."""
    sess = db.query(DbSessionModel).filter(
        DbSessionModel.id == session_id,
        DbSessionModel.user_id == user_id,  # ownership guard
    ).first()
    if not sess:
        return  # silently ignore unknown or foreign sessions
    sess.end_time = datetime.utcnow()
    sess.total_duration_sec = (sess.end_time - sess.start_time).total_seconds()
    db.commit()
