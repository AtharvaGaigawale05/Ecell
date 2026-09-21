import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { createScene } from './scene.js'

import './style.css'

gsap.registerPlugin(ScrollTrigger)

/* ============================================================
   Smooth scroll (Lenis) + GSAP sync
   ============================================================ */

const lenis = new Lenis({
  duration: 1.15,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true
})

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)

/* ============================================================
   WebGL scene
   ============================================================ */

const canvas = document.getElementById('webgl')
let sceneApi = null
try {
  sceneApi = createScene(canvas)
} catch (err) {
  console.warn('WebGL unavailable, continuing without 3D', err)
  canvas.style.display = 'none'
}

/* ============================================================
   Preloader — counter drives the bar, then curtain reveal
   ============================================================ */

const preloader = document.getElementById('preloader')
const countEl = document.getElementById('preloaderCount')
const barEl = document.getElementById('preloaderBar')
const ringEl = document.querySelector('.preloader__ring')

const counter = { value: 0 }
let preloadDone = false

function heroIntro () {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

  tl.fromTo('.hero__word span',
    { yPercent: 115, rotate: 3 },
    { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.045 }, 0)
    .fromTo('.nav',
      { y: -26, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 }, 0.35)
    .fromTo('.hero__kicker, .hero__sub, .hero__hint, .hero__side',
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.5)
    .fromTo('.hero__cta, .hero__frame',
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 1.1 }, 0.7)
    .fromTo(canvas,
      { opacity: 0 },
      { opacity: 1, duration: 2 }, 0.3)

  // reveal-on-scroll fallback: hero bits already in view now
  document.querySelectorAll('.hero .reveal').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.top < window.innerHeight) el.classList.add('is-in')
  })
}

function finishPreload () {
  if (preloadDone) return
  preloadDone = true
  const tl = gsap.timeline()

  tl.to(counter, {
    value: 100,
    duration: 0.5,
    ease: 'power2.inOut',
    onUpdate: () => {
      const v = Math.round(counter.value)
      countEl.textContent = String(v).padStart(2, '0')
      barEl.style.width = v + '%'
      if (ringEl) ringEl.style.strokeDashoffset = 289 - 289 * (v / 100)
    }
  })
    .to('.preloader__inner, .preloader__bar', {
      y: -30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.inOut'
    })
    .to(preloader, {
      yPercent: -100,
      duration: 1,
      ease: 'expo.inOut'
    }, '-=0.1')
    .add(() => {
      preloader.style.display = 'none'
      heroIntro()
      lenis.start() // release scroll after the curtain lifts
      ScrollTrigger.refresh()
    }, '-=0.55')
}

// lock scroll during preload
lenis.stop()
window.addEventListener('load', finishPreload)
// safety: if load already fired or hangs, run after fonts settle
setTimeout(() => {
  if (preloader.style.display !== 'none') finishPreload()
}, 3500)

/* ============================================================
   Team — one entry per person. Add/edit/remove here and the
   DOM updates automatically. Set `photo` to a path like
   './team/aarav.jpg' (drop files in public/team/) and `li` to
   the real LinkedIn URL when available.
   ============================================================ */

