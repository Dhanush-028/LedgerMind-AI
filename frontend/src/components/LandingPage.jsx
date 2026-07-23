import { motion } from 'framer-motion'
import {
  Bolt, ArrowRight, AlertTriangle, FileScan, TrendingUp, MessageCircle,
  BellRing, Users, Clock, ShieldCheck, CheckCircle2,
} from 'lucide-react'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const FEATURES = [
  {
    icon: FileScan,
    title: 'AI Invoice Analyzer',
    desc: 'Snap a photo or upload a PDF — Gemini reads it and fills in every field. No manual data entry.',
  },
  {
    icon: AlertTriangle,
    title: 'AI Risk Insights',
    desc: 'Every unpaid invoice scored for default risk, with a specific recommended action — not just a number.',
  },
  {
    icon: TrendingUp,
    title: 'Cash-Flow Forecast',
    desc: 'See what you\u2019ll actually collect in 30/60/90 days, weighted by real client payment behaviour.',
  },
  {
    icon: MessageCircle,
    title: 'AI Chat Copilot',
    desc: 'Ask "show me overdue invoices" in plain English. Answers grounded in your real numbers.',
  },
  {
    icon: BellRing,
    title: 'Smart Alerts',
    desc: 'Breached deadlines, high-risk clients, and invoices due soon — surfaced automatically.',
  },
  {
    icon: Users,
    title: 'Client Risk Ranking',
    desc: 'See which clients are actually profitable once locked GST and default risk are priced in.',
  },
]

const STEPS = [
  { n: '01', title: 'Connect your invoices', desc: 'Upload existing invoices or add new ones — AI extracts every field automatically.' },
  { n: '02', title: 'See your real exposure', desc: 'LedgerMind calculates exactly how much GST is locked up, and which invoices are racing toward the 180-day deadline.' },
  { n: '03', title: 'Act before it\u2019s too late', desc: 'Get a specific recommendation per invoice — reminder, escalation, credit note — before that GST becomes a lasting cash-flow burden.' },
]

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', minHeight: '100vh', color: 'var(--text)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, background: 'var(--accent)',
            display: 'grid', placeItems: 'center', color: '#000',
          }}>
            <Bolt size={18} strokeWidth={2.4} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>LedgerMind</span>
        </div>
        <button onClick={onGetStarted} style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
          padding: '9px 18px', borderRadius: 10, border: 'none',
          background: 'var(--accent)', color: '#000', cursor: 'pointer',
        }}>
          Open Dashboard <ArrowRight size={14} />
        </button>
      </nav>

      {/* Hero */}
      <section style={{ padding: '90px 48px 70px 48px', textAlign: 'center', maxWidth: 880, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600,
            padding: '6px 14px', borderRadius: 20, background: 'var(--accent-glow)', color: 'var(--accent)',
            marginBottom: 24,
          }}
        >
          <Clock size={13} /> AI CFO for India's 63M MSMEs
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.15, letterSpacing: -1, margin: '0 0 20px 0' }}
        >
          You already paid the GST.<br />
          <span style={{ color: 'var(--accent)' }}>Your client just hasn't paid you.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 620, margin: '0 auto 36px auto' }}
        >
          Every unpaid invoice starts a 180-day clock. Miss it, and the GST you already paid the
          government stays locked as working capital, with no easy way to recover it. LedgerMind shows you exactly how
          much is at risk, and what to do before it's too late.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center' }}
        >
          <button onClick={onGetStarted} style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700,
            padding: '13px 26px', borderRadius: 12, border: 'none',
            background: 'var(--accent)', color: '#000', cursor: 'pointer',
          }}>
            See My GST Exposure <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* Stat strip */}
      <section style={{
        display: 'flex', justifyContent: 'center', gap: 60, padding: '30px 48px',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)', flexWrap: 'wrap',
      }}>
        {[
          { value: '180', label: 'days to ITC reversal' },
          { value: '63M', label: 'MSMEs in India' },
          { value: fmt(0), label: 'your locked capital, day one' },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: 30, fontWeight: 700, color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>From invoice to insight in three steps</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              style={{
                padding: 28, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-card)',
              }}
            >
              <div className="mono" style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 14 }}>{s.n}</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '20px 48px 90px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>WHAT'S INSIDE</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 12px 0' }}>Built specifically for GST cash-flow</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto' }}>
            Not another generic invoicing tool — every feature exists to answer one question:
            how much of your money is at risk, and what should you do about it.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                style={{
                  padding: 24, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-card)',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12, background: 'var(--accent-glow)',
                  display: 'grid', placeItems: 'center', marginBottom: 16,
                }}>
                  <Icon size={20} color="var(--accent)" />
                </div>
                <div style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Trust strip */}
      <section style={{
        padding: '40px 48px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'center', gap: 36, flexWrap: 'wrap',
      }}>
        {[
          { icon: ShieldCheck, text: 'GST-compliant by design' },
          { icon: CheckCircle2, text: 'Powered by Gemini AI' },
          { icon: Clock, text: '180-day clock tracked automatically' },
        ].map((t) => {
          const Icon = t.icon
          return (
            <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
              <Icon size={16} color="var(--accent)" /> {t.text}
            </div>
          )
        })}
      </section>

      {/* CTA */}
      <section style={{ padding: '90px 48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 14 }}>
          Stop losing GST capital to invoices you haven't collected.
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 30 }}>
          See your real exposure in under a minute — no setup, no spreadsheets.
        </p>
        <button onClick={onGetStarted} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700,
          padding: '13px 28px', borderRadius: 12, border: 'none',
          background: 'var(--accent)', color: '#000', cursor: 'pointer',
        }}>
          Open Dashboard <ArrowRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 48px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 12, color: 'var(--text-dim)', flexWrap: 'wrap', gap: 10,
      }}>
        <span>&copy; {new Date().getFullYear()} LedgerMind AI</span>
        
      </footer>
    </div>
  )
}