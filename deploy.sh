#!/bin/bash

# Enable error handling
set -e

# Log start of the script
echo "Starting deployment script..."

# Navigate to the frontend directory
echo "Navigating to frontend directory..."
cd my-frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Build the frontend
echo "Building the frontend..."
npm run build

# Serve the frontend build
echo "Serving the frontend build..."
npx serve -s build -l 3000 --name frontend &

# Navigate to the backend directory
echo "Navigating to backend directory..."
cd ../my-backend

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Ensure pm2 is installed
echo "Installing PM2..."
npm install pm2 -g

# Start the backend server using pm2 and respect the PORT environment variable
echo "Starting the backend server with PM2..."
pm2 start server.js --name backend -- --port $PORT

# Log end of the script
echo "Deployment script finished."
