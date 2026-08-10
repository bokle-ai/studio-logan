/* ============================================================
   STUDIO LOGAN — motion
   ============================================================ */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = window.gsap && window.ScrollTrigger;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', () => { if (hasGSAP) ScrollTrigger.update(); });
    function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    document.documentElement.classList.add('lenis');
  }
  const stop = () => lenis && lenis.stop();
  const start = () => lenis && lenis.start();

  /* ---------- Custom cursor ---------- */
  const cursor = document.getElementById('cursor');
  const cLabel = document.getElementById('cursorLabel');
  if (cursor && window.matchMedia('(hover:hover)').matches) {
    let cx = innerWidth/2, cy = innerHeight/2, tx = cx, ty = cy;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    (function loop(){ cx += (tx-cx)*.2; cy += (ty-cy)*.2; cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
    const bind = () => document.querySelectorAll('[data-cursor],a,button').forEach(el => {
      if (el.dataset.cbound) return; el.dataset.cbound = 1;
      el.addEventListener('mouseenter', () => { cursor.classList.add('is-hover'); cLabel.textContent = el.dataset.cursorLabel || ''; });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('is-hover'); cLabel.textContent=''; });
    });
    bind();
  } else if (cursor) { cursor.style.display='none'; document.body.style.cursor='auto'; }

  /* ---------- Split helpers ---------- */
  function splitWords(el){
    if (el.dataset.split) return;
    el.dataset.split = 1;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="w"><span class="wi">${w}</span></span>`).join(' ');
  }

  /* ---------- Preloader ---------- */
  const pre = document.getElementById('preloader');
  function runPreloader(done){
    if (!pre){ done(); return; }
    stop();
    const letters = pre.querySelectorAll('.preloader__word span:not(.sp)');
    const fill = document.getElementById('preFill');
    if (!hasGSAP || reduce){ pre.style.display='none'; done(); return; }
    let finished = false;
    const finish = () => { if (finished) return; finished = true; gsap.set(pre,{display:'none'}); done(); };
    // safety: never trap the user if rAF is throttled/paused
    const guard = setTimeout(finish, 6000);
    const tl = gsap.timeline({ onComplete: () => { clearTimeout(guard); finish(); } });
    tl.to(letters, { opacity:1, y:0, stagger:.05, duration:.6, ease:'power3.out' }, .1)
      .to(fill, { width:'100%', duration:1.1, ease:'power2.inOut' }, .2)
      .to('.preloader__lion', { scale:1.08, duration:.6, ease:'power2.out' }, '-=.4')
      .to(pre, { yPercent:-100, duration:.9, ease:'power4.inOut' }, '+=.15')
      .set(pre, { display:'none' });
  }

  /* ---------- Hero intro ---------- */
  function heroIntro(){
    if (!hasGSAP || reduce){ gsap && gsap.set && gsap.set('.hero__kicker,.hero__tag,.hero__meta',{opacity:1,y:0}); document.querySelectorAll('.hero__kicker,.hero__tag,.hero__meta').forEach(e=>{e.style.opacity=1;e.style.transform='none';}); return; }
    const tl = gsap.timeline({ delay:.05 });
    tl.from('.hero__title .line:first-child span', { yPercent:110, duration:1, ease:'power4.out' })
      .from('.hero__title .script', { yPercent:110, opacity:0, duration:1.1, ease:'power4.out' }, '-=.8')
      .to('.hero__kicker', { opacity:1, y:0, duration:.8, ease:'power3.out' }, '-=.7')
      .to('.hero__tag', { opacity:1, y:0, duration:.8, ease:'power3.out' }, '-=.6')
      .to('.hero__meta', { opacity:1, y:0, duration:.8, ease:'power3.out' }, '-=.6');
    start();
  }

  /* ---------- Scroll-driven reveals ---------- */
  function initScroll(){
    if (!hasGSAP || reduce){
      document.querySelectorAll('.reveal-up').forEach(e=>{e.style.opacity=1;e.style.transform='none';});
      document.querySelectorAll('.reveal-img').forEach(w=>{w.style.clipPath='none';const i=w.querySelector('img');if(i)i.style.transform='none';});
      return;
    }

    // reveal-up
    gsap.utils.toArray('.reveal-up').forEach(el => {
      gsap.to(el, { opacity:1, y:0, duration:1, ease:'power3.out',
        scrollTrigger:{ trigger:el, start:'top 88%' } });
    });

    // reveal-lines (word stagger)
    gsap.utils.toArray('.reveal-lines').forEach(el => {
      splitWords(el);
      gsap.set(el.querySelectorAll('.wi'), { yPercent:110 });
      gsap.set(el.querySelectorAll('.w'), { overflow:'hidden', display:'inline-block' });
      gsap.to(el.querySelectorAll('.wi'), { yPercent:0, duration:.9, ease:'power3.out', stagger:.02,
        scrollTrigger:{ trigger:el, start:'top 85%' } });
    });

    // clean whole-image reveals (gentle fade + settle scale, no slicing)
    gsap.utils.toArray('.frag-img, .reveal-img').forEach(wrap => {
      const img = wrap.querySelector('img');
      gsap.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: wrap, start: 'top 88%' } });
      if (img) gsap.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'power3.out',
        scrollTrigger: { trigger: wrap, start: 'top 88%' } });
    });

    // continuous parallax (elements not inside an image wrapper)
    gsap.utils.toArray('[data-parallax]').forEach(el => {
      if (el.closest('.frag-img, .reveal-img')) return;
      const amt = parseFloat(el.dataset.parallax) || .12;
      gsap.to(el, { yPercent: amt*100, ease:'none',
        scrollTrigger:{ trigger: el.closest('section,article,.hero,.project__hero') || el, start:'top bottom', end:'bottom top', scrub:true } });
    });
  }

  /* ---------- Scroll-build canvas scrubber ---------- */
  function initScrollBuild(){
    const canvas  = document.getElementById('buildCanvas');
    const hint    = document.getElementById('buildHint');
    const tagline = document.getElementById('buildTagline');
    const caps    = document.querySelectorAll('.sbuild__cap');

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const TOTAL = 150;
    const dpr   = Math.min(window.devicePixelRatio || 1, 2);

    // Size canvas to physical pixels
    function sizeCanvas() {
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    }
    sizeCanvas();

    // Cover-fit draw: anchored to top-center
    function drawImg(img) {
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = canvas.width, ch = canvas.height;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale, sh = ih * scale;
      const dx = (cw - sw) / 2;
      const dy = 0; // top-anchor (empty room ceiling stays at top)
      ctx.drawImage(img, dx, dy, sw, sh);
    }

    // Preload all frames — fire drawImg as each arrives
    const imgs = new Array(TOTAL + 1);
    let currentIdx = 1;
    function pad(n) { return String(n).padStart(4, '0'); }

    for (let i = 1; i <= TOTAL; i++) {
      const img = new Image();
      img.src = 'assets/img/seq/frame' + pad(i) + '.jpg';
      img.onload = () => {
        imgs[i] = img;
        if (i === 1) drawImg(img); // paint first frame immediately on load
        if (i === currentIdx) drawImg(img); // catch up if scroll already moved
      };
      imgs[i] = img;
    }

    // Reduced motion: just show first frame, no scroll hook
    if (reduce || !hasGSAP) return;

    const STAGES = [
      { from: 0,    to: 0.18 },
      { from: 0.18, to: 0.36 },
      { from: 0.36, to: 0.58 },
      { from: 0.58, to: 0.78 },
      { from: 0.78, to: 1.00 },
    ];
    let activeStage = 0;
    function updateCaptions(p) {
      let next = 0;
      for (let i = STAGES.length - 1; i >= 0; i--) {
        if (p >= STAGES[i].from) { next = i; break; }
      }
      if (next !== activeStage) {
        caps[activeStage].classList.remove('is-active');
        caps[next].classList.add('is-active');
        activeStage = next;
      }
    }

    ScrollTrigger.create({
      trigger: '#scroll-build-outer',
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate(self) {
        const p   = self.progress;
        const idx = Math.max(1, Math.min(TOTAL, Math.round(p * (TOTAL - 1)) + 1));
        if (idx !== currentIdx) {
          currentIdx = idx;
          drawImg(imgs[idx]);
        }
        if (hint)    hint.classList.toggle('is-hidden', p > 0.05);
        if (tagline) tagline.classList.toggle('is-visible', p > 0.08);
        updateCaptions(p);
      },
      onLeave() {
        scrollBuildActive = false;
        const nav = document.getElementById('nav');
        if (nav) { nav.classList.remove('is-hidden'); nav.classList.add('is-solid'); }
      },
      onEnterBack() {
        scrollBuildActive = true;
        const nav = document.getElementById('nav');
        if (nav) { nav.classList.remove('is-solid'); nav.classList.add('is-hidden'); }
      }
    });

    window.addEventListener('resize', () => {
      sizeCanvas();
      drawImg(imgs[currentIdx]);
      ScrollTrigger.refresh();
    });

    if (document.readyState === 'complete') { ScrollTrigger.refresh(); }
    else { window.addEventListener('load', () => ScrollTrigger.refresh()); }
  }

  /* ---------- Horizontal project rail (image-into-image) ---------- */
  function initHorizontal(){
    const sec = document.querySelector('.hwork');
    const track = document.getElementById('hTrack');
    if (!sec || !track || !hasGSAP || reduce) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const len = () => Math.max(0, track.scrollWidth - innerWidth);
      const drive = gsap.to(track, {
        x: () => -len(), ease: 'none',
        scrollTrigger: {
          trigger: sec, start: 'top top', end: () => '+=' + len(),
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
        }
      });
      // gentle counter-parallax on each panel image for depth
      track.querySelectorAll('.hpanel__media img').forEach(im => {
        gsap.fromTo(im, { xPercent: -6 }, {
          xPercent: 6, ease: 'none',
          scrollTrigger: { containerAnimation: drive, trigger: im.closest('.hpanel'), start: 'left right', end: 'right left', scrub: true }
        });
      });
      return () => gsap.set(track, { x: 0 });
    });
  }

  /* ---------- Project drawer (click a project → slide-in brief) ---------- */
  function initDrawer(){
    const drawer = document.getElementById('drawer');
    const backdrop = document.getElementById('drawerBackdrop');
    if (!drawer || !backdrop) return;
    const PROJECTS = {
      canter: { idx:'01 / 05', name:'Canter Hotel', where:'Marriott Signature · Oklahoma · 180 keys', img:'assets/img/canter-1.jpg',
        brief:[
          "A celebration of ranch heritage reimagined for contemporary hospitality. Drawing from Oklahoma's singing-cowboy legacy and vernacular ranch architecture, the design honours regional authenticity while delivering refined comfort.",
          "Stone, reclaimed timber and handcrafted metalwork create layered textures throughout — from the double-height lobby fireplace to intimate bar nooks — balancing rustic warmth with sophisticated restraint."
        ] },
      hardrock: { idx:'02 / 05', name:'Hard Rock', where:'Athens, Greece · 1,100 keys', img:'assets/img/hardrock-1.jpg',
        brief:[
          "A bold entertainment destination blending luxury and heritage. Transforming the historic Hellinikon Airport, it becomes the first integrated resort of its kind in continental Europe.",
          "The central tower's fluid form harmonises with the landscape — modern luxury rooted in ancient heritage — embracing the Mediterranean climate with more than 200,000 m² of green open space."
        ] },
      brooklyn: { idx:'03 / 05', name:'Private Residence', where:'Brooklyn, New York', img:'assets/img/brooklyn-1.jpg',
        brief:[
          "The design honours the brownstone's 1880s bones while inserting contemporary ease. French sensibility provides discipline: edited palettes, quality over quantity, timeless over trendy.",
          "A home for morning coffee in filtered light and dinners that linger past midnight — spaces designed for how people actually live, not how shelter magazines say they should."
        ] },
      manhattan: { idx:'04 / 05', name:'Private Residence', where:'Manhattan · 432 Park Avenue', img:'assets/img/manhattan-1.jpg',
        brief:[
          "Designed as private observatories suspended in the sky. Floor-to-ceiling glass dissolves boundaries — Central Park unfolds below, the Manhattan skyline extends infinitely.",
          "Materials respond to daylight: stone warms to gold at sunrise, plaster glows silver at dusk. Sublime vertical living that feels less like an apartment than inhabiting the air above New York."
        ] },
      klein: { idx:'05 / 05', name:'Klein Tools', where:'Office & Workplace · Texas', img:'assets/img/klein-1.jpg',
        brief:[
          "An industrial heritage reframed as a warm, human workplace. Exposed brick, reclaimed timber and steel are softened into a space that invites people to gather, linger and work.",
          "Layered textures, generous daylight and a double-height atrium give the everyday a sense of occasion — sophisticated restraint standing in for nostalgia."
        ] }
    };
    const el = {
      img: document.getElementById('drawerImg'), idx: document.getElementById('drawerIdx'),
      name: document.getElementById('drawerName'), where: document.getElementById('drawerWhere'),
      brief: document.getElementById('drawerBrief')
    };
    let isOpen = false;
    function open(id){
      const p = PROJECTS[id]; if (!p) return;
      el.img.src = p.img; el.img.alt = p.name;
      el.idx.textContent = p.idx; el.name.textContent = p.name; el.where.textContent = p.where;
      el.brief.innerHTML = p.brief.map(t => `<p>${t}</p>`).join('');
      drawer.classList.add('is-open'); backdrop.classList.add('is-open');
      drawer.setAttribute('aria-hidden','false'); isOpen = true;
      stop(); if (!lenis) document.body.style.overflow = 'hidden';
      if (hasGSAP && !reduce){
        gsap.from(drawer.querySelectorAll('.drawer__media,.drawer__idx,.drawer__name,.drawer__where,.drawer__brief,.drawer__cta'),
          { y:28, duration:.7, ease:'power3.out', stagger:.06, delay:.2, clearProps:'transform' });
      }
    }
    function close(){
      if (!isOpen) return;
      drawer.classList.remove('is-open'); backdrop.classList.remove('is-open');
      drawer.setAttribute('aria-hidden','true'); isOpen = false;
      start(); if (!lenis) document.body.style.overflow = '';
    }
    document.getElementById('drawerClose').addEventListener('click', close);
    backdrop.addEventListener('click', close);
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    const cta = document.getElementById('drawerCta');
    if (cta) cta.addEventListener('click', () => close());
    document.querySelectorAll('.hpanel').forEach(panel => {
      const body = panel.querySelector('.hpanel__body');
      if (body && !body.querySelector('.hpanel__more')){
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'hpanel__more';
        b.innerHTML = 'View brief <span>＋</span>';
        body.appendChild(b);
      }
      panel.addEventListener('click', () => open(panel.id));
    });
  }

  /* ---------- Marquee ---------- */
  function initMarquee(){
    const row = document.querySelector('.marquee__row');
    if (!row || !hasGSAP || reduce) return;
    const w = row.scrollWidth / 2;
    const x = gsap.to(row, { x:-w, duration:24, ease:'none', repeat:-1 });
    if (lenis){
      let v = 0;
      lenis.on('scroll', ({ velocity }) => { v = velocity; });
      gsap.ticker.add(() => {
        const s = 1 + Math.min(Math.abs(v)*.08, 5);
        x.timeScale(gsap.utils.interpolate(x.timeScale(), s, .1));
      });
    }
  }

  /* ---------- Nav behavior ---------- */
  // True while the scroll-build canvas section is active — nav is hidden then.
  let scrollBuildActive = true;

  function initNav(){
    const nav = document.getElementById('nav');
    const burger = document.getElementById('burger');
    const menu = document.getElementById('menu');
    let last = 0;
    const onScroll = (y) => {
      // Progress bar always updates
      const doc = document.documentElement;
      const p = y / (doc.scrollHeight - innerHeight);
      document.getElementById('scrollProgress').style.width = (p*100)+'%';
      // Nav state is owned by initScrollBuild while its section is active
      if (scrollBuildActive) { last = y; return; }
      nav.classList.toggle('is-solid', y > innerHeight*0.7);
      if (y > last && y > innerHeight && !menu.classList.contains('is-open')) nav.classList.add('is-hidden');
      else nav.classList.remove('is-hidden');
      last = y;
    };
    if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
    else addEventListener('scroll', () => onScroll(scrollY), { passive:true });

    const toggle = (open) => {
      menu.classList.toggle('is-open', open);
      nav.classList.toggle('is-open', open);
      open ? stop() : start();
    };
    burger.addEventListener('click', () => toggle(!menu.classList.contains('is-open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));

    // anchor smooth scroll via lenis
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length < 2) return;
        const t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(t, { offset:0, duration:1.4 });
        else t.scrollIntoView({ behavior:'smooth' });
      });
    });
  }

  /* ---------- Boot ---------- */
  function boot(){
    initNav();
    runPreloader(() => {
      initScrollBuild();
      heroIntro();
      initScroll();
      initHorizontal();
      initDrawer();
      initMarquee();
      if (hasGSAP) ScrollTrigger.refresh();
    });
    // recalc once late-loading images settle
    addEventListener('load', () => { if (hasGSAP) ScrollTrigger.refresh(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
