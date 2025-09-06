import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToolPanel } from "@/components/ToolPanel";
import { DrawingTool } from "@/types/whiteboard";

describe("ToolPanel", () => {
  const mockOnToolChange = jest.fn();
  const mockOnClear = jest.fn();

  const defaultTool: DrawingTool = {
    type: "pen",
    color: "#000000",
    strokeWidth: 2,
    opacity: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all tool types", () => {
    render(
      <ToolPanel
        currentTool={defaultTool}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByTitle("Pen")).toBeInTheDocument();
    expect(screen.getByTitle("Eraser")).toBeInTheDocument();
    expect(screen.getByTitle("Highlighter")).toBeInTheDocument();
  });

  it("should highlight the current tool", () => {
    render(
      <ToolPanel
        currentTool={defaultTool}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    const penButton = screen.getByTitle("Pen");
    expect(penButton).toHaveClass(
      "border-blue-500",
      "bg-blue-50",
      "text-blue-700"
    );
  });

  it("should call onToolChange when tool type is changed", () => {
    render(
      <ToolPanel
        currentTool={defaultTool}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    const eraserButton = screen.getByTitle("Eraser");
    fireEvent.click(eraserButton);

    expect(mockOnToolChange).toHaveBeenCalledWith({ type: "eraser" });
  });

  it("should render color palette", () => {
    render(
      <ToolPanel
        currentTool={defaultTool}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    // Check for some expected colors
    expect(screen.getByTitle("#000000")).toBeInTheDocument();
    expect(screen.getByTitle("#ef4444")).toBeInTheDocument();
    expect(screen.getByTitle("#3b82f6")).toBeInTheDocument();
  });

  it("should call onToolChange when color is selected", () => {
    render(
      <ToolPanel
        currentTool={defaultTool}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    const redColorButton = screen.getByTitle("#ef4444");
    fireEvent.click(redColorButton);

    expect(mockOnToolChange).toHaveBeenCalledWith({ color: "#ef4444" });
  });

  it("should render stroke width options", () => {
    render(
      <ToolPanel
        currentTool={defaultTool}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    // Check for stroke width options
    expect(screen.getByText("1px")).toBeInTheDocument();
    expect(screen.getByText("2px")).toBeInTheDocument();
    expect(screen.getByText("4px")).toBeInTheDocument();
  });

  it("should call onToolChange when stroke width is selected", () => {
    render(
      <ToolPanel
        currentTool={defaultTool}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    const strokeWidth4 = screen.getByText("4px").closest("button");
    fireEvent.click(strokeWidth4!);

    expect(mockOnToolChange).toHaveBeenCalledWith({ strokeWidth: 4 });
  });

  it("should render opacity slider", () => {
    render(
      <ToolPanel
        currentTool={defaultTool}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    const opacitySlider = screen.getByRole("slider");
    expect(opacitySlider).toBeInTheDocument();
    expect(opacitySlider).toHaveAttribute("min", "0.1");
    expect(opacitySlider).toHaveAttribute("max", "1");
    expect(opacitySlider).toHaveAttribute("step", "0.1");
  });

  it("should call onToolChange when opacity is changed", () => {
    render(
      <ToolPanel
        currentTool={defaultTool}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    const opacitySlider = screen.getByRole("slider");
    fireEvent.change(opacitySlider, { target: { value: "0.5" } });

    expect(mockOnToolChange).toHaveBeenCalledWith({ opacity: 0.5 });
  });

  it("should render clear button", () => {
    render(
      <ToolPanel
        currentTool={defaultTool}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByText("Clear Whiteboard");
    expect(clearButton).toBeInTheDocument();
  });

  it("should call onClear when clear button is clicked", () => {
    render(
      <ToolPanel
        currentTool={defaultTool}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByText("Clear Whiteboard");
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it("should highlight current stroke width", () => {
    const toolWithStrokeWidth4: DrawingTool = {
      ...defaultTool,
      strokeWidth: 4,
    };

    render(
      <ToolPanel
        currentTool={toolWithStrokeWidth4}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    const strokeWidth4Button = screen.getByText("4px").closest("button");
    expect(strokeWidth4Button).toHaveClass("border-blue-500", "bg-blue-50");
  });

  it("should show current opacity percentage", () => {
    const toolWithOpacity: DrawingTool = {
      ...defaultTool,
      opacity: 0.7,
    };

    render(
      <ToolPanel
        currentTool={toolWithOpacity}
        onToolChange={mockOnToolChange}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText("70%")).toBeInTheDocument();
  });
});
