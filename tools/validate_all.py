#!/usr/bin/env python3
"""
LATENCY - Comprehensive Story Validation
Checks ALL story JSON files for broken references, dead ends, and structural issues.
"""

import json
import glob
import re
import os
import sys

STORY_DIR = os.path.join(os.path.dirname(__file__), '..', 'story')
ENEMIES_FILE = os.path.join(os.path.dirname(__file__), '..', 'js', 'data', 'enemies.js')

def load_enemy_ids():
    """Parse enemies.js and extract all top-level enemy key names."""
    with open(ENEMIES_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    # Match top-level keys like:  slum_thug: {
    # These are indented exactly 4 spaces and followed by {
    ids = set(re.findall(r'^\s{4}(\w+)\s*:\s*\{', content, re.MULTILINE))
    # Filter out sub-properties that happen to match the pattern
    props = {'id', 'name', 'level', 'stats', 'maxHp', 'armor', 'weapon',
             'abilities', 'ai', 'loot', 'xp', 'description'}
    ids -= props
    return ids

def load_all_story_files():
    """Load all .json files from story/ recursively. Returns dict of filepath -> nodes."""
    all_files = {}
    all_nodes = {}  # node_id -> (filepath, node_key, node_data)
    pattern = os.path.join(STORY_DIR, '**', '*.json')
    for filepath in glob.glob(pattern, recursive=True):
        # Skip manifest/metadata files
        basename = os.path.basename(filepath).lower()
        if basename == 'manifest.json':
            continue
        rel = os.path.relpath(filepath, os.path.join(STORY_DIR, '..'))
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except UnicodeDecodeError:
            with open(filepath, 'r', encoding='utf-8-sig') as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"ERROR: Cannot parse {rel}: {e}")
            continue

        nodes = data.get('nodes', data)
        file_nodes = {}

        # Derive the file prefix from the path: story/factions/ghost-syndicate.json -> factions.ghost-syndicate
        rel_to_story = os.path.relpath(filepath, STORY_DIR)
        file_prefix = os.path.splitext(rel_to_story)[0].replace(os.sep, '.').replace('/', '.')

        for key, node in nodes.items():
            if not isinstance(node, dict):
                continue
            node_id = node.get('id', key)
            file_nodes[key] = node

            # Register under explicit id
            if node_id in all_nodes:
                prev_file = all_nodes[node_id][0]
                if prev_file != rel:
                    print(f"WARNING: Duplicate node ID '{node_id}' in {rel} and {prev_file}")
            all_nodes[node_id] = (rel, key, node)

            # Also register under inferred full path (file_prefix.key) if different
            inferred_id = f"{file_prefix}.{key}"
            if inferred_id != node_id:
                all_nodes[inferred_id] = (rel, key, node)

        all_files[rel] = file_nodes
    return all_files, all_nodes

