import { useState } from 'react'
import { Plus, MapPin, Flag, Navigation, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import {
  useTrips, useStartTrip, useEndTrip, useAvailableVehicles, useUsers
} from '../../hooks/useApi'
import {
  PageHeader, SearchInput, StatusBadge, Pagination,
  Modal, TableSkeleton, EmptyState, Field
} from '../../components/ui/index'
import { useAuthStore } from '../../store/authStore'

const STATUSES = ['IN_PROGRESS','COMPLETED','PENDING','CANCELLED']

function StartTripForm({ onSubmit, loading }) {
  const { data: vehicles } = useAvailableVehicles()
  const { data: drivers }  = useUsers({ role: 'USER', size: 100 })
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vehicle" error={errors.vehicleId?.message}>
          <select {...register('vehicleId', { required: 'Required', valueAsNumber: true })}
            className={`input-fleet ${errors.vehicleId ? 'error' : ''}`}>
            <option value="">Select vehicle…</option>
            {vehicles?.map(v => (
              <option key={v.id} value={v.id}>{v.plateNumber} – {v.make} {v.model}</option>
            ))}
          </select>
        </Field>
        <Field label="Driver" error={errors.driverId?.message}>
          <select {...register('driverId', { required: 'Required', valueAsNumber: true })}
            className={`input-fleet ${errors.driverId ? 'error' : ''}`}>
            <option value="">Select driver…</option>
            {drivers?.content?.map(u => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Origin" error={errors.origin?.message}>
        <input {...register('origin', { required: 'Required' })} placeholder="Warehouse A, Lagos"
          className={`input-fleet ${errors.origin ? 'error' : ''}`} />
      </Field>
      <Field label="Destination" error={errors.destination?.message}>
        <input {...register('destination', { required: 'Required' })} placeholder="Port Terminal, Apapa"
          className={`input-fleet ${errors.destination ? 'error' : ''}`} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Odometer Start (km)">
          <input {...register('odometerStart', { valueAsNumber: true })} type="number" step="0.1"
            placeholder="0.0" className="input-fleet" />
        </Field>
        <Field label="Cargo Weight (tons)">
          <input {...register('cargoWeightTons', { valueAsNumber: true })} type="number" step="0.01"
            placeholder="0.0" className="input-fleet" />
        </Field>
      </div>
      <Field label="Cargo Description">
        <input {...register('cargoDescription')} placeholder="Electronics, 40 cartons…" className="input-fleet" />
      </Field>
      <Field label="Notes">
        <textarea {...register('notes')} rows={2} className="input-fleet resize-none" />
      </Field>
      <button type="submit" disabled={loading} className="btn-amber w-full justify-center py-2.5 text-sm">
        {loading ? 'Starting…' : 'Start Trip'}
      </button>
    </form>
  )
}

function EndTripForm({ trip, onSubmit, loading }) {
  const { register, handleSubmit } = useForm()
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="p-3 rounded-lg bg-fleet-muted border border-fleet-border text-sm">
        <p className="font-medium text-fleet-text">{trip.origin} → {trip.destination}</p>
        <p className="text-xs text-fleet-subtle mt-0.5 font-mono">
          {trip.vehicle?.plateNumber} · Driver: {trip.driver?.fullName}
        </p>
      </div>
      <Field label="Odometer End (km)">
        <input {...register('odometerEnd', { valueAsNumber: true })} type="number" step="0.1"
          placeholder="End reading" className="input-fleet" />
      </Field>
      <Field label="Fuel Used (liters)">
        <input {...register('fuelUsedLiters', { valueAsNumber: true })} type="number" step="0.1"
          placeholder="0.0" className="input-fleet" />
      </Field>
      <Field label="Notes">
        <textarea {...register('notes')} rows={2} className="input-fleet resize-none" placeholder="Delivery notes…" />
      </Field>
      <button type="submit" disabled={loading} className="btn-amber w-full justify-center py-2.5 text-sm">
        {loading ? 'Ending…' : 'Complete Trip'}
      </button>
    </form>
  )
}

export default function TripsPage() {
  const { isAdmin } = useAuthStore()
  const [page, setPage]     = useState(0)
  const [status, setStatus] = useState('')
  const [showStart, setShowStart] = useState(false)
  const [endTrip, setEndTrip]     = useState(null)

  const { data, isLoading } = useTrips({ page, size: 20, status: status || undefined })
  const startMut = useStartTrip()
  const endMut   = useEndTrip()

  const trips = data?.content ?? []

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Trip Management"
        subtitle={`${data?.totalElements ?? 0} trips total`}
        actions={
          isAdmin() && (
            <button onClick={() => setShowStart(true)} className="btn-amber text-sm px-3 py-2">
              <Plus size={14} /> Start Trip
            </button>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(0) }}
          className="input-fleet w-auto text-sm">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Driver</th><th>Vehicle</th><th>Route</th>
                <th>Started</th><th>Distance</th><th>Status</th>
                {isAdmin() && <th></th>}
              </tr>
            </thead>
            <tbody>
              {!isLoading && trips.map(trip => (
                <tr key={trip.id}>
                  <td>
                    <p className="font-medium text-fleet-text text-sm">{trip.driver?.fullName}</p>
                    <p className="text-xs text-fleet-subtle font-mono">{trip.driver?.email}</p>
                  </td>
                  <td>
                    <span className="font-mono font-600 text-fleet-amber text-sm">{trip.vehicle?.plateNumber}</span>
                    <p className="text-xs text-fleet-subtle">{trip.vehicle?.make} {trip.vehicle?.model}</p>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin size={11} className="text-fleet-emerald shrink-0" />
                      <span className="text-fleet-text truncate max-w-[100px]">{trip.origin}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm mt-0.5">
                      <Flag size={11} className="text-fleet-rose shrink-0" />
                      <span className="text-fleet-subtle truncate max-w-[100px]">{trip.destination}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-fleet-text">
                      {trip.startedAt ? format(new Date(trip.startedAt), 'dd MMM HH:mm') : '—'}
                    </span>
                    {trip.durationMinutes > 0 && (
                      <p className="text-[10px] text-fleet-subtle font-mono flex items-center gap-1 mt-0.5">
                        <Clock size={9} />{trip.durationMinutes}m
                      </p>
                    )}
                  </td>
                  <td>
                    {trip.distanceKm
                      ? <span className="font-mono text-sm text-fleet-text">{Number(trip.distanceKm).toFixed(1)} km</span>
                      : <span className="text-fleet-subtle">—</span>}
                  </td>
                  <td><StatusBadge status={trip.status} /></td>
                  {isAdmin() && (
                    <td>
                      {trip.status === 'IN_PROGRESS' && (
                        <button onClick={() => setEndTrip(trip)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-fleet-emerald bg-fleet-emerald/10 border border-fleet-emerald/20 hover:bg-fleet-emerald/20 transition-all">
                          <Navigation size={11} /> End
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && <TableSkeleton rows={8} cols={isAdmin() ? 7 : 6} />}

        {!isLoading && trips.length === 0 && (
          <EmptyState title="No trips found" description="Start a trip to see it here" />
        )}

        <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
      </div>

      <Modal open={showStart} onClose={() => setShowStart(false)} title="Start New Trip" size="lg">
        <StartTripForm
          loading={startMut.isPending}
          onSubmit={d => startMut.mutate(d, { onSuccess: () => setShowStart(false) })}
        />
      </Modal>

      <Modal open={!!endTrip} onClose={() => setEndTrip(null)} title="Complete Trip" size="md">
        {endTrip && (
          <EndTripForm
            trip={endTrip}
            loading={endMut.isPending}
            onSubmit={d => endMut.mutate({ id: endTrip.id, data: d }, { onSuccess: () => setEndTrip(null) })}
          />
        )}
      </Modal>
    </div>
  )
}
