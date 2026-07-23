import { useEffect, useState } from 'react'

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function ClientRisk() {
  const [clients, setClients] = useState([])

  useEffect(() => {
    fetch('/api/clients/risk').then(r => r.json()).then(setClients)
  }, [])

  const withRevenue = clients.filter(c => c.gross_revenue > 0)
  const maxRevenue = Math.max(...withRevenue.map(c => c.gross_revenue), 1)

  const getRiskBadge = (costPct) => {
  if (costPct >= 100) {
    return { label: "Critical", color: "#dc2626" }
  }

  if (costPct >= 60) {
    return { label: "High", color: "#ea580c" }
  }

  if (costPct >= 30) {
    return { label: "Medium", color: "#ca8a04" }
  }

  return {
    label: "Low",
    color: "#16a34a"
  }
}

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Client Risk Analysis</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 620 }}>
        Revenue looks the same on every invoice. It isn't the same once you price in the GST paid
        up front and the risk-weighted chance of never collecting. Sorted worst net value first.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {withRevenue.map(c => {
          const costPct = c.gross_revenue > 0 ? (c.true_cost / c.gross_revenue) * 100 : 0
          const isNegative = c.net_value < 0
          const risk = getRiskBadge(costPct)
          return (
            <div key={c.client_id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
              padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap"
  }}
>
  <span
    style={{
      fontWeight: 600,
      fontSize: 15
    }}
  >
    {c.name}
  </span>

  <span
    style={{
      fontSize: 12,
      color: "var(--text-dim)"
    }}
  >
    {c.sector}
  </span>

  <span
    style={{
      padding: "4px 10px",
      borderRadius: 999,
      background: risk.color,
      color: "#fff",
      fontSize: 11,
      fontWeight: 700,
    }}
  >
    {risk.label}
  </span>
</div>
                <div className="mono" style={{
                  fontSize: 15, fontWeight: 600, color: isNegative ? 'var(--danger)' : 'var(--safe)',
                }}>
                  {fmt(c.net_value)} net
                </div>
              </div>

              <div style={{ position: 'relative', height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${(c.gross_revenue / maxRevenue) * 100}%`,
                  background: 'var(--border-hover)', borderRadius: 4,
                }} />
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${(c.true_cost / maxRevenue) * 100}%`,
                  background: isNegative ? 'var(--danger)' : 'var(--warning)', borderRadius: 4, opacity: 0.85,
                }} />
              </div>

              <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--text-muted)' }} className="mono">
                <span>Revenue: <span style={{ color: 'var(--text)' }}>{fmt(c.gross_revenue)}</span></span>
                <span>Locked GST: <span style={{ color: 'var(--warning)' }}>{fmt(c.locked_gst)}</span></span>
                <span>Risk exposure: <span style={{ color: 'var(--danger)' }}>{fmt(c.risk_weighted_exposure)}</span></span>
                <span>Business Impact: <span style={{ color: 'var(--text)' }}>{costPct.toFixed(0)}% of revenue</span></span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
