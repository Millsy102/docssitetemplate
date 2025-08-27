#!/bin/bash

# Prometheus Metrics Stack Startup Script
# This script starts the complete metrics monitoring stack

echo "🚀 Starting Prometheus Metrics Stack..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p grafana/dashboards
mkdir -p grafana/datasources

# Copy configuration files if they don't exist
if [ ! -f grafana/datasources/prometheus.yml ]; then
    echo "📋 Setting up Grafana datasource..."
    cat > grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF
fi

if [ ! -f grafana/dashboards/dashboard.yml ]; then
    echo "📊 Setting up Grafana dashboard provider..."
    cat > grafana/dashboards/dashboard.yml << EOF
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
EOF
fi

# Start the metrics stack
echo "🔧 Starting services..."
docker-compose -f docker-compose.metrics.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "🔍 Checking service status..."

# Check Prometheus
if curl -s http://localhost:9090/api/v1/status/config > /dev/null; then
    echo "✅ Prometheus is running at http://localhost:9090"
else
    echo "❌ Prometheus failed to start"
fi

# Check Grafana
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Grafana is running at http://localhost:3000"
    echo "   Username: admin"
    echo "   Password: admin"
else
    echo "❌ Grafana failed to start"
fi

# Check Socket.IO server
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Socket.IO server is running at http://localhost:3001"
    echo "   Metrics endpoint: http://localhost:3001/metrics"
else
    echo "❌ Socket.IO server failed to start"
fi

echo ""
echo "🎉 Metrics stack is ready!"
echo ""
echo "📊 Access your dashboards:"
echo "   Prometheus: http://localhost:9090"
echo "   Grafana:    http://localhost:3000 (admin/admin)"
echo "   Metrics:    http://localhost:3001/metrics"
echo ""
echo "🛠️  To stop the stack, run:"
echo "   docker-compose -f docker-compose.metrics.yml down"
echo ""
echo "📖 For more information, see: PROMETHEUS_METRICS_SETUP.md"
