
#!/bin/bash

# Course Platform Rollback Script
# Rollback to a previous backup or deployment

set -e

# Configuration
PROJECT_PATH="/var/www/course-platform"
BACKUP_DIR="$PROJECT_PATH/backups"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[ROLLBACK]${NC} $1"
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
Course Platform Rollback Script

Usage: $0 [OPTIONS] ENVIRONMENT [BACKUP_ID]

ENVIRONMENT:
    dev         Rollback development environment
    staging     Rollback staging environment
    prod        Rollback production environment

BACKUP_ID:
    Specific backup ID to rollback to (format: YYYYMMDD_HHMMSS)
    If not specified, will use the latest backup

OPTIONS:
    -h, --help              Show this help message
    -l, --list              List available backups
    -d, --database-only     Rollback database only
    -f, --files-only        Rollback files only
    --force                 Force rollback without confirmation
    --dry-run               Show what would be done without executing

Examples:
    $0 --list               List available backups
    $0 prod                 Rollback production to latest backup
    $0 staging 20241207_143000  Rollback staging to specific backup
    $0 --database-only prod Rollback production database only

EOF
}

# Parse command line arguments
ENVIRONMENT=""
BACKUP_ID=""
LIST_BACKUPS=false
DATABASE_ONLY=false
FILES_ONLY=false
FORCE=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -l|--list)
            LIST_BACKUPS=true
            shift
            ;;
        -d|--database-only)
            DATABASE_ONLY=true
            shift
            ;;
        -f|--files-only)
            FILES_ONLY=true
            shift
            ;;
        --force)
            FORCE=true
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
        [0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]_[0-9][0-9][0-9][0-9][0-9][0-9])
            BACKUP_ID="$1"
            shift
            ;;
        *)
            error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# List available backups
