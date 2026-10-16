// Sends an error caught in the browser to /api/errors. Best effort.
export function reportClientError(error: Error & { digest?: string }) {
  try {
    void fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: String(error?.message ?? error).slice(0, 2000),
        digest: error?.digest,
        path: location.pathname,
        stack: String(error?.stack ?? "").slice(0, 8000),
      }),
      keepalive: true,
    }).catch(() => null);
  } catch {}
}
