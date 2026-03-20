/**
 * LATENCY - ScreenManager
 * Manages the DOM lifecycle of screen objects: mounting, unmounting, and
 * CSS transitions between them.  Supports multiple transition types:
 *   'fade'   - Smooth opacity fade (default for normal navigation)
 *   'glitch' - Stepped clip-path glitch effect (for combat entries)
 *   'slide'  - Horizontal slide (for overlay panels like inventory/map)
 *
 * Depends on: Latency.EventBus
 *
 * CRITICAL DESIGN NOTE:
 *   show() ONLY touches #screen-container.  It NEVER touches #music-layer
 *   or #particle-canvas.  Those layers are managed by their own subsystems.
 *
 * Screen contract - any object registered via register() must implement:
 *   mount(container: HTMLElement, params: *): void | Promise<void>
 *   unmount(): void | Promise<void>
 *
 * Usage:
 *   Latency.ScreenManager.init(document.getElementById('screen-container'));
 *   Latency.ScreenManager.register('menu', MenuScreen);
 *   // Transition is triggered automatically via EventBus 'screen:change',
 *   // or can be called directly:
 *   await Latency.ScreenManager.show('menu');
 *   await Latency.ScreenManager.show('combat', data, 'glitch');
 *   await Latency.ScreenManager.show('inventory', null, 'slide');
 */

window.Latency = window.Latency || {};

