
# Course Platform DevOps Setup

A comprehensive DevOps deployment setup for the Next.js Course Platform with multi-environment support, automated deployments, and production-ready infrastructure.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer (Nginx)                    │
├─────────────────────────────────────────────────────────────────┤
│  dev.example.com  │  staging.example.com  │  www.example.com    │
│  (Development)    │     (Staging)         │   (Production)      │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │ Next.js App  │ │ Next.js App │ │ Next.js    │
        │ (Dev)        │ │ (Staging)   │ │ (Prod x2)  │
        └──────────────┘ └─────────────┘ └────────────┘
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │ PostgreSQL   │ │ PostgreSQL  │ │ PostgreSQL │
        │ (Dev)        │ │ (Staging)   │ │ (Prod)     │
        └──────────────┘ └─────────────┘ └────────────┘
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │ Redis        │ │ Redis       │ │ Redis      │
        │ (Dev)        │ │ (Staging)   │ │ (Prod)     │
        └──────────────┘ └─────────────┘ └────────────┘
```

## 🌍 Environment Configuration

### Development Environment
- **URL**: `http://dev.example.com` or `http://localhost:3000`
- **Purpose**: Local development and testing
- **Features**: Hot reload, debug mode, test data

### Staging Environment
- **URL**: `https://staging.example.com`
- **Purpose**: Pre-production testing and QA
- **Features**: Production-like environment, SSL, monitoring

### Production Environment
- **URL**: `https://www.example.com`
- **Purpose**: Live production environment
- **Features**: Load balancing, SSL, monitoring, backups

### Test Environment (Static)
- **URL**: `https://www.example.com/dev`
- **Purpose**: Static test cases and demos
- **Features**: Basic auth protection, static files

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- Git configured
- SSH access to deployment servers

### 1. Clone and Setup
```bash
git clone <repository-url>
cd course-shop-platform
chmod +x scripts/*.sh
```

### 2. Environment Configuration
```bash
# Copy environment templates
cp app/.env.example app/.env.dev
cp app/.env.example app/.env.staging
cp app/.env.example app/.env.prod

# Edit environment files with your configuration
nano app/.env.dev
nano app/.env.staging
nano app/.env.prod
```

### 3. Development Setup
```bash
# Start development environment
./scripts/deploy_dev.sh

# Or manually
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
./scripts/db_migrate.sh dev

# Seed database (optional)
./scripts/db_migrate.sh dev seed
```

### 4. Access Development Environment
- **Application**: http://localhost:3000
- **Nginx**: http://localhost
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 📦 Docker Configuration

### Multi-Stage Dockerfile
The Dockerfile uses a multi-stage build process optimized for Next.js:

1. **Dependencies Stage**: Installs dependencies
2. **Builder Stage**: Builds the application
3. **Runner Stage**: Production runtime with minimal footprint

### Docker Compose Files
- `docker-compose.dev.yml`: Development environment
- `docker-compose.staging.yml`: Staging environment
- `docker-compose.prod.yml`: Production environment with load balancing

## 🔧 Deployment Scripts

### Main Deployment Script
```bash
./scripts/deploy.sh [OPTIONS] ENVIRONMENT

# Examples
./scripts/deploy.sh dev                    # Deploy to development
./scripts/deploy.sh staging --backup       # Deploy to staging with backup
./scripts/deploy.sh prod --force           # Force deploy to production
```

### Quick Deployment Scripts
```bash
./scripts/deploy_dev.sh                    # Quick development deployment
./scripts/deploy_staging.sh                # Staging deployment with backup
```

### Database Management
```bash
./scripts/db_migrate.sh dev deploy         # Run migrations
./scripts/db_migrate.sh dev status         # Check migration status
./scripts/db_migrate.sh dev seed           # Seed database
./scripts/db_migrate.sh dev studio         # Open Prisma Studio
```

### Backup and Recovery
```bash
./scripts/backup.sh prod                   # Create production backup
./scripts/backup.sh --database-only dev   # Database only backup
./scripts/rollback.sh prod                 # Rollback to latest backup
./scripts/rollback.sh --list              # List available backups
```

