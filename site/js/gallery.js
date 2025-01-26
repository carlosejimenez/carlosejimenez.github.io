class Gallery {
    constructor() {
        this.currentIndex = 0;
        this.images = [];
        this.container = document.querySelector('.gallery-container');
        this.image = document.querySelector('.gallery-image');
        this.prevBtn = document.querySelector('.gallery-nav.prev');
        this.nextBtn = document.querySelector('.gallery-nav.next');
        
        this.setupModal();
        this.bindEvents();
    }
    
    async initialize() {
        try {
            // Fetch the list of images from the gallery directory
            const response = await fetch('./assets/gallery/index.json');
            if (!response.ok) throw new Error('Failed to load gallery data');
            
            const data = await response.json();
            // Convert filenames to full URLs
            this.images = data.files.map(file => ({
                url: `./assets/gallery/${file}`
            }));
            
            if (this.images.length > 0) {
                this.showImage(0);
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
            this.container.innerHTML = '<p>Error loading gallery. Please try again later.</p>';
        }
    }
    
    setupModal() {
        const modal = document.createElement('div');
        modal.className = 'gallery-modal';
        modal.innerHTML = `
            <button class="gallery-modal-close" aria-label="Close gallery">×</button>
            <button class="gallery-nav prev" aria-label="Previous photo">
                <i class="fas fa-chevron-left"></i>
            </button>
            <img src="" alt="">
            <button class="gallery-nav next" aria-label="Next photo">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
        this.modalImage = modal.querySelector('img');
        
        // Close modal when clicking anywhere inside it (including the image)
        modal.addEventListener('click', (e) => {
            // Only close if clicking the modal background or the image
            if (e.target === modal || e.target === this.modalImage) {
                this.closeModal();
            }
        });
        
        modal.querySelector('.gallery-modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Add navigation handlers for modal arrows
        modal.querySelector('.gallery-nav.prev').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent modal from closing
            this.prev();
        });
        
        modal.querySelector('.gallery-nav.next').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent modal from closing
            this.next();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }
    
    bindEvents() {
        this.prevBtn?.addEventListener('click', () => this.prev());
        this.nextBtn?.addEventListener('click', () => this.next());
        this.image?.addEventListener('click', () => this.openModal());
        
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('#gallery').classList.contains('active')) {
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            }
        });
    }
    
    showImage(index) {
        if (!this.images.length) return;
        
        this.currentIndex = index;
        const image = this.images[index];
        
        // Update both the main gallery image and modal image
        this.image.src = image.url;
        this.image.alt = '';
        
        // If modal is open, update its image too
        if (this.modal.classList.contains('active')) {
            this.modalImage.src = image.url;
            this.modalImage.alt = '';
        }
    }
    
    prev() {
        const newIndex = this.currentIndex - 1;
        this.showImage(newIndex < 0 ? this.images.length - 1 : newIndex);
    }
    
    next() {
        const newIndex = this.currentIndex + 1;
        this.showImage(newIndex >= this.images.length ? 0 : newIndex);
    }
    
    openModal() {
        const currentImage = this.images[this.currentIndex];
        this.modalImage.src = currentImage.url;
        this.modalImage.alt = '';
        this.modal.classList.add('active');
    }
    
    closeModal() {
        this.modal.classList.remove('active');
    }
}

export const gallery = new Gallery(); 