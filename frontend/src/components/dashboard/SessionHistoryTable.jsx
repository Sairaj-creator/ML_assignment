import { useState } from 'react'

const COLS = [
  { key: 'date', label: 'Date' },
  { key: 'duration_s', label: 'Duration', format: (v) => `${Math.floor(v / 60)}m ${v % 60}s` },
  { key: 'frames', label: 'Frames' },
  { key: 'avg_fps', label: 'Avg FPS', format: (v) => v.toFixed(1) },
  { key: 'detections', label: 'Detections' },
  { key: 'model', label: 'Model' },
]

export default function SessionHistoryTable({ sessions }) {
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  const sorted = [...(sessions || [])].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            {COLS.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-4 font-semibold cursor-pointer hover:text-gray-300 transition-colors select-none first:pl-0"
              >
                <div className="flex items-center gap-1">
                  {label}
                  {sortKey === key && (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={sortDir === 'asc' ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'} />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {sorted.map((s, i) => (
            <tr key={i} className="hover:bg-gray-800/50 transition-colors">
              {COLS.map(({ key, format }) => (
                <td key={key} className="py-3 px-4 text-gray-300 first:pl-0 font-mono text-xs">
                  {key === 'model'
                    ? <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 text-xs">{s[key]}</span>
                    : format ? format(s[key]) : s[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
