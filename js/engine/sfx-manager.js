/**
 * LATENCY - SfxManager
 * ============================================================
 * Programmatic sound effects using the Web Audio API.
 * All sounds are generated from oscillators and noise buffers
 * — no external audio files required.
 *
 * Usage:
 *   Latency.SfxManager.init();
 *   Latency.SfxManager.play('click');
 *   Latency.SfxManager.setVolume(0.5);
 *   Latency.SfxManager.toggleMute();
 *
 * Automatically wires into EventBus events for combat, dice,
 * level-ups, notifications, death, heals, and saves.
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.SfxManager = (function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Private state
    // -----------------------------------------------------------------------

    /** @type {AudioContext|null} */
    var _ctx = null;

    /** @type {GainNode|null} */
    var _masterGain = null;

    /** @type {number} 0.0 – 1.0 */
    var _volume = 0.6;

    /** @type {boolean} */
    var _muted = false;

    /** @type {boolean} */
    var _initialized = false;

    /** @type {AudioBuffer|null} Cached white-noise buffer (1 second) */
    var _noiseBuffer = null;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Lazily create or resume the AudioContext. Browsers require a user
     * gesture before the context can start, so we call this from play().
     */
    function _ensureContext() {
        if (!_ctx) {
            var Ctor = window.AudioContext || window.webkitAudioContext;
            if (!Ctor) {
                console.warn('[SfxManager] Web Audio API not supported.');
                return false;
            }
            _ctx = new Ctor();
            _masterGain = _ctx.createGain();
            _masterGain.gain.value = _muted ? 0 : _volume;
            _masterGain.connect(_ctx.destination);
        }
        if (_ctx.state === 'suspended') {
            _ctx.resume();
        }
        return true;
    }

    /**
     * Return a 1-second buffer of white noise, creating it once.
     */
    function _getNoiseBuffer() {
        if (_noiseBuffer) return _noiseBuffer;
        if (!_ctx) return null;

        var sampleRate = _ctx.sampleRate;
        var length = sampleRate; // 1 second
        _noiseBuffer = _ctx.createBuffer(1, length, sampleRate);
        var data = _noiseBuffer.getChannelData(0);
        for (var i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return _noiseBuffer;
    }

    /**
     * Shorthand: create an oscillator connected to gain → master.
     * Returns { osc, gain } so caller can fine-tune.
     */
    function _osc(type, freq, startTime, duration, vol) {
        var osc = _ctx.createOscillator();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq || 440, startTime);

        var gain = _ctx.createGain();
        gain.gain.setValueAtTime(vol !== undefined ? vol : 0.5, startTime);

        osc.connect(gain);
        gain.connect(_masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);

        return { osc: osc, gain: gain };
    }

    /**
     * Shorthand: play a noise burst through optional filter.
     * Returns { source, gain, filter? }.
     */
    function _noise(startTime, duration, vol, filterType, filterFreq) {
        var buf = _getNoiseBuffer();
        if (!buf) return null;

        var source = _ctx.createBufferSource();
        source.buffer = buf;

        var gain = _ctx.createGain();
        gain.gain.setValueAtTime(vol !== undefined ? vol : 0.3, startTime);

        var chain;
        if (filterType) {
            var filter = _ctx.createBiquadFilter();
            filter.type = filterType;
            filter.frequency.setValueAtTime(filterFreq || 1000, startTime);
            source.connect(filter);
            filter.connect(gain);
            chain = { source: source, gain: gain, filter: filter };
        } else {
            source.connect(gain);
            chain = { source: source, gain: gain };
        }

        gain.connect(_masterGain);
        source.start(startTime);
        source.stop(startTime + duration);

        return chain;
    }

    // -----------------------------------------------------------------------
    // Sound definitions
    // -----------------------------------------------------------------------

    var _sounds = {};

    /**
     * 1. click — Short UI click (sine blip, 800Hz, 50ms)
     */
    _sounds.click = function () {
        var t = _ctx.currentTime;
        var s = _osc('sine', 800, t, 0.05, 0.3);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    };

    /**
     * 2. hover — Subtle hover sound (sine 600Hz, 30ms, very quiet)
     */
    _sounds.hover = function () {
        var t = _ctx.currentTime;
        var s = _osc('sine', 600, t, 0.03, 0.08);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    };

    /**
     * 3. dice_roll — Rattling dice (white noise burst 200ms with pitch sweep)
     */
    _sounds.dice_roll = function () {
        var t = _ctx.currentTime;
        var dur = 0.2;

        // Filtered noise burst
        var n = _noise(t, dur, 0.4, 'bandpass', 3000);
        if (n && n.filter) {
            n.filter.frequency.exponentialRampToValueAtTime(800, t + dur);
        }
        if (n) {
            n.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        }

        // Rattling clicks via short sine bursts
        for (var i = 0; i < 6; i++) {
            var offset = i * 0.03;
            var freq = 1200 - (i * 100);
            _osc('sine', freq, t + offset, 0.015, 0.15);
        }
    };

    /**
     * 4. hit — Combat hit (sawtooth 200Hz→100Hz, 150ms, with noise)
     */
    _sounds.hit = function () {
        var t = _ctx.currentTime;
        var dur = 0.15;

        var s = _osc('sawtooth', 200, t, dur, 0.4);
        s.osc.frequency.exponentialRampToValueAtTime(100, t + dur);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        var n = _noise(t, dur, 0.25, 'highpass', 2000);
        if (n) {
            n.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        }
    };

    /**
     * 5. crit — Critical hit (hit + high pitched sine ring 1200Hz, 300ms)
     */
    _sounds.crit = function () {
        var t = _ctx.currentTime;

        // Base hit sound
        var s = _osc('sawtooth', 200, t, 0.15, 0.4);
        s.osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        var n = _noise(t, 0.15, 0.25, 'highpass', 2000);
        if (n) {
            n.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        }

        // High-pitched ring
        var ring = _osc('sine', 1200, t, 0.3, 0.35);
        ring.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        // Second harmonic
        var ring2 = _osc('sine', 1800, t, 0.25, 0.15);
        ring2.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    };

    /**
     * 6. miss — Whoosh (filtered noise sweep high→low, 200ms)
     */
    _sounds.miss = function () {
        var t = _ctx.currentTime;
        var dur = 0.2;

        var n = _noise(t, dur, 0.3, 'bandpass', 6000);
        if (n && n.filter) {
            n.filter.frequency.exponentialRampToValueAtTime(400, t + dur);
            n.filter.Q.setValueAtTime(2, t);
        }
        if (n) {
            n.gain.gain.setValueAtTime(0.3, t);
            n.gain.gain.linearRampToValueAtTime(0.001, t + dur);
        }
    };

    /**
     * 7. heal — Gentle chime (sine 523Hz + 659Hz + 784Hz chord, 400ms, fade out)
     *    C5 + E5 + G5 major chord
     */
    _sounds.heal = function () {
        var t = _ctx.currentTime;
        var dur = 0.4;
        var freqs = [523.25, 659.25, 783.99]; // C5, E5, G5

        for (var i = 0; i < freqs.length; i++) {
            var s = _osc('sine', freqs[i], t, dur, 0.2);
            s.gain.gain.setValueAtTime(0.2, t);
            s.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        }
    };

    /**
     * 8. levelup — Ascending arpeggio (C5→E5→G5→C6 quick sequence)
     */
    _sounds.levelup = function () {
        var t = _ctx.currentTime;
        var notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        var noteLen = 0.12;
        var gap = 0.1;

        for (var i = 0; i < notes.length; i++) {
            var start = t + (i * gap);
            var s = _osc('sine', notes[i], start, noteLen, 0.3);
            s.gain.gain.setValueAtTime(0.3, start);
            s.gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen);
        }

        // Final sustained chord
        var chordStart = t + (notes.length * gap);
        for (var j = 0; j < notes.length; j++) {
            var c = _osc('sine', notes[j], chordStart, 0.4, 0.15);
            c.gain.gain.setValueAtTime(0.15, chordStart);
            c.gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.4);
        }
    };

    /**
     * 9. notification — Alert beep (square wave 880Hz, two short pulses)
     */
    _sounds.notification = function () {
        var t = _ctx.currentTime;
        // Pulse 1
        var p1 = _osc('square', 880, t, 0.06, 0.2);
        p1.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        // Pulse 2
        var p2 = _osc('square', 880, t + 0.1, 0.06, 0.2);
        p2.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    };

    /**
     * 10. death — Low rumble with decay (sawtooth 80Hz, 1s, slow fade)
     */
    _sounds.death = function () {
        var t = _ctx.currentTime;
        var dur = 1.0;

        var s = _osc('sawtooth', 80, t, dur, 0.4);
        s.osc.frequency.exponentialRampToValueAtTime(40, t + dur);
        s.gain.gain.setValueAtTime(0.4, t);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        // Sub-bass reinforcement
        var sub = _osc('sine', 50, t, dur * 0.8, 0.3);
        sub.gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.8);

        // Noise layer
        var n = _noise(t, dur * 0.6, 0.15, 'lowpass', 300);
        if (n) {
            n.gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.6);
        }
    };

    /**
     * 11. save — Quick confirmation (two ascending tones)
     */
    _sounds.save = function () {
        var t = _ctx.currentTime;
        var s1 = _osc('sine', 660, t, 0.08, 0.25);
        s1.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        var s2 = _osc('sine', 880, t + 0.1, 0.1, 0.25);
        s2.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    };

    /**
     * 12. menu_select — Terminal beep (square 440Hz, 100ms)
     */
    _sounds.menu_select = function () {
        var t = _ctx.currentTime;
        var s = _osc('square', 440, t, 0.1, 0.2);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    };

    // -----------------------------------------------------------------------
    // EventBus auto-play bindings
    // -----------------------------------------------------------------------

    function _bindEvents() {
        var Bus = window.Latency.EventBus;
        if (!Bus) return;

        // combat:action → hit / miss / crit based on result
        Bus.on('combat:action', function (data) {
            if (!data) return;
            var result = (data.result || '').toLowerCase();
            if (result === 'crit' || result === 'critical') {
                play('crit');
            } else if (result === 'miss' || result === 'dodge') {
                play('miss');
            } else {
                play('hit');
            }
        });

        // hp:change → heal if positive
        Bus.on('hp:change', function (data) {
            if (data && data.amount > 0) {
                play('heal');
            }
        });

        // levelup
        Bus.on('levelup', function () {
            play('levelup');
        });

        // dice:roll
        Bus.on('dice:roll', function () {
            play('dice_roll');
        });

        // notify
        Bus.on('notify', function () {
            play('notification');
        });

        // character:died
        Bus.on('character:died', function () {
            play('death');
        });

        // save:complete
        Bus.on('save:complete', function () {
            play('save');
        });
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Initialize the SFX manager and bind EventBus listeners.
     * Safe to call multiple times — only runs once.
     */
    function init() {
        if (_initialized) return;
        _initialized = true;

        // Restore persisted settings
        try {
            var stored = localStorage.getItem('latency_sfx_settings');
            if (stored) {
                var settings = JSON.parse(stored);
                if (typeof settings.volume === 'number') _volume = settings.volume;
                if (typeof settings.muted === 'boolean') _muted = settings.muted;
            }
        } catch (e) {
            // ignore
        }

        _bindEvents();
        console.log('[SfxManager] Initialized. Volume:', _volume, 'Muted:', _muted);
    }

    /**
     * Persist current SFX settings to localStorage.
     */
    function _persist() {
        try {
            localStorage.setItem('latency_sfx_settings', JSON.stringify({
                volume: _volume,
                muted: _muted
            }));
        } catch (e) {
            // ignore
        }
    }

    /**
     * Play a named sound effect.
     * @param {string} sfxName - One of the registered effect names.
     */
    function play(sfxName) {
        if (_muted) return;
        if (!_ensureContext()) return;

        var fn = _sounds[sfxName];
        if (!fn) {
            console.warn('[SfxManager] Unknown SFX:', sfxName);
            return;
        }

        try {
            fn();
        } catch (err) {
            console.error('[SfxManager] Error playing "' + sfxName + '":', err);
        }
    }

    /**
     * Set master SFX volume.
     * @param {number} v - Volume from 0.0 to 1.0.
     */
    function setVolume(v) {
        _volume = Math.max(0, Math.min(1, v));
        if (_masterGain && !_muted) {
            _masterGain.gain.setValueAtTime(_volume, _ctx.currentTime);
        }
        _persist();
    }

    /**
     * Get current volume.
     * @returns {number}
     */
    function getVolume() {
        return _volume;
    }

    /**
     * Toggle mute state. Returns the new muted state.
     * @returns {boolean}
     */
    function toggleMute() {
        _muted = !_muted;
        if (_masterGain && _ctx) {
            _masterGain.gain.setValueAtTime(_muted ? 0 : _volume, _ctx.currentTime);
        }
        _persist();
        return _muted;
    }

    /**
     * Check if SFX is muted.
     * @returns {boolean}
     */
    function isMuted() {
        return _muted;
    }

    /**
     * Set mute state explicitly.
     * @param {boolean} muted
     */
    function setMuted(muted) {
        _muted = !!muted;
        if (_masterGain && _ctx) {
            _masterGain.gain.setValueAtTime(_muted ? 0 : _volume, _ctx.currentTime);
        }
        _persist();
    }

    /**
     * List all registered sound effect names.
     * @returns {string[]}
     */
    function listSounds() {
        return Object.keys(_sounds);
    }

    // -----------------------------------------------------------------------
    // Export
    // -----------------------------------------------------------------------

    return {
        init: init,
        play: play,
        setVolume: setVolume,
        getVolume: getVolume,
        toggleMute: toggleMute,
        isMuted: isMuted,
        setMuted: setMuted,
        listSounds: listSounds
    };
})();
