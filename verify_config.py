#!/usr/bin/env python3
"""
Configuration Verification Script
Checks if all required configuration values have been updated from their default/example values.
"""

import os
import re
from pathlib import Path

# Default/example values that should be changed
DEFAULT_VALUES = [
    'your_super_secure_jwt_secret_key_here',
    'your_super_secure_session_secret_key_here',
    'your_super_secure_nextauth_secret_key_here',
    'your_super_secure_internal_webhook_secret',
    'secure_postgres_password_change_this',
    'postgres123',
    'your_yookassa_shop_id',
    'your_yookassa_secret_key',
    'your_yookassa_webhook_secret',
    'your_email@gmail.com',
    'your_app_password',
    'courseplatform.com',
    'localhost',
    'G-XXXXXXXXXX',
    '123456789012345',
    'abcdefghij',
    'admin@courseplatform.com',
    'noreply@courseplatform.com'
]

# Critical configuration keys that must be changed
CRITICAL_KEYS = [
    'POSTGRES_PASSWORD',
    'JWT_SECRET',
    'SESSION_SECRET',
    'NEXTAUTH_SECRET',
    'YOOKASSA_SHOP_ID',
    'YOOKASSA_SECRET_KEY',
    'DOMAIN',
    'NEXTAUTH_URL',
    'SMTP_USER',
    'SMTP_PASS'
]

def check_env_file(file_path):
    """Check an environment file for unchanged default values."""
    issues = []
    
    if not os.path.exists(file_path):
        return [f"File not found: {file_path}"]
    
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    for line_num, line in enumerate(lines, 1):
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip()
            
            # Check if this is a critical key with a default value
            if key in CRITICAL_KEYS:
                for default_val in DEFAULT_VALUES:
                    if default_val in value:
                        issues.append(f"Line {line_num}: {key} still has default value")
                        break
                
                # Check for empty critical values
                if not value or value in ['""', "''"]:
                    issues.append(f"Line {line_num}: {key} is empty")
    
    return issues

def check_nginx_config(file_path):
    """Check nginx configuration for default domain names."""
    issues = []
    
    if not os.path.exists(file_path):
        return [f"File not found: {file_path}"]
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check for default server names
    default_domains = ['localhost', 'courseplatform.local', 'example.com']
    for domain in default_domains:
        if f'server_name {domain}' in content or f'server_name *.{domain}' in content:
            issues.append(f"Default domain '{domain}' found in server_name directive")
    
    return issues

def check_docker_compose(file_path):
    """Check docker-compose file for default values."""
    issues = []
    
    if not os.path.exists(file_path):
        return [f"File not found: {file_path}"]
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check for default passwords in docker-compose
    if 'postgres123' in content:
        issues.append("Default PostgreSQL password 'postgres123' found")
    
    # Check for localhost URLs in production files
    if 'prod' in file_path and 'localhost' in content:
        issues.append("localhost URLs found in production configuration")
    
    return issues

def main():
    """Main verification function."""
    print("🔍 Configuration Verification Report")
    print("=" * 50)
    
    all_issues = []
    
    # Check environment files
    env_files = [
        '.env',
        '.env.microservices.example',
        'app/.env',
        'app/.env.example',
        'services/admin-backend/.env.example',
        'services/blog-backend/.env.example',
        'services/payment-service/.env.example'
    ]
    
    print("\n📄 Checking Environment Files:")
    for env_file in env_files:
        if os.path.exists(env_file):
            issues = check_env_file(env_file)
            if issues:
                print(f"\n❌ {env_file}:")
                for issue in issues:
                    print(f"   • {issue}")
                all_issues.extend(issues)
            else:
                print(f"✅ {env_file}: OK")
        else:
            print(f"⚠️  {env_file}: Not found")
    
    # Check nginx configurations
    nginx_files = [
        'nginx/microservices.conf',
        'nginx/prod.conf',
        'nginx/staging.conf',
        'nginx/dev.conf'
    ]
    
    print("\n🌐 Checking Nginx Configurations:")
    for nginx_file in nginx_files:
        if os.path.exists(nginx_file):
            issues = check_nginx_config(nginx_file)
            if issues:
                print(f"\n❌ {nginx_file}:")
                for issue in issues:
                    print(f"   • {issue}")
                all_issues.extend(issues)
            else:
                print(f"✅ {nginx_file}: OK")
        else:
            print(f"⚠️  {nginx_file}: Not found")
    
    # Check docker-compose files
    compose_files = [
        'docker-compose.microservices.yml',
        'docker-compose.prod.yml',
        'docker-compose.staging.yml',
        'docker-compose.dev.yml'
    ]
    
    print("\n🐳 Checking Docker Compose Files:")
    for compose_file in compose_files:
        if os.path.exists(compose_file):
            issues = check_docker_compose(compose_file)
            if issues:
                print(f"\n❌ {compose_file}:")
                for issue in issues:
                    print(f"   • {issue}")
                all_issues.extend(issues)
            else:
                print(f"✅ {compose_file}: OK")
        else:
            print(f"⚠️  {compose_file}: Not found")
    
    # Summary
    print("\n" + "=" * 50)
    if all_issues:
        print(f"❌ Found {len(all_issues)} configuration issues that need attention!")
        print("\n📋 Next Steps:")
        print("1. Review the issues listed above")
        print("2. Update the configuration files with proper values")
        print("3. Run this script again to verify fixes")
        print("4. Refer to CONFIGURATION_GUIDE.md for detailed instructions")
    else:
        print("✅ All configuration files look good!")
        print("\n🚀 You're ready to deploy!")
        print("   • Make sure to test your configuration in a staging environment first")
        print("   • Verify external service connections (database, email, payments)")
        print("   • Check SSL certificates and domain DNS settings")
    
    print(f"\n📊 Total issues found: {len(all_issues)}")
    
    return len(all_issues) == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
