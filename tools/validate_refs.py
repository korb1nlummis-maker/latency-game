"""Validate all story node cross-references."""
import json, glob, os

# Build a map of all valid node IDs
all_nodes = {}  # full_id -> True
file_nodes = {}  # filePath -> set of short keys

for f in sorted(glob.glob("story/**/*.json", recursive=True)):
    if "MANIFEST" in f:
        continue
    try:
        with open(f, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        nodes = data.get("nodes", {})
        if not nodes:
            continue

        # Determine the file path prefix from the file location
        rel = os.path.relpath(f, "story").replace("\\", "/").replace(".json", "")
        parts = rel.split("/")
        file_key = ".".join(parts)  # e.g., "factions.iron-collective"

        file_nodes[file_key] = set()
        for nid in nodes:
            full_id = file_key + "." + nid
            all_nodes[full_id] = f
            file_nodes[file_key].add(nid)
    except Exception as e:
        print("ERROR loading %s: %s" % (f, e))

print("Total valid node IDs: %d" % len(all_nodes))

# Now check all references
broken = 0
checked = 0
for f in sorted(glob.glob("story/**/*.json", recursive=True)):
    if "MANIFEST" in f:
        continue
    try:
        with open(f, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        nodes = data.get("nodes", {})
        if not nodes:
            continue

        for nid, node in nodes.items():
            choices = node.get("choices", [])
            for c in choices:
                nxt = c.get("next")
                if nxt and nxt != "NONE":
                    checked += 1
                    if nxt not in all_nodes:
                        bn = os.path.basename(f)
                        print("BROKEN: %s node %s -> %s" % (bn, nid, nxt))
                        broken += 1

            auto = node.get("autoNext")
            if auto:
                checked += 1
                if auto not in all_nodes:
                    bn = os.path.basename(f)
                    print("BROKEN: %s node %s autoNext -> %s" % (bn, nid, auto))
                    broken += 1
    except:
        pass

print("\nChecked %d references, %d broken" % (checked, broken))
