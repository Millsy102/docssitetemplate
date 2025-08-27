# Socket.IO Real-time Features Implementation

This document describes the implementation of Socket.IO real-time features for the BeamFlow documentation site.

## Overview

The implementation provides real-time communication capabilities including:
- Live notifications and alerts
- Real-time chat with typing indicators
- System status monitoring
- User presence and online status
- Room-based messaging

## Architecture

### Frontend Components

#### 1. SocketContext (`src/contexts/SocketContext.tsx`)
- Manages Socket.IO connection lifecycle
- Provides connection state and methods
- Handles automatic reconnection
- Exports `useSocket` hook for components

#### 2. useRealtime Hook (`src/hooks/useRealtime.ts`)
- Higher-level abstraction for real-time features
- Manages messages, users, and typing indicators
- Provides room management functionality
- Handles reconnection logic

#### 3. RealtimeNotifications (`src/components/RealtimeNotifications.tsx`)
- Displays live notifications with auto-dismiss
- Shows connection status indicator
- Supports different notification types (info, success, warning, error)
- Positioned in top-right corner by default

#### 4. RealtimeChat (`src/components/RealtimeChat.tsx`)
- Full-featured chat interface
- Room-based messaging
- Typing indicators
- Online user sidebar
- Message history with timestamps

#### 5. RealtimeStatus (`src/components/RealtimeStatus.tsx`)
- System metrics monitoring
- Connection information (latency, protocol, transport)
- Real-time performance indicators
- Health status visualization

### Backend Server

#### Socket.IO Server (`server/socket-server.js`)
- Express.js server with Socket.IO integration
- Handles user connections and room management
- Provides system metrics simulation
- REST API endpoints for external notifications
- Health check and status endpoints

## Installation and Setup

### 1. Frontend Dependencies

The Socket.IO client is already installed:
```bash
npm install socket.io-client --legacy-peer-deps
```

### 2. Backend Server Setup

Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

### 3. Start the Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on port 3001 by default.

### 4. Start the Frontend

```bash
# In the root directory
npm run dev
```

The frontend will start on port 3000 and automatically proxy WebSocket connections to the backend.

## Usage

### Basic Integration

The Socket.IO provider is already integrated into the main App component:

```tsx
import { SocketProvider } from './contexts/SocketContext';
import { RealtimeNotifications } from './components/RealtimeNotifications';

function App() {
  return (
    <SocketProvider>
      {/* Your app content */}
      <RealtimeNotifications />
    </SocketProvider>
  );
}
```

### Using the useSocket Hook

```tsx
import { useSocket } from './contexts/SocketContext';

function MyComponent() {
  const { socket, isConnected, emit, on, off } = useSocket();

  useEffect(() => {
    if (socket) {
      // Listen for custom events
      on('custom_event', (data) => {
        console.log('Received:', data);
      });

      // Send events
      emit('custom_event', { message: 'Hello!' });
    }

    return () => {
      off('custom_event');
    };
  }, [socket, on, off, emit]);

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

### Using the useRealtime Hook

```tsx
import { useRealtime } from './hooks/useRealtime';

function ChatComponent() {
  const { 
    messages, 
    sendMessage, 
    onlineUsers, 
    joinRoom, 
    leaveRoom 
  } = useRealtime();

  useEffect(() => {
    joinRoom('my-room');
    return () => leaveRoom('my-room');
  }, [joinRoom, leaveRoom]);

  const handleSend = () => {
    sendMessage({
      type: 'info',
      message: 'Hello, world!',
      data: { roomId: 'my-room' }
    });
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.message}</div>
      ))}
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

### Demo Page

Visit `/realtime-demo` to see all features in action:
- Real-time chat with room management
- System status monitoring
- Notification testing
- Connection status display

## API Endpoints

### Health Check
```
GET /health
```
Returns server health status and basic metrics.

### System Status
```
GET /api/status
```
Returns detailed system status including connected users and metrics.

### Send Notification
```
POST /api/notify
Content-Type: application/json

{
  "type": "info|success|warning|error",
  "message": "Notification message",
  "roomId": "optional-room-id"
}
```

## Socket.IO Events

### Client to Server
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `message` - Send a message
- `typing` - Send typing indicator
- `ping` - Measure latency
- `get_metrics` - Request system metrics
- `get_online_users` - Request online users list

### Server to Client
- `message` - Receive a message
- `user_joined` - User joined the room
- `user_left` - User left the room
- `typing` - Typing indicator from another user
- `pong` - Latency measurement response
- `metrics` - System metrics update
- `online_users` - Online users list update

## Configuration

### Environment Variables

The Socket.IO server can be configured with these environment variables:
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode

### Vite Configuration

The Vite config already includes WebSocket proxy settings:
```javascript
proxy: {
  '/socket.io': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true,
  }
}
```

## Styling

All components use the red and black theme consistent with the documentation site:
- Primary color: Red (`#ef4444`)
- Background: Dark gray (`#111827`)
- Text: White and light gray
- Borders: Gray (`#374151`)

## Error Handling

The implementation includes comprehensive error handling:
- Automatic reconnection with exponential backoff
- Connection state management
- Fallback to polling if WebSocket fails
- Graceful degradation when server is unavailable

## Performance Considerations

- Messages are limited to prevent memory leaks
- Automatic cleanup of event listeners
- Efficient room management
- Optimized reconnection logic
- Minimal bundle size impact

## Security

- CORS configuration for development
- Input validation on server
- Rate limiting considerations
- Secure WebSocket connections in production

## Troubleshooting

### Connection Issues
1. Ensure the backend server is running on port 3001
2. Check browser console for connection errors
3. Verify CORS settings match your frontend URL
4. Check firewall settings

### Message Not Received
1. Verify room ID matches between sender and receiver
2. Check event names are consistent
3. Ensure proper cleanup of event listeners
4. Check server logs for errors

### Performance Issues
1. Monitor message frequency
2. Check for memory leaks in event listeners
3. Verify reconnection settings
4. Monitor system metrics

## Future Enhancements

- Message persistence and history
- File sharing capabilities
- Voice and video integration
- Advanced user authentication
- Message encryption
- Analytics and monitoring
- Mobile push notifications

## Contributing

When adding new real-time features:
1. Follow the existing component patterns
2. Use TypeScript for type safety
3. Maintain the red and black theme
4. Add proper error handling
5. Include documentation
6. Test with multiple concurrent users
