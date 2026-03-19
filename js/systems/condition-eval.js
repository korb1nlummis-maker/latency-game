/**
 * LATENCY - ConditionEval
 * ============================================================
 * Evaluates condition objects attached to story choices and
 * conditional text blocks. A condition is an object (or array
 * of objects) describing requirements the player character must
 * meet for the associated content to be available.
 *
 * Supported condition types:
 *   race        — character.race matches value (string or array of strings)
 *   flag        — character.flags includes value
 *   notFlag     — character.flags does NOT include value
 *   statMin     — character.stats[stat] >= value
 *   factionMin  — character.factions[faction] >= value
 *   hasItem     — character.inventory includes item
 *   backstory   — character.backstory === value
 *   job         — character.job === value
 *   trait       — character.traits includes value
 *   or          — at least ONE sub-condition passes (array)
 *
 * Depends on: (none — standalone utility)
 *
 * Usage:
 *   var visible = Latency.ConditionEval.evaluate(choice.conditions, character);
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.ConditionEval = (function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Single-condition evaluators
    // -----------------------------------------------------------------------

    /**
     * Evaluate one atomic condition against a character.
     * @param {Object} cond - A single condition descriptor.
     * @param {Object} character - The player character data object.
     * @returns {boolean}
     */
    function _evaluateOne(cond, character) {
        if (!cond || typeof cond !== 'object') {
            return true; // no condition = always pass
        }

        // ── race ──────────────────────────────────────────────────────────
        if (cond.race !== undefined) {
            if (!character.race) return false;
            if (Array.isArray(cond.race)) {
                if (cond.race.indexOf(character.race) < 0) return false;
            } else {
                if (character.race !== cond.race) return false;
            }
        }

        // ── flag (character has this flag set) ────────────────────────────
        if (cond.flag !== undefined) {
            var flags = character.flags || [];
            if (flags.indexOf(cond.flag) === -1) {
                return false;
            }
        }

        // ── notFlag / not_flag (character does NOT have this flag) ─────
        if (cond.notFlag !== undefined || cond.not_flag !== undefined) {
            var nf = cond.notFlag || cond.not_flag;
            var flagsNot = character.flags || [];
            if (flagsNot.indexOf(nf) >= 0) {
                return false;
            }
        }

        // ── statMin { stat: "strength", value: 14 } ─────────────────────
        if (cond.statMin !== undefined) {
            var statObj = cond.statMin;
            var stats = character.stats || {};
            var statVal = Number(stats[statObj.stat]) || 0;
            if (statVal < Number(statObj.value)) {
                return false;
            }
        }

        // ── factionMin { faction: "syndicate", value: 3 } ────────────────
        if (cond.factionMin !== undefined) {
            var factionObj = cond.factionMin;
            var factions = character.factions || {};
            var factionVal = Number(factions[factionObj.faction]) || 0;
            if (factionVal < Number(factionObj.value)) {
                return false;
            }
        }

        // ── hasItem ──────────────────────────────────────────────────────
        if (cond.hasItem !== undefined) {
            var inventory = character.inventory || [];
            var found = false;
            for (var i = 0; i < inventory.length; i++) {
                var item = inventory[i];
                // Support both simple string IDs and objects with an .id field
                if (item === cond.hasItem || (item && item.id === cond.hasItem)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return false;
            }
        }

        // ── backstory ────────────────────────────────────────────────────
        if (cond.backstory !== undefined) {
            if (!character.backstory || character.backstory !== cond.backstory) {
                return false;
            }
        }

        // ── job ──────────────────────────────────────────────────────────
        if (cond.job !== undefined) {
            if (!character.job || character.job !== cond.job) {
                return false;
            }
        }

        // ── trait ─────────────────────────────────────────────────────────
        if (cond.trait !== undefined) {
            var traits = character.traits || [];
            if (traits.indexOf(cond.trait) === -1) {
                return false;
            }
        }

        // ── or (any sub-condition passes) ─────────────────────────────────
        if (cond.or !== undefined) {
            if (!Array.isArray(cond.or) || cond.or.length === 0) {
                return false;
            }
            var anyPassed = false;
            for (var o = 0; o < cond.or.length; o++) {
                if (_evaluateOne(cond.or[o], character)) {
                    anyPassed = true;
                    break;
                }
            }
            if (!anyPassed) {
                return false;
            }
        }

        return true;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Evaluate a set of conditions against a character.
     *
     * Accepts:
     *   - null / undefined / empty array → always true
     *   - A single condition object       → evaluate that one condition
     *   - An array of condition objects    → ALL must pass (logical AND)
     *
     * Within a single condition object, every key present must pass (AND).
     * Use the 'or' key for OR logic among sub-conditions.
     *
     * @param {Object|Object[]|null|undefined} conditions
     * @param {Object} character - Player character data.
     * @returns {boolean} True if every condition is satisfied.
     */
    function evaluate(conditions, character) {
        // No conditions = always visible
        if (conditions === null || conditions === undefined) {
            return true;
        }

        // Ensure we have a character object to test against
        if (!character || typeof character !== 'object') {
            console.warn('[ConditionEval] No valid character object provided.');
            return false;
        }

        // Single condition object — wrap in array for uniform handling
        if (!Array.isArray(conditions)) {
            conditions = [conditions];
        }

        // Empty array = no conditions = pass
        if (conditions.length === 0) {
            return true;
        }

        // ALL conditions must pass (AND)
        for (var i = 0; i < conditions.length; i++) {
            if (!_evaluateOne(conditions[i], character)) {
                return false;
            }
        }

        return true;
    }

    return {
        evaluate: evaluate
    };
})();
