import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, QrCode, RefreshCw, Gauge, Calendar, Shield, FileText } from 'lucide-react'
import { useVehicle } from '../../hooks/useApi'
import { useTrips } from '../../hooks/useApi'
import { StatusBadge, Skeleton, PageHeader } from '../../components/ui/index'
import { vehicleApi } from '../../api/services'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-fleet-border last:border-0">
      <span className="text-xs text-fleet-subtle uppercase tracking-wide">{label}</span>
      <span className={`text-sm text-fleet-text text-right ${mono ? 'font-mono' : ''}`}>
        {value ?? <span className="text-fleet-subtle italic text-xs">—</span>}
      </span>
    </div>
  )
}

export default function VehicleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuthStore()
  const { data: vehicle, isLoading, refetch } = useVehicle(id)
  const { data: trips } = useTrips({ vehicleId: id, size: 5 })
  const [qrLoading, setQrLoading] = useState(false)

  const handleRegenQr = async () => {
    setQrLoading(true)
    try {
      await vehicleApi.regenQr(id)
      await refetch()
      toast.success('QR code regenerated')
    } catch { toast.error('Failed to regenerate QR') }
    finally { setQrLoading(false) }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!vehicle) return null

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/vehicles')}
        className="flex items-center gap-2 text-fleet-subtle hover:text-fleet-text text-sm mb-5 transition-colors">
        <ArrowLeft size={14} /> Back to Fleet
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl font-700 text-white font-mono">{vehicle.plateNumber}</h1>
            <StatusBadge status={vehicle.status} />
          </div>
          <p className="text-fleet-subtle">{vehicle.year} {vehicle.make} {vehicle.model}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Vehicle info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Key specs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Gauge, label: 'Odometer', value: `${Number(vehicle.odometerKm).toLocaleString()} km`, color: 'text-fleet-amber' },
              { icon: Calendar, label: 'Reg. Expiry', value: vehicle.registrationExpiry ? format(new Date(vehicle.registrationExpiry), 'dd MMM yy') : '—', color: vehicle.registrationExpiringSoon ? 'text-fleet-rose' : 'text-fleet-text' },
              { icon: Shield, label: 'Ins. Expiry',  value: vehicle.insuranceExpiry    ? format(new Date(vehicle.insuranceExpiry),    'dd MMM yy') : '—', color: vehicle.insuranceExpiringSoon    ? 'text-fleet-rose' : 'text-fleet-text' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="card p-4">
                <Icon size={14} className={`mb-2 ${color}`} />
                <p className="text-[11px] text-fleet-subtle uppercase tracking-wide mb-0.5">{label}</p>
                <p className={`font-mono font-600 text-sm ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="font-display font-600 text-sm text-fleet-text mb-4">Vehicle Details</h3>
            <div>
              <InfoRow label="Make"         value={vehicle.make} />
              <InfoRow label="Model"        value={vehicle.model} />
              <InfoRow label="Year"         value={vehicle.year} mono />
              <InfoRow label="Color"        value={vehicle.color} />
              <InfoRow label="VIN"          value={vehicle.vin} mono />
              <InfoRow label="Fuel Type"    value={vehicle.fuelType} mono />
              <InfoRow label="Vehicle Type" value={vehicle.vehicleType} mono />
              <InfoRow label="Capacity"     value={vehicle.capacityTons ? `${vehicle.capacityTons} tons` : null} mono />
            </div>
            {vehicle.notes && (
              <div className="mt-4 pt-4 border-t border-fleet-border">
                <p className="text-xs text-fleet-subtle uppercase tracking-wide mb-1 flex items-center gap-1">
                  <FileText size={11} /> Notes
                </p>
                <p className="text-sm text-fleet-text leading-relaxed">{vehicle.notes}</p>
              </div>
            )}
          </div>

          {/* Trip history */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-fleet-border">
              <h3 className="font-display font-600 text-sm text-fleet-text">Recent Trips</h3>
            </div>
            <div className="divide-y divide-fleet-border/50">
              {trips?.content?.map(trip => (
                <div key={trip.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-fleet-text">{trip.origin} → {trip.destination}</p>
                    <p className="text-xs text-fleet-subtle font-mono mt-0.5">
                      {trip.driver?.fullName} · {trip.startedAt ? format(new Date(trip.startedAt), 'dd MMM HH:mm') : 'Scheduled'}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={trip.status} />
                    {trip.distanceKm && (
                      <p className="text-xs font-mono text-fleet-subtle mt-1">{Number(trip.distanceKm).toFixed(1)} km</p>
                    )}
                  </div>
                </div>
              ))}
              {(!trips?.content || trips.content.length === 0) && (
                <p className="px-5 py-6 text-sm text-fleet-subtle text-center">No trips recorded yet</p>
              )}
            </div>
          </div>
        </div>

        {/* QR code panel */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-600 text-sm text-fleet-text flex items-center gap-2">
                <QrCode size={14} className="text-fleet-amber" /> QR Code
              </h3>
              {isAdmin() && (
                <button onClick={handleRegenQr} disabled={qrLoading}
                  className="p-1.5 rounded-lg text-fleet-subtle hover:text-fleet-text hover:bg-fleet-muted transition-all disabled:opacity-50">
                  <RefreshCw size={13} className={qrLoading ? 'animate-spin' : ''} />
                </button>
              )}
            </div>

            {vehicle.qrCodeUrl ? (
              <div className="bg-white rounded-xl p-3 flex items-center justify-center">
                <img src={vehicle.qrCodeUrl} alt="Vehicle QR" className="w-full max-w-[180px] h-auto" />
              </div>
            ) : (
              <div className="aspect-square bg-fleet-muted rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <QrCode size={32} className="text-fleet-subtle mx-auto mb-2" />
                  <p className="text-xs text-fleet-subtle">No QR code</p>
                  {isAdmin() && (
                    <button onClick={handleRegenQr} className="mt-2 text-xs text-fleet-amber hover:underline">Generate</button>
                  )}
                </div>
              </div>
            )}
            <p className="text-[10px] text-fleet-subtle text-center mt-3 font-mono">
              Scan to view vehicle details
            </p>
          </div>

          {/* Meta */}
          <div className="card p-4 space-y-2">
            <InfoRow label="Added" value={vehicle.createdAt ? format(new Date(vehicle.createdAt), 'dd MMM yyyy') : '—'} />
            <InfoRow label="Updated" value={vehicle.updatedAt ? format(new Date(vehicle.updatedAt), 'dd MMM yyyy') : '—'} />
            <InfoRow label="UUID" value={<span className="font-mono text-[10px] text-fleet-subtle break-all">{vehicle.uuid}</span>} />
          </div>
        </div>
      </div>
    </div>
  )
}
