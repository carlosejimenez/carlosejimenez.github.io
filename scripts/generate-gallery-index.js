const fs = require('fs');
const path = require('path');

const GALLERY_DIR = path.join(__dirname, '../site/assets/gallery');
const INDEX_FILE = path.join(GALLERY_DIR, 'index.json');

// Create gallery directory if it doesn't exist
if (!fs.existsSync(GALLERY_DIR)) {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
}

// Get all image files
const imageFiles = fs.readdirSync(GALLERY_DIR)
    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

// Write index file
fs.writeFileSync(INDEX_FILE, JSON.stringify({ files: imageFiles }, null, 2));
console.log(`Generated gallery index with ${imageFiles.length} images`); 