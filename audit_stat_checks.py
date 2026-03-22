#!/usr/bin/env python3
"""
Comprehensive stat check audit for LATENCY story JSON files.
Checks every stat check choice for quality and correctness.
"""

import json
import os
import glob
from collections import defaultdict

STORY_DIR = "D:/Latency/story"
OUTPUT_FILE = "D:/Latency/stat_check_audit.txt"

# Collect ALL nodes across ALL files for cross-file reference checking
all_nodes = {}  # full_id -> node data
all_nodes_by_file = {}  # filepath -> {node_key: node_data}
file_prefix_map = {}  # filepath -> prefix used in node IDs


def get_text_preview(node, max_chars=50):
    """Extract first max_chars of a node's text content."""
    if not node:
        return ""
    text = node.get("text", [])
    if not text:
        return ""
    for item in text:
        if isinstance(item, str):
            return item[:max_chars]
        elif isinstance(item, dict) and "text" in item:
            return item["text"][:max_chars]
    return ""


def node_has_choices(node):
    """Check if a node has outgoing choices (not a dead end)."""
    if not node:
        return False
    if node.get("isEnding"):
        return True  # endings are valid terminal nodes
    choices = node.get("choices", [])
    return len(choices) > 0


def trace_reconnection(start_id, success_id, depth=10):
    """
    Check if a fail path eventually reconnects to the success path.
    Returns (reconnects: bool, path_length: int, ends_at: str)
    """
    visited = set()
    queue = [(start_id, 0)]

    while queue:
        current_id, d = queue.pop(0)
        if d > depth:
            continue
        if current_id in visited:
            continue
        visited.add(current_id)

        if current_id == success_id:
            return True, d, current_id

        node = all_nodes.get(current_id)
        if not node:
            return False, d, current_id  # broken reference

        if node.get("isEnding"):
            return False, d, current_id  # ends at an ending

        choices = node.get("choices", [])
        if not choices:
            return False, d, current_id  # dead end

        for choice in choices:
            next_id = choice.get("next")
            fail_id = choice.get("failNext")
            if next_id and next_id not in visited:
                queue.append((next_id, d + 1))
            if fail_id and fail_id not in visited:
                queue.append((fail_id, d + 1))

    return False, depth, "max_depth_reached"


def load_all_story_files():
    """Load all story JSON files and index every node."""
    json_files = glob.glob(os.path.join(STORY_DIR, "**", "*.json"), recursive=True)
    for fpath in sorted(json_files):
        fname = os.path.basename(fpath)
        if fname == "MANIFEST.json":
            continue
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"WARNING: Could not load {fpath}: {e}")
            continue

        nodes = data.get("nodes", {})
        all_nodes_by_file[fpath] = nodes

        for node_key, node_data in nodes.items():
            full_id = node_data.get("id", "")
            if full_id:
                all_nodes[full_id] = node_data
            # Also store by the node key pattern that might be used
            # Derive prefix from the file's meta or from first node's id
            if not full_id:
                # Some files may use node_key directly
                all_nodes[node_key] = node_data


