import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertOctagon, AlertTriangle, Info, RefreshCw, Loader2 } from 'lucide-react'

const SEVERITY = {
  critical: { icon: AlertOctagon, color: 'var(--danger)', label: 'Critical' },
  warning: { icon: AlertTriangle, color: 'var(--warning)', label: 'Warning' },
  info: { icon: Info, color: 'var(--accent)', label: 'Info' },
}

export default function Alerts() {
  const [alerts, setAlerts] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    setLoading(true)
    fetch('/api/alerts')
      .then((r) => r.json())
      .then((data) => { setAlerts(data); setError(null) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const counts = alerts
    ? alerts.reduce((acc, a) => { acc[a.severity] = (acc[a.severity] || 0) + 1; return acc }, {})
    : {}

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>Smart Alerts</div>
        <button onClick={load} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600,
          padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
        }}>
          {loading ? <Loader2 size={13} style={{ animation: 'alertspin 1s linear infinite' }} /> : <RefreshCw size={13} />}
          Refresh
          <style>{`@keyframes alertspin { to { transform: rotate(360deg); } }`}</style>
        </button>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Auto-generated from your live invoice data — ITC deadlines, high-risk clients, and upcoming due dates.
      </div>

      {alerts && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {Object.entries(SEVERITY).map(([key, s]) => (
            <div key={key} style={{
              flex: 1, padding: '14px 18px', borderRadius: 12, border: `1px solid ${s.color}40`,
              background: `${s.color}0f`,
            }}>
              <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  }}
>
  <s.icon size={24} color={s.color} />

  <div
    style={{
      fontSize: 30,
      fontWeight: 700,
      color: s.color,
    }}
  >
    {counts[key] || 0}
  </div>
</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {error && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 20 }}>Couldn't load alerts: {error}</div>}

      {!alerts && !error && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>Loading alerts…</div>
      )}

      {alerts && alerts.length === 0 && (
        <div style={{
          padding: 40, textAlign: 'center', borderRadius: 16, border: '1px solid var(--border)',
          background: 'var(--bg-card)', color: 'var(--text-dim)', fontSize: 13,
        }}>
          No alerts right now — everything looks under control.
        </div>
      )}

      {alerts && alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map((a) => {
            const s = SEVERITY[a.severity] || SEVERITY.info
            const Icon = s.icon
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 12,
                  border: '1px solid var(--border)', background: 'var(--bg-card)',
                }}
              >
                <Icon size={18} color={s.color} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}>{a.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{a.message}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}