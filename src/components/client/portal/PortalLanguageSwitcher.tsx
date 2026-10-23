"use client";

import { LOCALE_DEFINITIONS, LOCALES, type Locale } from "@/lib/i18n/config";
import { setPortalLocaleAction } from "@/lib/i18n/portal-locale-actions";

type PortalLanguageSwitcherProps = {
  locale: Locale;
  label: string;
};

export function PortalLanguageSwitcher({ locale, label }: PortalLanguageSwitcherProps) {
  return (
    <form action={setPortalLocaleAction}>
      <label className="inline-flex items-center">
        <span className="sr-only">{label}</span>
        <select
          name="locale"
          aria-label={label}
          defaultValue={locale}
          className="h-9 rounded-full border border-[#e4d8c8] bg-white/80 px-2 text-xs tracking-wide text-[#5c564e]"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          {LOCALES.map((code) => (
            <option key={code} value={code} lang={LOCALE_DEFINITIONS[code].htmlLang}>
              {LOCALE_DEFINITIONS[code].nativeLabel}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
