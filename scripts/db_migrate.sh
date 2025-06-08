
#!/bin/bash

# Database Migration Script for Course Platform
# Handles Prisma migrations across different environments

set -e

# Configuration
PROJECT_PATH="/var/www/course-platform"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[MIGRATE]${NC} $1"
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
Database Migration Script for Course Platform

Usage: $0 [OPTIONS] ENVIRONMENT [COMMAND]

ENVIRONMENT:
    dev         Development environment
    staging     Staging environment
    prod        Production environment

COMMAND:
    deploy      Deploy pending migrations (default)
    status      Show migration status
    reset       Reset database (development only)
    seed        Seed database with initial data
    generate    Generate Prisma client
    studio      Open Prisma Studio
    backup      Create backup before migration

OPTIONS:
    -h, --help              Show this help message
    -f, --force             Force migration without confirmation
    --dry-run               Show what would be done without executing
    --backup                Create backup before migration
    --no-generate           Skip Prisma client generation

Examples:
    $0 dev                  Deploy migrations to development
    $0 prod deploy --backup Deploy migrations to production with backup
    $0 staging status       Show migration status for staging
    $0 dev reset            Reset development database
    $0 dev seed             Seed development database

EOF
}

# Parse command line arguments
ENVIRONMENT=""
COMMAND="deploy"
FORCE=false
DRY_RUN=false
CREATE_BACKUP=false
NO_GENERATE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --backup)
            CREATE_BACKUP=true
            shift
            ;;
        --no-generate)
            NO_GENERATE=true
            shift
            ;;
        dev|staging|prod)
            ENVIRONMENT="$1"
            shift
            ;;
        deploy|status|reset|seed|generate|studio|backup)
            COMMAND="$1"
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
        APP_CONTAINER="app-dev"
        DB_CONTAINER="postgres-dev"
        ENV_FILE=".env.dev"
        ;;
    staging)
        COMPOSE_FILE="docker-compose.staging.yml"
        APP_CONTAINER="app-staging"
        DB_CONTAINER="postgres-staging"
        ENV_FILE=".env.staging"
        ;;
    prod)
        COMPOSE_FILE="docker-compose.prod.yml"
        APP_CONTAINER="app-prod-1"
        DB_CONTAINER="postgres-prod"
        ENV_FILE=".env.prod"
        ;;
esac

# Check if running in project directory
if [[ ! -f "$PROJECT_PATH/$COMPOSE_FILE" ]]; then
    if [[ -f "$COMPOSE_FILE" ]]; then
        PROJECT_PATH="$(pwd)"
    else
        error "Docker compose file not found. Please run from project directory or ensure $PROJECT_PATH exists"
        exit 1
    fi
fi

cd "$PROJECT_PATH"

# Check if containers are running
check_containers() {
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "$DB_CONTAINER.*Up"; then
        error "Database container $DB_CONTAINER is not running"
        error "Start it with: docker-compose -f $COMPOSE_FILE up -d $DB_CONTAINER"
        exit 1
    fi
}

# Create backup before migration
create_backup() {
    if [[ "$CREATE_BACKUP" != true ]]; then
        return 0
    fi
    
    log "Creating backup before migration..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would create backup"
        return 0
    fi
    
    ./scripts/backup.sh --database-only "$ENVIRONMENT"
    success "Backup created"
}

# Deploy migrations
deploy_migrations() {
    log "Deploying migrations to $ENVIRONMENT environment..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would deploy migrations"
        return 0
    fi
    
    # Check if app container is running
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "$APP_CONTAINER.*Up"; then
        # Use running container
        docker-compose -f "$COMPOSE_FILE" exec "$APP_CONTAINER" npx prisma migrate deploy
    else
        # Run temporary container
        docker-compose -f "$COMPOSE_FILE" run --rm "$APP_CONTAINER" npx prisma migrate deploy
    fi
    
    success "Migrations deployed successfully"
}

# Show migration status
show_status() {
    log "Checking migration status for $ENVIRONMENT environment..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would show migration status"
        return 0
    fi
    
    # Check if app container is running
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "$APP_CONTAINER.*Up"; then
        # Use running container
        docker-compose -f "$COMPOSE_FILE" exec "$APP_CONTAINER" npx prisma migrate status
    else
        # Run temporary container
        docker-compose -f "$COMPOSE_FILE" run --rm "$APP_CONTAINER" npx prisma migrate status
    fi
}