## 🌐 Nginx Configuration

### Reverse Proxy Setup
Nginx acts as a reverse proxy and load balancer:

- **SSL termination** with Let's Encrypt certificates
- **Load balancing** for production environment
- **Rate limiting** and security headers
- **Static file serving** optimization
- **Gzip compression** for better performance

### Domain Routing
- `dev.example.com` → Development environment
- `staging.example.com` → Staging environment
- `www.example.com` → Production environment
- `www.example.com/dev` → Static test environment

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
The CI/CD pipeline includes:

1. **Testing**: Unit tests, linting, security scans
2. **Building**: Docker image creation and registry push
3. **Deployment**: Automated deployment to environments
4. **Monitoring**: Health checks and notifications

### Deployment Flow
```
Feature Branch → Pull Request → Review → Merge
                                          ↓
develop branch → Auto Deploy to Development
                                          ↓
staging branch → Auto Deploy to Staging
                                          ↓
main branch → Auto Deploy to Production
```

## 🔒 Security Features

### SSL/TLS Configuration
- **Let's Encrypt** certificates for all domains
- **TLS 1.2/1.3** support with secure ciphers
- **HSTS** headers for enhanced security
- **Certificate auto-renewal**

### Security Headers
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy
- Referrer-Policy

### Rate Limiting
- API endpoints: 20 requests/second
- Authentication: 5 requests/minute
- General: 50 requests/second

### Access Control
- **Basic authentication** for development areas
- **Firewall rules** (UFW) configured
- **Fail2ban** for intrusion prevention
- **Non-root containers** for security

## 📊 Monitoring and Logging

### Log Management
- **Centralized logging** with log rotation
- **Application logs** in `/var/www/course-platform/logs`
- **Nginx logs** with custom formats
- **Database logs** for performance monitoring

### Health Checks
- **Application health** endpoint: `/health`
- **Database connectivity** checks
- **Container health** monitoring
- **Automated restart** on failure

### Backup Strategy
- **Daily automated backups** with 30-day retention
- **Database dumps** with compression
- **Application file backups**
- **Remote backup** support

## 🛠️ VS Code Integration

### Tasks
- Deploy to environments
- Start/stop development environment
- View logs and monitor services
- Run database migrations
- SSH to servers

### Debug Configuration
- **Next.js debugging** with breakpoints
- **API route debugging**
- **Docker container** attachment
- **Prisma debugging**

### Extensions
Pre-configured extensions for optimal development experience:
- TypeScript and React support
- Docker and DevOps tools
- Database management
- Git integration

## 📋 Maintenance Tasks

### Daily Tasks
- Monitor application health
- Check log files for errors
- Verify backup completion
- Review security alerts

### Weekly Tasks
- Update dependencies
- Review performance metrics
- Clean old Docker images
- Test backup restoration

### Monthly Tasks
- Security updates
- SSL certificate renewal check
- Performance optimization
- Disaster recovery testing

## 🆘 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs app-dev

# Check container status
docker-compose -f docker-compose.dev.yml ps

# Rebuild containers
docker-compose -f docker-compose.dev.yml up -d --build
```

#### Database Connection Issues
```bash
# Check database container
docker-compose -f docker-compose.dev.yml logs postgres-dev

# Test connection
docker-compose -f docker-compose.dev.yml exec postgres-dev psql -U dev_user -d course_shop_platform_dev
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test nginx configuration
sudo nginx -t
```

### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check disk space
df -h

# Monitor logs
tail -f /var/www/course-platform/logs/monitor.log
```

## 📞 Support

For issues and questions:
1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review application logs
3. Check container health status
4. Consult the [Security Guide](./SECURITY.md)

## 📚 Additional Documentation

- [Domain Setup Guide](./DOMAIN_SETUP.md)
- [Security Configuration](./SECURITY.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Performance Optimization](./PERFORMANCE.md)

---

**Last Updated**: December 2024  
**Version**: 1.0.0
