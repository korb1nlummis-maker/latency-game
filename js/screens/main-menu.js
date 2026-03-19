/**
 * LATENCY - Main Menu Screen
 * ============================================================
 * The first screen players see. Renders the ASCII title,
 * tagline, and navigation buttons. All DOM is built
 * programmatically and injected into the provided container.
 *
 * Transitions:
 *   NEW GAME     -> 'creation'
 *   LOAD GAME    -> 'saveload'
 *   SETTINGS     -> 'settings'
 *   ACHIEVEMENTS -> 'achievements'
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.MainMenu = (function () {
    'use strict';

    // --------------------------------------------------------
    // Private state
    // --------------------------------------------------------
    var _container = null;
    var _listeners = [];

    // --------------------------------------------------------
    // ASCII Art
    // --------------------------------------------------------
    var TITLE_ASCII = [
        '██╗      █████╗ ████████╗███████╗███╗   ██╗ ██████╗██╗   ██╗',
        '██║     ██╔══██╗╚══██╔══╝██╔════╝████╗  ██║██╔════╝╚██╗ ██╔╝',
        '██║     ███████║   ██║   █████╗  ██╔██╗ ██║██║      ╚████╔╝ ',
        '██║     ██╔══██║   ██║   ██╔══╝  ██║╚██╗██║██║       ╚██╔╝  ',
        '███████╗██║  ██║   ██║   ███████╗██║ ╚████║╚██████╗   ██║   ',
        '╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝ ╚═════╝   ╚═╝   '
    ].join('\n');

    var SEPARATOR_LINE = '═══════════════════════════════════════════';

    // --------------------------------------------------------
    // Menu items configuration
    // --------------------------------------------------------
    var MENU_ITEMS = [
        { id: 'new-game',     label: 'NEW GAME',     state: 'creation',     alwaysEnabled: true  },
        { id: 'continue',     label: 'CONTINUE',     state: null,           alwaysEnabled: false },
        { id: 'load-game',    label: 'LOAD GAME',    state: 'saveload',     alwaysEnabled: true  },
        { id: 'achievements', label: 'ACHIEVEMENTS', state: 'achievements', alwaysEnabled: true  },
        { id: 'settings',     label: 'SETTINGS',     state: 'settings',     alwaysEnabled: true  }
    ];

    // --------------------------------------------------------
    // Helper: check if a save exists
    // --------------------------------------------------------
    function _hasSaveData() {
        try {
            return localStorage.getItem('latency_save') !== null;
        } catch (e) {
            return false;
        }
    }

    // --------------------------------------------------------
    // Helper: create a DOM element
    // --------------------------------------------------------
    function _el(tag, className, textContent) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (textContent !== undefined) el.textContent = textContent;
        return el;
    }

    // --------------------------------------------------------
    // Helper: bind event and track for cleanup
    // --------------------------------------------------------
    function _bind(element, event, handler) {
        element.addEventListener(event, handler);
        _listeners.push({ element: element, event: event, handler: handler });
    }

    // --------------------------------------------------------
    // Build the menu DOM tree
    // --------------------------------------------------------
    function _buildMenu() {
        var frag = document.createDocumentFragment();
        var screen = _el('div', 'menu-screen');

        // --- Title block ---
        var titleBlock = _el('div', 'menu-title-block');

        var titlePre = _el('pre', 'menu-title-ascii glitch');
        titlePre.textContent = TITLE_ASCII;
        titlePre.setAttribute('data-text', TITLE_ASCII);
        titlePre.setAttribute('aria-label', 'LATENCY');
        titlePre.setAttribute('role', 'heading');
        titlePre.setAttribute('aria-level', '1');
        titleBlock.appendChild(titlePre);

        screen.appendChild(titleBlock);

        // --- Subtitle ---
        var subtitle = _el('div', 'menu-subtitle', 'CHOOSE YOUR DESTINY');
        screen.appendChild(subtitle);

        // --- Separator ---
        var sep = _el('div', 'menu-separator', SEPARATOR_LINE);
        screen.appendChild(sep);

        // --- Tagline ---
        var tagline = _el('div', 'menu-tagline',
            'In a world where death is optional, living is the hardest choice.');
        screen.appendChild(tagline);

        // --- Navigation ---
        var nav = _el('nav', 'menu-nav');
        nav.setAttribute('aria-label', 'Main menu');

        var hasSave = _hasSaveData();

        for (var i = 0; i < MENU_ITEMS.length; i++) {
            var item = MENU_ITEMS[i];
            var btn = _el('button', 'menu-btn', item.label);
            btn.setAttribute('data-menu-id', item.id);
            btn.setAttribute('type', 'button');

            // Disable CONTINUE if no save data
            if (item.id === 'continue' && !hasSave) {
                btn.disabled = true;
                btn.setAttribute('aria-disabled', 'true');
                btn.title = 'No save data found';
            }

            // Attach click handler
            if (item.state) {
                (function (targetState) {
                    _bind(btn, 'click', function () {
                        if (this.disabled) return;
                        _navigateTo(targetState);
                    });
                })(item.state);
            } else if (item.id === 'continue') {
                _bind(btn, 'click', function () {
                    if (this.disabled) return;
                    _loadMostRecentSave();
                });
            }

            // Keyboard enter support (buttons get this for free, but be explicit)
            _bind(btn, 'keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });

            nav.appendChild(btn);
        }

        screen.appendChild(nav);

        // --- Version ---
        var version = _el('div', 'menu-version', 'v0.3.0 — Phase 6');
        screen.appendChild(version);

        frag.appendChild(screen);
        return frag;
    }

    // --------------------------------------------------------
    // CONTINUE: load the most recent save
    // --------------------------------------------------------
    function _loadMostRecentSave() {
        var SM = window.Latency.SaveManager;
        if (!SM || !SM.listSaves) {
            console.warn('[MainMenu] SaveManager not available.');
            return;
        }

        var saves = SM.listSaves();
        var best = null;

        for (var i = 0; i < saves.length; i++) {
            if (saves[i].isEmpty) continue;
            if (!best || (saves[i].timestamp && saves[i].timestamp > best.timestamp)) {
                best = saves[i];
            }
        }

        if (!best) {
            console.warn('[MainMenu] No save data found to continue.');
            return;
        }

        console.log('[MainMenu] Loading most recent save from slot:', best.slotIndex);
        SM.load(best.slotIndex);
    }

    // --------------------------------------------------------
    // Navigation handler
    // --------------------------------------------------------
    function _navigateTo(state) {
        console.log('[MainMenu] Transitioning to:', state);

        // Use StateMachine if available (validates transitions and emits
        // 'screen:change' which ScreenManager listens for automatically).
        if (window.Latency.StateMachine && window.Latency.StateMachine.transition) {
            var ok = window.Latency.StateMachine.transition(state);
            if (!ok) {
                console.warn('[MainMenu] StateMachine rejected transition to:', state);
            }
            return;
        }

        // Fallback: drive ScreenManager directly (no state validation)
        if (window.Latency.ScreenManager && window.Latency.ScreenManager.show) {
            window.Latency.ScreenManager.show(state);
        }
    }

    // --------------------------------------------------------
    // Public API
    // --------------------------------------------------------
    return {
        /**
         * Mount the main menu into the given container element.
         * @param {HTMLElement} container - The #screen-container element.
         * @param {Object} [params] - Optional parameters (unused for now).
         */
        mount: function (container, params) {
            _container = container;
            _listeners = [];

            // Build and insert DOM
            var dom = _buildMenu();
            _container.appendChild(dom);

            // Focus the first enabled button for keyboard accessibility
            var firstBtn = _container.querySelector('.menu-btn:not([disabled])');
            if (firstBtn) {
                firstBtn.focus();
            }

            console.log('[MainMenu] Mounted.');
        },

        /**
         * Unmount the main menu, cleaning up event listeners and DOM.
         */
        unmount: function () {
            // Remove all tracked event listeners
            for (var i = 0; i < _listeners.length; i++) {
                var entry = _listeners[i];
                entry.element.removeEventListener(entry.event, entry.handler);
            }
            _listeners = [];

            // Clear container
            if (_container) {
                _container.innerHTML = '';
            }
            _container = null;

            console.log('[MainMenu] Unmounted.');
        }
    };
})();
