#!/bin/bash
# BeamFlow Full System Start Script

echo "🚀 Starting BeamFlow Full System..."

# Set environment
export NODE_ENV="production"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start the backend server
echo "🔒 Starting secret system..."
node api.js

echo "✅ BeamFlow Full System started!"
echo "📖 Public site: http://localhost:3000"
echo "🔐 Admin panel: http://localhost:3000/admin"
echo "📊 Health check: http://localhost:3000/api/health"
