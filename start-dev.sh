#!/bin/bash
# Quick start script for SciPDFReader development

echo "🚀 Starting SciPDFReader Development Environment"
echo "================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

if [ $? -eq 0 ]; then
    echo "✅ Compilation successful!"
    echo ""
    echo "🎯 Starting application..."
    npm start
else
    echo "❌ Compilation failed. Please check the errors above."
    exit 1
fi
