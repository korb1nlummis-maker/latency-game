/**
 * LATENCY - Loading Screen
 * ============================================================
 * A brief interstitial shown between major transitions:
 *   character creation -> cutscene
 *   cutscene -> gameplay
 *   chapter transitions
 *
 * Displays an ASCII-art loading bar, rotating lore tips, and
 * a terminal-style aesthetic matching the rest of the game.
 *
 * Auto-transitions to the next screen after a minimum dwell
 * time (2 seconds) or when the caller signals readiness.
 *
 * Usage:
 *   Latency.ScreenManager.show('loading', {
 *       next: 'gameplay',          // required: screen to go to after loading
 *       nextParams: { ... },       // optional: params for the next screen
 *       minDuration: 2000,         // optional: minimum ms to display (default 2000)
 *   });
 *
 * Depends on: Latency.EventBus, Latency.ScreenManager
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.LoadingScreen = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------

    /** Total width of the progress bar in characters. */
    var BAR_WIDTH = 32;

    /** How often the bar visually updates (ms). */
    var TICK_INTERVAL = 60;

    /** How often lore tips rotate (ms). */
    var TIP_ROTATE_INTERVAL = 2000;

    /** Default minimum display time (ms). */
    var DEFAULT_MIN_DURATION = 2000;

    /** Unicode characters for the progress bar. */
    var CHAR_FILLED = '\u2588';   // █
    var CHAR_EMPTY  = '\u2591';   // ░

    // -------------------------------------------------------------------
    // Lore tips
    // -------------------------------------------------------------------

    var LORE_TIPS = [
        'Memory stacks were invented in 2186 by Dr. Yuri Volkov.',
        'The Cloud Towers house the wealthiest 0.1% of the population.',
        'Orcs make up 60% of the city\'s manual labor force.',
        'The Ghost Syndicate has operatives in every district.',
        'Stack compatibility varies by race \u2014 some reject the technology entirely.',
        'The Ashen Circle believes death is liberation, not an ending.',
        'The Undercity stretches seventeen levels below the surface.',
        'Elves were the first non-human race to pass the Turing Accord.',
        'Dwarven rune-forging produces the most durable cybernetic implants.',
        'The Neon Bazaar never closes \u2014 it has operated for 93 consecutive years.',
        'Halfling couriers can navigate the Pipe Networks faster than any drone.',
        'Tiefling infernal heritage makes them naturally resistant to stack corruption.',
        'The Magistrate\'s personal guard has not been seen in public since 2241.',
        'Every citizen is assigned a Social Efficiency Score at birth.',
        'Gnome engineers designed 78% of the city\'s automated defense grid.',
        'Human-orc hybrids are classified as "anomalous" by the Bureau of Identity.',
        'Dragonborn thermal regulation lets them survive the Ashlands without gear.',
        'The Last Frequency is a pirate broadcast that no one has been able to trace.',
        'Stack wipes are punishable by permanent exile to the Outer Wastes.',
        'The Lattice \u2014 the city\'s AI overseer \u2014 has been online for 112 years without reboot.',
        'Rumors persist of a hidden 18th sublevel beneath the Undercity.',
    ];

    // -------------------------------------------------------------------
    // Internal state
    // -------------------------------------------------------------------

    var _container  = null;
    var _tickTimer  = null;
    var _tipTimer   = null;
    var _autoTimer  = null;
    var _progress   = 0;          // 0 – 100
    var _barEl      = null;
    var _pctEl      = null;
    var _tipEl      = null;
    var _tipIndex   = 0;
    var _nextScreen = null;
    var _nextParams = null;

    // -------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------

    /**
     * Shuffle an array in-place (Fisher-Yates).
     */
    function shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    /**
     * Build the ASCII progress bar string: [████████░░░░░░░░]
     */
    function renderBar(pct) {
        var filled = Math.round((pct / 100) * BAR_WIDTH);
        var empty  = BAR_WIDTH - filled;
        return '[' +
            repeat(CHAR_FILLED, filled) +
            repeat(CHAR_EMPTY, empty) +
            ']';
    }

    function repeat(ch, n) {
        var s = '';
        for (var i = 0; i < n; i++) s += ch;
        return s;
    }

    /**
     * Advance the progress bar smoothly towards 100%.
     */
    function tick() {
        if (_progress < 100) {
            // Ease-out: big jumps early, smaller near the end
            var remaining = 100 - _progress;
            var step = Math.max(1, Math.floor(remaining * 0.08) + Math.floor(Math.random() * 3));
            _progress = Math.min(100, _progress + step);
        }
        if (_barEl) _barEl.textContent = renderBar(_progress);
        if (_pctEl) _pctEl.textContent = _progress + '%';
    }

    /**
     * Rotate to the next lore tip with a fade effect.
     */
    function rotateTip() {
        if (!_tipEl) return;
        _tipEl.classList.add('loading-tip--fade');
        setTimeout(function () {
            _tipIndex = (_tipIndex + 1) % LORE_TIPS.length;
            _tipEl.textContent = '> ' + LORE_TIPS[_tipIndex];
            _tipEl.classList.remove('loading-tip--fade');
        }, 250);
    }

    /**
     * Clean up all timers.
     */
    function clearTimers() {
        if (_tickTimer) { clearInterval(_tickTimer); _tickTimer = null; }
        if (_tipTimer)  { clearInterval(_tipTimer);  _tipTimer  = null; }
        if (_autoTimer) { clearTimeout(_autoTimer);  _autoTimer = null; }
    }

    /**
     * Navigate to the next screen.
     */
    function advance() {
        if (!_nextScreen) return;
        var target = _nextScreen;
        var params = _nextParams;
        _nextScreen = null;
        _nextParams = null;

        // Force bar to 100% visually before leaving
        _progress = 100;
        tick();

        setTimeout(function () {
            window.Latency.ScreenManager.show(target, params);
        }, 200);
    }

    // -------------------------------------------------------------------
    // Screen contract: mount / unmount
    // -------------------------------------------------------------------

    /**
     * Mount the loading screen.
     *
     * @param {HTMLElement} container
     * @param {Object}      params
     * @param {string}      params.next          - Screen name to transition to.
     * @param {*}           [params.nextParams]  - Params forwarded to the next screen.
     * @param {number}      [params.minDuration] - Minimum display time in ms.
     */
    function mount(container, params) {
        _container  = container;
        params      = params || {};
        _nextScreen = params.next || null;
        _nextParams = params.nextParams || null;
        _progress   = 0;
        _tipIndex   = Math.floor(Math.random() * LORE_TIPS.length);

        // Shuffle tips so each load feels different
        shuffle(LORE_TIPS);

        var minDuration = (typeof params.minDuration === 'number')
            ? params.minDuration
            : DEFAULT_MIN_DURATION;

        // --- Build DOM ------------------------------------------------

        var screen = document.createElement('div');
        screen.className = 'screen loading-screen active';

        // Terminal header
        var header = document.createElement('div');
        header.className = 'loading-header';
        header.innerHTML =
            '<span class="loading-prompt">[SYS]</span> ' +
            'Initializing subsystems...';
        screen.appendChild(header);

        // Decorative lines
        var decor = document.createElement('pre');
        decor.className = 'loading-decor';
        decor.textContent =
            '╔══════════════════════════════════════════╗\n' +
            '║  LATENCY v2.47.1  //  STACK RUNTIME     ║\n' +
            '║  Kernel: NeuroLattice 8.3               ║\n' +
            '║  Status: LOADING...                     ║\n' +
            '╚══════════════════════════════════════════╝';
        screen.appendChild(decor);

        // Progress section
        var progressWrap = document.createElement('div');
        progressWrap.className = 'loading-progress';

        _barEl = document.createElement('span');
        _barEl.className = 'loading-bar';
        _barEl.textContent = renderBar(0);

        _pctEl = document.createElement('span');
        _pctEl.className = 'loading-pct';
        _pctEl.textContent = '0%';

        progressWrap.appendChild(_barEl);
        progressWrap.appendChild(document.createTextNode(' '));
        progressWrap.appendChild(_pctEl);
        screen.appendChild(progressWrap);

        // Lore tip
        _tipEl = document.createElement('div');
        _tipEl.className = 'loading-tip';
        _tipEl.textContent = '> ' + LORE_TIPS[_tipIndex];
        screen.appendChild(_tipEl);

        // Blinking cursor line
        var cursor = document.createElement('div');
        cursor.className = 'loading-cursor';
        cursor.innerHTML = '<span class="blink">_</span>';
        screen.appendChild(cursor);

        container.appendChild(screen);

        // --- Timers ---------------------------------------------------

        _tickTimer = setInterval(tick, TICK_INTERVAL);
        _tipTimer  = setInterval(rotateTip, TIP_ROTATE_INTERVAL);

        // Auto-advance after minimum duration
        if (_nextScreen) {
            _autoTimer = setTimeout(function () {
                advance();
            }, minDuration);
        }

        // Also listen for an explicit 'loading:complete' event
        window.Latency.EventBus.on('loading:complete', advance);
    }

    /**
     * Unmount the loading screen and clean up.
     */
    function unmount() {
        clearTimers();
        window.Latency.EventBus.off('loading:complete', advance);

        _barEl      = null;
        _pctEl      = null;
        _tipEl      = null;
        _container  = null;
        _nextScreen = null;
        _nextParams = null;
        _progress   = 0;
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    return {
        mount:   mount,
        unmount: unmount
    };
})();
