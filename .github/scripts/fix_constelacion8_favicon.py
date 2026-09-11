from __future__ import annotations

from pathlib import Path
import colorsys
import re

ROOT = Path(__file__).resolve().parents[2]
VERSION = "20260912-noviolet"

HEX_RE = re.compile(r"#([0-9A-Fa-f]{6})(?![0-9A-Fa-f])")
RGBA_RE = re.compile(
    r"rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?))?\s*\)"
)


def is_violet(r: int, g: int, b: int) -> bool:
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    deg = h * 360
    return s >= 0.13 and v >= 0.08 and 250 <= deg <= 330


def neutral_gray(r: int, g: int, b: int) -> tuple[int, int, int]:
    # Perceptual luminance, then gently bias very dark colours toward the site's #050505 base.
    y = round(0.2126 * r + 0.7152 * g + 0.0722 * b)
    if y < 22:
        y = 5
    return y, y, y


def neutralize_css_colors(text: str) -> tuple[str, int]:
    changes = 0

    def repl_hex(match: re.Match[str]) -> str:
        nonlocal changes
        raw = match.group(1)
        r, g, b = int(raw[0:2], 16), int(raw[2:4], 16), int(raw[4:6], 16)
        if not is_violet(r, g, b):
            return match.group(0)
        nr, ng, nb = neutral_gray(r, g, b)
        changes += 1
        return f"#{nr:02X}{ng:02X}{nb:02X}"

    def repl_rgba(match: re.Match[str]) -> str:
        nonlocal changes
        r, g, b = map(int, match.group(1, 2, 3))
        if not is_violet(r, g, b):
            return match.group(0)
        nr, ng, nb = neutral_gray(r, g, b)
        alpha = match.group(4) or ""
        fn = "rgba" if alpha else "rgb"
        changes += 1
        return f"{fn}({nr},{ng},{nb}{alpha})"

    text = HEX_RE.sub(repl_hex, text)
    text = RGBA_RE.sub(repl_rgba, text)
    return text, changes


# 1) Give browsers a real, explicit favicon URL based on the already approved black/white/yellow app icon.
source_icon = ROOT / "app-icon-192.svg"
favicon = ROOT / "favicon.svg"
favicon.write_text(source_icon.read_text(encoding="utf-8"), encoding="utf-8")

# 2) Fix browser/PWA chrome and cache-bust the icon references.
index = ROOT / "index.html"
html = index.read_text(encoding="utf-8")
html = html.replace('<meta name="theme-color" content="#1A0633">', '<meta name="theme-color" content="#050505">')
html = re.sub(
    r'<link rel="apple-touch-icon" href="[^"]+">',
    f'<link rel="apple-touch-icon" href="app-icon-192.svg?v={VERSION}">',
    html,
)

icon_links = (
    f'  <link rel="icon" type="image/svg+xml" href="favicon.svg?v={VERSION}">\n'
    f'  <link rel="shortcut icon" type="image/svg+xml" href="favicon.svg?v={VERSION}">\n'
    f'  <link rel="mask-icon" href="favicon.svg?v={VERSION}" color="#FFCD00">\n'
)
if 'rel="icon"' not in html:
    html = html.replace('  <link rel="manifest" href="manifest.webmanifest">\n', '  <link rel="manifest" href="manifest.webmanifest">\n' + icon_links)
else:
    html = re.sub(r'^\s*<link rel="(?:icon|shortcut icon|mask-icon)"[^>]*>\s*\n?', '', html, flags=re.MULTILINE)
    html = html.replace('  <link rel="manifest" href="manifest.webmanifest">\n', '  <link rel="manifest" href="manifest.webmanifest">\n' + icon_links)

# 3) Remove violet colour literals from the root Constelación 8 front-end fallbacks too.
# contrast.css already defines the final black/yellow/white identity; this prevents any purple flash
# before that override loads, and removes the old purple from inline SVG/CSS metadata.
root_assets = [
    ROOT / "index.html",
    ROOT / "app.css",
    ROOT / "refine.css",
    ROOT / "contrast.css",
    ROOT / "origin-note.css",
    ROOT / "install-app.css",
]

index.write_text(html, encoding="utf-8")

summary: dict[str, int] = {}
for path in root_assets:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    text, count = neutralize_css_colors(text)
    path.write_text(text, encoding="utf-8")
    summary[path.name] = count

# Re-assert exact brand browser colour after generic neutralisation.
html = index.read_text(encoding="utf-8")
html = re.sub(r'<meta name="theme-color" content="#[0-9A-Fa-f]{6}">', '<meta name="theme-color" content="#050505">', html, count=1)
index.write_text(html, encoding="utf-8")

# Fail if any literal violet remains in the root front-end files.
remaining = []
for path in root_assets + [favicon, ROOT / "app-icon-192.svg", ROOT / "app-icon-512.svg"]:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    for match in HEX_RE.finditer(text):
        raw = match.group(1)
        r, g, b = int(raw[0:2], 16), int(raw[2:4], 16), int(raw[4:6], 16)
        if is_violet(r, g, b):
            remaining.append(f"{path.name}: {match.group(0)}")
    for match in RGBA_RE.finditer(text):
        r, g, b = map(int, match.group(1, 2, 3))
        if is_violet(r, g, b):
            remaining.append(f"{path.name}: {match.group(0)}")

if remaining:
    raise SystemExit("Violet colours still present:\n" + "\n".join(remaining))

print("Violet cleanup complete:", summary)
print("Favicon:", favicon.name)
print("Cache version:", VERSION)
