import { ArrowUpRight, Download, Presentation } from "lucide-react";
import styles from "./web-lesson-resource.module.css";

export function WebLessonResource() {
  return (
    <section
      className={styles.card}
      aria-labelledby="web-lesson-title"
      lang="uz"
    >
      <div className={styles.preview} aria-hidden="true">
        <Presentation size={36} strokeWidth={1.3} />
        <span>WEB / ASOSLAR</span>
        <div>IP / DNS / HTTP / TLS</div>
        <strong>75 slayd</strong>
      </div>
      <div className={styles.content}>
        <span className="eyebrow">Interaktiv dars · O‘zbekcha</span>
        <h2 id="web-lesson-title">Web qanday ishlaydi?</h2>
        <p>
          Internet va IP manzillardan HTTP, TLS va web xavfsizligigacha — 30
          mavzu, bosqichli sxemalar, tekshiruv savollari va o‘qituvchi izohlari.
        </p>
        <div className={styles.actions}>
          {/* A standalone HTML document needs a full navigation, not the Next router. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            className="button button-primary"
            href="/lessons/web-asoslari/index.html"
          >
            Taqdimotni ochish <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <a
            className="button button-secondary"
            href="/lessons/web-asoslari.zip"
            download
          >
            <Download size={16} aria-hidden="true" /> ZIP yuklab olish
          </a>
        </div>
        <p className={styles.hint}>
          Oflayn foydalanish: ZIPni oching va index.html faylini brauzerda ishga
          tushiring.
        </p>
      </div>
    </section>
  );
}
