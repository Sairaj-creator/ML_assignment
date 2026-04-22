from pydantic import BaseModel, Field
from typing import List, Dict

class SessionStartResponse(BaseModel):
    session_id: str

class FrameLogRequest(BaseModel):
    session_id: str
    frames_processed: int
    avg_fps: float
    avg_latency_ms: float
    detections_count: int

class SessionStats(BaseModel):
    date: str
    sessions: int
    frames: int

class UserStatsResponse(BaseModel):
    total_sessions: int
    total_frames: int
    total_detections: Dict[str, int]
    avg_fps: float
    last_7_days: List[SessionStats]
