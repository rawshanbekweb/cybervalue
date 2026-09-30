"use client";
import { useTranslator } from "@/components/locale-provider";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslator();
  return (
    <div className="container error-page">
      <span className="eyebrow">{t("Something interrupted the request")}</span>
      <h1>{t("Let’s try that again.")}</h1>
      <p>{t("The page could not be loaded. Please try again in a moment.")}</p>
      <button className="button button-primary" onClick={reset}>
        {t("Try again")}
      </button>
      <Link className="button button-secondary" href="/">
        {t("Back to overview")}
      </Link>
    </div>
  );
}