list_backups() {
    log "Available backups:"
    echo
    
    if [[ -n "$ENVIRONMENT" ]]; then
        local envs=("$ENVIRONMENT")
    else
        local envs=("dev" "staging" "prod")
    fi
    
    for env in "${envs[@]}"; do
        echo "=== $env Environment ==="
        
        # List database backups
        echo "Database backups:"
        local db_backups=($(ls -1t "$BACKUP_DIR"/db_${env}_*.sql* 2>/dev/null || true))
        if [[ ${#db_backups[@]} -gt 0 ]]; then
            for backup in "${db_backups[@]}"; do
                local backup_id=$(basename "$backup" | sed -E 's/db_'${env}'_([0-9]{8}_[0-9]{6})\.sql.*/\1/')
                local size=$(du -h "$backup" | cut -f1)
                local date=$(echo "$backup_id" | sed 's/_/ /' | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\) \([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')
                echo "  $backup_id - $date ($size)"
            done
        else
            echo "  No database backups found"
        fi
        
        echo
        
        # List file backups
        echo "File backups:"
        local file_backups=($(ls -1t "$BACKUP_DIR"/files_${env}_*.tar* 2>/dev/null || true))
        if [[ ${#file_backups[@]} -gt 0 ]]; then
            for backup in "${file_backups[@]}"; do
                local backup_id=$(basename "$backup" | sed -E 's/files_'${env}'_([0-9]{8}_[0-9]{6})\.tar.*/\1/')
                local size=$(du -h "$backup" | cut -f1)
                local date=$(echo "$backup_id" | sed 's/_/ /' | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\) \([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3 \4:\5:\6/')
                echo "  $backup_id - $date ($size)"
            done
        else
            echo "  No file backups found"
        fi
        
        echo
    done
}

# Find latest backup
find_latest_backup() {
    local env="$1"
    local type="$2"  # "db" or "files"
    
    local latest_backup=$(ls -1t "$BACKUP_DIR"/${type}_${env}_*.* 2>/dev/null | head -1)
    
    if [[ -n "$latest_backup" ]]; then
        echo $(basename "$latest_backup" | sed -E 's/'${type}'_'${env}'_([0-9]{8}_[0-9]{6})\..*/\1/')
    fi
}

# Validate backup exists
validate_backup() {
    local env="$1"
    local backup_id="$2"
    local type="$3"  # "db" or "files"
    
    local backup_files=($(ls "$BACKUP_DIR"/${type}_${env}_${backup_id}.* 2>/dev/null || true))
    
    if [[ ${#backup_files[@]} -eq 0 ]]; then
        error "Backup not found: ${type}_${env}_${backup_id}"
        return 1
    fi
    
    echo "${backup_files[0]}"
}

# Set environment-specific variables
set_environment_vars() {
    case $ENVIRONMENT in
        dev)
            COMPOSE_FILE="docker-compose.dev.yml"
            DB_CONTAINER="postgres-dev"
            DB_USER="dev_user"
            DB_NAME="course_shop_platform_dev"
            APP_CONTAINER="app-dev"
            ;;
        staging)
            COMPOSE_FILE="docker-compose.staging.yml"
            DB_CONTAINER="postgres-staging"
            DB_USER="staging_user"
            DB_NAME="course_shop_platform_staging"
            APP_CONTAINER="app-staging"
            ;;
        prod)
            COMPOSE_FILE="docker-compose.prod.yml"
            DB_CONTAINER="postgres-prod"
            DB_USER="prod_user"
            DB_NAME="course_shop_platform_prod"
            APP_CONTAINER="app-prod-1"
            ;;
    esac
}

# Rollback database
rollback_database() {
    local backup_file="$1"
    
    log "Rolling back database from: $(basename "$backup_file")"
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would rollback database from: $backup_file"
        return 0
    fi
    
    # Stop application containers to prevent connections
    log "Stopping application containers..."
    docker-compose -f "$PROJECT_PATH/$COMPOSE_FILE" stop $(docker-compose -f "$PROJECT_PATH/$COMPOSE_FILE" config --services | grep -E "app-|nginx-")
    
    # Wait for connections to close
    sleep 5
    
    # Drop and recreate database
    log "Recreating database..."
    docker-compose -f "$PROJECT_PATH/$COMPOSE_FILE" exec -T "$DB_CONTAINER" psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS ${DB_NAME};"
    docker-compose -f "$PROJECT_PATH/$COMPOSE_FILE" exec -T "$DB_CONTAINER" psql -U "$DB_USER" -c "CREATE DATABASE ${DB_NAME};"
    
    # Restore database
    log "Restoring database..."
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | docker-compose -f "$PROJECT_PATH/$COMPOSE_FILE" exec -T "$DB_CONTAINER" psql -U "$DB_USER" "$DB_NAME"
    else
        docker-compose -f "$PROJECT_PATH/$COMPOSE_FILE" exec -T "$DB_CONTAINER" psql -U "$DB_USER" "$DB_NAME" < "$backup_file"
    fi
    
    success "Database rollback completed"
}

# Rollback files
rollback_files() {
    local backup_file="$1"
    
    log "Rolling back files from: $(basename "$backup_file")"
    
    if [[ "$DRY_RUN" == true ]]; then
        log "[DRY RUN] Would rollback files from: $backup_file"
        return 0
    fi
    
    # Stop all services
    log "Stopping all services..."
    docker-compose -f "$PROJECT_PATH/$COMPOSE_FILE" down
    
    # Create temporary directory for extraction
    local temp_dir=$(mktemp -d)
    
    # Extract backup
    log "Extracting backup..."
    if [[ "$backup_file" == *.gz ]]; then
        tar -xzf "$backup_file" -C "$temp_dir"
    else
        tar -xf "$backup_file" -C "$temp_dir"
    fi
    
    # Find the extracted directory
    local extracted_dir=$(find "$temp_dir" -maxdepth 1 -type d -name "course-platform" | head -1)
    
    if [[ -z "$extracted_dir" ]]; then
        error "Could not find extracted course-platform directory"
        rm -rf "$temp_dir"
        return 1
    fi
    
    # Backup current state
    local current_backup="$PROJECT_PATH/../course-platform-pre-rollback-$(date +%Y%m%d_%H%M%S)"
    log "Creating backup of current state: $current_backup"
    cp -r "$PROJECT_PATH" "$current_backup"
    
    # Replace files (excluding certain directories)
    log "Replacing application files..."
    rsync -av --delete \
        --exclude=backups \
        --exclude=logs \
        --exclude=.env.* \
        "$extracted_dir/" \
        "$PROJECT_PATH/"
    
    # Clean up
    rm -rf "$temp_dir"
    
    success "Files rollback completed"
}

# Confirmation prompt
confirm_rollback() {
    if [[ "$FORCE" == true ]]; then
        return 0
    fi
    
    echo
    warning "This will rollback the $ENVIRONMENT environment to backup: $BACKUP_ID"
    
    if [[ "$DATABASE_ONLY" == true ]]; then
        warning "Database will be COMPLETELY REPLACED with the backup"
    elif [[ "$FILES_ONLY" == true ]]; then
        warning "Application files will be COMPLETELY REPLACED with the backup"
    else
        warning "Both database and files will be COMPLETELY REPLACED with the backup"
    fi
    
    echo
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Rollback cancelled"
        exit 0
    fi
}

# Main execution
main() {
    # Handle list backups
    if [[ "$LIST_BACKUPS" == true ]]; then
        list_backups
        exit 0
    fi
    
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
    
    # Set environment variables
    set_environment_vars
    
    # Check if project directory exists
    if [[ ! -d "$PROJECT_PATH" ]]; then
        error "Project directory not found: $PROJECT_PATH"
        exit 1
    fi
    
    # Check if backup directory exists
    if [[ ! -d "$BACKUP_DIR" ]]; then
        error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi
    
    # Find backup ID if not specified
    if [[ -z "$BACKUP_ID" ]]; then
        if [[ "$DATABASE_ONLY" == true ]]; then
            BACKUP_ID=$(find_latest_backup "$ENVIRONMENT" "db")
        elif [[ "$FILES_ONLY" == true ]]; then
            BACKUP_ID=$(find_latest_backup "$ENVIRONMENT" "files")
        else
            # For full rollback, find the latest backup that has both db and files
            local latest_db=$(find_latest_backup "$ENVIRONMENT" "db")
            local latest_files=$(find_latest_backup "$ENVIRONMENT" "files")
            
            if [[ "$latest_db" == "$latest_files" ]]; then
                BACKUP_ID="$latest_db"
            else
                error "Latest database and files backups have different IDs"
                error "Database: $latest_db, Files: $latest_files"
                error "Please specify a backup ID manually"
                exit 1
            fi
        fi
        
        if [[ -z "$BACKUP_ID" ]]; then
            error "No backups found for $ENVIRONMENT environment"
            exit 1
        fi
        
        log "Using latest backup: $BACKUP_ID"
    fi
    
    # Validate backups exist
    local db_backup_file=""
    local files_backup_file=""
    
    if [[ "$FILES_ONLY" != true ]]; then
        db_backup_file=$(validate_backup "$ENVIRONMENT" "$BACKUP_ID" "db")
        if [[ $? -ne 0 ]]; then
            exit 1
        fi
    fi
    
    if [[ "$DATABASE_ONLY" != true ]]; then
        files_backup_file=$(validate_backup "$ENVIRONMENT" "$BACKUP_ID" "files")
        if [[ $? -ne 0 ]]; then
            exit 1
        fi
    fi
    
    # Change to project directory
    cd "$PROJECT_PATH"
    
    # Check if compose file exists
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        error "Docker compose file not found: $COMPOSE_FILE"
        exit 1
    fi
    
    # Confirmation
    confirm_rollback
    
    # Perform rollback
    log "Starting rollback process..."
    
    if [[ -n "$db_backup_file" ]]; then
        rollback_database "$db_backup_file"
    fi
    
    if [[ -n "$files_backup_file" ]]; then
        rollback_files "$files_backup_file"
    fi
    
    # Start services if not dry run
    if [[ "$DRY_RUN" != true ]]; then
        log "Starting services..."
        docker-compose -f "$COMPOSE_FILE" up -d
        
        # Wait for services to be ready
        log "Waiting for services to be ready..."
        sleep 30
        
        # Check service status
        docker-compose -f "$COMPOSE_FILE" ps
    fi
    
    success "Rollback completed successfully!"
    
    # Show summary
    echo
    log "Rollback Summary:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Backup ID: $BACKUP_ID"
    
    if [[ -n "$db_backup_file" ]]; then
        echo "  Database: $(basename "$db_backup_file")"
    fi
    
    if [[ -n "$files_backup_file" ]]; then
        echo "  Files: $(basename "$files_backup_file")"
    fi
    
    if [[ "$DRY_RUN" != true ]]; then
        echo
        log "Services are starting. Check status with:"
        echo "  docker-compose -f $COMPOSE_FILE ps"
        echo "  docker-compose -f $COMPOSE_FILE logs -f"
    fi
}

# Run main function
main "$@"
