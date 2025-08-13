const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'client', 'src', 'assets', 'data.js');

// Read the file
let content = fs.readFileSync(dataFilePath, 'utf8');

// Replace all invalid Cloudinary URLs with empty strings
content = content.replace(/https:\/\/res\.cloudinary\.com\/djs3wu5bg\/[^"']*/g, '');

// Write the file back
fs.writeFileSync(dataFilePath, content, 'utf8');

console.log('Fixed all invalid Cloudinary URLs in data.js');
