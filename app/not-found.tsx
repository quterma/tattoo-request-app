export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>404</h1>
            <p style={{ marginTop: "0.5rem", color: "#71717a" }}>
              Page not found
            </p>
          </div>
        </main>
      </body>
    </html>
  )
}
