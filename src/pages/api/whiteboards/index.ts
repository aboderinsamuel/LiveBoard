import { NextApiRequest, NextApiResponse } from 'next';
import { WhiteboardState } from '@/types/whiteboard';
import { generateId } from '@/lib/utils';

// In-memory storage for demo purposes
const whiteboardStorage = new Map<string, WhiteboardState>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGetWhiteboards(req, res);
    case 'POST':
      return handleCreateWhiteboard(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGetWhiteboards(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { limit = '10', offset = '0', createdBy } = req.query;
    
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    
    if (isNaN(limitNum) || isNaN(offsetNum) || limitNum < 1 || offsetNum < 0) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    let whiteboards = Array.from(whiteboardStorage.values());
    
    // Filter by creator if specified
    if (createdBy && typeof createdBy === 'string') {
      whiteboards = whiteboards.filter(wb => wb.createdBy === createdBy);
    }
    
    // Sort by last modified (most recent first)
    whiteboards.sort((a, b) => b.lastModified - a.lastModified);
    
    // Apply pagination
    const paginatedWhiteboards = whiteboards.slice(offsetNum, offsetNum + limitNum);
    
    return res.status(200).json({
      whiteboards: paginatedWhiteboards,
      pagination: {
        total: whiteboards.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < whiteboards.length,
      },
    });
  } catch (error) {
    console.error('Error fetching whiteboards:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleCreateWhiteboard(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, createdBy } = req.body;
    
    if (!name || !createdBy) {
      return res.status(400).json({ error: 'Name and createdBy are required' });
    }
    
    if (typeof name !== 'string' || typeof createdBy !== 'string') {
      return res.status(400).json({ error: 'Invalid data types' });
    }
    
    if (name.trim().length === 0) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    const id = generateId();
    const now = Date.now();
    
    const newWhiteboard: WhiteboardState = {
      id,
      name: name.trim(),
      actions: [],
      lastModified: now,
      createdBy,
      collaborators: [],
    };

    whiteboardStorage.set(id, newWhiteboard);

    return res.status(201).json(newWhiteboard);
  } catch (error) {
    console.error('Error creating whiteboard:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
