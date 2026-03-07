window.addEventListener('DOMContentLoaded', event => {

  // Navbar shrink function
  var navbarShrink = function () {
    const navbarCollapsible = document.body.querySelector('#mainNav');
    if (!navbarCollapsible) {
      return;
    }
    if (window.scrollY === 0) {
      navbarCollapsible.classList.remove('navbar-shrink')
    } else {
      navbarCollapsible.classList.add('navbar-shrink')
    }

  };

  // Shrink the navbar 
  navbarShrink();

  // Shrink the navbar when page is scrolled
  document.addEventListener('scroll', navbarShrink);

  // Activate Bootstrap scrollspy on the main nav element
  const mainNav = document.body.querySelector('#mainNav');
  if (mainNav) {
    new bootstrap.ScrollSpy(document.body, {
      target: '#mainNav',
      offset: 74,
    });
  };

  const blogNavLink = document.querySelector('#navbarResponsive .nav-link[data-section]');
  const blogSectionId = blogNavLink ? blogNavLink.getAttribute('data-section') : null;
  const blogSection = blogSectionId ? document.getElementById(blogSectionId) : null;
  if (blogNavLink && blogSection) {
    const blogObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        blogNavLink.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { threshold: 0.5 });
    blogObserver.observe(blogSection);
  }

  // Collapse responsive navbar when toggler is visible
  const navbarToggler = document.body.querySelector('.navbar-toggler');
  const responsiveNavItems = [].slice.call(
    document.querySelectorAll('#navbarResponsive .nav-link')
  );
  responsiveNavItems.map(function (responsiveNavItem) {
    responsiveNavItem.addEventListener('click', () => {
      if (window.getComputedStyle(navbarToggler).display !== 'none') {
        navbarToggler.click();
      }
    });
  });

});
///PLOAIE CU PUI
document.addEventListener("DOMContentLoaded", () => {
  const rainButton = document.getElementById("rain-button");

  rainButton.addEventListener("click", () => {
    const rainContainer = document.createElement("div");
    rainContainer.classList.add("chicken-rain");
    document.body.appendChild(rainContainer);

    for (let i = 0; i < 60; i++) {
      const chicken = document.createElement("div");
      chicken.classList.add("chicken");
      chicken.textContent = "🐥";
      chicken.style.left = `${Math.random() * 100}vw`;
      chicken.style.animationDuration = `${3 + Math.random() * 2}s`;
      chicken.style.animationDelay = `${Math.random()}s`;
      rainContainer.appendChild(chicken);
    }

    setTimeout(() => {
      rainContainer.remove();
    }, 8000);
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".carousel-slide");
  const btnLeft = document.querySelector(".carousel-btn.left");
  const btnRight = document.querySelector(".carousel-btn.right");
  const dots = document.querySelectorAll(".carousel-dots .dot");

  if (!slides.length || !btnLeft || !btnRight) return;

  let index = 0;

  function showSlide(i) {
    slides.forEach(slide =>
      slide.classList.remove("active", "prev", "next")
    );

    dots.forEach(dot => dot.classList.remove("active"));

    slides[i].classList.add("active");
    if (slides[i - 1]) slides[i - 1].classList.add("prev");
    if (slides[i + 1]) slides[i + 1].classList.add("next");

    if (dots[i]) dots[i].classList.add("active");
  }

  btnLeft.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
  });

  btnRight.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    showSlide(index);
  });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      index = i;
      showSlide(index);
    });
  });

  showSlide(index);
});



