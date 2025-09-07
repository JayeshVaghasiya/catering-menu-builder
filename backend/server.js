const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    
    // Create users table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        owner_name TEXT,
        business_name TEXT,
        phone TEXT,
        address TEXT,
        tagline TEXT,
        services TEXT,
        special_notes TEXT,
        logo_data_url TEXT,
        ganapati_data_url TEXT,
        menus TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table ready');
        
        // Add new columns to existing table if they don't exist
        const alterQueries = [
          'ALTER TABLE users ADD COLUMN owner_name TEXT',
          'ALTER TABLE users ADD COLUMN business_name TEXT',
          'ALTER TABLE users ADD COLUMN phone TEXT',
          'ALTER TABLE users ADD COLUMN address TEXT',
          'ALTER TABLE users ADD COLUMN tagline TEXT',
          'ALTER TABLE users ADD COLUMN services TEXT',
          'ALTER TABLE users ADD COLUMN special_notes TEXT',
          'ALTER TABLE users ADD COLUMN logo_data_url TEXT',
          'ALTER TABLE users ADD COLUMN ganapati_data_url TEXT',
          'ALTER TABLE users ADD COLUMN menus TEXT DEFAULT \'[]\''
        ];
        
        alterQueries.forEach(query => {
          db.run(query, (err) => {
            // Ignore errors - columns might already exist
          });
        });
      }
    });
  }
});

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
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const userId = uuidv4();

      // Insert new user with profile data
      db.run(
        `INSERT INTO users (
          id, email, password, owner_name, business_name, phone, address, 
          tagline, services, special_notes, menus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, email, hashedPassword, ownerName, businessName, phone, 
          address, tagline, services, specialNotes, '[]'
        ],
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to create user' });
          }

          // Generate JWT token
          const token = jwt.sign(
            { userId: userId, email: email },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          // Return user data in the format expected by frontend
          const userData = {
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
            user: userData,
            token: token
          });
        }
      );
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, row.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: row.id, email: row.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return complete user profile data
      const userData = {
        id: row.id,
        email: row.email,
        ownerName: row.owner_name || '',
        businessName: row.business_name || '',
        phone: row.phone || '',
        address: row.address || '',
        tagline: row.tagline || 'Tasty catering & events',
        services: row.services || 'Catering, Events, Celebrations',
        specialNotes: row.special_notes || '',
        logoDataUrl: row.logo_data_url || '',
        ganapatiDataUrl: row.ganapati_data_url || '',
        menus: JSON.parse(row.menus || '[]'),
        createdAt: row.created_at
      };

      res.json({
        message: 'Login successful',
        user: userData,
        token: token
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (verify token)
app.get('/api/user', authenticateToken, (req, res) => {
  // Get user details from database to ensure they still exist
  db.get('SELECT * FROM users WHERE id = ?', [req.user.userId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return complete user profile data
    const userData = {
      id: row.id,
      email: row.email,
      ownerName: row.owner_name || '',
      businessName: row.business_name || '',
      phone: row.phone || '',
      address: row.address || '',
      tagline: row.tagline || 'Tasty catering & events',
      services: row.services || 'Catering, Events, Celebrations',
      specialNotes: row.special_notes || '',
      logoDataUrl: row.logo_data_url || '',
      ganapatiDataUrl: row.ganapati_data_url || '',
      menus: JSON.parse(row.menus || '[]'),
      createdAt: row.created_at
    };

    res.json({
      user: userData
    });
  });
});

// Logout
app.post('/api/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Save menu
app.post('/api/menus', authenticateToken, (req, res) => {
  try {
    const { menuData } = req.body;
    const userId = req.user.userId;

    if (!menuData) {
      return res.status(400).json({ error: 'Menu data is required' });
    }

    // Get current user's menus
    db.get('SELECT menus FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Parse existing menus and add new menu
      const existingMenus = JSON.parse(row.menus || '[]');
      const newMenu = {
        id: Date.now().toString(),
        ...menuData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedMenus = [...existingMenus, newMenu];

      // Save back to database
      db.run('UPDATE users SET menus = ? WHERE id = ?', [JSON.stringify(updatedMenus), userId], (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save menu' });
        }

        res.json({
          message: 'Menu saved successfully',
          menu: newMenu
        });
      });
    });
  } catch (error) {
    console.error('Save menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update menu
app.put('/api/menus/:menuId', authenticateToken, (req, res) => {
  try {
    const { menuId } = req.params;
    const { menuData } = req.body;
    const userId = req.user.userId;

    if (!menuData) {
      return res.status(400).json({ error: 'Menu data is required' });
    }

    // Get current user's menus
    db.get('SELECT menus FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Parse existing menus and update the specific menu
      const existingMenus = JSON.parse(row.menus || '[]');
      const updatedMenus = existingMenus.map(menu => 
        menu.id === menuId 
          ? { ...menu, ...menuData, updatedAt: new Date().toISOString() }
          : menu
      );

      // Save back to database
      db.run('UPDATE users SET menus = ? WHERE id = ?', [JSON.stringify(updatedMenus), userId], (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to update menu' });
        }

        res.json({
          message: 'Menu updated successfully'
        });
      });
    });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete menu
app.delete('/api/menus/:menuId', authenticateToken, (req, res) => {
  try {
    const { menuId } = req.params;
    const userId = req.user.userId;

    // Get current user's menus
    db.get('SELECT menus FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Parse existing menus and remove the specific menu
      const existingMenus = JSON.parse(row.menus || '[]');
      const updatedMenus = existingMenus.filter(menu => menu.id !== menuId);

      // Save back to database
      db.run('UPDATE users SET menus = ? WHERE id = ?', [JSON.stringify(updatedMenus), userId], (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to delete menu' });
        }

        res.json({
          message: 'Menu deleted successfully'
        });
      });
    });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`CORS enabled for React dev server on http://localhost:5173`);
});
