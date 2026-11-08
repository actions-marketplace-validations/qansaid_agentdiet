# Motion audit captures

Captured from the production build at 1440x900 (desktop), 390x844 (mobile) and
834x1112 (tablet) through Chromium over CDP. Every capture was taken after the
sequence settled, except the recordings, which show the sequence itself.

## Screenshots

| File | State |
| --- | --- |
| desktop-hero.png | Hero terminal after the scan completes |
| desktop-discover.png | Repository explorer, scan complete, duplicate badges |
| desktop-analyze.png | Token analytics with tier composition |
| desktop-optimize-before.png | Comparison at 6,770 tokens, grade C |
| desktop-optimize-after.png | Comparison at 711 tokens, grade A |
| desktop-enforce-fail.png | CI at a 4,000 budget, FAIL, exit 1 |
| desktop-enforce-pass.png | CI at an 8,000 budget, PASS, exit 0 |
| mobile-hero.png | Hero at 390 px |
| mobile-discover.png | Explorer at 390 px |
| mobile-analyze.png | Analytics at 390 px |
| mobile-optimize-before.png | Comparison before state at 390 px |
| mobile-optimize-after.png | Comparison after state at 390 px |
| mobile-enforce-fail.png | CI failure state at 390 px |

## Recordings

GIF and MP4, silent, captured at native page speed with variable frame timing.

| File | Duration | Content |
| --- | --- | --- |
| hero.gif / hero.mp4 | 6.4s | Command typing, scan, findings, report counter |
| repository.gif / repository.mp4 | 3.2s | File discovery, classification, duplicate badges |
| repository-mobile.gif / repository-mobile.mp4 | 2.0s | The same scan at 390 px |
| optimize.gif / optimize.mp4 | 3.4s | Before to after counters, bars, grade and dedupe count |
| ci.gif / ci.mp4 | 5.8s | Stage execution, FAIL at 4,000, PASS at 8,000 |

## Verification notes

- Frame diffs over the kept frames: 15 changed frames in the hero, 7 in the
  repository scan, 4 in the comparison transition, 18 in the CI run.
- Full-page layout shift on load: 0.0007.
- Frame pacing during the hero sequence: 59.5 fps average, no frame above 50 ms.
- Console errors: none.
