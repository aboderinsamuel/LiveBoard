import React from "react";
import { DrawingTool } from "@/types/whiteboard";
import { cn } from "@/lib/utils";

interface ToolPanelProps {
  currentTool: DrawingTool;
  onToolChange: (tool: Partial<DrawingTool>) => void;
  onClear: () => void;
  className?: string;
}

const TOOL_COLORS = [
  "#000000",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

const STROKE_WIDTHS = [1, 2, 4, 6, 8, 12, 16, 20];

export function ToolPanel({
  currentTool,
  onToolChange,
  onClear,
  className,
}: ToolPanelProps) {
  const handleToolTypeChange = (type: DrawingTool["type"]) => {
    onToolChange({ type });
  };

  const handleColorChange = (color: string) => {
    onToolChange({ color });
  };

  const handleStrokeWidthChange = (strokeWidth: number) => {
    onToolChange({ strokeWidth });
  };

  const handleOpacityChange = (opacity: number) => {
    onToolChange({ opacity });
  };

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-sm p-4",
        className
      )}
    >
      <div className="space-y-4">
        {/* Tool Types */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tools</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleToolTypeChange("pen")}
              className={cn(
                "p-2 rounded-md border-2 transition-colors",
                currentTool.type === "pen"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              )}
              title="Pen"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>

            <button
              onClick={() => handleToolTypeChange("eraser")}
              className={cn(
                "p-2 rounded-md border-2 transition-colors",
                currentTool.type === "eraser"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              )}
              title="Eraser"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>

            <button
              onClick={() => handleToolTypeChange("highlighter")}
              className={cn(
                "p-2 rounded-md border-2 transition-colors",
                currentTool.type === "highlighter"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              )}
              title="Highlighter"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Colors */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Colors</h3>
          <div className="grid grid-cols-6 gap-2">
            {TOOL_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                  currentTool.color === color
                    ? "border-gray-800 ring-2 ring-gray-300"
                    : "border-gray-200 hover:border-gray-400"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Stroke Width */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Stroke Width
          </h3>
          <div className="space-y-2">
            {STROKE_WIDTHS.map((width) => (
              <button
                key={width}
                onClick={() => handleStrokeWidthChange(width)}
                className={cn(
                  "w-full flex items-center space-x-2 p-2 rounded-md border transition-colors",
                  currentTool.strokeWidth === width
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div
                  className="rounded-full bg-gray-800"
                  style={{
                    width: Math.min(width * 2, 20),
                    height: Math.min(width * 2, 20),
                  }}
                />
                <span className="text-sm text-gray-600">{width}px</span>
              </button>
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Opacity</h3>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={currentTool.opacity}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>{Math.round(currentTool.opacity * 100)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onClear}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
          >
            Clear Whiteboard
          </button>
        </div>
      </div>
    </div>
  );
}
