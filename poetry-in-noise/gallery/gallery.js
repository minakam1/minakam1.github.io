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
  const particleCanvas = document.querySelector('#viewerParticles');
  const particleContext = particleCanvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let photos = [];
  let activeIndex = 0;
  let particleFrame = 0;
  let particles = [];

  const setViewerState = (state) => {
    viewer.dataset.state = state;
    viewer.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
    viewerLoading.textContent = state === 'error' ? 'LOAD FAILED' : 'LOADING…';
  };

  const stopParticles = () => {
    cancelAnimationFrame(particleFrame);
    particleFrame = 0;
    particles = [];
    particleContext.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  };

  const imagePalette = () => {
    const sampler = document.createElement('canvas');
    sampler.width = 48;
    sampler.height = 48;
    const context = sampler.getContext('2d', { willReadFrequently: true });
    context.drawImage(viewerImage, 0, 0, sampler.width, sampler.height);
    const pixels = context.getImageData(0, 0, sampler.width, sampler.height).data;
    const buckets = new Map();
    for (let index = 0; index < pixels.length; index += 16) {
      if (pixels[index + 3] < 200) continue;
      const key = `${Math.round(pixels[index] / 40)},${Math.round(pixels[index + 1] / 40)},${Math.round(pixels[index + 2] / 40)}`;
      const bucket = buckets.get(key) ?? { count: 0, red: 0, green: 0, blue: 0 };
      bucket.count += 1;
      bucket.red += pixels[index];
      bucket.green += pixels[index + 1];
      bucket.blue += pixels[index + 2];
      buckets.set(key, bucket);
    }
    return [...buckets.values()]
      .sort((left, right) => right.count - left.count)
      .slice(0, 6)
      .map((bucket) => `${Math.round(bucket.red / bucket.count)}, ${Math.round(bucket.green / bucket.count)}, ${Math.round(bucket.blue / bucket.count)}`);
  };

  const startParticles = () => {
    stopParticles();
    if (reducedMotion.matches || !viewer.open || !viewerImage.naturalWidth) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    particleCanvas.width = Math.round(window.innerWidth * ratio);
    particleCanvas.height = Math.round(window.innerHeight * ratio);
    particleContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    const rect = viewerImage.getBoundingClientRect();
    let palette;
    try {
      palette = imagePalette();
    } catch {
      palette = ['242, 234, 216'];
    }
    if (!palette.length || !rect.width || !rect.height) return;

    const count = window.innerWidth < 600 ? 72 : 116;
    const startedAt = performance.now();
    particles = Array.from({ length: count }, (_, index) => {
      const side = index % 4;
      const horizontal = side < 2;
      const position = Math.random();
      const speed = 0.35 + Math.random() * 1.15;
      const tangent = (Math.random() - 0.5) * 1.15;
      return {
        x: horizontal ? rect.left + rect.width * position : side === 2 ? rect.left : rect.right,
        y: horizontal ? side === 0 ? rect.top : rect.bottom : rect.top + rect.height * position,
        velocityX: horizontal ? tangent : (side === 2 ? -1 : 1) * speed,
        velocityY: horizontal ? (side === 0 ? -1 : 1) * speed : tangent,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 2 + Math.random() * 6,
        delay: Math.random() * 360,
        life: 1700 + Math.random() * 1900,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.06,
      };
    });

    const draw = (now) => {
      particleContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let active = false;
      particles.forEach((particle) => {
        const age = now - startedAt - particle.delay;
        if (age < 0 || age > particle.life) return;
        active = true;
        const progress = age / particle.life;
        const distance = age / 16.67;
        const x = particle.x + particle.velocityX * distance;
        const y = particle.y + particle.velocityY * distance;
        particleContext.save();
        particleContext.translate(x, y);
        particleContext.rotate(particle.rotation + particle.spin * distance);
        particleContext.fillStyle = `rgba(${particle.color}, ${Math.sin(progress * Math.PI) * 0.82})`;
        particleContext.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        particleContext.restore();
      });
      if (active) particleFrame = requestAnimationFrame(draw);
      else stopParticles();
    };
    particleFrame = requestAnimationFrame(draw);
  };

  const photoUrl = (name) => `./photos/${name.split('/').map(encodeURIComponent).join('/')}`;
  const thumbnailUrl = (name) => `./thumbnails/${name.split('/').map(encodeURIComponent).join('/')}`;
  const showPhoto = (index) => {
    stopParticles();
    activeIndex = (index + photos.length) % photos.length;
    const name = photos[activeIndex];
    setViewerState('loading');
    viewerImage.src = photoUrl(name);
    viewerImage.alt = `照片 ${activeIndex + 1}`;
    if (viewerImage.complete) {
      if (viewerImage.naturalWidth > 0) {
        setViewerState('loaded');
        requestAnimationFrame(startParticles);
      } else {
        setViewerState('error');
      }
    }
  };
  const openViewer = (index) => {
    showPhoto(index);
    viewer.showModal();
    document.body.style.overflow = 'hidden';
  };
  const closeViewer = () => {
    stopParticles();
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
        image.src = thumbnailUrl(name);
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
  viewerImage.addEventListener('load', () => {
    setViewerState('loaded');
    requestAnimationFrame(startParticles);
  });
  viewerImage.addEventListener('error', () => {
    stopParticles();
    setViewerState('error');
  });
  viewer.addEventListener('click', (event) => { if (event.target === viewer) closeViewer(); });
  viewer.addEventListener('close', () => {
    stopParticles();
    document.body.style.overflow = '';
  });
  window.addEventListener('resize', () => {
    if (viewer.open && viewer.dataset.state === 'loaded') startParticles();
  });
  document.addEventListener('keydown', (event) => {
    if (/^[1-6]$/.test(event.key) && !viewer.open) setTheme(themes[Number(event.key) - 1]);
    if (!viewer.open) return;
    if (event.key === 'ArrowLeft') showPhoto(activeIndex - 1);
    if (event.key === 'ArrowRight') showPhoto(activeIndex + 1);
  });
})();
