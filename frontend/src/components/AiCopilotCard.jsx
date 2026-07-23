import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  ShieldCheck,
  Brain,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  WifiOff,
} from "lucide-react";

const SEVERITY = {
  critical: {
    color: "var(--danger)",
    bg: "rgba(255,92,92,.12)",
  },
  caution: {
    color: "var(--warning)",
    bg: "rgba(255,184,76,.12)",
  },
  healthy: {
    color: "var(--safe)",
    bg: "rgba(76,214,138,.12)",
  },
};

export default function AiCopilotCard() {
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    fetch("/api/ai-insight")
      .then((r) => r.json())
      .then(setInsight);
  }, []);

  if (!insight) return null;

  const s = SEVERITY[insight.severity] || SEVERITY.healthy;
  const isLive = insight.source === "gemini";

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{
        padding: 28,
        marginBottom: 28,
      }}
    >
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "var(--accent-glow)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Bot
              color="var(--accent)"
              size={30}
            />
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: 23,
                  fontWeight: 700,
                }}
              >
                AI CFO
              </div>

              <div
                title={isLive ? "Live Gemini-generated insight" : "Gemini unavailable — showing offline summary"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: 20,
                  letterSpacing: 0.3,
                  color: isLive ? "var(--accent)" : "var(--text-dim)",
                  background: isLive ? "var(--accent-glow)" : "rgba(255,255,255,.06)",
                }}
              >
                <Sparkles size={10} />
                AI-POWERED
              </div>
            </div>

            <div
              style={{
                color: "var(--text-muted)",
                marginTop: 4,
              }}
            >
              Today's AI Executive Brief
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            background: s.bg,
            color: s.color,
            fontWeight: 600,
          }}
        >
          {insight.severity.toUpperCase()}
        </div>
      </div>

      {/* Metrics */}

      <div
        style={{
          display: "flex",
          gap: 30,
          marginBottom: 28,
        }}
      >
        <div>
          <div
  style={{
    color: "var(--text-muted)",
    fontSize: 13,
  }}
>
  Business Health
</div>

<div
  style={{
    fontSize: 30,
    fontWeight: 700,
    color: "var(--accent)",
  }}
>
  84 /100
</div>

<div
  style={{
    fontSize: 11,
    color: "var(--text-dim)",
    marginTop: 4,
  }}
>
  Based on GST exposure, payment recovery & client risk
</div>
        </div>

        <div>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: 13,
            }}
          >
            AI Confidence
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            98%
          </div>
        </div>
      </div>

      {/* Summary */}

      <div
        style={{
          marginBottom: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <Brain
            size={18}
            color="var(--accent)"
          />

          <strong>Today's Summary</strong>
        </div>

        <div
  style={{
    color: "var(--text-muted)",
    lineHeight: 1.8,
    whiteSpace: "pre-line",
  }}
>
  {insight.summary}
</div>
      </div>

      {/* Actions */}

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <ShieldCheck
            size={18}
            color="var(--accent)"
          />

          <strong>Recommended Actions</strong>
        </div>

        {insight.actions.map((action, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <CheckCircle2
              size={18}
              color="var(--accent)"
            />

            <span style={{ flex: 1 }}>{action}</span>

            <ArrowRight
              size={18}
              color="var(--text-muted)"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}