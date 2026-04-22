const STACK = [
  {
    name: 'React 18',
    color: '#61dafb',
    desc: 'UI framework',
    icon: (
      <svg viewBox="-11.5 -10.23174 23 20.46348" fill="#61dafb">
        <circle r="2.05" />
        <g stroke="#61dafb" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    name: 'YOLOv8-nano',
    color: '#f59e0b',
    desc: 'Object detection',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>
      </svg>
    ),
  },
  {
    name: 'ONNX Runtime',
    color: '#06b6d4',
    desc: 'WASM inference',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5">
        <path d="M12 2l9 4.5v9L12 22l-9-6.5v-9L12 2z"/><path d="M12 7l5 2.5v5L12 17l-5-2.5v-5L12 7z"/>
      </svg>
    ),
  },
  {
    name: 'FastAPI',
    color: '#10b981',
    desc: 'Backend REST API',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
  {
    name: 'Vite',
    color: '#a855f7',
    desc: 'Build tool',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
        <path d="M21 3L13 21l-2-8-8-2L21 3z" stroke="#a855f7"/>
      </svg>
    ),
  },
  {
    name: 'WebAssembly',
    color: '#6366f1',
    desc: 'Runtime engine',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 8l2 8 3-5 3 5 2-8"/>
      </svg>
    ),
  },
]

export default function TechStack() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Powered by open source</h2>
          <p className="text-gray-400 text-lg">Best-in-class tools, combined to create a privacy-first experience.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {STACK.map((tech) => (
            <div
              key={tech.name}
              className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 text-center transition-all duration-300 hover:-translate-y-1 cursor-default"
              style={{ '--glow': tech.color }}
            >
              <div className="w-12 h-12 mx-auto mb-3">
                {tech.icon}
              </div>
              <p className="text-white font-semibold text-sm">{tech.name}</p>
              <p className="text-gray-500 text-xs mt-1">{tech.desc}</p>
            </div>
          ))}
        </div>

        {/* Architecture diagram */}
        <div className="mt-16 bg-gray-900 border border-gray-700 rounded-2xl p-8">
          <h3 className="text-white font-bold text-lg mb-6 text-center">How it works</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {[
              { icon: '📷', label: 'Webcam / Image' },
              { icon: '→', label: '', isArrow: true },
              { icon: '🧠', label: 'YOLOv8 (WASM)' },
              { icon: '→', label: '', isArrow: true },
              { icon: '🔵', label: 'Canvas Blur' },
              { icon: '→', label: '', isArrow: true },
              { icon: '🔒', label: 'Private Output' },
            ].map((step, i) =>
              step.isArrow ? (
                <div key={i} className="text-cyan-500 text-2xl font-bold hidden sm:block">→</div>
              ) : (
                <div key={i} className="flex flex-col items-center gap-2 bg-gray-800 rounded-xl px-5 py-4 min-w-[100px]">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="text-gray-300 text-xs font-medium text-center">{step.label}</span>
                </div>
              )
            )}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            All processing runs locally — no network requests during inference.
          </p>
        </div>
      </div>
    </section>
  )
}
