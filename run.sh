#!/bin/bash
set -e

echo "=== CAgent - Trainable AI Agent ==="
echo ""

# Check Ollama
if ! command -v ollama &> /dev/null; then
    OLLAMA_PATH="$HOME/.local/bin/ollama"
    if [ ! -f "$OLLAMA_PATH" ]; then
        OLLAMA_PATH="$HOME/.ollama/bin/ollama"
    fi
    if [ -f "$OLLAMA_PATH" ]; then
        export PATH="$PATH:$(dirname "$OLLAMA_PATH")"
    else
        echo "ERROR: Ollama not found. Install from https://ollama.com"
        exit 1
    fi
fi

echo "Ollama: $(ollama --version)"

# Check model
if ! ollama list 2>/dev/null | grep -q "llama3.1"; then
    echo "Pulling llama3.1 (4.9 GB)..."
    ollama pull llama3.1
fi

# Start Ollama server (background)
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "Starting Ollama server..."
    ollama serve &
    OLLAMA_PID=$!
    sleep 3
fi

echo ""
echo "Starting CAgent..."
echo ""
npx ts-node src/cli/index.ts

# Cleanup
if [ ! -z "$OLLAMA_PID" ]; then
    kill $OLLAMA_PID 2>/dev/null || true
fi
