/**
 * LATENCY - SaveManager
 * ============================================================
 * localStorage-based save/load system with 5 manual save slots
 * and a rolling autosave. Captures the full game state snapshot
 * including character, story progress, music position, and
 * screen context.
 *
 * Depends on: Latency.EventBus, Latency.MusicManager,
 *             Latency.StateMachine, Latency.ScreenManager
 *
 * Usage:
 *   Latency.SaveManager.save(0);       // save to slot 0
 *   Latency.SaveManager.autoSave();    // autosave
 *   Latency.SaveManager.load(0);       // load from slot 0
 *   Latency.SaveManager.listSaves();   // list all save metadata
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.SaveManager = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------

    var SAVE_PREFIX = 'latency_save_';
    var AUTO_SAVE_KEY = 'latency_autosave';
    var MAX_SLOTS = 5;
    var SAVE_VERSION = 1;

    // -------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------

    /**
     * Get the localStorage key for a given slot index.
     * @param {number} slotIndex
     * @returns {string}
     */
    function _slotKey(slotIndex) {
        return SAVE_PREFIX + slotIndex;
    }

    /**
     * Emit an event via EventBus if available.
     * @param {string} event
     * @param {*} [data]
     */
    function _emit(event, data) {
        if (window.Latency && window.Latency.EventBus &&
            typeof window.Latency.EventBus.emit === 'function') {
            window.Latency.EventBus.emit(event, data);
        }
    }

    /**
     * Format a timestamp into a human-readable date/time string.
     * @param {number} ts - Unix timestamp in milliseconds.
     * @returns {string}
     */
    function _formatTimestamp(ts) {
        if (!ts) return '---';
        try {
            var d = new Date(ts);
            var year = d.getFullYear();
            var month = String(d.getMonth() + 1).padStart(2, '0');
            var day = String(d.getDate()).padStart(2, '0');
            var hours = String(d.getHours()).padStart(2, '0');
            var mins = String(d.getMinutes()).padStart(2, '0');
            return year + '-' + month + '-' + day + ' ' + hours + ':' + mins;
        } catch (e) {
            return '---';
        }
    }

    /**
     * Format playtime in seconds into HH:MM:SS.
     * @param {number} seconds
     * @returns {string}
     */
    function _formatPlaytime(seconds) {
        if (!seconds || seconds < 0) return '00:00:00';
        seconds = Math.floor(seconds);
        var h = Math.floor(seconds / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = seconds % 60;
        return (
            String(h).padStart(2, '0') + ':' +
            String(m).padStart(2, '0') + ':' +
            String(s).padStart(2, '0')
        );
    }

    // -------------------------------------------------------------------
    // State capture
    // -------------------------------------------------------------------

    /**
     * Capture the current game state into a serialisable object.
     *
     * @returns {Object} Complete state snapshot.
     */
    function captureState() {
        var state = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            playtime: 0,
            character: null,
            currentNodeId: null,
            musicState: null,
            screenState: null
        };

        // Playtime — look for a global playtime tracker
        if (window.Latency.GameState && typeof window.Latency.GameState.getPlaytime === 'function') {
            state.playtime = window.Latency.GameState.getPlaytime();
        } else if (window.Latency._playtime) {
            state.playtime = window.Latency._playtime;
        }

        // Character data
        if (window.Latency.GameState && window.Latency.GameState.character) {
            var char = window.Latency.GameState.character;
            // If character has a serialize method, use it
            if (typeof char.serialize === 'function') {
                state.character = char.serialize();
            } else {
                // Deep-clone plain object character data
                try {
                    state.character = JSON.parse(JSON.stringify(char));
                } catch (e) {
                    console.warn('[SaveManager] Could not serialize character:', e);
                }
            }
        }

        // Current story node
        if (window.Latency.GameState && window.Latency.GameState.currentNodeId) {
            state.currentNodeId = window.Latency.GameState.currentNodeId;
        }

        // Music state
        if (window.Latency.MusicManager && typeof window.Latency.MusicManager.getState === 'function') {
            state.musicState = window.Latency.MusicManager.getState();
        }

        // Screen / state machine state
        if (window.Latency.StateMachine && typeof window.Latency.StateMachine.getCurrentState === 'function') {
            state.screenState = window.Latency.StateMachine.getCurrentState();
        }

        // Sub-system state
        state.inventory = window.Latency.Inventory && window.Latency.Inventory.serialize ? window.Latency.Inventory.serialize() : null;
        state.skills = window.Latency.SkillSystem && window.Latency.SkillSystem.serialize ? window.Latency.SkillSystem.serialize() : null;
        state.buffs = window.Latency.BuffSystem && window.Latency.BuffSystem.serialize ? window.Latency.BuffSystem.serialize() : null;
        state.factions = window.Latency.FactionSystem && window.Latency.FactionSystem.serialize ? window.Latency.FactionSystem.serialize() : null;
        state.job = window.Latency.JobSystem && window.Latency.JobSystem.serialize ? window.Latency.JobSystem.serialize() : null;
        state.npc = window.Latency.NpcSystem && window.Latency.NpcSystem.serialize ? window.Latency.NpcSystem.serialize() : null;

        return state;
    }

    // -------------------------------------------------------------------
    // Save
    // -------------------------------------------------------------------

    /**
     * Save the current game state to a numbered slot.
     *
     * @param {number} slotIndex - Slot number (0 through MAX_SLOTS - 1).
     * @returns {boolean} True if save succeeded.
     */
    function save(slotIndex) {
        if (typeof slotIndex !== 'number' || slotIndex < 0 || slotIndex >= MAX_SLOTS) {
            console.error('[SaveManager] save(): invalid slot index ' + slotIndex +
                '. Must be 0-' + (MAX_SLOTS - 1) + '.');
            return false;
        }

        var state = captureState();
        var key = _slotKey(slotIndex);

        try {
            var json = JSON.stringify(state);
            localStorage.setItem(key, json);
        } catch (e) {
            console.error('[SaveManager] save(): failed to write to localStorage.', e);

            // Likely QuotaExceededError
            _emit('notify', {
                message: 'SAVE FAILED: Storage full. Delete old saves.',
                type: 'error'
            });

            return false;
        }

        _emit('save:complete', { slot: slotIndex, timestamp: state.timestamp });
        _emit('notify', {
            message: 'Game saved to Slot ' + (slotIndex + 1) + '.',
            type: 'success'
        });

        console.log('[SaveManager] Saved to slot ' + slotIndex + '.');
        return true;
    }

    /**
     * Perform an autosave using the dedicated autosave key.
     *
     * @returns {boolean} True if autosave succeeded.
     */
    function autoSave() {
        var state = captureState();

        try {
            var json = JSON.stringify(state);
            localStorage.setItem(AUTO_SAVE_KEY, json);
        } catch (e) {
            console.error('[SaveManager] autoSave(): failed to write.', e);
            return false;
        }

        _emit('save:autosave', { timestamp: state.timestamp });

        console.log('[SaveManager] Autosave complete.');
        return true;
    }

    // -------------------------------------------------------------------
    // Load
    // -------------------------------------------------------------------

    /**
     * Load game state from a numbered slot and restore it.
     *
     * @param {number} slotIndex - Slot number (0 through MAX_SLOTS - 1),
     *     or -1 to load the autosave.
     * @returns {boolean} True if load succeeded.
     */
    function load(slotIndex) {
        var key;
        if (slotIndex === -1) {
            key = AUTO_SAVE_KEY;
        } else if (typeof slotIndex === 'number' && slotIndex >= 0 && slotIndex < MAX_SLOTS) {
            key = _slotKey(slotIndex);
        } else {
            console.error('[SaveManager] load(): invalid slot index ' + slotIndex);
            return false;
        }

        var json;
        try {
            json = localStorage.getItem(key);
        } catch (e) {
            console.error('[SaveManager] load(): localStorage read failed.', e);
            return false;
        }

        if (!json) {
            console.warn('[SaveManager] load(): slot ' + slotIndex + ' is empty.');
            _emit('notify', {
                message: 'No save data in this slot.',
                type: 'warning'
            });
            return false;
        }

        var state;
        try {
            state = JSON.parse(json);
        } catch (e) {
            console.error('[SaveManager] load(): corrupt save data in slot ' + slotIndex + '.', e);
            _emit('notify', {
                message: 'Save data is corrupted.',
                type: 'error'
            });
            return false;
        }

        _restoreState(state);

        _emit('save:loaded', { slot: slotIndex, timestamp: state.timestamp });
        _emit('notify', {
            message: slotIndex === -1 ? 'Autosave loaded.' : 'Loaded Slot ' + (slotIndex + 1) + '.',
            type: 'success'
        });

        console.log('[SaveManager] Loaded from slot ' + slotIndex + '.');
        return true;
    }

    // -------------------------------------------------------------------
    // State restoration
    // -------------------------------------------------------------------

    /**
     * Apply a saved state snapshot to the running game.
     *
     * @param {Object} state - State object from captureState().
     */
    function _restoreState(state) {
        if (!state) return;

        // Restore character
        if (state.character) {
            if (!window.Latency.GameState) {
                window.Latency.GameState = {};
            }

            // If there's a Character constructor with a deserialize method, use it
            if (window.Latency.Character && typeof window.Latency.Character.deserialize === 'function') {
                window.Latency.GameState.character = window.Latency.Character.deserialize(state.character);
            } else {
                window.Latency.GameState.character = state.character;
            }
        }

        // Restore story node
        if (state.currentNodeId) {
            if (!window.Latency.GameState) {
                window.Latency.GameState = {};
            }
            window.Latency.GameState.currentNodeId = state.currentNodeId;
        }

        // Restore playtime
        if (state.playtime !== undefined) {
            if (!window.Latency.GameState) {
                window.Latency.GameState = {};
            }
            if (typeof window.Latency.GameState.setPlaytime === 'function') {
                window.Latency.GameState.setPlaytime(state.playtime);
            } else {
                window.Latency._playtime = state.playtime;
            }
        }

        // Restore sub-system state
        if (state.inventory && window.Latency.Inventory && typeof window.Latency.Inventory.deserialize === 'function') {
            window.Latency.Inventory.deserialize(state.inventory);
        }
        if (state.skills && window.Latency.SkillSystem && typeof window.Latency.SkillSystem.deserialize === 'function') {
            window.Latency.SkillSystem.deserialize(state.skills);
        }
        if (state.buffs && window.Latency.BuffSystem && typeof window.Latency.BuffSystem.deserialize === 'function') {
            window.Latency.BuffSystem.deserialize(state.buffs);
        }
        if (state.factions && window.Latency.FactionSystem && typeof window.Latency.FactionSystem.deserialize === 'function') {
            window.Latency.FactionSystem.deserialize(state.factions);
        }
        if (state.job && window.Latency.JobSystem && typeof window.Latency.JobSystem.deserialize === 'function') {
            window.Latency.JobSystem.deserialize(state.job);
        }
        if (state.npc && window.Latency.NpcSystem && typeof window.Latency.NpcSystem.deserialize === 'function') {
            window.Latency.NpcSystem.deserialize(state.npc);
        }

        // Restore music state
        if (state.musicState && window.Latency.MusicManager &&
            typeof window.Latency.MusicManager.restoreState === 'function') {
            window.Latency.MusicManager.restoreState(state.musicState);
        }

        // Transition to the saved screen state
        var L = window.Latency;
        var targetScreen = state.screenState || 'gameplay';

        // Use ScreenManager directly for loading since we may be coming
        // from a menu or saveload screen that wouldn't have a valid
        // StateMachine transition path.
        if (L.ScreenManager && typeof L.ScreenManager.show === 'function') {
            // Re-init state machine then force directly to the target state
            if (L.StateMachine) {
                L.StateMachine.init();
                if (targetScreen !== 'menu') {
                    if (L.StateMachine._forceState) {
                        L.StateMachine._forceState(targetScreen);
                    } else {
                        L.StateMachine.transition(targetScreen);
                    }
                }
            }

            L.ScreenManager.show(targetScreen);
        }
    }

    // -------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------

    /**
     * List all save slots with their metadata.
     *
     * @returns {Array<{slotIndex: number, isEmpty: boolean, isAutosave: boolean,
     *           timestamp: number|null, formattedDate: string,
     *           characterName: string, race: string, level: number,
     *           playtime: string}>}
     */
    function listSaves() {
        var saves = [];

        // Autosave entry (slotIndex = -1)
        saves.push(_readSlotMeta(-1));

        // Manual slots
        for (var i = 0; i < MAX_SLOTS; i++) {
            saves.push(_readSlotMeta(i));
        }

        return saves;
    }

    /**
     * Read metadata from a save slot without fully parsing the state.
     *
     * @param {number} slotIndex - Slot number, or -1 for autosave.
     * @returns {Object} Slot metadata.
     */
    function _readSlotMeta(slotIndex) {
        var key = (slotIndex === -1) ? AUTO_SAVE_KEY : _slotKey(slotIndex);

        var meta = {
            slotIndex: slotIndex,
            isEmpty: true,
            isAutosave: (slotIndex === -1),
            timestamp: null,
            formattedDate: '---',
            characterName: '---',
            race: '---',
            level: 0,
            playtime: '00:00:00'
        };

        try {
            var json = localStorage.getItem(key);
            if (!json) return meta;

            var data = JSON.parse(json);
            meta.isEmpty = false;
            meta.timestamp = data.timestamp || null;
            meta.formattedDate = _formatTimestamp(data.timestamp);
            meta.playtime = _formatPlaytime(data.playtime);

            if (data.character) {
                meta.characterName = data.character.name || data.character.characterName || '???';
                meta.race = data.character.race || data.character.raceName || '???';
                meta.level = data.character.level || 1;
            }
        } catch (e) {
            // Corrupt or inaccessible — treat as empty
            meta.isEmpty = true;
        }

        return meta;
    }

    /**
     * Delete a save from a slot.
     *
     * @param {number} slotIndex - Slot number (0 through MAX_SLOTS - 1).
     * @returns {boolean} True if deletion succeeded.
     */
    function deleteSave(slotIndex) {
        if (typeof slotIndex !== 'number' || slotIndex < 0 || slotIndex >= MAX_SLOTS) {
            console.error('[SaveManager] deleteSave(): invalid slot ' + slotIndex);
            return false;
        }

        try {
            localStorage.removeItem(_slotKey(slotIndex));
        } catch (e) {
            console.error('[SaveManager] deleteSave(): failed.', e);
            return false;
        }

        _emit('save:deleted', { slot: slotIndex });
        _emit('notify', {
            message: 'Slot ' + (slotIndex + 1) + ' deleted.',
            type: 'info'
        });

        console.log('[SaveManager] Deleted slot ' + slotIndex + '.');
        return true;
    }

    /**
     * Check if a specific slot has save data.
     *
     * @param {number} slotIndex - Slot number, or -1 for autosave.
     * @returns {boolean}
     */
    function hasSave(slotIndex) {
        var key = (slotIndex === -1) ? AUTO_SAVE_KEY : _slotKey(slotIndex);

        try {
            return localStorage.getItem(key) !== null;
        } catch (e) {
            return false;
        }
    }

    /**
     * Check if any save data exists (manual slots or autosave).
     * Used by the main menu to enable/disable the CONTINUE button.
     *
     * @returns {boolean}
     */
    function hasAnySave() {
        // Check autosave
        if (hasSave(-1)) return true;

        // Check manual slots
        for (var i = 0; i < MAX_SLOTS; i++) {
            if (hasSave(i)) return true;
        }

        return false;
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    return {
        SAVE_PREFIX: SAVE_PREFIX,
        AUTO_SAVE_KEY: AUTO_SAVE_KEY,
        MAX_SLOTS: MAX_SLOTS,

        captureState: captureState,
        save: save,
        autoSave: autoSave,
        load: load,
        listSaves: listSaves,
        deleteSave: deleteSave,
        hasSave: hasSave,
        hasAnySave: hasAnySave
    };
})();

// Wire up autosave event listener
if (Latency.EventBus) {
    Latency.EventBus.on('autosave:request', function () { Latency.SaveManager.autoSave(); });
}
