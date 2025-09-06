const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Store whiteboard states
const whiteboardStates = new Map();
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", ({ whiteboardId, user }) => {
    console.log(`User ${user.name} joined whiteboard ${whiteboardId}`);

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

    const roomUsers = activeUsers.get(whiteboardId);
    roomUsers.set(user.id, { ...user, isActive: true, lastSeen: Date.now() });

    // Update whiteboard collaborators
    const whiteboard = whiteboardStates.get(whiteboardId);
    whiteboard.collaborators = Array.from(roomUsers.values());

    // Notify others in the room
    socket.to(whiteboardId).emit("user_join", user);

    // Send current state to the new user
    socket.emit("state_sync", whiteboard);

    // Send current active users
    socket.emit("active_users", Array.from(roomUsers.values()));
  });

  socket.on("action", (action) => {
    const { whiteboardId } = socket.handshake.auth;
    if (!whiteboardId) {
      socket.emit("error", "No whiteboard ID provided");
      return;
    }

    const whiteboard = whiteboardStates.get(whiteboardId);
    if (!whiteboard) {
      socket.emit("error", "Whiteboard not found");
      return;
    }

    // Add action to whiteboard state
    whiteboard.actions.push(action);
    whiteboard.lastModified = Date.now();

    // Broadcast to other users in the room
    socket.to(whiteboardId).emit("action", action);

    console.log(
      `Action received from ${action.userId} in whiteboard ${whiteboardId}`
    );
  });

  socket.on("cursor_move", (cursor) => {
    const { whiteboardId, userId } = socket.handshake.auth;
    if (!whiteboardId || !userId) return;

    // Update user's cursor position
    const roomUsers = activeUsers.get(whiteboardId);
    if (roomUsers && roomUsers.has(userId)) {
      const user = roomUsers.get(userId);
      user.cursor = cursor;
      user.lastSeen = Date.now();
    }

    // Broadcast cursor movement to other users
    socket.to(whiteboardId).emit("cursor_move", {
      userId,
      cursor,
    });
  });

  socket.on("leave", ({ whiteboardId }) => {
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
      socket.to(whiteboardId).emit("user_leave", userId);
    }

    socket.leave(whiteboardId);
    console.log(`User ${userId} left whiteboard ${whiteboardId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Clean up user from all rooms
    const { userId } = socket.handshake.auth;
    if (userId) {
      for (const [whiteboardId, roomUsers] of activeUsers.entries()) {
        if (roomUsers.has(userId)) {
          roomUsers.delete(userId);

          const whiteboard = whiteboardStates.get(whiteboardId);
          if (whiteboard) {
            whiteboard.collaborators = Array.from(roomUsers.values());
          }

          socket.to(whiteboardId).emit("user_leave", userId);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
