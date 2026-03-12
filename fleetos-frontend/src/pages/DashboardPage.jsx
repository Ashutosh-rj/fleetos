import { useState } from 'react'
import {
  Truck, Route, Users, Activity, TrendingUp,
  Zap, AlertCircle, CheckCircle2, Clock
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useDashboardStats, useDashboardActivity, useActiveTrips } from '../hooks/useApi'
import { StatCard, Skeleton, StatusBadge, PageHeader } from '../components/ui/index'
import { format } from 'date-fns'

const COLORS = ['#10b981', '#f59e0b', '#6366f1', '#f43f5e']

// Mock trend data (in prod, this would come from the API with date params)
const weeklyTrips = [
  { day: 'Mon', trips: 12, km: 340 },
  { day: 'Tue', trips: 18, km: 510 },
  { day: 'Wed', trips: 9,  km: 270 },
  { day: 'Thu', trips: 22, km: 640 },
  { day: 'Fri', trips: 28, km: 830 },
  { day: 'Sat', trips: 14, km: 390 },
  { day: 'Sun', trips: 7,  km: 190 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs">
      <p className="font-mono font-600 text-fleet-text mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activity, isLoading: actLoading } = useDashboardActivity()
  const { data: activeTrips } = useActiveTrips()

  const vehicleStatusData = stats ? [
    { name: 'Available',    value: stats.availableVehicles },
    { name: 'In Use',       value: stats.vehiclesInUse },
    { name: 'Maintenance',  value: stats.vehiclesInMaintenance },
    { name: 'Retired',      value: stats.totalVehicles - stats.availableVehicles - stats.vehiclesInUse - stats.vehiclesInMaintenance },
  ].filter(d => d.value > 0) : []

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Operations Dashboard"
        subtitle="Real-time fleet overview and performance metrics"
        actions={
          <div className="flex items-center gap-2 text-xs font-mono text-fleet-subtle px-3 py-1.5 border border-fleet-border rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-fleet-emerald animate-pulse-dot" />
            LIVE
          </div>
        }
      />

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        <StatCard
          label="Total Vehicles"
          value={statsLoading ? '—' : stats?.totalVehicles ?? 0}
          icon={Truck}
          color="sky"
          delta={`${stats?.availableVehicles ?? 0} available`}
        />
        <StatCard
          label="Active Trips"
          value={statsLoading ? '—' : stats?.activeTrips ?? 0}
          icon={Zap}
          color="amber"
          delta={`${stats?.tripsThisWeek ?? 0} this week`}
        />
        <StatCard
          label="Total Drivers"
          value={statsLoading ? '—' : stats?.totalDrivers ?? 0}
          icon={Users}
          color="indigo"
        />
        <StatCard
          label="Distance (km)"
          value={statsLoading ? '—' : Math.round(stats?.totalDistanceKm ?? 0).toLocaleString()}
          icon={TrendingUp}
          color="emerald"
          delta={`${stats?.completedTrips ?? 0} completed trips`}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Weekly trips area chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-600 text-sm text-fleet-text">Weekly Trip Activity</h3>
            <span className="text-xs font-mono text-fleet-subtle">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyTrips} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tripsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="kmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
              <XAxis dataKey="day" tick={{ fill: '#5a7299', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a7299', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="trips" stroke="#f59e0b" strokeWidth={2} fill="url(#tripsGrad)" name="Trips" />
              <Area type="monotone" dataKey="km"    stroke="#38bdf8" strokeWidth={2} fill="url(#kmGrad)"   name="Km" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle status donut */}
        <div className="card p-5">
          <h3 className="font-display font-600 text-sm text-fleet-text mb-5">Fleet Status</h3>
          {stats && vehicleStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={vehicleStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    paddingAngle={3} dataKey="value">
                    {vehicleStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {vehicleStatusData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-fleet-subtle">{d.name}</span>
                    </div>
                    <span className="font-mono font-600 text-fleet-text">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Active trips */}
        <div className="card">
          <div className="px-5 py-4 border-b border-fleet-border flex items-center justify-between">
            <h3 className="font-display font-600 text-sm text-fleet-text flex items-center gap-2">
              <Activity size={14} className="text-fleet-amber" />
              Active Trips
            </h3>
            <span className="font-mono text-xs text-fleet-subtle">
              {activeTrips?.length ?? 0} in progress
            </span>
          </div>
          <div className="divide-y divide-fleet-border/50">
            {activeTrips?.slice(0, 5).map(trip => (
              <div key={trip.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-fleet-text">{trip.driver?.fullName}</p>
                  <p className="text-xs text-fleet-subtle font-mono">{trip.vehicle?.plateNumber} · {trip.origin} → {trip.destination}</p>
                </div>
                <StatusBadge status={trip.status} />
              </div>
            ))}
            {(!activeTrips || activeTrips.length === 0) && (
              <div className="px-5 py-8 text-center">
                <CheckCircle2 size={20} className="text-fleet-emerald mx-auto mb-2 opacity-60" />
                <p className="text-xs text-fleet-subtle">No active trips right now</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="px-5 py-4 border-b border-fleet-border">
            <h3 className="font-display font-600 text-sm text-fleet-text flex items-center gap-2">
              <Clock size={14} className="text-fleet-sky" />
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-fleet-border/50">
            {actLoading
              ? [...Array(4)].map((_, i) => (
                  <div key={i} className="px-5 py-3.5 flex gap-3">
                    <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2.5 w-1/2" />
                    </div>
                  </div>
                ))
              : activity?.slice(0, 6).map((item, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      item.type === 'COMPLETED' ? 'bg-fleet-emerald/15' :
                      item.type === 'IN_PROGRESS' ? 'bg-fleet-amber/15' : 'bg-fleet-rose/15'}`}>
                      {item.type === 'COMPLETED' ? <CheckCircle2 size={11} className="text-fleet-emerald" /> :
                       item.type === 'IN_PROGRESS'? <Zap size={11} className="text-fleet-amber" /> :
                       <AlertCircle size={11} className="text-fleet-rose" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-fleet-text leading-tight">{item.description}</p>
                      <p className="text-[11px] text-fleet-subtle mt-0.5 font-mono">
                        {item.actor} · {item.timestamp ? format(new Date(item.timestamp), 'HH:mm dd MMM') : ''}
                      </p>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
