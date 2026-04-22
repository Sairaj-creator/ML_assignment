/**
 * Letterbox-resize a canvas to targetW x targetH, preserving aspect ratio.
 * Returns Float32Array in CHW layout, normalized [0, 1].
 */
export function preprocessCanvas(sourceCanvas, targetW = 416, targetH = 416) {
  const sw = sourceCanvas.width
  const sh = sourceCanvas.height
  const scale = Math.min(targetW / sw, targetH / sh)
  const newW = Math.round(sw * scale)
  const newH = Math.round(sh * scale)
  const padX = Math.floor((targetW - newW) / 2)
  const padY = Math.floor((targetH - newH) / 2)

  const tmp = document.createElement('canvas')
  tmp.width = targetW
  tmp.height = targetH
  const ctx = tmp.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, targetW, targetH)
  ctx.drawImage(sourceCanvas, padX, padY, newW, newH)

  const { data } = ctx.getImageData(0, 0, targetW, targetH)
  const float32 = new Float32Array(3 * targetW * targetH)
  for (let i = 0; i < targetW * targetH; i++) {
    float32[i] = data[i * 4] / 255                      // R
    float32[targetW * targetH + i] = data[i * 4 + 1] / 255  // G
    float32[2 * targetW * targetH + i] = data[i * 4 + 2] / 255 // B
  }
  return { float32, scale, padX, padY }
}

/**
 * Decode YOLOv8 output tensor of shape [1, 6, num_det] where
 * channels are [cx, cy, w, h, face_conf, plate_conf].
 * Returns array of {x1, y1, x2, y2, conf, classId, className}.
 */
export function decodeDetections(outputData, numDet, inputW, inputH, imgW, imgH, scale, padX, padY, confThreshold = 0.4) {
  const detections = []
  const classNames = ['face', 'license_plate']

  for (let i = 0; i < numDet; i++) {
    const cx = outputData[0 * numDet + i]
    const cy = outputData[1 * numDet + i]
    const w = outputData[2 * numDet + i]
    const h = outputData[3 * numDet + i]

    let maxConf = -1
    let classId = -1
    for (let c = 0; c < 2; c++) {
      const conf = outputData[(4 + c) * numDet + i]
      if (conf > maxConf) { maxConf = conf; classId = c }
    }

    if (maxConf < confThreshold) continue

    // Undo letterbox: back to original image coords
    const x1Raw = (cx - w / 2 - padX) / scale
    const y1Raw = (cy - h / 2 - padY) / scale
    const x2Raw = (cx + w / 2 - padX) / scale
    const y2Raw = (cy + h / 2 - padY) / scale

    const x1 = Math.max(0, Math.min(imgW, x1Raw))
    const y1 = Math.max(0, Math.min(imgH, y1Raw))
    const x2 = Math.max(0, Math.min(imgW, x2Raw))
    const y2 = Math.max(0, Math.min(imgH, y2Raw))

    if (x2 <= x1 || y2 <= y1) continue

    detections.push({ x1, y1, x2, y2, conf: maxConf, classId, className: classNames[classId] })
  }
  return detections
}

/**
 * Compute IoU (Intersection over Union) between two boxes.
 */
function iou(a, b) {
  const interX1 = Math.max(a.x1, b.x1)
  const interY1 = Math.max(a.y1, b.y1)
  const interX2 = Math.min(a.x2, b.x2)
  const interY2 = Math.min(a.y2, b.y2)
  const interW = Math.max(0, interX2 - interX1)
  const interH = Math.max(0, interY2 - interY1)
  const inter = interW * interH
  const aArea = (a.x2 - a.x1) * (a.y2 - a.y1)
  const bArea = (b.x2 - b.x1) * (b.y2 - b.y1)
  return inter / (aArea + bArea - inter + 1e-6)
}

/**
 * Greedy NMS — returns filtered detections.
 */
export function nms(detections, iouThreshold = 0.45) {
  const sorted = [...detections].sort((a, b) => b.conf - a.conf)
  const keep = []
  const suppressed = new Set()
  for (let i = 0; i < sorted.length; i++) {
    if (suppressed.has(i)) continue
    keep.push(sorted[i])
    for (let j = i + 1; j < sorted.length; j++) {
      if (!suppressed.has(j) && iou(sorted[i], sorted[j]) > iouThreshold) {
        suppressed.add(j)
      }
    }
  }
  return keep
}

/**
 * Generate mock detections for demo purposes when no real model is loaded.
 * Simulates faces and license plates on a 640x480 canvas.
 */
export function getMockDetections(frameCount = 0) {
  const seed = frameCount % 60
  const jitter = (base, amp) => base + Math.sin(seed * 0.15) * amp
  return [
    {
      x1: Math.round(jitter(180, 8)), y1: Math.round(jitter(80, 5)),
      x2: Math.round(jitter(300, 8)), y2: Math.round(jitter(230, 5)),
      conf: 0.91, classId: 0, className: 'face',
    },
    {
      x1: Math.round(jitter(380, 6)), y1: Math.round(jitter(310, 4)),
      x2: Math.round(jitter(560, 6)), y2: Math.round(jitter(360, 4)),
      conf: 0.78, classId: 1, className: 'license_plate',
    },
  ]
}
