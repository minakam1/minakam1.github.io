(() => {
  const themes = ['paper', 'ink', 'snow', 'copper', 'press', 'collage'];
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('mimi-theme');
  if (themes.includes(savedTheme)) root.dataset.theme = savedTheme;
  const setTheme = (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem('mimi-theme', theme);
  };
  document.querySelector('#themeBtn').addEventListener('click', () => setTheme(themes[(themes.indexOf(root.dataset.theme) + 1) % themes.length]));

  const clock = document.querySelector('#clock');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false }); };
  tick();
  setInterval(tick, 1000);

  const stream = document.querySelector('#photoStream');
  const template = document.querySelector('#photoTemplate');
  const loadState = document.querySelector('#loadState');
  const viewer = document.querySelector('#viewer');
  const viewerImage = document.querySelector('#viewerImage');
  const viewerCaption = document.querySelector('#viewerCaption');
  let photos = [];
  let activeIndex = 0;

  const photoUrl = (name) => `./photos/${name.split('/').map(encodeURIComponent).join('/')}`;
  const showPhoto = (index) => {
    activeIndex = (index + photos.length) % photos.length;
    const name = photos[activeIndex];
    viewerImage.src = photoUrl(name);
    viewerImage.alt = `照片 ${activeIndex + 1}`;
    viewerCaption.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')} · ${name}`;
  };
  const openViewer = (index) => {
    showPhoto(index);
    viewer.showModal();
    document.body.style.overflow = 'hidden';
  };
  const closeViewer = () => {
    viewer.close();
    document.body.style.overflow = '';
  };

  const observeCards = () => {
    const cards = [...document.querySelectorAll('.photo-card')];
    if (!('IntersectionObserver' in window)) return cards.forEach((card) => card.classList.add('is-visible'));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { rootMargin: '100px 0px', threshold: 0.02 });
    cards.forEach((card) => observer.observe(card));
  };

  fetch('./photos.json')
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      photos = data.photos;
      const fragment = document.createDocumentFragment();
      photos.forEach((name, index) => {
        const card = template.content.firstElementChild.cloneNode(true);
        const image = card.querySelector('img');
        image.src = photoUrl(name);
        image.alt = `照片 ${index + 1}`;
        if (index < 4) image.loading = 'eager';
        card.querySelector('button').ariaLabel = `打开照片 ${index + 1}`;
        card.querySelector('.photo-card__number').textContent = String(index + 1).padStart(2, '0');
        card.querySelector('.photo-card__name').textContent = name;
        card.querySelector('button').addEventListener('click', () => openViewer(index));
        fragment.append(card);
      });
      stream.append(fragment);
      document.querySelector('#photoCount').textContent = `${photos.length} PHOTOS`;
      loadState.hidden = true;
      observeCards();
    })
    .catch(() => { loadState.textContent = '照片清单读取失败'; });

  document.querySelector('#closeViewer').addEventListener('click', closeViewer);
  document.querySelector('#prevPhoto').addEventListener('click', () => showPhoto(activeIndex - 1));
  document.querySelector('#nextPhoto').addEventListener('click', () => showPhoto(activeIndex + 1));
  viewer.addEventListener('click', (event) => { if (event.target === viewer) closeViewer(); });
  viewer.addEventListener('close', () => { document.body.style.overflow = ''; });
  document.addEventListener('keydown', (event) => {
    if (/^[1-6]$/.test(event.key) && !viewer.open) setTheme(themes[Number(event.key) - 1]);
    if (!viewer.open) return;
    if (event.key === 'ArrowLeft') showPhoto(activeIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(activeIndex + 1);
  });
})();
