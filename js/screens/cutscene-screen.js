/**
 * LATENCY - Cutscene Screen
 * ============================================================
 * Plays cinematic text sequences with ASCII art, music cues,
 * and typewriter narration for character origin stories and
 * key story moments.
 *
 * Cutscene data format:
 *   {
 *       id: 'origin_cyborg',
 *       title: 'SYSTEM BOOT',
 *       music: 5,
 *       slides: [
 *           { text: 'Narrative text...', mood: 'dark', duration: 0 },
 *           { art: 'ascii/cyborg-lab.txt', text: 'More text...', speaker: 'DR. VALE', duration: 0 },
 *           { text: 'Timed slide text...', mood: 'red', duration: 5000 },
 *       ],
 *       onComplete: 'gameplay'
 *   }
 *
 * Transitions:
 *   cutscene → gameplay  (after cutscene ends)
 *   cutscene → combat    (if onComplete specifies combat)
 *
 * Listens for:
 *   (none — self-contained playback)
 *
 * Emits:
 *   cutscene:complete  { id, onComplete }
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.CutsceneScreen = (function () {
    'use strict';

    // --------------------------------------------------------
    // Private state
    // --------------------------------------------------------
    var _container = null;
    var _listeners = [];       // { element, event, handler } for DOM events
    var _unsubs = [];          // EventBus unsubscribe functions
    var _typewriterCancel = null;
    var _typewriterRunning = false;
    var _pendingTimers = [];   // tracked setTimeout IDs for cleanup

    // DOM references (set during mount, nulled on unmount)
    var _els = {};

    // Cutscene playback state
    var _cutsceneData = null;
    var _currentSlideIndex = -1;
    var _slideCount = 0;
    var _waitingForInput = false;
    var _autoAdvanceTimer = null;
    var _fadingOut = false;

    // --------------------------------------------------------
    // Constants
    // --------------------------------------------------------
    var FADE_DURATION = 300;       // ms between slides
    var TYPEWRITER_SPEED = 30;     // ms per character
    var PROMPT_DELAY = 200;        // ms before showing prompt after text finishes

    // Mood background colors — each has animated gradient in CSS
    var MOOD_CLASSES = {
        dark:         'cs-mood-dark',
        red:          'cs-mood-red',
        blue:         'cs-mood-blue',
        melancholy:   'cs-mood-blue',
        peaceful:     'cs-mood-dark',
        neutral:      'cs-mood-dark',
        tension:      'cs-mood-tension',
        anger:        'cs-mood-red',
        determination:'cs-mood-warm',
        warm:         'cs-mood-warm',
        cold:         'cs-mood-blue',
        eerie:        'cs-mood-eerie',
        neon:         'cs-mood-neon',
        industrial:   'cs-mood-industrial',
        digital:      'cs-mood-digital',
        matrix:       'cs-mood-digital',
        winter:       'cs-mood-blue'
    };

    // --------------------------------------------------------
    // Helper: create a DOM element
    // --------------------------------------------------------
    function _el(tag, className, textContent) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (textContent !== undefined) el.textContent = textContent;
        return el;
    }

    // --------------------------------------------------------
    // Helper: bind DOM event and track for cleanup
    // --------------------------------------------------------
    function _bind(element, event, handler) {
        element.addEventListener(event, handler);
        _listeners.push({ element: element, event: event, handler: handler });
    }

    // --------------------------------------------------------
    // Helper: subscribe to EventBus and track for cleanup
    // --------------------------------------------------------
    function _subscribe(event, handler) {
        var unsub = window.Latency.EventBus.on(event, handler);
        _unsubs.push(unsub);
    }

    // --------------------------------------------------------
    // Helper: navigate via StateMachine
    // --------------------------------------------------------
    function _navigateTo(state, params) {
        if (window.Latency.StateMachine && window.Latency.StateMachine.transition) {
            var ok = window.Latency.StateMachine.transition(state, params);
            if (!ok) {
                console.warn('[CutsceneScreen] StateMachine rejected transition to:', state);
            }
            return;
        }
        if (window.Latency.ScreenManager && window.Latency.ScreenManager.show) {
            window.Latency.ScreenManager.show(state, params);
        }
    }

    // --------------------------------------------------------
    // Helper: tracked setTimeout
    // --------------------------------------------------------
    function _setTimeout(fn, delay) {
        var id = setTimeout(fn, delay);
        _pendingTimers.push(id);
        return id;
    }

    // --------------------------------------------------------
    // Helper: clear all pending timers
    // --------------------------------------------------------
    function _clearAllTimers() {
        for (var t = 0; t < _pendingTimers.length; t++) {
            clearTimeout(_pendingTimers[t]);
        }
        _pendingTimers = [];
        if (_autoAdvanceTimer !== null) {
            clearTimeout(_autoAdvanceTimer);
            _autoAdvanceTimer = null;
        }
    }

    // --------------------------------------------------------
    // Typewriter management
    // --------------------------------------------------------
    function _cancelTypewriter() {
        if (_typewriterCancel) {
            _typewriterCancel();
            _typewriterCancel = null;
        }
        _typewriterRunning = false;
    }

    function _typewrite(el, text, onComplete) {
        _cancelTypewriter();
        _typewriterRunning = true;

        if (window.Latency.Typewriter) {
            _typewriterCancel = window.Latency.Typewriter.type(el, text, function () {
                _typewriterRunning = false;
                _typewriterCancel = null;
                if (onComplete) onComplete();
            });
        } else {
            el.textContent = text;
            _typewriterRunning = false;
            if (onComplete) onComplete();
        }
    }

    function _skipTypewriter() {
        if (_typewriterRunning && window.Latency.Typewriter) {
            // Use Typewriter's own skip — it fires onComplete which triggers _onTextComplete
            window.Latency.Typewriter.skip();
            _typewriterRunning = false;
            _typewriterCancel = null;
            return true;
        }
        return false;
    }

    // --------------------------------------------------------
    // Build: screen DOM
    // --------------------------------------------------------
    function _buildScreen() {
        var screen = _el('div', 'cutscene-screen cs-mood-dark');

        // Cinematic canvas for animated background effects
        var cinematicCanvas = document.createElement('canvas');
        cinematicCanvas.className = 'cs-cinematic-canvas';
        cinematicCanvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
        screen.appendChild(cinematicCanvas);
        _els.cinematicCanvas = cinematicCanvas;

        // Initialize cinematic renderer
        if (window.Latency.CinematicRenderer) {
            window.Latency.CinematicRenderer.init(cinematicCanvas);
        }

        // Animated background gradient layer
        var bgGradient = _el('div', 'cs-bg-gradient');
        screen.appendChild(bgGradient);

        // Vignette overlay (dark edges)
        var vignette = _el('div', 'cs-vignette');
        screen.appendChild(vignette);

        // Cinematic letterbox bars
        screen.appendChild(_el('div', 'cs-letterbox-top'));
        screen.appendChild(_el('div', 'cs-letterbox-bottom'));

        // Corner frame decorations
        screen.appendChild(_el('div', 'cs-frame-corner cs-frame-tl'));
        screen.appendChild(_el('div', 'cs-frame-corner cs-frame-tr'));
        screen.appendChild(_el('div', 'cs-frame-corner cs-frame-bl'));
        screen.appendChild(_el('div', 'cs-frame-corner cs-frame-br'));

        // Ambient data streams (falling code on sides)
        var streamLeft = _el('div', 'cs-data-stream cs-data-stream-left');
        _buildDataStream(streamLeft, 4);
        screen.appendChild(streamLeft);

        var streamRight = _el('div', 'cs-data-stream cs-data-stream-right');
        _buildDataStream(streamRight, 4);
        screen.appendChild(streamRight);

        // Floating particles
        var particles = _el('div', 'cs-particles');
        _buildParticles(particles, 15);
        screen.appendChild(particles);

        // Horizontal sweep line
        screen.appendChild(_el('div', 'cs-sweep-line'));

        // CRT scanline overlay
        var scanlines = _el('div', 'cs-scanlines');
        screen.appendChild(scanlines);

        // Slide counter (top-right)
        var counter = _el('div', 'cs-slide-counter', '1/' + _slideCount);
        _els.slideCounter = counter;
        screen.appendChild(counter);

        // Slide container (fades between slides)
        var slideContainer = _el('div', 'cs-slide-container');
        _els.slideContainer = slideContainer;

        // ASCII art area
        var artArea = _el('div', 'cs-ascii-area');
        _els.asciiArea = artArea;
        slideContainer.appendChild(artArea);

        // Speaker name
        var speakerEl = _el('div', 'cs-speaker');
        _els.speaker = speakerEl;
        slideContainer.appendChild(speakerEl);

        // Narrative text area
        var narrativeText = _el('div', 'cs-narrative-text');
        _els.narrativeText = narrativeText;
        slideContainer.appendChild(narrativeText);

        screen.appendChild(slideContainer);

        // "CLICK TO CONTINUE" prompt (bottom, inside letterbox area)
        var prompt = _el('div', 'cs-continue-prompt', 'CLICK TO CONTINUE');
        prompt.style.visibility = 'hidden';
        _els.prompt = prompt;
        screen.appendChild(prompt);

        return screen;
    }

    // --------------------------------------------------------
    // Build: floating data particles
    // --------------------------------------------------------
    function _buildParticles(container, count) {
        var chars = '01アイウエオカキクケコ░▒▓█▀▄■□●○◆◇';
        for (var i = 0; i < count; i++) {
            var p = _el('span', 'cs-particle');
            p.textContent = chars[Math.floor(Math.random() * chars.length)];
            p.style.left = (Math.random() * 100) + '%';
            p.style.animationDuration = (8 + Math.random() * 12) + 's';
            p.style.animationDelay = (Math.random() * 10) + 's';
            p.style.fontSize = (8 + Math.random() * 6) + 'px';
            container.appendChild(p);
        }
    }

    // --------------------------------------------------------
    // Build: falling data stream columns
    // --------------------------------------------------------
    function _buildDataStream(container, columns) {
        var chars = '01001101010011001010110100101';
        for (var i = 0; i < columns; i++) {
            var col = _el('div', 'cs-data-column');
            // Build a random column of characters
            var text = '';
            var len = 20 + Math.floor(Math.random() * 30);
            for (var j = 0; j < len; j++) {
                text += chars[Math.floor(Math.random() * chars.length)] + '\n';
            }
            col.textContent = text;
            col.style.left = (i * (60 / columns) + Math.random() * 5) + 'px';
            col.style.animationDuration = (6 + Math.random() * 8) + 's';
            col.style.animationDelay = (Math.random() * 5) + 's';
            container.appendChild(col);
        }
    }

    // --------------------------------------------------------
    // Set mood (background tint)
    // --------------------------------------------------------
    function _setMood(mood) {
        if (!_els.screen) return;

        // Remove all mood classes
        var keys = Object.keys(MOOD_CLASSES);
        for (var i = 0; i < keys.length; i++) {
            _els.screen.classList.remove(MOOD_CLASSES[keys[i]]);
        }

        // Add the requested mood class
        var cls = MOOD_CLASSES[mood] || MOOD_CLASSES.dark;
        _els.screen.classList.add(cls);
    }

    // --------------------------------------------------------
    // Show a slide
    // --------------------------------------------------------
    function _showSlide(index) {
        if (!_cutsceneData || !_cutsceneData.slides) return;
        if (index < 0 || index >= _slideCount) return;

        _currentSlideIndex = index;
        _waitingForInput = false;
        _fadingOut = false;

        // Cancel any running typewriter
        _cancelTypewriter();

        // Hide prompt
        if (_els.prompt) {
            _els.prompt.style.visibility = 'hidden';
        }

        // Update slide counter
        if (_els.slideCounter) {
            _els.slideCounter.textContent = (index + 1) + '/' + _slideCount;
        }

        var slide = _cutsceneData.slides[index];

        // Fade out current slide content
        if (_els.slideContainer) {
            _els.slideContainer.classList.add('cs-fade-out');
        }

        _fadingOut = true;

        _setTimeout(function () {
            _fadingOut = false;
            _renderSlideContent(slide);

            // Fade in new content
            if (_els.slideContainer) {
                _els.slideContainer.classList.remove('cs-fade-out');
                _els.slideContainer.classList.add('cs-fade-in');
                console.log('[CutsceneScreen] Removed cs-fade-out, added cs-fade-in');
            }

            _setTimeout(function () {
                if (_els.slideContainer) {
                    _els.slideContainer.classList.remove('cs-fade-in');
                }
            }, FADE_DURATION);
        }, FADE_DURATION);
    }

    // --------------------------------------------------------
    // Render slide content (called after fade-out)
    // --------------------------------------------------------
    function _renderSlideContent(slide) {
        if (!slide) return;

        // Set mood
        var mood = slide.mood || 'dark';
        _setMood(mood);

        // Set cinematic background effect — per-slide override or mood-mapped
        if (window.Latency.CinematicRenderer) {
            var moodEffectMap = {
                dark:          'fog',
                red:           'embers',
                tension:       'embers',
                anger:         'embers',
                blue:          'rain',
                melancholy:    'rain',
                cold:          'rain',
                eerie:         'void',
                warm:          'neon',
                neon:          'neon',
                neutral:       'stars',
                peaceful:      'stars',
                determination: 'sparks',
                industrial:    'smoke',
                digital:       'datastream',
                winter:        'snow',
                matrix:        'datastream'
            };
            // Per-slide effect override takes priority over mood mapping
            var effect = slide.effect || moodEffectMap[mood] || 'fog';
            var intensity = (typeof slide.effectIntensity === 'number') ? slide.effectIntensity : 0.6;
            window.Latency.CinematicRenderer.setEffect(effect, { intensity: intensity });
        }

        // Handle music cue on this slide
        if (slide.music !== undefined && slide.music !== null && window.Latency.MusicManager) {
            if (typeof slide.music === 'number') {
                window.Latency.MusicManager.skipTo(slide.music);
            } else if (typeof slide.music === 'string' && window.Latency.MusicManager.playByCategory) {
                window.Latency.MusicManager.playByCategory(slide.music);
            }
        }

        // Clear areas
        if (_els.asciiArea) {
            _els.asciiArea.innerHTML = '';
            _els.asciiArea.style.display = 'none';
        }
        if (_els.speaker) {
            _els.speaker.textContent = '';
            _els.speaker.style.display = 'none';
        }
        if (_els.narrativeText) {
            _els.narrativeText.innerHTML = '';
        }

        // Render art (ASCII text or image, if provided)
        if (slide.art && _els.asciiArea) {
            _els.asciiArea.style.display = 'block';

            // Check if art path is an image file
            var artPath = slide.art.toLowerCase();
            var isImage = artPath.endsWith('.png') || artPath.endsWith('.jpg') ||
                          artPath.endsWith('.jpeg') || artPath.endsWith('.webp');

            if (isImage) {
                // Render as <img> with cyberpunk styling + Ken Burns animation
                var imgContainer = _el('div', 'cs-art-image');
                var img = document.createElement('img');
                img.src = slide.art;
                img.alt = slide.speaker ? slide.speaker : 'Cutscene';
                // Alternate Ken Burns direction for visual variety
                var useAlt = slide.artAnim === 'alt' || (_currentSlideIndex % 2 === 1);
                img.className = 'ascii-art-image' + (useAlt ? ' ken-burns-alt' : '');
                img.onload = function () {
                    img.style.opacity = '1';
                };
                imgContainer.appendChild(img);
                _els.asciiArea.appendChild(imgContainer);
            } else if (window.Latency.AsciiRenderer && window.Latency.AsciiRenderer.renderFromFile) {
                window.Latency.AsciiRenderer.renderFromFile(
                    _els.asciiArea,
                    slide.art,
                    { color: '#00ff41', glow: true }
                );
            } else if (window.Latency.AssetLoader && window.Latency.AssetLoader.loadAsciiArt) {
                window.Latency.AssetLoader.loadAsciiArt(slide.art).then(function (artText) {
                    if (_els.asciiArea) {
                        var pre = _el('pre', 'cs-ascii-art');
                        pre.textContent = artText;
                        _els.asciiArea.appendChild(pre);
                    }
                }).catch(function () {
                    // Silently fail — art is optional
                });
            }
        }

        // Render speaker name
        if (slide.speaker && _els.speaker) {
            _els.speaker.textContent = '> ' + slide.speaker;
            _els.speaker.style.display = 'block';
        }

        // Render narrative text via typewriter
        if (slide.text && _els.narrativeText) {
            // Trigger voice narration if VoiceManager is available
            if (window.Latency.VoiceManager && window.Latency.VoiceManager.isEnabled()) {
                var cleanText = slide.text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
                var voiceOpts = {};
                if (slide.mood) voiceOpts.mood = slide.mood;
                if (slide.speaker) voiceOpts.speaker = slide.speaker;
                window.Latency.VoiceManager.speak(cleanText, voiceOpts);
            }

            _els.narrativeText.setAttribute('data-full-text', slide.text);

            _typewrite(_els.narrativeText, slide.text, function () {
                _onTextComplete(slide);
            });
        } else {
            // No text — go directly to wait/advance
            _onTextComplete(slide);
        }
    }

    // --------------------------------------------------------
    // Called when text finishes typing for current slide
    // --------------------------------------------------------
    function _onTextComplete(slide) {
        var duration = (slide && slide.duration !== undefined) ? slide.duration : 0;

        if (duration === 0) {
            // Wait for click / keypress
            _waitingForInput = true;
            _setTimeout(function () {
                if (_els.prompt) {
                    _els.prompt.style.visibility = 'visible';
                }
            }, PROMPT_DELAY);
        } else {
            // Auto-advance after duration
            _autoAdvanceTimer = _setTimeout(function () {
                _autoAdvanceTimer = null;
                _advanceSlide();
            }, duration);

            // Still show prompt but dimmer — user can click to skip
            _waitingForInput = true;
            _setTimeout(function () {
                if (_els.prompt) {
                    _els.prompt.style.visibility = 'visible';
                }
            }, PROMPT_DELAY);
        }
    }

    // --------------------------------------------------------
    // Advance to next slide
    // --------------------------------------------------------
    function _advanceSlide() {
        if (_autoAdvanceTimer !== null) {
            clearTimeout(_autoAdvanceTimer);
            _autoAdvanceTimer = null;
        }

        var nextIndex = _currentSlideIndex + 1;

        if (nextIndex >= _slideCount) {
            // Cutscene complete
            _completeCutscene();
        } else {
            _showSlide(nextIndex);
        }
    }

    // --------------------------------------------------------
    // Handle user input (click / key)
    // --------------------------------------------------------
    function _handleInput(e) {
        // Ignore clicks on music controls (they sit over the cutscene)
        if (e && e.type === 'click') {
            var target = e.target;
            while (target && target !== document.body) {
                if (target.id === 'music-controls') return;
                target = target.parentElement;
            }
        }

        // Prevent default for spacebar (no page scroll)
        if (e && e.type === 'keydown') {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
            } else {
                // Only respond to space, enter, escape
                if (e.code !== 'Escape') return;
            }
        }

        // If fading between slides, ignore input
        if (_fadingOut) return;

        // If typewriter is running, skip to end of text first
        if (_typewriterRunning) {
            _skipTypewriter();
            // After skipping, _onTextComplete will be called by the
            // typewriter cancel completing the text.  We need to trigger
            // the completion ourselves since cancel doesn't call onComplete.
            var slide = _cutsceneData && _cutsceneData.slides
                ? _cutsceneData.slides[_currentSlideIndex]
                : null;
            _onTextComplete(slide);
            return;
        }

        // If waiting for input, advance
        if (_waitingForInput) {
            _waitingForInput = false;
            if (_els.prompt) {
                _els.prompt.style.visibility = 'hidden';
            }
            _advanceSlide();
        }
    }

    // --------------------------------------------------------
    // Complete cutscene
    // --------------------------------------------------------
    function _completeCutscene() {
        var id = _cutsceneData ? _cutsceneData.id : null;
        var onComplete = _cutsceneData ? (_cutsceneData.onComplete || 'gameplay') : 'gameplay';

        // Emit completion event
        window.Latency.EventBus.emit('cutscene:complete', {
            id: id,
            onComplete: onComplete
        });

        console.log('[CutsceneScreen] Cutscene complete:', id, '-> navigating to:', onComplete);

        // Navigate to the next screen
        _navigateTo(onComplete);
    }

    // --------------------------------------------------------
    // Play music for cutscene (initial track)
    // --------------------------------------------------------
    function _startMusic() {
        if (!_cutsceneData || _cutsceneData.music === undefined || _cutsceneData.music === null) return;

        if (window.Latency.MusicManager) {
            if (typeof _cutsceneData.music === 'number') {
                window.Latency.MusicManager.skipTo(_cutsceneData.music);
            } else if (typeof _cutsceneData.music === 'string' && window.Latency.MusicManager.playByCategory) {
                window.Latency.MusicManager.playByCategory(_cutsceneData.music);
            }
        }
    }

    // --------------------------------------------------------
    // Show title card with cinematic reveal
    // --------------------------------------------------------
    function _showTitleCard(title, onComplete) {
        if (!_els.screen) {
            if (onComplete) onComplete();
            return;
        }

        // Create title card overlay
        var card = _el('div', 'cs-title-card');
        var titleText = _el('div', 'cs-title-text', title);
        card.appendChild(titleText);

        // Add subtitle based on cutscene type
        if (_cutsceneData && _cutsceneData.id) {
            var subtitle = '';
            if (_cutsceneData.id.indexOf('origin_') === 0) {
                subtitle = 'ORIGIN STORY';
            } else if (_cutsceneData.id.indexOf('act') === 0) {
                subtitle = 'CHAPTER';
            }
            if (subtitle) {
                var sub = _el('div', 'cs-title-subtitle', subtitle);
                card.appendChild(sub);
            }
        }

        _els.screen.appendChild(card);

        // Hide slide container during title
        if (_els.slideContainer) {
            _els.slideContainer.style.opacity = '0';
        }

        // Trigger animation
        _setTimeout(function () {
            card.classList.add('cs-visible');
        }, 50);

        // Remove title card after animation and show first slide
        _setTimeout(function () {
            if (card.parentNode) {
                card.parentNode.removeChild(card);
            }
            if (_els.slideContainer) {
                _els.slideContainer.style.opacity = '1';
            }
            if (onComplete) onComplete();
        }, 3200);
    }

    // --------------------------------------------------------
    // Public API
    // --------------------------------------------------------
    return {
        /**
         * Mount the cutscene screen into the given container.
         * @param {HTMLElement} container - The #screen-container element.
         * @param {Object} [params] - Cutscene data or { cutscene: {...} }.
         */
        mount: function (container, params) {
            _container = container;
            _listeners = [];
            _unsubs = [];
            _els = {};
            _pendingTimers = [];
            _typewriterCancel = null;
            _typewriterRunning = false;
            _currentSlideIndex = -1;
            _waitingForInput = false;
            _autoAdvanceTimer = null;
            _fadingOut = false;

            // Extract cutscene data from params
            _cutsceneData = null;
            if (params) {
                if (params.slides) {
                    // params IS the cutscene data
                    _cutsceneData = params;
                } else if (params.cutscene) {
                    // params.cutscene is the cutscene data
                    _cutsceneData = params.cutscene;
                } else if (params.cutsceneId && window.Latency.CutsceneData) {
                    // Look up cutscene by ID from global registry
                    _cutsceneData = window.Latency.CutsceneData[params.cutsceneId];
                }
            }

            // Fallback: empty cutscene
            if (!_cutsceneData || !_cutsceneData.slides || _cutsceneData.slides.length === 0) {
                console.warn('[CutsceneScreen] No cutscene data provided. Skipping to next screen.');
                _cutsceneData = _cutsceneData || {};
                _completeCutscene();
                return;
            }

            _slideCount = _cutsceneData.slides.length;

            // Build and insert DOM
            var screen = _buildScreen();
            _els.screen = screen;
            _container.appendChild(screen);

            // Bind input handlers
            _bind(screen, 'click', _handleInput);
            _bind(document, 'keydown', _handleInput);

            // Start music
            _startMusic();

            // Show title card if cutscene has a title, then first slide
            if (_cutsceneData.title) {
                _showTitleCard(_cutsceneData.title, function () {
                    _showSlide(0);
                });
            } else {
                _showSlide(0);
            }

            console.log('[CutsceneScreen] Mounted. Playing cutscene:', _cutsceneData.id || '(unnamed)',
                '—', _slideCount, 'slides.');
        },

        /**
         * Unmount the cutscene screen, cleaning up event listeners and DOM.
         */
        unmount: function () {
            // Destroy cinematic renderer
            if (window.Latency.CinematicRenderer) {
                window.Latency.CinematicRenderer.destroy();
            }

            // Cancel typewriter
            _cancelTypewriter();

            // Clear all timers
            _clearAllTimers();

            // Remove DOM event listeners
            for (var i = 0; i < _listeners.length; i++) {
                var entry = _listeners[i];
                entry.element.removeEventListener(entry.event, entry.handler);
            }
            _listeners = [];

            // Unsubscribe from EventBus
            for (var j = 0; j < _unsubs.length; j++) {
                _unsubs[j]();
            }
            _unsubs = [];

            // Clear DOM references
            _els = {};
            _cutsceneData = null;
            _currentSlideIndex = -1;
            _slideCount = 0;
            _waitingForInput = false;
            _fadingOut = false;

            // Clear container
            if (_container) {
                _container.innerHTML = '';
            }
            _container = null;

            console.log('[CutsceneScreen] Unmounted.');
        }
    };
})();
