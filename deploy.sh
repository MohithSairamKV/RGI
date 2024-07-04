#!/bin/sh

# Navigate to the frontend directory
cd my-frontend

# Install frontend dependencies and build the project
npm install
npm run build

# Navigate to the backend directory
cd ../my-backend

# Install backend dependencies
npm install

# Start the backend server
node server.js
