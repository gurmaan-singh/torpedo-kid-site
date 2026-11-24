// All scroll motion for the site (GSAP + ScrollTrigger + Lenis).
//
// Three modes, picked with gsap.matchMedia and re-evaluated when the visitor's settings change:
//  - full motion (no reduced-motion preference): Lenis smooth scroll on fine pointers, the pinned hero,
//    pinned spec callouts, pinned sideways cards on desktop, the scrubbed route, section zoom,
//    photo zoom, marquee, cursor, magnetic buttons, card tilt;
//  - phones and tablets: the same without pins that fight native scroll (cards are a swipe carousel);
//  - reduced motion: no Lenis, no pinning, no scrubbing, no parallax. Content shows with short
//    opacity fades (CSS) and the hero car does a 300 ms, 40 px slide-in.
// Everything is torn down on astro:before-swap and rebuilt on astro:page-load (ClientRouter).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });
gsap.config({ autoRound: false }); // else the 0-to-1 stroke-dashoffset tweens jump instead of draw

// Keep these lists in step with the Motion block in torpedo.css.
const HEADINGS = '.band .title, .hero h1, .intro h1, .mission .statement';
const REVEAL = [
  '.band .copy',
  '.band .sub',
  '.band .textlink',
  '.band .photo-note',
  '.band .row > .txt',
  '.band .partners > li',
  '.band .specs > div',
  '.band ol:not(.stops)',
  '.entry',
  '.gallery li',
  '.member',
  '.callout',
  '.ph:not(.ph-cad)',
].join(', ');

const q = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const qa = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const DEG = 180 / Math.PI;

let mm: gsap.MatchMedia | undefined;
let lenis: Lenis | undefined;
let io: IntersectionObserver | undefined;
let countIo: IntersectionObserver | undefined;
let headings: HTMLElement[] = [];
let introPlayed = false;
let undo: (() => void)[] = [];

// ---- Text and reveals ------------------------------------------------------

// Rebuilds a heading as one masked block per rendered line.
function splitLines(el: HTMLElement) {
  const text = (el.dataset.text ??= (el.textContent ?? '').replace(/\s+/g, ' ').trim());
  el.textContent = '';
  text.split(' ').forEach((w, i, all) => {
    const s = document.createElement('span');
    s.textContent = w;
    el.append(s, i < all.length - 1 ? ' ' : '');
  });
  const lines: string[][] = [];
  let top = -1;
  ([...el.children] as HTMLElement[]).forEach((w) => {
    if (Math.abs(w.offsetTop - top) > 2) {
      lines.push([]);
      top = w.offsetTop;
    }
    lines[lines.length - 1].push(w.textContent as string);
  });
  el.textContent = '';
  lines.forEach((l, i) => {
    const ln = document.createElement('span');
    ln.className = 'ln';
    const li = document.createElement('span');
    li.className = 'li';
    li.style.setProperty('--l', String(i));
    li.textContent = l.join(' ');
    ln.append(li);
    el.append(ln, i < lines.length - 1 ? ' ' : '');
  });
  el.dataset.w = String(Math.round(el.getBoundingClientRect().width));
  el.classList.add('split-done');
}

// Wraps each plain number in a spec value so it can tick up (the /about spec list).
function prepCounters() {
  const spans: HTMLElement[] = [];
  qa('.specs dd').forEach((dd) => {
    const walker = document.createTreeWalker(dd, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    nodes.forEach((node) => {
      const parts = (node.textContent ?? '').split(/((?<![\w.])\d+(?:\.\d+)?(?!\w))/);
      if (parts.length < 2) return;
      const frag = document.createDocumentFragment();
      parts.forEach((part, i) => {
        if (i % 2 === 0) return part && frag.append(part);
        const s = document.createElement('span');
        s.className = 'num';
        s.dataset.to = part;
        s.style.minWidth = `${part.length}ch`;
        s.textContent = '0';
        spans.push(s);
        frag.append(s);
      });
      node.replaceWith(frag);
    });
  });
  return spans;
}

const decimals = (el: HTMLElement) => (el.dataset.to as string).split('.')[1]?.length ?? 0;

async function reveals(reduce: boolean) {
  io?.disconnect();
  countIo?.disconnect();
  const targets = qa([HEADINGS, REVEAL].join(', '));
  if (!('IntersectionObserver' in window)) return targets.forEach((el) => el.classList.add('in'));
  try {
    if (!reduce) {
      await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]);
      headings = qa(HEADINGS);
      headings.forEach(splitLines);
    }
    io = new IntersectionObserver(
      (entries) => {
        // Light stagger for items that enter together, capped so a fast scroll never queues long delays.
        entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left
          )
          .forEach((e, i) => {
            if (!reduce) (e.target as HTMLElement).style.setProperty('--d', `${Math.min(i * 80, 320)}ms`);
            e.target.classList.add('in');
            io?.unobserve(e.target);
          });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );
    targets.forEach((el) => io?.observe(el));
    if (!reduce) {
      const counters = prepCounters();
      countIo = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            countIo?.unobserve(e.target);
            const el = e.target as HTMLElement;
            const to = parseFloat(el.dataset.to as string);
            const proxy = { v: 0 };
            gsap.to(proxy, {
              v: 1,
              duration: 1.3,
              delay: 0.25,
              ease: 'power3.out',
              onUpdate: () => (el.textContent = (to * proxy.v).toFixed(decimals(el))),
            });
          }),
        { threshold: 0.6 }
      );
      counters.forEach((el) => countIo?.observe(el));
    }
  } catch {
    // Never leave content hidden.
    targets.forEach((el) => el.classList.add('in'));
  }
}

