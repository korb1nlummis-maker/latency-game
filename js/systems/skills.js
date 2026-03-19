/**
 * LATENCY - SkillSystem
 * Manages skill learning, prerequisites, stat requirements, and effect aggregation.
 *
 * Dependencies:
 *   - window.Latency.SkillsData    (skill definitions)
 *   - window.Latency.CharacterSystem (character state)
 *   - window.Latency.EventBus      (publish/subscribe messaging)
 *
 * Events emitted:
 *   skill:learned   { skillId, skill, character }
 */

window.Latency = window.Latency || {};

window.Latency.SkillSystem = (function () {
    'use strict';

    var EventBus = null;

    function bus() {
        if (!EventBus) { EventBus = window.Latency.EventBus; }
        return EventBus;
    }

    function data() {
        return window.Latency.SkillsData;
    }

    function character() {
        return window.Latency.CharacterSystem.getCharacter();
    }

    // ------------------------------------------------------------------
    //  Internal helpers
    // ------------------------------------------------------------------

    /** Ensure the character object has the _learnedSkills array. */
    function ensureStorage() {
        var ch = character();
        if (!ch) { return; }
        if (!Array.isArray(ch._learnedSkills)) {
            ch._learnedSkills = [];
        }
    }

    // ------------------------------------------------------------------
    //  Queries
    // ------------------------------------------------------------------

    /**
     * Check whether a stat requirement object is met by the character.
     * @param {Object|null} req  e.g. { strength: 14, dexterity: 12 }
     * @returns {boolean}
     */
    function meetsStatReq(req) {
        if (!req) { return true; }
        var ch = character();
        if (!ch) { return false; }
        var stats = ch.stats;
        for (var stat in req) {
            if (req.hasOwnProperty(stat)) {
                if ((stats[stat] || 0) < req[stat]) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Check whether all prerequisite skills have been learned.
     * @param {string[]} prereqs  Array of skill IDs.
     * @returns {boolean}
     */
    function meetsPrereqs(prereqs) {
        if (!prereqs || prereqs.length === 0) { return true; }
        for (var i = 0; i < prereqs.length; i++) {
            if (!hasSkill(prereqs[i])) { return false; }
        }
        return true;
    }

    /**
     * Has the character learned a specific skill?
     * @param {string} skillId
     * @returns {boolean}
     */
    function hasSkill(skillId) {
        ensureStorage();
        var ch = character();
        if (!ch) { return false; }
        return ch._learnedSkills.indexOf(skillId) !== -1;
    }

    /**
     * Return skills that meet ALL requirements and are not already learned.
     * @param {Object} [ch]  Optional character override (unused externally).
     * @returns {Object[]}   Array of skill data objects.
     */
    function getAvailableSkills() {
        ensureStorage();
        var ch = character();
        if (!ch) { return []; }

        var all = data();
        var available = [];

        for (var id in all) {
            if (!all.hasOwnProperty(id)) { continue; }
            var skill = all[id];

            // Skip non-skill entries (helper methods)
            if (typeof skill !== 'object' || !skill.id) { continue; }

            // Already learned
            if (hasSkill(id)) { continue; }

            // Level check
            if (ch.level < (skill.levelRequired || 1)) { continue; }

            // Stat requirements
            if (!meetsStatReq(skill.statRequired)) { continue; }

            // Prerequisites
            if (!meetsPrereqs(skill.prerequisites)) { continue; }

            available.push(skill);
        }

        return available;
    }

    // ------------------------------------------------------------------
    //  Skill points
    // ------------------------------------------------------------------

    /** Total skill points earned (2 per level, starting at level 1 = 0 extra). */
    function getSkillPoints() {
        var ch = character();
        if (!ch) { return 0; }
        return Math.max(0, (ch.level - 1) * 2);
    }

    /** Points already spent on learned skills. */
    function getSpentPoints() {
        ensureStorage();
        var ch = character();
        if (!ch) { return 0; }

        var all = data();
        var spent = 0;
        for (var i = 0; i < ch._learnedSkills.length; i++) {
            var skill = all[ch._learnedSkills[i]];
            if (skill) { spent += (skill.cost || 1); }
        }
        return spent;
    }

    /** Remaining unspent points. */
    function getAvailablePoints() {
        return getSkillPoints() - getSpentPoints();
    }

    // ------------------------------------------------------------------
    //  Learning skills
    // ------------------------------------------------------------------

    /**
     * Attempt to learn a skill.
     * @param {string} skillId
     * @returns {boolean} true on success, false on failure.
     */
    function learnSkill(skillId) {
        ensureStorage();
        var ch = character();
        if (!ch) { return false; }

        var all = data();
        var skill = all[skillId];
        if (!skill) { return false; }

        // Already learned
        if (hasSkill(skillId)) { return false; }

        // Enough points?
        if (getAvailablePoints() < (skill.cost || 1)) { return false; }

        // Level
        if (ch.level < (skill.levelRequired || 1)) { return false; }

        // Stats
        if (!meetsStatReq(skill.statRequired)) { return false; }

        // Prerequisites
        if (!meetsPrereqs(skill.prerequisites)) { return false; }

        // --- Learn it ---
        ch._learnedSkills.push(skillId);

        // Apply effects
        applyEffects(skill.effects);

        bus().emit('skill:learned', {
            skillId: skillId,
            skill: skill,
            character: ch
        });

        return true;
    }

    /**
     * Apply an array of skill effects to the character.
     * @param {Object[]} effects
     */
    function applyEffects(effects) {
        if (!effects) { return; }
        var CS = window.Latency.CharacterSystem;
        var ch = character();

        for (var i = 0; i < effects.length; i++) {
            var eff = effects[i];

            switch (eff.type) {
                case 'stat_bonus':
                    if (eff.stat && typeof eff.value === 'number') {
                        CS.modifyStat(eff.stat, eff.value);
                    }
                    break;

                case 'hp_bonus':
                    if (typeof eff.value === 'number' && ch) {
                        ch.derived.maxHp += eff.value;
                        ch.derived.currentHp += eff.value;
                    }
                    break;

                case 'stamina_bonus':
                    if (typeof eff.value === 'number' && ch) {
                        ch.derived.maxStamina += eff.value;
                        ch.derived.currentStamina += eff.value;
                    }
                    break;

                case 'ability_grant':
                    if (eff.ability && ch) {
                        if (!ch.activeAbilities) { ch.activeAbilities = []; }
                        if (ch.activeAbilities.indexOf(eff.ability) === -1) {
                            ch.activeAbilities.push(eff.ability);
                        }
                    }
                    break;

                // Other effect types (damage_bonus, defense_bonus, crit_chance, etc.)
                // are aggregated on-the-fly via getSkillEffects() rather than
                // baked into the character. No action needed here.
            }
        }

        CS.recalculateDerived();
    }

    // ------------------------------------------------------------------
    //  Effect aggregation
    // ------------------------------------------------------------------

    /**
     * Sum all effects of a given type across all learned skills.
     * Optionally filter by subtype.
     * @param {string} effectType
     * @param {string} [subtype]  Optional subtype filter.
     * @returns {number}
     */
    function getSkillEffects(effectType, subtype) {
        ensureStorage();
        var ch = character();
        if (!ch) { return 0; }

        var all = data();
        var total = 0;

        for (var i = 0; i < ch._learnedSkills.length; i++) {
            var skill = all[ch._learnedSkills[i]];
            if (!skill || !skill.effects) { continue; }

            for (var j = 0; j < skill.effects.length; j++) {
                var eff = skill.effects[j];
                if (eff.type !== effectType) { continue; }
                if (subtype && eff.subtype && eff.subtype !== subtype) { continue; }
                if (typeof eff.value === 'number') {
                    total += eff.value;
                }
            }
        }

        return total;
    }

    /**
     * Collect all effects of a given type as an array of effect objects.
     * @param {string} effectType
     * @returns {Object[]}
     */
    function getSkillEffectsList(effectType) {
        ensureStorage();
        var ch = character();
        if (!ch) { return []; }

        var all = data();
        var results = [];

        for (var i = 0; i < ch._learnedSkills.length; i++) {
            var skill = all[ch._learnedSkills[i]];
            if (!skill || !skill.effects) { continue; }

            for (var j = 0; j < skill.effects.length; j++) {
                var eff = skill.effects[j];
                if (eff.type === effectType) {
                    results.push(eff);
                }
            }
        }

        return results;
    }

    // ------------------------------------------------------------------
    //  Accessors
    // ------------------------------------------------------------------

    /**
     * Get all skills belonging to a specific tree.
     * @param {string} tree  'combat', 'tech', 'social', 'survival', 'crafting'
     * @returns {Object[]}
     */
    function getSkillsByTree(tree) {
        var all = data();
        var result = [];
        for (var id in all) {
            if (all.hasOwnProperty(id) && typeof all[id] === 'object' && all[id].tree === tree) {
                result.push(all[id]);
            }
        }
        // Sort by tier, then by name
        result.sort(function (a, b) {
            if (a.tier !== b.tier) { return a.tier - b.tier; }
            return a.name.localeCompare(b.name);
        });
        return result;
    }

    /**
     * Return the list of learned skill IDs.
     * @returns {string[]}
     */
    function getLearnedSkills() {
        ensureStorage();
        var ch = character();
        return ch ? ch._learnedSkills.slice() : [];
    }

    // ------------------------------------------------------------------
    //  Serialization
    // ------------------------------------------------------------------

    /**
     * Serialize learned skills for save data.
     * @returns {string[]}
     */
    function serialize() {
        ensureStorage();
        var ch = character();
        return ch ? ch._learnedSkills.slice() : [];
    }

    /**
     * Restore learned skills from save data.
     * Re-applies stat/hp/stamina/ability effects.
     * @param {string[]} savedSkills
     */
    function deserialize(savedSkills) {
        ensureStorage();
        var ch = character();
        if (!ch) { return; }

        ch._learnedSkills = [];
        if (!Array.isArray(savedSkills)) { return; }

        var all = data();
        for (var i = 0; i < savedSkills.length; i++) {
            var id = savedSkills[i];
            if (all[id]) {
                ch._learnedSkills.push(id);
                applyEffects(all[id].effects);
            }
        }
    }

    // ------------------------------------------------------------------
    //  Public API
    // ------------------------------------------------------------------

    return {
        hasSkill:           hasSkill,
        getAvailableSkills: getAvailableSkills,
        learnSkill:         learnSkill,
        getSkillEffects:    getSkillEffects,
        getSkillEffectsList: getSkillEffectsList,
        getSkillPoints:     getSkillPoints,
        getSpentPoints:     getSpentPoints,
        getAvailablePoints: getAvailablePoints,
        getSkillsByTree:    getSkillsByTree,
        getLearnedSkills:   getLearnedSkills,
        serialize:          serialize,
        deserialize:        deserialize
    };
})();
