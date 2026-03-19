/**
 * LATENCY - Notification System
 * ============================================================
 * Toast notification system that renders into #notification-layer.
 * Supports success, error, warning, and info types with stacking,
 * auto-dismiss, and slide/fade animations.
 *
 * Depends on: Latency.EventBus
 *
 * Usage:
 *   Latency.Notification.init();
 *   Latency.Notification.show('Game saved!', 'success');
 *   Latency.Notification.show('Connection lost', 'error', 5000);
 *
 * EventBus integration:
 *   Latency.EventBus.emit('notify', { message: '...', type: 'info' });
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.Notification = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------

    var DEFAULT_DURATION = 3000;

    /** Color map for notification types, keyed by type name. */
    var TYPE_COLORS = {
        success: { border: '#00ff88', bg: 'rgba(0, 255, 136, 0.08)', text: '#00ff88', glow: 'rgba(0, 255, 136, 0.3)' },
        error:   { border: '#ff2d75', bg: 'rgba(255, 45, 117, 0.08)', text: '#ff2d75', glow: 'rgba(255, 45, 117, 0.3)' },
        warning: { border: '#ff6b35', bg: 'rgba(255, 107, 53, 0.08)', text: '#ff6b35', glow: 'rgba(255, 107, 53, 0.3)' },
        info:    { border: '#00d4ff', bg: 'rgba(0, 212, 255, 0.08)',  text: '#00d4ff', glow: 'rgba(0, 212, 255, 0.3)' }
    };

    /** Type prefixes for terminal-style flavor. */
    var TYPE_PREFIXES = {
        success: '[OK]',
        error:   '[ERR]',
        warning: '[WARN]',
        info:    '[SYS]'
    };

    // -------------------------------------------------------------------
    // Internal state
    // -------------------------------------------------------------------

    /** @type {HTMLElement|null} */
    var _layer = null;

    /** @type {boolean} */
    var _initialized = false;

    // -------------------------------------------------------------------
    // Style injection (one-time)
    // -------------------------------------------------------------------

    var _stylesInjected = false;

    function _injectStyles() {
        if (_stylesInjected) return;
        _stylesInjected = true;

        var css = [
            '@keyframes notifySlideIn {',
            '  from {',
            '    opacity: 0;',
            '    transform: translateX(40px);',
            '  }',
            '  to {',
            '    opacity: 1;',
            '    transform: translateX(0);',
            '  }',
            '}',
            '',
            '@keyframes notifySlideOut {',
            '  from {',
            '    opacity: 1;',
            '    transform: translateX(0);',
            '    max-height: 100px;',
            '    margin-bottom: 0.5rem;',
            '    padding: 0.6rem 1rem;',
            '  }',
            '  to {',
            '    opacity: 0;',
            '    transform: translateX(60px);',
            '    max-height: 0;',
            '    margin-bottom: 0;',
            '    padding: 0;',
            '  }',
            '}',
            '',
            '.notification-toast {',
            '  font-family: var(--font-mono, "Courier New", monospace);',
            '  font-size: var(--text-sm, 0.75rem);',
            '  line-height: 1.4;',
            '  padding: 0.6rem 1rem;',
            '  border-left: 3px solid var(--text-primary, #00ff88);',
            '  background: var(--bg-panel, #1a1a2e);',
            '  color: var(--text-primary, #00ff88);',
            '  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);',
            '  animation: notifySlideIn 0.25s ease-out forwards;',
            '  cursor: pointer;',
            '  user-select: none;',
            '  overflow: hidden;',
            '  word-break: break-word;',
            '  display: flex;',
            '  align-items: flex-start;',
            '  gap: 0.5rem;',
            '}',
            '',
            '.notification-toast.dismissing {',
            '  animation: notifySlideOut 0.3s ease-in forwards;',
            '  pointer-events: none;',
            '}',
            '',
            '.notification-prefix {',
            '  font-weight: 700;',
            '  white-space: nowrap;',
            '  letter-spacing: 0.05em;',
            '}',
            '',
            '.notification-message {',
            '  flex: 1;',
            '}'
        ].join('\n');

        var style = document.createElement('style');
        style.setAttribute('data-module', 'notification');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // -------------------------------------------------------------------
    // Core
    // -------------------------------------------------------------------

    /**
     * Initialise the notification system.
     * Acquires the #notification-layer element and subscribes to
     * the EventBus 'notify' event.
     */
    function init() {
        if (_initialized) return;

        _injectStyles();

        _layer = document.getElementById('notification-layer');

        if (!_layer) {
            console.warn('[Notification] #notification-layer not found in DOM. ' +
                'Notifications will be logged to console only.');
        }

        // Listen for EventBus events
        if (window.Latency.EventBus && typeof window.Latency.EventBus.on === 'function') {
            window.Latency.EventBus.on('notify', function (data) {
                if (!data) return;
                show(data.message || '', data.type || 'info', data.duration);
            });
        }

        _initialized = true;
        console.log('[Notification] Initialized.');
    }

    /**
     * Display a toast notification.
     *
     * @param {string} message   - Text to display.
     * @param {string} [type='info'] - One of 'success', 'error', 'warning', 'info'.
     * @param {number} [duration]    - Auto-dismiss delay in ms (default 3000).
     */
    function show(message, type, duration) {
        type = type || 'info';
        duration = (typeof duration === 'number' && duration > 0) ? duration : DEFAULT_DURATION;

        // Validate type
        if (!TYPE_COLORS[type]) {
            type = 'info';
        }

        var colors = TYPE_COLORS[type];
        var prefix = TYPE_PREFIXES[type] || '[SYS]';

        // Always log to console as a fallback
        console.log('[Notification] ' + prefix + ' ' + message);

        if (!_layer) {
            // If no DOM layer, silently return after logging
            return;
        }

        // Build toast element
        var toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.style.borderLeftColor = colors.border;
        toast.style.background = colors.bg;
        toast.style.color = colors.text;
        toast.style.boxShadow = '0 2px 12px rgba(0,0,0,0.4), 0 0 8px ' + colors.glow;

        // Prefix
        var prefixEl = document.createElement('span');
        prefixEl.className = 'notification-prefix';
        prefixEl.textContent = prefix;
        toast.appendChild(prefixEl);

        // Message
        var msgEl = document.createElement('span');
        msgEl.className = 'notification-message';
        msgEl.textContent = message;
        toast.appendChild(msgEl);

        // Click to dismiss early
        toast.addEventListener('click', function () {
            _dismiss(toast);
        });

        // Add to layer
        _layer.appendChild(toast);

        // Auto-dismiss timer
        var timer = setTimeout(function () {
            _dismiss(toast);
        }, duration);

        // Store timer so we can cancel if manually dismissed
        toast._dismissTimer = timer;
    }

    /**
     * Dismiss a toast with an exit animation.
     * @param {HTMLElement} toast
     */
    function _dismiss(toast) {
        if (!toast || toast._dismissing) return;
        toast._dismissing = true;

        // Cancel the auto-dismiss timer
        if (toast._dismissTimer) {
            clearTimeout(toast._dismissTimer);
            toast._dismissTimer = null;
        }

        // Animate out
        toast.classList.add('dismissing');

        // Remove from DOM after animation
        setTimeout(function () {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    return {
        init: init,
        show: show
    };
})();