// ---- Sections ------------------------------------------------------------------

function hero(reduce: boolean, desk: boolean, hh: number) {
  const el = q('[data-hero]');
  const carIn = q('[data-car-in]');
  const carOut = q('[data-car-out]');
  const copy = q('[data-hero-copy]');
  if (!el || !carIn || !carOut || !copy) return;
  const wheelsIn = qa('.wheel-intro', el);
  const wheelsOut = qa('.wheel-scroll', el);
  const body = q('.car-body', el);
  const speed = q('.speed', el);
  const lines = qa('i', speed ?? el);

  if (reduce) {
    if (!introPlayed) gsap.fromTo(carIn, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
    introPlayed = true;
    document.documentElement.classList.add('mo');
    return;
  }

  const w = carIn.offsetWidth;
  const rad = (w * 112) / 1200; // wheel radius in px
  const off = -(carIn.getBoundingClientRect().left + w + 24);

  gsap.set([...wheelsIn, ...wheelsOut], { transformOrigin: '50% 50%' }); // spin about the hub
  if (!introPlayed) {
    gsap.set(carIn, { x: off });
    gsap.set(speed, { opacity: 1 });
    document.documentElement.classList.add('mo');
    const dur = 2.6;
    const tl = gsap.timeline();
    tl.to(carIn, { x: 0, duration: dur, ease: 'power3.out' }, 0)
      .fromTo(wheelsIn, { rotation: (off / rad) * DEG }, { rotation: 0, duration: dur, ease: 'power3.out' }, 0)
      .to(body, { y: -3, duration: 0.12, ease: 'sine.inOut', yoyo: true, repeat: 15 }, 0)
      .to(lines, { scaleX: 1, duration: 0.5, ease: 'power2.out', stagger: 0.06 }, 0.05)
      .to(lines, { scaleX: () => gsap.utils.random(0.55, 1), duration: 0.18, repeat: 7, yoyo: true, stagger: 0.03 }, 0.6)
      .to(speed, { opacity: 0, duration: 1.1, ease: 'power1.in' }, dur - 1.2)
      .to(body, { y: -1.5, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.92);
    introPlayed = true;
  } else {
    document.documentElement.classList.add('mo');
    gsap.set(speed, { opacity: 0 });
  }

  // Hand-off: the hero pins, the car accelerates out to the right and zooms, the headline falls back.
  el.classList.add('is-pin');
  undo.push(() => el.classList.remove('is-pin'));
  const travel = innerWidth * 1.25;
  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: el, start: `top top+=${hh}`, end: desk ? '+=120%' : '+=90%', pin: true, scrub: 0.6, anticipatePin: 1 },
    })
    .to(carOut, { x: travel, scale: desk ? 1.6 : 1.25, ease: 'power2.in', duration: 1 }, 0)
    .to(wheelsOut, { rotation: (travel / rad) * DEG, ease: 'power2.in', duration: 1 }, 0)
    .to(speed, { opacity: 1, duration: 0.25 }, 0.05)
    .to(lines, { scaleX: 2.4, stagger: 0.03, duration: 0.8 }, 0.05)
    .to(copy, { scale: 0.88, opacity: 0, transformOrigin: '0% 30%', ease: 'power1.in', duration: 0.7 }, 0.1);
}

