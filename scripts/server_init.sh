
#!/bin/bash

# VPS Server Initialization Script for Course Platform
# This script sets up a fresh Ubuntu server with all required components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[SETUP]${NC} $1"
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    error "This script should not be run as root. Please run as a regular user with sudo privileges."
    exit 1
fi

# Configuration
PROJECT_PATH="/var/www/course-platform"
NGINX_USER="www-data"
APP_USER="ubuntu"

log "Starting VPS server initialization for Course Platform..."

# Update system
log "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
log "Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    tree \
    vim \
    nano

# Install Docker
log "Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    success "Docker installed successfully"
else
    success "Docker is already installed"
fi

# Install Docker Compose
log "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    success "Docker Compose installed successfully"
else
    success "Docker Compose is already installed"
fi

# Install Nginx
log "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
    success "Nginx installed and started"
else
    success "Nginx is already installed"
fi

# Install Certbot for SSL certificates
log "Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    success "Certbot installed successfully"
else
    success "Certbot is already installed"
fi

# Install Node.js (for local development tools)
log "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    success "Node.js installed successfully"
else
    success "Node.js is already installed"
fi

# Create project directory
log "Creating project directory..."
sudo mkdir -p $PROJECT_PATH
sudo chown -R $APP_USER:$APP_USER $PROJECT_PATH
success "Project directory created: $PROJECT_PATH"

# Create necessary subdirectories
log "Creating subdirectories..."
mkdir -p $PROJECT_PATH/{logs,backups,ssl,scripts}
mkdir -p $PROJECT_PATH/logs/{nginx,app}

# Set up firewall
log "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
success "Firewall configured"

# Configure fail2ban
log "Configuring fail2ban..."
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Create custom fail2ban configuration
sudo tee /etc/fail2ban/jail.d/nginx.conf > /dev/null << EOF
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 7200
EOF

sudo systemctl enable fail2ban
sudo systemctl restart fail2ban
success "Fail2ban configured"

# Create environment files templates
log "Creating environment file templates..."

# Development environment
cat > $PROJECT_PATH/.env.dev << EOF
# Development Environment Configuration
NODE_ENV=development
# CHANGE THIS TO: Your complete PostgreSQL connection string
DATABASE_URL=postgresql://dev_user:dev_password@postgres-dev:5432/course_shop_platform_dev
# CHANGE THIS TO: Your main website URL (with https://)
NEXTAUTH_URL=http://localhost:3000
# CHANGE THIS TO: A strong NextAuth secret (generate with: openssl rand -base64 64)
NEXTAUTH_SECRET=dev-secret-key-change-in-production
# CHANGE THIS TO: Your Redis connection URL (local: redis://localhost:6379)
REDIS_URL=redis://redis-dev:6379

# YooKassa (use test credentials for dev)
# CHANGE THIS TO: Your YooKassa Shop ID (get from: https://yookassa.ru/my/shop/integration)
YOOKASSA_SHOP_ID=test_shop_id
# CHANGE THIS TO: Your YooKassa Secret Key (get from: https://yookassa.ru/my/shop/integration)
YOOKASSA_SECRET_KEY=test_secret_key
EOF

# Staging environment
cat > $PROJECT_PATH/.env.staging << EOF
# Staging Environment Configuration
NODE_ENV=production
# CHANGE THIS TO: Your complete PostgreSQL connection string
DATABASE_URL=postgresql://staging_user:CHANGE_THIS_PASSWORD@postgres-staging:5432/course_shop_platform_staging
# CHANGE THIS TO: Your main website URL (with https://)
NEXTAUTH_URL=https://staging.example.com
# CHANGE THIS TO: A strong NextAuth secret (generate with: openssl rand -base64 64)
NEXTAUTH_SECRET=CHANGE_THIS_SECRET_KEY
# CHANGE THIS TO: Your Redis connection URL (local: redis://localhost:6379)
REDIS_URL=redis://redis-staging:6379

# PostgreSQL
POSTGRES_STAGING_PASSWORD=CHANGE_THIS_PASSWORD

