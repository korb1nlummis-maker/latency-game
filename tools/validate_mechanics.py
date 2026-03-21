#!/usr/bin/env python3
"""
validate_mechanics.py — QA validator for LATENCY story JSON mechanics.

Checks:
  1. statCheck format: valid stat names, numeric DC, passNext/failNext presence
  2. Wrong key names (skillCheck, pass, fail, etc.)
  3. Condition types and stat names in conditions
  4. onEnter action types — flags unknown types
  5. Common formatting issues (uppercase stats, skill vs stat, missing fields)
"""

import json
import os
import sys
from pathlib import Path

STORY_DIR = Path(__file__).resolve().parent.parent / "story"

VALID_STATS = {
    "strength", "dexterity", "constitution", "intelligence",
    "wisdom", "charisma", "tech", "luck"
}

# Action types actually handled by narrative.js switch statement
VALID_ACTION_TYPES = {
    "set_flag", "remove_flag",
    "add_experience", "add_xp",
    "modify_currency",
    "modify_stat",
    "modify_reputation",
    "add_item", "remove_item",
    "heal", "damage",
    "start_combat",
    "play_cutscene",
    "change_music",
    "set_job",
    "modify_relationship",
}

# Action types used in story files but silently ignored (fall to default warning)
KNOWN_UNHANDLED_TYPES = {
    "trigger_event",
    "trigger_achievement",
    "play_music",
}

VALID_CONDITION_TYPES = {
    "has_flag", "stat_check", "has_item", "faction_rep",
    "race", "job", "flag", "level", "not_flag",
    "relationship", "has_quest", "quest_complete",
}

# Common wrong abbreviations for stats
STAT_ABBREVIATIONS = {
    "str": "strength", "dex": "dexterity", "con": "constitution",
    "int": "intelligence", "wis": "wisdom", "cha": "charisma",
    "STR": "strength", "DEX": "dexterity", "CON": "constitution",
    "INT": "intelligence", "WIS": "wisdom", "CHA": "charisma",
    "TECH": "tech", "LUCK": "luck",
    "Strength": "strength", "Dexterity": "dexterity",
    "Constitution": "constitution", "Intelligence": "intelligence",
    "Wisdom": "wisdom", "Charisma": "charisma", "Tech": "tech", "Luck": "luck",
}

WRONG_KEY_NAMES = {
    "skillCheck": "should be 'statCheck'",
    "skill_check": "should be 'statCheck'",
    "pass": "should be 'next' (passNext is implicit via 'next')",
    "fail": "should be 'failNext'",
    "passNode": "should be 'next'",
    "failNode": "should be 'failNext'",
    "passNext": "not used — success path uses 'next' on the choice",
}


class Issue:
    def __init__(self, severity, file, node_id, path, message):
        self.severity = severity  # ERROR, WARNING, INFO
        self.file = file
        self.node_id = node_id
        self.path = path
        self.message = message

    def __str__(self):
        rel = os.path.relpath(self.file, STORY_DIR)
        loc = f"{rel} :: {self.node_id}"
        if self.path:
            loc += f" -> {self.path}"
        return f"[{self.severity}] {loc}\n         {self.message}".encode(
            "ascii", errors="replace").decode("ascii")


def load_story_files():
    """Recursively load all .json story files, skipping MANIFEST.json."""
    files = {}
    for p in sorted(STORY_DIR.rglob("*.json")):
        if p.name == "MANIFEST.json":
            continue
        try:
            with open(p, "r", encoding="utf-8") as f:
                files[p] = json.load(f)
        except json.JSONDecodeError as e:
            print(f"[FATAL] Cannot parse {p}: {e}")
    return files


def check_stat_name(stat_name, file, node_id, path, issues):
    """Validate a stat name, flag abbreviations and wrong case."""
    if stat_name in VALID_STATS:
        return
    if stat_name in STAT_ABBREVIATIONS:
        issues.append(Issue(
            "ERROR", file, node_id, path,
            f"Stat '{stat_name}' is abbreviated/wrong-case — use '{STAT_ABBREVIATIONS[stat_name]}'"
        ))
    else:
        issues.append(Issue(
            "ERROR", file, node_id, path,
            f"Invalid stat name '{stat_name}' — valid: {', '.join(sorted(VALID_STATS))}"
        ))


