#!/bin/bash

# Exit on any error
set -e

# Navigate to the backend folder and install dependencies
cd my-backend
npm install

# Start the backend server in the background
nohup npm start &

# Navigate back to the root and install frontend dependencies
cd ..
npm install

# Build the frontend application
npm run build

# Copy the build output to a suitable location for serving
cp -r build/* /home/site/wwwroot

echo "Deployment completed successfully."
