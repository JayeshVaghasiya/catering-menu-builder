// PostgreSQL database helper for Supabase
const { Pool } = require('pg');

// Database connection
let pool = null;

function getPool() {
  if (pool) return pool;
  
  // Use Supabase connection string from environment variables
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL or SUPABASE_DB_URL environment variable is required');
  }
  
  pool = new Pool({
    connectionString,
    ssl: false
  });
  
  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
  
  console.log('✅ PostgreSQL connection pool created');
  return pool;
}

// Initialize database and create admin user if needed
async function initializeDatabase() {
  const pool = getPool();
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to Supabase PostgreSQL database');
    
    // Check if admin user exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@catering.com';
    const result = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (result.rows.length === 0) {
      console.log('ℹ️  Admin user not found. Create one using the register endpoint.');
    } else {
      console.log(`✅ Admin user exists: ${adminEmail}`);
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Database helper functions
async function findUserByEmail(email) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

async function findUserById(id) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

async function createUser(userData) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const {
      email,
      password_hash,
      owner_name,
      business_name,
      phone,
      address,
      tagline,
      services,
      special_notes,
      logo_data_url,
      ganapati_data_url,
      customer_name
    } = userData;
    
    const result = await client.query(`
      INSERT INTO users (
        email, password_hash, owner_name, business_name, phone, address,
        tagline, services, special_notes, logo_data_url, ganapati_data_url, customer_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      email, password_hash, owner_name, business_name, phone, address,
      tagline, services, special_notes, logo_data_url, ganapati_data_url, customer_name
    ]);
    
    return result.rows[0];
  } finally {
    client.release();
  }
}

async function updateUser(id, updates) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    // Build dynamic update query
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await client.query(`
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, values);
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

async function updateUserMenus(userId, menus) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      UPDATE users 
      SET menus = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [userId, JSON.stringify(menus)]);
    
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

// Graceful shutdown
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Database connection pool closed');
  }
}

module.exports = {
  initializeDatabase,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  updateUserMenus,
  closePool,
  getPool
};