function marquee() {
  const el = q('[data-marquee]');
  const track = q('.track', el ?? document);
  const first = q('.copy-a', el ?? document);
  if (!el || !track || !first) return;
  const loop = gsap.to(track, { x: -first.offsetWidth, duration: first.offsetWidth / 90, ease: 'none', repeat: -1 });
  let boost = 0;
  let dir = 1;
  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      boost = Math.min(Math.abs(self.getVelocity()) / 260, 9);
      dir = self.direction;
    },
  });
  const skew = gsap.quickSetter(track, 'skewX', 'deg');
  const tick = () => {
    boost *= 0.94;
    loop.timeScale(dir * (1 + boost));
    skew(clamp(-dir * boost * 1.1, -8, 8));
  };
  gsap.ticker.add(tick);
  undo.push(() => gsap.ticker.remove(tick));
}

// The pinned CAD render: one leader line and one callout per scroll step.
function build(hh: number) {
  const sec = q('[data-build-section]');
  const wrap = q('.wrap', sec ?? document);
  const stage = q('.stage', sec ?? document);
  const list = q('.callouts', sec ?? document);
  if (!sec || !wrap || !stage || !list) return;
  const callouts = qa('.callout', list);
  const leads = qa('.lead', stage);
  [list, sec].forEach((e) => e.classList.add('is-pin'));
  undo.push(() => [list, sec].forEach((e) => e.classList.remove('is-pin')));
  // Value text counts up; the final text is restored on cleanup.
  const nums = callouts.map((c) => qa('.num', c));
  nums.flat().forEach((n) => (n.textContent = '0'));
  undo.push(() => nums.flat().forEach((n) => (n.textContent = n.dataset.to as string)));

  gsap.set(leads.map((l) => q('path', l)), { strokeDashoffset: 100 });
  gsap.set(leads.map((l) => q('circle', l)), { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
  gsap.set(callouts, { opacity: 0 });
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: wrap, start: `top top+=${hh}`, end: '+=320%', pin: true, scrub: 0.5, anticipatePin: 1 },
  });
  // The image is scaled, not the stage: a transformed stage would isolate the image's multiply blend.
  tl.fromTo(q('.cad-img', stage), { scale: 0.9 }, { scale: 1, duration: 0.6, ease: 'power1.out' }, 0);
  callouts.forEach((c, i) => {
    const t = 0.7 + i;
    const side = c.dataset.side === 'l' ? -1 : 1;
    tl.to(q('path', leads[i]), { strokeDashoffset: 0, duration: 0.5, ease: 'power1.inOut' }, t)
      .to(q('circle', leads[i]), { scale: 1, opacity: 1, duration: 0.15 }, t)
      .fromTo(c, { opacity: 0, x: side * 28 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }, t + 0.35);
    nums[i].forEach((n) => {
      const to = parseFloat(n.dataset.to as string);
      const proxy = { v: 0 };
      tl.to(proxy, { v: 1, duration: 0.6, ease: 'power2.out', onUpdate: () => (n.textContent = (to * proxy.v).toFixed(decimals(n))) }, t + 0.35);
    });
  });
  tl.to({}, { duration: 0.6 });
}

// The work cards: pinned sideways scroll on desktop, with a "03 / 08" counter.
function work(hh: number) {
  const sec = q('[data-work]');
  const track = q('[data-hs-track]');
  const count = q('[data-count]');
  if (!sec || !track) return;
  const cards = qa('.row', track);
  const total = String(cards.length).padStart(2, '0');
  sec.classList.add('is-hs');
  undo.push(() => sec.classList.remove('is-hs'));
  const pad = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
  const dist = () => track.scrollWidth - innerWidth + pad();
  const tween = gsap.to(track, { x: () => -dist(), ease: 'none' });
  ScrollTrigger.create({
    trigger: sec,
    start: `top top+=${hh}`,
    end: () => `+=${dist()}`,
    pin: true,
    animation: tween,
    scrub: 0.5,
    invalidateOnRefresh: true,
    anticipatePin: 1,
    onUpdate: (self) => {
      if (count) count.textContent = `${String(Math.min(cards.length, Math.floor(self.progress * cards.length) + 1)).padStart(2, '0')} / ${total}`;
    },
  });
  // Each photo wipes in as its card enters, with the image settling inside its frame.
  cards.forEach((card) => {
    const img = q<HTMLImageElement>('.ph:not(.ph-cad) img', card);
    if (!img) return;
    gsap.fromTo(
      img,
      { clipPath: 'inset(0% 100% 0% 0%)', scale: 1.25, xPercent: -6 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1,
        xPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 96%', end: 'right 10%', scrub: true },
      }
    );
  });
  undo.push(() => qa('.ph img', track).forEach((i) => gsap.set(i, { clearProps: 'all' })));
}

