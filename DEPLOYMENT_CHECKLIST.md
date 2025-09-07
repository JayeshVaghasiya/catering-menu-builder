# Deployment Checklist for Santosh Catering

## Frontend Deployment (Vercel)
✅ Domain: `https://santosh-catering.vercel.app/`

### Steps:
1. **Build the React app:**
   ```bash
   cd react-app
   npm run build
   ```

2. **Deploy to Vercel:**
   - Connect your GitHub repository to Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-domain.com/api`

## Backend Deployment

### Option 1: Heroku (Recommended)
1. **Create Heroku app:**
   ```bash
   heroku create santosh-catering-api
   ```

2. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-64-character-secure-random-string
   heroku config:set PROD_CORS_ORIGIN=https://santosh-catering.vercel.app
   ```

3. **Deploy:**
   ```bash
   git subtree push --prefix=backend heroku main
   ```

4. **Your backend will be at:** `https://santosh-catering-api.herokuapp.com`

### Option 2: Railway
1. Connect GitHub repository
2. Select backend folder
3. Set environment variables in dashboard
4. Deploy automatically

### Option 3: DigitalOcean App Platform
1. Connect GitHub repository
2. Select backend folder as source
3. Set environment variables
4. Deploy

## Final Configuration Updates

### Once Backend is Deployed:
1. **Update frontend environment:**
   Edit `react-app/.env.production`:
   ```
   VITE_API_URL=https://your-actual-backend-domain.com/api
   ```

2. **Redeploy frontend** with updated API URL

## Testing Checklist
- [ ] Frontend loads at https://santosh-catering.vercel.app/
- [ ] Backend API responds at your backend domain
- [ ] User registration works
- [ ] User login works
- [ ] Menu creation and saving works
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness

## Security Notes
- Generate a secure JWT_SECRET (64+ random characters)
- Use HTTPS for both frontend and backend
- Verify CORS settings are working correctly
