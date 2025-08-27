@echo off
echo 🚀 Running BeamFlow Deployment Fix Script...
echo.

powershell -ExecutionPolicy Bypass -File "fix-deployment.ps1"

echo.
echo ✅ Script completed! Press any key to exit...
pause >nul