// --- Additional behaviors: autoplay carousel, disable portfolio modal links, animate on scroll ---
document.addEventListener('DOMContentLoaded', () => {
  // disable existing anchor modal triggers gracefully
  document.querySelectorAll('a.portfolio-link').forEach(a => {
    const href = a.getAttribute('href');
    const isPlaceholder = !href || href === '#' || href === '#!';
    a.addEventListener('click', (e) => {
      if (isPlaceholder) {
        e.preventDefault();
        a.classList.add('no-modal');
      }
    });
    // make placeholders tabbable/accessible if they weren't
    if (isPlaceholder) {
      a.setAttribute('role', 'button');
      a.setAttribute('tabindex', '0');
    }
  });

  // ensure portfolio-items animate on scroll
  document.querySelectorAll('.portfolio-item').forEach(item => item.classList.add('animate-on-scroll'));

  // IntersectionObserver to toggle in-view
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
      else if (!entry.target.classList.contains('keep-visible')) entry.target.classList.remove('in-view');
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => io.observe(el));

  // Blog carousel - Single slide with fancy transitions
  const carouselWrapper = document.querySelector('.carousel-wrapper');
  const track = document.querySelector('.carousel-track');
  const slides = track ? Array.from(track.querySelectorAll('.carousel-slide')) : [];
  const leftBtn = document.querySelector('.carousel-btn.left');
  const rightBtn = document.querySelector('.carousel-btn.right');
  const dots = Array.from(document.querySelectorAll('.carousel-dots .dot'));

  if (carouselWrapper && slides.length) {
    let currentIndex = 0;

    const updateCarousel = (direction = 'next') => {
      // Remove all classes
      slides.forEach(slide => {
        slide.classList.remove('active', 'prev', 'next');
      });

      // Set current slide as active
      slides[currentIndex].classList.add('active');

      // Set previous slide
      const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
      slides[prevIndex].classList.add('prev');

      // Set next slide
      const nextIndex = (currentIndex + 1) % slides.length;
      slides[nextIndex].classList.add('next');

      // Update dots
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    };

    leftBtn?.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateCarousel('prev');
    });

    rightBtn?.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateCarousel('next');
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        if (index !== currentIndex) {
          currentIndex = index;
          updateCarousel();
        }
      });
    });

    // Autoplay
    let autoplayTimer = setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      updateCarousel('next');
    }, 5000);

    carouselWrapper.addEventListener('mouseenter', () => {
      clearInterval(autoplayTimer);
    });

    carouselWrapper.addEventListener('mouseleave', () => {
      autoplayTimer = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateCarousel('next');
      }, 5000);
    });

    // Initialize
    updateCarousel();
  }
});
var navbarShrink = function () {
  const navbarCollapsible = document.body.querySelector('#mainNav');
  if (!navbarCollapsible) {
    return;
  }
  if (window.scrollY === 0) {
    navbarCollapsible.classList.remove('navbar-shrink')
  } else {
    navbarCollapsible.classList.add('navbar-shrink')
  }
};
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggle-section').forEach(button => {
    button.addEventListener('click', function () {
      const targetSelector = this.getAttribute('data-target');
      const target = document.querySelector(targetSelector);
      const icon = document.querySelector(`.card-header[data-target='${targetSelector}'] .toggle-icon`);

      if (!target) return;

      const isVisible = window.getComputedStyle(target).display !== 'none';

      if (isVisible) {
        target.style.transition = 'opacity 0.4s ease, height 0.4s ease';
        target.style.opacity = '0';
        target.style.height = '0';
        if (icon) icon.classList.remove('fa-chevron-up'), icon.classList.add('fa-chevron-down');
        setTimeout(() => {
          target.style.display = 'none';
          target.style.height = '';
        }, 400);
      } else {
        target.style.display = 'block';
        const fullHeight = target.scrollHeight + 'px';
        target.style.height = '0';
        target.style.opacity = '0';
        if (icon) icon.classList.remove('fa-chevron-down'), icon.classList.add('fa-chevron-up');
        setTimeout(() => {
          target.style.transition = 'opacity 0.4s ease, height 0.4s ease';
          target.style.height = fullHeight;
          target.style.opacity = '1';
        }, 10);
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const mainNav = document.getElementById('mainNav');
  const toggle = document.getElementById('morphMenuToggle');
  const menuPanel = document.getElementById('navbarResponsive');

  if (!mainNav || !toggle || !menuPanel) {
    return;
  }

  const closeMenu = () => {
    mainNav.classList.remove('menu-open');
    document.body.classList.remove('morph-menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    mainNav.classList.add('menu-open');
    document.body.classList.add('morph-menu-open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    const isOpen = mainNav.classList.contains('menu-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('click', (event) => {
    if (!mainNav.classList.contains('menu-open')) {
      return;
    }

    if (mainNav.contains(event.target)) {
      return;
    }

    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (mainNav.classList.contains('menu-open')) {
      closeMenu();
    }
  });

  window.addEventListener('scroll', () => {
    if (mainNav.classList.contains('menu-open')) {
      closeMenu();
    }
  }, { passive: true });

  menuPanel.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('header.masthead.has-video');

  if (!hero) {
    return;
  }

  let rafId = 0;
  let introUnlocked = true;

  // Interpolation state
  let targetIntroProgress = 0;
  let currentIntroProgress = 0;
  let targetHeroProgress = 0;
  let currentHeroProgress = 0;

  let touchStartY = null;
  let scrollStarted = false;
  let lockScrollTicking = false;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const root = document.documentElement;
  const hasNonTopHash = !!window.location.hash && window.location.hash !== '#page-top';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canUseIntroLock = !hasNonTopHash && !prefersReducedMotion;

  // Hysteresis thresholds to prevent CTA flicker around top boundary.
  const LOCKED_SHOW_THRESHOLD = 0.16;
  const LOCKED_HIDE_THRESHOLD = 0.09;
  const UNLOCKED_SHOW_THRESHOLD_PX = 56;
  const UNLOCKED_HIDE_THRESHOLD_PX = 28;

  const setCssVars = (heroProgress, handwriteProgress) => {
    const safeHeroProgress = clamp(heroProgress, 0, 1);
    const safeHandwrite = clamp(handwriteProgress, 0, 1);
    const heroScale = 1 - safeHeroProgress * 0.22;
    const heroRadius = safeHeroProgress * 34;
    const heroOpacity = 1 - safeHeroProgress * 0.58;

    root.style.setProperty('--hero-shrink', heroScale.toFixed(4));
    root.style.setProperty('--hero-radius', `${heroRadius.toFixed(2)}px`);
    root.style.setProperty('--hero-opacity', heroOpacity.toFixed(4));
    root.style.setProperty('--handwrite-progress', safeHandwrite.toFixed(4));
  };

  const setScrollStarted = (started) => {
    if (scrollStarted === started) {
      return;
    }

    scrollStarted = started;
    document.body.classList.toggle('intro-scroll-started', started);
  };

  document.body.classList.remove('intro-writing-complete');
  document.body.classList.remove('intro-scroll-started');

  // Lock only on fresh home entry. If user opens with a hash, start unlocked.
  if (canUseIntroLock && window.scrollY <= 0) {
    introUnlocked = false;
    targetIntroProgress = 0;
    currentIntroProgress = 0;
    document.body.classList.add('intro-locked');
    document.body.classList.remove('intro-writing-complete');
  } else {
    introUnlocked = true;
    document.body.classList.remove('intro-locked');
    document.body.classList.add('intro-writing-complete');

    const y = window.scrollY || window.pageYOffset;
    const heroProgress = clamp(y / (window.innerHeight * 0.85), 0, 1);
    const handwritingProgress = clamp((heroProgress - 0.04) / 0.86, 0, 1);

    targetHeroProgress = heroProgress;
    currentHeroProgress = heroProgress;

    setCssVars(heroProgress, handwritingProgress);
    setScrollStarted(y > UNLOCKED_SHOW_THRESHOLD_PX);
  }

  const unlockIntro = () => {
    if (introUnlocked) {
      return;
    }

    introUnlocked = true;
    document.body.classList.remove('intro-locked');
    document.body.classList.add('intro-writing-complete');
    setScrollStarted(true);
  };

  const applyIntroFrame = () => {
    const lerp = (start, end, amt) => start + (end - start) * amt;
    const SMOOTHING = 0.12; // Easing factor

    if (introUnlocked) {
      const y = window.scrollY || window.pageYOffset;
      targetHeroProgress = clamp(y / (window.innerHeight * 0.85), 0, 1);

      // Interpolate
      currentHeroProgress = lerp(currentHeroProgress, targetHeroProgress, SMOOTHING);

      const handwritingProgress = clamp((currentHeroProgress - 0.04) / 0.86, 0, 1);
      setCssVars(currentHeroProgress, handwritingProgress);

      if (!scrollStarted && y >= UNLOCKED_SHOW_THRESHOLD_PX) {
        setScrollStarted(true);
      } else if (scrollStarted && y <= UNLOCKED_HIDE_THRESHOLD_PX) {
        setScrollStarted(false);
      }

      // Continue animation if we haven't reached target yet
      if (Math.abs(currentHeroProgress - targetHeroProgress) > 0.0001) {
        rafId = window.requestAnimationFrame(applyIntroFrame);
      } else {
        rafId = 0;
      }
      return;
    }

    // While intro is locked, handwriting drives most of the scene and video shrink remains subtle.
    currentIntroProgress = lerp(currentIntroProgress, targetIntroProgress, SMOOTHING);
    setCssVars(currentIntroProgress * 0.32, currentIntroProgress);

    if (!scrollStarted && currentIntroProgress >= LOCKED_SHOW_THRESHOLD) {
      setScrollStarted(true);
    } else if (scrollStarted && currentIntroProgress <= LOCKED_HIDE_THRESHOLD) {
      setScrollStarted(false);
    }

    if (currentIntroProgress >= 0.995 && targetIntroProgress >= 0.995) {
      unlockIntro();
    }

    // Continue animation if we haven't reached target yet
    if (Math.abs(currentIntroProgress - targetIntroProgress) > 0.0001) {
      rafId = window.requestAnimationFrame(applyIntroFrame);
    } else {
      rafId = 0;
    }
  };

  const requestFrame = () => {
    if (rafId) {
      return;
    }

    rafId = window.requestAnimationFrame(applyIntroFrame);
  };

  const nudgeProgress = (deltaY) => {
    if (introUnlocked) {
      return;
    }

    const delta = Number.isFinite(deltaY) ? deltaY : 0;
    if (delta === 0) {
      return;
    }

    // Smoother increments to target
    if (delta > 0) {
      const step = Math.min(Math.abs(delta) / 800, 0.12);
      targetIntroProgress = clamp(targetIntroProgress + step, 0, 1);
    } else {
      const step = Math.min(Math.abs(delta) / 1500, 0.06);
      targetIntroProgress = clamp(targetIntroProgress - step, 0, 1);
    }

    requestFrame();
  };

  const onWheel = (event) => {
    if (introUnlocked) {
      return;
    }

    event.preventDefault();
    nudgeProgress(event.deltaY);
  };

  const onScroll = () => {
    const y = window.scrollY || window.pageYOffset;

    // Keep viewport parked during locked intro without repeated forced scroll jumps.
    if (!introUnlocked) {
      if (y > 0 && !lockScrollTicking) {
        lockScrollTicking = true;
        window.requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          lockScrollTicking = false;
        });
      }
      return;
    }

    requestFrame();
  };

  const onTouchStart = (event) => {
    if (introUnlocked) {
      return;
    }

    if (event.touches && event.touches.length > 0) {
      touchStartY = event.touches[0].clientY;
    }
  };

  const onTouchMove = (event) => {
    if (introUnlocked) {
      return;
    }

    if (!event.touches || event.touches.length === 0 || touchStartY === null) {
      return;
    }

    event.preventDefault();
    const currentY = event.touches[0].clientY;
    const delta = touchStartY - currentY;
    touchStartY = currentY;
    nudgeProgress(delta);
  };

  const onTouchEnd = () => {
    touchStartY = null;
  };

  const onKeyDown = (event) => {
    if (introUnlocked) {
      return;
    }

    const key = event.key;
    const downKeys = ['ArrowDown', 'PageDown', ' ', 'Spacebar'];
    const upKeys = ['ArrowUp', 'PageUp'];

    if (downKeys.includes(key)) {
      event.preventDefault();
      nudgeProgress(260);
      return;
    }

    if (upKeys.includes(key)) {
      event.preventDefault();
      nudgeProgress(-160);
    }
  };

  if (canUseIntroLock) {
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', requestFrame);

  requestFrame();
});

// ===== AUTHENTIC ISO-CONTOUR TOPOGRAPHIC BACKGROUND (MARCHING SQUARES) =====
class TopographicBackground {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'topo-bg';
    this.ctx = this.canvas.getContext('2d');

    this.offset = 0;
    this.speed = 0.0006; // Slower, more elegant movement
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.targetMouseX = 0.5;
    this.targetMouseY = 0.5;

    // Resolution of the grid for Marching Squares
    this.res = 20;

    document.body.prepend(this.canvas);
    this.resize();

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = e.clientX / window.innerWidth;
      this.targetMouseY = e.clientY / window.innerHeight;
    });

    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.cols = Math.ceil(this.canvas.width / this.res) + 1;
    this.rows = Math.ceil(this.canvas.height / this.res) + 1;
  }

  // Value function for height map - SIGNIFICANTLY LOWER FREQUENCY for bold shapes
  val(x, y) {
    const time = this.offset;
    // Lower frequency values for larger, smoother organic shapes
    let h = Math.sin(x * 0.0008 + time) * 60 +
      Math.sin(y * 0.0006 - time * 0.4) * 50 +
      Math.sin((x + y) * 0.0004 + time * 0.2) * 40;

    // Smoother mouse influence
    const dx = x - (this.mouseX * this.canvas.width);
    const dy = y - (this.mouseY * this.canvas.height);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const mouseInfl = Math.exp(-dist / 300) * 150;

    return h + mouseInfl;
  }

  drawContour(threshold) {
    const ctx = this.ctx;
    const res = this.res;

    ctx.beginPath();
    // Bolder pink with higher opacity for premium look
    const alpha = 0.08 + (Math.abs(threshold) / 150) * 0.15;
    ctx.strokeStyle = `rgba(249, 5, 108, ${alpha.toFixed(3)})`;
    ctx.lineWidth = 1.8 + (Math.abs(threshold) / 80);

    for (let i = 0; i < this.cols - 1; i++) {
      for (let j = 0; j < this.rows - 1; j++) {
        const x = i * res;
        const y = j * res;

        // Grid points values
        const v1 = this.val(x, y);
        const v2 = this.val(x + res, y);
        const v3 = this.val(x + res, y + res);
        const v4 = this.val(x, y + res);

        // Calculate binary state for this cell
        let state = 0;
        if (v1 > threshold) state += 8;
        if (v2 > threshold) state += 4;
        if (v3 > threshold) state += 2;
        if (v4 > threshold) state += 1;

        // Linear interpolation points
        const lerpVal = (a, b) => (threshold - a) / (b - a);

        const pA = { x: x + res * lerpVal(v1, v2), y: y };
        const pB = { x: x + res, y: y + res * lerpVal(v2, v3) };
        const pC = { x: x + res * lerpVal(v4, v3), y: y + res };
        const pD = { x: x, y: y + res * lerpVal(v1, v4) };

        // Draw line segment based on cell state
        switch (state) {
          case 1: case 14: ctx.moveTo(pC.x, pC.y); ctx.lineTo(pD.x, pD.y); break;
          case 2: case 13: ctx.moveTo(pB.x, pB.y); ctx.lineTo(pC.x, pC.y); break;
          case 3: case 12: ctx.moveTo(pB.x, pB.y); ctx.lineTo(pD.x, pD.y); break;
          case 4: case 11: ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); break;
          case 5: ctx.moveTo(pA.x, pA.y); ctx.lineTo(pD.x, pD.y); ctx.moveTo(pB.x, pB.y); ctx.lineTo(pC.x, pC.y); break;
          case 6: case 9: ctx.moveTo(pA.x, pA.y); ctx.lineTo(pC.x, pC.y); break;
          case 7: case 8: ctx.moveTo(pA.x, pA.y); ctx.lineTo(pD.x, pD.y); break;
          case 10: ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.moveTo(pC.x, pC.y); ctx.lineTo(pD.x, pD.y); break;
        }
      }
    }
    ctx.stroke();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.offset += this.speed;

    // Smooth mouse follow
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    // Draw contour levels - Spaced out for clarity
    for (let level = -120; level <= 120; level += 40) {
      this.drawContour(level);
    }

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // CSS topo background is always active. Canvas version stays opt-in because it is GPU/CPU heavy.
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canUseHeavyCanvas = document.body.classList.contains('topo-canvas-enhanced');
  if (prefersReduced || !canUseHeavyCanvas) {
    return;
  }

  new TopographicBackground();
});

