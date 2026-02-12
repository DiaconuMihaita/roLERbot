// ===== NAVBAR FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // SCROLL EFFECT ON NAVBAR
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      navbar.classList.add('navbar-shrink');
    } else {
      navbar.classList.remove('navbar-shrink');
    }
  });

  // SMOOTH SCROLL FOR ANCHOR LINKS
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && document.querySelector(href)) {
        e.preventDefault();
        const target = document.querySelector(href);
        const offsetTop = target.offsetTop - 80;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ADD ACTIVE CLASS TO CURRENT SECTION
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -50% 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  // OBSERVE ALL SECTIONS
  document.querySelectorAll('section[id], header[id]').forEach(section => {
    observer.observe(section);
  });
});
