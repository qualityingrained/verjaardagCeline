// Scroll animations and interactions
document.addEventListener("DOMContentLoaded", function () {
  // Initialize scroll animations
  initScrollAnimations();
  initParallax();
  initHeroAnimation();
});

// Scroll-triggered animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Add stagger effect for multiple elements
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.style.transitionDelay = `${delay}ms`;
        }, 10);
      }
    });
  }, observerOptions);

  // Observe all elements with data-scroll attribute
  document.querySelectorAll("[data-scroll]").forEach((el) => {
    observer.observe(el);
  });
}

// Parallax effect for images
function initParallax() {
  let ticking = false;

  function updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll(".parallax-layer");

    parallaxElements.forEach((element) => {
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

  window.addEventListener("scroll", requestTick);
  window.addEventListener("resize", requestTick);
  updateParallax(); // Initial call
}

// Removed navbar functionality

// Hero section initial animation
function initHeroAnimation() {
  const heroTitle = document.querySelector(".hero-title");
  const heroSubtitle = document.querySelector(".hero-subtitle");

  // Trigger animation on load
  setTimeout(() => {
    if (heroTitle) heroTitle.classList.add("visible");
    if (heroSubtitle) heroSubtitle.classList.add("visible");
  }, 100);
}

// Navigation removed - pure scroll experience

// Enhanced scroll progress indicator
let scrollProgress = 0;
const scrollIndicator = document.querySelector(".scroll-indicator");

window.addEventListener("scroll", () => {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset;

  scrollProgress = (scrollTop / (documentHeight - windowHeight)) * 100;

  // Hide scroll indicator after scrolling down
  if (scrollTop > 100 && scrollIndicator) {
    scrollIndicator.style.opacity = "0";
    scrollIndicator.style.transform = "translateX(-50%) translateY(20px)";
  } else if (scrollIndicator) {
    scrollIndicator.style.opacity = "1";
    scrollIndicator.style.transform = "translateX(-50%) translateY(0)";
  }
});

// Image lazy loading with fade-in effect
const imageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.style.opacity = "0";
        img.style.transition = "opacity 0.6s ease";

        // Simulate image load
        setTimeout(() => {
          img.style.opacity = "1";
        }, 100);

        imageObserver.unobserve(img);
      }
    });
  },
  {
    threshold: 0.1,
  }
);

// Observe all background images
document
  .querySelectorAll(
    ".showcase-image, .feature-image, .gallery-image, .step-image"
  )
  .forEach((img) => {
    imageObserver.observe(img);
  });

// Add mouse move parallax effect for gallery items
document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("mousemove", (e) => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const moveX = (x - centerX) / 10;
    const moveY = (y - centerY) / 10;

    const image = item.querySelector(".gallery-image");
    if (image) {
      image.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
    }
  });

  item.addEventListener("mouseleave", () => {
    const image = item.querySelector(".gallery-image");
    if (image) {
      image.style.transform = "scale(1)";
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
const sequenceObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, index * 200); // Stagger animation
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  }
);

document.querySelectorAll(".sequence-step").forEach((step) => {
  sequenceObserver.observe(step);
});

// Add scroll-triggered scale effect for feature images
const featureObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const image = entry.target.querySelector(".feature-image");
        if (image) {
          image.style.transform = "scale(1)";
        }
      }
    });
  },
  {
    threshold: 0.5,
  }
);

document.querySelectorAll(".feature-item").forEach((item) => {
  featureObserver.observe(item);
});

// Dynamic text reveal animation
function revealText(element) {
  const text = element.textContent;
  const words = text.split(" ");
  element.innerHTML = "";

  words.forEach((word, index) => {
    const span = document.createElement("span");
    span.textContent = word + " ";
    span.style.opacity = "0";
    span.style.transform = "translateY(20px)";
    span.style.transition = `opacity 0.5s ease ${
      index * 0.05
    }s, transform 0.5s ease ${index * 0.05}s`;
    element.appendChild(span);

    setTimeout(() => {
      span.style.opacity = "1";
      span.style.transform = "translateY(0)";
    }, 100);
  });
}

// Apply text reveal to main titles on scroll
const titleObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (
        entry.isIntersecting &&
        !entry.target.classList.contains("revealed")
      ) {
        entry.target.classList.add("revealed");
        // revealText(entry.target); // Uncomment for word-by-word animation
      }
    });
  },
  {
    threshold: 0.3,
  }
);

document
  .querySelectorAll(".section-title, .dance-title, .final-title")
  .forEach((title) => {
    titleObserver.observe(title);
  });

// Interactive mouse parallax for feature images
document.querySelectorAll(".feature-item").forEach((item) => {
  item.addEventListener("mousemove", (e) => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const moveX = (x - centerX) / 15;
    const moveY = (y - centerY) / 15;

    const image = item.querySelector(".feature-image");
    if (image) {
      image.style.transform = `scale(1.08) rotate(1deg) translate(${moveX}px, ${moveY}px)`;
    }
  });

  item.addEventListener("mouseleave", () => {
    const image = item.querySelector(".feature-image");
    if (image) {
      image.style.transform = "scale(1) rotate(0deg)";
    }
  });
});

// Removed mouse parallax for dance image - using CSS animation instead

// Interactive step images
document.querySelectorAll(".sequence-step").forEach((step) => {
  step.addEventListener("mousemove", (e) => {
    const rect = step.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const moveX = (x - centerX) / 25;
    const moveY = (y - centerY) / 25;

    const image = step.querySelector(".step-image");
    if (image) {
      image.style.transform = `scale(1.1) rotate(-1deg) translate(${moveX}px, ${moveY}px)`;
    }
  });

  step.addEventListener("mouseleave", () => {
    const image = step.querySelector(".step-image");
    if (image) {
      image.style.transform = "scale(1) rotate(0deg)";
    }
  });
});

// Interactive text hover effects
document
  .querySelectorAll(".feature-content h3, .step-content h3")
  .forEach((heading) => {
    heading.addEventListener("mouseenter", function () {
      this.style.transform = "translateX(10px) scale(1.05)";
      this.style.transition = "transform 0.3s ease";
    });

    heading.addEventListener("mouseleave", function () {
      this.style.transform = "translateX(0) scale(1)";
    });
  });

// Scroll-based subtle scale effect for sections (subtle enhancement)
let lastScroll = 0;
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const sections = document.querySelectorAll(".section");

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    const windowHeight = window.innerHeight;

    // Calculate scroll progress through section (subtle scale only)
    if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
      const progress = Math.max(
        0,
        Math.min(
          1,
          (windowHeight - sectionTop) / (windowHeight + sectionHeight)
        )
      );
      const scale = 0.98 + progress * 0.02; // Very subtle scale effect

      // Only apply if section is visible (has visible class or is in viewport)
      if (section.querySelector(".visible") || progress > 0.3) {
        section.style.transform = `scale(${scale})`;
      }
    }
  });

  lastScroll = scrolled;
});

