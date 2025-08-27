# BeamFlow Rate Limiting System

## Overview

The BeamFlow backend implements a comprehensive rate limiting system to protect against API abuse, brute force attacks, and ensure fair resource usage. The system provides multiple layers of protection with different limits for different types of requests and users.

## Features

### Multi-Layer Protection
- **Global Rate Limiting**: Basic protection for all requests
- **API Rate Limiting**: Stricter limits for API endpoints
- **Authentication Rate Limiting**: Very strict limits for login attempts
- **Admin Rate Limiting**: More permissive limits for admin users
- **File Upload Rate Limiting**: Strict limits for file operations
- **Search Rate Limiting**: Moderate limits for search operations
- **Speed Limiting**: Gradual slowdown instead of hard blocking

### Advanced Features
- **IP Whitelisting**: Bypass rate limiting for trusted IPs
- **IP Blacklisting**: Completely block malicious IPs
- **Redis Support**: Distributed rate limiting across multiple servers
- **Environment-Specific Configuration**: Different limits for dev/prod/test
- **Comprehensive Logging**: Track rate limit violations
- **Admin Management**: Monitor and reset rate limits via API

## Configuration

### Environment Variables

```bash
# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# Rate Limiting Configuration
RATE_LIMIT_WHITELIST=192.168.1.1,10.0.0.1
RATE_LIMIT_BLACKLIST=malicious.ip.address
RATE_LIMIT_LOGGING=true
RATE_LIMIT_LOG_LEVEL=warn
```

### Default Limits

| Limiter Type | Window | Max Requests | Description |
|--------------|--------|--------------|-------------|
| Global | 15 min | 1000 | General traffic protection |
| API | 15 min | 500 | API endpoint protection |
| Auth | 15 min | 5 | Login attempt protection |
| Admin | 15 min | 2000 | Admin user operations |
| Upload | 1 hour | 10 | File upload protection |
| Search | 5 min | 100 | Search operation protection |
| Speed Limit | 15 min | 50 | Gradual slowdown threshold |

### Environment-Specific Overrides

The system automatically adjusts limits based on the `NODE_ENV` environment variable:

- **Development**: More permissive limits for testing
- **Production**: Standard security limits
- **Testing**: Very permissive limits for automated tests

## Implementation Details

### Rate Limiter Classes

#### BeamRateLimiter
The main rate limiting class that manages all limiters and provides:
- Automatic Redis connection (if available)
- Environment-specific configuration
- IP whitelist/blacklist support
- Comprehensive logging
- Admin management endpoints

#### Configuration File
Located at `src/config/rate-limit-config.js`, this file contains all rate limiting settings and can be easily customized.

### Middleware Integration

The rate limiting system is integrated into the Express.js middleware stack:

```javascript
// Apply comprehensive rate limiting
this.rateLimiter.applyRateLimiting(this.app);
```

### Key Generation Strategy

The system uses intelligent key generation based on request context:

1. **IP-based**: For general protection and auth limiting
2. **API Key-based**: For API endpoints with authentication
3. **Token-based**: For admin operations
4. **Whitelist/Blacklist**: Special handling for trusted/blocked IPs

## API Endpoints

### Rate Limiting Management (Admin Only)

#### Get Rate Limiting Statistics
```
GET /api/rate-limit/stats
Authorization: Bearer <admin-token>
```

Response:
```json
{
  "global": {
    "windowMs": 900000,
    "max": 1000
  },
  "api": {
    "windowMs": 900000,
    "max": 500
  },
  "auth": {
    "windowMs": 900000,
    "max": 5
  },
  "admin": {
    "windowMs": 900000,
    "max": 2000
  },
  "upload": {
    "windowMs": 3600000,
    "max": 10
  },
  "search": {
    "windowMs": 300000,
    "max": 100
  },
  "speedLimiter": {
    "windowMs": 900000,
    "delayAfter": 50,
    "delayMs": 500,
    "maxDelayMs": 20000
  }
}
```

