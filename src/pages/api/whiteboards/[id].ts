import { NextApiRequest, NextApiResponse } from 'next';
import { WhiteboardState } from '@/types/whiteboard';

// In-memory storage for demo purposes
// In production, you'd use a database like PostgreSQL, MongoDB, or Redis
const whiteboardStorage = new Map<string, WhiteboardState>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Whiteboard ID is required' });
  }

  switch (req.method) {
    case 'GET':
      return handleGetWhiteboard(req, res, id);
    case 'PUT':
      return handleUpdateWhiteboard(req, res, id);
    case 'DELETE':
      return handleDeleteWhiteboard(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGetWhiteboard(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const whiteboard = whiteboardStorage.get(id);
    
    if (!whiteboard) {
      return res.status(404).json({ error: 'Whiteboard not found' });
    }

    return res.status(200).json(whiteboard);
  } catch (error) {
    console.error('Error fetching whiteboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleUpdateWhiteboard(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const updates = req.body;
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const existingWhiteboard = whiteboardStorage.get(id);
    
    if (!existingWhiteboard) {
      return res.status(404).json({ error: 'Whiteboard not found' });
    }

    // Validate the updates
    const updatedWhiteboard: WhiteboardState = {
      ...existingWhiteboard,
      ...updates,
      id, // Ensure ID cannot be changed
      lastModified: Date.now(),
    };

    // Validate required fields
    if (!updatedWhiteboard.name || !updatedWhiteboard.actions || !updatedWhiteboard.createdBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    whiteboardStorage.set(id, updatedWhiteboard);

    return res.status(200).json(updatedWhiteboard);
  } catch (error) {
    console.error('Error updating whiteboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDeleteWhiteboard(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const whiteboard = whiteboardStorage.get(id);
    
    if (!whiteboard) {
      return res.status(404).json({ error: 'Whiteboard not found' });
    }

    whiteboardStorage.delete(id);

    return res.status(200).json({ message: 'Whiteboard deleted successfully' });
  } catch (error) {
    console.error('Error deleting whiteboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
