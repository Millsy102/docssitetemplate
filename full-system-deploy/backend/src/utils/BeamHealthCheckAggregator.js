const BeamPerformanceMonitor = require('./BeamPerformanceMonitor');
const BeamDatabase = require('../database/BeamDatabase');
const BeamCache = require('./BeamCache');
const BeamErrorHandler = require('./BeamErrorHandler');
const os = require('os');
const v8 = require('v8');

class BeamHealthCheckAggregator {
    constructor() {
        this.checks = new Map();
        this.lastCheck = null;
        this.checkInterval = parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000; // 30 seconds
        this.cacheTimeout = parseInt(process.env.HEALTH_CACHE_TIMEOUT) || 10000; // 10 seconds
        
        // Register default health checks
        this.registerDefaultChecks();
        
        // Start periodic health checks
        this.startPeriodicChecks();
    }

    /**
     * Register default health checks
     */
    registerDefaultChecks() {
        // System health check
        this.registerCheck('system', async () => {
            const memUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();
            const loadAvg = os.loadavg();
            
            return {
                status: 'healthy',
                details: {
                    memory: {
                        heapUsed: memUsage.heapUsed,
                        heapTotal: memUsage.heapTotal,
                        external: memUsage.external,
                        rss: memUsage.rss,
                        usagePercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
                    },
                    cpu: {
                        user: cpuUsage.user,
                        system: cpuUsage.system,
                        loadAverage: loadAvg
                    },
                    uptime: {
                        process: process.uptime(),
                        system: os.uptime(),
                        formatted: this.formatUptime(process.uptime())
                    },
                    platform: {
                        nodeVersion: process.version,
                        platform: os.platform(),
                        arch: os.arch(),
                        cpus: os.cpus().length
                    }
                }
            };
        });

        // Database health check
        this.registerCheck('database', async () => {
            try {
                const dbHealth = await BeamDatabase.healthCheck();
                return {
                    status: dbHealth.status,
                    details: {
                        mongo: dbHealth.mongo,
                        redis: dbHealth.redis,
                        timestamp: dbHealth.timestamp
                    }
                };
            } catch (error) {
                return {
                    status: 'error',
                    details: {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        });

        // Performance monitor health check
        this.registerCheck('performance', async () => {
            try {
                const perfStats = BeamPerformanceMonitor.getStats();
                const healthStatus = BeamPerformanceMonitor.getHealthStatus();
                
                return {
                    status: healthStatus.status,
                    details: {
                        requests: {
                            total: perfStats.requests.total,
                            errorRate: perfStats.requests.errorRate,
                            averageResponseTime: perfStats.requests.responseTimes.average,
                            slowRequests: perfStats.requests.responseTimes.slow
                        },
                        memory: {
                            current: perfStats.memory.current,
                            average: perfStats.memory.average
                        },
                        checks: healthStatus.checks
                    }
                };
            } catch (error) {
                return {
                    status: 'error',
                    details: {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        });

        // Cache health check
        this.registerCheck('cache', async () => {
            try {
                const cacheStats = BeamCache.getStats();
                const hitRate = cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100;
                
                return {
                    status: hitRate > 50 ? 'healthy' : 'degraded',
                    details: {
                        hits: cacheStats.hits,
                        misses: cacheStats.misses,
                        hitRate: Math.round(hitRate * 100) / 100,
                        size: cacheStats.size,
                        keys: cacheStats.keys
                    }
                };
            } catch (error) {
                return {
                    status: 'error',
                    details: {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        });

        // Error handler health check
        this.registerCheck('errors', async () => {
            try {
                const errorStats = BeamErrorHandler.getErrorStats();
                const errorRate = errorStats.totalErrors / Math.max(BeamPerformanceMonitor.getStats().requests.total, 1) * 100;
                
                return {
                    status: errorRate < 5 ? 'healthy' : errorRate < 10 ? 'degraded' : 'unhealthy',
                    details: {
                        totalErrors: errorStats.totalErrors,
                        errorRate: Math.round(errorRate * 100) / 100,
                        recentErrors: errorStats.recentErrors,
                        criticalErrors: errorStats.criticalErrors
                    }
                };
            } catch (error) {
                return {
                    status: 'error',
                    details: {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        });

        // V8 engine health check
        this.registerCheck('v8', async () => {
            try {
                const heapStats = v8.getHeapStatistics();
                const heapSpaceStats = v8.getHeapSpaceStatistics();
                
                const totalHeapSize = heapStats.total_available_size;
                const usedHeapSize = heapStats.used_heap_size;
                const heapUsagePercent = (usedHeapSize / totalHeapSize) * 100;
                
                return {
                    status: heapUsagePercent < 80 ? 'healthy' : heapUsagePercent < 90 ? 'degraded' : 'unhealthy',
                    details: {
                        heapUsage: {
                            used: usedHeapSize,
                            total: totalHeapSize,
                            usagePercent: Math.round(heapUsagePercent * 100) / 100
                        },
                        heapSpaces: heapSpaceStats.map(space => ({
                            name: space.space_name,
                            size: space.space_size,
                            used: space.space_used_size,
                            available: space.space_available_size
                        })),
                        gc: {
                            totalGcTime: heapStats.total_gc_time,
                            totalGcCount: heapStats.total_gc_count
                        }
                    }
                };
            } catch (error) {
                return {
                    status: 'error',
                    details: {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        });
    }

    /**
     * Register a custom health check
     */
    registerCheck(name, checkFunction) {
        this.checks.set(name, {
            fn: checkFunction,
            lastRun: null,
            lastResult: null,
            lastError: null
        });
    }

    /**
     * Unregister a health check
     */
    unregisterCheck(name) {
        this.checks.delete(name);
    }

    /**
     * Run a specific health check
     */
    async runCheck(name) {
        const check = this.checks.get(name);
        if (!check) {
            throw new Error(`Health check '${name}' not found`);
        }

        try {
            const result = await check.fn();
            check.lastRun = new Date();
            check.lastResult = result;
            check.lastError = null;
            return result;
        } catch (error) {
            check.lastRun = new Date();
            check.lastError = error;
            check.lastResult = {
                status: 'error',
                details: {
                    error: error.message,
                    timestamp: new Date().toISOString()
                }
            };
            throw error;
        }
    }

    /**
     * Run all health checks
     */
    async runAllChecks() {
        const results = {};
        const errors = [];

        for (const [name, check] of this.checks) {
            try {
                results[name] = await this.runCheck(name);
            } catch (error) {
                errors.push({ name, error: error.message });
                results[name] = {
                    status: 'error',
                    details: {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        }

        this.lastCheck = new Date();
        return { results, errors };
    }

    /**
     * Get aggregated health status
     */
    async getHealthStatus(detailed = false) {
        const { results, errors } = await this.runAllChecks();
        
        // Determine overall status
        const statuses = Object.values(results).map(r => r.status);
        let overallStatus = 'healthy';
        
        if (statuses.includes('unhealthy')) {
            overallStatus = 'unhealthy';
        } else if (statuses.includes('degraded') || statuses.includes('error')) {
            overallStatus = 'degraded';
        }

        const response = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            checks: Object.keys(results).length,
            healthy: statuses.filter(s => s === 'healthy').length,
            degraded: statuses.filter(s => s === 'degraded').length,
            unhealthy: statuses.filter(s => s === 'unhealthy').length,
            errors: statuses.filter(s => s === 'error').length
        };

        if (detailed) {
            response.details = results;
            response.checkErrors = errors;
        }

        return response;
    }

    /**
     * Get cached health status (if available and recent)
     */
    getCachedHealthStatus() {
        if (!this.lastCheck || (Date.now() - this.lastCheck.getTime()) > this.cacheTimeout) {
            return null;
        }

        const results = {};
        for (const [name, check] of this.checks) {
            if (check.lastResult) {
                results[name] = check.lastResult;
            }
        }

        const statuses = Object.values(results).map(r => r.status);
        let overallStatus = 'healthy';
        
        if (statuses.includes('unhealthy')) {
            overallStatus = 'unhealthy';
        } else if (statuses.includes('degraded') || statuses.includes('error')) {
            overallStatus = 'degraded';
        }

        return {
            status: overallStatus,
            timestamp: this.lastCheck.toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            checks: Object.keys(results).length,
            healthy: statuses.filter(s => s === 'healthy').length,
            degraded: statuses.filter(s => s === 'degraded').length,
            unhealthy: statuses.filter(s => s === 'unhealthy').length,
            errors: statuses.filter(s => s === 'error').length,
            cached: true
        };
    }

    /**
     * Start periodic health checks
     */
    startPeriodicChecks() {
        setInterval(async () => {
            try {
                await this.runAllChecks();
            } catch (error) {
                console.error('Periodic health check failed:', error);
            }
        }, this.checkInterval);
    }

    /**
     * Stop periodic health checks
     */
    stopPeriodicChecks() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }

    /**
     * Format uptime
     */
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

    /**
     * Get health check statistics
     */
    getStats() {
        const stats = {
            totalChecks: this.checks.size,
            lastCheck: this.lastCheck,
            checkInterval: this.checkInterval,
            cacheTimeout: this.cacheTimeout
        };

        for (const [name, check] of this.checks) {
            stats[name] = {
                lastRun: check.lastRun,
                hasError: !!check.lastError,
                lastError: check.lastError?.message
            };
        }

        return stats;
    }
}

// Create singleton instance
const beamHealthCheckAggregator = new BeamHealthCheckAggregator();

module.exports = beamHealthCheckAggregator;
