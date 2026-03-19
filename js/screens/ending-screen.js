/**
 * LATENCY - Ending / Credits Screen
 * ============================================================
 * Plays after the player reaches any of the 116 endings.
 * Displays the ending title, typewritten narration, play stats,
 * scrolling credits (including NPCs met), and navigation
 * buttons (MAIN MENU, LOAD SAVE, NEW GAME+).
 *
 * Ending #100 ("LATENCY" true ending) receives special
 * treatment: the title is replaced with the player's name,
 * buttons are locked for 30 seconds, and a unique tagline
 * appears.
 *
 * Expected params (via StateMachine transition):
 *   {
 *     endingNumber:  {number}  1-116
 *     endingId:      {string}  unique ending key
 *     endingName:    {string}  human-readable ending name
 *     narration:     {string|string[]}  ending narration text
 *     isTrueEnding:  {boolean} true for ending #100
 *   }
 *
 * Transitions:
 *   MAIN MENU  -> 'menu'
 *   LOAD SAVE  -> 'saveload'
 *   NEW GAME+  -> 'creation' (with newGamePlus flag)
 *
 * Dependencies:
 *   - window.Latency.Typewriter
 *   - window.Latency.CharacterSystem
 *   - window.Latency.NpcSystem
 *   - window.Latency.NpcsData
 *   - window.Latency.AchievementSystem
 *   - window.Latency.StateMachine
 *   - window.Latency.EventBus
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.EndingScreen = (function () {
    'use strict';

    // ---------------------------------------------------------------
    //  Constants
    // ---------------------------------------------------------------

    var TOTAL_ENDINGS = 116;
    var TRUE_ENDING_NUMBER = 100;
    var TRUE_ENDING_LOCKOUT_MS = 30000; // 30 seconds

    // ---------------------------------------------------------------
    //  Private state
    // ---------------------------------------------------------------

    var _container = null;
    var _listeners = [];
    var _typewriterCancel = null;
    var _lockoutTimer = null;

    // ---------------------------------------------------------------
    //  Helpers
    // ---------------------------------------------------------------

    function _el(tag, className, textContent) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (textContent !== undefined) el.textContent = textContent;
        return el;
    }

    function _bind(element, event, handler) {
        element.addEventListener(event, handler);
        _listeners.push({ element: element, event: event, handler: handler });
    }

    function _navigateTo(state, params) {
        if (window.Latency.StateMachine && window.Latency.StateMachine.transition) {
            var ok = window.Latency.StateMachine.transition(state, params);
            if (!ok) {
                // Fallback: force state for ending -> menu which is always valid
                window.Latency.StateMachine._forceState(state, params);
            }
            return;
        }
        if (window.Latency.ScreenManager && window.Latency.ScreenManager.show) {
            window.Latency.ScreenManager.show(state, params);
        }
    }

    // ---------------------------------------------------------------
    //  Data gathering
    // ---------------------------------------------------------------

    /**
     * Collect play-session stats from available systems.
     * Returns an object with best-effort values (zeros where
     * a system is unavailable).
     */
    function _gatherStats() {
        var char = null;
        if (window.Latency.CharacterSystem && window.Latency.CharacterSystem.getCharacter) {
            char = window.Latency.CharacterSystem.getCharacter();
        }

        var playtime = 0;
        var choicesMade = 0;
        var combatVictories = 0;
        var npcsMet = 0;
        var districtsVisited = 0;

        if (char) {
            playtime = char.playtime || 0;
            combatVictories = char.kills || 0;

            // Choices: count visited story nodes as a proxy for choices
            if (Array.isArray(char.visitedNodes)) {
                choicesMade = char.visitedNodes.length;
            } else if (char.flags) {
                // Fallback: count flags as rough choice metric
                var flagKeys = Array.isArray(char.flags) ? char.flags : Object.keys(char.flags);
                choicesMade = flagKeys.length;
            }
        }

        // NPCs met: count NPCs with non-zero relationship
        if (window.Latency.NpcSystem && window.Latency.NpcsData) {
            var npcKeys = Object.keys(window.Latency.NpcsData);
            for (var i = 0; i < npcKeys.length; i++) {
                var rel = window.Latency.NpcSystem.getRelationship(npcKeys[i]);
                if (rel !== 0) {
                    npcsMet++;
                }
            }
        }

        // Districts visited
        if (char && char.flags) {
            var flags = Array.isArray(char.flags) ? char.flags : Object.keys(char.flags);
            for (var d = 0; d < flags.length; d++) {
                var f = typeof flags[d] === 'string' ? flags[d] : '';
                if (f.indexOf('visited_') === 0 || f.indexOf('district_') === 0) {
                    districtsVisited++;
                }
            }
        }

        return {
            playtime: playtime,
            choicesMade: choicesMade,
            combatVictories: combatVictories,
            npcsMet: npcsMet,
            districtsVisited: districtsVisited
        };
    }

    /**
     * Format playtime (seconds) into a human-readable string.
     */
    function _formatPlaytime(seconds) {
        if (!seconds || seconds <= 0) return '0m';
        var h = Math.floor(seconds / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = Math.floor(seconds % 60);
        if (h > 0) return h + 'h ' + m + 'm';
        if (m > 0) return m + 'm ' + s + 's';
        return s + 's';
    }

    /**
     * Get the list of NPC names the player interacted with.
     */
    function _getMetNpcNames() {
        var names = [];
        if (!window.Latency.NpcSystem || !window.Latency.NpcsData) return names;

        var npcKeys = Object.keys(window.Latency.NpcsData);
        for (var i = 0; i < npcKeys.length; i++) {
            var rel = window.Latency.NpcSystem.getRelationship(npcKeys[i]);
            if (rel !== 0) {
                var npc = window.Latency.NpcsData[npcKeys[i]];
                if (npc && npc.name) {
                    names.push(npc.name);
                }
            }
        }
        return names;
    }

    /**
     * Get ending discovery count from AchievementSystem meta.
     */
    function _getEndingsDiscovered() {
        if (window.Latency.AchievementSystem && window.Latency.AchievementSystem.getTotalProgress) {
            // Check meta for endings
            try {
                var metaRaw = localStorage.getItem('latency_achievements_meta');
                if (metaRaw) {
                    var meta = JSON.parse(metaRaw);
                    if (meta.endingsReached) {
                        return Object.keys(meta.endingsReached).length;
                    }
                }
            } catch (e) { /* ignore */ }
        }
        return 0;
    }

    /**
     * Record this ending in the achievement meta.
     */
    function _recordEnding(endingId) {
        if (!endingId) return;
        try {
            var metaKey = 'latency_achievements_meta';
            var metaRaw = localStorage.getItem(metaKey);
            var meta = metaRaw ? JSON.parse(metaRaw) : {};
            if (!meta.endingsReached) meta.endingsReached = {};
            meta.endingsReached[endingId] = true;
            localStorage.setItem(metaKey, JSON.stringify(meta));
        } catch (e) { /* ignore */ }

        // Also emit story:node for the achievement system to pick up
        if (window.Latency.EventBus) {
            window.Latency.EventBus.emit('story:node', {
                nodeId: endingId,
                isEnding: true
            });
        }
    }

    // ---------------------------------------------------------------
    //  DOM construction
    // ---------------------------------------------------------------

    function _buildScreen(params) {
        params = params || {};

        var endingNumber = params.endingNumber || 1;
        var endingName = params.endingName || 'Unknown Ending';
        var endingId = params.endingId || 'ending_' + endingNumber;
        var narration = params.narration || 'Your story has reached its conclusion.';
        var isTrueEnding = params.isTrueEnding || (endingNumber === TRUE_ENDING_NUMBER);

        // Record this ending
        _recordEnding(endingId);

        // Mark game as completed for New Game Plus
        if (window.Latency.NewGamePlus && window.Latency.NewGamePlus.onGameCompleted) {
            window.Latency.NewGamePlus.onGameCompleted(endingId);
        }

        // Gather data
        var stats = _gatherStats();
        var endingsDiscovered = _getEndingsDiscovered();
        var metNpcs = _getMetNpcNames();

        // Get character name for true ending
        var playerName = '';
        if (window.Latency.CharacterSystem && window.Latency.CharacterSystem.getCharacter) {
            var c = window.Latency.CharacterSystem.getCharacter();
            if (c) playerName = c.name || '';
        }

        // ---- Root ----
        var frag = document.createDocumentFragment();
        var screen = _el('div', 'ending-screen');
        if (isTrueEnding) {
            screen.classList.add('ending-screen--true');
        }

        // ---- Ending Counter ----
        var counter = _el('div', 'ending-counter',
            'ENDING ' + endingNumber + '/' + TOTAL_ENDINGS +
            ' \u2014 ' + endingName);
        screen.appendChild(counter);

        // ---- Title ----
        var titleText = isTrueEnding ? (playerName || 'LATENCY') : endingName;
        var title = _el('h1', 'ending-title', titleText);
        screen.appendChild(title);

        // ---- Tagline (true ending only) ----
        if (isTrueEnding) {
            var tagline = _el('div', 'ending-tagline', 'You Already Did');
            screen.appendChild(tagline);
        }

        // ---- Separator ----
        screen.appendChild(_el('div', 'ending-separator'));

        // ---- Narration ----
        var narrationEl = _el('div', 'ending-narration');
        screen.appendChild(narrationEl);

        // ---- Separator ----
        screen.appendChild(_el('div', 'ending-separator'));

        // ---- Stats Grid ----
        var statsGrid = _el('div', 'ending-stats');

        var statItems = [
            { label: 'Playtime',          value: _formatPlaytime(stats.playtime) },
            { label: 'Choices Made',       value: String(stats.choicesMade) },
            { label: 'Combat Victories',   value: String(stats.combatVictories) },
            { label: 'NPCs Met',           value: String(stats.npcsMet) },
            { label: 'Districts Visited',  value: String(stats.districtsVisited) },
            { label: 'Endings Discovered', value: endingsDiscovered + '/' + TOTAL_ENDINGS }
        ];

        for (var s = 0; s < statItems.length; s++) {
            var stat = _el('div', 'ending-stat');
            stat.appendChild(_el('span', 'ending-stat-label', statItems[s].label));
            stat.appendChild(_el('span', 'ending-stat-value', statItems[s].value));
            statsGrid.appendChild(stat);
        }

        screen.appendChild(statsGrid);

        // ---- Credits Scroll ----
        var creditsWrapper = _el('div', 'ending-credits-wrapper');
        var credits = _el('div', 'ending-credits');

        // Build credit lines
        _addCreditHeading(credits, 'LATENCY');
        _addCreditLine(credits, 'Choose Your Destiny');
        _addCreditSpacer(credits);

        _addCreditHeading(credits, 'Created With');
        _addCreditLine(credits, 'Claude Code');
        _addCreditSpacer(credits);

        _addCreditHeading(credits, 'Music');
        _addCreditLine(credits, 'Shane Ivers');
        _addCreditDim(credits, 'silvermansound.com');
        _addCreditSpacer(credits);

        _addCreditHeading(credits, 'A Tale Of');
        _addCreditLine(credits, 'Memory, Identity, and Choice');
        _addCreditSpacer(credits);

        // NPC credits
        if (metNpcs.length > 0) {
            _addCreditHeading(credits, 'Characters Encountered');
            for (var n = 0; n < metNpcs.length; n++) {
                _addCreditLine(credits, metNpcs[n]);
            }
            _addCreditSpacer(credits);
        }

        _addCreditHeading(credits, 'Thank You For Playing');
        _addCreditSpacer(credits);
        _addCreditSpacer(credits);

        creditsWrapper.appendChild(credits);
        screen.appendChild(creditsWrapper);

        // ---- Endings Discovered ----
        var discovered = _el('div', 'ending-discovered',
            'Endings Discovered: ' + endingsDiscovered + '/' + TOTAL_ENDINGS);
        screen.appendChild(discovered);

        // ---- Action Buttons ----
        var actions = _el('div', 'ending-actions');

        var btnMenu = _el('button', 'ending-btn', 'MAIN MENU');
        btnMenu.setAttribute('type', 'button');
        btnMenu.setAttribute('data-action', 'menu');

        var btnLoad = _el('button', 'ending-btn', 'LOAD SAVE');
        btnLoad.setAttribute('type', 'button');
        btnLoad.setAttribute('data-action', 'load');

        var btnNewGame = _el('button', 'ending-btn ending-btn--primary', 'NEW GAME+');
        btnNewGame.setAttribute('type', 'button');
        btnNewGame.setAttribute('data-action', 'newgameplus');

        _bind(btnMenu, 'click', function () {
            if (this.disabled) return;
            _navigateTo('menu');
        });

        _bind(btnLoad, 'click', function () {
            if (this.disabled) return;
            _navigateTo('saveload');
        });

        _bind(btnNewGame, 'click', function () {
            if (this.disabled) return;
            if (window.Latency.NewGamePlus && window.Latency.NewGamePlus.startNewGamePlus) {
                window.Latency.NewGamePlus.startNewGamePlus();
            } else {
                _navigateTo('creation', { newGamePlus: true });
            }
        });

        actions.appendChild(btnMenu);
        actions.appendChild(btnLoad);
        actions.appendChild(btnNewGame);
        screen.appendChild(actions);

        // ---- True ending: lock buttons for 30 seconds ----
        if (isTrueEnding) {
            btnMenu.disabled = true;
            btnLoad.disabled = true;
            btnNewGame.disabled = true;

            _lockoutTimer = setTimeout(function () {
                btnMenu.disabled = false;
                btnLoad.disabled = false;
                btnNewGame.disabled = false;
                _lockoutTimer = null;
            }, TRUE_ENDING_LOCKOUT_MS);
        }

        frag.appendChild(screen);

        // ---- Typewriter narration (after DOM attach) ----
        // We need a slight delay so the element is in the DOM
        setTimeout(function () {
            if (!narrationEl || !narrationEl.parentNode) return;

            var TW = window.Latency.Typewriter;
            if (!TW) {
                // Fallback: just dump the text
                if (Array.isArray(narration)) {
                    narrationEl.innerHTML = narration.map(function (line) {
                        return '<p class="story-paragraph">' + line + '</p>';
                    }).join('');
                } else {
                    narrationEl.innerHTML = '<p class="story-paragraph">' + narration + '</p>';
                }
                return;
            }

            if (Array.isArray(narration)) {
                _typewriterCancel = TW.typeMultiple(narrationEl, narration);
            } else {
                _typewriterCancel = TW.type(narrationEl, narration);
            }
        }, 600);

        return frag;
    }

    // Credit line helpers
    function _addCreditHeading(parent, text) {
        parent.appendChild(_el('div', 'ending-credits-heading', text));
    }

    function _addCreditLine(parent, text) {
        parent.appendChild(_el('div', 'ending-credits-line', text));
    }

    function _addCreditDim(parent, text) {
        parent.appendChild(_el('div', 'ending-credits-dim', text));
    }

    function _addCreditSpacer(parent) {
        parent.appendChild(_el('div', 'ending-credits-spacer'));
    }

    // ---------------------------------------------------------------
    //  Public API (Screen contract)
    // ---------------------------------------------------------------

    return {
        /**
         * Mount the ending screen into the given container.
         * @param {HTMLElement} container - The #screen-container element.
         * @param {Object} [params] - Ending data (see header doc).
         */
        mount: function (container, params) {
            _container = container;
            _listeners = [];
            _typewriterCancel = null;
            _lockoutTimer = null;

            var dom = _buildScreen(params);
            _container.appendChild(dom);

            console.log('[EndingScreen] Mounted. Ending #' +
                ((params && params.endingNumber) || '?'));
        },

        /**
         * Unmount the ending screen, cleaning up timers and listeners.
         */
        unmount: function () {
            // Cancel typewriter
            if (_typewriterCancel) {
                _typewriterCancel();
                _typewriterCancel = null;
            }

            // Cancel lockout timer
            if (_lockoutTimer) {
                clearTimeout(_lockoutTimer);
                _lockoutTimer = null;
            }

            // Remove event listeners
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

            console.log('[EndingScreen] Unmounted.');
        }
    };
})();