const TEAM = [
  { name: 'Ayesha Tulajapure', role: 'President', initials: 'AT', photo: './team/ayesha-tulajapure.jpg', li: 'https://www.linkedin.com/in/ayesha-tulajapure-0935813a6/' },
  { name: 'Prajwal Shinde', role: 'Vice President', initials: 'PS', photo: './team/prajwal-shinde.jpg' },
  { name: 'Atharva Gaigawale', role: 'Technical Head', initials: 'AG', photo: './team/atharva-gaigawale.jpg', li: 'https://www.linkedin.com/in/atharva-gaigawale-31020132b/' },
  { name: 'Omkar Waghmare', role: 'Management Head', initials: 'OW', photo: './team/omkar-waghmare.jpg', li: 'https://www.linkedin.com/in/omkar-amar-waghmare-776204308/' },
  { name: 'Niladri Das', role: 'Financial Head', initials: 'ND', photo: './team/niladri-das.jpg', li: 'https://www.linkedin.com/in/niladri-das-426746321/' },
  { name: 'Eliza Sayed', role: 'Social Media Head', initials: 'ES', photo: './team/eliza-sayed.jpg', li: 'https://www.linkedin.com/in/eliza-sayed-1a55823a6/' },
  { name: 'Aisha Sarkhot', role: 'PR Head', initials: 'AS', photo: './team/aisha-sarkhot.jpg', li: 'https://www.linkedin.com/in/aisha-sarkhot-1606193a4/' },
  { name: 'Kajal Pawar', role: 'Documentation Head', initials: 'KP', photo: './team/kajal-pawar.jpg', li: 'https://www.linkedin.com/in/kajalpawar10/' },
  { name: 'Amena Pathan', role: 'Documentation Head', initials: 'AP', photo: './team/amena-pathan.jpg', li: 'https://www.linkedin.com/in/amena-pathan-4013b9330/' },
  { name: 'Aanam Shaikh', role: 'Video Editor', initials: 'AS', photo: './team/aanam-shaikh.jpg', li: 'https://www.linkedin.com/in/aanam-shaikh-8b71bb32b/' },
  { name: 'Kartik Jadhav', role: 'Design Head', initials: 'KJ', photo: './team/kartik-jadhav.png', li: 'https://www.linkedin.com/in/katrixbee/' },
  { name: 'Ayesha Shaikh', role: 'Volunteer', initials: 'AS', li: 'https://www.linkedin.com/in/ayesha-shaikh-b6a9a832a/' },
  { name: 'Jay Jagtap', role: 'Volunteer', initials: 'JJ', photo: './team/jay-jagtap.png', li: 'https://www.linkedin.com/in/jay-jagtap-a64a4b3a9/' },
  { name: 'Soham Chavan', role: 'Volunteer', initials: 'SC', photo: './team/soham-chavan.png', li: 'https://linkedin.com/in/soham-chavan-60b093428' },
  { name: 'Shubham Pawar', role: 'Volunteer', initials: 'SP', photo: './team/shubham-pawar.jpg', li: 'https://www.linkedin.com/in/shubham-pawar-034782413/' },
  { name: 'Prof. Ashish Modak', role: 'Faculty Advisor', note: 'Head, Computer Department', initials: 'AM', advisor: true, photo: './team/ashish-modak.jpg' }
]

// single-file builds swap asset paths for inlined data URIs.
// WebKit chokes on large data: URIs for images, so decode to Blob URLs
const toBlobUrl = (uri) => {
  try {
    const bin = atob(uri.split(',')[1])
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return URL.createObjectURL(new Blob([bytes], { type: uri.slice(uri.indexOf(':') + 1, uri.indexOf(';')) }))
  } catch { return uri }
}

// native lazy-load can stall when rendering is throttled (background tabs,
// embedded webviews) or the page is jumped long distances (anchor clicks,
// smooth-scroll). Flip images to eager just before they enter the viewport
// via three triggers — scroll events, GSAP's rAF ticker and a timer — each
// self-removing once every image is promoted, so portraits/gallery shots
// never stick on their placeholder.
function promoteLazy (selector) {
  const pending = [...document.querySelectorAll(selector)]
  if (!pending.length) return
  const promote = () => {
    for (let i = pending.length - 1; i >= 0; i--) {
      const img = pending[i]
      const r = img.getBoundingClientRect()
      if (r.top < window.innerHeight + 600 && r.bottom > -600) {
        if (img.loading === 'lazy') img.loading = 'eager'
        pending.splice(i, 1)
      }
    }
    if (!pending.length) {
      window.removeEventListener('scroll', promote)
      gsap.ticker.remove(promote)
      clearInterval(promoteIv)
    }
  }
  window.addEventListener('scroll', promote, { passive: true })
  gsap.ticker.add(promote) // rAF-driven: works even when scroll events are throttled
  const promoteIv = setInterval(promote, 1500) // timer fallback: works even when rAF is suspended
  promote()
}

