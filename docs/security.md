# Security Guide

This guide covers security best practices, common vulnerabilities, and security features in Project Name.

## Security Overview

Project Name is designed with security as a top priority. This guide helps you understand and implement security measures to protect your applications.

## Security Principles

### Defense in Depth

Implement multiple layers of security controls:

```javascript
// Multiple security layers
const app = new ProjectName({
  security: {
    // Layer 1: Input validation
    validation: true,
    
    // Layer 2: Authentication
    authentication: {
      enabled: true,
      strategies: ['jwt', 'session']
    },
    
    // Layer 3: Authorization
    authorization: {
      enabled: true,
      policies: ['rbac', 'abac']
    },
    
    // Layer 4: Rate limiting
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  }
});
```

### Principle of Least Privilege

Grant only the minimum permissions necessary:

```javascript
// Role-based access control
const roles = {
  user: {
    permissions: ['read:own', 'write:own']
  },
  moderator: {
    permissions: ['read:all', 'write:own', 'delete:own']
  },
  admin: {
    permissions: ['read:all', 'write:all', 'delete:all']
  }
};
```

## Authentication

### JWT Authentication

```javascript
const jwt = require('jsonwebtoken');

class JWTAuth {
  constructor(secret) {
    this.secret = secret;
  }
  
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      },
      this.secret,
      { 
        expiresIn: '24h',
        issuer: 'project-name',
        audience: 'project-name-users'
      }
    );
  }
  
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret, {
        issuer: 'project-name',
        audience: 'project-name-users'
      });
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  }
}
```

### Session Management

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const sessionConfig = {
  store: new RedisStore({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    ttl: 86400 // 24 hours
  }),
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  resave: false,
  saveUninitialized: false
};
```

### Multi-Factor Authentication

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class MFA {
  generateSecret(user) {
    const secret = speakeasy.generateSecret({
      name: `Project Name (${user.email})`,
      issuer: 'Project Name'
    });
    
    return {
      secret: secret.base32,
      qrCode: await QRCode.toDataURL(secret.otpauth_url)
    };
  }
  
  verifyToken(token, secret) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps tolerance
    });
  }
}
```

## Authorization

### Role-Based Access Control (RBAC)

```javascript
class RBAC {
  constructor() {
    this.roles = new Map();
    this.permissions = new Map();
  }
  
  defineRole(role, permissions) {
    this.roles.set(role, permissions);
  }
  
  hasPermission(user, resource, action) {
    const userRole = user.role;
    const rolePermissions = this.roles.get(userRole) || [];
    
    return rolePermissions.some(permission => 
      permission.resource === resource && 
      permission.action === action
    );
  }
  
  // Middleware for route protection
  requirePermission(resource, action) {
    return (req, res, next) => {
      if (this.hasPermission(req.user, resource, action)) {
        next();
      } else {
        res.status(403).json({ error: 'Insufficient permissions' });
      }
    };
  }
}
```

### Attribute-Based Access Control (ABAC)

```javascript
class ABAC {
  constructor() {
    this.policies = [];
  }
  
  addPolicy(policy) {
    this.policies.push(policy);
  }
  
  evaluate(user, resource, action, context) {
    return this.policies.some(policy => {
      return this.matchesPolicy(policy, user, resource, action, context);
    });
  }
  
  matchesPolicy(policy, user, resource, action, context) {
    return (
      policy.subject.matches(user) &&
      policy.resource.matches(resource) &&
      policy.action.matches(action) &&
      policy.condition.evaluate(context)
    );
  }
}
```

## Input Validation

### Schema Validation

```javascript
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .max(254),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required(),
  
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
});

class Validator {
  validate(data, schema) {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });
    
    if (error) {
      throw new ValidationError(error.details);
    }
    
    return value;
  }
}
```

### SQL Injection Prevention

```javascript
// Use parameterized queries
class DatabaseService {
  async findUser(email) {
    // GOOD: Parameterized query
    const query = 'SELECT * FROM users WHERE email = ?';
    return await this.db.query(query, [email]);
  }
  
  async findUserBad(email) {
    // BAD: String concatenation (vulnerable to SQL injection)
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    return await this.db.query(query);
  }
}
```

### XSS Prevention

```javascript
const xss = require('xss');

class XSSProtection {
  sanitizeInput(input) {
    return xss(input, {
      whiteList: {}, // No HTML allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }
  
  sanitizeOutput(data) {
    if (typeof data === 'string') {
      return this.sanitizeInput(data);
    }
    
    if (typeof data === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeOutput(value);
      }
      return sanitized;
    }
    
    return data;
  }
}
```

## Data Protection

### Encryption

```javascript
const crypto = require('crypto');

class Encryption {
  constructor(key) {
    this.algorithm = 'aes-256-gcm';
    this.key = crypto.scryptSync(key, 'salt', 32);
  }
  
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(
      this.algorithm, 
      this.key
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### Password Hashing

```javascript
const bcrypt = require('bcrypt');

class PasswordManager {
  constructor(saltRounds = 12) {
    this.saltRounds = saltRounds;
  }
  
  async hashPassword(password) {
    return await bcrypt.hash(password, this.saltRounds);
  }
  
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
  
  async needsRehash(hash) {
    return await bcrypt.getRounds(hash) < this.saltRounds;
  }
}
```

## Rate Limiting

### IP-Based Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const limiter = rateLimit({
  store: new RedisStore({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply to all requests
app.use(limiter);

// Apply to specific routes
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 // limit each IP to 5 requests per windowMs
}));
```

### User-Based Rate Limiting

