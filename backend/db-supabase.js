// Supabase database helper using JavaScript client
const { createClient } = require('@supabase/supabase-js');

// Supabase connection
let supabase = null;

function getSupabase() {
  if (supabase) return supabase;
  
  const supabaseUrl = process.env.SUPABASE_URL || 'https://vetrzqgokhybmufvgzzf.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZldHJ6cWdva2h5Ym11ZnZnenpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDY0OTQsImV4cCI6MjA3MzQyMjQ5NH0.5BmnKmoSvx8A5ynNnYSiht6Qv8uZrkgU-bYo8EdUHYw';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');
  return supabase;
}

// Initialize database and create admin user if needed
async function initializeDatabase() {
  const supabase = getSupabase();
  
  try {
    // Test connection by checking if users table exists
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection error:', error);
      throw error;
    }
    
    console.log('✅ Connected to Supabase database');
    
    // Check if admin user exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@catering.com';
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single();
    
    if (!adminUser) {
      console.log('ℹ️  Admin user not found. Create one using the register endpoint.');
    } else {
      console.log(`✅ Admin user exists: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Database helper functions
async function findUserByEmail(email) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error;
  }
  
  return data;
}

async function findUserById(id) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error;
  }
  
  return data;
}

async function createUser(userData) {
  const supabase = getSupabase();
  
  const {
    id,
    email,
    password,
    owner_name,
    business_name,
    phone,
    address,
    tagline,
    services,
    special_notes,
    logo_data_url,
    ganapati_data_url,
    customer_name,
    menus = []
  } = userData;
  
  const { data, error } = await supabase
    .from('users')
    .insert([{
      id,
      email,
      password_hash: password,
      owner_name,
      business_name,
      phone,
      address,
      tagline,
      services,
      special_notes,
      logo_data_url,
      ganapati_data_url,
      customer_name,
      menus
    }])
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

async function updateUser(id, updates) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

async function updateUserMenus(userId, menus) {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('users')
    .update({ menus })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

module.exports = {
  initializeDatabase,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  updateUserMenus,
  getSupabase
};
