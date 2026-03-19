/**
 * LATENCY - StateMachine
 * Manages the current application screen state and enforces valid transitions.
 *
 * Depends on: Latency.EventBus
 *
 * Usage:
 *   Latency.StateMachine.init();
 *   Latency.StateMachine.transition('creation');
 *   Latency.StateMachine.back();
 */

window.Latency = window.Latency || {};

window.Latency.StateMachine = (function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------

    /**
     * Every valid state the application can be in.
     * @type {string[]}
     */
    var VALID_STATES = [
        'menu',
        'creation',
        'gameplay',
        'combat',
        'inventory',
        'map',
        'settings',
        'saveload',
        'cutscene',
        'skills',
        'achievements',
        'journal',
        'ending',
        'howtoplay'
    ];

    /**
     * Transition rules: maps each state to the set of states it may move to.
     * Overlay states (inventory, map, settings, saveload, skills, achievements)
     * use the special token '_back' to indicate they return to wherever the
     * player came from via back().
     * @type {Object<string, string[]>}
     */
    var TRANSITIONS = {
        menu:         ['creation', 'saveload', 'settings', 'achievements', 'howtoplay'],
        creation:     ['cutscene', 'gameplay', 'menu'],
        cutscene:     ['gameplay', 'combat', 'ending'],
        gameplay:     ['combat', 'inventory', 'map', 'settings', 'saveload',
                       'cutscene', 'gameplay', 'skills', 'achievements', 'journal', 'ending'],
        combat:       ['gameplay', 'cutscene', 'ending'],
        ending:       ['menu', 'saveload', 'creation'],
        inventory:    ['_back'],
        map:          ['_back'],
        settings:     ['_back'],
        saveload:     ['_back'],
        skills:       ['_back'],
        achievements: ['_back'],
        journal:      ['_back'],
        howtoplay:    ['_back']
    };

    /**
     * States that act as overlays and resolve their target via back().
     * @type {Set<string>}
     */
    var OVERLAY_STATES = new Set([
        'inventory', 'map', 'settings', 'saveload', 'skills', 'achievements', 'journal', 'howtoplay'
    ]);

    // -----------------------------------------------------------------------
    // Internal state
    // -----------------------------------------------------------------------

    /** @type {string|null} */
    var _currentState = null;

    /** @type {string|null} */
    var _previousState = null;

    /**
     * Navigation history stack.  Each entry records the state name and any
     * params that were passed when transitioning into it.
     * @type {Array<{state: string, params: *}>}
     */
    var _history = [];

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * @param {string} state
     * @returns {boolean}
     */
    function isValidState(state) {
        return VALID_STATES.indexOf(state) !== -1;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Initialise the state machine.  Sets the current state to 'menu' and
     * clears any previous history.
     */
    function init() {
        _currentState = 'menu';
        _previousState = null;
        _history = [{ state: 'menu', params: null }];
    }

    /**
     * @returns {string|null} The current state name, or null if uninitialised.
     */
    function getCurrentState() {
        return _currentState;
    }

    /**
     * @returns {string|null} The state that was active before the current one.
     */
    function getPreviousState() {
        return _previousState;
    }

    /**
     * Attempt to transition to a new state.
     *
     * 1. Validates that `to` is a known state.
     * 2. Checks the transition is allowed from the current state.
     * 3. Updates internal tracking (_currentState, _previousState, _history).
     * 4. Emits 'screen:change' via EventBus.
     *
     * @param {string} to - Target state name.
     * @param {*} [params] - Arbitrary data forwarded in the event payload
     *     (e.g. which save slot to load, which cutscene to play).
     * @returns {boolean} True if the transition succeeded.
     */
    function transition(to, params) {
        if (!_currentState) {
            console.error('[StateMachine] Not initialised. Call init() first.');
            return false;
        }

        if (!isValidState(to)) {
            console.error(
                '[StateMachine] "' + to + '" is not a valid state.'
            );
            return false;
        }

        if (!canTransition(to)) {
            console.warn(
                '[StateMachine] Transition from "' + _currentState +
                '" to "' + to + '" is not allowed.'
            );
            return false;
        }

        var from = _currentState;

        _previousState = from;
        _currentState = to;
        _history.push({ state: to, params: params || null });

        // Notify the rest of the engine
        window.Latency.EventBus.emit('screen:change', {
            from: from,
            to: to,
            params: params || null
        });

        return true;
    }

    /**
     * Navigate back to the previous state by popping the history stack.
     * This is the primary mechanism for overlay states (inventory, map, etc.)
     * to return to wherever the player came from.
     *
     * @returns {boolean} True if a back-navigation occurred.
     */
    function back() {
        if (_history.length <= 1) {
            console.warn('[StateMachine] No previous state to return to.');
            return false;
        }

        // Pop the current state
        _history.pop();

        // Peek at the new top of the stack
        var target = _history[_history.length - 1];

        var from = _currentState;
        _previousState = from;
        _currentState = target.state;

        window.Latency.EventBus.emit('screen:change', {
            from: from,
            to: target.state,
            params: target.params
        });

        return true;
    }

    /**
     * Check whether transitioning from the current state to `to` is
     * permitted by the rule table.
     *
     * Overlay states have the special '_back' rule which means they can only
     * use back().  Direct transitions *to* overlay states are governed by the
     * source state's rule list as usual.
     *
     * @param {string} to - Target state name.
     * @returns {boolean}
     */
    function canTransition(to) {
        if (!_currentState) {
            return false;
        }

        if (!isValidState(to)) {
            return false;
        }

        var allowed = TRANSITIONS[_currentState];
        if (!allowed) {
            return false;
        }

        return allowed.indexOf(to) !== -1;
    }

    /**
     * Force the state machine to a specific state without checking the
     * transition table.  Used by SaveManager when restoring a save, since
     * the normal transition path may not be valid from the current state.
     *
     * @param {string} state - Target state name (must be a valid state).
     * @param {*} [params] - Optional params stored in the history entry.
     */
    function _forceState(state, params) {
        if (!isValidState(state)) {
            console.error('[StateMachine] _forceState: "' + state + '" is not a valid state.');
            return;
        }

        var from = _currentState;
        _previousState = from;
        _currentState = state;
        _history.push({ state: state, params: params || null });

        window.Latency.EventBus.emit('screen:change', {
            from: from,
            to: state,
            params: params || null
        });
    }

    // Public API
    return {
        /** @internal exposed for testing/debugging */
        _currentState: _currentState,
        _previousState: _previousState,
        _history: _history,

        init: init,
        getCurrentState: getCurrentState,
        getPreviousState: getPreviousState,
        transition: transition,
        back: back,
        canTransition: canTransition,
        _forceState: _forceState
    };
})();
