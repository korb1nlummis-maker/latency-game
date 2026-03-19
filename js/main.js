/**
 * LATENCY - Bootstrap
 * ============================================================
 * Entry point that initializes all engine systems and shows
 * the main menu. Runs after all engine, data, system, UI,
 * and screen scripts have loaded.
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var L = window.Latency;

    // ── 1. Music Manager (init FIRST — lives outside screen lifecycle) ──
    if (L.MusicManager && L.MusicManager.init) {
        L.MusicManager.init();
        console.log('[LATENCY] MusicManager initialized.');
    }

    // ── 1b. Voice Manager (after MusicManager) ──
    if (L.VoiceManager && L.VoiceManager.init) {
        L.VoiceManager.init();
        console.log('[LATENCY] VoiceManager initialized.');
    }

    // ── 2. Notification system ──
    if (L.Notification && L.Notification.init) {
        L.Notification.init();
        console.log('[LATENCY] Notification system initialized.');
    }

    // ── 3. Screen Manager ──
    var container = document.getElementById('screen-container');
    if (!container) {
        console.error('[LATENCY] #screen-container not found in DOM.');
        return;
    }
    L.ScreenManager.init(container);

    // ── 4. Register ALL screens ──
    if (L.Screens.MainMenu) {
        L.ScreenManager.register('menu', L.Screens.MainMenu);
    }
    if (L.Screens.CharacterCreation) {
        L.ScreenManager.register('creation', L.Screens.CharacterCreation);
    }
    if (L.Screens.Gameplay) {
        L.ScreenManager.register('gameplay', L.Screens.Gameplay);
    }
    if (L.Screens.SaveLoad) {
        L.ScreenManager.register('saveload', L.Screens.SaveLoad);
    }
    if (L.Screens.CombatScreen) L.ScreenManager.register('combat', L.Screens.CombatScreen);
    if (L.Screens.InventoryScreen) L.ScreenManager.register('inventory', L.Screens.InventoryScreen);
    if (L.Screens.SkillsScreen) L.ScreenManager.register('skills', L.Screens.SkillsScreen);
    if (L.Screens.AchievementsScreen) L.ScreenManager.register('achievements', L.Screens.AchievementsScreen);
    if (L.Screens.MapScreen) L.ScreenManager.register('map', L.Screens.MapScreen);
    if (L.Screens.CutsceneScreen) L.ScreenManager.register('cutscene', L.Screens.CutsceneScreen);

    // ── 5. State Machine ──
    if (L.StateMachine && L.StateMachine.init) {
        L.StateMachine.init();
        console.log('[LATENCY] StateMachine initialized.');
    }

    // ── 6. Update CONTINUE button based on SaveManager ──
    L.EventBus.on('screen:ready', function (data) {
        if (!data || data.screen !== 'menu') return;

        var continueBtn = container.querySelector('[data-menu-id="continue"]');
        if (!continueBtn) return;

        var hasSave = false;
        if (L.SaveManager && L.SaveManager.hasAnySave) {
            hasSave = L.SaveManager.hasAnySave();
        }

        continueBtn.disabled = !hasSave;
        continueBtn.setAttribute('aria-disabled', String(!hasSave));
        if (!hasSave) {
            continueBtn.title = 'No save data found';
        } else {
            continueBtn.title = '';
        }
    });

    // ── 7. Persistent music controls (outside screen container — always visible) ──
    (function initMusicControls() {
        var muteBtn = document.getElementById('music-mute-btn');
        var volDown = document.getElementById('music-vol-down');
        var volUp = document.getElementById('music-vol-up');
        var trackName = document.getElementById('music-track-name');

        if (!muteBtn || !L.MusicManager) return;

        muteBtn.addEventListener('click', function () {
            L.MusicManager.toggleMute();
            muteBtn.textContent = L.MusicManager.isMuted() ? '🔇' : '🔊';
        });

        volDown.addEventListener('click', function () {
            L.MusicManager.setVolume(L.MusicManager.getVolume() - 0.1);
        });

        volUp.addEventListener('click', function () {
            L.MusicManager.setVolume(L.MusicManager.getVolume() + 0.1);
        });

        // Update track name display
        function updateTrackDisplay() {
            var track = L.MusicManager.getCurrentTrack();
            if (track && trackName) {
                trackName.textContent = '♫ ' + track.title;
            }
        }

        L.EventBus.on('music:track', updateTrackDisplay);
        L.EventBus.on('music:play', updateTrackDisplay);
        updateTrackDisplay();

        // Voice toggle
        var voiceBtn = document.getElementById('voice-toggle-btn');
        if (voiceBtn && L.VoiceManager) {
            voiceBtn.addEventListener('click', function () {
                var nowEnabled = L.VoiceManager.toggleEnabled();
                voiceBtn.textContent = nowEnabled ? '\u{1F50A}V' : '\u{1F507}V';
            });
        }
    })();

    // ── 8. Achievement System ──
    if (L.AchievementSystem && L.AchievementSystem.init) {
        L.AchievementSystem.init();
        console.log('[LATENCY] AchievementSystem initialized.');
    }

    // ── 9. Show main menu ──
    L.ScreenManager.show('menu');

    console.log('[LATENCY] Game initialized. Phases 3-10 — All systems loaded.');
});
