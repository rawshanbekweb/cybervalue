"use client";
import { startTransition, useActionState } from "react";
import { useTranslator } from "@/components/locale-provider";
import {
  saveSettingsAction,
  type SettingsState,
} from "@/app/admin/(cms)/settings/actions";
import { SECTIONS, type SiteConfig } from "@/lib/site-config";

const GROUPS = [
  {
    id: "main",
    title: "Directions",
    hint: "The two learning paths and the student portal.",
  },
  {
    id: "lab",
    title: "Academy labs",
    hint: "A lab that is switched off disappears from the academy page and answers “not found”.",
  },
  {
    id: "extra",
    title: "Other",
    hint: "Projects, research, lab write-ups, CTF and resources. When off they leave the footer and the home page.",
  },
] as const;

export function SettingsForm({
  config,
  socials,
  envIndexable,
}: {
  config: SiteConfig;
  socials: Record<string, string>;
  envIndexable: boolean;
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    saveSettingsAction,
    undefined,
  );
  const field = (
    id: string,
    label: string,
    value: string,
    options: {
      max?: number;
      area?: boolean;
      type?: string;
      placeholder?: string;
    } = {},
  ) => (
    <div className="admin-field">
      <label htmlFor={id}>{t(label)}</label>
      {options.area ? (
        <textarea
          id={id}
          name={id}
          className="admin-textarea"
          rows={2}
          maxLength={options.max}
          defaultValue={value}
          placeholder={options.placeholder}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={options.type ?? "text"}
          className="admin-input"
          maxLength={options.max}
          defaultValue={value}
          placeholder={options.placeholder}
        />
      )}
    </div>
  );
  return (
    // Submitted by hand: a form `action` would reset every field after an
    // error and lose what the admin typed.
    <form
      className="admin-settings"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
    >
      <section className="admin-form" aria-labelledby="settings-sections">
        <h2 id="settings-sections">{t("Sections")}</h2>
        {GROUPS.map((group) => (
          <fieldset key={group.id} className="admin-switches">
            <legend>{t(group.title)}</legend>
            <p className="muted">{t(group.hint)}</p>
            {SECTIONS.filter((s) => s.group === group.id).map((s) => (
              <label key={s.id} className="admin-switch">
                <input
                  type="checkbox"
                  name={`section-${s.id}`}
                  defaultChecked={config.sections[s.id]}
                />
                <span>{t(s.label)}</span>
                <code>{s.href}</code>
              </label>
            ))}
          </fieldset>
        ))}
      </section>

      <section className="admin-form" aria-labelledby="settings-banner">
        <h2 id="settings-banner">{t("Announcement banner")}</h2>
        <label className="admin-switch">
          <input
            type="checkbox"
            name="announcement"
            defaultChecked={config.announcement.enabled}
          />
          <span>{t("Show the banner above every public page")}</span>
        </label>
        <div className="admin-field-row">
          {field(
            "announcementUz",
            "Text (Uzbek)",
            config.announcement.text.uz,
            { max: 200 },
          )}
          {field(
            "announcementEn",
            "Text (English)",
            config.announcement.text.en,
            { max: 200 },
          )}
        </div>
        {field(
          "announcementHref",
          "Link (optional)",
          config.announcement.href,
          {
            max: 300,
            placeholder: "/junior",
          },
        )}
      </section>

      <section className="admin-form" aria-labelledby="settings-home">
        <h2 id="settings-home">{t("Home page")}</h2>
        <p className="muted">
          {t("Leave a field empty to use the built-in text.")}
        </p>
        <div className="admin-field-row">
          {field("titleUz", "Headline (Uzbek)", config.hero.title.uz, {
            max: 80,
          })}
          {field("titleEn", "Headline (English)", config.hero.title.en, {
            max: 80,
          })}
        </div>
        <div className="admin-field-row">
          {field("leadUz", "Intro (Uzbek)", config.hero.lead.uz, {
            max: 300,
            area: true,
          })}
          {field("leadEn", "Intro (English)", config.hero.lead.en, {
            max: 300,
            area: true,
          })}
        </div>
      </section>

      <section className="admin-form" aria-labelledby="settings-contacts">
        <h2 id="settings-contacts">{t("Contacts and social links")}</h2>
        <div className="admin-field-row">
          {field("email", "Contact email", config.email, {
            max: 254,
            type: "email",
          })}
          {["GitHub", "LinkedIn", "Telegram", "Instagram"].map((p) => (
            <div key={p}>
              {field(`social-${p}`, p, socials[p] ?? "", {
                max: 300,
                type: "url",
                placeholder: "https://",
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="admin-form" aria-labelledby="settings-search">
        <h2 id="settings-search">{t("Search engines")}</h2>
        <div className="admin-field">
          <label htmlFor="indexable">
            {t("Show the site in Google and other search engines")}
          </label>
          <select
            id="indexable"
            name="indexable"
            className="admin-input"
            defaultValue={
              config.indexable === null ? "" : config.indexable ? "yes" : "no"
            }
          >
            <option value="">
              {t("Server default ({value})", {
                value: envIndexable ? t("Yes") : t("No"),
              })}
            </option>
            <option value="yes">
              {t("Yes — open the sitemap and robots.txt")}
            </option>
            <option value="no">{t("No — hide the whole site")}</option>
          </select>
        </div>
      </section>

      <div className="admin-settings-save">
        {state?.error && (
          <p className="admin-error" role="alert">
            {t(state.error)}
          </p>
        )}
        {state?.success && <p role="status">{t(state.success)}</p>}
        <button
          type="submit"
          className="button button-primary"
          disabled={pending}
        >
          {pending ? t("Saving…") : t("Save settings")}
        </button>
      </div>
    </form>
  );
}
