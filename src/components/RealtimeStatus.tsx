import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

interface SystemMetrics {
  cpu: number;
  memory: number;
  uptime: number;
  activeConnections: number;
  requestsPerSecond: number;
}

interface RealtimeStatusProps {
  showMetrics?: boolean;
  showConnectionInfo?: boolean;
  refreshInterval?: number;
  className?: string;
}

export const RealtimeStatus: React.FC<RealtimeStatusProps> = ({
  showMetrics = true,
  showConnectionInfo = true,
  refreshInterval = 5000,
  className = ''
}) => {
  const { socket, isConnected, emit, on, off } = useSocket();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    uptime: 0,
    activeConnections: 0,
    requestsPerSecond: 0
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionInfo, setConnectionInfo] = useState({
    latency: 0,
    protocol: '',
    transport: ''
  });

  // Request system metrics
  const requestMetrics = () => {
    if (isConnected) {
      emit('get_metrics');
    }
  };

  // Request connection info
  const requestConnectionInfo = () => {
    if (isConnected && socket) {
      emit('ping');
      const startTime = Date.now();
      
      socket.once('pong', () => {
        const latency = Date.now() - startTime;
        setConnectionInfo({
          latency,
          protocol: socket.io.engine.protocol,
          transport: socket.io.engine.transport.name
        });
      });
    }
  };

  // Set up metrics listener
  useEffect(() => {
    if (!socket) return;

    const handleMetrics = (data: SystemMetrics) => {
      setMetrics(data);
      setLastUpdate(new Date());
    };

    on('metrics', handleMetrics);

    return () => {
      off('metrics');
    };
  }, [socket, on, off]);

  // Request metrics periodically
  useEffect(() => {
    if (!showMetrics) return;

    requestMetrics();
    const interval = setInterval(requestMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [showMetrics, refreshInterval, isConnected]);

  // Request connection info periodically
  useEffect(() => {
    if (!showConnectionInfo) return;

    requestConnectionInfo();
    const interval = setInterval(requestConnectionInfo, refreshInterval);

    return () => clearInterval(interval);
  }, [showConnectionInfo, refreshInterval, isConnected]);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return '🔴';
    if (value >= thresholds.warning) return '🟡';
    return '🟢';
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatLatency = (ms: number): string => {
    if (ms < 100) return `${ms}ms`;
    if (ms < 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">System Status</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Connection Information */}
        {showConnectionInfo && (
          <div className="space-y-3">
            <h4 className="text-gray-300 font-medium text-xs uppercase tracking-wide">
              Connection
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Latency</span>
                <span className={`text-xs font-mono ${
                  connectionInfo.latency > 1000 ? 'text-red-400' : 
                  connectionInfo.latency > 500 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {formatLatency(connectionInfo.latency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Protocol</span>
                <span className="text-gray-300 text-xs">{connectionInfo.protocol}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Transport</span>
                <span className="text-gray-300 text-xs capitalize">{connectionInfo.transport}</span>
              </div>
            </div>
          </div>
        )}

        {/* System Metrics */}
        {showMetrics && (
          <div className="space-y-3">
            <h4 className="text-gray-300 font-medium text-xs uppercase tracking-wide">
              Metrics
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">CPU Usage</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-mono ${getStatusColor(metrics.cpu, { warning: 70, critical: 90 })}`}>
                    {metrics.cpu.toFixed(1)}%
                  </span>
                  <span className="text-xs">
                    {getStatusIcon(metrics.cpu, { warning: 70, critical: 90 })}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Memory Usage</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-mono ${getStatusColor(metrics.memory, { warning: 80, critical: 95 })}`}>
                    {metrics.memory.toFixed(1)}%
                  </span>
                  <span className="text-xs">
                    {getStatusIcon(metrics.memory, { warning: 80, critical: 95 })}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Uptime</span>
                <span className="text-gray-300 text-xs font-mono">
                  {formatUptime(metrics.uptime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Active Connections</span>
                <span className="text-gray-300 text-xs font-mono">
                  {metrics.activeConnections}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Requests/sec</span>
                <span className="text-gray-300 text-xs font-mono">
                  {metrics.requestsPerSecond.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Last Update */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs">Last Update</span>
          <span className="text-gray-400 text-xs">
            {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-3">
        <button
          onClick={() => {
            if (showMetrics) requestMetrics();
            if (showConnectionInfo) requestConnectionInfo();
          }}
          disabled={!isConnected}
          className="w-full px-3 py-2 bg-gray-800 text-gray-300 text-xs rounded border border-gray-600 hover:bg-gray-700 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};
