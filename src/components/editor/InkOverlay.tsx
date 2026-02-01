"use client";

import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

export type InkTool = "select" | "pen" | "highlighter" | "eraser" | "line" | "rectangle" | "circle";

export interface InkStroke {
  id: string;
  tool: "pen" | "highlighter" | "line" | "rectangle" | "circle";
  points: { x: number; y: number }[];
  color: string;
  width: number;
  opacity: number;
}

export interface InkOverlayRef {
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export interface InkOverlayProps {
  enabled: boolean;
  strokes: InkStroke[];
  onStrokesChange: (strokes: InkStroke[]) => void;
  tool: InkTool;
  color: string;
  brushSize: number;
}

export const InkOverlay = forwardRef<InkOverlayRef, InkOverlayProps>(function InkOverlay(
  { enabled, strokes, onStrokesChange, tool, color, brushSize },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<InkStroke | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [history, setHistory] = useState<InkStroke[][]>(() => [strokes]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Resize canvas to match container
  useEffect(() => {
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      setCanvasSize({ width: rect.width, height: rect.height });
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // Helper function to draw a stroke
  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: InkStroke) => {
    ctx.save();
    ctx.globalAlpha = stroke.opacity;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (stroke.tool === "pen" || stroke.tool === "highlighter") {
      if (stroke.points.length < 2) {
        ctx.restore();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    } else if (stroke.tool === "line" && stroke.points.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      ctx.lineTo(stroke.points[stroke.points.length - 1].x, stroke.points[stroke.points.length - 1].y);
      ctx.stroke();
    } else if (stroke.tool === "rectangle" && stroke.points.length >= 2) {
      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];
      ctx.beginPath();
      ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
      ctx.stroke();
    } else if (stroke.tool === "circle" && stroke.points.length >= 2) {
      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];
      const radiusX = Math.abs(end.x - start.x) / 2;
      const radiusY = Math.abs(end.y - start.y) / 2;
      const centerX = start.x + (end.x - start.x) / 2;
      const centerY = start.y + (end.y - start.y) / 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  // Redraw all strokes
  const redrawStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((stroke) => drawStroke(ctx, stroke));
    if (currentStroke) drawStroke(ctx, currentStroke);
  }, [strokes, currentStroke, drawStroke]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    redrawStrokes();
  }, [canvasSize, redrawStrokes]);

  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleEraser = useCallback(
    (x: number, y: number) => {
      const eraserRadius = brushSize * 2;
      const remaining = strokes.filter((stroke) => {
        return !stroke.points.some((point) => Math.hypot(point.x - x, point.y - y) < eraserRadius);
      });
      if (remaining.length !== strokes.length) {
        onStrokesChange(remaining);
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(remaining);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    },
    [strokes, brushSize, history, historyIndex, onStrokesChange]
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (tool === "select") return;
      e.preventDefault();
      const { x, y } = getCoordinates(e);
      setIsDrawing(true);

      if (tool === "eraser") {
        handleEraser(x, y);
        return;
      }

      const newStroke: InkStroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        tool: tool as InkStroke["tool"],
        points: [{ x, y }],
        color,
        width: tool === "highlighter" ? brushSize * 3 : brushSize,
        opacity: tool === "highlighter" ? 0.4 : 1,
      };
      setCurrentStroke(newStroke);
    },
    [tool, color, brushSize, getCoordinates, handleEraser]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const { x, y } = getCoordinates(e);

      if (tool === "eraser") {
        handleEraser(x, y);
        return;
      }
      if (!currentStroke) return;

      if (tool === "pen" || tool === "highlighter") {
        setCurrentStroke((prev) => (prev ? { ...prev, points: [...prev.points, { x, y }] } : null));
      } else {
        setCurrentStroke((prev) => (prev ? { ...prev, points: [prev.points[0], { x, y }] } : null));
      }
    },
    [isDrawing, tool, currentStroke, getCoordinates, handleEraser]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke && currentStroke.points.length > 0) {
      const newStrokes = [...strokes, currentStroke];
      onStrokesChange(newStrokes);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newStrokes);
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    setCurrentStroke(null);
  }, [isDrawing, currentStroke, strokes, history, historyIndex, onStrokesChange]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    onStrokesChange(history[newIndex]);
  }, [history, historyIndex, onStrokesChange]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    onStrokesChange(history[newIndex]);
  }, [history, historyIndex, onStrokesChange]);

  const clearAll = useCallback(() => {
    onStrokesChange([]);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, onStrokesChange]);

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      undo,
      redo,
      clearAll,
      canUndo: () => historyIndex > 0,
      canRedo: () => historyIndex < history.length - 1,
    }),
    [undo, redo, clearAll, historyIndex, history.length]
  );

  // Keyboard shortcuts for undo/redo when enabled
  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, undo, redo]);

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 z-10", enabled ? "cursor-crosshair" : "pointer-events-none")}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={enabled ? startDrawing : undefined}
        onMouseMove={enabled ? draw : undefined}
        onMouseUp={enabled ? stopDrawing : undefined}
        onMouseLeave={enabled ? stopDrawing : undefined}
        onTouchStart={enabled ? startDrawing : undefined}
        onTouchMove={enabled ? draw : undefined}
        onTouchEnd={enabled ? stopDrawing : undefined}
        className="w-full h-full"
        style={{ touchAction: "none" }}
      />
    </div>
  );
});

export default InkOverlay;