// Interactive showcase images
document.querySelectorAll(".image-showcase").forEach((showcase) => {
  showcase.addEventListener("mousemove", (e) => {
    const rect = showcase.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const moveX = (x - centerX) / 30;
    const moveY = (y - centerY) / 30;

    const image = showcase.querySelector(".showcase-image");
    if (image) {
      image.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`;
    }
  });

  showcase.addEventListener("mouseleave", () => {
    const image = showcase.querySelector(".showcase-image");
    if (image) {
      image.style.transform = "scale(1) translate(0, 0)";
    }
  });
});

// Interactive culture image
document.querySelectorAll(".culture-image-container").forEach((container) => {
  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const moveX = (x - centerX) / 20;
    const moveY = (y - centerY) / 20;

    const image = container.querySelector(".culture-image");
    if (image) {
      image.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
    }
  });

  container.addEventListener("mouseleave", () => {
    const image = container.querySelector(".culture-image");
    if (image) {
      image.style.transform = "translate(0, 0) scale(1)";
    }
  });
});

// Interactive final hero image
document.querySelectorAll(".final-image-container").forEach((container) => {
  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const moveX = (x - centerX) / 25;
    const moveY = (y - centerY) / 25;

    const image = container.querySelector(".final-image");
    if (image) {
      image.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
    }
  });

  container.addEventListener("mouseleave", () => {
    const image = container.querySelector(".final-image");
    if (image) {
      image.style.transform = "translate(0, 0) scale(1)";
    }
  });
});

// Add ripple effect on click for interactive elements
document
  .querySelectorAll(
    ".gallery-item, .feature-image, .step-image, .dance-image-container"
  )
  .forEach((element) => {
    element.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      ripple.classList.add("ripple");

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

// Text reveal removed - paragraphs display normally

// Visit Options Modal System
const visitData = {
  schonbrunn: {
    title: "Schönbrunn Palace",
    image: "visit-1",
    content: `
            <h4>Imperial Summer Residence</h4>
            <p>The former imperial summer residence, a UNESCO World Heritage site, stands as a symbol of Baroque architecture and imperial power. Its 1,441 rooms tell stories of emperors and empresses who shaped European history.</p>
            
            <h4>What to See</h4>
            <ul>
                <li><strong>State Rooms:</strong> 40 rooms open to the public, showcasing imperial splendor</li>
                <li><strong>Palace Gardens:</strong> 160 hectares of beautifully manicured gardens and fountains</li>
                <li><strong>Gloriette:</strong> A stunning hilltop structure offering panoramic city views</li>
                <li><strong>Maze & Labyrinth:</strong> Historic garden maze for playful exploration</li>
                <li><strong>Palace Chapel:</strong> Baroque masterpiece where Mozart once performed</li>
            </ul>
            
            <h4>Best Time to Visit</h4>
            <p>Early morning (9-10 AM) to avoid crowds. Spring and early autumn offer the best weather for garden exploration. The palace is open year-round, with special Christmas markets in December.</p>
            
            <h4>Tips</h4>
            <p>Book tickets online in advance to skip the queue. Allow 3-4 hours for a complete visit including gardens. The Grand Tour includes 40 rooms, while the Imperial Tour covers 22 rooms. Don't miss the Orangery Garden and the Neptune Fountain.</p>
        `,
  },
  stephans: {
    title: "St. Stephen's Cathedral",
    image: "visit-2",
    content: `
            <h4>Gothic Masterpiece</h4>
            <p>Rising 137 meters above the city, this Gothic masterpiece has watched over Vienna for over 700 years. Its intricate stonework and colorful tiled roof create a stunning silhouette against the Austrian sky.</p>
            
            <h4>What to See</h4>
            <ul>
                <li><strong>South Tower:</strong> Climb 343 steps for breathtaking city views</li>
                <li><strong>Catacombs:</strong> Underground crypts containing remains of Habsburg emperors</li>
                <li><strong>Pummerin Bell:</strong> The largest bell in Austria, weighing 21 tons</li>
                <li><strong>Gothic Pulpit:</strong> Intricately carved 15th-century masterpiece</li>
                <li><strong>Roof Tiles:</strong> Colorful zigzag pattern visible from above</li>
            </ul>
            
            <h4>Best Time to Visit</h4>
            <p>Morning hours (before 10 AM) for fewer crowds. Evening visits offer beautiful lighting. Attend a mass to experience the cathedral's acoustics. Free entry to the main nave, separate tickets for towers and catacombs.</p>
            
            <h4>Tips</h4>
            <p>The South Tower climb is steep but rewarding. The North Tower has an elevator but offers different views. Combine with a visit to Stephansplatz for shopping and dining. Respectful dress required (shoulders and knees covered).</p>
        `,
  },
  ringstrasse: {
    title: "The Ringstrasse",
    image: "visit-3",
    content: `
            <h4>Grand Boulevard</h4>
            <p>This grand boulevard, built on the site of the old city walls, showcases Vienna's finest architecture. Museums, theaters, and palaces line this 5.3-kilometer circular road, creating an open-air museum of historic grandeur.</p>
            
            <h4>What to See</h4>
            <ul>
                <li><strong>Vienna State Opera:</strong> One of the world's leading opera houses</li>
                <li><strong>Museum of Fine Arts:</strong> Houses works by Bruegel, Vermeer, and Rubens</li>
                <li><strong>Natural History Museum:</strong> Impressive collection including the Venus of Willendorf</li>
                <li><strong>Parliament Building:</strong> Greek Revival architecture housing Austrian Parliament</li>
                <li><strong>City Hall:</strong> Neo-Gothic masterpiece with beautiful gardens</li>
            </ul>
            
            <h4>Best Time to Visit</h4>
            <p>Spring and autumn for pleasant walking weather. Early morning or late afternoon for best lighting. The Ringstrasse is beautiful year-round, with special charm during Christmas when markets appear.</p>
            
            <h4>Tips</h4>
            <p>Take Tram Line 1 or 2 for a complete circuit (about 25 minutes). Walking the entire route takes 1.5-2 hours. Consider a guided tour to learn about the architecture. Many buildings offer tours - check individual websites for schedules.</p>
        `,
  },
  hofburg: {
    title: "Hofburg Palace",
    image: "visit-4",
    content: `
            <h4>Imperial Winter Residence</h4>
            <p>The former principal imperial winter residence of the Habsburg dynasty, this sprawling complex spans 59 acres and includes 18 groups of buildings, 19 courtyards, and 2,600 rooms.</p>
            
            <h4>What to See</h4>
            <ul>
                <li><strong>Imperial Apartments:</strong> Lavishly decorated rooms of Emperor Franz Joseph and Empress Sisi</li>
                <li><strong>Sisi Museum:</strong> Dedicated to the life of Empress Elisabeth</li>
                <li><strong>Silver Collection:</strong> Imperial tableware and ceremonial objects</li>
                <li><strong>Spanish Riding School:</strong> Watch the famous Lipizzaner stallions perform</li>
                <li><strong>National Library:</strong> Baroque hall with over 200,000 volumes</li>
            </ul>
            
            <h4>Best Time to Visit</h4>
            <p>Weekday mornings for fewer crowds. The Spanish Riding School performances are scheduled - book in advance. Allow 2-3 hours for a comprehensive visit. The complex is open year-round.</p>
            
            <h4>Tips</h4>
            <p>Combined tickets offer better value for multiple attractions. The Sisi Ticket includes Schönbrunn, Hofburg, and the Furniture Museum. The Spanish Riding School requires separate tickets. Audio guides available in multiple languages.</p>
        `,
  },
  belvedere: {
    title: "Belvedere Palace",
    image: "visit-5",
    content: `
            <h4>Baroque Masterpiece</h4>
            <p>This magnificent Baroque palace complex consists of two palaces (Upper and Lower Belvedere) connected by stunning gardens. Built for Prince Eugene of Savoy, it now houses one of Austria's most important art collections.</p>
            
            <h4>What to See</h4>
            <ul>
                <li><strong>Klimt Collection:</strong> The world's largest collection of Gustav Klimt paintings, including "The Kiss"</li>
                <li><strong>Baroque Art:</strong> Works by Schiele, Kokoschka, and other Austrian masters</li>
                <li><strong>Palace Gardens:</strong> Symmetrical Baroque gardens with fountains and sculptures</li>
                <li><strong>Marble Hall:</strong> Stunning ceremonial hall in Upper Belvedere</li>
                <li><strong>Orangery:</strong> Now houses temporary exhibitions</li>
            </ul>
            
            <h4>Best Time to Visit</h4>
            <p>Spring and summer for the gardens in full bloom. Early morning to avoid crowds, especially for "The Kiss". The gardens are free and open year-round. Allow 2-3 hours for both palaces and gardens.</p>
            
            <h4>Tips</h4>
            <p>Combined ticket for Upper and Lower Belvedere offers best value. The gardens are free and perfect for a stroll. "The Kiss" is in the Upper Belvedere - plan your route accordingly. Photography allowed (no flash). Café in the Orangery for refreshments.</p>
        `,
  },
  opera: {
    title: "Vienna State Opera",
    image: "visit-6",
    content: `
            <h4>Operatic Excellence</h4>
            <p>One of the world's leading opera houses, the Vienna State Opera presents over 300 performances annually. The building itself is a masterpiece of Neo-Renaissance architecture, rebuilt after WWII bombing.</p>
            
            <h4>What to See</h4>
            <ul>
                <li><strong>Guided Tours:</strong> Behind-the-scenes tours of the historic building</li>
                <li><strong>Performances:</strong> World-class opera and ballet productions</li>
                <li><strong>Grand Staircase:</strong> Marble staircase with stunning chandeliers</li>
                <li><strong>Main Auditorium:</strong> Seats 1,709 with perfect acoustics</li>
                <li><strong>Standing Room:</strong> Affordable tickets for same-day performances</li>
            </ul>
            
            <h4>Best Time to Visit</h4>
            <p>The opera season runs September through June. Standing room tickets available 80 minutes before performances. Guided tours daily at 2 PM (check schedule). Book performances well in advance for best seats.</p>
            
            <h4>Tips</h4>
            <p>Standing room tickets (€3-4) are a budget-friendly way to experience world-class opera. Dress code is smart casual to formal. Tours last about 40 minutes. Check the website for current productions and availability. The opera house is closed July-August for maintenance.</p>
        `,
  },
  prater: {
    title: "Prater Park",
    image: "visit-7",
    content: `
            <h4>Vienna's Green Heart</h4>
            <p>This vast public park offers a perfect blend of nature, recreation, and entertainment. Home to the famous Wiener Riesenrad (Giant Ferris Wheel), the Prater spans 6 square kilometers of green space.</p>
            
            <h4>What to See</h4>
            <ul>
                <li><strong>Wiener Riesenrad:</strong> Historic 65-meter ferris wheel from 1897</li>
                <li><strong>Amusement Park:</strong> Classic rides and modern attractions</li>
                <li><strong>Green Prater:</strong> Extensive parkland perfect for walking and cycling</li>
                <li><strong>Planetarium:</strong> Modern astronomy shows and exhibitions</li>
                <li><strong>Prater Museum:</strong> History of the park and its attractions</li>
            </ul>
            
            <h4>Best Time to Visit</h4>
            <p>Spring through autumn for pleasant weather. Early morning for peaceful walks. Evening for the ferris wheel with city lights. The amusement park is busiest on weekends. Free entry to the park, pay-per-ride for attractions.</p>
            
            <h4>Tips</h4>
            <p>The ferris wheel offers stunning views - best at sunset. The park is free, but rides cost extra. Rent bikes to explore the extensive green areas. Several restaurants and beer gardens throughout. Perfect for families and couples seeking a relaxed atmosphere.</p>
        `,
  },
  museums: {
    title: "Museum Quarter",
    image: "visit-8",
    content: `
            <h4>Cultural Hub</h4>
            <p>The MuseumsQuartier (MQ) is one of the world's largest cultural complexes, spanning 60,000 square meters. It houses multiple museums, galleries, and cultural institutions in a mix of Baroque and contemporary architecture.</p>
            
            <h4>What to See</h4>
            <ul>
                <li><strong>Leopold Museum:</strong> Austrian modern art including Schiele and Klimt</li>
                <li><strong>MUMOK:</strong> Museum of Modern Art with contemporary collections</li>
                <li><strong>Kunsthalle Wien:</strong> Contemporary art exhibitions</li>
                <li><strong>Architecture Center:</strong> Exhibitions on architecture and urban planning</li>
                <li><strong>MQ Courtyard:</strong> Public space with cafes, events, and installations</li>
            </ul>
            
            <h4>Best Time to Visit</h4>
            <p>Weekdays for fewer crowds. The courtyard is lively in summer with outdoor seating. Many museums offer free admission on certain days - check websites. Evening events and concerts in summer. Allow a full day to explore multiple museums.</p>
            
            <h4>Tips</h4>
            <p>Combined tickets available for multiple museums. The courtyard is free and perfect for a break. Several cafes and restaurants on-site. Free WiFi throughout. Check the MQ website for current exhibitions and events. The area is pedestrian-friendly and well-connected by public transport.</p>
        `,
  },
  cafe: {
    title: "Historic Cafés",
    image: "visit-9",
    content: `
            <h4>Viennese Coffee Culture</h4>
            <p>Vienna's coffee house culture is UNESCO-listed intangible cultural heritage. These historic cafés are more than places to drink coffee - they're living museums of Viennese culture, where time slows down and conversation flows.</p>
            
            <h4>Must-Visit Cafés</h4>
            <ul>
                <li><strong>Café Central:</strong> Historic literary café frequented by Freud and Trotsky</li>
                <li><strong>Café Sacher:</strong> Home of the original Sachertorte, elegant and refined</li>
                <li><strong>Café Demel:</strong> Imperial confectionery since 1786, exquisite pastries</li>
                <li><strong>Café Hawelka:</strong> Bohemian atmosphere, legendary for its Buchteln</li>
                <li><strong>Café Landtmann:</strong> Elegant Ringstrasse location, frequented by celebrities</li>
            </ul>
            
            <h4>Best Time to Visit</h4>
            <p>Morning for breakfast and newspapers. Afternoon for coffee and cake (traditional 3-5 PM). Evening for drinks and atmosphere. Weekdays are less crowded. Each café has its own character - visit multiple to experience the variety.</p>
            
            <h4>Tips</h4>
            <p>Order "Melange" (Viennese cappuccino) or "Einspänner" (coffee with whipped cream). Try traditional pastries like Sachertorte, Apfelstrudel, or Topfenstrudel. Take your time - lingering is encouraged. Many cafés have newspapers and magazines. Tipping is customary (round up or 10%).</p>
        `,
  },
  naschmarkt: {
    title: "Naschmarkt",
    image: "visit-10",
    content: `
            <h4>Vienna's Largest Market</h4>
            <p>This vibrant market has been Vienna's culinary heart for over 200 years. Stretching 1.5 kilometers, it offers everything from fresh produce to international delicacies, antiques, and street food.</p>
            
            <h4>What to See</h4>
            <ul>
                <li><strong>Fresh Produce:</strong> Local and international fruits, vegetables, and herbs</li>
                <li><strong>International Food:</strong> Middle Eastern, Asian, Mediterranean specialties</li>
                <li><strong>Cheese & Delicatessen:</strong> Artisan cheeses, cured meats, and gourmet items</li>
                <li><strong>Flea Market:</strong> Saturdays feature antiques and vintage finds</li>
                <li><strong>Restaurants:</strong> Numerous eateries offering diverse cuisines</li>
            </ul>
            
            <h4>Best Time to Visit</h4>
            <p>Saturday mornings for the flea market (6 AM - 2 PM). Weekday mornings for fresh produce. Lunchtime for street food and restaurants. The market is open Monday-Saturday, closed Sundays. Early morning offers the best selection and atmosphere.</p>
            
            <h4>Tips</h4>
            <p>Bring cash - many vendors don't accept cards. Try Turkish gözleme, falafel, or Austrian specialties. The market is busiest on Saturdays. Several excellent restaurants for sit-down meals. Perfect for food lovers and photographers. Combine with a visit to nearby Secession building.</p>
        `,
  },
  graben: {
    title: "Graben & Kohlmarkt",
    image: "visit-11",
    content: `
            <h4>Luxury Shopping District</h4>
            <p>These elegant streets form Vienna's premier shopping district, connecting St. Stephen's Cathedral to the Hofburg Palace. Lined with luxury boutiques, historic buildings, and cafés, it's the perfect place for a leisurely stroll.</p>
            
            <h4>What to See</h4>
            <ul>
                <li><strong>Plague Column:</strong> Baroque monument commemorating the end of the 1679 plague</li>
                <li><strong>Luxury Boutiques:</strong> International brands and Austrian designers</li>
                <li><strong>Historic Architecture:</strong> Beautiful facades from various eras</li>
                <li><strong>Demel Confectionery:</strong> World-famous pastry shop</li>
                <li><strong>Street Performers:</strong> Musicians and artists adding to the atmosphere</li>
            </ul>
            
            <h4>Best Time to Visit</h4>
            <p>Morning for peaceful window shopping. Afternoon for shopping and café breaks. Evening for illuminated streets and atmosphere. Weekdays are less crowded than weekends. The area is pedestrian-friendly and always bustling.</p>
            
            <h4>Tips</h4>
            <p>Perfect for people-watching from a café terrace. Many shops offer tax-free shopping for non-EU visitors. The area is car-free, making it pleasant for strolling. Combine with visits to nearby St. Stephen's and Hofburg. Several excellent restaurants and cafés for breaks.</p>
        `,
  },
  danube: {
    title: "Danube Tower",
    image: "visit-12",
    content: `
            <h4>Vienna's Tallest Structure</h4>
            <p>At 252 meters tall, the Donauturm offers the highest viewing platform in Vienna. Built in 1964, this iconic tower provides 360-degree panoramic views of the city, the Danube River, and the surrounding countryside.</p>
            
            <h4>What to See</h4>
            <ul>
                <li><strong>Observation Deck:</strong> 150-meter high platform with stunning views</li>
                <li><strong>Revolving Restaurant:</strong> Rotates 360° in 26, 39, or 52 minutes</li>
                <li><strong>Bungee Jumping:</strong> Europe's highest bungee jump platform</li>
                <li><strong>Danube Park:</strong> Beautiful parkland surrounding the tower</li>
                <li><strong>Panoramic Views:</strong> See Vienna, the Danube, and the Vienna Woods</li>
            </ul>
            
            <h4>Best Time to Visit</h4>
            <p>Clear days for best visibility. Sunset for romantic views and dinner. Early morning for fewer crowds. The restaurant requires reservations. Weather-dependent - check conditions before visiting. Open year-round, but views are best in good weather.</p>
            
            <h4>Tips</h4>
            <p>Book restaurant reservations in advance, especially for dinner. The observation deck is accessible by high-speed elevator. Combine with a walk in Danube Park. Photography is excellent from the top. The revolving restaurant offers Austrian cuisine with a view. Bungee jumping requires advance booking and good weather.</p>
        `,
  },
};

// Initialize modal system
function initVisitModals() {
  const modal = document.getElementById("visitModal");
  const modalClose = document.querySelector(".modal-close");
  const modalOverlay = document.querySelector(".modal-overlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalImage = document.getElementById("modalImage");

  function openModal(data) {
    modalTitle.textContent = data.title;
    modalBody.innerHTML = data.content;

    // Reset modal image
    modalImage.className = "modal-image";
    modalImage.innerHTML = "";
    
    // Clear all background styles first
    modalImage.style.background = '';
    modalImage.style.backgroundImage = '';
    modalImage.style.backgroundSize = '';
    modalImage.style.backgroundPosition = '';
    modalImage.style.backgroundRepeat = '';
    
    // Generate gradient from imageSearchTerm or title (for static options)
    const searchTerm = data.imageSearchTerm || data.title || 'vienna';
    const palette = getGradientPalette(searchTerm);
    const gradientStyle = createGradientFromPalette(palette);
    
    // Apply gradient using new function
    applyGradientToElement(modalImage, gradientStyle);
    
    // Add icon container
    const iconContainer = document.createElement("div");
    iconContainer.className = "modal-icon-container";
    modalImage.appendChild(iconContainer);
    
    // Determine icon - use provided icon or generate from title for static options
    let iconName = data.icon;
    if (!iconName) {
      // Generate icon based on title for static options
      const titleLower = (data.title || '').toLowerCase();
      if (titleLower.includes('palace') || titleLower.includes('schönbrunn') || titleLower.includes('hofburg') || titleLower.includes('belvedere')) {
        iconName = 'Palace';
      } else if (titleLower.includes('cathedral') || titleLower.includes('church') || titleLower.includes('st. stephen')) {
        iconName = 'Church';
      } else if (titleLower.includes('opera') || titleLower.includes('theater')) {
        iconName = 'Theater';
      } else if (titleLower.includes('café') || titleLower.includes('cafe') || titleLower.includes('coffee')) {
        iconName = 'Coffee';
      } else if (titleLower.includes('market') || titleLower.includes('naschmarkt')) {
        iconName = 'ShoppingBag';
      } else if (titleLower.includes('park') || titleLower.includes('prater')) {
        iconName = 'Park';
      } else if (titleLower.includes('tower') || titleLower.includes('danube')) {
        iconName = 'Tower';
      } else if (titleLower.includes('museum') || titleLower.includes('quarter')) {
        iconName = 'Museum';
      } else if (titleLower.includes('ringstrasse') || titleLower.includes('boulevard')) {
        iconName = 'Map';
      } else if (titleLower.includes('graben') || titleLower.includes('shopping')) {
        iconName = 'ShoppingBag';
      } else {
        iconName = 'MapPin';
      }
    }
    
    // Render icon after container is in DOM
    requestAnimationFrame(() => {
      renderLucideIcon(iconName, iconContainer, 80);
      
      // Re-initialize Lucide icons after a short delay to ensure DOM is ready
      setTimeout(() => {
        reinitializeLucideIcons();
      }, 200);
    });
    
    // Hide any attribution elements
    const imageContainer = modalImage.parentElement;
    const attributionEl = imageContainer.querySelector(".modal-attribution");
    if (attributionEl) {
      attributionEl.style.display = "none";
    }

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Delegate click events to handle both static and dynamic options
  document.addEventListener("click", function (e) {
    const visitOption = e.target.closest(".visit-option");
    if (visitOption) {
      const visitId = visitOption.dataset.visit;
      const data = visitData[visitId] || visitOption.dataset.modalData;

      if (data) {
        if (typeof data === "string") {
          // Parse JSON data from dataset
          try {
            const parsedData = JSON.parse(data);
            openModal(parsedData);
          } catch (e) {
            console.error("Failed to parse modal data:", e);
          }
        } else {
          openModal(data);
        }
      }
    }
  });

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

// Predefined beautiful gradient palettes
const GRADIENT_PALETTES = [
  // Purple/Blue gradients
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#30cfd0', '#330867'],
  ['#a8edea', '#fed6e3'],
  ['#ff9a9e', '#fecfef'],
  ['#ffecd2', '#fcb69f'],
  ['#ff8a80', '#ea4c89'],
  // Blue/Purple gradients
  ['#667eea', '#764ba2', '#f093fb'],
  ['#4facfe', '#00f2fe', '#43e97b'],
  ['#30cfd0', '#330867', '#667eea'],
  // Warm gradients
  ['#fa709a', '#fee140', '#ff8a80'],
  ['#ffecd2', '#fcb69f', '#ff9a9e'],
  ['#ff6b6b', '#ee5a6f', '#c44569'],
  // Cool gradients
  ['#a8edea', '#fed6e3', '#d299c2'],
  ['#89f7fe', '#66a6ff', '#4facfe'],
  ['#30cfd0', '#330867', '#667eea'],
  // Vibrant gradients
  ['#f093fb', '#f5576c', '#4facfe'],
  ['#43e97b', '#38f9d7', '#667eea'],
  ['#fa709a', '#fee140', '#ff8a80'],
  // Deep gradients
  ['#330867', '#667eea', '#764ba2'],
  ['#1e3c72', '#2a5298', '#7e8ba3'],
  ['#0f2027', '#203a43', '#2c5364'],
  // Bright gradients
  ['#ff9a9e', '#fecfef', '#fecfef'],
  ['#a8edea', '#fed6e3', '#d299c2'],
  ['#ffecd2', '#fcb69f', '#ff9a9e']
];

// Hash function to consistently map terms to palette indices
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Get gradient palette for a search term
function getGradientPalette(searchTerm) {
  if (!searchTerm) searchTerm = 'vienna';
  const normalizedTerm = searchTerm.toLowerCase().trim();
  const hash = hashString(normalizedTerm);
  const paletteIndex = hash % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[paletteIndex];
}

// Create gradient CSS string from palette
function createGradientFromPalette(palette) {
  if (!palette || palette.length === 0) {
    palette = GRADIENT_PALETTES[0];
  }
  
  const color1 = palette[0];
  const color2 = palette[1] || palette[0];
  const color3 = palette[2] || palette[1] || palette[0];
  
  // Create diagonal gradient with multiple color stops
  if (palette.length === 2) {
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  } else {
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
  }
}

// Apply gradient to element using a dedicated gradient layer
function applyGradientToElement(element, gradientStyle) {
  if (!element || !gradientStyle) {
    console.warn('applyGradientToElement: Missing element or gradientStyle', { element, gradientStyle });
    return;
  }
  
  // Remove any old CSS classes that might set background images
  element.classList.remove('visit-1', 'visit-2', 'visit-3', 'visit-4', 'visit-5', 'visit-6', 
                           'visit-7', 'visit-8', 'visit-9', 'visit-10', 'visit-11', 'visit-12');
  
  // Ensure element has position relative and proper display
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  
  // Remove any existing gradient layer
  const existingGradient = element.querySelector('.gradient-layer');
  if (existingGradient) {
    existingGradient.remove();
  }
  
  // Create a dedicated gradient layer div
  const gradientLayer = document.createElement('div');
  gradientLayer.className = 'gradient-layer';
  
  // Set position and layout styles first
  gradientLayer.style.position = 'absolute';
  gradientLayer.style.top = '0';
  gradientLayer.style.left = '0';
  gradientLayer.style.width = '100%';
  gradientLayer.style.height = '100%';
  gradientLayer.style.zIndex = '0';
  gradientLayer.style.pointerEvents = 'none';
  gradientLayer.style.opacity = '1';
  gradientLayer.style.visibility = 'visible';
  
  // Set background as a single combined value - this is critical!
  // Do NOT override backgroundImage afterwards, otherwise the gradient disappears
  gradientLayer.style.background = `${gradientStyle} center / cover no-repeat`;
  
  // Insert gradient layer as first child (behind all other content)
  if (element.firstChild) {
    element.insertBefore(gradientLayer, element.firstChild);
  } else {
    element.appendChild(gradientLayer);
  }
  
  // Set CSS custom property for potential CSS use
  element.style.setProperty('--gradient-bg', gradientStyle);
  
  // Set background as a single combined value - this is critical!
  // Do NOT override backgroundImage afterwards, otherwise the gradient disappears
  element.style.background = `${gradientStyle} center / cover no-repeat`;
  
  // Mark element as having gradient
  element.classList.add('has-gradient');
  
  // Debug: log gradient application
  console.log('Applied gradient:', gradientStyle, 'to element:', element);
  
  // Verify the gradient layer was created and visible
  setTimeout(() => {
    const verifyLayer = element.querySelector('.gradient-layer');
    if (!verifyLayer) {
      console.error('ERROR: Gradient layer was not created!', element);
    } else {
      const computedStyle = window.getComputedStyle(verifyLayer);
      const elementStyle = window.getComputedStyle(element);
      console.log('Gradient verification:', {
        layerExists: true,
        layerBackground: computedStyle.background,
        layerDisplay: computedStyle.display,
        layerVisibility: computedStyle.visibility,
        layerOpacity: computedStyle.opacity,
        layerZIndex: computedStyle.zIndex,
        layerWidth: computedStyle.width,
        layerHeight: computedStyle.height,
        elementBackground: elementStyle.background,
        elementBackgroundImage: elementStyle.backgroundImage
      });
    }
  }, 50);
}

// Map our icon names to valid Lucide icon names
const LUCIDE_ICON_MAP = {
  'Palace': 'Building2',
  'Park': 'Trees',
  'Museum': 'Building',
  'ShoppingBag': 'ShoppingBag',
  'Tower': 'TowerControl',
  'Dance': 'Music',
  'Cocktail': 'Wine',
  'Church': 'Church',
  'Theater': 'Theater',
  'Coffee': 'Coffee',
  'Map': 'Map',
  'MapPin': 'MapPin',
  'Music': 'Music',
  'Building': 'Building',
  'Star': 'Star',
  'Heart': 'Heart'
};

// Render Lucide Icon - improved version with direct SVG creation
function renderLucideIcon(iconName, container, size = 64) {
  if (!iconName || !container) {
    console.warn('renderLucideIcon: Missing iconName or container', { iconName, container });
    return;
  }
  
  // Default fallback icon
  const fallbackIcon = 'MapPin';
  
  // Clean and validate icon name, then map to valid Lucide name
  let cleanIconName = String(iconName).trim();
  if (!cleanIconName) {
    cleanIconName = fallbackIcon;
  }
  
  // Map to valid Lucide icon name if needed
  const lucideIconName = LUCIDE_ICON_MAP[cleanIconName] || cleanIconName;
  
  // Normalize to kebab-case for data-lucide and PascalCase for direct lookup
  const kebabName = String(lucideIconName)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
  const pascalName = kebabName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  
  try {
    // Clear container first
    container.innerHTML = '';
    
    // Function to create icon using Lucide
    const createIconWithLucide = () => {
      if (typeof lucide === 'undefined') {
        return false;
      }
      
      try {
        // Method 1: Try to get icon directly from Lucide icons object
        if (lucide.icons && lucide.icons[pascalName]) {
          const icon = lucide.icons[pascalName];
          if (icon && typeof icon.toSvg === 'function') {
            const svgString = icon.toSvg({
              width: size,
              height: size,
              stroke: 'rgba(255, 255, 255, 0.95)',
              'stroke-width': '2',
              color: 'rgba(255, 255, 255, 0.95)'
            });
            container.innerHTML = svgString;
            return true;
          }
        }
        
        // Method 2: Try createIcon function if available
        if (lucide.createIcon && typeof lucide.createIcon === 'function') {
          try {
            const iconElement = lucide.createIcon(pascalName, {
              width: size,
              height: size,
              stroke: 'rgba(255, 255, 255, 0.95)',
              'stroke-width': '2'
            });
            if (iconElement) {
              container.appendChild(iconElement);
              return true;
            }
          } catch (e) {
            // Continue to next method
          }
        }
        
        // Method 3: Use createIcons API with data-lucide attribute
        if (lucide.createIcons) {
          const iconElement = document.createElement('i');
          iconElement.setAttribute('data-lucide', kebabName);
          iconElement.style.width = `${size}px`;
          iconElement.style.height = `${size}px`;
          container.appendChild(iconElement);
          
          // Create icons immediately
          lucide.createIcons();
          
          // Check if it was converted to SVG after a short delay
          setTimeout(() => {
            const svg = container.querySelector('svg');
            if (!svg) {
              // Not converted, use fallback SVG with original icon name
              container.innerHTML = createFallbackSVG(cleanIconName, size);
            }
          }, 150);
          return true;
        }
      } catch (e) {
        console.warn(`Error creating icon ${lucideIconName} with Lucide:`, e);
        return false;
      }
      return false;
    };
    
    // Try to create icon immediately
    let iconCreated = createIconWithLucide();
    
    // If Lucide not available or icon not found, use fallback SVG immediately
    if (!iconCreated) {
      // Use fallback SVG immediately so icon always shows
      container.innerHTML = createFallbackSVG(cleanIconName, size);
      
      // Then try to replace with Lucide icon if it loads later
      const retryCreate = (attempts = 0) => {
        if (attempts > 2) {
          return; // Keep fallback SVG
        }
        
        setTimeout(() => {
          if (typeof lucide !== 'undefined') {
            const wasCreated = createIconWithLucide();
            // If successful, it will replace the fallback
            if (!wasCreated) {
              retryCreate(attempts + 1);
            }
          } else {
            retryCreate(attempts + 1);
          }
        }, 300);
      };
      
      retryCreate();
    } else {
      // Icon was created, but verify it actually rendered
      setTimeout(() => {
        const svg = container.querySelector('svg');
        const i = container.querySelector('i[data-lucide]');
        // If we still have an <i> tag and no SVG, use fallback
        if (i && !svg) {
          container.innerHTML = createFallbackSVG(cleanIconName, size);
        }
      }, 200);
    }
  } catch (error) {
    console.warn(`Failed to render icon ${cleanIconName}:`, error);
    container.innerHTML = createFallbackSVG(cleanIconName, size);
  }
}

// Create a simple fallback SVG icon
function createFallbackSVG(iconName, size) {
  // Simple geometric shapes as fallback
  const stroke = 'rgba(255, 255, 255, 0.95)';
  const strokeWidth = '2';
  
  // Map common icon names to simple SVG shapes
  const iconShapes = {
    'MapPin': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    'Palace': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><rect x="4" y="2" width="16" height="20" rx="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M12 18h.01"></path></svg>`,
    'Church': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><path d="M18 22h-5a2 2 0 0 1-2-2v-6a2 2 0 0 1-2-2H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M14 22V12a2 2 0 0 0-2-2H4"></path><path d="M18 12v10h4V10a2 2 0 0 0-2-2h-2v4Z"></path><path d="M12 6V2"></path><path d="M10 6h4"></path></svg>`,
    'Theater': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><rect x="2" y="6" width="20" height="14" rx="2"></rect><path d="M12 6V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2"></path><path d="M12 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path><path d="M7 10h10"></path></svg>`,
    'Coffee': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><line x1="6" y1="2" x2="6" y2="4"></line><line x1="10" y1="2" x2="10" y2="4"></line><line x1="14" y1="2" x2="14" y2="4"></line></svg>`,
    'ShoppingBag': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
    'Park': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    'Museum': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><rect x="2" y="3" width="20" height="18" rx="2"></rect><path d="M7 3v18"></path><path d="M17 3v18"></path><path d="M2 12h20"></path></svg>`,
    'Tower': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    'Map': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>`,
    'Music': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
    'Cocktail': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><path d="M8 22h8"></path><path d="M12 11v11"></path><path d="M19 5l-7 7-7-7a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7Z"></path></svg>`,
    'Building': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><rect x="9" y="6" width="6" height="4"></rect><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path></svg>`,
    'Star': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    'Heart': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"></path></svg>`
  };
  
  return iconShapes[iconName] || iconShapes['MapPin'];
}

// AI Visit Options Generator
function initVisitOptionsGenerator() {
  const queryInput = document.getElementById("visitQueryInput");
  const queryBtn = document.getElementById("visitQueryBtn");
  const resetBtn = document.getElementById("resetDefaultBtn");
  const optionsGrid = document.getElementById("visitOptionsGrid");

  if (!queryInput || !queryBtn || !optionsGrid) {
    return; // Section not present
  }

  // Store default options HTML
  const defaultOptionsHTML = optionsGrid.innerHTML;

  function showLoading() {
    optionsGrid.innerHTML = `
      <div class="visit-options-loading">
        <div class="visit-loading-spinner"></div>
        <div class="visit-loading-text">Generating personalized options for you...</div>
      </div>
    `;
    queryBtn.disabled = true;
  }

  function showError(message) {
    optionsGrid.innerHTML = `
      <div class="visit-options-loading">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <div class="visit-loading-text">${
          message || "Failed to generate options. Please try again."
        }</div>
      </div>
    `;
    queryBtn.disabled = false;
  }

  function renderOptions(options) {
    optionsGrid.innerHTML = "";

    options.forEach((option, index) => {
      const card = document.createElement("div");
      card.className = "visit-option";
      card.dataset.visit = option.id;
      card.dataset.modalData = JSON.stringify({
        title: option.title,
        content: option.content,
        imageSearchTerm: option.imageSearchTerm,
        icon: option.icon,
      });

      // Add scroll animation
      card.setAttribute("data-scroll", "");

      // Create image element with gradient background
      const imageDiv = document.createElement("div");
      imageDiv.className = "visit-image";

      // Generate gradient from imageSearchTerm using palette system
      const searchTerm = option.imageSearchTerm || option.title || 'vienna';
      const palette = getGradientPalette(searchTerm);
      const gradientStyle = createGradientFromPalette(palette);
      
      // Add icon container FIRST (before gradient layer)
      const iconContainer = document.createElement("div");
      iconContainer.className = "visit-icon-container";
      const iconName = option.icon || 'MapPin';
      imageDiv.appendChild(iconContainer);
      
      // Apply gradient AFTER icon container is added (gradient layer will be inserted as first child)
      applyGradientToElement(imageDiv, gradientStyle);
      
      // Render icon after container is in DOM, then re-initialize Lucide
      setTimeout(() => {
        renderLucideIcon(iconName, iconContainer, 64);
        
        // Re-initialize Lucide icons after a delay to ensure DOM is ready
        setTimeout(() => {
          reinitializeLucideIcons();
        }, 200);
      }, index * 50 + 100);

      // Create title
      const title = document.createElement("h3");
      title.className = "visit-title";
      title.textContent = option.title;

      card.appendChild(imageDiv);
      card.appendChild(title);

      // Add with stagger animation
      setTimeout(() => {
        optionsGrid.appendChild(card);
        // Trigger scroll animation
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("visible");
              }
            });
          },
          { threshold: 0.1 }
        );
        observer.observe(card);
      }, index * 50);
    });

    queryBtn.disabled = false;
    resetBtn.style.display = "block";
  }

  async function generateOptions() {
    const query = queryInput.value.trim();

    if (!query) {
      queryInput.focus();
      return;
    }

    showLoading();

    try {
      const response = await fetch("/api/ai/visit-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message || data.error);
      }

      if (
        !data.options ||
        !Array.isArray(data.options) ||
        data.options.length === 0
      ) {
        throw new Error("No options generated");
      }

      renderOptions(data.options);
    } catch (error) {
      console.error("Visit options generation error:", error);
      showError(
        error.message || "Failed to generate options. Please try again."
      );
    }
  }

  queryBtn.addEventListener("click", generateOptions);

  queryInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateOptions();
    }
  });

  resetBtn.addEventListener("click", async () => {
    optionsGrid.innerHTML = defaultOptionsHTML;
    resetBtn.style.display = "none";
    queryInput.value = "";

    // Re-initialize scroll observers for default options
    const defaultOptions = optionsGrid.querySelectorAll(
      ".visit-option[data-scroll]"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    defaultOptions.forEach((option) => observer.observe(option));

    // Re-initialize default cards with gradients and icons
    initializeDefaultCards();
  });
}

