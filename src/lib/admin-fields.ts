import type { ContentKind } from "@/generated/prisma/client";

export type FieldType =
  "text" | "textarea" | "url" | "list" | "select" | "datetime" | "checkbox";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  help?: string;
}

export const subtypeFields: Record<ContentKind, FieldConfig[]> = {
  PROJECT: [
    { name: "problem", label: "Problem", type: "textarea", required: true },
    {
      name: "objective",
      label: "Objective",
      type: "textarea",
      required: true,
    },
    {
      name: "architecture",
      label: "Architecture",
      type: "textarea",
      required: true,
    },
    {
      name: "securityConsiderations",
      label: "Security considerations",
      type: "textarea",
      required: true,
    },
    {
      name: "challenges",
      label: "Challenges",
      type: "textarea",
      required: true,
    },
    { name: "solution", label: "Solution", type: "textarea", required: true },
    { name: "result", label: "Result", type: "textarea", required: true },
    {
      name: "lessonsLearned",
      label: "Lessons learned",
      type: "textarea",
      required: true,
    },
    {
      name: "technologies",
      label: "Technologies",
      type: "list",
      help: "Comma-separated",
    },
    { name: "repositoryUrl", label: "Repository URL", type: "url" },
    { name: "liveUrl", label: "Live URL", type: "url" },
    {
      name: "projectStatus",
      label: "Project status",
      type: "text",
      required: true,
      help: 'Free text, e.g. "Active", "Completed"',
    },
  ],
  LAB: [
    {
      name: "environment",
      label: "Environment / target",
      type: "text",
      required: true,
    },
    {
      name: "objective",
      label: "Objective",
      type: "textarea",
      required: true,
    },
    { name: "tools", label: "Tools", type: "list", help: "Comma-separated" },
    {
      name: "methodology",
      label: "Methodology",
      type: "textarea",
      required: true,
    },
    { name: "discovery", label: "Discovery", type: "textarea", required: true },
    { name: "analysis", label: "Analysis", type: "textarea", required: true },
    { name: "impact", label: "Impact", type: "textarea", required: true },
    {
      name: "remediation",
      label: "Remediation",
      type: "textarea",
      required: true,
    },
    {
      name: "lessonsLearned",
      label: "Lessons learned",
      type: "textarea",
      required: true,
    },
    {
      name: "difficulty",
      label: "Difficulty",
      type: "select",
      required: true,
      options: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
    },
    {
      name: "authorized",
      label: "This lab was authorized",
      type: "checkbox",
      required: true,
      help: "Required — unauthorized labs cannot be published",
    },
  ],
  RESEARCH: [
    {
      name: "references",
      label: "References",
      type: "list",
      help: "Comma-separated HTTPS URLs",
    },
  ],
  CTF: [
    { name: "eventName", label: "Event name", type: "text", required: true },
    {
      name: "eventDate",
      label: "Event date",
      type: "datetime",
      required: true,
    },
    { name: "location", label: "Location", type: "text" },
    { name: "placement", label: "Placement", type: "text" },
    {
      name: "challengesSolved",
      label: "Challenges solved",
      type: "list",
      help: "Comma-separated",
    },
    {
      name: "categories",
      label: "Categories",
      type: "list",
      help: "Comma-separated",
    },
    {
      name: "lessonsLearned",
      label: "Lessons learned",
      type: "textarea",
      required: true,
    },
  ],
  RESOURCE: [
    { name: "type", label: "Type", type: "text", required: true },
    {
      name: "filePath",
      label: "File path",
      type: "text",
      required: true,
      help: "Must already exist under content/private/downloads, e.g. /downloads/reference-v1.pdf",
    },
    { name: "topic", label: "Topic", type: "text", required: true },
    { name: "version", label: "Version", type: "text", required: true },
  ],
};
