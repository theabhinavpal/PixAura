document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const downloadBtn = document.getElementById('download-btn');
    const closeBtn = document.querySelector('.close');
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const backToTopBtn = document.getElementById('back-to-top');
    const downloadIcons = document.querySelectorAll('.download-icon');
    const wallpaperItems = document.querySelectorAll('.wallpaper-item');
    
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-bars');
        this.querySelector('i').classList.toggle('fa-times');
        
        // Add scrolling functionality when menu is active
        if (nav.classList.contains('active')) {
            // Make nav scrollable when content exceeds viewport height
            nav.style.overflowY = 'auto';
            nav.style.maxHeight = '60vh'; // Limit height to 80% of viewport
            nav.style.maxWidth = '30vh';

            // Prevent background scrolling
            document.body.style.overflow = 'auto';
        } else {
            // Reset when menu is closed
            nav.style.overflowY = '';
            nav.style.maxHeight = '';
            nav.style.maxWidth = '';
            document.body.style.overflow = '';
        }
    });
    
    // Back to top button visibility
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });
    
    // Open modal when clicking on a wallpaper item
    wallpaperItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Prevent opening modal if clicking specifically on download icon
            if (e.target.closest('.download-icon')) {
                return;
            }
            
            const img = this.querySelector('img');
            const src = img.getAttribute('src');
            const alt = img.getAttribute('alt');
            
            // Get category from alt text or section ID
            const category = alt.split(' ')[0];
            
            // Open modal with image
            openModal(src, alt, category);
        });
    });
    
    // Handle download icon clicks
    downloadIcons.forEach(icon => {
    icon.addEventListener('click', function(e) {
        e.stopPropagation(); // This is correct, but not sufficient alone
        
        const imgContainer = this.closest('.wallpaper-container');
        const img = imgContainer.querySelector('img');
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt');
        
        // Trigger download
        downloadImage(src, alt);
    });
});
    
    // Close modal when clicking on close button
    closeBtn.addEventListener('click', function() {
        closeModal();
    });
    
    // Close modal when clicking outside the image
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal when pressing ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Download button in modal
    downloadBtn.addEventListener('click', function(e) {
    e.preventDefault(); // Add this line
    const src = modalImage.getAttribute('src');
    const title = modalTitle.textContent;
    downloadImage(src, title);
});
    
    // Function to open modal
    function openModal(src, title, category) {
        modalImage.setAttribute('src', src);
        modalTitle.textContent = title || 'Wallpaper';
        modalCategory.textContent = category || 'Wallpaper';
        downloadBtn.setAttribute('href', src);
        
        // Extract filename from path for download
        const filename = src.split('/').pop();
        downloadBtn.setAttribute('download', filename);
        
        // Display modal with animation
        modal.style.display = 'block';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
        
        // Disable body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
    
    // Function to close modal
    function closeModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        
        // Re-enable body scroll
        document.body.style.overflow = '';
    }
    
    // Function to download image
    function downloadImage(src, title) {
        // Create temporary link for download
        const link = document.createElement('a');
        link.href = src;
        
        // Create filename from title or use original filename
        let filename = src.split('/').pop();
        if (title && !title.includes('Wallpaper')) {
            // Convert title to filename-friendly format
            filename = title.toLowerCase().replace(/\s+/g, '-') + '.jpg';
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show download notification
        showNotification(`Downloaded: ${filename}`);
    }
    
    // Function to show notification
    function showNotification(message) {
        // Check if notification element exists, create if not
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set message and show notification
        notification.textContent = message;
        notification.classList.add('active');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('active');
        }, 3000);
    }
    
    // Share button functionality
    const shareBtn = document.getElementById('share-btn');
    shareBtn.addEventListener('click', function() {
        const src = modalImage.getAttribute('src');
        const title = modalTitle.textContent;
        
        // Check if Web Share API is supported
        if (navigator.share) {
            navigator.share({
                title: title,
                text: 'Check out this awesome wallpaper from PhonePixels!',
                url: window.location.href // You could create shareable URLs for specific wallpapers
            })
            .then(() => showNotification('Shared successfully!'))
            .catch((error) => console.log('Error sharing:', error));
        } else {
            // Fallback for browsers that don't support Web Share API
            // Copy image URL to clipboard
            const dummyInput = document.createElement('input');
            document.body.appendChild(dummyInput);
            dummyInput.value = window.location.origin + '/' + src;
            dummyInput.select();
            document.execCommand('copy');
            document.body.removeChild(dummyInput);
            showNotification('Link copied to clipboard!');
        }
    });
    
    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target.querySelector('img');
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        entry.target.classList.remove('loading');
                        imageObserver.unobserve(entry.target);
                    }
                }
            });
        });
        
        document.querySelectorAll('.wallpaper-container').forEach(item => {
            imageObserver.observe(item);
        });
    }
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            // Here you would typically send the email to your server
            // This is a mock implementation
            console.log('Subscribing email:', email);
            
            // Show success message
            const formContainer = this.parentNode;
            this.style.display = 'none';
            
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <p>Thank you for subscribing! We've sent a confirmation email to ${email}.</p>
            `;
            formContainer.appendChild(successMsg);
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                menuToggle.querySelector('i').classList.toggle('fa-bars');
                menuToggle.querySelector('i').classList.toggle('fa-times');
            }
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    

});
