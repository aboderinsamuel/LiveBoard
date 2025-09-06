import React from "react";
import { Collaborator } from "@/types/whiteboard";
import { cn } from "@/lib/utils";

interface CollaboratorListProps {
  collaborators: Collaborator[];
  className?: string;
}

export function CollaboratorList({
  collaborators,
  className,
}: CollaboratorListProps) {
  const activeCollaborators = collaborators.filter((c) => c.isActive);
  const inactiveCollaborators = collaborators.filter((c) => !c.isActive);

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-sm p-4",
        className
      )}
    >
      <h3 className="text-sm font-medium text-gray-700 mb-3">Collaborators</h3>

      <div className="space-y-3">
        {/* Active collaborators */}
        {activeCollaborators.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Online ({activeCollaborators.length})
            </h4>
            <div className="space-y-2">
              {activeCollaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center space-x-3 p-2 rounded-md bg-green-50 border border-green-200"
                >
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: collaborator.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {collaborator.name}
                    </p>
                    {collaborator.cursor && (
                      <p className="text-xs text-gray-500">
                        Drawing at ({Math.round(collaborator.cursor.x)},{" "}
                        {Math.round(collaborator.cursor.y)})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inactive collaborators */}
        {inactiveCollaborators.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Recently Left ({inactiveCollaborators.length})
            </h4>
            <div className="space-y-2">
              {inactiveCollaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center space-x-3 p-2 rounded-md bg-gray-50 border border-gray-200"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: collaborator.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {collaborator.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Left{" "}
                      {new Date(collaborator.lastSeen).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    <span className="text-xs text-gray-500">Offline</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {collaborators.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No collaborators yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
