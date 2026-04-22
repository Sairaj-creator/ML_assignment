import { useCallback, useState } from 'react'

export default function VideoUploader({ onFile }) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [error, setError] = useState(null)

  const validate = (file) => {
    if (file.type !== 'video/mp4') return 'Only MP4 videos are supported.'
    if (file.size > 10 * 1024 * 1024) return 'Video must be ≤ 10MB.'
    return null
  }

  const handleFile = useCallback((file) => {
    const err = validate(file)
    if (err) { setError(err); return }
    setError(null)
    setFileName(file.name)
    onFile(file)
  }, [onFile])

  return (
    <div>
      <div
        onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onClick={() => document.getElementById('video-file-input').click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          isDragging ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
        }`}
      >
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-800 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isDragging ? '#06b6d4' : '#6b7280'} strokeWidth="1.5">
            <path d="M15 10l4.553-2.669A1 1 0 0121 8.268v7.464a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
          </svg>
        </div>
        {fileName
          ? <><p className="text-green-400 font-semibold">{fileName}</p><p className="text-gray-500 text-sm mt-1">Click to change</p></>
          : <><p className="text-gray-300 font-semibold text-lg">Drop MP4 video here</p><p className="text-gray-500 text-sm mt-1">Max 10MB</p></>
        }
        <input id="video-file-input" type="file" accept="video/mp4" className="hidden"
          onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]) }} />
      </div>
      {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
    </div>
  )
}
