from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

router = APIRouter(prefix="/benchmark", tags=["Benchmark"])


# S3 FIX: Include UploadFile param so Swagger documents the endpoint correctly
@router.post("")
async def run_benchmark(
    video: UploadFile = File(..., description="Short video file ≤10 MB (mp4/webm)"),
):
    """
    Phase 3 feature — runs all 3 model variants against an uploaded video and
    returns a Pareto comparison table (latency vs FPS vs accuracy).

    Implementation stub: returns 501 for the MVP. Will use cv2.VideoCapture
    on a temp file when implemented.
    """
    raise HTTPException(status_code=501, detail="Benchmark endpoint coming in Phase 3")
