
#!/bin/bash

# Course Platform Backup Script
# Creates backups of database and application files

set -e

# Configuration
PROJECT_PATH="/var/www/course-platform"
BACKUP_DIR="$PROJECT_PATH/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[BACKUP]${NC} $1"
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
Course Platform Backup Script

Usage: $0 [OPTIONS] [ENVIRONMENT]

ENVIRONMENT:
    dev         Backup development environment
    staging     Backup staging environment
    prod        Backup production environment (default)

OPTIONS:
    -h, --help              Show this help message
    -d, --database-only     Backup database only
    -f, --files-only        Backup files only
    -r, --retention DAYS    Set retention period (default: 30 days)
    --no-compress           Don't compress backups
    --remote-backup PATH    Copy backup to remote location

Examples:
    $0                      Backup production environment
    $0 staging              Backup staging environment
    $0 --database-only      Backup production database only
    $0 --retention 7        Keep backups for 7 days

EOF
}

# Parse command line arguments
ENVIRONMENT="prod"
DATABASE_ONLY=false
FILES_ONLY=false
NO_COMPRESS=false
REMOTE_BACKUP=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--database-only)
            DATABASE_ONLY=true
            shift
            ;;
        -f|--files-only)
            FILES_ONLY=true
            shift
            ;;
        -r|--retention)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        --no-compress)
            NO_COMPRESS=true
            shift
            ;;
        --remote-backup)
            REMOTE_BACKUP="$2"
            shift 2
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
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    error "Invalid environment: $ENVIRONMENT. Must be dev, staging, or prod"
    exit 1
fi

# Set environment-specific variables
case $ENVIRONMENT in
    dev)
        COMPOSE_FILE="docker-compose.dev.yml"
        DB_CONTAINER="postgres-dev"
        DB_USER="dev_user"
        DB_NAME="course_shop_platform_dev"
        ;;
    staging)
        COMPOSE_FILE="docker-compose.staging.yml"
        DB_CONTAINER="postgres-staging"
        DB_USER="staging_user"
        DB_NAME="course_shop_platform_staging"
        ;;
    prod)
        COMPOSE_FILE="docker-compose.prod.yml"
        DB_CONTAINER="postgres-prod"
        DB_USER="prod_user"
        DB_NAME="course_shop_platform_prod"
        ;;
esac

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting backup for $ENVIRONMENT environment..."

# Database backup
backup_database() {
    if [[ "$FILES_ONLY" == true ]]; then
        return 0
    fi
    
    log "Creating database backup..."
    
    local db_backup_file="$BACKUP_DIR/db_${ENVIRONMENT}_${DATE}.sql"
    
    # Check if database container is running
    if ! docker-compose -f "$PROJECT_PATH/$COMPOSE_FILE" ps | grep -q "$DB_CONTAINER.*Up"; then
        error "Database container $DB_CONTAINER is not running"
        return 1
    fi
    
    # Create database dump
    docker-compose -f "$PROJECT_PATH/$COMPOSE_FILE" exec -T "$DB_CONTAINER" \
        pg_dump -U "$DB_USER" "$DB_NAME" > "$db_backup_file"
    
    # Compress if not disabled
    if [[ "$NO_COMPRESS" != true ]]; then
        gzip "$db_backup_file"
        db_backup_file="${db_backup_file}.gz"
    fi
    
    local file_size=$(du -h "$db_backup_file" | cut -f1)
    success "Database backup created: $(basename "$db_backup_file") ($file_size)"
}

# Files backup
backup_files() {
    if [[ "$DATABASE_ONLY" == true ]]; then
        return 0
    fi
    
    log "Creating application files backup..."
    
    local files_backup_file="$BACKUP_DIR/files_${ENVIRONMENT}_${DATE}.tar"
    
    # Create tar archive
    tar -cf "$files_backup_file" \
        --exclude="$BACKUP_DIR" \
        --exclude="$PROJECT_PATH/logs" \
        --exclude="$PROJECT_PATH/node_modules" \
        --exclude="$PROJECT_PATH/.git" \
        --exclude="$PROJECT_PATH/.next" \
        --exclude="$PROJECT_PATH/dist" \
        --exclude="$PROJECT_PATH/build" \
        -C "$(dirname "$PROJECT_PATH")" \
        "$(basename "$PROJECT_PATH")"
    
    # Compress if not disabled
    if [[ "$NO_COMPRESS" != true ]]; then
        gzip "$files_backup_file"
        files_backup_file="${files_backup_file}.gz"
    fi
    
    local file_size=$(du -h "$files_backup_file" | cut -f1)
    success "Files backup created: $(basename "$files_backup_file") ($file_size)"
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    local deleted_count=0
    
    # Clean database backups
    while IFS= read -r -d '' file; do
        rm "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "db_${ENVIRONMENT}_*.sql*" -mtime +$RETENTION_DAYS -print0 2>/dev/null)
    
    # Clean file backups
    while IFS= read -r -d '' file; do
        rm "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "files_${ENVIRONMENT}_*.tar*" -mtime +$RETENTION_DAYS -print0 2>/dev/null)
    
    if [[ $deleted_count -gt 0 ]]; then
        success "Cleaned up $deleted_count old backup files"
    else
        log "No old backup files to clean up"
    fi
}