function memberCard (m, idx) {
  return `
    <article class="member reveal${m.advisor ? ' member--advisor member--feature' : ''}">
      <figure class="member__media">
        <img class="member__photo"
             ${m.photo ? `src="${m.photo}"` : ''}
             alt="${m.name}"
             data-initials="${m.initials}"
             loading="lazy" />
        ${idx ? `<span class="member__idx">${String(idx).padStart(2, '0')}</span>` : ''}
      </figure>
      <div class="member__row">
        <div>
          <h3 class="member__name">${m.name}</h3>
          <p class="member__role">${m.role}</p>
          ${m.note ? `<p class="member__note">${m.note}</p>` : ''}
        </div>
        <a class="member__li"
           href="${m.li || '#'}"
           aria-label="${m.name} on LinkedIn"
           data-cursor="connect">in</a>
      </div>
    </article>`
}

const JOIN_CARD = `
  <a class="member member--cta" href="#join" data-cursor="join">
    <span class="member__cta-top">✦ Open seats</span>
    <span class="member__cta-you">YOU?</span>
    <span class="member__cta-bottom">Core &amp; volunteer roles every semester <i>→</i></span>
  </a>`

function renderTeam () {
  const grid = document.querySelector('.team__grid')
  const advisorSlot = document.getElementById('teamAdvisor')
  if (!grid) return

  const advisors = TEAM.filter((m) => m.advisor)
  const students = TEAM.filter((m) => !m.advisor)

  // faculty advisor gets its own feature card above the grid;
  // a join-CTA card fills the last slot so the grid stays complete
  if (advisorSlot) advisorSlot.innerHTML = advisors.map((m) => memberCard(m, 0)).join('')
  grid.innerHTML = students.map((m, i) => memberCard(m, i + 1)).join('') + JOIN_CARD

  document.querySelectorAll('#team .member__li').forEach((a) => {
    const name = a.getAttribute('aria-label') || 'E-Cell member'
    if (a.getAttribute('href') === '#') {
      a.href = 'https://www.linkedin.com/search/results/all/?keywords=' + encodeURIComponent(name + ' Trinity Polytechnic')
      a.target = '_blank'
      a.rel = 'noopener'
    }
  })

  // single-file builds swap ./team/* paths for inlined data URIs.
  // WebKit chokes on large data: URIs for images too, so decode to Blob URLs
  const teamPhotos = window.__TEAM_PHOTOS__ || {}
  document.querySelectorAll('#team .member__photo').forEach((img) => {
    const src = img.getAttribute('src')
    if (teamPhotos[src]) img.src = toBlobUrl(teamPhotos[src])

    const mono = document.createElement('span')
    mono.className = 'member__mono'
    mono.setAttribute('aria-hidden', 'true')
    mono.textContent = img.dataset.initials || 'E'
    img.before(mono)

    // hide the <img> until it actually has a working src, so we never
    // render a broken-image glyph over the monogram
    const sync = () => {
      img.style.visibility = img.getAttribute('src') ? 'visible' : 'hidden'
    }
    img.addEventListener('error', () => { img.removeAttribute('src'); sync() })
    img.addEventListener('load', sync)
    sync()
  })

  // native lazy-load can stall when rendering is throttled (background
  // tabs, embedded webviews) and the page is jumped long distances;
  // promote photos to eager before they enter the viewport so portraits
  // never stick on the monogram
  promoteLazy('#team .member__photo')
}

renderTeam()

/* ============================================================
   Header logo — single-file builds inline it as base64
   ============================================================ */

{
  const logoImg = document.querySelector('.nav__logo-img')
  if (logoImg && window.__LOGO_B64__) logoImg.src = window.__LOGO_B64__
}

/* ============================================================
   Upcoming event — poster + live countdown to 10 Oct 2026 10:00 IST
   ============================================================ */

