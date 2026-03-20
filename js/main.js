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

    // ── 1c. SFX Manager (Web Audio API generated sounds) ──
    if (L.SfxManager && L.SfxManager.init) {
        L.SfxManager.init();
        console.log('[LATENCY] SfxManager initialized.');
    }

    // ── 2. Notification system ──
    if (L.Notification && L.Notification.init) {
        L.Notification.init();
        console.log('[LATENCY] Notification system initialized.');
    }

    // ── 2b. Tooltip system ──
    if (L.Tooltip && L.Tooltip.init) {
        L.Tooltip.init();
    }

    // ── 3. Screen Manager ──
    var container = document.getElementById('screen-container');
    if (!container) {
        console.error('[LATENCY] #screen-container not found in DOM.');
        return;
    }
    L.ScreenManager.init(container);

    // ── 4. Register ALL screens ──
    // Map screen class names to registration keys
    var SCREEN_MAP = {
        MainMenu: 'menu',
        CharacterCreation: 'creation',
        Gameplay: 'gameplay',
        SaveLoad: 'saveload',
        CombatScreen: 'combat',
        InventoryScreen: 'inventory',
        SkillsScreen: 'skills',
        AchievementsScreen: 'achievements',
        MapScreen: 'map',
        CutsceneScreen: 'cutscene',
        SettingsScreen: 'settings',
        EndingScreen: 'ending',
        HowToPlayScreen: 'howtoplay',
        JournalScreen: 'journal',
        LoadingScreen: 'loading'
    };

    function _registerAllScreens() {
        for (var className in SCREEN_MAP) {
            if (L.Screens[className]) {
                L.ScreenManager.register(SCREEN_MAP[className], L.Screens[className]);
            }
        }
    }

    // Register all screens once
    _registerAllScreens();

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

        // SFX toggle
        var sfxBtn = document.getElementById('sfx-toggle-btn');
        if (sfxBtn && L.SfxManager) {
            // Set initial state from persisted settings
            sfxBtn.textContent = L.SfxManager.isMuted() ? '\u{1F507}FX' : '\u{1F50A}FX';
            sfxBtn.addEventListener('click', function () {
                L.SfxManager.toggleMute();
                sfxBtn.textContent = L.SfxManager.isMuted() ? '\u{1F507}FX' : '\u{1F50A}FX';
            });
        }
    })();

    // ── 8. Achievement System ──
    if (L.AchievementSystem && L.AchievementSystem.init) {
        L.AchievementSystem.init();
        console.log('[LATENCY] AchievementSystem initialized.');
    }

    // ── 8b. Journal System ──
    if (L.Journal && L.Journal.init) {
        L.Journal.init();
        console.log('[LATENCY] Journal initialized.');
    }

    // ── 8c. New Game Plus ──
    if (L.NewGamePlus && L.NewGamePlus.init) {
        L.NewGamePlus.init();
        console.log('[LATENCY] NewGamePlus initialized.');
    }

    // ── 9. Particle effects ──
    if (L.Particles && L.Particles.init) {
        L.Particles.init();
        console.log('[LATENCY] Particles initialized.');
    }

    // ── 10. Apply persisted settings (from previous session) ──
    if (L.Screens.SettingsScreen && L.Screens.SettingsScreen.applyPersistedSettings) {
        L.Screens.SettingsScreen.applyPersistedSettings();
        console.log('[LATENCY] Persisted settings applied.');
    }

    // ── 11. Show main menu ──
    L.ScreenManager.show('menu');

    console.log('[LATENCY] Game initialized. Phases 3-10 — All systems loaded.');
});