# Copy to remote backup location
remote_backup() {
    if [[ -z "$REMOTE_BACKUP" ]]; then
        return 0
    fi
    
    log "Copying backups to remote location: $REMOTE_BACKUP"
    
    # Copy recent backups to remote location
    rsync -av "$BACKUP_DIR/"*"${ENVIRONMENT}_${DATE}"* "$REMOTE_BACKUP/"
    
    success "Backups copied to remote location"
}

# Generate backup report
generate_report() {
    local report_file="$BACKUP_DIR/backup_report_${ENVIRONMENT}_${DATE}.txt"
    
    cat > "$report_file" << EOF
Course Platform Backup Report
=============================

Environment: $ENVIRONMENT
Date: $(date)
Backup ID: $DATE

Backup Details:
EOF

    if [[ "$DATABASE_ONLY" != true ]]; then
        echo "- Files backup: files_${ENVIRONMENT}_${DATE}.tar*" >> "$report_file"
    fi
    
    if [[ "$FILES_ONLY" != true ]]; then
        echo "- Database backup: db_${ENVIRONMENT}_${DATE}.sql*" >> "$report_file"
    fi
    
    echo "" >> "$report_file"
    echo "Backup Location: $BACKUP_DIR" >> "$report_file"
    echo "Retention Period: $RETENTION_DAYS days" >> "$report_file"
    
    if [[ -n "$REMOTE_BACKUP" ]]; then
        echo "Remote Backup: $REMOTE_BACKUP" >> "$report_file"
    fi
    
    echo "" >> "$report_file"
    echo "Disk Usage:" >> "$report_file"
    du -sh "$BACKUP_DIR" >> "$report_file"
    
    success "Backup report generated: $(basename "$report_file")"
}

# Main execution
main() {
    # Check if project directory exists
    if [[ ! -d "$PROJECT_PATH" ]]; then
        error "Project directory not found: $PROJECT_PATH"
        exit 1
    fi
    
    # Change to project directory
    cd "$PROJECT_PATH"
    
    # Check if compose file exists
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        error "Docker compose file not found: $COMPOSE_FILE"
        exit 1
    fi
    
    # Perform backups
    backup_database
    backup_files
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Remote backup
    remote_backup
    
    # Generate report
    generate_report
    
    success "Backup process completed successfully!"
    
    # Show backup summary
    echo
    log "Backup Summary:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Backup ID: $DATE"
    echo "  Location: $BACKUP_DIR"
    
    if [[ "$DATABASE_ONLY" != true ]]; then
        local files_backup=$(ls -1 "$BACKUP_DIR"/files_${ENVIRONMENT}_${DATE}.tar* 2>/dev/null | head -1)
        if [[ -n "$files_backup" ]]; then
            echo "  Files: $(basename "$files_backup") ($(du -h "$files_backup" | cut -f1))"
        fi
    fi
    
    if [[ "$FILES_ONLY" != true ]]; then
        local db_backup=$(ls -1 "$BACKUP_DIR"/db_${ENVIRONMENT}_${DATE}.sql* 2>/dev/null | head -1)
        if [[ -n "$db_backup" ]]; then
            echo "  Database: $(basename "$db_backup") ($(du -h "$db_backup" | cut -f1))"
        fi
    fi
    
    echo "  Total backups: $(ls -1 "$BACKUP_DIR"/*${ENVIRONMENT}* 2>/dev/null | wc -l)"
    echo "  Backup directory size: $(du -sh "$BACKUP_DIR" | cut -f1)"
}

# Run main function
main "$@"
