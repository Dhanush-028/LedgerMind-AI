const CLOCK_STYLES = {
  safe:     { bg: 'var(--safe-dim)',    color: 'var(--safe)',    label: 'Safe' },
  warning:  { bg: 'var(--warning-dim)', color: 'var(--warning)', label: '≤60d left' },
  critical: { bg: 'var(--danger-dim)',  color: 'var(--danger)',  label: '≤30d left' },
  breached: { bg: 'var(--danger-dim)',  color: 'var(--danger)',  label: '180d breached' },
  'n/a':    { bg: 'var(--bg-card)',     color: 'var(--text-dim)', label: 'Paid' },
}

export function ClockBadge({ status }) {
  const s = CLOCK_STYLES[status] || CLOCK_STYLES['n/a']
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
      background: s.bg, color: s.color, fontFamily: 'var(--font-mono)',
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

export function RiskBadge({ score, bucket }) {
  const colors = {
    high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--safe)',
  }
  const color = colors[bucket] || 'var(--text-dim)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-mono)', fontSize: 12, color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {(score * 100).toFixed(1)}%
    </span>
  )
}
