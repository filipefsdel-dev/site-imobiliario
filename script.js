(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const WA = '5500000000000'; // TROQUE pelo número real (código do país + DDD + número)
  const waLink = (t) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
  const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  /* =============== HERO: scroll + frames =============== */
  const CONFIG = { frameCount: 300, folder: 'frames/', prefix: 'frame-', digits: 4, ext: 'jpg', concurrency: 8, smoothing: 0.12, maxDpr: 2 };
  const stage = $('#topo'), sticky = $('.sticky', stage), canvas = $('#frame-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const loader = $('.loader', stage), fill = $('.loader__fill', stage), ltext = $('.loader__text', stage);
  const timed = [...stage.querySelectorAll('[data-from]')], railFill = $('.rail i', stage);
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const url = (n) => CONFIG.folder + CONFIG.prefix + String(n).padStart(CONFIG.digits, '0') + '.' + CONFIG.ext;

  const lowPower = (navigator.deviceMemory && navigator.deviceMemory <= 4) || (matchMedia('(pointer: coarse)').matches && innerWidth < 900);
  const nums = [];
  for (let n = 1; n <= CONFIG.frameCount; n += lowPower ? 2 : 1) nums.push(n);
  if (nums[nums.length - 1] !== CONFIG.frameCount) nums.push(CONFIG.frameCount);
  const images = new Array(nums.length).fill(null), last = nums.length - 1;
  let cssW = 0, cssH = 0, cur = 0, target = 0, drawn = -1, raf = 0;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function resizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, CONFIG.maxDpr);
    cssW = sticky.clientWidth; cssH = sticky.clientHeight;
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingQuality = 'high';
    drawn = -1; render(true);
  }
  function nearest(i) {
    for (let d = 0; d <= last; d++) { if (images[i - d]) return images[i - d]; if (images[i + d]) return images[i + d]; }
    return null;
  }
  function render(force) {
    const i = clamp(Math.round(cur), 0, last);
    if (!force && i === drawn) return;
    const img = nearest(i); if (!img) return;
    const s = Math.max(cssW / img.naturalWidth, cssH / img.naturalHeight), w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (cssW - w) / 2, (cssH - h) / 2, w, h); drawn = i;
  }
  function progress() {
    const total = stage.offsetHeight - sticky.clientHeight;
    return total > 0 ? clamp(-stage.getBoundingClientRect().top / total, 0, 1) : 0;
  }
  function tick() {
    cur += (target - cur) * CONFIG.smoothing;
    if (Math.abs(target - cur) < 0.01) cur = target;
    render(false);
    raf = cur === target ? 0 : requestAnimationFrame(tick);
  }
  function onScroll() {
    const p = progress(); target = p * last;
    timed.forEach((el) => el.classList.toggle('is-visible', p >= +el.dataset.from && p < +el.dataset.to));
    railFill.style.transform = `scaleY(${p.toFixed(3)})`;
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function preload(onProgress) {
    return new Promise((resolve) => {
      let next = 0, active = 0, done = 0; const total = nums.length;
      const finish = (i, img, ok) => { if (ok) images[i] = img; active--; done++; onProgress(done / total); done === total ? resolve() : pump(); };
      const pump = () => {
        while (active < CONFIG.concurrency && next < total) {
          const i = next++, img = new Image(); active++;
          img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => finish(i, img, true));
          img.onerror = () => finish(i, img, false);
          img.src = url(nums[i]);
        }
      };
      pump();
    });
  }
  const hideLoader = () => { loader.classList.add('is-done'); document.documentElement.classList.remove('is-loading'); };

  if (reducedQuery.matches) {
    stage.classList.add('is-static');
    timed.forEach((el) => +el.dataset.from === 0 && el.classList.add('is-visible'));
    const img = new Image();
    img.onload = () => { images[0] = img; resizeCanvas(); hideLoader(); };
    img.src = url(1);
    new ResizeObserver(resizeCanvas).observe(sticky);
  } else {
    document.documentElement.classList.add('is-loading');
    preload((r) => { fill.style.transform = `scaleX(${r.toFixed(3)})`; ltext.textContent = `Carregando ${Math.round(r * 100)}%`; }).then(() => {
      if (!images.some(Boolean)) { ltext.textContent = 'Frames não encontrados. Confira a pasta "frames".'; return; }
      resizeCanvas(); onScroll(); hideLoader();
      addEventListener('scroll', onScroll, { passive: true });
      new ResizeObserver(() => { resizeCanvas(); onScroll(); }).observe(sticky);
    });
  }
  reducedQuery.addEventListener('change', () => location.reload());

  /* =============== NAVEGAÇÃO =============== */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  const navState = () => nav.classList.toggle('is-solid', scrollY > 40);
  addEventListener('scroll', navState, { passive: true }); navState();
  const toggleMenu = (open) => { menu.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', open); };
  burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (e) => e.target.tagName === 'A' && toggleMenu(false));
  addEventListener('keydown', (e) => e.key === 'Escape' && toggleMenu(false));

  /* =============== IMÓVEIS =============== */
  const props = [
    { name: 'Villa Atlântica', place: 'Angra dos Reis, RJ', cat: 'litoral', beds: 6, area: 1250, price: 48000000, frame: 120, desc: 'Residência à beira-mar com píer privativo, ambientes integrados e vista aberta para a baía.' },
    { name: 'Penthouse Jardins', place: 'Jardins, São Paulo, SP', cat: 'cidade', beds: 4, area: 620, price: 32500000, frame: 210, desc: 'Cobertura em andar exclusivo, terraço com piscina e acabamentos assinados.' },
    { name: 'Casa Trancoso', place: 'Trancoso, BA', cat: 'litoral', beds: 5, area: 980, price: 27800000, frame: 290, desc: 'Arquitetura contemporânea em meio à vegetação nativa, a poucos minutos do Quadrado.' },
    { name: 'Refúgio Mantiqueira', place: 'Campos do Jordão, SP', cat: 'campo', beds: 5, area: 1100, price: 19900000, frame: 50, desc: 'Propriedade de 4 hectares com mata preservada, lareira central e vista para o vale.' }
  ];
  const grid = $('#grid'), dlg = $('#dlg');
  const card = (p, i) => `<button class="card" data-i="${i}"><span class="card__img"><img src="${url(p.frame)}" alt="${p.name}" loading="lazy"></span><span class="card__name">${p.name}</span><span class="card__meta">${p.place} · ${p.beds} suítes · ${p.area.toLocaleString('pt-BR')} m²</span><span class="card__price">${brl(p.price)}</span></button>`;
  function renderGrid(cat) {
    grid.innerHTML = props.map((p, i) => (cat === 'todos' || p.cat === cat) ? card(p, i) : '').join('');
  }
  renderGrid('todos');
  $('.filters').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    document.querySelectorAll('.filters button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    renderGrid(b.dataset.cat);
  });
  grid.addEventListener('click', (e) => {
    const c = e.target.closest('.card'); if (!c) return;
    const p = props[c.dataset.i];
    $('#d-img').src = url(p.frame); $('#d-img').alt = p.name;
    $('#d-name').textContent = p.name; $('#d-place').textContent = p.place; $('#d-desc').textContent = p.desc;
    $('#d-specs').textContent = `${p.beds} suítes · ${p.area.toLocaleString('pt-BR')} m²`;
    $('#d-price').textContent = brl(p.price);
    $('#d-wa').href = waLink(`Olá, tenho interesse no imóvel ${p.name} (${p.place}).`);
    dlg.showModal();
  });
  $('#d-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => e.target === dlg && dlg.close());

  /* =============== SIMULADOR =============== */
  const RATE = 0.105;
  const fv = $('#valor'), fe = $('#entrada'), fp = $('#prazo');
  function simulate() {
    const v = +fv.value, e = +fe.value / 100, n = +fp.value * 12, i = Math.pow(1 + RATE, 1 / 12) - 1, pv = v * (1 - e);
    const pmt = pv * i / (1 - Math.pow(1 + i, -n));
    $('#o-valor').textContent = brl(v); $('#o-entrada').textContent = `${fe.value}%`; $('#o-prazo').textContent = `${fp.value} anos`;
    $('#parcela').textContent = brl(pmt); $('#r-entrada').textContent = brl(v * e); $('#r-fin').textContent = brl(pv);
  }
  [fv, fe, fp].forEach((el) => el.addEventListener('input', simulate)); simulate();

  /* =============== CONTATO =============== */
  $('#wa-link').href = waLink('Olá, gostaria de falar com um consultor da Auréa Estates.');
  $('#fab').href = waLink('Olá, gostaria de falar com um consultor da Auréa Estates.');
  $('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, st = $('#status');
    if (!f.nome.value.trim() || !f.contato.value.trim()) { st.style.color = '#a3402d'; st.textContent = 'Preencha nome e e-mail ou WhatsApp.'; return; }
    st.style.color = ''; st.textContent = 'Solicitação recebida. Retornaremos em até um dia útil.';
    f.reset(); /* TODO: enviar os dados para seu backend/serviço de formulários */
  });
})();
