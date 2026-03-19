/**
 * LATENCY - Save/Load Screen
 * ============================================================
 * Full-screen overlay for managing save slots. Displays 5 manual
 * save slots plus a read-only autosave slot at the top. Each slot
 * shows character name, race, level, playtime, and timestamp.
 * Includes confirmation dialogs for overwrite and delete actions.
 *
 * Depends on: Latency.EventBus, Latency.SaveManager,
 *             Latency.StateMachine, Latency.ScreenManager
 *
 * Transitions:
 *   BACK -> StateMachine.back() (returns to previous screen)
 *
 * Screen contract: implements mount(container, params) and unmount()
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.SaveLoad = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Private state
    // -------------------------------------------------------------------

    var _container = null;
    var _listeners = [];
    var _confirmOverlay = null;

    /** Whether we are in gameplay (enables Save buttons) */
    var _canSave = false;

    // -------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------

    /**
     * Create a DOM element with optional class and text.
     * @param {string} tag
     * @param {string} [className]
     * @param {string} [textContent]
     * @returns {HTMLElement}
     */
    function _el(tag, className, textContent) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (textContent !== undefined) el.textContent = textContent;
        return el;
    }

    /**
     * Bind an event listener and track it for cleanup.
     * @param {HTMLElement} element
     * @param {string} event
     * @param {Function} handler
     */
    function _bind(element, event, handler) {
        element.addEventListener(event, handler);
        _listeners.push({ element: element, event: event, handler: handler });
    }

    // -------------------------------------------------------------------
    // Style injection (one-time)
    // -------------------------------------------------------------------

    var _stylesInjected = false;

    function _injectStyles() {
        if (_stylesInjected) return;
        _stylesInjected = true;

        var css = [
            '.saveload-screen {',
            '  display: flex;',
            '  flex-direction: column;',
            '  height: 100%;',
            '  padding: 2rem;',
            '  box-sizing: border-box;',
            '  overflow-y: auto;',
            '  font-family: var(--font-mono, "Courier New", monospace);',
            '  color: var(--text-primary, #00ff88);',
            '}',
            '',
            '.saveload-title {',
            '  text-align: center;',
            '  font-size: var(--text-2xl, 2rem);',
            '  letter-spacing: var(--tracking-widest, 0.2em);',
            '  margin-bottom: 0.5rem;',
            '  text-shadow: var(--text-glow, 0 0 8px rgba(0,255,136,0.6));',
            '}',
            '',
            '.saveload-separator {',
            '  text-align: center;',
            '  color: var(--text-dim, #445566);',
            '  margin-bottom: 1.5rem;',
            '  font-size: var(--text-sm, 0.75rem);',
            '}',
            '',
            '.saveload-slots {',
            '  display: flex;',
            '  flex-direction: column;',
            '  gap: 0.75rem;',
            '  flex: 1;',
            '  max-width: 700px;',
            '  margin: 0 auto;',
            '  width: 100%;',
            '}',
            '',
            '.save-slot {',
            '  display: flex;',
            '  align-items: center;',
            '  gap: 1rem;',
            '  padding: 0.75rem 1rem;',
            '  border: 1px solid var(--border-color, rgba(0,255,136,0.12));',
            '  background: var(--bg-panel, #1a1a2e);',
            '  transition: border-color 0.2s ease, box-shadow 0.2s ease;',
            '}',
            '',
            '.save-slot:hover {',
            '  border-color: var(--border-color-hover, rgba(0,255,136,0.3));',
            '  box-shadow: var(--border-glow, 0 0 10px rgba(0,255,136,0.3));',
            '}',
            '',
            '.save-slot.autosave-slot {',
            '  border-color: var(--accent-2, #00d4ff);',
            '  border-left: 3px solid var(--accent-2, #00d4ff);',
            '}',
            '',
            '.save-slot-label {',
            '  font-size: var(--text-sm, 0.75rem);',
            '  color: var(--text-secondary, #8899aa);',
            '  letter-spacing: var(--tracking-wider, 0.1em);',
            '  min-width: 90px;',
            '  text-transform: uppercase;',
            '}',
            '',
            '.save-slot-info {',
            '  flex: 1;',
            '  display: flex;',
            '  flex-direction: column;',
            '  gap: 0.15rem;',
            '}',
            '',
            '.save-slot-name {',
            '  font-size: var(--text-base, 0.875rem);',
            '  color: var(--text-primary, #00ff88);',
            '  font-weight: 700;',
            '}',
            '',
            '.save-slot-details {',
            '  font-size: var(--text-xs, 0.625rem);',
            '  color: var(--text-dim, #445566);',
            '  display: flex;',
            '  gap: 1rem;',
            '}',
            '',
            '.save-slot-empty {',
            '  font-size: var(--text-base, 0.875rem);',
            '  color: var(--text-muted, #334455);',
            '  font-style: italic;',
            '  flex: 1;',
            '}',
            '',
            '.save-slot-actions {',
            '  display: flex;',
            '  gap: 0.5rem;',
            '}',
            '',
            '.save-slot-btn {',
            '  padding: 0.3rem 0.75rem;',
            '  font-family: var(--font-mono, "Courier New", monospace);',
            '  font-size: var(--text-xs, 0.625rem);',
            '  letter-spacing: var(--tracking-wide, 0.05em);',
            '  border: 1px solid var(--border-color, rgba(0,255,136,0.12));',
            '  background: var(--bg-secondary, #12121a);',
            '  color: var(--text-primary, #00ff88);',
            '  cursor: pointer;',
            '  text-transform: uppercase;',
            '  transition: background 0.15s, border-color 0.15s, color 0.15s;',
            '}',
            '',
            '.save-slot-btn:hover:not(:disabled) {',
            '  background: var(--bg-elevated, #22223a);',
            '  border-color: var(--text-primary, #00ff88);',
            '}',
            '',
            '.save-slot-btn:disabled {',
            '  opacity: 0.3;',
            '  cursor: not-allowed;',
            '}',
            '',
            '.save-slot-btn.btn-delete {',
            '  color: var(--color-danger, #ff2d75);',
            '  border-color: rgba(255, 45, 117, 0.2);',
            '}',
            '',
            '.save-slot-btn.btn-delete:hover:not(:disabled) {',
            '  border-color: var(--color-danger, #ff2d75);',
            '  background: rgba(255, 45, 117, 0.1);',
            '}',
            '',
            '.save-slot-btn.btn-load {',
            '  color: var(--accent-2, #00d4ff);',
            '  border-color: rgba(0, 212, 255, 0.2);',
            '}',
            '',
            '.save-slot-btn.btn-load:hover:not(:disabled) {',
            '  border-color: var(--accent-2, #00d4ff);',
            '  background: rgba(0, 212, 255, 0.1);',
            '}',
            '',
            '.saveload-back {',
            '  display: block;',
            '  margin: 1.5rem auto 0;',
            '  padding: 0.5rem 2rem;',
            '  font-family: var(--font-mono, "Courier New", monospace);',
            '  font-size: var(--text-base, 0.875rem);',
            '  letter-spacing: var(--tracking-wider, 0.1em);',
            '  border: 1px solid var(--border-color, rgba(0,255,136,0.12));',
            '  background: var(--bg-secondary, #12121a);',
            '  color: var(--text-primary, #00ff88);',
            '  cursor: pointer;',
            '  text-transform: uppercase;',
            '  transition: background 0.15s, border-color 0.15s;',
            '}',
            '',
            '.saveload-back:hover {',
            '  background: var(--bg-elevated, #22223a);',
            '  border-color: var(--text-primary, #00ff88);',
            '  box-shadow: var(--border-glow, 0 0 10px rgba(0,255,136,0.3));',
            '}',
            '',
            '/* Confirmation dialog */',
            '.confirm-overlay {',
            '  position: absolute;',
            '  top: 0; left: 0; right: 0; bottom: 0;',
            '  background: var(--bg-overlay, rgba(10,10,15,0.85));',
            '  display: flex;',
            '  justify-content: center;',
            '  align-items: center;',
            '  z-index: 10;',
            '}',
            '',
            '.confirm-dialog {',
            '  background: var(--bg-panel, #1a1a2e);',
            '  border: 1px solid var(--border-color-focus, rgba(0,255,136,0.5));',
            '  box-shadow: var(--shadow-elevated, 0 8px 32px rgba(0,0,0,0.6));',
            '  padding: 1.5rem 2rem;',
            '  max-width: 400px;',
            '  text-align: center;',
            '  font-family: var(--font-mono, "Courier New", monospace);',
            '}',
            '',
            '.confirm-message {',
            '  color: var(--text-primary, #00ff88);',
            '  font-size: var(--text-base, 0.875rem);',
            '  margin-bottom: 1.25rem;',
            '  line-height: 1.5;',
            '}',
            '',
            '.confirm-buttons {',
            '  display: flex;',
            '  justify-content: center;',
            '  gap: 1rem;',
            '}',
            '',
            '.confirm-btn {',
            '  padding: 0.4rem 1.5rem;',
            '  font-family: var(--font-mono, "Courier New", monospace);',
            '  font-size: var(--text-sm, 0.75rem);',
            '  letter-spacing: var(--tracking-wide, 0.05em);',
            '  border: 1px solid var(--border-color, rgba(0,255,136,0.12));',
            '  background: var(--bg-secondary, #12121a);',
            '  cursor: pointer;',
            '  text-transform: uppercase;',
            '  transition: background 0.15s, border-color 0.15s;',
            '}',
            '',
            '.confirm-btn.btn-yes {',
            '  color: var(--color-warning, #ff6b35);',
            '  border-color: rgba(255, 107, 53, 0.3);',
            '}',
            '',
            '.confirm-btn.btn-yes:hover {',
            '  background: rgba(255, 107, 53, 0.15);',
            '  border-color: var(--color-warning, #ff6b35);',
            '}',
            '',
            '.confirm-btn.btn-no {',
            '  color: var(--text-secondary, #8899aa);',
            '  border-color: rgba(136, 153, 170, 0.2);',
            '}',
            '',
            '.confirm-btn.btn-no:hover {',
            '  background: var(--bg-elevated, #22223a);',
            '  border-color: var(--text-secondary, #8899aa);',
            '}'
        ].join('\n');

        var style = document.createElement('style');
        style.setAttribute('data-module', 'save-load-screen');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // -------------------------------------------------------------------
    // DOM Construction
    // -------------------------------------------------------------------

    /**
     * Build the complete save/load screen DOM.
     * @returns {DocumentFragment}
     */
    function _buildScreen() {
        var frag = document.createDocumentFragment();
        var screen = _el('div', 'saveload-screen');

        // Title
        screen.appendChild(_el('div', 'saveload-title', 'SAVE / LOAD'));

        // Separator
        screen.appendChild(_el('div', 'saveload-separator',
            '════════════════════════════════════════'));

        // Slots container
        var slotsContainer = _el('div', 'saveload-slots');

        // Get save data
        var saves = [];
        if (window.Latency.SaveManager && typeof window.Latency.SaveManager.listSaves === 'function') {
            saves = window.Latency.SaveManager.listSaves();
        } else {
            // Generate empty slot data if SaveManager isn't available
            saves.push({ slotIndex: -1, isEmpty: true, isAutosave: true,
                characterName: '---', race: '---', level: 0,
                playtime: '00:00:00', formattedDate: '---' });
            for (var s = 0; s < 5; s++) {
                saves.push({ slotIndex: s, isEmpty: true, isAutosave: false,
                    characterName: '---', race: '---', level: 0,
                    playtime: '00:00:00', formattedDate: '---' });
            }
        }

        // Render each slot
        for (var i = 0; i < saves.length; i++) {
            slotsContainer.appendChild(_buildSlotRow(saves[i]));
        }

        screen.appendChild(slotsContainer);

        // Back button
        var backBtn = _el('button', 'saveload-back', '[ BACK ]');
        backBtn.setAttribute('type', 'button');
        _bind(backBtn, 'click', _onBack);
        screen.appendChild(backBtn);

        frag.appendChild(screen);
        return frag;
    }

    /**
     * Build a single save slot row.
     * @param {Object} slotData - Metadata for the slot.
     * @returns {HTMLElement}
     */
    function _buildSlotRow(slotData) {
        var row = _el('div', 'save-slot');
        if (slotData.isAutosave) {
            row.classList.add('autosave-slot');
        }

        // Label
        var label;
        if (slotData.isAutosave) {
            label = 'AUTOSAVE';
        } else {
            label = 'SLOT ' + (slotData.slotIndex + 1);
        }
        row.appendChild(_el('div', 'save-slot-label', label));

        // Info section
        if (slotData.isEmpty) {
            row.appendChild(_el('div', 'save-slot-empty', '--- EMPTY ---'));
        } else {
            var info = _el('div', 'save-slot-info');

            var nameLine = _el('div', 'save-slot-name',
                slotData.characterName + '  //  ' + slotData.race + '  //  LVL ' + slotData.level);
            info.appendChild(nameLine);

            var details = _el('div', 'save-slot-details');
            details.appendChild(_el('span', null, 'Time: ' + slotData.playtime));
            details.appendChild(_el('span', null, 'Saved: ' + slotData.formattedDate));
            info.appendChild(details);

            row.appendChild(info);
        }

        // Action buttons
        var actions = _el('div', 'save-slot-actions');

        // Save button (only for manual slots, only during gameplay)
        if (!slotData.isAutosave) {
            var saveBtn = _el('button', 'save-slot-btn', 'SAVE');
            saveBtn.setAttribute('type', 'button');
            if (!_canSave) {
                saveBtn.disabled = true;
                saveBtn.title = 'Can only save during gameplay';
            }
            (function (idx, isEmpty) {
                _bind(saveBtn, 'click', function () {
                    if (!isEmpty) {
                        _showConfirm('Overwrite Slot ' + (idx + 1) + '?', function () {
                            _doSave(idx);
                        });
                    } else {
                        _doSave(idx);
                    }
                });
            })(slotData.slotIndex, slotData.isEmpty);
            actions.appendChild(saveBtn);
        }

        // Load button
        var loadBtn = _el('button', 'save-slot-btn btn-load', 'LOAD');
        loadBtn.setAttribute('type', 'button');
        if (slotData.isEmpty) {
            loadBtn.disabled = true;
        }
        (function (idx) {
            _bind(loadBtn, 'click', function () {
                _showConfirm('Load this save? Unsaved progress will be lost.', function () {
                    _doLoad(idx);
                });
            });
        })(slotData.slotIndex);
        actions.appendChild(loadBtn);

        // Delete button (not for autosave)
        if (!slotData.isAutosave) {
            var delBtn = _el('button', 'save-slot-btn btn-delete', 'DEL');
            delBtn.setAttribute('type', 'button');
            if (slotData.isEmpty) {
                delBtn.disabled = true;
            }
            (function (idx) {
                _bind(delBtn, 'click', function () {
                    _showConfirm('Permanently delete Slot ' + (idx + 1) + '?', function () {
                        _doDelete(idx);
                    });
                });
            })(slotData.slotIndex);
            actions.appendChild(delBtn);
        }

        row.appendChild(actions);
        return row;
    }

    // -------------------------------------------------------------------
    // Confirmation dialog
    // -------------------------------------------------------------------

    /**
     * Show a confirmation dialog overlay.
     * @param {string} message - Question to display.
     * @param {Function} onConfirm - Callback if the user confirms.
     */
    function _showConfirm(message, onConfirm) {
        _dismissConfirm();

        var overlay = _el('div', 'confirm-overlay');
        var dialog = _el('div', 'confirm-dialog');

        dialog.appendChild(_el('div', 'confirm-message', message));

        var buttons = _el('div', 'confirm-buttons');

        var yesBtn = _el('button', 'confirm-btn btn-yes', 'YES');
        yesBtn.setAttribute('type', 'button');
        _bind(yesBtn, 'click', function () {
            _dismissConfirm();
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        });
        buttons.appendChild(yesBtn);

        var noBtn = _el('button', 'confirm-btn btn-no', 'NO');
        noBtn.setAttribute('type', 'button');
        _bind(noBtn, 'click', function () {
            _dismissConfirm();
        });
        buttons.appendChild(noBtn);

        dialog.appendChild(buttons);
        overlay.appendChild(dialog);

        // Append to our screen container
        if (_container) {
            var screenEl = _container.querySelector('.saveload-screen');
            if (screenEl) {
                screenEl.style.position = 'relative';
                screenEl.appendChild(overlay);
                _confirmOverlay = overlay;

                // Focus the No button by default (safer)
                noBtn.focus();
            }
        }
    }

    /**
     * Remove the active confirmation dialog.
     */
    function _dismissConfirm() {
        if (_confirmOverlay && _confirmOverlay.parentNode) {
            _confirmOverlay.parentNode.removeChild(_confirmOverlay);
        }
        _confirmOverlay = null;
    }

    // -------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------

    function _doSave(slotIndex) {
        if (window.Latency.SaveManager && typeof window.Latency.SaveManager.save === 'function') {
            window.Latency.SaveManager.save(slotIndex);
        }
        _refreshSlots();
    }

    function _doLoad(slotIndex) {
        if (window.Latency.SaveManager && typeof window.Latency.SaveManager.load === 'function') {
            window.Latency.SaveManager.load(slotIndex);
        }
        // The load operation will trigger a screen transition,
        // so we don't need to do anything else here.
    }

    function _doDelete(slotIndex) {
        if (window.Latency.SaveManager && typeof window.Latency.SaveManager.deleteSave === 'function') {
            window.Latency.SaveManager.deleteSave(slotIndex);
        }
        _refreshSlots();
    }

    /**
     * Rebuild the slots display after a save/delete action.
     */
    function _refreshSlots() {
        if (!_container) return;

        var screenEl = _container.querySelector('.saveload-screen');
        if (!screenEl) return;

        var slotsContainer = screenEl.querySelector('.saveload-slots');
        if (!slotsContainer) return;

        // Clear existing listener refs for slot buttons
        // (we'll re-bind when rebuilding)
        _listeners = _listeners.filter(function (entry) {
            // Keep only the back button listener
            if (entry.element.classList &&
                entry.element.classList.contains('saveload-back')) {
                return true;
            }
            entry.element.removeEventListener(entry.event, entry.handler);
            return false;
        });

        // Clear and rebuild slots
        slotsContainer.innerHTML = '';

        var saves = [];
        if (window.Latency.SaveManager && typeof window.Latency.SaveManager.listSaves === 'function') {
            saves = window.Latency.SaveManager.listSaves();
        }

        for (var i = 0; i < saves.length; i++) {
            slotsContainer.appendChild(_buildSlotRow(saves[i]));
        }
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
    // Public API — Screen contract
    // -------------------------------------------------------------------

    return {
        /**
         * Mount the save/load screen into the given container.
         * @param {HTMLElement} container - The #screen-container element.
         * @param {Object} [params] - Optional parameters.
         * @param {boolean} [params.canSave] - Whether save buttons should be enabled.
         */
        mount: function (container, params) {
            _injectStyles();

            _container = container;
            _listeners = [];
            _confirmOverlay = null;

            // Determine if we are in a gameplay state (save is allowed)
            params = params || {};
            if (params.canSave !== undefined) {
                _canSave = !!params.canSave;
            } else {
                // Auto-detect: if previous state was gameplay or combat, allow saving
                var prevState = null;
                if (window.Latency.StateMachine &&
                    typeof window.Latency.StateMachine.getPreviousState === 'function') {
                    prevState = window.Latency.StateMachine.getPreviousState();
                }
                _canSave = (prevState === 'gameplay' || prevState === 'combat');
            }

            var dom = _buildScreen();
            _container.appendChild(dom);

            // Focus the first enabled button
            var firstBtn = _container.querySelector('.save-slot-btn:not([disabled])');
            if (firstBtn) {
                firstBtn.focus();
            }

            console.log('[SaveLoad] Mounted. canSave=' + _canSave);
        },

        /**
         * Unmount the save/load screen, cleaning up listeners and DOM.
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

            console.log('[SaveLoad] Unmounted.');
        }
    };
})();
