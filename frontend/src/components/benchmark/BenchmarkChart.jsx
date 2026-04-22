import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'

const COLORS = { fp32_416: '#6b7280', int8_dynamic_416: '#3b82f6', int8_static_416: '#06b6d4' }

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="text-white font-bold mb-2">{d.name}</p>
      <p className="text-gray-300">FPS: <span className="text-cyan-400 font-mono">{d.fps}</span></p>
      <p className="text-gray-300">Accuracy: <span className="text-blue-400 font-mono">{d.accuracy}%</span></p>
      <p className="text-gray-300">Size: <span className="text-gray-400 font-mono">{d.size} MB</span></p>
    </div>
  )
}

export default function BenchmarkChart({ data }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4">FPS vs Accuracy</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="fps" name="FPS" type="number" domain={[8, 30]}
            label={{ value: 'FPS →', position: 'insideBottomRight', fill: '#6b7280', fontSize: 12 }}
            tick={{ fill: '#6b7280', fontSize: 11 }}
          />
          <YAxis
            dataKey="accuracy" name="Accuracy (%)" domain={[70, 100]}
            label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}
            tick={{ fill: '#6b7280', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={data} name="Models">
            {data.map((d) => (
              <Cell key={d.key} fill={COLORS[d.key] || '#6b7280'} r={Math.sqrt(d.size) * 6} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-600 text-center mt-2">Bubble size = model file size</p>
    </div>
  )
}
