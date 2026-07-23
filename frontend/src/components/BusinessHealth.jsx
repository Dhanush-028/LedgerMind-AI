import { motion } from 'framer-motion'
import { HeartPulse } from 'lucide-react'

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n))
const safeDiv = (a, b) => (b > 0 ? a / b : 0)

/**
 * Derives a 0-100 composite health score from the dashboard summary.
 * Three weighted factors:
 *  - Collection health: how much of your invoiced work is actually collected
 *  - Compliance health: how much GST is at risk of permanent ITC reversal
 *  - Exposure quality: how much of your unpaid money is "safe" vs high-risk
 */
function computeHealth(summary) {
  const totalInvoices = summary.total_invoices || 0
  const unpaid = summary.unpaid_invoice_count || 0
  const breached = summary.invoices_180day_breached || 0
  const atRisk = summary.invoices_at_risk_180day || 0
  const highRiskValue = summary.high_risk_value || 0
  const totalUnpaidExposure = summary.total_unpaid_exposure || 0

  const collection = clamp(100 * (1 - safeDiv(unpaid, totalInvoices)))
  const compliance = clamp(100 * (1 - safeDiv(breached * 2 + atRisk * 0.5, totalInvoices)))
  const exposureQuality = clamp(100 * (1 - safeDiv(highRiskValue, totalUnpaidExposure)))

  const overall = clamp(collection * 0.4 + compliance * 0.35 + exposureQuality * 0.25)

  return {
    overall: Math.round(overall),
    factors: [
      { label: 'Collection health', value: Math.round(collection), detail: `${totalInvoices - unpaid} of ${totalInvoices} invoices collected` },
      { label: 'GST compliance', value: Math.round(compliance), detail: `${breached} breached · ${atRisk} at risk` },
      { label: 'Exposure quality', value: Math.round(exposureQuality), detail: `${Math.round(safeDiv(highRiskValue, totalUnpaidExposure) * 100)}% of unpaid value is high-risk` },
    ],
  }
}

function statusFor(score) {
  if (score >= 75) return { label: 'Healthy', color: 'var(--safe)' }
  if (score >= 50) return { label: 'Moderate', color: 'var(--warning)' }
  return { label: 'Critical', color: 'var(--danger)' }
}

function Gauge({ score, color }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)

  return (
    <svg width={140} height={140} viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
      <circle cx={70} cy={70} r={radius} fill="none" stroke="var(--border)" strokeWidth={10} />
      <motion.circle
        cx={70}
        cy={70}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        transform="rotate(-90 70 70)"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <text x={70} y={66} textAnchor="middle" className="mono" fontSize={30} fontWeight={700} fill="var(--text)">
        {score}
      </text>
      <text x={70} y={86} textAnchor="middle" fontSize={11} fill="var(--text-dim)" letterSpacing={0.5}>
        / 100
      </text>
    </svg>
  )
}

function FactorBar({ label, value, detail }) {
  const color = value >= 75 ? 'var(--safe)' : value >= 50 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
        <span className="mono" style={{ fontSize: 13, color, fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: 'var(--border)', overflow: 'hidden', marginBottom: 6 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 4 }}
        />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{detail}</div>
    </div>
  )
}

export default function BusinessHealth({ summary }) {
  if (!summary) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
        padding: 24, marginBottom: 32, height: 200, opacity: 0.5,
      }} />
    )
  }

  const { overall, factors } = computeHealth(summary)
  const status = statusFor(overall)

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
      padding: '24px 26px', marginBottom: 32,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <HeartPulse size={18} color={status.color} />
        <div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: 0.3 }}>BUSINESS HEALTH</div>
      </div>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Gauge score={overall} color={status.color} />
          <div
            style={{
              fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
              color: status.color, background: `${status.color}1a`, border: `1px solid ${status.color}40`,
            }}
          >
            {status.label}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 240 }}>
          {factors.map((f) => (
            <FactorBar key={f.label} label={f.label} value={f.value} detail={f.detail} />
          ))}
        </div>
      </div>
    </div>
  )
}