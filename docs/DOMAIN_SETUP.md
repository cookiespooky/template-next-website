
# Domain Setup Guide

Complete guide for setting up domains and DNS configuration for the Course Platform deployment.

## 🌐 Domain Requirements

You'll need the following domains/subdomains configured:

- `example.com` - Main production domain
- `www.example.com` - WWW version (redirects to main)
- `staging.example.com` - Staging environment
- `dev.example.com` - Development environment

## 📋 DNS Configuration

### A Records
Point these domains to your server's IP address:

```
Type    Name                Value           TTL
A       example.com         YOUR_SERVER_IP  300
A       www.example.com     YOUR_SERVER_IP  300
A       staging.example.com YOUR_SERVER_IP  300
A       dev.example.com     YOUR_SERVER_IP  300
```

### CNAME Records (Alternative)
If you prefer using CNAME records for subdomains:

```
Type    Name        Value           TTL
A       example.com YOUR_SERVER_IP  300
CNAME   www         example.com     300
CNAME   staging     example.com     300
CNAME   dev         example.com     300
```

## 🔧 DNS Provider Setup

### Cloudflare Setup

1. **Add Site to Cloudflare**
   ```bash
   # Add your domain to Cloudflare
   # Update nameservers at your registrar
   ```

2. **DNS Records**
   ```
   Type    Name        Content         Proxy Status
   A       example.com YOUR_SERVER_IP  Proxied
   A       www         YOUR_SERVER_IP  Proxied
   A       staging     YOUR_SERVER_IP  Proxied
   A       dev         YOUR_SERVER_IP  Proxied
   ```

3. **SSL/TLS Settings**
   - Set SSL/TLS encryption mode to "Full (strict)"
   - Enable "Always Use HTTPS"
   - Enable "HTTP Strict Transport Security (HSTS)"

### AWS Route 53 Setup

1. **Create Hosted Zone**
   ```bash
   aws route53 create-hosted-zone \
     --name example.com \
     --caller-reference $(date +%s)
   ```

2. **Create DNS Records**
   ```json
   {
     "Changes": [
       {
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "example.com",
           "Type": "A",
           "TTL": 300,
           "ResourceRecords": [{"Value": "YOUR_SERVER_IP"}]
         }
       },
       {
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "www.example.com",
           "Type": "A",
           "TTL": 300,
           "ResourceRecords": [{"Value": "YOUR_SERVER_IP"}]
         }
       }
     ]
   }
   ```

### Google Cloud DNS Setup

1. **Create DNS Zone**
   ```bash
   gcloud dns managed-zones create example-com \
     --description="Course Platform DNS Zone" \
     --dns-name=example.com
   ```

2. **Add Records**
   ```bash
   gcloud dns record-sets transaction start --zone=example-com
   
   gcloud dns record-sets transaction add YOUR_SERVER_IP \
     --name=example.com --ttl=300 --type=A --zone=example-com
   
   gcloud dns record-sets transaction add YOUR_SERVER_IP \
     --name=www.example.com --ttl=300 --type=A --zone=example-com
   
   gcloud dns record-sets transaction execute --zone=example-com
   ```

## 🔒 SSL Certificate Setup

### Let's Encrypt with Certbot

1. **Install Certbot** (if not already installed)
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Generate Certificates**
   ```bash
   # For all domains at once
   sudo certbot --nginx -d example.com -d www.example.com -d staging.example.com -d dev.example.com
   
   # Or individually
   sudo certbot --nginx -d example.com -d www.example.com
   sudo certbot --nginx -d staging.example.com
   sudo certbot --nginx -d dev.example.com
   ```

3. **Verify Auto-Renewal**
   ```bash
   sudo certbot renew --dry-run
   ```

4. **Check Certificate Status**
   ```bash
   sudo certbot certificates
   ```

### Manual Certificate Setup

If you have existing certificates:

1. **Copy Certificates**
   ```bash
   sudo mkdir -p /etc/nginx/ssl
   sudo cp your-certificate.crt /etc/nginx/ssl/example.com.crt
   sudo cp your-private-key.key /etc/nginx/ssl/example.com.key
   sudo chmod 600 /etc/nginx/ssl/*
   ```

2. **Update Nginx Configuration**
   ```nginx
   ssl_certificate /etc/nginx/ssl/example.com.crt;
   ssl_certificate_key /etc/nginx/ssl/example.com.key;
   ```

