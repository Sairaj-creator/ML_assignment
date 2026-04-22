const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
    title: 'Live Mask',
    description: 'Real-time face and license plate blurring from your webcam. Processing at up to 25 FPS using YOLOv8-nano in WebAssembly.',
    accent: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-500/20 hover:border-cyan-500/50',
    glow: 'rgba(6,182,212,0.15)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
      </svg>
    ),
    title: 'Upload & Blur',
    description: 'Drop any image — JPG, PNG, or WebP. Get a privacy-masked version back instantly with an interactive before/after viewer.',
    accent: 'from-purple-500 to-pink-600',
    border: 'border-purple-500/20 hover:border-purple-500/50',
    glow: 'rgba(168,85,247,0.15)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title: 'REST API',
    description: 'Integrate privacy masking into your backend via a clean REST API. Send images, get masked results. No UI required.',
    accent: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/20 hover:border-amber-500/50',
    glow: 'rgba(245,158,11,0.15)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: '100% Private',
    description: 'Zero bytes sent to the cloud. All inference runs locally in your browser via WASM. GDPR-friendly by architecture, not policy.',
    accent: 'from-green-500 to-emerald-600',
    border: 'border-green-500/20 hover:border-green-500/50',
    glow: 'rgba(34,197,94,0.15)',
  },
]

export default function FeatureCards() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything you need for privacy</h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Four powerful modes. One unified platform. All processing stays on your device.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`group relative bg-gray-900 border ${f.border} rounded-2xl p-6 transition-all duration-300 cursor-default overflow-hidden`}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 0%, ${f.glow}, transparent 70%)` }}
              />

              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.accent} p-0.5 mb-5`}>
                  <div className="w-full h-full rounded-[10px] bg-gray-900 flex items-center justify-center text-white">
                    {f.icon}
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
