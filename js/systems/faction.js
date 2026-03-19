/**
 * LATENCY - FactionSystem
 * Manages faction reputation, opposition dynamics, tier changes, perks, and penalties.
 *
 * Dependencies:
 *   - window.Latency.FactionsData     (faction definitions)
 *   - window.Latency.CharacterSystem  (character state)
 *   - window.Latency.EventBus         (publish/subscribe messaging)
 *
 * Events emitted:
 *   faction:change   { factionId, oldValue, newValue, delta, tier, oldTier }
 *   faction:tier     { factionId, oldTier, newTier, label }
 */

window.Latency = window.Latency || {};

window.Latency.FactionSystem = (function () {
    'use strict';

    var EventBus = null;

    function bus() {
        if (!EventBus) { EventBus = window.Latency.EventBus; }
        return EventBus;
    }

    function factions() {
        return window.Latency.FactionsData;
    }

    function character() {
        return window.Latency.CharacterSystem.getCharacter();
    }

    // ------------------------------------------------------------------
    //  Opposition table
    //  Maps each faction to the rep modifier applied to rival factions
    //  when the primary faction gains reputation. Built from FactionsData.
    // ------------------------------------------------------------------

    function getOppositions() {
        var fd = factions();
        if (!fd) { return {}; }

        var result = {};
        for (var fid in fd) {
            if (!fd.hasOwnProperty(fid)) { continue; }
            if (fd[fid].rivals) {
                result[fid] = fd[fid].rivals;
            }
        }
        return result;
    }

    // ------------------------------------------------------------------
    //  Tier helpers
    // ------------------------------------------------------------------

    var TIER_THRESHOLDS = [
        { name: 'hostile',    min: -100, max: -51 },
        { name: 'unfriendly', min: -50,  max: -11 },
        { name: 'neutral',    min: -10,  max: 10  },
        { name: 'friendly',   min: 11,   max: 50  },
        { name: 'allied',     min: 51,   max: 100 }
    ];

    /**
     * Determine the tier name for a reputation value.
     * @param {number} repValue
     * @returns {string}
     */
    function tierFromValue(repValue) {
        for (var i = 0; i < TIER_THRESHOLDS.length; i++) {
            var t = TIER_THRESHOLDS[i];
            if (repValue >= t.min && repValue <= t.max) {
                return t.name;
            }
        }
        return 'neutral';
    }

    /**
     * Get the current reputation tier for a faction.
     * @param {string} factionId
     * @returns {string}  'hostile'|'unfriendly'|'neutral'|'friendly'|'allied'
     */
    function getTier(factionId) {
        var ch = character();
        if (!ch || ch.reputation[factionId] === undefined) { return 'neutral'; }
        return tierFromValue(ch.reputation[factionId]);
    }

    /**
     * Get the faction-specific tier label (e.g. 'Comrade', 'Favored').
     * @param {string} factionId
     * @returns {string}
     */
    function getTierLabel(factionId) {
        var fd = factions();
        if (!fd || !fd[factionId]) { return 'Unknown'; }

        var tier = getTier(factionId);
        var tierData = fd[factionId].tiers[tier];
        return tierData ? tierData.label : tier;
    }

    // ------------------------------------------------------------------
    //  Reputation modification
    // ------------------------------------------------------------------

    /**
     * Modify reputation with a faction.
     * Automatically applies opposition deltas to rival factions.
     * Checks for tier changes and emits events.
     *
     * @param {string} factionId  Key in character.reputation.
     * @param {number} delta      Signed change.
     */
    function modifyReputation(factionId, delta) {
        var ch = character();
        if (!ch || ch.reputation[factionId] === undefined) { return; }

        var CS = window.Latency.CharacterSystem;

        // --- Primary faction ---
        var oldValue = ch.reputation[factionId];
        var oldTier  = tierFromValue(oldValue);

        ch.reputation[factionId] = clamp(oldValue + delta, -100, 100);

        var newValue = ch.reputation[factionId];
        var newTier  = tierFromValue(newValue);

        bus().emit('faction:change', {
            factionId: factionId,
            oldValue: oldValue,
            newValue: newValue,
            delta: delta,
            tier: newTier,
            oldTier: oldTier
        });

        // Tier change event
        if (oldTier !== newTier) {
            bus().emit('faction:tier', {
                factionId: factionId,
                oldTier: oldTier,
                newTier: newTier,
                label: getTierLabel(factionId)
            });
        }

        // --- Opposition: ripple effects to rival factions ---
        var oppositions = getOppositions();
        var rivals = oppositions[factionId];
        if (!rivals) { return; }

        for (var rivalId in rivals) {
            if (!rivals.hasOwnProperty(rivalId)) { continue; }
            if (ch.reputation[rivalId] === undefined) { continue; }

            var modifier = rivals[rivalId];
            var rivalDelta = Math.round(delta * modifier);

            if (rivalDelta === 0) { continue; }

            var rivalOld = ch.reputation[rivalId];
            var rivalOldTier = tierFromValue(rivalOld);

            ch.reputation[rivalId] = clamp(rivalOld + rivalDelta, -100, 100);

            var rivalNew = ch.reputation[rivalId];
            var rivalNewTier = tierFromValue(rivalNew);

            bus().emit('faction:change', {
                factionId: rivalId,
                oldValue: rivalOld,
                newValue: rivalNew,
                delta: rivalDelta,
                tier: rivalNewTier,
                oldTier: rivalOldTier
            });

            if (rivalOldTier !== rivalNewTier) {
                bus().emit('faction:tier', {
                    factionId: rivalId,
                    oldTier: rivalOldTier,
                    newTier: rivalNewTier,
                    label: getTierLabel(rivalId)
                });
            }
        }
    }

    // ------------------------------------------------------------------
    //  Perks & penalties
    // ------------------------------------------------------------------

    /**
     * Get active perks for a faction based on current tier.
     * @param {string} factionId
     * @returns {string[]}
     */
    function getPerks(factionId) {
        var fd = factions();
        if (!fd || !fd[factionId]) { return []; }

        var tier = getTier(factionId);
        var tierData = fd[factionId].tiers[tier];
        return tierData && tierData.perks ? tierData.perks.slice() : [];
    }

    /**
     * Get active penalties for a faction based on current tier.
     * @param {string} factionId
     * @returns {string[]}
     */
    function getPenalties(factionId) {
        var fd = factions();
        if (!fd || !fd[factionId]) { return []; }

        var tier = getTier(factionId);
        var tierData = fd[factionId].tiers[tier];
        return tierData && tierData.penalties ? tierData.penalties.slice() : [];
    }

    /**
     * Check whether the character has a specific perk from any faction.
     * @param {string} perkId
     * @returns {boolean}
     */
    function hasPerk(perkId) {
        var fd = factions();
        if (!fd) { return false; }

        for (var fid in fd) {
            if (!fd.hasOwnProperty(fid)) { continue; }
            var perks = getPerks(fid);
            if (perks.indexOf(perkId) !== -1) { return true; }
        }
        return false;
    }

    /**
     * Check whether the character has a specific penalty from any faction.
     * @param {string} penaltyId
     * @returns {boolean}
     */
    function hasPenalty(penaltyId) {
        var fd = factions();
        if (!fd) { return false; }

        for (var fid in fd) {
            if (!fd.hasOwnProperty(fid)) { continue; }
            var penalties = getPenalties(fid);
            if (penalties.indexOf(penaltyId) !== -1) { return true; }
        }
        return false;
    }

    // ------------------------------------------------------------------
    //  Vendor access
    // ------------------------------------------------------------------

    /**
     * Check whether the character can access vendors for a faction.
     * @param {string} factionId
     * @returns {boolean}
     */
    function canAccessVendor(factionId) {
        var fd = factions();
        if (!fd || !fd[factionId]) { return false; }

        var tier = getTier(factionId);
        // Vendors require at least 'friendly' tier
        return tier === 'friendly' || tier === 'allied';
    }

    /**
     * Get available vendor inventory for a faction.
     * Filters vendors by the character's current tier.
     * @param {string} factionId
     * @returns {Object[]}  Array of vendor objects with name, role, inventory.
     */
    function getVendorInventory(factionId) {
        var fd = factions();
        if (!fd || !fd[factionId] || !fd[factionId].vendors) { return []; }

        var tier = getTier(factionId);
        var tierRank = TIER_THRESHOLDS.map(function (t) { return t.name; });
        var currentRank = tierRank.indexOf(tier);

        var available = [];
        for (var i = 0; i < fd[factionId].vendors.length; i++) {
            var vendor = fd[factionId].vendors[i];
            var requiredRank = tierRank.indexOf(vendor.requiredTier || 'friendly');
            if (currentRank >= requiredRank) {
                available.push(vendor);
            }
        }

        return available;
    }

    // ------------------------------------------------------------------
    //  Utility
    // ------------------------------------------------------------------

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Get a summary of all faction reputations with tiers and labels.
     * @returns {Object[]}
     */
    function getAllFactionStatus() {
        var ch = character();
        var fd = factions();
        if (!ch || !fd) { return []; }

        var result = [];
        for (var fid in fd) {
            if (!fd.hasOwnProperty(fid)) { continue; }
            if (ch.reputation[fid] === undefined) { continue; }

            result.push({
                id: fid,
                name: fd[fid].name,
                value: ch.reputation[fid],
                tier: getTier(fid),
                label: getTierLabel(fid),
                perks: getPerks(fid),
                penalties: getPenalties(fid),
                color: fd[fid].color || '#999'
            });
        }

        return result;
    }

    // ------------------------------------------------------------------
    //  Serialization
    // ------------------------------------------------------------------

    /**
     * Serialize faction state (reputation is on the character object,
     * so this mainly exists for API symmetry).
     * @returns {Object}
     */
    function serialize() {
        var ch = character();
        if (!ch) { return {}; }
        return JSON.parse(JSON.stringify(ch.reputation || {}));
    }

    /**
     * Restore faction reputation from save data.
     * @param {Object} savedRep  e.g. { ironCollective: 15, neonCourt: -20, ... }
     */
    function deserialize(savedRep) {
        var ch = character();
        if (!ch || !savedRep) { return; }

        for (var fid in savedRep) {
            if (savedRep.hasOwnProperty(fid)) {
                ch.reputation[fid] = clamp(savedRep[fid], -100, 100);
            }
        }
    }

    // ------------------------------------------------------------------
    //  Public API
    // ------------------------------------------------------------------

    return {
        modifyReputation:   modifyReputation,
        getTier:            getTier,
        getTierLabel:       getTierLabel,
        getPerks:           getPerks,
        getPenalties:       getPenalties,
        hasPerk:            hasPerk,
        hasPenalty:         hasPenalty,
        canAccessVendor:    canAccessVendor,
        getVendorInventory: getVendorInventory,
        getAllFactionStatus: getAllFactionStatus,
        serialize:          serialize,
        deserialize:        deserialize
    };
})();
