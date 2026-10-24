"""
Replaces the placeholder domain everywhere. Run once from the site folder:

    python _tools/set_domain.py kristan-apartments.com
"""
import sys, pathlib
if len(sys.argv) != 2:
    sys.exit("Usage: python _tools/set_domain.py www.your-real-domain.com")
new = sys.argv[1].strip().removeprefix("https://").removeprefix("http://").strip("/")
root = pathlib.Path(__file__).resolve().parent.parent
for name in ["index.html", "bg/index.html", "sitemap.xml", "robots.txt", "CNAME"]:
    p = root / name
    p.write_text(p.read_text(encoding="utf-8").replace("www.your-domain.com", new), encoding="utf-8")
    print("updated", name)
