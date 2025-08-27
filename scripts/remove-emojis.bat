@echo off
REM Emoji Removal Tool - Batch Wrapper
REM This script provides an easy way to run the emoji removal tool on Windows

setlocal enabledelayedexpansion

echo 🤖 Emoji Removal Tool
echo ====================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if the script exists
if not exist "%~dp0remove-emojis.js" (
    echo ❌ Error: remove-emojis.js not found in the same directory
    echo Please ensure the script is in the same folder as this batch file
    pause
    exit /b 1
)

REM Parse command line arguments
set "DRY_RUN="
set "PATTERNS="
set "EXCLUDE="

:parse_args
if "%~1"=="" goto :run
if /i "%~1"=="--dry-run" set "DRY_RUN=--dry-run"
if /i "%~1"=="-d" set "DRY_RUN=--dry-run"
if /i "%~1"=="--help" (
    node "%~dp0remove-emojis.js" --help
    pause
    exit /b 0
)
if /i "%~1"=="-h" (
    node "%~dp0remove-emojis.js" --help
    pause
    exit /b 0
)
if /i "%~1"=="--patterns" (
    set "PATTERNS=--patterns %~2"
    shift
)
if /i "%~1"=="--exclude" (
    set "EXCLUDE=--exclude %~2"
    shift
)
shift
goto :parse_args

:run
echo 🚀 Running emoji removal tool...
echo.

REM Run the Node.js script with parsed arguments
node "%~dp0remove-emojis.js" %DRY_RUN% %PATTERNS% %EXCLUDE%

if %errorlevel% equ 0 (
    echo.
    echo ✅ Emoji removal completed successfully!
) else (
    echo.
    echo ❌ Emoji removal failed with error code %errorlevel%
)

echo.
pause
