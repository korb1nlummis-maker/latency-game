(function() {
    'use strict';
    window.Latency = window.Latency || {};

    var VoiceManager = (function() {
        var _enabled = true;
        var _speaking = false;
        var _synth = window.speechSynthesis;
        var _voice = null;
        var _rate = 0.9;
        var _pitch = 1.0;
        var _volume = 0.8;
        var _currentUtterance = null;
        var _queue = [];

        function init() {
            if (!_synth) { console.warn('[VoiceManager] SpeechSynthesis not available'); return; }
            // Pick a deep English voice
            function _selectVoice() {
                var voices = _synth.getVoices();
                // Prefer deep male voices for the dystopian narrator
                var preferred = ['Google UK English Male', 'Microsoft David', 'Daniel', 'Alex'];
                for (var i = 0; i < preferred.length; i++) {
                    for (var j = 0; j < voices.length; j++) {
                        if (voices[j].name.indexOf(preferred[i]) >= 0) { _voice = voices[j]; return; }
                    }
                }
                // Fallback to first English voice
                for (var k = 0; k < voices.length; k++) {
                    if (voices[k].lang.indexOf('en') === 0) { _voice = voices[k]; return; }
                }
                if (voices.length > 0) _voice = voices[0];
            }
            _selectVoice();
            if (_synth.onvoiceschanged !== undefined) {
                _synth.onvoiceschanged = _selectVoice;
            }
            // Subscribe to story events
            var EB = window.Latency.EventBus;
            if (EB) {
                EB.on('story:node', function(data) {
                    if (_enabled && data && data.text) {
                        // Strip HTML tags for speech
                        var cleanText = data.text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
                        speak(cleanText);
                    }
                });
                EB.on('screen:change', function() { stop(); });
            }
            console.log('[VoiceManager] Initialized. Voice: ' + (_voice ? _voice.name : 'pending'));
        }

        function speak(text) {
            if (!_synth || !_enabled) return;
            stop(); // Cancel any current speech
            // Split long text into sentences for better pacing
            var sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            for (var i = 0; i < sentences.length; i++) {
                var utterance = new SpeechSynthesisUtterance(sentences[i].trim());
                if (_voice) utterance.voice = _voice;
                utterance.rate = _rate;
                utterance.pitch = _pitch;
                utterance.volume = _volume;
                utterance.onend = function() { _speaking = _synth.speaking; };
                utterance.onerror = function() { _speaking = false; };
                _synth.speak(utterance);
            }
            _speaking = true;
        }

        function stop() {
            if (_synth) { _synth.cancel(); }
            _speaking = false;
        }

        function setEnabled(val) { _enabled = !!val; if (!_enabled) stop(); }
        function isEnabled() { return _enabled; }
        function isSpeaking() { return _speaking; }
        function setRate(r) { _rate = Math.max(0.5, Math.min(2.0, r)); }
        function setVolume(v) { _volume = Math.max(0, Math.min(1, v)); }
        function toggleEnabled() { setEnabled(!_enabled); return _enabled; }

        return {
            init: init,
            speak: speak,
            stop: stop,
            setEnabled: setEnabled,
            isEnabled: isEnabled,
            isSpeaking: isSpeaking,
            setRate: setRate,
            setVolume: setVolume,
            toggleEnabled: toggleEnabled
        };
    })();

    window.Latency.VoiceManager = VoiceManager;
})();