# Reset database (development only)
reset_database() {
    if [[ "$ENVIRONMENT" != "dev" ]]; then
        error "Database reset is only allowed in development environment"
        exit 1
    fi
    
    warning "This will completely reset the development database!"
    
    if [[ "$FORCE" != true ]]; then
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Database reset cancelled"
            exit 0
        fi
    fi
    
    log "Resetting development database..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would reset database"
        return 0
    fi
    
    # Check if app container is running
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "$APP_CONTAINER.*Up"; then
        # Use running container
        docker-compose -f "$COMPOSE_FILE" exec "$APP_CONTAINER" npx prisma migrate reset --force
    else
        # Run temporary container
        docker-compose -f "$COMPOSE_FILE" run --rm "$APP_CONTAINER" npx prisma migrate reset --force
    fi
    
    success "Database reset completed"
}

# Seed database
seed_database() {
    log "Seeding $ENVIRONMENT database..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would seed database"
        return 0
    fi
    
    # Check if seed script exists
    if [[ ! -f "app/scripts/seed.ts" ]]; then
        warning "Seed script not found at app/scripts/seed.ts"
        return 0
    fi
    
    # Check if app container is running
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "$APP_CONTAINER.*Up"; then
        # Use running container
        docker-compose -f "$COMPOSE_FILE" exec "$APP_CONTAINER" npm run seed
    else
        # Run temporary container
        docker-compose -f "$COMPOSE_FILE" run --rm "$APP_CONTAINER" npm run seed
    fi
    
    success "Database seeded successfully"
}

# Generate Prisma client
generate_client() {
    log "Generating Prisma client..."
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would generate Prisma client"
        return 0
    fi
    
    # Check if app container is running
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "$APP_CONTAINER.*Up"; then
        # Use running container
        docker-compose -f "$COMPOSE_FILE" exec "$APP_CONTAINER" npx prisma generate
    else
        # Run temporary container
        docker-compose -f "$COMPOSE_FILE" run --rm "$APP_CONTAINER" npx prisma generate
    fi
    
    success "Prisma client generated successfully"
}

# Open Prisma Studio
open_studio() {
    if [[ "$ENVIRONMENT" == "prod" ]]; then
        warning "Opening Prisma Studio on production environment"
        if [[ "$FORCE" != true ]]; then
            read -p "Are you sure you want to continue? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log "Prisma Studio cancelled"
                exit 0
            fi
        fi
    fi
    
    log "Opening Prisma Studio for $ENVIRONMENT environment..."
    log "Studio will be available at http://localhost:5555"
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would open Prisma Studio"
        return 0
    fi
    
    # Check if app container is running
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "$APP_CONTAINER.*Up"; then
        # Use running container
        docker-compose -f "$COMPOSE_FILE" exec "$APP_CONTAINER" npx prisma studio
    else
        # Run temporary container with port mapping
        docker-compose -f "$COMPOSE_FILE" run --rm -p 5555:5555 "$APP_CONTAINER" npx prisma studio
    fi
}

# Confirmation for production
confirm_production() {
    if [[ "$ENVIRONMENT" != "prod" ]] || [[ "$FORCE" == true ]]; then
        return 0
    fi
    
    warning "You are about to run migrations on PRODUCTION environment!"
    echo
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Migration cancelled"
        exit 0
    fi
}

# Main execution
main() {
    log "Starting database migration for $ENVIRONMENT environment..."
    
    # Check containers
    check_containers
    
    case $COMMAND in
        deploy)
            confirm_production
            create_backup
            deploy_migrations
            if [[ "$NO_GENERATE" != true ]]; then
                generate_client
            fi
            ;;
        status)
            show_status
            ;;
        reset)
            reset_database
            ;;
        seed)
            seed_database
            ;;
        generate)
            generate_client
            ;;
        studio)
            open_studio
            ;;
        backup)
            create_backup
            ;;
        *)
            error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
    
    success "Database migration completed successfully!"
    
    # Show useful information
    if [[ "$COMMAND" == "deploy" ]]; then
        echo
        log "Migration Summary:"
        echo "  Environment: $ENVIRONMENT"
        echo "  Command: $COMMAND"
        
        if [[ "$CREATE_BACKUP" == true ]]; then
            echo "  Backup: Created"
        fi
        
        echo
        log "Useful commands:"
        echo "  Check status: $0 $ENVIRONMENT status"
        echo "  View logs: docker-compose -f $COMPOSE_FILE logs $APP_CONTAINER"
        echo "  Open studio: $0 $ENVIRONMENT studio"
    fi
}

# Run main function
main "$@"
