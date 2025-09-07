// Simplified database utility for Vercel serverless functions
const fs = require('fs');
const path = require('path');

// Simple JSON file storage for Vercel
const dataPath = '/tmp/users.json';

function initializeData() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({ users: [] }, null, 2));
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
  return writeData(data);
}

function updateUser(id, updates) {
  const data = readData();
  const userIndex = data.users.findIndex(user => user.id === id);
  if (userIndex === -1) return false;
  
  data.users[userIndex] = { ...data.users[userIndex], ...updates };
  return writeData(data);
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  readData,
  writeData
};
