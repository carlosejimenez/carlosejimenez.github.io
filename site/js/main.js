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

class AsciiArtCanvas {
    constructor(canvas, text) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.text = text.split('\n');
        this.mouseX = -1;
        this.mouseY = -1;
        
        // Customizable parameters
        this.charWidth = 8;          // Base character width
        this.charHeight = 12;        // Base character height
        this.effectRadius = 100;      // How far the effect spreads (in pixels)
        this.maxScale = 2;         // Maximum size multiplier for characters
        this.baseColor = '#e0e0e0';  // Default character color
        this.hoverColor = {          // Color for characters under mouse
            r: 255,  // Red
            g: 216,  // Green
            b: 164   // Blue
        };
        
        this.setupCanvas();
        this.setupEventListeners();
        this.animate();
    }

    setupCanvas() {
        const cols = Math.max(...this.text.map(line => line.length));
        const rows = this.text.length;
        
        // Set canvas size
        this.canvas.width = cols * this.charWidth;
        this.canvas.height = rows * this.charHeight;
        
        // Setup text rendering
        this.ctx.font = `${this.charHeight}px monospace`;
        this.ctx.textBaseline = 'top';
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouseX = -1;
            this.mouseY = -1;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.text.forEach((line, row) => {
            [...line].forEach((char, col) => {
                const x = col * this.charWidth;
                const y = row * this.charHeight;
                
                // Calculate distance from mouse
                const distance = this.mouseX >= 0 ? 
                    Math.sqrt(
                        Math.pow(x + this.charWidth/2 - this.mouseX, 2) + 
                        Math.pow(y + this.charHeight/2 - this.mouseY, 2)
                    ) : Infinity;
                
                // Apply effects based on distance
                if (distance < this.effectRadius) {
                    // Calculate scale based on distance (closer = bigger)
                    const scale = 1 + (this.maxScale - 1) * 
                        Math.max(0, (this.effectRadius - distance) / this.effectRadius);
                    
                    // Calculate color based on distance
                    const intensity = Math.max(0, (this.effectRadius - distance) / this.effectRadius);
                    const color = {
                        r: Math.min(255, this.hoverColor.r * intensity + parseInt(this.baseColor.slice(1,3), 16) * (1-intensity)),
                        g: Math.min(255, this.hoverColor.g * intensity + parseInt(this.baseColor.slice(3,5), 16) * (1-intensity)),
                        b: Math.min(255, this.hoverColor.b * intensity + parseInt(this.baseColor.slice(5,7), 16) * (1-intensity))
                    };
                    
                    this.ctx.save();
                    this.ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
                    this.ctx.translate(x + this.charWidth/2, y + this.charHeight/2);
                    this.ctx.scale(scale, scale);
                    this.ctx.fillText(char, -this.charWidth/2, -this.charHeight/2);
                    this.ctx.restore();
                } else {
                    this.ctx.fillStyle = this.baseColor;
                    this.ctx.fillText(char, x, y);
                }
            });
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Update loadAsciiArt function
async function loadAsciiArt() {
    const canvases = document.querySelectorAll('canvas[data-ascii-src]');
    
    for (const canvas of canvases) {
        try {
            const response = await fetch(canvas.dataset.asciiSrc);
            if (!response.ok) throw new Error('Failed to load ASCII art');
            const text = await response.text();
            
            new AsciiArtCanvas(canvas, text);
        } catch (error) {
            console.error('Error loading ASCII art:', error);
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#e0e0e0';
            ctx.fillText('Error loading art', 10, 20);
        }
    }
}