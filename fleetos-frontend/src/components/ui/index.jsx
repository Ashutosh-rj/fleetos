import { X, AlertTriangle, Inbox, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

// ─── Modal ───────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative card w-full animate-slide-up', sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-fleet-border">
          <h2 className="font-display text-base font-700 text-white">{title}</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-fleet-subtle hover:text-fleet-text hover:bg-fleet-muted transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = false }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-sm animate-slide-up">
        <div className="p-6">
          <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center mb-4',
            danger ? 'bg-fleet-rose/10' : 'bg-fleet-amber/10')}>
            <AlertTriangle size={18} className={danger ? 'text-fleet-rose' : 'text-fleet-amber'} />
          </div>
          <h3 className="font-display text-base font-700 text-white mb-2">{title}</h3>
          <p className="text-fleet-subtle text-sm leading-relaxed mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={onClose} className="btn-ghost text-sm px-4 py-2">Cancel</button>
            <button onClick={() => { onConfirm(); onClose() }}
              className={clsx('px-4 py-2 rounded-lg text-sm font-semibold font-display transition-all',
                danger
                  ? 'bg-fleet-rose/10 text-fleet-rose border border-fleet-rose/30 hover:bg-fleet-rose/20'
                  : 'btn-amber')}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────
export function Skeleton({ className }) {
  return <div className={clsx('shimmer', className)} />
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-fleet-border/60">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={clsx('h-4 rounded', j === 0 ? 'w-24' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────
const STATUS_MAP = {
  AVAILABLE:   'available',
  IN_USE:      'in-use',
  MAINTENANCE: 'maintenance',
  RETIRED:     'retired',
  COMPLETED:   'completed',
  IN_PROGRESS: 'in-progress',
  PENDING:     'pending',
  CANCELLED:   'cancelled',
  ACTIVE:      'completed',
  INACTIVE:    'retired',
  SUSPENDED:   'cancelled',
}

export function StatusBadge({ status }) {
  const cls = STATUS_MAP[status] || 'pending'
  return (
    <span className={`badge badge-${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status?.replace('_', ' ')}
    </span>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center gap-2 justify-end px-4 py-3 border-t border-fleet-border">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 0}
        className="p-1.5 rounded-lg border border-fleet-border text-fleet-subtle hover:text-fleet-text hover:border-fleet-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        <ChevronLeft size={14} />
      </button>
      <span className="font-mono text-xs text-fleet-subtle px-2">
        {page + 1} / {totalPages}
      </span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}
        className="p-1.5 rounded-lg border border-fleet-border text-fleet-subtle hover:text-fleet-text hover:border-fleet-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────
export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-fleet-muted border border-fleet-border flex items-center justify-center mb-4">
        <Icon size={22} className="text-fleet-subtle" />
      </div>
      <p className="font-display font-600 text-fleet-text mb-1">{title}</p>
      {description && <p className="text-fleet-subtle text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ─── Form Field ───────────────────────────────────────────────────────
export function Field({ label, error, children, hint }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-fleet-subtle uppercase tracking-wide block">{label}</label>}
      {children}
      {error && <p className="text-xs text-fleet-rose">{error}</p>}
      {hint && !error && <p className="text-xs text-fleet-subtle">{hint}</p>}
    </div>
  )
}

// ─── Page Header ─────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="section-heading">{title}</h1>
        {subtitle && <p className="text-fleet-subtle text-sm mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'amber', delta }) {
  const colors = {
    amber:   { bg: 'bg-fleet-amber/10',  border: 'border-fleet-amber/20',  text: 'text-fleet-amber',   icon: 'text-fleet-amber' },
    emerald: { bg: 'bg-fleet-emerald/10',border: 'border-fleet-emerald/20',text: 'text-fleet-emerald', icon: 'text-fleet-emerald' },
    sky:     { bg: 'bg-fleet-sky/10',    border: 'border-fleet-sky/20',    text: 'text-fleet-sky',     icon: 'text-fleet-sky' },
    rose:    { bg: 'bg-fleet-rose/10',   border: 'border-fleet-rose/20',   text: 'text-fleet-rose',    icon: 'text-fleet-rose' },
    indigo:  { bg: 'bg-fleet-indigo/10', border: 'border-fleet-indigo/20', text: 'text-fleet-indigo',  icon: 'text-fleet-indigo' },
  }
  const c = colors[color] || colors.amber
  return (
    <div className={clsx('card p-5 border', c.border, 'relative overflow-hidden group hover:shadow-amber-glow transition-shadow duration-300')}>
      <div className={clsx('absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-30', c.bg)} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-fleet-subtle">{label}</span>
          {Icon && (
            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', c.bg)}>
              <Icon size={15} className={c.icon} />
            </div>
          )}
        </div>
        <p className={clsx('font-mono text-3xl font-600', c.text)}>{value}</p>
        {delta != null && (
          <p className="text-xs text-fleet-subtle mt-1 font-mono">{delta}</p>
        )}
      </div>
    </div>
  )
}

// ─── Search Input ─────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-fleet-subtle" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        className="input-fleet pl-9 pr-4 py-2 h-9 text-sm"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
