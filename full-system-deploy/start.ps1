# BeamFlow Full System Start Script (PowerShell)

Write-Host "🚀 Starting BeamFlow Full System..." -ForegroundColor Green

# Set environment
$env:NODE_ENV = "production"

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Start the backend server
Write-Host "🔒 Starting secret system..." -ForegroundColor Yellow
node api.js

Write-Host "✅ BeamFlow Full System started!" -ForegroundColor Green
Write-Host "📖 Public site: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔐 Admin panel: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "📊 Health check: http://localhost:3000/api/health" -ForegroundColor Cyan
