"use client";

import type { Editor } from "@tiptap/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { uploadCmsImage } from "@/lib/cms/cms-image-upload";
import { cn } from "@/lib/utils";
import {
  CMS_FONT_FAMILIES,
  CMS_FONT_SIZE_MAX,
  CMS_FONT_SIZE_MIN,
  CMS_FONT_SIZE_PRESETS,
  CMS_LINE_HEIGHTS,
  CMS_PARAGRAPH_SPACINGS,
  CMS_TEXT_COLORS,
  normalizeCustomFontSizeInput,
  parseFontSizeValue,
} from "./toolbar-constants";

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
};

function preventToolbarFocusLoss(event: React.MouseEvent) {
  event.preventDefault();
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
  className,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onMouseDown={preventToolbarFocusLoss}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors",
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-border-subtle bg-surface text-ink-subtle hover:border-accent hover:text-accent",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {children ?? label}
    </button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-border-subtle" />;
}

type DropdownProps = {
  label: string;
  buttonLabel: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  fixedPosition?: boolean;
};

function ToolbarDropdown({
  label,
  buttonLabel,
  children,
  className,
  fixedPosition = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 144 });

  useEffect(() => {
    if (!open || !fixedPosition || !rootRef.current) return;

    function updatePosition() {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 144),
      });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, fixedPosition]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const panel = open ? (
    <div
      ref={panelRef}
      id={listId}
      role="listbox"
      aria-label={label}
      style={
        fixedPosition
          ? {
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }
          : undefined
      }
      className={cn(
        "max-h-64 min-w-[9rem] overflow-y-auto rounded-md border border-border-subtle bg-surface p-1 shadow-lg",
        fixedPosition ? "" : "absolute left-0 top-[calc(100%+0.25rem)] z-30",
      )}
    >
      {children}
    </div>
  ) : null;

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        title={label}
        onMouseDown={preventToolbarFocusLoss}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-8 min-w-[5.5rem] items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface px-2 text-xs text-ink-subtle transition-colors hover:border-accent hover:text-accent"
      >
        {buttonLabel}
        <span aria-hidden className="text-[10px]">
          ▾
        </span>
      </button>
      {panel
        ? fixedPosition && typeof document !== "undefined"
          ? createPortal(panel, document.body)
          : panel
        : null}
    </div>
  );
}