#### Get Rate Limit Status for Specific Key
```
GET /api/rate-limit/status/:key/:type
Authorization: Bearer <admin-token>
```

Parameters:
- `key`: IP address, API key, or token
- `type`: Limiter type (global, api, auth, admin, upload, search)

#### Reset Rate Limit for Specific Key
```
POST /api/rate-limit/reset/:key/:type
Authorization: Bearer <admin-token>
```

## Error Responses

When rate limits are exceeded, the system returns HTTP 429 (Too Many Requests) with detailed information:

```json
{
  "error": "API rate limit exceeded. Please try again later.",
  "retryAfter": 900,
  "limit": 500,
  "remaining": 0
}
```

## Headers

The system includes standard rate limiting headers in responses:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when the limit resets (Unix timestamp)
- `Retry-After`: Seconds to wait before retrying

## Security Features

### Brute Force Protection
- Very strict limits on authentication endpoints
- IP-based tracking for login attempts
- Automatic blocking after repeated failures

### DDoS Protection
- Global rate limiting prevents overwhelming the server
- Speed limiting provides gradual degradation instead of hard failures
- Redis support for distributed protection across multiple servers

### IP Management
- Whitelist trusted IPs (development servers, monitoring tools)
- Blacklist known malicious IPs
- Automatic detection of proxy headers

## Monitoring and Logging

### Logging Configuration
```javascript
logging: {
  enabled: process.env.RATE_LIMIT_LOGGING === 'true',
  level: process.env.RATE_LIMIT_LOG_LEVEL || 'warn',
  logBlockedRequests: true,
  logWhitelistedRequests: false
}
```

### Metrics Integration
Rate limiting statistics are included in the main metrics endpoint:
```
GET /metrics
```

## Best Practices

### Configuration
1. **Start Conservative**: Begin with strict limits and adjust based on usage
2. **Monitor Usage**: Regularly check rate limiting statistics
3. **Whitelist Trusted IPs**: Add development and monitoring IPs to whitelist
4. **Use Redis in Production**: Enable Redis for distributed rate limiting

### Monitoring
1. **Track Violations**: Monitor rate limit violations for patterns
2. **Adjust Limits**: Fine-tune limits based on legitimate usage patterns
3. **Alert on Abuse**: Set up alerts for unusual rate limiting activity

### Security
1. **Regular Review**: Periodically review whitelist and blacklist
2. **Log Analysis**: Analyze logs for attack patterns
3. **Limit Adjustments**: Adjust limits based on security incidents

## Troubleshooting

### Common Issues

#### Rate Limits Too Strict
- Check environment-specific configuration
- Review legitimate usage patterns
- Consider whitelisting trusted IPs

#### Redis Connection Issues
- Verify Redis URL configuration
- Check Redis server status
- System falls back to in-memory storage

#### Performance Impact
- Monitor rate limiting overhead
- Consider adjusting window sizes
- Use Redis for better performance

### Debug Mode
Enable detailed logging by setting:
```bash
RATE_LIMIT_LOGGING=true
RATE_LIMIT_LOG_LEVEL=debug
```

## Migration from Basic Rate Limiting

The new system replaces the basic rate limiting in `BeamSecurity.js` with a comprehensive solution. The migration is automatic and backward-compatible.

### Changes Made
1. **Enhanced Configuration**: Centralized configuration file
2. **Multiple Limiters**: Different limits for different endpoint types
3. **Advanced Features**: Whitelist, blacklist, Redis support
4. **Better Monitoring**: Comprehensive statistics and management endpoints
5. **Improved Security**: Better brute force and DDoS protection

## Future Enhancements

Potential improvements for future versions:
- Machine learning-based rate limiting
- Geographic-based rate limiting
- User behavior analysis
- Advanced threat detection
- Integration with security monitoring systems
