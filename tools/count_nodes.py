import json, glob, os

total = 0
cats = {}
for f in sorted(glob.glob("story/**/*.json", recursive=True)):
    try:
        with open(f, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        nodes = data.get("nodes", {})
        if not nodes:
            nodes = {k:v for k,v in data.items() if isinstance(v, dict) and ("text" in v or "content" in v)}
        count = len(nodes)
        bn = os.path.basename(f)
        parts = f.replace(os.sep, "/").split("/")
        idx = parts.index("story") if "story" in parts else 0
        cat = parts[idx+1] if idx+1 < len(parts) else "other"
        cats.setdefault(cat, 0)
        cats[cat] += count
        total += count
        print("  %s: %d" % (bn, count))
    except Exception as e:
        print("  ERROR %s: %s" % (os.path.basename(f), e))

print("")
for cat in sorted(cats):
    print("  %s: %d" % (cat, cats[cat]))
print("TOTAL: %d" % total)
