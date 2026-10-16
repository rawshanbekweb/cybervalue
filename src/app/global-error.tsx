"use client";
import { useEffect } from "react";
import { reportClientError } from "@/lib/errors/report";
// Rendered outside the locale layout when the root fails, so it shows both
// languages instead of guessing one.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => reportClientError(error), [error]);
  return (
    <html lang="uz">
      <body
        style={{
          margin: 0,
          background: "#000000",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "10vh 24px",
          textAlign: "center",
        }}
      >
        <main>
          <h1>Cybervalue vaqtincha ishlamayapti.</h1>
          <p>Birozdan so‘ng qayta urinib ko‘ring.</p>
          <p lang="en">
            Cybervalue is temporarily unavailable. Please try again in a moment.
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
