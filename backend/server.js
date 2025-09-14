const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import database helper (Supabase for both development and production)
const database = require('./db-supabase');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Dynamic CORS configuration based on environment
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://santosh-catering.vercel.app',
      'https://cateringmenu-frontend-jayesh.vercel.app',
      'http://localhost:4173',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:4173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ]
  : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://localhost:4173'];

console.log('CORS enabled for origins:', allowedOrigins);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow any localhost origin
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Initialize database (PostgreSQL for production, SQLite for development)
async function initializeDatabase() {
  await database.initializeDatabase();
  
  // Create default admin user if in production
  if (process.env.NODE_ENV === 'production') {
    await createDefaultTestUser();
  }
}

// Function to create default test user
async function createDefaultTestUser() {
  try {
    // Use environment variables for persistent admin account
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@catering.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Check if admin user already exists
    const existingUser = await database.findUserByEmail(adminEmail);
    
    if (!existingUser) {
      // Create admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const userId = require('uuid').v4();
      
      await database.createUser({
        id: userId,
        email: adminEmail,
        password: hashedPassword,
        owner_name: 'Admin User',
        business_name: 'Catering Menu Pro',
        phone: '+1-800-CATERING',
        address: 'Admin Address',
        tagline: 'Professional catering menu creator',
        services: 'Wedding Catering, Corporate Events, Birthday Parties, Festival Catering',
        special_notes: '⚠️ This is a demo admin account. In production, create your own account.'
      });
      
      console.log('✅ Admin user created/verified:');
      console.log(`   Email: ${adminEmail}`);
      console.log('   Password: [Set via ADMIN_PASSWORD env var]');
      console.log('⚠️  IMPORTANT: Set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel env vars for production');
    } else {
      console.log(`✅ Admin user exists: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Error creating/checking admin user:', error);
  }
}

// Initialize database on startup
initializeDatabase().catch(console.error);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      ownerName = 'Business Owner', 
      businessName = 'My Catering Business', 
      phone = '', 
      address = '',
      tagline = 'Tasty catering & events',
      services = 'Catering, Events, Celebrations',
      specialNotes = ''
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    try {
      const existingUser = await database.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const userId = uuidv4();

      // Create new user with profile data
      const userData = {
        id: userId,
        email: email,
        password: hashedPassword,
        owner_name: ownerName,
        business_name: businessName,
        phone: phone,
        address: address,
        tagline: tagline,
        services: services,
        special_notes: specialNotes,
        menus: []
      };

      await database.createUser(userData);

      // Generate JWT token
      const token = jwt.sign(
        { userId: userId, email: email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return user data in the format expected by frontend
      const responseData = {
        id: userId,
        email: email,
        ownerName: ownerName,
        businessName: businessName,
        phone: phone,
        address: address,
        tagline: tagline,
        services: services,
        specialNotes: specialNotes,
        menus: [],
        createdAt: new Date().toISOString()
      };

      res.status(201).json({
        message: 'User created successfully',
        user: responseData,
        token: token
      });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error during registration' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await database.findUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return complete user profile data
    const userData = {
      id: user.id,
      email: user.email,
      ownerName: user.owner_name || '',
      businessName: user.business_name || '',
      phone: user.phone || '',
      address: user.address || '',
      tagline: user.tagline || 'Tasty catering & events',
      services: user.services || 'Catering, Events, Celebrations',
      specialNotes: user.special_notes || '',
      logoDataUrl: user.logo_data_url || '',
      ganapatiDataUrl: user.ganapati_data_url || '',
      menus: user.menus || [],
      createdAt: user.created_at
    };

    res.json({
      message: 'Login successful',
      user: userData,
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (verify token)
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    // Get user details from database to ensure they still exist
    const user = await database.findUserById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return complete user profile data
    const userData = {
      id: user.id,
      email: user.email,
      ownerName: user.owner_name || '',
      businessName: user.business_name || '',
      phone: user.phone || '',
      address: user.address || '',
      tagline: user.tagline || 'Tasty catering & events',
      services: user.services || 'Catering, Events, Celebrations',
      specialNotes: user.special_notes || '',
      logoDataUrl: user.logo_data_url || '',
      ganapatiDataUrl: user.ganapati_data_url || '',
      menus: user.menus || [],
      createdAt: user.created_at
    };

    res.json({
      user: userData
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Logout
app.post('/api/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Save menu
app.post('/api/menus', authenticateToken, async (req, res) => {
  try {
    const { menuData } = req.body;
    const userId = req.user.userId;

    if (!menuData) {
      return res.status(400).json({ error: 'Menu data is required' });
    }

    // Get current user's menus
    const user = await database.findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse existing menus and add new menu
    const existingMenus = user.menus || [];
    const newMenu = {
      id: Date.now().toString(),
      ...menuData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedMenus = [...existingMenus, newMenu];

    // Save back to database
    await database.updateUserMenus(userId, updatedMenus);

    res.json({
      message: 'Menu saved successfully',
      menu: newMenu
    });
  } catch (error) {
    console.error('Save menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update menu
app.put('/api/menus/:menuId', authenticateToken, async (req, res) => {
  try {
    const { menuId } = req.params;
    const { menuData } = req.body;
    const userId = req.user.userId;

    if (!menuData) {
      return res.status(400).json({ error: 'Menu data is required' });
    }

    // Get current user's menus
    const user = await database.findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse existing menus and update the specific menu
    const existingMenus = user.menus || [];
    const updatedMenus = existingMenus.map(menu => 
      menu.id === menuId 
        ? { ...menu, ...menuData, updatedAt: new Date().toISOString() }
        : menu
    );

    // Save back to database
    await database.updateUserMenus(userId, updatedMenus);

    res.json({
      message: 'Menu updated successfully'
    });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete menu
app.delete('/api/menus/:menuId', authenticateToken, async (req, res) => {
  try {
    const { menuId } = req.params;
    const userId = req.user.userId;

    // Get current user's menus
    const user = await database.findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse existing menus and remove the specific menu
    const existingMenus = user.menus || [];
    const updatedMenus = existingMenus.filter(menu => menu.id !== menuId);

    // Save back to database
    await database.updateUserMenus(userId, updatedMenus);

    res.json({
      message: 'Menu deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server (for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`CORS enabled for React dev server on http://localhost:5173`);
  });
}

// Export for Vercel
module.exports = app;
