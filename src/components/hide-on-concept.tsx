"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function HideOnConcept({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/concept")) return null;
  return <>{children}</>;
}
