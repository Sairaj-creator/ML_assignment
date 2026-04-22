from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from ..schemas.predict import PredictRequest, PredictResponse
from ..services.image_service import decode_base64, apply_blur, encode_base64
from ..ml.detector import detector_instance
from ..models import User
from ..core.security import get_current_user

router = APIRouter(prefix="/predict", tags=["Prediction"])


@router.post("", response_model=PredictResponse)
async def predict_image(
    req: PredictRequest,
    current_user: User = Depends(get_current_user),
):
    image = decode_base64(req.image_b64)
    h, w = image.shape[:2]

    detections, inference_ms = detector_instance.predict(
        image=image,
        variant=req.model_variant,
        conf_threshold=req.confidence_threshold,
    )

    blurred_b64 = None
    if req.return_blurred:
        blurred_img = apply_blur(image, detections, req.blur_strength)
        blurred_b64 = encode_base64(blurred_img)

    return PredictResponse(
        detections=detections,
        blurred_image_b64=blurred_b64,
        inference_ms=inference_ms,
        model_variant=req.model_variant,
        image_dimensions={"width": w, "height": h},
    )


# W10 FIX: multipart file upload route — same response schema as JSON route
@router.post("/file", response_model=PredictResponse)
async def predict_file(
    file: UploadFile = File(..., description="Image file (jpg/png/webp, ≤10 MB)"),
    blur_strength: int = 51,
    confidence_threshold: float = 0.4,
    model_variant: str = "int8_static_640",
    return_blurred: bool = True,
    current_user: User = Depends(get_current_user),
):
    import base64
    MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
    contents = await file.read()
    if len(contents) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 10 MB limit")

    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Unsupported file type — use jpg, png, or webp")

    b64 = base64.b64encode(contents).decode("utf-8")

    # Re-use JSON predict logic through the schema
    req = PredictRequest(
        image_b64=b64,
        blur_strength=blur_strength,
        confidence_threshold=confidence_threshold,
        model_variant=model_variant,
        return_blurred=return_blurred,
    )
    return await predict_image(req, current_user)
