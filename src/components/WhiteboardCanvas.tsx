import React, { useRef, useEffect, useCallback, useState } from "react";
import { DrawingAction, Point } from "@/types/whiteboard";
import { cn } from "@/lib/utils";

interface WhiteboardCanvasProps {
  actions: DrawingAction[];
  onStartDrawing: (point: Point) => void;
  onContinueDrawing: (point: Point) => void;
  onFinishDrawing: () => void;
  onCursorMove: (point: Point) => void;
  currentTool: {
    type: "pen" | "eraser" | "highlighter" | "shape";
    color: string;
    strokeWidth: number;
    opacity: number;
  };
  collaborators: Array<{
    id: string;
    name: string;
    color: string;
    cursor?: Point;
    isActive: boolean;
  }>;
  className?: string;
}

export function WhiteboardCanvas({
  actions,
  onStartDrawing,
  onContinueDrawing,
  onFinishDrawing,
  onCursorMove,
  currentTool,
  collaborators,
  className,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isLocalDrawing, setIsLocalDrawing] = useState(false);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        setCanvasSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redraw canvas when actions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all actions
    actions.forEach((action) => {
      if (action.type === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      if (action.points.length === 0) return;

      ctx.beginPath();
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = action.type === "erase" ? 1 : 0.8;

      if (action.type === "erase") {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.globalCompositeOperation = "source-over";
      }

      // Draw the path
      const firstPoint = action.points[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < action.points.length; i++) {
        const point = action.points[i];
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    });

    // Draw current local path if drawing
    if (isLocalDrawing && currentPath.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = currentTool.color;
      ctx.lineWidth = currentTool.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = currentTool.type === "eraser" ? 1 : currentTool.opacity;
      ctx.globalCompositeOperation =
        currentTool.type === "eraser" ? "destination-out" : "source-over";

      const firstPoint = currentPath[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < currentPath.length; i++) {
        const point = currentPath[i];
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
    }

    // Reset composite operation
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }, [actions, isLocalDrawing, currentPath, currentTool]);

  // Draw collaborator cursors
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear cursor layer (we'll redraw everything)
    const cursorCanvas = document.getElementById(
      "cursor-canvas"
    ) as HTMLCanvasElement;
    if (cursorCanvas) {
      const cursorCtx = cursorCanvas.getContext("2d");
      if (cursorCtx) {
        cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

        // Draw collaborator cursors
        collaborators.forEach((collaborator) => {
          if (collaborator.cursor && collaborator.isActive) {
            cursorCtx.fillStyle = collaborator.color;
            cursorCtx.beginPath();
            cursorCtx.arc(
              collaborator.cursor.x,
              collaborator.cursor.y,
              8,
              0,
              2 * Math.PI
            );
            cursorCtx.fill();

            // Draw collaborator name
            cursorCtx.fillStyle = "#000000";
            cursorCtx.font = "12px Arial";
            cursorCtx.fillText(
              collaborator.name,
              collaborator.cursor.x + 12,
              collaborator.cursor.y - 8
            );
          }
        });
      }
    }
  }, [collaborators]);

  const getPointFromEvent = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX: number, clientY: number;

      if ("touches" in e) {
        // Touch event
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        // Mouse event
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const point = getPointFromEvent(e);
      setIsDrawing(true);
      setIsLocalDrawing(true);
      setCurrentPath([point]);
      onStartDrawing(point);
    },
    [getPointFromEvent, onStartDrawing]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const point = getPointFromEvent(e);

      onCursorMove(point);

      if (isDrawing) {
        setCurrentPath((prev) => [...prev, point]);
        onContinueDrawing(point);
      }
    },
    [getPointFromEvent, onCursorMove, onContinueDrawing, isDrawing]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (isDrawing) {
        setIsDrawing(false);
        setIsLocalDrawing(false);
        setCurrentPath([]);
        onFinishDrawing();
      }
    },
    [isDrawing, onFinishDrawing]
  );

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setIsLocalDrawing(false);
      setCurrentPath([]);
      onFinishDrawing();
    }
  }, [isDrawing, onFinishDrawing]);

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const point = getPointFromEvent(e);
      setIsDrawing(true);
      setIsLocalDrawing(true);
      setCurrentPath([point]);
      onStartDrawing(point);
    },
    [getPointFromEvent, onStartDrawing]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const point = getPointFromEvent(e);

      onCursorMove(point);

      if (isDrawing) {
        setCurrentPath((prev) => [...prev, point]);
        onContinueDrawing(point);
      }
    },
    [getPointFromEvent, onCursorMove, onContinueDrawing, isDrawing]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (isDrawing) {
        setIsDrawing(false);
        setIsLocalDrawing(false);
        setCurrentPath([]);
        onFinishDrawing();
      }
    },
    [isDrawing, onFinishDrawing]
  );

  return (
    <div
      className={cn(
        "relative w-full h-full bg-white border border-gray-200",
        className
      )}
    >
      {/* Main drawing canvas */}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "none" }}
      />

      {/* Cursor overlay canvas */}
      <canvas
        id="cursor-canvas"
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}
