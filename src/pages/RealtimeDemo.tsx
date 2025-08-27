import React, { useState } from 'react';
import { RealtimeChat } from '../components/RealtimeChat';
import { RealtimeStatus } from '../components/RealtimeStatus';
import { useRealtime } from '../hooks/useRealtime';

const RealtimeDemo: React.FC = () => {
  const { sendMessage, isConnected } = useRealtime();
  const [demoRoom, setDemoRoom] = useState('demo-room');
  const [userName, setUserName] = useState('Demo User');

  const sendDemoNotification = (type: 'info' | 'success' | 'warning' | 'error') => {
    const messages = {
      info: 'This is an informational message from the demo.',
      success: 'Operation completed successfully!',
      warning: 'Please be aware of this important notice.',
      error: 'An error occurred while processing your request.'
    };

    sendMessage({
      type,
      message: messages[type],
      data: {
        source: 'demo',
        timestamp: Date.now()
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-500 mb-4">
            Real-time Features Demo
          </h1>
          <p className="text-gray-300 text-lg">
            Experience the power of Socket.IO real-time communication in your documentation site.
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-lg font-semibold">
                {isConnected ? 'Connected to Real-time Server' : 'Disconnected'}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              Socket.IO WebSocket Connection
            </div>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold text-red-400 mb-4">Demo Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-3">Chat Configuration</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Room ID</label>
                  <input
                    type="text"
                    value={demoRoom}
                    onChange={(e) => setDemoRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="Enter room ID"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">User Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            </div>

            {/* Notification Controls */}
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-3">Test Notifications</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => sendDemoNotification('info')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Info
                </button>
                <button
                  onClick={() => sendDemoNotification('success')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Success
                </button>
                <button
                  onClick={() => sendDemoNotification('warning')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                >
                  Warning
                </button>
                <button
                  onClick={() => sendDemoNotification('error')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Error
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Real-time Chat */}
          <div className="lg:col-span-2">
            <div className="h-96">
              <RealtimeChat
                roomId={demoRoom}
                userName={userName}
                showOnlineUsers={true}
                className="h-full"
              />
            </div>
          </div>

          {/* System Status */}
          <div>
            <RealtimeStatus
              showMetrics={true}
              showConnectionInfo={true}
              refreshInterval={3000}
              className="h-96"
            />
          </div>
        </div>

        {/* Feature Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-red-400 text-2xl mb-3"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Real-time Chat</h3>
            <p className="text-gray-300 text-sm">
              Collaborative messaging with typing indicators, online user status, and room-based conversations.
            </p>
          </div>

          <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-red-400 text-2xl mb-3"></div>
            <h3 className="text-xl font-semibold text-white mb-2">Live Notifications</h3>
            <p className="text-gray-300 text-sm">
              Instant notifications for system events, user actions, and important updates with auto-dismiss.
            </p>
          </div>

          <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-red-400 text-2xl mb-3"></div>
            <h3 className="text-xl font-semibold text-white mb-2">System Monitoring</h3>
            <p className="text-gray-300 text-sm">
              Real-time system metrics, connection status, and performance monitoring with visual indicators.
            </p>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-12 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-semibold text-red-400 mb-4">Technical Implementation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-3">Frontend Features</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• Socket.IO client with automatic reconnection</li>
                <li>• React Context for global state management</li>
                <li>• Custom hooks for real-time functionality</li>
                <li>• Responsive UI with red and black theme</li>
                <li>• TypeScript for type safety</li>
                <li>• Error handling and fallback states</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-3">Real-time Capabilities</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• WebSocket and polling transport fallback</li>
                <li>• Room-based messaging and broadcasting</li>
                <li>• Typing indicators and user presence</li>
                <li>• System metrics and health monitoring</li>
                <li>• Event-driven architecture</li>
                <li>• Scalable connection management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeDemo;
