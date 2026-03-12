import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Truck, Route, Users, FileBarChart2,
  QrCode, User, LogOut, Bell, ChevronRight, Menu, X
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useNotifCount } from '../../hooks/useApi'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vehicles',  icon: Truck,           label: 'Fleet' },
  { to: '/trips',     icon: Route,           label: 'Trips' },
  { to: '/users',     icon: Users,           label: 'Users',   adminOnly: true },
  { to: '/reports',   icon: FileBarChart2,   label: 'Reports', adminOnly: true },
  { to: '/qr-scan',   icon: QrCode,          label: 'QR Scan' },
]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const { data: notifCount } = useNotifCount()

  const handleLogout = () => { logout(); navigate('/login') }

  const filteredNav = navItems.filter(n => !n.adminOnly || isAdmin())

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-fleet-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-fleet-amber flex items-center justify-center">
            <Truck size={16} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-800 text-white tracking-tight">
            Fleet<span className="text-fleet-amber">OS</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {filteredNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
              isActive
                ? 'bg-fleet-amber/10 text-fleet-amber border border-fleet-amber/20'
                : 'text-fleet-subtle hover:text-fleet-text hover:bg-fleet-muted'
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-body">{label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profile footer */}
      <div className="p-4 border-t border-fleet-border">
        <NavLink to="/profile" onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-fleet-muted transition-colors cursor-pointer group mb-1">
          <div className="w-8 h-8 rounded-full bg-fleet-indigo/30 border border-fleet-indigo/40 flex items-center justify-center">
            <span className="text-fleet-indigo text-xs font-bold font-mono">
              {user?.fullName?.slice(0,2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-fleet-text truncate">{user?.fullName}</p>
            <p className="text-[10px] text-fleet-subtle font-mono uppercase">{user?.role?.replace('_', ' ')}</p>
          </div>
        </NavLink>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-fleet-subtle hover:text-fleet-rose hover:bg-fleet-rose/10 transition-all text-xs font-medium">
          <LogOut size={13} />
          <span>Sign out</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-fleet-bg overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-fleet-surface border-r border-fleet-border shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-56 bg-fleet-surface border-r border-fleet-border z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between h-14 px-4 lg:px-6 border-b border-fleet-border bg-fleet-surface shrink-0">
          <button className="lg:hidden p-2 rounded-lg text-fleet-subtle hover:text-fleet-text hover:bg-fleet-muted"
            onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <NavLink to="/profile"
              className="relative p-2 rounded-lg text-fleet-subtle hover:text-fleet-text hover:bg-fleet-muted transition-colors">
              <Bell size={16} />
              {notifCount?.unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-fleet-amber text-black text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
                  {notifCount.unreadCount > 9 ? '9+' : notifCount.unreadCount}
                </span>
              )}
            </NavLink>

            {/* System status indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-fleet-border bg-fleet-bg text-[11px] font-mono text-fleet-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-fleet-emerald animate-pulse-dot" />
              SYSTEM ONLINE
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
