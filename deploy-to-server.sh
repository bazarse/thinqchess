#!/bin/bash

echo "🚀 ThinQ Chess - Server Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Pull latest code
print_status "Pulling latest code from GitHub..."
if git pull origin main; then
    print_status "Code updated successfully"
else
    print_error "Failed to pull code from GitHub"
    exit 1
fi

# Step 2: Install dependencies
print_status "Installing dependencies..."
if npm install; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 3: Build the project
print_status "Building the project..."
if npm run build; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 4: Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found. Installing PM2..."
    npm install -g pm2
fi

# Step 5: Stop existing process (if any)
print_status "Stopping existing processes..."
pm2 stop all 2>/dev/null || true

# Step 6: Start the application
print_status "Starting the application..."
if npm run start:server; then
    print_status "Application started successfully"
else
    print_error "Failed to start application"
    exit 1
fi

print_status "🎉 Deployment completed successfully!"
print_status "Your application is now running on: http://93.127.199.194:3000"
print_status "Admin panel: http://93.127.199.194:3000/admin"

echo ""
echo "📋 Quick Commands:"
echo "  - Check logs: pm2 logs"
echo "  - Restart app: pm2 restart all"
echo "  - Stop app: pm2 stop all"
echo "  - App status: pm2 status"
