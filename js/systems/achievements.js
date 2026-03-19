/**
 * LATENCY - Achievement System
 * ============================================================
 * Tracks and manages player achievements across all saves and
 * characters. Achievements persist in localStorage independently
 * of save files.
 *
 * Listens to EventBus events (combat, flags, levels, factions,
 * story nodes, skills, inventory, jobs, character creation) and
 * evaluates unlock conditions automatically.
 *
 * Dependencies:
 *   - window.Latency.AchievementsData  (achievement definitions)
 *   - window.Latency.EventBus          (publish/subscribe)
 *   - window.Latency.CharacterSystem   (character state, XP)
 *
 * Events emitted:
 *   achievement:unlocked  { achievement }
 *   notify                { message, type, duration }
 *
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.AchievementSystem = (function () {
    'use strict';

    // ------------------------------------------------------------------
    //  Constants
    // ------------------------------------------------------------------

    var STORAGE_KEY = 'latency_achievements';
    var META_STORAGE_KEY = 'latency_achievements_meta';

    // ------------------------------------------------------------------
    //  Private state
    // ------------------------------------------------------------------

    var _unlocked = {};   // { achievementId: { unlockedAt: timestamp, character: name } }
    var _meta = {};       // Persistent meta-tracking: { racesPlayed: {}, totalKills: 0, ... }
    var _unsubs = [];     // EventBus unsubscribe handles

    // ------------------------------------------------------------------
    //  Helpers
    // ------------------------------------------------------------------

    function _bus() {
        return window.Latency.EventBus;
    }

    function _data() {
        return window.Latency.AchievementsData;
    }

    function _char() {
        if (window.Latency.CharacterSystem) {
            return window.Latency.CharacterSystem.getCharacter();
        }
        return null;
    }

    function _charName() {
        var c = _char();
        return c ? (c.name || '') : '';
    }

    // ------------------------------------------------------------------
    //  Persistence (localStorage - independent of save files)
    // ------------------------------------------------------------------

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_unlocked));
        } catch (e) { /* quota exceeded or private mode */ }
    }

    function load() {
        try {
            var d = localStorage.getItem(STORAGE_KEY);
            if (d) {
                _unlocked = JSON.parse(d);
            }
        } catch (e) {
            _unlocked = {};
        }
    }

    function saveMeta() {
        try {
            localStorage.setItem(META_STORAGE_KEY, JSON.stringify(_meta));
        } catch (e) { /* ignore */ }
    }

    function loadMeta() {
        try {
            var d = localStorage.getItem(META_STORAGE_KEY);
            if (d) {
                _meta = JSON.parse(d);
            }
        } catch (e) {
            _meta = {};
        }
        // Ensure defaults
        if (!_meta.racesPlayed) { _meta.racesPlayed = {}; }
        if (!_meta.totalKills)  { _meta.totalKills = 0; }
        if (!_meta.totalDeaths) { _meta.totalDeaths = 0; }
        if (!_meta.endingsReached) { _meta.endingsReached = {}; }
    }

    // ------------------------------------------------------------------
    //  Core unlock logic
    // ------------------------------------------------------------------

    /**
     * Check a single achievement by ID.
     * Evaluates the achievement's condition against current game state.
     * Returns true if newly unlocked, false otherwise.
     */
    function check(achievementId) {
        if (_unlocked[achievementId]) { return false; }

        var AD = _data();
        if (!AD) { return false; }

        var ach = AD.get(achievementId);
        if (!ach) { return false; }

        var condition = ach.condition;
        if (!condition) { return false; }

        var met = _evaluateCondition(condition);
        if (met) {
            unlock(achievementId);
            return true;
        }
        return false;
    }

    /**
     * Check all achievements that haven't been unlocked yet.
     */
    function checkAll() {
        var AD = _data();
        if (!AD) { return; }

        var all = AD.getAll();
        for (var i = 0; i < all.length; i++) {
            if (!_unlocked[all[i].id]) {
                check(all[i].id);
            }
        }
    }

    /**
     * Force-unlock an achievement (bypasses condition check).
     */
    function unlock(achievementId) {
        var AD = _data();
        if (!AD) { return; }

        var ach = AD.get(achievementId);
        if (!ach || _unlocked[achievementId]) { return; }

        _unlocked[achievementId] = {
            unlockedAt: Date.now(),
            character: _charName()
        };
        save();

        // Apply reward
        if (ach.reward) {
            if (ach.reward.xp && window.Latency.CharacterSystem) {
                window.Latency.CharacterSystem.addExperience(ach.reward.xp);
            }
            if (ach.reward.credits && window.Latency.Inventory) {
                window.Latency.Inventory.addCredits(ach.reward.credits);
            }
            if (ach.reward.item && window.Latency.Inventory) {
                window.Latency.Inventory.addItem(ach.reward.item, 1);
            }
        }

        // Notification
        var EB = _bus();
        if (EB) {
            EB.emit('achievement:unlocked', { achievement: ach });
            EB.emit('notify', {
                message: 'Achievement Unlocked: ' + ach.name,
                type: 'success',
                duration: 5000
            });
        }

        console.log('[AchievementSystem] Unlocked: ' + ach.name);
    }

    // ------------------------------------------------------------------
    //  Condition evaluator
    // ------------------------------------------------------------------

    /**
     * Evaluate an achievement condition object against current game state.
     *
     * Supported condition types:
     *   { type: 'flag',     flag: 'flagName' }
     *   { type: 'level',    level: N }
     *   { type: 'kills',    count: N }
     *   { type: 'combo',    all: [...] }        (AND logic over sub-conditions)
     *   { type: 'count',    counter: 'key', min: N }
     *   { type: 'stat',     stat: 'name', min: N }
     *   { type: 'faction',  faction: 'id', tier: 'tierName' }
     *   { type: 'skill',    skillId: 'id' }
     *   { type: 'skills',   count: N }
     *   { type: 'item',     itemId: 'id' }
     *   { type: 'job',      jobId: 'id', rank: N }
     *   { type: 'story',    nodeId: 'id' }
     *   { type: 'race',     race: 'id' }
     *   { type: 'races',    count: N }          (meta: unique races played)
     *   { type: 'endings',  count: N }          (meta: unique endings reached)
     *   { type: 'meta_kills', count: N }        (meta: total kills across all plays)
     *   { type: 'achievements', count: N }      (meta-achievement: N others unlocked)
     *   { type: 'all',      conditions: [...] } (all must be true)
     *   { type: 'any',      conditions: [...] } (at least one must be true)
     *   { type: 'custom',   fn: 'functionName' }
     */
    function _evaluateCondition(cond) {
        if (!cond || !cond.type) { return false; }

        var c = _char();

        switch (cond.type) {

            case 'flag':
                if (!c || !c.flags) { return false; }
                return !!c.flags[cond.flag];

            case 'level':
                if (!c) { return false; }
                return (c.level || 1) >= cond.level;

            case 'kills':
                if (!c) { return false; }
                return (c.kills || 0) >= cond.count;

            case 'combo':
                if (!cond.all || !Array.isArray(cond.all)) { return false; }
                for (var ci = 0; ci < cond.all.length; ci++) {
                    if (!_evaluateCondition(cond.all[ci])) { return false; }
                }
                return true;

            case 'count':
                return (_meta[cond.counter] || 0) >= cond.min;

            case 'stat':
                if (!c || !c.stats) { return false; }
                return (c.stats[cond.stat] || 0) >= cond.min;

            case 'faction':
                if (window.Latency.FactionSystem && window.Latency.FactionSystem.getTier) {
                    var TIER_ORDER = { hostile: 0, unfriendly: 1, neutral: 2, friendly: 3, allied: 4 };
                    var currentTier = window.Latency.FactionSystem.getTier(cond.faction);
                    var requiredTier = cond.tier || 'neutral';
                    return (TIER_ORDER[currentTier] || 0) >= (TIER_ORDER[requiredTier] || 0);
                }
                return false;

            case 'skill':
                if (window.Latency.SkillSystem) {
                    return window.Latency.SkillSystem.hasSkill(cond.skillId);
                }
                return false;

            case 'skills':
                if (window.Latency.SkillSystem) {
                    var learned = window.Latency.SkillSystem.getLearnedSkills
                        ? window.Latency.SkillSystem.getLearnedSkills()
                        : [];
                    return learned.length >= cond.count;
                }
                return false;

            case 'item':
                if (window.Latency.Inventory) {
                    return window.Latency.Inventory.hasItem(cond.itemId);
                }
                return false;

            case 'job':
                if (window.Latency.JobSystem) {
                    var jobState = window.Latency.JobSystem.getJobState
                        ? window.Latency.JobSystem.getJobState(cond.jobId)
                        : null;
                    if (!jobState) { return false; }
                    return (jobState.rank || 0) >= (cond.rank || 1);
                }
                return false;

            case 'story':
                if (!c || !c.flags) { return false; }
                return !!c.flags['story_' + cond.nodeId] || !!c.flags[cond.nodeId];

            case 'race':
                if (!c) { return false; }
                return c.race === cond.race;

            case 'races':
                return Object.keys(_meta.racesPlayed || {}).length >= cond.count;

            case 'endings':
                return Object.keys(_meta.endingsReached || {}).length >= cond.count;

            case 'meta_kills':
                return (_meta.totalKills || 0) >= cond.count;

            case 'achievements':
                return Object.keys(_unlocked).length >= cond.count;

            case 'all':
                if (!cond.conditions) { return false; }
                for (var a = 0; a < cond.conditions.length; a++) {
                    if (!_evaluateCondition(cond.conditions[a])) { return false; }
                }
                return true;

            case 'any':
                if (!cond.conditions) { return false; }
                for (var b = 0; b < cond.conditions.length; b++) {
                    if (_evaluateCondition(cond.conditions[b])) { return true; }
                }
                return false;

            case 'custom':
                if (cond.fn && typeof window[cond.fn] === 'function') {
                    return !!window[cond.fn]();
                }
                return false;

            default:
                return false;
        }
    }

    // ------------------------------------------------------------------
    //  Event handlers
    // ------------------------------------------------------------------

    function _onCombatEnd(data) {
        if (!data) { return; }

        // Track kills
        if (data.victory || data.won) {
            _meta.totalKills = (_meta.totalKills || 0) + 1;

            var c = _char();
            if (c) {
                c.kills = (c.kills || 0) + 1;
            }

            saveMeta();
        }

        // Track deaths
        if (data.defeat || data.lost) {
            _meta.totalDeaths = (_meta.totalDeaths || 0) + 1;
            saveMeta();
        }

        checkAll();
    }

    function _onCharacterCreated(data) {
        if (!data) { return; }

        var raceId = data.race || (data.character && data.character.race);
        if (raceId) {
            _meta.racesPlayed[raceId] = true;
            saveMeta();
        }

        checkAll();
    }

    function _checkFlagAchievements(data) {
        // A flag was set - check all achievements since any might depend on flags
        checkAll();
    }

    function _checkLevelAchievements(data) {
        checkAll();
    }

    function _checkFactionAchievements(data) {
        checkAll();
    }

    function _checkStoryAchievements(data) {
        if (!data) { return; }

        // Track endings
        var nodeId = data.nodeId || data.id;
        if (nodeId && data.isEnding) {
            _meta.endingsReached[nodeId] = true;
            saveMeta();
        }

        checkAll();
    }

    // ------------------------------------------------------------------
    //  Query API
    // ------------------------------------------------------------------

    function isUnlocked(id) {
        return !!_unlocked[id];
    }

    function getUnlocked() {
        return Object.keys(_unlocked);
    }

    function getUnlockedData() {
        return _unlocked;
    }

    /**
     * Get progress for a specific category.
     * @param {string} category
     * @returns {{ unlocked: number, total: number, percentage: number }}
     */
    function getProgress(category) {
        var AD = _data();
        if (!AD) { return { unlocked: 0, total: 0, percentage: 0 }; }

        var all = AD.getByCategory(category);
        var unlocked = 0;
        for (var i = 0; i < all.length; i++) {
            if (_unlocked[all[i].id]) { unlocked++; }
        }
        var total = all.length;
        var pct = total ? Math.round(unlocked / total * 100) : 0;
        return { unlocked: unlocked, total: total, percentage: pct };
    }

    /**
     * Get total progress across all achievements.
     * @returns {{ unlocked: number, total: number, percentage: number }}
     */
    function getTotalProgress() {
        var AD = _data();
        if (!AD) { return { unlocked: 0, total: 0, percentage: 0 }; }

        var total = AD.count();
        var unlocked = Object.keys(_unlocked).length;
        var pct = total ? Math.round(unlocked / total * 100) : 0;
        return { unlocked: unlocked, total: total, percentage: pct };
    }

    // ------------------------------------------------------------------
    //  Initialization
    // ------------------------------------------------------------------

    function init() {
        load();
        loadMeta();

        var EB = _bus();
        if (!EB) {
            console.warn('[AchievementSystem] EventBus not available. Achievements will not auto-track.');
            return;
        }

        _unsubs.push(EB.on('combat:end', function (d) { _onCombatEnd(d); }));
        _unsubs.push(EB.on('flag:set', function (d) { _checkFlagAchievements(d); }));
        _unsubs.push(EB.on('levelup', function (d) { _checkLevelAchievements(d); }));
        _unsubs.push(EB.on('faction:change', function (d) { _checkFactionAchievements(d); }));
        _unsubs.push(EB.on('story:node', function (d) { _checkStoryAchievements(d); }));
        _unsubs.push(EB.on('skill:learned', function () { checkAll(); }));
        _unsubs.push(EB.on('inventory:add', function () { checkAll(); }));
        _unsubs.push(EB.on('job:promoted', function () { checkAll(); }));
        _unsubs.push(EB.on('character:created', function (d) { _onCharacterCreated(d); }));

        // Counter-tracking subscriptions for 'count' condition type
        _unsubs.push(EB.on('economy:spend', function (d) {
            if (!d) { return; }
            var amount = d.amount || 0;
            _meta.credits_spent = (_meta.credits_spent || 0) + amount;
            _meta.items_purchased = (_meta.items_purchased || 0) + (d.itemCount || 1);
            saveMeta();
            checkAll();
        }));
        _unsubs.push(EB.on('economy:earn', function (d) {
            if (!d) { return; }
            var amount = d.amount || 0;
            _meta.credits_earned = (_meta.credits_earned || 0) + amount;
            if (d.source === 'sell') {
                _meta.items_sold = (_meta.items_sold || 0) + (d.itemCount || 1);
            }
            saveMeta();
            checkAll();
        }));
        _unsubs.push(EB.on('stat:change', function (d) {
            if (!d) { return; }
            // Recalculate total stat points from character
            var ch = _char();
            if (ch && ch.stats) {
                var total = 0;
                var keys = Object.keys(ch.stats);
                for (var si = 0; si < keys.length; si++) {
                    total += (ch.stats[keys[si]] || 0);
                }
                _meta.total_stat_points = total;
            }
            saveMeta();
            checkAll();
        }));
        _unsubs.push(EB.on('map:travel', function (d) {
            _meta.steps_walked = (_meta.steps_walked || 0) + 1;
            if (d && d.location) {
                _meta.locations_visited = (_meta.locations_visited || 0) + (d.firstVisit ? 1 : 0);
            }
            if (d && d.fastTravel) {
                _meta.fast_travel_uses = (_meta.fast_travel_uses || 0) + 1;
            }
            saveMeta();
            checkAll();
        }));
        _unsubs.push(EB.on('save:complete', function () {
            _meta.save_count = (_meta.save_count || 0) + 1;
            saveMeta();
            checkAll();
        }));

        console.log('[AchievementSystem] Initialized. ' +
            Object.keys(_unlocked).length + ' achievements unlocked.');
    }

    /**
     * Tear down event subscriptions (useful for testing).
     */
    function destroy() {
        for (var i = 0; i < _unsubs.length; i++) {
            if (typeof _unsubs[i] === 'function') {
                _unsubs[i]();
            }
        }
        _unsubs = [];
    }

    // ------------------------------------------------------------------
    //  Public API
    // ------------------------------------------------------------------

    return {
        init:             init,
        destroy:          destroy,
        check:            check,
        checkAll:         checkAll,
        unlock:           unlock,
        isUnlocked:       isUnlocked,
        getUnlocked:      getUnlocked,
        getUnlockedData:  getUnlockedData,
        getProgress:      getProgress,
        getTotalProgress: getTotalProgress,
        save:             save,
        load:             load
    };
})();
