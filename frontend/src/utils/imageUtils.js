/**
 * Apply Gaussian-style blur to detected regions on a canvas.
 * @param {CanvasRenderingContext2D} ctx - destination canvas context
 * @param {HTMLCanvasElement|HTMLVideoElement} source - source image/video
 * @param {Array} detections - array of {x1, y1, x2, y2}
 * @param {number} blurStrength - CSS blur radius in pixels
 * @param {boolean} showBoxes - whether to draw bounding box outlines
 */
export function applyBlurToDetections(ctx, source, detections, blurStrength = 51, showBoxes = false) {
  const w = ctx.canvas.width
  const h = ctx.canvas.height

  // Draw source
  ctx.filter = 'none'
  ctx.drawImage(source, 0, 0, w, h)

  // Blur each detection region
  for (const det of detections) {
    const x1 = Math.round(det.x1)
    const y1 = Math.round(det.y1)
    const bw = Math.round(det.x2 - det.x1)
    const bh = Math.round(det.y2 - det.y1)
    if (bw <= 0 || bh <= 0) continue

    ctx.filter = `blur(${blurStrength}px)`
    ctx.drawImage(source, x1, y1, bw, bh, x1, y1, bw, bh)
    ctx.filter = 'none'

    if (showBoxes) {
      const color = det.classId === 0 ? '#06b6d4' : '#f59e0b'
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.strokeRect(x1, y1, bw, bh)

      // Label background
      const label = `${det.className} ${(det.conf * 100).toFixed(0)}%`
      ctx.font = 'bold 11px Inter, sans-serif'
      const tw = ctx.measureText(label).width
      ctx.fillStyle = color
      ctx.fillRect(x1, y1 - 18, tw + 8, 18)
      ctx.fillStyle = '#000'
      ctx.fillText(label, x1 + 4, y1 - 4)
    }
  }
}

/**
 * Convert a canvas element to a base64 JPEG string.
 */
export function canvasToBase64(canvas, quality = 0.85) {
  return canvas.toDataURL('image/jpeg', quality).split(',')[1]
}

/**
 * Load an image file into an HTMLImageElement.
 */
export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = reject
    img.src = url
  })
}

/**
 * Draw an image onto a canvas, resize to fit, return context.
 */
export function drawImageToCanvas(canvas, img) {
  canvas.width = img.naturalWidth || img.width
  canvas.height = img.naturalHeight || img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  return ctx
}

/**
 * Trigger a download of a base64 image.
 */
export function downloadBase64Image(base64, filename = 'masked_output.jpg', mimeType = 'image/jpeg') {
  const link = document.createElement('a')
  link.href = `data:${mimeType};base64,${base64}`
  link.download = filename
  link.click()
}

/**
 * Trigger CSV download from array of objects.
 */
export function downloadCSV(data, filename = 'export.csv') {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
