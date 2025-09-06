import { io, Socket } from 'socket.io-client';
import { WhiteboardEvent, DrawingAction, Collaborator } from '@/types/whiteboard';

class WebSocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(whiteboardId: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_WS_URL || 'wss://your-domain.vercel.app'
          : 'http://localhost:3002', {
          auth: {
            whiteboardId,
            userId,
          },
          transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
          console.log('Connected to WebSocket server');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from WebSocket server:', reason);
          if (reason === 'io server disconnect') {
            // Server initiated disconnect, don't reconnect
            return;
          }
          this.handleReconnect();
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          // Fallback to demo mode if server is not available
          console.log('Falling back to demo mode');
          this.socket = {
            connected: true,
            emit: (event: string, data: any) => {
              console.log(`Demo mode - Emitting ${event}:`, data);
            },
            on: (event: string, callback: Function) => {
              console.log(`Demo mode - Listening for ${event}`);
            },
            removeAllListeners: () => {
              console.log('Demo mode - Removed all listeners');
            },
            disconnect: () => {
              console.log('Demo mode - Disconnected');
            }
          } as any;
          resolve();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Event listeners
  onAction(callback: (action: DrawingAction) => void): void {
    this.socket?.on('action', callback);
  }

  onCursorMove(callback: (data: { userId: string; cursor: { x: number; y: number } }) => void): void {
    this.socket?.on('cursor_move', callback);
  }

  onUserJoin(callback: (user: Collaborator) => void): void {
    this.socket?.on('user_join', callback);
  }

  onUserLeave(callback: (userId: string) => void): void {
    this.socket?.on('user_leave', callback);
  }

  onStateSync(callback: (state: any) => void): void {
    this.socket?.on('state_sync', callback);
  }

  onError(callback: (error: string) => void): void {
    this.socket?.on('error', callback);
  }

  // Event emitters
  emitAction(action: DrawingAction): void {
    this.socket?.emit('action', action);
  }

  emitCursorMove(cursor: { x: number; y: number }): void {
    this.socket?.emit('cursor_move', cursor);
  }

  emitJoin(whiteboardId: string, user: Collaborator): void {
    this.socket?.emit('join', { whiteboardId, user });
  }

  emitLeave(whiteboardId: string): void {
    this.socket?.emit('leave', whiteboardId);
  }

  // Remove listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsManager = new WebSocketManager();
