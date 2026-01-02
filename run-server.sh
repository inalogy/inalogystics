#!/bin/bash

# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "Starting InaLogystics server in background..."
echo "The server will run at http://localhost:3000"

# Start the server in background
nohup npm run dev > dev-server.log 2>&1 &

# Get the process ID
PID=$!
echo "Server started with PID: $PID"

# Wait a moment for server to start
sleep 3

# Check if server is running
if ps -p $PID > /dev/null; then
    echo "✅ Server is running successfully!"
    echo "📋 To view logs: tail -f dev-server.log"
    echo "🛑 To stop server: kill $PID"
else
    echo "❌ Server failed to start. Check dev-server.log for errors"
fi