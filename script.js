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

// Interactive mouse parallax for feature images
document.querySelectorAll('.feature-item').forEach(item => {
    item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) / 15;
        const moveY = (y - centerY) / 15;
        
        const image = item.querySelector('.feature-image');
        if (image) {
            image.style.transform = `scale(1.08) rotate(1deg) translate(${moveX}px, ${moveY}px)`;
        }
    });
    
    item.addEventListener('mouseleave', () => {
        const image = item.querySelector('.feature-image');
        if (image) {
            image.style.transform = 'scale(1) rotate(0deg)';
        }
    });
});

// Removed mouse parallax for dance image - using CSS animation instead

// Interactive step images
document.querySelectorAll('.sequence-step').forEach(step => {
    step.addEventListener('mousemove', (e) => {
        const rect = step.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) / 25;
        const moveY = (y - centerY) / 25;
        
        const image = step.querySelector('.step-image');
        if (image) {
            image.style.transform = `scale(1.1) rotate(-1deg) translate(${moveX}px, ${moveY}px)`;
        }
    });
    
    step.addEventListener('mouseleave', () => {
        const image = step.querySelector('.step-image');
        if (image) {
            image.style.transform = 'scale(1) rotate(0deg)';
        }
    });
});

// Interactive text hover effects
document.querySelectorAll('.feature-content h3, .step-content h3').forEach(heading => {
    heading.addEventListener('mouseenter', function() {
        this.style.transform = 'translateX(10px) scale(1.05)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    heading.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0) scale(1)';
    });
});

// Scroll-based subtle scale effect for sections (subtle enhancement)
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionTop = rect.top;
        const sectionHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        // Calculate scroll progress through section (subtle scale only)
        if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
            const progress = Math.max(0, Math.min(1, (windowHeight - sectionTop) / (windowHeight + sectionHeight)));
            const scale = 0.98 + (progress * 0.02); // Very subtle scale effect
            
            // Only apply if section is visible (has visible class or is in viewport)
            if (section.querySelector('.visible') || progress > 0.3) {
                section.style.transform = `scale(${scale})`;
            }
        }
    });
    
    lastScroll = scrolled;
});

// Interactive showcase images
document.querySelectorAll('.image-showcase').forEach(showcase => {
    showcase.addEventListener('mousemove', (e) => {
        const rect = showcase.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) / 30;
        const moveY = (y - centerY) / 30;
        
        const image = showcase.querySelector('.showcase-image');
        if (image) {
            image.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`;
        }
    });
    
    showcase.addEventListener('mouseleave', () => {
        const image = showcase.querySelector('.showcase-image');
        if (image) {
            image.style.transform = 'scale(1) translate(0, 0)';
        }
    });
});

// Interactive culture image
document.querySelectorAll('.culture-image-container').forEach(container => {
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) / 20;
        const moveY = (y - centerY) / 20;
        
        const image = container.querySelector('.culture-image');
        if (image) {
            image.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
        }
    });
    
    container.addEventListener('mouseleave', () => {
        const image = container.querySelector('.culture-image');
        if (image) {
            image.style.transform = 'translate(0, 0) scale(1)';
        }
    });
});

// Interactive final hero image
document.querySelectorAll('.final-image-container').forEach(container => {
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const moveX = (x - centerX) / 25;
        const moveY = (y - centerY) / 25;
        
        const image = container.querySelector('.final-image');
        if (image) {
            image.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
        }
    });
    
    container.addEventListener('mouseleave', () => {
        const image = container.querySelector('.final-image');
        if (image) {
            image.style.transform = 'translate(0, 0) scale(1)';
        }
    });
});

// Add ripple effect on click for interactive elements
document.querySelectorAll('.gallery-item, .feature-image, .step-image, .dance-image-container').forEach(element => {
    element.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Text reveal removed - paragraphs display normally

