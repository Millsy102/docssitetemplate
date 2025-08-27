# Deployment Guide

This guide covers deployment strategies, environments, and best practices for Project Name applications.

## Deployment Overview

Project Name supports multiple deployment strategies and environments. This guide helps you choose the right approach for your needs.

## Deployment Strategies

### 1. Traditional Server Deployment

Deploy to traditional VPS or dedicated servers.

#### Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx or Apache web server
- SSL certificate

#### Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx
```

#### Application Deployment

```bash
# Clone repository
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name

# Install dependencies
npm ci --only=production

# Set environment variables
cp .env.example .env
nano .env

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Nginx Configuration

```nginx
# /etc/nginx/sites-available/your-app
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location /static/ {
        alias /var/www/your-app/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Container Deployment

Deploy using Docker containers for better isolation and scalability.

#### Dockerfile

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=app
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d app"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3. Cloud Platform Deployment

Deploy to cloud platforms like AWS, Google Cloud, or Azure.

#### AWS Deployment

```yaml
# serverless.yml
service: project-name

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    DATABASE_URL: ${ssm:/project-name/database-url}
    REDIS_URL: ${ssm:/project-name/redis-url}

functions:
  api:
    handler: dist/handler.api
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
    memorySize: 512
    timeout: 30

plugins:
  - serverless-offline
  - serverless-dotenv-plugin
```

#### Google Cloud Run

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/project-name:$COMMIT_SHA', '.']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/project-name:$COMMIT_SHA']
  
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'project-name'
      - '--image'
      - 'gcr.io/$PROJECT_ID/project-name:$COMMIT_SHA'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'

images:
  - 'gcr.io/$PROJECT_ID/project-name:$COMMIT_SHA'
```

## Environment Configuration

### Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/app
DATABASE_SSL=true

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key
BCRYPT_ROUNDS=12

# External Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
```

### Configuration Management

```javascript
// config/index.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`) });

const config = {
  app: {
    name: process.env.APP_NAME || 'Project Name',
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 10
    }
  },
  
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD
  },
  
  security: {
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
  },
  
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  
  features: {
    analytics: process.env.ENABLE_ANALYTICS === 'true',
    notifications: process.env.ENABLE_NOTIFICATIONS === 'true'
  }
};

module.exports = config;
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run security audit
      run: npm audit --audit-level=moderate
    
    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: yourusername/project-name:latest
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/project-name
          docker-compose pull
          docker-compose up -d
          docker system prune -f
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

test:
  stage: test
  image: node:18-alpine
  script:
    - npm ci
    - npm test
    - npm run lint
    - npm audit --audit-level=moderate

build:
  stage: build
  image: docker:20.10.16
  services:
    - docker:20.10.16-dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main

deploy:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
  script:
    - ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        cd /opt/project-name &&
        docker-compose pull &&
        docker-compose up -d &&
        docker system prune -f
      "
  only:
    - main
```

## Monitoring and Logging

### Application Monitoring

```javascript
// monitoring/index.js
const winston = require('winston');
const Sentry = require('@sentry/node');

class Monitoring {
  constructor(config) {
    this.config = config;
    this.setupLogging();
    this.setupSentry();
  }
  
  setupLogging() {
    this.logger = winston.createLogger({
      level: this.config.monitoring.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'project-name' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      ]
    });
    
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
  }
  
  setupSentry() {
    if (this.config.monitoring.sentryDsn) {
      Sentry.init({
        dsn: this.config.monitoring.sentryDsn,
        environment: process.env.NODE_ENV,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express({ app })
        ],
        tracesSampleRate: 1.0
      });
    }
  }
  
  logError(error, context = {}) {
    this.logger.error(error.message, {
      error: error.stack,
      ...context
    });
    
    if (this.config.monitoring.sentryDsn) {
      Sentry.captureException(error, { extra: context });
    }
  }
  
  logInfo(message, data = {}) {
    this.logger.info(message, data);
  }
}

module.exports = Monitoring;
```

### Health Checks

```javascript
// health/healthcheck.js
const express = require('express');
const router = express.Router();

class HealthChecker {
  constructor(services) {
    this.services = services;
  }
  
  async checkHealth() {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      external: await this.checkExternalServices()
    };
    
    const isHealthy = Object.values(checks).every(check => check.status === 'healthy');
    
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks
    };
  }
  
  async checkDatabase() {
    try {
      await this.services.database.query('SELECT 1');
      return { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  async checkRedis() {
    try {
      await this.services.redis.ping();
      return { status: 'healthy', responseTime: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
  
  async checkExternalServices() {
    // Check external API dependencies
    return { status: 'healthy' };
  }
}

// Health check endpoint
router.get('/health', async (req, res) => {
  const healthChecker = new HealthChecker(req.app.locals.services);
  const health = await healthChecker.checkHealth();
  
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

module.exports = router;
```

## Backup and Recovery

### Database Backup

```bash
#!/bin/bash
# backup.sh

# Configuration
DB_NAME="app"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_FILE.gz s3://your-bucket/backups/

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### Application Backup

```javascript
// backup/backup.js
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

class BackupManager {
  constructor(config) {
    this.config = config;
    this.backupDir = path.join(__dirname, '../backups');
  }
  
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}.zip`);
    
    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.pipe(output);
    
    // Add files to backup
    archive.file('config/production.json', { name: 'config.json' });
    archive.directory('uploads/', 'uploads');
    archive.directory('logs/', 'logs');
    
    await archive.finalize();
    
    return backupPath;
  }
  
  async restoreBackup(backupPath) {
    // Implementation for backup restoration
    console.log(`Restoring from backup: ${backupPath}`);
  }
}

module.exports = BackupManager;
```

## Performance Optimization

### Production Optimizations

```javascript
// optimization/production.js
const compression = require('compression');
const helmet = require('helmet');

class ProductionOptimizer {
  static applyOptimizations(app) {
    // Enable compression
    app.use(compression());
    
    // Security headers
    app.use(helmet());
    
    // Rate limiting
    app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }));
    
    // Static file caching
    app.use('/static', express.static('public', {
      maxAge: '1y',
      immutable: true
    }));
    
    // Database connection pooling
    this.setupDatabasePool();
    
    // Redis caching
    this.setupRedisCache();
  }
  
  static setupDatabasePool() {
    // Configure database connection pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });
    
    return pool;
  }
  
  static setupRedisCache() {
    // Configure Redis for caching
    const redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
    
    return redis;
  }
}

module.exports = ProductionOptimizer;
```

## Troubleshooting Deployment

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   sudo lsof -i :3000
   
   # Kill the process
   sudo kill -9 <PID>
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R nodejs:nodejs /opt/project-name
   sudo chmod -R 755 /opt/project-name
   ```

3. **Database Connection Issues**
   ```bash
   # Test database connection
   psql $DATABASE_URL -c "SELECT 1"
   
   # Check database logs
   sudo tail -f /var/log/postgresql/postgresql-*.log
   ```

4. **Memory Issues**
   ```bash
   # Monitor memory usage
   free -h
   top
   
   # Increase Node.js memory limit
   node --max-old-space-size=4096 app.js
   ```

### Log Analysis

```bash
# View application logs
pm2 logs

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system logs
sudo journalctl -u project-name -f
```

---

For more detailed information about specific deployment scenarios, refer to the [User Guide](user-guide.md) and [Troubleshooting Guide](troubleshooting.md).
