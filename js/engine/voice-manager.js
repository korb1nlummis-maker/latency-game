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
        var _queue = [];         // sentence queue for chunked playback
        var _currentUtterance = null;
        var _pauseBetweenSentences = 250; // ms pause between chunks

        // Default mood/speaker applied when not passed explicitly
        var _defaultMood = 'neutral';
        var _defaultSpeaker = null;

        // ---------------------------------------------------------------
        // Emotion profiles
        // ---------------------------------------------------------------
        var EMOTION_PROFILES = {
            neutral:       { rate: 0.9,  pitch: 1.0,  volume: 0.8  },
            dark:          { rate: 0.75, pitch: 0.8,  volume: 0.7  },
            tension:       { rate: 1.1,  pitch: 1.1,  volume: 0.9  },
            anger:         { rate: 1.2,  pitch: 0.9,  volume: 1.0  },
            melancholy:    { rate: 0.7,  pitch: 0.85, volume: 0.6  },
            warm:          { rate: 0.85, pitch: 1.05, volume: 0.75 },
            eerie:         { rate: 0.65, pitch: 1.3,  volume: 0.5  },
            determination: { rate: 1.0,  pitch: 0.95, volume: 0.9  },
            cold:          { rate: 0.8,  pitch: 0.9,  volume: 0.7  }
        };

        // ---------------------------------------------------------------
        // Speaker voice mapping
        //   Each speaker type has preferred voice names and pitch/rate
        //   adjustments layered ON TOP of the emotion profile.
        // ---------------------------------------------------------------
        var SPEAKER_PROFILES = {
            narrator: {
                preferredVoices: ['Microsoft David', 'Google UK English Male', 'Daniel', 'Alex'],
                gender: 'male',
                pitchMod: 0,      // additive modifier
                rateMod: 0
            },
            female: {
                preferredVoices: ['Microsoft Zira', 'Google UK English Female', 'Samantha', 'Victoria', 'Karen'],
                gender: 'female',
                pitchMod: 0,
                rateMod: 0
            },
            tech: {
                preferredVoices: ['Microsoft Zira', 'Google UK English Female', 'Microsoft David', 'Google UK English Male'],
                gender: 'any',
                pitchMod: 0.15,
                rateMod: 0.1
            },
            monster: {
                preferredVoices: ['Microsoft David', 'Google UK English Male', 'Daniel', 'Alex'],
                gender: 'male',
                pitchMod: -0.3,
                rateMod: -0.15
            }
        };

        // Map known character names to speaker profiles
        var SPEAKER_NAME_MAP = {
            // Narrator
            'narrator':       'narrator',
            // Female characters
            'dr. vale':       'female',
            'dr vale':        'female',
            'vale':           'female',
            'mother':         'female',
            'sister':         'female',
            'aria':           'female',
            'kira':           'female',
            'zara':           'female',
            'elena':          'female',
            'nyx':            'female',
            'sable':          'female',
            // Tech / AI characters
            'ai':             'tech',
            'system':         'tech',
            'interface':      'tech',
            'ghost':          'tech',
            'cortex':         'tech',
            'daemon':         'tech',
            'cipher':         'tech',
            // Monster / orc characters
            'beast':          'monster',
            'creature':       'monster',
            'orc':            'monster',
            'demon':          'monster',
            'warden':         'monster',
            'brute':          'monster'
        };

        // Cached voice selections per profile type
        var _cachedVoices = {};

        // ---------------------------------------------------------------
        // Voice selection helpers
        // ---------------------------------------------------------------

        /**
         * Select the best voice from the available list for a given
         * set of preferred voice name fragments.
         */
        function _findVoice(preferredNames) {
            if (!_allVoices.length) return null;

            // Try each preferred name in order
            for (var i = 0; i < preferredNames.length; i++) {
                for (var j = 0; j < _allVoices.length; j++) {
                    if (_allVoices[j].name.indexOf(preferredNames[i]) >= 0) {
                        return _allVoices[j];
                    }
                }
            }

            // Fallback: first English voice
            for (var k = 0; k < _allVoices.length; k++) {
                if (_allVoices[k].lang.indexOf('en') === 0) {
                    return _allVoices[k];
                }
            }

            return _allVoices[0] || null;
        }

        /**
         * Cache voices for each speaker profile so we only search once.
         */
        function _cacheVoices() {
            _allVoices = _synth.getVoices();
            if (!_allVoices.length) return;

            _voicesReady = true;

            var keys = Object.keys(SPEAKER_PROFILES);
            for (var i = 0; i < keys.length; i++) {
                var profile = SPEAKER_PROFILES[keys[i]];
                _cachedVoices[keys[i]] = _findVoice(profile.preferredVoices);
            }

            console.log('[VoiceManager] Voices cached. Narrator: ' +
                (_cachedVoices.narrator ? _cachedVoices.narrator.name : 'none') +
                ', Female: ' + (_cachedVoices.female ? _cachedVoices.female.name : 'none'));
        }

        /**
         * Resolve a speaker name string to a speaker profile key.
         */
        function _resolveSpeakerProfile(speakerName) {
            if (!speakerName) return 'narrator';
            var lower = speakerName.toLowerCase().trim();
            if (SPEAKER_NAME_MAP[lower]) return SPEAKER_NAME_MAP[lower];

            // Heuristic: names ending in feminine suffixes
            if (lower.match(/[aei]$/)) return 'female';

            return 'narrator';
        }

        // ---------------------------------------------------------------
        // Sentence chunking
        // ---------------------------------------------------------------

        /**
         * Split text into natural sentence chunks.
         * Handles abbreviations, ellipsis, and quoted speech.
         */
        function _chunkSentences(text) {
            if (!text || typeof text !== 'string') return [];

            // Split on sentence-ending punctuation followed by space or end
            var raw = text.match(/[^.!?]+(?:[.!?]+["'\u2019\u201D]?\s*|$)/g);
            if (!raw) return [text.trim()];

            var sentences = [];
            for (var i = 0; i < raw.length; i++) {
                var s = raw[i].trim();
                if (s.length > 0) sentences.push(s);
            }
            return sentences.length > 0 ? sentences : [text.trim()];
        }

        // ---------------------------------------------------------------
        // Core speech engine
        // ---------------------------------------------------------------

        /**
         * Speak the next sentence in the queue.
         */
        function _speakNext() {
            if (!_enabled || _queue.length === 0) {
                _speaking = false;
                _currentUtterance = null;
                // Fire the stored onEnd callback
                if (_speakNext._onEnd) {
                    var cb = _speakNext._onEnd;
                    _speakNext._onEnd = null;
                    cb();
                }
                return;
            }

            var entry = _queue.shift();
            var utterance = new SpeechSynthesisUtterance(entry.text);

            // Apply voice
            if (entry.voice) utterance.voice = entry.voice;
            utterance.rate   = Math.max(0.5, Math.min(2.0, entry.rate));
            utterance.pitch  = Math.max(0.1, Math.min(2.0, entry.pitch));
            utterance.volume = Math.max(0.0, Math.min(1.0, entry.volume));

            utterance.onend = function() {
                _currentUtterance = null;
                // Pause between sentences for natural pacing
                if (_queue.length > 0) {
                    setTimeout(_speakNext, _pauseBetweenSentences);
                } else {
                    _speakNext();
                }
            };

            utterance.onerror = function(e) {
                // 'interrupted' and 'canceled' are normal when stop() is called
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

        /**
         * Initialize the voice system. Enumerates and caches voices.
         */
        function init() {
            if (!_synth) {
                console.warn('[VoiceManager] SpeechSynthesis not available');
                return;
            }

            // Voices may already be loaded or may load async
            _cacheVoices();
            if (_synth.onvoiceschanged !== undefined) {
                _synth.onvoiceschanged = function() {
                    _cacheVoices();
                };
            }

            // Subscribe to story events
            var EB = window.Latency.EventBus;
            if (EB) {
                EB.on('story:node', function(data) {
                    if (_enabled && data && data.node) {
                        var node = data.node;
                        // Join processed text array into a single string
                        var text = '';
                        if (Array.isArray(node.text)) {
                            text = node.text.join(' ');
                        } else if (typeof node.text === 'string') {
                            text = node.text;
                        }
                        if (!text) return;

                        // Strip HTML tags and entities
                        var cleanText = text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
                        speak(cleanText, {
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
         * Speak text with emotional inflection and character voice.
         *
         * @param {string} text - The text to speak.
         * @param {Object} [options] - Speech options.
         * @param {string} [options.mood] - Emotion profile name.
         * @param {string} [options.speaker] - Character name for voice selection.
         * @param {Function} [options.onEnd] - Callback when all speech finishes.
         */
        function speak(text, options) {
            if (!_synth || !_enabled) return;

            stop(); // Cancel any current speech

            options = options || {};
            var mood = options.mood || _defaultMood;
            var speakerName = options.speaker || _defaultSpeaker;

            // Resolve emotion profile
            var emotion = EMOTION_PROFILES[mood] || EMOTION_PROFILES.neutral;

            // Resolve speaker profile
            var profileKey = _resolveSpeakerProfile(speakerName);
            var speakerProfile = SPEAKER_PROFILES[profileKey] || SPEAKER_PROFILES.narrator;
            var voice = _cachedVoices[profileKey] || _cachedVoices.narrator || null;

            // Compute final rate, pitch, volume (emotion base + speaker modifier)
            var finalRate   = emotion.rate   + speakerProfile.rateMod;
            var finalPitch  = emotion.pitch  + speakerProfile.pitchMod;
            var finalVolume = emotion.volume;

            // Chunk into sentences
            var sentences = _chunkSentences(text);

            // Build queue
            _queue = [];
            for (var i = 0; i < sentences.length; i++) {
                _queue.push({
                    text:   sentences[i],
                    voice:  voice,
                    rate:   finalRate,
                    pitch:  finalPitch,
                    volume: finalVolume
                });
            }

            // Store onEnd callback
            _speakNext._onEnd = options.onEnd || null;

            // Start speaking
            _speakNext();
        }

        /**
         * Stop all current and queued speech.
         */
        function stop() {
            _queue = [];
            _speakNext._onEnd = null;
            if (_synth) { _synth.cancel(); }
            _speaking = false;
            _currentUtterance = null;
        }

        /**
         * Set the default mood for subsequent speak() calls.
         * @param {string} mood - One of the emotion profile keys.
         */
        function setMood(mood) {
            if (EMOTION_PROFILES[mood]) {
                _defaultMood = mood;
            }
        }

        /**
         * Set the default speaker for subsequent speak() calls.
         * @param {string} speakerName - Character name or profile key.
         */
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
