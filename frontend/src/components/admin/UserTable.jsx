const COLS = ['User ID', 'Email', 'Total Sessions', 'Total Frames', 'Last Active']

export default function UserTable({ users }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            {COLS.map((c) => (
              <th key={c} className="text-left text-xs text-gray-500 uppercase tracking-wider py-3 px-4 font-semibold first:pl-0">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {(users || []).map((u) => (
            <tr key={u.id} className="hover:bg-gray-800/50 transition-colors">
              <td className="py-3 px-4 first:pl-0 font-mono text-xs text-gray-500">{u.id}</td>
              <td className="py-3 px-4 text-white font-medium">{u.email}</td>
              <td className="py-3 px-4 text-gray-300 font-mono">{u.total_sessions}</td>
              <td className="py-3 px-4 text-gray-300 font-mono">{u.total_frames?.toLocaleString()}</td>
              <td className="py-3 px-4 text-gray-400 text-xs">{u.last_active}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
