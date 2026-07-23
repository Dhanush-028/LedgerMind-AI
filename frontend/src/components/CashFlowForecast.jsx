import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp, AlertTriangle, Lightbulb, Loader2, FileDown, Sheet } from 'lucide-react'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

const BUCKET_LABELS = {
  '0-30': 'Next 30 days',
  '31-60': '31–60 days',
  '61-90': '61–90 days',
  '90+': '90+ days',
}
const BUCKET_COLORS = {
  '0-30': 'var(--safe)',
  '31-60': 'var(--accent)',
  '61-90': 'var(--warning)',
  '90+': 'var(--danger)',
}

export default function CashFlowForecast() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(null) // 'pdf' | 'excel' | null

  useEffect(() => {
    fetch('/api/cashflow-forecast')
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  const exportFile = async (format) => {
    if (!data) return
    setExporting(format)
    try {
      const res = await fetch(`/api/cashflow-forecast/export-${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projection: data.projection, narrative: data.narrative }),
      })
      if (!res.ok) throw new Error(`Could not export ${format.toUpperCase()}.`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const ext = format === 'excel' ? 'xlsx' : 'pdf'
      a.href = url
      a.download = `cashflow-forecast-${new Date().toISOString().slice(0, 10)}.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message)
    } finally {
      setExporting(null)
    }
  }

  const chartData = data
    ? Object.entries(data.projection).map(([key, value]) => ({
        name: BUCKET_LABELS[key] || key,
        value,
        color: BUCKET_COLORS[key] || 'var(--accent)',
      }))
    : []

  const total = data ? Object.values(data.projection).reduce((a, b) => a + b, 0) : 0

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Cash-Flow Forecast</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Expected inflow from unpaid invoices, weighted by risk score and each client's typical payment delay.
      </div>

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 20 }}>Couldn't load forecast: {error}</div>
      )}

      {!data && !error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: 40, justifyContent: 'center',
          border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-card)',
        }}>
          <Loader2 size={18} color="var(--accent)" style={{ animation: 'fcspin 1s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading forecast…</span>
          <style>{`@keyframes fcspin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {data && (
        <>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: 1, marginBottom: 6 }}>
              TOTAL EXPECTED INFLOW (RISK-WEIGHTED)
            </div>
            <div className="mono" style={{ fontSize: 36, fontWeight: 700 }}>{fmt(total)}</div>
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '24px 24px 8px 8px', marginBottom: 24, height: 240,
          }}>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData} margin={{ left: 16, right: 24, top: 10, bottom: 10 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} stroke="var(--text-dim)" fontSize={11} />
                <Tooltip
                  formatter={(v) => fmt(v)}
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'var(--text)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={48}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 22,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color="var(--accent)" />
                <div style={{ fontSize: 13, color: 'var(--text-dim)', letterSpacing: 0.3 }}>AI FORECAST SUMMARY</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
  onClick={() => exportFile('pdf')}
  disabled={exporting !== null}
  style={exportBtnStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "#166534";
    e.currentTarget.style.transform = "scale(1.05)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "#14532d";
    e.currentTarget.style.transform = "scale(1)";
  }}
>
  <FileDown size={18} />
  {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
</button>
                <button
  onClick={() => exportFile('excel')}
  disabled={exporting !== null}
  style={exportBtnStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "#166534";
    e.currentTarget.style.transform = "scale(1.05)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "#14532d";
    e.currentTarget.style.transform = "scale(1)";
  }}
>
  <Sheet size={18} />
  {exporting === 'excel' ? 'Exporting…' : 'Export Excel'}
</button>
              </div>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, marginBottom: 18 }}>
              {data.narrative.summary}
            </div>

            {data.narrative.risks?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <AlertTriangle size={13} color="var(--warning)" />
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 0.3 }}>RISKS</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.narrative.risks.map((r, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.narrative.recommendations?.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Lightbulb size={13} color="var(--safe)" />
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 0.3 }}>RECOMMENDATIONS</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.narrative.recommendations.map((r, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const exportBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,

  minWidth: 180,
  height: 48,

  fontSize: 15,
  fontWeight: 700,

  borderRadius: 12,

  cursor: 'pointer',

  background: '#14532d',
  color: '#ffffff',

  border: '2px solid #84cc16',

  boxShadow: '0 8px 18px rgba(132,204,22,0.18)',

  transition: 'all .25s ease',
}