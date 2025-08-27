# Docker Deployment Guide for BeamFlow Documentation Site

This guide provides a simplified approach to deploying your Unreal Engine plugin documentation site using Docker. The Docker setup includes production-optimized configurations with nginx, security headers, and automated deployment scripts.

## 🚀 Quick Start

### Prerequisites

1. **Docker Desktop** installed and running
2. **Git** for version control
3. **Node.js 18+** (for local development)

### One-Command Deployment

```bash
# Linux/macOS
./scripts/docker-deploy.sh deploy

# Windows PowerShell
.\scripts\docker-deploy.ps1 deploy
```

Your application will be available at `http://localhost:3000`

## 📁 Docker Files Overview

### Core Files

- **`Dockerfile`** - Multi-stage production build with nginx
- **`Dockerfile.dev`** - Development environment with hot reloading
- **`docker-compose.yml`** - Orchestration for multiple services
- **`nginx.conf`** - Optimized nginx configuration
- **`.dockerignore`** - Excludes unnecessary files from build context

### Deployment Scripts

- **`scripts/docker-deploy.sh`** - Bash script for Linux/macOS
- **`scripts/docker-deploy.ps1`** - PowerShell script for Windows

## 🔧 Available Commands

### Deployment Scripts

```bash
# Full deployment (build and start)
./scripts/docker-deploy.sh deploy

# Build only
./scripts/docker-deploy.sh build

# Start existing image
./scripts/docker-deploy.sh start

# Stop application
./scripts/docker-deploy.sh stop

# Restart application
./scripts/docker-deploy.sh restart

# Update application (rebuild and restart)
./scripts/docker-deploy.sh update

# View logs
./scripts/docker-deploy.sh logs

# Check status
./scripts/docker-deploy.sh status

# Cleanup containers
./scripts/docker-deploy.sh cleanup

# Show help
./scripts/docker-deploy.sh help
```

### Docker Compose

```bash
# Start production environment
docker-compose up -d

# Start development environment
docker-compose --profile dev up -d

# View logs
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### Direct Docker Commands

```bash
# Build image
docker build -t beamflow-docs .

# Run container
docker run -d --name beamflow-docs-frontend -p 3000:80 beamflow-docs

# View logs
docker logs beamflow-docs-frontend

# Stop container
docker stop beamflow-docs-frontend

# Remove container
docker rm beamflow-docs-frontend
```

## 🏗️ Architecture

### Production Build Process

1. **Builder Stage**: Node.js 18 Alpine
   - Installs production dependencies
   - Builds the React application
   - Optimizes assets

2. **Production Stage**: nginx Alpine
   - Serves static files
   - Handles routing for SPA
   - Applies security headers
   - Enables gzip compression

### Security Features

- **Security Headers**: XSS protection, content type options, frame options
- **CORS Policies**: Strict cross-origin policies
- **HTTPS Enforcement**: HSTS headers
- **Content Security**: No-sniff, download options

### Performance Optimizations

- **Gzip Compression**: Reduces file sizes by 60-80%
- **Caching Headers**: Long-term caching for static assets
- **Nginx Optimization**: Sendfile, tcp_nopush, keepalive
- **Asset Optimization**: Minified and chunked JavaScript/CSS

## 🔄 Development Workflow

### Local Development

```bash
# Start development environment
docker-compose --profile dev up -d

# Or use the development Dockerfile directly
docker build -f Dockerfile.dev -t beamflow-docs-dev .
docker run -d --name beamflow-docs-dev -p 3001:3000 -v $(pwd):/app beamflow-docs-dev
```

### Production Deployment

```bash
# Deploy to production
./scripts/docker-deploy.sh deploy

# Update existing deployment
./scripts/docker-deploy.sh update
```

## 🌐 Environment Configuration

### Environment Variables

The Docker setup respects your existing environment configuration:

- **`NODE_ENV`**: Set to `production` in container
- **Base URL**: Configured for GitHub Pages deployment
- **API Endpoints**: Ready for backend integration

### Customization

To customize the deployment:

1. **Port**: Change `PORT` in deployment scripts
2. **Image Name**: Modify `IMAGE_NAME` in scripts
3. **Nginx Config**: Edit `nginx.conf` for custom routing
4. **Build Process**: Modify `Dockerfile` for custom build steps

## 📊 Monitoring and Logs

### Health Checks

The container includes health checks:

```bash
# Check container health
docker inspect beamflow-docs-frontend | grep Health -A 10

# Manual health check
curl http://localhost:3000/health
```

### Logs

```bash
# View real-time logs
docker logs -f beamflow-docs-frontend

# View last 100 lines
docker logs --tail 100 beamflow-docs-frontend

# View logs with timestamps
docker logs -t beamflow-docs-frontend
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Stop conflicting service
   docker stop $(docker ps -q)
   ```

2. **Build Failures**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker build --no-cache -t beamflow-docs .
   ```

3. **Permission Issues**
   ```bash
   # Make script executable
   chmod +x scripts/docker-deploy.sh
   ```

4. **Container Won't Start**
   ```bash
   # Check container logs
   docker logs beamflow-docs-frontend
   
   # Check container status
   docker ps -a
   ```

### Debug Mode

```bash
# Run container in interactive mode
docker run -it --rm -p 3000:80 beamflow-docs /bin/sh

# Run nginx in debug mode
docker run -it --rm -p 3000:80 beamflow-docs nginx -g "daemon off;"
```

## 🚀 Production Deployment

### GitHub Actions Integration

Add this to your `.github/workflows/deploy.yml`:

```yaml
name: Deploy with Docker

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: your-registry/beamflow-docs:latest
      
      - name: Deploy to server
        run: |
          # Add your deployment commands here
          docker pull your-registry/beamflow-docs:latest
          docker-compose up -d
```

### Cloud Deployment

#### AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag beamflow-docs:latest your-account.dkr.ecr.us-east-1.amazonaws.com/beamflow-docs:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/beamflow-docs:latest
```

#### Google Cloud Run

```bash
# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/your-project/beamflow-docs
gcloud run deploy beamflow-docs --image gcr.io/your-project/beamflow-docs --platform managed
```

## 📈 Performance Monitoring

### Built-in Metrics

- **Response Time**: nginx access logs
- **Error Rate**: nginx error logs
- **Health Status**: `/health` endpoint
- **Resource Usage**: Docker stats

### Monitoring Commands

```bash
# Container resource usage
docker stats beamflow-docs-frontend

# Nginx access logs
docker exec beamflow-docs-frontend tail -f /var/log/nginx/access.log

# Nginx error logs
docker exec beamflow-docs-frontend tail -f /var/log/nginx/error.log
```

## 🔒 Security Best Practices

1. **Regular Updates**: Keep base images updated
2. **Security Scanning**: Use `docker scan` for vulnerabilities
3. **Non-root User**: Consider running nginx as non-root
4. **Secrets Management**: Use Docker secrets for sensitive data
5. **Network Security**: Use custom networks and firewalls

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [React Production Build](https://create-react-app.dev/docs/production-build/)
- [Vite Build Configuration](https://vitejs.dev/config/)

## 🤝 Contributing

To contribute to the Docker setup:

1. Test changes locally
2. Update documentation
3. Follow the existing patterns
4. Add appropriate error handling
5. Include helpful error messages

---

**Note**: This Docker setup is optimized for your Unreal Engine plugin documentation site and includes all the security headers and optimizations from your existing Vercel configuration.
