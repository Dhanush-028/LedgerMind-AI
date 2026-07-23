import { motion } from 'framer-motion'
import { FilePlus, IndianRupee, BellRing, FileCheck2, Download } from 'lucide-react'

const DEFAULT_ACTIONS = [
  {
    key: 'create_invoice',
    label: 'Create Invoice',
    desc: 'Bill a client',
    icon: FilePlus,
    color: 'var(--accent)',
  },
  {
    key: 'record_payment',
    label: 'Record Payment',
    desc: 'Mark an invoice paid',
    icon: IndianRupee,
    color: 'var(--safe)',
  },
  {
    key: 'send_reminders',
    label: 'Send Reminders',
    desc: 'Nudge overdue clients',
    icon: BellRing,
    color: 'var(--warning)',
  },
  {
    key: 'reconcile_gst',
    label: 'Reconcile GST',
    desc: 'Match ITC to filings',
    icon: FileCheck2,
    color: 'var(--accent)',
  },
  {
    key: 'export_report',
    label: 'Export Report',
    desc: 'Download exposure summary',
    icon: Download,
    color: 'var(--text-muted)',
  },
]

/**
 * Renders a row of primary actions.
 * Pass `onAction(key)` to wire these up to real handlers (routing, modals, API calls).
 * If omitted, falls back to a console log so the component never silently no-ops.
 */
export default function QuickActions({ actions = DEFAULT_ACTIONS, onAction }) {
  const handleClick = (key) => {
    if (onAction) {
      onAction(key)
    } else {
      // eslint-disable-next-line no-console
      console.warn(`QuickActions: no onAction handler wired up for "${key}"`)
    }
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Quick actions</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))',
          gap: 14,
        }}
      >
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.key}
              onClick={() => handleClick(action.key)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ y: -3, borderColor: action.color }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 14,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: `${action.color}22`,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={action.color} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{action.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{action.desc}</div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}