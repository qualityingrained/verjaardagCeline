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

    // Handle image - either from class or URL
    if (data.imageUrl) {
      modalImage.style.backgroundImage = `url('${data.imageUrl}')`;
      modalImage.style.backgroundSize = "cover";
      modalImage.style.backgroundPosition = "center";
      modalImage.className = "modal-image";

      // Add attribution if available
      const imageContainer = modalImage.parentElement;
      let attributionEl = imageContainer.querySelector(".modal-attribution");
      
      // Check if image is from Unsplash
      const isUnsplashImage = data.imageUrl && (
        data.imageUrl.includes('unsplash.com') || 
        data.imageUrl.includes('source.unsplash.com')
      );
      
      // Handle attribution - could be object or string (from JSON parsing)
      let attribution = data.attribution;
      if (typeof attribution === 'string') {
        try {
          attribution = JSON.parse(attribution);
        } catch (e) {
          attribution = null;
        }
      }
      
      if (attribution && attribution.photographer) {
        if (!attributionEl) {
          attributionEl = document.createElement("div");
          attributionEl.className = "modal-attribution";
          imageContainer.appendChild(attributionEl);
        }
        const profileUrl = attribution.profileUrl || `https://unsplash.com/@${attribution.username || 'unsplash'}?utm_source=vienna-trip-website&utm_medium=referral`;
        const unsplashUrl = attribution.unsplashUrl || 'https://unsplash.com/?utm_source=vienna-trip-website&utm_medium=referral';
        attributionEl.innerHTML = `
          <span>Photo by <a href="${profileUrl}" target="_blank" rel="noopener noreferrer">${attribution.photographer}</a> on <a href="${unsplashUrl}" target="_blank" rel="noopener noreferrer">Unsplash</a></span>
        `;
        attributionEl.style.display = "block";
        console.log('Modal attribution set:', attribution);
      } else if (isUnsplashImage) {
        // Fallback attribution for Unsplash images without attribution data
        if (!attributionEl) {
          attributionEl = document.createElement("div");
          attributionEl.className = "modal-attribution";
          imageContainer.appendChild(attributionEl);
        }
        attributionEl.innerHTML = `
          <span>Photo on <a href="https://unsplash.com/?utm_source=vienna-trip-website&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a></span>
        `;
        attributionEl.style.display = "block";
        console.log('Modal fallback attribution set for Unsplash image');
      } else if (attributionEl) {
        attributionEl.style.display = "none";
      }
    } else if (data.image) {
      modalImage.className = `modal-image ${data.image}`;
      // Hide attribution for static images
      const imageContainer = modalImage.parentElement;
      const attributionEl = imageContainer.querySelector(".modal-attribution");
      if (attributionEl) {
        attributionEl.style.display = "none";
      }
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
        imageUrl: option.imageUrl,
        attribution: option.attribution,
      });

      // Add scroll animation
      card.setAttribute("data-scroll", "");

      // Create image element
      const imageDiv = document.createElement("div");
      imageDiv.className = "visit-image";

      // Function to fix and validate image URL - comprehensive client-side fix
      function fixImageUrl(url) {
        if (!url) return null;

        let imageUrl = String(url).trim();

        // Remove quotes if present
        imageUrl = imageUrl.replace(/^["']|["']$/g, "");

        // If it's already a valid absolute URL, just ensure parameters
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
          if (imageUrl.includes("unsplash.com") && !imageUrl.includes("w=")) {
            imageUrl = imageUrl.includes("?")
              ? `${imageUrl}&w=800&q=80&fit=crop`
              : `${imageUrl}?w=800&q=80&fit=crop`;
          } else if (
            imageUrl.includes("pexels.com") &&
            !imageUrl.includes("?")
          ) {
            imageUrl = `${imageUrl}?auto=compress&cs=tinysrgb&w=800`;
          }
          return imageUrl;
        }

        // Case 1: Just numbers and hash pattern (e.g., "1571680267315-6b4f1f89e5bb")
        if (imageUrl.match(/^\d+-[a-z0-9]+$/i)) {
          return `https://images.unsplash.com/photo-${imageUrl}?w=800&q=80&fit=crop`;
        }

        // Case 2: Has "photo-" prefix but no domain
        if (imageUrl.startsWith("photo-")) {
          return `https://images.unsplash.com/${imageUrl}?w=800&q=80&fit=crop`;
        }

        // Case 3: Pexels filename pattern
        if (
          imageUrl.includes("pexels-photo") ||
          imageUrl.endsWith(".jpeg") ||
          imageUrl.endsWith(".jpg")
        ) {
          const photoIdMatch = imageUrl.match(/(\d+)/);
          if (photoIdMatch) {
            const photoId = photoIdMatch[1];
            return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=800`;
          }
        }

        // Case 4: Has leading slash
        if (imageUrl.startsWith("/photo-")) {
          return `https://images.unsplash.com${imageUrl}?w=800&q=80&fit=crop`;
        }

        // Case 5: Try to match any photo ID pattern
        const photoIdMatch = imageUrl.match(/(?:photo-)?(\d+-[a-z0-9]+)/i);
        if (photoIdMatch) {
          return `https://images.unsplash.com/photo-${photoIdMatch[1]}?w=800&q=80&fit=crop`;
        }

        // Can't fix, return null for fallback
        console.warn("Could not fix image URL:", url);
        return null;
      }

      const fixedUrl = fixImageUrl(option.imageUrl);

      if (
        fixedUrl &&
        (fixedUrl.startsWith("http://") || fixedUrl.startsWith("https://"))
      ) {
        // Set background image with absolute URL
        imageDiv.style.backgroundImage = `url("${fixedUrl}")`;
        imageDiv.style.backgroundSize = "cover";
        imageDiv.style.backgroundPosition = "center";

        // Preload and validate image
        const img = new Image();
        img.onerror = function () {
          // Fallback to gradient if image fails to load
          imageDiv.style.backgroundImage = "none";
          imageDiv.style.background = "var(--dark-gradient)";
        };
        img.onload = function () {
          // Image loaded successfully
          imageDiv.style.backgroundImage = `url("${fixedUrl}")`;
        };
        img.src = fixedUrl;
      } else {
        // Fallback gradient if URL can't be fixed
        imageDiv.style.background = "var(--dark-gradient)";
        imageDiv.style.backgroundImage = "none";
      }

      // Create title
      const title = document.createElement("h3");
      title.className = "visit-title";
      title.textContent = option.title;

      // Create attribution if available
      // Check if imageUrl is from Unsplash (always show attribution for Unsplash images)
      const isUnsplashImage =
        fixedUrl &&
        (fixedUrl.includes("unsplash.com") ||
          fixedUrl.includes("source.unsplash.com"));

      if (option.attribution && option.attribution.photographer) {
        const attribution = document.createElement("div");
        attribution.className = "visit-attribution";
        attribution.innerHTML = `
          <span>Photo by <a href="${
            option.attribution.profileUrl || "https://unsplash.com/"
          }" target="_blank" rel="noopener noreferrer">${
          option.attribution.photographer
        }</a> on <a href="${
          option.attribution.unsplashUrl || "https://unsplash.com/"
        }" target="_blank" rel="noopener noreferrer">Unsplash</a></span>
        `;
        imageDiv.appendChild(attribution);
        console.log("Added attribution for:", option.title, option.attribution);
      } else if (isUnsplashImage) {
        // Fallback attribution for Unsplash images without attribution data
        const attribution = document.createElement("div");
        attribution.className = "visit-attribution";
        attribution.innerHTML = `
          <span>Photo on <a href="https://unsplash.com/?utm_source=vienna-trip-website&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a></span>
        `;
        imageDiv.appendChild(attribution);
        console.log(
          "Added fallback attribution for Unsplash image:",
          option.title
        );
      }

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

    // Reload default images
    await loadDefaultImages();
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

// Load default visit option images from cache
async function loadDefaultImages() {
  try {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const apiBase = isLocalhost ? "http://localhost:3000" : "";

    const response = await fetch(`${apiBase}/api/default-images`);
    if (response.ok) {
      const images = await response.json();

      // Update visit option images
      document.querySelectorAll(".visit-option").forEach((option) => {
        const titleElement = option.querySelector(".visit-title");
        if (titleElement) {
          const title = titleElement.textContent.trim();
          if (images[title]) {
            const imageDiv = option.querySelector(".visit-image");
            if (imageDiv) {
              // Remove CSS classes and set background image
              imageDiv.className = "visit-image";
              imageDiv.style.backgroundImage = `url('${images[title]}')`;
              imageDiv.style.backgroundSize = "cover";
              imageDiv.style.backgroundPosition = "center";
            }
          }
        }
      });
    }
  } catch (error) {
    console.warn("Failed to load default images:", error);
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  initVisitModals();
  // Initialize weather with API route
  initWeather();
  // Initialize visit options generator
  initVisitOptionsGenerator();
  // Load default images from cache
  loadDefaultImages();
});
