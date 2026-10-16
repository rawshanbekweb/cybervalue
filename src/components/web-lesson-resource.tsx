import { getTranslator } from "@/lib/i18n/server";
import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardCheck,
  Download,
  Info,
  Presentation,
  Terminal,
} from "lucide-react";
import { EXAM_MINUTES, MAX_TOTAL } from "@/lib/resource-exam/content";
import styles from "./web-lesson-resource.module.css";

export async function WebLessonResource() {
  const t = await getTranslator();
  return (
    <div className={styles.grid}>
      <section className={styles.card} aria-labelledby="web-lesson-title">
        <div className={styles.preview} aria-hidden="true">
          <span className={styles.icon}>
            <Presentation size={24} strokeWidth={1.5} />
          </span>
          <span className={styles.tags}>
            <span>{t("WEB / ASOSLAR")}</span>
            <span>IP / DNS / HTTP / TLS</span>
          </span>
          <strong className={styles.stat}>{t("75 slayd")}</strong>
        </div>
        <div className={styles.content}>
          <span className="eyebrow">{t("Interaktiv dars · O‘zbekcha")}</span>
          <h2 id="web-lesson-title">{t("Web qanday ishlaydi?")}</h2>
          <p>
            {t(
              "Internet va IP manzillardan HTTP, TLS va veb-xavfsizlikkacha — 30 mavzu, bosqichli sxemalar, tekshiruv savollari va o‘qituvchi izohlari.",
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
            <Info size={14} aria-hidden="true" />
            {t(
              "Oflayn foydalanish: ZIPni oching va index.html faylini brauzerda ishga tushiring.",
            )}
          </p>
        </div>
      </section>

      <section className={styles.card} aria-labelledby="linux-lesson-title">
        <div className={styles.preview} aria-hidden="true">
          <span className={styles.icon}>
            <Terminal size={24} strokeWidth={1.5} />
          </span>
          <span className={styles.tags}>
            <span>{t("LINUX / ASOSLAR")}</span>
            <span>{t("BASH / PERMISSIONS / NETWORKING / SSH")}</span>
          </span>
          <strong className={styles.stat}>{t("60 slayd")}</strong>
        </div>
        <div className={styles.content}>
          <span className="eyebrow">{t("Interaktiv dars · O‘zbekcha")}</span>
          <h2 id="linux-lesson-title">{t("Linux va Tarmoq Asoslari")}</h2>
          <p>
            {t(
              "Terminal, fayllar tizimi, jarayonlar, paketlar, tarmoq buyruqlari va xavfsiz ulanish asoslari — 25 mavzu, amaliy topshiriqlar va diagrammalar.",
            )}
          </p>
          <div className={styles.actions}>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              className="button button-primary"
              href="/lessons/linux-va-tarmoq-asoslari/index.html"
            >
              {t("Taqdimotni ochish")}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              className="button button-secondary"
              href="/lessons/linux-va-tarmoq-asoslari.zip"
              download
            >
              <Download size={16} aria-hidden="true" /> {t("ZIP yuklab olish")}
            </a>
            <Link
              className="button button-secondary"
              href="/akademiya/linux-basics"
            >
              <Terminal size={16} aria-hidden="true" /> {t("Open Linux lab")}
            </Link>
          </div>
          <p className={styles.hint}>
            <Info size={14} aria-hidden="true" />
            {t(
              "Oflayn foydalanish: ZIPni oching va index.html faylini brauzerda ishga tushiring.",
            )}
          </p>
        </div>
      </section>
      <section className={styles.card} aria-labelledby="resource-exam-title">
        <div className={styles.preview} aria-hidden="true">
          <span className={styles.icon}>
            <ClipboardCheck size={24} strokeWidth={1.5} />
          </span>
          <span className={styles.tags}>
            <span>{t("IMTIHON / 1")}</span>
            <span>{t("TEST + AMALIY ISHLAR")}</span>
          </span>
          <strong className={styles.stat}>
            {t("{points} ball", { points: MAX_TOTAL })}
          </strong>
        </div>
        <div className={styles.content}>
          <span className="eyebrow">{t("Imtihon · O‘zbekcha")}</span>
          <h2 id="resource-exam-title">{t("Resurslar imtihoni")}</h2>
          <p>
            {t(
              "Web qanday ishlaydi? (75 slayd) va Linux asoslari (1–20 slayd) asosida: test savollari, URL, subnet, routing, DNS, HTTP va terminal buyruqlari bo‘yicha amaliy ishlar.",
            )}
          </p>
          <div className={styles.actions}>
            <Link className="button button-primary" href="/resources/exam">
              {t("Imtihonni boshlash")}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <p className={styles.hint}>
            <Info size={14} aria-hidden="true" />
            {t("Vaqt: {minutes} daqiqa. Natija darhol ko‘rsatiladi.", {
              minutes: EXAM_MINUTES,
            })}
          </p>
        </div>
      </section>
    </div>
  );
}
