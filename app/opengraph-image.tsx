import { ImageResponse } from "next/og"

// Route segment config
export const runtime = "edge"

// Image metadata
export const alt = "TimeWrap - Commit Anywhere in Time"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

// Image generation
export default async function Image() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        fontSize: 128,
        background: "black",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      <div style={{ display: "flex", gap: "10px" }}>
        {["T", "I", "M", "E", "W", "R", "A", "P"].map((letter, index) => (
          <div
            key={index}
            style={{
              width: "80px",
              height: "80px",
              background: "rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
            }}
          >
            {letter}
          </div>
        ))}
      </div>
      <div style={{ fontSize: "32px", marginTop: "20px", fontStyle: "italic" }}>Commit Anywhere in Time</div>
      <div style={{ fontSize: "18px", marginTop: "40px" }}>Created by Om Preetham Bandi</div>
    </div>,
    { ...size },
  )
}