## 🧪 Testing DNS Configuration

### DNS Propagation Check
```bash
# Check DNS propagation
dig example.com
dig www.example.com
dig staging.example.com
dig dev.example.com

# Check from different locations
nslookup example.com 8.8.8.8
nslookup example.com 1.1.1.1
```

### Online Tools
- [DNS Checker](https://dnschecker.org/)
- [What's My DNS](https://www.whatsmydns.net/)
- [DNS Propagation Checker](https://www.dnswatch.info/)

### Local Testing
Add entries to `/etc/hosts` for local testing:

```bash
# Add to /etc/hosts for local testing
YOUR_SERVER_IP example.com
YOUR_SERVER_IP www.example.com
YOUR_SERVER_IP staging.example.com
YOUR_SERVER_IP dev.example.com
```

## 🔧 Server Configuration

### Update Environment Files
Update your environment files with the correct domains:

```bash
# .env.dev
NEXTAUTH_URL=http://dev.example.com

# .env.staging
NEXTAUTH_URL=https://staging.example.com

# .env.prod
NEXTAUTH_URL=https://www.example.com
```

### Update Nginx Configuration
The provided Nginx configurations already include the correct server names, but verify:

```nginx
# nginx/prod.conf
server_name example.com www.example.com;

# nginx/staging.conf
server_name staging.example.com;

# nginx/dev.conf
server_name dev.example.com;
```

## 🚀 Deployment After DNS Setup

1. **Wait for DNS Propagation**
   ```bash
   # Usually takes 5-15 minutes, can take up to 48 hours
   dig example.com
   ```

2. **Generate SSL Certificates**
   ```bash
   sudo certbot --nginx -d example.com -d www.example.com
   sudo certbot --nginx -d staging.example.com
   sudo certbot --nginx -d dev.example.com
   ```

3. **Deploy Applications**
   ```bash
   # Deploy to all environments
   ./scripts/deploy.sh dev
   ./scripts/deploy.sh staging
   ./scripts/deploy.sh prod
   ```

4. **Test All Environments**
   ```bash
   curl -I https://www.example.com/health
   curl -I https://staging.example.com/health
   curl -I http://dev.example.com/health
   ```

## 🔍 Verification Checklist

### DNS Verification
- [ ] `example.com` resolves to server IP
- [ ] `www.example.com` resolves to server IP
- [ ] `staging.example.com` resolves to server IP
- [ ] `dev.example.com` resolves to server IP
- [ ] DNS propagation complete globally

### SSL Verification
- [ ] SSL certificate installed for production domains
- [ ] SSL certificate installed for staging domain
- [ ] HTTPS redirects working
- [ ] Certificate auto-renewal configured

### Application Verification
- [ ] Production site accessible at `https://www.example.com`
- [ ] Staging site accessible at `https://staging.example.com`
- [ ] Development site accessible at `http://dev.example.com`
- [ ] Health endpoints responding correctly

### Security Verification
- [ ] HTTPS enforced on production and staging
- [ ] Security headers present
- [ ] Rate limiting working
- [ ] Basic auth protecting development areas

## 🛠️ Troubleshooting

### DNS Issues

**Problem**: Domain not resolving
```bash
# Check DNS configuration
dig example.com
nslookup example.com

# Check nameservers
dig NS example.com
```

**Solution**: Verify DNS records and wait for propagation

### SSL Issues

**Problem**: SSL certificate not working
```bash
# Check certificate
sudo certbot certificates

# Test SSL
openssl s_client -connect example.com:443
```

**Solution**: Regenerate certificate or check Nginx configuration

### Nginx Issues

**Problem**: Nginx not serving correct site
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

**Solution**: Verify server_name directives and restart Nginx

## 📞 Support Resources

### DNS Providers Documentation
- [Cloudflare DNS](https://developers.cloudflare.com/dns/)
- [AWS Route 53](https://docs.aws.amazon.com/route53/)
- [Google Cloud DNS](https://cloud.google.com/dns/docs)
- [Namecheap DNS](https://www.namecheap.com/support/knowledgebase/category/10/dns-and-nameservers/)

### SSL Certificate Resources
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot User Guide](https://certbot.eff.org/docs/using.html)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)

---

**Next Steps**: After completing domain setup, proceed to [Security Configuration](./SECURITY.md)
