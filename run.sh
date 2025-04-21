#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}Warning:${NC} $1"
}

# Function to print error messages
print_error() {
    echo -e "${RED}Error:${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18.0 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
if [ $(echo "$NODE_VERSION 18.0" | awk '{print ($1 < $2)}') -eq 1 ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please upgrade to version 18.0 or higher."
    exit 1
fi

# Clean up function
cleanup() {
    print_status "Cleaning up..."
    
    # Remove node_modules and package-lock.json
    if [ -d "node_modules" ]; then
        rm -rf node_modules
    fi
    if [ -f "package-lock.json" ]; then
        rm package-lock.json
    fi
    
    # Clean Next.js cache
    if [ -d ".next" ]; then
        rm -rf .next
    fi
    
    print_status "Cleanup complete"
}

# Create necessary directories
create_directories() {
    print_status "Creating required directories..."
    mkdir -p data uploads
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
}

# Build the application
build_app() {
    print_status "Building the application..."
    npm run build
}

# Main execution
print_status "Starting ScanNReimburse setup..."

# Check if this is a fresh clone or existing installation
if [ ! -d "node_modules" ]; then
    print_status "Fresh installation detected"
    create_directories
    install_dependencies
    build_app
else
    print_warning "Existing installation detected"
    read -p "Do you want to clean and reinstall dependencies? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cleanup
        install_dependencies
        build_app
    fi
fi

# Start the application
print_status "Starting the application..."
npm run dev 