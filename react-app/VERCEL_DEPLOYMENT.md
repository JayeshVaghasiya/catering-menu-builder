# Single Vercel Project Deployment Guide

## ✅ Project Structure Complete!

Your project is now restructured as a single Vercel project with:
- **Frontend**: React app in the root
- **Backend**: Serverless API functions in `/api`
- **Database**: SQLite database copied to the project

## 🚀 Deployment Steps

### 1. Set Environment Variables in Vercel

Go to your Vercel project dashboard and add:

```bash
JWT_SECRET=3737d80a5fc4d083a6365e15a814c767d81dae2bc97841f48de25958b05981bf
NODE_ENV=production
```

### 2. Deploy to Vercel

Since you're already connected to Vercel, just push your changes:

```bash
git add .
git commit -m "Restructure as single Vercel project with API routes"
git push origin main
```

### 3. Verify Deployment

After deployment, test these endpoints:

- **Frontend**: `https://santosh-catering.vercel.app/`
- **API Health Check**: `https://santosh-catering.vercel.app/api/user` (should return "Access token required")
- **Register**: POST to `https://santosh-catering.vercel.app/api/register`
- **Login**: POST to `https://santosh-catering.vercel.app/api/login`

## 📁 What Changed

### New API Structure:
```
react-app/
├── api/
│   ├── auth.js          # Authentication utilities
│   ├── db.js            # Database utilities
│   ├── register.js      # User registration endpoint
│   ├── login.js         # User login endpoint
│   ├── user.js          # User profile endpoint
│   └── menus.js         # Menu management endpoint
├── database.sqlite      # Database file
├── vercel.json          # Vercel configuration
└── package.json         # Updated with backend dependencies
```

### Updated Configuration:
- API URL changed from external backend to `/api`
- CORS configured for same-domain requests
- Database utilities for Vercel serverless environment
- JWT authentication moved to utilities

## 🎯 Benefits of This Approach

1. **Single Deployment**: Only one project to manage
2. **No CORS Issues**: Frontend and backend on same domain
3. **Simplified Configuration**: No separate backend server needed
4. **Better Performance**: Vercel's edge functions
5. **Automatic Scaling**: Serverless functions scale automatically

## ⚠️ Important Notes

- Database will be stored in `/tmp` on Vercel (resets on deployments)
- For production, consider using Vercel's PostgreSQL or external database
- All existing users and menus are preserved in the copied database

Your application is now ready for seamless deployment as a single Vercel project! 🎉
