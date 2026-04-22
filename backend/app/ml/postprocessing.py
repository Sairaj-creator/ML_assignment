import numpy as np
import cv2
from typing import List, Tuple


def nms_decode(
    output: np.ndarray,
    scale: float,
    pad: Tuple[int, int],
    ori_shape: Tuple[int, int],
    conf_threshold: float,
    class_names: List[str],
) -> List[dict]:
    """
    W6 FIX: Full YOLOv8 output decoding with NMS.

    YOLOv8 ONNX output shape: (1, 4 + num_classes, num_anchors)
      - axis 1: first 4 rows = cx, cy, w, h (in 640-space)
      - axis 1: rows 4..N   = per-class confidence scores

    Returns list of dicts: {class_id, class_name, confidence, bbox: [x1,y1,x2,y2]}
    in *original image pixel* coordinates.
    """
    # output: (1, num_preds, 4 + num_classes) or (1, 4+num_classes, num_preds)
    # YOLOv8 ONNX exports in (1, 4+nc, 8400) — transpose to (8400, 4+nc)
    pred = output[0]  # (4+nc, 8400)
    pred = pred.T     # (8400, 4+nc)

    num_classes = len(class_names)
    boxes_xywh = pred[:, :4]      # cx, cy, w, h in letterbox space
    class_scores = pred[:, 4:]    # (8400, num_classes)

    # Confidence = max class score (YOLOv8 has no obj score, class score IS conf)
    confidences = class_scores.max(axis=1)
    class_ids = class_scores.argmax(axis=1)

    # Pre-filter by threshold
    mask = confidences >= conf_threshold
    boxes_xywh = boxes_xywh[mask]
    confidences = confidences[mask]
    class_ids = class_ids[mask]

    if len(boxes_xywh) == 0:
        return []

    # Convert cx,cy,w,h → x1,y1,x2,y2 (still in letterbox 640-space)
    x1 = boxes_xywh[:, 0] - boxes_xywh[:, 2] / 2
    y1 = boxes_xywh[:, 1] - boxes_xywh[:, 3] / 2
    x2 = boxes_xywh[:, 0] + boxes_xywh[:, 2] / 2
    y2 = boxes_xywh[:, 1] + boxes_xywh[:, 3] / 2

    # Scale back to original image coordinates
    pad_x, pad_y = pad
    x1 = (x1 - pad_x) / scale
    y1 = (y1 - pad_y) / scale
    x2 = (x2 - pad_x) / scale
    y2 = (y2 - pad_y) / scale

    # Clip to image bounds
    ori_h, ori_w = ori_shape
    x1 = np.clip(x1, 0, ori_w)
    y1 = np.clip(y1, 0, ori_h)
    x2 = np.clip(x2, 0, ori_w)
    y2 = np.clip(y2, 0, ori_h)

    # cv2 NMS expects boxes as [x, y, w, h] with float lists
    boxes_for_nms = np.stack([x1, y1, x2 - x1, y2 - y1], axis=1).tolist()
    scores_for_nms = confidences.tolist()

    indices = cv2.dnn.NMSBoxes(
        boxes_for_nms,
        scores_for_nms,
        score_threshold=conf_threshold,
        nms_threshold=0.45,
    )

    detections = []
    if len(indices) > 0:
        for i in indices.flatten():
            cls_id = int(class_ids[i])
            cls_name = class_names[cls_id] if cls_id < num_classes else str(cls_id)
            detections.append(
                {
                    "class_id": cls_id,
                    "class_name": cls_name,
                    "confidence": float(confidences[i]),
                    "bbox": [
                        float(x1[i]),
                        float(y1[i]),
                        float(x2[i]),
                        float(y2[i]),
                    ],
                }
            )
    return detections
