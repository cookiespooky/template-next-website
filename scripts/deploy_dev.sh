
#!/bin/bash

# Development Environment Quick Deploy Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[DEV DEPLOY]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

cd "$PROJECT_ROOT"

log "Starting development environment deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop existing containers
log "Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Build and start services
log "Building and starting services..."
docker-compose -f docker-compose.dev.yml up -d --build

# Wait for services to be ready
log "Waiting for services to be ready..."
sleep 15

# Run database migrations
log "Running database migrations..."
docker-compose -f docker-compose.dev.yml exec -T app-dev npx prisma migrate deploy

# Seed database (optional)
if [[ "$1" == "--seed" ]]; then
    log "Seeding database..."
    docker-compose -f docker-compose.dev.yml exec -T app-dev npm run seed
fi

# Show status
log "Checking service status..."
docker-compose -f docker-compose.dev.yml ps

success "Development environment is ready!"
echo
echo "🚀 Application URLs:"
echo "   Main App: http://localhost:3000"
echo "   Nginx:    http://localhost"
echo "   Database: localhost:5432"
echo "   Redis:    localhost:6379"
echo
echo "📋 Useful commands:"
echo "   View logs:    docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop:         docker-compose -f docker-compose.dev.yml down"
echo "   Restart:      docker-compose -f docker-compose.dev.yml restart"
echo "   Shell:        docker-compose -f docker-compose.dev.yml exec app-dev sh"
