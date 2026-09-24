"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { JSONContent } from "@tiptap/react";
import Link from "next/link";
import {
  CmsRichTextEditor,
  type CmsRichTextEditorHandle,
} from "@/components/admin/cms/CmsRichTextEditor";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  CMS_LOCALES,
  CMS_LOCALE_LABELS,
  getCmsPageDefinition,
  type CmsLocale,
} from "@/lib/cms/definitions";
import {
  publishCmsContentAction,
  saveCmsDraftAction,
} from "@/lib/admin/actions/cms-content";
import {
  collectCmsFieldsForSave,
  shouldSyncCmsEditorFieldsFromServer,
} from "@/lib/cms/draft-save";
import { createEmptyTiptapDocument, buildCmsEditorFieldMap, serializeCmsFieldsForAction } from "@/lib/cms/tiptap";
import type { CmsPageContent, CmsTiptapJson } from "@/lib/cms/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type CmsPageEditorProps = {
  initialContent: CmsPageContent;
  locale: CmsLocale;
};

function statusVariant(status: CmsPageContent["status"]) {
  return status === "PUBLISHED" ? "accent" : "muted";
}

export function CmsPageEditor({ initialContent, locale }: CmsPageEditorProps) {
  const pageDefinition = getCmsPageDefinition(initialContent.slug);
  const [activeSectionKey, setActiveSectionKey] = useState(
    pageDefinition?.sections[0]?.key ?? "main",
  );
  const [pageStatus, setPageStatus] = useState(initialContent.status);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [fields, setFields] = useState<Record<string, CmsTiptapJson>>(() =>
    buildCmsEditorFieldMap(initialContent),
  );
  const [editorSyncVersion, setEditorSyncVersion] = useState(0);
  const editorRefs = useRef<Record<string, CmsRichTextEditorHandle | null>>({});

  useEffect(() => {
    if (!shouldSyncCmsEditorFieldsFromServer(isDirty)) {
      return;
    }

    setFields(buildCmsEditorFieldMap(initialContent));
    setEditorSyncVersion((current) => current + 1);
    // Sync only when server content or locale changes, not when isDirty flips after save.
  }, [initialContent, locale]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function applySavedFields(fieldsToSave: Record<string, CmsTiptapJson | null>) {
    setFields((current) => {
      const next = { ...current };
      for (const [fieldKey, value] of Object.entries(fieldsToSave)) {
        if (value) {
          next[fieldKey] = value;
        }
      }
      return next;
    });
  }

  function collectFieldsForSave(): Record<string, CmsTiptapJson | null> {
    const liveDocuments: Record<string, CmsTiptapJson> = {};

    for (const [fieldKey, editorRef] of Object.entries(editorRefs.current)) {
      if (editorRef) {
        liveDocuments[fieldKey] = editorRef.getDocument();
      }
    }

    return serializeCmsFieldsForAction(collectCmsFieldsForSave(fields, liveDocuments));
  }

  function updateField(fieldKey: string, value: JSONContent) {
    setFields((current) => ({ ...current, [fieldKey]: value as CmsTiptapJson }));
    setIsDirty(true);
    setError(null);
  }

  function handleSaveDraft() {
    const fieldsToSave = collectFieldsForSave();

    startTransition(async () => {
      setError(null);
      const result = await saveCmsDraftAction({
        pageSlug: initialContent.slug,
        locale,
        fields: fieldsToSave,
      });

      if (result?.ok) {
        applySavedFields(fieldsToSave);
        setSavedAt(result.savedAt);
        setIsDirty(false);
      }
    });
  }

  function handlePublish() {
    const fieldsToSave = collectFieldsForSave();

    startTransition(async () => {
      setError(null);
      const saveResult = await saveCmsDraftAction({
        pageSlug: initialContent.slug,
        locale,
        fields: fieldsToSave,
      });

      if (!saveResult?.ok) {
        setError("Unable to save draft before publishing.");
        return;
      }

      const publishResult = await publishCmsContentAction({
        pageSlug: initialContent.slug,
        locale,
      });

      if (publishResult?.ok) {
        applySavedFields(fieldsToSave);
        setPageStatus("PUBLISHED");
        setPublishedAt(publishResult.publishedAt);
        setSavedAt(saveResult.savedAt);
        setIsDirty(false);
      }
    });
  }

  return (
    <div className="layout-stack-lg max-w-wide">
      <div className="flex flex-col gap-4 border-b border-border-subtle pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="layout-stack-sm">
          <Link href="/admin/content" className="type-accent-link type-caption">
            ← Back to Content
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="type-heading-sm">{initialContent.title}</h1>
            <AdminStatusBadge
              label={pageStatus === "PUBLISHED" ? "Published" : "Draft"}
              variant={statusVariant(pageStatus)}
            />
          </div>
          <p className="type-caption text-ink-subtle">/{initialContent.slug}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isPending || !isDirty}
            onClick={handleSaveDraft}
          >
            {isPending ? "Saving…" : "Save Draft"}
          </Button>
          <Button type="button" disabled={isPending} onClick={handlePublish}>
            {isPending ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="layout-stack-md">
          <div className="observed-card p-4">
            <p className="type-caption mb-3 font-medium text-ink">Locale</p>
            <div className="flex flex-wrap gap-2">
              {CMS_LOCALES.map((entry) => (
                <Link
                  key={entry}
                  href={`/admin/content/${initialContent.slug}?locale=${entry}`}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm no-underline transition-colors",
                    locale === entry
                      ? "bg-accent/10 text-accent"
                      : "text-ink-subtle hover:bg-surface hover:text-ink",
                  )}
                >
                  {CMS_LOCALE_LABELS[entry]}
                </Link>
              ))}
            </div>
          </div>

          <div className="observed-card p-4">
            <p className="type-caption mb-3 font-medium text-ink">Sections</p>
            <div className="layout-stack-xs">
              {pageDefinition?.sections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSectionKey(section.key)}
                  className={cn(
                    "rounded-md px-3 py-2 text-left text-sm transition-colors",
                    activeSectionKey === section.key
                      ? "bg-accent/10 font-medium text-accent"
                      : "text-ink-subtle hover:bg-surface hover:text-ink",
                  )}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>

          <div className="observed-card p-4">
            <p className="type-caption text-ink-subtle">
              {savedAt ? `Last saved ${new Date(savedAt).toLocaleString()}` : "Not saved yet"}
            </p>
            {publishedAt ? (
              <p className="type-caption mt-2 text-ink-subtle">
                Last published {new Date(publishedAt).toLocaleString()}
              </p>
            ) : null}
            <p className="type-caption mt-3 text-ink-faint">
              Preview route can render draft content for admins in a future step.
            </p>
          </div>
        </aside>

        <div className="layout-stack-lg min-w-0">
          {error ? (
            <p className="type-body text-warm" role="alert">
              {error}
            </p>
          ) : null}

          {savedAt && !isDirty ? (
            <p className="type-caption text-accent">Draft saved successfully.</p>
          ) : null}

          {publishedAt && pageStatus === "PUBLISHED" ? (
            <p className="type-caption text-accent">Content published successfully.</p>
          ) : null}

          {pageDefinition?.sections.map((section) => {
            const isActive = activeSectionKey === section.key;

            return (
              <section
                key={section.key}
                id={`cms-section-${section.key}`}
                aria-labelledby={`cms-section-${section.key}-heading`}
                hidden={!isActive}
                className="layout-stack-lg"
              >
                <h2 id={`cms-section-${section.key}-heading`} className="sr-only">
                  {section.title}
                </h2>
                {section.fields.map((field) => (
                  <CmsRichTextEditor
                    key={`${locale}-${field.key}`}
                    ref={(instance) => {
                      editorRefs.current[field.key] = instance;
                    }}
                    id={`${initialContent.slug}-${field.key}`}
                    label={field.label}
                    placeholder={field.placeholder}
                    value={fields[field.key] ?? createEmptyTiptapDocument()}
                    syncVersion={editorSyncVersion}
                    onChange={(value) => updateField(field.key, value)}
                  />
                ))}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