const generateCard = (id, title, descriere, imagine, type = 'metul') => `
  <div class="card mb-4 shadow border-0 hover-effect card-glow">
    <div class="card-header bg-pink-glow text-white d-flex justify-content-between align-items-center rounded-top py-3 px-4 toggle-section" data-target="#${type}${id}">
      <span class="fw-bold fs-5">${title}</span>
      <i class="fas fa-chevron-down toggle-icon"></i>
    </div>
    <div id="${type}${id}" class="collapsible-content" style="display: none;">
      <div class="card-body p-4 bg-pink-light rounded-bottom text-center">
        <img src="${imagine}" class="img-fluid rounded mb-3 shadow-sm" alt="${title} image">
        <p class="text-roz fs-6 fw-bold">${descriere}</p>
        <div class="text-end">
          <button class="btn btn-outline-light btn-sm toggle-section" data-target="#${type}${id}">
            <i class="fas fa-chevron-up"></i> Reducere
          </button>
        </div>
      </div>
    </div>
  </div>
`;


const meturiContainer = document.getElementById('meturiAccordion');
const activitatiContainer = document.getElementById('activitatiAccordion');

const meturi = [
  {
    titlu: "Piatra Neamț ~ 21 decembrie",
    descriere: "Primul meet din sezonul 9, Xmas Robo Stone , ne-a arătat atât punctele forte, cât și minusurile echipei. Am câștigat două meciuri, începând și terminând cu victorie. Meet-ul de la Piatra Neamț a fost important nu doar competițional, dar și moral, iar, deși am avut înfrângeri, am continuat să ne încurajăm reciproc, demonstrând că suntem o echipă unită.",
    imagine: "assets/meet11.jpg"
  },
  {
    titlu: "Suceava ~ 4 ianuarie",
    descriere: "La meet-ul Frozen Depths, am susținut evenimentul prin aportul logistic, aducând un teren de antrenament și sample-uri. În timpul competiției, am înregistrat un progres semnificativ, câștigând 4 meciuri. La final, am fost recunoscuți pentru designul inovativ al robotului nostru.",
    imagine: "assets/meet2.jpg"
  },
  {
    titlu: "Iaşi ~ 11 ianuarie ",
    descriere: "La “League Meet of Iași”, după primul meci, robotul s-a defectat din cauza unui bug al Control Hub-ului, care a șters configurația. Rescrierea acesteia a durat două ore, timp în care am realizat reverse engineering pentru a ajunge la setările inițiale. Acest proces ne-a costat 3 meciuri, dar ne-a învățat importanța backup-ului. În pauza de masă, am reparat robotul și am câștigat ultimele două meciuri. Mentorii Ionuț Boicu și Ionuț Toma ne-au ghidat și ajutat să rezolvăm problemele tehnice și să colaborăm mai eficient",
    imagine: "assets/meet3.jpg"
  },
  {
    titlu: "Regionala",
    descriere: "Am lucrat împreună pentru a ne susține ideile și pentru a integra contribuțiile fiecărui membru.",
    imagine: "assets/img/colaborare.jpg"
  }
];

