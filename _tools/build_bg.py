"""
Builds the Bulgarian page (bg/index.html) from the English index.html.

Edit the English text in index.html and the Bulgarian text in _tools/bg.json,
then run from the site folder:

    python _tools/build_bg.py

Folders starting with "_" are not published by GitHub Pages.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
bg = json.loads((ROOT / "_tools" / "bg.json").read_text(encoding="utf-8"))
missing = []

def text(m):
    key = m.group(3)
    if key not in bg:
        missing.append(key); return m.group(0)
    return m.group(1) + bg[key] + m.group(5)

# inner HTML of elements marked data-i18n="key"
html = re.sub(r'(<(\w+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>)(.*?)(</\2>)', text, html, flags=re.S)

# attributes: alt="" and content=""
def attr(name):
    def fn(m):
        tag, key = m.group(0), m.group(1)
        if key not in bg:
            missing.append(key); return tag
        val = bg[key].replace('"', "&quot;")
        return re.sub(rf'\b{name}="[^"]*"', f'{name}="{val}"', tag)
    return fn
html = re.sub(r'<[^>]*\bdata-i18n-alt="([^"]+)"[^>]*>', attr("alt"), html)
html = re.sub(r'<[^>]*\bdata-i18n-content="([^"]+)"[^>]*>', attr("content"), html)

# language, URLs and relative paths
html = html.replace('<html lang="en" data-root="">', '<html lang="bg" data-root="../">')
html = html.replace('<meta property="og:locale" content="en_GB">', '<meta property="og:locale" content="bg_BG">')
html = re.sub(r'(<link rel="canonical" href="[^"]*/)(">)', r'\1bg/\2', html)
html = re.sub(r'(<meta property="og:url" content="[^"]*/)(">)', r'\1bg/\2', html)
html = html.replace('<a href="./" hreflang="en" lang="en" class="is-active" aria-current="true">EN</a>',
                    '<a href="../" hreflang="en" lang="en">EN</a>')
html = html.replace('<a href="bg/" hreflang="bg" lang="bg">BG</a>',
                    '<a href="./" hreflang="bg" lang="bg" class="is-active" aria-current="true">BG</a>')
for a in ('src="', 'href="', 'data-src="'):
    html = html.replace(a + "img/", a + "../img/")
html = html.replace('href="styles.css"', 'href="../styles.css"').replace('src="script.js"', 'src="../script.js"')

out = ROOT / "bg" / "index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"Wrote {out}")
if missing:
    print("Missing Bulgarian text for:", ", ".join(sorted(set(missing))))
