import logging
from typing import Dict, Optional

import onnxruntime as ort  # noqa: F401 — imported here only to validate installation
import os

from fastapi import HTTPException
from ..config import settings

logger = logging.getLogger("uvicorn")

_SESSIONS: Dict[str, "ort.InferenceSession"] = {}

VARIANT_PATHS = {
    "fp32_640":         "models/fp32_640.onnx",
    "int8_dynamic_640": "models/int8_dynamic_640.onnx",
    "int8_static_640":  "models/int8_static_640.onnx",
}


def _load(variant: str) -> "ort.InferenceSession":
    # C7 FIX: lazy import inside _load so top-level import only happens when real
    # inference is needed. onnxruntime import above is kept to surface installation
    # errors at startup, not mid-request.
    import onnxruntime as _ort

    path = VARIANT_PATHS.get(variant)
    if not path or not os.path.exists(path):
        raise FileNotFoundError(f"ONNX model not found at '{path}'")

    opts = _ort.SessionOptions()
    opts.graph_optimization_level = _ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    opts.intra_op_num_threads = 0  # use all cores
    logger.info(f"Loading model variant '{variant}' from {path}")
    return _ort.InferenceSession(path, sess_options=opts, providers=["CPUExecutionProvider"])


def get_session(variant: str) -> Optional["ort.InferenceSession"]:
    """Return cached ORT session. Returns None in MOCK mode.
    W5 FIX: raises 503 (not 500) when model file is missing in real mode.
    """
    if settings.MOCK_INFERENCE:
        return None

    if variant not in _SESSIONS:
        try:
            _SESSIONS[variant] = _load(variant)
        except FileNotFoundError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Model variant '{variant}' is not available: {exc}",
            )
    return _SESSIONS[variant]


def preload_all() -> None:
    """Called at lifespan startup to warm model sessions. Safe to call in mock mode."""
    if settings.MOCK_INFERENCE:
        logger.info("MOCK_INFERENCE=true — skipping ONNX preload")
        return

    for v in VARIANT_PATHS:
        try:
            get_session(v)
            logger.info(f"Model variant '{v}' ready")
        except HTTPException as exc:
            logger.warning(f"Could not preload '{v}': {exc.detail}")
        except Exception as exc:
            logger.warning(f"Unexpected error loading '{v}': {exc}")
