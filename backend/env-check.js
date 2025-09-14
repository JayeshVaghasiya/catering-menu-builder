// Simple environment variable checker endpoint
// Add this temporarily to server.js for debugging

app.get('/api/env-check', (req, res) => {
  res.json({
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
    hasJwtSecret: !!process.env.SUPABASE_JWT_SECRET || !!process.env.JWT_SECRET,
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    hasNodeEnv: !!process.env.NODE_ENV,
    nodeEnv: process.env.NODE_ENV
  });
});
