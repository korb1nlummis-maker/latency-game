/**
 * LATENCY - Achievements Screen
 * ============================================================
 * Full-screen achievement viewer with category tabs, progress
 * bars, and a grid of achievement cards. Unlocked cards show
 * full details with rarity-colored borders; locked non-secret
 * cards appear dimmed; locked secret cards are fully obscured.
 *
 * Categories: All, Race, Combat, Exploration, Faction, Story,
 *             Secret, Meta
 *
 * Dependencies:
 *   - Latency.AchievementSystem   (unlock state, progress)
 *   - Latency.AchievementsData    (achievement definitions)
 *   - Latency.EventBus            (live unlock events)
 *   - Latency.StateMachine        (navigation)
 *   - Latency.ScreenManager       (fallback navigation)
 *
 * Screen contract: implements mount(container, params) and unmount()
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.AchievementsScreen = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Private state
    // -------------------------------------------------------------------

    var _container = null;
    var _listeners = [];   // DOM event bindings for cleanup
    var _unsubs    = [];   // EventBus unsubscribe functions
    var _activeCategory = 'all';

    // Cached DOM references
    var _els = {};

    // -------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------

    var CATEGORIES = [
        { id: 'all',         label: 'ALL' },
        { id: 'race',        label: 'RACE' },
        { id: 'combat',      label: 'COMBAT' },
        { id: 'exploration', label: 'EXPLORE' },
        { id: 'faction',     label: 'FACTION' },
        { id: 'story',       label: 'STORY' },
        { id: 'job',         label: 'JOB' },
        { id: 'economy',     label: 'ECONOMY' },
        { id: 'stat',        label: 'STAT' },
        { id: 'secret',      label: 'SECRET' },
        { id: 'meta',        label: 'META' }
    ];

    var RARITY_COLORS = {
        common:    '#ffffff',
        uncommon:  '#00ff88',
        rare:      '#00d4ff',
        epic:      '#8e44ad',
        legendary: '#ffd700'
    };

    var RARITY_LABELS = {
        common:    'COMMON',
        uncommon:  'UNCOMMON',
        rare:      'RARE',
        epic:      'EPIC',
        legendary: 'LEGENDARY'
    };

    // -------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------

    function _el(tag, className, textContent) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (textContent !== undefined) el.textContent = textContent;
        return el;
    }

    function _bind(element, event, handler) {
        element.addEventListener(event, handler);
        _listeners.push({ element: element, event: event, handler: handler });
    }

    function _cleanDetachedListeners() {
        _listeners = _listeners.filter(function (entry) {
            if (!document.contains(entry.element)) {
                entry.element.removeEventListener(entry.event, entry.handler);
                return false;
            }
            return true;
        });
    }

    function _sys() {
        return window.Latency.AchievementSystem;
    }

    function _data() {
        return window.Latency.AchievementsData;
    }

    function _formatDate(timestamp) {
        if (!timestamp) return '';
        var d = new Date(timestamp);
        var year = d.getFullYear();
        var month = ('0' + (d.getMonth() + 1)).slice(-2);
        var day = ('0' + d.getDate()).slice(-2);
        return year + '-' + month + '-' + day;
    }

    /**
     * Build a terminal-style progress bar using block characters.
     * @param {number} filled - Number of filled segments
     * @param {number} total - Total segments
     * @param {number} width - Bar width in characters
     * @returns {string}
     */
    function _progressBar(filled, total, width) {
        if (!total) return '\u2591'.repeat(width);
        var ratio = filled / total;
        var filledCount = Math.round(ratio * width);
        var emptyCount = width - filledCount;
        return '\u2588'.repeat(filledCount) + '\u2591'.repeat(emptyCount);
    }

    // -------------------------------------------------------------------
    // DOM construction
    // -------------------------------------------------------------------

    function _buildScreen() {
        var frag = document.createDocumentFragment();
        var screen = _el('div', 'ach-screen');

        // ---- Header ----
        var header = _el('div', 'ach-header');
        header.appendChild(_el('span', 'ach-header-title', 'ACHIEVEMENTS'));
        var closeBtn = _el('button', 'ach-close-btn', '[ X CLOSE ]');
        closeBtn.setAttribute('type', 'button');
        _bind(closeBtn, 'click', _onBack);
        header.appendChild(closeBtn);
        screen.appendChild(header);

        // ---- Overall progress ----
        var overallBar = _el('div', 'ach-overall-progress');
        overallBar.setAttribute('data-ref', 'overallProgress');
        screen.appendChild(overallBar);

        // ---- Separator ----
        screen.appendChild(_el('div', 'ach-separator',
            '\u2550'.repeat(48)));

        // ---- Category tabs ----
        var tabBar = _el('div', 'ach-tab-bar');
        tabBar.setAttribute('data-ref', 'tabBar');
        screen.appendChild(tabBar);

        // ---- Category progress ----
        var catProgress = _el('div', 'ach-category-progress');
        catProgress.setAttribute('data-ref', 'categoryProgress');
        screen.appendChild(catProgress);

        // ---- Achievement grid (scrollable) ----
        var gridWrap = _el('div', 'ach-grid-wrap');
        var grid = _el('div', 'ach-grid');
        grid.setAttribute('data-ref', 'achGrid');
        gridWrap.appendChild(grid);
        screen.appendChild(gridWrap);

        // ---- Back button ----
        var backBtn = _el('button', 'ach-back-btn', '[ BACK ]');
        backBtn.setAttribute('type', 'button');
        _bind(backBtn, 'click', _onBack);
        screen.appendChild(backBtn);

        frag.appendChild(screen);
        return frag;
    }

    // -------------------------------------------------------------------
    // Render: Tabs
    // -------------------------------------------------------------------

    function _renderTabs() {
        var tabBar = _els.tabBar;
        if (!tabBar) return;

        // Clean listeners pointing to detached DOM nodes (old tab buttons)
        _cleanDetachedListeners();

        tabBar.innerHTML = '';

        for (var i = 0; i < CATEGORIES.length; i++) {
            (function (cat) {
                var tab = _el('button', 'ach-tab', cat.label);
                tab.setAttribute('type', 'button');
                if (cat.id === _activeCategory) {
                    tab.classList.add('ach-tab--active');
                }
                _bind(tab, 'click', function () {
                    _activeCategory = cat.id;
                    _refreshDisplay();
                });
                tabBar.appendChild(tab);
            })(CATEGORIES[i]);
        }
    }

    // -------------------------------------------------------------------
    // Render: Overall progress
    // -------------------------------------------------------------------

    function _renderOverallProgress() {
        var el = _els.overallProgress;
        if (!el) return;
        el.innerHTML = '';

        var AS = _sys();
        if (!AS) return;

        var prog = AS.getTotalProgress();

        var label = _el('span', 'ach-progress-label',
            'TOTAL: ' + prog.unlocked + '/' + prog.total + ' (' + prog.percentage + '%)');
        el.appendChild(label);

        var bar = _el('span', 'ach-progress-bar ach-progress-bar--overall',
            _progressBar(prog.unlocked, prog.total, 30));
        el.appendChild(bar);
    }

    // -------------------------------------------------------------------
    // Render: Category progress
    // -------------------------------------------------------------------

    function _renderCategoryProgress() {
        var el = _els.categoryProgress;
        if (!el) return;
        el.innerHTML = '';

        if (_activeCategory === 'all') return;

        var AS = _sys();
        if (!AS) return;

        var prog = AS.getProgress(_activeCategory);

        var row = _el('div', 'ach-cat-progress-row');
        var label = _el('span', 'ach-cat-progress-label',
            _activeCategory.toUpperCase() + ': ' +
            prog.unlocked + '/' + prog.total + ' (' + prog.percentage + '%)');
        row.appendChild(label);

        var bar = _el('span', 'ach-progress-bar',
            _progressBar(prog.unlocked, prog.total, 24));
        row.appendChild(bar);

        el.appendChild(row);
    }

    // -------------------------------------------------------------------
    // Render: Achievement grid
    // -------------------------------------------------------------------

    function _renderGrid() {
        var grid = _els.achGrid;
        if (!grid) return;
        grid.innerHTML = '';

        var AD = _data();
        var AS = _sys();
        if (!AD || !AS) {
            grid.appendChild(_el('div', 'ach-empty', 'No achievement data available.'));
            return;
        }

        var achievements;
        if (_activeCategory === 'all') {
            achievements = AD.getAll();
        } else {
            achievements = AD.getByCategory(_activeCategory);
        }

        if (!achievements || achievements.length === 0) {
            grid.appendChild(_el('div', 'ach-empty', 'No achievements in this category.'));
            return;
        }

        // Sort: unlocked first, then by rarity
        var rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
        var sorted = achievements.slice().sort(function (a, b) {
            var aUnlocked = AS.isUnlocked(a.id) ? 0 : 1;
            var bUnlocked = AS.isUnlocked(b.id) ? 0 : 1;
            if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked;
            var aRarity = rarityOrder[a.rarity || 'common'] || 4;
            var bRarity = rarityOrder[b.rarity || 'common'] || 4;
            return aRarity - bRarity;
        });

        for (var i = 0; i < sorted.length; i++) {
            var ach = sorted[i];
            var unlocked = AS.isUnlocked(ach.id);
            var isSecret = ach.category === 'secret' || ach.secret;

            grid.appendChild(_buildCard(ach, unlocked, isSecret));
        }
    }

    // -------------------------------------------------------------------
    // Build: Achievement card
    // -------------------------------------------------------------------

    function _buildCard(ach, unlocked, isSecret) {
        var rarity = ach.rarity || 'common';
        var rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.common;

        var card = _el('div', 'ach-card');

        // State classes
        if (unlocked) {
            card.classList.add('ach-card--unlocked');
        } else if (isSecret) {
            card.classList.add('ach-card--secret');
        } else {
            card.classList.add('ach-card--locked');
        }

        // Rarity class
        card.classList.add('ach-card--' + rarity);

        // Rarity border color
        card.style.borderColor = unlocked ? rarityColor : '';

        // ---- Icon ----
        var iconEl = _el('div', 'ach-card-icon');
        if (unlocked) {
            iconEl.textContent = ach.icon || '\u2605';
        } else if (isSecret) {
            iconEl.textContent = '?';
        } else {
            iconEl.textContent = ach.icon || '\u2606';
        }
        card.appendChild(iconEl);

        // ---- Content area ----
        var content = _el('div', 'ach-card-content');

        // Name
        var nameEl = _el('div', 'ach-card-name');
        if (unlocked || !isSecret) {
            nameEl.textContent = ach.name;
        } else {
            nameEl.textContent = '???';
            nameEl.classList.add('ach-text-secret');
        }
        content.appendChild(nameEl);

        // Description
        var descEl = _el('div', 'ach-card-desc');
        if (unlocked || !isSecret) {
            descEl.textContent = ach.description || '';
        } else {
            descEl.textContent = 'Hidden achievement';
            descEl.classList.add('ach-text-secret');
        }
        content.appendChild(descEl);

        // Rarity tag
        var rarityEl = _el('div', 'ach-card-rarity');
        if (unlocked || !isSecret) {
            rarityEl.textContent = RARITY_LABELS[rarity] || 'COMMON';
            rarityEl.style.color = rarityColor;
        } else {
            rarityEl.textContent = '???';
        }
        content.appendChild(rarityEl);

        // Unlock date + character
        if (unlocked) {
            var unlockData = _sys().getUnlockedData()[ach.id];
            if (unlockData) {
                var dateStr = _formatDate(unlockData.unlockedAt);
                var unlockInfo = _el('div', 'ach-card-unlock-info');
                unlockInfo.textContent = 'Unlocked: ' + dateStr;
                if (unlockData.character) {
                    unlockInfo.textContent += ' (' + unlockData.character + ')';
                }
                content.appendChild(unlockInfo);
            }
        }

        // Reward hint (shown if unlocked or not secret)
        if (ach.reward && (unlocked || !isSecret)) {
            var rewardParts = [];
            if (ach.reward.xp)      rewardParts.push('+' + ach.reward.xp + ' XP');
            if (ach.reward.credits) rewardParts.push('+' + ach.reward.credits + ' \u00A2');
            if (ach.reward.item)    rewardParts.push('Item: ' + ach.reward.item);
            if (rewardParts.length > 0) {
                var rewardEl = _el('div', 'ach-card-reward',
                    'Reward: ' + rewardParts.join(', '));
                content.appendChild(rewardEl);
            }
        }

        card.appendChild(content);
        return card;
    }

    // -------------------------------------------------------------------
    // Navigation
    // -------------------------------------------------------------------

    function _onBack() {
        if (window.Latency.StateMachine && typeof window.Latency.StateMachine.back === 'function') {
            window.Latency.StateMachine.back();
            return;
        }
        if (window.Latency.ScreenManager && typeof window.Latency.ScreenManager.show === 'function') {
            window.Latency.ScreenManager.show('gameplay');
        }
    }

    // -------------------------------------------------------------------
    // Refresh
    // -------------------------------------------------------------------

    function _cacheRefs() {
        if (!_container) return;
        var refs = _container.querySelectorAll('[data-ref]');
        _els = {};
        for (var i = 0; i < refs.length; i++) {
            _els[refs[i].getAttribute('data-ref')] = refs[i];
        }
    }

    function _refreshDisplay() {
        _renderTabs();
        _renderOverallProgress();
        _renderCategoryProgress();
        _renderGrid();
    }

    // -------------------------------------------------------------------
    // EventBus subscriptions
    // -------------------------------------------------------------------

    function _subscribeEvents() {
        var b = window.Latency.EventBus;
        if (!b) return;

        _unsubs.push(b.on('achievement:unlocked', _refreshDisplay));
    }

    // -------------------------------------------------------------------
    // Public API - Screen contract
    // -------------------------------------------------------------------

    return {
        /**
         * Mount the achievements screen into the given container.
         * @param {HTMLElement} container
         * @param {Object} [params]
         * @param {string} [params.category] - Initial category tab
         */
        mount: function (container, params) {
            _container = container;
            _listeners = [];
            _unsubs    = [];
            _els = {};
            _activeCategory = (params && params.category) || 'all';

            var dom = _buildScreen();
            _container.appendChild(dom);

            _cacheRefs();
            _subscribeEvents();
            _refreshDisplay();

            console.log('[AchievementsScreen] Mounted.');
        },

        /**
         * Unmount the achievements screen, cleaning up all listeners and DOM.
         */
        unmount: function () {
            // Unsubscribe EventBus
            for (var u = 0; u < _unsubs.length; u++) {
                if (typeof _unsubs[u] === 'function') {
                    _unsubs[u]();
                }
            }
            _unsubs = [];

            // Remove DOM listeners
            for (var i = 0; i < _listeners.length; i++) {
                var entry = _listeners[i];
                entry.element.removeEventListener(entry.event, entry.handler);
            }
            _listeners = [];

            // Clear DOM
            if (_container) {
                _container.innerHTML = '';
            }
            _container = null;
            _els = {};

            console.log('[AchievementsScreen] Unmounted.');
        }
    };
})();
