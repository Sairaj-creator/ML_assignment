from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from ..database import get_db
from ..models import User, Session as DbSession, FrameLog
from ..core.security import get_current_user, require_admin
from ..schemas.stats import UserStatsResponse

router = APIRouter(prefix="", tags=["Stats"])

@router.get("/user/stats", response_model=UserStatsResponse)
def get_user_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_sessions = db.query(DbSession).filter(DbSession.user_id == current_user.id).count()
    
    total_frames = db.query(func.sum(DbSession.total_frames)).filter(DbSession.user_id == current_user.id).scalar() or 0
    
    # We join FrameLog and Session to aggregate
    total_detections = db.query(func.sum(FrameLog.detections_count)).join(DbSession).filter(DbSession.user_id == current_user.id).scalar() or 0
    
    avg_fps = db.query(func.avg(FrameLog.avg_fps)).join(DbSession).filter(DbSession.user_id == current_user.id).scalar() or 0.0

    return UserStatsResponse(
        total_sessions=total_sessions,
        total_frames=total_frames,
        total_detections={"total": total_detections}, # A simplified structure since we don't track class break down in the log directly yet
        avg_fps=float(avg_fps),
        last_7_days=[]
    )

@router.get("/admin/stats")
def get_admin_stats(admin_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    # Very stubbed out administrative dashboard
    return {
        "status": "Admin only stats available here."
    }
