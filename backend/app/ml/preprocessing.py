import cv2
import numpy as np
from typing import Tuple

def letterbox_preprocess(image: np.ndarray, target: int = 640) -> Tuple[np.ndarray, float, Tuple[int, int]]:
    """
    Simulates YOLOv8 letterbox preprocessing to match original aspect ratio with padding.
    """
    shape = image.shape[:2]
    r = min(target / shape[0], target / shape[1])
    new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
    dw, dh = target - new_unpad[0], target - new_unpad[1]
    dw, dh = np.mod(dw, 32), np.mod(dh, 32)
    dw /= 2
    dh /= 2
    
    if shape[::-1] != new_unpad:
        image = cv2.resize(image, new_unpad, interpolation=cv2.INTER_LINEAR)
    
    top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
    left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
    image = cv2.copyMakeBorder(image, top, bottom, left, right, cv2.BORDER_CONSTANT, value=(114, 114, 114))
    
    # HWC to CHW, BGR to RGB
    image = image.transpose((2, 0, 1))[::-1]
    image = np.ascontiguousarray(image)
    
    # Normalize to [0,1]
    image = image.astype(np.float32) / 255.0
    # Expand dims
    image = np.expand_dims(image, axis=0)
    
    return image, r, (left, top)
