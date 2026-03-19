/**
 * LATENCY - NPC System
 * ============================================================
 * Manages NPC relationships, dialogue state, and interaction
 * logic. Relationship values range from -100 (hostile) to
 * +100 (devoted).
 *
 * Dependencies:
 *   - window.Latency.NpcsData   (NPC definitions)
 *   - window.Latency.EventBus   (publish/subscribe)
 *
 * Events emitted:
 *   npc:relationship   { npcId, oldValue, newValue, delta, tier }
 *   npc:tier_change    { npcId, oldTier, newTier, value }
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.NpcSystem = (function () {
    'use strict';

    var EventBus = null;

    function bus() {
        if (!EventBus) {
            EventBus = window.Latency.EventBus;
        }
        return EventBus;
    }

    // ---------------------------------------------------------------
    //  Internal state
    // ---------------------------------------------------------------

    /** @type {Object<string, number>} npcId -> relationship value (-100 to 100) */
    var _relationships = {};

    /** @type {Object<string, Object>} npcId -> dialogue state flags */
    var _dialogueState = {};

    // ---------------------------------------------------------------
    //  Relationship tiers
    // ---------------------------------------------------------------

    var TIERS = [
        { name: 'hostile',    min: -100, max: -51 },
        { name: 'unfriendly', min: -50,  max: -11 },
        { name: 'neutral',    min: -10,  max: 10  },
        { name: 'friendly',   min: 11,   max: 50  },
        { name: 'romantic',   min: 51,   max: 100 }
    ];

    // ---------------------------------------------------------------
    //  Helpers
    // ---------------------------------------------------------------

    function _clamp(value, min, max) {
        if (value < min) { return min; }
        if (value > max) { return max; }
        return value;
    }

    function _getTierForValue(value) {
        for (var i = 0; i < TIERS.length; i++) {
            if (value >= TIERS[i].min && value <= TIERS[i].max) {
                return TIERS[i].name;
            }
        }
        return 'neutral';
    }

    // ---------------------------------------------------------------
    //  Public API
    // ---------------------------------------------------------------

    /**
     * Modify the relationship value with an NPC.
     * @param {string} npcId  NPC identifier.
     * @param {number} delta  Signed change (-100 to +100 range).
     */
    function modifyRelationship(npcId, delta) {
        if (!npcId || typeof delta !== 'number') { return; }

        var oldValue = _relationships[npcId] || 0;
        var oldTier = _getTierForValue(oldValue);

        _relationships[npcId] = _clamp(oldValue + delta, -100, 100);

        var newValue = _relationships[npcId];
        var newTier = _getTierForValue(newValue);

        bus().emit('npc:relationship', {
            npcId: npcId,
            oldValue: oldValue,
            newValue: newValue,
            delta: delta,
            tier: newTier
        });

        if (oldTier !== newTier) {
            bus().emit('npc:tier_change', {
                npcId: npcId,
                oldTier: oldTier,
                newTier: newTier,
                value: newValue
            });
        }
    }

    /**
     * Get the current relationship value with an NPC.
     * @param {string} npcId
     * @returns {number} Relationship value (-100 to 100), default 0.
     */
    function getRelationship(npcId) {
        if (_relationships[npcId] === undefined) { return 0; }
        return _relationships[npcId];
    }

    /**
     * Set the relationship value directly (bypasses delta logic).
     * @param {string} npcId
     * @param {number} value
     */
    function setRelationship(npcId, value) {
        if (!npcId) { return; }
        _relationships[npcId] = _clamp(value, -100, 100);
    }

    /**
     * Get the relationship tier name for an NPC.
     * @param {string} npcId
     * @returns {string} One of: hostile, unfriendly, neutral, friendly, romantic.
     */
    function getRelationshipTier(npcId) {
        var value = getRelationship(npcId);
        return _getTierForValue(value);
    }

    /**
     * Get the NPC data object from NpcsData.
     * @param {string} npcId
     * @returns {Object|null}
     */
    function getNpc(npcId) {
        if (window.Latency.NpcsData && window.Latency.NpcsData[npcId]) {
            return window.Latency.NpcsData[npcId];
        }
        return null;
    }

    /**
     * Get all NPCs at a given location.
     * @param {string} locationId
     * @returns {Array<Object>}
     */
    function getNpcsAtLocation(locationId) {
        var npcs = window.Latency.NpcsData;
        if (!npcs) { return []; }

        var result = [];
        var keys = Object.keys(npcs);
        for (var i = 0; i < keys.length; i++) {
            if (npcs[keys[i]].location === locationId) {
                result.push(npcs[keys[i]]);
            }
        }
        return result;
    }

    /**
     * Get all NPCs belonging to a given faction.
     * @param {string} factionId
     * @returns {Array<Object>}
     */
    function getNpcsByFaction(factionId) {
        var npcs = window.Latency.NpcsData;
        if (!npcs) { return []; }

        var result = [];
        var keys = Object.keys(npcs);
        for (var i = 0; i < keys.length; i++) {
            if (npcs[keys[i]].faction === factionId) {
                result.push(npcs[keys[i]]);
            }
        }
        return result;
    }

    /**
     * Get the appropriate dialogue line for an NPC based on
     * current relationship tier.
     * @param {string} npcId
     * @returns {string} The dialogue line.
     */
    function getDialogue(npcId) {
        var npc = getNpc(npcId);
        if (!npc || !npc.dialogue) { return '...'; }

        var tier = getRelationshipTier(npcId);
        if (npc.dialogue[tier]) {
            return npc.dialogue[tier];
        }
        // Fallback chain
        if (tier === 'romantic' && npc.dialogue.friendly) {
            return npc.dialogue.friendly;
        }
        if (npc.dialogue.greeting) {
            return npc.dialogue.greeting;
        }
        return '...';
    }

    /**
     * Set a dialogue state flag for an NPC.
     * @param {string} npcId
     * @param {string} flag
     * @param {*} value
     */
    function setDialogueFlag(npcId, flag, value) {
        if (!_dialogueState[npcId]) {
            _dialogueState[npcId] = {};
        }
        _dialogueState[npcId][flag] = value;
    }

    /**
     * Get a dialogue state flag for an NPC.
     * @param {string} npcId
     * @param {string} flag
     * @returns {*}
     */
    function getDialogueFlag(npcId, flag) {
        if (!_dialogueState[npcId]) { return undefined; }
        return _dialogueState[npcId][flag];
    }

    /**
     * Serialize all NPC relationship and dialogue state for saving.
     * @returns {Object}
     */
    function serialize() {
        return {
            relationships: JSON.parse(JSON.stringify(_relationships)),
            dialogueState: JSON.parse(JSON.stringify(_dialogueState))
        };
    }

    /**
     * Restore NPC state from save data.
     * @param {Object} data
     */
    function deserialize(data) {
        if (!data) { return; }
        _relationships = data.relationships || {};
        _dialogueState = data.dialogueState || {};
    }

    /**
     * Reset all NPC state (for new game).
     */
    function reset() {
        _relationships = {};
        _dialogueState = {};
    }

    return {
        modifyRelationship:  modifyRelationship,
        getRelationship:     getRelationship,
        setRelationship:     setRelationship,
        getRelationshipTier: getRelationshipTier,
        getNpc:              getNpc,
        getNpcsAtLocation:   getNpcsAtLocation,
        getNpcsByFaction:    getNpcsByFaction,
        getDialogue:         getDialogue,
        setDialogueFlag:     setDialogueFlag,
        getDialogueFlag:     getDialogueFlag,
        serialize:           serialize,
        deserialize:         deserialize,
        reset:               reset
    };
})();
