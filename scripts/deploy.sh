
#!/bin/bash

# Course Platform Deployment Script
# Supports multiple environments: dev, staging, prod

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
REMOTE_USER="${REMOTE_USER:-ubuntu}"
REMOTE_HOST="${REMOTE_HOST:-5.129.223.137}"
REMOTE_PATH="${REMOTE_PATH:-/home/courseplatform/course-shop-platform}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
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

# Help function
show_help() {
    cat << EOF
Course Platform Deployment Script

Usage: $0 [OPTIONS] ENVIRONMENT

ENVIRONMENT:
    dev         Deploy to development environment
    staging     Deploy to staging environment
    prod        Deploy to production environment

OPTIONS:
    -h, --help              Show this help message
    -u, --user USER         Remote user (default: ubuntu)
    -H, --host HOST         Remote host (default: your-server.com)
    -p, --path PATH         Remote path (default: /var/www/course-platform)
    -b, --backup            Create backup before deployment
    -r, --rollback          Rollback to previous version
    -f, --force             Force deployment without confirmation
    --skip-build            Skip building Docker images
    --skip-migrate          Skip database migrations
    --dry-run               Show what would be deployed without executing

Examples:
    $0 dev                  Deploy to development
    $0 staging --backup     Deploy to staging with backup
    $0 prod --force         Force deploy to production
    $0 --rollback prod      Rollback production deployment

EOF
}

# Parse command line arguments
ENVIRONMENT=""
BACKUP=false
ROLLBACK=false
FORCE=false
SKIP_BUILD=false
SKIP_MIGRATE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -u|--user)
            REMOTE_USER="$2"
            shift 2
            ;;
        -H|--host)
            REMOTE_HOST="$2"
            shift 2
            ;;
        -p|--path)
            REMOTE_PATH="$2"
            shift 2
            ;;
        -b|--backup)
            BACKUP=true
            shift
            ;;
        -r|--rollback)
            ROLLBACK=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-migrate)
            SKIP_MIGRATE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        dev|staging|prod)
            ENVIRONMENT="$1"
            shift
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate environment
if [[ -z "$ENVIRONMENT" ]]; then
    error "Environment is required"
    show_help
    exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or prod"
    exit 1
fi

# Set environment-specific variables
case $ENVIRONMENT in
    dev)
        COMPOSE_FILE="docker-compose.dev.yml"
        ENV_FILE=".env.dev"
        ;;
    staging)
        COMPOSE_FILE="docker-compose.staging.yml"
        ENV_FILE=".env.staging"
        ;;
    prod)
        COMPOSE_FILE="docker-compose.prod.yml"
        ENV_FILE=".env.prod"
        ;;
esac

# Check if required files exist
check_files() {
    local files=("$COMPOSE_FILE" "Dockerfile")
    
    for file in "${files[@]}"; do
        if [[ ! -f "$PROJECT_ROOT/$file" ]]; then
            error "Required file not found: $file"
            exit 1
        fi
    done
    
    if [[ ! -f "$PROJECT_ROOT/$ENV_FILE" ]]; then
        warning "Environment file not found: $ENV_FILE"
        warning "Make sure to create it on the remote server"
    fi
}

# Confirmation prompt
confirm_deployment() {
    if [[ "$FORCE" == true ]]; then
        return 0
    fi
    
    echo
    log "Deployment Configuration:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Remote Host: $REMOTE_HOST"
    echo "  Remote User: $REMOTE_USER"
    echo "  Remote Path: $REMOTE_PATH"
    echo "  Compose File: $COMPOSE_FILE"
    echo "  Backup: $BACKUP"
    echo "  Rollback: $ROLLBACK"
    echo
    
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deployment cancelled"
        exit 0
    fi
}

# Create backup
create_backup() {
    if [[ "$BACKUP" != true ]]; then
        return 0
    fi
    
    log "Creating backup..."
    
    local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would create backup: $backup_name"
        return 0
    fi
    
    ssh "$REMOTE_USER@$REMOTE_HOST" "
        cd $REMOTE_PATH
        mkdir -p backups
        tar -czf backups/$backup_name.tar.gz \
            --exclude=backups \
            --exclude=logs \
            --exclude=node_modules \
            --exclude=.git \
            .
        echo 'Backup created: $backup_name.tar.gz'
    "
    
    success "Backup created successfully"
}