// Weather API Integration
async function initWeather() {
  const VIENNA_LAT = 48.2082;
  const VIENNA_LON = 16.3738;
  const TARGET_DATES = {
    start: new Date("2026-04-24"),
    end: new Date("2026-04-27"),
  };
  const TODAY = new Date();
  const DAYS_UNTIL_TRIP = Math.floor(
    (TARGET_DATES.start - TODAY) / (1000 * 60 * 60 * 24)
  );

  const weatherCurrent = document.getElementById("weatherCurrent");
  const weatherForecast = document.getElementById("weatherForecast");

  // Check if we're running locally (file:// protocol) or on a server
  const isLocalFile = window.location.protocol === "file:";
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Check if we're close to the trip dates (within 14 days)
  const showTripForecast = DAYS_UNTIL_TRIP <= 14 && DAYS_UNTIL_TRIP >= 0;

  // Show helpful message if running as local file
  if (isLocalFile) {
    weatherCurrent.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 64px; margin-bottom: 20px;">🌤️</div>
        <h3 style="font-size: 28px; margin-bottom: 15px; color: var(--text-primary);">Vienna Weather</h3>
        <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 20px;">
          Weather data requires a web server to function.
        </p>
        <p style="font-size: 14px; color: var(--text-secondary); margin-top: 20px;">
          <strong>To view weather data:</strong><br>
          • Run: <code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px;">npm run dev</code><br>
          • Then visit: <code style="background: rgba(0,0,0,0.1); padding: 2px 6px; border-radius: 4px;">http://localhost:3000</code>
        </p>
        ${
          DAYS_UNTIL_TRIP > 0
            ? `<p style="margin-top: 20px; font-size: 16px; color: var(--accent-blue); font-weight: 600;">${DAYS_UNTIL_TRIP} days until your trip!</p>`
            : ""
        }
      </div>
    `;
    return;
  }

  try {
    // Use relative URL for API (works with both localhost and production)
    const apiUrl = `/api/weather?type=forecast&lat=${VIENNA_LAT}&lon=${VIENNA_LON}`;

    if (showTripForecast && DAYS_UNTIL_TRIP >= 0) {
      // Show forecast for trip dates - use our API route
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.message ||
            errorData.error ||
            `API error: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message || data.error);
      }

      displayForecast(data, TARGET_DATES);
    } else {
      // Show current weather + next 3 days - use forecast API
      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.message ||
            errorData.error ||
            `API error: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message || data.error);
      }

      displayCurrentAndNext3Days(data, DAYS_UNTIL_TRIP);
    }
  } catch (error) {
    console.error("Weather API error:", error);
    weatherCurrent.innerHTML = `
            <div class="weather-loading">
                <p>Weather data temporarily unavailable.</p>
                <p style="margin-top: 10px; font-size: 14px; color: var(--text-secondary);">
                    ${
                      DAYS_UNTIL_TRIP > 0
                        ? `${DAYS_UNTIL_TRIP} days until your trip!`
                        : "Check back closer to your travel dates for a detailed forecast."
                    }
                </p>
                ${
                  error.message
                    ? `<p style="margin-top: 10px; font-size: 12px; color: var(--text-secondary);">${error.message}</p>`
                    : ""
                }
                ${
                  isLocalhost
                    ? `<p style="margin-top: 10px; font-size: 12px; color: var(--text-secondary);">Make sure you're running <code>vercel dev</code> for API routes to work locally.</p>`
                    : ""
                }
            </div>
        `;
  }
}

function displayCurrentAndNext3Days(data, daysUntil) {
  const weatherCurrent = document.getElementById("weatherCurrent");
  const weatherForecast = document.getElementById("weatherForecast");

  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get the first forecast item (closest to now)
  const firstForecast = data.list[0];
  const icon = getWeatherIcon(firstForecast.weather[0].icon);
  const date = new Date(firstForecast.dt * 1000);

  // Display current weather (today)
  weatherCurrent.innerHTML = `
        <div class="current-weather">
            <div class="current-weather-icon">${icon}</div>
            <div class="current-weather-info">
                <h3>Vienna, Austria - ${formatDate(date)}</h3>
                <div class="current-weather-temp">${Math.round(
                  firstForecast.main.temp
                )}°C</div>
                <p style="font-size: 20px; color: var(--text-secondary); margin: 10px 0;">
                    ${
                      firstForecast.weather[0].description
                        .charAt(0)
                        .toUpperCase() +
                      firstForecast.weather[0].description.slice(1)
                    }
                </p>
                <div class="current-weather-details">
                    <div class="weather-detail">
                        <strong>Feels like</strong>
                        ${Math.round(firstForecast.main.feels_like)}°C
                    </div>
                    <div class="weather-detail">
                        <strong>Humidity</strong>
                        ${firstForecast.main.humidity}%
                    </div>
                    <div class="weather-detail">
                        <strong>Wind</strong>
                        ${Math.round(firstForecast.wind.speed * 3.6)} km/h
                    </div>
                </div>
                ${
                  daysUntil > 0
                    ? `<p style="margin-top: 20px; font-size: 16px; color: var(--accent-blue); font-weight: 600;">${daysUntil} days until your trip!</p>`
                    : ""
                }
            </div>
        </div>
    `;

  // Group forecasts by date
  const forecastsByDate = {};
  data.list.forEach((item) => {
    const itemDate = new Date(item.dt * 1000);
    const dateKey = itemDate.toISOString().split("T")[0];
    if (!forecastsByDate[dateKey]) {
      forecastsByDate[dateKey] = [];
    }
    forecastsByDate[dateKey].push(item);
  });

  // Get next 3 days (excluding today)
  const sortedDates = Object.keys(forecastsByDate).sort();
  const todayKey = today.toISOString().split("T")[0];
  const next3Days = sortedDates
    .filter((dateKey) => dateKey > todayKey)
    .slice(0, 3);

  // Display forecast for next 3 days
  weatherForecast.innerHTML = "";
  next3Days.forEach((dateKey) => {
    const dayForecasts = forecastsByDate[dateKey];
    // Use the forecast closest to noon for the day
    const noonForecast =
      dayForecasts.find((item) => new Date(item.dt * 1000).getHours() >= 12) ||
      dayForecasts[Math.floor(dayForecasts.length / 2)];

    const avgTemp = Math.round(
      dayForecasts.reduce((sum, item) => sum + item.main.temp, 0) /
        dayForecasts.length
    );
    const icon = getWeatherIcon(noonForecast.weather[0].icon);
    const date = new Date(noonForecast.dt * 1000);

    const forecastDay = document.createElement("div");
    forecastDay.className = "forecast-day";
    forecastDay.innerHTML = `
            <div class="forecast-date">${formatDate(date)}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${avgTemp}°C</div>
            <div class="forecast-desc">${
              noonForecast.weather[0].description
            }</div>
        `;
    weatherForecast.appendChild(forecastDay);
  });
}

function displayForecast(data, targetDates) {
  const weatherCurrent = document.getElementById("weatherCurrent");
  const weatherForecast = document.getElementById("weatherForecast");

  // Filter forecast for target dates
  const targetForecasts = data.list.filter((item) => {
    const itemDate = new Date(item.dt * 1000);
    return itemDate >= targetDates.start && itemDate <= targetDates.end;
  });

  // Group by date
  const forecastsByDate = {};
  targetForecasts.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().split("T")[0];
    if (!forecastsByDate[dateKey]) {
      forecastsByDate[dateKey] = [];
    }
    forecastsByDate[dateKey].push(item);
  });

  // Display current weather (first day)
  if (targetForecasts.length > 0) {
    const firstDay = targetForecasts[0];
    const icon = getWeatherIcon(firstDay.weather[0].icon);
    const date = new Date(firstDay.dt * 1000);

    weatherCurrent.innerHTML = `
            <div class="current-weather">
                <div class="current-weather-icon">${icon}</div>
                <div class="current-weather-info">
                    <h3>Vienna, Austria - ${formatDate(date)}</h3>
                    <div class="current-weather-temp">${Math.round(
                      firstDay.main.temp
                    )}°C</div>
                    <p style="font-size: 20px; color: var(--text-secondary); margin: 10px 0;">
                        ${
                          firstDay.weather[0].description
                            .charAt(0)
                            .toUpperCase() +
                          firstDay.weather[0].description.slice(1)
                        }
                    </p>
                    <div class="current-weather-details">
                        <div class="weather-detail">
                            <strong>Feels like</strong>
                            ${Math.round(firstDay.main.feels_like)}°C
                        </div>
                        <div class="weather-detail">
                            <strong>Humidity</strong>
                            ${firstDay.main.humidity}%
                        </div>
                        <div class="weather-detail">
                            <strong>Wind</strong>
                            ${Math.round(firstDay.wind.speed * 3.6)} km/h
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  // Display forecast for remaining days
  weatherForecast.innerHTML = "";
  Object.keys(forecastsByDate)
    .sort()
    .forEach((dateKey, index) => {
      if (index === 0) return; // Skip first day (shown in current)

      const dayForecasts = forecastsByDate[dateKey];
      const avgTemp = Math.round(
        dayForecasts.reduce((sum, item) => sum + item.main.temp, 0) /
          dayForecasts.length
      );
      const mainWeather = dayForecasts[Math.floor(dayForecasts.length / 2)];
      const icon = getWeatherIcon(mainWeather.weather[0].icon);
      const date = new Date(mainWeather.dt * 1000);

      const forecastDay = document.createElement("div");
      forecastDay.className = "forecast-day";
      forecastDay.innerHTML = `
            <div class="forecast-date">${formatDate(date)}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${avgTemp}°C</div>
            <div class="forecast-desc">${
              mainWeather.weather[0].description
            }</div>
        `;
      weatherForecast.appendChild(forecastDay);
    });
}