window.Latency.ScreenManager = (function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------

    /** Duration in ms that matches the CSS fade-out / fade-in transitions. */
    var TRANSITION_DURATION = 300;

    /**
     * Supported transition types and their CSS class pairs.
     * Each type maps to { out: 'class-name', in: 'class-name', duration: ms }.
     *
     * 'fade'   - Default smooth fade, good for normal navigation.
     * 'glitch' - Stepped clip-path glitch, ideal for combat entries.
     * 'slide'  - Horizontal slide, suited for overlay panels (inventory, map).
     */
    var TRANSITIONS = {
        fade: {
            out: 'fade-out',
            inClass: 'fade-in',
            duration: 300
        },
        glitch: {
            out: 'glitch-out',
            inClass: 'glitch-in',
            duration: 400
        },
        slide: {
            out: 'slide-out-left',
            inClass: 'slide-in-right',
            duration: 300
        }
    };

    /** Default transition when none is specified. */
    var DEFAULT_TRANSITION = 'fade';

    // -----------------------------------------------------------------------
    // Internal state
    // -----------------------------------------------------------------------

    /**
     * Registry of screen name -> screen object.
     * @type {Object<string, {mount: Function, unmount: Function}>}
     */
    var _screens = {};

    /**
     * The screen object that is currently mounted, or null.
     * @type {{mount: Function, unmount: Function}|null}
     */
    var _activeScreen = null;

    /**
     * Name of the currently active screen (mirrors _activeScreen for lookups).
     * @type {string|null}
     */
    var _activeScreenName = null;

    /**
     * Reference to the #screen-container DOM element.
     * @type {HTMLElement|null}
     */
    var _container = null;

    /**
     * Guard flag to prevent overlapping transitions.
     * @type {boolean}
     */
    var _transitioning = false;

    /**
     * If a show() call arrives while a transition is already in progress,
     * we store the most recent request here.  Only the latest queued request
     * is honoured (intermediate ones are dropped since they'd be invisible
     * anyway).
     * @type {{name: string, params: *}|null}
     */
    var _queued = null;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Promise-based delay.
     * @param {number} ms
     * @returns {Promise<void>}
     */
    function wait(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    /**
     * Validate that a screen object satisfies the required contract.
     * @param {*} screenObject
     * @returns {boolean}
     */
    function isValidScreen(screenObject) {
        return (
            screenObject !== null &&
            typeof screenObject === 'object' &&
            typeof screenObject.mount === 'function' &&
            typeof screenObject.unmount === 'function'
        );
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Initialise the ScreenManager.
     *
     * @param {HTMLElement} containerElement - The DOM element that screens
     *     will be mounted into (typically #screen-container).
     */
    function init(containerElement) {
        if (!containerElement || !(containerElement instanceof HTMLElement)) {
            throw new Error(
                '[ScreenManager] init() requires a valid HTMLElement.'
            );
        }

        _container = containerElement;
        _screens = {};
        _activeScreen = null;
        _activeScreenName = null;
        _transitioning = false;
        _queued = null;

        // Listen for state-machine driven screen changes.
        // data.transition is optional: 'fade' | 'glitch' | 'slide'
        window.Latency.EventBus.on('screen:change', function (data) {
            if (data && data.to) {
                show(data.to, data.params, data.transition);
            }
        });
    }

    /**
     * Register a named screen object.
     *
     * @param {string} name - Unique screen identifier (must match a
     *     StateMachine state name).
     * @param {{mount: Function, unmount: Function}} screenObject
     */
    function register(name, screenObject) {
        if (typeof name !== 'string' || !name) {
            throw new TypeError(
                '[ScreenManager] register(): name must be a non-empty string.'
            );
        }
        if (!isValidScreen(screenObject)) {
            throw new TypeError(
                '[ScreenManager] register(): screenObject must implement ' +
                'mount(container, params) and unmount() methods.'
            );
        }

        if (_screens[name]) {
            return; // Already registered, skip silently
        }

        _screens[name] = screenObject;

        // If the StateMachine is stuck waiting for this screen, show it now
        var EB = window.Latency && window.Latency.EventBus;
        var SM = window.Latency && window.Latency.StateMachine;
        if (SM && SM.getCurrentState && SM.getCurrentState() === name && _activeScreenName !== name) {
            show(name);
        }
    }

    /**
     * Remove all known transition CSS classes from the container.
     * Prevents stale animation classes from leaking between transitions.
     */
    function clearTransitionClasses() {
        var key, t;
        for (key in TRANSITIONS) {
            if (TRANSITIONS.hasOwnProperty(key)) {
                t = TRANSITIONS[key];
                _container.classList.remove(t.out);
                _container.classList.remove(t.inClass);
            }
        }
    }

    /**
     * Transition to a new screen with a configurable animation.
     *
     * CRITICAL: This method ONLY touches _container (#screen-container).
     * It NEVER touches #music-layer or #particle-canvas.
     *
     * If a transition is already in progress the request is queued.  Only the
     * most recent queued request will be executed once the current transition
     * completes.
     *
     * @param {string}  screenName      - Name of a previously registered screen.
     * @param {*}       [params]        - Data forwarded to the screen's mount() method.
     * @param {string}  [transitionType] - 'fade' (default), 'glitch', or 'slide'.
     * @returns {Promise<void>}
     */
    async function show(screenName, params, transitionType) {
        // ------------------------------------------------------------------
        // 0. Skip if already showing this screen (prevents duplicate mounts)
        // ------------------------------------------------------------------
        if (_activeScreenName === screenName && !_transitioning && !params) {
            return;
        }

        // ------------------------------------------------------------------
        // 1. If already mid-transition, queue this request and bail out.
        // ------------------------------------------------------------------
        if (_transitioning) {
            // Only queue if it's a different screen than what we're transitioning to
            if (!_queued || _queued.name !== screenName) {
                _queued = { name: screenName, params: params, transition: transitionType };
            }
            return;
        }

        // ------------------------------------------------------------------
        // 2. Validate
        // ------------------------------------------------------------------
        if (!_container) {
            console.error(
                '[ScreenManager] Not initialised. Call init() first.'
            );
            return;
        }

        var screen = _screens[screenName];
        if (!screen) {
            // Screen may not be registered yet — retry once after a tick
            await new Promise(function (resolve) { setTimeout(resolve, 50); });
            screen = _screens[screenName];
            if (!screen) {
                console.error(
                    '[ScreenManager] No screen registered as "' + screenName + '".'
                );
                return;
            }
        }

        // ------------------------------------------------------------------
        // 3. Resolve transition type
        // ------------------------------------------------------------------
        var tType = transitionType || DEFAULT_TRANSITION;
        var trans = TRANSITIONS[tType];
        if (!trans) {
            console.warn(
                '[ScreenManager] Unknown transition "' + tType +
                '", falling back to "' + DEFAULT_TRANSITION + '".'
            );
            trans = TRANSITIONS[DEFAULT_TRANSITION];
        }

        // ------------------------------------------------------------------
        // 4. Begin transition
        // ------------------------------------------------------------------
        _transitioning = true;

        try {
            // ---- Out animation -------------------------------------------
            clearTransitionClasses();
            _container.classList.add(trans.out);
            await wait(trans.duration);

            // ---- Unmount active screen -----------------------------------
            if (_activeScreen) {
                try {
                    await _activeScreen.unmount();
                } catch (err) {
                    console.error(
                        '[ScreenManager] Error unmounting "' +
                        _activeScreenName + '":',
                        err
                    );
                }
            }

            // ---- Clear container -----------------------------------------
            _container.innerHTML = '';

            // ---- Mount new screen ----------------------------------------
            try {
                await screen.mount(_container, params);
            } catch (err) {
                console.error(
                    '[ScreenManager] Error mounting "' + screenName + '":',
                    err
                );
            }

            _activeScreen = screen;
            _activeScreenName = screenName;

            // ---- In animation --------------------------------------------
            clearTransitionClasses();
            _container.classList.add(trans.inClass);
            await wait(trans.duration);

            clearTransitionClasses();

            // ---- Signal completion ---------------------------------------
            window.Latency.EventBus.emit('screen:ready', {
                screen: screenName,
                params: params || null
            });
        } finally {
            // Always release the lock, even if something threw.
            _transitioning = false;
        }

        // ------------------------------------------------------------------
        // Process queued transition (if any).
        // ------------------------------------------------------------------
        if (_queued) {
            var next = _queued;
            _queued = null;
            await show(next.name, next.params, next.transition);
        }
    }

    /**
     * Return the currently active screen object, or null.
     * @returns {{mount: Function, unmount: Function}|null}
     */
    function getActiveScreen() {
        return _activeScreen;
    }

    // Public API
    return {
        /** @internal exposed for testing/debugging */
        _screens: _screens,
        _activeScreen: _activeScreen,
        _container: _container,
        _transitioning: _transitioning,

        init: init,
        register: register,
        show: show,
        getActiveScreen: getActiveScreen
    };
})();
