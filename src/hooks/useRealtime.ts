import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';

export interface RealtimeMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message';
  message: string;
  userId?: string;
  timestamp: number;
  roomId?: string;
}

export interface RealtimeUser {
  id: string;
  name: string;
  isOnline: boolean;
  lastSeen?: number;
  avatar?: string;
}

interface UseRealtimeOptions {
  autoConnect?: boolean;
  reconnectOnError?: boolean;
  maxReconnectAttempts?: number;
}

export const useRealtime = (options: UseRealtimeOptions = {}) => {
  const {
    autoConnect = true,
    reconnectOnError = true,
    maxReconnectAttempts = 5
  } = options;

  const { socket, isConnected, connect, disconnect, emit, on, off } = useSocket();
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<RealtimeUser[]>([]);
  const [isTyping, setIsTyping] = useState<{ [userId: string]: boolean }>({});
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && !isConnected) {
      connect();
    }
  }, [autoConnect, isConnected, connect]);

  // Handle reconnection on error
  useEffect(() => {
    if (reconnectOnError && !isConnected && reconnectAttempts < maxReconnectAttempts) {
      const timeout = setTimeout(() => {
        setReconnectAttempts(prev => prev + 1);
        connect();
      }, Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)); // Exponential backoff with max 30s

      reconnectTimeoutRef.current = timeout;
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isConnected, reconnectAttempts, maxReconnectAttempts, reconnectOnError, connect]);

  // Reset reconnect attempts when connected
  useEffect(() => {
    if (isConnected) {
      setReconnectAttempts(0);
    }
  }, [isConnected]);

  // Send a message
  const sendMessage = useCallback((message: Omit<RealtimeMessage, 'id' | 'timestamp'>) => {
    const fullMessage: RealtimeMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    emit('message', fullMessage);
    return fullMessage;
  }, [emit]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    emit('typing', { isTyping });
  }, [emit]);

  // Join a room/channel
  const joinRoom = useCallback((roomId: string) => {
    emit('join_room', { roomId });
  }, [emit]);

  // Leave a room/channel
  const leaveRoom = useCallback((roomId: string) => {
    emit('leave_room', { roomId });
  }, [emit]);

  // Get online users
  const getOnlineUsers = useCallback(() => {
    emit('get_online_users');
  }, [emit]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message: RealtimeMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleUserJoined = (user: RealtimeUser) => {
      setOnlineUsers(prev => {
        const existing = prev.find(u => u.id === user.id);
        if (existing) {
          return prev.map(u => u.id === user.id ? { ...u, isOnline: true } : u);
        }
        return [...prev, user];
      });
    };

    const handleUserLeft = (userId: string) => {
      setOnlineUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isOnline: false, lastSeen: Date.now() }
            : user
        )
      );
    };

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      setIsTyping(prev => ({
        ...prev,
        [data.userId]: data.isTyping
      }));
    };

    const handleOnlineUsers = (users: RealtimeUser[]) => {
      setOnlineUsers(users);
    };

    // Set up event listeners
    on('message', handleMessage);
    on('user_joined', handleUserJoined);
    on('user_left', handleUserLeft);
    on('typing', handleTyping);
    on('online_users', handleOnlineUsers);

    // Cleanup event listeners
    return () => {
      off('message');
      off('user_joined');
      off('user_left');
      off('typing');
      off('online_users');
    };
  }, [socket, on, off]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    messages,
    onlineUsers,
    isTyping,
    isConnected,
    reconnectAttempts,
    
    // Actions
    sendMessage,
    sendTypingIndicator,
    joinRoom,
    leaveRoom,
    getOnlineUsers,
    connect,
    disconnect,
    
    // Utilities
    clearMessages: () => setMessages([]),
    clearOnlineUsers: () => setOnlineUsers([]),
  };
};
