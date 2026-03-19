/**
 * LATENCY - Map Screen
 * ============================================================
 * ASCII world map showing districts and locations. The current
 * location is highlighted. Connected locations can be clicked
 * for fast-travel. District labels and a BACK button provide
 * navigation context.
 *
 * Screen contract: mount(container, params), unmount()
 *
 * Dependencies:
 *   - window.Latency.Locations       (location data)
 *   - window.Latency.CharacterSystem (current location, visited)
 *   - window.Latency.EventBus        (publish/subscribe)
 *   - window.Latency.ScreenManager   (screen transitions)
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.MapScreen = (function () {
    'use strict';

    // --------------------------------------------------------
    // Private state
    // --------------------------------------------------------
    var _container = null;
    var _listeners = [];
    var _unsubs = [];
    var _els = {};

    // --------------------------------------------------------
    // District display configuration
    // --------------------------------------------------------
    var DISTRICTS = {
        highcity: {
            label: 'HIGHCITY',
            color: 'var(--accent-4)',
            colorClass: 'map-district-highcity',
            order: 0
        },
        midcity: {
            label: 'MIDCITY',
            color: 'var(--accent-2)',
            colorClass: 'map-district-midcity',
            order: 1
        },
        undercity: {
            label: 'UNDERCITY',
            color: 'var(--accent-1)',
            colorClass: 'map-district-undercity',
            order: 2
        },
        underground: {
            label: 'UNDERGROUND',
            color: 'var(--accent-3)',
            colorClass: 'map-district-underground',
            order: 3
        }
    };

    // --------------------------------------------------------
    // Helpers
    // --------------------------------------------------------

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

    function _subscribe(event, handler) {
        var unsub = window.Latency.EventBus.on(event, handler);
        _unsubs.push(unsub);
    }

    function _getChar() {
        if (window.Latency.CharacterSystem) {
            return window.Latency.CharacterSystem.getCharacter();
        }
        return null;
    }

    function _getCurrentLocationId() {
        var char = _getChar();
        return char ? char.currentNodeId : null;
    }

    function _getVisitedLocations() {
        var char = _getChar();
        if (!char || !char.visitedNodes) { return []; }
        return char.visitedNodes;
    }

    function _isDiscovered(locData) {
        // Always visible if not discoverable
        if (!locData.discoverable) { return true; }
        // Visible if visited
        var visited = _getVisitedLocations();
        return visited.indexOf(locData.id) !== -1;
    }

    function _isConnected(fromId, toId) {
        var locations = window.Latency.Locations;
        if (!locations || !locations[fromId]) { return false; }
        var conns = locations[fromId].connections || [];
        return conns.indexOf(toId) !== -1;
    }

    function _canTravel(locData) {
        // Check faction reputation requirements
        if (locData.requiredReputation) {
            var char = _getChar();
            if (!char || !char.reputation) { return false; }
            var factions = Object.keys(locData.requiredReputation);
            for (var i = 0; i < factions.length; i++) {
                var fId = factions[i];
                var req = locData.requiredReputation[fId];
                var rep = char.reputation[fId] || 0;
                if (rep < req) { return false; }
            }
        }
        return true;
    }

    function _navigateBack() {
        if (window.Latency.StateMachine && window.Latency.StateMachine.back) {
            window.Latency.StateMachine.back();
            return;
        }
        if (window.Latency.ScreenManager && window.Latency.ScreenManager.show) {
            window.Latency.ScreenManager.show('gameplay');
        }
    }

    function _travelTo(locationId) {
        var char = _getChar();
        if (!char) { return; }

        var locations = window.Latency.Locations;
        if (!locations || !locations[locationId]) { return; }

        var locData = locations[locationId];

        // Check if reachable and allowed
        var currentId = _getCurrentLocationId();
        if (currentId && !_isConnected(currentId, locationId)) { return; }
        if (!_canTravel(locData)) { return; }

        // Update character location
        char.currentNodeId = locationId;

        // Mark as visited
        if (char.visitedNodes && char.visitedNodes.indexOf(locationId) === -1) {
            char.visitedNodes.push(locationId);
        }

        // Emit travel event
        window.Latency.EventBus.emit('map:travel', {
            from: currentId,
            to: locationId,
            location: locData
        });

        // Switch ambient music if needed
        if (window.Latency.MusicManager && typeof locData.ambientTrack === 'number') {
            window.Latency.MusicManager.skipTo(locData.ambientTrack);
        }

        // Return to gameplay
        _navigateBack();
    }

    // --------------------------------------------------------
    // Build: Location nodes grouped by district
    // --------------------------------------------------------
    function _buildDistrictSection(districtId, districtInfo) {
        var locations = window.Latency.Locations;
        if (!locations) { return null; }

        var currentId = _getCurrentLocationId();

        // Gather locations for this district
        var districtLocations = [];
        var locKeys = Object.keys(locations);
        for (var i = 0; i < locKeys.length; i++) {
            if (locations[locKeys[i]].district === districtId) {
                districtLocations.push(locations[locKeys[i]]);
            }
        }

        if (districtLocations.length === 0) { return null; }

        var section = _el('div', 'map-district ' + districtInfo.colorClass);

        // District header
        var header = _el('div', 'map-district-header');
        var labelEl = _el('span', 'map-district-label', '[ ' + districtInfo.label + ' ]');
        header.appendChild(labelEl);

        // Connection line decoration
        var line = _el('span', 'map-district-line');
        var lineStr = '';
        for (var d = 0; d < 40; d++) { lineStr += '─'; }
        line.textContent = lineStr;
        header.appendChild(line);

        section.appendChild(header);

        // Location nodes
        var nodesContainer = _el('div', 'map-nodes-container');

        for (var j = 0; j < districtLocations.length; j++) {
            var loc = districtLocations[j];
            var discovered = _isDiscovered(loc);

            var node = _el('div', 'map-node');

            if (!discovered) {
                // Undiscovered location
                node.classList.add('map-node-undiscovered');
                node.textContent = '[???]';
                node.setAttribute('title', 'Undiscovered location');
            } else {
                var isCurrent = (loc.id === currentId);
                var isReachable = currentId ? _isConnected(currentId, loc.id) : false;
                var canTravelHere = _canTravel(loc);

                // Build node content
                var marker = isCurrent ? '>>>' : (isReachable ? ' > ' : '   ');
                var endMarker = isCurrent ? '<<<' : (isReachable ? ' < ' : '   ');
                var nameText = marker + ' ' + loc.name + ' ' + endMarker;

                node.textContent = nameText;
                node.setAttribute('title', loc.description);
                node.setAttribute('data-location-id', loc.id);

                if (isCurrent) {
                    node.classList.add('map-node-current');
                } else if (isReachable && canTravelHere) {
                    node.classList.add('map-node-reachable');
                    (function (locId) {
                        _bind(node, 'click', function () {
                            _travelTo(locId);
                        });
                    })(loc.id);
                } else if (isReachable && !canTravelHere) {
                    node.classList.add('map-node-locked');
                    node.setAttribute('title', loc.description + ' [LOCKED - Insufficient reputation]');
                } else {
                    node.classList.add('map-node-distant');
                }

                // Show connections
                if (discovered && loc.connections && loc.connections.length > 0) {
                    var connStr = '';
                    for (var c = 0; c < loc.connections.length; c++) {
                        var connLoc = locations[loc.connections[c]];
                        if (connLoc && _isDiscovered(connLoc)) {
                            if (connStr) { connStr += ', '; }
                            connStr += connLoc.name;
                        }
                    }
                    if (connStr) {
                        var connEl = _el('div', 'map-node-connections', '  -> ' + connStr);
                        node.appendChild(connEl);
                    }
                }

                // Show vendors/services indicator
                if (loc.vendors && loc.vendors.length > 0) {
                    var svcEl = _el('span', 'map-node-services', ' [$]');
                    node.appendChild(svcEl);
                }

                // Show faction indicator
                if (loc.faction) {
                    var factionEl = _el('span', 'map-node-faction', ' [F]');
                    node.appendChild(factionEl);
                }
            }

            nodesContainer.appendChild(node);
        }

        section.appendChild(nodesContainer);

        return section;
    }

    // --------------------------------------------------------
    // Build: ASCII map header
    // --------------------------------------------------------
    function _buildMapHeader() {
        var header = _el('div', 'map-header');

        var title = _el('pre', 'map-title');
        title.textContent =
            '  ╔═══════════════════════════════════════════════╗\n' +
            '  ║           M E G A C I T Y   M A P            ║\n' +
            '  ╚═══════════════════════════════════════════════╝';
        header.appendChild(title);

        // Legend
        var legend = _el('div', 'map-legend');
        legend.innerHTML =
            '<span class="map-legend-item map-legend-current">&gt;&gt;&gt; Current Location &lt;&lt;&lt;</span> ' +
            '<span class="map-legend-item map-legend-reachable">&gt; Reachable &lt;</span> ' +
            '<span class="map-legend-item map-legend-locked">[LOCKED]</span> ' +
            '<span class="map-legend-item map-legend-services">[$] Vendors</span> ' +
            '<span class="map-legend-item map-legend-faction">[F] Faction HQ</span>';
        header.appendChild(legend);

        return header;
    }

    // --------------------------------------------------------
    // Build: Current location info panel
    // --------------------------------------------------------
    function _buildLocationInfo() {
        var panel = _el('div', 'map-location-info');
        _els.locationInfo = panel;

        var currentId = _getCurrentLocationId();
        var locations = window.Latency.Locations;

        if (currentId && locations && locations[currentId]) {
            var loc = locations[currentId];

            var nameEl = _el('div', 'map-info-name', '>> ' + loc.name);
            panel.appendChild(nameEl);

            var descEl = _el('div', 'map-info-desc', loc.description);
            panel.appendChild(descEl);

            var districtLabel = DISTRICTS[loc.district] ? DISTRICTS[loc.district].label : loc.district;
            var detailEl = _el('div', 'map-info-detail', 'District: ' + districtLabel);
            panel.appendChild(detailEl);

            if (loc.connections && loc.connections.length > 0) {
                var connNames = [];
                for (var i = 0; i < loc.connections.length; i++) {
                    var connLoc = locations[loc.connections[i]];
                    if (connLoc && _isDiscovered(connLoc)) {
                        connNames.push(connLoc.name);
                    } else {
                        connNames.push('???');
                    }
                }
                var connEl = _el('div', 'map-info-detail', 'Connections: ' + connNames.join(', '));
                panel.appendChild(connEl);
            }

            if (loc.vendors && loc.vendors.length > 0) {
                var vendorEl = _el('div', 'map-info-detail map-info-vendors', 'Vendors available');
                panel.appendChild(vendorEl);
            }

            if (loc.faction) {
                var factionData = window.Latency.FactionsData ? window.Latency.FactionsData[loc.faction] : null;
                var factionName = factionData ? factionData.name : loc.faction;
                var factionEl = _el('div', 'map-info-detail map-info-faction', 'Faction: ' + factionName);
                panel.appendChild(factionEl);
            }
        } else {
            var unknownEl = _el('div', 'map-info-name', '>> Location Unknown');
            panel.appendChild(unknownEl);
        }

        return panel;
    }

    // --------------------------------------------------------
    // Build: Back button
    // --------------------------------------------------------
    function _buildBackButton() {
        var footer = _el('div', 'map-footer');

        var backBtn = _el('button', 'map-back-btn', '[ BACK ]');
        backBtn.setAttribute('type', 'button');
        _bind(backBtn, 'click', function () {
            _navigateBack();
        });
        footer.appendChild(backBtn);

        return footer;
    }

    // --------------------------------------------------------
    // Public API (Screen contract)
    // --------------------------------------------------------
    return {
        /**
         * Mount the map screen.
         * @param {HTMLElement} container
         * @param {Object} [params]
         */
        mount: function (container, params) {
            _container = container;
            _listeners = [];
            _unsubs = [];
            _els = {};

            var screen = _el('div', 'map-screen');

            // Map header with ASCII title and legend
            screen.appendChild(_buildMapHeader());

            // Main map area
            var mapArea = _el('div', 'map-area');

            // Build district sections in order: highcity -> midcity -> undercity -> underground
            var districtOrder = ['highcity', 'midcity', 'undercity', 'underground'];
            for (var i = 0; i < districtOrder.length; i++) {
                var dId = districtOrder[i];
                if (DISTRICTS[dId]) {
                    var section = _buildDistrictSection(dId, DISTRICTS[dId]);
                    if (section) {
                        mapArea.appendChild(section);
                    }
                }
            }

            screen.appendChild(mapArea);

            // Separator
            var sep = _el('div', 'map-separator');
            sep.textContent = '════════════════════════════════════════════════════';
            screen.appendChild(sep);

            // Current location info panel
            screen.appendChild(_buildLocationInfo());

            // Back button
            screen.appendChild(_buildBackButton());

            _container.appendChild(screen);

            // Emit screen mounted event
            window.Latency.EventBus.emit('screen:mounted', 'map');

            console.log('[MapScreen] Mounted.');
        },

        /**
         * Unmount the map screen.
         */
        unmount: function () {
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

            _els = {};

            if (_container) {
                _container.innerHTML = '';
            }
            _container = null;

            console.log('[MapScreen] Unmounted.');
        }
    };
})();