def check_stat_check(choice, choice_idx, file, node_id, issues):
    """Validate a statCheck on a choice."""
    sc = choice["statCheck"]
    path = f"choices[{choice_idx}].statCheck"

    # Check stat name
    if "stat" not in sc:
        issues.append(Issue(
            "ERROR", file, node_id, path,
            "statCheck missing 'stat' field"
        ))
    else:
        check_stat_name(sc["stat"], file, node_id, path + ".stat", issues)

    # Check DC
    if "dc" not in sc:
        issues.append(Issue(
            "ERROR", file, node_id, path,
            "statCheck missing 'dc' field"
        ))
    elif not isinstance(sc["dc"], (int, float)):
        issues.append(Issue(
            "ERROR", file, node_id, path,
            f"statCheck 'dc' is not a number: {sc['dc']!r}"
        ))

    # Check failNext on the choice (sibling of statCheck)
    if "failNext" not in choice:
        issues.append(Issue(
            "WARNING", file, node_id, f"choices[{choice_idx}]",
            "statCheck choice missing 'failNext' — failure will fall back to 'next' (same as success)"
        ))
    elif not isinstance(choice["failNext"], str) or not choice["failNext"].strip():
        issues.append(Issue(
            "ERROR", file, node_id, f"choices[{choice_idx}]",
            f"statCheck 'failNext' is empty or not a string: {choice.get('failNext')!r}"
        ))

    # Check next exists (success path)
    if "next" not in choice:
        issues.append(Issue(
            "ERROR", file, node_id, f"choices[{choice_idx}]",
            "statCheck choice missing 'next' (success path) — PLAYER GETS STUCK"
        ))
    elif not isinstance(choice["next"], str) or not choice["next"].strip():
        issues.append(Issue(
            "ERROR", file, node_id, f"choices[{choice_idx}]",
            f"statCheck 'next' is empty or not a string: {choice.get('next')!r}"
        ))


def check_wrong_keys(obj, file, node_id, path, issues):
    """Flag wrong key names on a choice or node."""
    for key, suggestion in WRONG_KEY_NAMES.items():
        if key in obj:
            issues.append(Issue(
                "ERROR", file, node_id, path,
                f"Wrong key '{key}' found — {suggestion}"
            ))


def check_condition(cond, file, node_id, path, issues):
    """Validate a condition object on a choice or text element."""
    if not isinstance(cond, dict):
        return

    # Simple race/job conditions are just {"race": "..."} or {"job": "..."}
    # These are valid shorthand
    known_cond_keys = {"race", "job", "flag", "not_flag", "stat", "item",
                       "faction", "level", "type", "value", "min", "max",
                       "has_flag", "has_item", "stat_check", "faction_rep",
                       "relationship", "quest", "operator", "npc", "amount"}

    # Check stat names inside conditions
    if "stat" in cond:
        check_stat_name(cond["stat"], file, node_id, path + ".stat", issues)


def check_actions(actions, file, node_id, path, issues):
    """Validate onEnter action arrays."""
    if not isinstance(actions, list):
        issues.append(Issue(
            "ERROR", file, node_id, path,
            f"onEnter is not an array: {type(actions).__name__}"
        ))
        return

    for i, action in enumerate(actions):
        if not isinstance(action, dict):
            issues.append(Issue(
                "ERROR", file, node_id, f"{path}[{i}]",
                f"Action is not an object: {action!r}"
            ))
            continue

        action_type = action.get("type")
        if not action_type:
            # Check for wrong key name 'action' instead of 'type'
            if "action" in action:
                issues.append(Issue(
                    "ERROR", file, node_id, f"{path}[{i}]",
                    f"Uses 'action' key instead of 'type': {action.get('action')!r}"
                ))
            else:
                issues.append(Issue(
                    "ERROR", file, node_id, f"{path}[{i}]",
                    "Action missing 'type' field"
                ))
            continue

        if action_type in VALID_ACTION_TYPES:
            # Validate stat name in modify_stat
            if action_type == "modify_stat" and "stat" in action:
                check_stat_name(action["stat"], file, node_id,
                                f"{path}[{i}].stat", issues)
        elif action_type in KNOWN_UNHANDLED_TYPES:
            issues.append(Issue(
                "WARNING", file, node_id, f"{path}[{i}]",
                f"Action type '{action_type}' is NOT handled by narrative.js "
                f"(falls to default → console.warn)"
            ))
        else:
            issues.append(Issue(
                "ERROR", file, node_id, f"{path}[{i}]",
                f"Unknown action type '{action_type}'"
            ))


