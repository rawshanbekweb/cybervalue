"use client";
// Dictionaries for the live area; see components/locale-provider.
import { MessagesLayer } from "@/components/locale-provider";
import student from "@/lib/i18n/student.json";
import assessment from "@/lib/i18n/assessment.json";

const MESSAGES = [student, assessment];

export function LiveMessages({ children }: { children: React.ReactNode }) {
  return <MessagesLayer messages={MESSAGES}>{children}</MessagesLayer>;
}
