"""
Fix stat check choices across all LATENCY story JSON files.

Problem: ~80% of stat checks are meaningless — fail/success go to the same node.
This script ensures every stat check has real consequences.

Categories fixed:
1. No failNext at all (439 choices) — find alternative branch or add penalties
2. failNext === next (182 choices) — add onFailure penalties + onSuccess bonuses
"""

import json
import glob
import os
import hashlib

STORY_DIR = "D:/Latency/story"
FAIL_WORDS = ['fail', 'caught', 'retreat', 'escape', 'damage', 'hurt', 'death',
              'die', 'dead', 'punish', 'penalty', 'worse', 'trap', 'ambush',
              'attack', 'guard', 'alarm', 'betray', 'reject', 'refuse', 'lose']

# Stats for summary
stats = {
    'files_modified': set(),
    'no_failnext_fixed_alt_branch': 0,
    'no_failnext_fixed_fail_node': 0,
    'no_failnext_fixed_penalties': 0,
    'same_target_fixed': 0,
    'onsuccess_added': 0,
    'onfailure_added': 0,
    'skipped_already_good': 0,
    'total_processed': 0,
}


def deterministic_random(seed_str, low, high):
    """Generate a deterministic 'random' int from a string seed."""
    h = int(hashlib.md5(seed_str.encode()).hexdigest(), 16)
    return low + (h % (high - low + 1))


def get_dc(choice):
    return choice.get('statCheck', {}).get('dc', 10)


def get_stat(choice):
    return choice.get('statCheck', {}).get('stat', 'strength')


def make_failure_penalties(choice, node_id):
    """Create onFailure actions scaled to DC difficulty."""
    dc = get_dc(choice)
    stat = get_stat(choice)
    seed = f"{node_id}_{stat}_{dc}"

    actions = []

    # Health loss scaled to DC
    if dc <= 10:
        hp_loss = deterministic_random(seed + "_hp", 3, 5)
    elif dc <= 14:
        hp_loss = deterministic_random(seed + "_hp", 5, 8)
    else:
        hp_loss = deterministic_random(seed + "_hp", 7, 10)
    actions.append({"type": "modify_stat", "stat": "health", "amount": -hp_loss})

    # Currency loss scaled to DC
    if dc <= 10:
        cred_loss = deterministic_random(seed + "_cred", 5, 10)
    elif dc <= 14:
        cred_loss = deterministic_random(seed + "_cred", 10, 18)
    else:
        cred_loss = deterministic_random(seed + "_cred", 15, 25)
    actions.append({"type": "modify_currency", "amount": -cred_loss})

    # Failure flag
    safe_id = node_id.replace('.', '_')
    actions.append({"type": "set_flag", "flag": f"failed_check_{safe_id}", "value": True})

    return actions


def make_success_bonuses(choice, node_id):
    """Create onSuccess actions scaled to DC difficulty."""
    dc = get_dc(choice)
    seed = f"{node_id}_{dc}_success"

    actions = []

    # XP gain scaled to DC
    if dc <= 10:
        xp = deterministic_random(seed + "_xp", 10, 15)
    elif dc <= 14:
        xp = deterministic_random(seed + "_xp", 15, 20)
    else:
        xp = deterministic_random(seed + "_xp", 20, 25)
    actions.append({"type": "add_experience", "amount": xp})

    # Currency gain (50% chance based on seed)
    if deterministic_random(seed + "_cred_chance", 0, 1) == 1:
        if dc <= 10:
            cred = deterministic_random(seed + "_cred", 5, 8)
        elif dc <= 14:
            cred = deterministic_random(seed + "_cred", 8, 12)
        else:
            cred = deterministic_random(seed + "_cred", 10, 15)
        actions.append({"type": "modify_currency", "amount": cred})

    return actions


def get_file_prefix(nodes):
    """
    Get the common ID prefix for nodes in this file by examining existing
    'next' references in choices. Falls back to node 'id' field.
    """
    # Strategy 1: Look at 'next' fields in choices to find the prefix
    node_keys = set(nodes.keys())
    for nid, node in nodes.items():
        for ch in node.get('choices', []):
            nxt = ch.get('next', '')
            if nxt and '.' in nxt:
                # e.g. "shared.random-encounters.re_002" -> check if "re_002" is a key
                parts = nxt.rsplit('.', 1)
                if len(parts) == 2 and parts[1] in node_keys:
                    return parts[0]

    # Strategy 2: Look at node 'id' fields
    for nid, node in nodes.items():
        full_id = node.get('id', '')
        if full_id and '.' in full_id:
            parts = full_id.rsplit('.', 1)
            if len(parts) == 2:
                return parts[0]

    return ""


def find_fail_node_in_file(nodes, current_node_id, success_target_key, file_prefix):
    """
    Search the file's nodes for a 'negative outcome' node that could serve as
    a failure branch. Returns the FULL ID (with prefix).
    """
    candidates = []
    for nid, node in nodes.items():
        if nid == current_node_id or nid == success_target_key:
            continue

        # Check node text for fail words
        text = node.get('text', '')
        if isinstance(text, list):
            text = ' '.join(str(t) for t in text)
        text_lower = text.lower()
        title_lower = node.get('title', '').lower()
        combined = text_lower + ' ' + title_lower

        score = sum(1 for w in FAIL_WORDS if w in combined)
        if score > 0:
            candidates.append((nid, score))

    if not candidates:
        return None

    # Sort by score descending, pick top candidate
    candidates.sort(key=lambda x: -x[1])
    best_key = candidates[0][0]

    # Build full ID
    if file_prefix:
        return f"{file_prefix}.{best_key}"
    return best_key


