import { useState, useEffect, useCallback, useRef } from 'react';
import { DrawingAction, Collaborator, WhiteboardState } from '@/types/whiteboard';
import { CollaborationManager, validateAction, sanitizeAction } from '@/lib/collaboration';
import { wsManager } from '@/lib/websocket';

interface UseCollaborationProps {
  whiteboardId: string;
  userId: string;
  initialState?: WhiteboardState;
}

export function useCollaboration({ whiteboardId, userId, initialState }: UseCollaborationProps) {
  const [collaborationManager] = useState(() => 
    new CollaborationManager(initialState || {
      id: whiteboardId,
      name: 'New Whiteboard',
      actions: [],
      lastModified: Date.now(),
      createdBy: userId,
      collaborators: [],
    })
  );

  const [whiteboardState, setWhiteboardState] = useState<WhiteboardState>(
    collaborationManager.getState()
  );

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [conflictCount, setConflictCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());

  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const pendingActionsRef = useRef<DrawingAction[]>([]);

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await wsManager.connect(whiteboardId, userId);
        setIsConnected(true);

        // Set up event listeners
        wsManager.onAction(handleRemoteAction);
        wsManager.onUserJoin(handleUserJoin);
        wsManager.onUserLeave(handleUserLeave);
        wsManager.onStateSync(handleStateSync);
        wsManager.onError(handleError);

        // Start periodic sync
        startPeriodicSync();

      } catch (error) {
        console.error('Failed to initialize collaboration:', error);
        setIsConnected(false);
      }
    };

    initializeConnection();

    return () => {
      stopPeriodicSync();
      wsManager.removeAllListeners();
      wsManager.disconnect();
    };
  }, [whiteboardId, userId]);

  const handleRemoteAction = useCallback((action: DrawingAction) => {
    if (!validateAction(action)) {
      console.warn('Invalid action received:', action);
      return;
    }

    const sanitizedAction = sanitizeAction(action);
    const result = collaborationManager.addAction(sanitizedAction);

    if (result.conflict) {
      setConflictCount(prev => prev + 1);
      console.log('Conflict resolved for action:', sanitizedAction.id);
    }

    setWhiteboardState(collaborationManager.getState());
  }, [collaborationManager]);

  const handleUserJoin = useCallback((user: Collaborator) => {
    setCollaborators(prev => {
      const existing = prev.find(c => c.id === user.id);
      if (existing) {
        return prev.map(c => c.id === user.id ? { ...user, isActive: true } : c);
      }
      return [...prev, { ...user, isActive: true }];
    });

    // Update collaboration manager
    const currentState = collaborationManager.getState();
    const updatedCollaborators = [...currentState.collaborators];
    const existingIndex = updatedCollaborators.findIndex(c => c.id === user.id);
    
    if (existingIndex >= 0) {
      updatedCollaborators[existingIndex] = { ...user, isActive: true };
    } else {
      updatedCollaborators.push({ ...user, isActive: true });
    }
    
    collaborationManager.updateCollaborators(updatedCollaborators);
  }, [collaborationManager]);

  const handleUserLeave = useCallback((userId: string) => {
    setCollaborators(prev => 
      prev.map(collaborator => 
        collaborator.id === userId 
          ? { ...collaborator, isActive: false, lastSeen: Date.now() }
          : collaborator
      )
    );

    // Update collaboration manager
    const currentState = collaborationManager.getState();
    const updatedCollaborators = currentState.collaborators.map(collaborator =>
      collaborator.id === userId 
        ? { ...collaborator, isActive: false, lastSeen: Date.now() }
        : collaborator
    );
    
    collaborationManager.updateCollaborators(updatedCollaborators);
  }, [collaborationManager]);

  const handleStateSync = useCallback((state: WhiteboardState) => {
    // Merge the received state with our current state
    collaborationManager.mergeActions(state.actions);
    setWhiteboardState(collaborationManager.getState());
    setCollaborators(state.collaborators);
    setLastSyncTime(Date.now());
  }, [collaborationManager]);

  const handleError = useCallback((error: string) => {
    console.error('Collaboration error:', error);
  }, []);

  const startPeriodicSync = useCallback(() => {
    syncIntervalRef.current = setInterval(() => {
      if (pendingActionsRef.current.length > 0) {
        // Send pending actions
        pendingActionsRef.current.forEach(action => {
          wsManager.emitAction(action);
        });
        pendingActionsRef.current = [];
      }

      // Optimize actions periodically
      collaborationManager.optimizeActions();
      setWhiteboardState(collaborationManager.getState());
    }, 1000); // Sync every second
  }, [collaborationManager]);

  const stopPeriodicSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }
  }, []);

  const addAction = useCallback((action: DrawingAction) => {
    if (!validateAction(action)) {
      console.warn('Invalid action:', action);
      return;
    }

    const sanitizedAction = sanitizeAction(action);
    const result = collaborationManager.addAction(sanitizedAction);

    if (result.conflict) {
      setConflictCount(prev => prev + 1);
    }

    setWhiteboardState(collaborationManager.getState());

    // Add to pending actions for batch sending
    pendingActionsRef.current.push(sanitizedAction);
  }, [collaborationManager]);

  const clearWhiteboard = useCallback(() => {
    const clearAction: DrawingAction = {
      id: `clear_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'clear',
      points: [],
      color: '#ffffff',
      strokeWidth: 0,
      timestamp: Date.now(),
      userId,
    };

    addAction(clearAction);
  }, [addAction, userId]);

  const getCollaborationStats = useCallback(() => {
    return {
      totalActions: whiteboardState.actions.length,
      activeCollaborators: collaborators.filter(c => c.isActive).length,
      totalCollaborators: collaborators.length,
      conflictCount,
      lastSyncTime,
      isConnected,
    };
  }, [whiteboardState.actions.length, collaborators, conflictCount, lastSyncTime, isConnected]);

  const exportState = useCallback(() => {
    return collaborationManager.createSnapshot();
  }, [collaborationManager]);

  const importState = useCallback((snapshot: { state: WhiteboardState; timestamp: number }) => {
    collaborationManager.restoreFromSnapshot(snapshot);
    setWhiteboardState(collaborationManager.getState());
  }, [collaborationManager]);

  return {
    whiteboardState,
    collaborators,
    isConnected,
    addAction,
    clearWhiteboard,
    getCollaborationStats,
    exportState,
    importState,
  };
}
