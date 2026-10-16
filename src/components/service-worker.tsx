"use client";
import { useEffect } from "react";

// Registers /sw.js in production so the site can be installed and the labs
// open offline. Development stays without a worker to avoid stale bundles.
export function ServiceWorker() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    navigator.serviceWorker.register("/sw.js").catch(() => null);
  }, []);
  return null;
}