{
  // single-file builds inline the poster as base64
  const posterImg = document.querySelector('.next__poster')
  if (posterImg && window.__ILLUMINATE_B64__) posterImg.src = window.__ILLUMINATE_B64__

  // countdown — 10 Oct 2026, 10:00 AM IST (UTC+5:30)
  const target = Date.parse('2026-10-10T10:00:00+05:30')
  const pad = (n) => String(n).padStart(2, '0')
  const els = {
    d: document.getElementById('cdD'),
    h: document.getElementById('cdH'),
    m: document.getElementById('cdM'),
    s: document.getElementById('cdS')
  }
  const cdBox = document.getElementById('countdown')

  const tickCd = () => {
    if (!els.d) return
    let diff = target - Date.now()
    if (diff <= 0) {
      cdBox?.classList.add('is-done')
      els.d.textContent = els.h.textContent = els.m.textContent = els.s.textContent = '00'
      return
    }
    const d = Math.floor(diff / 86400000); diff -= d * 86400000
    const h = Math.floor(diff / 3600000); diff -= h * 3600000
    const m = Math.floor(diff / 60000); diff -= m * 60000
    const s = Math.floor(diff / 1000)
    els.d.textContent = pad(d)
    els.h.textContent = pad(h)
    els.m.textContent = pad(m)
    els.s.textContent = pad(s)
  }
  tickCd()
  setInterval(tickCd, 1000)
}

/* ============================================================
   ILLUMINATE registration — live Google Form link; deadline
   note and button expire after 30 Sep 2026 23:59 IST
   ============================================================ */

{
  const regDeadline = Date.parse('2026-09-30T23:59:59+05:30')
  const note = document.querySelector('.next__deadline')
  const regBtn = document.querySelector('.next__cta--register')

  const expireReg = () => {
    if (Date.now() <= regDeadline) return
    if (note) note.remove()
    if (regBtn) {
      regBtn.removeAttribute('href')
      regBtn.classList.add('is-closed')
      const label = regBtn.querySelector('span')
      if (label) label.textContent = 'Registrations closed'
    }
    clearInterval(regIv)
  }
  const regIv = setInterval(expireReg, 60000)
  expireReg()
}

/* ============================================================
   Gallery — one entry per photo. Set `src` to a path like
   './gallery/esummit-1.jpg' (drop files in public/gallery/)
   and it replaces the duotone placeholder automatically.
   `span` controls tile width: 1 = normal, 2 = wide feature.
   ============================================================ */

const GALLERY = [
  { caption: 'InnovateX 2k26 — 1st place, trophy handover', tag: 'InnovateX', src: './gallery/innovatex-1st-place.jpg', span: 2 },
  { caption: 'InnovateX 2k26 — 2nd place', tag: 'InnovateX', src: './gallery/innovatex-2nd-place.jpg' },
  { caption: 'InnovateX 2k26 — 3rd place', tag: 'InnovateX', src: './gallery/innovatex-3rd-place.jpg' },
  { caption: 'InnovateX 2k26 — judges & keynote', tag: 'InnovateX', src: './gallery/innovatex-keynote.jpg' },
  { caption: 'InnovateX 2k26 — packed house', tag: 'InnovateX', src: './gallery/innovatex-audience.jpg' },
  { caption: 'Smart India Hackathon 2026 — 1st place', tag: 'SIH 2026', src: './gallery/sih-1st-place.jpg', span: 2 },
  { caption: 'Smart India Hackathon 2026 — 2nd place', tag: 'SIH 2026', src: './gallery/sih-2nd-place.jpg' },
  { caption: 'Smart India Hackathon 2026 — 3rd place', tag: 'SIH 2026', src: './gallery/sih-3rd-place.jpg' },
  { caption: 'Smart India Hackathon 2026 — judges & mentors', tag: 'SIH 2026', src: './gallery/sih-judges.jpg' },
  { caption: 'Smart India Hackathon 2026 — the team', tag: 'SIH 2026', src: './gallery/sih-team.jpg' }
]

function renderGallery () {
  const grid = document.getElementById('galleryGrid')
  if (!grid) return

  grid.innerHTML = GALLERY.map((g, i) => {
    let media
    if (g.src) {
      media = `<img src="${g.src}" alt="${g.caption}" loading="lazy" />`
    } else {
      media = `<div class="shot__ph" aria-hidden="true"><span>${String(i + 1).padStart(2, '0')}</span></div>`
    }
    return `
    <figure class="shot reveal${g.span === 2 ? ' shot--wide' : ''}">
      <div class="shot__frame">
        ${media}
        <span class="shot__tag">${g.tag}</span>
      </div>
      <figcaption>${g.caption}</figcaption>
    </figure>`
  }).join('')
}

