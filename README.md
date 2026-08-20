# Moonway Creations — Webview Presentation

A browser-based company presentation that replaces the PowerPoint deck.
Plain HTML/CSS/JS — no build step, no dependencies beyond Google Fonts.

## Files

- `index.html` — the whole deck (14 chapters)
- `deck.css` — design system ("paper atelier": cream ground, espresso type, Fraunces + Work Sans)
- `deck.js` — keyboard navigation, chapter tracking, index overlay, Christmas-wall scroller
- `img/` — optimized photography (AVIF with JPEG fallback, 3-size responsive ladders, ~9.4 MB AVIF total; a full scroll on a modern browser loads ~3–4 MB)

## Hosting

Upload the folder anywhere that serves static files (Netlify Drop, Cloudflare Pages,
GitHub Pages, or any web host). No server logic needed. To preview locally:

```bash
cd moonway-webview && python3 -m http.server 8000
```

then open http://localhost:8000

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
screens (no scroll hijacking).

## Updating content

- Contact details: search `index.html` for `TODO` — a commented block in the closing
  chapter is ready for phone / WhatsApp / email / Instagram.
- Swapping a photo: each image needs `-640/-1024/-1600` (or the ladder used in its
  chapter) `.avif` + `.jpg` pairs in `img/`. The original optimization pipeline lives
  with the source material and can regenerate everything from the deck's media.
