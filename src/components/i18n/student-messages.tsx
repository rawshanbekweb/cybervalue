"use client";
// Dictionaries for the student area; see components/locale-provider.
import { MessagesLayer } from "@/components/locale-provider";
import student from "@/lib/i18n/student.json";
import exam from "@/lib/i18n/exam.json";
import assessment from "@/lib/i18n/assessment.json";
import resourceExam from "@/lib/i18n/resource-exam.json";

const MESSAGES = [student, exam, assessment, resourceExam];

export function StudentMessages({ children }: { children: React.ReactNode }) {
  return <MessagesLayer messages={MESSAGES}>{children}</MessagesLayer>;
}
