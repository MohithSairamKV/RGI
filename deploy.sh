#!/bin/sh

# Navigate to the frontend directory
cd my-frontend

# Install frontend dependencies and build the project
npm install

# Check if build script exists in package.json
if npm run | grep -q 'build'; then
  npm run build
else
  echo "No build script found in package.json"
fi

# Navigate to the backend directory
cd ../my-backend

# Install backend dependencies
npm install

# Start the backend server
node server.js
