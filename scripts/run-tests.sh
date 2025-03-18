#!/bin/bash

# Kill any running Next.js dev servers
pkill -f "next dev"

# Start the development server
echo "Starting development server..."
npm run dev -- -p 3005 &

# Wait for the server to start
echo "Waiting for server to start..."
sleep 10

# Run the notification tests
echo "Running notification tests..."
node scripts/test-notifications.js

# Clean up
echo "Cleaning up..."
pkill -f "next dev"