def audit_stat_checks():
    """Main audit function."""
    load_all_story_files()

    total_stat_checks = 0
    good_checks = 0
    bad_checks = 0
    issues = []
    file_stats = {}

    for fpath, nodes in sorted(all_nodes_by_file.items()):
        rel_path = os.path.relpath(fpath, "D:/Latency")
        file_check_count = 0
        file_good = 0
        file_bad = 0

        for node_key, node_data in nodes.items():
            choices = node_data.get("choices", [])
            if not choices:
                continue

            for ci, choice in enumerate(choices):
                sc = choice.get("statCheck")
                if not sc:
                    continue

                file_check_count += 1
                total_stat_checks += 1

                choice_text = choice.get("text", "(no text)")
                node_id = node_data.get("id", node_key)
                stat = sc.get("stat", "?")
                dc = sc.get("dc", "?")
                next_id = choice.get("next", "")
                fail_id = choice.get("failNext", "")
                on_success = choice.get("onSuccess", [])
                on_failure = choice.get("onFailure", [])

                check_issues = []

                # CHECK 1: Does it have a failNext that's DIFFERENT from next?
                if not fail_id:
                    check_issues.append("NO failNext defined — fail and success go to same node")
                elif fail_id == next_id:
                    check_issues.append(f"failNext SAME as next ({fail_id}) — no branching on failure")

                # CHECK 2: Does failNext point to a node that EXISTS?
                if fail_id and fail_id != next_id:
                    if fail_id not in all_nodes:
                        check_issues.append(f"failNext '{fail_id}' does NOT EXIST in any story file")

                # CHECK 3: Do fail and success nodes have DIFFERENT text?
                if fail_id and fail_id != next_id and fail_id in all_nodes and next_id in all_nodes:
                    success_text = get_text_preview(all_nodes[next_id])
                    fail_text = get_text_preview(all_nodes[fail_id])
                    if success_text and fail_text and success_text == fail_text:
                        check_issues.append(
                            f"SAME TEXT on both paths: \"{success_text[:40]}...\""
                        )

                # CHECK 4: Does the choice have onFailure actions different from onSuccess?
                if fail_id and fail_id != next_id:
                    # Having different failNext is good, but also check for action differences
                    success_json = json.dumps(on_success, sort_keys=True) if on_success else "[]"
                    failure_json = json.dumps(on_failure, sort_keys=True) if on_failure else "[]"
                    if on_success and on_failure and success_json == failure_json:
                        check_issues.append("onFailure actions IDENTICAL to onSuccess — no mechanical difference")
                    # Note: not having onSuccess/onFailure is fine if failNext goes to a different node

                # CHECK 5: Does the fail path reconnect or is it a dead end?
                if fail_id and fail_id != next_id and fail_id in all_nodes:
                    fail_node = all_nodes[fail_id]
                    if not fail_node.get("isEnding") and not fail_node.get("choices"):
                        check_issues.append(f"Fail node '{fail_id}' is a DEAD END (no choices, not an ending)")
                    elif not fail_node.get("isEnding"):
                        # Check if fail path eventually reconnects
                        reconnects, path_len, ends_at = trace_reconnection(fail_id, next_id, depth=8)
                        # Not reconnecting isn't necessarily bad — it could lead to its own valid path
                        # Only flag if it leads to a dead end
                        if not reconnects and ends_at != "max_depth_reached":
                            end_node = all_nodes.get(ends_at)
                            if end_node and not end_node.get("isEnding") and not end_node.get("choices"):
                                check_issues.append(
                                    f"Fail path leads to DEAD END at '{ends_at}' (no choices, not an ending)"
                                )

                if check_issues:
                    bad_checks += 1
                    file_bad += 1
                    issues.append({
                        "file": rel_path,
                        "node_id": node_id,
                        "choice_text": choice_text,
                        "stat": stat,
                        "dc": dc,
                        "next": next_id,
                        "failNext": fail_id,
                        "issues": check_issues
                    })
                else:
                    good_checks += 1
                    file_good += 1

        if file_check_count > 0:
            file_stats[rel_path] = {
                "total": file_check_count,
                "good": file_good,
                "bad": file_bad
            }

    return total_stat_checks, good_checks, bad_checks, issues, file_stats


def write_report(total, good, bad, issues, file_stats):
    """Write the audit report."""
    lines = []
    lines.append("=" * 80)
    lines.append("LATENCY — STAT CHECK AUDIT REPORT")
    lines.append("=" * 80)
    lines.append("")
    lines.append(f"Total story files scanned: {len(all_nodes_by_file)}")
    lines.append(f"Total nodes indexed: {len(all_nodes)}")
    lines.append(f"Total stat checks found: {total}")
    lines.append(f"  GOOD checks: {good}")
    lines.append(f"  BAD checks:  {bad}")
    lines.append(f"  Pass rate:   {good/total*100:.1f}%" if total > 0 else "  Pass rate:   N/A")
    lines.append("")

    # Per-file breakdown
    lines.append("-" * 80)
    lines.append("STAT CHECKS PER FILE")
    lines.append("-" * 80)
    lines.append(f"{'File':<55} {'Total':>6} {'Good':>6} {'Bad':>6}")
    lines.append("-" * 80)
    for fpath in sorted(file_stats.keys()):
        s = file_stats[fpath]
        lines.append(f"{fpath:<55} {s['total']:>6} {s['good']:>6} {s['bad']:>6}")
    lines.append("-" * 80)
    lines.append(f"{'TOTALS':<55} {total:>6} {good:>6} {bad:>6}")
    lines.append("")

    # Detailed bad checks
    if issues:
        lines.append("=" * 80)
        lines.append(f"BAD STAT CHECKS — DETAILED LIST ({len(issues)} issues)")
        lines.append("=" * 80)
        for i, issue in enumerate(issues, 1):
            lines.append("")
            lines.append(f"--- Issue #{i} ---")
            lines.append(f"  File:       {issue['file']}")
            lines.append(f"  Node:       {issue['node_id']}")
            lines.append(f"  Choice:     {issue['choice_text']}")
            lines.append(f"  Stat:       {issue['stat']} DC {issue['dc']}")
            lines.append(f"  next:       {issue['next']}")
            lines.append(f"  failNext:   {issue['failNext'] or '(none)'}")
            for prob in issue['issues']:
                lines.append(f"  PROBLEM:    {prob}")
    else:
        lines.append("No bad stat checks found! All stat checks are properly implemented.")

    lines.append("")
    lines.append("=" * 80)
    lines.append("END OF REPORT")
    lines.append("=" * 80)

    report = "\n".join(lines)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(report)

    return report


if __name__ == "__main__":
    print("Auditing stat checks across all LATENCY story files...")
    total, good, bad, issues, file_stats = audit_stat_checks()
    report = write_report(total, good, bad, issues, file_stats)
    print(report)
