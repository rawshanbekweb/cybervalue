import { notFound } from "next/navigation";

// Unmatched URLs only reach the root not-found, which this area does not
// have (it is its own root layout). Route them to student/not-found.tsx.
export default function StudentMissingPage() {
  notFound();
}
