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
});

// Function to activate section based on hash
function activateSection(hash) {
    // Default to '#about' if no hash or invalid hash
    const targetId = hash ? hash.substring(1) : 'about';
    
    // Remove active class from all sections and nav links
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to target section and corresponding nav link
    const targetSection = document.getElementById(targetId);
    const targetLink = document.querySelector(`a[href="#${targetId}"]`);
    
    if (targetSection) {
        targetSection.classList.add('active');
    }
    if (targetLink) {
        targetLink.classList.add('active');
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