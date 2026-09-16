"use client";
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
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
          <h1>CyberValue is temporarily unavailable.</h1>
          <p>Please try again in a moment.</p>
          <button
            onClick={reset}
            style={{ padding: "12px 20px", cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
