/**
 * LATENCY - EventBus
 * Publish/subscribe event system for decoupled inter-module communication.
 *
 * Usage:
 *   const unsub = Latency.EventBus.on('player:damaged', (data) => { ... });
 *   Latency.EventBus.emit('player:damaged', { amount: 10 });
 *   unsub(); // stop listening
 */

window.Latency = window.Latency || {};

window.Latency.EventBus = (function () {
    'use strict';

    /** @type {Object<string, Array<{callback: Function, once: boolean}>>} */
    var _listeners = {};

    /**
     * Register a listener for an event.
     * @param {string} event - Event name (e.g. 'screen:change').
     * @param {Function} callback - Handler invoked with the event data.
     * @returns {Function} Unsubscribe function; call it to remove this listener.
     */
    function on(event, callback) {
        if (typeof event !== 'string' || !event) {
            throw new TypeError('EventBus.on: event must be a non-empty string');
        }
        if (typeof callback !== 'function') {
            throw new TypeError('EventBus.on: callback must be a function');
        }

        if (!_listeners[event]) {
            _listeners[event] = [];
        }

        var entry = { callback: callback, once: false };
        _listeners[event].push(entry);

        // Return an unsubscribe function for convenience
        return function unsubscribe() {
            off(event, callback);
        };
    }

    /**
     * Register a one-time listener. It is automatically removed after the
     * first invocation.
     * @param {string} event - Event name.
     * @param {Function} callback - Handler invoked once with the event data.
     * @returns {Function} Unsubscribe function (in case you want to cancel
     *     before the event fires).
     */
    function once(event, callback) {
        if (typeof event !== 'string' || !event) {
            throw new TypeError('EventBus.once: event must be a non-empty string');
        }
        if (typeof callback !== 'function') {
            throw new TypeError('EventBus.once: callback must be a function');
        }

        if (!_listeners[event]) {
            _listeners[event] = [];
        }

        var entry = { callback: callback, once: true };
        _listeners[event].push(entry);

        return function unsubscribe() {
            off(event, callback);
        };
    }

    /**
     * Remove a specific listener for an event.
     * @param {string} event - Event name.
     * @param {Function} callback - The exact function reference that was
     *     originally registered.
     */
    function off(event, callback) {
        if (!_listeners[event]) {
            return;
        }

        _listeners[event] = _listeners[event].filter(function (entry) {
            return entry.callback !== callback;
        });

        // Clean up empty arrays to avoid memory creep
        if (_listeners[event].length === 0) {
            delete _listeners[event];
        }
    }

    /**
     * Emit an event, invoking every registered listener with the supplied data.
     * Each listener is wrapped in try/catch so a single failing handler cannot
     * break the rest of the dispatch chain.
     * @param {string} event - Event name.
     * @param {*} [data] - Arbitrary payload passed to each listener.
     */
    function emit(event, data) {
        if (!_listeners[event]) {
            return;
        }

        // Snapshot the listener array so that mutations during iteration
        // (e.g. an on-handler calling off) don't cause skipped callbacks.
        var snapshot = _listeners[event].slice();
        var toRemove = [];

        for (var i = 0; i < snapshot.length; i++) {
            var entry = snapshot[i];
            try {
                entry.callback(data);
            } catch (err) {
                console.error(
                    '[EventBus] Error in listener for "' + event + '":',
                    err
                );
            }

            if (entry.once) {
                toRemove.push(entry);
            }
        }

        // Remove one-time listeners after the full dispatch so indices stay
        // stable during the loop above.
        if (toRemove.length > 0 && _listeners[event]) {
            _listeners[event] = _listeners[event].filter(function (entry) {
                return toRemove.indexOf(entry) === -1;
            });
            if (_listeners[event].length === 0) {
                delete _listeners[event];
            }
        }
    }

    /**
     * Remove every listener for every event.
     * Primarily intended for test teardown.
     */
    function reset() {
        _listeners = {};
    }

    /**
     * Return the number of listeners currently registered for an event.
     * Useful for debugging and tests.
     * @param {string} event - Event name.
     * @returns {number}
     */
    function listenerCount(event) {
        return _listeners[event] ? _listeners[event].length : 0;
    }

    // Public API
    return {
        /** @internal exposed for testing only */
        _listeners: _listeners,
        on: on,
        once: once,
        off: off,
        emit: emit,
        reset: reset,
        listenerCount: listenerCount
    };
})();
