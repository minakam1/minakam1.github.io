(() => {
  const themes = ['paper', 'ink', 'snow', 'copper', 'press', 'collage'];
  const root = document.documentElement;
  const themeBtn = document.querySelector('#themeBtn');
  const savedTheme = localStorage.getItem('mimi-theme');
  if (themes.includes(savedTheme)) root.dataset.theme = savedTheme;

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem('mimi-theme', theme);
  };
  themeBtn.addEventListener('click', () => {
    const next = (themes.indexOf(root.dataset.theme) + 1) % themes.length;
    setTheme(themes[next]);
  });

  const clock = document.querySelector('#clock');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false }); };
  tick();
  setInterval(tick, 1000);

  const frames = [...document.querySelectorAll('.frame')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '80px 0px', threshold: 0.05 });
    frames.forEach((frame) => observer.observe(frame));
  } else {
    frames.forEach((frame) => frame.classList.add('is-visible'));
  }

  const dialog = document.querySelector('#darkroom');
  const viewerImage = document.querySelector('#viewerImage');
  const viewerCaption = document.querySelector('#viewerCaption');
  let activeIndex = 0;

  const showPhoto = (index) => {
    activeIndex = (index + frames.length) % frames.length;
    const frame = frames[activeIndex];
    const source = frame.querySelector('img');
    viewerImage.src = source.src;
    viewerImage.alt = source.alt;
    viewerCaption.textContent = frame.querySelector('figcaption').innerText.replace(/\n/g, ' · ');
  };
  const openViewer = (index) => {
    showPhoto(index);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  };
  const closeViewer = () => {
    dialog.close();
    document.body.style.overflow = '';
  };

  frames.forEach((frame, index) => frame.querySelector('button').addEventListener('click', () => openViewer(index)));
  document.querySelector('#closeViewer').addEventListener('click', closeViewer);
  document.querySelector('#prevPhoto').addEventListener('click', () => showPhoto(activeIndex - 1));
  document.querySelector('#nextPhoto').addEventListener('click', () => showPhoto(activeIndex + 1));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeViewer(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
  document.addEventListener('keydown', (event) => {
    if (/^[1-6]$/.test(event.key) && !dialog.open) setTheme(themes[Number(event.key) - 1]);
    if (!dialog.open) return;
    if (event.key === 'ArrowLeft') showPhoto(activeIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(activeIndex + 1);
  });
})();
