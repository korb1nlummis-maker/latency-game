(function() {
    'use strict';
    window.Latency = window.Latency || {};

    var VoiceManager = (function() {
        // ---------------------------------------------------------------
        // State
        // ---------------------------------------------------------------
        var _enabled = true;
        var _speaking = false;
        var _synth = window.speechSynthesis;
        var _voicesReady = false;
        var _allVoices = [];
        var _queue = [];
        var _currentUtterance = null;

        var _defaultMood = 'neutral';
        var _defaultSpeaker = null;

        // ---------------------------------------------------------------
        // Emotion profiles — wider range for more dramatic effect
        // ---------------------------------------------------------------
        var EMOTION_PROFILES = {
            neutral:       { rate: 0.92, pitch: 1.0,  volume: 0.8,  pauseMs: 280 },
            dark:          { rate: 0.72, pitch: 0.75, volume: 0.65, pauseMs: 450 },
            tension:       { rate: 1.15, pitch: 1.15, volume: 0.95, pauseMs: 180 },
            anger:         { rate: 1.25, pitch: 0.85, volume: 1.0,  pauseMs: 120 },
            melancholy:    { rate: 0.65, pitch: 0.8,  volume: 0.55, pauseMs: 500 },
            warm:          { rate: 0.85, pitch: 1.1,  volume: 0.75, pauseMs: 350 },
            eerie:         { rate: 0.6,  pitch: 1.35, volume: 0.45, pauseMs: 550 },
            determination: { rate: 1.05, pitch: 0.95, volume: 0.92, pauseMs: 220 },
            cold:          { rate: 0.78, pitch: 0.85, volume: 0.65, pauseMs: 380 },
            action:        { rate: 1.2,  pitch: 1.05, volume: 0.95, pauseMs: 150 },
            mystery:       { rate: 0.75, pitch: 1.2,  volume: 0.6,  pauseMs: 420 },
            epic:          { rate: 0.88, pitch: 0.9,  volume: 0.9,  pauseMs: 300 },
            emotional:     { rate: 0.7,  pitch: 1.05, volume: 0.7,  pauseMs: 480 }
        };

        // ---------------------------------------------------------------
        // Speaker voice mapping with richer modifiers
        // ---------------------------------------------------------------
        var SPEAKER_PROFILES = {
            narrator: {
                preferredVoices: ['Microsoft David', 'Google UK English Male', 'Daniel', 'Alex', 'James'],
                gender: 'male',
                pitchMod: 0,
                rateMod: -0.05  // narrator speaks slightly slower
            },
            female: {
                preferredVoices: ['Microsoft Zira', 'Google UK English Female', 'Samantha', 'Victoria', 'Karen', 'Moira'],
                gender: 'female',
                pitchMod: 0.05,
                rateMod: 0
            },
            tech: {
                preferredVoices: ['Microsoft Zira', 'Google UK English Female', 'Microsoft David'],
                gender: 'any',
                pitchMod: 0.2,
                rateMod: 0.15  // AI speaks faster
            },
            monster: {
                preferredVoices: ['Microsoft David', 'Google UK English Male', 'Daniel', 'Alex'],
                gender: 'male',
                pitchMod: -0.35,
                rateMod: -0.2  // monsters speak slower, deeper
            },
            elder: {
                preferredVoices: ['Microsoft David', 'Daniel', 'Alex'],
                gender: 'male',
                pitchMod: -0.1,
                rateMod: -0.15
            },
            child: {
                preferredVoices: ['Microsoft Zira', 'Samantha', 'Google UK English Female'],
                gender: 'female',
                pitchMod: 0.3,
                rateMod: 0.1
            }
        };

        var SPEAKER_NAME_MAP = {
            'narrator': 'narrator',
            'dr. vale': 'female', 'dr vale': 'female', 'vale': 'female',
            'mother': 'female', 'sister': 'female', 'aria': 'female',
            'kira': 'female', 'zara': 'female', 'elena': 'female',
            'nyx': 'female', 'sable': 'female', 'luminara': 'female',
            'sera': 'female', 'lira': 'female', 'velvet': 'female',
            'prism': 'female', 'cinder': 'elder',
            'ai': 'tech', 'system': 'tech', 'interface': 'tech',
            'ghost': 'tech', 'cortex': 'tech', 'daemon': 'tech',
            'cipher': 'tech', 'null': 'tech', 'glassbird': 'tech',
            'beast': 'monster', 'creature': 'monster', 'orc': 'monster',
            'demon': 'monster', 'warden': 'monster', 'brute': 'monster',
            'dran': 'monster', 'vex': 'female', 'hammer': 'monster',
            'voltage': 'elder', 'forge master': 'elder'
        };

        var _cachedVoices = {};

        // ---------------------------------------------------------------
        // Voice selection
        // ---------------------------------------------------------------

        function _findVoice(preferredNames) {
            if (!_allVoices.length) return null;
            for (var i = 0; i < preferredNames.length; i++) {
                for (var j = 0; j < _allVoices.length; j++) {
                    if (_allVoices[j].name.indexOf(preferredNames[i]) >= 0) {
                        return _allVoices[j];
                    }
                }
            }
            for (var k = 0; k < _allVoices.length; k++) {
                if (_allVoices[k].lang.indexOf('en') === 0) return _allVoices[k];
            }
            return _allVoices[0] || null;
        }

        function _cacheVoices() {
            _allVoices = _synth.getVoices();
            if (!_allVoices.length) return;
            _voicesReady = true;
            var keys = Object.keys(SPEAKER_PROFILES);
            for (var i = 0; i < keys.length; i++) {
                _cachedVoices[keys[i]] = _findVoice(SPEAKER_PROFILES[keys[i]].preferredVoices);
            }
            console.log('[VoiceManager] Cached ' + _allVoices.length + ' voices.');
        }

        function _resolveSpeakerProfile(speakerName) {
            if (!speakerName) return 'narrator';
            var lower = speakerName.toLowerCase().trim();
            if (SPEAKER_NAME_MAP[lower]) return SPEAKER_NAME_MAP[lower];
            if (lower.match(/[aei]$/)) return 'female';
            return 'narrator';
        }

        // ---------------------------------------------------------------
        // Advanced sentence chunking with prosody hints
        // ---------------------------------------------------------------

        /**
         * Split text into speech chunks with per-chunk prosody modifiers.
         * Detects: dialogue, exclamations, questions, ellipses, ALL CAPS,
         * em-dashes, and parentheticals to vary delivery.
         */
        function _chunkWithProsody(text, baseRate, basePitch, baseVolume) {
            if (!text || typeof text !== 'string') return [];

            // Clean up
            text = text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
            if (!text) return [];

            var chunks = [];

            // Split into segments: dialogue vs narration
            // Pattern: split on quotes but keep them
            var segments = text.split(/("(?:[^"\\]|\\.)*"|"(?:[^"\u201D\\]|\\.)*[\u201D"])/);

            for (var s = 0; s < segments.length; s++) {
                var seg = segments[s].trim();
                if (!seg) continue;

                var isDialogue = (seg.charAt(0) === '"' || seg.charAt(0) === '\u201C');

                // Remove surrounding quotes for cleaner speech
                if (isDialogue) {
                    seg = seg.replace(/^[""\u201C]+|[""\u201D]+$/g, '').trim();
                }

                // Split into sentences
                var sentences = seg.match(/[^.!?]+(?:[.!?]+["'\u2019\u201D]?\s*|$)/g);
                if (!sentences) sentences = [seg];

                for (var i = 0; i < sentences.length; i++) {
                    var sentence = sentences[i].trim();
                    if (!sentence) continue;

                    var rMod = 0, pMod = 0, vMod = 0;
                    var pauseAfter = 0;

                    // Dialogue gets slightly different delivery
                    if (isDialogue) {
                        rMod += 0.08;   // dialogue slightly faster (more natural)
                        pMod += 0.05;   // slightly higher pitch
                    }

                    // Exclamation — louder, faster
                    if (sentence.match(/!+\s*$/)) {
                        rMod += 0.12;
                        vMod += 0.15;
                        pMod += 0.1;
                    }

                    // Question — rising pitch
                    if (sentence.match(/\?+\s*$/)) {
                        pMod += 0.15;
                        rMod -= 0.05;
                    }

                    // Ellipsis — slower, quieter, longer pause
                    if (sentence.match(/\.{2,}\s*$/) || sentence.match(/…\s*$/)) {
                        rMod -= 0.15;
                        vMod -= 0.1;
                        pauseAfter = 400;
                    }

                    // ALL CAPS words — emphasis (louder, slower)
                    var capsWords = sentence.match(/\b[A-Z]{3,}\b/g);
                    if (capsWords && capsWords.length > 0) {
                        vMod += 0.1;
                        rMod -= 0.05;
                    }

                    // Em-dash or colon at start — dramatic pause before, slight emphasis
                    if (sentence.match(/^[\u2014—:]/)) {
                        pauseAfter = 300;
                        rMod -= 0.08;
                    }

                    // Parenthetical — quieter, aside delivery
                    if (sentence.match(/^\(/) || sentence.match(/\)$/)) {
                        vMod -= 0.15;
                        rMod += 0.1;
                        pMod -= 0.05;
                    }

                    // Short sentences (< 5 words) — more dramatic pacing
                    var wordCount = sentence.split(/\s+/).length;
                    if (wordCount <= 4) {
                        rMod -= 0.1;
                        pauseAfter = Math.max(pauseAfter, 350);
                    }

                    // Very long sentences — slightly faster to keep flow
                    if (wordCount > 25) {
                        rMod += 0.05;
                    }

                    chunks.push({
                        text: sentence,
                        rate: baseRate + rMod,
                        pitch: basePitch + pMod,
                        volume: baseVolume + vMod,
                        pauseAfter: pauseAfter,
                        isDialogue: isDialogue
                    });
                }
            }

            return chunks;
        }

        // ---------------------------------------------------------------
        // Core speech engine
        // ---------------------------------------------------------------

        function _speakNext() {
            if (!_enabled || _queue.length === 0) {
                _speaking = false;
                _currentUtterance = null;
                if (_speakNext._onEnd) {
                    var cb = _speakNext._onEnd;
                    _speakNext._onEnd = null;
                    cb();
                }
                return;
            }

            var entry = _queue.shift();
            var utterance = new SpeechSynthesisUtterance(entry.text);

            if (entry.voice) utterance.voice = entry.voice;
            utterance.rate   = Math.max(0.5, Math.min(2.0, entry.rate));
            utterance.pitch  = Math.max(0.1, Math.min(2.0, entry.pitch));
            utterance.volume = Math.max(0.0, Math.min(1.0, entry.volume));

            utterance.onend = function() {
                _currentUtterance = null;
                var pause = entry.pauseAfter || entry.basePause || 280;
                if (_queue.length > 0) {
                    setTimeout(_speakNext, pause);
                } else {
                    _speakNext();
                }
            };

            utterance.onerror = function(e) {
                if (e.error !== 'interrupted' && e.error !== 'canceled') {
                    console.warn('[VoiceManager] Speech error:', e.error);
                }
                _currentUtterance = null;
                _speaking = false;
                _queue = [];
            };

            _currentUtterance = utterance;
            _speaking = true;
            _synth.speak(utterance);
        }

        // ---------------------------------------------------------------
        // Public API
        // ---------------------------------------------------------------

        function init() {
            if (!_synth) {
                console.warn('[VoiceManager] SpeechSynthesis not available');
                return;
            }

            _cacheVoices();
            if (_synth.onvoiceschanged !== undefined) {
                _synth.onvoiceschanged = function() { _cacheVoices(); };
            }

            var EB = window.Latency.EventBus;
            if (EB) {
                EB.on('story:node', function(data) {
                    if (_enabled && data && data.node) {
                        var node = data.node;
                        var text = '';
                        if (Array.isArray(node.text)) {
                            text = node.text.join(' ');
                        } else if (typeof node.text === 'string') {
                            text = node.text;
                        }
                        if (!text) return;

                        speak(text, {
                            mood: node.mood || undefined,
                            speaker: node.speaker || undefined
                        });
                    }
                });
                EB.on('screen:change', function() { stop(); });
            }

            console.log('[VoiceManager] Initialized. Voices ready: ' + _voicesReady);
        }

        /**
         * Speak text with dynamic prosody — rate, pitch, and volume vary
         * per-sentence based on punctuation, dialogue, emphasis, and mood.
         */
        function speak(text, options) {
            if (!_synth || !_enabled) return;
            stop();

            options = options || {};
            var mood = options.mood || _defaultMood;
            var speakerName = options.speaker || _defaultSpeaker;

            var emotion = EMOTION_PROFILES[mood] || EMOTION_PROFILES.neutral;
            var profileKey = _resolveSpeakerProfile(speakerName);
            var speakerProfile = SPEAKER_PROFILES[profileKey] || SPEAKER_PROFILES.narrator;
            var voice = _cachedVoices[profileKey] || _cachedVoices.narrator || null;

            var baseRate   = emotion.rate   + speakerProfile.rateMod;
            var basePitch  = emotion.pitch  + speakerProfile.pitchMod;
            var baseVolume = emotion.volume;
            var basePause  = emotion.pauseMs || 280;

            // Build prosody-aware chunks
            var chunks = _chunkWithProsody(text, baseRate, basePitch, baseVolume);

            _queue = [];
            for (var i = 0; i < chunks.length; i++) {
                _queue.push({
                    text:       chunks[i].text,
                    voice:      voice,
                    rate:       chunks[i].rate,
                    pitch:      chunks[i].pitch,
                    volume:     chunks[i].volume,
                    pauseAfter: chunks[i].pauseAfter || basePause,
                    basePause:  basePause
                });
            }

            _speakNext._onEnd = options.onEnd || null;
            _speakNext();
        }

        function stop() {
            _queue = [];
            _speakNext._onEnd = null;
            if (_synth) { _synth.cancel(); }
            _speaking = false;
            _currentUtterance = null;
        }

        function setMood(mood) {
            if (EMOTION_PROFILES[mood]) _defaultMood = mood;
        }

        function setSpeaker(speakerName) {
            _defaultSpeaker = speakerName || null;
        }

        function setEnabled(val) { _enabled = !!val; if (!_enabled) stop(); }
        function isEnabled() { return _enabled; }
        function isSpeaking() { return _speaking; }
        function toggleEnabled() { setEnabled(!_enabled); return _enabled; }

        return {
            init: init,
            speak: speak,
            stop: stop,
            setEnabled: setEnabled,
            isEnabled: isEnabled,
            isSpeaking: isSpeaking,
            setMood: setMood,
            setSpeaker: setSpeaker,
            toggleEnabled: toggleEnabled
        };
    })();

    window.Latency.VoiceManager = VoiceManager;
})();
