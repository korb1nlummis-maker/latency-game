/**
 * LATENCY - SfxManager
 * ============================================================
 * Procedural sound effects using the Web Audio API.
 * All 30 sounds are sculpted from oscillators, noise buffers,
 * filters, and gain envelopes — no external audio files.
 *
 * Usage:
 *   Latency.SfxManager.init();
 *   Latency.SfxManager.play('click');
 *   Latency.SfxManager.setVolume(0.5);
 *   Latency.SfxManager.toggleMute();
 *
 * Automatically wires into EventBus events for combat, dice,
 * level-ups, notifications, death, heals, saves, and more.
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

    /** @type {AudioBuffer|null} Cached white-noise buffer (2 seconds) */
    var _noiseBuffer = null;

    /** @type {AudioBuffer|null} Cached pink-noise buffer (2 seconds) */
    var _pinkNoiseBuffer = null;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Lazily create or resume the AudioContext.
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
     * Return a 2-second buffer of white noise, creating it once.
     */
    function _getNoiseBuffer() {
        if (_noiseBuffer) return _noiseBuffer;
        if (!_ctx) return null;

        var sr = _ctx.sampleRate;
        var len = sr * 2;
        _noiseBuffer = _ctx.createBuffer(1, len, sr);
        var data = _noiseBuffer.getChannelData(0);
        for (var i = 0; i < len; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return _noiseBuffer;
    }

    /**
     * Return a 2-second buffer of pink noise (softer high-end).
     */
    function _getPinkNoiseBuffer() {
        if (_pinkNoiseBuffer) return _pinkNoiseBuffer;
        if (!_ctx) return null;

        var sr = _ctx.sampleRate;
        var len = sr * 2;
        _pinkNoiseBuffer = _ctx.createBuffer(1, len, sr);
        var data = _pinkNoiseBuffer.getChannelData(0);
        var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (var i = 0; i < len; i++) {
            var white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
        return _pinkNoiseBuffer;
    }

    /**
     * Shorthand: create an oscillator connected to gain -> master.
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
     * Create oscillator routed through a BiquadFilter before gain.
     * Returns { osc, filter, gain }.
     */
    function _oscFiltered(type, freq, startTime, duration, vol, filterType, filterFreq, filterQ) {
        var osc = _ctx.createOscillator();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq || 440, startTime);

        var filter = _ctx.createBiquadFilter();
        filter.type = filterType || 'lowpass';
        filter.frequency.setValueAtTime(filterFreq || 2000, startTime);
        if (filterQ !== undefined) filter.Q.setValueAtTime(filterQ, startTime);

        var gain = _ctx.createGain();
        gain.gain.setValueAtTime(vol !== undefined ? vol : 0.5, startTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(_masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);

        return { osc: osc, filter: filter, gain: gain };
    }

    /**
     * Shorthand: play a noise burst through optional filter.
     * Returns { source, gain, filter? }.
     */
    function _noise(startTime, duration, vol, filterType, filterFreq, filterQ, usePink) {
        var buf = usePink ? _getPinkNoiseBuffer() : _getNoiseBuffer();
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
            if (filterQ !== undefined) filter.Q.setValueAtTime(filterQ, startTime);
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

    /**
     * Simple convolver-based reverb tail simulation using noise buffer.
     */
    function _addReverb(sourceNode, duration, decayTime) {
        var sr = _ctx.sampleRate;
        var len = Math.floor(sr * decayTime);
        var impulse = _ctx.createBuffer(1, len, sr);
        var data = impulse.getChannelData(0);
        for (var i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
        }

        var convolver = _ctx.createConvolver();
        convolver.buffer = impulse;

        var wet = _ctx.createGain();
        wet.gain.setValueAtTime(0.3, _ctx.currentTime);

        sourceNode.connect(convolver);
        convolver.connect(wet);
        wet.connect(_masterGain);

        return convolver;
    }

    // -----------------------------------------------------------------------
    // Sound definitions — 30 layered procedural effects
    // -----------------------------------------------------------------------

    var _sounds = {};

    // ---- 1. click — Crisp UI click ----
    _sounds.click = function () {
        var t = _ctx.currentTime;
        // Primary click: short sine blip
        var s = _osc('sine', 1800, t, 0.04, 0.25);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        // Secondary body: lower triangle for depth
        var s2 = _osc('triangle', 900, t, 0.03, 0.12);
        s2.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        // Tiny noise transient
        var n = _noise(t, 0.015, 0.08, 'highpass', 6000);
        if (n) n.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
    };

    // ---- 2. hover — Subtle hover sweep ----
    _sounds.hover = function () {
        var t = _ctx.currentTime;
        var s = _osc('sine', 2200, t, 0.04, 0.05);
        s.osc.frequency.exponentialRampToValueAtTime(2800, t + 0.02);
        s.osc.frequency.exponentialRampToValueAtTime(2400, t + 0.04);
        s.gain.gain.setValueAtTime(0.0, t);
        s.gain.gain.linearRampToValueAtTime(0.05, t + 0.01);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    };

    // ---- 3. confirm — Positive confirmation (major third) ----
    _sounds.confirm = function () {
        var t = _ctx.currentTime;
        // First tone: C5
        var s1 = _osc('sine', 523.25, t, 0.12, 0.25);
        s1.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        var s1b = _osc('triangle', 523.25, t, 0.12, 0.08);
        s1b.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        // Second tone: E5 (major third up)
        var s2 = _osc('sine', 659.25, t + 0.08, 0.15, 0.25);
        s2.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.23);
        var s2b = _osc('triangle', 659.25, t + 0.08, 0.15, 0.08);
        s2b.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.23);
    };

    // ---- 4. cancel — Cancel/back (minor second descent) ----
    _sounds.cancel = function () {
        var t = _ctx.currentTime;
        // First tone: E5
        var s1 = _osc('sine', 659.25, t, 0.1, 0.2);
        s1.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        var s1b = _osc('square', 659.25, t, 0.1, 0.04);
        s1b.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        // Second tone: Eb5 (minor second down)
        var s2 = _osc('sine', 622.25, t + 0.07, 0.12, 0.2);
        s2.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.19);
        var s2b = _osc('square', 622.25, t + 0.07, 0.12, 0.04);
        s2b.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.19);
    };

    // ---- 5. dice-roll — Rapid dice clattering (200ms) ----
    _sounds['dice-roll'] = function () {
        var t = _ctx.currentTime;
        var dur = 0.22;

        // Filtered noise burst — clattering body
        var n = _noise(t, dur, 0.35, 'bandpass', 3000, 3);
        if (n && n.filter) {
            n.filter.frequency.exponentialRampToValueAtTime(800, t + dur);
        }
        if (n) n.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        // Rattling clicks: random pitches simulating dice bouncing
        for (var i = 0; i < 8; i++) {
            var offset = i * 0.025 + Math.random() * 0.01;
            var freq = 800 + Math.random() * 1200;
            var s = _osc('sine', freq, t + offset, 0.012, 0.12 + Math.random() * 0.08);
            s.gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.012);
        }

        // Low thud of dice hitting surface
        var thud = _osc('sine', 150, t + 0.02, 0.08, 0.15);
        thud.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    };

    // ---- 6. dice-success — Triumphant ascending arpeggio ----
    _sounds['dice-success'] = function () {
        var t = _ctx.currentTime;
        var notes = [523.25, 659.25, 783.99, 1046.50]; // C5-E5-G5-C6
        var noteLen = 0.1;

        for (var i = 0; i < notes.length; i++) {
            var st = t + i * 0.08;
            var s = _osc('sine', notes[i], st, noteLen, 0.22);
            s.gain.gain.exponentialRampToValueAtTime(0.001, st + noteLen);
            // Harmonic layer
            var h = _osc('triangle', notes[i] * 2, st, noteLen * 0.7, 0.06);
            h.gain.gain.exponentialRampToValueAtTime(0.001, st + noteLen * 0.7);
        }

        // Shimmer tail
        var shimmer = _noise(t + 0.2, 0.3, 0.04, 'highpass', 8000);
        if (shimmer) shimmer.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    };

    // ---- 7. dice-fail — Descending minor arpeggio ----
    _sounds['dice-fail'] = function () {
        var t = _ctx.currentTime;
        var notes = [493.88, 440, 392, 329.63]; // B4-A4-G4-E4 (descending)
        var noteLen = 0.12;

        for (var i = 0; i < notes.length; i++) {
            var st = t + i * 0.1;
            var s = _osc('sine', notes[i], st, noteLen, 0.2);
            s.gain.gain.exponentialRampToValueAtTime(0.001, st + noteLen);
            // Darker square wave layer
            var sq = _oscFiltered('square', notes[i], st, noteLen, 0.04, 'lowpass', 1500);
            sq.gain.gain.exponentialRampToValueAtTime(0.001, st + noteLen);
        }
    };

    // ---- 8. dice-crit — Epic fanfare burst (nat 20) ----
    _sounds['dice-crit'] = function () {
        var t = _ctx.currentTime;

        // Impact hit
        var impact = _osc('sawtooth', 120, t, 0.08, 0.35);
        impact.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        var impactNoise = _noise(t, 0.06, 0.2, 'lowpass', 800);
        if (impactNoise) impactNoise.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        // Rapid ascending fanfare: C5-E5-G5-C6-E6
        var fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        for (var i = 0; i < fanfare.length; i++) {
            var st = t + 0.06 + i * 0.06;
            var s = _osc('sine', fanfare[i], st, 0.15, 0.25);
            s.gain.gain.exponentialRampToValueAtTime(0.001, st + 0.15);
            var h = _osc('triangle', fanfare[i], st, 0.12, 0.08);
            h.gain.gain.exponentialRampToValueAtTime(0.001, st + 0.12);
        }

        // Sustained major chord
        var chordStart = t + 0.35;
        var chord = [523.25, 659.25, 783.99, 1046.50];
        for (var j = 0; j < chord.length; j++) {
            var c = _osc('sine', chord[j], chordStart, 0.6, 0.12);
            c.gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.6);
        }

        // Sparkle noise
        var sparkle = _noise(t + 0.3, 0.5, 0.06, 'highpass', 10000);
        if (sparkle) sparkle.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    };

    // ---- 9. hit — Combat hit impact ----
    _sounds.hit = function () {
        var t = _ctx.currentTime;

        // Low thud body
        var thud = _osc('sine', 80, t, 0.15, 0.4);
        thud.osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
        thud.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        // Mid-range punch
        var punch = _osc('sawtooth', 200, t, 0.08, 0.3);
        punch.osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
        punch.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        // Noise burst for impact texture
        var n = _noise(t, 0.06, 0.25, 'bandpass', 2500, 2);
        if (n) n.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        // High transient click
        var click = _noise(t, 0.015, 0.15, 'highpass', 5000);
        if (click) click.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
    };

    // ---- 10. miss — Combat miss whoosh ----
    _sounds.miss = function () {
        var t = _ctx.currentTime;
        var dur = 0.25;

        // Primary whoosh: bandpass noise sweep
        var n = _noise(t, dur, 0.25, 'bandpass', 6000, 3);
        if (n && n.filter) {
            n.filter.frequency.exponentialRampToValueAtTime(300, t + dur);
        }
        if (n) {
            n.gain.gain.setValueAtTime(0.0, t);
            n.gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
            n.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        }

        // Subtle tonal whoosh
        var sweep = _oscFiltered('sawtooth', 800, t, dur, 0.06, 'bandpass', 2000, 4);
        sweep.osc.frequency.exponentialRampToValueAtTime(200, t + dur);
        sweep.filter.frequency.exponentialRampToValueAtTime(400, t + dur);
        sweep.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    };

    // ---- 11. critical — Critical hit with reverb tail ----
    _sounds.critical = function () {
        var t = _ctx.currentTime;

        // Heavy impact layer 1
        var thud = _osc('sine', 60, t, 0.2, 0.45);
        thud.osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);
        thud.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        // Impact layer 2: distorted sawtooth
        var saw = _oscFiltered('sawtooth', 150, t, 0.12, 0.35, 'lowpass', 600);
        saw.osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);
        saw.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        // Noise crunch
        var crunch = _noise(t, 0.08, 0.3, 'bandpass', 3000, 1);
        if (crunch) crunch.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        // High ring for drama
        var ring = _osc('sine', 1200, t + 0.02, 0.4, 0.15);
        ring.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

        // Second harmonic ring
        var ring2 = _osc('sine', 1800, t + 0.02, 0.3, 0.08);
        ring2.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

        // Reverb tail via filtered noise
        var tail = _noise(t + 0.05, 0.6, 0.08, 'lowpass', 1200, undefined, true);
        if (tail) tail.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    };

    // ---- 12. heal — Warm ascending shimmer ----
    _sounds.heal = function () {
        var t = _ctx.currentTime;
        var dur = 0.5;
        // Warm major chord: C5, E5, G5
        var freqs = [523.25, 659.25, 783.99];

        for (var i = 0; i < freqs.length; i++) {
            // Main tone
            var s = _osc('sine', freqs[i] * 0.98, t + i * 0.04, dur - i * 0.04, 0.18);
            s.osc.frequency.linearRampToValueAtTime(freqs[i], t + 0.1 + i * 0.04);
            s.gain.gain.setValueAtTime(0.0, t + i * 0.04);
            s.gain.gain.linearRampToValueAtTime(0.18, t + 0.05 + i * 0.04);
            s.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

            // Soft triangle harmonic
            var h = _osc('triangle', freqs[i] * 2, t + i * 0.04, dur * 0.6, 0.04);
            h.gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.6 + i * 0.04);
        }

        // High shimmer
        var shimmer = _noise(t + 0.1, dur * 0.8, 0.03, 'highpass', 10000);
        if (shimmer) shimmer.gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9);
    };

    // ---- 13. damage — Taking damage: low distorted impact ----
    _sounds.damage = function () {
        var t = _ctx.currentTime;

        // Low distorted hit
        var s = _oscFiltered('sawtooth', 100, t, 0.18, 0.35, 'lowpass', 400);
        s.osc.frequency.exponentialRampToValueAtTime(50, t + 0.18);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        // Sub bass punch
        var sub = _osc('sine', 60, t, 0.12, 0.3);
        sub.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        // Gritty noise
        var n = _noise(t, 0.1, 0.2, 'lowpass', 1500, 1);
        if (n) n.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        // Brief dissonant overtone
        var dis = _osc('square', 185, t, 0.06, 0.08);
        dis.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    };

    // ---- 14. level-up — Multi-note ascending arpeggio with shimmer ----
    _sounds['level-up'] = function () {
        var t = _ctx.currentTime;
        var notes = [392, 493.88, 587.33, 783.99, 987.77]; // G4-B4-D5-G5-B5
        var noteLen = 0.1;
        var gap = 0.08;

        for (var i = 0; i < notes.length; i++) {
            var st = t + i * gap;
            var s = _osc('sine', notes[i], st, noteLen, 0.22);
            s.gain.gain.exponentialRampToValueAtTime(0.001, st + noteLen);
            // Soft triangle for warmth
            var tri = _osc('triangle', notes[i], st, noteLen * 0.8, 0.07);
            tri.gain.gain.exponentialRampToValueAtTime(0.001, st + noteLen * 0.8);
        }

        // Sustained chord at end
        var chordStart = t + notes.length * gap;
        var chordNotes = [392, 493.88, 587.33, 783.99];
        for (var j = 0; j < chordNotes.length; j++) {
            var c = _osc('sine', chordNotes[j], chordStart, 0.6, 0.12);
            c.gain.gain.setValueAtTime(0.0, chordStart);
            c.gain.gain.linearRampToValueAtTime(0.12, chordStart + 0.05);
            c.gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.6);
        }

        // Shimmer sparkle
        var shimmer = _noise(chordStart, 0.5, 0.04, 'highpass', 9000);
        if (shimmer) shimmer.gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.5);
    };

    // ---- 15. achievement — Bright chord with sparkle ----
    _sounds.achievement = function () {
        var t = _ctx.currentTime;

        // Bright major chord: C5, E5, G5, C6
        var chord = [523.25, 659.25, 783.99, 1046.50];
        for (var i = 0; i < chord.length; i++) {
            var s = _osc('sine', chord[i], t, 0.5, 0.15);
            s.gain.gain.setValueAtTime(0.0, t);
            s.gain.gain.linearRampToValueAtTime(0.15, t + 0.03);
            s.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

            // Bright overtone
            var h = _osc('triangle', chord[i] * 3, t, 0.3, 0.03);
            h.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        }

        // Sparkle: rapid high-frequency noise bursts
        for (var k = 0; k < 5; k++) {
            var sparkleT = t + 0.05 + k * 0.06;
            var sp = _noise(sparkleT, 0.03, 0.06, 'highpass', 12000);
            if (sp) sp.gain.gain.exponentialRampToValueAtTime(0.001, sparkleT + 0.03);
        }

        // Rising tone accent
        var rise = _osc('sine', 1046.50, t, 0.15, 0.12);
        rise.osc.frequency.exponentialRampToValueAtTime(2093, t + 0.15);
        rise.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    };

    // ---- 16. save — Quick data-write digital chirps ----
    _sounds.save = function () {
        var t = _ctx.currentTime;

        // Digital chirps: rapid alternating tones
        var chirpFreqs = [1200, 1800, 1400, 2000, 1600];
        for (var i = 0; i < chirpFreqs.length; i++) {
            var st = t + i * 0.035;
            var s = _osc('square', chirpFreqs[i], st, 0.025, 0.1);
            s.gain.gain.exponentialRampToValueAtTime(0.001, st + 0.025);
        }

        // Confirmation tone
        var conf = _osc('sine', 880, t + 0.2, 0.1, 0.18);
        conf.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        // Soft noise bed
        var n = _noise(t, 0.18, 0.04, 'highpass', 6000);
        if (n) n.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    };

    // ---- 17. menu-open — Sliding tone up ----
    _sounds['menu-open'] = function () {
        var t = _ctx.currentTime;
        var dur = 0.15;

        var s = _osc('sine', 300, t, dur, 0.18);
        s.osc.frequency.exponentialRampToValueAtTime(800, t + dur);
        s.gain.gain.setValueAtTime(0.0, t);
        s.gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        // Subtle harmonic
        var h = _osc('triangle', 600, t, dur, 0.05);
        h.osc.frequency.exponentialRampToValueAtTime(1600, t + dur);
        h.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        // Soft air swoosh
        var n = _noise(t, dur * 0.8, 0.04, 'highpass', 4000);
        if (n) n.gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.8);
    };

    // ---- 18. menu-close — Sliding tone down ----
    _sounds['menu-close'] = function () {
        var t = _ctx.currentTime;
        var dur = 0.12;

        var s = _osc('sine', 800, t, dur, 0.15);
        s.osc.frequency.exponentialRampToValueAtTime(300, t + dur);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        var h = _osc('triangle', 1600, t, dur, 0.04);
        h.osc.frequency.exponentialRampToValueAtTime(600, t + dur);
        h.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    };

    // ---- 19. typewriter — Single subtle keystroke ----
    _sounds.typewriter = function () {
        var t = _ctx.currentTime;

        // Mechanical click
        var click = _noise(t, 0.012, 0.06, 'bandpass', 4000, 5);
        if (click) click.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.012);

        // Tiny thunk body
        var thunk = _osc('sine', 400, t, 0.008, 0.04);
        thunk.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.008);
    };

    // ---- 20. error — Error buzz ----
    _sounds.error = function () {
        var t = _ctx.currentTime;

        // Harsh buzz
        var s = _osc('square', 160, t, 0.15, 0.2);
        s.gain.gain.setValueAtTime(0.2, t);
        s.gain.gain.setValueAtTime(0.0, t + 0.05);
        s.gain.gain.setValueAtTime(0.2, t + 0.07);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        // Dissonant overtone
        var dis = _osc('sawtooth', 170, t, 0.12, 0.08);
        dis.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        // Noise crackle
        var n = _noise(t, 0.1, 0.1, 'bandpass', 1500, 2);
        if (n) n.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    };

    // ---- 21. notification — Pleasant two-tone chime ----
    _sounds.notification = function () {
        var t = _ctx.currentTime;

        // Tone 1: G5
        var s1 = _osc('sine', 783.99, t, 0.12, 0.2);
        s1.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        var h1 = _osc('triangle', 783.99 * 2, t, 0.08, 0.04);
        h1.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        // Tone 2: C6 (perfect fourth up)
        var s2 = _osc('sine', 1046.50, t + 0.1, 0.15, 0.2);
        s2.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        var h2 = _osc('triangle', 1046.50 * 2, t + 0.1, 0.1, 0.04);
        h2.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    };

    // ---- 22. combat-start — Dramatic low drum hit + rising tension ----
    _sounds['combat-start'] = function () {
        var t = _ctx.currentTime;

        // Deep drum hit
        var drum = _osc('sine', 80, t, 0.3, 0.45);
        drum.osc.frequency.exponentialRampToValueAtTime(35, t + 0.3);
        drum.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        // Drum noise layer
        var drumNoise = _noise(t, 0.1, 0.3, 'lowpass', 600);
        if (drumNoise) drumNoise.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        // Rising tension: filtered sawtooth sweep
        var rise = _oscFiltered('sawtooth', 100, t + 0.1, 0.5, 0.12, 'lowpass', 300, 3);
        rise.osc.frequency.exponentialRampToValueAtTime(400, t + 0.6);
        rise.filter.frequency.exponentialRampToValueAtTime(1200, t + 0.6);
        rise.gain.gain.setValueAtTime(0.0, t + 0.1);
        rise.gain.gain.linearRampToValueAtTime(0.12, t + 0.3);
        rise.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        // Noise swell
        var swell = _noise(t + 0.15, 0.45, 0.08, 'bandpass', 800, 2);
        if (swell) {
            swell.gain.gain.setValueAtTime(0.0, t + 0.15);
            swell.gain.gain.linearRampToValueAtTime(0.08, t + 0.4);
            swell.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        }
    };

    // ---- 23. combat-victory — Victory fanfare major chord arpeggio ----
    _sounds['combat-victory'] = function () {
        var t = _ctx.currentTime;

        // Ascending arpeggio: C4-E4-G4-C5
        var notes = [261.63, 329.63, 392, 523.25];
        for (var i = 0; i < notes.length; i++) {
            var st = t + i * 0.1;
            var s = _osc('sine', notes[i], st, 0.18, 0.2);
            s.gain.gain.exponentialRampToValueAtTime(0.001, st + 0.18);
            var tri = _osc('triangle', notes[i], st, 0.15, 0.06);
            tri.gain.gain.exponentialRampToValueAtTime(0.001, st + 0.15);
        }

        // Sustained victory chord
        var chordT = t + 0.4;
        var chord = [523.25, 659.25, 783.99, 1046.50];
        for (var j = 0; j < chord.length; j++) {
            var c = _osc('sine', chord[j], chordT, 0.8, 0.1);
            c.gain.gain.setValueAtTime(0.0, chordT);
            c.gain.gain.linearRampToValueAtTime(0.1, chordT + 0.05);
            c.gain.gain.exponentialRampToValueAtTime(0.001, chordT + 0.8);
        }

        // Shimmer
        var shimmer = _noise(chordT, 0.6, 0.03, 'highpass', 10000);
        if (shimmer) shimmer.gain.gain.exponentialRampToValueAtTime(0.001, chordT + 0.6);
    };

    // ---- 24. combat-defeat — Minor chord, slow fade ----
    _sounds['combat-defeat'] = function () {
        var t = _ctx.currentTime;
        var dur = 1.2;

        // Minor chord: C4-Eb4-G4 (C minor)
        var chord = [261.63, 311.13, 392];
        for (var i = 0; i < chord.length; i++) {
            var s = _osc('sine', chord[i], t, dur, 0.15);
            s.gain.gain.setValueAtTime(0.0, t);
            s.gain.gain.linearRampToValueAtTime(0.15, t + 0.1);
            s.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

            // Darker tone layer
            var dark = _oscFiltered('sawtooth', chord[i], t, dur * 0.6, 0.04, 'lowpass', 500);
            dark.gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.6);
        }

        // Low rumble
        var rumble = _osc('sine', 55, t, dur * 0.8, 0.12);
        rumble.gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.8);

        // Sad descending note
        var fall = _osc('sine', 392, t + 0.3, 0.6, 0.08);
        fall.osc.frequency.exponentialRampToValueAtTime(200, t + 0.9);
        fall.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    };

    // ---- 25. footstep — Footstep on metal ----
    _sounds.footstep = function () {
        var t = _ctx.currentTime;

        // Short filtered noise — metallic tap
        var tap = _noise(t, 0.04, 0.15, 'bandpass', 3500, 8);
        if (tap) tap.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        // Low thud body
        var thud = _osc('sine', 100, t, 0.05, 0.1);
        thud.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        // Metallic ring
        var ring = _osc('sine', 2800, t, 0.03, 0.04);
        ring.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    };

    // ---- 26. ambient-hum — Low ambient hum for atmosphere ----
    _sounds['ambient-hum'] = function () {
        var t = _ctx.currentTime;
        var dur = 3.0;

        // Base hum: low sine
        var hum = _osc('sine', 55, t, dur, 0.08);
        hum.gain.gain.setValueAtTime(0.0, t);
        hum.gain.gain.linearRampToValueAtTime(0.08, t + 0.5);
        hum.gain.gain.setValueAtTime(0.08, t + dur - 0.8);
        hum.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        // Electrical buzz harmonic
        var buzz = _oscFiltered('sawtooth', 60, t, dur, 0.02, 'lowpass', 200);
        buzz.gain.gain.setValueAtTime(0.0, t);
        buzz.gain.gain.linearRampToValueAtTime(0.02, t + 0.5);
        buzz.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        // Sub-bass warble
        var sub = _osc('sine', 40, t, dur, 0.05);
        sub.osc.frequency.setValueAtTime(40, t);
        sub.osc.frequency.linearRampToValueAtTime(45, t + dur * 0.5);
        sub.osc.frequency.linearRampToValueAtTime(38, t + dur);
        sub.gain.gain.setValueAtTime(0.0, t);
        sub.gain.gain.linearRampToValueAtTime(0.05, t + 0.3);
        sub.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        // Pink noise air
        var air = _noise(t, dur, 0.015, 'lowpass', 300, undefined, true);
        if (air) {
            air.gain.gain.setValueAtTime(0.0, t);
            air.gain.gain.linearRampToValueAtTime(0.015, t + 0.5);
            air.gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        }
    };

    // ---- 27. door — Mechanical slide + pneumatic hiss ----
    _sounds.door = function () {
        var t = _ctx.currentTime;

        // Mechanical slide: filtered noise sweep
        var slide = _noise(t, 0.3, 0.2, 'bandpass', 800, 3);
        if (slide && slide.filter) {
            slide.filter.frequency.exponentialRampToValueAtTime(2000, t + 0.15);
            slide.filter.frequency.exponentialRampToValueAtTime(600, t + 0.3);
        }
        if (slide) slide.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        // Low servo motor tone
        var servo = _oscFiltered('sawtooth', 120, t, 0.25, 0.08, 'lowpass', 400);
        servo.osc.frequency.linearRampToValueAtTime(180, t + 0.12);
        servo.osc.frequency.linearRampToValueAtTime(100, t + 0.25);
        servo.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        // Pneumatic hiss at end
        var hiss = _noise(t + 0.2, 0.2, 0.12, 'highpass', 5000);
        if (hiss) {
            hiss.gain.gain.setValueAtTime(0.0, t + 0.2);
            hiss.gain.gain.linearRampToValueAtTime(0.12, t + 0.25);
            hiss.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        }

        // Metallic clunk at start
        var clunk = _osc('sine', 200, t, 0.03, 0.15);
        clunk.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    };

    // ---- 28. pickup — Item pickup: quick bright ascending note ----
    _sounds.pickup = function () {
        var t = _ctx.currentTime;

        // Quick ascending sine
        var s = _osc('sine', 800, t, 0.1, 0.22);
        s.osc.frequency.exponentialRampToValueAtTime(1600, t + 0.08);
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        // Harmonic brightness
        var h = _osc('triangle', 1600, t, 0.08, 0.08);
        h.osc.frequency.exponentialRampToValueAtTime(3200, t + 0.06);
        h.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        // Tiny sparkle
        var sp = _noise(t + 0.02, 0.04, 0.05, 'highpass', 8000);
        if (sp) sp.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    };

    // ---- 29. equip — Metallic clink ----
    _sounds.equip = function () {
        var t = _ctx.currentTime;

        // Metallic ring 1
        var r1 = _osc('sine', 3200, t, 0.08, 0.12);
        r1.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        // Metallic ring 2 (slightly detuned)
        var r2 = _osc('sine', 3400, t + 0.005, 0.07, 0.1);
        r2.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);

        // Impact body
        var body = _noise(t, 0.02, 0.15, 'bandpass', 5000, 10);
        if (body) body.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

        // Low clink
        var low = _osc('sine', 800, t, 0.04, 0.1);
        low.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        // Tail resonance
        var tail = _osc('sine', 2600, t + 0.01, 0.12, 0.04);
        tail.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    };

    // ---- 30. coin — Credits gained: coin-like chime ----
    _sounds.coin = function () {
        var t = _ctx.currentTime;

        // Primary coin tone (high sine)
        var s = _osc('sine', 1567.98, t, 0.15, 0.2); // G6
        s.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        // Second harmonic
        var h = _osc('sine', 3135.96, t, 0.1, 0.06); // G7
        h.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        // Metallic impact transient
        var impact = _noise(t, 0.01, 0.12, 'highpass', 8000);
        if (impact) impact.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.01);

        // Ring tail
        var ring = _osc('sine', 2349.32, t + 0.005, 0.12, 0.08); // D7
        ring.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.125);

        // Subtle secondary chime
        var s2 = _osc('sine', 1975.53, t + 0.06, 0.1, 0.1); // B6
        s2.gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    };

    // -----------------------------------------------------------------------
    // Backwards-compatible aliases (old names used by EventBus bindings)
    // -----------------------------------------------------------------------
    _sounds.dice_roll = _sounds['dice-roll'];
    _sounds.levelup = _sounds['level-up'];
    _sounds.crit = _sounds.critical;
    _sounds.death = _sounds['combat-defeat'];
    _sounds.menu_select = _sounds.click;

    // -----------------------------------------------------------------------
    // EventBus auto-play bindings
    // -----------------------------------------------------------------------

    function _bindEvents() {
        var Bus = window.Latency.EventBus;
        if (!Bus) return;

        // Global click SFX on buttons and choices
        document.addEventListener('click', function (e) {
            var target = e.target;
            if (!target) return;
            if (target.tagName === 'BUTTON' ||
                target.closest('button') ||
                target.classList.contains('choice-btn') ||
                target.closest('.choice-btn') ||
                target.classList.contains('gp-choice-btn') ||
                target.closest('.gp-choice-btn') ||
                target.classList.contains('menu-btn') ||
                target.closest('.menu-btn')) {
                play('click');
            }
        });

        // combat:action -> hit / miss / crit
        Bus.on('combat:action', function (data) {
            if (!data) return;
            var result = (data.result || '').toLowerCase();
            if (result === 'crit' || result === 'critical') {
                play('critical');
            } else if (result === 'miss' || result === 'dodge') {
                play('miss');
            } else {
                play('hit');
            }
        });

        // combat:start
        Bus.on('combat:start', function () {
            play('combat-start');
        });

        // combat:victory
        Bus.on('combat:victory', function () {
            play('combat-victory');
        });

        // hp:change -> heal if positive, damage if negative
        Bus.on('hp:change', function (data) {
            if (data && data.amount > 0) {
                play('heal');
            } else if (data && data.amount < 0) {
                play('damage');
            }
        });

        // levelup
        Bus.on('levelup', function () {
            play('level-up');
        });

        // dice events
        Bus.on('dice:roll', function () {
            play('dice-roll');
        });
        Bus.on('dice:success', function () {
            play('dice-success');
        });
        Bus.on('dice:fail', function () {
            play('dice-fail');
        });
        Bus.on('dice:crit', function () {
            play('dice-crit');
        });

        // notify
        Bus.on('notify', function () {
            play('notification');
        });

        // character:died
        Bus.on('character:died', function () {
            play('combat-defeat');
        });

        // save:complete
        Bus.on('save:complete', function () {
            play('save');
        });

        // achievement
        Bus.on('achievement:unlock', function () {
            play('achievement');
        });

        // item events
        Bus.on('item:pickup', function () {
            play('pickup');
        });
        Bus.on('item:equip', function () {
            play('equip');
        });
        Bus.on('credits:gain', function () {
            play('coin');
        });

        // screen transitions
        Bus.on('screen:change', function (data) {
            if (data && data.from) {
                play('menu-close');
            }
        });
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

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
        console.log('[SfxManager] Initialized — 30 procedural SFX loaded. Volume:', _volume, 'Muted:', _muted);
    }

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

    function setVolume(v) {
        _volume = Math.max(0, Math.min(1, v));
        if (_masterGain && !_muted) {
            _masterGain.gain.setValueAtTime(_volume, _ctx.currentTime);
        }
        _persist();
    }

    function getVolume() {
        return _volume;
    }

    function toggleMute() {
        _muted = !_muted;
        if (_masterGain && _ctx) {
            _masterGain.gain.setValueAtTime(_muted ? 0 : _volume, _ctx.currentTime);
        }
        _persist();
        return _muted;
    }

    function isMuted() {
        return _muted;
    }

    function setMuted(muted) {
        _muted = !!muted;
        if (_masterGain && _ctx) {
            _masterGain.gain.setValueAtTime(_muted ? 0 : _volume, _ctx.currentTime);
        }
        _persist();
    }

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
