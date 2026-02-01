"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Quote,
  Code,
  Undo,
  Redo,
  Table as TableIcon,
  Columns2,
  RowsIcon,
  Trash2,
  Type,
  Minus,
  ChevronDown,
  Scissors,
  Copy,
  ClipboardPaste,
  RemoveFormatting,
  MousePointer,
  Pencil,
  Eraser,
  Circle,
  Square,
  PenTool,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import { InkOverlay } from "./InkOverlay";
import type { InkTool, InkOverlayRef, InkStroke } from "./InkOverlay";

export interface RichTextEditorRef {
  getHTML: () => string;
  setContent: (content: string) => void;
  insertDrawing: (dataUrl: string) => void;
}

interface ToolbarButtonProps {
  icon: React.ElementType;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
}

function ToolbarButton({ icon: Icon, onClick, active = false, disabled = false, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        active && "bg-muted text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-border mx-1" />;
}

// Dropdown component for color pickers and table menu
function ToolbarDropdown({
  trigger,
  children,
  align = "left",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-1 p-2 bg-popover border border-border rounded-lg shadow-lg z-50",
            align === "left" ? "left-0" : "right-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const TEXT_COLORS = [
  "#000000",
  "#374151",
  "#DC2626",
  "#D97706",
  "#059669",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#FFFFFF",
  "#9CA3AF",
  "#FCA5A5",
  "#FCD34D",
  "#6EE7B7",
  "#93C5FD",
  "#C4B5FD",
  "#F9A8D4",
];

const HIGHLIGHT_COLORS = ["#fef08a", "#fed7aa", "#bbf7d0", "#a5f3fc", "#c7d2fe", "#fecaca", "#fae8ff", "#e5e7eb"];

// Table grid size selector component like OneNote/Google Slides - expands dynamically
function TableGridSelector({ onSelect }: { onSelect: (rows: number, cols: number) => void }) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [gridSize, setGridSize] = useState({ rows: 5, cols: 5 });
  const minSize = 5;
  const maxSize = 10;

  // Expand grid when hovering near the edge
  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({ row, col });

    // Expand rows if at the bottom edge
    if (row >= gridSize.rows && gridSize.rows < maxSize) {
      setGridSize((prev) => ({ ...prev, rows: Math.min(prev.rows + 1, maxSize) }));
    }
    // Expand cols if at the right edge
    if (col >= gridSize.cols && gridSize.cols < maxSize) {
      setGridSize((prev) => ({ ...prev, cols: Math.min(prev.cols + 1, maxSize) }));
    }
  };

  // Reset grid size when mouse leaves the entire grid
  const handleGridLeave = () => {
    setHoveredCell(null);
    // Shrink back to minimum but not smaller than hovered selection
    setGridSize({ rows: minSize, cols: minSize });
  };

  return (
    <div className="p-2">
      <div className="text-xs text-muted-foreground mb-2 text-center">
        {hoveredCell ? `${hoveredCell.row} × ${hoveredCell.col}` : "Select size"}
      </div>
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)` }}
        onMouseLeave={handleGridLeave}
      >
        {Array.from({ length: gridSize.rows * gridSize.cols }).map((_, index) => {
          const row = Math.floor(index / gridSize.cols) + 1;
          const col = (index % gridSize.cols) + 1;
          const isHighlighted = hoveredCell && row <= hoveredCell.row && col <= hoveredCell.col;

          return (
            <button
              key={`${row}-${col}`}
              type="button"
              className={cn(
                "w-5 h-5 border border-border rounded-sm transition-colors",
                isHighlighted ? "bg-primary/50 border-primary" : "bg-muted/30 hover:bg-muted"
              )}
              onMouseEnter={() => handleCellHover(row, col)}
              onClick={() => onSelect(row, col)}
            />
          );
        })}
      </div>
      <div className="text-xs text-muted-foreground mt-1 text-center opacity-60">
        Hover edge to expand (max {maxSize}×{maxSize})
      </div>
    </div>
  );
}

// Drawing toolbar constants
const INK_COLORS = ["#000000", "#DC2626", "#D97706", "#059669", "#2563EB", "#7C3AED", "#DB2777", "#FFFFFF"];
const INK_BRUSH_SIZES = [2, 4, 8, 12];

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  // Drawing props
  drawingMode?: boolean;
  onDrawingModeChange?: (enabled: boolean) => void;
  inkTool?: InkTool;
  onInkToolChange?: (tool: InkTool) => void;
  inkColor?: string;
  onInkColorChange?: (color: string) => void;
  inkBrushSize?: number;
  onInkBrushSizeChange?: (size: number) => void;
  inkStrokes?: InkStroke[];
  onInkStrokesChange?: (strokes: InkStroke[]) => void;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(function RichTextEditor(
  {
    content = "",
    onChange,
    placeholder = "Start writing...",
    drawingMode = false,
    onDrawingModeChange,
    inkTool = "pen",
    onInkToolChange,
    inkColor = "#DC2626",
    onInkColorChange,
    inkBrushSize = 4,
    onInkBrushSizeChange,
    inkStrokes = [],
    onInkStrokesChange,
  },
  ref
) {
  const inkRef = useRef<InkOverlayRef>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-invert max-w-none min-h-[200px] outline-none p-4",
          "[&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4",
          "[&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mb-3",
          "[&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-2",
          "[&>p]:mb-2",
          "[&>ul]:list-disc [&>ul]:ml-6",
          "[&>ol]:list-decimal [&>ol]:ml-6",
          "[&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground",
          "[&>pre]:bg-muted [&>pre]:p-4 [&>pre]:rounded-lg",
          "[&_.ProseMirror-placeholder]:text-muted-foreground/50",
          // Table styles
          "[&_table]:border-collapse [&_table]:w-full [&_table]:my-4",
          "[&_td]:border [&_td]:border-border [&_td]:p-2",
          "[&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted [&_th]:font-semibold",
          "[&_.selectedCell]:bg-primary/20"
        ),
      },
      handleKeyDown: (view, event) => {
        // Handle Tab key to insert tab character instead of changing focus
        if (event.key === "Tab") {
          event.preventDefault();
          if (event.shiftKey) {
            // Shift+Tab - could handle dedent here if needed
            return true;
          }
          // Insert 4 spaces as tab
          editor?.commands.insertContent("    ");
          return true;
        }
        return false;
      },
    },
  });

  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() ?? "",
    setContent: (newContent: string) => {
      editor?.commands.setContent(newContent);
    },
    insertDrawing: (dataUrl: string) => {
      editor?.commands.setImage({ src: dataUrl });
    },
  }));

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setTextColor = useCallback(
    (color: string) => {
      editor?.chain().focus().setColor(color).run();
    },
    [editor]
  );

  const setHighlightColor = useCallback(
    (color: string) => {
      editor?.chain().focus().toggleHighlight({ color }).run();
    },
    [editor]
  );

  if (!editor) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-0">
      {/* Main Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30 flex-wrap">
        {/* Undo/Redo - works for both text and drawing */}
        <ToolbarButton
          icon={Undo}
          onClick={() => {
            if (drawingMode) {
              inkRef.current?.undo();
            } else {
              editor.chain().focus().undo().run();
            }
          }}
          disabled={!drawingMode && !editor.can().undo()}
          title={drawingMode ? "Undo Drawing (Ctrl+Z)" : "Undo (Ctrl+Z)"}
        />
        <ToolbarButton
          icon={Redo}
          onClick={() => {
            if (drawingMode) {
              inkRef.current?.redo();
            } else {
              editor.chain().focus().redo().run();
            }
          }}
          disabled={!drawingMode && !editor.can().redo()}
          title={drawingMode ? "Redo Drawing (Ctrl+Shift+Z)" : "Redo (Ctrl+Y)"}
        />

        <ToolbarDivider />

        {/* Text Format */}
        <ToolbarButton
          icon={Bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          icon={Italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          icon={UnderlineIcon}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
        />
        <ToolbarButton
          icon={Strikethrough}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        />

        <ToolbarDivider />

        {/* Text Color */}
        <ToolbarDropdown
          trigger={
            <button
              type="button"
              className="p-2 rounded hover:bg-muted transition-colors flex items-center gap-1"
              title="Text Color"
            >
              <Type className="h-4 w-4" />
              <div
                className="w-4 h-1 rounded"
                style={{ backgroundColor: editor.getAttributes("textStyle").color || "#ffffff" }}
              />
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
          }
        >
          <div className="grid grid-cols-8 gap-1 min-w-44">
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setTextColor(color)}
                className="w-5 h-5 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </ToolbarDropdown>

        {/* Highlight */}
        <ToolbarDropdown
          trigger={
            <button
              type="button"
              className={cn(
                "p-2 rounded hover:bg-muted transition-colors flex items-center gap-1",
                editor.isActive("highlight") && "bg-muted text-primary"
              )}
              title="Highlight"
            >
              <Highlighter className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
          }
        >
          <div className="grid grid-cols-4 gap-2 p-1" style={{ minWidth: "140px" }}>
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setHighlightColor(color)}
                className="w-7 h-7 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </ToolbarDropdown>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          icon={Heading1}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        />
        <ToolbarButton
          icon={Heading2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        />
        <ToolbarButton
          icon={Heading3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        />

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          icon={List}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        />
        <ToolbarButton
          icon={ListOrdered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        />

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton
          icon={AlignLeft}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        />
        <ToolbarButton
          icon={AlignCenter}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        />
        <ToolbarButton
          icon={AlignRight}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        />
        <ToolbarButton
          icon={AlignJustify}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Justify"
        />

        <ToolbarDivider />

        {/* Block Elements */}
        <ToolbarButton
          icon={Quote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        />
        <ToolbarButton
          icon={Code}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code Block"
        />

        <ToolbarDivider />

        {/* Table */}
        <ToolbarDropdown
          trigger={
            <button
              type="button"
              className={cn(
                "p-2 rounded hover:bg-muted transition-colors flex items-center gap-1",
                editor.isActive("table") && "bg-muted text-primary"
              )}
              title="Table"
            >
              <TableIcon className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
          }
        >
          {editor.isActive("table") ? (
            <div className="flex flex-col gap-1 min-w-40">
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded text-sm"
              >
                <Columns2 className="h-4 w-4" /> Add Column
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded text-sm"
              >
                <RowsIcon className="h-4 w-4" /> Add Row
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded text-sm text-red-500"
              >
                <Minus className="h-4 w-4" /> Remove Column
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded text-sm text-red-500"
              >
                <Minus className="h-4 w-4" /> Remove Row
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="flex items-center gap-2 p-2 hover:bg-muted rounded text-sm text-red-500"
              >
                <Trash2 className="h-4 w-4" /> Delete Table
              </button>
            </div>
          ) : (
            <TableGridSelector
              onSelect={(rows, cols) => {
                editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
              }}
            />
          )}
        </ToolbarDropdown>

        {/* Drawing Mode Toggle */}
        <ToolbarDivider />

        <button
          type="button"
          onClick={() => onDrawingModeChange?.(!drawingMode)}
          className={cn(
            "p-2 rounded hover:bg-muted transition-colors flex items-center gap-1",
            drawingMode && "bg-primary text-primary-foreground"
          )}
          title={drawingMode ? "Exit Drawing Mode (Esc)" : "Enter Drawing Mode (Ctrl+D)"}
        >
          <PenTool className="h-4 w-4" />
        </button>

        {/* Drawing tools - only visible when in drawing mode */}
        {drawingMode && (
          <>
            <ToolbarDivider />

            {/* Return to text mode */}
            <ToolbarButton
              icon={MousePointer}
              onClick={() => onDrawingModeChange?.(false)}
              title="Return to Text Mode"
            />

            {/* Drawing tools */}
            <ToolbarButton
              icon={Pencil}
              onClick={() => onInkToolChange?.("pen")}
              active={inkTool === "pen"}
              title="Pen"
            />
            <ToolbarButton
              icon={Highlighter}
              onClick={() => onInkToolChange?.("highlighter")}
              active={inkTool === "highlighter"}
              title="Highlighter"
            />
            <ToolbarButton
              icon={Eraser}
              onClick={() => onInkToolChange?.("eraser")}
              active={inkTool === "eraser"}
              title="Eraser"
            />

            <ToolbarDivider />

            {/* Shapes */}
            <ToolbarButton
              icon={Minus}
              onClick={() => onInkToolChange?.("line")}
              active={inkTool === "line"}
              title="Line"
            />
            <ToolbarButton
              icon={Square}
              onClick={() => onInkToolChange?.("rectangle")}
              active={inkTool === "rectangle"}
              title="Rectangle"
            />
            <ToolbarButton
              icon={Circle}
              onClick={() => onInkToolChange?.("circle")}
              active={inkTool === "circle"}
              title="Ellipse"
            />

            <ToolbarDivider />

            {/* Brush sizes */}
            <div className="flex items-center gap-0.5">
              {INK_BRUSH_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onInkBrushSizeChange?.(size)}
                  className={cn(
                    "w-7 h-7 rounded flex items-center justify-center transition-colors",
                    inkBrushSize === size ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  title={`${size}px`}
                >
                  <div
                    className="rounded-full bg-current"
                    style={{ width: Math.min(size, 12), height: Math.min(size, 12) }}
                  />
                </button>
              ))}
            </div>

            <ToolbarDivider />

            {/* Ink colors */}
            <div className="flex items-center gap-0.5">
              {INK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onInkColorChange?.(c)}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                    inkColor === c ? "border-primary scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>

            <ToolbarDivider />

            {/* Clear All Ink */}
            <button
              type="button"
              onClick={() => inkRef?.current?.clearAll()}
              className="p-2 rounded hover:bg-muted transition-colors text-destructive"
              title="Clear All Ink"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Editor Content with Context Menu and Ink Overlay */}
      <div className="flex-1 overflow-y-auto relative">
        <EditorContent editor={editor} className="h-full" />
        <EditorContextMenu editor={editor} />

        {/* Ink Overlay - draws on top of editor content, NOT over toolbar */}
        <InkOverlay
          ref={inkRef}
          enabled={drawingMode}
          tool={inkTool}
          color={inkColor}
          brushSize={inkBrushSize}
          strokes={inkStrokes}
          onStrokesChange={(newStrokes) => onInkStrokesChange?.(newStrokes)}
        />
      </div>
    </div>
  );
});

// Context Menu Component
function EditorContextMenu({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editorEl = editor?.view?.dom;
    if (!editorEl) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleClick = () => setContextMenu(null);
    const handleScroll = () => setContextMenu(null);

    editorEl.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);
    document.addEventListener("scroll", handleScroll, true);

    return () => {
      editorEl.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [editor]);

  // Adjust menu position to stay within viewport
  useEffect(() => {
    if (contextMenu && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = contextMenu.x;
      let y = contextMenu.y;

      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 8;
      }
      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 8;
      }

      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }
  }, [contextMenu]);

  const handleCut = async () => {
    const { from, to } = editor?.state.selection || {};
    if (from !== undefined && to !== undefined && from !== to) {
      const text = editor?.state.doc.textBetween(from, to) || "";
      await navigator.clipboard.writeText(text);
      editor?.commands.deleteSelection();
    }
    setContextMenu(null);
  };

  const handleCopy = async () => {
    const { from, to } = editor?.state.selection || {};
    if (from !== undefined && to !== undefined && from !== to) {
      const text = editor?.state.doc.textBetween(from, to) || "";
      await navigator.clipboard.writeText(text);
    }
    setContextMenu(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      editor?.commands.insertContent(text);
    } catch {
      // Clipboard access denied
    }
    setContextMenu(null);
  };

  const hasSelection = () => {
    const { from, to } = editor?.state.selection || {};
    return from !== undefined && to !== undefined && from !== to;
  };

  if (!contextMenu || !editor) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 bg-popover border border-border rounded-lg shadow-xl py-1"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Clipboard Actions */}
      <ContextMenuItem icon={Scissors} label="Cut" shortcut="Ctrl+X" onClick={handleCut} disabled={!hasSelection()} />
      <ContextMenuItem icon={Copy} label="Copy" shortcut="Ctrl+C" onClick={handleCopy} disabled={!hasSelection()} />
      <ContextMenuItem icon={ClipboardPaste} label="Paste" shortcut="Ctrl+V" onClick={handlePaste} />

      <ContextMenuDivider />

      {/* Text Formatting */}
      <ContextMenuItem
        icon={Bold}
        label="Bold"
        shortcut="Ctrl+B"
        onClick={() => {
          editor.chain().focus().toggleBold().run();
          setContextMenu(null);
        }}
        active={editor.isActive("bold")}
      />
      <ContextMenuItem
        icon={Italic}
        label="Italic"
        shortcut="Ctrl+I"
        onClick={() => {
          editor.chain().focus().toggleItalic().run();
          setContextMenu(null);
        }}
        active={editor.isActive("italic")}
      />
      <ContextMenuItem
        icon={UnderlineIcon}
        label="Underline"
        shortcut="Ctrl+U"
        onClick={() => {
          editor.chain().focus().toggleUnderline().run();
          setContextMenu(null);
        }}
        active={editor.isActive("underline")}
      />
      <ContextMenuItem
        icon={Strikethrough}
        label="Strikethrough"
        onClick={() => {
          editor.chain().focus().toggleStrike().run();
          setContextMenu(null);
        }}
        active={editor.isActive("strike")}
      />

      <ContextMenuDivider />

      {/* Headings */}
      <ContextMenuItem
        icon={Heading1}
        label="Heading 1"
        onClick={() => {
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          setContextMenu(null);
        }}
        active={editor.isActive("heading", { level: 1 })}
      />
      <ContextMenuItem
        icon={Heading2}
        label="Heading 2"
        onClick={() => {
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          setContextMenu(null);
        }}
        active={editor.isActive("heading", { level: 2 })}
      />

      <ContextMenuDivider />

      {/* Lists */}
      <ContextMenuItem
        icon={List}
        label="Bullet List"
        onClick={() => {
          editor.chain().focus().toggleBulletList().run();
          setContextMenu(null);
        }}
        active={editor.isActive("bulletList")}
      />
      <ContextMenuItem
        icon={ListOrdered}
        label="Numbered List"
        onClick={() => {
          editor.chain().focus().toggleOrderedList().run();
          setContextMenu(null);
        }}
        active={editor.isActive("orderedList")}
      />

      <ContextMenuDivider />

      {/* Other */}
      <ContextMenuItem
        icon={Quote}
        label="Blockquote"
        onClick={() => {
          editor.chain().focus().toggleBlockquote().run();
          setContextMenu(null);
        }}
        active={editor.isActive("blockquote")}
      />
      <ContextMenuItem
        icon={Code}
        label="Code Block"
        onClick={() => {
          editor.chain().focus().toggleCodeBlock().run();
          setContextMenu(null);
        }}
        active={editor.isActive("codeBlock")}
      />
      <ContextMenuItem
        icon={RemoveFormatting}
        label="Clear Formatting"
        onClick={() => {
          editor.chain().focus().unsetAllMarks().clearNodes().run();
          setContextMenu(null);
        }}
      />
    </div>
  );
}

function ContextMenuItem({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled = false,
  active = false,
}: {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-1.5 text-sm hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        active && "text-primary bg-primary/10"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <span className="text-xs text-muted-foreground">{shortcut}</span>}
    </button>
  );
}

function ContextMenuDivider() {
  return <div className="h-px bg-border my-1" />;
}

export default RichTextEditor;