const activitati = [
  {
    titlu: "Târgul Educațional 11-12 aprilie",
    descriere: "Am participat la a XXV-a ediție a Târgului Educațional organizat de CJRAE Vaslui, unde am reprezentat Liceul Teoretic “Emil Racoviță” și echipa roLERbot, promovând oferta educațională, robotul și competiția FIRST Tech Challenge. Prezența noastră a consolidat legătura cu comunitatea educațională locală și a inspirat alți tineri să urmeze calea tehnologiei și inovației. Pentru mulți membri și alumni, întâlnirea cu echipa la târg a fost decisivă în alegerea liceului și implicarea în proiect. Ne mândrim să fim ambasadori ai educației STEAM și ai programului FIRST, contribuind la formarea noii generații de lideri și inovatori.",
    imagine: "assets/ac1.jpg"
  },
  {
    titlu: "Ziua Mondială a Educației 5 Octombrie",
    descriere: "Cu ocazia Zilei Mondiale a Educației, am participat la „Sesiunea județeană de comunicări științifice, metodice și culturale”, organizată în parteneriat cu Casa Corpului Didactic Vaslui. Ca ambasadori FIRST, am prezentat activitatea din Sezonul FIRST Tech Challenge 2023-2024, inspirând tinerii să exploreze domeniul STEAM și să își dezvolte abilitățile prin experiențe practice.",
    imagine: "assets/ac2.jpg"
  },
  {
    titlu: "Gala Tânărului Vasluian",
    descriere: "Echipa roLERbot a fost premiată la Gala Tânărului Vasluian la categoria Implicare și Solidaritate, un premiu acordat inițiativelor care promovează schimbarea și acțiunea. Gala, organizată de Federația Tinerilor din Vaslui, Vaslui Capitala Tineretului și Primăria Vaslui, a recunoscut eforturile noastre de a aduce educația STEAM mai aproape de comunitate și de a inspira tinerii să își urmeze pasiunile.",
    imagine: "assets/ac3.jpg"
  },
  {
    titlu: "Târgul de hobby-uri ",
    descriere: "Pe 13 și 14 decembrie, am participat cu entuziasm la târgul de hobby-uri pentru a arăta vizitatorilor că robotica nu înseamnă doar asamblarea unor piese sau scrierea de cod. Pentru noi, robotica este o combinație între tehnic și non-tehnic, funcțional și estetic, precum și între colaborare și perseverență. Fiecare piesă montată și fiecare linie de cod scrisă prind viață datorită pasiunii și dedicației echipei noastre.",
    imagine: "assets/ac4.png"
  },
  {
    titlu: "Proiectul Puiu:Eco-Clean",
    descriere: "Am editat materialul video filmat pentru a-l transforma într-un produs final clar și dinamic.",
    imagine: "assets/img/editare.jpg"
  },
  {
    titlu: "Print(re) elevi",
    descriere: "Am pregătit o prezentare convingătoare pentru a transmite clar mesajul proiectului nostru.",
    imagine: "assets/img/prezentare.jpg"
  }
];
const meturi2025 = [
  {
    titlu: "Braila ~ 13 ianuarie",
    descriere: "Echipa roLERbot a participat la primul FTC Meet al anului cu un robot a cărui construcție inițială avea probleme: brațul și barele erau prea înalte, cleștele nu prindea decât câte un pixel, iar codul avea dificultăți. Deși nu am obținut victorii, experiența ne-a permis să învățăm din greșeli și să demarăm o etapă de îmbunătățiri hardware și software pentru robotul nostru, Puiu.",
    imagine: "assets/meet2025_1.jpg"
  },
  {
    titlu: "Focsani ~ 27 ianuarie",
    descriere: "La al doilea eveniment FTC am observat o îmbunătățire semnificativă a performanței robotului și a clasamentului. Deși primul meci a fost dificil, am reușit să ne mobilizăm și să prevenim dărâmarea pixelilor în meciurile următoare. Am primit sprijin de la echipele Helix și RoSophia, atât la software, cât și la hardware. Atmosfera prietenoasă a permis legarea de noi prietenii, iar efortul depus a condus la prima noastră victorie, reflectând progresul întregii echipe.",
    imagine: "assets/meet2025_2.jpg"
  },
  {
    titlu: "Iasi ~ 3 februarie",
    descriere: "Primul meci a adus emoții și provocări tehnice, Puiu reușind prima agățare, însă lopata s-a rupt și a fost înlocuită rapid. La a doua întrecere, cârligul robotului a cedat, dar două victorii consecutive ne-au readus optimismul. Am încheiat competiția cu determinare, beneficiind de sprijinul unui coechipier aflat în primul an de facultate, ale cărui sfaturi la cod și hardware au fost neprețuite. Spiritul de echipă s-a văzut când membrii au încurajat colegii printr-un imn special, dezvoltat de Șerban, Rareș și Ionuț.",
    imagine: "assets/meet2025_2.jpg"
  }
];