function DropdownItem({
  label,
  active,
  onSelect,
  style,
}: {
  label: React.ReactNode;
  active?: boolean;
  onSelect: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onMouseDown={preventToolbarFocusLoss}
      onClick={onSelect}
      style={style}
      className={cn(
        "flex w-full items-center rounded px-2 py-1.5 text-left text-xs transition-colors",
        active ? "bg-accent/10 text-accent" : "text-ink-subtle hover:bg-surface-muted hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

type CmsEditorToolbarProps = {
  editor: Editor;
  compact?: boolean;
  variant?: "toolbar" | "bubble";
};

export function CmsEditorToolbar({
  editor,
  compact = false,
  variant = "toolbar",
}: CmsEditorToolbarProps) {
  const useFixedDropdowns = variant === "bubble";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customSizeOpen, setCustomSizeOpen] = useState(false);
  const [customSizeValue, setCustomSizeValue] = useState("");
  const [uploading, setUploading] = useState(false);

  const currentFontFamily =
    (editor.getAttributes("textStyle").fontFamily as string | undefined) ??
    CMS_FONT_FAMILIES[0].value;
  const currentFontSize =
    (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";
  const currentColor = (editor.getAttributes("textStyle").color as string | undefined) ?? "#111111";
  const currentLineHeight =
    (editor.getAttributes("textStyle").lineHeight as string | undefined) ?? "";
  const currentParagraphSpacing =
    (editor.getAttributes("paragraph").paragraphSpacing as string | undefined) ?? "normal";

  const currentFontLabel =
    CMS_FONT_FAMILIES.find((entry) => entry.value === currentFontFamily)?.label ?? "Inter";

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  async function handleImageSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadCmsImage(file);
      const alt = window.prompt("Alt text (optional)", "") ?? "";
      const title = window.prompt("Title (optional)", "") ?? undefined;
      editor
        .chain()
        .focus()
        .setImage({
          src: uploaded.url,
          alt: alt.trim(),
          title: title?.trim() || undefined,
        })
        .run();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function applyCustomFontSize() {
    const normalized = normalizeCustomFontSizeInput(customSizeValue);
    if (!normalized) return;
    editor.chain().focus().setFontSize(normalized).run();
    setCustomSizeOpen(false);
    setCustomSizeValue("");
  }

  return (
    <div
      className={cn(
        "cms-editor-toolbar flex items-center gap-1",
        variant === "toolbar" &&
          "sticky top-0 z-10 overflow-x-auto border-b border-border-subtle bg-surface/95 p-2 backdrop-blur",
        variant === "bubble" && "cms-editor-bubble-toolbar",
        compact && variant === "toolbar" && "p-1",
      )}
    >
      <ToolbarDropdown
        label="Font family"
        fixedPosition={useFixedDropdowns}
        buttonLabel={<span style={{ fontFamily: currentFontFamily }}>{currentFontLabel}</span>}
      >
        {CMS_FONT_FAMILIES.map((entry) => (
          <DropdownItem
            key={entry.value}
            label={entry.label}
            active={currentFontFamily === entry.value}
            style={{ fontFamily: entry.value }}
            onSelect={() => {
              editor.chain().focus().setFontFamily(entry.value).run();
            }}
          />
        ))}
      </ToolbarDropdown>

      <ToolbarDropdown
        label="Font size"
        className="min-w-[4.5rem]"
        fixedPosition={useFixedDropdowns}
        buttonLabel={currentFontSize ? parseFontSizeValue(currentFontSize) : "Size"}
      >
        {CMS_FONT_SIZE_PRESETS.map((size) => (
          <DropdownItem
            key={size}
            label={String(size)}
            active={parseFontSizeValue(currentFontSize) === String(size)}
            onSelect={() => editor.chain().focus().setFontSize(`${size}px`).run()}
          />
        ))}
        <div className="mt-1 border-t border-border-subtle pt-1">
          {!customSizeOpen ? (
            <DropdownItem label="Custom size…" onSelect={() => setCustomSizeOpen(true)} />
          ) : (
            <div className="px-1 py-1">
              <label className="type-caption mb-1 block text-ink-faint">
                Custom ({CMS_FONT_SIZE_MIN}–{CMS_FONT_SIZE_MAX})
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={customSizeValue}
                onChange={(event) => setCustomSizeValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyCustomFontSize();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setCustomSizeOpen(false);
                    setCustomSizeValue("");
                  }
                }}
                className="w-full rounded border border-border-subtle bg-surface px-2 py-1 text-xs"
                placeholder="17"
                autoFocus
              />
              <div className="mt-1 flex gap-1">
                <button
                  type="button"
                  className="rounded border border-border-subtle px-2 py-0.5 text-[10px]"
                  onClick={() => {
                    setCustomSizeOpen(false);
                    setCustomSizeValue("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded border border-accent bg-accent/10 px-2 py-0.5 text-[10px] text-accent"
                  onClick={applyCustomFontSize}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </ToolbarDropdown>

      {!compact ? (
        <>
          <ToolbarDivider />
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <span className="underline">U</span>
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarDropdown
            label="Text color"
            fixedPosition={useFixedDropdowns}
            buttonLabel={
              <span className="inline-flex items-center gap-1">
                <span className="font-semibold" style={{ color: currentColor }}>
                  A
                </span>
              </span>
            }
          >
            {CMS_TEXT_COLORS.map((entry) => (
              <DropdownItem
                key={entry.value}
                label={
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-block h-3 w-3 rounded-full border border-border-subtle"
                      style={{ backgroundColor: entry.value }}
                    />
                    {entry.label}
                  </span>
                }
                active={currentColor.toLowerCase() === entry.value.toLowerCase()}
                onSelect={() => editor.chain().focus().setColor(entry.value).run()}
              />
            ))}
            <div className="mt-1 border-t border-border-subtle px-2 py-2">
              <label className="type-caption mb-1 block text-ink-faint">Custom color</label>
              <input
                type="color"
                value={currentColor.startsWith("#") ? currentColor : "#111111"}
                onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
                className="h-8 w-full cursor-pointer rounded border border-border-subtle bg-surface"
              />
            </div>
          </ToolbarDropdown>
          <ToolbarButton
            label="Link"
            active={editor.isActive("link")}
            onClick={setLink}
          />
          <ToolbarDivider />
          <ToolbarDropdown label="Alignment" buttonLabel="Align">
            <DropdownItem
              label="Align left"
              active={editor.isActive({ textAlign: "left" })}
              onSelect={() => editor.chain().focus().setTextAlign("left").run()}
            />
            <DropdownItem
              label="Align center"
              active={editor.isActive({ textAlign: "center" })}
              onSelect={() => editor.chain().focus().setTextAlign("center").run()}
            />
            <DropdownItem
              label="Align right"
              active={editor.isActive({ textAlign: "right" })}
              onSelect={() => editor.chain().focus().setTextAlign("right").run()}
            />
          </ToolbarDropdown>
          <ToolbarDropdown label="Lists" buttonLabel="List">
            <DropdownItem
              label="Bullet list"
              active={editor.isActive("bulletList")}
              onSelect={() => editor.chain().focus().toggleBulletList().run()}
            />
            <DropdownItem
              label="Numbered list"
              active={editor.isActive("orderedList")}
              onSelect={() => editor.chain().focus().toggleOrderedList().run()}
            />
          </ToolbarDropdown>
          <ToolbarButton
            label="Block quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          {!compact ? (
            <>
              <ToolbarDivider />
              <ToolbarDropdown label="Line height" buttonLabel="Line">
                {CMS_LINE_HEIGHTS.map((entry) => (
                  <DropdownItem
                    key={entry.value}
                    label={entry.label}
                    active={currentLineHeight === entry.value}
                    onSelect={() => editor.chain().focus().setLineHeight(entry.value).run()}
                  />
                ))}
              </ToolbarDropdown>
              <ToolbarDropdown label="Paragraph spacing" buttonLabel="Spacing">
                {CMS_PARAGRAPH_SPACINGS.map((entry) => (
                  <DropdownItem
                    key={entry.value}
                    label={entry.label}
                    active={currentParagraphSpacing === entry.value}
                    onSelect={() =>
                      editor.chain().focus().setParagraphSpacing(entry.value).run()
                    }
                  />
                ))}
              </ToolbarDropdown>
            </>
          ) : null}
          <ToolbarDivider />
          <ToolbarButton
            label="Insert image"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "…" : "Image"}
          </ToolbarButton>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleImageSelected}
          />
          <ToolbarDivider />
          <ToolbarButton
            label="Undo"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          />
          <ToolbarButton
            label="Redo"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          />
        </>
      ) : (
        <>
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <span className="underline">U</span>
          </ToolbarButton>
          <ToolbarDropdown
            label="Text color"
            fixedPosition={useFixedDropdowns}
            buttonLabel={
              <span className="font-semibold" style={{ color: currentColor }}>
                A
              </span>
            }
          >
            {CMS_TEXT_COLORS.map((entry) => (
              <DropdownItem
                key={entry.value}
                label={entry.label}
                active={currentColor.toLowerCase() === entry.value.toLowerCase()}
                onSelect={() => editor.chain().focus().setColor(entry.value).run()}
              />
            ))}
          </ToolbarDropdown>
          <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink} />
        </>
      )}
    </div>
  );
}
