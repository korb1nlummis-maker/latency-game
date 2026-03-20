"""Validate story nodes for dead ends, unreachable content, and ending integrity."""
import json, glob, os, sys

def main():
    os.chdir(os.path.join(os.path.dirname(__file__), ".."))

    all_nodes = {}  # full_id -> node data
    all_files = {}  # full_id -> file path
    all_targets = set()  # all referenced node IDs (choice targets + autoNext targets)

    # Load all nodes
    for f in sorted(glob.glob("story/**/*.json", recursive=True)):
        if "MANIFEST" in f:
            continue
        try:
            with open(f, "r", encoding="utf-8") as fh:
                data = json.load(fh)
            nodes = data.get("nodes", {})
            if not nodes:
                continue

            rel = os.path.relpath(f, "story").replace("\\", "/").replace(".json", "")
            file_key = ".".join(rel.split("/"))

            for nid, node in nodes.items():
                full_id = file_key + "." + nid
                all_nodes[full_id] = node
                all_files[full_id] = f

                # Collect all outgoing references
                for c in node.get("choices", []):
                    nxt = c.get("next")
                    if nxt and nxt != "NONE":
                        all_targets.add(nxt)
                auto = node.get("autoNext")
                if auto:
                    all_targets.add(auto)
        except Exception as e:
            print("ERROR loading %s: %s" % (f, e))

    print("Total nodes loaded: %d" % len(all_nodes))

    # Check for dead ends
    dead_ends = []
    endings = []
    empty_text = []
    empty_endings = []

    for full_id, node in sorted(all_nodes.items()):
        has_choices = bool(node.get("choices"))
        has_auto = bool(node.get("autoNext"))
        is_ending = bool(node.get("isEnding"))
        has_combat = bool(node.get("combat"))

        # Check for empty text
        text = node.get("text", [])
        text_content = ""
        for t in text:
            if isinstance(t, str):
                text_content += t
            elif isinstance(t, dict) and "text" in t:
                if isinstance(t["text"], str):
                    text_content += t["text"]
                elif isinstance(t["text"], list):
                    text_content += " ".join(str(x) for x in t["text"])
        if not text_content.strip():
            empty_text.append(full_id)

        if is_ending:
            endings.append(full_id)
            if not text_content.strip():
                empty_endings.append(full_id)

        # A node is a dead end if it has no outgoing path and isn't an ending
        if not has_choices and not has_auto and not is_ending and not has_combat:
            dead_ends.append(full_id)

    # Report
    print("\n=== DEAD END NODES (no choices, no autoNext, not isEnding, no combat) ===")
    if dead_ends:
        for d in dead_ends:
            f = all_files[d]
            node = all_nodes[d]
            text = node.get("text", [])
            preview = ""
            for t in text:
                if isinstance(t, str):
                    preview = t[:120]
                    break
            print("  DEAD END: %s" % d)
            print("    File: %s" % f)
            print("    Preview: %s..." % preview[:100] if preview else "    Preview: (no text)")
            print()
    else:
        print("  None found!")

    print("\n=== ENDINGS ===")
    print("  Total endings found: %d" % len(endings))
    for e in endings:
        node = all_nodes[e]
        title = node.get("title", "(no title)")
        print("    %s — %s" % (e, title))

    if empty_text:
        print("\n=== NODES WITH EMPTY TEXT ===")
        for e in empty_text:
            print("  %s" % e)

    if empty_endings:
        print("\n=== ENDINGS WITH EMPTY TEXT ===")
        for e in empty_endings:
            print("  %s" % e)

    # Summary
    print("\n=== SUMMARY ===")
    print("  Total nodes: %d" % len(all_nodes))
    print("  Total endings: %d" % len(endings))
    print("  Dead ends: %d" % len(dead_ends))
    print("  Empty text nodes: %d" % len(empty_text))
    print("  Empty endings: %d" % len(empty_endings))

    return dead_ends

if __name__ == "__main__":
    dead_ends = main()
    sys.exit(1 if dead_ends else 0)
