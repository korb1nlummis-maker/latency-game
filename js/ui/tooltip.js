/**
 * LATENCY - Tooltip System
 * ============================================================
 * Floating tooltip that follows the mouse cursor, triggered by
 * data attributes on any element in the DOM.
 *
 * Supports two modes:
 *   1. Simple text:   data-tooltip="Some explanation text"
 *   2. Stat tooltip:  data-tooltip-stat="strength"
 *      Shows stat name, current value, modifier, and description.
 *
 * Usage:
 *   Latency.Tooltip.init();   // call once after DOMContentLoaded
 *
 * The system uses a single shared tooltip element and delegated
 * event listeners on document.body for zero per-element overhead.
 *
 * Depends on: (optional) Latency.CharacterSystem for stat values
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.Tooltip = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------

    /** Pixel offset from cursor to tooltip edge */
    var CURSOR_OFFSET_X = 12;
    var CURSOR_OFFSET_Y = 16;

    /** Minimum distance from viewport edge before flipping */
    var EDGE_MARGIN = 8;

    /** Built-in stat descriptions */
    var STAT_DESCRIPTIONS = {
        strength:     'Physical power. Affects melee damage and strength checks.',
        dexterity:    'Agility and reflexes. Affects dodge chance and dexterity checks.',
        constitution: 'Toughness. Affects max HP and resistance to status effects.',
        intelligence: 'Mental acuity. Affects skill learning and intelligence checks.',
        wisdom:       'Perception and insight. Affects healing and wisdom checks.',
        charisma:     'Social influence. Affects persuasion, prices, and charisma checks.',
        tech:         'Technical aptitude. Affects hacking, crafting, and tech checks.',
        luck:         'Fortune. Affects critical hits, loot quality, and random events.'
    };

    /** Stat display labels */
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

    // -------------------------------------------------------------------
    // Private state
    // -------------------------------------------------------------------

    var _tooltipEl = null;      // The single shared tooltip DOM element
    var _visible = false;       // Whether tooltip is currently shown
    var _currentTarget = null;  // Element the tooltip is anchored to
    var _initialized = false;   // Prevent double-init

    // -------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------

    /**
     * Get character stat value and modifier safely.
     * @param {string} statKey - e.g. 'strength'
     * @returns {{ value: number, modifier: number } | null}
     */
    function _getStatInfo(statKey) {
        var CS = window.Latency.CharacterSystem;
        if (!CS) return null;

        var char = CS.getCharacter();
        if (!char || !char.stats) return null;

        var val = char.stats[statKey];
        if (val === undefined || val === null) return null;

        var mod = 0;
        if (CS.getStatModifier) {
            mod = CS.getStatModifier(statKey);
        }
        return { value: val, modifier: mod };
    }

    /**
     * Format modifier as string: "(+2)" or "(-1)"
     */
    function _formatMod(mod) {
        if (mod >= 0) return '(+' + mod + ')';
        return '(' + mod + ')';
    }

    // -------------------------------------------------------------------
    // Tooltip element creation
    // -------------------------------------------------------------------

    /**
     * Create the shared tooltip DOM element and append to body.
     */
    function _createTooltipEl() {
        if (_tooltipEl) return;

        _tooltipEl = document.createElement('div');
        _tooltipEl.className = 'lt-tooltip';
        _tooltipEl.setAttribute('role', 'tooltip');
        _tooltipEl.setAttribute('aria-hidden', 'true');
        document.body.appendChild(_tooltipEl);
    }

    // -------------------------------------------------------------------
    // Content rendering
    // -------------------------------------------------------------------

    /**
     * Render simple text content into the tooltip.
     * @param {string} text
     */
    function _renderText(text) {
        _tooltipEl.innerHTML = '';
        var desc = document.createElement('div');
        desc.className = 'lt-tooltip__description';
        desc.textContent = text;
        _tooltipEl.appendChild(desc);
    }

    /**
     * Render a stat tooltip with name, value, modifier, and description.
     * @param {string} statKey - e.g. 'strength'
     */
    function _renderStat(statKey) {
        _tooltipEl.innerHTML = '';

        var label = STAT_LABELS[statKey];
        var description = STAT_DESCRIPTIONS[statKey];
        if (!label || !description) {
            // Fallback: treat as plain text
            _renderText(statKey);
            return;
        }

        // Header row: NAME  value  (mod)
        var header = document.createElement('div');
        header.className = 'lt-tooltip__stat-header';

        var nameSpan = document.createElement('span');
        nameSpan.className = 'lt-tooltip__stat-name';
        nameSpan.textContent = label.short + ' - ' + label.name;
        header.appendChild(nameSpan);

        var statInfo = _getStatInfo(statKey);
        if (statInfo) {
            var valueSpan = document.createElement('span');
            valueSpan.className = 'lt-tooltip__stat-value';
            valueSpan.textContent = String(statInfo.value);
            header.appendChild(valueSpan);

            var modSpan = document.createElement('span');
            modSpan.className = 'lt-tooltip__stat-mod';
            modSpan.textContent = _formatMod(statInfo.modifier);
            header.appendChild(modSpan);
        }

        _tooltipEl.appendChild(header);

        // Description
        var desc = document.createElement('div');
        desc.className = 'lt-tooltip__description';
        desc.textContent = description;
        _tooltipEl.appendChild(desc);
    }

    // -------------------------------------------------------------------
    // Positioning
    // -------------------------------------------------------------------

    /**
     * Position the tooltip near the mouse, flipping if it would
     * overflow the viewport.
     * @param {number} mouseX - clientX
     * @param {number} mouseY - clientY
     */
    function _position(mouseX, mouseY) {
        if (!_tooltipEl) return;

        var vw = window.innerWidth;
        var vh = window.innerHeight;

        // Measure tooltip dimensions (it must be visible for this)
        var rect = _tooltipEl.getBoundingClientRect();
        var tw = rect.width || _tooltipEl.offsetWidth;
        var th = rect.height || _tooltipEl.offsetHeight;

        // Default: tooltip to the right and below the cursor
        var left = mouseX + CURSOR_OFFSET_X;
        var top = mouseY + CURSOR_OFFSET_Y;

        // Flip horizontally if overflowing right edge
        if (left + tw + EDGE_MARGIN > vw) {
            left = mouseX - tw - CURSOR_OFFSET_X;
        }

        // Flip vertically if overflowing bottom edge
        if (top + th + EDGE_MARGIN > vh) {
            top = mouseY - th - CURSOR_OFFSET_Y;
        }

        // Clamp to viewport bounds
        if (left < EDGE_MARGIN) left = EDGE_MARGIN;
        if (top < EDGE_MARGIN) top = EDGE_MARGIN;

        _tooltipEl.style.left = left + 'px';
        _tooltipEl.style.top = top + 'px';
    }

    // -------------------------------------------------------------------
    // Show / Hide
    // -------------------------------------------------------------------

    function _show(target, mouseX, mouseY) {
        if (!_tooltipEl) return;

        _currentTarget = target;

        // Determine content type
        var statKey = target.getAttribute('data-tooltip-stat');
        var text = target.getAttribute('data-tooltip');

        if (statKey) {
            _renderStat(statKey);
        } else if (text) {
            _renderText(text);
        } else {
            return; // nothing to show
        }

        // Make visible (needed for dimension measurement)
        _tooltipEl.classList.add('lt-tooltip--visible');
        _tooltipEl.setAttribute('aria-hidden', 'false');
        _visible = true;

        // Position after content is rendered
        _position(mouseX, mouseY);
    }

    function _hide() {
        if (!_tooltipEl) return;

        _tooltipEl.classList.remove('lt-tooltip--visible');
        _tooltipEl.setAttribute('aria-hidden', 'true');
        _visible = false;
        _currentTarget = null;
    }

    // -------------------------------------------------------------------
    // Delegated event handlers
    // -------------------------------------------------------------------

    /**
     * Find the closest ancestor (or self) with a tooltip data attribute.
     * @param {HTMLElement} el
     * @returns {HTMLElement|null}
     */
    function _findTooltipTarget(el) {
        var node = el;
        while (node && node !== document.body) {
            if (node.hasAttribute && (
                node.hasAttribute('data-tooltip') ||
                node.hasAttribute('data-tooltip-stat')
            )) {
                return node;
            }
            node = node.parentElement;
        }
        return null;
    }

    function _onMouseOver(e) {
        var target = _findTooltipTarget(e.target);
        if (!target) return;

        // Already showing for this target
        if (_currentTarget === target && _visible) return;

        _show(target, e.clientX, e.clientY);
    }

    function _onMouseMove(e) {
        if (!_visible) return;

        // Check if we're still over the tooltip target
        var target = _findTooltipTarget(e.target);
        if (target !== _currentTarget) {
            _hide();
            if (target) {
                _show(target, e.clientX, e.clientY);
            }
            return;
        }

        _position(e.clientX, e.clientY);
    }

    function _onMouseOut(e) {
        if (!_visible) return;

        // Only hide if we're actually leaving the tooltip target
        var related = e.relatedTarget;
        if (related && _currentTarget && _currentTarget.contains(related)) {
            return; // moving within the same target element
        }

        _hide();
    }

    function _onClick() {
        if (_visible) {
            _hide();
        }
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    return {
        /**
         * Initialize the tooltip system. Call once after DOMContentLoaded.
         * Attaches delegated listeners on document.body.
         */
        init: function () {
            if (_initialized) return;
            _initialized = true;

            _createTooltipEl();

            document.body.addEventListener('mouseover', _onMouseOver, false);
            document.body.addEventListener('mousemove', _onMouseMove, false);
            document.body.addEventListener('mouseout', _onMouseOut, false);
            document.body.addEventListener('click', _onClick, false);

            console.log('[LATENCY] Tooltip system initialized.');
        },

        /**
         * Programmatically show a tooltip at a position.
         * @param {HTMLElement} target - Element to anchor to
         * @param {number} x - clientX position
         * @param {number} y - clientY position
         */
        show: function (target, x, y) {
            _show(target, x, y);
        },

        /**
         * Programmatically hide the tooltip.
         */
        hide: function () {
            _hide();
        },

        /**
         * Check if tooltip is currently visible.
         * @returns {boolean}
         */
        isVisible: function () {
            return _visible;
        },

        /**
         * Register a custom stat description (for mods/extensions).
         * @param {string} statKey - e.g. 'hacking'
         * @param {string} description - Description text
         * @param {{ short: string, name: string }} [label] - Display label
         */
        registerStat: function (statKey, description, label) {
            if (statKey && description) {
                STAT_DESCRIPTIONS[statKey] = description;
            }
            if (statKey && label) {
                STAT_LABELS[statKey] = label;
            }
        },

        /**
         * Get the built-in stat descriptions (read-only copy).
         * @returns {Object}
         */
        getStatDescriptions: function () {
            var copy = {};
            var keys = Object.keys(STAT_DESCRIPTIONS);
            for (var i = 0; i < keys.length; i++) {
                copy[keys[i]] = STAT_DESCRIPTIONS[keys[i]];
            }
            return copy;
        }
    };
})();
