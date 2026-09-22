"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { JSONContent } from "@tiptap/react";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import {
  createEmptyTiptapDocument,
  getCmsEditorExtensions,
  normalizeCmsTiptapJson,
} from "@/lib/cms/tiptap";
import type { CmsTiptapJson } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

export type CmsRichTextEditorHandle = {
  getDocument: () => CmsTiptapJson;
};

type CmsRichTextEditorProps = {
  id: string;
  label: string;
  value: CmsTiptapJson | null;
  placeholder?: string;
  onChange: (value: JSONContent) => void;
};

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({ label, active, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors",
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border-subtle bg-surface text-ink-subtle hover:border-accent hover:text-accent",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {label}
    </button>
  );
}

function serializeTiptapDocument(value: CmsTiptapJson): string {
  return JSON.stringify(value);
}

export const CmsRichTextEditor = forwardRef<CmsRichTextEditorHandle, CmsRichTextEditorProps>(
  function CmsRichTextEditor({ id, label, value, placeholder, onChange }, ref) {
    const loadedValueRef = useRef<string>("");
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const extensions = useMemo(() => getCmsEditorExtensions(placeholder), [placeholder]);
    const resolvedValue = useMemo(
      () => normalizeCmsTiptapJson(value) ?? createEmptyTiptapDocument(),
      [value],
    );

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
              "cms-editor-content min-h-40 w-full px-4 py-4 focus:outline-none type-body text-ink [&_h1]:type-heading-sm [&_h2]:type-heading-sm [&_h3]:font-medium [&_blockquote]:border-l-2 [&_blockquote]:border-border-subtle [&_blockquote]:pl-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-accent [&_a]:underline",
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

          return normalizeCmsTiptapJson(value) ?? createEmptyTiptapDocument();
        },
      }),
      [editor, value],
    );

    useEffect(() => {
      if (!editor) return;

      const nextSerialized = serializeTiptapDocument(resolvedValue);
      if (loadedValueRef.current === nextSerialized) return;

      editor.commands.setContent(resolvedValue, { emitUpdate: false });
      loadedValueRef.current = nextSerialized;
    }, [editor, resolvedValue]);

    if (!editor) {
      return (
        <div className="observed-card p-4">
          <p className="type-caption text-ink-subtle">Loading editor…</p>
        </div>
      );
    }

    function setLink() {
      if (!editor) return;
      const previous = editor.getAttributes("link").href as string | undefined;
      const url = window.prompt("Enter URL", previous ?? "https://");
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }

    return (
      <div className="layout-stack-sm">
        <label htmlFor={id} className="type-caption text-ink">
          {label}
        </label>

        <div className="observed-card overflow-hidden">
          <div className="sticky top-0 z-10 flex flex-wrap gap-2 border-b border-border-subtle bg-surface/95 p-3 backdrop-blur">
            <ToolbarButton
              label="P"
              active={editor.isActive("paragraph")}
              onClick={() => editor.chain().focus().setParagraph().run()}
            />
            <ToolbarButton
              label="H1"
              active={editor.isActive("heading", { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            />
            <ToolbarButton
              label="H2"
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            />
            <ToolbarButton
              label="H3"
              active={editor.isActive("heading", { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            />
            <ToolbarButton
              label="B"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
              label="I"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
              label="S"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            />
            <ToolbarButton
              label="• List"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <ToolbarButton
              label="1. List"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <ToolbarButton
              label="Quote"
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
            <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink} />
            <ToolbarButton
              label="Left"
              active={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            />
            <ToolbarButton
              label="Center"
              active={editor.isActive({ textAlign: "center" })}
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
            />
            <ToolbarButton
              label="Right"
              active={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            />
            <ToolbarButton
              label="Rule"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            />
            <ToolbarButton
              label="Clear"
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            />
            <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} />
            <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} />
          </div>

          {editor && (
            <BubbleMenu
              editor={editor}
              className="flex flex-wrap gap-1 rounded-md border border-border-subtle bg-surface p-1 shadow-sm"
            >
              <ToolbarButton
                label="Bold"
                active={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
              />
              <ToolbarButton
                label="Italic"
                active={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              />
              <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink} />
            </BubbleMenu>
          )}

          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
);
