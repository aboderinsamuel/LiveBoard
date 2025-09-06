import { NextApiRequest, NextApiResponse } from 'next';
import { DrawingAction, WhiteboardState } from '@/types/whiteboard';

// In-memory storage for demo purposes
const whiteboardStorage = new Map<string, WhiteboardState>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Whiteboard ID is required' });
  }

  switch (req.method) {
    case 'GET':
      return handleGetActions(req, res, id);
    case 'POST':
      return handleAddAction(req, res, id);
    case 'DELETE':
      return handleClearActions(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGetActions(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const whiteboard = whiteboardStorage.get(id);
    
    if (!whiteboard) {
      return res.status(404).json({ error: 'Whiteboard not found' });
    }

    const { limit, offset, since } = req.query;
    
    let actions = whiteboard.actions;
    
    // Filter actions since a specific timestamp
    if (since && typeof since === 'string') {
      const sinceTimestamp = parseInt(since, 10);
      if (!isNaN(sinceTimestamp)) {
        actions = actions.filter(action => action.timestamp > sinceTimestamp);
      }
    }
    
    // Apply pagination if specified
    if (limit && offset) {
      const limitNum = parseInt(limit as string, 10);
      const offsetNum = parseInt(offset as string, 10);
      
      if (!isNaN(limitNum) && !isNaN(offsetNum)) {
        actions = actions.slice(offsetNum, offsetNum + limitNum);
      }
    }

    return res.status(200).json({
      actions,
      total: whiteboard.actions.length,
      lastModified: whiteboard.lastModified,
    });
  } catch (error) {
    console.error('Error fetching actions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleAddAction(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const action: DrawingAction = req.body;
    
    if (!action || typeof action !== 'object') {
      return res.status(400).json({ error: 'Invalid action data' });
    }

    // Validate required fields
    if (!action.id || !action.type || !action.userId || !action.timestamp) {
      return res.status(400).json({ error: 'Missing required action fields' });
    }

    // Validate action type
    if (!['draw', 'erase', 'clear'].includes(action.type)) {
      return res.status(400).json({ error: 'Invalid action type' });
    }

    const whiteboard = whiteboardStorage.get(id);
    
    if (!whiteboard) {
      return res.status(404).json({ error: 'Whiteboard not found' });
    }

    // Add action to whiteboard
    whiteboard.actions.push(action);
    whiteboard.lastModified = Date.now();

    return res.status(201).json({
      action,
      totalActions: whiteboard.actions.length,
      lastModified: whiteboard.lastModified,
    });
  } catch (error) {
    console.error('Error adding action:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleClearActions(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const whiteboard = whiteboardStorage.get(id);
    
    if (!whiteboard) {
      return res.status(404).json({ error: 'Whiteboard not found' });
    }

    // Create a clear action
    const clearAction: DrawingAction = {
      id: `clear_${Date.now()}`,
      type: 'clear',
      points: [],
      color: '#ffffff',
      strokeWidth: 0,
      timestamp: Date.now(),
      userId,
    };

    // Clear all actions and add the clear action
    whiteboard.actions = [clearAction];
    whiteboard.lastModified = Date.now();

    return res.status(200).json({
      message: 'Whiteboard cleared successfully',
      clearAction,
      lastModified: whiteboard.lastModified,
    });
  } catch (error) {
    console.error('Error clearing actions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
