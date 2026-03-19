/**
 * LATENCY - MusicManager
 * Persistent 30-track music system that runs independently of screen transitions.
 *
 * The audio element (#music-player) lives inside #music-layer, which is completely
 * separate from #screen-container. This manager is the ONLY system that touches
 * the audio element. It does NOT listen to screen:change events.
 *
 * Usage:
 *   Latency.MusicManager.init();
 *   Latency.MusicManager.play();
 *   Latency.MusicManager.skipTo(5);
 *   Latency.MusicManager.fadeOut(2000);
 *
 *   var state = Latency.MusicManager.getState();   // for save
 *   Latency.MusicManager.restoreState(state);       // for load
 */

window.Latency = window.Latency || {};

window.Latency.MusicManager = (function () {
    'use strict';

    // ---------------------------------------------------------------------------
    // Private state
    // ---------------------------------------------------------------------------

    /** @type {HTMLAudioElement|null} */
    var _audio = null;

    /** @type {Array<{src: string, title: string, artist: string, category: string}>} */
    var _playlist = [];

    /** @type {number} Current track index in _playlist */
    var _currentIndex = 0;

    /** @type {boolean} */
    var _isPlaying = false;

    /** @type {boolean} */
    var _isMuted = false;

    /** @type {number} Master volume 0.0 - 1.0 */
    var _volume = 0.5;

    /** @type {number} Default crossfade duration in ms */
    var _fadeDuration = 2000;

    /** @type {boolean} */
    var _initialized = false;

    /** @type {boolean} Whether the browser autoplay restriction has been cleared */
    var _autoplayUnlocked = false;

    /** @type {number|null} Active fade setInterval id */
    var _fadeInterval = null;

    /** @type {{trackIndex: number, currentTime: number}|null} Saved position for cue playback */
    var _cueReturnState = null;

    /** @type {Function|null} Callback to invoke when a cue track finishes */
    var _cueOnComplete = null;

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    /**
     * Emit an event through the EventBus if it is available.
     * @param {string} event
     * @param {*} [data]
     */
    function _emit(event, data) {
        if (window.Latency && window.Latency.EventBus && typeof window.Latency.EventBus.emit === 'function') {
            window.Latency.EventBus.emit(event, data);
        }
    }

    /**
     * Clamp a number between min and max (inclusive).
     * @param {number} val
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    function _clamp(val, min, max) {
        if (val < min) return min;
        if (val > max) return max;
        return val;
    }

    /**
     * Clear any running fade interval.
     */
    function _clearFade() {
        if (_fadeInterval !== null) {
            clearInterval(_fadeInterval);
            _fadeInterval = null;
        }
    }

    /**
     * Safely attempt to play the audio element, handling the promise rejection
     * that occurs when browsers block autoplay.
     */
    function _safePlay() {
        if (!_audio) return;

        var result = _audio.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function (err) {
                // Autoplay was blocked — the one-time click handler will retry.
                if (err.name === 'NotAllowedError') {
                    _isPlaying = false;
                } else {
                    console.warn('[MusicManager] play() rejected:', err.message);
                }
            });
        }
    }

    // ---------------------------------------------------------------------------
    // Playlist definition
    // ---------------------------------------------------------------------------

    /**
     * Build the 30-track playlist with metadata.
     * Tracks are categorised into five mood groups of six tracks each.
     */
    function _buildPlaylist() {
        _playlist = [
            // 01-06: Dark Ambient / Dystopian Slum (synth, industrial, atmospheric)
            { src: 'assets/music/track-01-underglow.mp3',                 title: 'Underglow',                 artist: 'Shane Ivers', category: 'ambient' },
            { src: 'assets/music/track-02-void-glider.mp3',               title: 'Void Glider',               artist: 'Shane Ivers', category: 'ambient' },
            { src: 'assets/music/track-03-against-time.mp3',              title: 'Against Time',              artist: 'Shane Ivers', category: 'ambient' },
            { src: 'assets/music/track-04-neon-noir.mp3',                 title: 'Neon Noir',                 artist: 'Shane Ivers', category: 'ambient' },
            { src: 'assets/music/track-03-dark-side-of-mars.mp3',         title: 'Dark Side of Mars',         artist: 'Shane Ivers', category: 'ambient' },
            { src: 'assets/music/track-06-amunet-prime.mp3',              title: 'Amunet Prime',              artist: 'Shane Ivers', category: 'ambient' },

            // 07-12: Action / Combat (driving, tense, percussive)
            { src: 'assets/music/track-07-action-and-adventure.mp3',      title: 'Action & Adventure',        artist: 'Shane Ivers', category: 'action' },
            { src: 'assets/music/track-08-passage-of-arms.mp3',           title: 'Passage of Arms',           artist: 'Shane Ivers', category: 'action' },
            { src: 'assets/music/track-09-the-fall-of-heroes.mp3',        title: 'The Fall of Heroes',        artist: 'Shane Ivers', category: 'action' },
            { src: 'assets/music/track-10-conquer.mp3',                   title: 'Conquer',                   artist: 'Shane Ivers', category: 'action' },
            { src: 'assets/music/track-11-gladiatores-et-circenses.mp3',  title: 'Gladiatores et Circenses',  artist: 'Shane Ivers', category: 'action' },
            { src: 'assets/music/track-12-dead-spawn.mp3',                title: 'Dead Spawn',                artist: 'Shane Ivers', category: 'action' },

            // 13-18: Mystery / Hacking (electronic, glitchy, sci-fi)
            { src: 'assets/music/track-13-the-other-place.mp3',           title: 'The Other Place',           artist: 'Shane Ivers', category: 'mystery' },
            { src: 'assets/music/track-14-observe.mp3',                   title: 'Observe',                   artist: 'Shane Ivers', category: 'mystery' },
            { src: 'assets/music/track-15-corrupted-v2.mp3',              title: 'Corrupted',                 artist: 'Shane Ivers', category: 'mystery' },
            { src: 'assets/music/track-16-dire-space-emergency.mp3',      title: 'Dire Space Emergency',      artist: 'Shane Ivers', category: 'mystery' },
            { src: 'assets/music/track-17-diaphanous.mp3',                title: 'Diaphanous',                artist: 'Shane Ivers', category: 'mystery' },
            { src: 'assets/music/track-18-nightchaser.mp3',               title: 'Nightchaser',               artist: 'Shane Ivers', category: 'mystery' },

            // 19-24: Epic / Faction (orchestral, dramatic, sweeping)
            { src: 'assets/music/track-19-fantasy-overture.mp3',          title: 'Fantasy Overture',          artist: 'Shane Ivers', category: 'epic' },
            { src: 'assets/music/track-20-the-paladins-underworld.mp3',   title: "The Paladin's Underworld",  artist: 'Shane Ivers', category: 'epic' },
            { src: 'assets/music/track-21-the-victory-of-heroes.mp3',     title: 'The Victory of Heroes',     artist: 'Shane Ivers', category: 'epic' },
            { src: 'assets/music/track-22-the-rise-of-heroes.mp3',        title: 'The Rise of Heroes',        artist: 'Shane Ivers', category: 'epic' },
            { src: 'assets/music/track-23-the-gatekeepers.mp3',           title: 'The Gatekeepers',           artist: 'Shane Ivers', category: 'epic' },
            { src: 'assets/music/track-24-stars-and-laurels.mp3',         title: 'Stars and Laurels',         artist: 'Shane Ivers', category: 'epic' },

            // 25-30: Emotional / Endings (piano, strings, bittersweet)
            { src: 'assets/music/track-25-endings.mp3',                   title: 'Endings',                   artist: 'Shane Ivers', category: 'emotional' },
            { src: 'assets/music/track-26-yearning.mp3',                  title: 'Yearning',                  artist: 'Shane Ivers', category: 'emotional' },
            { src: 'assets/music/track-27-sailing-away.mp3',              title: 'Sailing Away',              artist: 'Shane Ivers', category: 'emotional' },
            { src: 'assets/music/track-28-suspended-animation.mp3',       title: 'Suspended Animation',       artist: 'Shane Ivers', category: 'emotional' },
            { src: 'assets/music/track-29-faded-dream.mp3',               title: 'Faded Dream',               artist: 'Shane Ivers', category: 'emotional' },
            { src: 'assets/music/track-30-ascension.mp3',                 title: 'Ascension',                 artist: 'Shane Ivers', category: 'emotional' }
        ];
    }

    // ---------------------------------------------------------------------------
    // Autoplay restriction handler
    // ---------------------------------------------------------------------------

    /**
     * One-time click/touch listener that unlocks audio playback on browsers that
     * block autoplay until a user gesture has occurred.
     * @param {Event} e
     */
    function _onFirstInteraction(e) {
        if (_autoplayUnlocked) return;

        _autoplayUnlocked = true;

        // Remove listeners — they are no longer needed.
        document.body.removeEventListener('click', _onFirstInteraction, true);
        document.body.removeEventListener('touchstart', _onFirstInteraction, true);
        document.body.removeEventListener('keydown', _onFirstInteraction, true);

        // Always start music on first interaction — the main menu should have music.
        if (_audio && _audio.paused && _playlist.length > 0) {
            _isPlaying = true;
            _safePlay();
            _emit('music:play', { trackIndex: _currentIndex });
        }
    }

    /**
     * Install the one-time interaction listeners for autoplay unlock.
     */
    function _handleAutoplayRestriction() {
        if (_autoplayUnlocked) return;

        document.body.addEventListener('click', _onFirstInteraction, true);
        document.body.addEventListener('touchstart', _onFirstInteraction, true);
        document.body.addEventListener('keydown', _onFirstInteraction, true);
    }

    // ---------------------------------------------------------------------------
    // Audio event handlers
    // ---------------------------------------------------------------------------

    /**
     * Called when the current track finishes playing.
     */
    function _onTrackEnded() {
        // If we are playing a cue track, restore the previous position.
        if (_cueReturnState !== null) {
            var returnState = _cueReturnState;
            var callback = _cueOnComplete;

            _cueReturnState = null;
            _cueOnComplete = null;

            _currentIndex = returnState.trackIndex;
            _audio.src = _playlist[_currentIndex].src;
            _audio.currentTime = returnState.currentTime;
            _safePlay();

            _emit('music:track', {
                trackIndex: _currentIndex,
                title: _playlist[_currentIndex].title
            });

            if (typeof callback === 'function') {
                try { callback(); } catch (err) {
                    console.error('[MusicManager] cue onComplete error:', err);
                }
            }
            return;
        }

        // Normal auto-advance to next track.
        _next();
    }

    /**
     * Called when the audio element encounters a loading / decoding error.
     * Skips to the next track so the playlist keeps going.
     */
    function _onTrackError() {
        console.warn('[MusicManager] Error loading track ' + _currentIndex + ' (' +
            (_playlist[_currentIndex] ? _playlist[_currentIndex].title : 'unknown') +
            '). Skipping to next.');
        _next();
    }

    // ---------------------------------------------------------------------------
    // Core transport controls
    // ---------------------------------------------------------------------------

    /**
     * Start or resume playback of the current track.
     */
    function play() {
        if (!_initialized) {
            console.warn('[MusicManager] Cannot play — not initialised.');
            return;
        }

        _isPlaying = true;

        if (_audio.paused) {
            _safePlay();
        }

        _emit('music:play', {
            trackIndex: _currentIndex,
            title: _playlist[_currentIndex] ? _playlist[_currentIndex].title : ''
        });
    }

    /**
     * Pause playback (audio position is preserved).
     */
    function pause() {
        if (!_audio) return;

        _audio.pause();
        _isPlaying = false;

        _emit('music:pause', {
            trackIndex: _currentIndex,
            title: _playlist[_currentIndex] ? _playlist[_currentIndex].title : ''
        });
    }

    /**
     * Stop playback and reset the current track to the beginning.
     */
    function stop() {
        if (!_audio) return;

        _audio.pause();
        _audio.currentTime = 0;
        _isPlaying = false;

        _emit('music:stop', {
            trackIndex: _currentIndex
        });
    }

    /**
     * Advance to the next track in the playlist, wrapping around.
     */
    function _next() {
        if (_playlist.length === 0) return;

        _currentIndex = (_currentIndex + 1) % _playlist.length;
        _loadAndPlay(_currentIndex);
    }

    /**
     * Go to the previous track in the playlist, wrapping around.
     */
    function _prev() {
        if (_playlist.length === 0) return;

        _currentIndex = (_currentIndex - 1 + _playlist.length) % _playlist.length;
        _loadAndPlay(_currentIndex);
    }

    /**
     * Internal helper — set source, play, and emit the track-change event.
     * @param {number} index
     */
    function _loadAndPlay(index) {
        if (!_audio || !_playlist[index]) return;

        _audio.src = _playlist[index].src;
        _audio.currentTime = 0;

        _isPlaying = true;
        _safePlay();

        _emit('music:track', {
            trackIndex: index,
            title: _playlist[index].title
        });
    }

    /**
     * Jump to a specific track by playlist index.
     * @param {number} index - Zero-based track index.
     */
    function skipTo(index) {
        if (!_initialized) {
            console.warn('[MusicManager] Cannot skipTo — not initialised.');
            return;
        }

        if (typeof index !== 'number' || index < 0 || index >= _playlist.length) {
            console.warn('[MusicManager] skipTo: invalid index ' + index +
                '. Must be 0-' + (_playlist.length - 1) + '.');
            return;
        }

        _currentIndex = index;
        _loadAndPlay(_currentIndex);
    }

    // ---------------------------------------------------------------------------
    // Volume & mute
    // ---------------------------------------------------------------------------

    /**
     * Set the master volume.
     * @param {number} val - Volume between 0.0 and 1.0.
     */
    function setVolume(val) {
        _volume = _clamp(Number(val) || 0, 0, 1);

        if (_audio) {
            _audio.volume = _isMuted ? 0 : _volume;
        }

        _emit('music:volume', { volume: _volume });
    }

    /**
     * @returns {number} Current master volume (0.0-1.0).
     */
    function getVolume() {
        return _volume;
    }

    /**
     * Toggle mute on/off.
     */
    function toggleMute() {
        _isMuted = !_isMuted;

        if (_audio) {
            _audio.volume = _isMuted ? 0 : _volume;
        }

        _emit('music:mute', { isMuted: _isMuted });
    }

    /**
     * @returns {boolean}
     */
    function isMuted() {
        return _isMuted;
    }

    /**
     * @returns {boolean}
     */
    function isPlaying() {
        return _isPlaying;
    }

    /**
     * @returns {{src: string, title: string, artist: string, category: string}|null}
     */
    function getCurrentTrack() {
        return _playlist[_currentIndex] || null;
    }

    /**
     * @returns {number}
     */
    function getCurrentIndex() {
        return _currentIndex;
    }

    /**
     * @returns {Array<{src: string, title: string, artist: string, category: string}>}
     */
    function getPlaylist() {
        return _playlist.slice();
    }

    // ---------------------------------------------------------------------------
    // Fading
    // ---------------------------------------------------------------------------

    /**
     * Gradually increase volume from 0 to the master volume over the given duration.
     * @param {number} [durationMs] - Fade duration in milliseconds. Defaults to _fadeDuration.
     */
    function fadeIn(durationMs) {
        if (!_audio) return;

        var duration = (typeof durationMs === 'number' && durationMs > 0) ? durationMs : _fadeDuration;
        var stepMs = 50;                          // interval tick rate
        var steps = Math.max(Math.floor(duration / stepMs), 1);
        var increment = _volume / steps;
        var currentFadeVol = 0;

        _clearFade();

        // Start from silence, begin playback.
        _audio.volume = 0;

        if (_audio.paused) {
            _isPlaying = true;
            _safePlay();
        }

        _fadeInterval = setInterval(function () {
            currentFadeVol += increment;

            if (currentFadeVol >= _volume) {
                currentFadeVol = _volume;
                _audio.volume = _isMuted ? 0 : currentFadeVol;
                _clearFade();
                return;
            }

            _audio.volume = _isMuted ? 0 : currentFadeVol;
        }, stepMs);
    }

    /**
     * Gradually decrease volume from the current level to 0 over the given duration.
     * Pauses playback when the fade completes.
     * @param {number} [durationMs] - Fade duration in milliseconds. Defaults to _fadeDuration.
     */
    function fadeOut(durationMs) {
        if (!_audio) return;

        // If muted or volume is already 0, skip the fade and pause immediately
        if (_isMuted || _audio.volume === 0) {
            _clearFade();
            _audio.volume = 0;
            pause();
            return;
        }

        var duration = (typeof durationMs === 'number' && durationMs > 0) ? durationMs : _fadeDuration;
        var stepMs = 50;
        var steps = Math.max(Math.floor(duration / stepMs), 1);
        var startVol = _isMuted ? 0 : _audio.volume;
        var decrement = startVol / steps;
        var currentFadeVol = startVol;

        _clearFade();

        _fadeInterval = setInterval(function () {
            currentFadeVol -= decrement;

            if (currentFadeVol <= 0) {
                currentFadeVol = 0;
                _audio.volume = 0;
                _clearFade();
                pause();
                return;
            }

            _audio.volume = currentFadeVol;
        }, stepMs);
    }

    // ---------------------------------------------------------------------------
    // Save / Load state
    // ---------------------------------------------------------------------------

    /**
     * Capture the current playback state for serialisation (save-game support).
     * @returns {{trackIndex: number, currentTime: number, volume: number, isMuted: boolean, isPlaying: boolean}}
     */
    function getState() {
        return {
            trackIndex: _currentIndex,
            currentTime: _audio ? _audio.currentTime : 0,
            volume: _volume,
            isMuted: _isMuted,
            isPlaying: _isPlaying
        };
    }

    /**
     * Restore playback state from a previously saved object.
     * @param {Object} state - Object returned by getState().
     */
    function restoreState(state) {
        if (!_initialized || !state) return;

        // Validate track index.
        var idx = Number(state.trackIndex) || 0;
        if (idx < 0 || idx >= _playlist.length) {
            idx = 0;
        }
        _currentIndex = idx;

        // Volume & mute.
        _volume = _clamp(Number(state.volume) || 0, 0, 1);
        _isMuted = !!state.isMuted;

        // Load track and seek.
        _audio.src = _playlist[_currentIndex].src;

        // We need to wait for the audio metadata to be available before seeking.
        var onLoadedMeta = function () {
            _audio.removeEventListener('loadedmetadata', onLoadedMeta);

            var seekTime = Number(state.currentTime) || 0;
            if (seekTime > 0 && seekTime < _audio.duration) {
                _audio.currentTime = seekTime;
            }

            _audio.volume = _isMuted ? 0 : _volume;

            if (state.isPlaying) {
                _isPlaying = true;
                _safePlay();
            }

            _emit('music:track', {
                trackIndex: _currentIndex,
                title: _playlist[_currentIndex].title
            });
        };

        _audio.addEventListener('loadedmetadata', onLoadedMeta);
        _audio.load();
    }

    // ---------------------------------------------------------------------------
    // Cue playback
    // ---------------------------------------------------------------------------

    /**
     * Temporarily play a specific track (e.g. a story cue or boss theme), then
     * automatically return to the previous playlist position when it finishes.
     *
     * @param {number} trackIndex - Index of the cue track to play.
     * @param {Function} [onComplete] - Optional callback invoked after the cue ends.
     */
    function playCue(trackIndex, onComplete) {
        if (!_initialized) return;

        if (typeof trackIndex !== 'number' || trackIndex < 0 || trackIndex >= _playlist.length) {
            console.warn('[MusicManager] playCue: invalid index ' + trackIndex);
            return;
        }

        // Save where we are right now.
        _cueReturnState = {
            trackIndex: _currentIndex,
            currentTime: _audio ? _audio.currentTime : 0
        };

        _cueOnComplete = onComplete || null;

        // Jump to the cue track. _onTrackEnded will handle the return.
        _currentIndex = trackIndex;
        _loadAndPlay(_currentIndex);
    }

    // ---------------------------------------------------------------------------
    // Initialisation
    // ---------------------------------------------------------------------------

    /**
     * Initialise the MusicManager. Must be called once after the DOM is ready.
     * Expects an <audio id="music-player"> element inside #music-layer.
     */
    function init() {
        if (_initialized) {
            console.warn('[MusicManager] Already initialised.');
            return;
        }

        // Acquire the persistent audio element — it must already exist in the DOM.
        _audio = document.getElementById('music-player');

        if (!_audio) {
            console.error('[MusicManager] #music-player audio element not found in the DOM. ' +
                'Ensure <audio id="music-player"> exists inside #music-layer.');
            return;
        }

        // Build the 30-track playlist.
        _buildPlaylist();

        // Wire up audio events.
        _audio.addEventListener('ended', _onTrackEnded);
        _audio.addEventListener('error', _onTrackError);

        // Set initial volume.
        _audio.volume = _isMuted ? 0 : _volume;

        // Load the first track (do not auto-play yet).
        if (_playlist.length > 0) {
            _audio.src = _playlist[_currentIndex].src;
        }

        // Handle browser autoplay restrictions.
        _handleAutoplayRestriction();

        _initialized = true;

        _emit('music:init', { trackCount: _playlist.length });
    }

    // ---------------------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------------------

    return {
        init:             init,
        play:             play,
        pause:            pause,
        stop:             stop,
        skipTo:           skipTo,
        setVolume:        setVolume,
        getVolume:        getVolume,
        toggleMute:       toggleMute,
        isMuted:          isMuted,
        isPlaying:        isPlaying,
        getCurrentTrack:  getCurrentTrack,
        getCurrentIndex:  getCurrentIndex,
        getPlaylist:      getPlaylist,
        fadeIn:            fadeIn,
        fadeOut:           fadeOut,
        getState:         getState,
        restoreState:     restoreState,
        playCue:          playCue
    };

})();
