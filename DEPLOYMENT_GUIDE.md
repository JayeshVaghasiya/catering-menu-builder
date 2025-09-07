# Deployment Instructions

## Prerequisites
1. A cloud server (AWS EC2, DigitalOcean, Heroku, etc.)
2. Node.js installed on the server
3. A domain name (optional but recommended)

## Backend Deployment Steps

### 1. Prepare Production Environment
```bash
# Copy the production environment template
cp .env.production.example .env

# Edit the .env file with your production values:
# - Set a secure JWT_SECRET (64+ random characters)
# - Set NODE_ENV=production
# - Set PROD_CORS_ORIGIN to your frontend domain
```

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Start the Server
```bash
# For production
npm run prod

# Or with PM2 (recommended for production)
npm install -g pm2
pm2 start server.js --name "catering-backend"
pm2 startup
pm2 save
```

### 4. Configure Reverse Proxy (Nginx example)
```nginx
server {
    listen 80;
    server_name your-backend-domain.com;

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

## Frontend Deployment Steps

### 1. Update Environment Variables
Edit `react-app/.env.production`:
```
VITE_API_URL=https://your-backend-domain.com/api
```

### 2. Build for Production
```bash
cd react-app
npm run build
```

### 3. Deploy Built Files
Upload the contents of the `dist/` folder to your web server or CDN.

## Common Cloud Platforms

### Heroku
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set JWT_SECRET=your-secret`
4. Deploy: `git push heroku main`

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy automatically from Git

### AWS EC2
1. Launch an EC2 instance
2. Install Node.js and PM2
3. Clone your repository
4. Set up environment variables
5. Start the application with PM2

## Important Security Notes
- Change the JWT_SECRET to a secure random string
- Use HTTPS in production
- Set up proper firewall rules
- Regularly update dependencies
- Consider using a process manager like PM2
- Set up proper logging and monitoring
