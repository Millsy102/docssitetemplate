import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface RequestLog {
  id: string;
  shortId: string;
  timestamp: number;
  method: string;
  url: string;
  path: string;
  query: any;
  headers: any;
  ip: string;
  userAgent: string;
  body: any;
  status: number | null;
  responseTime: number | null;
  error: any;
  completed: boolean;
  responseBody?: string;
}

interface RequestStats {
  total: number;
  completed: number;
  pending: number;
  errors: number;
  averageResponseTime: number;
  statusCodes: Record<string, number>;
  methods: Record<string, number>;
  endpoints: Record<string, number>;
}

const RequestTracker: React.FC = () => {
  const [stats, setStats] = useState<RequestStats | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [filters, setFilters] = useState({
    method: '',
    status: '',
    path: '',
    completed: '',
    limit: '100'
  });

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/requests/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/api/requests/logs?${params}`);
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all request logs?')) {
      try {
        await axios.post('/api/requests/logs/clear');
        fetchStats();
        fetchLogs();
      } catch (error) {
        console.error('Failed to clear logs:', error);
      }
    }
  };

  const exportLogs = async () => {
    try {
      const response = await axios.get('/api/requests/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `request-logs-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLogs();
    
    const interval = setInterval(() => {
      fetchStats();
      fetchLogs();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [filters]);

  const getStatusColor = (status: number | null) => {
    if (!status) return 'text-gray-400';
    if (status < 300) return 'text-green-400';
    if (status < 400) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-blue-400';
      case 'POST': return 'text-green-400';
      case 'PUT': return 'text-yellow-400';
      case 'DELETE': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatResponseTime = (time: number | null) => {
    if (!time) return '-';
    return `${time}ms`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-red-500">Request Tracker</h1>
          <div className="flex gap-4">
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Export Logs
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg transition-colors"
            >
              Clear All Logs
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Total Requests</h3>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Completed</h3>
              <p className="text-3xl font-bold">{stats.completed}</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Pending</h3>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-red-400 mb-2">Errors</h3>
              <p className="text-3xl font-bold">{stats.errors}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              value={filters.method}
              onChange={(e) => setFilters({ ...filters, method: e.target.value })}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">All Status</option>
              <option value="200">200 OK</option>
              <option value="400">400 Bad Request</option>
              <option value="401">401 Unauthorized</option>
              <option value="404">404 Not Found</option>
              <option value="500">500 Server Error</option>
            </select>
            
            <input
              type="text"
              placeholder="Path filter..."
              value={filters.path}
              onChange={(e) => setFilters({ ...filters, path: e.target.value })}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            />
            
            <select
              value={filters.completed}
              onChange={(e) => setFilters({ ...filters, completed: e.target.value })}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">All Requests</option>
              <option value="true">Completed</option>
              <option value="false">Pending</option>
            </select>
            
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
              <option value="200">200 per page</option>
            </select>
          </div>
        </div>

        {/* Request Logs Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Path</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                      No request logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                        {log.shortId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${getMethodColor(log.method)}`}>
                          {log.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 truncate max-w-xs">
                        {log.path}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${getStatusColor(log.status)}`}>
                          {log.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatResponseTime(log.responseTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request Details Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-red-400">
                    Request Details - {selectedLog.shortId}
                  </h3>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-red-400 mb-2">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Method:</span>
                      <span className={`ml-2 font-semibold ${getMethodColor(selectedLog.method)}`}>
                        {selectedLog.method}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className={`ml-2 font-semibold ${getStatusColor(selectedLog.status)}`}>
                        {selectedLog.status || 'Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Response Time:</span>
                      <span className="ml-2">{formatResponseTime(selectedLog.responseTime)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Completed:</span>
                      <span className="ml-2">{selectedLog.completed ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">IP Address:</span>
                      <span className="ml-2">{selectedLog.ip}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Timestamp:</span>
                      <span className="ml-2">{formatTimestamp(selectedLog.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-red-400 mb-2">URL & Path</h4>
                  <div className="bg-gray-800 p-3 rounded text-sm font-mono break-all">
                    {selectedLog.url}
                  </div>
                </div>

                {selectedLog.query && Object.keys(selectedLog.query).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-red-400 mb-2">Query Parameters</h4>
                    <pre className="bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.query, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.body && Object.keys(selectedLog.body).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-red-400 mb-2">Request Body</h4>
                    <pre className="bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(selectedLog.body, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.responseBody && (
                  <div>
                    <h4 className="text-lg font-semibold text-red-400 mb-2">Response Body</h4>
                    <pre className="bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                      {selectedLog.responseBody}
                    </pre>
                  </div>
                )}

                {selectedLog.error && (
                  <div>
                    <h4 className="text-lg font-semibold text-red-400 mb-2">Error</h4>
                    <div className="bg-red-900 p-3 rounded text-sm">
                      <div className="font-semibold">{selectedLog.error.message}</div>
                      {selectedLog.error.stack && (
                        <pre className="mt-2 text-xs overflow-x-auto">
                          {selectedLog.error.stack}
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-semibold text-red-400 mb-2">Headers</h4>
                  <pre className="bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedLog.headers, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestTracker;
