import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud, FileText, Sparkles, Loader2, CheckCircle2,
  AlertTriangle, XCircle, RefreshCw, Download,
} from 'lucide-react'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

const ACTION_LABELS = {
  send_reminder: { text: 'Send reminder', color: 'var(--accent)' },
  escalate_collections: { text: 'Escalate collections', color: 'var(--warning)' },
  issue_credit_note: { text: 'Issue credit note', color: 'var(--warning)' },
  pursue_legally: { text: 'Pursue legally', color: 'var(--danger)' },
  monitor: { text: 'Monitor', color: 'var(--text-dim)' },
}

const URGENCY_COLOR = {
  low: 'var(--text-dim)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
  critical: 'var(--danger)',
}

const TABS = [
  { key: 'upload', label: 'Upload & Extract', icon: UploadCloud },
  { key: 'insights', label: 'AI Risk Insights', icon: Sparkles },
]

// ---------------------------------------------------------------------------

function UploadPanel() {
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState('idle') // idle | analyzing | ready | saving | error
  const [extracted, setExtracted] = useState(null)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)

  const analyzeFile = async (file) => {
    if (!file) return
    setFileName(file.name)
    setStatus('analyzing')
    setError(null)

    const form = new FormData()
    form.append('invoice', file)

    try {
      const res = await fetch('/api/invoices/analyze-upload', { method: 'POST', body: form })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Could not analyze this file.')
      }
      const data = await res.json()
      setExtracted(data)
      setStatus('ready')
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }

  const updateField = (key, value) => setExtracted((prev) => ({ ...prev, [key]: value }))

  const saveInvoice = async () => {
    setStatus('saving')
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extracted),
      })
      if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Could not save invoice.')
}
      alert("✅ Invoice saved successfully!")

      setStatus('ready')
    } catch (e) {
      setError(e.message)
      setStatus('ready') // keep the extracted data so they don't lose it
    }
  }

  const reset = () => {
    setStatus('idle')
    setExtracted(null)
    setFileName(null)
    setError(null)
  }

  return (
    <div>
      {status === 'idle' && (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            analyzeFile(e.dataTransfer.files?.[0])
          }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 10, padding: '48px 24px', borderRadius: 16, cursor: 'pointer',
            border: `1.5px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
            background: dragOver ? 'var(--accent-glow)' : 'var(--bg-card)',
            transition: 'all 0.15s',
          }}
        >
          <UploadCloud size={32} color={dragOver ? 'var(--accent)' : 'var(--text-dim)'} />
          <div style={{ fontSize: 14, fontWeight: 600 }}>Drop an invoice here, or click to browse</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>PDF, JPG, PNG, or WEBP · up to 10MB</div>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => analyzeFile(e.target.files?.[0])}
          />
        </label>
      )}

      {status === 'analyzing' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          padding: '48px 24px', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-card)',
        }}>
          <Loader2 size={28} color="var(--accent)" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Reading {fileName}…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {status === 'error' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          padding: '32px 24px', borderRadius: 16, border: '1px solid var(--danger)', background: 'var(--bg-card)',
        }}>
          <XCircle size={26} color="var(--danger)" />
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>{error}</div>
          <button onClick={reset} style={btnStyle('var(--accent)')}>
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      )}

      {(status === 'ready' || status === 'saving') && extracted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-card)', padding: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <FileText size={18} color="var(--accent)" />
            <div style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{fileName}</div>
            <ConfidenceBadge level={extracted.confidence} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <Field label="Client name" value={extracted.client_name} onChange={(v) => updateField('client_name', v)} />
            <Field label="Invoice number" value={extracted.invoice_number} onChange={(v) => updateField('invoice_number', v)} />
            <Field label="Invoice date" value={extracted.invoice_date} onChange={(v) => updateField('invoice_date', v)} />
            <Field label="Due date" value={extracted.due_date} onChange={(v) => updateField('due_date', v)} />
            <Field label="Taxable amount" value={extracted.taxable_amount} onChange={(v) => updateField('taxable_amount', Number(v))} numeric />
            <Field label="GST amount" value={extracted.gst_amount} onChange={(v) => updateField('gst_amount', Number(v))} numeric />
            <Field label="Total" value={extracted.total} onChange={(v) => updateField('total', Number(v))} numeric />
            <Field label="GSTIN" value={extracted.gstin} onChange={(v) => updateField('gstin', v)} />
          </div>

          {extracted.validation && (
  <div
    style={{
      marginBottom: 20,
      padding: 16,
      borderRadius: 12,
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)"
    }}
  >
    <h3 style={{ marginBottom: 12 }}>GST Validation</h3>

    <ValidationRow label="GSTIN Format" ok={extracted.validation.gstin_valid} />
    <ValidationRow label="GST Rate" ok={extracted.validation.gst_rate_valid} />
    <ValidationRow label="GST Calculation" ok={extracted.validation.gst_valid} />
    <ValidationRow label="Invoice Total" ok={extracted.validation.total_valid} />
    <ValidationRow label="Tax Split" ok={extracted.validation.split_valid} />

    <div
  style={{
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
    color: "var(--text)"
  }}
>
  <div><b>Expected GST:</b> ₹{extracted.validation.expected_gst}</div>

  <div><b>Detected GST:</b> ₹{extracted.gst_amount}</div>

  <div style={{ marginTop: 8 }}>
    <b>Expected Total:</b> ₹{extracted.validation.expected_total}
  </div>

  <div>
    <b>Detected Total:</b> ₹{extracted.total}
  </div>

  <div
    style={{
      marginTop: 10,
      fontWeight: 700,
      color:
        extracted.validation.health_score >= 90
          ? "#16a34a"
          : extracted.validation.health_score >= 70
          ? "#ca8a04"
          : "#dc2626"
    }}
  >
    Health Score : {extracted.validation.health_score}%
  </div>
</div>
  </div>
)}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveInvoice} disabled={status === 'saving'} style={btnStyle('var(--safe)', true)}>
              {status === 'saving' ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={14} />}
              {status === 'saving' ? 'Saving…' : 'Confirm & Save Invoice'}
            </button>
            <button onClick={reset} disabled={status === 'saving'} style={btnStyle('var(--text-dim)')}>
              Discard
            </button>
          </div>
          {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 10 }}>{error}</div>}
        </motion.div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, numeric }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 5 }}>{label}</div>
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        type={numeric ? 'number' : 'text'}
        className={numeric ? 'mono' : undefined}
        style={{
          width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--bg-elevated)', color: 'var(--text)', fontSize: 13,
        }}
      />
    </div>
  )
}

function ConfidenceBadge({ level }) {
  const map = {
    high: { color: 'var(--safe)', text: 'High confidence' },
    medium: { color: 'var(--warning)', text: 'Check fields' },
    low: { color: 'var(--danger)', text: 'Low confidence — review carefully' },
  }
  const c = map[level] || map.medium
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
      color: c.color, background: `${c.color}1a`, border: `1px solid ${c.color}40`,
    }}>
      {c.text}
    </span>
  )
}
function ValidationRow({ label, ok }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 8
      }}
    >
      <span>{label}</span>

      {ok ? (
        <CheckCircle2 color="green" size={18} />
      ) : (
        <XCircle color="red" size={18} />
      )}
    </div>
  );
}
function btnStyle(color, filled) {
  return {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
    padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
    border: `1px solid ${color}`,
    background: filled ? color : 'transparent',
    color: filled ? 'var(--bg-elevated)' : color,
  }
}

// ---------------------------------------------------------------------------

function InsightsPanel() {
  const [status, setStatus] = useState('idle') // idle | loading | ready | error
  const [result, setResult] = useState(null)
  const [invoiceMap, setInvoiceMap] = useState({})
  const [rawInvoices, setRawInvoices] = useState([])
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const runAnalysis = async () => {
    setStatus('loading')
    setError(null)
    try {
      const invoices = await fetch('/api/invoices?status=unpaid').then((r) => r.json())
      if (invoices.length === 0) {
        setResult({ summary: 'No unpaid invoices right now — nothing to analyze.', flagged_invoices: [], portfolio_insights: [] })
        setRawInvoices([])
        setStatus('ready')
        return
      }
      setInvoiceMap(Object.fromEntries(invoices.map((inv) => [inv.id, inv])))
      setRawInvoices(invoices)

      const res = await fetch('/api/invoices/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoices }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Analysis failed.')
      }
      setResult(await res.json())
      setStatus('ready')
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }

  const downloadReport = async () => {
    setDownloading(true)
    try {
      const res = await fetch('/api/invoices/ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insights: result, invoices: rawInvoices }),
      })
      if (!res.ok) throw new Error('Could not generate the report.')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ledgermind-ai-report-${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      {status === 'idle' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          padding: '48px 24px', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-card)',
        }}>
          <Sparkles size={28} color="var(--accent)" />
          <div style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 380 }}>
            Run AI analysis across all unpaid invoices to surface which ones need attention and why.
          </div>
          <button onClick={runAnalysis} style={btnStyle('var(--accent)', true)}>
            <Sparkles size={14} /> Run AI Risk Analysis
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          padding: '48px 24px', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-card)',
        }}>
          <Loader2 size={28} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Analyzing your unpaid invoices…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {status === 'error' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          padding: '32px 24px', borderRadius: 16, border: '1px solid var(--danger)', background: 'var(--bg-card)',
        }}>
          <XCircle size={26} color="var(--danger)" />
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{error}</div>
          <button onClick={runAnalysis} style={btnStyle('var(--accent)')}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      <AnimatePresence>
        {status === 'ready' && result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
              padding: 20, marginBottom: 18,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', letterSpacing: 0.3 }}>AI SUMMARY</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={downloadReport} disabled={downloading} style={{ ...btnStyle('var(--accent)'), padding: '5px 10px', fontSize: 11 }}>
                    <Download size={12} /> {downloading ? 'Generating…' : 'Download PDF'}
                  </button>
                  <button onClick={runAnalysis} style={{ ...btnStyle('var(--text-dim)'), padding: '5px 10px', fontSize: 11 }}>
                    <RefreshCw size={12} /> Re-run
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{result.summary}</div>

              {result.portfolio_insights?.length > 0 && (
                <ul style={{ marginTop: 14, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.portfolio_insights.map((p, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{p}</li>
                  ))}
                </ul>
              )}
            </div>

            {result.flagged_invoices?.length > 0 && (
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Flagged invoices — ordered as returned by the model
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {result.flagged_invoices.map((f) => {
                    const inv = invoiceMap[f.invoice_id]
                    const action = ACTION_LABELS[f.recommended_action] || ACTION_LABELS.monitor
                    return (
                      <div key={f.invoice_id} style={{ padding: '14px 18px', background: 'var(--bg-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>
                            {inv?.client_name || `Invoice #${f.invoice_id}`}
                            {inv && <span className="mono" style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 400, marginLeft: 8 }}>{fmt(inv.total)}</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: URGENCY_COLOR[f.urgency] }}>
                              {f.urgency?.toUpperCase()}
                            </span>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                              color: action.color, background: `${action.color}1a`, border: `1px solid ${action.color}40`,
                            }}>
                              {action.text}
                            </span>
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, display: 'flex', gap: 6 }}>
                          <AlertTriangle size={14} color="var(--text-dim)" style={{ flexShrink: 0, marginTop: 2 }} />
                          {f.reason}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------

export default function InvoiceAnalyzer() {
  const [tab, setTab] = useState('upload')

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>AI Invoice Analyzer</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Upload invoices to auto-extract details, or let Gemini scan your unpaid book for risk.
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 20, border: '1px solid var(--border)',
                background: tab === t.key ? 'var(--accent-glow)' : 'transparent',
                color: tab === t.key ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 13, fontWeight: 500,
              }}
            >
              <Icon size={14} /> {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'upload' ? <UploadPanel /> : <InsightsPanel />}
    </div>
  )
}