/**
 * AAKAR FILMS - Luxury Interactive Engine
 * Handles: Hero Cinematic Slider, Horizontal Navigations, Lightbox,
 * Video Modals, Asymmetrical Reveal, Supabase Live Booking & Dynamic Galleries
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 0. Supabase Credentials Configuration (Local/Live fallback)
  // -------------------------------------------------------------
  const SUPABASE_CONFIG = {
    url: localStorage.getItem('aakar_supabase_url') || 'https://xyzcompany.supabase.co',
    anonKey: localStorage.getItem('aakar_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummyKey'
  };

  let supabaseClient = null;
  if (window.supabase && SUPABASE_CONFIG.url && !SUPABASE_CONFIG.url.includes('xyzcompany')) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    } catch (e) {
      console.warn('Supabase initialization fallback to local demo mode.', e);
    }
  }

  // -------------------------------------------------------------
  // 1. Preloader Screen Fadeout
  // -------------------------------------------------------------
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => preloader.style.display = 'none', 800);
      }
    }, 450);
  });

  // -------------------------------------------------------------
  // 2. Navigation Bar Scroll Effect & Hamburger Menu
  // -------------------------------------------------------------
  const header = document.getElementById('main-header');
  const hamburgerBtn = document.getElementById('hamburger-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      header.classList.add('navbar-scrolled');
      header.classList.remove('navbar-transparent');
    } else {
      header.classList.remove('navbar-scrolled');
      header.classList.add('navbar-transparent');
    }

    if (scrollY > 500) {
      backToTopBtn?.classList.add('show');
    } else {
      backToTopBtn?.classList.remove('show');
    }
  });

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  hamburgerBtn?.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburgerBtn.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburgerBtn.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close nav on click outside
  document.addEventListener('click', (e) => {
    if (navMenu?.classList.contains('open') && 
        !navMenu.contains(e.target) && 
        !hamburgerBtn.contains(e.target)) {
      navMenu.classList.remove('open');
      hamburgerBtn.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // -------------------------------------------------------------
  // 3. Scene 1: Cinematic Hero Slider (4 Slides, Auto + Controls)
  // -------------------------------------------------------------
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-pagination .dot');
  const prevHeroBtn = document.getElementById('hero-prev');
  const nextHeroBtn = document.getElementById('hero-next');
  let currentHeroIdx = 0;
  let heroInterval = null;

  function showHeroSlide(index) {
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === index);
    });

    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === index);
    });

    currentHeroIdx = index;
  }

  function startHeroTimer() {
    stopHeroTimer();
    heroInterval = setInterval(() => {
      showHeroSlide(currentHeroIdx + 1);
    }, 6000);
  }

  function stopHeroTimer() {
    if (heroInterval) clearInterval(heroInterval);
  }

  nextHeroBtn?.addEventListener('click', () => {
    showHeroSlide(currentHeroIdx + 1);
    startHeroTimer();
  });

  prevHeroBtn?.addEventListener('click', () => {
    showHeroSlide(currentHeroIdx - 1);
    startHeroTimer();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      showHeroSlide(idx);
      startHeroTimer();
    });
  });

  startHeroTimer();

  // -------------------------------------------------------------
  // 4. Scene 2: Collections Right-to-Left Continuous Scrolling
  // -------------------------------------------------------------
  const colWrapper = document.getElementById('collections-wrapper');
  const colPrev = document.getElementById('col-prev');
  const colNext = document.getElementById('col-next');

  let colAutoAnim = null;
  let isColPaused = false;
  const colScrollSpeed = 0.85; // smooth luxury glide

  function initColAutoScroll() {
    if (!colWrapper) return;
    
    if (colAutoAnim) {
      cancelAnimationFrame(colAutoAnim);
    }

    function colStep() {
      if (!isColPaused && colWrapper) {
        // Increment scrollLeft to glide Right-to-Left
        colWrapper.scrollLeft += colScrollSpeed;
        
        // When reaching the right end, loop back smoothly to start
        if (colWrapper.scrollLeft >= (colWrapper.scrollWidth - colWrapper.clientWidth - 2)) {
          colWrapper.scrollLeft = 0;
        }
      }
      colAutoAnim = requestAnimationFrame(colStep);
    }
    colAutoAnim = requestAnimationFrame(colStep);
  }

  if (colWrapper) {
    colWrapper.addEventListener('mouseenter', () => { isColPaused = true; });
    colWrapper.addEventListener('mouseleave', () => { isColPaused = false; });
    colWrapper.addEventListener('touchstart', () => { isColPaused = true; }, { passive: true });
    colWrapper.addEventListener('touchend', () => { isColPaused = false; });
    initColAutoScroll();
  }

  colNext?.addEventListener('click', () => {
    colWrapper.scrollBy({ left: 340, behavior: 'smooth' });
  });

  colPrev?.addEventListener('click', () => {
    colWrapper.scrollBy({ left: -340, behavior: 'smooth' });
  });

  // -------------------------------------------------------------
  // 5. Scene 3: Video Showcase Modal
  // -------------------------------------------------------------
  const videoModal = document.getElementById('video-modal');
  const videoClose = document.getElementById('video-close');
  const videoIframe = document.getElementById('video-iframe');
  const openFilmBtn = document.getElementById('open-film-modal');
  const pulseTrigger = document.getElementById('play-pulse-trigger');

  const DEMO_WEDDING_FILM = "https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1";

  function openVideoModal() {
    videoIframe.src = DEMO_WEDDING_FILM;
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeVideoModal() {
    videoIframe.src = "";
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openFilmBtn?.addEventListener('click', openVideoModal);
  pulseTrigger?.addEventListener('click', openVideoModal);
  videoClose?.addEventListener('click', closeVideoModal);
  videoModal?.querySelector('.video-backdrop')?.addEventListener('click', closeVideoModal);

  // -------------------------------------------------------------
  // 6. Scene 4: Signature Wedding Stories Portfolio & Dynamic Data
  // -------------------------------------------------------------
  const DEFAULT_STORIES = [
    {
      id: 1,
      title: "Dev & Radhika",
      category: "royal",
      catLabel: "Royal Wedding",
      location: "City Palace, Udaipur",
      image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=85"
    },
    {
      id: 2,
      title: "Kabir & Ananya",
      category: "destination",
      catLabel: "Destination Wedding",
      location: "Villa Balbiano, Lake Como",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85"
    },
    {
      id: 3,
      title: "Siddharth & Kiara",
      category: "traditional",
      catLabel: "Traditional Wedding",
      location: "Suryagarh Palace, Jaisalmer",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85"
    },
    {
      id: 4,
      title: "Aryan & Tanya",
      category: "modern",
      catLabel: "Modern Wedding",
      location: "Taj Lands End, Mumbai",
      image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=85"
    },
    {
      id: 5,
      title: "Rohan & Meera",
      category: "prewedding",
      catLabel: "Pre-Wedding Story",
      location: "Royal Sand Dunes & Heritage Forts",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85"
    },
    {
      id: 6,
      title: "Vikram & Sanjana",
      category: "engagement",
      catLabel: "Engagement Story",
      location: "The Oberoi Udaivilas",
      image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85"
    },
    {
      id: 7,
      title: "Aditya & Natasha",
      category: "royal",
      catLabel: "Royal Wedding",
      location: "Umaid Bhawan Palace, Jodhpur",
      image: "https://images.unsplash.com/photo-1544077960-604201fe74bc?auto=format&fit=crop&w=1200&q=85"
    },
    {
      id: 8,
      title: "Samar & Jahnavi",
      category: "destination",
      catLabel: "Destination Wedding",
      location: "Amalfi Coast, Italy",
      image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85"
    },
    {
      id: 9,
      title: "Ranveer & Alizeh",
      category: "prewedding",
      catLabel: "Pre-Wedding Story",
      location: "Jaipur Amber Fort & Jal Mahal",
      image: "https://images.unsplash.com/photo-1583939411023-14783179e581?auto=format&fit=crop&w=1200&q=85"
    }
  ];

  const portfolioSlider = document.getElementById('portfolio-slider');
  const portPrev = document.getElementById('port-prev');
  const portNext = document.getElementById('port-next');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let activeStories = DEFAULT_STORIES;
  localStorage.setItem('aakar_custom_stories', JSON.stringify(DEFAULT_STORIES));

  function renderPortfolio(filterCategory = 'all') {
    if (!portfolioSlider) return;
    portfolioSlider.innerHTML = '';

    const filtered = filterCategory === 'all' 
      ? activeStories 
      : activeStories.filter(s => s.category.toLowerCase() === filterCategory.toLowerCase());

    filtered.forEach((story, idx) => {
      const card = document.createElement('div');
      card.className = 'story-card';
      card.dataset.index = idx;
      card.innerHTML = `
        <div class="story-thumb-wrap">
          <img src="${story.image}" alt="${story.title}" loading="lazy">
        </div>
        <div class="story-details">
          <h3 class="story-couple">${story.title}</h3>
          <span class="story-loc"><i class="fa-solid fa-location-dot"></i> ${story.location}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        openLightbox(filtered, idx);
      });

      portfolioSlider.appendChild(card);
    });

    initStoryAutoScroll();
  }

  // Auto Left-to-Right Continuous Scrolling
  let storyAutoScrollAnim = null;
  let isStoryPaused = false;
  const autoScrollSpeed = 1.0;

  function initStoryAutoScroll() {
    if (storyAutoScrollAnim) {
      cancelAnimationFrame(storyAutoScrollAnim);
    }

    if (!portfolioSlider) return;

    // Start at the right end for Left-to-Right scrolling
    if (portfolioSlider.scrollLeft <= 0) {
      portfolioSlider.scrollLeft = portfolioSlider.scrollWidth - portfolioSlider.clientWidth;
    }

    function scrollStep() {
      if (!isStoryPaused && portfolioSlider) {
        // Decrement scrollLeft to move Left-to-Right
        portfolioSlider.scrollLeft -= autoScrollSpeed;
        if (portfolioSlider.scrollLeft <= 2) {
          portfolioSlider.scrollLeft = portfolioSlider.scrollWidth - portfolioSlider.clientWidth;
        }
      }
      storyAutoScrollAnim = requestAnimationFrame(scrollStep);
    }

    storyAutoScrollAnim = requestAnimationFrame(scrollStep);
  }

  if (portfolioSlider) {
    portfolioSlider.addEventListener('mouseenter', () => { isStoryPaused = true; });
    portfolioSlider.addEventListener('mouseleave', () => { isStoryPaused = false; });
    portfolioSlider.addEventListener('touchstart', () => { isStoryPaused = true; }, { passive: true });
    portfolioSlider.addEventListener('touchend', () => { isStoryPaused = false; });
  }

  renderPortfolio('all');

  // Filter Buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');
      renderPortfolio(cat);
    });
  });

  portNext?.addEventListener('click', () => {
    portfolioSlider.scrollBy({ left: 440, behavior: 'smooth' });
  });

  portPrev?.addEventListener('click', () => {
    portfolioSlider.scrollBy({ left: -440, behavior: 'smooth' });
  });

  // -------------------------------------------------------------
  // 7. Full-Screen Lightbox System with Prev/Next
  // -------------------------------------------------------------
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');

  let currentGalleryList = [];
  let currentLbIndex = 0;

  function openLightbox(list, index) {
    currentGalleryList = list;
    currentLbIndex = index;
    updateLightboxContent();
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function updateLightboxContent() {
    const item = currentGalleryList[currentLbIndex];
    if (!item) return;
    lightboxImg.src = item.image || item.src;
    lightboxCaption.textContent = `${item.title || item.caption || ''} — ${item.location || ''}`;
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  lbNext?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentLbIndex = (currentLbIndex + 1) % currentGalleryList.length;
    updateLightboxContent();
  });

  lbPrev?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentLbIndex = (currentLbIndex - 1 + currentGalleryList.length) % currentGalleryList.length;
    updateLightboxContent();
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxModal?.querySelector('.lightbox-backdrop')?.addEventListener('click', closeLightbox);

  // Bind Pre-wedding Gallery to Lightbox
  const preweddingCards = document.querySelectorAll('.asym-card');
  const preweddingList = Array.from(preweddingCards).map(card => ({
    src: card.querySelector('img').src,
    caption: card.getAttribute('data-caption'),
    location: card.querySelector('.asym-location')?.textContent || ''
  }));

  preweddingCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      openLightbox(preweddingList, idx);
    });
  });

  // -------------------------------------------------------------
  // 8. Scene 8: Luxury Booking Form & Supabase Backend Sync
  // -------------------------------------------------------------
  const bookingForm = document.getElementById('booking-form');
  const bookingAlert = document.getElementById('booking-alert');
  const submitBtn = document.getElementById('booking-submit-btn');

  // Service Card Quick Select
  document.querySelectorAll('.svc-inquire-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const svcName = btn.getAttribute('data-service');
      const select = document.getElementById('eventType');
      if (select && svcName) {
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].text.includes(svcName) || select.options[i].value.includes(svcName)) {
            select.selectedIndex = i;
            break;
          }
        }
      }
    });
  });

  bookingForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const email = document.getElementById('email').value.trim();
    const eventType = document.getElementById('eventType').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventLocation = document.getElementById('eventLocation').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!fullName || !phoneNumber || !email || !eventType || !eventDate || !eventLocation) {
      showAlert('Please fill in all required fields marked with *', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>SUBMITTING INQUIRY...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

    const inquiryPayload = {
      full_name: fullName,
      phone: phoneNumber,
      email: email,
      event_type: eventType,
      event_date: eventDate,
      event_location: eventLocation,
      message: message,
      created_at: new Date().toISOString()
    };

    let savedSuccessfully = false;

    // 1. Attempt Supabase insert if client configured
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('booking_inquiries')
          .insert([inquiryPayload]);

        if (!error) savedSuccessfully = true;
      } catch (err) {
        console.warn('Supabase insert warning, persisting to offline queue.', err);
      }
    }

    // 2. Always persist to Admin Local Storage Queue
    try {
      const existing = JSON.parse(localStorage.getItem('aakar_inquiries') || '[]');
      existing.unshift({ id: Date.now(), ...inquiryPayload });
      localStorage.setItem('aakar_inquiries', JSON.stringify(existing));
      savedSuccessfully = true;
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>SUBMIT INQUIRY</span> <i class="fa-solid fa-arrow-right"></i>`;

      if (savedSuccessfully) {
        showAlert('Thank you! Your inquiry has been received. Our Creative Director will reach out within 24 hours.', 'success');
        bookingForm.reset();

        setTimeout(() => {
          const waConfirm = confirm("Inquiry saved! Would you also like to send this inquiry directly via WhatsApp to our Director for instant confirmation?");
          if (waConfirm) {
            const text = encodeURIComponent(`*New Inquiry for Aakar Films*\nName: ${fullName}\nEvent: ${eventType}\nDate: ${eventDate}\nLocation: ${eventLocation}\nPhone: ${phoneNumber}\nNotes: ${message}`);
            window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
          }
        }, 800);
      } else {
        showAlert('Something went wrong. Please connect with us directly on WhatsApp or call us.', 'error');
      }
    }, 600);
  });

  function showAlert(text, type) {
    if (!bookingAlert) return;
    bookingAlert.className = `booking-alert ${type}`;
    bookingAlert.textContent = text;
    bookingAlert.style.display = 'block';

    setTimeout(() => {
      bookingAlert.style.display = 'none';
    }, 6000);
  }

  // -------------------------------------------------------------
  // 9. Ultra-Smooth Page Auto-Scroll (Top to Bottom Showcase)
  // -------------------------------------------------------------
  let pageAutoScrollActive = true;
  let pageScrollAnim = null;
  const pageScrollSpeed = 0.65; // Extremely slow, cinematic glide
  let userInteracting = false;
  let interactionTimer = null;

  // Scroll Triggered Round Reveal for Scene 2 ("THE ART OF STORYTELLING")
  const collectionsSection = document.getElementById('collections');
  if (collectionsSection) {
    const colObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          collectionsSection.classList.add('section-in-view');
        } else {
          collectionsSection.classList.remove('section-in-view');
        }
      });
    }, { threshold: 0.15 });
    colObserver.observe(collectionsSection);
  }

  // Scroll Triggered Left-to-Right Entrance for Scene 4 ("STORIES THAT STAY FOREVER")
  const storiesSection = document.getElementById('stories');
  if (storiesSection) {
    const storiesObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          storiesSection.classList.add('section-in-view');
        } else {
          storiesSection.classList.remove('section-in-view');
        }
      });
    }, { threshold: 0.15 });
    storiesObserver.observe(storiesSection);
  }

  // Scroll Triggered Round Reveal for Philosophy Section (Entire Section: Image + Writing)
  const philSection = document.getElementById('philosophy');
  if (philSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          philSection.classList.add('section-in-view');
        } else {
          philSection.classList.remove('section-in-view');
        }
      });
    }, { threshold: 0.15 });
    observer.observe(philSection);
  }

  // Scroll Triggered Left-to-Right Entrance for Pre-Wedding Section ("TWO HEARTS. ONE BEAUTIFUL STORY.")
  const preweddingSection = document.getElementById('prewedding');
  if (preweddingSection) {
    const prewedObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          preweddingSection.classList.add('section-in-view');
        } else {
          preweddingSection.classList.remove('section-in-view');
        }
      });
    }, { threshold: 0.15 });
    prewedObserver.observe(preweddingSection);
  }

  // Scroll Triggered Round Reveal for Services Section ("OUR BESPOKE SERVICES")
  const servicesSection = document.getElementById('services');
  if (servicesSection) {
    const servicesObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          servicesSection.classList.add('section-in-view');
        } else {
          servicesSection.classList.remove('section-in-view');
        }
      });
    }, { threshold: 0.15 });
    servicesObserver.observe(servicesSection);
  }

  // Scroll Triggered Right-to-Left Entrance for Booking Section ("LET'S CREATE SOMETHING TIMELESS.")
  const bookingSection = document.getElementById('booking');
  if (bookingSection) {
    const bookingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          bookingSection.classList.add('section-in-view');
        } else {
          bookingSection.classList.remove('section-in-view');
        }
      });
    }, { threshold: 0.15 });
    bookingObserver.observe(bookingSection);
  }

  function stepPageScroll() {
    if (pageAutoScrollActive && !userInteracting) {
      window.scrollBy({ top: pageScrollSpeed, behavior: 'auto' });

      // When reaching bottom of the page, smoothly loop back to top
      const scrollPos = window.innerHeight + window.scrollY;
      const maxScroll = document.documentElement.scrollHeight;
      if (scrollPos >= maxScroll - 3) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    pageScrollAnim = requestAnimationFrame(stepPageScroll);
  }

  // Start after preloader finishes
  setTimeout(() => {
    pageScrollAnim = requestAnimationFrame(stepPageScroll);
  }, 1200);

  // Pause momentarily whenever user wants to manually scroll or touch
  function handleUserInteraction() {
    userInteracting = true;
    if (interactionTimer) clearTimeout(interactionTimer);
    interactionTimer = setTimeout(() => {
      userInteracting = false;
    }, 2800); // Resume slow auto-scroll after 2.8s of no user input
  }

  window.addEventListener('wheel', handleUserInteraction, { passive: true });
  window.addEventListener('touchstart', handleUserInteraction, { passive: true });
  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'ArrowUp', 'Space', 'PageDown', 'PageUp'].includes(e.code)) {
      handleUserInteraction();
    }
  });

  // Floating Auto-Scroll Toggle Button for easy user control
  const floatCtrlWrap = document.querySelector('.floating-controls');
  if (floatCtrlWrap) {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'toggle-auto-scroll';
    toggleBtn.className = 'back-to-top show';
    toggleBtn.style.opacity = '1';
    toggleBtn.style.visibility = 'visible';
    toggleBtn.style.borderColor = 'var(--gold-primary)';
    toggleBtn.title = 'Pause / Resume Auto Scroll';
    toggleBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;

    toggleBtn.addEventListener('click', () => {
      pageAutoScrollActive = !pageAutoScrollActive;
      toggleBtn.innerHTML = pageAutoScrollActive ? `<i class="fa-solid fa-pause"></i>` : `<i class="fa-solid fa-play"></i>`;
      toggleBtn.style.color = pageAutoScrollActive ? 'var(--gold-primary)' : '#fff';
    });

    floatCtrlWrap.insertBefore(toggleBtn, floatCtrlWrap.firstChild);
  }
});
