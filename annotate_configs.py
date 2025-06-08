#!/usr/bin/env python3
"""
Configuration File Annotation Script
Adds clear instructional comments for credentials and settings that need to be changed.
"""

import os
import re
import shutil
from pathlib import Path

# Configuration patterns and their corresponding instructions
CONFIG_PATTERNS = {
    # Database credentials
    r'POSTGRES_PASSWORD\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: A strong PostgreSQL password (generate with: openssl rand -base64 32)',
        'example': 'POSTGRES_PASSWORD=your_secure_postgres_password_here'
    },
    r'POSTGRES_USER\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your PostgreSQL username (default: postgres)',
        'example': 'POSTGRES_USER=postgres'
    },
    r'POSTGRES_DB\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your main database name',
        'example': 'POSTGRES_DB=course_platform'
    },
    r'DATABASE_URL\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your complete PostgreSQL connection string',
        'example': 'DATABASE_URL=postgresql://username:password@host:port/database'
    },
    
    # JWT and Security Secrets
    r'JWT_SECRET\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: A strong JWT secret key (generate with: openssl rand -base64 64)',
        'example': 'JWT_SECRET=your_super_secure_jwt_secret_key_here'
    },
    r'SESSION_SECRET\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: A strong session secret (generate with: openssl rand -base64 64)',
        'example': 'SESSION_SECRET=your_super_secure_session_secret_key_here'
    },
    r'NEXTAUTH_SECRET\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: A strong NextAuth secret (generate with: openssl rand -base64 64)',
        'example': 'NEXTAUTH_SECRET=your_super_secure_nextauth_secret_key_here'
    },
    r'INTERNAL_WEBHOOK_SECRET\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: A strong internal webhook secret (generate with: openssl rand -base64 32)',
        'example': 'INTERNAL_WEBHOOK_SECRET=your_super_secure_internal_webhook_secret'
    },
    
    # YooKassa Payment Configuration
    r'YOOKASSA_SHOP_ID\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your YooKassa Shop ID (get from: https://yookassa.ru/my/shop/integration)',
        'example': 'YOOKASSA_SHOP_ID=123456'
    },
    r'YOOKASSA_SECRET_KEY\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your YooKassa Secret Key (get from: https://yookassa.ru/my/shop/integration)',
        'example': 'YOOKASSA_SECRET_KEY=live_your_secret_key_here'
    },
    r'YOOKASSA_WEBHOOK_SECRET\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your YooKassa Webhook Secret (set in YooKassa dashboard)',
        'example': 'YOOKASSA_WEBHOOK_SECRET=your_webhook_secret_here'
    },
    
    # Email/SMTP Configuration
    r'SMTP_HOST\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your SMTP server hostname (Gmail: smtp.gmail.com, Outlook: smtp-mail.outlook.com)',
        'example': 'SMTP_HOST=smtp.gmail.com'
    },
    r'SMTP_PORT\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your SMTP port (Gmail: 587, Outlook: 587, SSL: 465)',
        'example': 'SMTP_PORT=587'
    },
    r'SMTP_USER\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your email address for sending emails',
        'example': 'SMTP_USER=your_email@gmail.com'
    },
    r'SMTP_PASS\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your email app password (Gmail: generate at https://myaccount.google.com/apppasswords)',
        'example': 'SMTP_PASS=your_app_password_here'
    },
    r'SMTP_FROM\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: The "from" email address for outgoing emails',
        'example': 'SMTP_FROM=noreply@yourdomain.com'
    },
    
    # Domain and URL Configuration
    r'DOMAIN\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your actual domain name (without https://)',
        'example': 'DOMAIN=yourdomain.com'
    },
    r'NEXTAUTH_URL\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your main website URL (with https://)',
        'example': 'NEXTAUTH_URL=https://yourdomain.com'
    },
    r'MAIN_SITE_URL\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your main website URL (with https://)',
        'example': 'MAIN_SITE_URL=https://yourdomain.com'
    },
    r'ADMIN_FRONTEND_URL\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your admin panel URL (with https://)',
        'example': 'ADMIN_FRONTEND_URL=https://admin.yourdomain.com'
    },
    r'BLOG_FRONTEND_URL\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your blog URL (with https://)',
        'example': 'BLOG_FRONTEND_URL=https://blog.yourdomain.com'
    },
    
    # Analytics and Tracking
    r'GOOGLE_ANALYTICS_ID\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your Google Analytics 4 Measurement ID (get from: https://analytics.google.com/)',
        'example': 'GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX'
    },
    r'FACEBOOK_PIXEL_ID\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your Facebook Pixel ID (get from: https://business.facebook.com/events_manager)',
        'example': 'FACEBOOK_PIXEL_ID=123456789012345'
    },
    r'CLARITY_ID\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your Microsoft Clarity Project ID (get from: https://clarity.microsoft.com/)',
        'example': 'CLARITY_ID=abcdefghij'
    },
    
    # SSL Configuration
    r'SSL_EMAIL\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your email for SSL certificate notifications (Let\'s Encrypt)',
        'example': 'SSL_EMAIL=admin@yourdomain.com'
    },
    
    # Redis Configuration
    r'REDIS_URL\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your Redis connection URL (local: redis://localhost:6379)',
        'example': 'REDIS_URL=redis://localhost:6379'
    },
    r'REDIS_PASSWORD\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Your Redis password (leave empty if no password)',
        'example': 'REDIS_PASSWORD=your_redis_password'
    },
    
    # CORS and Security
    r'ALLOWED_ORIGINS\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Comma-separated list of allowed origins for CORS',
        'example': 'ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com'
    },
    
    # Monitoring
    r'MONITORING_EMAIL\s*=\s*(.+)': {
        'comment': '# CHANGE THIS TO: Email address for monitoring alerts and notifications',
        'example': 'MONITORING_EMAIL=admin@yourdomain.com'
    }
}

