(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  const themeButton = document.querySelector('.theme-toggle');
  const progress = document.querySelector('.scroll-progress');
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section[id]')];

  function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('open');
  }
  menu.addEventListener('click', () => {
    const isOpen = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!isOpen));
    menu.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    nav.classList.toggle('open', !isOpen);
  });
  navLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => {
    if (nav.classList.contains('open') && !nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
  });

  function setTheme(theme) {
    root.dataset.theme = theme;
    const light = theme === 'light';
    themeButton.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    themeButton.querySelector('.theme-icon').textContent = light ? '☾' : '☼';
    document.querySelector('meta[name="theme-color"]').content = light ? '#f5f7fb' : '#0b1020';
    try { localStorage.setItem('pn-theme', theme); } catch (_) { /* Theme still works when storage is unavailable. */ }
  }
  setTheme(root.dataset.theme || 'dark');
  themeButton.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  const typingTitle = document.querySelector('.typing-title');
  const typingCursor = document.querySelector('.typing-cursor');
  if (typingTitle && typingCursor) {
    const titles = ['BCA Student', 'Web Developer', 'Computer Enthusiast', 'Aspiring IT Professional'];
    let titleIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    const syncCursor = () => { typingCursor.style.left = `${typingTitle.getBoundingClientRect().width}px`; };
    const typeNext = () => {
      const current = titles[titleIndex];
      typingTitle.textContent = current.slice(0, characterIndex);
      syncCursor();
      let delay = deleting ? 42 : 82;
      if (!deleting && characterIndex === current.length) {
        deleting = true;
        delay = 1450;
      } else if (deleting && characterIndex === 0) {
        deleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        delay = 360;
      } else {
        characterIndex += deleting ? -1 : 1;
      }
      window.setTimeout(typeNext, delay);
    };
    typingTitle.textContent = '';
    syncCursor();
    typeNext();
  }

  let scheduled = false;
  function updateScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 12);
    progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(updateScroll); }
  }, { passive: true });
  updateScroll();

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('revealed'); revealObserver.unobserve(entry.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
      }
    }), { rootMargin: '-25% 0px -60% 0px', threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  } else {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
  }

  const form = document.querySelector('.contact-form');
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.dataset.label = button.innerHTML;
    button.textContent = 'Sending…';
    status.classList.remove('error');
    status.textContent = 'Sending your message…';
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'The message could not be sent.');
      status.textContent = 'Thanks for reaching out. Your message has been sent.';
      form.reset();
    } catch (error) {
      status.textContent = error.message || 'Something went wrong. Please email me directly instead.';
      status.classList.add('error');
    } finally {
      button.disabled = false;
      button.innerHTML = button.dataset.label;
      delete button.dataset.label;
    }
  });
})();
