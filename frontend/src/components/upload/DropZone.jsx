import { useCallback, useState } from 'react'

export default function DropZone({ onFile }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  const validate = (file) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) return 'Only JPG, PNG, and WebP images are supported.'
    if (file.size > 10 * 1024 * 1024) return 'File must be ≤ 10MB.'
    return null
  }

  const handleFile = useCallback((file) => {
    const err = validate(file)
    if (err) { setError(err); return }
    setError(null)
    onFile(file)
  }, [onFile])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div>
      <div
        id="upload-dropzone"
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02]'
            : 'border-gray-600 hover:border-cyan-500/60 hover:bg-gray-800/50'
        }`}
      >
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ${
          isDragging ? 'bg-cyan-500/20' : 'bg-gray-800'
        }`}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDragging ? '#06b6d4' : '#6b7280'} strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
        </div>
        <p className={`text-lg font-semibold ${isDragging ? 'text-cyan-400' : 'text-gray-300'}`}>
          {isDragging ? 'Drop it here!' : 'Drop an image or click to browse'}
        </p>
        <p className="text-gray-500 text-sm mt-1">JPG, PNG, WebP · Max 10MB</p>

        <input
          id="file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]) }}
        />
      </div>
      {error && (
        <p className="mt-2 text-red-400 text-sm flex items-center gap-1.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
