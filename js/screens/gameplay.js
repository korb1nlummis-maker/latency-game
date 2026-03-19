/**
 * LATENCY - Gameplay Screen
 * ============================================================
 * The primary game screen where the story unfolds. Features a
 * two-panel layout: narrative/choices on the left, character
 * stats on the right.
 *
 * Transitions (via header menu icons):
 *   Inventory -> 'inventory'
 *   Map       -> 'map'
 *   Skills    -> 'skills'
 *   Settings  -> 'settings'
 *   Save      -> 'saveload'
 *
 * Listens for:
 *   story:node      -> update narrative content and choices
 *   stat:change     -> refresh stat display
 *   hp:change       -> refresh HP bar
 *   stamina:change  -> refresh stamina bar
 *   faction:change  -> refresh faction reputation bars
 *   levelup         -> refresh level, HP, stamina displays
 *   trait:add       -> refresh sidebar
 *   trait:remove    -> refresh sidebar
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.Gameplay = (function () {
    'use strict';

    // --------------------------------------------------------
    // Private state
    // --------------------------------------------------------
    var _container = null;
    var _listeners = [];       // { element, event, handler } for DOM events
    var _unsubs = [];          // EventBus unsubscribe functions
    var _typewriterCancel = null;  // cancel function from Latency.Typewriter
    var _typewriterRunning = false;
    var _pendingTimers = [];       // tracked setTimeout IDs for cleanup

    // DOM references (set during mount, nulled on unmount)
    var _els = {};

    // --------------------------------------------------------
    // Constants
    // --------------------------------------------------------
    var STAT_LABELS = {
        strength:     { short: 'STR', name: 'Strength' },
        dexterity:    { short: 'DEX', name: 'Dexterity' },
        constitution: { short: 'CON', name: 'Constitution' },
        intelligence: { short: 'INT', name: 'Intelligence' },
        wisdom:       { short: 'WIS', name: 'Wisdom' },
        charisma:     { short: 'CHA', name: 'Charisma' },
        tech:         { short: 'TEC', name: 'Tech' },
        luck:         { short: 'LCK', name: 'Luck' }
    };

    var STAT_ORDER = [
        'strength', 'dexterity', 'constitution', 'intelligence',
        'wisdom', 'charisma', 'tech', 'luck'
    ];

    var FACTION_DISPLAY = {
        ironCollective: { label: 'Iron',    color: 'var(--accent-1)' },
        neonCourt:      { label: 'Neon',    color: 'var(--accent-2)' },
        circuitSaints:  { label: 'Circuit', color: 'var(--accent-3)' },
        ghostSyndicate: { label: 'Ghost',   color: 'var(--accent-4)' },
        ashenCircle:    { label: 'Ashen',   color: 'var(--text-secondary)' }
    };

    var RACE_LABELS = {
        human:   'Human',
        cyborg:  'Cyborg',
        synth:   'Synth',
        ghost:   'Ghost',
        hybrid:  'Hybrid'
    };

    var MENU_ICONS = [
        { id: 'inventory', label: 'INV',  title: 'Inventory', state: 'inventory' },
        { id: 'map',       label: 'MAP',  title: 'Map',       state: 'map' },
        { id: 'skills',    label: 'SKL',  title: 'Skills',    state: 'skills' },
        { id: 'settings',  label: 'SET',  title: 'Settings',  state: 'settings' },
        { id: 'save',      label: 'SAV',  title: 'Save/Load', state: 'saveload' }
    ];

    var TYPEWRITER_SPEED = 25; // ms per character

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
    // Helper: bind DOM event and track for cleanup
    // --------------------------------------------------------
    function _bind(element, event, handler) {
        element.addEventListener(event, handler);
        _listeners.push({ element: element, event: event, handler: handler });
    }

    // --------------------------------------------------------
    // Helper: remove listeners for elements no longer in DOM
    // --------------------------------------------------------
    function _cleanDetachedListeners() {
        _listeners = _listeners.filter(function (entry) {
            if (!document.contains(entry.element)) {
                entry.element.removeEventListener(entry.event, entry.handler);
                return false;
            }
            return true;
        });
    }

    // --------------------------------------------------------
    // Helper: subscribe to EventBus and track for cleanup
    // --------------------------------------------------------
    function _subscribe(event, handler) {
        var unsub = window.Latency.EventBus.on(event, handler);
        _unsubs.push(unsub);
    }

    // --------------------------------------------------------
    // Helper: navigate via StateMachine
    // --------------------------------------------------------
    function _navigateTo(state) {
        if (window.Latency.StateMachine && window.Latency.StateMachine.transition) {
            var ok = window.Latency.StateMachine.transition(state);
            if (!ok) {
                console.warn('[Gameplay] StateMachine rejected transition to:', state);
            }
            return;
        }
        if (window.Latency.ScreenManager && window.Latency.ScreenManager.show) {
            window.Latency.ScreenManager.show(state);
        }
    }

    // --------------------------------------------------------
    // Helper: get character data safely
    // --------------------------------------------------------
    function _getChar() {
        if (window.Latency.CharacterSystem) {
            return window.Latency.CharacterSystem.getCharacter();
        }
        return null;
    }

    // --------------------------------------------------------
    // Helper: stat modifier string e.g. "(+2)" or "(-1)"
    // --------------------------------------------------------
    function _modStr(statName) {
        var mod = 0;
        if (window.Latency.CharacterSystem) {
            mod = window.Latency.CharacterSystem.getStatModifier(statName);
        }
        if (mod >= 0) return '(+' + mod + ')';
        return '(' + mod + ')';
    }

    // --------------------------------------------------------
    // Helper: build a bar string using block characters
    // --------------------------------------------------------
    function _buildBar(current, max, width) {
        if (max <= 0) return '░'.repeat(width);
        var filled = Math.round((current / max) * width);
        if (filled < 0) filled = 0;
        if (filled > width) filled = width;
        return '█'.repeat(filled) + '░'.repeat(width - filled);
    }

    // --------------------------------------------------------
    // Helper: faction bar (range -100 to +100, bar shows magnitude)
    // --------------------------------------------------------
    function _buildFactionBar(value) {
        var absVal = Math.abs(value);
        var filled = Math.round((absVal / 100) * 4);
        return '█'.repeat(filled) + '░'.repeat(4 - filled);
    }

    // --------------------------------------------------------
    // Build: Header bar
    // --------------------------------------------------------
    function _buildHeader() {
        var header = _el('div', 'gp-header');

        var locationTitle = _el('div', 'gp-location-title', 'Unknown Location');
        _els.locationTitle = locationTitle;
        header.appendChild(locationTitle);

        var menuBar = _el('div', 'gp-menu-bar');
        for (var i = 0; i < MENU_ICONS.length; i++) {
            var icon = MENU_ICONS[i];
            var btn = _el('button', 'gp-menu-icon', icon.label);
            btn.setAttribute('title', icon.title);
            btn.setAttribute('type', 'button');
            btn.setAttribute('data-menu-id', icon.id);
            (function (targetState) {
                _bind(btn, 'click', function () {
                    _navigateTo(targetState);
                });
            })(icon.state);
            menuBar.appendChild(btn);
        }
        header.appendChild(menuBar);

        return header;
    }

    // --------------------------------------------------------
    // Build: Narrative panel (left side)
    // --------------------------------------------------------
    function _buildNarrativePanel() {
        var panel = _el('div', 'gp-narrative-panel');

        // ASCII art area
        var artArea = _el('pre', 'gp-ascii-art');
        artArea.setAttribute('aria-hidden', 'true');
        _els.asciiArt = artArea;
        panel.appendChild(artArea);

        // Narrative text area (scrollable)
        var narrativeArea = _el('div', 'gp-narrative-text');
        _els.narrativeText = narrativeArea;
        panel.appendChild(narrativeArea);

        // Choices area
        var choicesArea = _el('div', 'gp-choices');
        _els.choices = choicesArea;
        panel.appendChild(choicesArea);

        return panel;
    }

    // --------------------------------------------------------
    // Build: Stats sidebar (right side)
    // --------------------------------------------------------
    function _buildStatsSidebar() {
        var sidebar = _el('div', 'gp-stats-sidebar');

        // Character info block
        var infoBlock = _el('div', 'gp-char-info');

        var nameEl = _el('div', 'gp-char-name', '---');
        _els.charName = nameEl;
        infoBlock.appendChild(nameEl);

        var raceEl = _el('div', 'gp-char-detail');
        raceEl.innerHTML = '<span class="gp-label">Race:</span> <span class="gp-value gp-race-value">---</span>';
        _els.charRace = raceEl.querySelector('.gp-race-value');
        infoBlock.appendChild(raceEl);

        var levelEl = _el('div', 'gp-char-detail');
        levelEl.innerHTML = '<span class="gp-label">Level:</span> <span class="gp-value gp-level-value">1</span>';
        _els.charLevel = levelEl.querySelector('.gp-level-value');
        infoBlock.appendChild(levelEl);

        sidebar.appendChild(infoBlock);

        // HP bar
        var hpBlock = _el('div', 'gp-bar-block gp-hp-block');
        hpBlock.innerHTML = '<span class="gp-label">HP:</span> <span class="gp-bar gp-hp-bar">██████░░</span> <span class="gp-bar-numbers gp-hp-numbers">0/0</span>';
        _els.hpBar = hpBlock.querySelector('.gp-hp-bar');
        _els.hpNumbers = hpBlock.querySelector('.gp-hp-numbers');
        sidebar.appendChild(hpBlock);

        // Stamina bar
        var staBlock = _el('div', 'gp-bar-block gp-sta-block');
        staBlock.innerHTML = '<span class="gp-label">STA:</span> <span class="gp-bar gp-sta-bar">██████░░</span> <span class="gp-bar-numbers gp-sta-numbers">0/0</span>';
        _els.staBar = staBlock.querySelector('.gp-sta-bar');
        _els.staNumbers = staBlock.querySelector('.gp-sta-numbers');
        sidebar.appendChild(staBlock);

        // Separator
        sidebar.appendChild(_el('div', 'gp-sidebar-sep', '────────────────'));

        // Stats block
        var statsBlock = _el('div', 'gp-stats-block');
        _els.statRows = {};
        for (var i = 0; i < STAT_ORDER.length; i++) {
            var key = STAT_ORDER[i];
            var label = STAT_LABELS[key];
            var row = _el('div', 'gp-stat-row');
            row.innerHTML = '<span class="gp-stat-label">' + label.short + ':</span> <span class="gp-stat-value">10</span> <span class="gp-stat-mod">(+0)</span>';
            _els.statRows[key] = {
                value: row.querySelector('.gp-stat-value'),
                mod: row.querySelector('.gp-stat-mod')
            };
            statsBlock.appendChild(row);
        }
        sidebar.appendChild(statsBlock);

        // Separator
        sidebar.appendChild(_el('div', 'gp-sidebar-sep', '────────────────'));

        // Credits & Job
        var creditsEl = _el('div', 'gp-char-detail');
        creditsEl.innerHTML = '<span class="gp-label">Credits:</span> <span class="gp-value gp-credits-value">0</span>';
        _els.credits = creditsEl.querySelector('.gp-credits-value');
        sidebar.appendChild(creditsEl);

        var jobEl = _el('div', 'gp-char-detail');
        jobEl.innerHTML = '<span class="gp-label">Job:</span> <span class="gp-value gp-job-value">None</span>';
        _els.job = jobEl.querySelector('.gp-job-value');
        sidebar.appendChild(jobEl);

        // Separator
        sidebar.appendChild(_el('div', 'gp-sidebar-sep', '────────────────'));

        // Faction reputation bars
        var factionsBlock = _el('div', 'gp-factions-block');
        _els.factionRows = {};
        var factionKeys = Object.keys(FACTION_DISPLAY);
        for (var f = 0; f < factionKeys.length; f++) {
            var fKey = factionKeys[f];
            var fInfo = FACTION_DISPLAY[fKey];
            var fRow = _el('div', 'gp-faction-row');
            fRow.setAttribute('data-faction', fKey);
            fRow.innerHTML = '<span class="gp-faction-label">[' + fInfo.label + ']</span> <span class="gp-faction-bar" style="color:' + fInfo.color + '">░░░░</span> <span class="gp-faction-value">0</span>';
            _els.factionRows[fKey] = {
                bar: fRow.querySelector('.gp-faction-bar'),
                value: fRow.querySelector('.gp-faction-value')
            };
            factionsBlock.appendChild(fRow);
        }
        sidebar.appendChild(factionsBlock);

        return sidebar;
    }

    // --------------------------------------------------------
    // Build: Mute button (bottom-right corner)
    // --------------------------------------------------------
    function _buildMuteButton() {
        var musicControls = _el('div', 'gp-music-controls');

        var muteBtn = _el('button', 'gp-mute-btn');
        muteBtn.setAttribute('type', 'button');
        muteBtn.textContent = window.Latency.MusicManager && window.Latency.MusicManager.isMuted() ? 'UNMUTE' : 'MUTE';
        _bind(muteBtn, 'click', function (e) {
            e.stopPropagation();
            if (window.Latency.MusicManager) {
                window.Latency.MusicManager.toggleMute();
                muteBtn.textContent = window.Latency.MusicManager.isMuted() ? 'UNMUTE' : 'MUTE';
            }
        });
        musicControls.appendChild(muteBtn);

        return musicControls;
    }

    // --------------------------------------------------------
    // Refresh: all sidebar stats from character data
    // --------------------------------------------------------
    function _refreshSidebar() {
        var char = _getChar();
        if (!char) return;

        // Name, race, level
        if (_els.charName) _els.charName.textContent = char.name || '---';
        if (_els.charRace) _els.charRace.textContent = RACE_LABELS[char.race] || char.race || '---';
        if (_els.charLevel) _els.charLevel.textContent = String(char.level || 1);

        // HP
        _refreshHpBar(char);

        // Stamina
        _refreshStaminaBar(char);

        // Stats
        for (var i = 0; i < STAT_ORDER.length; i++) {
            var key = STAT_ORDER[i];
            var row = _els.statRows[key];
            if (row && char.stats) {
                var val = char.stats[key] || 10;
                row.value.textContent = String(val);
                row.mod.textContent = _modStr(key);
            }
        }

        // Credits
        if (_els.credits && char.inventory) {
            _els.credits.textContent = String(char.inventory.currency || 0);
        }

        // Job
        if (_els.job) {
            _els.job.textContent = char.job || 'None';
        }

        // Factions
        _refreshFactions(char);
    }

    function _refreshHpBar(char) {
        if (!char) char = _getChar();
        if (!char || !char.derived) return;

        var current = char.derived.currentHp;
        var max = char.derived.maxHp;
        var barWidth = 7;

        if (_els.hpBar) {
            _els.hpBar.textContent = _buildBar(current, max, barWidth);

            // Color based on percentage
            var pct = max > 0 ? current / max : 0;
            _els.hpBar.classList.remove('gp-bar-high', 'gp-bar-mid', 'gp-bar-low');
            if (pct > 0.6) {
                _els.hpBar.classList.add('gp-bar-high');
            } else if (pct > 0.3) {
                _els.hpBar.classList.add('gp-bar-mid');
            } else {
                _els.hpBar.classList.add('gp-bar-low');
            }
        }
        if (_els.hpNumbers) {
            _els.hpNumbers.textContent = current + '/' + max;
        }
    }

    function _refreshStaminaBar(char) {
        if (!char) char = _getChar();
        if (!char || !char.derived) return;

        var current = char.derived.currentStamina;
        var max = char.derived.maxStamina;
        var barWidth = 7;

        if (_els.staBar) {
            _els.staBar.textContent = _buildBar(current, max, barWidth);
        }
        if (_els.staNumbers) {
            _els.staNumbers.textContent = current + '/' + max;
        }
    }

    function _refreshFactions(char) {
        if (!char) char = _getChar();
        if (!char || !char.reputation) return;

        var factionKeys = Object.keys(FACTION_DISPLAY);
        for (var f = 0; f < factionKeys.length; f++) {
            var fKey = factionKeys[f];
            var row = _els.factionRows[fKey];
            if (row) {
                var val = char.reputation[fKey] || 0;
                row.bar.textContent = _buildFactionBar(val);
                row.value.textContent = String(val);
            }
        }
    }

    // --------------------------------------------------------
    // Typewriter effect (delegates to Latency.Typewriter)
    // --------------------------------------------------------
    function _cancelTypewriter() {
        if (_typewriterCancel) {
            _typewriterCancel();
            _typewriterCancel = null;
        }
        _typewriterRunning = false;
    }

    function _typewrite(el, text, onComplete) {
        _cancelTypewriter();
        _typewriterRunning = true;

        if (window.Latency.Typewriter) {
            _typewriterCancel = window.Latency.Typewriter.type(el, text, function () {
                _typewriterRunning = false;
                _typewriterCancel = null;
                if (onComplete) onComplete();
            });
        } else {
            el.textContent = text;
            _typewriterRunning = false;
            if (onComplete) onComplete();
        }
    }

    function _skipTypewriter() {
        if (_typewriterRunning && _typewriterCancel) {
            _cancelTypewriter();
            // Instantly show full text
            var el = _els.narrativeText;
            if (el && el.getAttribute('data-full-text')) {
                el.textContent = el.getAttribute('data-full-text');
                el.scrollTop = el.scrollHeight;
            }
        }
    }

    // --------------------------------------------------------
    // Story node rendering
    // --------------------------------------------------------
    function _renderStoryNode(data) {
        if (!data) return;

        // The event payload is { nodeId, node: { text, choices, ... } }
        var node = data.node || data;
        var raw = node.raw || {};

        // Update location title
        if (_els.locationTitle) {
            _els.locationTitle.textContent = raw.title || raw.location || node.id || 'UNKNOWN LOCATION';
        }

        // Update ASCII art
        if (_els.asciiArt) {
            _els.asciiArt.textContent = '';
            _els.asciiArt.style.display = 'none';
            if (node.ascii || raw.ascii) {
                var artPath = node.ascii || raw.ascii;
                if (window.Latency.AssetLoader && typeof artPath === 'string') {
                    window.Latency.AssetLoader.loadAsciiArt(artPath).then(function(art) {
                        if (_els.asciiArt) {
                            _els.asciiArt.textContent = art;
                            _els.asciiArt.style.display = 'block';
                        }
                    }).catch(function() {});
                }
            }
        }

        // Clear existing choices while text types
        if (_els.choices) {
            _els.choices.innerHTML = '';
        }

        // Build narrative text from processed text array
        var textContent = '';
        if (Array.isArray(node.text)) {
            textContent = node.text.join('\n\n');
        } else if (typeof node.text === 'string') {
            textContent = node.text;
        }

        // Typewriter the narrative text
        if (_els.narrativeText && textContent) {
            _els.narrativeText.setAttribute('data-full-text', textContent);
            _typewrite(_els.narrativeText, textContent, function () {
                _renderChoices(node.choices || []);
            });
        } else if (node.choices) {
            _renderChoices(node.choices);
        }
    }

    // --------------------------------------------------------
    // Choice rendering
    // --------------------------------------------------------
    function _renderChoices(choices) {
        if (!_els.choices) return;

        // Clean listeners pointing to detached DOM nodes (old choice buttons, etc.)
        _cleanDetachedListeners();

        _els.choices.innerHTML = '';

        if (!choices || choices.length === 0) return;

        for (var i = 0; i < choices.length; i++) {
            var choice = choices[i];
            var btn = _el('button', 'gp-choice-btn');
            btn.setAttribute('type', 'button');

            // Build choice label
            var label = '';

            // Stat check prefix
            if (choice.statCheck) {
                var statLabel = STAT_LABELS[choice.statCheck.stat]
                    ? STAT_LABELS[choice.statCheck.stat].short
                    : choice.statCheck.stat.toUpperCase();
                var dc = choice.statCheck.dc || 0;
                label = '[' + statLabel + ' ' + dc + '] ';
                btn.classList.add('gp-choice-stat-check');
                btn.setAttribute('data-stat', choice.statCheck.stat);
            }

            label += choice.text || 'Continue';
            btn.textContent = label;

            // Check if choice is available
            // Note: stat checks are always attemptable (d20 roll system),
            // so we only disable based on narrative conditions.
            var available = true;
            if (choice.condition === false) {
                available = false;
            }

            // Hidden choices (conditions met but marked hidden)
            if (choice.hidden && available) {
                btn.classList.add('gp-choice-hidden');
            }

            // Unavailable choices
            if (!available) {
                btn.classList.add('gp-choice-unavailable');
                btn.disabled = true;
            }

            // Click handler
            if (available) {
                (function (choiceData, choiceIndex) {
                    _bind(btn, 'click', function () {
                        if (window.Latency.Narrative && window.Latency.Narrative.makeChoice) {
                            window.Latency.Narrative.makeChoice(choiceIndex, choiceData);
                        } else {
                            // Fallback: emit an event
                            window.Latency.EventBus.emit('choice:made', {
                                index: choiceIndex,
                                choice: choiceData
                            });
                        }
                    });
                })(choice, i);
            }

            _els.choices.appendChild(btn);
        }
    }

    // --------------------------------------------------------
    // Event handlers
    // --------------------------------------------------------
    function _onStoryNode(data) {
        _renderStoryNode(data);
        _refreshSidebar();
    }

    function _onStatChange() {
        _refreshSidebar();
    }

    function _onHpChange() {
        _refreshHpBar();
    }

    function _onStaminaChange() {
        _refreshStaminaBar();
    }

    function _onFactionChange() {
        _refreshFactions();
    }

    function _onLevelUp() {
        _refreshSidebar();
    }

    function _onTraitChange() {
        _refreshSidebar();
    }

    // --------------------------------------------------------
    // Public API
    // --------------------------------------------------------
    return {
        /**
         * Mount the gameplay screen into the given container.
         * @param {HTMLElement} container - The #screen-container element.
         * @param {Object} [params] - Optional parameters.
         */
        mount: function (container, params) {
            _container = container;
            _listeners = [];
            _unsubs = [];
            _els = {};

            // Build the screen layout
            var screen = _el('div', 'gameplay-screen');

            // Header
            screen.appendChild(_buildHeader());

            // Main content area (two-panel)
            var mainContent = _el('div', 'gp-main-content');

            // Left: narrative panel
            mainContent.appendChild(_buildNarrativePanel());

            // Right: stats sidebar
            mainContent.appendChild(_buildStatsSidebar());

            screen.appendChild(mainContent);

            // Mute button (bottom-right)
            screen.appendChild(_buildMuteButton());

            _container.appendChild(screen);

            // Allow clicking narrative area to skip typewriter
            _bind(_els.narrativeText, 'click', function () {
                _skipTypewriter();
            });

            // Subscribe to EventBus events
            _subscribe('story:node', _onStoryNode);
            _subscribe('stat:change', _onStatChange);
            _subscribe('hp:change', _onHpChange);
            _subscribe('stamina:change', _onStaminaChange);
            _subscribe('faction:change', _onFactionChange);
            _subscribe('levelup', _onLevelUp);
            _subscribe('trait:add', _onTraitChange);
            _subscribe('trait:remove', _onTraitChange);

            // Initial sidebar populate from current character data
            _refreshSidebar();

            // Load the current story node
            var nodeId = null;

            // Check params first (from character creation)
            if (params && params.nodeId) {
                nodeId = params.nodeId;
            }

            // Then check character's current node
            if (!nodeId) {
                var char = window.Latency.CharacterSystem
                    ? window.Latency.CharacterSystem.getCharacter()
                    : null;
                if (char && char.currentNodeId) {
                    nodeId = char.currentNodeId;
                }
            }

            // Default to prologue start
            if (!nodeId) {
                nodeId = 'shared.prologue.node_001';
            }

            if (window.Latency.Narrative && window.Latency.Narrative.loadNode) {
                // Small delay ensures DOM is fully settled and event listeners are active
                var _loadTimerId = setTimeout(function() {
                    window.Latency.Narrative.loadNode(nodeId).catch(function(err) {
                        console.error('[Gameplay] Failed to load node:', err.message);
                        if (_els.narrativeText) {
                            _els.narrativeText.textContent = 'Error loading story: ' + err.message;
                        }
                    });
                }, 100);
                _pendingTimers.push(_loadTimerId);
            } else {
                if (_els.narrativeText) {
                    _els.narrativeText.textContent = 'Awaiting narrative data...';
                }
                if (_els.locationTitle) {
                    _els.locationTitle.textContent = 'SYSTEM BOOT';
                }
            }

            console.log('[Gameplay] Mounted.');
        },

        /**
         * Unmount the gameplay screen, cleaning up event listeners and DOM.
         */
        unmount: function () {
            // Cancel typewriter
            _cancelTypewriter();

            // Clear pending timers
            for (var t = 0; t < _pendingTimers.length; t++) {
                clearTimeout(_pendingTimers[t]);
            }
            _pendingTimers = [];

            // Remove DOM event listeners
            for (var i = 0; i < _listeners.length; i++) {
                var entry = _listeners[i];
                entry.element.removeEventListener(entry.event, entry.handler);
            }
            _listeners = [];

            // Unsubscribe from EventBus
            for (var j = 0; j < _unsubs.length; j++) {
                _unsubs[j]();
            }
            _unsubs = [];

            // Clear DOM references
            _els = {};

            // Clear container
            if (_container) {
                _container.innerHTML = '';
            }
            _container = null;

            console.log('[Gameplay] Unmounted.');
        }
    };
})();
