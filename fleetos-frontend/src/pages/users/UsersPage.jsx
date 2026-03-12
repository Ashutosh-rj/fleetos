import { useState } from 'react'
import { Plus, Pencil, Trash2, ShieldCheck, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import {
  useUsers, useCreateUser, useUpdateUser, useDeleteUser
} from '../../hooks/useApi'
import {
  PageHeader, SearchInput, StatusBadge, Pagination,
  Modal, ConfirmDialog, TableSkeleton, EmptyState, Field
} from '../../components/ui/index'
import { useAuthStore } from '../../store/authStore'

const ROLES    = ['USER','ADMIN','SUPER_ADMIN']
const STATUSES = ['ACTIVE','INACTIVE','SUSPENDED']

const ROLE_COLORS = {
  SUPER_ADMIN: 'text-fleet-amber bg-fleet-amber/10 border-fleet-amber/20',
  ADMIN:       'text-fleet-sky bg-fleet-sky/10 border-fleet-sky/20',
  USER:        'text-fleet-subtle bg-fleet-muted border-fleet-border',
}

function UserForm({ onSubmit, defaultValues = {}, loading, isEdit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Full Name" error={errors.fullName?.message}>
        <input {...register('fullName', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })}
          placeholder="John Driver" className={`input-fleet ${errors.fullName ? 'error' : ''}`} />
      </Field>
      {!isEdit && (
        <>
          <Field label="Email" error={errors.email?.message}>
            <input {...register('email', { required: 'Required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
              type="email" placeholder="user@company.com" className={`input-fleet ${errors.email ? 'error' : ''}`} />
          </Field>
          <Field label="Password" error={errors.password?.message}>
            <input {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })}
              type="password" placeholder="Min 8 characters" className={`input-fleet ${errors.password ? 'error' : ''}`} />
          </Field>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone">
          <input {...register('phone')} placeholder="+1 555 000" className="input-fleet" />
        </Field>
        <Field label="Role">
          <select {...register('role', { required: true })} className="input-fleet">
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </Field>
      </div>
      {isEdit && (
        <Field label="Status">
          <select {...register('status')} className="input-fleet">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      )}
      <button type="submit" disabled={loading} className="btn-amber w-full justify-center py-2.5 text-sm">
        {loading ? 'Saving…' : isEdit ? 'Update User' : 'Create User'}
      </button>
    </form>
  )
}

export default function UsersPage() {
  const { user: me } = useAuthStore()
  const [page, setPage]       = useState(0)
  const [search, setSearch]   = useState('')
  const [roleFilter, setRole] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser]     = useState(null)
  const [deleteId, setDeleteId]     = useState(null)

  const { data, isLoading } = useUsers({ page, size: 20, search: search || undefined, role: roleFilter || undefined })
  const createMut = useCreateUser()
  const updateMut = useUpdateUser()
  const deleteMut = useDeleteUser()

  const users = data?.content ?? []

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="User Management"
        subtitle={`${data?.totalElements ?? 0} accounts`}
        actions={
          <button onClick={() => setShowCreate(true)} className="btn-amber text-sm px-3 py-2">
            <Plus size={14} /> Add User
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchInput value={search} onChange={v => { setSearch(v); setPage(0) }} placeholder="Search name, email…" />
        <select value={roleFilter} onChange={e => { setRole(e.target.value); setPage(0) }}
          className="input-fleet w-auto text-sm">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="fleet-table">
            <thead>
              <tr>
                <th>User</th><th>Role</th><th>Status</th>
                <th>Email Verified</th><th>Joined</th><th></th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-fleet-indigo/20 border border-fleet-indigo/30 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-bold font-mono text-fleet-indigo">
                          {user.fullName?.slice(0,2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-fleet-text text-sm">{user.fullName}</p>
                        <p className="text-xs text-fleet-subtle font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge border text-[10px] px-2 py-0.5 ${ROLE_COLORS[user.role]}`}>
                      <ShieldCheck size={9} /> {user.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td><StatusBadge status={user.status} /></td>
                  <td>
                    <span className={`text-xs font-mono font-600 ${user.emailVerified ? 'text-fleet-emerald' : 'text-fleet-subtle'}`}>
                      {user.emailVerified ? '✓ Verified' : '✗ Pending'}
                    </span>
                  </td>
                  <td><span className="font-mono text-xs text-fleet-subtle">{user.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy') : '—'}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditUser(user)}
                        className="p-1.5 rounded-lg text-fleet-subtle hover:text-fleet-text hover:bg-fleet-muted transition-all">
                        <Pencil size={12} />
                      </button>
                      {user.id !== me?.userId && user.role !== 'SUPER_ADMIN' && (
                        <button onClick={() => setDeleteId(user.id)}
                          className="p-1.5 rounded-lg text-fleet-subtle hover:text-fleet-rose hover:bg-fleet-rose/10 transition-all">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading && <TableSkeleton rows={8} cols={6} />}
        {!isLoading && users.length === 0 && (
          <EmptyState icon={User} title="No users found" />
        )}
        <Pagination page={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create User" size="md">
        <UserForm loading={createMut.isPending}
          onSubmit={d => createMut.mutate(d, { onSuccess: () => setShowCreate(false) })} />
      </Modal>

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User" size="md">
        {editUser && (
          <UserForm isEdit defaultValues={editUser} loading={updateMut.isPending}
            onSubmit={d => updateMut.mutate({ id: editUser.id, data: d }, { onSuccess: () => setEditUser(null) })} />
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)}
        title="Delete User" message="This user will be permanently removed from the system." danger />
    </div>
  )
}
