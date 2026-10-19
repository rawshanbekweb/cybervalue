"use client";
// Dictionaries for the junior area; see components/locale-provider.
import { MessagesLayer } from "@/components/locale-provider";
import labsUi from "@/lib/i18n/labs-ui.json";
import junior from "@/lib/i18n/junior.json";

const MESSAGES = [labsUi, junior];

export function JuniorMessages({ children }: { children: React.ReactNode }) {
  return <MessagesLayer messages={MESSAGES}>{children}</MessagesLayer>;
}
