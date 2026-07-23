import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ClockBadge, RiskBadge } from './Badges.jsx'
import AiInsightCard from './AiInsightCard.jsx'
import AiCopilotCard from './AiCopilotCard.jsx'
import WelcomeHeader from './WelcomeHeader.jsx'
import KpiCards from './KpiCards.jsx'
import BusinessHealth from './BusinessHealth.jsx'
import QuickActions from './QuickActions.jsx'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

export default function Dashboard({ onNavigate }) {
  const [summary, setSummary] = useState(null)
  const [urgent, setUrgent] = useState([])
  const [loadError, setLoadError] = useState(null)

  const loadData = () => {
    fetch('/api/dashboard-summary')
      .then((r) => r.json())
      .then(setSummary)
      .catch((e) => setLoadError(e.message))

    fetch('/api/invoices')
      .then((r) => r.json())
      .then((rows) => {
        const critical = rows
          .filter((r) => ['critical', 'breached'].includes(r.clock_180day))
          .sort((a, b) => b.total - a.total)
          .slice(0, 6)
        setUrgent(critical)
      })
      .catch((e) => setLoadError(e.message))
  }

  useEffect(() => {
    loadData()

    // Auto-refresh so the dashboard reflects invoices saved/edited elsewhere
    // (e.g. from the AI Analyzer) without needing a manual page reload.
    const interval = setInterval(loadData, 30_000)
    const onFocus = () => loadData()
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  // Quick actions route to the page that actually handles each task.
  // "send_reminders" and "reconcile_gst" don't have dedicated features yet —
  // routed to the closest relevant page for now (Alerts / Invoices) rather
  // than doing nothing, but these are stand-ins, not the real feature.
  const handleQuickAction = (key) => {
    switch (key) {
      case 'create_invoice':
        onNavigate?.('analyzer') // AI Analyzer's Upload & Extract tab
        break
      case 'record_payment':
        onNavigate?.('invoices') // Invoices page has "Mark paid" per row
        break
      case 'send_reminders':
        onNavigate?.('alerts') // closest existing match — no real reminder system yet
        break
      case 'reconcile_gst':
        onNavigate?.('invoices') // closest existing match — no real reconciliation feature yet
        break
      case 'export_report':
        onNavigate?.('forecast') // Cash-Flow Forecast has working PDF/Excel export
        break
      default:
        break
    }
  }

  if (loadError) {
    return (
      <div style={{ color: 'var(--danger)', fontSize: 14 }}>
        Couldn't load dashboard data: {loadError}
      </div>
    )
  }

  if (!summary) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading…</div>
  }

  const chartData = [
    { name: 'Locked in GST\n(unpaid)', value: summary.locked_gst_capital, color: 'var(--accent)' },
    { name: 'High-risk\nexposure', value: summary.high_risk_value, color: 'var(--danger)' },
    { name: 'Total unpaid\nexposure', value: summary.total_unpaid_exposure, color: 'var(--text-dim)' },
  ]

  return (
    <div>
      <WelcomeHeader />
      <AiInsightCard summary={summary} />
      <AiCopilotCard />
      

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 8, letterSpacing: 1 }}>
          GST CASH-FLOW EXPOSURE
        </div>
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1.1 }}>
          {fmt(summary.locked_gst_capital)}
        </div>
        <div
  style={{
    fontSize: 14,
    color: "var(--text-muted)",
    marginTop: 8,
    maxWidth: 620,
    lineHeight: 1.6,
  }}
>
  GST already paid to the government on{" "}
  <strong>{summary.unpaid_invoice_count}</strong> unpaid invoices.
  <br />
  This amount remains locked until your customers pay, reducing your available
  working capital and increasing cash-flow pressure.
</div>
      </div>

      <QuickActions onAction={handleQuickAction} />

      <KpiCards summary={summary} />

      <BusinessHealth summary={summary} />

      <div
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
          padding: '24px 24px 8px 8px', marginBottom: 32, height: 240,
        }}
      >
        <div
  style={{
    fontSize: 13,
    color: 'var(--text-muted)',
    marginBottom: 4,
    paddingLeft: 24,
    fontWeight: 600,
  }}
>
  AI Breakdown of GST Cash Exposure
</div>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 40, top: 10, bottom: 10 }}>
            <XAxis type="number" tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} stroke="var(--text-dim)" fontSize={11} />
            <YAxis type="category" dataKey="name" width={130} stroke="var(--text-muted)" fontSize={12} />
            <Tooltip
              formatter={(v) => fmt(v)}
              contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'var(--text)' }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          Most urgent — nearing or past the 180-day ITC-reversal window
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
          {urgent.length === 0 && (
            <div style={{ padding: 20, background: 'var(--bg-card)', color: 'var(--text-dim)', fontSize: 13 }}>
              Nothing urgent right now.
            </div>
          )}
          {urgent.map((inv) => (
            <div
              key={inv.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', background: 'var(--bg-card)',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{inv.client_name}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                  {inv.invoice_number} · {inv.days_overdue}d overdue
                </div>
              </div>
              <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 20,
  }}
>
  <RiskBadge
    score={inv.risk_score}
    bucket={inv.risk_bucket}
  />

  <span
    className="mono"
    style={{
      fontSize: 14,
      minWidth: 110,
      textAlign: "right",
    }}
  >
    {fmt(inv.total)}
  </span>

  <ClockBadge status={inv.clock_180day} />

  <div
    style={{
      minWidth: 170,
      fontSize: 13,
      fontWeight: 600,
      color: "var(--accent)",
    }}
  >
    {inv.clock_180day === "breached"
      ? "⚠ Issue Credit Note"
      : inv.risk_bucket === "high"
      ? "📞 Call Client Today"
      : inv.risk_bucket === "medium"
      ? "📧 Send Reminder"
      : "✅ Monitor"}
  </div>
</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}