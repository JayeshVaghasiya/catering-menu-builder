# Database Migration Guide - SQLite to Supabase

## Why we need to migrate from SQLite

**Current Problem:**
- SQLite database stored in Vercel's `/tmp` directory
- Gets wiped on every deployment 
- All users lose their accounts and menus
- Not suitable for production

**Solution:**
- Migrate to Supabase (PostgreSQL)
- Persistent, reliable, and free
- Keeps user data safe across deployments

## Setup Steps

### 1. Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub
3. Create new project

### 2. Get Database Connection
- Copy your database URL from Supabase dashboard
- Add to Vercel environment variables

### 3. Update Backend Code
- Replace SQLite with PostgreSQL queries
- Use Supabase connection string
- Test with existing user data

## Benefits
✅ Persistent data across deployments
✅ Better performance
✅ Scalable for real users
✅ Automatic backups
✅ Real-time features available