```javascript
class UserRateLimiter {
  constructor() {
    this.limits = new Map();
  }
  
  async checkLimit(userId, action, limit) {
    const key = `${userId}:${action}`;
    const current = await this.getCurrentCount(key);
    
    if (current >= limit) {
      throw new RateLimitError('Rate limit exceeded');
    }
    
    await this.incrementCount(key);
    return true;
  }
  
  async getCurrentCount(key) {
    // Implementation depends on your storage backend
    return await redis.get(key) || 0;
  }
  
  async incrementCount(key) {
    // Implementation depends on your storage backend
    return await redis.incr(key);
  }
}
```

## Security Headers

### HTTP Security Headers

```javascript
const helmet = require('helmet');

// Basic security headers
app.use(helmet());

// Custom security headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
}));

app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.frameguard({ action: 'deny' }));
```

### CORS Configuration

```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://yourdomain.com',
      'https://app.yourdomain.com'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count']
};

app.use(cors(corsOptions));
```

## Logging and Monitoring

### Security Event Logging

```javascript
const winston = require('winston');

class SecurityLogger {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ 
          filename: 'security.log',
          level: 'info'
        })
      ]
    });
  }
  
  logSecurityEvent(event, details) {
    this.logger.info('Security Event', {
      event,
      details,
      timestamp: new Date().toISOString(),
      ip: details.ip,
      user: details.user,
      userAgent: details.userAgent
    });
  }
  
  logFailedLogin(ip, username, reason) {
    this.logSecurityEvent('failed_login', {
      ip,
      username,
      reason,
      userAgent: req.headers['user-agent']
    });
  }
  
  logSuspiciousActivity(ip, activity, details) {
    this.logSecurityEvent('suspicious_activity', {
      ip,
      activity,
      details,
      userAgent: req.headers['user-agent']
    });
  }
}
```

### Intrusion Detection

```javascript
class IntrusionDetector {
  constructor() {
    this.patterns = [
      {
        name: 'SQL Injection',
        pattern: /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
        severity: 'high'
      },
      {
        name: 'XSS Attack',
        pattern: /<script[^>]*>.*?<\/script>/i,
        severity: 'high'
      },
      {
        name: 'Path Traversal',
        pattern: /\.\.\//,
        severity: 'medium'
      }
    ];
  }
  
  detectThreats(input) {
    const threats = [];
    
    for (const pattern of this.patterns) {
      if (pattern.pattern.test(input)) {
        threats.push({
          type: pattern.name,
          severity: pattern.severity,
          input: input.substring(0, 100) // Truncate for logging
        });
      }
    }
    
    return threats;
  }
  
  handleThreats(threats, req) {
    threats.forEach(threat => {
      this.logger.logSuspiciousActivity(
        req.ip,
        threat.type,
        { severity: threat.severity, input: threat.input }
      );
      
      if (threat.severity === 'high') {
        // Block IP temporarily
        this.blockIP(req.ip, 3600000); // 1 hour
      }
    });
  }
}
```

## Security Testing

### Automated Security Testing

```javascript
const { exec } = require('child_process');

class SecurityTester {
  async runSecurityTests() {
    const tests = [
      this.runDependencyAudit(),
      this.runCodeAnalysis(),
      this.runPenetrationTests()
    ];
    
    const results = await Promise.all(tests);
    return this.aggregateResults(results);
  }
  
  async runDependencyAudit() {
    return new Promise((resolve, reject) => {
      exec('npm audit --json', (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(stdout));
        }
      });
    });
  }
  
  async runCodeAnalysis() {
    // Run ESLint security rules
    return new Promise((resolve, reject) => {
      exec('npx eslint . --config .eslintrc.security.js', (error, stdout) => {
        if (error) {
          resolve({ vulnerabilities: stdout.split('\n').filter(line => line.trim()) });
        } else {
          resolve({ vulnerabilities: [] });
        }
      });
    });
  }
}
```

## Compliance

### GDPR Compliance

```javascript
class GDPRCompliance {
  constructor() {
    this.dataRetentionPolicies = {
      userData: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      logs: 90 * 24 * 60 * 60 * 1000, // 90 days
      analytics: 2 * 365 * 24 * 60 * 60 * 1000 // 2 years
    };
  }
  
  async processDataRequest(userId, requestType) {
    switch (requestType) {
      case 'export':
        return await this.exportUserData(userId);
      case 'delete':
        return await this.deleteUserData(userId);
      case 'rectify':
        return await this.rectifyUserData(userId);
      default:
        throw new Error('Invalid request type');
    }
  }
  
  async exportUserData(userId) {
    const userData = await this.collectUserData(userId);
    return {
      format: 'json',
      data: userData,
      timestamp: new Date().toISOString()
    };
  }
  
  async deleteUserData(userId) {
    // Anonymize or delete user data
    await this.anonymizeUser(userId);
    await this.deleteUserLogs(userId);
    await this.deleteUserAnalytics(userId);
    
    return { status: 'deleted', timestamp: new Date().toISOString() };
  }
}
```

## Security Checklist

### Development Checklist

- [ ] Input validation on all endpoints
- [ ] Output encoding for XSS prevention
- [ ] Parameterized queries for database operations
- [ ] Secure session management
- [ ] HTTPS enforcement in production
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Error handling without information disclosure
- [ ] Logging of security events
- [ ] Regular dependency updates

### Deployment Checklist

- [ ] Environment variables for sensitive data
- [ ] Database connection encryption
- [ ] File system permissions secured
- [ ] Network access controls
- [ ] Monitoring and alerting configured
- [ ] Backup encryption
- [ ] SSL/TLS certificates valid
- [ ] Security scanning tools integrated
- [ ] Incident response plan documented

---

For more information about implementing these security measures, refer to the [API Reference](api-reference.md) and [User Guide](user-guide.md).
