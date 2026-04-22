from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Session as DbSessionModel
from ..schemas.stats import SessionStartResponse, FrameLogRequest
from ..services import stats_service
from ..core.security import get_current_user

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("/start", response_model=SessionStartResponse)
def start_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session_id = stats_service.create_session(db, current_user.id)
    return {"session_id": session_id}


@router.post("/log")
def log_session_stats(
    req: FrameLogRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # W4 FIX: verify the session belongs to the current user before queuing the write
    sess = db.query(DbSessionModel).filter(
        DbSessionModel.id == req.session_id,
        DbSessionModel.user_id == current_user.id,
    ).first()
    if not sess:
        raise HTTPException(status_code=403, detail="Session not found or access denied")

    # C6 FIX: log_frames opens its own DB session, so it is safe to run in the background
    background_tasks.add_task(
        stats_service.log_frames,
        req.session_id,
        req.frames_processed,
        req.avg_fps,
        req.avg_latency_ms,
        req.detections_count,
    )
    return {"status": "queued"}


@router.post("/end/{session_id}")
def stop_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # W3 FIX: ownership check is inside end_session()
    stats_service.end_session(db, session_id, current_user.id)
    return {"status": "ended"}