# YooKassa (use test credentials for staging)
# CHANGE THIS TO: Your YooKassa Shop ID (get from: https://yookassa.ru/my/shop/integration)
YOOKASSA_SHOP_ID=test_shop_id
# CHANGE THIS TO: Your YooKassa Secret Key (get from: https://yookassa.ru/my/shop/integration)
YOOKASSA_SECRET_KEY=test_secret_key
EOF

# Production environment
cat > $PROJECT_PATH/.env.prod << EOF
# Production Environment Configuration
NODE_ENV=production
# CHANGE THIS TO: Your complete PostgreSQL connection string
DATABASE_URL=postgresql://prod_user:CHANGE_THIS_PASSWORD@postgres-prod:5432/course_shop_platform_prod
# CHANGE THIS TO: Your main website URL (with https://)
NEXTAUTH_URL=https://www.example.com
# CHANGE THIS TO: A strong NextAuth secret (generate with: openssl rand -base64 64)
NEXTAUTH_SECRET=CHANGE_THIS_SECRET_KEY
# CHANGE THIS TO: Your Redis connection URL (local: redis://localhost:6379)
REDIS_URL=redis://redis-prod:6379

# PostgreSQL
POSTGRES_PROD_PASSWORD=CHANGE_THIS_PASSWORD

# YooKassa (use real credentials for production)
# CHANGE THIS TO: Your YooKassa Shop ID (get from: https://yookassa.ru/my/shop/integration)
YOOKASSA_SHOP_ID=YOUR_REAL_SHOP_ID
# CHANGE THIS TO: Your YooKassa Secret Key (get from: https://yookassa.ru/my/shop/integration)
YOOKASSA_SECRET_KEY=YOUR_REAL_SECRET_KEY
EOF

success "Environment file templates created"

# Create basic auth file for development area
log "Creating basic auth for development area..."
sudo htpasswd -cb /etc/nginx/.htpasswd dev devpassword
success "Basic auth created (user: dev, password: devpassword)"

# Create SSL directory and self-signed certificates for testing
log "Creating SSL certificates for testing..."
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/example.com.key \
    -out /etc/nginx/ssl/example.com.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=example.com"

sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/staging.example.com.key \
    -out /etc/nginx/ssl/staging.example.com.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=staging.example.com"

success "Self-signed SSL certificates created"

# Create deployment user and SSH key setup
log "Setting up deployment user..."
if ! id "deploy" &>/dev/null; then
    sudo useradd -m -s /bin/bash deploy
    sudo usermod -aG docker deploy
    sudo usermod -aG sudo deploy
    
    # Create SSH directory for deploy user
    sudo mkdir -p /home/deploy/.ssh
    sudo chown deploy:deploy /home/deploy/.ssh
    sudo chmod 700 /home/deploy/.ssh
    
    success "Deploy user created"
else
    success "Deploy user already exists"
fi

# Create systemd service for automatic container startup
log "Creating systemd service..."
sudo tee /etc/systemd/system/course-platform.service > /dev/null << EOF
[Unit]
Description=Course Platform Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_PATH
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable course-platform.service
success "Systemd service created"

