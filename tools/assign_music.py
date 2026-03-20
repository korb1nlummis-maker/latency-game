"""Assign music categories to story nodes based on content and context."""
import json, glob, os

# Music category mapping rules
# Categories: ambient, action, mystery, epic, emotional

# Keywords that indicate combat/action
ACTION_WORDS = {'fight', 'attack', 'combat', 'weapon', 'blade', 'sword', 'gun', 'shoot',
                'punch', 'dodge', 'battle', 'war', 'explosion', 'chase', 'flee', 'sprint',
                'ambush', 'assault', 'strike', 'kill', 'blood', 'wound', 'arena', 'gladiator'}

# Keywords for mystery/hacking
MYSTERY_WORDS = {'hack', 'decrypt', 'terminal', 'data', 'code', 'network', 'surveillance',
                 'investigate', 'clue', 'evidence', 'secret', 'hidden', 'encrypted', 'ghost',
                 'infiltrate', 'stealth', 'sneak', 'shadow', 'spy', 'trace', 'signal'}

# Keywords for epic/faction moments
EPIC_WORDS = {'revolution', 'uprising', 'rally', 'speech', 'leader', 'council', 'summit',
              'alliance', 'betray', 'ceremony', 'ritual', 'destiny', 'champion', 'glory',
              'victory', 'triumph', 'power', 'throne', 'crown', 'commander', 'faction'}

# Keywords for emotional moments
EMOTIONAL_WORDS = {'death', 'dying', 'farewell', 'goodbye', 'remember', 'memory', 'loss',
                   'grief', 'tears', 'love', 'heart', 'family', 'child', 'mother', 'father',
                   'sacrifice', 'hope', 'dream', 'ending', 'peace', 'forgive', 'regret'}

# File-level defaults based on story category
FILE_DEFAULTS = {
    'origins': 'ambient',
    'factions': 'epic',
    'jobs': 'ambient',
    'act1': 'ambient',
    'act2': 'mystery',
    'act3': 'epic',
    'act4': 'action',
    'act5': 'epic',
    'endings': 'emotional',
    'shared': 'ambient',
}

# Specific file overrides
FILE_OVERRIDES = {
    'chapter1-enforcer.json': 'action',
    'chapter1-hacker.json': 'mystery',
    'chapter1-medic.json': 'ambient',
    'chapter1-smuggler.json': 'mystery',
    'chapter2-iron-neon.json': 'epic',
    'chapter2-saints-ghost.json': 'mystery',
    'chapter2-ashen.json': 'emotional',
    'combat-endings.json': 'action',
    'random-encounters.json': 'ambient',
    'side-quests.json': 'mystery',
    'enforcer.json': 'action',
    'hacker.json': 'mystery',
    'gladiator.json': 'action',
    'diplomat.json': 'epic',
    'iron-collective.json': 'action',
    'ghost-syndicate.json': 'mystery',
    'circuit-saints.json': 'mystery',
    'neon-court.json': 'epic',
    'ashen-circle.json': 'emotional',
}


def score_text(text_str):
    """Score text against each category and return the best match."""
    words = set(text_str.lower().split())
    scores = {
        'action': len(words & ACTION_WORDS),
        'mystery': len(words & MYSTERY_WORDS),
        'epic': len(words & EPIC_WORDS),
        'emotional': len(words & EMOTIONAL_WORDS),
    }
    best = max(scores, key=scores.get)
    if scores[best] >= 2:
        return best
    return None  # No strong signal


def get_text(node):
    """Extract text from a node."""
    text = node.get('text', '')
    if isinstance(text, list):
        parts = []
        for item in text:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict) and 'text' in item:
                parts.append(item['text'])
        return ' '.join(parts)
    return str(text)


updated = 0
skipped = 0
total = 0

for f in sorted(glob.glob("story/**/*.json", recursive=True)):
    if "MANIFEST" in f:
        continue

    bn = os.path.basename(f)
    parts = f.replace(os.sep, "/").split("/")
    idx = parts.index("story") if "story" in parts else 0
    cat = parts[idx + 1] if idx + 1 < len(parts) else "other"

    # Determine file-level default
    file_default = FILE_OVERRIDES.get(bn, FILE_DEFAULTS.get(cat, 'ambient'))

    try:
        with open(f, "r", encoding="utf-8") as fh:
            data = json.load(fh)

        nodes = data.get("nodes", {})
        if not nodes:
            continue

        changed = False
        for nid, node in nodes.items():
            total += 1
            # Skip nodes that already have music set
            if node.get('music') is not None:
                skipped += 1
                continue

            # Try content-based scoring
            text = get_text(node)
            content_category = score_text(text)

            # Check for combat property
            if node.get('combat'):
                content_category = 'action'

            # Check for isEnding
            if node.get('isEnding'):
                content_category = content_category or 'emotional'

            # Use content-based if strong, otherwise file default
            music = content_category or file_default

            node['music'] = music
            changed = True
            updated += 1

        if changed:
            with open(f, "w", encoding="utf-8") as fh:
                json.dump(data, fh, indent=4, ensure_ascii=False)

    except Exception as e:
        print("ERROR %s: %s" % (bn, e))

print("Total nodes: %d" % total)
print("Updated: %d" % updated)
print("Skipped (already had music): %d" % skipped)
