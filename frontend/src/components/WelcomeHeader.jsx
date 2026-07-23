import { Sparkles } from "lucide-react";

export default function WelcomeHeader() {
  const hour = new Date().getHours();

  const greeting =
  hour < 12
    ? "Welcome Back"
    : hour < 17
    ? "Welcome Back"
    : "Welcome Back";

  return (
    <div
      className="card"
      style={{
        padding: 28,
        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 700,
            }}
          >
            {greeting}
          </div>

          <div
            style={{
              marginTop: 10,
              color: "var(--text-muted)",
              fontSize: 16,
            }}
          >
            LedgerMind AI has analyzed today's business finances.
          </div>
        </div>

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "var(--accent-glow)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Sparkles
            size={30}
            color="var(--accent)"
          />
        </div>
      </div>
    </div>
  );
}