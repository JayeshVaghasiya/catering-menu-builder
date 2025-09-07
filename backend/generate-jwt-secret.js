// Generate a secure JWT secret
const crypto = require('crypto');

// Generate a 64-character random string
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('Generated JWT_SECRET:');
console.log(jwtSecret);
console.log('\nLength:', jwtSecret.length, 'characters');
console.log('\nCopy this value and use it in your production environment variables.');