# Docker Compose specific patterns
DOCKER_COMPOSE_PATTERNS = {
    r'POSTGRES_PASSWORD:\s*\$\{POSTGRES_PASSWORD:-(.+)\}': {
        'comment': '      # CHANGE THIS TO: Use strong password from .env file',
        'example': '      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-secure_password_here}'
    },
    r'server_name\s+(.+);': {
        'comment': '    # CHANGE THIS TO: Your actual domain names',
        'example': '    server_name yourdomain.com www.yourdomain.com;'
    }
}

# Nginx specific patterns
NGINX_PATTERNS = {
    r'server_name\s+(.+);': {
        'comment': '    # CHANGE THIS TO: Your actual domain names',
        'example': '    server_name yourdomain.com www.yourdomain.com;'
    },
    r'ssl_certificate\s+(.+);': {
        'comment': '    # CHANGE THIS TO: Path to your SSL certificate file',
        'example': '    ssl_certificate /etc/nginx/ssl/yourdomain.com.crt;'
    },
    r'ssl_certificate_key\s+(.+);': {
        'comment': '    # CHANGE THIS TO: Path to your SSL certificate key file',
        'example': '    ssl_certificate_key /etc/nginx/ssl/yourdomain.com.key;'
    }
}

def get_comment_syntax(file_path):
    """Determine the comment syntax based on file extension."""
    ext = Path(file_path).suffix.lower()
    if ext in ['.env', '.sh', '.conf', '.yml', '.yaml']:
        return '#'
    elif ext in ['.js', '.ts']:
        return '//'
    elif ext in ['.sql']:
        return '--'
    else:
        return '#'  # Default to hash

def backup_file(file_path):
    """Create a backup of the original file."""
    backup_path = f"/tmp/config-backups/{Path(file_path).name}.backup"
    shutil.copy2(file_path, backup_path)
    print(f"Backed up: {file_path} -> {backup_path}")

def annotate_file(file_path):
    """Add instructional comments to a configuration file."""
    print(f"Processing: {file_path}")
    
    # Backup original file
    backup_file(file_path)
    
    # Read file content
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Determine comment syntax
    comment_char = get_comment_syntax(file_path)
    
    # Choose appropriate patterns based on file type
    if 'docker-compose' in file_path:
        patterns = {**CONFIG_PATTERNS, **DOCKER_COMPOSE_PATTERNS}
    elif 'nginx' in file_path or file_path.endswith('.conf'):
        patterns = {**CONFIG_PATTERNS, **NGINX_PATTERNS}
    else:
        patterns = CONFIG_PATTERNS
    
    # Process each line
    new_lines = []
    for i, line in enumerate(lines):
        # Check if this line matches any pattern
        line_annotated = False
        for pattern, config in patterns.items():
            if re.search(pattern, line.strip()):
                # Check if comment already exists above this line
                comment_exists = False
                if i > 0:
                    prev_line = lines[i-1].strip()
                    if 'CHANGE THIS TO' in prev_line:
                        comment_exists = True
                
                if not comment_exists:
                    # Add the instructional comment
                    comment = config['comment']
                    if not comment.startswith(comment_char):
                        comment = comment_char + ' ' + comment.lstrip('# ')
                    new_lines.append(comment + '\n')
                    line_annotated = True
                break
        
        new_lines.append(line)
    
    # Write the annotated content back to file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"Annotated: {file_path}")

def main():
    """Main function to process all configuration files."""
    # Read the list of configuration files
    config_files = []
    with open('/tmp/config_files.txt', 'r') as f:
        config_files = [line.strip() for line in f if line.strip()]
    
    # Add nginx and other config files
    additional_files = [
        './nginx/common.conf',
        './nginx/dev.conf', 
        './nginx/microservices.conf',
        './nginx/prod.conf',
        './nginx/staging.conf',
        './scripts/postgres.conf',
        './scripts/redis.conf',
        './cloud-init/cloud-init.yaml'
    ]
    
    for file_path in additional_files:
        if os.path.exists(file_path):
            config_files.append(file_path)
    
    print(f"Found {len(config_files)} configuration files to process")
    
    # Process each file
    for file_path in config_files:
        if os.path.exists(file_path):
            try:
                annotate_file(file_path)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
        else:
            print(f"File not found: {file_path}")
    
    print("\nAnnotation complete!")
    print("Original files backed up to: /tmp/config-backups/")
    print("\nNext steps:")
    print("1. Review the annotated files")
    print("2. Update the values according to the comments")
    print("3. Test your configuration")

if __name__ == "__main__":
    main()
