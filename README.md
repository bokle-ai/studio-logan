# Studio Logan — Website

A single-page, scroll-animated site for **Studio Logan — Architecture & Interiors**.
Built from the brand's own portfolio (colours, logo/lion emblem, copy and project
photography) and the motion language of the reference studios (PLDNYC, AvroKO,
Rockwell, HBA, Macaulay Sinclair, plus the Bocci hover-to-light idea).

## Run locally
It's a static site — any web server works. For example:
```
cd site
python3 -m http.server 4599
# open http://localhost:4599
```
(Opening `index.html` directly also works, but a server is recommended so fonts/CDN load cleanly.)

## Deploy
Upload the whole `site/` folder to any static host (Netlify, Vercel, GitHub Pages,
Cloudflare Pages, S3). No build step.

## Structure
```
site/
  index.html            all sections & copy
  assets/css/style.css  full design system (brand palette, layout, responsive)
  assets/js/main.js      motion — Lenis smooth-scroll + GSAP ScrollTrigger
  assets/img/            logo emblem + all project photography
```

## Tech / motion
- **Lenis** momentum smooth-scroll, **GSAP + ScrollTrigger** for all motion.
- **Pinned horizontal projects rail** — the section pins and scrolling drives the
  five project panels sideways, pushing one full image into the next
  (image-into-image). Falls back to a vertical stack below 768px.
- **Click-to-open project drawer** — clicking a project panel (or its "View brief"
  button) slides a smooth card in from the right with the project image, title,
  location and a full brief. Close via the button, the backdrop, or Esc. Project
  copy lives in the `PROJECTS` object in `assets/js/main.js`.
- Whole images with a gentle fade + settle-scale reveal (no slicing).
- Preloader, custom cursor, masked heading reveals, continuous parallax,
  velocity-reactive collaborator marquee, and a Bocci-style "Signature Details"
  row that lights up on hover.
- Fully responsive; honours `prefers-reduced-motion` (the pinned rail is disabled
  and everything shows statically).
- Libraries load from CDN (GSAP, Lenis) and fonts from Google Fonts.

## Brand
- Colours: espresso `#241a12`/`#2f2318`, cream `#ece0cb`/`#f4ecdb`, gold `#b6893f`.
- Type: Cormorant Garamond (display), Pinyon Script (the "Studio Logan" script), Jost (UI/body).
- The lion emblem (`assets/img/lion.png`) was isolated from the portfolio cover as a
  clean transparent cream mark; `lion-dark.png` is the version for light backgrounds.

## Swapping / adding images
Every photo has a **semantic filename** (e.g. `canter-1.jpg`, `manhattan-3.jpg`,
`brooklyn-2.jpg`). To replace one or add the missing Canter Hotel shots later,
just drop a new file over the same name (or add `canter-5.jpg` and reference it in
the relevant `<figure>` in `index.html`). Keep long edge ≤ ~1600px, JPEG q≈82.

## Notes on sourcing
The Manhattan (432 Park), Brooklyn brownstone and Canter Hotel imagery was taken
from the curated selections already inside the portfolio PDF, which match the
reference links provided. The Google-Drive folder and the additional Canter photos
can be added into the named slots above whenever you send them.
