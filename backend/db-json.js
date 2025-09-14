// Simple JSON file storage for Vercel backend
const fs = require('fs');
const path = require('path');

// Use a persistent directory (Vercel's file system)
const dataPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/users.json'  // This still gets wiped, but we'll add initialization
  : path.join(__dirname, 'users.json');

function initializeData() {
  if (!fs.existsSync(dataPath)) {
    const initialData = { users: [] };
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
}

function readData() {
  try {
    initializeData();
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { users: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
}

function findUserByEmail(email) {
  const data = readData();
  return data.users.find(user => user.email === email);
}

function findUserById(id) {
  const data = readData();
  return data.users.find(user => user.id === id);
}

function createUser(userData) {
  const data = readData();
  data.users.push(userData);
  return writeData(data) ? userData : null;
}

function updateUser(id, updates) {
  const data = readData();
  const userIndex = data.users.findIndex(user => user.id === id);
  if (userIndex === -1) return null;
  
  data.users[userIndex] = { ...data.users[userIndex], ...updates };
  return writeData(data) ? data.users[userIndex] : null;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  readData,
  writeData
};