function getWeatherIcon(iconCode) {
  const iconMap = {
    "01d": "☀️",
    "01n": "🌙",
    "02d": "⛅",
    "02n": "☁️",
    "03d": "☁️",
    "03n": "☁️",
    "04d": "☁️",
    "04n": "☁️",
    "09d": "🌧️",
    "09n": "🌧️",
    "10d": "🌦️",
    "10n": "🌧️",
    "11d": "⛈️",
    "11n": "⛈️",
    "13d": "❄️",
    "13n": "❄️",
    "50d": "🌫️",
    "50n": "🌫️",
  };
  return iconMap[iconCode] || "🌤️";
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Initialize default visit option cards with gradients and icons
function initializeDefaultCards() {
  // Map of visit IDs to icon names (using our icon names, will be mapped to Lucide names)
  const iconMap = {
    'schonbrunn': 'Palace',
    'stephans': 'Church',
    'ringstrasse': 'Map',
    'hofburg': 'Palace',
    'belvedere': 'Palace',
    'opera': 'Theater',
    'prater': 'Park',
    'museums': 'Museum',
    'cafe': 'Coffee',
    'naschmarkt': 'ShoppingBag',
    'graben': 'ShoppingBag',
    'danube': 'Tower'
  };

  document.querySelectorAll(".visit-option[data-visit]").forEach((option) => {
    const visitId = option.dataset.visit;
    const imageDiv = option.querySelector(".visit-image");
    const titleElement = option.querySelector(".visit-title");
    
    if (!imageDiv || !titleElement) return;
    
    const title = titleElement.textContent.trim();
    
    // Remove old CSS classes that set background images
    imageDiv.className = 'visit-image';
    
    // Generate gradient from title using palette system
    const palette = getGradientPalette(title);
    const gradientStyle = createGradientFromPalette(palette);
    
    // Apply gradient using new function
    applyGradientToElement(imageDiv, gradientStyle);
    
    // Add icon container if it doesn't exist
    let iconContainer = imageDiv.querySelector(".visit-icon-container");
    if (!iconContainer) {
      iconContainer = document.createElement("div");
      iconContainer.className = "visit-icon-container";
      imageDiv.appendChild(iconContainer);
    }
    
    // Get icon name
    const iconName = iconMap[visitId] || 'MapPin';
    
    // Render icon
    setTimeout(() => {
      renderLucideIcon(iconName, iconContainer, 64);
      setTimeout(() => {
        reinitializeLucideIcons();
      }, 200);
    }, 50);
  });
}

// Global function to re-initialize all Lucide icons
function reinitializeLucideIcons() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    try {
      lucide.createIcons();
    } catch (e) {
      console.warn('Error reinitializing Lucide icons:', e);
    }
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  initVisitModals();
  // Initialize weather with API route
  initWeather();
  // Initialize visit options generator
  initVisitOptionsGenerator();
  
  // Wait for Lucide to load, then initialize default cards
  const initDefaults = () => {
    if (typeof lucide !== 'undefined') {
      initializeDefaultCards();
      // Re-initialize icons after a short delay
      setTimeout(reinitializeLucideIcons, 500);
    } else {
      setTimeout(initDefaults, 100);
    }
  };
  initDefaults();
});
