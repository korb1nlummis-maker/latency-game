/**
 * LATENCY - New Game Plus System
 * ============================================================
 * Manages NG+ detection, benefits, enemy scaling, and the
 * completion hook that sets the NG+ flag on game end.
 *
 * Dependencies:
 *   - window.Latency.EventBus        (publish/subscribe)
 *   - window.Latency.CharacterSystem  (character creation hooks)
 *   - window.Latency.StateMachine     (screen transitions)
 *
 * localStorage keys:
 *   latency_ng_plus       - "true" when any ending has been reached
 *   latency_ng_plus_count - number of completions (1, 2, 3, ...)
 *   latency_endings_seen  - JSON array of ending IDs discovered
 *
 * Events emitted:
 *   ngplus:started   { ngPlusCount }
 *   ngplus:completed { endingId, ngPlusCount }
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.NewGamePlus = (function () {
    'use strict';

    // ------------------------------------------------------------------
    //  Constants
    // ------------------------------------------------------------------

    var STORAGE_FLAG     = 'latency_ng_plus';
    var STORAGE_COUNT    = 'latency_ng_plus_count';
    var STORAGE_ENDINGS  = 'latency_endings_seen';

    var NG_PLUS_STAT_BONUS  = 5;    // +5 to every base stat per cycle
    var NG_PLUS_CREDITS     = 500;  // starting credits in NG+
    var ENEMY_LEVEL_SCALE   = 2;    // +2 enemy levels per NG+ cycle

    // ------------------------------------------------------------------
    //  Helpers
    // ------------------------------------------------------------------

    function _bus() {
        return window.Latency.EventBus;
    }

    function _safeGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }

    function _safeSet(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* noop */ }
    }

    // ------------------------------------------------------------------
    //  Detection
    // ------------------------------------------------------------------

    /** @returns {boolean} True if the player has completed the game at least once. */
    function isUnlocked() {
        return _safeGet(STORAGE_FLAG) === 'true';
    }

    /** @returns {number} How many times the game has been completed (0 if never). */
    function getCount() {
        var raw = _safeGet(STORAGE_COUNT);
        var n = parseInt(raw, 10);
        return isNaN(n) ? 0 : n;
    }

    /** @returns {string[]} Array of ending IDs the player has seen across all runs. */
    function getEndingsSeen() {
        var raw = _safeGet(STORAGE_ENDINGS);
        if (!raw) return [];
        try { return JSON.parse(raw); } catch (e) { return []; }
    }

    // ------------------------------------------------------------------
    //  Completion hook — call when any ending is reached
    // ------------------------------------------------------------------

    /**
     * Mark the game as completed. Should be called when the player
     * reaches any ending (set game.completed flag or ending screen).
     *
     * @param {string} [endingId] - Optional ending identifier to track.
     */
    function onGameCompleted(endingId) {
        // Set the NG+ flag
        _safeSet(STORAGE_FLAG, 'true');

        // Increment completion counter
        var count = getCount() + 1;
        _safeSet(STORAGE_COUNT, String(count));

        // Track the ending
        if (endingId) {
            var endings = getEndingsSeen();
            if (endings.indexOf(endingId) === -1) {
                endings.push(endingId);
                _safeSet(STORAGE_ENDINGS, JSON.stringify(endings));
            }
        }

        _bus().emit('ngplus:completed', {
            endingId: endingId || null,
            ngPlusCount: count
        });

        console.log('[NewGamePlus] Game completed. NG+ count:', count);
    }

    // ------------------------------------------------------------------
    //  Start New Game Plus
    // ------------------------------------------------------------------

    /**
     * Begin a New Game Plus run. Sets session flags and transitions
     * to character creation. The NG+ bonuses are applied after the
     * character is created via the character:created listener.
     */
    function startNewGamePlus() {
        if (!isUnlocked()) {
            console.warn('[NewGamePlus] NG+ not unlocked yet.');
            return;
        }

        // Store session-level NG+ flag so character creation knows
        // to apply bonuses once the character is built.
        window.Latency._ngPlusActive = true;
        window.Latency._ngPlusCount  = getCount();

        _bus().emit('ngplus:started', { ngPlusCount: getCount() });

        console.log('[NewGamePlus] Starting NG+ run #' + getCount());

        // Transition to character creation
        if (window.Latency.StateMachine && window.Latency.StateMachine.transition) {
            window.Latency.StateMachine.transition('creation');
        } else if (window.Latency.ScreenManager && window.Latency.ScreenManager.show) {
            window.Latency.ScreenManager.show('creation');
        }
    }

    // ------------------------------------------------------------------
    //  Apply NG+ bonuses to a freshly created character
    // ------------------------------------------------------------------

    /**
     * Called automatically via EventBus when a character is created.
     * If NG+ is active for this session, apply all bonuses.
     */
    function _applyNGPlusBonuses(data) {
        if (!window.Latency._ngPlusActive) return;

        var CS  = window.Latency.CharacterSystem;
        var ch  = CS.getCharacter();
        if (!ch) return;

        var cycle = window.Latency._ngPlusCount || 1;

        // 1. +5 to all base stats (per cycle — NG++ gets +10, etc.)
        var statBonus = NG_PLUS_STAT_BONUS * cycle;
        var statKeys  = Object.keys(ch.stats);
        for (var i = 0; i < statKeys.length; i++) {
            ch.stats[statKeys[i]] += statBonus;
        }

        // 2. Override starting credits to 500
        ch.inventory.currency = NG_PLUS_CREDITS;

        // 3. Add the newgame_plus flag for dialogue checks
        if (ch.flags.indexOf('newgame_plus') === -1) {
            ch.flags.push('newgame_plus');
        }

        // 4. Add NG+ trait (10% XP bonus — defined in traits.js)
        if (ch.traits.indexOf('ng_plus_veteran') === -1) {
            ch.traits.push('ng_plus_veteran');
        }

        // 5. Mark all locations as discovered
        _discoverAllLocations(ch);

        // 6. Store NG+ cycle on the character for enemy scaling
        ch.ngPlusCycle = cycle;

        // Recalculate derived stats with the new bonuses
        CS.recalculateDerived();

        // Top off HP/Stamina after recalc
        ch.derived.currentHp      = ch.derived.maxHp;
        ch.derived.currentStamina = ch.derived.maxStamina;

        console.log('[NewGamePlus] Applied NG+ bonuses (cycle ' + cycle + ').');

        // Clear session flag so subsequent creates in the same
        // session don't accidentally get NG+ bonuses.
        window.Latency._ngPlusActive = false;
    }

    /**
     * Mark every location in Latency.Locations as visited on the character.
     */
    function _discoverAllLocations(ch) {
        var locs = window.Latency.Locations;
        if (!locs) return;

        for (var key in locs) {
            if (locs.hasOwnProperty(key) && typeof locs[key] === 'object' && locs[key].id) {
                if (ch.visitedNodes.indexOf(key) === -1) {
                    ch.visitedNodes.push(key);
                }
            }
        }
    }

    // ------------------------------------------------------------------
    //  Enemy scaling
    // ------------------------------------------------------------------

    /**
     * Get the enemy level adjustment for the current NG+ cycle.
     * Call this when spawning enemies to add to their base level.
     *
     * @returns {number} Extra levels to add (0 if not in NG+).
     */
    function getEnemyLevelBonus() {
        var ch = window.Latency.CharacterSystem
              && window.Latency.CharacterSystem.getCharacter();
        if (!ch || !ch.ngPlusCycle) return 0;
        return ch.ngPlusCycle * ENEMY_LEVEL_SCALE;
    }

    // ------------------------------------------------------------------
    //  NG+ label helper
    // ------------------------------------------------------------------

    /**
     * Returns a display string like "NG+", "NG++", "NG+3", etc.
     * @param {number} [cycle] - Defaults to current count.
     * @returns {string}
     */
    function getLabel(cycle) {
        var c = (cycle !== undefined) ? cycle : getCount();
        if (c <= 0) return '';
        if (c === 1) return 'NG+';
        if (c === 2) return 'NG++';
        return 'NG+' + c;
    }

    // ------------------------------------------------------------------
    //  Initialization — wire up EventBus listeners
    // ------------------------------------------------------------------

    function init() {
        // Apply bonuses when a character is created during an NG+ run
        _bus().on('character:created', _applyNGPlusBonuses);

        console.log('[NewGamePlus] System initialized. Unlocked:', isUnlocked(),
                    '| Count:', getCount());
    }

    // ------------------------------------------------------------------
    //  Public API
    // ------------------------------------------------------------------

    return {
        init:               init,
        isUnlocked:         isUnlocked,
        getCount:           getCount,
        getEndingsSeen:     getEndingsSeen,
        getLabel:           getLabel,
        onGameCompleted:    onGameCompleted,
        startNewGamePlus:   startNewGamePlus,
        getEnemyLevelBonus: getEnemyLevelBonus
    };
})();
