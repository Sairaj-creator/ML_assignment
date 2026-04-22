export default function ResultsTable({ results }) {
  if (!results?.length) return null

  const cols = ['Variant', 'Avg Latency', 'P95 Latency', 'FPS', 'Size', 'Detections']

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            {cols.map((c) => (
              <th key={c} className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-4 font-semibold first:pl-0">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {results.map((r) => (
            <tr key={r.key} className="hover:bg-gray-800/50 transition-colors">
              <td className="py-3 px-4 first:pl-0">
                <span className={`font-mono text-xs px-2 py-1 rounded-full ${
                  r.key === 'int8_static_416'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : r.key === 'int8_dynamic_416'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {r.variant}
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-gray-300">{r.avg_latency_ms} ms</td>
              <td className="py-3 px-4 font-mono text-gray-300">{r.p95_latency_ms} ms</td>
              <td className="py-3 px-4 font-bold text-cyan-400 font-mono">{r.fps}</td>
              <td className="py-3 px-4 text-gray-400">{r.size_mb} MB</td>
              <td className="py-3 px-4 text-gray-300">{r.detections}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
