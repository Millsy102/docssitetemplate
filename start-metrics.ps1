# Prometheus Metrics Stack Startup Script for Windows
# This script starts the complete metrics monitoring stack

Write-Host "🚀 Starting Prometheus Metrics Stack..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if docker-compose is available
try {
    docker-compose --version | Out-Null
} catch {
    Write-Host "❌ docker-compose is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Create necessary directories
Write-Host "📁 Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "grafana/dashboards" | Out-Null
New-Item -ItemType Directory -Force -Path "grafana/datasources" | Out-Null

# Copy configuration files if they don't exist
if (-not (Test-Path "grafana/datasources/prometheus.yml")) {
    Write-Host "📋 Setting up Grafana datasource..." -ForegroundColor Yellow
    @"
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
"@ | Out-File -FilePath "grafana/datasources/prometheus.yml" -Encoding UTF8
}

if (-not (Test-Path "grafana/dashboards/dashboard.yml")) {
    Write-Host "📊 Setting up Grafana dashboard provider..." -ForegroundColor Yellow
    @"
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
"@ | Out-File -FilePath "grafana/dashboards/dashboard.yml" -Encoding UTF8
}

# Start the metrics stack
Write-Host "🔧 Starting services..." -ForegroundColor Yellow
docker-compose -f docker-compose.metrics.yml up -d

# Wait for services to start
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host "🔍 Checking service status..." -ForegroundColor Yellow

# Check Prometheus
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9090/api/v1/status/config" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Prometheus is running at http://localhost:9090" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Prometheus failed to start" -ForegroundColor Red
}

# Check Grafana
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Grafana is running at http://localhost:3000" -ForegroundColor Green
        Write-Host "   Username: admin" -ForegroundColor Cyan
        Write-Host "   Password: admin" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Grafana failed to start" -ForegroundColor Red
}

# Check Socket.IO server
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Socket.IO server is running at http://localhost:3001" -ForegroundColor Green
        Write-Host "   Metrics endpoint: http://localhost:3001/metrics" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Socket.IO server failed to start" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Metrics stack is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Access your dashboards:" -ForegroundColor Cyan
Write-Host "   Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "   Grafana:    http://localhost:3000 (admin/admin)" -ForegroundColor White
Write-Host "   Metrics:    http://localhost:3001/metrics" -ForegroundColor White
Write-Host ""
Write-Host "🛠️  To stop the stack, run:" -ForegroundColor Yellow
Write-Host "   docker-compose -f docker-compose.metrics.yml down" -ForegroundColor White
Write-Host ""
Write-Host "📖 For more information, see: PROMETHEUS_METRICS_SETUP.md" -ForegroundColor Cyan
