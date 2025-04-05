
#!/bin/bash

while getopts s:e: flag
do
    case "${flag}" in
        s) server=${OPTARG};;   # Server IP or hostname
        e) env=${OPTARG};;      # Environment (e.g., staging, production)
    esac
done

# Check if server is provided
if [ -z "$server" ]; then
    echo "Missing server name"
    exit 1
fi

# Check if environment is provided
if [ -z "$env" ]; then
    echo "Missing environment name"
    exit 1
fi

echo "Deploying Mm Dex to $server ($env)..."

# Build application
echo "Building Mm Dex application..."
npm install
npm run build  # Change this if your build command is different

# Copy the typeorm.config.ts to the server
echo "Copying typeorm.config.ts to server..."
scp src/libs/typeorm.config.ts "$server":/var/www/mm-dex-api/src/libs/

# Generate Typechain types (or any other build command you need)
echo "Generating Typechain types..."
npm run typechain:gen

# Create a tarball of necessary files
echo "Creating tarball..."
tar czf mm-dex-app.tar.gz dist package.json package-lock.json || {
    echo "Error: Failed to create tarball!"
    exit 1
}

# Transfer the tarball to the remote server
echo "Transferring files to $server..."
scp mm-dex-app.tar.gz "$server":/var/www/mm-dex-api/

# Connect to the server and deploy
echo "Deploying on $server..."
ssh "$server" << EOF
    set -e  # Exit on error

    cd /var/www/mm-dex-api/
    
    # Stop the Mm Dex service before updating files
    sudo systemctl stop mm-dex-api.service

    # Backup the current version, make sure dist is cleaned
    if [ -d "dist" ]; then
        if [ "$(ls -A dist)" ]; then
            echo "dist directory is not empty. Cleaning it up."
            sudo rm -rf dist/*  # Remove all files inside dist, but not the directory itself
        fi
        sudo mv dist dist.old  # Rename the empty dist directory
    fi

    # Extract new version
    tar xzf mm-dex-app.tar.gz
    rm mm-dex-app.tar.gz

    # Install dependencies
    npm install --omit=dev

    # Run migrations
    echo "Running migrations..."
    npm run migration:generate
    npm run migration:up


    # Restart the Mm Dex service
    sudo systemctl start mm-dex-api.service

    echo "Deployment completed!"
EOF
