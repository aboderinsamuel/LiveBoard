import { DrawingAction, WhiteboardState, Collaborator } from '@/types/whiteboard';
import { generateId } from '@/lib/utils';

export class CollaborationManager {
  private whiteboardState: WhiteboardState;
  private pendingActions: Map<string, DrawingAction> = new Map();
  private actionQueue: DrawingAction[] = [];
  private isProcessing = false;

  constructor(initialState: WhiteboardState) {
    this.whiteboardState = initialState;
  }

  // Add a new action with conflict resolution
  addAction(action: DrawingAction): { success: boolean; conflict?: boolean; resolvedAction?: DrawingAction } {
    // Check for conflicts with pending actions
    const conflicts = this.findConflicts(action);
    
    if (conflicts.length > 0) {
      // Resolve conflicts using operational transformation
      const resolvedAction = this.resolveConflicts(action, conflicts);
      this.applyAction(resolvedAction);
      return { success: true, conflict: true, resolvedAction };
    }

    this.applyAction(action);
    return { success: true, conflict: false };
  }

  // Find actions that might conflict with the new action
  private findConflicts(newAction: DrawingAction): DrawingAction[] {
    const conflicts: DrawingAction[] = [];
    const timeWindow = 5000; // 5 seconds

    // Check for temporal conflicts (actions happening around the same time)
    for (const action of this.whiteboardState.actions) {
      if (Math.abs(action.timestamp - newAction.timestamp) < timeWindow) {
        // Check for spatial conflicts (actions in similar areas)
        if (this.hasSpatialConflict(newAction, action)) {
          conflicts.push(action);
        }
      }
    }

    return conflicts;
  }

  // Check if two actions have spatial conflicts
  private hasSpatialConflict(action1: DrawingAction, action2: DrawingAction): boolean {
    if (action1.points.length === 0 || action2.points.length === 0) return false;

    const threshold = 50; // pixels

    // Check if any points from action1 are close to any points from action2
    for (const point1 of action1.points) {
      for (const point2 of action2.points) {
        const distance = Math.sqrt(
          Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
        );
        if (distance < threshold) {
          return true;
        }
      }
    }

    return false;
  }

  // Resolve conflicts using operational transformation
  private resolveConflicts(newAction: DrawingAction, conflicts: DrawingAction[]): DrawingAction {
    const resolvedAction = { ...newAction };

    for (const conflict of conflicts) {
      // Apply transformation based on conflict type
      if (conflict.type === 'clear' && newAction.type !== 'clear') {
        // If there's a clear action, the new action should be applied after it
        resolvedAction.timestamp = Math.max(conflict.timestamp + 1, newAction.timestamp);
      } else if (newAction.type === 'erase' && conflict.type === 'draw') {
        // Erase actions take precedence over draw actions
        resolvedAction.timestamp = Math.max(conflict.timestamp + 1, newAction.timestamp);
      } else if (newAction.type === 'draw' && conflict.type === 'erase') {
        // Draw actions after erase actions
        resolvedAction.timestamp = Math.max(conflict.timestamp + 1, newAction.timestamp);
      } else {
        // For same-type conflicts, use timestamp ordering
        resolvedAction.timestamp = Math.max(conflict.timestamp + 1, newAction.timestamp);
      }
    }

    return resolvedAction;
  }

  // Apply an action to the whiteboard state
  private applyAction(action: DrawingAction): void {
    this.whiteboardState.actions.push(action);
    this.whiteboardState.lastModified = action.timestamp;
    
    // Sort actions by timestamp to maintain order
    this.whiteboardState.actions.sort((a, b) => a.timestamp - b.timestamp);
  }

  // Get the current state
  getState(): WhiteboardState {
    return { ...this.whiteboardState };
  }

  // Update collaborators
  updateCollaborators(collaborators: Collaborator[]): void {
    this.whiteboardState.collaborators = collaborators;
  }

  // Get actions since a specific timestamp
  getActionsSince(timestamp: number): DrawingAction[] {
    return this.whiteboardState.actions.filter(action => action.timestamp > timestamp);
  }

  // Optimize actions by removing redundant ones
  optimizeActions(): void {
    const optimized: DrawingAction[] = [];
    const clearActions: DrawingAction[] = [];

    // Separate clear actions
    for (const action of this.whiteboardState.actions) {
      if (action.type === 'clear') {
        clearActions.push(action);
      } else {
        optimized.push(action);
      }
    }

    // If there are clear actions, only keep the latest one and actions after it
    if (clearActions.length > 0) {
      const latestClear = clearActions[clearActions.length - 1];
      const actionsAfterClear = optimized.filter(action => action.timestamp > latestClear.timestamp);
      this.whiteboardState.actions = [latestClear, ...actionsAfterClear];
    } else {
      this.whiteboardState.actions = optimized;
    }
  }

  // Merge actions from multiple sources
  mergeActions(actions: DrawingAction[]): void {
    const allActions = [...this.whiteboardState.actions, ...actions];
    
    // Remove duplicates based on ID
    const uniqueActions = allActions.filter((action, index, self) => 
      index === self.findIndex(a => a.id === action.id)
    );

    // Sort by timestamp
    uniqueActions.sort((a, b) => a.timestamp - b.timestamp);

    this.whiteboardState.actions = uniqueActions;
    this.whiteboardState.lastModified = Date.now();
  }

  // Create a snapshot of the current state
  createSnapshot(): { state: WhiteboardState; timestamp: number } {
    return {
      state: { ...this.whiteboardState },
      timestamp: Date.now(),
    };
  }

  // Restore from a snapshot
  restoreFromSnapshot(snapshot: { state: WhiteboardState; timestamp: number }): void {
    this.whiteboardState = { ...snapshot.state };
  }
}

// Utility functions for collaboration
export function createActionId(): string {
  return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function validateAction(action: any): action is DrawingAction {
  return (
    action &&
    typeof action === 'object' &&
    typeof action.id === 'string' &&
    typeof action.type === 'string' &&
    ['draw', 'erase', 'clear'].includes(action.type) &&
    Array.isArray(action.points) &&
    typeof action.color === 'string' &&
    typeof action.strokeWidth === 'number' &&
    typeof action.timestamp === 'number' &&
    typeof action.userId === 'string'
  );
}

export function sanitizeAction(action: DrawingAction): DrawingAction {
  return {
    id: action.id,
    type: action.type,
    points: action.points.map(point => ({
      x: Math.max(0, Math.min(10000, point.x)), // Clamp to reasonable bounds
      y: Math.max(0, Math.min(10000, point.y)),
    })),
    color: action.color,
    strokeWidth: Math.max(1, Math.min(50, action.strokeWidth)), // Clamp stroke width
    timestamp: action.timestamp,
    userId: action.userId,
  };
}
