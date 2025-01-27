import { loadBlogPosts, handleBlogNavigation } from './blog.js';
import { gallery } from './gallery.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get all nav links (updated selector to match HTML)
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add click event listener to each nav link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href');
            // Update the URL hash which will trigger the hashchange event
            window.location.hash = sectionId;
        });
    });

    // Initialize based on current hash or default to about if no hash
    if (!window.location.hash) {
        window.location.hash = '#about';
    } else {
        activateSection(window.location.hash);
    }

    // Add QR code mouse follow functionality
    const wechatContainer = document.querySelector('.wechat-container');
    const qrCode = document.querySelector('.wechat-qr');
    
    wechatContainer.addEventListener('mousemove', (e) => {
        qrCode.style.display = 'block';
        // Position the QR code next to the cursor with a small offset
        qrCode.style.left = (e.clientX + 20) + 'px';
        qrCode.style.top = (e.clientY - 100) + 'px';
    });
    
    wechatContainer.addEventListener('mouseleave', () => {
        qrCode.style.display = 'none';
    });

    // Load projects
    loadProjects();
    
    // Simplified blog initialization - single source of truth
    if (window.location.hash.startsWith('#blog')) {
        loadBlogPosts();
        handleBlogNavigation();
    }

    // Initialize gallery when its section becomes active
    if (window.location.hash === '#gallery') {
        gallery.initialize();
    }

    // Mobile Navigation
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (!mobileNavToggle || !sidebar) {
        console.error('Mobile nav elements not found:', {
            mobileNavToggle: !!mobileNavToggle,
            sidebar: !!sidebar
        });
    }

    mobileNavToggle?.addEventListener('click', (e) => {
        console.log('Mobile nav clicked');
        const isOpen = sidebar.classList.toggle('active');
        mobileNavToggle.innerHTML = isOpen ? 
            '<i class="fas fa-times"></i>' : 
            '<i class="fas fa-bars"></i>';
        e.stopPropagation(); // Prevent document click from immediately closing
    });

    // Close mobile nav when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
                mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !mobileNavToggle.contains(e.target) && 
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Load ASCII art
    loadAsciiArt();
});

function activateSection(hash) {
    const baseSection = hash.split('/')[0].substring(1);
    
    // Remove active classes
    document.querySelectorAll('.section, .nav-link').forEach(el => {
        el.classList.remove('active');
    });
    
    // Add active class to target section and corresponding nav link
    const targetSection = document.getElementById(baseSection);
    const targetLink = document.querySelector(`a[href="#${baseSection}"]`);
    
    if (targetSection) {
        targetSection.classList.add('active');
        if (baseSection === 'blog') {
            loadBlogPosts();
            handleBlogNavigation();
        }
    }
    if (targetLink) {
        targetLink.classList.add('active');
    }

    if (baseSection === 'gallery') {
        gallery.initialize();
    }
}

// Listen for hash changes
window.addEventListener('hashchange', (e) => {
    activateSection(window.location.hash);
});

// Function to create project HTML
function createProjectHTML(project) {
    return `
        <article class="project-item${project.highlight ? ' highlight' : ''}">
            <h2 class="project-title">${project.title}</h2>
            <div class="project-links">
                ${Object.entries(project.links).map(([type, url]) => 
                    `<a href="${url}" class="project-link" target="_blank">${type}</a>`
                ).join('')}
            </div>
            <p class="project-description">${project.description}</p>
        </article>
    `;
}

// Function to load and render projects
async function loadProjects() {
    try {
        console.log('Attempting to load projects...');
        const response = await fetch('./data/projects.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Loaded projects:', data);
        
        const projectsContainer = document.querySelector('.projects-container');
        if (!projectsContainer) {
            console.error('Could not find projects container element');
            return;
        }
        
        if (!data.projects || !Array.isArray(data.projects)) {
            console.error('Invalid projects data format:', data);
            return;
        }
        
        const projectsHTML = data.projects
            .map(project => createProjectHTML(project))
            .join('');
            
        console.log('Generated HTML:', projectsHTML);
        projectsContainer.innerHTML = projectsHTML;
        
    } catch (error) {
        console.error('Error loading projects:', error);
        // Show error message to user
        const projectsContainer = document.querySelector('.projects-container');
        if (projectsContainer) {
            projectsContainer.innerHTML = '<p>Error loading projects. Please try again later.</p>';
        }
    }
}

// Load ASCII art
async function loadAsciiArt() {
    const asciiElements = document.querySelectorAll('[data-ascii-src]');
    
    for (const element of asciiElements) {
        try {
            const response = await fetch(element.dataset.asciiSrc);
            if (!response.ok) throw new Error('Failed to load ASCII art');
            const text = await response.text();
            element.textContent = text;
        } catch (error) {
            console.error('Error loading ASCII art:', error);
            element.textContent = 'Error loading art';
        }
    }
}