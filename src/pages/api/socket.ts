
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { DrawingAction, Collaborator, WhiteboardState } from '@/types/whiteboard';

// Extend the Server type to allow attaching io
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

type NextApiResponseWithSocketIO = NextApiResponse & {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

// In-memory storage for demo purposes
// In production, you'd use Redis or a database
const whiteboardStates = new Map<string, WhiteboardState>();
const activeUsers = new Map<string, Map<string, Collaborator>>();


export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
  const resWithIO = res as NextApiResponseWithSocketIO;
  if (resWithIO.socket?.server?.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Socket is initializing');
  const io = new SocketIOServer(resWithIO.socket.server as NetServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join', async ({ whiteboardId, user }: { whiteboardId: string; user: Collaborator }) => {
      try {
        // Join the room
        socket.join(whiteboardId);
        
        // Initialize whiteboard state if it doesn't exist
        if (!whiteboardStates.has(whiteboardId)) {
          whiteboardStates.set(whiteboardId, {
            id: whiteboardId,
            name: `Whiteboard ${whiteboardId}`,
            actions: [],
            lastModified: Date.now(),
            createdBy: user.id,
            collaborators: [],
          });
        }

        // Add user to active users
        if (!activeUsers.has(whiteboardId)) {
          activeUsers.set(whiteboardId, new Map());
        }
        
        const roomUsers = activeUsers.get(whiteboardId)!;
        roomUsers.set(user.id, { ...user, isActive: true, lastSeen: Date.now() });

        // Update whiteboard collaborators
        const whiteboard = whiteboardStates.get(whiteboardId)!;
        whiteboard.collaborators = Array.from(roomUsers.values());

        // Notify others in the room
        socket.to(whiteboardId).emit('user_join', user);
        
        // Send current state to the new user
        socket.emit('state_sync', whiteboard);
        
        // Send current active users
        socket.emit('active_users', Array.from(roomUsers.values()));

        console.log(`User ${user.name} joined whiteboard ${whiteboardId}`);
      } catch (error) {
        console.error('Error joining whiteboard:', error);
        socket.emit('error', 'Failed to join whiteboard');
      }
    });

    socket.on('action', (action: DrawingAction) => {
      try {
        const { whiteboardId } = socket.handshake.auth;
        if (!whiteboardId) {
          socket.emit('error', 'No whiteboard ID provided');
          return;
        }

        const whiteboard = whiteboardStates.get(whiteboardId);
        if (!whiteboard) {
          socket.emit('error', 'Whiteboard not found');
          return;
        }

        // Add action to whiteboard state
        whiteboard.actions.push(action);
        whiteboard.lastModified = Date.now();

        // Broadcast to other users in the room
        socket.to(whiteboardId).emit('action', action);

        console.log(`Action received from ${action.userId} in whiteboard ${whiteboardId}`);
      } catch (error) {
        console.error('Error processing action:', error);
        socket.emit('error', 'Failed to process action');
      }
    });

    socket.on('cursor_move', (cursor: { x: number; y: number }) => {
      try {
        const { whiteboardId, userId } = socket.handshake.auth;
        if (!whiteboardId || !userId) return;

        // Update user's cursor position
        const roomUsers = activeUsers.get(whiteboardId);
        if (roomUsers && roomUsers.has(userId)) {
          const user = roomUsers.get(userId)!;
          user.cursor = cursor;
          user.lastSeen = Date.now();
        }

        // Broadcast cursor movement to other users
        socket.to(whiteboardId).emit('cursor_move', { userId, cursor });
      } catch (error) {
        console.error('Error processing cursor movement:', error);
      }
    });

    socket.on('leave', ({ whiteboardId }: { whiteboardId: string }) => {
      try {
        const { userId } = socket.handshake.auth;
        if (!userId) return;

        // Remove user from active users
        const roomUsers = activeUsers.get(whiteboardId);
        if (roomUsers && roomUsers.has(userId)) {
          roomUsers.delete(userId);
          
          // Update whiteboard collaborators
          const whiteboard = whiteboardStates.get(whiteboardId);
          if (whiteboard) {
            whiteboard.collaborators = Array.from(roomUsers.values());
          }

          // Notify others in the room
          socket.to(whiteboardId).emit('user_leave', userId);
        }

        socket.leave(whiteboardId);
        console.log(`User ${userId} left whiteboard ${whiteboardId}`);
      } catch (error) {
        console.error('Error leaving whiteboard:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Clean up user from all rooms
      const { userId } = socket.handshake.auth;
      if (userId) {
  for (const [whiteboardId, roomUsers] of Array.from(activeUsers.entries())) {
          if (roomUsers.has(userId)) {
            roomUsers.delete(userId);
            
            const whiteboard = whiteboardStates.get(whiteboardId);
            if (whiteboard) {
              whiteboard.collaborators = Array.from(roomUsers.values());
            }

            socket.to(whiteboardId).emit('user_leave', userId);
          }
        }
      }
    });
  });

  resWithIO.socket.server.io = io;
  res.end();
}
