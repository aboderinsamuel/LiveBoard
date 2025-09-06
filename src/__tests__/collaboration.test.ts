import { CollaborationManager, validateAction, sanitizeAction } from '@/lib/collaboration';
import { DrawingAction, WhiteboardState } from '@/types/whiteboard';

describe('CollaborationManager', () => {
  let collaborationManager: CollaborationManager;
  let initialState: WhiteboardState;

  beforeEach(() => {
    initialState = {
      id: 'test-whiteboard',
      name: 'Test Whiteboard',
      actions: [],
      lastModified: Date.now(),
      createdBy: 'user1',
      collaborators: [],
    };
    collaborationManager = new CollaborationManager(initialState);
  });

  describe('addAction', () => {
    it('should add a simple action without conflicts', () => {
      const action: DrawingAction = {
        id: 'action1',
        type: 'draw',
        points: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
        color: '#000000',
        strokeWidth: 2,
        timestamp: Date.now(),
        userId: 'user1',
      };

      const result = collaborationManager.addAction(action);

      expect(result.success).toBe(true);
      expect(result.conflict).toBe(false);
      
      const state = collaborationManager.getState();
      expect(state.actions).toHaveLength(1);
      expect(state.actions[0]).toEqual(action);
    });

    it('should handle conflicts and resolve them', () => {
      const action1: DrawingAction = {
        id: 'action1',
        type: 'draw',
        points: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
        color: '#000000',
        strokeWidth: 2,
        timestamp: Date.now(),
        userId: 'user1',
      };

      const action2: DrawingAction = {
        id: 'action2',
        type: 'draw',
        points: [{ x: 15, y: 15 }, { x: 25, y: 25 }],
        color: '#ff0000',
        strokeWidth: 3,
        timestamp: Date.now() + 1000,
        userId: 'user2',
      };

      // Add first action
      collaborationManager.addAction(action1);
      
      // Add conflicting action
      const result = collaborationManager.addAction(action2);

      expect(result.success).toBe(true);
      expect(result.conflict).toBe(true);
      
      const state = collaborationManager.getState();
      expect(state.actions).toHaveLength(2);
    });

    it('should handle clear actions correctly', () => {
      const drawAction: DrawingAction = {
        id: 'draw1',
        type: 'draw',
        points: [{ x: 10, y: 10 }],
        color: '#000000',
        strokeWidth: 2,
        timestamp: Date.now(),
        userId: 'user1',
      };

      const clearAction: DrawingAction = {
        id: 'clear1',
        type: 'clear',
        points: [],
        color: '#ffffff',
        strokeWidth: 0,
        timestamp: Date.now() + 1000,
        userId: 'user1',
      };

      collaborationManager.addAction(drawAction);
      collaborationManager.addAction(clearAction);

      const state = collaborationManager.getState();
      expect(state.actions).toHaveLength(2);
    });
  });

  describe('optimizeActions', () => {
    it('should remove actions before the latest clear action', () => {
      const action1: DrawingAction = {
        id: 'action1',
        type: 'draw',
        points: [{ x: 10, y: 10 }],
        color: '#000000',
        strokeWidth: 2,
        timestamp: 1000,
        userId: 'user1',
      };

      const clearAction: DrawingAction = {
        id: 'clear1',
        type: 'clear',
        points: [],
        color: '#ffffff',
        strokeWidth: 0,
        timestamp: 2000,
        userId: 'user1',
      };

      const action2: DrawingAction = {
        id: 'action2',
        type: 'draw',
        points: [{ x: 20, y: 20 }],
        color: '#000000',
        strokeWidth: 2,
        timestamp: 3000,
        userId: 'user1',
      };

      collaborationManager.addAction(action1);
      collaborationManager.addAction(clearAction);
      collaborationManager.addAction(action2);

      collaborationManager.optimizeActions();

      const state = collaborationManager.getState();
      expect(state.actions).toHaveLength(2);
      expect(state.actions[0]).toEqual(clearAction);
      expect(state.actions[1]).toEqual(action2);
    });
  });

  describe('mergeActions', () => {
    it('should merge actions from multiple sources', () => {
      const action1: DrawingAction = {
        id: 'action1',
        type: 'draw',
        points: [{ x: 10, y: 10 }],
        color: '#000000',
        strokeWidth: 2,
        timestamp: 1000,
        userId: 'user1',
      };

      const action2: DrawingAction = {
        id: 'action2',
        type: 'draw',
        points: [{ x: 20, y: 20 }],
        color: '#ff0000',
        strokeWidth: 3,
        timestamp: 2000,
        userId: 'user2',
      };

      collaborationManager.addAction(action1);
      collaborationManager.mergeActions([action2]);

      const state = collaborationManager.getState();
      expect(state.actions).toHaveLength(2);
      expect(state.actions[0]).toEqual(action1);
      expect(state.actions[1]).toEqual(action2);
    });

    it('should remove duplicate actions', () => {
      const action: DrawingAction = {
        id: 'action1',
        type: 'draw',
        points: [{ x: 10, y: 10 }],
        color: '#000000',
        strokeWidth: 2,
        timestamp: 1000,
        userId: 'user1',
      };

      collaborationManager.addAction(action);
      collaborationManager.mergeActions([action]);

      const state = collaborationManager.getState();
      expect(state.actions).toHaveLength(1);
    });
  });
});

describe('validateAction', () => {
  it('should validate correct actions', () => {
    const validAction: DrawingAction = {
      id: 'action1',
      type: 'draw',
      points: [{ x: 10, y: 10 }],
      color: '#000000',
      strokeWidth: 2,
      timestamp: Date.now(),
      userId: 'user1',
    };

    expect(validateAction(validAction)).toBe(true);
  });

  it('should reject invalid actions', () => {
    expect(validateAction(null)).toBe(false);
    expect(validateAction(undefined)).toBe(false);
    expect(validateAction({})).toBe(false);
    expect(validateAction({ id: 'test' })).toBe(false);
    expect(validateAction({ id: 'test', type: 'invalid' })).toBe(false);
  });
});

describe('sanitizeAction', () => {
  it('should sanitize action coordinates', () => {
    const action: DrawingAction = {
      id: 'action1',
      type: 'draw',
      points: [{ x: -10, y: 15000 }, { x: 5, y: 5 }],
      color: '#000000',
      strokeWidth: 100,
      timestamp: Date.now(),
      userId: 'user1',
    };

    const sanitized = sanitizeAction(action);

    expect(sanitized.points[0].x).toBe(0); // Clamped to 0
    expect(sanitized.points[0].y).toBe(10000); // Clamped to 10000
    expect(sanitized.points[1].x).toBe(5); // Unchanged
    expect(sanitized.points[1].y).toBe(5); // Unchanged
    expect(sanitized.strokeWidth).toBe(50); // Clamped to 50
  });
});
