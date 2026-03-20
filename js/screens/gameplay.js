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
 *   npc:relationship -> refresh contacts panel
 *   npc:tier_change  -> refresh contacts panel
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
    var _lastDisplayedNodeId = null; // Track last displayed node to avoid re-typing on remount

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
        { id: 'journal',   label: 'JNL',  title: 'Journal',   state: 'journal' },
        { id: 'map',       label: 'MAP',  title: 'Map',       state: 'map' },
        { id: 'skills',    label: 'SKL',  title: 'Skills',    state: 'skills' },
        { id: 'settings',  label: 'SET',  title: 'Settings',  state: 'settings' },
        { id: 'save',      label: 'SAV',  title: 'Save/Load', state: 'saveload' }
    ];

    var TYPEWRITER_SPEED = 25; // ms per character

    var CONTACTS_MAX_VISIBLE = 8;

    var TIER_DISPLAY = {
        hostile:    { label: 'HOSTILE',    color: 'var(--accent-3)' },
        unfriendly: { label: 'UNFRIENDLY', color: 'var(--accent-1)' },
        neutral:    { label: 'NEUTRAL',    color: 'var(--text-dim)' },
        friendly:   { label: 'FRIENDLY',   color: 'var(--text-primary)' },
        romantic:   { label: 'ROMANTIC',   color: 'var(--accent-2)' }
    };

    var LOCATION_LABELS = {
        lower_slums:        'Lower Slums',
        the_foundry:        'The Foundry',
        the_spire:          'The Spire',
        deep_net_cafe:      'Deep Net Cafe',
        the_ossuary:        'The Ossuary',
        observatory:        'Observatory',
        upper_slums:        'Upper Slums',
        scrap_yards:        'Scrap Yards',
        arena_district:     'Arena District',
        neon_strip:         'Neon Strip',
        corporate_spires:   'Corporate Spires',
        black_market_bazaar:'Black Market',
        stack_clinic:       'Stack Clinic',
        transit_hub:        'Transit Hub',
        sewer_network:      'Sewer Network',
        senate_hall:        'Senate Hall'
    };

    // District color coding for minimap
    var DISTRICT_COLORS = {
        highcity:    '#ffd700',  // gold
        midcity:     '#00e5ff',  // cyan
        undercity:   '#ff9100',  // orange
        underground: '#e040fb'   // magenta
    };

    var MINIMAP_W = 200;
    var MINIMAP_H = 150;
    var _minimapAnimFrame = null;

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
    // Minimap: helpers
    // --------------------------------------------------------

    function _getMinimapCurrentId() {
        var ch = _getChar();
        return ch ? ch.currentNodeId : null;
    }

    function _isMinimapDiscovered(locId) {
        var ch = _getChar();
        if (!ch) return false;
        var loc = window.Latency.Locations[locId];
        if (!loc) return false;
        if (!loc.discoverable) return true;
        return ch.visitedNodes && ch.visitedNodes.indexOf(locId) !== -1;
    }

    function _gatherMinimapNodes() {
        var locs = window.Latency.Locations;
        if (!locs) return { nodes: {}, edges: [] };
        var currentId = _getMinimapCurrentId();
        if (!currentId || !locs[currentId]) return { nodes: {}, edges: [] };

        var nodes = {};
        var edges = [];
        var edgeSet = {};

        function addEdge(a, b) {
            var key = a < b ? a + '|' + b : b + '|' + a;
            if (!edgeSet[key]) { edgeSet[key] = true; edges.push([a, b]); }
        }

        nodes[currentId] = { loc: locs[currentId], depth: 0 };
        var conns1 = locs[currentId].connections || [];
        for (var i = 0; i < conns1.length; i++) {
            var id1 = conns1[i];
            if (!locs[id1]) continue;
            if (!nodes[id1]) nodes[id1] = { loc: locs[id1], depth: 1 };
            addEdge(currentId, id1);
        }
        for (var j = 0; j < conns1.length; j++) {
            var mid = conns1[j];
            if (!locs[mid]) continue;
            var conns2 = locs[mid].connections || [];
            for (var k = 0; k < conns2.length; k++) {
                var id2 = conns2[k];
                if (!locs[id2]) continue;
                if (!nodes[id2]) nodes[id2] = { loc: locs[id2], depth: 2 };
                addEdge(mid, id2);
            }
        }
        return { nodes: nodes, edges: edges };
    }

    function _layoutMinimapNodes(data) {
        var positions = {};
        var nodeIds = Object.keys(data.nodes);
        if (nodeIds.length === 0) return positions;
        var cx = MINIMAP_W / 2;
        var cy = MINIMAP_H / 2;
        var byDepth = { 0: [], 1: [], 2: [] };
        for (var i = 0; i < nodeIds.length; i++) {
            var d = data.nodes[nodeIds[i]].depth;
            if (!byDepth[d]) byDepth[d] = [];
            byDepth[d].push(nodeIds[i]);
        }
        for (var c = 0; c < byDepth[0].length; c++) {
            positions[byDepth[0][c]] = { x: cx, y: cy };
        }
        function placeRing(ids, radius) {
            var count = ids.length;
            if (count === 0) return;
            var step = (2 * Math.PI) / count;
            var start = -Math.PI / 2;
            for (var r = 0; r < count; r++) {
                var angle = start + r * step;
                positions[ids[r]] = {
                    x: cx + Math.cos(angle) * radius,
                    y: cy + Math.sin(angle) * radius
                };
            }
        }
        placeRing(byDepth[1] || [], 45);
        placeRing(byDepth[2] || [], 68);
        return positions;
    }

    function _hexToRgba(hex, alpha) {
        hex = hex.replace('#', '');
        if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        var rv = parseInt(hex.substring(0, 2), 16);
        var gv = parseInt(hex.substring(2, 4), 16);
        var bv = parseInt(hex.substring(4, 6), 16);
        return 'rgba(' + rv + ', ' + gv + ', ' + bv + ', ' + alpha + ')';
    }

    function _drawMinimap(time) {
        var canvas = _els.minimapCanvas;
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        var w = MINIMAP_W;
        var h = MINIMAP_H;
        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = 'rgba(8, 12, 18, 0.95)';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(0, 255, 136, 0.04)';
        ctx.lineWidth = 0.5;
        for (var gx = 0; gx < w; gx += 20) {
            ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
        }
        for (var gy = 0; gy < h; gy += 20) {
            ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
        }

        var data = _gatherMinimapNodes();
        var positions = _layoutMinimapNodes(data);
        var nodeIds = Object.keys(data.nodes);
        if (nodeIds.length === 0) return;
        var currentId = _getMinimapCurrentId();

        for (var e = 0; e < data.edges.length; e++) {
            var edge = data.edges[e];
            var pA = positions[edge[0]];
            var pB = positions[edge[1]];
            if (!pA || !pB) continue;
            var dA = data.nodes[edge[0]] ? data.nodes[edge[0]].depth : 2;
            var dB = data.nodes[edge[1]] ? data.nodes[edge[1]].depth : 2;
            var maxDepth = Math.max(dA, dB);
            ctx.beginPath();
            ctx.moveTo(pA.x, pA.y);
            ctx.lineTo(pB.x, pB.y);
            ctx.strokeStyle = maxDepth >= 2 ? 'rgba(255,255,255,0.08)' : 'rgba(0,255,136,0.25)';
            ctx.lineWidth = maxDepth >= 2 ? 0.5 : 1;
            ctx.stroke();
        }

        var pulse = (Math.sin((time || 0) / 400) + 1) / 2;
        for (var n = 0; n < nodeIds.length; n++) {
            var id = nodeIds[n];
            var info = data.nodes[id];
            var pos = positions[id];
            if (!pos) continue;
            var discovered = _isMinimapDiscovered(id);
            var district = info.loc.district || 'midcity';
            var color = DISTRICT_COLORS[district] || '#00e5ff';
            var depth = info.depth;

            ctx.beginPath();
            if (id === currentId) {
                var nodeRadius = 5 + pulse * 2;
                ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, nodeRadius + 3 + pulse * 2, 0, Math.PI * 2);
                ctx.strokeStyle = _hexToRgba(color, 0.3 + pulse * 0.3);
                ctx.lineWidth = 1;
                ctx.stroke();
            } else if (depth === 1) {
                var r1 = discovered ? 3.5 : 2.5;
                ctx.arc(pos.x, pos.y, r1, 0, Math.PI * 2);
                ctx.fillStyle = discovered ? color : _hexToRgba(color, 0.25);
                ctx.fill();
            } else {
                var r2 = discovered ? 2 : 1.5;
                ctx.arc(pos.x, pos.y, r2, 0, Math.PI * 2);
                ctx.fillStyle = discovered ? _hexToRgba(color, 0.4) : _hexToRgba(color, 0.12);
                ctx.fill();
            }

            if ((id === currentId || depth === 1) && discovered) {
                var locName = info.loc.name || id;
                if (locName.length > 12) locName = locName.substring(0, 11) + '\u2026';
                ctx.font = id === currentId ? 'bold 7px monospace' : '6px monospace';
                ctx.fillStyle = id === currentId ? 'rgba(255,255,255,0.9)' : 'rgba(200,200,200,0.6)';
                ctx.textAlign = 'center';
                ctx.fillText(locName, pos.x, pos.y + (id === currentId ? 14 : 10));
            }
        }
    }

    function _animateMinimap(time) {
        _drawMinimap(time);
        _minimapAnimFrame = requestAnimationFrame(_animateMinimap);
    }

    function _startMinimapAnimation() {
        if (_minimapAnimFrame) return;
        _minimapAnimFrame = requestAnimationFrame(_animateMinimap);
    }

    function _stopMinimapAnimation() {
        if (_minimapAnimFrame) {
            cancelAnimationFrame(_minimapAnimFrame);
            _minimapAnimFrame = null;
        }
    }

    function _onMinimapClick(e) {
        var canvas = _els.minimapCanvas;
        if (!canvas) return;
        var rect = canvas.getBoundingClientRect();
        var scaleX = MINIMAP_W / rect.width;
        var scaleY = MINIMAP_H / rect.height;
        var clickX = (e.clientX - rect.left) * scaleX;
        var clickY = (e.clientY - rect.top) * scaleY;

        var data = _gatherMinimapNodes();
        var positions = _layoutMinimapNodes(data);
        var currentId = _getMinimapCurrentId();
        var bestId = null;
        var bestDist = 15;

        var ids = Object.keys(data.nodes);
        for (var i = 0; i < ids.length; i++) {
            var nid = ids[i];
            if (nid === currentId) continue;
            if (data.nodes[nid].depth !== 1) continue;
            if (!_isMinimapDiscovered(nid)) continue;
            var npos = positions[nid];
            if (!npos) continue;
            var dx = clickX - npos.x;
            var dy = clickY - npos.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < bestDist) { bestDist = dist; bestId = nid; }
        }

        if (bestId) {
            var locs = window.Latency.Locations;
            var locData = locs[bestId];
            var ch = _getChar();
            if (locData && locData.requiredReputation && ch && ch.reputation) {
                var fKeys = Object.keys(locData.requiredReputation);
                for (var fi = 0; fi < fKeys.length; fi++) {
                    var fId = fKeys[fi];
                    if ((ch.reputation[fId] || 0) < locData.requiredReputation[fId]) return;
                }
            }
            if (ch) {
                var fromId = ch.currentNodeId;
                ch.currentNodeId = bestId;
                if (ch.visitedNodes && ch.visitedNodes.indexOf(bestId) === -1) {
                    ch.visitedNodes.push(bestId);
                }
                window.Latency.EventBus.emit('map:travel', {
                    from: fromId, to: bestId, location: locData
                });
                if (window.Latency.MusicManager && locData && typeof locData.ambientTrack === 'number') {
                    window.Latency.MusicManager.skipTo(locData.ambientTrack);
                }
                _drawMinimap(performance.now());
            }
        }
    }

    function _buildMinimap() {
        var wrapper = _el('div', 'gp-minimap-container');
        var mmLabel = _el('div', 'gp-minimap-label', '[ AREA MAP ]');
        wrapper.appendChild(mmLabel);
        var canvas = document.createElement('canvas');
        canvas.className = 'gp-minimap-canvas';
        canvas.width = MINIMAP_W;
        canvas.height = MINIMAP_H;
        _els.minimapCanvas = canvas;
        _bind(canvas, 'click', _onMinimapClick);
        wrapper.appendChild(canvas);
        return wrapper;
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
        hpBlock.setAttribute('data-tooltip', 'Hit Points. Reach zero and you die. Restored by resting and healing items.');
        hpBlock.innerHTML = '<span class="gp-label">HP:</span> <span class="gp-bar gp-hp-bar">██████░░</span> <span class="gp-bar-numbers gp-hp-numbers">0/0</span>';
        _els.hpBar = hpBlock.querySelector('.gp-hp-bar');
        _els.hpNumbers = hpBlock.querySelector('.gp-hp-numbers');
        sidebar.appendChild(hpBlock);

        // Stamina bar
        var staBlock = _el('div', 'gp-bar-block gp-sta-block');
        staBlock.setAttribute('data-tooltip', 'Stamina. Used for special actions and abilities. Regenerates over time.');
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
            row.setAttribute('data-tooltip-stat', key);
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

        // Separator before contacts
        sidebar.appendChild(_el('div', 'gp-sidebar-sep', '────────────────'));

        // NPC Contacts panel
        sidebar.appendChild(_buildContactsPanel());

        // Separator before minimap
        sidebar.appendChild(_el('div', 'gp-sidebar-sep', '────────────────'));

        // Minimap widget
        sidebar.appendChild(_buildMinimap());

        return sidebar;
    }

    // --------------------------------------------------------
    // Build: Contacts panel (NPC relationship tracker)
    // --------------------------------------------------------
    function _buildContactsPanel() {
        var wrapper = _el('div', 'gp-contacts-panel');

        // Collapsible header
        var header = _el('div', 'gp-contacts-header');
        var toggle = _el('span', 'gp-contacts-toggle', '[-]');
        var title  = _el('span', 'gp-contacts-title', ' CONTACTS');
        header.appendChild(toggle);
        header.appendChild(title);
        wrapper.appendChild(header);

        // Contact list container (scrollable)
        var list = _el('div', 'gp-contacts-list');
        _els.contactsList = list;
        wrapper.appendChild(list);

        // Tooltip element for location info
        var tooltip = _el('div', 'gp-contacts-tooltip');
        tooltip.style.display = 'none';
        _els.contactsTooltip = tooltip;
        wrapper.appendChild(tooltip);

        // Track collapsed state
        var collapsed = false;
        _bind(header, 'click', function () {
            collapsed = !collapsed;
            toggle.textContent = collapsed ? '[+]' : '[-]';
            list.style.display = collapsed ? 'none' : '';
        });

        _els.contactsPanel = wrapper;
        return wrapper;
    }

    // --------------------------------------------------------
    // Refresh: contacts panel from NPC relationship data
    // --------------------------------------------------------
    function _refreshContacts() {
        var list = _els.contactsList;
        if (!list) return;

        var NpcSys = window.Latency.NpcSystem;
        var NpcsData = window.Latency.NpcsData;
        if (!NpcSys || !NpcsData) return;

        // Clean old listeners from previous contact rows
        _cleanDetachedListeners();

        list.innerHTML = '';

        // Gather NPCs with non-zero relationship values
        var contacts = [];
        var npcIds = Object.keys(NpcsData);
        for (var i = 0; i < npcIds.length; i++) {
            var npcId = npcIds[i];
            var val = NpcSys.getRelationship(npcId);
            if (val !== 0) {
                contacts.push({
                    id: npcId,
                    npc: NpcsData[npcId],
                    value: val,
                    tier: NpcSys.getRelationshipTier(npcId)
                });
            }
        }

        // Sort by absolute relationship value descending (strongest bonds first)
        contacts.sort(function (a, b) {
            return Math.abs(b.value) - Math.abs(a.value);
        });

        if (contacts.length === 0) {
            var emptyMsg = _el('div', 'gp-contacts-empty', 'No contacts yet.');
            list.appendChild(emptyMsg);
            return;
        }

        for (var c = 0; c < contacts.length; c++) {
            var contact = contacts[c];
            var npc = contact.npc;
            var tierInfo = TIER_DISPLAY[contact.tier] || TIER_DISPLAY.neutral;

            var row = _el('div', 'gp-contact-row');
            row.setAttribute('data-npc-id', contact.id);

            // Faction color dot
            var factionColor = 'var(--text-dim)';
            if (npc.faction && FACTION_DISPLAY[npc.faction]) {
                factionColor = FACTION_DISPLAY[npc.faction].color;
            }
            var dot = _el('span', 'gp-contact-faction-dot');
            dot.style.color = factionColor;
            dot.textContent = '\u25CF'; // filled circle
            row.appendChild(dot);

            // NPC name (green terminal style)
            var nameEl = _el('span', 'gp-contact-name', npc.name || contact.id);
            row.appendChild(nameEl);

            // Tier label (color-coded)
            var tierEl = _el('span', 'gp-contact-tier', tierInfo.label);
            tierEl.style.color = tierInfo.color;
            row.appendChild(tierEl);

            // Relationship bar: maps -100..+100 to 0..8 blocks
            var barEl = _el('span', 'gp-contact-bar');
            var normalized = (contact.value + 100) / 200; // 0 to 1
            var filled = Math.round(normalized * 6);
            if (filled < 0) filled = 0;
            if (filled > 6) filled = 6;
            barEl.textContent = '\u2588'.repeat(filled) + '\u2591'.repeat(6 - filled);

            // Color the bar based on tier
            barEl.style.color = tierInfo.color;
            row.appendChild(barEl);

            // Hover/click to show last known location
            (function (npcData, rowEl) {
                var locLabel = LOCATION_LABELS[npcData.location] || npcData.location || 'Unknown';

                _bind(rowEl, 'mouseenter', function () {
                    var tooltip = _els.contactsTooltip;
                    if (tooltip) {
                        tooltip.textContent = 'Last seen: ' + locLabel;
                        tooltip.style.display = '';
                    }
                });
                _bind(rowEl, 'mouseleave', function () {
                    var tooltip = _els.contactsTooltip;
                    if (tooltip) {
                        tooltip.style.display = 'none';
                    }
                });
                _bind(rowEl, 'click', function () {
                    var tooltip = _els.contactsTooltip;
                    if (tooltip) {
                        tooltip.textContent = 'Last seen: ' + locLabel;
                        tooltip.style.display = tooltip.style.display === 'none' ? '' : 'none';
                    }
                });
            })(npc, row);

            list.appendChild(row);
        }
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
    // Static render (no typewriter) — used when remounting after
    // overlay screens (inventory/map/settings) to avoid replaying
    // --------------------------------------------------------
    function _renderStoryNodeStatic(data) {
        if (!data) return;

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

        // Build narrative text (show instantly, no typewriter)
        var textContent = '';
        if (Array.isArray(node.text)) {
            textContent = node.text.join('\n\n');
        } else if (typeof node.text === 'string') {
            textContent = node.text;
        }

        if (_els.narrativeText && textContent) {
            _els.narrativeText.setAttribute('data-full-text', textContent);
            _els.narrativeText.innerHTML = textContent;
        }

        // Show choices immediately
        _renderChoices(node.choices || []);
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
                        // Play click SFX on choice selection
                        if (window.Latency.SfxManager) {
                            window.Latency.SfxManager.play('click');
                        }
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
        if (data && data.nodeId) {
            _lastDisplayedNodeId = data.nodeId;
        }
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

    function _onNpcRelationshipChange() {
        _refreshContacts();
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
            _subscribe('npc:relationship', _onNpcRelationshipChange);
            _subscribe('npc:tier_change', _onNpcRelationshipChange);

            // Initial sidebar populate from current character data
            _refreshSidebar();

            // Initial contacts populate
            _refreshContacts();

            // Start minimap animation and subscribe to travel events
            _startMinimapAnimation();
            _subscribe('map:travel', function () { _drawMinimap(performance.now()); });

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

            if (window.Latency.Narrative) {
                var existingNode = window.Latency.Narrative.getCurrentNode
                    ? window.Latency.Narrative.getCurrentNode() : null;
                var existingNodeId = window.Latency.Narrative.getCurrentNodeId
                    ? window.Latency.Narrative.getCurrentNodeId() : null;

                // Determine if this is a genuine fresh start (new game / character creation)
                // vs. returning from an overlay (inventory, map, settings, etc.).
                // We compare the Narrative's current node ID against the last node ID
                // we displayed.  If they match, the player simply opened and closed an
                // overlay — show the text instantly (no typewriter replay).
                // If params.nodeId is provided AND differs from the existing node, treat
                // it as a fresh navigation (character creation / new game).
                var isFreshStart = params && params.nodeId && params.nodeId !== existingNodeId;
                var isOverlayReturn = !isFreshStart
                    && existingNode && existingNodeId
                    && existingNodeId === _lastDisplayedNodeId;

                if (isOverlayReturn) {
                    // Returning from overlay — render current node statically (no typewriter)
                    _renderStoryNodeStatic({ nodeId: existingNodeId, node: existingNode });
                    _lastDisplayedNodeId = existingNodeId;
                    console.log('[Gameplay] Static restore (overlay return):', existingNodeId);
                } else if (window.Latency.Narrative.loadNode) {
                    // Fresh load (new game, character creation, or first mount) — use typewriter
                    if (isFreshStart) {
                        _lastDisplayedNodeId = null;
                    }
                    var _loadTimerId = setTimeout(function() {
                        window.Latency.Narrative.loadNode(nodeId).catch(function(err) {
                            console.error('[Gameplay] Failed to load node:', err.message);
                            if (_els.narrativeText) {
                                _els.narrativeText.textContent = 'Error loading story: ' + err.message;
                            }
                        });
                    }, 100);
                    _pendingTimers.push(_loadTimerId);
                }
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
            // Stop minimap animation
            _stopMinimapAnimation();

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
