/**
 * LATENCY - AsciiRenderer
 * ============================================================
 * Renders ASCII art into DOM containers with optional styling,
 * glow effects, and line-by-line animation.
 *
 * Depends on: Latency.AssetLoader (for renderFromFile)
 *
 * Usage:
 *   Latency.AsciiRenderer.render(container, asciiText, { color: '#00ff41', glow: true });
 *   await Latency.AsciiRenderer.renderFromFile(container, 'assets/ascii/logo.txt', { animate: true });
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.AsciiRenderer = (function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Constants
    // -----------------------------------------------------------------------

    /** Default animation speed — ms delay between each line reveal. */
    var ANIM_LINE_DELAY = 40;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Apply a CSS text-shadow glow effect matching the given colour.
     * @param {HTMLElement} el
     * @param {string} color - CSS colour value.
     */
    function _applyGlow(el, color) {
        el.style.textShadow =
            '0 0 4px ' + color + ', ' +
            '0 0 8px ' + color + ', ' +
            '0 0 16px ' + color;
    }

    /**
     * Escape HTML entities so that ASCII art characters like < > & render
     * correctly inside a <pre> element when set via innerHTML.
     * @param {string} text
     * @returns {string}
     */
    function _escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Render ASCII art text into a container element.
     *
     * Creates a <pre> element styled for monospace ASCII display and appends
     * it to the container. Supports colour, glow, custom CSS class, and
     * line-by-line reveal animation.
     *
     * @param {HTMLElement} container - DOM element to append the art into.
     * @param {string} asciiText - The raw ASCII art string.
     * @param {Object} [options] - Display options.
     * @param {string} [options.color='#00ff41'] - CSS colour for the text.
     * @param {boolean} [options.glow=false] - Apply a neon glow text-shadow.
     * @param {boolean} [options.animate=false] - Reveal lines one at a time.
     * @param {string} [options.className] - Additional CSS class(es) for the <pre>.
     * @param {number} [options.animDelay] - Ms between line reveals (default 40).
     * @returns {HTMLPreElement} The created <pre> element.
     */
    function render(container, asciiText, options) {
        if (!container) {
            console.error('[AsciiRenderer] No container element provided.');
            return null;
        }

        var opts = options || {};
        var color = opts.color || '#00ff41';
        var glow = !!opts.glow;
        var animate = !!opts.animate;
        var className = opts.className || '';
        var animDelay = Number(opts.animDelay) || ANIM_LINE_DELAY;

        // Create the <pre> element
        var pre = document.createElement('pre');
        pre.className = 'ascii-art' + (className ? ' ' + className : '');

        // Core styles — monospace, preserve whitespace, no wrapping
        pre.style.fontFamily = "'Courier New', Courier, monospace";
        pre.style.whiteSpace = 'pre';
        pre.style.overflow = 'hidden';
        pre.style.lineHeight = '1.2';
        pre.style.margin = '0 auto';
        pre.style.textAlign = 'center';
        pre.style.color = color;

        if (glow) {
            _applyGlow(pre, color);
        }

        container.appendChild(pre);

        if (!animate) {
            // ── Instant display ───────────────────────────────────────────
            pre.innerHTML = _escapeHtml(asciiText || '');
        } else {
            // ── Animated line-by-line reveal ──────────────────────────────
            var lines = (asciiText || '').split('\n');
            var lineIndex = 0;

            // Start fully transparent, we reveal line by line
            pre.innerHTML = '';

            var intervalId = setInterval(function () {
                if (lineIndex >= lines.length) {
                    clearInterval(intervalId);
                    return;
                }

                // Append the next line
                if (lineIndex > 0) {
                    pre.innerHTML += '\n';
                }
                pre.innerHTML += _escapeHtml(lines[lineIndex]);
                lineIndex++;
            }, animDelay);

            // Store the interval ID on the element so callers can cancel
            pre._asciiAnimInterval = intervalId;
        }

        return pre;
    }

    /**
     * Load an ASCII art file via AssetLoader and render it.
     *
     * @param {HTMLElement} container - DOM element to append the art into.
     * @param {string} filePath - Path to the .txt file (passed to AssetLoader).
     * @param {Object} [options] - Same options as render().
     * @returns {Promise<HTMLPreElement>} The created <pre> element.
     */
    async function renderFromFile(container, filePath, options) {
        if (!window.Latency.AssetLoader) {
            console.error('[AsciiRenderer] AssetLoader not available.');
            return null;
        }

        try {
            var text = await window.Latency.AssetLoader.loadAsciiArt(filePath);
            return render(container, text, options);
        } catch (err) {
            console.error(
                '[AsciiRenderer] Failed to load ASCII art from "' +
                filePath + '":', err
            );
            return null;
        }
    }

    return {
        render: render,
        renderFromFile: renderFromFile
    };
})();
