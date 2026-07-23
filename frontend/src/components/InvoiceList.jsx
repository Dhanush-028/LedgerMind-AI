import { useEffect, useState } from 'react'
import { ClockBadge, RiskBadge } from './Badges.jsx'
import { Pencil, Trash2, Check, X } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const STATUS_FILTERS = [
  { key: null, label: 'All' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'paid', label: 'Paid' },
]

const ACTION_LABELS = {
  issue_credit_note: { text: 'Issue credit note', color: 'var(--warning)' },
  pursue_legally: { text: 'Pursue legally', color: 'var(--danger)' },
  escalate_collections: { text: 'Escalate collections', color: 'var(--warning)' },
  wait: { text: 'Monitor', color: 'var(--safe)' },
  none: { text: 'No action needed', color: 'var(--text-dim)' },
}

const EDITABLE_FIELDS = [
  { key: 'invoice_number', label: 'Invoice #', numeric: false },
  { key: 'invoice_date', label: 'Invoice date', numeric: false },
  { key: 'due_date', label: 'Due date', numeric: false },
  { key: 'amount', label: 'Taxable amount', numeric: true },
  { key: 'gst_amount', label: 'GST amount', numeric: true },
]

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([])
  const [status, setStatus] = useState('unpaid')
  const [expanded, setExpanded] = useState(null)
  const [detail, setDetail] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState({})
  const [deletingId, setDeletingId] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    fetch(`/api/invoices?${params}`).then(r => r.json()).then(setInvoices)
  }

  useEffect(load, [status])

  const toggleExpand = (id) => {
    if (editingId) return // don't collapse/expand while editing
    if (expanded === id) {
      setExpanded(null)
      setDetail(null)
      return
    }
    setExpanded(id)
    fetch(`/api/invoices/${id}`).then(r => r.json()).then(setDetail)
  }

  const markPaid = async (id, e) => {
    e.stopPropagation()
    setBusyId(id)
    await fetch(`/api/invoices/${id}/mark-paid`, { method: 'POST' })
    setBusyId(null)
    load()
  }

  const startEdit = (inv, e) => {
    e.stopPropagation()
    setExpanded(null)
    setEditingId(inv.id)
    setEditDraft({
      invoice_number: inv.invoice_number,
      invoice_date: inv.invoice_date,
      due_date: inv.due_date,
      amount: inv.amount,
      gst_amount: inv.gst_amount,
    })
  }

  const cancelEdit = (e) => {
    e.stopPropagation()
    setEditingId(null)
    setEditDraft({})
  }

  const saveEdit = async (id, e) => {
    e.stopPropagation()
    setBusyId(id)
    await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editDraft,
        amount: Number(editDraft.amount),
        gst_amount: Number(editDraft.gst_amount),
      }),
    })
    setBusyId(null)
    setEditingId(null)
    setEditDraft({})
    load()
  }

  const confirmDelete = (id, e) => {
    e.stopPropagation()
    setDeletingId(id)
  }

  const cancelDelete = (e) => {
    e.stopPropagation()
    setDeletingId(null)
  }

  const doDelete = async (id, e) => {
    e.stopPropagation()
    setBusyId(id)
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    setBusyId(null)
    setDeletingId(null)
    if (expanded === id) { setExpanded(null); setDetail(null) }
    load()
  }

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Invoices</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Every row is a GST liability already incurred — sorted by how urgently it needs attention.
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {STATUS_FILTERS.map(f => (
          <button key={f.label} onClick={() => setStatus(f.key)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)',
              background: status === f.key ? 'var(--accent-glow)' : 'transparent',
              color: status === f.key ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: 500,
            }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.8fr 0.8fr 0.9fr 1fr',
          padding: '10px 18px', fontSize: 11, color: 'var(--text-dim)', letterSpacing: 0.5,
          background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)',
        }}>
          <div>CLIENT</div><div>INVOICE</div><div>AMOUNT</div><div>OVERDUE</div>
          <div>RISK</div><div>180-DAY</div><div style={{ textAlign: 'right' }}>ACTIONS</div>
        </div>

        {invoices.map(inv => {
          const isEditing = editingId === inv.id
          const isDeleting = deletingId === inv.id
          const isBusy = busyId === inv.id

          return (
          <div key={inv.id}>
            {isEditing ? (
              <div style={{
                padding: '14px 18px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>
                  Editing — {inv.client_name}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 12 }}>
                  {EDITABLE_FIELDS.map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 4 }}>{f.label}</div>
                      <input
                        value={editDraft[f.key] ?? ''}
                        type={f.numeric ? 'number' : 'text'}
                        onChange={(e) => setEditDraft(d => ({ ...d, [f.key]: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        className={f.numeric ? 'mono' : undefined}
                        style={{
                          width: '100%', padding: '6px 8px', borderRadius: 6, fontSize: 12,
                          border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text)',
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={(e) => saveEdit(inv.id, e)} disabled={isBusy} style={{
                    display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
                    padding: '6px 12px', borderRadius: 6, border: '1px solid var(--safe)',
                    background: 'var(--safe)', color: 'var(--bg-elevated)', cursor: 'pointer',
                  }}>
                    <Check size={13} /> {isBusy ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={cancelEdit} disabled={isBusy} style={{
                    display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
                    padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                  }}>
                    <X size={13} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => toggleExpand(inv.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.8fr 0.8fr 0.9fr 1fr',
                  padding: '13px 18px', fontSize: 13, alignItems: 'center', cursor: 'pointer',
                  background: expanded === inv.id ? 'var(--bg-card)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ fontWeight: 500 }}>{inv.client_name}</div>
                <div className="mono" style={{ color: 'var(--text-dim)', fontSize: 12 }}>{inv.invoice_number}</div>
                <div className="mono">{fmt(inv.total)}</div>
                <div className="mono" style={{ color: inv.days_overdue > 0 ? 'var(--danger)' : 'var(--text-dim)' }}>
                  {inv.status === 'paid' ? '—' : `${inv.days_overdue}d`}
                </div>
                <div><RiskBadge score={inv.risk_score} bucket={inv.risk_bucket} /></div>
                <div><ClockBadge status={inv.clock_180day} /></div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                  {isDeleting ? (
                    <>
                      <span style={{ fontSize: 11, color: 'var(--danger)', alignSelf: 'center', marginRight: 4 }}>Delete?</span>
                      <button onClick={(e) => doDelete(inv.id, e)} disabled={isBusy} style={iconBtn('var(--danger)', true)}>
                        <Check size={13} />
                      </button>
                      <button onClick={cancelDelete} disabled={isBusy} style={iconBtn('var(--text-dim)')}>
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      {inv.status === 'unpaid' && (
                        <button onClick={(e) => markPaid(inv.id, e)} disabled={isBusy} style={{
                          fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border-hover)',
                          background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
                        }}>Mark paid</button>
                      )}
                      <button onClick={(e) => startEdit(inv, e)} style={iconBtn('var(--text-muted)')} title="Edit">
                        <Pencil size={13} />
                      </button>
                      <button onClick={(e) => confirmDelete(inv.id, e)} style={iconBtn('var(--text-muted)')} title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {expanded === inv.id && detail && !isEditing && (
              <div style={{
                padding: '16px 18px 20px 18px', background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border)', display: 'flex', gap: 32,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>INVOICE DETAIL</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.9 }}>
                    Taxable value: <span className="mono" style={{ color: 'var(--text)' }}>{fmt(detail.amount)}</span><br />
                    GST amount: <span className="mono" style={{ color: 'var(--text)' }}>{fmt(detail.gst_amount)}</span><br />
                    Client avg. payment delay: <span className="mono" style={{ color: 'var(--text)' }}>{detail.client_avg_delay_days?.toFixed(0)} days</span><br />
                    Client historical default rate: <span className="mono" style={{ color: 'var(--text)' }}>{(detail.client_past_default_rate * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div style={{ flex: 1.3 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>RECOMMENDATION</div>
                  <div style={{
                    display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '4px 12px',
                    borderRadius: 20, marginBottom: 10,
                    color: ACTION_LABELS[detail.recommendation.action]?.color,
                    background: 'var(--bg-card)',
                    border: `1px solid ${ACTION_LABELS[detail.recommendation.action]?.color}33`,
                  }}>
                    {ACTION_LABELS[detail.recommendation.action]?.text}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {detail.recommendation.reason}
                  </div>
                </div>
              </div>
            )}
          </div>
          )
        })}

        {invoices.length === 0 && (
          <div style={{ padding: 24, color: 'var(--text-dim)', fontSize: 13 }}>No invoices found.</div>
        )}
      </div>
    </div>
  )
}

function iconBtn(color, filled) {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 26, height: 26, borderRadius: 6, cursor: 'pointer',
    border: `1px solid ${filled ? color : 'var(--border)'}`,
    background: filled ? color : 'transparent',
    color: filled ? 'var(--bg-elevated)' : color,
  }
}