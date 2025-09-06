import { useState, useEffect, useCallback, useRef } from 'react';
import { DrawingAction, Collaborator, WhiteboardState, DrawingTool } from '@/types/whiteboard';
import { wsManager } from '@/lib/websocket';
import { generateId, getRandomColor } from '@/lib/utils';

interface UseWhiteboardProps {
  whiteboardId: string;
  userId: string;
  userName: string;
}

export function useWhiteboard({ whiteboardId, userId, userName }: UseWhiteboardProps) {
  const [whiteboardState, setWhiteboardState] = useState<WhiteboardState | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentTool, setCurrentTool] = useState<DrawingTool>({
    type: 'pen',
    color: '#000000',
    strokeWidth: 2,
    opacity: 1,
  });

  const isDrawingRef = useRef(false);
  const currentPathRef = useRef<DrawingAction | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const userColor = getRandomColor();
        const collaborator: Collaborator = {
          id: userId,
          name: userName,
          color: userColor,
          isActive: true,
          lastSeen: Date.now(),
        };

        await wsManager.connect(whiteboardId, userId);
        setIsConnected(true);

        // Set up event listeners
        wsManager.onAction(handleRemoteAction);
        wsManager.onCursorMove(handleCursorMove);
        wsManager.onUserJoin(handleUserJoin);
        wsManager.onUserLeave(handleUserLeave);
        wsManager.onStateSync(handleStateSync);
        wsManager.onError(handleError);

        // Join the whiteboard
        wsManager.emitJoin(whiteboardId, collaborator);

        // Initialize with empty whiteboard state
        setWhiteboardState({
          id: whiteboardId,
          name: `Whiteboard ${whiteboardId.substr(0, 8)}`,
          actions: [],
          lastModified: Date.now(),
          createdBy: userId,
          collaborators: [collaborator],
        });

        setCollaborators([collaborator]);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize WebSocket connection:', err);
        setError('Failed to connect to the whiteboard');
        setIsLoading(false);
      }
    };

    initializeConnection();

    return () => {
      wsManager.removeAllListeners();
      wsManager.disconnect();
    };
  }, [whiteboardId, userId, userName]);

  const handleRemoteAction = useCallback((action: DrawingAction) => {
    setWhiteboardState(prev => {
      if (!prev) return prev;
      
      // Check if action already exists to prevent duplicates
      const actionExists = prev.actions.some(a => a.id === action.id);
      if (actionExists) return prev;
      
      return {
        ...prev,
        actions: [...prev.actions, action],
        lastModified: action.timestamp,
      };
    });
  }, []);

  const handleCursorMove = useCallback((data: { userId: string; cursor: { x: number; y: number } }) => {
    setCollaborators(prev => 
      prev.map(collaborator => 
        collaborator.id === data.userId 
          ? { ...collaborator, cursor: data.cursor, lastSeen: Date.now() }
          : collaborator
      )
    );
  }, []);

  const handleUserJoin = useCallback((user: Collaborator) => {
    setCollaborators(prev => {
      const existing = prev.find(c => c.id === user.id);
      if (existing) {
        return prev.map(c => c.id === user.id ? { ...user, isActive: true } : c);
      }
      return [...prev, { ...user, isActive: true }];
    });
  }, []);

  const handleUserLeave = useCallback((userId: string) => {
    setCollaborators(prev => 
      prev.map(collaborator => 
        collaborator.id === userId 
          ? { ...collaborator, isActive: false, lastSeen: Date.now() }
          : collaborator
      )
    );
  }, []);

  const handleStateSync = useCallback((state: WhiteboardState) => {
    setWhiteboardState(prev => {
      // Merge actions to avoid duplicates
      const existingActionIds = new Set(prev?.actions.map(a => a.id) || []);
      const newActions = state.actions.filter(a => !existingActionIds.has(a.id));
      
      return {
        ...state,
        actions: [...(prev?.actions || []), ...newActions].sort((a, b) => a.timestamp - b.timestamp),
      };
    });
    setCollaborators(state.collaborators);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const startDrawing = useCallback((point: { x: number; y: number }) => {
    if (!isConnected) return;

    isDrawingRef.current = true;
    currentPathRef.current = {
      id: generateId(),
      type: currentTool.type === 'eraser' ? 'erase' : 'draw',
      points: [point],
      color: currentTool.color,
      strokeWidth: currentTool.strokeWidth,
      timestamp: Date.now(),
      userId,
    };
  }, [isConnected, currentTool, userId]);

  const continueDrawing = useCallback((point: { x: number; y: number }) => {
    if (!isDrawingRef.current || !currentPathRef.current) return;

    currentPathRef.current.points.push(point);
  }, []);

  const finishDrawing = useCallback(() => {
    if (!isDrawingRef.current || !currentPathRef.current) return;

    const action = currentPathRef.current;
    isDrawingRef.current = false;
    currentPathRef.current = null;

    // Emit the action to other users
    wsManager.emitAction(action);

    // Update local state
    setWhiteboardState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        actions: [...prev.actions, action],
        lastModified: action.timestamp,
      };
    });
  }, []);

  const clearWhiteboard = useCallback(() => {
    if (!isConnected) return;

    const clearAction: DrawingAction = {
      id: generateId(),
      type: 'clear',
      points: [],
      color: '#ffffff',
      strokeWidth: 0,
      timestamp: Date.now(),
      userId,
    };

    wsManager.emitAction(clearAction);

    setWhiteboardState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        actions: [clearAction],
        lastModified: clearAction.timestamp,
      };
    });
  }, [isConnected, userId]);

  const updateCursor = useCallback((cursor: { x: number; y: number }) => {
    if (!isConnected) return;
    wsManager.emitCursorMove(cursor);
  }, [isConnected]);

  const updateTool = useCallback((tool: Partial<DrawingTool>) => {
    setCurrentTool(prev => ({ ...prev, ...tool }));
  }, []);

  return {
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
  };
}
