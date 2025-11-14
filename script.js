// Scroll animations and interactions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize scroll animations
    initScrollAnimations();
    initParallax();
    initHeroAnimation();
});

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Add stagger effect for multiple elements
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.style.transitionDelay = `${delay}ms`;
                }, 10);
            }
        });
    }, observerOptions);

    // Observe all elements with data-scroll attribute
    document.querySelectorAll('[data-scroll]').forEach(el => {
        observer.observe(el);
    });
}

// Parallax effect for images
function initParallax() {
    let ticking = false;

    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-layer');

        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.speed) || 0.5;
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrolled;
            const elementHeight = rect.height;
            
            // Only apply parallax if element is in viewport
            if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
                const yPos = -(scrolled - elementTop) * speed;
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        });

        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);
    window.addEventListener('resize', requestTick);
    updateParallax(); // Initial call
}

// Removed navbar functionality

// Hero section initial animation
function initHeroAnimation() {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');

    // Trigger animation on load
    setTimeout(() => {
        if (heroTitle) heroTitle.classList.add('visible');
        if (heroSubtitle) heroSubtitle.classList.add('visible');
    }, 100);
}

// Navigation removed - pure scroll experience

// Enhanced scroll progress indicator
let scrollProgress = 0;
const scrollIndicator = document.querySelector('.scroll-indicator');

window.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset;
    
    scrollProgress = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    // Hide scroll indicator after scrolling down
    if (scrollTop > 100 && scrollIndicator) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.transform = 'translateX(-50%) translateY(20px)';
    } else if (scrollIndicator) {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.transform = 'translateX(-50%) translateY(0)';
    }
});

// Image lazy loading with fade-in effect
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.6s ease';
            
            // Simulate image load
            setTimeout(() => {
                img.style.opacity = '1';
            }, 100);
            
            imageObserver.unobserve(img);
        }
    });
}, {
    threshold: 0.1
});

// Observe all background images
document.querySelectorAll('.showcase-image, .feature-image, .gallery-image, .step-image').forEach(img => {
    imageObserver.observe(img);
});

// Add mouse move parallax effect for gallery items
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) / 10;
        const moveY = (y - centerY) / 10;
        
        const image = item.querySelector('.gallery-image');
        if (image) {
            image.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
        }
    });
    
    item.addEventListener('mouseleave', () => {
        const image = item.querySelector('.gallery-image');
        if (image) {
            image.style.transform = 'scale(1)';
        }
    });
});

// Performance optimization: throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add smooth reveal animation for sequence steps
const sequenceObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 200); // Stagger animation
        }
    });
}, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.sequence-step').forEach(step => {
    sequenceObserver.observe(step);
});

// Add scroll-triggered scale effect for feature images
const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const image = entry.target.querySelector('.feature-image');
            if (image) {
                image.style.transform = 'scale(1)';
            }
        }
    });
}, {
    threshold: 0.5
});

document.querySelectorAll('.feature-item').forEach(item => {
    featureObserver.observe(item);
});

// Dynamic text reveal animation
function revealText(element) {
    const text = element.textContent;
    const words = text.split(' ');
    element.innerHTML = '';
    
    words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.style.opacity = '0';
        span.style.transform = 'translateY(20px)';
        span.style.transition = `opacity 0.5s ease ${index * 0.05}s, transform 0.5s ease ${index * 0.05}s`;
        element.appendChild(span);
        
        setTimeout(() => {
            span.style.opacity = '1';
            span.style.transform = 'translateY(0)';
        }, 100);
    });
}

// Apply text reveal to main titles on scroll
const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
            entry.target.classList.add('revealed');
            // revealText(entry.target); // Uncomment for word-by-word animation
        }
    });
}, {
    threshold: 0.3
});

document.querySelectorAll('.section-title, .dance-title, .final-title').forEach(title => {
    titleObserver.observe(title);
});