def validate():
    issues = []
    enemy_ids = load_enemy_ids()
    all_files, all_nodes = load_all_story_files()
    valid_ids = set(all_nodes.keys())

    total_nodes = 0
    total_refs = 0

    for filepath, nodes in all_files.items():
        for key, node in nodes.items():
            total_nodes += 1
            node_id = node.get('id', key)
            choices = node.get('choices', None)
            combat = node.get('combat', None)
            is_ending = node.get('isEnding', False)

            # --- Check combat enemy IDs ---
            if combat and 'enemies' in combat:
                for enemy in combat['enemies']:
                    eid = enemy.get('id', '')
                    if eid and eid not in enemy_ids:
                        issues.append((filepath, key, f"Combat enemy ID '{eid}' not found in enemies.js"))

                # Check combat onWin/onLose/onFlee references
                for field in ('onWin', 'onLose', 'onFlee'):
                    target = combat.get(field)
                    if target and target not in valid_ids:
                        total_refs += 1
                        issues.append((filepath, key, f"Combat {field} references missing node '{target}'"))
                    elif target:
                        total_refs += 1

            # --- Check choices ---
            if choices is not None:
                if isinstance(choices, list):
                    for i, choice in enumerate(choices):
                        if not isinstance(choice, dict):
                            continue
                        # Check "next"
                        nxt = choice.get('next')
                        if nxt:
                            total_refs += 1
                            if nxt not in valid_ids:
                                issues.append((filepath, key, f"Choice {i} 'next' references missing node '{nxt}'"))
                        # Check "failNext"
                        fail = choice.get('failNext')
                        if fail:
                            total_refs += 1
                            if fail not in valid_ids:
                                issues.append((filepath, key, f"Choice {i} 'failNext' references missing node '{fail}'"))
                        # Check "passNext" (alternate success path)
                        pass_next = choice.get('passNext')
                        if pass_next:
                            total_refs += 1
                            if pass_next not in valid_ids:
                                issues.append((filepath, key, f"Choice {i} 'passNext' references missing node '{pass_next}'"))
                        # Check conditions with next
                        conditions = choice.get('conditions')
                        if conditions and isinstance(conditions, list):
                            for j, cond in enumerate(conditions):
                                if isinstance(cond, dict):
                                    cnxt = cond.get('next')
                                    if cnxt:
                                        total_refs += 1
                                        if cnxt not in valid_ids:
                                            issues.append((filepath, key, f"Choice {i} condition {j} 'next' references missing node '{cnxt}'"))

            # --- Check for dead ends ---
            # A node is a dead end if it has no way forward:
            #   - No choices (or empty choices array)
            #   - No combat (combat has onWin/onLose)
            #   - Not marked as isEnding
            has_choices = choices is not None and isinstance(choices, list) and len(choices) > 0
            has_combat = combat is not None
            has_ending = is_ending is True

            # Node-level statCheck (passNext/failNext)
            node_stat_check = node.get('statCheck')
            has_node_stat_check = node_stat_check is not None

            if not has_choices and not has_combat and not has_ending and not has_node_stat_check:
                # Check if it has a "next" at node level (some nodes use this)
                node_next = node.get('next')
                if node_next:
                    total_refs += 1
                    if node_next not in valid_ids:
                        issues.append((filepath, key, f"Node-level 'next' references missing node '{node_next}'"))
                else:
                    issues.append((filepath, key, f"DEAD END - No choices, no combat, no statCheck, not an ending (id: {node_id})"))

    # Print results
    print("=" * 80)
    print("LATENCY STORY VALIDATION REPORT")
    print("=" * 80)
    print(f"Files scanned:  {len(all_files)}")
    print(f"Total nodes:    {total_nodes}")
    print(f"Total refs:     {total_refs}")
    print(f"Enemy IDs:      {len(enemy_ids)}")
    print(f"Issues found:   {len(issues)}")
    print("=" * 80)

    if not issues:
        print("\nNo issues found! All references are valid.")
    else:
        # Group by issue type
        broken_refs = [i for i in issues if 'missing node' in i[2]]
        dead_ends = [i for i in issues if 'DEAD END' in i[2]]
        bad_enemies = [i for i in issues if 'enemies.js' in i[2]]

        if broken_refs:
            print(f"\n--- BROKEN REFERENCES ({len(broken_refs)}) ---")
            for filepath, key, desc in broken_refs:
                print(f"  [{filepath}] {key}: {desc}")

        if dead_ends:
            print(f"\n--- DEAD ENDS ({len(dead_ends)}) ---")
            for filepath, key, desc in dead_ends:
                print(f"  [{filepath}] {key}: {desc}")

        if bad_enemies:
            print(f"\n--- INVALID ENEMY IDs ({len(bad_enemies)}) ---")
            for filepath, key, desc in bad_enemies:
                print(f"  [{filepath}] {key}: {desc}")

    print("\n" + "=" * 80)
    return len(issues)

if __name__ == '__main__':
    count = validate()
    sys.exit(1 if count > 0 else 0)
