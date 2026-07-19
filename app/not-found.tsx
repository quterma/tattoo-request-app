import Link from "next/link"
import messages from "@/shared/i18n/messages/en.json"

const { title, body, backHome } = messages.notFound

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
            <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>{title}</h1>
            <p style={{ marginTop: "0.5rem", color: "#71717a" }}>{body}</p>
            <Link
              href="/"
              style={{
                marginTop: "1.5rem",
                display: "inline-block",
                color: "#18181b",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              {backHome}
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
