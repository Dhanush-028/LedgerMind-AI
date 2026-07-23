const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function AiInsightCard({ summary }) {
  if (!summary) return null;

  // Estimated recoverable value
  const recoverable = summary.high_risk_value * 0.35;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          color: "var(--accent)",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        💡 AI INSIGHT OF THE DAY
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.4,
        }}
      >
        Recovering the highest-risk invoices could unlock
      </div>

      <div
        style={{
          fontSize: 34,
          color: "var(--accent)",
          fontWeight: 700,
          margin: "12px 0",
        }}
      >
        {fmt(recoverable)}
      </div>

      <div
        style={{
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        Estimated working capital that can be recovered by prioritizing
        AI-flagged invoices before they become bad debt.
      </div>
    </div>
  );
}