/**
 * LATENCY - AssetLoader
 * ============================================================
 * Fetches and caches story JSON files and ASCII art text files.
 * Deduplicates in-flight requests so the same file is never
 * fetched twice concurrently.
 *
 * Depends on: (none — standalone utility)
 *
 * Usage:
 *   var data = await Latency.AssetLoader.loadStoryFile('story/shared/prologue');
 *   var art  = await Latency.AssetLoader.loadAsciiArt('assets/ascii/dragon.txt');
 *   Latency.AssetLoader.preload(['story/shared/prologue', 'story/shared/act1']);
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.AssetLoader = (function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Internal state
    // -----------------------------------------------------------------------

    /**
     * Resolved asset cache.
     * Keys are normalised paths (no leading slash, no extension for story files).
     * Values are parsed JSON objects or raw text strings.
     * @type {Object<string, *>}
     */
    var _cache = {};

    /**
     * In-flight request promises.
     * While a fetch is pending for a given path, subsequent callers receive
     * the same Promise instead of issuing a duplicate network request.
     * Entries are removed once the fetch settles (success or failure).
     * @type {Object<string, Promise>}
     */
    var _loading = {};

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Normalise a path for use as a cache key.
     * Strips leading slashes and collapses doubled slashes.
     * @param {string} path
     * @returns {string}
     */
    function _normalise(path) {
        return path
            .replace(/\\/g, '/')
            .replace(/^\/+/, '')
            .replace(/\/\//g, '/');
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Load and parse a story JSON file.
     *
     * The path should be given WITHOUT the .json extension — it is appended
     * automatically. Example: 'story/shared/prologue' fetches
     * 'story/shared/prologue.json'.
     *
     * @param {string} path - Relative path to the story file (no extension).
     * @returns {Promise<Object>} Parsed JSON content.
     */
    async function loadStoryFile(path) {
        var key = _normalise(path);

        // 1. Return from cache if we already have it.
        if (_cache[key] !== undefined) {
            return _cache[key];
        }

        // 2. Deduplicate — if another caller already kicked off this fetch,
        //    piggyback on the same Promise.
        if (_loading[key]) {
            return _loading[key];
        }

        // 3. Start a new fetch.
        var url = key + '.json';

        var promise = fetch(url)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error(
                        '[AssetLoader] Failed to load story file "' + url +
                        '" — HTTP ' + response.status
                    );
                }
                return response.json();
            })
            .then(function (data) {
                _cache[key] = data;
                delete _loading[key];
                return data;
            })
            .catch(function (err) {
                delete _loading[key];
                console.error(err.message || err);
                throw err;
            });

        _loading[key] = promise;
        return promise;
    }

    /**
     * Load an ASCII art text file and return its contents as a string.
     *
     * The full path including extension must be provided.
     * Example: 'assets/ascii/dragon.txt'
     *
     * @param {string} path - Relative path to the .txt file.
     * @returns {Promise<string>} Raw text content.
     */
    async function loadAsciiArt(path) {
        var key = _normalise(path);

        if (_cache[key] !== undefined) {
            return _cache[key];
        }

        if (_loading[key]) {
            return _loading[key];
        }

        var promise = fetch(key)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error(
                        '[AssetLoader] Failed to load ASCII art "' + key +
                        '" — HTTP ' + response.status
                    );
                }
                return response.text();
            })
            .then(function (text) {
                _cache[key] = text;
                delete _loading[key];
                return text;
            })
            .catch(function (err) {
                delete _loading[key];
                console.error(err.message || err);
                throw err;
            });

        _loading[key] = promise;
        return promise;
    }

    /**
     * Fire-and-forget batch preload.
     *
     * Accepts an array of paths. Story files (paths without a recognised
     * text extension) are loaded via loadStoryFile; paths ending in .txt
     * are loaded via loadAsciiArt.
     *
     * Errors are logged but never propagated — preloading is best-effort.
     *
     * @param {string[]} paths - Array of asset paths to preload.
     */
    function preload(paths) {
        if (!Array.isArray(paths)) {
            return;
        }

        for (var i = 0; i < paths.length; i++) {
            var p = paths[i];

            if (typeof p !== 'string' || !p) {
                continue;
            }

            if (/\.txt$/i.test(p)) {
                loadAsciiArt(p).catch(function () { /* swallow */ });
            } else {
                loadStoryFile(p).catch(function () { /* swallow */ });
            }
        }
    }

    /**
     * Clear the entire asset cache and cancel tracking of in-flight requests.
     * Useful when starting a new game or during testing.
     */
    function clearCache() {
        _cache = {};
        _loading = {};
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    return {
        /** @internal exposed for testing/debugging */
        _cache: _cache,
        _loading: _loading,

        loadStoryFile: loadStoryFile,
        loadAsciiArt: loadAsciiArt,
        preload: preload,
        clearCache: clearCache
    };
})();
