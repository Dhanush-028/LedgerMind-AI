import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Sparkles, Loader2 } from 'lucide-react'

const SUGGESTIONS = [
  'Show me overdue invoices',
  'Which client is the riskiest right now?',
  'How much GST is locked up in unpaid invoices?',
  'What should I prioritize this week?',
]

export default function AiChat() {
  const [messages, setMessages] = useState([
    { role: 'model', text: "Hi, I'm your AI CFO copilot. Ask me anything about your invoices, GST exposure, or client risk." },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  const send = async (text) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || sending) return

    const nextMessages = [...messages, { role: 'user', text: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(0, -1), // don't send the message twice
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Something went wrong.')
      }
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'model', text: data.reply }])
    } catch (e) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>AI Chat</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Ask about your invoices, GST exposure, or client risk — grounded in your live data, not guesses.
      </div>

      <div style={{
        border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-card)',
        display: 'flex', flexDirection: 'column', height: 520,
      }}>
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px 20px' }}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 14,
              }}
            >
              <div style={{
                maxWidth: '78%',
                padding: '10px 14px',
                borderRadius: 14,
                fontSize: 13.5,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
                color: m.role === 'user' ? 'var(--bg-elevated)' : 'var(--text)',
                border: m.role === 'user' ? 'none' : '1px solid var(--border)',
              }}>
                {m.text}
              </div>
            </motion.div>
          ))}

          {sending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dim)', fontSize: 12, marginBottom: 14 }}>
              <Loader2 size={13} style={{ animation: 'chatspin 1s linear infinite' }} />
              Thinking…
              <style>{`@keyframes chatspin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && (
            <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 14 }}>{error}</div>
          )}
        </div>

        {messages.length <= 1 && (
          <div style={{ padding: '0 20px 12px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  fontSize: 12, padding: '6px 12px', borderRadius: 20,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <Sparkles size={11} color="var(--accent)" /> {s}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, padding: 16, borderTop: '1px solid var(--border)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send() }}
            placeholder="Ask a question…"
            disabled={sending}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--bg-elevated)', color: 'var(--text)', fontSize: 13,
            }}
          />
          <button
            onClick={() => send()}
            disabled={sending || !input.trim()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 42, height: 42, borderRadius: 10, border: 'none',
              background: 'var(--accent)', color: 'var(--bg-elevated)', cursor: 'pointer',
              opacity: sending || !input.trim() ? 0.5 : 1,
            }}
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}