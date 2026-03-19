/**
 * LATENCY - Dice Engine
 * ============================================================
 * Complete dice rolling system for stat checks, combat, and
 * skill resolution. Supports standard NdX+M notation, opposed
 * checks, critical hits, and damage calculations.
 *
 * Depends on: (none — standalone utility)
 *
 * Usage:
 *   Latency.Dice.roll(20);                    // 1..20
 *   Latency.Dice.rollMultiple(3, 6, 2);       // 3d6+2
 *   Latency.Dice.statCheck(16, 15);           // d20+3 vs DC 15
 *   Latency.Dice.damageRoll('2d6+3', 2);      // 2d6+3 + STR mod
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.Dice = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Core roll
    // -------------------------------------------------------------------

    /**
     * Roll a single die with the given number of sides.
     * @param {number} sides - Number of sides (e.g. 6, 20).
     * @returns {number} Result between 1 and sides (inclusive).
     */
    function roll(sides) {
        if (typeof sides !== 'number' || sides < 1) {
            console.warn('[Dice] roll(): invalid sides value:', sides);
            return 1;
        }
        return Math.floor(Math.random() * sides) + 1;
    }

    // -------------------------------------------------------------------
    // Multiple dice
    // -------------------------------------------------------------------

    /**
     * Roll multiple dice of the same type with an optional flat modifier.
     *
     * @param {number} count    - How many dice to roll (e.g. 3 for 3d6).
     * @param {number} sides    - Sides per die (e.g. 6).
     * @param {number} [modifier=0] - Flat modifier added to the total.
     * @returns {{rolls: number[], total: number, modifier: number}}
     */
    function rollMultiple(count, sides, modifier) {
        count = Math.max(1, Math.floor(count) || 1);
        sides = Math.max(1, Math.floor(sides) || 6);
        modifier = Math.floor(modifier) || 0;

        var rolls = [];
        var sum = 0;

        for (var i = 0; i < count; i++) {
            var r = roll(sides);
            rolls.push(r);
            sum += r;
        }

        return {
            rolls: rolls,
            total: sum + modifier,
            modifier: modifier
        };
    }

    // -------------------------------------------------------------------
    // Stat check (d20 system)
    // -------------------------------------------------------------------

    /**
     * Perform a d20-based stat check.
     *
     * Modifier is calculated as: floor((statValue - 10) / 2)
     * This follows the classic d20 ability modifier formula.
     *
     * @param {number} statValue - The raw stat value (e.g. 16 for STR 16).
     * @param {number} dc        - Difficulty class to beat.
     * @returns {{roll: number, modifier: number, total: number, dc: number,
     *            success: boolean, critSuccess: boolean, critFail: boolean}}
     */
    function statCheck(statValue, dc) {
        var d20 = roll(20);
        var mod = Math.floor((statValue - 10) / 2);
        var total = d20 + mod;
        var critSuccess = (d20 === 20);
        var critFail = (d20 === 1);

        // Natural 20 always succeeds, natural 1 always fails,
        // regardless of modifiers.
        var success;
        if (critSuccess) {
            success = true;
        } else if (critFail) {
            success = false;
        } else {
            success = total >= dc;
        }

        return {
            roll: d20,
            modifier: mod,
            total: total,
            dc: dc,
            success: success,
            critSuccess: critSuccess,
            critFail: critFail
        };
    }

    // -------------------------------------------------------------------
    // Opposed check
    // -------------------------------------------------------------------

    /**
     * Both sides roll d20 + ability modifier; higher total wins.
     * Ties go to the defender (standard convention).
     *
     * @param {number} attackerStat  - Attacker's raw stat value.
     * @param {number} defenderStat  - Defender's raw stat value.
     * @returns {{attacker: {roll: number, modifier: number, total: number},
     *            defender: {roll: number, modifier: number, total: number},
     *            attackerWins: boolean}}
     */
    function opposedCheck(attackerStat, defenderStat) {
        var atkRoll = roll(20);
        var atkMod = Math.floor((attackerStat - 10) / 2);
        var atkTotal = atkRoll + atkMod;

        var defRoll = roll(20);
        var defMod = Math.floor((defenderStat - 10) / 2);
        var defTotal = defRoll + defMod;

        return {
            attacker: {
                roll: atkRoll,
                modifier: atkMod,
                total: atkTotal
            },
            defender: {
                roll: defRoll,
                modifier: defMod,
                total: defTotal
            },
            attackerWins: atkTotal > defTotal   // ties go to defender
        };
    }

    // -------------------------------------------------------------------
    // Dice string parser
    // -------------------------------------------------------------------

    /**
     * Parse a dice notation string into its components.
     *
     * Accepted formats:
     *   "2d6"     -> { count: 2, sides: 6, modifier: 0 }
     *   "2d6+3"   -> { count: 2, sides: 6, modifier: 3 }
     *   "1d20-2"  -> { count: 1, sides: 20, modifier: -2 }
     *   "d8"      -> { count: 1, sides: 8, modifier: 0 }
     *   "d12+1"   -> { count: 1, sides: 12, modifier: 1 }
     *
     * @param {string} str - Dice notation string.
     * @returns {{count: number, sides: number, modifier: number}|null}
     *     Returns null if the string cannot be parsed.
     */
    function parseDiceString(str) {
        if (typeof str !== 'string') {
            return null;
        }

        // Normalize: lowercase, strip whitespace
        var cleaned = str.toLowerCase().replace(/\s/g, '');

        // Match patterns like "2d6+3", "d8", "1d20-5"
        var match = cleaned.match(/^(\d*)d(\d+)([+-]\d+)?$/);

        if (!match) {
            return null;
        }

        var count = match[1] ? parseInt(match[1], 10) : 1;
        var sides = parseInt(match[2], 10);
        var modifier = match[3] ? parseInt(match[3], 10) : 0;

        if (count < 1 || sides < 1) {
            return null;
        }

        return {
            count: count,
            sides: sides,
            modifier: modifier
        };
    }

    // -------------------------------------------------------------------
    // Damage roll
    // -------------------------------------------------------------------

    /**
     * Roll damage using dice notation and an optional stat modifier.
     *
     * @param {string} diceString    - Dice notation (e.g. "2d6+3").
     * @param {number} [statModifier=0] - Additional modifier from stats
     *     (e.g. STR bonus on melee damage).
     * @returns {{rolls: number[], diceTotal: number, modifier: number,
     *            total: number}|null}
     *     Returns null if the dice string is invalid.
     */
    function damageRoll(diceString, statModifier) {
        var parsed = parseDiceString(diceString);

        if (!parsed) {
            console.warn('[Dice] damageRoll(): invalid dice string "' + diceString + '"');
            return null;
        }

        statModifier = Math.floor(statModifier) || 0;

        var result = rollMultiple(parsed.count, parsed.sides, 0);
        var diceTotal = result.total;                        // sum of dice only
        var totalModifier = parsed.modifier + statModifier;  // all modifiers combined
        var total = diceTotal + totalModifier;

        // Damage cannot go below 0 (or 1, depending on game rules — we use 0 floor)
        if (total < 0) {
            total = 0;
        }

        return {
            rolls: result.rolls,
            diceTotal: diceTotal,
            modifier: totalModifier,
            total: total
        };
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    return {
        roll: roll,
        rollMultiple: rollMultiple,
        statCheck: statCheck,
        opposedCheck: opposedCheck,
        damageRoll: damageRoll,
        parseDiceString: parseDiceString
    };
})();
