
#!/bin/bash

# Staging Environment Deploy Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default configuration
REMOTE_USER="${REMOTE_USER:-ubuntu}"
REMOTE_HOST="${REMOTE_HOST:-staging.example.com}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/course-platform}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[STAGING DEPLOY]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if staging environment file exists
if [[ ! -f "$PROJECT_ROOT/.env.staging" ]]; then
    warning "Staging environment file (.env.staging) not found"
    warning "Make sure it exists on the remote server"
fi

log "Deploying to staging environment..."

# Confirmation
read -p "Deploy to staging environment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Deployment cancelled"
    exit 0
fi

# Create backup
log "Creating backup on staging server..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    cd $REMOTE_PATH
    mkdir -p backups
    backup_name=\"staging-backup-\$(date +%Y%m%d-%H%M%S)\"
    tar -czf backups/\$backup_name.tar.gz \
        --exclude=backups \
        --exclude=logs \
        --exclude=node_modules \
        --exclude=.git \
        .
    echo \"Backup created: \$backup_name.tar.gz\"
"

# Sync files
log "Syncing files to staging server..."
rsync -avz --delete \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=dist \
    --exclude=build \
    --exclude=logs \
    --exclude=backups \
    --exclude=.env.local \
    --exclude=.env.development.local \
    "$PROJECT_ROOT/" \
    "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

# Deploy on remote server
log "Deploying on staging server..."
ssh "$REMOTE_USER@$REMOTE_HOST" "
    cd $REMOTE_PATH
    
    # Load environment variables
    if [[ -f .env.staging ]]; then
        export \$(cat .env.staging | grep -v '^#' | xargs)
    fi
    
    # Stop existing services
    docker-compose -f docker-compose.staging.yml down
    
    # Build new images
    docker-compose -f docker-compose.staging.yml build --no-cache
    
    # Start services
    docker-compose -f docker-compose.staging.yml up -d
    
    # Wait for services
    sleep 30
    
    # Run migrations
    docker-compose -f docker-compose.staging.yml exec -T app-staging npx prisma migrate deploy
    
    # Check status
    docker-compose -f docker-compose.staging.yml ps
"

# Health check
log "Performing health check..."
sleep 10

if curl -f -s "https://staging.example.com/health" > /dev/null; then
    success "Staging deployment completed successfully!"
else
    error "Health check failed. Please check the logs."
    exit 1
fi

echo
echo "🚀 Staging Environment URLs:"
echo "   Main App: https://staging.example.com"
echo "   Health:   https://staging.example.com/health"
echo
echo "📋 Useful commands:"
echo "   View logs:    ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && docker-compose -f docker-compose.staging.yml logs -f'"
echo "   Check status: ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && docker-compose -f docker-compose.staging.yml ps'"
echo "   Restart:      ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && docker-compose -f docker-compose.staging.yml restart'"