const activitati2025 = [
  {
    titlu: "Evenimente FTC și Halloween",
    descriere: "Echipa a luat parte la activități comunitare și competiții organizate de alte echipe, inclusiv evenimente tematice precum Halloween, adaptând robotul la atmosfera sărbătorii. Scopul a fost socializarea, învățarea și distracția.",
    imagine: "assets/ac2025_1.jpg"
  },
  {
    titlu: "Cursuri Java",
    descriere: "Ionuț și Alin au organizat sesiuni de instruire pentru a-i familiariza pe noii membri cu limbajul Java, structura codului și logica acțiunilor robotului. Obiectivul a fost educativ, de dezvoltare a competențelor tehnice ale membrilor echipei.",
    imagine: "assets/ac2025_2.jpg"
  },
  {
    titlu: "Ziua Femeilor în Știință",
    descriere: "Echipa a marcat contribuția fetelor în știință și tehnologie, promovând diversitatea și aprecierea implicării lor.",
    imagine: "assets/ac2025_1.jpg"
  },
  {
    titlu: "Prezentări în școli",
    descriere: "Echipa a vizitat mai multe școli pentru a demonstra capabilitățile robotului și a împărtăși pasiunea pentru robotică. Activitatea a avut rol educativ și inspirațional, stimulând interesul tinerilor pentru tehnologie.",
    imagine: "assets/ac2025_2.jpg"
  }
];

meturi.forEach((met, index) => {
  meturiContainer.innerHTML += generateCard(index, met.titlu, met.descriere, met.imagine);
});


activitati.forEach((act, index) => {
  activitatiContainer.innerHTML += generateCard(index, act.titlu, act.descriere, act.imagine, 'activitate');
});
const meturiContainer2025 = document.getElementById('meturiAccordion2025');
const activitatiContainer2025 = document.getElementById('activitatiAccordion2025');

if (meturiContainer2025 && activitatiContainer2025) {
  meturi2025.forEach((met, index) => {
    meturiContainer2025.innerHTML += generateCard("2025_" + index, met.titlu, met.descriere, met.imagine);
  });

  activitati2025.forEach((act, index) => {
    activitatiContainer2025.innerHTML += generateCard("2025_" + index, act.titlu, act.descriere, act.imagine, 'activitate');
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".portfolio-item");

  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = [...items].indexOf(entry.target);
          entry.target.style.transitionDelay = `${index * 150}ms`;
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach(item => observer.observe(item));
});
const items = document.querySelectorAll(".portfolio-item");

function revealSponsors() {
  items.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      setTimeout(() => {
        item.classList.add("show");
      }, index * 150);
    }
  });
}

window.addEventListener("scroll", revealSponsors);
revealSponsors(); // ruleaza si la load
document.querySelectorAll('.toggle-section').forEach(button => {
  button.addEventListener('click', () => {
    const target = document.querySelector(button.dataset.target);
    if (!target) return;
    target.classList.toggle('open');
  });
});

// ===== DINO GAME SIMPLE =====

// FTC Teams Database
const ftcTeams = [
  { number: 19066, name: "AiCitizens" },
  { number: 21028, name: "The Eagles RO143" },
  { number: 19061, name: "Boogeybots" },
  { number: 15996, name: "BrickBot" },
  { number: 19139, name: "SnakeTech" },
  { number: 22998, name: "CYB3RG0DS" },
  { number: 21031, name: "roLERbot" },
  { number: 23161, name: "CyberLIS76" },
  { number: 24928, name: "HYPERION" },
  { number: 19097, name: "Quasar.Robotics" },
  { number: 22017, name: "Eu codez" },
  { number: 19071, name: "SmartCluster" },
  { number: 19044, name: "Peppers" },
  { number: 17871, name: "Thobor" },
  { number: 19043, name: "CyLiis" },
  { number: 20954, name: "STIM DC" },
  { number: 19053, name: "Homosapiens" },
  { number: 22590, name: "MechaByte" },
  { number: 22697, name: "CreativityR" },
  { number: 24308, name: "BrightCluster" },
  { number: 19211, name: "Virtual Wolves" },
  { number: 21097, name: "Dragonfly" },
  { number: 19065, name: "Inorog Team RO 152" },
  { number: 32762, name: "NightWings" },
  { number: 23800, name: "Robozzi" },
  { number: 23576, name: "ORION" },
  { number: 24554, name: "AVOCADO ROBOTICS" },
  { number: 19087, name: "MironoBot" },
  { number: 19147, name: "Blizzard Eye" },
  { number: 27660, name: "R0b0Ryders" },
  { number: 32838, name: "CEMEKANIKS25" },
  { number: 32442, name: "Iron Minds LTTC" }
];

