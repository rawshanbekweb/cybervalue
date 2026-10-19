"use client";
// Dictionaries for the lab area; see components/locale-provider.
import { MessagesLayer } from "@/components/locale-provider";
import lab from "@/lib/i18n/lab.json";
import labsUi from "@/lib/i18n/labs-ui.json";
import linux from "@/lib/i18n/linux.json";
import network from "@/lib/i18n/network.json";
import html from "@/lib/i18n/html.json";
import ctf from "@/lib/i18n/ctf.json";
import missions from "@/lib/i18n/missions.json";
import studio from "@/lib/i18n/studio.json";
import defend from "@/lib/i18n/defend.json";
import assessment from "@/lib/i18n/assessment.json";
import resourceExam from "@/lib/i18n/resource-exam.json";
import exam from "@/lib/i18n/exam.json";
import student from "@/lib/i18n/student.json";

const MESSAGES = [
  lab,
  labsUi,
  linux,
  network,
  html,
  ctf,
  missions,
  studio,
  defend,
  assessment,
  resourceExam,
  exam,
  student,
];

export function LabMessages({ children }: { children: React.ReactNode }) {
  return <MessagesLayer messages={MESSAGES}>{children}</MessagesLayer>;
}
