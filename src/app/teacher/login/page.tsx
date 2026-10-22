import { redirect } from "next/navigation";

// Staff share one sign-in page; it brings teachers back here.
export default function TeacherLoginPage() {
  redirect("/admin/login?next=/teacher");
}
