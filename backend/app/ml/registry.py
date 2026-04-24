"""
Model registry — PyTorch backend for YOLOv8.
All three 'variants' currently point to the same best.pt file.
Real compression variants (ONNX INT8) can be added later.
"""
import logging
from typing import Dict

from ultralytics import YOLO
from fastapi import HTTPException

logger = logging.getLogger("uvicorn")

_MODELS: Dict[str, YOLO] = {}

# All three variants currently use the same .pt file.
# When ONNX INT8 variants are produced later, update these paths
# and swap the registry back to onnxruntime.
VARIANT_PATHS = {
    "fp32_640":         "models/best.pt",
    "int8_dynamic_640": "models/best.pt",
    "int8_static_640":  "models/best.pt",
}


def _load(variant: str) -> YOLO:
    path = VARIANT_PATHS[variant]
    logger.info(f"Loading model variant '{variant}' from {path}")
    model = YOLO(path)
    logger.info(f"Model variant '{variant}' ready (classes: {model.names})")
    return model


def get_model(variant: str) -> YOLO:
    if variant not in VARIANT_PATHS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown variant '{variant}'. Available: {list(VARIANT_PATHS.keys())}"
        )
    if variant not in _MODELS:
        _MODELS[variant] = _load(variant)
    return _MODELS[variant]


def preload_all():
    """Warmup — load all variants at startup."""
    for v in VARIANT_PATHS:
        get_model(v)