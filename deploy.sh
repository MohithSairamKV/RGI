#!/bin/bash

echo "Deploy script started..."

# Navigate to the backend directory
cd my-backend || exit

# Install backend dependencies
npm install

# Start the server
pm2 start server.js

# Navigate to the frontend directory
cd ../my-frontend || exit

# Serve the frontend build
npx serve -s build

echo "Deploy script completed."
