import React, { useState, useEffect } from "react";
import { WhiteboardCanvas } from "./WhiteboardCanvas";
import { ToolPanel } from "./ToolPanel";
import { CollaboratorList } from "./CollaboratorList";
import { InvitePanel } from "./InvitePanel";
import { useWhiteboard } from "@/hooks/useWhiteboard";
import { generateId } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WhiteboardAppProps {
  whiteboardId: string;
  userId: string;
  userName: string;
  className?: string;
}

export function WhiteboardApp({
  whiteboardId,
  userId,
  userName,
  className,
}: WhiteboardAppProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCollaborators, setShowCollaborators] = useState(true);

  const {
    whiteboardState,
    collaborators,
    isConnected,
    error,
    isLoading,
    currentTool,
    startDrawing,
    continueDrawing,
    finishDrawing,
    clearWhiteboard,
    updateCursor,
    updateTool,
  } = useWhiteboard({ whiteboardId, userId, userName });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to whiteboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-screen bg-gray-50 flex flex-col", className)}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {whiteboardState?.name || "Collaborative Whiteboard"}
            </h1>
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
                )}
              />
              <span className="text-sm text-gray-600">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <InvitePanel whiteboardId={whiteboardId} />

            <button
              onClick={() => setShowCollaborators(!showCollaborators)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Toggle collaborators"
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Toggle tools"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <div className="space-y-4">
              <ToolPanel
                currentTool={currentTool}
                onToolChange={updateTool}
                onClear={clearWhiteboard}
              />

              {showCollaborators && (
                <CollaboratorList collaborators={collaborators} />
              )}
            </div>
          </div>
        )}

        {/* Whiteboard Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200">
              <WhiteboardCanvas
                actions={whiteboardState?.actions || []}
                onStartDrawing={startDrawing}
                onContinueDrawing={continueDrawing}
                onFinishDrawing={finishDrawing}
                onCursorMove={updateCursor}
                currentTool={currentTool}
                collaborators={collaborators}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Whiteboard ID: {whiteboardId}</span>
            <span>Actions: {whiteboardState?.actions.length || 0}</span>
            <span>
              Collaborators: {collaborators.filter((c) => c.isActive).length}
            </span>
          </div>
          <div>
            {whiteboardState?.lastModified && (
              <span>
                Last modified:{" "}
                {new Date(whiteboardState.lastModified).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
