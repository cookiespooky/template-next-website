
#!/bin/bash

# Course Platform Microservices Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/ubuntu/course-shop-platform"
COMPOSE_FILE="docker-compose.microservices.yml"
ENV_FILE=".env"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if project directory exists
    if [ ! -d "$PROJECT_DIR" ]; then
        log_error "Project directory $PROJECT_DIR does not exist."
        exit 1
    fi
    
    log_success "All requirements met."
}

setup_environment() {
    log_info "Setting up environment..."
    
    cd "$PROJECT_DIR"
    
    # Create .env file if it doesn't exist
    if [ ! -f "$ENV_FILE" ]; then
        log_warning ".env file not found. Creating from template..."
        cp .env.example "$ENV_FILE"
        log_warning "Please edit $ENV_FILE with your actual configuration before proceeding."
        read -p "Press Enter to continue after editing .env file..."
    fi
    
    # Create necessary directories
    mkdir -p logs/nginx
    mkdir -p ssl
    mkdir -p backups
    
    # Set permissions
    chmod +x scripts/*.sh
    
    log_success "Environment setup completed."
}

build_services() {
    log_info "Building Docker images..."
    
    cd "$PROJECT_DIR"
    
    # Build all services
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    log_success "Docker images built successfully."
}

start_services() {
    log_info "Starting microservices..."
    
    cd "$PROJECT_DIR"
    
    # Start services
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    log_success "Microservices started successfully."
}

initialize_databases() {
    log_info "Initializing databases..."
    
    cd "$PROJECT_DIR"
    
    # Wait for PostgreSQL to be ready
    log_info "Waiting for PostgreSQL to be ready..."
    until docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres; do
        sleep 2
    done
    
    # Run database migrations
    log_info "Running database migrations..."
    
    # Website database
    docker-compose -f "$COMPOSE_FILE" exec -T website npm run db:push || log_warning "Website DB migration failed"
    
    # Payment service database
    docker-compose -f "$COMPOSE_FILE" exec -T payment-service npm run db:push || log_warning "Payment service DB migration failed"
    
    # Admin backend database
    docker-compose -f "$COMPOSE_FILE" exec -T admin-backend npm run db:push || log_warning "Admin backend DB migration failed"
    
    # Blog backend database
    docker-compose -f "$COMPOSE_FILE" exec -T blog-backend npm run db:push || log_warning "Blog backend DB migration failed"
    
    # Seed databases
    log_info "Seeding databases..."
    
    docker-compose -f "$COMPOSE_FILE" exec -T website npm run db:seed || log_warning "Website DB seeding failed"
    docker-compose -f "$COMPOSE_FILE" exec -T admin-backend npm run db:seed || log_warning "Admin backend DB seeding failed"
    docker-compose -f "$COMPOSE_FILE" exec -T blog-backend npm run db:seed || log_warning "Blog backend DB seeding failed"
    
    log_success "Database initialization completed."
}

check_health() {
    log_info "Checking service health..."
    
    cd "$PROJECT_DIR"
    
    # List of services to check
    services=("website" "payment-service" "admin-backend" "admin-frontend" "blog-backend" "blog-frontend")
    
    for service in "${services[@]}"; do
        log_info "Checking $service..."
        
        # Get container status
        status=$(docker-compose -f "$COMPOSE_FILE" ps -q "$service" | xargs docker inspect -f '{{.State.Status}}')
        
        if [ "$status" = "running" ]; then
            log_success "$service is running"
        else
            log_error "$service is not running (status: $status)"
        fi
    done
    
    # Check specific health endpoints
    log_info "Checking health endpoints..."
    
    sleep 10
    
    # Website health
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "Website health check passed"
    else
        log_warning "Website health check failed"
    fi
    
    # Payment service health
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log_success "Payment service health check passed"
    else
        log_warning "Payment service health check failed"
    fi
    
    # Admin backend health
    if curl -f http://localhost:3002/api/health > /dev/null 2>&1; then
        log_success "Admin backend health check passed"
    else
        log_warning "Admin backend health check failed"
    fi
    
    # Blog backend health
    if curl -f http://localhost:3004/api/health > /dev/null 2>&1; then
        log_success "Blog backend health check passed"
    else
        log_warning "Blog backend health check failed"
    fi
}

show_status() {
    log_info "Service status:"
    
    cd "$PROJECT_DIR"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo ""
    log_info "Access URLs:"
    echo "  Main Website:    http://localhost:3000"
    echo "  Admin Panel:     http://localhost:3003"
    echo "  Blog:            http://localhost:3005"
    echo "  Payment API:     http://localhost:3001/api"
    echo "  Admin API:       http://localhost:3002/api"
    echo "  Blog API:        http://localhost:3004/api"
    echo ""
    
    log_info "Default admin credentials:"
    echo "  Email:    admin@courseplatform.com"
    echo "  Password: admin123"
    echo ""
    
    log_info "Useful commands:"
    echo "  View logs:       docker-compose -f $COMPOSE_FILE logs -f [service]"
    echo "  Restart service: docker-compose -f $COMPOSE_FILE restart [service]"
    echo "  Stop all:        docker-compose -f $COMPOSE_FILE down"
    echo "  Update:          ./scripts/deploy-microservices.sh"
}

# Main execution
main() {
    log_info "Starting Course Platform Microservices deployment..."
    
    check_requirements
    setup_environment
    build_services
    start_services
    initialize_databases
    check_health
    show_status
    
    log_success "Deployment completed successfully!"
    log_info "Your Course Platform microservices are now running."
}

# Handle script arguments
case "${1:-}" in
    "build")
        build_services
        ;;
    "start")
        start_services
        ;;
    "stop")
        cd "$PROJECT_DIR"
        docker-compose -f "$COMPOSE_FILE" down
        log_success "Services stopped."
        ;;
    "restart")
        cd "$PROJECT_DIR"
        docker-compose -f "$COMPOSE_FILE" restart
        log_success "Services restarted."
        ;;
    "status")
        show_status
        ;;
    "logs")
        cd "$PROJECT_DIR"
        docker-compose -f "$COMPOSE_FILE" logs -f "${2:-}"
        ;;
    "health")
        check_health
        ;;
    "init-db")
        initialize_databases
        ;;
    *)
        main
        ;;
esac
