/**
 * LATENCY - BuffSystem
 * Manages buff/debuff application, removal, tick processing, and stat modification.
 *
 * Dependencies:
 *   - window.Latency.BuffsData       (buff definitions)
 *   - window.Latency.CharacterSystem (character state)
 *   - window.Latency.EventBus        (publish/subscribe messaging)
 *
 * Events emitted:
 *   buff:applied   { buffId, buff, source }
 *   buff:removed   { buffId, buff, reason }  reason: 'expired'|'cured'|'manual'
 *   buff:tick      { buffId, effects }
 */

window.Latency = window.Latency || {};

window.Latency.BuffSystem = (function () {
    'use strict';

    var EventBus = null;

    function bus() {
        if (!EventBus) { EventBus = window.Latency.EventBus; }
        return EventBus;
    }

    function data() {
        return window.Latency.BuffsData;
    }

    function character() {
        return window.Latency.CharacterSystem.getCharacter();
    }

    // ------------------------------------------------------------------
    //  Internal state
    // ------------------------------------------------------------------

    /**
     * Active buff entries: { buffId, remainingDuration, appliedAt, source }
     * Stored on the character object for save compatibility.
     */
    function ensureStorage() {
        var ch = character();
        if (!ch) { return; }
        if (!Array.isArray(ch._activeBuffs)) {
            ch._activeBuffs = [];
        }
    }

    function getActiveList() {
        ensureStorage();
        var ch = character();
        return ch ? ch._activeBuffs : [];
    }

    // ------------------------------------------------------------------
    //  Stat modification helpers
    // ------------------------------------------------------------------

    /**
     * Apply or reverse buff stat effects on the character.
     * @param {Object} buffDef    Buff definition from BuffsData.
     * @param {number} direction  +1 to apply, -1 to reverse.
     */
    function applyStatChanges(buffDef, direction) {
        if (!buffDef || !buffDef.effects) { return; }
        var CS = window.Latency.CharacterSystem;
        var ch = character();
        if (!ch) { return; }

        for (var i = 0; i < buffDef.effects.length; i++) {
            var eff = buffDef.effects[i];
            var stat = eff.stat;
            var val  = eff.value * direction;

            // Direct stat modifications
            if (ch.stats && ch.stats[stat] !== undefined) {
                CS.modifyStat(stat, val);
            }

            // Derived stat modifications
            switch (stat) {
                case 'armor':
                    ch.derived.armor += val;
                    break;
                case 'initiative':
                    ch.derived.initiative += val;
                    break;
                case 'hp_bonus':
                    ch.derived.maxHp += val;
                    if (direction > 0) { ch.derived.currentHp += val; }
                    else { ch.derived.currentHp = Math.min(ch.derived.currentHp, ch.derived.maxHp); }
                    break;
                case 'stamina_bonus':
                    ch.derived.maxStamina += val;
                    if (direction > 0) { ch.derived.currentStamina += val; }
                    else { ch.derived.currentStamina = Math.min(ch.derived.currentStamina, ch.derived.maxStamina); }
                    break;
                // Non-stat effects (hp_drain, damage_bonus, crit_chance, etc.)
                // are read on-the-fly via getBuffEffects() during combat/checks.
            }
        }
    }

    // ------------------------------------------------------------------
    //  Core API
    // ------------------------------------------------------------------

    /**
     * Apply a buff to the character.
     * @param {string} buffId   Key in BuffsData.
     * @param {string} [source] What applied the buff (e.g. 'consumable', 'ability').
     * @returns {boolean}       true if applied, false if blocked.
     */
    function applyBuff(buffId, source) {
        ensureStorage();
        var ch = character();
        if (!ch) { return false; }

        var buffDef = data()[buffId];
        if (!buffDef) { return false; }

        var list = getActiveList();

        // Check if already active and not stackable
        if (!buffDef.stackable) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].buffId === buffId) {
                    // Refresh duration instead of stacking
                    list[i].remainingDuration = buffDef.duration;
                    return true;
                }
            }
        }

        // Add the buff entry
        var entry = {
            buffId: buffId,
            remainingDuration: buffDef.duration,
            appliedAt: Date.now(),
            source: source || buffDef.source || 'unknown'
        };
        list.push(entry);

        // Apply stat changes
        applyStatChanges(buffDef, +1);

        bus().emit('buff:applied', {
            buffId: buffId,
            buff: buffDef,
            source: entry.source
        });

        return true;
    }

    /**
     * Remove a buff (first matching entry) from the character.
     * @param {string} buffId
     * @param {string} [reason]  'expired', 'cured', 'manual'
     * @returns {boolean}
     */
    function removeBuff(buffId, reason) {
        ensureStorage();
        var list = getActiveList();

        for (var i = 0; i < list.length; i++) {
            if (list[i].buffId === buffId) {
                var buffDef = data()[buffId];

                // Reverse stat changes
                if (buffDef) {
                    applyStatChanges(buffDef, -1);
                }

                list.splice(i, 1);

                bus().emit('buff:removed', {
                    buffId: buffId,
                    buff: buffDef || null,
                    reason: reason || 'manual'
                });

                return true;
            }
        }

        return false;
    }

    /**
     * Process one tick (turn) for all active buffs.
     * Decrements durations, removes expired buffs, applies per-tick effects.
     */
    function tickBuffs() {
        ensureStorage();
        var ch = character();
        if (!ch) { return; }

        var CS = window.Latency.CharacterSystem;
        var list = getActiveList();
        var toRemove = [];

        for (var i = 0; i < list.length; i++) {
            var entry = list[i];
            var buffDef = data()[entry.buffId];

            // Apply per-tick effects
            if (buffDef && buffDef.effects) {
                var tickEffects = [];

                for (var j = 0; j < buffDef.effects.length; j++) {
                    var eff = buffDef.effects[j];

                    // HP drain (damage per tick)
                    if (eff.stat === 'hp_drain' && typeof eff.value === 'number') {
                        CS.takeDamage(eff.value);
                        tickEffects.push({ type: 'hp_drain', value: eff.value });
                    }

                    // HP regen (heal per tick)
                    if (eff.stat === 'hp_regen' && typeof eff.value === 'number') {
                        CS.heal(eff.value);
                        tickEffects.push({ type: 'hp_regen', value: eff.value });
                    }

                    // Stamina drain
                    if (eff.stat === 'stamina_drain' && typeof eff.value === 'number') {
                        CS.useStamina(eff.value);
                        tickEffects.push({ type: 'stamina_drain', value: eff.value });
                    }

                    // Stamina regen
                    if (eff.stat === 'stamina_regen' && typeof eff.value === 'number') {
                        CS.restoreStamina(eff.value);
                        tickEffects.push({ type: 'stamina_regen', value: eff.value });
                    }
                }

                if (tickEffects.length > 0) {
                    bus().emit('buff:tick', {
                        buffId: entry.buffId,
                        effects: tickEffects
                    });
                }
            }

            // Decrement duration (skip permanent buffs with -1 duration)
            if (entry.remainingDuration > 0) {
                entry.remainingDuration--;
                if (entry.remainingDuration <= 0) {
                    toRemove.push(entry.buffId);
                }
            }
        }

        // Remove expired buffs (iterate backwards to avoid index issues)
        for (var k = 0; k < toRemove.length; k++) {
            removeBuff(toRemove[k], 'expired');
        }
    }

    // ------------------------------------------------------------------
    //  Queries
    // ------------------------------------------------------------------

    /**
     * Get all currently active buff entries.
     * @returns {Object[]}  Array of { buffId, remainingDuration, appliedAt, source }.
     */
    function getActiveBuffs() {
        return getActiveList().slice();
    }

    /**
     * Check whether a specific buff is currently active.
     * @param {string} buffId
     * @returns {boolean}
     */
    function hasBuff(buffId) {
        var list = getActiveList();
        for (var i = 0; i < list.length; i++) {
            if (list[i].buffId === buffId) { return true; }
        }
        return false;
    }

    /**
     * Get the sum of a specific effect stat across all active buffs.
     * Useful for combat calculations (e.g. total damage_bonus from buffs).
     * @param {string} effectStat  The stat key (e.g. 'damage_bonus', 'crit_chance').
     * @returns {number}
     */
    function getBuffEffects(effectStat) {
        var list = getActiveList();
        var total = 0;

        for (var i = 0; i < list.length; i++) {
            var buffDef = data()[list[i].buffId];
            if (!buffDef || !buffDef.effects) { continue; }

            for (var j = 0; j < buffDef.effects.length; j++) {
                var eff = buffDef.effects[j];
                if (eff.stat === effectStat && typeof eff.value === 'number') {
                    total += eff.value;
                }
            }
        }

        return total;
    }

    /**
     * Remove all active buffs (e.g. on rest, death, or cure-all).
     */
    function clearAll() {
        ensureStorage();
        var list = getActiveList();

        // Reverse all stat changes
        while (list.length > 0) {
            removeBuff(list[0].buffId, 'cured');
        }
    }

    /**
     * Remove all curable buffs (leave permanent/incurable ones).
     */
    function cureAll() {
        ensureStorage();
        var list = getActiveList();
        var toRemove = [];

        for (var i = 0; i < list.length; i++) {
            var buffDef = data()[list[i].buffId];
            if (buffDef && buffDef.curable) {
                toRemove.push(list[i].buffId);
            }
        }

        for (var j = 0; j < toRemove.length; j++) {
            removeBuff(toRemove[j], 'cured');
        }
    }

    // ------------------------------------------------------------------
    //  Serialization
    // ------------------------------------------------------------------

    /**
     * Serialize active buffs for save data.
     * @returns {Object[]}
     */
    function serialize() {
        return getActiveList().slice();
    }

    /**
     * Restore active buffs from save data.
     * Re-applies stat modifications.
     * @param {Object[]} savedBuffs
     */
    function deserialize(savedBuffs) {
        ensureStorage();
        var ch = character();
        if (!ch) { return; }

        // Clear existing without reversing (fresh load)
        ch._activeBuffs = [];

        if (!Array.isArray(savedBuffs)) { return; }

        for (var i = 0; i < savedBuffs.length; i++) {
            var entry = savedBuffs[i];
            var buffDef = data()[entry.buffId];
            if (!buffDef) { continue; }

            ch._activeBuffs.push({
                buffId: entry.buffId,
                remainingDuration: entry.remainingDuration,
                appliedAt: entry.appliedAt || Date.now(),
                source: entry.source || 'unknown'
            });

            // Re-apply stat changes
            applyStatChanges(buffDef, +1);
        }
    }

    // ------------------------------------------------------------------
    //  Public API
    // ------------------------------------------------------------------

    return {
        applyBuff:      applyBuff,
        removeBuff:     removeBuff,
        tickBuffs:      tickBuffs,
        getActiveBuffs: getActiveBuffs,
        hasBuff:        hasBuff,
        getBuffEffects: getBuffEffects,
        clearAll:       clearAll,
        cureAll:        cureAll,
        serialize:      serialize,
        deserialize:    deserialize
    };
})();
