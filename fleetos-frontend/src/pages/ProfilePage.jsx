import { useState } from 'react'
import { User, Bell, CheckCheck, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useMe, useNotifications, useMarkAllRead } from '../hooks/useApi'
import { useAuthStore } from '../store/authStore'
import { PageHeader, StatusBadge, Skeleton, Pagination } from '../components/ui/index'
import { notifApi } from '../api/services'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const NOTIF_ICON = {
  TRIP_STARTED:        { bg: 'bg-fleet-amber/10',   text: 'text-fleet-amber',   emoji: '🚛' },
  TRIP_ENDED:          { bg: 'bg-fleet-emerald/10',  text: 'text-fleet-emerald', emoji: '✅' },
  VEHICLE_MAINTENANCE: { bg: 'bg-fleet-indigo/10',   text: 'text-fleet-indigo',  emoji: '🔧' },
  VEHICLE_ADDED:       { bg: 'bg-fleet-sky/10',      text: 'text-fleet-sky',     emoji: '🚘' },
  USER_REGISTERED:     { bg: 'bg-fleet-rose/10',     text: 'text-fleet-rose',    emoji: '👤' },
  SYSTEM:              { bg: 'bg-fleet-muted',        text: 'text-fleet-subtle',  emoji: '⚙️' },
  OTP:                 { bg: 'bg-fleet-amber/10',    text: 'text-fleet-amber',   emoji: '🔐' },
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const qc = useQueryClient()
  const { data: me } = useMe()
  const [notifPage, setNotifPage] = useState(0)
  const { data: notifs } = useNotifications({ page: notifPage, size: 10 })
  const markAll = useMarkAllRead()

  const handleMarkOne = async (id) => {
    await notifApi.markOne(id)
    qc.invalidateQueries({ queryKey: ['notifications'] })
    qc.invalidateQueries({ queryKey: ['notif-count'] })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">
      <PageHeader title="Profile" subtitle="Account details and notifications" />

      {/* Profile card */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-fleet-indigo/20 border-2 border-fleet-indigo/30 flex items-center justify-center shrink-0">
            <span className="font-display font-800 text-2xl text-fleet-indigo">
              {me?.fullName?.slice(0,2).toUpperCase() ?? '??'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {me ? (
              <>
                <h2 className="font-display font-700 text-xl text-white">{me.fullName}</h2>
                <p className="text-fleet-subtle text-sm font-mono">{me.email}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-mono font-700 px-2 py-0.5 rounded border text-fleet-amber bg-fleet-amber/10 border-fleet-amber/20">
                    {me.role?.replace('_', ' ')}
                  </span>
                  <StatusBadge status={me.status} />
                  {me.emailVerified && (
                    <span className="text-[10px] font-mono text-fleet-emerald bg-fleet-emerald/10 px-2 py-0.5 rounded border border-fleet-emerald/20">
                      ✓ Email Verified
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            )}
          </div>
        </div>

        {me?.phone && (
          <div className="mt-5 pt-5 border-t border-fleet-border grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-fleet-subtle mb-0.5">Phone</p>
              <p className="text-sm font-mono text-fleet-text">{me.phone}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-fleet-subtle mb-0.5">Member Since</p>
              <p className="text-sm font-mono text-fleet-text">
                {me.createdAt ? format(new Date(me.createdAt), 'MMM yyyy') : '—'}
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-fleet-border">
          <button onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-2 text-sm text-fleet-subtle hover:text-fleet-rose transition-colors">
            <LogOut size={14} /> Sign out of FleetOS
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-fleet-border flex items-center justify-between">
          <h3 className="font-display font-600 text-sm text-fleet-text flex items-center gap-2">
            <Bell size={14} className="text-fleet-amber" /> Notifications
          </h3>
          <button onClick={() => markAll.mutate()}
            className="flex items-center gap-1.5 text-xs text-fleet-subtle hover:text-fleet-text transition-colors font-medium">
            <CheckCheck size={13} /> Mark all read
          </button>
        </div>

        <div className="divide-y divide-fleet-border/50">
          {notifs?.content?.map(n => {
            const style = NOTIF_ICON[n.type] || NOTIF_ICON.SYSTEM
            return (
              <div key={n.id}
                className={clsx('px-5 py-4 flex items-start gap-3 transition-colors cursor-pointer',
                  !n.isRead ? 'bg-fleet-amber/[0.03] hover:bg-fleet-amber/[0.06]' : 'hover:bg-fleet-muted/30')}
                onClick={() => !n.isRead && handleMarkOne(n.id)}>
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm', style.bg)}>
                  {style.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={clsx('text-sm font-medium leading-tight', !n.isRead ? 'text-fleet-text' : 'text-fleet-subtle')}>
                      {n.title}
                    </p>
                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-fleet-amber shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-fleet-subtle mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-fleet-subtle/60 font-mono mt-1">
                    {n.createdAt ? format(new Date(n.createdAt), 'dd MMM yyyy HH:mm') : ''}
                  </p>
                </div>
              </div>
            )
          })}

          {notifs?.content?.length === 0 && (
            <div className="px-5 py-10 text-center">
              <Bell size={20} className="text-fleet-subtle mx-auto mb-2 opacity-40" />
              <p className="text-sm text-fleet-subtle">No notifications yet</p>
            </div>
          )}
        </div>

        <Pagination
          page={notifPage}
          totalPages={notifs?.totalPages ?? 0}
          onPageChange={setNotifPage}
        />
      </div>
    </div>
  )
}
