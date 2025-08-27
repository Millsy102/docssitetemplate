# Request Tracking System

## Overview

The Request Tracking System provides comprehensive debugging capabilities by assigning unique identifiers to each request and logging detailed information about request/response cycles. This system is designed to help developers debug issues, monitor performance, and analyze traffic patterns.

## Features

### 🔍 **Unique Request Identifiers**
- **Full UUID**: Complete unique identifier for each request
- **Short ID**: 16-character hexadecimal ID for easier logging
- **Request ID Headers**: Automatically added to response headers for client-side tracking

### 📊 **Comprehensive Request Logging**
- **Request Details**: Method, URL, path, query parameters, headers, body
- **Response Data**: Status code, response time, response body
- **Error Tracking**: Detailed error information including stack traces
- **Client Information**: IP address, user agent, timestamp

### 🛡️ **Security & Privacy**
- **Data Sanitization**: Automatic redaction of sensitive information
- **Configurable Retention**: Automatic cleanup of old logs
- **Admin-Only Access**: All tracking data requires admin authentication

### 📈 **Real-Time Monitoring**
- **Live Statistics**: Request counts, error rates, response times
- **Filtering**: Filter logs by method, status, path, completion status
- **Export Capabilities**: Download logs for external analysis

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Request Tracking Configuration
DEBUG_MODE=false                    # Enable debug logging
MAX_REQUEST_LOG_SIZE=10000         # Maximum number of logs to keep in memory
REQUEST_LOG_RETENTION_MS=86400000  # Log retention time (24 hours)
```

### Debug Mode

When `DEBUG_MODE=true`, the system will log request start and completion to the console:

```
[a1b2c3d4] GET /api/users - Request started
[a1b2c3d4] GET /api/users - 200 (45ms)
```

## API Endpoints

### Get Request Statistics
```http
GET /api/requests/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 1250,
    "completed": 1200,
    "pending": 50,
    "errors": 25,
    "averageResponseTime": 45.2,
    "statusCodes": {
      "200": 1100,
      "404": 100,
      "500": 25
    },
    "methods": {
      "GET": 800,
      "POST": 300,
      "PUT": 100,
      "DELETE": 50
    },
    "endpoints": {
      "/api/users": 200,
      "/api/auth/login": 150
    }
  }
}
```

### Get Request Logs
```http
GET /api/requests/logs?method=GET&status=200&limit=100&offset=0
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `method`: Filter by HTTP method
- `status`: Filter by status code
- `path`: Filter by URL path (partial match)
- `completed`: Filter by completion status (`true`/`false`)
- `since`: Filter by timestamp (Unix timestamp)
- `until`: Filter by timestamp (Unix timestamp)
- `limit`: Number of logs to return (default: 100)
- `offset`: Pagination offset (default: 0)

### Get Specific Request Log
```http
GET /api/requests/logs/{requestId}
Authorization: Bearer <admin-token>
```

### Clear All Logs
```http
POST /api/requests/logs/clear
Authorization: Bearer <admin-token>
```

### Export Logs
```http
GET /api/requests/export?requestId={optional-request-id}
Authorization: Bearer <admin-token>
```

## Request Log Structure

Each request log contains the following information:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "shortId": "a1b2c3d4e5f6g7h8",
  "timestamp": 1703123456789,
  "method": "POST",
  "url": "/api/auth/login",
  "path": "/api/auth/login",
  "query": {},
  "headers": {
    "content-type": "application/json",
    "authorization": "[REDACTED]",
    "user-agent": "Mozilla/5.0..."
  },
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "body": {
    "username": "admin",
    "password": "[REDACTED]"
  },
  "status": 200,
  "responseTime": 45,
  "error": null,
  "completed": true,
  "responseBody": "{\"success\":true,\"token\":\"...\"}"
}
```

## Response Headers

The system automatically adds these headers to all responses:

```
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
X-Request-ID-Short: a1b2c3d4e5f6g7h8
```

## Admin Dashboard Integration

The Request Tracker component provides a modern web interface for viewing and analyzing request data:

### Features:
- **Real-time Statistics**: Live counters for total, completed, pending, and error requests
- **Advanced Filtering**: Filter by method, status, path, and completion status
- **Detailed View**: Modal popup with complete request/response details
- **Export Functionality**: Download logs as JSON files
- **Auto-refresh**: Updates every 5 seconds

### Access:
Navigate to `/admin` and look for the "Request Tracker" section.

## Security Considerations

### Data Sanitization
The system automatically redacts sensitive information:

**Headers:**
- `authorization`
- `cookie`
- `x-api-key`
- `x-auth-token`

**Body Fields:**
- `password`
- `token`
- `secret`
- `key`
- `auth`

### Access Control
- All tracking endpoints require admin authentication
- Request logs are stored in memory only (not persisted to disk)
- Automatic cleanup prevents memory leaks

### Privacy
- IP addresses are logged for debugging but can be filtered
- User agents are logged for compatibility analysis
- Response bodies are truncated to prevent excessive memory usage

## Performance Impact

### Minimal Overhead
- Request tracking adds minimal latency (< 1ms per request)
- Memory usage is controlled by configurable limits
- Automatic cleanup prevents memory leaks

### Monitoring
- Track the impact using the built-in performance monitoring
- Monitor memory usage in the admin dashboard
- Adjust `MAX_REQUEST_LOG_SIZE` based on your needs

## Troubleshooting

### Common Issues

**High Memory Usage:**
- Reduce `MAX_REQUEST_LOG_SIZE`
- Decrease `REQUEST_LOG_RETENTION_MS`
- Check for memory leaks in your application

**Missing Request Logs:**
- Verify `DEBUG_MODE` is enabled
- Check admin authentication
- Ensure the tracking middleware is loaded early in the chain

**Slow Performance:**
- Disable debug mode in production
- Reduce log retention time
- Filter logs more aggressively

### Debug Commands

```bash
# Check if tracking is enabled
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/requests/stats

# View recent logs
curl -H "Authorization: Bearer <token>" "http://localhost:3000/api/requests/logs?limit=10"

# Export logs for analysis
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/requests/export -o logs.json
```

## Integration Examples

### Client-Side Tracking
```javascript
// Extract request ID from response headers
fetch('/api/users')
  .then(response => {
    const requestId = response.headers.get('X-Request-ID');
    console.log('Request ID:', requestId);
    return response.json();
  });
```

### Error Correlation
```javascript
// Include request ID in error reports
window.addEventListener('error', (event) => {
  const requestId = document.querySelector('meta[name="request-id"]')?.content;
  console.error('Error with request ID:', requestId, event.error);
});
```

### Performance Monitoring
```javascript
// Track response times
const startTime = performance.now();
fetch('/api/data')
  .then(response => {
    const responseTime = performance.now() - startTime;
    const requestId = response.headers.get('X-Request-ID');
    console.log(`Request ${requestId} took ${responseTime}ms`);
  });
```

## Best Practices

1. **Production Use**: Disable debug mode in production to reduce console noise
2. **Memory Management**: Monitor memory usage and adjust log size limits
3. **Security**: Regularly review logged data for sensitive information
4. **Performance**: Use filters to reduce log volume for high-traffic applications
5. **Backup**: Export important logs before clearing them

## Future Enhancements

- **Database Storage**: Persistent storage for long-term analysis
- **Real-time Alerts**: Notifications for high error rates or slow responses
- **Analytics Dashboard**: Advanced charts and trend analysis
- **Integration**: Connect with external monitoring tools
- **Custom Fields**: Allow applications to add custom tracking data