# Create log rotation configuration
log "Setting up log rotation..."
sudo tee /etc/logrotate.d/course-platform > /dev/null << EOF
$PROJECT_PATH/logs/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $NGINX_USER $NGINX_USER
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \`cat /var/run/nginx.pid\`
        fi
    endscript
}

$PROJECT_PATH/logs/app/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $APP_USER $APP_USER
}
EOF

success "Log rotation configured"

# Create backup script
log "Creating backup script..."
cat > $PROJECT_PATH/scripts/backup.sh << 'EOF'
#!/bin/bash

# Course Platform Backup Script

set -e

BACKUP_DIR="/var/www/course-platform/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Creating database backup..."
docker-compose -f /var/www/course-platform/docker-compose.prod.yml exec -T postgres-prod pg_dump -U prod_user course_shop_platform_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
echo "Creating application backup..."
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz \
    --exclude=backups \
    --exclude=logs \
    --exclude=node_modules \
    --exclude=.git \
    /var/www/course-platform

# Clean old backups
echo "Cleaning old backups..."
find $BACKUP_DIR -name "*.sql" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
EOF

chmod +x $PROJECT_PATH/scripts/backup.sh

# Create cron job for daily backups
log "Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_PATH/scripts/backup.sh >> $PROJECT_PATH/logs/backup.log 2>&1") | crontab -

success "Daily backup cron job created"

# Create monitoring script
log "Creating monitoring script..."
cat > $PROJECT_PATH/scripts/monitor.sh << 'EOF'
#!/bin/bash

# Course Platform Monitoring Script

PROJECT_PATH="/var/www/course-platform"
LOG_FILE="$PROJECT_PATH/logs/monitor.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
}

# Check Docker containers
check_containers() {
    local failed_containers=$(docker-compose -f $PROJECT_PATH/docker-compose.prod.yml ps --services --filter "status=exited")
    
    if [ ! -z "$failed_containers" ]; then
        log_message "WARNING: Failed containers detected: $failed_containers"
        # Restart failed containers
        docker-compose -f $PROJECT_PATH/docker-compose.prod.yml up -d $failed_containers
        log_message "INFO: Restarted failed containers"
    fi
}

# Check disk space
check_disk_space() {
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $usage -gt 80 ]; then
        log_message "WARNING: Disk usage is ${usage}%"
    fi
}

# Check application health
check_app_health() {
    if ! curl -f -s http://localhost/health > /dev/null; then
        log_message "ERROR: Application health check failed"
    fi
}

# Run checks
check_containers
check_disk_space
check_app_health

log_message "INFO: Monitoring check completed"
EOF

chmod +x $PROJECT_PATH/scripts/monitor.sh

# Add monitoring cron job
(crontab -l 2>/dev/null; echo "*/5 * * * * $PROJECT_PATH/scripts/monitor.sh") | crontab -

success "Monitoring script and cron job created"

# Set proper permissions
log "Setting proper permissions..."
sudo chown -R $APP_USER:$APP_USER $PROJECT_PATH
sudo chmod +x $PROJECT_PATH/scripts/*.sh

# Display summary
success "Server initialization completed successfully!"

echo
echo "🎉 Server Setup Summary:"
echo "================================"
echo "✅ Docker and Docker Compose installed"
echo "✅ Nginx installed and configured"
echo "✅ Certbot installed for SSL certificates"
echo "✅ Node.js installed"
echo "✅ Firewall configured (UFW)"
echo "✅ Fail2ban configured"
echo "✅ Project directory created: $PROJECT_PATH"
echo "✅ Environment file templates created"
echo "✅ SSL certificates created (self-signed for testing)"
echo "✅ Deploy user created"
echo "✅ Systemd service configured"
echo "✅ Log rotation configured"
echo "✅ Daily backup cron job created"
echo "✅ Monitoring script and cron job created"
echo
echo "📋 Next Steps:"
echo "1. Update environment files with real credentials:"
echo "   - $PROJECT_PATH/.env.staging"
echo "   - $PROJECT_PATH/.env.prod"
echo
echo "2. Set up DNS records for your domains:"
echo "   - example.com → Server IP"
echo "   - www.example.com → Server IP"
echo "   - staging.example.com → Server IP"
echo "   - dev.example.com → Server IP"
echo
echo "3. Generate real SSL certificates:"
echo "   sudo certbot --nginx -d example.com -d www.example.com"
echo "   sudo certbot --nginx -d staging.example.com"
echo "   sudo certbot --nginx -d dev.example.com"
echo
echo "4. Deploy your application:"
echo "   ./scripts/deploy.sh prod"
echo
echo "5. Set up SSH key for deployment:"
echo "   ssh-copy-id deploy@your-server.com"
echo
echo "🔐 Security Notes:"
echo "- Change default passwords in environment files"
echo "- Update basic auth credentials: sudo htpasswd /etc/nginx/.htpasswd dev"
echo "- Review firewall rules: sudo ufw status"
echo "- Monitor logs: tail -f $PROJECT_PATH/logs/monitor.log"
echo
echo "🌐 Default URLs (after deployment):"
echo "- Production: https://www.example.com"
echo "- Staging: https://staging.example.com"
echo "- Development: https://dev.example.com"
echo "- Test area: https://www.example.com/dev"

warning "Please reboot the server to ensure all changes take effect:"
echo "sudo reboot"
