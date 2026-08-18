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
    // Pre-warm frame 1 during preloader — ensures it hits cache before the split
    new Image().src = 'assets/img/seq/frame0001.jpg';
    const curtL = document.getElementById('curtainL');
    const curtR = document.getElementById('curtainR');
    gsap.set(curtL, {xPercent:0, visibility:'hidden'});
    gsap.set(curtR, {xPercent:0, visibility:'hidden'});
    let finished = false;
    const finish = () => { if (finished) return; finished = true; gsap.set(pre,{display:'none'}); done(); };
    const guard = setTimeout(finish, 9000);
    const morphWord = document.getElementById('preMorphWord');
    const tl = gsap.timeline({ onComplete: () => { clearTimeout(guard); finished = true; gsap.set([curtL,curtR],{visibility:'hidden'}); } });
    tl.to(letters, { opacity:1, y:0, stagger:.05, duration:.6, ease:'power3.out' }, .1)
      .to(fill, { width:'100%', duration:1.1, ease:'power2.inOut' }, .2)
      .to('.preloader__lion', { scale:1.08, duration:.6, ease:'power2.out' }, '-=.4')
      .to('.preloader__tagline', { opacity:1, duration:.6, ease:'power3.out' }, '-=.5')
      .to(morphWord, { opacity:0, filter:'blur(6px)', y:-6, duration:.35, ease:'power2.in' }, '+=.35')
      .call(() => { if (morphWord) morphWord.textContent = 'memories'; })
      .to(morphWord, { opacity:1, filter:'blur(0px)', y:0, duration:.45, ease:'power2.out' })
      .call(() => { gsap.set([curtL,curtR],{visibility:'visible'}); gsap.set(pre,{display:'none'}); setTimeout(finish, 0); })
      .to(curtL, { xPercent:-100, duration:1.1, ease:'power4.inOut' })
      .to(curtR, { xPercent:100, duration:1.1, ease:'power4.inOut' }, '<');
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
        if (i === 1) {
          drawImg(img);
          if (tagline) tagline.classList.add('is-visible'); // show from plain wall immediately
        }
        if (i === currentIdx) drawImg(img);
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
        if (nav) { nav.classList.remove('is-solid'); }
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

  /* ---------- Horizontal project rail — replaced by accordion ---------- */
  function initHorizontal(){
    if (!hasGSAP || reduce) return;
    if (window.matchMedia('(max-width:767px)').matches) return;
    const track = document.getElementById('hTrack');
    const pin   = document.querySelector('.hwork__pin');
    if (!track || !pin) return;
    gsap.to(track, {
      x: () => -(track.scrollWidth - window.innerWidth),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });
  }

  /* ---------- Horizontal scroll rail — click to reveal detail inline ---------- */
  function initDrawer(){
    const PROJECTS = {
      canter: { brief:[
        "A celebration of ranch heritage reimagined for contemporary hospitality. Drawing from Oklahoma's singing-cowboy legacy and vernacular ranch architecture, the design honours regional authenticity while delivering refined comfort.",
        "Stone, reclaimed timber and handcrafted metalwork create layered textures throughout — from the double-height lobby fireplace to intimate bar nooks — balancing rustic warmth with sophisticated restraint."
      ]},
      hardrock: { brief:[
        "A bold entertainment destination blending luxury and heritage. Transforming the historic Hellinikon Airport, it becomes the first integrated resort of its kind in continental Europe.",
        "The central tower's fluid form harmonises with the landscape — modern luxury rooted in ancient heritage — embracing the Mediterranean climate with more than 200,000 m² of green open space."
      ]},
      manhattan: { brief:[
        "Designed as private observatories suspended in the sky. Floor-to-ceiling glass dissolves boundaries — Central Park unfolds below, the Manhattan skyline extends infinitely.",
        "Materials respond to daylight: stone warms to gold at sunrise, plaster glows silver at dusk. Sublime vertical living that feels less like an apartment than inhabiting the air above New York."
      ]},
      klein: { brief:[
        "An industrial heritage reframed as a warm, human workplace. Exposed brick, reclaimed timber and steel are softened into a space that invites people to gather, linger and work.",
        "Layered textures, generous daylight and a double-height atrium give the everyday a sense of occasion — sophisticated restraint standing in for nostalgia."
      ]}
    };

    let active = null;
    const allPanels = document.querySelectorAll('.hpanel');

    allPanels.forEach(panel => {
      const p = PROJECTS[panel.id];
      if (!p) return;

      // Read meta from the already-rendered DOM
      const num  = (panel.querySelector('.hpanel__idx')?.textContent || '').split(' ')[0];
      const name = panel.querySelector('.hpanel__name')?.textContent || '';
      const where = panel.querySelector('.hpanel__where')?.textContent || '';

      // Inject detail overlay
      const det = document.createElement('div');
      det.className = 'hpanel__detail';
      det.innerHTML =
        `<div>
           <div class="hpanel__det-num">${num}</div>
           <div class="hpanel__det-name script">${name}</div>
           <div class="hpanel__det-where">${where.replace(/\s·\s/g,'<br>')}</div>
         </div>
         <div class="hpanel__det-rule"></div>
         <div class="hpanel__det-right">
           ${p.brief.map(t=>`<p class="hpanel__det-brief">${t}</p>`).join('')}
           <a class="hpanel__det-cta" href="projects.html">View all projects &nbsp;→</a>
         </div>`;
      panel.appendChild(det);

      panel.addEventListener('click', () => {
        if (panel.classList.contains('is-active')) {
          panel.classList.remove('is-active');
          active = null;
        } else {
          if (active) active.classList.remove('is-active');
          panel.classList.add('is-active');
          active = panel;
          if (hasGSAP && !reduce){
            const targets = det.querySelectorAll('.hpanel__det-num,.hpanel__det-name,.hpanel__det-where,.hpanel__det-brief,.hpanel__det-cta');
            gsap.killTweensOf(targets);
            gsap.from(targets, { y:18, opacity:0, duration:.44, ease:'power2.out', stagger:.055, delay:.12, clearProps:'all', immediateRender:false });
          }
        }
      });
    });
  }

  /* ---------- Project scene: scroll-driven image switch ---------- */
  function initProjectScenes(){
    const scenes = document.querySelectorAll('.pj-scene');
    if (!scenes.length) return;
    const mobile = window.matchMedia('(max-width:767px)').matches;
    scenes.forEach(function(scene){
      const imgs     = scene.querySelectorAll('.pj-scene__img');
      const chapters = scene.querySelectorAll('.pj-chapter[data-img]');
      if (!imgs.length || !chapters.length) return;
      function setImg(idx){
        imgs.forEach(function(img,i){ img.classList.toggle('is-active', i === idx); });
      }
      setImg(0);
      if (mobile) return;
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting) setImg(parseInt(entry.target.dataset.img || '0'));
        });
      }, { rootMargin: '-38% 0px -38% 0px' });
      chapters.forEach(function(ch){ obs.observe(ch); });
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
      nav.classList.add('is-solid');
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

  /* ---------- HP feature scenes: parallax + image-fill text ---------- */
  function initHPFeatures(){
    var feats = document.querySelectorAll('.hp-feat');
    if (!feats.length) return;

    feats.forEach(function(feat){
      var img1 = feat.querySelector('.hp-feat__img--1');
      var img2 = feat.querySelector('.hp-feat__img--2');
      var name = feat.querySelector('.hp-feat__name');

      // Assign background-image to name for background-clip: text fill
      if (name && name.dataset.bg) {
        name.style.backgroundImage = 'url(' + name.dataset.bg + ')';
      }

      if (!hasGSAP || reduce) return;

      // Parallax: images drift upward at half the scroll speed
      [img1, img2].forEach(function(img){
        if (!img) return;
        gsap.fromTo(img,
          { yPercent: 0 },
          { yPercent: -18, ease: 'none',
            scrollTrigger: { trigger: feat, start: 'top top', end: 'bottom bottom', scrub: true } }
        );
      });

      // Image-fill text: background-position moves slower than page = fluid parallax inside letters
      if (name && name.dataset.bg) {
        ScrollTrigger.create({
          trigger: feat,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: function(self){
            var y = 20 + self.progress * 55; // 20% → 75%
            name.style.backgroundPositionY = y + '%';
          }
        });
      }

      // Crossfade: swap images at 50% scroll progress
      if (img1 && img2) {
        ScrollTrigger.create({
          trigger: feat,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: function(self){
            var swapped = self.progress >= 0.5;
            img1.classList.toggle('is-active', !swapped);
            img2.classList.toggle('is-active', swapped);
            // also update name bg
            if (name) {
              var src = swapped ? feat.querySelector('.hp-feat__img--2').src : feat.querySelector('.hp-feat__img--1').src;
              name.style.backgroundImage = 'url(' + src + ')';
            }
          }
        });
      }
    });
  }

  /* ---------- Page-exit curtain transition ---------- */
  function pageLeave(href){
    if (!hasGSAP || reduce){ window.location.href = href; return; }
    stop();
    const curtL = document.getElementById('curtainL');
    const curtR = document.getElementById('curtainR');
    if (!curtL || !curtR){ window.location.href = href; return; }
    gsap.set([curtL,curtR],{visibility:'visible'});
    gsap.timeline({ onComplete:()=>{ window.location.href = href; } })
      .fromTo(curtL,{xPercent:-100},{xPercent:0,duration:.75,ease:'power3.inOut'})
      .fromTo(curtR,{xPercent:100},{xPercent:0,duration:.75,ease:'power3.inOut'},'<');
  }

  function initPageTransitions(){
    document.querySelectorAll('[data-page-transition]').forEach(function(a){
      a.addEventListener('click', function(e){
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#')) return;
        e.preventDefault();
        pageLeave(href);
      });
    });
  }

  /* ---------- Boot ---------- */
  function boot(){
    initNav();
    runPreloader(() => {
      const nav = document.getElementById('nav');
      if (nav) nav.classList.remove('is-hidden');
      initScrollBuild();
      heroIntro();
      initScroll();
      initHorizontal();
      initDrawer();
      initProjectScenes();
      initHPFeatures();
      initMarquee();
      initPageTransitions();
      if (hasGSAP) ScrollTrigger.refresh();
    });
    // recalc once late-loading images settle
    addEventListener('load', () => { if (hasGSAP) ScrollTrigger.refresh(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