// Reduced motion: the route is fully drawn and the car sits at the end of it.
function roadStatic() {
  const path = q<SVGPathElement>('#route');
  const car = q('.rcar');
  if (!path || !car) return;
  gsap.set(path, { strokeDashoffset: 0 });
  gsap.timeline().to(car, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true }, duration: 1 }).progress(1);
  gsap.set(car, { opacity: 1 });
}

// The route to Sweden: path draws, car icon follows it, milestones appear.
function road(desk: boolean, hh: number) {
  const el = q('[data-road]');
  const path = q<SVGPathElement>('#route');
  const car = q('.rcar');
  if (!el || !path || !car) return;
  const dots = qa('.dot', el);
  const stops = qa('.stop', el);
  gsap.set(path, { strokeDashoffset: 100 });
  gsap.set(car, { opacity: 1 });
  gsap.set(dots, { scale: 0, opacity: 0 });
  gsap.set(stops, { opacity: 0, x: -16 });
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: desk
      ? { trigger: el, start: `top top+=${hh}`, end: '+=260%', pin: true, scrub: 0.6, anticipatePin: 1 }
      : { trigger: el, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
  });
  tl.fromTo(q('.map', el), { scale: desk ? 0.88 : 0.94 }, { scale: 1, duration: 0.08, ease: 'power1.out' }, 0)
    .to(path, { strokeDashoffset: 0, duration: 1 }, 0)
    .to(car, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true }, duration: 1 }, 0);
  dots.forEach((d, i) => {
    const at = parseFloat(stops[i]?.dataset.at ?? '0');
    tl.to(d, { scale: 1, opacity: 1, duration: 0.05, ease: 'back.out(2)' }, Math.max(0, at - 0.02));
    if (stops[i]) tl.to(stops[i], { opacity: 1, x: 0, duration: 0.07, ease: 'power2.out' }, Math.max(0, at - 0.02));
  });
  // Start with the car on the path, not at the SVG origin.
  tl.progress(0.0001).progress(0);
}

// Sections that arrive as cards: scale up from 92% with rounded corners, then settle full width.
function zoomSections(small: boolean) {
  qa('[data-zoom]').forEach((el) => {
    gsap.fromTo(
      el,
      { scale: small ? 0.96 : 0.92, clipPath: 'inset(0px round 2rem)' },
      {
        scale: 1,
        clipPath: 'inset(0px round 0rem)',
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 30%', scrub: true },
      }
    );
  });
}