renderGallery()

// single-file builds swap ./gallery/* paths for inlined data URIs (decoded
// to Blob URLs, same as team photos) — and gallery shots get the same
// lazy-load stall hardening as team portraits
{
  const galleryPhotos = window.__GALLERY_PHOTOS__ || {}
  document.querySelectorAll('#galleryGrid img').forEach((img) => {
    const src = img.getAttribute('src')
    if (galleryPhotos[src]) img.src = toBlobUrl(galleryPhotos[src])
  })
  promoteLazy('#galleryGrid .shot__frame img')
}

/* ============================================================
   Film — looping 16:9 team-reveal video.
   Drop the file at public/videos/team-reveal.mp4 and it takes
   over from the placeholder automatically. Click = play/pause,
   MUTED button = sound toggle. Pauses when scrolled away.
   ============================================================ */

{
  const video = document.getElementById('filmVideo')
  const frame = document.getElementById('filmFrame')
  const ph = frame?.querySelector('.film__ph')
  const soundBtn = document.getElementById('filmSound')

  if (video && frame) {
    // single-file builds inline the video as base64; otherwise load the file
    const inlineSrc = window.__TEAM_REVEAL_B64__
      ? 'data:video/mp4;base64,' + window.__TEAM_REVEAL_B64__
      : null
    video.src = inlineSrc || video.dataset.src
    video.addEventListener('error', () => { video.removeAttribute('src') }, { once: true })
    video.addEventListener('loadeddata', () => frame.classList.add('is-live'), { once: true })

    // autoplay muted + loop; pause when off-screen
    const autoPlay = () => { if (frame.classList.contains('is-live')) video.play().catch(() => {}) }
    video.addEventListener('loadeddata', autoPlay, { once: true })

    new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) autoPlay()
        else video.pause()
      })
    }, { threshold: 0.2 }).observe(frame)

    // click to play/pause (only when live)
    frame.addEventListener('click', (e) => {
      if (!frame.classList.contains('is-live') || e.target === soundBtn) return
      if (video.paused) video.play().catch(() => {})
      else video.pause()
      frame.classList.toggle('is-paused', video.paused)
    })

    // sound toggle
    soundBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      video.muted = !video.muted
      soundBtn.textContent = video.muted ? 'MUTED' : 'SOUND'
      if (!video.muted && video.paused) video.play().catch(() => {})
    })
  }
}

/* ============================================================
   Custom cursor (fine pointers only)
   ============================================================ */

const cursor = document.getElementById('cursor')
const cursorLabel = document.getElementById('cursorLabel')

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.body.classList.add('has-cursor')

  const pos = { x: -100, y: -100 }
  const ring = { x: -100, y: -100 }

  window.addEventListener('mousemove', (e) => {
    pos.x = e.clientX
    pos.y = e.clientY
    cursor.style.opacity = '1'
  }, { passive: true })

  gsap.ticker.add(() => {
    ring.x += (pos.x - ring.x) * 0.18
    ring.y += (pos.y - ring.y) * 0.18
    cursor.style.transform = `translate(${pos.x}px, ${pos.y}px)`
  })

  const hoverables = document.querySelectorAll('[data-cursor], .pillar, a, button')
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      const label = el.getAttribute('data-cursor')
      if (label) {
        cursorLabel.textContent = label
        cursor.classList.add('is-label')
      }
      cursor.classList.add('is-drag')
    })
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-label', 'is-drag')
    })
  })
}

/* ============================================================
   Magnetic buttons
   ============================================================ */

document.querySelectorAll('.magnetic').forEach((el) => {
  const strength = 0.35

  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect()
    const relX = e.clientX - (r.left + r.width / 2)
    const relY = e.clientY - (r.top + r.height / 2)
    gsap.to(el, { x: relX * strength, y: relY * strength, duration: 0.4, ease: 'power3.out' })
  })

  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
  })
})

