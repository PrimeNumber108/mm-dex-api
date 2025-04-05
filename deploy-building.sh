#!/bin/bash

# Read command line options for server and environment
while getopts s:e: flag
do
    case "${flag}" in
        s) server=${OPTARG};;   # Server IP or hostname
        e) env=${OPTARG};;      # Environment (e.g., staging, production)
    esac
done

# Check if server and environment are provided
if [ -z "$server" ]; then
    echo "Missing server name"
    exit 1
fi

if [ -z "$env" ]; then
    echo "Missing environment name"
    exit 1
fi

echo "Deploying Mm Dex to $server ($env)..."

# Build the application Docker image
echo "Building Docker image..."
docker build -t mm-dex-app .

# Optional: Tag the Docker image for pushing to a remote registry (e.g., Docker Hub, ECR, etc.)
# docker tag mm-dex-app your-dockerhub-username/mm-dex-app:latest

# Optional: Push the Docker image to the Docker registry
# docker push your-dockerhub-username/mm-dex-app:latest

# Transfer the image to the server (optional, if you're using a private registry)
# docker save mm-dex-app | gzip > mm-dex-app.tar.gz
# scp mm-dex-app.tar.gz "$server":/var/www/mm-dex-api/

# Connect to the server and deploy
echo "Deploying on $server..."

ssh "$server" << EOF
    set -e  # Exit on error

    # Stop any existing containers
    echo "Stopping existing containers..."
    sudo docker stop mm-dex-api || true
    sudo docker rm mm-dex-api || true

    # Backup the current version of the dist folder
    if [ -d "/var/www/mm-dex-api/dist" ]; then
        echo "Backing up the current dist folder..."
        sudo mv /var/www/mm-dex-api/dist /var/www/mm-dex-api/dist.old
    fi

    # Pull or load the new Docker image
    echo "Pulling or loading the Docker image..."
    # If you're using a registry, you can pull the image instead of loading it
    # sudo docker pull your-dockerhub-username/mm-dex-app:latest
    sudo docker load -i /var/www/mm-dex-api/mm-dex-app.tar.gz

    # Run the new Docker container
    echo "Running the new Docker container..."
    sudo docker run -d --name mm-dex-api -p 3000:3000 mm-dex-app

    # Clean up old files (tarball)
    echo "Cleaning up old files..."
    rm /var/www/mm-dex-api/mm-dex-app.tar.gz

    echo "Deployment completed!"
EOF

