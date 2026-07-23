import CountUp from 'react-countup'
import { motion } from 'framer-motion'
import { Wallet, AlertTriangle, ShieldAlert, FileWarning } from 'lucide-react'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

const CARDS = [
  {
    key: 'risk',
    title: '180-Day Clock — At Risk',
    sub: 'invoices within 60 days of ITC reversal',
    color: 'var(--warning)',
    icon: AlertTriangle,
    currency: false,
  },
  {
    key: 'breached',
    title: '180-Day Clock — Breached',
    sub: 'dead tax — no refund possible',
    color: 'var(--danger)',
    icon: ShieldAlert,
    currency: false,
  },
  {
    key: 'highrisk',
    title: 'High-Risk Value',
    sub: 'predicted likely bad debt (AI-scored)',
    color: 'var(--danger)',
    icon: Wallet,
    currency: true,
  },
  {
    key: 'unpaid',
    title: 'Total Unpaid Exposure',
    sub: null, // filled dynamically below
    color: 'var(--accent)',
    icon: FileWarning,
    currency: true,
  },
]

export default function KpiCards({ summary }) {
  // Guard: don't crash if parent hasn't fetched yet
  if (!summary) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 22, marginBottom: 32 }}>
        {CARDS.map((c) => (
          <div
            key={c.key}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: 22,
              height: 128,
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    )
  }

  const values = {
    risk: summary.invoices_at_risk_180day ?? 0,
    breached: summary.invoices_180day_breached ?? 0,
    highrisk: summary.high_risk_value ?? 0,
    unpaid: summary.total_unpaid_exposure ?? 0,
  }

  const subs = {
    risk: CARDS[0].sub,
    breached: CARDS[1].sub,
    highrisk: CARDS[2].sub,
    unpaid: `${summary.unpaid_invoice_count ?? 0} of ${summary.total_invoices ?? 0} invoices unpaid`,
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
        gap: 22,
        marginBottom: 32,
      }}
    >
      {CARDS.map((card, index) => {
        const Icon = card.icon
        const value = values[card.key]

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            whileHover={{ y: -4 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: 22,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 10, letterSpacing: 0.3 }}>
                  {card.title.toUpperCase()}
                </div>
                <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: card.color, letterSpacing: -0.5 }}>
                  {card.currency ? (
                    fmt(value)
                  ) : (
                    <CountUp end={value} duration={1.2} separator="," />
                  )}
                </div>
              </div>

              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: `${card.color}22`,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon color={card.color} size={20} />
              </div>
            </div>

            {subs[card.key] && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {subs[card.key]}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}