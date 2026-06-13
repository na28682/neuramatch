import { useState } from "react";
import Onboarding from "./Onboarding";
import "./onboarding.css";

const THEME_COLORS = {
  warm: "#FAEEDA",
  cool: "#E6F1FB",
  vibrant: "#FAC775",
  neutral: "#F1EFE8",
};

export default function App() {
  const [result, setResult] = useState(null);

  if (!result) {
    return <Onboarding onMatch={setResult} />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME_COLORS[result.theme] || THEME_COLORS.neutral,
        padding: "2rem",
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        transition: "background 1s ease",
      }}
    >
      <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
        based on: <em>"{result.mood}"</em>
      </p>
      <p style={{ fontSize: 12, color: "#aaa", marginBottom: 32 }}>
        theme: {result.theme}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {result.matches.map((match) => (
          <div
            key={match.user_id}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "1.25rem 1.5rem",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <p style={{ fontWeight: 500, fontSize: 16, margin: 0 }}>
              {match.display_name}
            </p>
            <p style={{ fontSize: 13, color: "#999", margin: "4px 0 0" }}>
              {match.location} · age {match.age}
            </p>
            <p style={{ fontSize: 12, color: "#bbb", margin: "12px 0 0" }}>
              {(match.match_score * 100).toFixed(1)}% match
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setResult(null)}
        style={{
          marginTop: 32,
          border: "1px solid rgba(0,0,0,0.1)",
          background: "transparent",
          borderRadius: 8,
          padding: "8px 20px",
          cursor: "pointer",
          fontSize: 13,
          color: "#666",
        }}
      >
        start over
      </button>
    </div>
  );
}
