/**
 * LATENCY - NarrationManager
 * ============================================================
 * Plays pre-generated MP3 narration audio for story nodes and
 * cutscene slides. Uses its own <audio> element, completely
 * independent of MusicManager.
 *
 * Audio files live under assets/narration/ and are keyed by
 * node ID (dots become slashes) or cutscene ID + slide index.
 *
 * Gracefully degrades: if an audio file does not exist the
 * error is silently swallowed and playback is skipped.
 *
 * Usage:
 *   Latency.NarrationManager.init();
 *   Latency.NarrationManager.play('assets/narration/story/shared/prologue/node_001.mp3');
 *   Latency.NarrationManager.stop();
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.NarrationManager = (function () {
    'use strict';

    // ---------------------------------------------------------------------------
    // Private state
    // ---------------------------------------------------------------------------

    /** @type {HTMLAudioElement|null} */
    var _audio = null;

    /** @type {boolean} */
    var _isPlaying = false;

    /** @type {number} Volume 0.0 - 1.0 */
    var _volume = 0.8;

    /** @type {boolean} */
    var _initialized = false;

    /** @type {string} localStorage key */
    var STORAGE_KEY = 'latency_narration_settings';

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    function _clamp(val, min, max) {
        if (val < min) return min;
        if (val > max) return max;
        return val;
    }

    function _persist() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                volume: _volume
            }));
        } catch (e) { /* ignore */ }
    }

    function _restorePersisted() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var data = JSON.parse(raw);
                if (typeof data.volume === 'number') {
                    _volume = _clamp(data.volume, 0, 1);
                }
            }
        } catch (e) { /* ignore */ }
    }

    // ---------------------------------------------------------------------------
    // Audio event handlers
    // ---------------------------------------------------------------------------

    function _onEnded() {
        _isPlaying = false;
    }

    function _onError() {
        // Silently handle missing / broken narration files
        _isPlaying = false;
    }

    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------

    /**
     * Initialise the NarrationManager. Creates a dedicated <audio> element.
     * Must be called once after DOM is ready.
     */
    function init() {
        if (_initialized) return;

        // Create a private audio element (NOT shared with MusicManager)
        _audio = document.createElement('audio');
        _audio.id = 'narration-player';
        _audio.preload = 'auto';

        // Append to body so it exists in the DOM but is invisible
        document.body.appendChild(_audio);

        _audio.addEventListener('ended', _onEnded);
        _audio.addEventListener('error', _onError);

        _restorePersisted();
        _audio.volume = _volume;

        _initialized = true;
        console.log('[NarrationManager] Initialized.');
    }

    /**
     * Play a narration MP3 file.
     * @param {string} path - Relative path to the MP3, e.g. 'assets/narration/story/shared/prologue/node_001.mp3'
     */
    function play(path) {
        if (!_initialized || !_audio || !path) return;

        // Stop any currently playing narration
        stop();

        _audio.src = path;
        _audio.volume = _volume;
        _isPlaying = true;

        var result = _audio.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function (err) {
                // Autoplay blocked or file not found — silently fail
                _isPlaying = false;
            });
        }
    }

    /**
     * Stop current narration and reset.
     */
    function stop() {
        if (!_audio) return;

        _audio.pause();
        _audio.currentTime = 0;
        _isPlaying = false;
    }

    /**
     * Pause current narration (position preserved).
     */
    function pause() {
        if (!_audio) return;
        _audio.pause();
        _isPlaying = false;
    }

    /**
     * Resume paused narration.
     */
    function resume() {
        if (!_audio || !_audio.src) return;

        _isPlaying = true;
        var result = _audio.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {
                _isPlaying = false;
            });
        }
    }

    /**
     * Set volume (0.0 - 1.0). Persists to localStorage.
     * @param {number} v
     */
    function setVolume(v) {
        _volume = _clamp(Number(v) || 0, 0, 1);
        if (_audio) {
            _audio.volume = _volume;
        }
        _persist();
    }

    /**
     * @returns {number} Current volume 0.0-1.0.
     */
    function getVolume() {
        return _volume;
    }

    /**
     * @returns {boolean} Whether narration is currently playing.
     */
    function isPlaying() {
        return _isPlaying;
    }

    // ---------------------------------------------------------------------------
    // Expose
    // ---------------------------------------------------------------------------

    return {
        init:       init,
        play:       play,
        stop:       stop,
        pause:      pause,
        resume:     resume,
        setVolume:  setVolume,
        getVolume:  getVolume,
        isPlaying:  isPlaying
    };

})();