let dinoGameState = {
  running: false,
  started: false,
  score: 0,
  bestScore: parseInt(localStorage.getItem('dino_best')) || 0,
  speed: 5,
  jumping: false,
  jumpVel: 0,
  jumpHeight: 0,
  selectedTeam: JSON.parse(localStorage.getItem('dino_selected_team')) || ftcTeams.find(t => t.number === 21031)
};

// Game elements
let dinoElements = null;

function initDinoGame() {
  if (dinoElements) return;
  const container = document.getElementById('dino-game-container');
  if (!container) return;

  dinoElements = {
    container,
    dino: document.getElementById('dino'),
    obstacle: document.getElementById('obstacle'),
    score: document.getElementById('game-score'),
    best: document.getElementById('best-score'),
    speed: document.getElementById('game-speed'),
    status: document.getElementById('game-status'),
    notStarted: document.getElementById('game-not-started'),
    finalScore: document.getElementById('final-score-val'),
    btn: document.getElementById('start-btn'),
    teamSelect: document.getElementById('team-select'),
    selectedTeamDisplay: document.getElementById('selected-team')
  };

  if (dinoElements.best) {
    dinoElements.best.textContent = dinoGameState.bestScore;
  }

  // Populate team selector
  if (dinoElements.teamSelect) {
    ftcTeams.forEach(team => {
      const option = document.createElement('option');
      option.value = team.number;
      option.textContent = `#${team.number} - ${team.name}`;
      if (dinoGameState.selectedTeam && team.number === dinoGameState.selectedTeam.number) {
        option.selected = true;
      }
      dinoElements.teamSelect.appendChild(option);
    });

    dinoElements.teamSelect.addEventListener('change', (e) => {
      const teamNumber = parseInt(e.target.value);
      dinoGameState.selectedTeam = ftcTeams.find(t => t.number === teamNumber);
      localStorage.setItem('dino_selected_team', JSON.stringify(dinoGameState.selectedTeam));
      updateSelectedTeamDisplay();
    });
  }

  updateSelectedTeamDisplay();
}

function updateSelectedTeamDisplay() {
  if (dinoElements.selectedTeamDisplay && dinoGameState.selectedTeam) {
    dinoElements.selectedTeamDisplay.textContent = `Playing as: #${dinoGameState.selectedTeam.number} - ${dinoGameState.selectedTeam.name}`;
  }
}

// Call init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDinoGame);
} else {
  initDinoGame();
}

window.startGame = function () {
  initDinoGame();
  if (!dinoElements || !dinoElements.container) return;

  if (dinoGameState.started) return;

  dinoGameState.started = true;
  dinoGameState.running = true;
  dinoGameState.score = 0;
  dinoGameState.speed = 5;
  dinoGameState.jumping = false;
  dinoGameState.jumpVel = 0;
  dinoGameState.jumpHeight = 0;

  dinoElements.score.textContent = '0';
  dinoElements.btn.style.opacity = '0.5';
  dinoElements.notStarted.style.display = 'none';
  dinoElements.status.style.display = 'none';
  dinoElements.dino.style.bottom = '110px';
  dinoElements.obstacle.style.right = '-60px';

  updateDinoSpeed();
  dinoGameLoop();
};

window.resetGame = function () {
  if (!dinoElements || !dinoElements.container) return;
  dinoGameState.started = false;
  dinoGameState.running = false;
  dinoGameState.score = 0;
  dinoGameState.speed = 5;
  dinoGameState.jumping = false;
  dinoGameState.jumpVel = 0;
  dinoGameState.jumpHeight = 0;

  dinoElements.score.textContent = '0';
  dinoElements.btn.style.opacity = '1';
  dinoElements.notStarted.style.display = 'block';
  dinoElements.status.style.display = 'none';
  dinoElements.dino.style.bottom = '110px';
  dinoElements.obstacle.style.right = '-60px';

  updateDinoSpeed();
};

function updateDinoSpeed() {
  const mult = (1 + (dinoGameState.speed - 5) / 10).toFixed(1);
  dinoElements.speed.textContent = mult + 'x';
}

function dinoJump() {
  if (!dinoGameState.jumping && dinoGameState.running) {
    dinoGameState.jumping = true;
    dinoGameState.jumpVel = 15;
  }
}

function dinoGameLoop() {
  if (!dinoGameState.running) return;

  // Jump
  if (dinoGameState.jumping) {
    dinoGameState.jumpVel -= 0.6;
    dinoGameState.jumpHeight -= dinoGameState.jumpVel;

    if (dinoGameState.jumpHeight <= 0) {
      dinoGameState.jumpHeight = 0;
      dinoGameState.jumping = false;
      dinoGameState.jumpVel = 0;
    }

    dinoElements.dino.style.bottom = (110 + dinoGameState.jumpHeight) + 'px';
  }

  // Move obstacle
  let obsRight = parseInt(dinoElements.obstacle.style.right) || 0;
  obsRight -= dinoGameState.speed;
  dinoElements.obstacle.style.right = obsRight + 'px';

  // Check if passed obstacle
  if (obsRight < -100) {
    obsRight = 0;
    dinoGameState.score++;
    dinoGameState.speed = Math.min(dinoGameState.speed + 0.3, 12);
    dinoElements.score.textContent = dinoGameState.score;
    updateDinoSpeed();
  }

  // Collision check
  const containerRect = dinoElements.container.getBoundingClientRect();
  const dinoRect = dinoElements.dino.getBoundingClientRect();
  const obsRect = dinoElements.obstacle.getBoundingClientRect();

  const dinoX = dinoRect.left - containerRect.left;
  const dinoY = dinoRect.top - containerRect.top;
  const obsX = obsRect.left - containerRect.left;
  const obsY = obsRect.top - containerRect.top;

  const pad = 8;

  if (dinoX + dinoRect.width - pad > obsX + pad &&
    dinoX + pad < obsX + obsRect.width - pad &&
    dinoY + dinoRect.height - pad > obsY + pad &&
    dinoY + pad < obsY + obsRect.height - pad) {
    // Collision
    dinoGameState.running = false;

    if (dinoGameState.score > dinoGameState.bestScore) {
      dinoGameState.bestScore = dinoGameState.score;
      localStorage.setItem('dino_best', dinoGameState.bestScore);
      dinoElements.best.textContent = dinoGameState.bestScore;
    }

    dinoElements.finalScore.textContent = dinoGameState.score;
    dinoElements.status.style.display = 'block';
    dinoElements.btn.style.opacity = '1';
    return;
  }

  requestAnimationFrame(dinoGameLoop);
}

