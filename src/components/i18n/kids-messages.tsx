"use client";
// Dictionaries for the kids area; see components/locale-provider.
import { MessagesLayer } from "@/components/locale-provider";
import kids from "@/lib/i18n/kids.json";

const MESSAGES = [kids];

export function KidsMessages({ children }: { children: React.ReactNode }) {
  return <MessagesLayer messages={MESSAGES}>{children}</MessagesLayer>;
}
