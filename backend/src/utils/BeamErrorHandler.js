class BeamErrorHandler {
    constructor() {
        this.errorTypes = {
            VALIDATION_ERROR: 'VALIDATION_ERROR',
            AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
            AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
            NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
            RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
            DATABASE_ERROR: 'DATABASE_ERROR',
            EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
            INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
        };

        this.errorLog = [];
        this.maxLogSize = 1000;
    }

    // Create structured error
    createError(type, message, details = {}, statusCode = 500) {
        const error = {
            type,
            message,
            details,
            statusCode,
            timestamp: new Date().toISOString(),
            stack: new Error().stack
        };

        this.logError(error);
        return error;
    }

    // Validation error
    validationError(message, details = {}) {
        return this.createError(
            this.errorTypes.VALIDATION_ERROR,
            message,
            details,
            400
        );
    }

    // Authentication error
    authenticationError(message = 'Authentication required') {
        return this.createError(
            this.errorTypes.AUTHENTICATION_ERROR,
            message,
            {},
            401
        );
    }

    // Authorization error
    authorizationError(message = 'Insufficient permissions') {
        return this.createError(
            this.errorTypes.AUTHORIZATION_ERROR,
            message,
            {},
            403
        );
    }

    // Not found error
    notFoundError(resource = 'Resource') {
        return this.createError(
            this.errorTypes.NOT_FOUND_ERROR,
            `${resource} not found`,
            {},
            404
        );
    }

    // Rate limit error
    rateLimitError(message = 'Rate limit exceeded') {
        return this.createError(
            this.errorTypes.RATE_LIMIT_ERROR,
            message,
            {},
            429
        );
    }

    // Database error
    databaseError(message, details = {}) {
        return this.createError(
            this.errorTypes.DATABASE_ERROR,
            message,
            details,
            500
        );
    }

    // External service error
    externalServiceError(service, message, details = {}) {
        return this.createError(
            this.errorTypes.EXTERNAL_SERVICE_ERROR,
            `${service} service error: ${message}`,
            details,
            502
        );
    }

    // Internal server error
    internalServerError(message = 'Internal server error', details = {}) {
        return this.createError(
            this.errorTypes.INTERNAL_SERVER_ERROR,
            message,
            details,
            500
        );
    }

    // Async handler wrapper
    asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

    // Global error handler middleware
    globalErrorHandler() {
        return (error, req, res, next) => {
            // Log the error
            this.logError(error);

            // Determine error type and status code
            let statusCode = 500;
            let errorResponse = {
                error: true,
                message: 'Internal server error',
                type: this.errorTypes.INTERNAL_SERVER_ERROR
            };

            // Handle different error types
            if (error.type) {
                statusCode = error.statusCode || 500;
                errorResponse = {
                    error: true,
                    message: error.message,
                    type: error.type,
                    details: error.details || {}
                };
            } else if (error.name === 'ValidationError') {
                statusCode = 400;
                errorResponse = {
                    error: true,
                    message: 'Validation error',
                    type: this.errorTypes.VALIDATION_ERROR,
                    details: error.details || {}
                };
            } else if (error.name === 'UnauthorizedError') {
                statusCode = 401;
                errorResponse = {
                    error: true,
                    message: 'Authentication required',
                    type: this.errorTypes.AUTHENTICATION_ERROR
                };
            } else if (error.code === 'ENOTFOUND') {
                statusCode = 404;
                errorResponse = {
                    error: true,
                    message: 'Resource not found',
                    type: this.errorTypes.NOT_FOUND_ERROR
                };
            } else if (error.message) {
                errorResponse.message = error.message;
            }

            // Add request context in development
            if (process.env.NODE_ENV === 'development') {
                errorResponse.stack = error.stack;
                errorResponse.request = {
                    method: req.method,
                    url: req.url,
                    headers: req.headers,
                    body: req.body,
                    params: req.params,
                    query: req.query
                };
            }

            // Send error response
            res.status(statusCode).json(errorResponse);
        };
    }

    // Log error
    logError(error) {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            type: error.type || 'UNKNOWN_ERROR',
            message: error.message || 'Unknown error',
            stack: error.stack,
            details: error.details || {},
            statusCode: error.statusCode || 500
        };

        this.errorLog.push(errorEntry);

        // Keep log size manageable
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(-this.maxLogSize);
        }

        // Console logging
        console.error('Error:', {
            type: errorEntry.type,
            message: errorEntry.message,
            statusCode: errorEntry.statusCode,
            timestamp: errorEntry.timestamp
        });

        if (process.env.NODE_ENV === 'development') {
            console.error('Stack:', errorEntry.stack);
        }
    }

    // Get error statistics
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            byStatusCode: {},
            recent: this.errorLog.slice(-10)
        };

        this.errorLog.forEach(error => {
            // Count by type
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            
            // Count by status code
            stats.byStatusCode[error.statusCode] = (stats.byStatusCode[error.statusCode] || 0) + 1;
        });

        return stats;
    }

    // Clear error log
    clearErrorLog() {
        this.errorLog = [];
    }

    // Graceful shutdown handler
    setupGracefulShutdown(server) {
        const gracefulShutdown = (signal) => {
            console.log(`\nReceived ${signal}. Starting graceful shutdown...`);
            
            server.close((err) => {
                if (err) {
                    console.error('Error during server shutdown:', err);
                    process.exit(1);
                }

                console.log('Server closed successfully');
                
                // Perform cleanup tasks
                this.performCleanup()
                    .then(() => {
                        console.log('Cleanup completed successfully');
                        process.exit(0);
                    })
                    .catch((error) => {
                        console.error('Error during cleanup:', error);
                        process.exit(1);
                    });
            });

            // Force shutdown after timeout
            setTimeout(() => {
                console.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        // Handle different shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            this.logError(error);
            gracefulShutdown('uncaughtException');
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            this.logError({
                type: 'UNHANDLED_REJECTION',
                message: reason?.message || 'Unhandled promise rejection',
                stack: reason?.stack,
                statusCode: 500
            });
            gracefulShutdown('unhandledRejection');
        });
    }

    // Perform cleanup tasks
    async performCleanup() {
        const cleanupTasks = [
            this.closeDatabaseConnections(),
            this.closeRedisConnections(),
            this.saveErrorLog(),
            this.cleanupTempFiles()
        ];

        try {
            await Promise.allSettled(cleanupTasks);
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    // Close database connections
    async closeDatabaseConnections() {
        // Implementation depends on your database setup
        console.log('Closing database connections...');
    }

    // Close Redis connections
    async closeRedisConnections() {
        // Implementation depends on your Redis setup
        console.log('Closing Redis connections...');
    }

    // Save error log to file
    async saveErrorLog() {
        if (this.errorLog.length > 0) {
            console.log(`Saving ${this.errorLog.length} error entries to log file...`);
            // Implementation for saving to file
        }
    }

    // Cleanup temporary files
    async cleanupTempFiles() {
        console.log('Cleaning up temporary files...');
        // Implementation for cleaning up temp files
    }

    // Validate error response format
    validateErrorResponse(response) {
        const requiredFields = ['error', 'message'];
        const validTypes = Object.values(this.errorTypes);

        for (const field of requiredFields) {
            if (!(field in response)) {
                return false;
            }
        }

        if (response.type && !validTypes.includes(response.type)) {
            return false;
        }

        return true;
    }
}

module.exports = new BeamErrorHandler();
