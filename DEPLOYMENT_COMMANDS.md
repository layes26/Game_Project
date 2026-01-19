# Quick Command Reference - Hostinger Deployment

## 📋 Copy-Paste Commands

### 1. LOCAL SETUP (Run on your computer)

```bash
# Create SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/hostinger_key

# Connect to server
ssh -i ~/.ssh/hostinger_key user@yourdomain.com

# Git setup (if first time)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### 2. SERVER SETUP (Run on Hostinger after SSH)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js
node --version
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Enable PM2 startup
pm2 startup
pm2 save

# Install Git
sudo apt install -y git

# Install Nginx
sudo apt install -y nginx

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. DATABASE (MongoDB Atlas - do online)

Visit: https://cloud.mongodb.com

1. Create account
2. Create cluster (Free tier)
3. Create database user
4. Whitelist 0.0.0.0/0 in Network Access
5. Get connection string: mongodb+srv://user:password@...

### 4. CLONE & SETUP BACKEND

```bash
# Clone project
cd ~
git clone https://github.com/YOUR_USERNAME/Game_Project.git
cd Game_Project/backend_node

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
PORT=3001
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/gaming_store
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-email@appspot.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NODE_ENV=production
EOF

# Build
npm run build

# Start with PM2
pm2 start npm --name "gaming-store-api" -- run start

# Check it's running
pm2 list
pm2 logs gaming-store-api
```

### 5. CLONE & SETUP FRONTEND

```bash
# Install dependencies
cd ~/Game_Project/frontend
npm install

# Create .env.production
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
EOF

# Build
npm run build

# Start with PM2
pm2 start npm --name "gaming-store-web" -- run start

# Check it's running
pm2 list
pm2 logs gaming-store-web
```

### 6. NGINX CONFIGURATION

Create `/etc/nginx/sites-available/yourdomain.com`:

```bash
sudo nano /etc/nginx/sites-available/yourdomain.com
```

Paste:

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API Backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL CERTIFICATE

```bash
# Get certificate for all domains
sudo certbot certonly --nginx \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d api.yourdomain.com

# Follow prompts, then update Nginx config:
sudo nano /etc/nginx/sites-available/yourdomain.com
```

Add these lines to each server block:

```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
listen 443 ssl http2;
```

And add redirect from HTTP to HTTPS:

```nginx
# Add another server block at top
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com api.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

### 8. VERIFY DEPLOYMENT

```bash
# Check all processes
pm2 list

# View logs
pm2 logs

# Check specific log
pm2 logs gaming-store-api

# Test API endpoint
curl https://api.yourdomain.com/health

# Check Nginx status
sudo systemctl status nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### 9. DAILY OPERATIONS

```bash
# Start all processes
pm2 start all

# Stop all processes
pm2 stop all

# Restart all processes
pm2 restart all

# Delete process
pm2 delete gaming-store-api

# View process info
pm2 info gaming-store-api

# Monitor in real-time
pm2 monit
```

### 10. UPDATES & MAINTENANCE

```bash
# Pull latest code
cd ~/Game_Project
git pull origin main

# Rebuild backend
cd backend_node
npm install
npm run build

# Rebuild frontend
cd ../frontend
npm install
npm run build

# Restart all
pm2 restart all

# View logs to confirm
pm2 logs

# Auto-renew SSL certificate (runs automatically)
sudo certbot renew --quiet

# Check certificate expiry
sudo certbot certificates
```

---

## 🔑 Important Environment Variables

### Backend (.env)
```
PORT=3001
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/gaming_store
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[LONG KEY]\n-----END PRIVATE KEY-----\n"
NODE_ENV=production
```

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
```

---

## ⚠️ Common Issues

### Backend won't start
```bash
# Check logs
pm2 logs gaming-store-api

# Common fixes:
# 1. Firebase credentials invalid - copy from Firebase Console
# 2. MongoDB connection failed - check whitelist IPs at MongoDB Atlas
# 3. Port 3001 in use - sudo lsof -i :3001

# Kill process on port
sudo kill -9 $(lsof -t -i:3001)
```

### Frontend won't load
```bash
# Check logs
pm2 logs gaming-store-web

# Common fixes:
# 1. API URL wrong - check NEXT_PUBLIC_API_URL in .env
# 2. Build failed - npm run build locally first
# 3. Port 3000 in use - sudo lsof -i :3000
```

### SSL certificate issues
```bash
# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## 📊 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Get CPU/Memory usage
pm2 status

# List all processes
pm2 list

# Show config
pm2 show gaming-store-api

# View environment
pm2 env gaming-store-api
```

---

## 🚀 Quick Deploy Checklist

- [ ] GitHub repo created
- [ ] SSH key generated & added to Hostinger
- [ ] Hostinger VPS/Cloud plan purchased
- [ ] Domain purchased & pointed to Hostinger
- [ ] MongoDB Atlas cluster created
- [ ] Firebase credentials obtained
- [ ] Server: Node.js, PM2, Git, Nginx, Certbot installed
- [ ] Backend cloned, configured, running
- [ ] Frontend cloned, configured, running
- [ ] Nginx configured for both frontend & API
- [ ] SSL certificate installed
- [ ] All tests passing
- [ ] PM2 startup enabled
- [ ] Logs verified - no errors

---

**Deploy time: ~1.5-2 hours from scratch** ⏱️
