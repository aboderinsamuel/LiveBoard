export interface Point {
  x: number;
  y: number;
}

export interface DrawingAction {
  id: string;
  type: 'draw' | 'erase' | 'clear';
  points: Point[];
  color: string;
  strokeWidth: number;
  timestamp: number;
  userId: string;
}

export interface WhiteboardState {
  id: string;
  name: string;
  actions: DrawingAction[];
  lastModified: number;
  createdBy: string;
  collaborators: Collaborator[];
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: Point;
  isActive: boolean;
  lastSeen: number;
}

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface WhiteboardEvent {
  type: 'action' | 'cursor' | 'user_join' | 'user_leave' | 'state_sync';
  data: any;
  userId: string;
  timestamp: number;
}

export interface DrawingTool {
  type: 'pen' | 'eraser' | 'highlighter' | 'shape';
  color: string;
  strokeWidth: number;
  opacity: number;
}

export interface WhiteboardSettings {
  backgroundColor: string;
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
}
