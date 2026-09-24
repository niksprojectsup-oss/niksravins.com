"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { JSONContent } from "@tiptap/react";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { CmsEditorToolbar } from "@/components/admin/cms/editor/CmsEditorToolbar";
import {
  shouldApplyExternalEditorContent,
  serializeTiptapDocument,
} from "@/lib/cms/editor-sync";
import {
  createEmptyTiptapDocument,
  getCmsEditorExtensions,
  normalizeCmsTiptapJson,
} from "@/lib/cms/tiptap";
import type { CmsTiptapJson } from "@/lib/cms/types";
import "@/styles/cms-editor.css";

export type CmsRichTextEditorHandle = {
  getDocument: () => CmsTiptapJson;
};

type CmsRichTextEditorProps = {
  id: string;
  label: string;
  value: CmsTiptapJson | null;
  syncVersion: number;
  placeholder?: string;
  onChange: (value: JSONContent) => void;
};

export const CmsRichTextEditor = forwardRef<CmsRichTextEditorHandle, CmsRichTextEditorProps>(
  function CmsRichTextEditor({ id, label, value, syncVersion, placeholder, onChange }, ref) {
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const lastAppliedSyncVersionRef = useRef(-1);
    const externalContentRef = useRef<CmsTiptapJson>(createEmptyTiptapDocument());

    const extensions = useMemo(() => getCmsEditorExtensions(placeholder), [placeholder]);
    const resolvedValue = useMemo(
      () => normalizeCmsTiptapJson(value) ?? createEmptyTiptapDocument(),
      [value],
    );

    externalContentRef.current = resolvedValue;

    const editor = useEditor(
      {
        extensions,
        content: createEmptyTiptapDocument(),
        immediatelyRender: false,
        editorProps: {
          attributes: {
            id,
            "aria-label": label,
            class:
              "cms-editor-content focus:outline-none type-body text-ink [&_blockquote]:border-l-2 [&_blockquote]:border-border-subtle [&_blockquote]:pl-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-accent [&_a]:underline",
          },
        },
        onUpdate: ({ editor: currentEditor }) => {
          onChangeRef.current(currentEditor.getJSON());
        },
      },
      [placeholder],
    );

    useImperativeHandle(
      ref,
      () => ({
        getDocument: () => {
          if (editor) {
            return editor.getJSON() as CmsTiptapJson;
          }

          return externalContentRef.current;
        },
      }),
      [editor],
    );

    useEffect(() => {
      if (!editor) return;

      if (
        !shouldApplyExternalEditorContent({
          syncVersion,
          lastAppliedSyncVersion: lastAppliedSyncVersionRef.current,
        })
      ) {
        return;
      }

      const nextContent = externalContentRef.current;
      editor.commands.setContent(nextContent, { emitUpdate: false });
      lastAppliedSyncVersionRef.current = syncVersion;
      serializeTiptapDocument(nextContent);
    }, [editor, syncVersion]);

    if (!editor) {
      return (
        <div className="observed-card p-4">
          <p className="type-caption text-ink-subtle">Loading editor…</p>
        </div>
      );
    }

    return (
      <div className="cms-rich-text-editor layout-stack-sm">
        <label htmlFor={id} className="type-caption text-ink">
          {label}
        </label>

        <div className="observed-card cms-editor-surface">
          <CmsEditorToolbar editor={editor} />
          <EditorContent editor={editor} />
        </div>

        <BubbleMenu
          editor={editor}
          appendTo={() => document.body}
          shouldShow={({ editor: currentEditor, state }) => {
            const { from, to, empty } = state.selection;
            if (empty || from === to) return false;
            if (currentEditor.isActive("image")) return false;
            return true;
          }}
          options={{
            placement: "top",
            offset: 8,
            flip: true,
            shift: { padding: 8 },
          }}
          className="cms-editor-bubble-menu p-1"
        >
          <CmsEditorToolbar editor={editor} compact variant="bubble" />
        </BubbleMenu>
      </div>
    );
  },
);
