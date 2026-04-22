import { downloadBase64Image } from '../../utils/imageUtils.js'

export default function DownloadButton({ maskedBase64, filename = 'masked_output.jpg' }) {
  const handleDownload = () => {
    if (!maskedBase64) return
    downloadBase64Image(maskedBase64, filename)
  }

  return (
    <button
      id="download-masked-btn"
      onClick={handleDownload}
      disabled={!maskedBase64}
      className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
      </svg>
      Download Masked Image
    </button>
  )
}
