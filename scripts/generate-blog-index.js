const fs = require('fs');
const path = require('path');
const matter = require('gray-matter'); // You'll need to: npm install gray-matter

const POSTS_DIR = path.join(__dirname, '../site/posts');
const OUTPUT_FILE = path.join(POSTS_DIR, 'index.json');

// Create posts directory if it doesn't exist
if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
}

// Read all markdown files in the posts directory
const posts = fs.readdirSync(POSTS_DIR)
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
        const fullPath = path.join(POSTS_DIR, filename);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        
        // Parse frontmatter
        const { data } = matter(fileContents);
        
        // Format the date as YYYY-MM-DD
        const dateObj = new Date(data.date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        
        return {
            title: data.title,
            date: formattedDate,
            slug: path.basename(filename, '.md')
        };
    })
    // Sort by date descending
    .sort((a, b) => new Date(b.date) - new Date(a.date));

// Write the index file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
console.log(`Generated index with ${posts.length} posts`); 