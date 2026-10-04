"use client";
// Rendered outside the locale layout when the root fails, so it shows both
// languages instead of guessing one.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="uz">
      <body
        style={{
          margin: 0,
          background: "#101211",
          color: "#f0f2ec",
          fontFamily: "sans-serif",
          padding: "10vh 24px",
          textAlign: "center",
        }}
      >
        <main>
          <h1>CyberValue vaqtincha ishlamayapti.</h1>
          <p>Birozdan so‘ng qayta urinib ko‘ring.</p>
          <p lang="en">
            CyberValue is temporarily unavailable. Please try again in a moment.
          </p>
          <button
            onClick={reset}
            style={{ padding: "12px 20px", cursor: "pointer" }}
          >
            Qayta urinish / <span lang="en">Try again</span>
          </button>
        </main>
      </body>
    </html>
  );
}
