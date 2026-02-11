const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '..', 'dist', 'szervizkonyv', 'browser');
const indexPath = path.join(outputDir, 'index.html');
const notFoundPath = path.join(outputDir, '404.html');

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found at', indexPath);
  process.exit(1);
}

fs.copyFileSync(indexPath, notFoundPath);
console.log('404.html created for GitHub Pages SPA routing.');
