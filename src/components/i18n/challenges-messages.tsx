"use client";
// Dictionaries for CTF Challenges; see components/locale-provider.
import { MessagesLayer } from "@/components/locale-provider";
import challenges from "@/lib/i18n/challenges.json";

const MESSAGES = [challenges];

export function ChallengesMessages({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MessagesLayer messages={MESSAGES}>{children}</MessagesLayer>;
}
