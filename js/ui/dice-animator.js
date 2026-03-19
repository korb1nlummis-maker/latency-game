/**
 * LATENCY - Dice Animator
 * ============================================================
 * Visual dice roll animations with a terminal/CRT aesthetic.
 * Rapidly cycles random numbers before landing on the final
 * result, with color-coded outcomes and CSS shake effects.
 *
 * Depends on: (none — standalone visual utility)
 *
 * Usage:
 *   await Latency.DiceAnimator.animate(20, 17, container);
 *   await Latency.DiceAnimator.animate(20, 17, container, { success: true, crit: true });
 *   await Latency.DiceAnimator.animateMultiple([4, 6, 2], container);
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.DiceAnimator = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------

    /** Total animation duration in ms */
    var ANIMATION_DURATION = 1500;

    /** How often the displayed number changes during the fast phase (ms) */
    var FAST_TICK = 50;

    /** How often the displayed number changes during the slow phase (ms) */
    var SLOW_TICK = 150;

    /** Fraction of total duration spent in the fast phase */
    var FAST_PHASE_RATIO = 0.6;

    // -------------------------------------------------------------------
    // Style injection (one-time)
    // -------------------------------------------------------------------

    var _stylesInjected = false;

    function _injectStyles() {
        if (_stylesInjected) return;
        _stylesInjected = true;

        var css = [
            '@keyframes diceShake {',
            '  0%, 100% { transform: translate(0, 0) rotate(0deg); }',
            '  10% { transform: translate(-2px, -1px) rotate(-2deg); }',
            '  20% { transform: translate(2px, 1px) rotate(2deg); }',
            '  30% { transform: translate(-1px, 2px) rotate(-1deg); }',
            '  40% { transform: translate(1px, -2px) rotate(1deg); }',
            '  50% { transform: translate(-2px, 1px) rotate(-2deg); }',
            '  60% { transform: translate(2px, -1px) rotate(2deg); }',
            '  70% { transform: translate(-1px, -2px) rotate(-1deg); }',
            '  80% { transform: translate(1px, 2px) rotate(1deg); }',
            '  90% { transform: translate(-2px, -1px) rotate(-2deg); }',
            '}',
            '',
            '@keyframes diceLand {',
            '  0% { transform: scale(1.3); }',
            '  50% { transform: scale(0.9); }',
            '  100% { transform: scale(1); }',
            '}',
            '',
            '@keyframes diceGlow {',
            '  0% { box-shadow: 0 0 5px currentColor; }',
            '  50% { box-shadow: 0 0 20px currentColor, 0 0 40px currentColor; }',
            '  100% { box-shadow: 0 0 8px currentColor; }',
            '}',
            '',
            '.dice-element {',
            '  display: inline-flex;',
            '  align-items: center;',
            '  justify-content: center;',
            '  width: 64px;',
            '  height: 64px;',
            '  margin: 0.25rem;',
            '  border: 2px solid var(--text-primary, #00ff88);',
            '  background: var(--bg-panel, #1a1a2e);',
            '  color: var(--text-primary, #00ff88);',
            '  font-family: var(--font-mono, "Courier New", monospace);',
            '  font-size: 1.5rem;',
            '  font-weight: 700;',
            '  letter-spacing: 0.05em;',
            '  text-shadow: 0 0 6px currentColor;',
            '  user-select: none;',
            '  position: relative;',
            '}',
            '',
            '.dice-element.rolling {',
            '  animation: diceShake 0.15s infinite;',
            '  border-color: var(--text-secondary, #8899aa);',
            '  color: var(--text-secondary, #8899aa);',
            '}',
            '',
            '.dice-element.landed {',
            '  animation: diceLand 0.3s ease-out forwards, diceGlow 0.6s ease-out forwards;',
            '}',
            '',
            '.dice-element.result-success {',
            '  color: var(--color-success, #00ff88);',
            '  border-color: var(--color-success, #00ff88);',
            '}',
            '',
            '.dice-element.result-fail {',
            '  color: var(--color-danger, #ff2d75);',
            '  border-color: var(--color-danger, #ff2d75);',
            '}',
            '',
            '.dice-element.result-crit {',
            '  color: var(--color-xp, #ffd700);',
            '  border-color: var(--color-xp, #ffd700);',
            '  text-shadow: 0 0 12px rgba(255, 215, 0, 0.8);',
            '}',
            '',
            '.dice-container {',
            '  display: flex;',
            '  flex-wrap: wrap;',
            '  justify-content: center;',
            '  align-items: center;',
            '  gap: 0.25rem;',
            '  padding: 0.5rem;',
            '}'
        ].join('\n');

        var style = document.createElement('style');
        style.setAttribute('data-module', 'dice-animator');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // -------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------

    /**
     * Promise-based delay.
     * @param {number} ms
     * @returns {Promise<void>}
     */
    function _wait(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    /**
     * Generate a random number between 1 and max (inclusive).
     * @param {number} max
     * @returns {number}
     */
    function _randomFace(max) {
        return Math.floor(Math.random() * max) + 1;
    }

    // -------------------------------------------------------------------
    // Single die animation
    // -------------------------------------------------------------------

    /**
     * Animate a single die rolling and landing on a final result.
     *
     * @param {number} diceType      - Number of sides (e.g. 20, 6).
     * @param {number} finalResult   - The predetermined result to land on.
     * @param {HTMLElement} container - DOM element to render the die into.
     * @param {Object} [opts]        - Optional configuration.
     * @param {boolean} [opts.success]  - Whether the roll was a success (green).
     * @param {boolean} [opts.fail]     - Whether the roll was a failure (red).
     * @param {boolean} [opts.crit]     - Whether it was a critical (gold).
     * @returns {Promise<HTMLElement>}  Resolves with the die DOM element.
     */
    function animate(diceType, finalResult, container, opts) {
        _injectStyles();

        opts = opts || {};

        return new Promise(function (resolve) {
            // Create die element
            var die = document.createElement('div');
            die.className = 'dice-element rolling';
            die.setAttribute('aria-label', 'd' + diceType + ' roll');
            die.textContent = _randomFace(diceType);

            container.appendChild(die);

            var fastDuration = ANIMATION_DURATION * FAST_PHASE_RATIO;
            var slowDuration = ANIMATION_DURATION * (1 - FAST_PHASE_RATIO);

            var startTime = Date.now();
            var fastEndTime = startTime + fastDuration;
            var totalEndTime = startTime + ANIMATION_DURATION;

            // Phase tracking
            var tickTimer = null;

            function tick() {
                var now = Date.now();

                if (now >= totalEndTime) {
                    // Done — land on final result
                    clearInterval(tickTimer);
                    _landDie(die, finalResult, opts);
                    resolve(die);
                    return;
                }

                // Display random face
                die.textContent = _randomFace(diceType);

                // Switch to slow phase
                if (now >= fastEndTime && tickTimer) {
                    clearInterval(tickTimer);
                    tickTimer = setInterval(tick, SLOW_TICK);
                }
            }

            // Start fast phase
            tickTimer = setInterval(tick, FAST_TICK);
        });
    }

    /**
     * Apply the final result to a die element with appropriate styling.
     * @param {HTMLElement} die
     * @param {number} finalResult
     * @param {Object} opts
     */
    function _landDie(die, finalResult, opts) {
        die.textContent = finalResult;
        die.className = 'dice-element landed';

        // Determine result class
        if (opts.crit) {
            die.classList.add('result-crit');
        } else if (opts.fail) {
            die.classList.add('result-fail');
        } else if (opts.success) {
            die.classList.add('result-success');
        } else {
            // Default: neutral (keep base green color)
            die.classList.add('result-success');
        }
    }

    // -------------------------------------------------------------------
    // Multiple dice animation
    // -------------------------------------------------------------------

    /**
     * Animate multiple dice simultaneously.
     *
     * @param {Array<{sides: number, result: number, success?: boolean,
     *         fail?: boolean, crit?: boolean}>} rolls
     *     Array of roll descriptors. Each must have `sides` and `result`.
     * @param {HTMLElement} container - DOM element to render dice into.
     * @returns {Promise<HTMLElement[]>} Resolves with an array of die elements.
     */
    function animateMultiple(rolls, container) {
        _injectStyles();

        if (!Array.isArray(rolls) || rolls.length === 0) {
            return Promise.resolve([]);
        }

        // Create a wrapper for grouped dice
        var wrapper = document.createElement('div');
        wrapper.className = 'dice-container';
        container.appendChild(wrapper);

        // Launch all animations simultaneously
        var promises = [];

        for (var i = 0; i < rolls.length; i++) {
            var r = rolls[i];
            var sides = r.sides || 6;
            var result = r.result || 1;
            var opts = {
                success: !!r.success,
                fail: !!r.fail,
                crit: !!r.crit
            };

            promises.push(animate(sides, result, wrapper, opts));
        }

        return Promise.all(promises);
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    return {
        animate: animate,
        animateMultiple: animateMultiple
    };
})();
