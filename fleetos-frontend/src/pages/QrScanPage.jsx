import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { QrCode, Scan, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { PageHeader } from '../components/ui/index'

export default function QrScanPage() {
  const scannerRef = useRef(null)
  const [status, setStatus]     = useState('idle') // idle | scanning | success | error
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      aspectRatio: 1.0,
    }, false)

    scanner.render(
      (decodedText) => {
        scanner.clear()
        setStatus('success')
        setResult(decodedText)

        // If it's a FleetOS vehicle URL, extract UUID and navigate
        const match = decodedText.match(/\/vehicles\/([a-f0-9-]{36})/)
        if (match) {
          setTimeout(() => navigate(`/vehicles/uuid/${match[1]}`), 1500)
        }
      },
      (err) => {
        // Only set error on actual failures, not "no QR code detected"
        if (!err.includes('NotFoundException')) {
          setError(err)
          setStatus('error')
        }
      }
    )

    scannerRef.current = scanner
    setStatus('scanning')

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
      }
    }
  }, [navigate])

  const handleReset = () => {
    setStatus('idle')
    setResult(null)
    setError(null)
    window.location.reload()
  }

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <PageHeader
        title="QR Scanner"
        subtitle="Scan a vehicle QR code to view its details"
      />

      <div className="card p-6">
        {/* Status header */}
        <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-fleet-muted border border-fleet-border">
          {status === 'scanning' && (
            <>
              <div className="w-2 h-2 rounded-full bg-fleet-amber animate-pulse-dot" />
              <span className="text-sm text-fleet-text font-medium">Camera active — point at a FleetOS QR code</span>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 size={16} className="text-fleet-emerald" />
              <span className="text-sm text-fleet-emerald font-medium">QR code scanned successfully!</span>
            </>
          )}
          {status === 'error' && (
            <>
              <AlertCircle size={16} className="text-fleet-rose" />
              <span className="text-sm text-fleet-rose font-medium">Scanner error</span>
            </>
          )}
          {status === 'idle' && (
            <>
              <QrCode size={16} className="text-fleet-subtle" />
              <span className="text-sm text-fleet-subtle">Initialising camera…</span>
            </>
          )}
        </div>

        {/* Scanner container */}
        {status !== 'success' && (
          <div className="rounded-xl overflow-hidden border border-fleet-border relative">
            <div id="qr-reader" className="w-full" />
            {/* Scan overlay corners */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 relative">
                {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2',
                  'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((pos, i) => (
                  <div key={i} className={`absolute w-5 h-5 border-fleet-amber ${pos} rounded-sm`} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success result */}
        {status === 'success' && result && (
          <div className="space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-fleet-emerald/10 border-2 border-fleet-emerald/30 mx-auto">
              <CheckCircle2 size={28} className="text-fleet-emerald" />
            </div>
            <div className="text-center">
              <p className="font-display font-600 text-white mb-1">Code scanned!</p>
              <p className="text-fleet-subtle text-sm">Redirecting to vehicle details…</p>
            </div>

            <div className="p-3 rounded-lg bg-fleet-muted border border-fleet-border">
              <p className="text-xs text-fleet-subtle mb-1 font-mono uppercase tracking-wide">Decoded URL</p>
              <p className="text-xs font-mono text-fleet-text break-all">{result}</p>
            </div>

            {!result.includes('/vehicles/') && (
              <a href={result} target="_blank" rel="noopener noreferrer"
                className="btn-ghost w-full justify-center text-sm py-2.5">
                <ExternalLink size={14} /> Open URL
              </a>
            )}

            <button onClick={handleReset} className="btn-amber w-full justify-center text-sm py-2.5">
              <Scan size={14} /> Scan Another
            </button>
          </div>
        )}

        {/* Tips */}
        {status === 'scanning' && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: '💡', tip: 'Ensure good lighting' },
              { icon: '📐', tip: 'Hold phone steady' },
              { icon: '🎯', tip: 'Fill the scan frame' },
            ].map(({ icon, tip }) => (
              <div key={tip} className="text-center p-3 rounded-lg bg-fleet-muted border border-fleet-border">
                <div className="text-lg mb-1">{icon}</div>
                <p className="text-xs text-fleet-subtle">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inline style overrides for html5-qrcode */}
      <style>{`
        #qr-reader { background: #0d1421 !important; }
        #qr-reader video { border-radius: 0 !important; }
        #qr-reader__scan_region { background: transparent !important; }
        #qr-reader__dashboard { background: #0d1421 !important; padding: 12px !important; border-top: 1px solid #1a2540 !important; }
        #qr-reader__dashboard button {
          background: #f59e0b !important; color: #000 !important; border: none !important;
          padding: 8px 16px !important; border-radius: 6px !important; font-weight: 700 !important;
          font-family: 'Syne', sans-serif !important; font-size: 12px !important; cursor: pointer !important;
        }
        #qr-reader__dashboard select {
          background: #1a2540 !important; color: #c8d6f0 !important; border: 1px solid #1a2540 !important;
          padding: 6px 10px !important; border-radius: 6px !important;
        }
        #qr-reader__status_span { color: #5a7299 !important; font-size: 11px !important; font-family: 'JetBrains Mono', monospace !important; }
        #qr-reader__header_message { color: #5a7299 !important; font-size: 11px !important; }
      `}</style>
    </div>
  )
}
