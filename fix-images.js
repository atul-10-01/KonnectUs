const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'client', 'src', 'assets', 'data.js');

// Read the file
let content = fs.readFileSync(dataFilePath, 'utf8');

// Replace empty image strings with null
content = content.replace(/image:\s*"",/g, 'image: null,');

// Write the file back
fs.writeFileSync(dataFilePath, content, 'utf8');

console.log('Fixed all empty image strings in data.js');
