#!/usr/bin/env python3
"""Generate the theme-aware banner used at the top of the repository README.

Sized at 880x300 because GitHub renders README images at the column width
(~860px). A wider canvas would be scaled down and the caption type would land
under 9px.

Two SVGs, identical geometry, different palette, selected in the README with
<picture> + prefers-color-scheme. Bars animate with CSS transforms and the final
width lives in the rect attribute, so a renderer that ignores CSS still shows
the real numbers.
"""
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "docs" / "assets"

W, H = 880, 300

DARK = {
    "bg": "#0a0b0d",
    "panel": "#101216",
    "line": "#ffffff1f",
    "grid": "#ffffff0d",
    "fg": "#f4f5f7",
    "muted": "#969ca5",
    "faint": "#7d848e",
    "accent": "#3ddc97",
    "warn": "#ff8a4c",
    "track": "#ffffff12",
}
LIGHT = {
    "bg": "#fcfcfb",
    "panel": "#ffffff",
    "line": "#0b0c0e1f",
    "grid": "#0b0c0e0f",
    "fg": "#0c0e11",
    "muted": "#545b65",
    "faint": "#6a717c",
    "accent": "#077a4d",
    "warn": "#b8511a",
    "track": "#0b0c0e14",
}

SANS = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif"
MONO = "'JetBrains Mono','SFMono-Regular',ui-monospace,monospace"

CARD_X, CARD_Y, CARD_W, CARD_H = 496, 34, 344, 232
PAD = 24
BAR_W = CARD_W - PAD * 2
BEFORE, AFTER = 6770, 711
AFTER_W = round(BAR_W * AFTER / BEFORE, 1)


def bar(x, y, w, h, fill, delay):
    """Track plus a fill that grows from the left when CSS is available."""
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h / 2}" fill="{{track}}"/>'
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h / 2}" fill="{fill}" '
        f'style="transform-origin:{x}px {y}px;animation:grow .9s cubic-bezier(.22,1,.36,1) {delay}s both"/>'
    )


def svg(p):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img"
     aria-label="agentdiet: in a simulated repository, always-on agent context drops from 6,770 tokens at grade C to 711 tokens at grade A, an 89.5 percent reduction.">
  <defs>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0V32" fill="none" stroke="{p['grid']}" stroke-width="1"/>
    </pattern>
    <style>
      text {{ font-family: {SANS}; }}
      .mono {{ font-family: {MONO}; }}
      @keyframes grow {{ from {{ transform: scaleX(0); }} to {{ transform: scaleX(1); }} }}
      @keyframes pulse {{ 0%,100% {{ opacity:.35; }} 50% {{ opacity:1; }} }}
      .dot {{ animation: pulse 2.4s ease-in-out infinite; }}
      @media (prefers-reduced-motion: reduce) {{
        .dot, rect[style] {{ animation: none !important; }}
      }}
    </style>
  </defs>

  <rect width="{W}" height="{H}" rx="16" fill="{p['bg']}"/>
  <rect width="{W}" height="{H}" rx="16" fill="url(#grid)" opacity=".7"/>
  <rect x="0.5" y="0.5" width="{W - 1}" height="{H - 1}" rx="16" fill="none" stroke="{p['line']}"/>

  <!-- mark: three instruction lines, the fat trimmed -->
  <g transform="translate(40,42)">
    <rect width="24" height="3.4" rx="1.7" fill="{p['fg']}"/>
    <rect y="7" width="16" height="3.4" rx="1.7" fill="{p['fg']}" opacity=".45"/>
    <rect y="14" width="8.5" height="3.4" rx="1.7" fill="{p['accent']}"/>
  </g>
  <text x="40" y="112" font-size="34" font-weight="600" letter-spacing="-1.2" fill="{p['fg']}" class="mono">agentdiet</text>

  <text x="40" y="148" font-size="14.5" fill="{p['muted']}">See what your AI coding agent reads before</text>
  <text x="40" y="170" font-size="14.5" fill="{p['muted']}">you type a single word, and cut it.</text>

  <text x="40" y="212" font-size="11.5" fill="{p['faint']}" class="mono">go install github.com/qansaid/agentdiet@latest</text>

  <g class="mono">
    <circle cx="43" cy="238" r="3" fill="{p['accent']}" class="dot"/>
    <text x="54" y="242" font-size="10.5" fill="{p['faint']}">MIT · single static binary · no account</text>
  </g>

  <!-- report card -->
  <rect x="{CARD_X}" y="{CARD_Y}" width="{CARD_W}" height="{CARD_H}" rx="12" fill="{p['panel']}" stroke="{p['line']}"/>
  <text x="{CARD_X + PAD}" y="{CARD_Y + 32}" font-size="9.5" fill="{p['faint']}" class="mono" letter-spacing=".5">ALWAYS-ON · ACME</text>
  <rect x="{CARD_X + CARD_W - PAD - 62}" y="{CARD_Y + 18}" width="62" height="19" rx="4"
        fill="{p['warn']}" fill-opacity=".12" stroke="{p['warn']}" stroke-opacity=".45"/>
  <text x="{CARD_X + CARD_W - PAD - 51}" y="{CARD_Y + 31}" font-size="9.5" fill="{p['warn']}" class="mono">C → A</text>

  <text x="{CARD_X + PAD}" y="{CARD_Y + 70}" font-size="9.5" fill="{p['faint']}" class="mono">BEFORE</text>
  <text x="{CARD_X + CARD_W - PAD}" y="{CARD_Y + 72}" font-size="15" fill="{p['fg']}" class="mono" text-anchor="end">6,770</text>
  {bar(CARD_X + PAD, CARD_Y + 82, BAR_W, 7, p['warn'], 0.1)}

  <text x="{CARD_X + PAD}" y="{CARD_Y + 124}" font-size="9.5" fill="{p['faint']}" class="mono">AFTER</text>
  <text x="{CARD_X + CARD_W - PAD}" y="{CARD_Y + 126}" font-size="15" fill="{p['accent']}" class="mono" text-anchor="end">711</text>
  {bar(CARD_X + PAD, CARD_Y + 136, AFTER_W, 7, p['accent'], 0.35)}
  <line x1="{CARD_X + PAD + AFTER_W + 6}" y1="{CARD_Y + 139.5}" x2="{CARD_X + PAD + BAR_W}" y2="{CARD_Y + 139.5}"
        stroke="{p['track']}" stroke-width="1" stroke-dasharray="2 5"/>

  <text x="{CARD_X + PAD}" y="{CARD_Y + 174}" font-size="12" fill="{p['accent']}" class="mono">−89.5% always-on tokens</text>
  <text x="{CARD_X + PAD}" y="{CARD_Y + 200}" font-size="9.5" fill="{p['faint']}" class="mono">simulated repo · real report output</text>
</svg>
"""


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, palette in (("banner-dark.svg", DARK), ("banner-light.svg", LIGHT)):
        body = svg(palette).replace("{track}", palette["track"])
        (OUT / name).write_text(body, encoding="utf-8")
        print(f"wrote {OUT / name} ({len(body)} bytes)")


if __name__ == "__main__":
    main()
