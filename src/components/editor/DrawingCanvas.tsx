"use client";

import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Pencil, Eraser, Trash2, Download, Undo, Redo, Circle, Square, Minus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tool = "pen" | "eraser" | "line" | "rectangle" | "circle" | "select";

interface HistoryEntry {
  imageData: ImageData;
}

const BRUSH_SIZES = [2, 4, 8, 12, 20];
const COLORS = [
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
  "#F87171",
  "#FBBF24",
  "#34D399",
  "#60A5FA",
  "#A78BFA",
  "#F472B6",
];

export interface DrawingCanvasRef {
  toDataURL: () => string;
  clear: () => void;
}

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onSave?: (dataUrl: string) => void;
  onCancel?: () => void;
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(function DrawingCanvas(
  { width = 800, height = 500, onSave, onCancel },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const initializedRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);

  // Initialize canvas and temp canvas
  useEffect(() => {
    // Create temp canvas once
    if (!tempCanvasRef.current) {
      const temp = document.createElement("canvas");
      temp.width = width;
      temp.height = height;
      tempCanvasRef.current = temp;
    }

    // Initialize main canvas once
    if (!initializedRef.current) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save initial history state
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([{ imageData }]);
      setHistoryIndex(0);

      initializedRef.current = true;
    }
  }, [width, height]);

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Remove any redo states
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ imageData });

    // Limit history to 50 entries
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex].imageData, 0, 0);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex].imageData, 0, 0);
    setHistoryIndex(newIndex);
  }, [history, historyIndex]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas!.width, canvas!.height);
    saveHistory();
  }, [saveHistory]);

  useImperativeHandle(ref, () => ({
    toDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
    clear: clearCanvas,
  }));

  const getCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getCoordinates(e);
      setIsDrawing(true);
      setStartPoint({ x, y });

      if (tool === "pen" || tool === "eraser") {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      }
    },
    [getCoordinates, tool, brushSize, color]
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      const { x, y } = getCoordinates(e);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      if (tool === "pen" || tool === "eraser") {
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === "line" || tool === "rectangle" || tool === "circle") {
        // Preview shape on temp canvas
        if (!tempCanvasRef.current || !startPoint) return;

        const tempCtx = tempCanvasRef.current.getContext("2d");
        if (!tempCtx) return;

        // Restore original state
        if (history[historyIndex]) {
          ctx.putImageData(history[historyIndex].imageData, 0, 0);
        }

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = "round";

        if (tool === "line") {
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(x, y);
        } else if (tool === "rectangle") {
          ctx.rect(startPoint.x, startPoint.y, x - startPoint.x, y - startPoint.y);
        } else if (tool === "circle") {
          const radiusX = Math.abs(x - startPoint.x) / 2;
          const radiusY = Math.abs(y - startPoint.y) / 2;
          const centerX = startPoint.x + (x - startPoint.x) / 2;
          const centerY = startPoint.y + (y - startPoint.y) / 2;
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        }

        ctx.stroke();
      }
    },
    [isDrawing, getCoordinates, tool, color, brushSize, startPoint, history, historyIndex]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    setStartPoint(null);
    saveHistory();
  }, [isDrawing, saveHistory]);

  const handleSave = useCallback(() => {
    const dataUrl = canvasRef.current?.toDataURL("image/png");
    if (dataUrl) {
      onSave?.(dataUrl);
    }
  }, [onSave]);

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="flex flex-col h-full bg-muted/20 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30 flex-wrap">
        {/* Tools */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            type="button"
            onClick={() => setTool("pen")}
            className={cn(
              "p-2 rounded transition-colors",
              tool === "pen" ? "bg-primary text-primary-foreground" : "hover:bg-muted-foreground/20"
            )}
            title="Pen"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={cn(
              "p-2 rounded transition-colors",
              tool === "eraser" ? "bg-primary text-primary-foreground" : "hover:bg-muted-foreground/20"
            )}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setTool("line")}
            className={cn(
              "p-2 rounded transition-colors",
              tool === "line" ? "bg-primary text-primary-foreground" : "hover:bg-muted-foreground/20"
            )}
            title="Line"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setTool("rectangle")}
            className={cn(
              "p-2 rounded transition-colors",
              tool === "rectangle" ? "bg-primary text-primary-foreground" : "hover:bg-muted-foreground/20"
            )}
            title="Rectangle"
          >
            <Square className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setTool("circle")}
            className={cn(
              "p-2 rounded transition-colors",
              tool === "circle" ? "bg-primary text-primary-foreground" : "hover:bg-muted-foreground/20"
            )}
            title="Ellipse"
          >
            <Circle className="h-4 w-4" />
          </button>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Brush Size */}
        <div className="flex items-center gap-1">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setBrushSize(size)}
              className={cn(
                "w-8 h-8 rounded flex items-center justify-center transition-colors",
                brushSize === size ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
              title={`${size}px`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: Math.min(size, 16), height: Math.min(size, 16) }}
              />
            </button>
          ))}
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Colors */}
        <div className="flex items-center gap-1 flex-wrap">
          {COLORS.slice(0, 8).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                color === c
                  ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "border-border"
              )}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={clearCanvas} title="Clear Canvas">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={downloadImage} title="Download Image">
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Save/Cancel */}
        {onCancel && (
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}
        {onSave && (
          <Button size="sm" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            Insert Drawing
          </Button>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#2a2a2a]">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="bg-white rounded shadow-lg cursor-crosshair max-w-full"
          style={{
            maxHeight: "100%",
            touchAction: "none",
          }}
        />
      </div>
    </div>
  );
});

export default DrawingCanvas;
