from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional, Literal

# W2 FIX: cap image_b64 at ~13 MB (10 MB raw ≈ 13.3 MB base64) via validator.
_MAX_B64_LEN = 13_500_000


class PredictRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    image_b64: str
    return_blurred: bool = True
    blur_strength: int = Field(default=51, ge=3, le=101)
    confidence_threshold: float = Field(default=0.4, ge=0.01, le=0.99)
    model_variant: Literal["fp32_640", "int8_dynamic_640", "int8_static_640"] = "int8_static_640"

    @field_validator("image_b64")
    @classmethod
    def check_b64_size(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("image_b64 cannot be empty")
        if len(v) > _MAX_B64_LEN:
            raise ValueError(f"image_b64 exceeds maximum allowed size ({_MAX_B64_LEN} chars ≈ 10 MB)")
        return v


class Detection(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2] in original image pixels


class PredictResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    detections: List[Detection]
    blurred_image_b64: Optional[str] = None
    inference_ms: float
    model_variant: str
    image_dimensions: dict  # {"width": int, "height": int}
