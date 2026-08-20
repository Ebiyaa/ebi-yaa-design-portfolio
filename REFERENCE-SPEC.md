# Reference spec — measured off the Framer "Mike Bennet" template

Every number below was read out of the live template's **computed styles** at a
**1440px** viewport (content column = 1384px). Do not eyeball or invent values.

> **Casing note (Aug 2026):** the `case` column below still reflects the
> original reference template, which set `text-transform: lowercase`
> everywhere. That transform has since been removed sitewide — copy now
> displays in normal sentence case. Treat every `lowercase` entry in this
> file as historical; size, line-height, weight and letter-spacing values
> are unaffected and still correct.

## Global tokens (already in `app.css`, do not redefine)

```
--bg: #141414          page ground
--fg: #ece8df          text
--fg-strong: #f6f4f0   nav links
--rule: rgba(236,232,223,0.12)
--pad: 28px            section side padding
--col: 1384px          content column max-width (1440 total incl. gutters)
font-family: "Funnel Sans", weights 400 / 500 / 700
```

Letter-spacing is always expressed as an em fraction of the font size:
`-0.06em` display, `-0.05em` 72px, `-0.04em` 20/24px, `-0.02em` 16px & body.

## Type scale (exact)

| role | size / line-height | weight | letter-spacing | case | notes |
|---|---|---|---|---|---|
| fit display (h1 hero/wordmark) | fit-to-width / 1 | 700 | -0.06em | lowercase | `class="fit-line" data-fit` |
| section display (h2) | 120px / 0.9 | 700 | -0.06em | lowercase | |
| "get in touch" words | 168px / 0.9 | 700 | -0.06em | lowercase | |
| big statement | 72px / 1.1 | 500 | -0.05em | none | homepage word-fill |
| about-page bio para | 32px / 1.2 | 500 | -0.02em | lowercase | opacity 0.6 |
| case-study overview | 44px / 1.2 | 500 | -0.02em | lowercase | centered |
| lead / card title / meta value / chip | 24px / 1.2 | 500 | -0.04em | lowercase | chips use -0.02em |
| nav, footer link, label | 20px / 1.2 | 500 (400 for footer contact) | -0.04em | mixed | |
| small label / caption sub / legal | 16px / 1.2 | 400 | -0.02em | lowercase | usually opacity 0.7 |
| button label | 16px / 1.2 | 500 | -0.03em | lowercase | |

## Shared classes already in `app.css` — reuse, do not re-implement

- `.nav` + `.nav-inner` — fixed, 48px tall, `padding: 12px 28px`, links space-between
- `.wrap` — `width:100%; max-width:var(--col); margin-inline:auto`
- `.fit-line` + `data-fit` — JS fits the line to its parent's width
- `.work-card` / `.work-media` / `.work-cap` — grid card (media radius 8px, caption
  gap 4, title 24px, sub 16px @ .7). Put `data-px` on `.work-media` to enable the
  scroll-velocity pixelation. Card gap media→caption is 12px, caption block is 52px.
- `.btn` — `padding:12px 24px; radius:4px; background:var(--fg); color:var(--bg)`
- `.s-cta` / `.cta` / `.cta-word` / `.cta-media` — the "get in touch" band
- `.site-footer` and all `.foot-*` classes
- `.custom-cursor` — handled by `cursor.js`

`site.js` (shared) provides: Lenis smooth scroll, `data-fit` fitting,
`[data-reveal]` word fill, `[data-px]` pixelation, `.cta-media` frame swap.

---

## Page: WORK  (`work.html` + `pages/work.css`)

Total document height at 1440: 3817. Structure:

```
main  flex column, align center
  section  padding: 0 28px; gap 32; align center
    .wrap  flex column gap 32
      title block   padding-top 64; gap 24; align-items flex-end
        h1.fit-line data-fit  "selected work"
      body block    gap 48; padding-bottom 80
        filter row  flex row, wrap, row-gap 10 column-gap 20, height 29
          chip  plain text, NO background / border / padding
                24px/1.2 w500 ls -0.02em lowercase
                active  color #ffffff
                idle    color var(--fg), opacity 0.5
        grid  display grid; grid-template-columns: 1fr 1fr; gap 24px
          6 × a.work-card, each 680×631 at 1440
             → media aspect-ratio 680/567 = 1.199, caption 52px below a 12px gap
  section.s-cta  padding: 280px 28px   (same markup as the homepage band)
footer.site-footer
```

Filter chips are client-side: clicking one filters the grid by a
`data-cat` attribute on each card; "all" shows everything.

