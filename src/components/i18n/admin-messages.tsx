"use client";
// Dictionaries for the admin area; see components/locale-provider.
import { MessagesLayer } from "@/components/locale-provider";
import admin from "@/lib/i18n/admin.json";
import html from "@/lib/i18n/html.json";
import ctf from "@/lib/i18n/ctf.json";
import exam from "@/lib/i18n/exam.json";
import studio from "@/lib/i18n/studio.json";
import missions from "@/lib/i18n/missions.json";
import lab from "@/lib/i18n/lab.json";
import assessment from "@/lib/i18n/assessment.json";
import resourceExam from "@/lib/i18n/resource-exam.json";
import linux from "@/lib/i18n/linux.json";
import network from "@/lib/i18n/network.json";
import student from "@/lib/i18n/student.json";
import junior from "@/lib/i18n/junior.json";
import kids from "@/lib/i18n/kids.json";
import defend from "@/lib/i18n/defend.json";
import labsUi from "@/lib/i18n/labs-ui.json";

const MESSAGES = [
  admin,
  html,
  ctf,
  exam,
  studio,
  missions,
  lab,
  assessment,
  resourceExam,
  linux,
  network,
  student,
  junior,
  kids,
  defend,
  labsUi,
];

export function AdminMessages({ children }: { children: React.ReactNode }) {
  return <MessagesLayer messages={MESSAGES}>{children}</MessagesLayer>;
}