def validate_file(file_path, data, issues):
    """Validate all nodes in a story file."""
    nodes = data.get("nodes", {})
    if not isinstance(nodes, dict):
        issues.append(Issue(
            "ERROR", file_path, "(root)", "nodes",
            "Missing or invalid 'nodes' object"
        ))
        return

    for node_key, node in nodes.items():
        if not isinstance(node, dict):
            continue

        node_id = node.get("id", node_key)

        # ── Check for wrong keys on node level ──
        check_wrong_keys(node, file_path, node_id, "node", issues)

        # ── Check statCheck at node level (wrong location) ──
        if "statCheck" in node:
            issues.append(Issue(
                "WARNING", file_path, node_id, "node.statCheck",
                "statCheck on node level (should be on individual choices)"
            ))

        # ── Check onEnter actions ──
        if "onEnter" in node:
            check_actions(node["onEnter"], file_path, node_id, "onEnter", issues)

        # ── Check choices ──
        choices = node.get("choices", [])
        if isinstance(choices, list):
            for ci, choice in enumerate(choices):
                if not isinstance(choice, dict):
                    continue

                # Wrong keys on choice
                check_wrong_keys(choice, file_path, node_id,
                                 f"choices[{ci}]", issues)

                # statCheck validation
                if "statCheck" in choice:
                    check_stat_check(choice, ci, file_path, node_id, issues)

                # Condition on choice
                if "condition" in choice:
                    check_condition(choice["condition"], file_path, node_id,
                                    f"choices[{ci}].condition", issues)

                # Missing next on non-ending choices
                if "next" not in choice and "statCheck" not in choice:
                    if not node.get("isEnding"):
                        issues.append(Issue(
                            "WARNING", file_path, node_id, f"choices[{ci}]",
                            f"Choice has no 'next' — text: {choice.get('text', '???')[:60]}"
                        ))

        # ── Check conditional text stat names ──
        text_items = node.get("text", [])
        if isinstance(text_items, list):
            for ti, item in enumerate(text_items):
                if isinstance(item, dict) and "condition" in item:
                    check_condition(item["condition"], file_path, node_id,
                                    f"text[{ti}].condition", issues)


def main():
    print("=" * 70)
    print("LATENCY Mechanics Validator")
    print("=" * 70)
    print(f"Story directory: {STORY_DIR}")
    print()

    files = load_story_files()
    print(f"Loaded {len(files)} story files")
    print()

    issues = []
    total_nodes = 0
    total_stat_checks = 0
    total_actions = 0
    action_type_counts = {}

    for file_path, data in sorted(files.items()):
        validate_file(file_path, data, issues)

        # Gather stats
        nodes = data.get("nodes", {})
        total_nodes += len(nodes)
        for node in nodes.values():
            if not isinstance(node, dict):
                continue
            # Count actions
            for action in node.get("onEnter", []):
                if isinstance(action, dict):
                    total_actions += 1
                    t = action.get("type", "<missing>")
                    action_type_counts[t] = action_type_counts.get(t, 0) + 1
            # Count stat checks
            for choice in node.get("choices", []):
                if isinstance(choice, dict) and "statCheck" in choice:
                    total_stat_checks += 1

    # ── Print results ──
    errors = [i for i in issues if i.severity == "ERROR"]
    warnings = [i for i in issues if i.severity == "WARNING"]
    infos = [i for i in issues if i.severity == "INFO"]

    if errors:
        print(f"{'ERRORS':=^70}")
        for issue in errors:
            print(issue)
            print()

    if warnings:
        print(f"{'WARNINGS':=^70}")
        for issue in warnings:
            print(issue)
            print()

    # ── Summary stats ──
    print(f"{'SUMMARY':=^70}")
    print(f"  Files scanned:    {len(files)}")
    print(f"  Nodes scanned:    {total_nodes}")
    print(f"  Stat checks:      {total_stat_checks}")
    print(f"  onEnter actions:  {total_actions}")
    print()
    print("  Action type breakdown:")
    for t, count in sorted(action_type_counts.items(), key=lambda x: -x[1]):
        marker = ""
        if t in KNOWN_UNHANDLED_TYPES:
            marker = " [UNHANDLED by narrative.js]"
        elif t not in VALID_ACTION_TYPES:
            marker = " [UNKNOWN]"
        print(f"    {t:30s} {count:5d}{marker}")
    print()
    print(f"  ERRORS:   {len(errors)}")
    print(f"  WARNINGS: {len(warnings)}")
    print(f"  INFO:     {len(infos)}")
    print()

    if errors:
        print("!!! ERRORS FOUND — some stat checks may cause players to get stuck !!!")
        return 1
    elif warnings:
        print("Warnings found but no blocking errors.")
        return 0
    else:
        print("All mechanics validated successfully.")
        return 0


if __name__ == "__main__":
    sys.exit(main())
