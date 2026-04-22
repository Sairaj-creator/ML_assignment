export default function SessionLogger({ logs }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Session Log</span>
        </div>
        <span className="text-xs text-gray-500">{logs.length} entries</span>
      </div>
      <div className="h-36 overflow-y-auto font-mono text-xs p-3 space-y-1 bg-gray-950/50">
        {logs.length === 0 ? (
          <p className="text-gray-600">Start camera to begin logging...</p>
        ) : (
          [...logs].reverse().map((log, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gray-600 shrink-0">{log.time}</span>
              <span className={`${log.type === 'error' ? 'text-red-400' : log.type === 'info' ? 'text-cyan-400' : 'text-gray-300'}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