/* ============================================================
   Scroll-driven scene morph
   ============================================================ */

if (sceneApi) {
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => sceneApi.setScroll(self.progress)
  })
}

/* ============================================================
   Scroll animation system — word-split titles, line-draw
   section heads, batched card staggers, title parallax,
   scroll progress + 3D tilt on team cards
   ============================================================ */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---- split titles into masked words (preserves <em> accents) ---- */
function splitWordsIn (el) {
  const walk = (node) => {
    ;[...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment()
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(' '))
            return
          }
          const mask = document.createElement('span')
          mask.className = 'w'
          const inner = document.createElement('span')
          inner.className = 'wi'
          inner.textContent = part
          mask.appendChild(inner)
          frag.appendChild(mask)
        })
        node.replaceChild(frag, child)
      } else if (child.nodeType === 1 && !child.classList.contains('w')) {
        walk(child)
      }
    })
  }
  el.classList.remove('reveal')
  el.querySelectorAll('.reveal').forEach((d) => d.classList.remove('reveal'))
  walk(el)
}

const titles = document.querySelectorAll('.about__title, .team__title, .join__title')
titles.forEach(splitWordsIn)

if (prefersReduced) {
  gsap.set('.wi', { yPercent: 0 })
} else {
  titles.forEach((t) => {
    gsap.fromTo(t.querySelectorAll('.wi'),
      { yPercent: 115 },
      {
        yPercent: 0,
        duration: 1.25,
        ease: 'expo.out',
        stagger: 0.045,
        scrollTrigger: { trigger: t, start: 'top 86%', once: true }
      })
  })
}

/* ---- section head line draw ---- */
document.querySelectorAll('.section__head').forEach((head) => {
  ScrollTrigger.create({
    trigger: head,
    start: 'top 92%',
    once: true,
    onEnter: () => head.classList.add('is-in')
  })
})

/* ---- batched card staggers (animate as each row scrolls in) ---- */
const batchReveal = (sel, from, to) => {
  const els = gsap.utils.toArray(sel)
  if (!els.length || prefersReduced) return
  gsap.set(els, from)
  ScrollTrigger.batch(sel, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { ...to, stagger: 0.09, duration: 1.15, ease: 'expo.out', overwrite: true })
  })
}

const cardFrom = { opacity: 0, y: 80, rotate: (i) => (i % 2 ? 1.4 : -1.4) }
const cardTo = { opacity: 1, y: 0, rotate: 0 }

batchReveal('.about__grid > .about__card', cardFrom, cardTo)
batchReveal('.events__grid > .event', cardFrom, cardTo)
batchReveal('.team__grid > .member', cardFrom, cardTo)
batchReveal('.gallery__grid > .shot', cardFrom, cardTo)
batchReveal('.pillars__list > .pillar', { opacity: 0, x: -60 }, { opacity: 1, x: 0 })
batchReveal('.footer__col', { opacity: 0, y: 44 }, { opacity: 1, y: 0 })

/* ---- lone reveals (section labels, join bits) ---- */
if (prefersReduced) {
  document.querySelectorAll('main .reveal').forEach((el) => {
    if (!el.closest('.hero')) el.classList.add('is-in')
  })
} else {
  document.querySelectorAll('main .reveal').forEach((el) => {
    if (el.closest('.hero')) return
    gsap.fromTo(el,
      { y: 48, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      })
  })
}

/* ---- gentle parallax drift on big titles ---- */
if (!prefersReduced) {
  ;['.about__title', '.team__title', '.join__title'].forEach((sel) => {
    gsap.fromTo(sel, { y: 50 }, {
      y: -40,
      ease: 'none',
      scrollTrigger: { trigger: sel, start: 'top bottom', end: 'bottom top', scrub: true }
    })
  })
}

/* ---- scroll progress bar ---- */
gsap.to('#progress', {
  scaleX: 1,
  ease: 'none',
  scrollTrigger: { start: 0, end: 'max', scrub: 0.4 }
})

