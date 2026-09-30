import { getTranslator } from "@/lib/i18n/server";
import { ArrowUpRight, Download, Presentation } from "lucide-react";
import styles from "./web-lesson-resource.module.css";

export async function WebLessonResource() {
  const t = await getTranslator();
  return (
    <section className={styles.card} aria-labelledby="web-lesson-title">
      <div className={styles.preview} aria-hidden="true">
        <Presentation size={36} strokeWidth={1.3} />
        <span>{t("WEB / ASOSLAR")}</span>
        <div>IP / DNS / HTTP / TLS</div>
        <strong>{t("75 slayd")}</strong>
      </div>
      <div className={styles.content}>
        <span className="eyebrow">{t("Interaktiv dars · O‘zbekcha")}</span>
        <h2 id="web-lesson-title">{t("Web qanday ishlaydi?")}</h2>
        <p>
          {t(
            "Internet va IP manzillardan HTTP, TLS va web xavfsizligigacha — 30 mavzu, bosqichli sxemalar, tekshiruv savollari va o‘qituvchi izohlari.",
          )}
        </p>
        <div className={styles.actions}>
          {/* A standalone HTML document needs a full navigation, not the Next router. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            className="button button-primary"
            href="/lessons/web-asoslari/index.html"
          >
            {t("Taqdimotni ochish")}
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <a
            className="button button-secondary"
            href="/lessons/web-asoslari.zip"
            download
          >
            <Download size={16} aria-hidden="true" /> {t("ZIP yuklab olish")}
          </a>
        </div>
        <p className={styles.hint}>
          {t(
            "Oflayn foydalanish: ZIPni oching va index.html faylini brauzerda ishga tushiring.",
          )}
        </p>
      </div>
    </section>
  );
}
