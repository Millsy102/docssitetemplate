const promClient = require('prom-client');

// Create a Registry to register metrics
const register = new promClient.Registry();

// Enable default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics for Socket.IO server
const socketConnections = new promClient.Gauge({
  name: 'socket_connections_total',
  help: 'Total number of active Socket.IO connections',
  labelNames: ['status'],
  registers: [register]
});

const socketMessages = new promClient.Counter({
  name: 'socket_messages_total',
  help: 'Total number of Socket.IO messages',
  labelNames: ['event_type', 'direction'],
  registers: [register]
});

const socketRooms = new promClient.Gauge({
  name: 'socket_rooms_total',
  help: 'Total number of active Socket.IO rooms',
  registers: [register]
});

const httpRequests = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status', 'endpoint'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'endpoint'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

const systemMetrics = new promClient.Gauge({
  name: 'system_metrics',
  help: 'System performance metrics',
  labelNames: ['metric_type'],
  registers: [register]
});

// Metrics middleware for Express
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const endpoint = req.route ? req.route.path : req.path;
    
    httpRequests.inc({
      method: req.method,
      status: res.statusCode,
      endpoint: endpoint
    });
    
    httpRequestDuration.observe({
      method: req.method,
      endpoint: endpoint
    }, duration);
  });
  
  next();
};

// Metrics endpoint
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).end('Error generating metrics');
  }
};

// Update system metrics
const updateSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  systemMetrics.set({ metric_type: 'memory_rss' }, memUsage.rss / 1024 / 1024); // MB
  systemMetrics.set({ metric_type: 'memory_heap_used' }, memUsage.heapUsed / 1024 / 1024); // MB
  systemMetrics.set({ metric_type: 'memory_heap_total' }, memUsage.heapTotal / 1024 / 1024); // MB
  systemMetrics.set({ metric_type: 'uptime_seconds' }, process.uptime());
  systemMetrics.set({ metric_type: 'cpu_user_seconds' }, cpuUsage.user / 1000000); // seconds
  systemMetrics.set({ metric_type: 'cpu_system_seconds' }, cpuUsage.system / 1000000); // seconds
};

// Socket.IO metrics helpers
const updateSocketMetrics = (connectedUsers, rooms) => {
  socketConnections.set({ status: 'connected' }, connectedUsers.size);
  socketConnections.set({ status: 'disconnected' }, 0); // Will be updated on disconnect
  socketRooms.set(rooms.size);
};

const recordSocketMessage = (eventType, direction = 'incoming') => {
  socketMessages.inc({ event_type: eventType, direction });
};

module.exports = {
  register,
  socketConnections,
  socketMessages,
  socketRooms,
  httpRequests,
  httpRequestDuration,
  systemMetrics,
  metricsMiddleware,
  metricsEndpoint,
  updateSystemMetrics,
  updateSocketMetrics,
  recordSocketMessage
};
