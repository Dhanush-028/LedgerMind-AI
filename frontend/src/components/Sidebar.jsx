import { useEffect, useState } from "react";
import {
  IconLayoutDashboard,
  IconFileInvoice,
  IconUsers,
  IconRobot,
  IconChartBar,
  IconSettings,
  IconBolt,
  IconSparkles,
  IconMessageCircle,
  IconTrendingUp,
  IconBell
} from "@tabler/icons-react";

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: IconLayoutDashboard,
  },
  {
    key: "invoices",
    label: "Invoices",
    icon: IconFileInvoice,
  },
  {
    key: "analyzer",
    label: "AI Analyzer",
    icon: IconSparkles,
  },
  {
    key: "forecast",
    label: "Cash-Flow Forecast",
    icon: IconTrendingUp,
  },
  {
    key: "chat",
    label: "AI Chat",
    icon: IconMessageCircle,
  },
  {
    key: "alerts",
    label: "Alerts",
    icon: IconBell,
    badge: true,
  },
  {
    key: "clients",
    label: "Client Risk",
    icon: IconUsers,
  },
];

export default function Sidebar({ view, setView }) {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const loadCount = () => {
      fetch("/api/alerts")
        .then((r) => r.json())
        .then((data) => setAlertCount(Array.isArray(data) ? data.length : 0))
        .catch(() => {});
    };
    loadCount();
    const interval = setInterval(loadCount, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      style={{
        width: 270,
        minHeight: "100vh",
        background: "var(--bg-elevated)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "28px 18px",
      }}
    >
      {/* Logo */}

      <div style={{ marginBottom: 36 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              background: "var(--accent)",
              display: "grid",
              placeItems: "center",
              color: "#000",
            }}
          >
            <IconBolt size={22} stroke={2.4} />
          </div>

          <div>
            <div
              style={{
                fontSize: 21,
                fontWeight: 700,
              }}
            >
              LedgerMind
            </div>

            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              AI CFO for MSMEs
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}

      <div
        style={{
          color: "var(--text-dim)",
          fontSize: 12,
          marginBottom: 14,
          textTransform: "uppercase",
          letterSpacing: 1.5,
        }}
      >
        Workspace
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;

        const active = view === item.key;

        return (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              width: "100%",
              padding: "14px 16px",
              marginBottom: 10,
              borderRadius: 16,
              border: "none",
              cursor: "pointer",
              transition: ".25s",

              background: active
                ? "var(--accent-glow)"
                : "transparent",

              color: active
                ? "var(--accent)"
                : "var(--text-muted)",
            }}
          >
            <Icon size={20} />

            <span
              style={{
                fontSize: 15,
                fontWeight: active ? 700 : 500,
                flex: 1,
              }}
            >
              {item.label}
            </span>

            {item.badge && alertCount > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--bg-elevated)",
                  background: "var(--danger)",
                  borderRadius: 20,
                  padding: "2px 7px",
                  minWidth: 18,
                  textAlign: "center",
                }}
              >
                {alertCount}
              </span>
            )}
          </button>
        );
      })}

      {/* AI */}

      <div
        className="card"
        style={{
          marginTop: 30,
          padding: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <IconRobot color="var(--accent)" />

          <strong>AI CFO</strong>
        </div>

        <div
          style={{
            color: "var(--text-muted)",
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          AI continuously monitors GST exposure,
          cash flow and collection risk.
        </div>
      </div>

      {/* Footer */}

      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid var(--border)",
          paddingTop: 24,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "var(--text-dim)",
          }}
        >
          BUSINESS HEALTH
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 32,
            fontWeight: 700,
            color: "var(--accent)",
          }}
        >
          84
          <span
            style={{
              fontSize: 18,
              color: "var(--text-muted)",
            }}
          >
            /100
          </span>
        </div>

        <div
          style={{
            marginTop: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#7DFFA1",
            fontSize: 13,
          }}
        >
          ● System Online
        </div>
      </div>
    </aside>
  );
}