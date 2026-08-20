# Rebuild summary

The whole site was rebuilt as a pixel-accurate match of a Framer portfolio
template ("Mike Bennet"), using Ebi-Yaa's own content throughout.

Every layout and type value in the codebase was read out of the live template's
**computed styles** via CDP at a 1440px viewport — not eyeballed from
screenshots. Those measurements are written down in `REFERENCE-SPEC.md`, which
is the source of truth for anything you add later.

## What exists now

```
index.html          home — hero, work grid, about, get-in-touch, footer
work.html           selected work — filter chips + 9-card grid
about.html          bio, experience, education, certifications, software, side quests
404.html            not found
work/_template.html blank case study template (start here for a new project page)
work/*.html         4 case studies: thesis, nexavault, echoCapsule, wewire-platform

app.css             design system + every shared component        (497 lines)
site.js             shared motion runtime                         (287 lines)
cursor.js           custom cursor                                  (57 lines)
pages/work.css      page-specific styles                          (129 lines)
pages/about.css                                                   (244 lines)
pages/case.css                                                    (269 lines)
pages/notfound.css                                                 (87 lines)

REFERENCE-SPEC.md   the measured spec — read before changing layout or type
AGENTS.md           conventions and gotchas for whoever works on this next
style.css           DEAD — no page references it. Safe to delete.
```

## Verified

All eight pages were loaded in a real browser and checked: none load
`style.css`, zero broken images, every pixelation canvas initialises, fit-text
sizing runs, Lenis and the custom cursor are active on all pages.

Geometry matches the reference exactly at the capped width — work media
680×567, cards 680×631, case hero 1384×823, CTA words 510 / media 364×290.

## The four effects

1. **Fit-to-width display type.** The big lowercase headlines size themselves to
   fill their container. JS measures the rendered line and scales `font-size`,
   with one correction pass; re-runs on `fonts.ready` and on resize.

2. **Word-by-word opacity fill** on the homepage statement paragraph. Words sit
   at `opacity: .4` and scrub to `1` on scroll via GSAP ScrollTrigger.

3. **Scroll-velocity pixelation** on imagery. This is the template's signature
   move and it is *velocity*-driven, not scroll-progress-driven — that was
   confirmed by sampling the reference at rest (sharp) versus mid-scroll
   (blocky). Each image is painted through a canvas, resampled down to 14 blocks
   at peak velocity and back to native when scrolling settles. Fast rise, slow
   decay.

4. **Gif-style frame swap** in the get-in-touch media. Hard cuts between stills
   every 900ms — the reference's transform is static between jumps, so it is a
   discrete slideshow, not a moving track.

Plus **Lenis** smooth scroll, which the reference also runs — the pixelation
only feels right with it underneath.

## Known gaps

Ordered roughly by how much they matter.

- **Phone number is gone from the site.** `+353 87 034 6205` used to sit in a
  contact strip on each case study. The new template has no slot for it and the
  footer carries only email and location. Decide whether it should come back.
- **Thin galleries.** Thesis and Echo Capsule have no gallery blocks and
  NexaVault has one, because those are the only images in `assets/`. The
  template's rhythm wants up to seven (full / half / half / full / …). More
  screens would fill them.
- **Project tag pills are handled inconsistently.** Thesis and Echo Capsule kept
  theirs as a "focus areas" text block; Wewire's were dropped. Pick one and make
  it uniform.
- **`assets/onboarding.png` is doing double duty** — it is NexaVault's tiered
  onboarding screen *and* the card image for the separate, still-pending
  "Onboarding Platform" project on `work.html`. If it only belongs to one, fix
  the other.
- **"Onboarding Platform" has no case study page.** Its card on `work.html` is
  deliberately a non-linking tile (a `div`, not an `a`) so it doesn't advertise
  a destination that isn't there. `cursor.js` skips the "see more" badge on it.
- **Software stack lost its descriptors.** "Figma — General design tool" etc. is
  now just "figma"; the chip treatment has no room for a sub-label. A two-line
  variant is a small change.
- **Side quests rows** have an empty middle column and "watch ↗" where a date
  goes, because the source has neither a blurb nor a date. Their thumbnails
  (`building-bytes.jpg`, `Wewire1.png`) aren't shown — the row has no media slot.
- **"Visit website ↗"** on the Wewire page header didn't survive; there's no
  equivalent element in the template. The in-body `wewire.com/stablecoins` link
  did survive.
- **`work/_template.html` renders with broken images** by design — its
  `PLACEHOLDER-*.png` sources don't exist. That's the signal to replace them.

## Deviations from the reference, and why

- **Nine work cards, not six.** The template shows six; Ebi-Yaa has nine real
  projects. The last row runs half-empty, which the `1fr 1fr` grid handles.
- **Case studies keep their prose.** The template's media grid is images-only.
  Dropping the written sections would have thrown away most of each case study,
  so they span the grid as full-width text blocks.
- **The about page keeps certifications, software and side quests.** No
  equivalent exists in the template; they're rendered in the same row and chip
  system rather than deleted.
- **Footer wordmark uses `line-height: 1`, not the reference's `0.9`.** "ebi-yaa
  kwaw" has a descender and "mike bennet" doesn't; at `0.9` the y clipped
  through the divider rule.