// Photos zoom from 1.15 to 1 inside their frames while they cross the screen.
function photos(small: boolean) {
  qa<HTMLImageElement>('.ph:not(.ph-cad) img').forEach((img) => {
    if (img.closest('[data-hs-track]') && img.closest('.is-hs')) return;
    gsap.fromTo(
      img,
      { scale: small ? 1.08 : 1.15, yPercent: small ? -2 : -4 },
      {
        scale: 1,
        yPercent: small ? 2 : 4,
        ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });
}

// ---- Pointer extras (fine pointers, full motion) ----------------------------

function pointerExtras() {
  const html = document.documentElement;
  const cur = q('.cursor');
  const offs: (() => void)[] = [];
  const on = <K extends keyof DocumentEventMap>(t: EventTarget, e: string, f: (ev: any) => void) => {
    t.addEventListener(e, f);
    offs.push(() => t.removeEventListener(e, f));
  };
  if (cur) {
    html.classList.add('has-cursor');
    gsap.set(cur, { scale: 0.4, opacity: 0 });
    const xTo = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
    let shown = false;
    on(document, 'pointermove', (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const over = !!(e.target as Element).closest?.('.ph:not(.slot-empty), [data-lightbox]');
      if (over !== shown) {
        shown = over;
        gsap.to(cur, { scale: over ? 1 : 0.4, opacity: over ? 1 : 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
      }
    });
    offs.push(() => html.classList.remove('has-cursor'));
  }
  // Magnetic buttons.
  qa('.cta').forEach((b) => {
    const x = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    const y = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    on(b, 'pointermove', (e: PointerEvent) => {
      const r = b.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.3);
      y((e.clientY - (r.top + r.height / 2)) * 0.3);
    });
    on(b, 'pointerleave', () => {
      x(0);
      y(0);
    });
  });
  // Team cards tilt toward the pointer.
  qa('[data-tilt]').forEach((c) => {
    const rx = gsap.quickTo(c, 'rotationX', { duration: 0.4, ease: 'power2.out' });
    const ry = gsap.quickTo(c, 'rotationY', { duration: 0.4, ease: 'power2.out' });
    gsap.set(c, { transformPerspective: 800 });
    on(c, 'pointermove', (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 12);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
    });
    on(c, 'pointerleave', () => {
      rx(0);
      ry(0);
    });
  });
  return () => {
    offs.forEach((f) => f());
    qa('.cta, [data-tilt]').forEach((e) => gsap.set(e, { clearProps: 'all' }));
  };
}

// ---- Always on: lightbox, carousel counter ---------------------------------

function lightbox() {
  const dlg = q<HTMLDialogElement>('dialog.lightbox');
  if (!dlg) return;
  const img = q<HTMLImageElement>('img', dlg) as HTMLImageElement;
  const cap = q('.cap', dlg) as HTMLElement;
  qa('[data-lightbox]').forEach((b) =>
    b.addEventListener('click', () => {
      img.src = b.dataset.lightbox as string;
      img.alt = b.dataset.alt ?? '';
      cap.textContent = b.dataset.alt ?? '';
      lenis?.stop();
      dlg.showModal();
    })
  );
  q('.close', dlg)?.addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => e.target === dlg && dlg.close());
  dlg.addEventListener('close', () => lenis?.start());
}

function carouselCounter() {
  const rows = q('[data-hs-track]');
  const count = q('[data-count]');
  if (!rows || !count) return;
  const n = rows.children.length;
  rows.addEventListener(
    'scroll',
    () => {
      const max = rows.scrollWidth - rows.clientWidth;
      const i = max > 0 ? Math.round((rows.scrollLeft / max) * (n - 1)) : 0;
      count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
    },
    { passive: true }
  );
}

// ---- Lifecycle ---------------------------------------------------------------------

function setup() {
  const html = document.documentElement;
  const hh = q('.site-header')?.getBoundingClientRect().height ?? 72;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  reveals(reduce);
  lightbox();
  carouselCounter();
  bindReadFallback();

  mm = gsap.matchMedia();
  mm.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      desk: '(min-width: 1024px)',
      tall: '(min-height: 700px)',
      fine: '(hover: hover) and (pointer: fine)',
    },
    (ctx) => {
      const c = ctx.conditions as Record<string, boolean>;
      hero(!!c.reduce, !!c.desk, hh);
      if (c.reduce) return roadStatic();
      if (c.fine) {
        lenis = new Lenis({ anchors: { offset: -hh } as any });
        lenis.on('scroll', ScrollTrigger.update);
        const raf = (t: number) => lenis?.raf(t * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
        undo.push(() => {
          gsap.ticker.remove(raf);
          lenis?.destroy();
          lenis = undefined;
        });
      }
      marquee();
      if (c.desk && c.tall) build(hh);
      if (c.desk) work(hh);
      road(!!(c.desk && c.tall), hh);
      zoomSections(!c.desk);
      photos(!c.desk);
      if (c.fine) undo.push(pointerExtras());
      return () => {
        undo.forEach((f) => f());
        undo = [];
      };
    }
  );
  // Fonts and images move things: measure again once they are in.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  if (document.readyState !== 'complete') addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

// Browsers without CSS scroll timelines: drive the header progress bar from script.
let readBound = false;
function bindReadFallback() {
  if (readBound || CSS.supports('animation-timeline: scroll()')) return;
  readBound = true;
  addEventListener(
    'scroll',
    () =>
      q('.progress')?.style.setProperty(
        '--read',
        String(clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)))
      ),
    { passive: true }
  );
}

function teardown() {
  mm?.revert();
  mm = undefined;
  undo.forEach((f) => f());
  undo = [];
  lenis?.destroy();
  lenis = undefined;
  ScrollTrigger.getAll().forEach((t) => t.kill());
  io?.disconnect();
  countIo?.disconnect();
  introPlayed = false;
}

let resizeTimer: number | undefined;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    // Line breaks depend on width, so rebuild any heading whose width changed.
    headings
      .filter((h) => h.isConnected && String(Math.round(h.getBoundingClientRect().width)) !== h.dataset.w)
      .forEach(splitLines);
  }, 250);
});
document.addEventListener('astro:before-swap', teardown);
document.addEventListener('astro:page-load', setup);
