import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = { fp32_416: '#6b7280', int8_dynamic_416: '#3b82f6', int8_static_416: '#06b6d4' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-white text-sm font-bold">{label}</p>
      <p className="text-gray-300 text-sm">{payload[0].value} uses</p>
    </div>
  )
}

export default function ModelLoadStats({ data }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Model Usage</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="uses" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={COLORS[d.key] || '#6b7280'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
