// The pretend site of the HTTP basics lab. Each route answers with one
// status code, so the student can meet every family of codes by sending
// requests from two drop-downs.

export const METHODS = ["GET", "POST", "DELETE"] as const;
export type Method = (typeof METHODS)[number];

export const PATHS = [
  "/",
  "/old-page",
  "/profile",
  "/admin",
  "/missing",
  "/crash",
] as const;
export type Path = (typeof PATHS)[number];

export type Reply = {
  status: number;
  reason: string;
  headers: [string, string][];
  body: string;
};

const reply = (
  status: number,
  reason: string,
  body = "",
  headers: [string, string][] = [],
): Reply => ({
  status,
  reason,
  headers: [["Content-Type", "text/html; charset=utf-8"], ...headers],
  body,
});

export function answer(method: Method, path: Path): Reply {
  if (path === "/crash") return reply(500, "Internal Server Error", "Oops…");
  if (path === "/missing") return reply(404, "Not Found", "No such page.");
  if (method !== "GET")
    return reply(405, "Method Not Allowed", "", [["Allow", "GET"]]);
  switch (path) {
    case "/":
      return reply(200, "OK", "<h1>Welcome!</h1>");
    case "/old-page":
      return reply(301, "Moved Permanently", "", [["Location", "/"]]);
    case "/profile":
      return reply(401, "Unauthorized", "Please sign in first.");
    case "/admin":
      return reply(403, "Forbidden", "Admins only.");
  }
}

/** The status family of a code: 2 for 2xx and so on. */
export const family = (status: number) => Math.floor(status / 100);

export const FAMILIES = [2, 3, 4, 5] as const;
