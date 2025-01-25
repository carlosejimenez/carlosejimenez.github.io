// Add this at the top of the file
const BASE_PATH = window.location.pathname.endsWith('/') 
    ? window.location.pathname 
    : window.location.pathname + '/';

function convertMarkdownToHTML(markdown) {
    return marked.parse(markdown);
}

function createBlogPostHTML(post) {
    const formattedDate = new Date(post.date).toISOString().split('T')[0];
    
    return `
        <article class="post-item" data-slug="${post.slug}">
            <h2 class="post-title">${post.title}</h2>
            <div class="post-date">${formattedDate}</div>
        </article>
    `;
}

async function loadBlogPosts() {
    try {
        const response = await fetch(BASE_PATH + 'posts/index.json');
        const posts = await response.json();
        
        const blogList = document.querySelector('.blog-list');
        const postsHTML = posts.map(post => createBlogPostHTML(post)).join('');
        blogList.innerHTML = postsHTML;
        
        // Add click handlers
        document.querySelectorAll('.post-item').forEach(post => {
            post.addEventListener('click', () => loadBlogPost(post.dataset.slug));
        });
    } catch (error) {
        console.error('Error loading blog posts:', error);
        const blogList = document.querySelector('.blog-list');
        blogList.innerHTML = '<p>Error loading blog posts. Please try again later.</p>';
    }
}

function handleBlogNavigation() {
    const hash = window.location.hash;
    if (hash.startsWith('#blog/')) {
        const slug = hash.replace('#blog/', '');
        loadBlogPost(slug);
    } else if (hash === '#blog') {
        handleBackToBlog();
    }
}

// Update the loadBlogPost function to modify URL
async function loadBlogPost(slug) {
    try {
        // Update the URL without triggering hashchange
        history.replaceState(null, '', `#blog/${slug}`);
        
        const response = await fetch(`${BASE_PATH}posts/${slug}.md`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const markdown = await response.text();
        
        const blogList = document.querySelector('.blog-list');
        const blogContent = document.querySelector('.blog-content');
        
        // Remove frontmatter before converting to HTML
        const cleanedMarkdown = markdown.replace(/---[\s\S]*?---/, '').trim();
        
        // Convert markdown to HTML
        const html = `
            <div class="back-to-blog" role="button" tabindex="0">← Blog</div>
            <div class="blog-post-content">
                ${marked.parse(cleanedMarkdown)}
            </div>
        `;
        
        blogList.style.display = 'none';
        blogContent.style.display = 'block';
        blogContent.innerHTML = html;
        blogContent.classList.add('active');
        
        // Add back button handler
        const backButton = document.querySelector('.back-to-blog');
        backButton.addEventListener('click', handleBackToBlog);
        
        // Add keyboard support for back button
        backButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                backButton.click();
            }
        });
        
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error loading blog post:', error);
        const blogContent = document.querySelector('.blog-content');
        blogContent.innerHTML = `
            <div class="back-to-blog" role="button" tabindex="0">← Blog</div>
            <div class="error-message">
                <p>Error loading blog post. Please try again later.</p>
            </div>
        `;
        
        const backButton = document.querySelector('.back-to-blog');
        backButton.addEventListener('click', handleBackToBlog);
    }
}

// Update handleBackToBlog to modify URL
function handleBackToBlog() {
    // Update the URL without triggering hashchange
    history.replaceState(null, '', '#blog');
    
    const blogList = document.querySelector('.blog-list');
    const blogContent = document.querySelector('.blog-content');
    
    blogList.style.display = 'block';
    blogContent.style.display = 'none';
    blogContent.classList.remove('active');
    blogContent.innerHTML = '';
    window.scrollTo(0, 0);
}

// Export the functions that need to be used in main.js
export {
    loadBlogPosts,
    handleBlogNavigation,
    handleBackToBlog
}; 