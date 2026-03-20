/**
 * LATENCY - Settings Screen
 * ============================================================
 * Full-screen overlay for game settings. Provides controls for
 * music volume, music mute, voice narration, voice speed,
 * text speed, screen shake, CRT scanlines, auto-save, and a
 * danger-zone button to delete all save data.
 *
 * Depends on: Latency.EventBus, Latency.StateMachine,
 *             Latency.MusicManager, Latency.VoiceManager,
 *             Latency.Typewriter, Latency.SaveManager
 *
 * Transitions:
 *   BACK -> StateMachine.back() (returns to previous screen)
 *
 * Screen contract: implements mount(container, params) and unmount()
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.SettingsScreen = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Private state
    // -------------------------------------------------------------------

    var _container = null;
    var _listeners = [];
    var _confirmOverlay = null;

    /** Settings storage key */
    var STORAGE_KEY = 'latency_settings';

    /** Default settings for values stored in localStorage */
    var DEFAULTS = {
        screenShake: true,
        crtScanlines: false,
        autoSave: true,
        textSpeed: 30,       // ms per character (slow=50, normal=30, fast=15)
        voiceSpeed: 0.9      // 0.5 - 2.0
    };

    // -------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------

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

    // -------------------------------------------------------------------
    // Settings persistence (localStorage)
    // -------------------------------------------------------------------

    function _loadSettings() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                // Merge with defaults to handle missing keys
                var result = {};
                for (var key in DEFAULTS) {
                    if (DEFAULTS.hasOwnProperty(key)) {
                        result[key] = parsed.hasOwnProperty(key) ? parsed[key] : DEFAULTS[key];
                    }
                }
                return result;
            }
        } catch (e) {
            console.warn('[Settings] Failed to load settings:', e);
        }
        // Return a copy of defaults
        var def = {};
        for (var k in DEFAULTS) {
            if (DEFAULTS.hasOwnProperty(k)) def[k] = DEFAULTS[k];
        }
        return def;
    }

    function _saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.warn('[Settings] Failed to save settings:', e);
        }
    }

    function _getSetting(key) {
        var settings = _loadSettings();
        return settings[key];
    }

    function _setSetting(key, value) {
        var settings = _loadSettings();
        settings[key] = value;
        _saveSettings(settings);
    }

    // -------------------------------------------------------------------
    // Slider builder
    // -------------------------------------------------------------------

    /**
     * Build a terminal-style slider using block characters.
     * @param {Object} opts
     * @param {number} opts.min
     * @param {number} opts.max
     * @param {number} opts.step
     * @param {number} opts.value - Current value
     * @param {number} opts.blocks - Number of blocks to display (default 10)
     * @param {Function} opts.onChange - Called with new value
     * @param {Function} opts.formatValue - Format the display value
     * @returns {HTMLElement}
     */
    function _buildSlider(opts) {
        var min = opts.min;
        var max = opts.max;
        var step = opts.step;
        var value = opts.value;
        var blocks = opts.blocks || 10;
        var onChange = opts.onChange;
        var formatValue = opts.formatValue || function (v) { return String(v); };

        var wrap = _el('div', 'settings-slider-wrap');

        // Minus button
        var minusBtn = _el('button', 'settings-slider-btn', '\u2212');
        minusBtn.setAttribute('type', 'button');
        wrap.appendChild(minusBtn);

        // Block bar
        var bar = _el('div', 'settings-slider-bar');
        wrap.appendChild(bar);

        // Plus button
        var plusBtn = _el('button', 'settings-slider-btn', '+');
        plusBtn.setAttribute('type', 'button');
        wrap.appendChild(plusBtn);

        // Value display
        var valueDisplay = _el('span', 'settings-slider-value', formatValue(value));
        wrap.appendChild(valueDisplay);

        function _render(val) {
            bar.innerHTML = '';
            var range = max - min;
            var filledCount = Math.round(((val - min) / range) * blocks);

            for (var i = 0; i < blocks; i++) {
                var block = _el('span', 'settings-slider-block', '\u2588');
                if (i < filledCount) {
                    block.classList.add('filled');
                } else {
                    block.classList.add('empty');
                }
                // Click on individual block to set value
                (function (idx) {
                    _bind(block, 'click', function () {
                        var newVal = min + ((idx + 1) / blocks) * range;
                        // Round to step
                        newVal = Math.round(newVal / step) * step;
                        newVal = Math.max(min, Math.min(max, newVal));
                        value = newVal;
                        _render(value);
                        valueDisplay.textContent = formatValue(value);
                        if (typeof onChange === 'function') onChange(value);
                    });
                })(i);

                bar.appendChild(block);
            }
        }

        _render(value);

        _bind(minusBtn, 'click', function () {
            value = Math.max(min, value - step);
            // Round to step to avoid floating point drift
            value = Math.round(value / step) * step;
            value = Math.max(min, value);
            _render(value);
            valueDisplay.textContent = formatValue(value);
            if (typeof onChange === 'function') onChange(value);
        });

        _bind(plusBtn, 'click', function () {
            value = Math.min(max, value + step);
            value = Math.round(value / step) * step;
            value = Math.min(max, value);
            _render(value);
            valueDisplay.textContent = formatValue(value);
            if (typeof onChange === 'function') onChange(value);
        });

        return wrap;
    }

    // -------------------------------------------------------------------
    // Toggle builder
    // -------------------------------------------------------------------

    /**
     * Build a terminal-style toggle button.
     * @param {boolean} initialState
     * @param {Function} onChange - Called with new boolean state
     * @returns {HTMLElement}
     */
    function _buildToggle(initialState, onChange) {
        var btn = _el('button', 'settings-toggle', initialState ? '[ ON ]' : '[ OFF ]');
        btn.setAttribute('type', 'button');
        btn.classList.add(initialState ? 'toggle-on' : 'toggle-off');

        var state = initialState;

        _bind(btn, 'click', function () {
            state = !state;
            btn.textContent = state ? '[ ON ]' : '[ OFF ]';
            btn.classList.remove('toggle-on', 'toggle-off');
            btn.classList.add(state ? 'toggle-on' : 'toggle-off');
            if (typeof onChange === 'function') onChange(state);
        });

        return btn;
    }

    // -------------------------------------------------------------------
    // DOM Construction
    // -------------------------------------------------------------------

    function _buildScreen() {
        var frag = document.createDocumentFragment();
        var screen = _el('div', 'settings-screen');

        // Title
        screen.appendChild(_el('div', 'settings-title', 'SETTINGS'));

        // Separator
        screen.appendChild(_el('div', 'settings-separator',
            '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550'));

        var rows = _el('div', 'settings-rows');

        // Load current settings from localStorage
        var settings = _loadSettings();

        // ── AUDIO section ──
        rows.appendChild(_el('div', 'settings-section-header', 'AUDIO'));

        // Music Volume
        var musicVolume = _getMusicVolume();
        rows.appendChild(_buildRow('Music Volume', _buildSlider({
            min: 0, max: 100, step: 5, value: Math.round(musicVolume * 100),
            blocks: 10,
            formatValue: function (v) { return v + '%'; },
            onChange: function (v) {
                if (window.Latency.MusicManager && window.Latency.MusicManager.setVolume) {
                    window.Latency.MusicManager.setVolume(v / 100);
                }
            }
        })));

        // Music Mute
        var musicMuted = _getMusicMuted();
        rows.appendChild(_buildRow('Music Mute', _buildToggle(musicMuted, function (muted) {
            if (window.Latency.MusicManager && window.Latency.MusicManager.toggleMute) {
                // Only toggle if the current state doesn't match what we want
                var currentMuted = window.Latency.MusicManager.isMuted();
                if (currentMuted !== muted) {
                    window.Latency.MusicManager.toggleMute();
                }
            }
        })));

        // SFX Volume
        var sfxVolume = _getSfxVolume();
        rows.appendChild(_buildRow('SFX Volume', _buildSlider({
            min: 0, max: 100, step: 5, value: Math.round(sfxVolume * 100),
            blocks: 10,
            formatValue: function (v) { return v + '%'; },
            onChange: function (v) {
                if (window.Latency.SfxManager && window.Latency.SfxManager.setVolume) {
                    window.Latency.SfxManager.setVolume(v / 100);
                }
            }
        })));

        // SFX Mute
        var sfxMuted = _getSfxMuted();
        rows.appendChild(_buildRow('SFX Mute', _buildToggle(sfxMuted, function (muted) {
            if (window.Latency.SfxManager && window.Latency.SfxManager.setMuted) {
                window.Latency.SfxManager.setMuted(muted);
            }
        })));

        // ── VOICE section ──
        rows.appendChild(_el('div', 'settings-section-header', 'VOICE'));

        // Voice Narration
        var voiceEnabled = _getVoiceEnabled();
        rows.appendChild(_buildRow('Voice Narration', _buildToggle(voiceEnabled, function (enabled) {
            if (window.Latency.VoiceManager && window.Latency.VoiceManager.setEnabled) {
                window.Latency.VoiceManager.setEnabled(enabled);
            }
        })));

        // Voice Speed
        var voiceSpeed = settings.voiceSpeed;
        rows.appendChild(_buildRow('Voice Speed', _buildSlider({
            min: 0.5, max: 2.0, step: 0.1, value: voiceSpeed,
            blocks: 10,
            formatValue: function (v) { return v.toFixed(1) + 'x'; },
            onChange: function (v) {
                _setSetting('voiceSpeed', v);
                if (window.Latency.VoiceManager && window.Latency.VoiceManager.setRate) {
                    window.Latency.VoiceManager.setRate(v);
                }
            }
        })));

        // ── DISPLAY section ──
        rows.appendChild(_el('div', 'settings-section-header', 'DISPLAY'));

        // Text Speed
        var textSpeedMs = settings.textSpeed;
        var textSpeedLabel = _textSpeedToLabel(textSpeedMs);
        rows.appendChild(_buildRow('Text Speed', _buildTextSpeedControl(textSpeedMs)));

        // Screen Shake
        rows.appendChild(_buildRow('Screen Shake', _buildToggle(settings.screenShake, function (enabled) {
            _setSetting('screenShake', enabled);
        })));

        // CRT Scanlines
        var scanlinesOn = document.body.classList.contains('scanlines');
        rows.appendChild(_buildRow('CRT Scanlines', _buildToggle(scanlinesOn, function (enabled) {
            _setSetting('crtScanlines', enabled);
            if (enabled) {
                document.body.classList.add('scanlines');
            } else {
                document.body.classList.remove('scanlines');
            }
        })));

        // ── GAME section ──
        rows.appendChild(_el('div', 'settings-section-header', 'GAME'));

        // Auto-save
        rows.appendChild(_buildRow('Auto-save', _buildToggle(settings.autoSave, function (enabled) {
            _setSetting('autoSave', enabled);
        })));

        screen.appendChild(rows);

        // ── Danger zone ──
        var dangerZone = _el('div', 'settings-danger-zone');
        dangerZone.appendChild(_el('div', 'settings-danger-label', '// DANGER ZONE'));

        var deleteBtn = _el('button', 'settings-delete-btn', '[ DELETE ALL SAVES ]');
        deleteBtn.setAttribute('type', 'button');
        _bind(deleteBtn, 'click', function () {
            _showConfirm(
                'DELETE ALL SAVE DATA?\nThis action cannot be undone.',
                function () {
                    _deleteAllSaves();
                }
            );
        });
        dangerZone.appendChild(deleteBtn);

        // Center the danger zone within max-width
        var dangerWrap = _el('div', 'settings-rows');
        dangerWrap.style.marginTop = '0';
        dangerWrap.appendChild(dangerZone);
        screen.appendChild(dangerWrap);

        // Back button
        var backBtn = _el('button', 'settings-back', '[ BACK ]');
        backBtn.setAttribute('type', 'button');
        _bind(backBtn, 'click', _onBack);
        screen.appendChild(backBtn);

        frag.appendChild(screen);
        return frag;
    }

    // -------------------------------------------------------------------
    // Row builder
    // -------------------------------------------------------------------

    function _buildRow(label, controlElement) {
        var row = _el('div', 'settings-row');
        row.appendChild(_el('div', 'settings-row-label', label));

        var control = _el('div', 'settings-row-control');
        control.appendChild(controlElement);
        row.appendChild(control);

        return row;
    }

    // -------------------------------------------------------------------
    // Text Speed control (3-state: slow / normal / fast)
    // -------------------------------------------------------------------

    function _textSpeedToLabel(ms) {
        if (ms >= 50) return 'SLOW';
        if (ms <= 15) return 'FAST';
        return 'NORMAL';
    }

    function _buildTextSpeedControl(currentMs) {
        var speeds = [
            { label: 'SLOW',   ms: 50 },
            { label: 'NORMAL', ms: 30 },
            { label: 'FAST',   ms: 15 }
        ];

        var wrap = _el('div', 'settings-slider-wrap');

        var buttons = [];
        for (var i = 0; i < speeds.length; i++) {
            (function (speed, idx) {
                var btn = _el('button', 'settings-toggle', speed.label);
                btn.setAttribute('type', 'button');

                if (currentMs === speed.ms || _textSpeedToLabel(currentMs) === speed.label) {
                    btn.classList.add('toggle-on');
                } else {
                    btn.classList.add('toggle-off');
                }

                _bind(btn, 'click', function () {
                    // Update all buttons
                    for (var b = 0; b < buttons.length; b++) {
                        buttons[b].classList.remove('toggle-on', 'toggle-off');
                        buttons[b].classList.add('toggle-off');
                    }
                    btn.classList.remove('toggle-off');
                    btn.classList.add('toggle-on');

                    _setSetting('textSpeed', speed.ms);
                    if (window.Latency.Typewriter && window.Latency.Typewriter.setSpeed) {
                        window.Latency.Typewriter.setSpeed(speed.ms);
                    }
                });

                buttons.push(btn);
                wrap.appendChild(btn);
            })(speeds[i], i);
        }

        return wrap;
    }

    // -------------------------------------------------------------------
    // Read current manager states
    // -------------------------------------------------------------------

    function _getMusicVolume() {
        if (window.Latency.MusicManager && typeof window.Latency.MusicManager.getVolume === 'function') {
            return window.Latency.MusicManager.getVolume();
        }
        return 0.5;
    }

    function _getMusicMuted() {
        if (window.Latency.MusicManager && typeof window.Latency.MusicManager.isMuted === 'function') {
            return window.Latency.MusicManager.isMuted();
        }
        return false;
    }

    function _getSfxVolume() {
        if (window.Latency.SfxManager && typeof window.Latency.SfxManager.getVolume === 'function') {
            return window.Latency.SfxManager.getVolume();
        }
        return 0.6;
    }

    function _getSfxMuted() {
        if (window.Latency.SfxManager && typeof window.Latency.SfxManager.isMuted === 'function') {
            return window.Latency.SfxManager.isMuted();
        }
        return false;
    }

    function _getVoiceEnabled() {
        if (window.Latency.VoiceManager && typeof window.Latency.VoiceManager.isEnabled === 'function') {
            return window.Latency.VoiceManager.isEnabled();
        }
        return true;
    }

    // -------------------------------------------------------------------
    // Delete all saves
    // -------------------------------------------------------------------

    function _deleteAllSaves() {
        var SM = window.Latency.SaveManager;
        if (!SM) {
            console.warn('[Settings] SaveManager not available.');
            return;
        }

        if (typeof SM.listSaves === 'function' && typeof SM.deleteSave === 'function') {
            var saves = SM.listSaves();
            for (var i = 0; i < saves.length; i++) {
                if (!saves[i].isEmpty) {
                    SM.deleteSave(saves[i].slotIndex);
                }
            }
        }

        // Also clear the legacy key if present
        try {
            localStorage.removeItem('latency_save');
        } catch (e) { /* ignore */ }

        // Notify
        if (window.Latency.Notification && window.Latency.Notification.show) {
            window.Latency.Notification.show('All save data deleted.', 'warning');
        }

        console.log('[Settings] All save data deleted.');
    }

    // -------------------------------------------------------------------
    // Confirmation dialog
    // -------------------------------------------------------------------

    function _showConfirm(message, onConfirm) {
        _dismissConfirm();

        var overlay = _el('div', 'settings-confirm-overlay');
        var dialog = _el('div', 'settings-confirm-dialog');

        var msg = _el('div', 'settings-confirm-message');
        // Support newlines in message
        var lines = message.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (i > 0) msg.appendChild(document.createElement('br'));
            msg.appendChild(document.createTextNode(lines[i]));
        }
        dialog.appendChild(msg);

        var buttons = _el('div', 'settings-confirm-buttons');

        var yesBtn = _el('button', 'settings-confirm-btn btn-yes', 'YES');
        yesBtn.setAttribute('type', 'button');
        _bind(yesBtn, 'click', function () {
            _dismissConfirm();
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        });
        buttons.appendChild(yesBtn);

        var noBtn = _el('button', 'settings-confirm-btn btn-no', 'NO');
        noBtn.setAttribute('type', 'button');
        _bind(noBtn, 'click', function () {
            _dismissConfirm();
        });
        buttons.appendChild(noBtn);

        dialog.appendChild(buttons);
        overlay.appendChild(dialog);

        if (_container) {
            var screenEl = _container.querySelector('.settings-screen');
            if (screenEl) {
                screenEl.appendChild(overlay);
                _confirmOverlay = overlay;
                noBtn.focus();
            }
        }
    }

    function _dismissConfirm() {
        if (_confirmOverlay && _confirmOverlay.parentNode) {
            _confirmOverlay.parentNode.removeChild(_confirmOverlay);
        }
        _confirmOverlay = null;
    }

    // -------------------------------------------------------------------
    // Navigation
    // -------------------------------------------------------------------

    function _onBack() {
        if (window.Latency.StateMachine && typeof window.Latency.StateMachine.back === 'function') {
            window.Latency.StateMachine.back();
            return;
        }

        // Fallback: go to menu
        if (window.Latency.ScreenManager && typeof window.Latency.ScreenManager.show === 'function') {
            window.Latency.ScreenManager.show('menu');
        }
    }

    // -------------------------------------------------------------------
    // Apply persisted settings on mount
    // -------------------------------------------------------------------

    function _applyPersistedSettings() {
        var settings = _loadSettings();

        // Apply CRT scanlines
        if (settings.crtScanlines) {
            document.body.classList.add('scanlines');
        } else {
            document.body.classList.remove('scanlines');
        }

        // Apply text speed
        if (window.Latency.Typewriter && window.Latency.Typewriter.setSpeed) {
            window.Latency.Typewriter.setSpeed(settings.textSpeed);
        }

        // Apply voice speed
        if (window.Latency.VoiceManager && window.Latency.VoiceManager.setRate) {
            window.Latency.VoiceManager.setRate(settings.voiceSpeed);
        }
    }

    // -------------------------------------------------------------------
    // Public API - Screen contract
    // -------------------------------------------------------------------

    return {
        /**
         * Mount the settings screen into the given container.
         * @param {HTMLElement} container - The #screen-container element.
         * @param {Object} [params] - Optional parameters (unused).
         */
        mount: function (container, params) {
            _container = container;
            _listeners = [];
            _confirmOverlay = null;

            // Apply any persisted settings to managers
            _applyPersistedSettings();

            // Build and insert DOM
            var dom = _buildScreen();
            _container.appendChild(dom);

            // Focus the first interactive element
            var firstBtn = _container.querySelector('.settings-toggle, .settings-slider-btn');
            if (firstBtn) {
                firstBtn.focus();
            }

            console.log('[Settings] Mounted.');
        },

        /**
         * Unmount the settings screen, cleaning up listeners and DOM.
         */
        unmount: function () {
            _dismissConfirm();

            for (var i = 0; i < _listeners.length; i++) {
                var entry = _listeners[i];
                entry.element.removeEventListener(entry.event, entry.handler);
            }
            _listeners = [];

            if (_container) {
                _container.innerHTML = '';
            }
            _container = null;

            console.log('[Settings] Unmounted.');
        },

        /**
         * Static helper: apply persisted settings at game boot
         * (before the settings screen is ever mounted).
         */
        applyPersistedSettings: _applyPersistedSettings,

        /**
         * Static helper: read a setting value.
         * @param {string} key
         * @returns {*}
         */
        getSetting: _getSetting
    };
})();

// Registration handled by main.js _registerAllScreens()
