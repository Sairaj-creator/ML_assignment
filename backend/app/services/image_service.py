import base64
import cv2
import numpy as np
from fastapi import HTTPException
from ..config import settings

def decode_base64(b64_str: str) -> np.ndarray:
    # Ensure it doesn't have the data URL header
    if ',' in b64_str:
        b64_str = b64_str.split(',')[1]
    
    try:
        image_data = base64.b64decode(b64_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 string")

    # DOS protection
    try:
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data")

    h, w = img.shape[:2]
    if h * w > settings.MAX_PIXELS:
        raise HTTPException(status_code=413, detail="Image exceeds maximum allowed size")
    
    return img

def encode_base64(img: np.ndarray) -> str:
    success, buffer = cv2.imencode('.jpg', img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
    if not success:
        raise HTTPException(status_code=500, detail="Failed to encode image")
    
    return base64.b64encode(buffer).decode('utf-8')

def apply_blur(img: np.ndarray, detections: list, blur_strength: int) -> np.ndarray:
    # blur_strength needs to be odd for GaussianBlur
    if blur_strength % 2 == 0:
        blur_strength += 1
        
    out_img = img.copy()
    h, w = out_img.shape[:2]

    for det in detections:
        # bbox = [x1, y1, x2, y2]
        x1, y1, x2, y2 = [int(v) for v in det['bbox']]
        
        # Ensure within bounds
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        
        if x2 > x1 and y2 > y1:
            roi = out_img[y1:y2, x1:x2]
            blurred_roi = cv2.GaussianBlur(roi, (blur_strength, blur_strength), 0)
            out_img[y1:y2, x1:x2] = blurred_roi
            
    return out_img
