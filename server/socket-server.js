const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const {
  metricsMiddleware,
  metricsEndpoint,
  updateSystemMetrics,
  updateSocketMetrics,
  recordSocketMessage
} = require('./metrics');

const app = express();
const server = http.createServer(app);

// Enable CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:4173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

// Metrics endpoint
app.get('/metrics', metricsEndpoint);

// Store connected users and rooms
const connectedUsers = new Map();
const rooms = new Map();

// System metrics simulation
let systemMetrics = {
  cpu: 0,
  memory: 0,
  uptime: 0,
  activeConnections: 0,
  requestsPerSecond: 0
};

// Update system metrics every 5 seconds
setInterval(() => {
  updateSystemMetrics();
  updateSocketMetrics(connectedUsers, rooms);
  
  systemMetrics = {
    cpu: Math.random() * 100,
    memory: 30 + Math.random() * 50,
    uptime: process.uptime(),
    activeConnections: connectedUsers.size,
    requestsPerSecond: Math.random() * 10
  };
}, 5000);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Add user to connected users
  connectedUsers.set(socket.id, {
    id: socket.id,
    name: `User-${socket.id.slice(0, 6)}`,
    isOnline: true,
    lastSeen: Date.now()
  });

  // Update active connections
  systemMetrics.activeConnections = connectedUsers.size;

  // Send initial system metrics
  socket.emit('metrics', systemMetrics);

  // Send online users list
  const onlineUsers = Array.from(connectedUsers.values());
  io.emit('online_users', onlineUsers);

  // Handle user joining a room
  socket.on('join_room', (data) => {
    recordSocketMessage('join_room', 'incoming');
    
    const { roomId } = data;
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
    
    console.log(`User ${socket.id} joined room: ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user_joined', {
      id: socket.id,
      name: connectedUsers.get(socket.id)?.name || 'Anonymous',
      isOnline: true
    });
    
    recordSocketMessage('user_joined', 'outgoing');
  });

  // Handle user leaving a room
  socket.on('leave_room', (data) => {
    recordSocketMessage('leave_room', 'incoming');
    
    const { roomId } = data;
    socket.leave(roomId);
    
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      }
    }
    
    console.log(`User ${socket.id} left room: ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user_left', socket.id);
  });

  // Handle messages
  socket.on('message', (message) => {
    console.log(`Message from ${socket.id}:`, message);
    
    // Broadcast message to all users in the same room
    if (message.data?.roomId) {
      socket.to(message.data.roomId).emit('message', {
        ...message,
        data: {
          ...message.data,
          userId: socket.id,
          userName: connectedUsers.get(socket.id)?.name || 'Anonymous'
        }
      });
    } else {
      // Broadcast to all connected users
      socket.broadcast.emit('message', {
        ...message,
        data: {
          ...message.data,
          userId: socket.id,
          userName: connectedUsers.get(socket.id)?.name || 'Anonymous'
        }
      });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { roomId } = data;
    if (roomId) {
      socket.to(roomId).emit('typing', {
        userId: socket.id,
        isTyping: data.isTyping
      });
    }
  });

  // Handle ping/pong for latency measurement
  socket.on('ping', () => {
    socket.emit('pong');
  });

  // Handle metrics request
  socket.on('get_metrics', () => {
    socket.emit('metrics', systemMetrics);
  });

  // Handle online users request
  socket.on('get_online_users', () => {
    const onlineUsers = Array.from(connectedUsers.values());
    socket.emit('online_users', onlineUsers);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    recordSocketMessage('disconnect', 'incoming');
    
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
    
    // Update user status
    const user = connectedUsers.get(socket.id);
    if (user) {
      user.isOnline = false;
      user.lastSeen = Date.now();
    }
    
    // Remove from connected users
    connectedUsers.delete(socket.id);
    
    // Update active connections
    systemMetrics.activeConnections = connectedUsers.size;
    
    // Notify other users
    const onlineUsers = Array.from(connectedUsers.values());
    io.emit('online_users', onlineUsers);
    
    // Notify all rooms that user was in
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        socket.to(roomId).emit('user_left', socket.id);
      }
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connections: connectedUsers.size,
    rooms: rooms.size,
    metrics: systemMetrics
  });
});

// API endpoint to send system notifications
app.post('/api/notify', (req, res) => {
  const { type, message, roomId } = req.body;
  
  if (!type || !message) {
    return res.status(400).json({ error: 'Type and message are required' });
  }
  
  const notification = {
    id: Date.now().toString(),
    type,
    message,
    timestamp: Date.now(),
    data: { source: 'api', roomId }
  };
  
  if (roomId) {
    io.to(roomId).emit('message', notification);
  } else {
    io.emit('message', notification);
  }
  
  res.json({ success: true, notification });
});

// API endpoint to get system status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    connections: connectedUsers.size,
    rooms: rooms.size,
    metrics: systemMetrics,
    users: Array.from(connectedUsers.values())
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Status API: http://localhost:${PORT}/api/status`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
