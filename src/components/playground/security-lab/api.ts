export interface ApiResult {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  ms: number;
  error?: string;
}

export async function apiCall(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<ApiResult> {
  const headers: Record<string, string> = { ...(extraHeaders ?? {}) };
  const init: RequestInit = { method, headers, credentials: "same-origin" };
  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const started = performance.now();
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch (err) {
    return {
      ok: false,
      status: 0,
      statusText: "Network error",
      headers: {},
      data: null,
      ms: 0,
      error: String(err),
    };
  }
  const ms = Math.round(performance.now() - started);
  const respHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    respHeaders[key] = value;
  });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: response.ok, status: response.status, statusText: response.statusText, headers: respHeaders, data, ms };
}
