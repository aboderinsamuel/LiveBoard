import { NextApiRequest, NextApiResponse } from 'next';
import { AppError } from '@/lib/errorHandler';

// In-memory error storage for demo purposes
// In production, you'd use a proper logging service like Sentry, LogRocket, or a database
const errorStorage: AppError[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const error: AppError = req.body;

    // Validate error data
    if (!error || typeof error !== 'object') {
      return res.status(400).json({ error: 'Invalid error data' });
    }

    if (!error.type || !error.message || !error.timestamp) {
      return res.status(400).json({ error: 'Missing required error fields' });
    }

    // Sanitize and store the error
    const sanitizedError: AppError = {
      type: error.type,
      message: error.message,
      code: error.code,
      details: error.details,
      timestamp: error.timestamp,
      userId: error.userId,
      whiteboardId: error.whiteboardId,
    };

    errorStorage.push(sanitizedError);

    // In production, you would:
    // 1. Send to error tracking service (Sentry, LogRocket, etc.)
    // 2. Store in database
    // 3. Send alerts for critical errors
    // 4. Aggregate error metrics

    console.log('Error reported:', sanitizedError);

    return res.status(200).json({ 
      message: 'Error reported successfully',
      errorId: `error_${sanitizedError.timestamp}_${Math.random().toString(36).substr(2, 9)}`
    });

  } catch (error) {
    console.error('Error handling error report:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Optional: Add a GET endpoint to retrieve errors (for admin/debugging purposes)
export async function getErrors(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '50', type, userId, whiteboardId } = req.query;

    let filteredErrors = [...errorStorage];

    // Filter by type
    if (type && typeof type === 'string') {
      filteredErrors = filteredErrors.filter(error => error.type === type);
    }

    // Filter by userId
    if (userId && typeof userId === 'string') {
      filteredErrors = filteredErrors.filter(error => error.userId === userId);
    }

    // Filter by whiteboardId
    if (whiteboardId && typeof whiteboardId === 'string') {
      filteredErrors = filteredErrors.filter(error => error.whiteboardId === whiteboardId);
    }

    // Sort by timestamp (most recent first)
    filteredErrors.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    const limitNum = parseInt(limit as string, 10);
    if (!isNaN(limitNum) && limitNum > 0) {
      filteredErrors = filteredErrors.slice(0, limitNum);
    }

    return res.status(200).json({
      errors: filteredErrors,
      total: errorStorage.length,
      filtered: filteredErrors.length,
    });

  } catch (error) {
    console.error('Error retrieving errors:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
