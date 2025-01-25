const fs = require('fs');
const path = require('path');
const matter = require('gray-matter'); // You'll need to: npm install gray-matter

// Add JSDoc comments for better documentation
/**
 * Configuration for blog post processing
 * @constant {Object}
 */
const CONFIG = {
    POSTS_DIR: path.join(__dirname, '../site/posts'),
    OUTPUT_FILE: path.join(POSTS_DIR, 'index.json'),
    VALID_EXTENSIONS: ['.md']
};

/**
 * Processes a markdown file and extracts post metadata
 * @param {string} filename - Name of the markdown file
 * @returns {Object} Post metadata including title, date, and slug
 */
function processPostFile(filename) {
    const fullPath = path.join(CONFIG.POSTS_DIR, filename);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);
    
    return {
        title: data.title,
        date: new Date(data.date).toISOString().split('T')[0],
        slug: path.basename(filename, '.md')
    };
}

// Main execution
try {
    if (!fs.existsSync(CONFIG.POSTS_DIR)) {
        fs.mkdirSync(CONFIG.POSTS_DIR, { recursive: true });
    }

    const posts = fs.readdirSync(CONFIG.POSTS_DIR)
        .filter(filename => filename.endsWith('.md'))
        .map(processPostFile)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(posts, null, 2));
    console.log(`Generated index with ${posts.length} posts`);
} catch (error) {
    console.error('Error generating blog index:', error);
    process.exit(1);
} 