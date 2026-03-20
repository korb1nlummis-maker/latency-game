/**
 * LATENCY - Typewriter
 * ============================================================
 * Character-by-character text display with support for inline
 * HTML tags, skipping, variable speed, and paragraph sequencing.
 *
 * Depends on: (none — standalone UI utility)
 *
 * Usage:
 *   var cancel = Latency.Typewriter.type(element, 'Hello world.', onDone);
 *   Latency.Typewriter.typeMultiple(element, ['Line 1.', 'Line 2.'], onDone);
 *   Latency.Typewriter.setSpeed(20);
 *   Latency.Typewriter.skip();
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.Typewriter = (function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Internal state
    // -----------------------------------------------------------------------

    /** @type {number} Milliseconds per character. */
    var _speed = 30;

    /** @type {boolean} When true, the current type() call skips to the end. */
    var _skipRequested = false;

    /** @type {number|null} The active setTimeout id, for cancellation. */
    var _timerId = null;

    /** @type {boolean} Whether a type operation is currently in progress. */
    var _typing = false;

    /** @type {number} Counter for visible characters typed, used for SFX throttling. */
    var _visibleCharCount = 0;

    /** @type {Function|null} Bound skip handler for keyboard/click events. */
    var _skipHandler = null;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Parse text into an array of segments, where each segment is either a
     * plain-text character or a complete HTML tag (e.g. "<span class='red'>").
     *
     * This lets us type character-by-character through visible text while
     * inserting HTML tags atomically (never showing partial tags).
     *
     * @param {string} text
     * @returns {string[]} Array of single characters and complete HTML tags.
     */
    function _tokenize(text) {
        var tokens = [];
        var i = 0;

        while (i < text.length) {
            if (text[i] === '<') {
                // Consume the entire tag
                var closeIdx = text.indexOf('>', i);
                if (closeIdx === -1) {
                    // Malformed tag — just emit the '<' as a character
                    tokens.push(text[i]);
                    i++;
                } else {
                    tokens.push(text.substring(i, closeIdx + 1));
                    i = closeIdx + 1;
                }
            } else if (text[i] === '&') {
                // Consume HTML entity (e.g. &amp; &lt; &#39;)
                var semiIdx = text.indexOf(';', i);
                if (semiIdx !== -1 && semiIdx - i < 10) {
                    tokens.push(text.substring(i, semiIdx + 1));
                    i = semiIdx + 1;
                } else {
                    tokens.push(text[i]);
                    i++;
                }
            } else {
                tokens.push(text[i]);
                i++;
            }
        }

        return tokens;
    }

    /**
     * Determine whether a token is an HTML tag (not visible text).
     * @param {string} token
     * @returns {boolean}
     */
    function _isTag(token) {
        return token.length > 1 && token[0] === '<' && token[token.length - 1] === '>';
    }

    /**
     * Install the skip listener (click or space/enter/escape).
     * @param {HTMLElement} element - The container being typed into.
     */
    function _installSkipListener(element) {
        _removeSkipListener();

        _skipHandler = function (e) {
            if (e.type === 'keydown') {
                // Space, Enter, or Escape to skip
                if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
                    e.preventDefault();
                    _skipRequested = true;
                }
            } else {
                // Click to skip
                _skipRequested = true;
            }
        };

        element.addEventListener('click', _skipHandler);
        document.addEventListener('keydown', _skipHandler);
    }

    /**
     * Remove the skip listener.
     */
    function _removeSkipListener() {
        if (_skipHandler) {
            document.removeEventListener('keydown', _skipHandler);
            // We can't reliably remove from the element since it may have
            // been cleared, so we just null it out — the listener becomes
            // a no-op if the element is gone.
            _skipHandler = null;
        }
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Type text into an element character by character.
     *
     * HTML tags within the text are inserted atomically (the user sees
     * styled text appear correctly, not raw tag characters).
     *
     * Click anywhere on the element, or press Space / Enter / Escape to
     * skip to the end.
     *
     * @param {HTMLElement} element - DOM element to type into.
     * @param {string} text - The text (may include inline HTML).
     * @param {Function} [onComplete] - Called when typing finishes.
     * @returns {Function} A cancel function — call it to abort mid-type.
     */
    function type(element, text, onComplete) {
        if (!element) {
            if (typeof onComplete === 'function') { onComplete(); }
            return function () {};
        }

        var cancelled = false;
        var tokens = _tokenize(text || '');
        var currentIndex = 0;

        _skipRequested = false;
        _typing = true;
        _visibleCharCount = 0;

        _installSkipListener(element);

        /**
         * Show all remaining text immediately.
         */
        function _finishImmediately() {
            if (cancelled) return;

            // Build the remaining HTML from currentIndex onward
            var remaining = '';
            for (var r = currentIndex; r < tokens.length; r++) {
                remaining += tokens[r];
            }
            element.innerHTML += remaining;
            currentIndex = tokens.length;

            _cleanup();
        }

        /**
         * Type the next token(s).
         */
        function _typeNext() {
            if (cancelled) return;

            // Skip requested — dump everything and finish
            if (_skipRequested) {
                _finishImmediately();
                return;
            }

            if (currentIndex >= tokens.length) {
                _cleanup();
                return;
            }

            var token = tokens[currentIndex];
            currentIndex++;

            // HTML tags are added instantly (no delay) and we continue
            // immediately to the next token
            if (_isTag(token)) {
                element.innerHTML += token;
                // Process next token immediately (tags are invisible)
                _typeNext();
                return;
            }

            // Visible character — append and schedule next
            element.innerHTML += token;

            // Play subtle typewriter SFX every 3rd visible character
            _visibleCharCount++;
            if (_visibleCharCount % 3 === 0 && window.Latency.SfxManager) {
                window.Latency.SfxManager.play('typewriter');
            }

            // Auto-scroll to keep new text visible
            // Check the element itself first (cutscene narrative), then parent panels (gameplay)
            if (element.scrollHeight > element.clientHeight) {
                element.scrollTop = element.scrollHeight;
            } else {
                var scrollParent = element.closest('.gp-narrative-panel') || element.parentElement;
                if (scrollParent && scrollParent.scrollHeight > scrollParent.clientHeight) {
                    scrollParent.scrollTop = scrollParent.scrollHeight;
                }
            }

            _timerId = setTimeout(_typeNext, _speed);
        }

        /**
         * Clean up after typing completes.
         */
        function _cleanup() {
            _typing = false;
            _timerId = null;
            _removeSkipListener();

            if (!cancelled && typeof onComplete === 'function') {
                onComplete();
            }
        }

        // Start typing
        _typeNext();

        // Return a cancel function
        return function cancel() {
            cancelled = true;
            if (_timerId !== null) {
                clearTimeout(_timerId);
                _timerId = null;
            }
            _typing = false;
            _removeSkipListener();
        };
    }

    /**
     * Type multiple text blocks sequentially into an element.
     * Each block is separated by a <p> wrapper for paragraph spacing.
     *
     * @param {HTMLElement} element - DOM element to type into.
     * @param {string[]} textArray - Array of text strings.
     * @param {Function} [onAllComplete] - Called when all blocks are typed.
     * @returns {Function} A cancel function that aborts the entire sequence.
     */
    function typeMultiple(element, textArray, onAllComplete) {
        if (!element || !Array.isArray(textArray) || textArray.length === 0) {
            if (typeof onAllComplete === 'function') { onAllComplete(); }
            return function () {};
        }

        var cancelCurrent = null;
        var cancelled = false;
        var index = 0;

        function _typeNextBlock() {
            if (cancelled || index >= textArray.length) {
                if (!cancelled && typeof onAllComplete === 'function') {
                    onAllComplete();
                }
                return;
            }

            var text = textArray[index];
            index++;

            // Create a paragraph container for this block
            var p = document.createElement('p');
            p.className = 'story-paragraph';
            element.appendChild(p);

            _skipRequested = false;

            cancelCurrent = type(p, text, function () {
                cancelCurrent = null;
                // Small pause between paragraphs
                if (!cancelled && index < textArray.length) {
                    _timerId = setTimeout(_typeNextBlock, _speed * 5);
                } else {
                    _typeNextBlock();
                }
            });
        }

        _typeNextBlock();

        return function cancelAll() {
            cancelled = true;
            if (cancelCurrent) {
                cancelCurrent();
                cancelCurrent = null;
            }
            if (_timerId !== null) {
                clearTimeout(_timerId);
                _timerId = null;
            }
        };
    }

    /**
     * Set the typing speed.
     * @param {number} ms - Milliseconds per character. Lower = faster.
     */
    function setSpeed(ms) {
        _speed = Math.max(1, Number(ms) || 30);
    }

    /**
     * @returns {number} Current typing speed in ms per character.
     */
    function getSpeed() {
        return _speed;
    }

    /**
     * Request that the current type() operation skip to the end.
     */
    function skip() {
        _skipRequested = true;
    }

    /**
     * @returns {boolean} Whether text is currently being typed.
     */
    function isTyping() {
        return _typing;
    }

    return {
        /** @internal exposed for testing */
        _speed: _speed,
        _skipRequested: _skipRequested,

        type: type,
        typeMultiple: typeMultiple,
        setSpeed: setSpeed,
        getSpeed: getSpeed,
        skip: skip,
        isTyping: isTyping
    };
})();
