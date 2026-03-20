@echo off
REM Quick start script for SciPDFReader development on Windows

echo 🚀 Starting SciPDFReader Development Environment
echo ================================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM Compile TypeScript
echo 🔨 Compiling TypeScript...
call npm run compile

if %errorlevel% equ 0 (
    echo ✅ Compilation successful!
    echo.
    echo 🎯 Starting application...
    call npm start
) else (
    echo ❌ Compilation failed. Please check the errors above.
    exit /b 1
)
