import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-sm shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-cyan-400 font-bold">{payload[0].value.toFixed(1)} FPS</p>
    </div>
  )
}

export default function FPSLineChart({ data }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">FPS Trend (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
          <YAxis domain={[0, 30]} tick={{ fill: '#6b7280', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="fps"
            stroke="#06b6d4"
            strokeWidth={2.5}
            dot={{ fill: '#06b6d4', r: 4 }}
            activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
