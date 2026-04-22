import time
import numpy as np
from typing import Tuple, List
from .registry import get_session
from .preprocessing import letterbox_preprocess
from .postprocessing import nms_decode
from ..config import settings

class PIIDetector:
    CLASS_NAMES = ['face', 'license_plate']

    def predict(self, image: np.ndarray, variant: str, conf_threshold: float = 0.4) -> Tuple[List[dict], float]:
        t0 = time.perf_counter()

        if settings.MOCK_INFERENCE:
            # Simulate inference delay depending on variant size roughly
            time.sleep(0.02)
            elapsed_ms = (time.perf_counter() - t0) * 1000
            
            # Use safe bounding boxes within image to avoid index errors in blurring
            h, w = image.shape[:2]
            
            x1, y1 = int(w * 0.2), int(h * 0.2)
            x2, y2 = int(w * 0.4), int(h * 0.4)
            
            px1, py1 = int(w * 0.6), int(h * 0.6)
            px2, py2 = int(w * 0.8), int(h * 0.8)
            
            mock_detections = [
                {"class_id": 0, "class_name": "face", "confidence": 0.91, "bbox": [x1, y1, x2, y2]},
                {"class_id": 1, "class_name": "license_plate", "confidence": 0.96, "bbox": [px1, py1, px2, py2]}
            ]
            return mock_detections, elapsed_ms

        session = get_session(variant)
        
        x, scale, pad = letterbox_preprocess(image, target=640)
        output = session.run(None, {'images': x})[0]
        
        detections = nms_decode(
            output, scale, pad, image.shape[:2],
            conf_threshold=conf_threshold,
            class_names=self.CLASS_NAMES
        )

        elapsed_ms = (time.perf_counter() - t0) * 1000
        return detections, elapsed_ms

detector_instance = PIIDetector()
