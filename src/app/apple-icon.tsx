import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0B1120 0%, #111827 100%)",
          borderRadius: 36,
          position: "relative",
          color: "#E2E8F0",
          fontSize: 72,
          fontWeight: 800,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: 30,
            border: "3px solid rgba(34, 211, 238, 0.18)",
          }}
        />
        <div style={{ position: "absolute", inset: 32, borderRadius: 9999, background: "rgba(34, 211, 238, 0.08)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#E2E8F0" }}>{`<`}</span>
          <span style={{ color: "#22D3EE" }}>/</span>
          <span style={{ color: "#00E5A8" }}>{`>`}</span>
        </div>
      </div>
    ),
    size,
  );
}
