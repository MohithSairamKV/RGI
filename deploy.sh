#!/bin/bash

# Enable error handling
set -e

# Navigate to the frontend directory
cd my-frontend

# Install frontend dependencies
npm install

# Build the frontend
npm run build

# Serve the frontend build
npx serve -s build -l $PORT &

# Navigate to the backend directory
cd ../my-backend

# Install backend dependencies
npm install

# Ensure pm2 is installed
npm install pm2 -g

# Start the backend server using pm2 and respect the PORT environment variable
pm2 start server.js --name backend -- --port $PORT

echo "Deployment script finished."
