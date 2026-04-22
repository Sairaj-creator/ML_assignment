import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1 page-transition">
        <Outlet />
      </main>
    </div>
  )
}
