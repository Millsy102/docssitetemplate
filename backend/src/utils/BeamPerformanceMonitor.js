const os = require('os');
const v8 = require('v8');

class BeamPerformanceMonitor {
    constructor() {
        this.metrics = {
            requests: {
                total: 0,
                byStatus: {},
                byEndpoint: {},
                responseTimes: [],
                errors: 0
            },
            memory: {
                heapUsed: [],
                heapTotal: [],
                external: [],
                rss: []
            },
            cpu: {
                usage: [],
                loadAverage: []
            },
            system: {
                uptime: 0,
                startTime: Date.now()
            }
        };

        this.slowRequestThreshold = parseInt(process.env.SLOW_REQUEST_THRESHOLD) || 1000; // 1 second
        this.monitoringInterval = parseInt(process.env.MONITORING_INTERVAL) || 30000; // 30 seconds

        // Start monitoring
        this.startMonitoring();
    }

    // Record request metrics
    recordRequest(req, res, next) {
        const startTime = Date.now();
        const originalSend = res.send;

        // Override res.send to capture response data
        res.send = function(data) {
            const responseTime = Date.now() - startTime;
            
            // Record metrics
            this.recordMetrics(req, res, responseTime);
            
            // Call original send
            originalSend.call(this, data);
        }.bind(this);

        next();
    }

    // Record detailed metrics
    recordMetrics(req, res, responseTime) {
        // Increment total requests
        this.metrics.requests.total++;

        // Record status code
        const statusCode = res.statusCode;
        this.metrics.requests.byStatus[statusCode] = (this.metrics.requests.byStatus[statusCode] || 0) + 1;

        // Record endpoint
        const endpoint = req.route ? req.route.path : req.path;
        this.metrics.requests.byEndpoint[endpoint] = (this.metrics.requests.byEndpoint[endpoint] || 0) + 1;

        // Record response time
        this.metrics.requests.responseTimes.push(responseTime);

        // Keep only last 1000 response times
        if (this.metrics.requests.responseTimes.length > 1000) {
            this.metrics.requests.responseTimes.shift();
        }

        // Record errors
        if (statusCode >= 400) {
            this.metrics.requests.errors++;
        }

        // Log slow requests
        if (responseTime > this.slowRequestThreshold) {
            console.warn(`Slow request detected: ${req.method} ${req.path} took ${responseTime}ms`);
        }
    }

    // Start system monitoring
    startMonitoring() {
        setInterval(() => {
            this.recordSystemMetrics();
        }, this.monitoringInterval);
    }

    // Record system metrics
    recordSystemMetrics() {
        // Memory metrics
        const memUsage = process.memoryUsage();
        this.metrics.memory.heapUsed.push(memUsage.heapUsed);
        this.metrics.memory.heapTotal.push(memUsage.heapTotal);
        this.metrics.memory.external.push(memUsage.external);
        this.metrics.memory.rss.push(memUsage.rss);

        // Keep only last 100 memory readings
        const maxReadings = 100;
        Object.keys(this.metrics.memory).forEach(key => {
            if (this.metrics.memory[key].length > maxReadings) {
                this.metrics.memory[key] = this.metrics.memory[key].slice(-maxReadings);
            }
        });

        // CPU metrics
        const cpuUsage = process.cpuUsage();
        this.metrics.cpu.usage.push(cpuUsage);

        // Load average
        const loadAvg = os.loadavg();
        this.metrics.cpu.loadAverage.push(loadAvg);

        // Keep only last 100 CPU readings
        if (this.metrics.cpu.usage.length > maxReadings) {
            this.metrics.cpu.usage = this.metrics.cpu.usage.slice(-maxReadings);
        }
        if (this.metrics.cpu.loadAverage.length > maxReadings) {
            this.metrics.cpu.loadAverage = this.metrics.cpu.loadAverage.slice(-maxReadings);
        }

        // Update system uptime
        this.metrics.system.uptime = Date.now() - this.metrics.system.startTime;
    }

    // Get performance statistics
    getStats() {
        const responseTimes = this.metrics.requests.responseTimes;
        const avgResponseTime = responseTimes.length > 0 
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
            : 0;

        const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
        const p95ResponseTime = sortedResponseTimes.length > 0 
            ? sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)] 
            : 0;

        const p99ResponseTime = sortedResponseTimes.length > 0 
            ? sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)] 
            : 0;

        const currentMemory = process.memoryUsage();
        const avgHeapUsed = this.metrics.memory.heapUsed.length > 0 
            ? this.metrics.memory.heapUsed.reduce((a, b) => a + b, 0) / this.metrics.memory.heapUsed.length 
            : 0;

        return {
            requests: {
                total: this.metrics.requests.total,
                errors: this.metrics.requests.errors,
                errorRate: this.metrics.requests.total > 0 
                    ? (this.metrics.requests.errors / this.metrics.requests.total * 100).toFixed(2) + '%' 
                    : '0%',
                byStatus: this.metrics.requests.byStatus,
                byEndpoint: this.metrics.requests.byEndpoint,
                responseTimes: {
                    average: Math.round(avgResponseTime),
                    p95: Math.round(p95ResponseTime),
                    p99: Math.round(p99ResponseTime),
                    min: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
                    max: responseTimes.length > 0 ? Math.max(...responseTimes) : 0
                }
            },
            memory: {
                current: {
                    heapUsed: currentMemory.heapUsed,
                    heapTotal: currentMemory.heapTotal,
                    external: currentMemory.external,
                    rss: currentMemory.rss
                },
                average: {
                    heapUsed: Math.round(avgHeapUsed),
                    heapTotal: this.metrics.memory.heapTotal.length > 0 
                        ? Math.round(this.metrics.memory.heapTotal.reduce((a, b) => a + b, 0) / this.metrics.memory.heapTotal.length) 
                        : 0
                }
            },
            cpu: {
                current: process.cpuUsage(),
                loadAverage: os.loadavg()
            },
            system: {
                uptime: this.metrics.system.uptime,
                uptimeFormatted: this.formatUptime(this.metrics.system.uptime),
                nodeVersion: process.version,
                platform: os.platform(),
                arch: os.arch()
            },
            v8: {
                heapStatistics: v8.getHeapStatistics(),
                heapSpaceStatistics: v8.getHeapSpaceStatistics()
            }
        };
    }

    // Format uptime
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    // Get health status
    getHealthStatus() {
        const stats = this.getStats();
        const errorRate = parseFloat(stats.requests.errorRate);
        const avgResponseTime = stats.requests.responseTimes.average;
        const memoryUsage = stats.memory.current.heapUsed / stats.memory.current.heapTotal;

        const health = {
            status: 'healthy',
            checks: {
                errorRate: errorRate < 5,
                responseTime: avgResponseTime < 1000,
                memoryUsage: memoryUsage < 0.8
            }
        };

        if (errorRate >= 5 || avgResponseTime >= 1000 || memoryUsage >= 0.8) {
            health.status = 'degraded';
        }

        if (errorRate >= 10 || avgResponseTime >= 5000 || memoryUsage >= 0.95) {
            health.status = 'unhealthy';
        }

        return health;
    }

    // Reset metrics
    resetMetrics() {
        this.metrics = {
            requests: {
                total: 0,
                byStatus: {},
                byEndpoint: {},
                responseTimes: [],
                errors: 0
            },
            memory: {
                heapUsed: [],
                heapTotal: [],
                external: [],
                rss: []
            },
            cpu: {
                usage: [],
                loadAverage: []
            },
            system: {
                uptime: 0,
                startTime: Date.now()
            }
        };
    }
}

module.exports = new BeamPerformanceMonitor();
