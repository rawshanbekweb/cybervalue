import type { Instrumentation } from "next";

// Every server error (pages, route handlers, server actions) is stored for
// Admin → Errors. Only in the Node.js runtime, where the database is.
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { recordError } = await import("./lib/errors/record");
  const err = error instanceof Error ? error : null;
  await recordError({
    source: "server",
    message: err?.message ?? String(error),
    digest:
      typeof error === "object" && error !== null && "digest" in error
        ? String((error as { digest: unknown }).digest)
        : "",
    path: request.path,
    route: `${context.routeType} ${context.routePath}`,
    stack: err?.stack,
  });
};