## Page: ABOUT  (`about.html` + `pages/about.css`)

Total document height at 1440: 3086.

```
section 1  padding: 80px 28px; gap 48; align center
  .wrap  flex column gap 66; align center
    title block  gap 24; align-items flex-end
      h1.fit-line data-fit  "about me"
    body row  flex row; gap 24; align-items flex-start
      left col   flex 742/1384; flex column; gap 32
        3 × bio paragraph   32px/1.2 w500 ls -0.02em lowercase, opacity 0.6,
                            each constrained to 620px wide
        a.btn "download resume"   (170×43)
      right col  flex 618/1384; image 618×704, radius 8px, object-fit cover
                 → aspect-ratio 618/704 = 0.878
section 2  padding: 80px 28px; gap 48; align center
  .wrap  flex column gap 76; align center
    h2  "my experience"  120px/0.9 w700 ls -0.06em lowercase, left aligned
    list  flex column gap 20
      1px rule  background var(--rule)          ← rule BEFORE each row and one after the last
      row  flex row; justify-content space-between; align-items center
        col A  width 512; flex column gap 8
          role   24px/1.2 w500 ls -0.04em lowercase
          org    20px/1.2 w400 ls -0.04em lowercase, opacity 0.6
        col B  width 360; blurb 16px/1.2 w400 ls -0.02em lowercase, opacity 0.7
        col C  width 512; dates 24px/1.2 w500 ls -0.04em lowercase
section.s-cta  padding: 160px 28px
footer.site-footer
```

Columns are laid out with `space-between`, widths 512 / 360 / 512 (they overlap
the available 1384 deliberately — B sits at x=540, C's text starts at x=900).
Implement as a 3-column grid: `grid-template-columns: 512fr 360fr 512fr` with the
last column's text left-aligned, or flex with those flex-basis values.

## Page: CASE STUDY TEMPLATE  (`work/_template.html` + `pages/case.css`)

Total document height at 1440 for the reference project: 6817.

```
main
  container  padding: 144px 28px 80px; flex column; gap 76; align-items flex-start
    block 1  flex column; gap 96; align center
      h1  120px/0.9 w700 ls -0.06em lowercase, CENTERED
      hero media  full width (1384), aspect-ratio 1384/823 = 1.682, radius 8px
    block 2  flex column; gap 56; align center
      overview group  gap 10; align center
        label  "project overview"  20px/1.2 w400 ls -0.04em lowercase, opacity 0.7
        body   44px/1.2 w500 ls -0.02em lowercase, CENTERED
      meta row  flex row; justify-content space-between; align-items center
        4 × item  flex column gap 10
          label  20px/1.2 w400 ls -0.04em lowercase, opacity 0.7
          value  24px/1.2 w500 ls -0.04em lowercase
        items: project type / year / my role / client
    block 3  display grid; grid-template-columns: 1fr 1fr; gap 24px
      media blocks, radius 8px, every one carries `data-px`
        full-width block  grid-column: 1 / -1;  aspect-ratio 1.682
        half block        aspect-ratio 680/563 = 1.208
      reference order: full, half, half, full, half, half, full
    block 4  flex column; gap 56; align center
      h2  "other projects"  120px/0.9 w700 ls -0.06em lowercase, centered
      row  flex row; gap 20; justify-content center
        3 × a.work-card, each 448 wide × 504 tall
           → media aspect-ratio 448/440 = 1.018
section.s-cta   (optional on this page — the reference omits it)
footer.site-footer
```

---

## Responsive

Breakpoints match the reference: **≥1200 desktop**, **810–1199 tablet**,
**≤809 mobile**. `app.css` already handles the shared components. In your page
CSS, at ≤809: collapse every multi-column layout to one column, drop the display
sizes (`120px → ~44px`, `44px → 24px`, `32px → 20px`), and reduce section padding
roughly by half.

## Hard rules

- Do **not** edit `app.css`, `site.js`, `cursor.js`, or `index.html`.
- Your page CSS goes in `pages/<name>.css` and is linked **after** `app.css`.
- Every page links, in this order:
  `app.css`, `pages/<name>.css`; then at the end of body: lenis CDN, gsap CDN,
  ScrollTrigger CDN, `site.js`, `cursor.js` (mind the relative path depth).
- Use lowercase copy via `text-transform: lowercase` — keep the real casing in
  the HTML source.
- Content comes from the existing pages in this repo. Do not invent portfolio
  facts, dates, employers, or metrics.
