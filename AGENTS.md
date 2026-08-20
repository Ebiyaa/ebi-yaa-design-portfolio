# Working on this repo

Static portfolio site for Ebi-Yaa Kwaw. No build step, no framework, no
dependencies to install — plain HTML, one shared stylesheet, one shared script.
Open a file, edit it, reload.

Read `SUMMARY.md` for what exists and what's still open. Read
`REFERENCE-SPEC.md` before you touch layout or type.

## Run it

```bash
python3 -m http.server 8899
# → http://localhost:8899
```

Use a server, not `file://` — the pixelation effect reads pixels back off a
canvas and will be blocked by the file-origin rules.

## Layout

```
*.html              root pages (index, work, about, 404)
work/*.html         case studies
work/_template.html blank case study — copy this to start a new one
app.css             design system + shared components. Every page loads it.
pages/*.css         page-specific styles. Loaded AFTER app.css.
site.js             shared motion runtime. Every page loads it.
cursor.js           custom cursor. Every page loads it.
assets/             images
style.css           DEAD. Nothing references it. Delete it when you're sure.
```

Every page links, in this order:

```html
<link rel="stylesheet" href="app.css" />
<link rel="stylesheet" href="pages/<name>.css" />
...
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="site.js" defer></script>
<script src="cursor.js" defer></script>
```

Pages inside `work/` need `../` on every one of those paths.

## Design system

Tokens live on `:root` in `app.css`. Don't hardcode these values:

```
--bg #141414   --fg #ece8df   --fg-strong #f6f4f0
--rule rgba(236,232,223,.12)
--pad 28px     side padding
--col 1384px   content column — capped so the page is 1440 wide, centred
--nav-h 48px
```

Font is **Funnel Sans** (Google Fonts), weights 400 / 500 / 700.

Letter-spacing is always an em fraction, never px: `-0.06em` on display type,
`-0.05em` at 72px, `-0.04em` at 20/24px, `-0.02em` at 16px and body copy.
The full type scale is a table in `REFERENCE-SPEC.md` — use it rather than
inventing a size.

Copy displays in normal sentence case — headings, nav links and titles start
with a capital letter. There is no `text-transform: lowercase` anywhere in the
system (removed Aug 2026); type what should appear on screen directly in the
HTML.

Content sits in a `.wrap` (`max-width: var(--col); margin-inline: auto`) inside
a section that carries the vertical padding.

## Shared components — reuse, don't reimplement

In `app.css`: `.nav` / `.nav-inner`, `.fit-line`, `.work-card` / `.work-media` /
`.work-cap`, `.btn`, `.s-cta` / `.cta` / `.cta-word` / `.cta-media`,
`.site-footer` and the `.foot-*` family, `.custom-cursor`.

Copy the nav, get-in-touch band and footer markup **verbatim from
`index.html`** when building a new page. They are meant to be identical
everywhere.

## The runtime, and the hooks it looks for

`site.js` scans the DOM on load. You opt in with attributes and classes:

| hook | what it does |
|---|---|
| `data-fit` | scales the element's `font-size` so the line exactly fills its parent. Element must be a single non-wrapping line. |
| `data-reveal` | splits text into word spans that scrub from `opacity .4` to `1` on scroll. |
| `data-px` | paints the element's `<img>` through a canvas that pixelates with scroll velocity. Needs `position: relative; overflow: hidden` and an absolutely-positioned `img`. |
| `.cta-media` | cycles its child `<img>`s with a hard cut every 900ms; JS keeps exactly one `.on`. |

Everything no-ops when its hook is absent, so one script serves every page.

Every effect is disabled under `prefers-reduced-motion: reduce`. Keep it that
way.

## Gotchas

- **`data-fit` needs the font loaded.** Fitting runs once immediately, again on
  `document.fonts.ready`, and again on resize. If you show or hide content that
  changes a container's width — a filter, an accordion — fire
  `window.dispatchEvent(new Event('resize'))` afterwards so headlines and
  pixelation tiles re-measure. `work.html`'s filter script does exactly this.

- **The pixelation is velocity-driven, not progress-driven.** Don't "fix" it
  into a ScrollTrigger scrub. It was verified against the reference: sharp at
  rest, blocky mid-scroll. Tuning constants are at the top of that section in
  `site.js` (`MIN_BLOCKS`, `MAX_VELOCITY`, `RISE`, `FALL`).

- **The cursor uses `mix-blend-mode: difference`**, which is why it reads dark
  over light images and light over the page ground. Don't give it a solid
  colour or wrap it in a element that creates isolation.

- **The cursor only badges media inside an `<a[href]>`.** That's deliberate —
  cards without a destination shouldn't say "see more".

- **`.work-media` is the badge hot-zone.** Case study pages use `.case-media`
  instead, precisely so non-link media doesn't get the badge. Keep that split.

- **Descenders vs tight line-height.** The footer wordmark runs `line-height: 1`
  where the reference uses `0.9`, because "ebi-yaa kwaw" has a `y` that clipped
  through the divider. Check descenders whenever you tighten leading.

- **Breakpoints are 1200 / 810 / 0**, matching the reference. `app.css` handles
  the shared components; your page CSS handles its own layout at each.

## Rules

- **Don't invent portfolio content.** No dates, employers, clients, metrics,
  outcomes, or project facts that aren't already in the repo. If a value isn't
  stated anywhere, write `n/a` — several case study meta fields already do.
- **Don't reference images that don't exist.** `ls assets/` first. Never borrow
  one project's image for another; that asserts something untrue about the work.
- **Don't edit `app.css`, `site.js` or `cursor.js` for a single page's needs.**
  Put it in `pages/<name>.css`. Only touch the shared layer when the change is
  genuinely site-wide.
- **Measure, don't guess.** If you're matching the reference and the number
  isn't in `REFERENCE-SPEC.md`, go read it off the template rather than
  approximating.

## Adding a case study

1. `cp work/_template.html work/<slug>.html` — its top comment documents each
   fillable slot.
2. Fill the meta row (project type / year / my role / client) from facts that
   actually exist for the project.
3. Add media blocks: `grid-column: 1 / -1` with aspect-ratio 1.682 for
   full-width, aspect-ratio 1.208 for half. Every block gets `data-px`.
4. Point the three "other projects" cards at other real case studies.
5. Add the project to the grid in `work.html` with a `data-cat` matching an
   existing filter chip.

## Verify before you call it done

Load the page in a browser and check: no console errors, no broken images,
`document.querySelectorAll('.px-ready').length` equals the `[data-px]` count,
`data-fit` headlines actually span their container, and every link resolves.
Then check it at 1440, 1000 and 390 wide.
