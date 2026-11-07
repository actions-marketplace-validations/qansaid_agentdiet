import { ImageResponse } from "next/og";

export const alt =
  "AgentDiet: measure the context your AI coding agent loads before you type";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08090a",
          padding: "64px 68px",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#12141a",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 3,
              padding: "0 8px",
            }}
          >
            <div style={{ height: 3, background: "#f4f5f7", borderRadius: 2 }} />
            <div
              style={{ height: 3, width: "65%", background: "#f4f5f7", opacity: 0.45, borderRadius: 2 }}
            />
            <div style={{ height: 3, width: "35%", background: "#3ddc97", borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 26, color: "#f4f5f7", letterSpacing: -0.5 }}>
            AgentDiet
          </div>
          <div
            style={{
              marginLeft: 6,
              fontSize: 17,
              color: "#7d848e",
              border: "1px solid #ffffff1f",
              borderRadius: 6,
              padding: "4px 10px",
            }}
          >
            MIT · open source
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 68,
              lineHeight: 1.05,
              letterSpacing: -2.6,
              color: "#f4f5f7",
              maxWidth: 900,
            }}
          >
            Your AI agent deserves a leaner context.
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 26,
              lineHeight: 1.45,
              color: "#969ca5",
              maxWidth: 830,
            }}
          >
            Measure the always-on token tax in AGENTS.md, CLAUDE.md and
            .cursorrules, then cap it in CI.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 34,
            borderTop: "1px solid #ffffff14",
            paddingTop: 22,
            fontSize: 20,
            color: "#7d848e",
          }}
        >
          <span style={{ color: "#3ddc97" }}>● single static Go binary</span>
          <span>no account</span>
          <span>no network calls</span>
          <span style={{ marginLeft: "auto", color: "#969ca5" }}>
            github.com/qansaid/agentdiet
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
