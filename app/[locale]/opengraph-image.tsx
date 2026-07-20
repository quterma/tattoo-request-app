import { ImageResponse } from "next/og"

// INTERIM __meta_TODO: text-only placeholder OG image. The real OG image (a studio/featured photo)
// is a pre-deploy swap — STAGE_6_STRAT_BRIEF.md, Pre-deploy swaps to track. Replacing this file
// with a static app/opengraph-image.png (or updating this generator) is the swap.

export const alt = "Studio Name — Custom Tattoos in Tel Aviv"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: "-0.02em" }}>Studio Name</div>
        <div style={{ marginTop: 24, fontSize: 36, color: "#a1a1aa" }}>
          Custom Tattoos in Tel Aviv
        </div>
      </div>
    ),
    size,
  )
}
