"use client";

import { useRef, useState, type MutableRefObject } from "react";
import type { JSONContent } from "@tiptap/react";
import {
  CmsRichTextEditor,
  type CmsRichTextEditorHandle,
} from "@/components/admin/cms/CmsRichTextEditor";
import { Button } from "@/components/ui/Button";
import { uploadCmsImage } from "@/lib/cms/cms-image-upload";
import type { CmsFieldDefinition } from "@/lib/cms/definitions";
import { tiptapImageDocument } from "@/lib/cms/import/tiptap-builders";
import { createEmptyTiptapDocument, getCmsImageSrcFromDocument } from "@/lib/cms/tiptap";
import type { CmsTiptapJson } from "@/lib/cms/types";

const ITEM_COUNT = 6;

type CmsAlignmentSectionEditorProps = {
  pageSlug: string;
  locale: string;
  fields: Record<string, CmsTiptapJson>;
  sectionFields: readonly CmsFieldDefinition[];
  editorRefs: MutableRefObject<Record<string, CmsRichTextEditorHandle | null>>;
  syncVersion: number;
  onFieldChange: (fieldKey: string, value: JSONContent) => void;
};

function fieldByKey(fields: readonly CmsFieldDefinition[], key: string) {
  return fields.find((field) => field.key === key);
}

export function CmsAlignmentSectionEditor({
  pageSlug,
  locale,
  fields,
  sectionFields,
  editorRefs,
  syncVersion,
  onFieldChange,
}: CmsAlignmentSectionEditorProps) {
  return (
    <div className="layout-stack-lg">
      {Array.from({ length: ITEM_COUNT }, (_, index) => {
        const number = String(index + 1).padStart(2, "0");
        const imageField = fieldByKey(sectionFields, `alignment.${index}.image`);
        const titleField = fieldByKey(sectionFields, `alignment.${index}.title`);
        const bodyField = fieldByKey(sectionFields, `alignment.${index}.body`);

        if (!imageField || !titleField || !bodyField) return null;

        return (
          <CmsAlignmentItemEditor
            key={`${locale}-${index}`}
            pageSlug={pageSlug}
            locale={locale}
            number={number}
            imageField={imageField}
            titleField={titleField}
            bodyField={bodyField}
            fields={fields}
            editorRefs={editorRefs}
            syncVersion={syncVersion}
            onFieldChange={onFieldChange}
          />
        );
      })}
    </div>
  );
}

function CmsAlignmentItemEditor({
  pageSlug,
  locale,
  number,
  imageField,
  titleField,
  bodyField,
  fields,
  editorRefs,
  syncVersion,
  onFieldChange,
}: {
  pageSlug: string;
  locale: string;
  number: string;
  imageField: CmsFieldDefinition;
  titleField: CmsFieldDefinition;
  bodyField: CmsFieldDefinition;
  fields: Record<string, CmsTiptapJson>;
  editorRefs: MutableRefObject<Record<string, CmsRichTextEditorHandle | null>>;
  syncVersion: number;
  onFieldChange: (fieldKey: string, value: JSONContent) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageSrc = getCmsImageSrcFromDocument(fields[imageField.key]);

  async function handleImageSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploaded = await uploadCmsImage(file);
      onFieldChange(imageField.key, tiptapImageDocument(uploaded.url));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <article className="layout-stack-md">
      <h3 className="type-caption font-medium text-ink">Item {number}</h3>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <div className="layout-stack-sm">
          <p className="type-caption text-ink">{imageField.label}</p>
          <div className="overflow-hidden rounded-2xl bg-[#ddd6c8]">
            {imageSrc ? (
              <img src={imageSrc} alt="" className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center px-4 text-center type-caption text-ink-subtle">
                No image yet
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Uploading…" : imageSrc ? "Change image" : "Upload image"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleImageSelected}
          />
          {uploadError ? (
            <p className="type-caption text-warm" role="alert">
              {uploadError}
            </p>
          ) : null}
        </div>

        <div className="layout-stack-md min-w-0">
          <CmsRichTextEditor
            key={`${locale}-${titleField.key}`}
            ref={(instance) => {
              editorRefs.current[titleField.key] = instance;
            }}
            id={`${pageSlug}-${titleField.key}`}
            label={titleField.label}
            placeholder={titleField.placeholder}
            value={fields[titleField.key] ?? createEmptyTiptapDocument()}
            syncVersion={syncVersion}
            onChange={(value) => onFieldChange(titleField.key, value)}
          />
          <CmsRichTextEditor
            key={`${locale}-${bodyField.key}`}
            ref={(instance) => {
              editorRefs.current[bodyField.key] = instance;
            }}
            id={`${pageSlug}-${bodyField.key}`}
            label={bodyField.label}
            placeholder={bodyField.placeholder}
            value={fields[bodyField.key] ?? createEmptyTiptapDocument()}
            syncVersion={syncVersion}
            onChange={(value) => onFieldChange(bodyField.key, value)}
          />
        </div>
      </div>
    </article>
  );
}
