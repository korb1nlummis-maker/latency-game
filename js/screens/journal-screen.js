/**
 * LATENCY - Journal Screen
 * ============================================================
 * Two-tab overlay screen: QUESTS and CODEX.
 *
 * QUESTS tab:
 *   - Active quests (yellow), completed (green), failed (red)
 *   - Click to expand quest details and objective history
 *   - Grouped by status: Active, Completed, Failed
 *
 * CODEX tab:
 *   - Lore entries grouped by category (world, faction, tech, people)
 *   - Discovered entries readable; undiscovered show "???"
 *   - Click to expand full text
 *
 * Terminal aesthetic, scrollable panels, BACK button.
 *
 * Dependencies:
 *   - Latency.Journal       (quest/lore data)
 *   - Latency.EventBus      (events)
 *   - Latency.StateMachine  (navigation)
 *   - Latency.ScreenManager (fallback navigation)
 *
 * Screen contract: implements mount(container, params) and unmount()
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.JournalScreen = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Private state
    // -------------------------------------------------------------------

    var _container = null;
    var _listeners = [];   // DOM event bindings for cleanup
    var _unsubs    = [];   // EventBus unsubscribe functions

    // Cached DOM references
    var _els = {};

    // Current UI state
    var _activeTab = 'quests';       // 'quests' or 'codex'
    var _expandedQuestId = null;
    var _expandedLoreId = null;
    var _activeLoreCategory = null;  // null = all

    // -------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------

    var QUEST_TYPE_LABELS = {
        main:    'MAIN',
        side:    'SIDE',
        faction: 'FACTION'
    };

    var QUEST_TYPE_COLORS = {
        main:    'jnl-type-main',
        side:    'jnl-type-side',
        faction: 'jnl-type-faction'
    };

    var LORE_CATEGORY_LABELS = {
        world:   'WORLD',
        faction: 'FACTIONS',
        tech:    'TECHNOLOGY',
        people:  'PEOPLE'
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

    function _onBack() {
        if (window.Latency.StateMachine && typeof window.Latency.StateMachine.back === 'function') {
            window.Latency.StateMachine.back();
            return;
        }
        if (window.Latency.ScreenManager && typeof window.Latency.ScreenManager.show === 'function') {
            window.Latency.ScreenManager.show('gameplay');
        }
    }

    function _getJournal() {
        return window.Latency.Journal;
    }

    // -------------------------------------------------------------------
    // DOM construction
    // -------------------------------------------------------------------

    function _buildScreen() {
        var frag = document.createDocumentFragment();
        var screen = _el('div', 'jnl-screen');

        // ---- Header ----
        var header = _el('div', 'jnl-header');
        header.appendChild(_el('span', 'jnl-header-title', 'JOURNAL'));
        var closeBtn = _el('button', 'jnl-close-btn', '[ X CLOSE ]');
        closeBtn.setAttribute('type', 'button');
        _bind(closeBtn, 'click', _onBack);
        header.appendChild(closeBtn);
        screen.appendChild(header);

        // ---- Tab Bar ----
        var tabBar = _el('div', 'jnl-tab-bar');

        var questTab = _el('button', 'jnl-tab jnl-tab--active', 'QUESTS');
        questTab.setAttribute('type', 'button');
        questTab.setAttribute('data-tab', 'quests');
        _bind(questTab, 'click', function () { _switchTab('quests'); });
        tabBar.appendChild(questTab);

        var codexTab = _el('button', 'jnl-tab', 'CODEX');
        codexTab.setAttribute('type', 'button');
        codexTab.setAttribute('data-tab', 'codex');
        _bind(codexTab, 'click', function () { _switchTab('codex'); });
        tabBar.appendChild(codexTab);

        _els.tabBar = tabBar;
        screen.appendChild(tabBar);

        // ---- Separator ----
        screen.appendChild(_el('div', 'jnl-separator',
            '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550'));

        // ---- Content Panels ----
        var content = _el('div', 'jnl-content');

        var questPanel = _el('div', 'jnl-panel jnl-quest-panel');
        questPanel.setAttribute('data-ref', 'questPanel');
        content.appendChild(questPanel);

        var codexPanel = _el('div', 'jnl-panel jnl-codex-panel jnl-panel--hidden');
        codexPanel.setAttribute('data-ref', 'codexPanel');
        content.appendChild(codexPanel);

        screen.appendChild(content);

        // ---- Back Button ----
        var backBtn = _el('button', 'jnl-back-btn', '[ BACK ]');
        backBtn.setAttribute('type', 'button');
        _bind(backBtn, 'click', _onBack);
        screen.appendChild(backBtn);

        frag.appendChild(screen);
        return frag;
    }

    // -------------------------------------------------------------------
    // Tab switching
    // -------------------------------------------------------------------

    function _switchTab(tab) {
        if (tab === _activeTab) return;
        _activeTab = tab;

        // Update tab bar
        var tabs = _els.tabBar.querySelectorAll('.jnl-tab');
        for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].getAttribute('data-tab') === tab) {
                tabs[i].classList.add('jnl-tab--active');
            } else {
                tabs[i].classList.remove('jnl-tab--active');
            }
        }

        // Toggle panels
        if (tab === 'quests') {
            _els.questPanel.classList.remove('jnl-panel--hidden');
            _els.codexPanel.classList.add('jnl-panel--hidden');
            _renderQuests();
        } else {
            _els.questPanel.classList.add('jnl-panel--hidden');
            _els.codexPanel.classList.remove('jnl-panel--hidden');
            _renderCodex();
        }
    }

    // -------------------------------------------------------------------
    // Quest rendering
    // -------------------------------------------------------------------

    function _renderQuests() {
        var container = _els.questPanel;
        if (!container) return;
        container.innerHTML = '';

        _cleanDetachedListeners();

        var J = _getJournal();
        if (!J) {
            container.appendChild(_el('div', 'jnl-empty', 'Journal system unavailable.'));
            return;
        }

        var active = J.getActiveQuests();
        var completed = J.getCompletedQuests();
        var failed = J.getFailedQuests();

        var hasAny = active.length + completed.length + failed.length > 0;
        if (!hasAny) {
            container.appendChild(_el('div', 'jnl-empty', 'No quests recorded yet.'));
            return;
        }

        // Active quests section
        if (active.length > 0) {
            container.appendChild(_el('div', 'jnl-section-title jnl-section-active',
                '> ACTIVE QUESTS (' + active.length + ')'));
            for (var a = 0; a < active.length; a++) {
                container.appendChild(_buildQuestCard(active[a]));
            }
        }

        // Completed quests section
        if (completed.length > 0) {
            container.appendChild(_el('div', 'jnl-section-title jnl-section-completed',
                '> COMPLETED (' + completed.length + ')'));
            for (var c = 0; c < completed.length; c++) {
                container.appendChild(_buildQuestCard(completed[c]));
            }
        }

        // Failed quests section
        if (failed.length > 0) {
            container.appendChild(_el('div', 'jnl-section-title jnl-section-failed',
                '> FAILED (' + failed.length + ')'));
            for (var f = 0; f < failed.length; f++) {
                container.appendChild(_buildQuestCard(failed[f]));
            }
        }
    }

    function _buildQuestCard(quest) {
        var card = _el('div', 'jnl-quest-card');
        var isExpanded = _expandedQuestId === quest.id;

        // Status color class
        switch (quest.status) {
            case 'active':
                card.classList.add('jnl-quest--active');
                break;
            case 'completed':
                card.classList.add('jnl-quest--completed');
                break;
            case 'failed':
                card.classList.add('jnl-quest--failed');
                break;
        }

        if (isExpanded) {
            card.classList.add('jnl-quest--expanded');
        }

        // Header row: [TYPE] Title
        var headerRow = _el('div', 'jnl-quest-header');

        var typeTag = _el('span', 'jnl-quest-type ' + (QUEST_TYPE_COLORS[quest.type] || ''),
            '[' + (QUEST_TYPE_LABELS[quest.type] || quest.type.toUpperCase()) + ']');
        headerRow.appendChild(typeTag);

        var titleEl = _el('span', 'jnl-quest-title', quest.title);
        headerRow.appendChild(titleEl);

        // Status indicator
        var statusIcon = _el('span', 'jnl-quest-status-icon');
        switch (quest.status) {
            case 'active':
                statusIcon.textContent = '\u25B6'; // play/arrow
                break;
            case 'completed':
                statusIcon.textContent = '\u2713'; // checkmark
                break;
            case 'failed':
                statusIcon.textContent = '\u2717'; // X
                break;
        }
        headerRow.appendChild(statusIcon);

        card.appendChild(headerRow);

        // Current objective (always visible for active quests)
        if (quest.status === 'active' && quest.objective) {
            var objRow = _el('div', 'jnl-quest-objective',
                '\u25B8 ' + quest.objective);
            card.appendChild(objRow);
        }

        // Expanded details
        if (isExpanded) {
            var details = _el('div', 'jnl-quest-details');

            // Separator
            details.appendChild(_el('div', 'jnl-quest-sep',
                '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'));

            // Description
            details.appendChild(_el('div', 'jnl-quest-desc', quest.description));

            // Objective history (for active quests with history)
            if (quest.objectiveHistory && quest.objectiveHistory.length > 0) {
                details.appendChild(_el('div', 'jnl-quest-history-title', 'PREVIOUS OBJECTIVES:'));
                for (var h = 0; h < quest.objectiveHistory.length; h++) {
                    var histEntry = _el('div', 'jnl-quest-history-entry',
                        '\u2500 ' + quest.objectiveHistory[h].text);
                    histEntry.classList.add('jnl-quest-history-done');
                    details.appendChild(histEntry);
                }
            }

            // XP reward info (for completed quests)
            if (quest.status === 'completed' && quest.xpReward) {
                details.appendChild(_el('div', 'jnl-quest-reward',
                    'Reward: +' + quest.xpReward + ' XP'));
            }

            card.appendChild(details);
        }

        // Click to toggle expand
        (function (questId) {
            _bind(card, 'click', function () {
                _expandedQuestId = (_expandedQuestId === questId) ? null : questId;
                _renderQuests();
            });
        })(quest.id);

        return card;
    }

    // -------------------------------------------------------------------
    // Codex rendering
    // -------------------------------------------------------------------

    function _renderCodex() {
        var container = _els.codexPanel;
        if (!container) return;
        container.innerHTML = '';

        _cleanDetachedListeners();

        var J = _getJournal();
        if (!J) {
            container.appendChild(_el('div', 'jnl-empty', 'Journal system unavailable.'));
            return;
        }

        // Category filter bar
        var filterBar = _el('div', 'jnl-codex-filter');

        var allBtn = _el('button', 'jnl-codex-filter-btn' + (!_activeLoreCategory ? ' jnl-codex-filter--active' : ''), 'ALL');
        allBtn.setAttribute('type', 'button');
        _bind(allBtn, 'click', function () {
            _activeLoreCategory = null;
            _renderCodex();
        });
        filterBar.appendChild(allBtn);

        var categories = J.LORE_CATEGORIES;
        for (var c = 0; c < categories.length; c++) {
            (function (cat) {
                var label = LORE_CATEGORY_LABELS[cat] || cat.toUpperCase();
                var btn = _el('button',
                    'jnl-codex-filter-btn' + (_activeLoreCategory === cat ? ' jnl-codex-filter--active' : ''),
                    label);
                btn.setAttribute('type', 'button');
                _bind(btn, 'click', function () {
                    _activeLoreCategory = cat;
                    _renderCodex();
                });
                filterBar.appendChild(btn);
            })(categories[c]);
        }

        container.appendChild(filterBar);

        // Lore entries
        var entries = J.getLoreEntries(_activeLoreCategory);

        if (entries.length === 0) {
            container.appendChild(_el('div', 'jnl-empty', 'No codex entries in this category.'));
            return;
        }

        // Group by category
        var grouped = {};
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (!grouped[entry.category]) {
                grouped[entry.category] = [];
            }
            grouped[entry.category].push(entry);
        }

        // Render by category
        var catKeys = Object.keys(grouped);
        for (var g = 0; g < catKeys.length; g++) {
            var catKey = catKeys[g];
            var catLabel = LORE_CATEGORY_LABELS[catKey] || catKey.toUpperCase();
            var catEntries = grouped[catKey];

            var discovered = 0;
            for (var d = 0; d < catEntries.length; d++) {
                if (catEntries[d].discovered) discovered++;
            }

            container.appendChild(_el('div', 'jnl-codex-category-title',
                '[ ' + catLabel + ' ] (' + discovered + '/' + catEntries.length + ')'));

            for (var e = 0; e < catEntries.length; e++) {
                container.appendChild(_buildLoreCard(catEntries[e]));
            }
        }
    }

    function _buildLoreCard(entry) {
        var card = _el('div', 'jnl-lore-card');
        var isExpanded = _expandedLoreId === entry.id;

        if (entry.discovered) {
            card.classList.add('jnl-lore--discovered');
        } else {
            card.classList.add('jnl-lore--locked');
        }

        if (isExpanded) {
            card.classList.add('jnl-lore--expanded');
        }

        // Header
        var headerRow = _el('div', 'jnl-lore-header');

        if (entry.discovered) {
            var icon = _el('span', 'jnl-lore-icon', '\u25C6'); // diamond
            headerRow.appendChild(icon);
            headerRow.appendChild(_el('span', 'jnl-lore-title', entry.title));
        } else {
            var lockIcon = _el('span', 'jnl-lore-icon jnl-lore-locked-icon', '\u2588'); // block
            headerRow.appendChild(lockIcon);
            headerRow.appendChild(_el('span', 'jnl-lore-title jnl-lore-title--locked', '???'));
        }

        card.appendChild(headerRow);

        // Expanded text (only for discovered entries)
        if (isExpanded && entry.discovered) {
            var textArea = _el('div', 'jnl-lore-text');

            textArea.appendChild(_el('div', 'jnl-lore-sep',
                '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'));

            textArea.appendChild(_el('div', 'jnl-lore-body', entry.text));

            card.appendChild(textArea);
        }

        // Click to expand (only for discovered entries)
        if (entry.discovered) {
            (function (entryId) {
                _bind(card, 'click', function () {
                    _expandedLoreId = (_expandedLoreId === entryId) ? null : entryId;
                    _renderCodex();
                });
            })(entry.id);
            card.style.cursor = 'pointer';
        }

        return card;
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
        // Also cache tab bar
        var tabBar = _container.querySelector('.jnl-tab-bar');
        if (tabBar) _els.tabBar = tabBar;
    }

    function _refreshDisplay() {
        if (_activeTab === 'quests') {
            _renderQuests();
        } else {
            _renderCodex();
        }
    }

    // -------------------------------------------------------------------
    // EventBus subscriptions
    // -------------------------------------------------------------------

    function _subscribeEvents() {
        var b = window.Latency.EventBus;
        if (!b) return;

        _unsubs.push(b.on('journal:quest:added', _refreshDisplay));
        _unsubs.push(b.on('journal:quest:updated', _refreshDisplay));
        _unsubs.push(b.on('journal:quest:completed', _refreshDisplay));
        _unsubs.push(b.on('journal:quest:failed', _refreshDisplay));
        _unsubs.push(b.on('journal:lore:discovered', _refreshDisplay));
    }

    // -------------------------------------------------------------------
    // Public API - Screen contract
    // -------------------------------------------------------------------

    return {
        /**
         * Mount the journal screen into the given container.
         * @param {HTMLElement} container
         * @param {Object} [params] - Optional: { tab: 'quests'|'codex' }
         */
        mount: function (container, params) {
            _container = container;
            _listeners = [];
            _unsubs = [];
            _els = {};
            _expandedQuestId = null;
            _expandedLoreId = null;
            _activeLoreCategory = null;

            // Allow specifying initial tab
            if (params && params.tab === 'codex') {
                _activeTab = 'codex';
            } else {
                _activeTab = 'quests';
            }

            var dom = _buildScreen();
            _container.appendChild(dom);

            _cacheRefs();
            _subscribeEvents();

            // Set correct initial tab state
            if (_activeTab === 'codex') {
                _switchTab('codex');
            } else {
                _renderQuests();
            }

            console.log('[JournalScreen] Mounted.');
        },

        /**
         * Unmount the journal screen, cleaning up all listeners and DOM.
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
            _expandedQuestId = null;
            _expandedLoreId = null;
            _activeLoreCategory = null;

            console.log('[JournalScreen] Unmounted.');
        }
    };
})();
