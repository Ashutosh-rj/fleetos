import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Download, QrCode, Pencil, Trash2, Truck, RefreshCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  useVehicles, useCreateVehicle, useDeleteVehicle, useUpdateVehicle
} from '../../hooks/useApi'
import { vehicleApi, reportApi } from '../../api/services'
import {
  PageHeader, SearchInput, StatusBadge, Pagination,
  Modal, ConfirmDialog, TableSkeleton, EmptyState, Field
} from '../../components/ui/index'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const FUEL_TYPES    = ['PETROL','DIESEL','ELECTRIC','HYBRID','CNG']
const VEHICLE_TYPES = ['SEDAN','SUV','TRUCK','VAN','BUS','MOTORCYCLE','OTHER']
const STATUSES      = ['AVAILABLE','IN_USE','MAINTENANCE','RETIRED']

function VehicleForm({ onSubmit, defaultValues = {}, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Plate Number" error={errors.plateNumber?.message}>
          <input {...register('plateNumber', { required: 'Required' })}
            placeholder="ABC-1234" className={`input-fleet uppercase ${errors.plateNumber ? 'error' : ''}`} />
        </Field>
        <Field label="Year" error={errors.year?.message}>
          <input {...register('year', { required: 'Required', valueAsNumber: true, min: 1900, max: 2100 })}
            type="number" placeholder="2024" className={`input-fleet ${errors.year ? 'error' : ''}`} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Make" error={errors.make?.message}>
          <input {...register('make', { required: 'Required' })} placeholder="Toyota" className="input-fleet" />
        </Field>
        <Field label="Model" error={errors.model?.message}>
          <input {...register('model', { required: 'Required' })} placeholder="Hilux" className="input-fleet" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vehicle Type">
          <select {...register('vehicleType', { required: true })} className="input-fleet">
            {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Fuel Type">
          <select {...register('fuelType', { required: true })} className="input-fleet">
            {FUEL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Color">
          <input {...register('color')} placeholder="White" className="input-fleet" />
        </Field>
        <Field label="Odometer (km)">
          <input {...register('odometerKm', { valueAsNumber: true })} type="number" placeholder="0" className="input-fleet" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="VIN" hint="Optional">
          <input {...register('vin')} placeholder="1HGCM82633A..." className="input-fleet font-mono text-xs" />
        </Field>
        <Field label="Capacity (tons)">
          <input {...register('capacityTons', { valueAsNumber: true })} type="number" step="0.1" placeholder="0.0" className="input-fleet" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Registration Expiry">
          <input {...register('registrationExpiry')} type="date" className="input-fleet" />
        </Field>
        <Field label="Insurance Expiry">
          <input {...register('insuranceExpiry')} type="date" className="input-fleet" />
        </Field>
      </div>
      <Field label="Notes">
        <textarea {...register('notes')} rows={2} placeholder="Optional notes…"
          className="input-fleet resize-none" />
      </Field>
      <button type="submit" disabled={loading} className="btn-amber w-full justify-center py-2.5 text-sm">
        {loading ? 'Saving…' : 'Save Vehicle'}
      </button>
    </form>
  )
}

export default function VehiclesPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuthStore()
  const [page, setPage]         = useState(0)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatus] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editVehicle, setEditVehicle] = useState(null)
  const [deleteId, setDeleteId]     = useState(null)

  const params = { page, size: 20, search: search || undefined, status: statusFilter || undefined }
  const { data, isLoading } = useVehicles(params)
  const createMut  = useCreateVehicle()
  const updateMut  = useUpdateVehicle()
  const deleteMut  = useDeleteVehicle()

  const handleExport = async () => {
    try {
      const res = await reportApi.downloadExcel()
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a'); a.href = url
      a.download = `fleet-export-${Date.now()}.xlsx`; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Export failed') }
  }

  const vehicles = data?.content ?? []

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Fleet Management"
        subtitle={`${data?.totalElements ?? 0} vehicles registered`}
        actions={
          <>
            <button onClick={handleExport} className="btn-ghost text-sm px-3 py-2">
              <Download size={14} /> Export
            </button>
            {isAdmin() && (
              <button onClick={() => setShowCreate(true)} className="btn-amber text-sm px-3 py-2">
                <Plus size={14} /> Add Vehicle
              </button>
            )}
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(0) }} placeholder="Search plate, make, model…" />
        <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(0) }}
          className="input-fleet w-auto text-sm">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>Plate</th><th>Make / Model</th><th>Type</th>
                <th>Fuel</th><th>Odometer</th><th>Status</th><th>Year</th>
                {isAdmin() && <th></th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? null : vehicles.map(v => (
                <tr key={v.id} onClick={() => navigate(`/vehicles/${v.id}`)} className="cursor-pointer">
                  <td><span className="font-mono font-600 text-fleet-amber text-sm">{v.plateNumber}</span></td>
                  <td>
                    <span className="font-medium text-fleet-text">{v.make} {v.model}</span>
                    {(v.registrationExpiringSoon || v.insuranceExpiringSoon) && (
                      <span className="ml-2 text-[10px] font-mono text-fleet-rose bg-fleet-rose/10 px-1.5 py-0.5 rounded">EXP SOON</span>
                    )}
                  </td>
                  <td><span className="text-fleet-subtle text-xs font-mono">{v.vehicleType}</span></td>
                  <td><span className="text-fleet-subtle text-xs font-mono">{v.fuelType}</span></td>
                  <td><span className="font-mono text-sm text-fleet-text">{Number(v.odometerKm).toLocaleString()}</span></td>
                  <td><StatusBadge status={v.status} /></td>
                  <td><span className="font-mono text-sm text-fleet-subtle">{v.year}</span></td>
                  {isAdmin() && (
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditVehicle(v)}
                          className="p-1.5 rounded-lg text-fleet-subtle hover:text-fleet-text hover:bg-fleet-muted transition-all">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => setDeleteId(v.id)}
                          className="p-1.5 rounded-lg text-fleet-subtle hover:text-fleet-rose hover:bg-fleet-rose/10 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && <TableSkeleton rows={8} cols={isAdmin() ? 8 : 7} />}

        {!isLoading && vehicles.length === 0 && (
          <EmptyState icon={Truck} title="No vehicles found"
            description="Add your first vehicle to get started"
            action={isAdmin() && <button onClick={() => setShowCreate(true)} className="btn-amber text-sm"><Plus size={14} /> Add Vehicle</button>}
          />
        )}

        <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Vehicle" size="lg">
        <VehicleForm
          loading={createMut.isPending}
          onSubmit={d => createMut.mutate(d, { onSuccess: () => setShowCreate(false) })}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editVehicle} onClose={() => setEditVehicle(null)} title="Edit Vehicle" size="lg">
        {editVehicle && (
          <VehicleForm
            defaultValues={editVehicle}
            loading={updateMut.isPending}
            onSubmit={d => updateMut.mutate({ id: editVehicle.id, data: d }, { onSuccess: () => setEditVehicle(null) })}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)}
        title="Delete Vehicle"
        message="This action cannot be undone. The vehicle will be removed from the active fleet."
        danger
      />
    </div>
  )
}
