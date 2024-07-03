#!/bin/bash

# Enable error handling
set -e

# Navigate to the frontend directory
cd my-frontend

# Install frontend dependencies
npm install

# Build the frontend
npm run build

# Serve the frontend build on the port specified by Azure
npx serve -s build -l $PORT &

# Navigate to the backend directory
cd ../my-backend

# Install backend dependencies
npm install

# Start the backend server
node server.js
