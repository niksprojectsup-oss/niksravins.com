"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  formatPortalGreeting,
  getPortalContent,
  portalIntlLocale,
  type PortalContent,
} from "@/content/i18n/portal";
import { PortalFooter } from "@/components/client/portal/PortalFooter";
import { LOCALE_DEFINITIONS, LOCALES, type Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/locales";
import { ASSESSMENT_DIMENSIONS } from "@/lib/journey/constants";
import { MilestoneTimeline } from "@/components/client/journey/MilestoneTimeline";
import {
  ADMIN_PORTAL_PREVIEW_SECTIONS,
  filterPreviewAssessments,
  filterPreviewInsights,
  filterPreviewJournal,
  previewMutationsAllowed,
  previewSectionLabel,
  buildAdminPortalPreviewFixture,
  type AdminPortalPreviewData,
  type AdminPortalPreviewSection,
  type PreviewInsightFilter,
  type PreviewPeriod,
} from "@/lib/portal/admin-preview";

const CARDS = [
  ["journey", "/images/portal/process.webp", "processTitle", "processBody"],
  ["journal", "/images/portal/session-journal.webp", "journalTitle", "journalBody"],
  ["trunks", "/images/portal/trunks-branches.webp", "trunksTitle", "trunksBody"],
] as const;

type CardTarget = (typeof CARDS)[number][0];

type AdminPortalPreviewProps = {
  initialLocale: Locale;
};

function formatWhen(iso: string, timeZone: string, locale: Locale): string {
  return new Intl.DateTimeFormat(portalIntlLocale(locale), {
    timeZone,
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDay(iso: string, locale: Locale): string {
  const value = iso.length === 10 ? `${iso}T12:00:00.000Z` : iso;
  return new Intl.DateTimeFormat(portalIntlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function AdminPortalPreview({ initialLocale }: AdminPortalPreviewProps) {
  const data = buildAdminPortalPreviewFixture();
  const [locale, setLocale] = useState(initialLocale);
  const [section, setSection] = useState<AdminPortalPreviewSection | "trunks">("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PreviewInsightFilter>("ALL");
  const [period, setPeriod] = useState<PreviewPeriod>("3");
  const [menuOpen, setMenuOpen] = useState(false);
  const content = getPortalContent(locale);
  const writesDisabled = !previewMutationsAllowed();

  function openSection(next: AdminPortalPreviewSection | "trunks") {
    setSection(next);
    setMenuOpen(false);
  }

  return (
    <div lang={portalIntlLocale(locale)} className="min-h-screen bg-[#f6f1e8] text-[#2c2824]">
      <header className="border-b border-[#eadfd2] bg-[#f7f1e8]/95">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 md:px-8">
          <button
            type="button"
            onClick={() => openSection("home")}
            className="font-display text-sm tracking-[0.22em] text-[#3f3a34]"
          >
            NIKS RAVINS
          </button>
          <nav aria-label={content.nav.label} className="ml-auto hidden items-center gap-6 md:flex">
            {ADMIN_PORTAL_PREVIEW_SECTIONS.map((id) => (
              <button
                key={id}
                type="button"
                data-preview-section={id}
                aria-current={section === id ? "page" : undefined}
                onClick={() => openSection(id)}
                className={
                  section === id
                    ? "text-sm text-[#2f2b26] underline decoration-[#c4b49a] underline-offset-8"
                    : "text-sm text-[#6d675f]"
                }
              >
                {previewSectionLabel(id, content)}
              </button>
            ))}
          </nav>
          <label className="ml-auto hidden md:ml-4 md:block">
            <span className="sr-only">{content.nav.search}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={content.insights.searchPlaceholder}
              aria-label={content.nav.search}
              className="h-9 w-40 rounded-full border border-[#e4d8c8] bg-white/70 px-3 text-sm text-[#3f3a34]"
            />
          </label>
          <select
            aria-label={content.languageSwitcherLabel}
            value={locale}
            onChange={(event) => {
              if (isLocale(event.target.value)) setLocale(event.target.value);
            }}
            className="h-9 rounded-full border border-[#e4d8c8] bg-white/80 px-2 text-xs tracking-wide text-[#5c564e]"
          >
            {LOCALES.map((code) => (
              <option key={code} value={code}>
                {LOCALE_DEFINITIONS[code].nativeLabel}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-full border border-[#e4d8c8] px-3 text-sm text-[#5c564e] md:hidden"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? content.nav.closeMenu : content.nav.openMenu}
          </button>
        </div>
        {menuOpen ? (
          <div className="border-t border-[#eadfd2] px-4 py-3 md:hidden">
            <ul className="flex flex-col gap-2">
              {ADMIN_PORTAL_PREVIEW_SECTIONS.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    data-preview-section={id}
                    onClick={() => openSection(id)}
                    className="block py-1 text-left text-[#3f3a34]"
                  >
                    {previewSectionLabel(id, content)}
                  </button>
                </li>
              ))}
            </ul>
            <label className="mt-3 block">
              <span className="sr-only">{content.nav.search}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={content.insights.searchPlaceholder}
                className="h-10 w-full rounded-full border border-[#e4d8c8] bg-white px-3 text-sm"
              />
            </label>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        {section === "home" ? (
          <PreviewHome
            content={content}
            locale={locale}
            data={data}
            period={period}
            onPeriod={setPeriod}
            query={query}
            onOpen={openSection}
            writesDisabled={writesDisabled}
          />
        ) : null}
        {section === "journey" ? (
          <PreviewJourney content={content} locale={locale} data={data} writesDisabled={writesDisabled} />
        ) : null}
        {section === "sessions" ? (
          <PreviewSessions
            content={content}
            locale={locale}
            data={data}
            onOpen={openSection}
            writesDisabled={writesDisabled}
          />
        ) : null}
        {section === "insights" ? (
          <PreviewInsights
            content={content}
            locale={locale}
            data={data}
            query={query}
            category={category}
            onCategory={setCategory}
          />
        ) : null}
        {section === "journal" ? (
          <PreviewJournal content={content} locale={locale} data={data} query={query} />
        ) : null}
        {section === "trunks" ? <PreviewTrunks content={content} /> : null}
      </main>

      <PortalFooter content={content} locale={locale} />
    </div>
  );
}

function PreviewHome({
  content,
  locale,
  data,
  period,
  onPeriod,
  query,
  onOpen,
  writesDisabled,
}: {
  content: PortalContent;
  locale: Locale;
  data: AdminPortalPreviewData;
  period: PreviewPeriod;
  onPeriod: (period: PreviewPeriod) => void;
  query: string;
  onOpen: (section: AdminPortalPreviewSection | CardTarget) => void;
  writesDisabled: boolean;
}) {
  const nextSession = data.sessions.find((session) => session.status === "SCHEDULED") ?? null;
  const lastSession = [...data.sessions].reverse().find((session) => session.status === "COMPLETED") ?? null;
  const insights = filterPreviewInsights(data.insights, query, "ALL");
  const growth = useMemo(() => {
    const inRange = filterPreviewAssessments(data.assessments, period, data.asOf);
    return {
      current: inRange[inRange.length - 1] ?? null,
      starting: inRange.length > 1 ? inRange[0] : null,
    };
  }, [data.asOf, data.assessments, period]);

  return (
    <div className="layout-stack-xl">
      <section className="relative min-h-[28rem] overflow-hidden rounded-[2rem]">
        <Image
          src="/images/portal/hero.webp"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 1100px, 100vw"
          className="object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/10" />
        <div className="relative flex min-h-[28rem] max-w-xl flex-col justify-end p-6 text-white md:p-10">
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            {formatPortalGreeting(content.hero.greeting, data.firstName)}
          </h1>
          <p className="mt-3 text-lg">{content.hero.subtitle}</p>
          <p className="mt-3 max-w-md text-sm text-white/85">{content.hero.intro}</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,0.8fr))]">
        <article className="rounded-3xl border border-[#eadfd2] bg-white p-5">
          <p className="text-sm text-[#6d675f]">{content.stats.nextSession}</p>
          <p className="mt-2 font-display text-2xl">
            {nextSession
              ? formatWhen(nextSession.scheduledAt, data.timezone, locale)
              : content.stats.noNextSession}
          </p>
        </article>
        <article className="rounded-3xl border border-[#eadfd2] bg-white p-5">
          <p className="font-display text-3xl">{data.completedSessions}</p>
          <p className="text-sm text-[#6d675f]">{content.stats.sessions}</p>
        </article>
        <article className="rounded-3xl border border-[#eadfd2] bg-white p-5">
          <p className="font-display text-3xl">{data.recordedChanges}</p>
          <p className="text-sm text-[#6d675f]">{content.stats.recordedChanges}</p>
        </article>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl">{content.growth.title}</h2>
            <p className="mt-2 text-[#6d675f]">{content.growth.subtitle}</p>
          </div>
          <label className="text-sm text-[#6d675f]">
            <span className="sr-only">{content.growth.periodLabel}</span>
            <select
              value={period}
              onChange={(event) => onPeriod(event.target.value as PreviewPeriod)}
              className="h-10 rounded-full border border-[#e4d8c8] bg-white px-3"
            >
              <option value="3">{content.growth.period3}</option>
              <option value="6">{content.growth.period6}</option>
              <option value="all">{content.growth.periodAll}</option>
            </select>
          </label>
        </div>
        {growth.current ? (
          <ul className="mt-5 grid gap-3">
            {ASSESSMENT_DIMENSIONS.map((dimension) => {
              const current = growth.current?.[dimension.key] ?? 0;
              const starting = growth.starting?.[dimension.key];
              return (
                <li key={dimension.key} className="rounded-2xl border border-[#eadfd2] bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span>{content.growth.dimensions[dimension.key]}</span>
                    <span className="text-[#6d675f]">
                      {starting !== undefined ? `${starting} → ${current}` : current}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#efe7dc]" aria-hidden>
                    <div
                      className="h-full rounded-full bg-[#7d9a78]"
                      style={{ width: `${Math.min(100, current * 10)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-5 rounded-2xl border border-[#eadfd2] bg-white p-5 text-[#6d675f]">
            {content.growth.empty}
          </p>
        )}
      </section>

      <section className="rounded-[2rem] border border-[#eadfd2] bg-white p-5 md:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-3xl">{content.lastSession.title}</h2>
            <p className="mt-2 text-[#6d675f]">{content.lastSession.subtitle}</p>
          </div>
          <button type="button" onClick={() => onOpen("sessions")} className="text-sm text-[#3f6b4e]">
            {content.lastSession.viewAll}
          </button>
        </div>
        {lastSession ? (
          <div className="mt-5">
            <p className="text-sm text-[#6d675f]">
              {formatWhen(lastSession.scheduledAt, data.timezone, locale)}
            </p>
            <h3 className="mt-2 text-xl">{lastSession.sessionType}</h3>
            <h4 className="mt-4 text-sm text-[#6d675f]">{content.lastSession.conclusions}</h4>
            <p className="mt-2">{lastSession.takeaway}</p>
          </div>
        ) : (
          <p className="mt-5 text-[#6d675f]">{content.lastSession.empty}</p>
        )}
      </section>

      <section className="rounded-[2rem] border border-[#eadfd2] bg-[#fbf7f1] p-5 md:p-7">
        <h2 className="font-display text-3xl">{content.focus.title}</h2>
        <p className="mt-2 max-w-2xl text-[#6d675f]">{content.focus.subtitle}</p>
        <label className="mt-5 block text-sm text-[#5c564e]">
          {content.focus.label}
          <textarea
            readOnly
            value={data.preparationNote}
            className="mt-2 min-h-32 w-full rounded-2xl border border-[#e4d8c8] bg-white px-3 py-2"
          />
        </label>
        <button
          type="button"
          disabled={writesDisabled}
          className="mt-3 rounded-full bg-[#3f6b4e] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {content.focus.save}
        </button>
      </section>

      <section>
        <h2 className="font-display text-3xl">{content.insights.title}</h2>
        <p className="mt-2 text-[#6d675f]">{content.insights.subtitle}</p>
        {insights.length > 0 ? (
          <ul className="mt-5 grid gap-3">
            {insights.map((insight) => (
              <li key={insight.id} className="rounded-2xl border border-[#eadfd2] bg-white p-4">
                <p>{insight.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-2xl border border-[#eadfd2] bg-white p-5 text-[#6d675f]">
            {content.insights.noMatches}
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {CARDS.map(([target, src, titleKey, bodyKey]) => (
          <button
            key={target}
            type="button"
            onClick={() => onOpen(target)}
            className="relative min-h-64 overflow-hidden rounded-[1.6rem] text-left"
          >
            <Image src={src} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="block font-display text-2xl">{content.cards[titleKey]}</span>
              <span className="mt-1 block text-sm text-white/85">{content.cards[bodyKey]}</span>
            </span>
          </button>
        ))}
      </section>
    </div>
  );
}

function PreviewJourney({
  content,
  locale,
  data,
  writesDisabled,
}: {
  content: PortalContent;
  locale: Locale;
  data: AdminPortalPreviewData;
  writesDisabled: boolean;
}) {
  const completed = data.timeline.filter((slot) => slot.status === "completed").length;
  const remaining = data.timeline.length - completed;
  const nextUnscheduled = data.timeline.find((slot) => slot.status === "not_scheduled");

  return (
    <div className="layout-stack-xl">
      <header>
        <h1 className="font-display text-4xl">{content.journeyPage.title}</h1>
        <p className="mt-2 max-w-2xl text-[#6d675f]">{content.journeyPage.description}</p>
      </header>
      <section className="rounded-[2rem] border border-[#eadfd2] bg-white p-5 md:p-7">
        <p>
          {content.journeyPage.sessionProgress
            .replaceAll("{current}", "3")
            .replaceAll("{total}", String(data.timeline.length))}
        </p>
        <p className="mt-2 text-sm text-[#6d675f]">
          {completed} {content.journeyPage.completed} · {remaining} {content.journeyPage.remaining}
        </p>
        <ol className="mt-6 grid gap-4">
          {data.timeline.map((slot) => (
            <li key={slot.sessionNumber} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p>
                  {content.journeyPage.sessionProgress
                    .replaceAll("{current}", String(slot.sessionNumber))
                    .replaceAll("{total}", String(data.timeline.length))}
                </p>
                <p className="text-sm text-[#6d675f]">
                  {slot.scheduledAt
                    ? formatWhen(slot.scheduledAt, data.timezone, locale)
                    : content.journeyPage.notScheduled}
                </p>
              </div>
              {slot.status === "completed" ? (
                <span className="text-sm text-[#3f6b4e]">{content.journeyPage.completed}</span>
              ) : null}
              {slot.status === "scheduled" ? (
                <span className="text-sm text-[#6d675f]">{content.sessionsPage.upcomingSession}</span>
              ) : null}
              {slot.status === "not_scheduled" && slot.sessionNumber === nextUnscheduled?.sessionNumber ? (
                <button
                  type="button"
                  disabled={writesDisabled}
                  className="rounded-full bg-[#3f6b4e] px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {content.sessionsPage.book}
                </button>
              ) : null}
              {slot.status === "not_scheduled" && slot.sessionNumber !== nextUnscheduled?.sessionNumber ? (
                <span className="text-sm text-[#6d675f]">{content.journeyPage.notScheduled}</span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
      <section className="rounded-[2rem] border border-[#eadfd2] bg-white p-5 md:p-7">
        <h2 className="font-display text-3xl">{content.journeyPage.milestones}</h2>
        <div className="mt-6">
          <MilestoneTimeline
            milestones={data.milestones.map((milestone) => ({
              ...milestone,
              label: content.journeyPage.milestoneLabels[milestone.key],
            }))}
            labels={content.journeyPage.milestoneLabels}
          />
        </div>
      </section>
    </div>
  );
}

function PreviewSessions({
  content,
  locale,
  data,
  onOpen,
  writesDisabled,
}: {
  content: PortalContent;
  locale: Locale;
  data: AdminPortalPreviewData;
  onOpen: (section: AdminPortalPreviewSection) => void;
  writesDisabled: boolean;
}) {
  const now = Date.parse(data.asOf);
  const upcoming = data.sessions.filter(
    (session) => session.status === "SCHEDULED" && Date.parse(session.scheduledAt) > now,
  );
  const past = data.sessions.filter((session) => !upcoming.some((item) => item.id === session.id));

  return (
    <div className="layout-stack-xl">
      <header>
        <h1 className="font-display text-4xl">{content.sessionsPage.title}</h1>
        <p className="mt-2 max-w-2xl text-[#6d675f]">{content.sessionsPage.description}</p>
      </header>
      <section>
        <h2 className="font-display text-3xl">{content.sessionsPage.upcoming}</h2>
        <ul className="mt-4 grid gap-3">
          {upcoming.map((session) => (
            <li key={session.id} className="rounded-3xl border border-[#eadfd2] bg-white p-5">
              <p className="text-sm text-[#3f6b4e]">
                {content.sessionsPage.sessionNumber.replaceAll("{number}", String(session.sessionNumber))}
              </p>
              <p className="mt-2">{session.sessionType}</p>
              <p className="mt-2 text-sm text-[#6d675f]">
                {formatWhen(session.scheduledAt, data.timezone, locale)}
              </p>
              <button type="button" onClick={() => onOpen("home")} className="mt-4 text-sm text-[#3f6b4e]">
                {content.sessionsPage.prepare}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={writesDisabled}
          className="mt-4 rounded-full bg-[#3f6b4e] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {content.sessionsPage.book}
        </button>
      </section>
      <section>
        <h2 className="font-display text-3xl">{content.sessionsPage.past}</h2>
        <ul className="mt-4 grid gap-3">
          {past.map((session) => (
            <li key={session.id} className="rounded-3xl border border-[#eadfd2] bg-white p-5">
              <p className="text-sm text-[#3f6b4e]">
                {content.sessionsPage.sessionNumber.replaceAll("{number}", String(session.sessionNumber))}
              </p>
              <p className="mt-2">{session.sessionType}</p>
              <p className="mt-2 text-sm text-[#6d675f]">
                {formatWhen(session.scheduledAt, data.timezone, locale)}
              </p>
              {session.rating ? (
                <p className="mt-3 text-sm">
                  {content.sessionsPage.reflection}: {session.rating}/5
                </p>
              ) : null}
              {session.takeaway ? (
                <p className="mt-2">
                  {content.sessionsPage.takeaway}: {session.takeaway}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PreviewInsights({
  content,
  locale,
  data,
  query,
  category,
  onCategory,
}: {
  content: PortalContent;
  locale: Locale;
  data: AdminPortalPreviewData;
  query: string;
  category: PreviewInsightFilter;
  onCategory: (category: PreviewInsightFilter) => void;
}) {
  const visible = filterPreviewInsights(data.insights, query, category);
  const filters = [
    ["ALL", content.insights.all],
    ["PATTERN", content.insights.pattern],
    ["TRIGGER", content.insights.trigger],
    ["POSITIVE_OBSERVATION", content.insights.positive],
  ] as const;

  return (
    <div className="layout-stack-xl">
      <header>
        <h1 className="font-display text-4xl">{content.insights.title}</h1>
        <p className="mt-2 max-w-2xl text-[#6d675f]">{content.insights.subtitle}</p>
      </header>
      <div className="flex flex-wrap gap-2" role="group" aria-label={content.insights.categoryLabel}>
        {filters.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={category === key}
            onClick={() => onCategory(key)}
            className={
              category === key
                ? "rounded-full border border-[#3f6b4e] bg-[#e7f0ea] px-3 py-1.5 text-sm text-[#2f5a40]"
                : "rounded-full border border-[#e4d8c8] px-3 py-1.5 text-sm text-[#6d675f]"
            }
          >
            {label}
          </button>
        ))}
      </div>
      {visible.length > 0 ? (
        <ul className="grid gap-3">
          {visible.map((insight) => (
            <li key={insight.id} className="rounded-3xl border border-[#eadfd2] bg-white p-5">
              <p className="text-sm text-[#6d675f]">
                {formatDay(insight.observedOn, locale)} ·{" "}
                {insight.category === "PATTERN"
                  ? content.insights.pattern
                  : insight.category === "TRIGGER"
                    ? content.insights.trigger
                    : content.insights.positive}
              </p>
              <p className="mt-2">{insight.content}</p>
              <p className="mt-2 text-sm text-[#6d675f]">
                {insight.visibility === "PRIVATE" ? content.insights.privateTitle : content.insights.sharedTitle}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-[#eadfd2] bg-white p-5 text-[#6d675f]">
          {query.trim() || category !== "ALL" ? content.insights.noMatches : content.insights.empty}
        </p>
      )}
    </div>
  );
}

function PreviewJournal({
  content,
  locale,
  data,
  query,
}: {
  content: PortalContent;
  locale: Locale;
  data: AdminPortalPreviewData;
  query: string;
}) {
  const entries = filterPreviewJournal(data.sessions, query);

  return (
    <div className="layout-stack-xl">
      <header>
        <h1 className="font-display text-4xl">{content.cards.journalTitle}</h1>
        <p className="mt-2 max-w-2xl text-[#6d675f]">{content.cards.journalBody}</p>
      </header>
      {entries.length > 0 ? (
        <ul className="grid gap-3">
          {entries.map((session) => (
            <li key={session.id} className="rounded-3xl border border-[#eadfd2] bg-white p-5">
              <p className="text-sm text-[#6d675f]">
                {formatWhen(session.scheduledAt, data.timezone, locale)}
              </p>
              <h2 className="mt-2 text-xl">
                {content.sessionsPage.sessionNumber.replaceAll("{number}", String(session.sessionNumber))}
              </h2>
              <p className="mt-3">{session.takeaway}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-[#eadfd2] bg-white p-5 text-[#6d675f]">
          {content.insights.noMatches}
        </p>
      )}
    </div>
  );
}

function PreviewTrunks({ content }: { content: PortalContent }) {
  return (
    <section className="rounded-[2rem] border border-[#eadfd2] bg-white p-6 md:p-8">
      <h1 className="font-display text-3xl">{content.trunksPage.title}</h1>
      <p className="mt-3 max-w-2xl text-[#6d675f]">{content.trunksPage.empty}</p>
    </section>
  );
}