/* ---- 3D tilt + cursor glare on team cards ---- */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReduced) {
  document.querySelectorAll('.team__grid .member').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' })
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' })

    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      ry(px * 8)
      rx(-py * 8)
      card.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%')
      card.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%')
    })
    card.addEventListener('mouseleave', () => { rx(0); ry(0) })
  })
}

/* ============================================================
   Hero parallax-out on scroll
   ============================================================ */

gsap.to('.hero__title', {
  yPercent: -28,
  opacity: 0.15,
  ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
})

/* ============================================================
   Marquee — seamless infinite scroll, velocity-reactive
   ============================================================ */

const track = document.querySelector('.marquee__track')
{
  const base = 0.8 // px per frame-ish
  let x = 0
  let vel = 0
  let smoothVel = 0
  let trackWidth = 0

  const measure = () => { trackWidth = track.scrollWidth / 2 }
  measure()
  window.addEventListener('resize', measure)

  lenis.on('scroll', ({ velocity }) => { vel = velocity })

  gsap.ticker.add(() => {
    smoothVel += (vel - smoothVel) * 0.08
    x -= (base + Math.abs(smoothVel) * 0.9)
    if (trackWidth > 0) x %= trackWidth
    track.style.transform = `translate3d(${x}px, 0, 0)`
  })
}

/* ============================================================
   Split hero words into chars for intro animation
   ============================================================ */

document.querySelectorAll('[data-split]').forEach((el) => {
  const text = el.textContent
  el.textContent = ''
  ;[...text].forEach((ch) => {
    const span = document.createElement('span')
    span.textContent = ch
    span.style.display = 'inline-block'
    el.appendChild(span)
  })
})

// run the split BEFORE intro timeline plays — reorder safety
// (heroIntro reads .hero__word span)

/* ============================================================
   Anchor navigation via Lenis
   ============================================================ */

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')
    if (id.length < 2) return
    const target = document.querySelector(id)
    if (!target) return
    e.preventDefault()
    if (menuOpen) closeMenu()
    lenis.scrollTo(target, { offset: 0, duration: 1.6 })
  })
})

/* ============================================================
   Mobile menu
   ============================================================ */

const burger = document.getElementById('burger')
const menu = document.getElementById('menu')
let menuOpen = false

gsap.set(menu, { clipPath: 'inset(0 0 100% 0)' })

function openMenu () {
  menuOpen = true
  burger.classList.add('is-open')
  burger.setAttribute('aria-expanded', 'true')
  menu.setAttribute('aria-hidden', 'false')
  gsap.timeline()
    .set(menu, { visibility: 'visible' })
    .to(menu, { clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'expo.inOut' })
    .to('.menu__links a', { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'expo.out' }, '-=0.35')
  lenis.stop()
}

function closeMenu () {
  menuOpen = false
  burger.classList.remove('is-open')
  burger.setAttribute('aria-expanded', 'false')
  menu.setAttribute('aria-hidden', 'true')
  gsap.timeline()
    .to('.menu__links a', { y: 40, opacity: 0, duration: 0.35, ease: 'power3.in' })
    .to(menu, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.7,
      ease: 'expo.inOut',
      onComplete: () => { gsap.set(menu, { visibility: 'hidden' }) }
    }, '-=0.1')
  lenis.start()
}

burger.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()))

/* ============================================================
   Join form — demo success state
   ============================================================ */

const joinForm = document.getElementById('joinForm')
const joinNote = document.getElementById('joinNote')

joinForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const email = document.getElementById('joinEmail')
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    gsap.fromTo(joinForm, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
    joinNote.textContent = 'Enter a valid email to apply.'
    joinNote.style.color = '#ff5a1f'
    return
  }
  joinNote.textContent = "You're on the list. We'll reach out before the next build weekend."
  joinNote.style.color = 'var(--ink)'
  joinForm.reset()
  gsap.fromTo(joinNote, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
})

/* ============================================================
   Refresh triggers after everything settles
   ============================================================ */

window.addEventListener('load', () => ScrollTrigger.refresh())
