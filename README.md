# E-Cell · Trinity Polytechnic Pune

A minimalist, 3D-interactive single-page site for the Entrepreneurship Cell of
Trinity Polytechnic, Pune. Built with Vite, Three.js, GSAP (+ ScrollTrigger)
and Lenis.

## Stack

- **Vite** — dev server & build
- **Three.js** — interactive WebGL hero (drag-rotate icosahedron, particle
  halo, mouse parallax, scroll morph)
- **GSAP + ScrollTrigger** — preloader, hero intro, section reveals, counters
- **Lenis** — smooth scrolling

## Commands

```bash
npm install
npm run dev            # dev server
npm run build          # production build -> dist/
npm run build:single   # build + emit dist/single.html (fully self-contained)
```

> Note: `.toolchain/` contains a local Node.js runtime used in environments
> without a system Node. If you have Node installed, you can delete it.

## Structure

```
index.html    — page markup (preloader, nav, menu, hero, sections, team, footer)
style.css     — design system + all styles
main.js       — boot: lenis, gsap, cursor, marquee, counters, menu, form
scene.js      — Three.js hero scene
scripts/make-single.mjs — inlines JS/CSS into one portable HTML file
```

## Team section

Members are rendered from the `TEAM` array in `main.js` — one line per
person:

```js
{ name: 'Aarav Kulkarni', role: 'President', initials: 'AK' }
```

Optional per-person fields:

- `photo: './team/aarav.jpg'` — drop files in a `public/team/` folder.
  Until then an outlined monogram (from `initials`) shows through; a
  broken src is auto-hidden at runtime.
- `li: 'https://linkedin.com/in/...'` — real LinkedIn URL. Entries
  without one fall back to a LinkedIn search for the name.

Entries with `advisor: true` render as a separate full-width
feature card above the member grid.

## Gallery section

Photos are rendered from the `GALLERY` array in `main.js`:

```js
{ caption: 'E-Summit \'26 — keynote hall', tag: 'E-Summit', span: 2 }
```

- `src: './gallery/esummit-1.jpg'` — drop files in `public/gallery/`.
  Until then a duotone placeholder tile with an outlined index shows.
- `span: 2` — makes the tile a wide feature; otherwise 1 column.
- `tag` — small event label chip on the tile.

## Film section (team reveal)

Drop the video at `public/videos/team-reveal.mp4` (16:9 recommended).
It autoplays muted + looping as soon as the file exists — until then a
placeholder frame shows. Click = play/pause, `MUTED` chip = sound.
Playback pauses automatically when the frame scrolls off-screen.

## Upcoming event — ILLUMINATE

Section `00 · Next up` (right under the hero) shows the **official event
poster** beside a **live countdown to 10 Oct 2026, 10:00 AM IST**. The frame
adopts the poster's own proportions — swap the file at
`public/images/illuminate-poster.jpg` and rebuild.

- **Drag** anywhere on the hero to spin the icosahedron (with inertia)
- **Mouse move** — camera parallax
- **Scroll** — scene pushes back and dissolves; marquee speeds up with
  scroll velocity; stats count up on entry
- **Burger menu** — full-screen overlay (mobile)
- **Join form** — demo validation + success state

## Content

All copy (stats, events, contact email) is placeholder — edit `index.html`
directly. Social links are stubs (`#`).