def fix_no_failnext(choice, node_id, node, all_nodes, file_prefix, filepath):
    """
    Fix a stat check choice that has no failNext.
    Strategy priority:
    1. Use an alternative target from sibling choices in the same node
    2. Find a 'fail' node in the same file
    3. Add penalties and keep same target
    """
    success_target = choice.get('next', '')
    choices = node.get('choices', [])

    # Strategy 1: Find alternative targets from sibling choices
    sibling_targets = set()
    for ch in choices:
        ch_next = ch.get('next', '')
        ch_fail = ch.get('failNext', '')
        if ch_next and ch_next != success_target:
            sibling_targets.add(ch_next)
        if ch_fail and ch_fail != success_target:
            sibling_targets.add(ch_fail)

    if sibling_targets:
        alt = sorted(sibling_targets)[0]
        choice['failNext'] = alt
        choice['onFailure'] = make_failure_penalties(choice, node_id)
        if 'onSuccess' not in choice:
            choice['onSuccess'] = make_success_bonuses(choice, node_id)
        stats['no_failnext_fixed_alt_branch'] += 1
        stats['files_modified'].add(filepath)
        return

    # Strategy 2: Find a fail-type node in the file
    success_key = success_target.rsplit('.', 1)[-1] if '.' in success_target else success_target
    fail_full_id = find_fail_node_in_file(all_nodes, node_id, success_key, file_prefix)
    if fail_full_id and fail_full_id != success_target:
        choice['failNext'] = fail_full_id
        choice['onFailure'] = make_failure_penalties(choice, node_id)
        if 'onSuccess' not in choice:
            choice['onSuccess'] = make_success_bonuses(choice, node_id)
        stats['no_failnext_fixed_fail_node'] += 1
        stats['files_modified'].add(filepath)
        return

    # Strategy 3: Same target but add penalties
    choice['failNext'] = success_target
    choice['onFailure'] = make_failure_penalties(choice, node_id)
    if 'onSuccess' not in choice:
        choice['onSuccess'] = make_success_bonuses(choice, node_id)
    stats['no_failnext_fixed_penalties'] += 1
    stats['files_modified'].add(filepath)


def fix_same_target(choice, node_id, filepath):
    """
    Fix a stat check choice where failNext === next.
    Add onFailure penalties and onSuccess bonuses so the roll matters.
    """
    if 'onFailure' not in choice:
        choice['onFailure'] = make_failure_penalties(choice, node_id)
        stats['onfailure_added'] += 1

    if 'onSuccess' not in choice:
        choice['onSuccess'] = make_success_bonuses(choice, node_id)
        stats['onsuccess_added'] += 1

    stats['same_target_fixed'] += 1
    stats['files_modified'].add(filepath)


def process_file(filepath):
    """Process a single story JSON file."""
    with open(filepath, encoding='utf-8') as f:
        data = json.load(f)

    nodes = data.get('nodes', {})
    if not nodes:
        return data, False

    file_prefix = get_file_prefix(nodes)
    modified = False

    for node_id, node in nodes.items():
        choices = node.get('choices', [])
        for choice in choices:
            if 'statCheck' not in choice:
                continue

            stats['total_processed'] += 1
            success_target = choice.get('next', '')
            fail_target = choice.get('failNext', '')

            # Case 1: Already has different failNext — skip
            if fail_target and fail_target != success_target:
                stats['skipped_already_good'] += 1
                continue

            # Case 2: No failNext at all
            if not fail_target:
                fix_no_failnext(choice, node_id, node, nodes, file_prefix, filepath)
                modified = True
                continue

            # Case 3: failNext === next
            if fail_target == success_target:
                fix_same_target(choice, node_id, filepath)
                modified = True
                continue

    return data, modified


def main():
    files = glob.glob(os.path.join(STORY_DIR, '**', '*.json'), recursive=True)
    files = [f for f in files if 'MANIFEST' not in f]
    files.sort()

    print(f"Scanning {len(files)} story files...\n")

    for filepath in files:
        data, modified = process_file(filepath)
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)

    # Print summary
    print("=" * 60)
    print("STAT CHECK FIX SUMMARY")
    print("=" * 60)
    print(f"Total stat checks processed: {stats['total_processed']}")
    print(f"Already working (different failNext): {stats['skipped_already_good']}")
    print()
    print("--- No failNext (was 439) ---")
    print(f"  Fixed with alt branch from siblings: {stats['no_failnext_fixed_alt_branch']}")
    print(f"  Fixed with fail-type node:           {stats['no_failnext_fixed_fail_node']}")
    print(f"  Fixed with penalties (same target):   {stats['no_failnext_fixed_penalties']}")
    no_failnext_total = (stats['no_failnext_fixed_alt_branch'] +
                         stats['no_failnext_fixed_fail_node'] +
                         stats['no_failnext_fixed_penalties'])
    print(f"  SUBTOTAL:                             {no_failnext_total}")
    print()
    print("--- failNext === next (was 182) ---")
    print(f"  Fixed with penalties+bonuses:          {stats['same_target_fixed']}")
    print(f"  onFailure actions added:               {stats['onfailure_added']}")
    print(f"  onSuccess actions added:               {stats['onsuccess_added']}")
    print()
    total_fixed = no_failnext_total + stats['same_target_fixed']
    print(f"TOTAL FIXED: {total_fixed}")
    print(f"Files modified: {len(stats['files_modified'])}")
    print()
    for f in sorted(stats['files_modified']):
        print(f"  {os.path.relpath(f, STORY_DIR)}")


if __name__ == '__main__':
    main()
