"""
PII Detector — YOLOv8 inference via Ultralytics.
Replaces the ONNX Runtime version with a simpler PyTorch-backed implementation.
"""
import time
import logging
from typing import List, Tuple

import numpy as np

from ..config import settings
from .registry import get_model

logger = logging.getLogger("uvicorn")

CLASS_NAMES = ["face", "license_plate"]


def predict(
    image: np.ndarray,
    variant: str,
    conf_threshold: float = 0.4,
) -> Tuple[List[dict], float]:
    """
    Run inference on an image and return detections + elapsed_ms.

    Args:
        image: BGR numpy array (from cv2.imdecode)
        variant: model variant key (e.g. "fp32_640")
        conf_threshold: filter detections below this confidence

    Returns:
        (detections, elapsed_ms) where detections is a list of dicts:
          {class_id, class_name, confidence, bbox: [x1, y1, x2, y2]}
    """
    # MOCK mode — return hardcoded fake detections (for frontend dev without real model)
    if settings.MOCK_INFERENCE:
        time.sleep(0.02)
        h, w = image.shape[:2]
        return [
            {
                "class_id": 0,
                "class_name": "face",
                "confidence": 0.87,
                "bbox": [int(0.2 * w), int(0.2 * h), int(0.4 * w), int(0.6 * h)],
            }
        ], 20.0

    # REAL inference
    model = get_model(variant)
    t0 = time.perf_counter()
    results = model.predict(
        source=image,
        conf=conf_threshold,
        iou=0.5,
        verbose=False,
    )
    elapsed_ms = (time.perf_counter() - t0) * 1000

    detections = []
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls)
            conf = float(box.conf)
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().tolist()
            detections.append({
                "class_id": cls_id,
                "class_name": CLASS_NAMES[cls_id] if cls_id < len(CLASS_NAMES) else str(cls_id),
                "confidence": conf,
                "bbox": [x1, y1, x2, y2],
            })

    return detections, elapsed_ms