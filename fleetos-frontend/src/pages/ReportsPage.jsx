import { useState } from 'react'
import { FileText, Sheet, Download, CheckCircle2, AlertCircle } from 'lucide-react'
import { reportApi } from '../api/services'
import { PageHeader, StatCard } from '../components/ui/index'
import { useDashboardStats } from '../hooks/useApi'
import toast from 'react-hot-toast'

function ReportCard({ icon: Icon, title, description, format, color, onDownload, loading }) {
  const colors = {
    amber:   { card: 'border-fleet-amber/20 hover:border-fleet-amber/40', icon: 'bg-fleet-amber/10 text-fleet-amber', btn: 'btn-amber' },
    emerald: { card: 'border-fleet-emerald/20 hover:border-fleet-emerald/40', icon: 'bg-fleet-emerald/10 text-fleet-emerald', btn: 'bg-fleet-emerald/10 text-fleet-emerald border border-fleet-emerald/30 hover:bg-fleet-emerald/20 font-display font-700 text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-all' },
  }
  const c = colors[color] || colors.amber

  return (
    <div className={`card p-6 border transition-colors ${c.card}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon size={22} />
        </div>
        <span className="text-xs font-mono font-600 px-2 py-1 rounded bg-fleet-muted text-fleet-subtle border border-fleet-border">
          {format}
        </span>
      </div>
      <h3 className="font-display font-700 text-white text-base mb-2">{title}</h3>
      <p className="text-fleet-subtle text-sm leading-relaxed mb-6">{description}</p>
      <button onClick={onDownload} disabled={loading} className={color === 'amber' ? `btn-amber text-sm ${loading ? 'opacity-60' : ''}` : c.btn}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            Generating…
          </span>
        ) : (
          <><Download size={14} /> Download {format}</>
        )}
      </button>
    </div>
  )
}

export default function ReportsPage() {
  const [pdfLoading, setPdfLoading]     = useState(false)
  const [excelLoading, setExcelLoading] = useState(false)
  const { data: stats } = useDashboardStats()

  const downloadFile = async (fetchFn, filename, mimeType, setLoading) => {
    setLoading(true)
    try {
      const res = await fetchFn()
      const url = URL.createObjectURL(new Blob([res.data], { type: mimeType }))
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch {
      toast.error('Download failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Reports"
        subtitle="Generate and download fleet reports in multiple formats"
      />

      {/* Summary stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 stagger">
          <StatCard label="Total Vehicles" value={stats.totalVehicles} color="sky" />
          <StatCard label="Completed Trips" value={stats.completedTrips} color="emerald" />
          <StatCard label="Active Drivers" value={stats.totalDrivers} color="indigo" />
          <StatCard label="Distance (km)" value={Math.round(stats.totalDistanceKm).toLocaleString()} color="amber" />
        </div>
      )}

      {/* Report cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        <ReportCard
          icon={FileText}
          title="Fleet PDF Report"
          description="A styled PDF document containing all active vehicles with their status, registration details, insurance, and odometer readings. Ideal for management review."
          format="PDF"
          color="amber"
          loading={pdfLoading}
          onDownload={() => downloadFile(
            reportApi.downloadPdf,
            `fleet-report-${new Date().toISOString().slice(0,10)}.pdf`,
            'application/pdf',
            setPdfLoading
          )}
        />

        <ReportCard
          icon={Sheet}
          title="Fleet Excel Export"
          description="A structured spreadsheet with all vehicle data including VINs, capacities, fuel types, and expiry dates. Use for bulk editing, data analysis, or compliance records."
          format="XLSX"
          color="emerald"
          loading={excelLoading}
          onDownload={() => downloadFile(
            reportApi.downloadExcel,
            `fleet-export-${new Date().toISOString().slice(0,10)}.xlsx`,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            setExcelLoading
          )}
        />
      </div>

      {/* Info */}
      <div className="mt-8 p-4 rounded-lg border border-fleet-border bg-fleet-surface flex items-start gap-3">
        <CheckCircle2 size={16} className="text-fleet-emerald mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-fleet-text">Reports reflect live data</p>
          <p className="text-xs text-fleet-subtle mt-0.5">
            All reports are generated in real-time from the current fleet database. No caching — every download is fresh.
          </p>
        </div>
      </div>
    </div>
  )
}