// Keyboard controls
document.addEventListener('keydown', function (e) {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!dinoGameState.running && !dinoGameState.started) {
      window.startGame();
    } else if (dinoGameState.running) {
      dinoJump();
    }
  }
});

// Click controls
document.addEventListener('click', function (e) {
  const container = document.getElementById('dino-game-container');
  if (container && container.contains(e.target)) {
    if (!dinoGameState.running && !dinoGameState.started) {
      window.startGame();
    } else if (dinoGameState.running) {
      dinoJump();
    }
  }
});

// Team Carousel Functionality - 3 cards visible (center + 2 side cards)
let currentSlide = 0;

// Date despre membri
const teamMembers = [
  { id: 1, image: "assets/img/team/member1.jpg", name: "Nume Prenume", dept: "Departamentul Programare" },
  { id: 2, image: "assets/img/team/member2.jpg", name: "Nume Prenume", dept: "Departamentul Design" },
  { id: 3, image: "assets/img/team/member3.jpg", name: "Nume Prenume", dept: "Departamentul Hardware" },
  { id: 4, image: "assets/img/team/member4.jpg", name: "Nume Prenume", dept: "Departamentul Marketing" },
  { id: 5, image: "assets/img/team/member5.jpg", name: "Nume Prenume", dept: "Departamentul Mecanic" },
  { id: 6, image: "assets/img/team/member6.jpg", name: "Nume Prenume", dept: "Departamentul Programare" },
  { id: 7, image: "assets/img/team/member7.jpg", name: "Nume Prenume", dept: "Departamentul Logistică" },
  { id: 8, image: "assets/img/team/member8.jpg", name: "Nume Prenume", dept: "Departamentul Business" }
];
const totalSlides = teamMembers.length;

function getCardIndex(offset) {
  let index = currentSlide + offset;
  if (index < 0) index = totalSlides + index;
  if (index >= totalSlides) index = index - totalSlides;
  return index;
}

function updateCarousel() {
  const containers = document.querySelectorAll('.team-carousel-container');
  containers.forEach(container => {
    // Calculăm indicii pentru cele 3 carduri vizibile
    const leftIndex = getCardIndex(-1);
    const centerIndex = currentSlide;
    const rightIndex = getCardIndex(1);

    // Găsim cardurile în containerul curent
    const leftCard = container.querySelector('.left-card');
    const centerCard = container.querySelector('.center-card');
    const rightCard = container.querySelector('.right-card');

    if (leftCard && centerCard && rightCard) {
      // Actualizăm cardul din stânga
      const leftMember = teamMembers[leftIndex];
      leftCard.setAttribute('data-member', leftMember.id);
      const leftImg = leftCard.querySelector('.member-photo');
      const leftName = leftCard.querySelector('.member-name');
      const leftDept = leftCard.querySelector('.member-department');

      if (leftImg) {
        leftImg.src = leftMember.image;
        leftImg.alt = `Membru ${leftMember.id}`;
      }
      if (leftName) leftName.textContent = leftMember.name;
      if (leftDept) leftDept.textContent = leftMember.dept;

      // Actualizăm cardul central
      const centerMember = teamMembers[centerIndex];
      centerCard.setAttribute('data-member', centerMember.id);
      const centerImg = centerCard.querySelector('.member-photo');
      const centerName = centerCard.querySelector('.member-name');
      const centerDept = centerCard.querySelector('.member-department');

      if (centerImg) {
        centerImg.src = centerMember.image;
        centerImg.alt = `Membru ${centerMember.id}`;
      }
      if (centerName) centerName.textContent = centerMember.name;
      if (centerDept) centerDept.textContent = centerMember.dept;

      // Actualizăm cardul din dreapta
      const rightMember = teamMembers[rightIndex];
      rightCard.setAttribute('data-member', rightMember.id);
      const rightImg = rightCard.querySelector('.member-photo');
      const rightName = rightCard.querySelector('.member-name');
      const rightDept = rightCard.querySelector('.member-department');

      if (rightImg) {
        rightImg.src = rightMember.image;
        rightImg.alt = `Membru ${rightMember.id}`;
      }
      if (rightName) rightName.textContent = rightMember.name;
      if (rightDept) rightDept.textContent = rightMember.dept;
    } else {
      // Fallback pentru layouturi fără 3 carduri dedicate
      const cards = Array.from(container.querySelectorAll('.team-card'));
      cards.forEach((card, idx) => {
        const isActive = idx === currentSlide;
        card.classList.toggle('active', isActive);
        card.style.display = isActive ? '' : 'none';
      });
    }

    // Actualizăm descrierile și indicatorii în aceeași secțiune
    const section = container.closest('.team-members-section');
    const descriptions = section ? section.querySelectorAll('.description-content') : [];
    descriptions.forEach((desc, index) => {
      desc.classList.toggle('active', index === currentSlide);
    });

    const indicators = section ? section.querySelectorAll('.indicator') : [];
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === currentSlide);
    });
  });
}

// Facem funcțiile accesibile global pentru onclick handlers
window.changeSlide = function (direction) {
  currentSlide += direction;

  if (currentSlide < 0) {
    currentSlide = totalSlides - 1;
  } else if (currentSlide >= totalSlides) {
    currentSlide = 0;
  }

  updateCarousel();
};

window.goToSlide = function (slideIndex) {
  currentSlide = slideIndex;
  updateCarousel();
};

// Auto-advance carousel
let autoSlideInterval;

function startAutoSlide() {
  autoSlideInterval = setInterval(() => {
    window.changeSlide(1);
  }, 5000);
}

function stopAutoSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
}

