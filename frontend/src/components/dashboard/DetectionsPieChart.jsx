import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#06b6d4', '#f59e0b']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-sm shadow-xl">
      <p className="text-white font-bold">{payload[0].name}</p>
      <p style={{ color: payload[0].payload.fill }}>{payload[0].value.toLocaleString()} detections</p>
    </div>
  )
}

export default function DetectionsPieChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">Detection Breakdown</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-xs text-gray-500 mt-1">{total.toLocaleString()} total detections</p>
    </div>
  )
}
