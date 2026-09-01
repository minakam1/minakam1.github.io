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
  const viewerLoading = document.querySelector('#viewerLoading');
  let photos = [];
  let activeIndex = 0;

  const photoUrl = (name) => `./photos/${name.split('/').map(encodeURIComponent).join('/')}`;
  const showPhoto = (index) => {
    activeIndex = (index + photos.length) % photos.length;
    const name = photos[activeIndex];
    viewer.dataset.state = 'loading';
    viewerLoading.textContent = 'LOADING…';
    viewerImage.src = photoUrl(name);
    viewerImage.alt = `照片 ${activeIndex + 1}`;
    if (viewerImage.complete && viewerImage.naturalWidth > 0) viewer.dataset.state = 'loaded';
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
        const loading = card.querySelector('.photo-card__loading');
        card.dataset.state = 'loading';
        card.setAttribute('aria-busy', 'true');
        image.addEventListener('load', () => {
          card.dataset.state = 'loaded';
          card.removeAttribute('aria-busy');
        }, { once: true });
        image.addEventListener('error', () => {
          card.dataset.state = 'error';
          card.removeAttribute('aria-busy');
          loading.textContent = 'LOAD FAILED';
        }, { once: true });
        image.alt = `照片 ${index + 1}`;
        if (index < 4) image.loading = 'eager';
        image.src = photoUrl(name);
        if (image.complete) {
          card.dataset.state = image.naturalWidth > 0 ? 'loaded' : 'error';
          card.removeAttribute('aria-busy');
          if (!image.naturalWidth) loading.textContent = 'LOAD FAILED';
        }
        card.querySelector('button').ariaLabel = '打开照片';
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
  viewerImage.addEventListener('load', () => { viewer.dataset.state = 'loaded'; });
  viewerImage.addEventListener('error', () => {
    viewer.dataset.state = 'error';
    viewerLoading.textContent = 'LOAD FAILED';
  });
  viewer.addEventListener('click', (event) => { if (event.target === viewer) closeViewer(); });
  viewer.addEventListener('close', () => { document.body.style.overflow = ''; });
  document.addEventListener('keydown', (event) => {
    if (/^[1-6]$/.test(event.key) && !viewer.open) setTheme(themes[Number(event.key) - 1]);
    if (!viewer.open) return;
    if (event.key === 'ArrowLeft') showPhoto(activeIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(activeIndex + 1);
  });
})();
