/**
 * LATENCY - Placeholder Creation Screen
 * ============================================================
 * Temporary screen used during Phase 2 testing to verify that
 * music playback survives screen transitions.  Will be replaced
 * by the real character-creation screen in Phase 3.
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.PlaceholderCreation = (function () {
    'use strict';

    var _container = null;
    var _listeners = [];

    function _bind(el, evt, fn) {
        el.addEventListener(evt, fn);
        _listeners.push({ element: el, event: evt, handler: fn });
    }

    return {
        mount: function (container) {
            _container = container;
            _listeners = [];

            var screen = document.createElement('div');
            screen.className = 'menu-screen';
            screen.style.textAlign = 'center';

            // Title
            var h1 = document.createElement('h1');
            h1.textContent = 'CHARACTER CREATION';
            h1.style.marginBottom = '2rem';
            screen.appendChild(h1);

            // Music status indicator
            var status = document.createElement('div');
            status.id = 'music-status';
            status.style.cssText = 'margin-bottom:2rem; font-size:1rem; color:var(--accent-2,#00d4ff);';
            screen.appendChild(status);

            // Update music status every 500ms
            var statusInterval = setInterval(function () {
                var mm = window.Latency.MusicManager;
                var track = mm.getCurrentTrack();
                var playing = mm.isPlaying();
                status.textContent = (playing ? '♫ PLAYING' : '⏸ PAUSED') +
                    (track ? ' — ' + track.title : ' — no track') +
                    ' | Vol: ' + Math.round(mm.getVolume() * 100) + '%';
            }, 500);

            // Info text
            var info = document.createElement('p');
            info.textContent = 'This is a placeholder screen. If you can still hear music, the system works!';
            info.style.cssText = 'margin-bottom:2rem; color:var(--text-secondary,#8899aa);';
            screen.appendChild(info);

            // Music controls
            var controls = document.createElement('div');
            controls.style.cssText = 'display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-bottom:2rem;';

            var btnDefs = [
                { label: 'PLAY', fn: function () { window.Latency.MusicManager.play(); } },
                { label: 'PAUSE', fn: function () { window.Latency.MusicManager.pause(); } },
                { label: 'NEXT TRACK', fn: function () { window.Latency.MusicManager.skipTo(window.Latency.MusicManager.getCurrentIndex() + 1); } },
                { label: 'PREV TRACK', fn: function () { window.Latency.MusicManager.skipTo(Math.max(0, window.Latency.MusicManager.getCurrentIndex() - 1)); } },
                { label: 'VOL +', fn: function () { window.Latency.MusicManager.setVolume(window.Latency.MusicManager.getVolume() + 0.1); } },
                { label: 'VOL -', fn: function () { window.Latency.MusicManager.setVolume(window.Latency.MusicManager.getVolume() - 0.1); } },
                { label: 'MUTE', fn: function () { window.Latency.MusicManager.toggleMute(); } }
            ];

            for (var i = 0; i < btnDefs.length; i++) {
                var btn = document.createElement('button');
                btn.className = 'menu-btn';
                btn.style.width = 'auto';
                btn.textContent = btnDefs[i].label;
                _bind(btn, 'click', btnDefs[i].fn);
                controls.appendChild(btn);
            }

            screen.appendChild(controls);

            // Back button
            var backBtn = document.createElement('button');
            backBtn.className = 'menu-btn';
            backBtn.textContent = '← BACK TO MENU';
            _bind(backBtn, 'click', function () {
                window.Latency.StateMachine.transition('menu');
            });
            screen.appendChild(backBtn);

            // Transition counter — tracks how many times we've transitioned
            var counter = document.createElement('div');
            counter.style.cssText = 'margin-top:2rem; font-size:0.75rem; color:var(--text-dim,#445566);';
            counter.textContent = 'Screen transitions should NEVER affect music playback.';
            screen.appendChild(counter);

            _container.appendChild(screen);

            // Store interval for cleanup
            _listeners.push({
                element: null, event: null,
                handler: function () { clearInterval(statusInterval); }
            });
        },

        unmount: function () {
            for (var i = 0; i < _listeners.length; i++) {
                var entry = _listeners[i];
                if (entry.element) {
                    entry.element.removeEventListener(entry.event, entry.handler);
                } else if (entry.handler) {
                    entry.handler(); // Call cleanup functions (like clearInterval)
                }
            }
            _listeners = [];
            _container = null;
        }
    };
})();
