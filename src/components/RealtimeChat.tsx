import React, { useState, useEffect, useRef } from 'react';
import { useRealtime } from '../hooks/useRealtime';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
  isOwn?: boolean;
}

interface RealtimeChatProps {
  roomId?: string;
  userName?: string;
  maxMessages?: number;
  showOnlineUsers?: boolean;
  className?: string;
}

export const RealtimeChat: React.FC<RealtimeChatProps> = ({
  roomId = 'default',
  userName = 'Anonymous',
  maxMessages = 100,
  showOnlineUsers = true,
  className = ''
}) => {
  const { 
    messages, 
    sendMessage, 
    onlineUsers, 
    isTyping, 
    sendTypingIndicator, 
    joinRoom, 
    leaveRoom, 
    isConnected 
  } = useRealtime();
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Join room on mount
  useEffect(() => {
    if (isConnected) {
      joinRoom(roomId);
    }
  }, [isConnected, roomId, joinRoom]);

  // Leave room on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        leaveRoom(roomId);
      }
    };
  }, [isConnected, roomId, leaveRoom]);

  // Convert real-time messages to chat messages
  useEffect(() => {
    const newChatMessages = messages
      .filter(msg => msg.data?.roomId === roomId || !roomId)
      .map(msg => ({
        id: msg.id,
        userId: msg.data?.userId || 'system',
        userName: msg.data?.userName || 'System',
        message: msg.message,
        timestamp: msg.timestamp,
        isOwn: msg.data?.userId === 'current-user' // This would be set by the server
      }))
      .slice(-maxMessages);

    setChatMessages(newChatMessages);
  }, [messages, roomId, maxMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    
    // Send typing indicator
    if (!isTypingLocal) {
      setIsTypingLocal(true);
      sendTypingIndicator(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      sendTypingIndicator(false);
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !isConnected) return;

    sendMessage({
      type: 'info',
      message: inputMessage,
      data: {
        roomId,
        userId: 'current-user',
        userName,
        messageType: 'chat'
      }
    });

    setInputMessage('');
    setIsTypingLocal(false);
    sendTypingIndicator(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTypingUsers = (): string[] => {
    return Object.entries(isTyping)
      .filter(([userId, typing]) => typing && userId !== 'current-user')
      .map(([userId]) => {
        const user = onlineUsers.find(u => u.id === userId);
        return user?.name || 'Someone';
      });
  };

  return (
    <div className={`flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <h3 className="text-white font-semibold">Real-time Chat</h3>
          {roomId !== 'default' && (
            <span className="text-xs text-gray-400">#{roomId}</span>
          )}
        </div>
        
        {showOnlineUsers && (
          <div className="text-xs text-gray-400">
            {onlineUsers.length} online
          </div>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isOwn
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}>
                    {!message.isOwn && (
                      <div className="text-xs text-gray-300 mb-1">
                        {message.userName}
                      </div>
                    )}
                    <div className="text-sm">{message.message}</div>
                    <div className={`text-xs mt-1 ${
                      message.isOwn ? 'text-red-200' : 'text-gray-400'
                    }`}>
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing indicator */}
            {getTypingUsers().length > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm italic">
                  {getTypingUsers().join(', ')} {getTypingUsers().length === 1 ? 'is' : 'are'} typing...
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                disabled={!isConnected}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || !isConnected}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Online Users Sidebar */}
        {showOnlineUsers && (
          <div className="w-48 border-l border-gray-700 bg-gray-800 p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">Online Users</h4>
            <div className="space-y-2">
              {onlineUsers.length === 0 ? (
                <p className="text-gray-500 text-xs">No users online</p>
              ) : (
                onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300 text-sm truncate">
                      {user.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
