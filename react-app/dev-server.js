// Local development server to simulate Vercel API functions
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Import API functions
const registerHandler = require('./api/register.js');
const loginHandler = require('./api/login.js');
const userHandler = require('./api/user.js');
const menusHandler = require('./api/menus.js');

// Route handlers
app.post('/api/register', (req, res) => {
  registerHandler(req, res);
});

app.post('/api/login', (req, res) => {
  loginHandler(req, res);
});

app.get('/api/user', (req, res) => {
  userHandler(req, res);
});

app.post('/api/menus', (req, res) => {
  menusHandler(req, res);
});

app.put('/api/menus/:id', (req, res) => {
  req.query = { id: req.params.id };
  menusHandler(req, res);
});

app.delete('/api/menus/:id', (req, res) => {
  req.query = { id: req.params.id };
  menusHandler(req, res);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Development API server running' });
});

app.listen(PORT, () => {
  console.log(`Development API server running on http://localhost:${PORT}`);
});

module.exports = app;