// Inițializare la încărcarea paginii
document.addEventListener('DOMContentLoaded', function () {
  const carouselContainer = document.querySelector('.team-carousel-container');
  const descriptionBox = document.querySelector('.member-description-box');

  // Inițializare carousel
  updateCarousel();
  startAutoSlide();

  // Click pe cardurile laterale pentru a le aduce în centru
  if (carouselContainer) {
    carouselContainer.addEventListener('click', function (e) {
      const sideCard = e.target.closest('.side-card');
      if (sideCard) {
        if (sideCard.classList.contains('left-card')) {
          window.changeSlide(-1);
        } else if (sideCard.classList.contains('right-card')) {
          window.changeSlide(1);
        }
      }
    });

    // Pause la hover
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);
  }

  if (descriptionBox) {
    descriptionBox.addEventListener('mouseenter', stopAutoSlide);
    descriptionBox.addEventListener('mouseleave', startAutoSlide);
  }
});

// Navigare cu tastatura
document.addEventListener('keydown', function (e) {
  const teamSection = document.querySelector('.team-carousel-container');
  if (teamSection) {
    if (e.key === 'ArrowLeft') {
      window.changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
      window.changeSlide(1);
    }
  }
});
// ===== TEAM MEMBERS CAROUSEL (SAFE VERSION) =====
window.teamMembersData = [
  { name: "Nume Prenume", dept: "Departamentul Programare", img: "assets/img/team/member1.jpg" },
  { name: "Nume Prenume", dept: "Departamentul Design", img: "assets/img/team/member2.jpg" },
  { name: "Nume Prenume", dept: "Departamentul Business", img: "assets/img/team/member8.jpg" }
];

window.teamIndex = 0;

window.changeSlide = function (direction) {
  if (!window.teamMembersData) return;

  window.teamIndex += direction;

  if (window.teamIndex < 0) window.teamIndex = window.teamMembersData.length - 1;
  if (window.teamIndex >= window.teamMembersData.length) window.teamIndex = 0;

  updateTeamCards();
};

function updateTeamCards() {
  const cards = {
    left: document.querySelector(".left-card"),
    center: document.querySelector(".center-card"),
    right: document.querySelector(".right-card")
  };

  if (!cards.left || !cards.center || !cards.right) return;

  const len = window.teamMembersData.length;

  const leftIndex = (window.teamIndex - 1 + len) % len;
  const rightIndex = (window.teamIndex + 1) % len;

  fillTeamCard(cards.left, window.teamMembersData[leftIndex]);
  fillTeamCard(cards.center, window.teamMembersData[window.teamIndex]);
  fillTeamCard(cards.right, window.teamMembersData[rightIndex]);
}

function fillTeamCard(card, member) {
  card.querySelector(".member-photo").src = member.img;
  card.querySelector(".member-name").textContent = member.name;
  card.querySelector(".member-department").textContent = member.dept;
}

document.addEventListener("DOMContentLoaded", updateTeamCards);

/* ===== BLOG CAROUSEL ===== */
window.currentBlogSlide = 0;
window.totalBlogSlides = 5;

window.updateBlogCarousel = function () {
  const cards = document.querySelectorAll('.blog-card');
  const indicators = document.querySelectorAll('.blog-indicator');

  cards.forEach((card, index) => {
    card.classList.remove('active');
    if (index === window.currentBlogSlide) {
      card.classList.add('active');
    }
  });

  indicators.forEach((indicator, index) => {
    indicator.classList.remove('active');
    if (index === window.currentBlogSlide) {
      indicator.classList.add('active');
    }
  });
};

window.changeBlogSlide = function (direction) {
  window.currentBlogSlide += direction;
  if (window.currentBlogSlide < 0) {
    window.currentBlogSlide = window.totalBlogSlides - 1;
  }
  if (window.currentBlogSlide >= window.totalBlogSlides) {
    window.currentBlogSlide = 0;
  }
  window.updateBlogCarousel();
};

window.goToBlogSlide = function (slideIndex) {
  window.currentBlogSlide = slideIndex;
  window.updateBlogCarousel();
};

// Initialize carousel on page load
document.addEventListener("DOMContentLoaded", () => {
  window.updateBlogCarousel();

  // Auto-advance blog carousel every 7 seconds
  setInterval(() => {
    window.changeBlogSlide(1);
  }, 7000);
});

// Motion enhancer: staggered reveals and subtle hero parallax
document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  document.body.classList.add('motion-enhanced');

  const applyStagger = (selector, step = 0.09) => {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.classList.add('animate-on-scroll', 'stagger-card', 'reveal-lift');
      el.style.setProperty('--stagger-index', String(index));
      el.style.setProperty('--stagger-step', `${step}s`);
    });
  };

  applyStagger('#portfolio .portfolio-item', 0.08);
  applyStagger('#portfolio .portfolio-caption', 0.05);
  applyStagger('#team .blog-card', 0.1);
  applyStagger('#team .blog-carousel-indicators .blog-indicator', 0.06);
  applyStagger('#about .timeline li', 0.1);
  applyStagger('#about .timeline .timeline-panel', 0.08);
  applyStagger('#services .team-text p', 0.08);
  applyStagger('.section-heading, .section-subheading', 0.06);
  applyStagger('.footer-section, .footer-bottom', 0.08);

  const hero = document.querySelector('header.masthead.has-video');
  if (!hero) return;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const y = Math.min(window.scrollY * 0.12, 24);
      hero.style.setProperty('--hero-offset', `${y.toFixed(2)}px`);
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});

// Timeline animation synchronized with scroll
document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('#about');
  const timeline = section ? section.querySelector('.timeline') : null;
  if (!timeline) return;

  // Avoid :scope for broader browser compatibility on static hosting
  const items = Array.from(timeline.children).filter(
    (el) => el.tagName === 'LI' && !el.classList.contains('timeline-end-marker')
  );
  if (!items.length) return;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const updateTimelineByScroll = () => {
    const rect = timeline.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Global line fill progress
    const lineProgress = clamp((viewportHeight * 0.62 - rect.top) / (rect.height || 1), 0, 1);
    timeline.style.setProperty('--scroll-progress', lineProgress.toFixed(4));

    // Per-item activation synced to viewport position
    items.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      const triggerStart = viewportHeight * 0.88;
      const triggerEnd = viewportHeight * 0.34;
      const itemProgress = clamp((triggerStart - itemRect.top) / (triggerStart - triggerEnd), 0, 1);

      item.style.setProperty('--item-progress', itemProgress.toFixed(4));
      item.classList.toggle('timeline-sync-active', itemProgress > 0.55);
    });
  };

  let ticking = false;
  const onScrollOrResize = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateTimelineByScroll();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize);
  onScrollOrResize();
});