# Rollback deployment
rollback_deployment() {
    if [[ "$ROLLBACK" != true ]]; then
        return 0
    fi
    
    log "Rolling back deployment..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would rollback deployment"
        return 0
    fi
    
    ssh "$REMOTE_USER@$REMOTE_HOST" "
        cd $REMOTE_PATH
        
        # Find latest backup
        latest_backup=\$(ls -t backups/*.tar.gz 2>/dev/null | head -n1)
        
        if [[ -z \"\$latest_backup\" ]]; then
            echo 'No backup found for rollback'
            exit 1
        fi
        
        echo \"Rolling back to: \$latest_backup\"
        
        # Stop services
        docker-compose -f $COMPOSE_FILE down
        
        # Restore backup
        tar -xzf \"\$latest_backup\" --exclude=backups
        
        # Start services
        docker-compose -f $COMPOSE_FILE up -d
        
        echo 'Rollback completed'
    "
    
    success "Rollback completed successfully"
    exit 0
}

# Sync files to remote server
sync_files() {
    log "Syncing files to remote server..."
    
    local rsync_options=(
        -avz
        --delete
        --exclude=node_modules
        --exclude=.git
        --exclude=.next
        --exclude=dist
        --exclude=build
        --exclude=logs
        --exclude=backups
        --exclude=.env.local
        --exclude=.env.development.local
        --exclude=.env.test.local
        --exclude=.env.production.local
    )
    
    if [[ "$DRY_RUN" == true ]]; then
        rsync_options+=(--dry-run)
        log "[DRY RUN] Would sync files"
    fi
    
    rsync "${rsync_options[@]}" \
        "$PROJECT_ROOT/" \
        "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
    
    success "Files synced successfully"
}

# Build and deploy
deploy() {
    log "Deploying to $ENVIRONMENT environment..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would deploy to $ENVIRONMENT"
        return 0
    fi
    
    ssh "$REMOTE_USER@$REMOTE_HOST" "
        cd $REMOTE_PATH
        
        # Load environment variables
        if [[ -f $ENV_FILE ]]; then
            export \$(cat $ENV_FILE | grep -v '^#' | xargs)
        fi
        
        # Stop existing services
        docker-compose -f $COMPOSE_FILE down
        
        # Build images if not skipped
        if [[ '$SKIP_BUILD' != true ]]; then
            echo 'Building Docker images...'
            docker-compose -f $COMPOSE_FILE build --no-cache
        fi
        
        # Run database migrations if not skipped
        if [[ '$SKIP_MIGRATE' != true ]]; then
            echo 'Running database migrations...'
            docker-compose -f $COMPOSE_FILE run --rm app-$ENVIRONMENT npx prisma migrate deploy
        fi
        
        # Start services
        echo 'Starting services...'
        docker-compose -f $COMPOSE_FILE up -d
        
        # Wait for services to be healthy
        echo 'Waiting for services to be healthy...'
        sleep 30
        
        # Check service health
        docker-compose -f $COMPOSE_FILE ps
        
        echo 'Deployment completed successfully'
    "
    
    success "Deployment completed successfully"
}

# Health check
health_check() {
    log "Performing health check..."
    
    local health_url
    case $ENVIRONMENT in
        dev)
            health_url="http://$REMOTE_HOST/health"
            ;;
        staging)
            health_url="https://staging.example.com/health"
            ;;
        prod)
            health_url="https://www.example.com/health"
            ;;
    esac
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would check health at: $health_url"
        return 0
    fi
    
    local max_attempts=10
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "$health_url" > /dev/null; then
            success "Health check passed"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
    return 1
}

# Main execution
main() {
    log "Starting deployment process for $ENVIRONMENT environment"
    
    # Pre-deployment checks
    check_files
    confirm_deployment
    
    # Handle rollback
    rollback_deployment
    
    # Create backup
    create_backup
    
    # Sync files
    sync_files
    
    # Deploy
    deploy
    
    # Health check
    health_check
    
    success "Deployment process completed successfully!"
    
    # Show useful information
    echo
    log "Useful commands:"
    echo "  View logs: ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && docker-compose -f $COMPOSE_FILE logs -f'"
    echo "  Check status: ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && docker-compose -f $COMPOSE_FILE ps'"
    echo "  Restart services: ssh $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_PATH && docker-compose -f $COMPOSE_FILE restart'"
}

# Run main function
main "$@"
