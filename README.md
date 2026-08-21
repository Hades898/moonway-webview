# Moonway Creations — Webview Presentation

A browser-based company presentation that replaces the PowerPoint deck.
Plain HTML/CSS/JS — no build step, no dependencies beyond Google Fonts.

## Files

- `index.html` — the whole deck (32 chapters: cover, about, audience index, archive collage, then seasons and audiences — weddings, beach dinners, summer, daylight tables, clubhouses, December, Christmas market, Jungle Gym, Halloween, Holi, Casino, gala tent, Jetour expedition, milestones, brands, private dining, made by hand, the workshop, the convoy — with 8 horizontal gallery carousels, an eight-worlds flip-card navigator, the partner logo wall and the close)
- `deck.css` — design system (bold editorial: ivory ground, espresso type, heavy Fraunces display + Creato Display sans, espresso statement chapters)
- `deck.js` — keyboard navigation, chapter tracking, index overlay, gallery carousels, tap-to-fullscreen lightbox, flip cards, auto-hiding mobile masthead
- `check.py` — pre-push guard: fails if the page references an image that isn't on disk
- `img/` — optimized photography (AVIF with JPEG fallback, 3-size responsive ladders; a full scroll loads ~7 MB) + `img/partners/` monochrome logo tiles
- `fonts/` — Creato Display (SIL OFL) as woff2

## Hosting

Upload the folder anywhere that serves static files (Netlify Drop, Cloudflare Pages,
GitHub Pages, or any web host). No server logic needed. To preview locally:

```bash
cd moonway-webview && python3 -m http.server 8000
```

then open http://localhost:8000

Live: https://hades898.github.io/moonway-webview/ (GitHub Pages from `main` — push to deploy)

## Presenting live (laptop / projector)

- `↓` `→` `Space` `PgDn` — next chapter
- `↑` `←` `PgUp` — previous chapter
- `Home` / `End` — first / last chapter
- `F` — fullscreen
- `I` — chapter index overlay (Esc closes)
- Chapter ticks on the right edge are clickable; the counter bottom-left shows position.

Every chapter has a URL anchor (`#weddings`, `#christmas`, `#clients` …) so you can
deep-link a client to a specific section.

On phones the deck becomes a free-scrolling page with layouts designed for small
screens (no scroll hijacking). Tap any gallery photo to view it full screen; tap a Six Worlds card to flip it, tap again to jump.

## Updating content

- Contact details: search `index.html` for `TODO` — a commented block in the closing
  chapter is ready for phone / WhatsApp / email / Instagram.
- Swapping a photo: each image needs `-640/-1024/-1600` (or the ladder used in its
  chapter) `.avif` + `.jpg` pairs in `img/`. The original optimization pipeline lives
  with the source material and can regenerate everything from the deck's media.
