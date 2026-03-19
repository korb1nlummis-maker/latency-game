/**
 * LATENCY - Skills Screen
 * ============================================================
 * Full-screen overlay for viewing and acquiring skills across
 * 5 skill trees. Displays skills in tier rows with prerequisite
 * connections. Learned skills are green, available are cyan,
 * locked are dim. Click to learn (costs skill points).
 *
 * Depends on: Latency.EventBus, Latency.SkillSystem,
 *             Latency.SkillsData, Latency.StateMachine,
 *             Latency.ScreenManager
 *
 * Transitions:
 *   BACK -> StateMachine.back() (returns to previous screen)
 *
 * Screen contract: implements mount(container, params) and unmount()
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.SkillsScreen = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Private state
    // -------------------------------------------------------------------

    var _container = null;
    var _listeners = [];       // { element, event, handler }
    var _activeTree = 'combat';

    // -------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------

    var TREES = [
        { id: 'combat',   label: 'Combat',   icon: '⚔️',  color: 'var(--accent-1)' },
        { id: 'tech',     label: 'Tech',     icon: '💻',  color: 'var(--accent-2)' },
        { id: 'social',   label: 'Social',   icon: '🗣️', color: 'var(--accent-3)' },
        { id: 'survival', label: 'Survival', icon: '🥷',  color: 'var(--accent-4)' },
        { id: 'crafting', label: 'Crafting', icon: '🔧',  color: 'var(--text-secondary)' }
    ];

    var TIER_LABELS = ['', 'Tier I', 'Tier II', 'Tier III', 'Tier IV'];

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

    function _cleanupListeners() {
        for (var i = 0; i < _listeners.length; i++) {
            var l = _listeners[i];
            l.element.removeEventListener(l.event, l.handler);
        }
        _listeners = [];
    }

    // -------------------------------------------------------------------
    // Skill state classification
    // -------------------------------------------------------------------

    function getSkillState(skill) {
        var SS = window.Latency.SkillSystem;
        if (SS.hasSkill(skill.id)) { return 'learned'; }

        var ch = window.Latency.CharacterSystem.getCharacter();
        if (!ch) { return 'locked'; }

        // Check level
        if (ch.level < (skill.levelRequired || 1)) { return 'locked'; }

        // Check stats
        if (skill.statRequired) {
            for (var stat in skill.statRequired) {
                if (skill.statRequired.hasOwnProperty(stat)) {
                    if ((ch.stats[stat] || 0) < skill.statRequired[stat]) {
                        return 'locked';
                    }
                }
            }
        }

        // Check prerequisites
        if (skill.prerequisites && skill.prerequisites.length > 0) {
            for (var i = 0; i < skill.prerequisites.length; i++) {
                if (!SS.hasSkill(skill.prerequisites[i])) { return 'locked'; }
            }
        }

        // Check points
        if (SS.getAvailablePoints() < (skill.cost || 1)) { return 'no_points'; }

        return 'available';
    }

    // -------------------------------------------------------------------
    // Build the screen
    // -------------------------------------------------------------------

    function render() {
        if (!_container) { return; }
        _cleanupListeners();
        _container.innerHTML = '';

        var SS = window.Latency.SkillSystem;

        // Wrapper
        var wrapper = _el('div', 'skills-screen');

        // ---- Header ----
        var header = _el('div', 'skills-header');

        var title = _el('h1', 'skills-title', 'SKILLS');
        header.appendChild(title);

        var points = _el('div', 'skills-points');
        points.textContent = 'Skill Points: ' + SS.getAvailablePoints() + ' / ' + SS.getSkillPoints();
        header.appendChild(points);

        var backBtn = _el('button', 'skills-back-btn', 'BACK');
        _bind(backBtn, 'click', function () {
            if (window.Latency.StateMachine) {
                window.Latency.StateMachine.back();
            }
        });
        header.appendChild(backBtn);

        wrapper.appendChild(header);

        // ---- Tree tabs ----
        var tabBar = _el('div', 'skills-tab-bar');

        for (var t = 0; t < TREES.length; t++) {
            (function (tree) {
                var tab = _el('button', 'skills-tab', tree.icon + ' ' + tree.label);
                if (tree.id === _activeTree) {
                    tab.classList.add('active');
                    tab.style.borderBottomColor = tree.color;
                }
                _bind(tab, 'click', function () {
                    _activeTree = tree.id;
                    render();
                });
                tabBar.appendChild(tab);
            })(TREES[t]);
        }

        wrapper.appendChild(tabBar);

        // ---- Skill tree content ----
        var treeColor = '#999';
        for (var tc = 0; tc < TREES.length; tc++) {
            if (TREES[tc].id === _activeTree) { treeColor = TREES[tc].color; break; }
        }

        var treeContent = _el('div', 'skills-tree-content');
        var skills = SS.getSkillsByTree(_activeTree);

        // Group by tier
        var tiers = { 1: [], 2: [], 3: [], 4: [] };
        for (var s = 0; s < skills.length; s++) {
            var tier = skills[s].tier || 1;
            if (!tiers[tier]) { tiers[tier] = []; }
            tiers[tier].push(skills[s]);
        }

        // Render each tier
        for (var tierNum = 1; tierNum <= 4; tierNum++) {
            if (!tiers[tierNum] || tiers[tierNum].length === 0) { continue; }

            var tierSection = _el('div', 'skills-tier');

            var tierLabel = _el('div', 'skills-tier-label');
            tierLabel.textContent = TIER_LABELS[tierNum];
            tierLabel.style.color = treeColor;
            tierSection.appendChild(tierLabel);

            var tierGrid = _el('div', 'skills-tier-grid');

            for (var si = 0; si < tiers[tierNum].length; si++) {
                var skill = tiers[tierNum][si];
                var state = getSkillState(skill);

                var card = _el('div', 'skill-card skill-' + state);
                card.setAttribute('data-skill-id', skill.id);

                // State-based styling
                switch (state) {
                    case 'learned':
                        card.style.borderColor = 'var(--text-primary)';
                        card.style.opacity = '1';
                        break;
                    case 'available':
                        card.style.borderColor = 'var(--accent-2)';
                        card.style.opacity = '1';
                        card.style.cursor = 'pointer';
                        break;
                    case 'no_points':
                        card.style.borderColor = 'var(--accent-1)';
                        card.style.opacity = '0.7';
                        break;
                    case 'locked':
                        card.style.borderColor = 'var(--border-color)';
                        card.style.opacity = '0.4';
                        break;
                }

                // Icon
                var icon = _el('div', 'skill-icon', skill.icon || '?');
                card.appendChild(icon);

                // Name
                var name = _el('div', 'skill-name', skill.name);
                card.appendChild(name);

                // Cost
                var cost = _el('div', 'skill-cost', skill.cost + ' SP');
                card.appendChild(cost);

                // Description (shown on hover/click)
                var desc = _el('div', 'skill-desc', skill.description);
                card.appendChild(desc);

                // Prerequisites
                if (skill.prerequisites && skill.prerequisites.length > 0) {
                    var prereqText = 'Requires: ' + skill.prerequisites.map(function (pid) {
                        var pd = window.Latency.SkillsData[pid];
                        return pd ? pd.name : pid;
                    }).join(', ');
                    var prereq = _el('div', 'skill-prereq', prereqText);
                    card.appendChild(prereq);
                }

                // Stat requirements
                if (skill.statRequired) {
                    var statReqs = [];
                    for (var sr in skill.statRequired) {
                        if (skill.statRequired.hasOwnProperty(sr)) {
                            statReqs.push(sr.charAt(0).toUpperCase() + sr.slice(1) + ' ' + skill.statRequired[sr]);
                        }
                    }
                    if (statReqs.length > 0) {
                        var statReq = _el('div', 'skill-stat-req', statReqs.join(', '));
                        card.appendChild(statReq);
                    }
                }

                // Level requirement
                if (skill.levelRequired > 1) {
                    var lvlReq = _el('div', 'skill-lvl-req', 'Level ' + skill.levelRequired);
                    card.appendChild(lvlReq);
                }

                // Learned indicator
                if (state === 'learned') {
                    var checkmark = _el('div', 'skill-learned-badge', '\u2713');
                    card.appendChild(checkmark);
                }

                // Click handler for available skills
                if (state === 'available') {
                    (function (sid) {
                        _bind(card, 'click', function () {
                            var success = SS.learnSkill(sid);
                            if (success) {
                                render();
                            }
                        });
                    })(skill.id);
                }

                tierGrid.appendChild(card);
            }

            tierSection.appendChild(tierGrid);

            // Tier separator line
            if (tierNum < 4) {
                var separator = _el('div', 'skills-tier-separator');
                separator.style.borderColor = treeColor;
                tierSection.appendChild(separator);
            }

            treeContent.appendChild(tierSection);
        }

        wrapper.appendChild(treeContent);
        _container.appendChild(wrapper);

        // Inject styles if not already present
        injectStyles();
    }

    // -------------------------------------------------------------------
    // Styles
    // -------------------------------------------------------------------

    var _stylesInjected = false;

    function injectStyles() {
        if (_stylesInjected) { return; }
        _stylesInjected = true;

        var css = [
            '.skills-screen {',
            '  position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
            '  background: var(--bg-primary);',
            '  color: var(--text-primary);',
            '  display: flex; flex-direction: column;',
            '  font-family: var(--font-mono);',
            '  z-index: var(--z-notification);',
            '  overflow: hidden;',
            '}',
            '',
            '.skills-header {',
            '  display: flex; align-items: center; justify-content: space-between;',
            '  padding: var(--space-3) var(--space-5);',
            '  border-bottom: var(--border-default);',
            '  flex-shrink: 0;',
            '}',
            '',
            '.skills-title {',
            '  font-size: var(--text-xl); margin: 0;',
            '  color: var(--text-primary);',
            '  letter-spacing: var(--tracking-wider);',
            '}',
            '',
            '.skills-points {',
            '  font-size: var(--text-lg);',
            '  color: var(--accent-2);',
            '}',
            '',
            '.skills-back-btn {',
            '  background: none; border: 1px solid var(--border-color);',
            '  color: var(--text-primary);',
            '  padding: var(--space-1) var(--space-4); cursor: pointer;',
            '  font-family: inherit; font-size: var(--text-base);',
            '  letter-spacing: var(--tracking-wider);',
            '  transition: border-color var(--transition-normal), color var(--transition-normal);',
            '}',
            '.skills-back-btn:hover {',
            '  border-color: var(--accent-1);',
            '  color: var(--accent-1);',
            '}',
            '',
            '.skills-tab-bar {',
            '  display: flex; gap: 0; flex-shrink: 0;',
            '  border-bottom: var(--border-default);',
            '}',
            '',
            '.skills-tab {',
            '  flex: 1; background: none; border: none;',
            '  border-bottom: 3px solid transparent;',
            '  color: var(--text-secondary);',
            '  padding: var(--space-2) var(--space-2); cursor: pointer;',
            '  font-family: inherit; font-size: var(--text-base);',
            '  letter-spacing: var(--tracking-wide);',
            '  transition: color var(--transition-normal), border-color var(--transition-normal);',
            '}',
            '.skills-tab:hover {',
            '  color: var(--text-primary);',
            '}',
            '.skills-tab.active {',
            '  color: var(--text-primary);',
            '}',
            '',
            '.skills-tree-content {',
            '  flex: 1; overflow-y: auto; padding: var(--space-4) var(--space-5);',
            '}',
            '',
            '.skills-tier {',
            '  margin-bottom: var(--space-3);',
            '}',
            '',
            '.skills-tier-label {',
            '  font-size: var(--text-lg); font-weight: var(--weight-bold);',
            '  letter-spacing: var(--tracking-wider); margin-bottom: var(--space-2);',
            '  text-transform: uppercase;',
            '}',
            '',
            '.skills-tier-grid {',
            '  display: grid;',
            '  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));',
            '  gap: var(--space-2);',
            '}',
            '',
            '.skill-card {',
            '  border: 1px solid var(--border-color);',
            '  border-radius: var(--radius-md);',
            '  padding: var(--space-2);',
            '  background: rgba(255,255,255,0.03);',
            '  position: relative;',
            '  transition: border-color var(--transition-normal), opacity var(--transition-normal), transform var(--transition-fast);',
            '}',
            '.skill-card:hover {',
            '  transform: translateY(-2px);',
            '}',
            '.skill-card.skill-available:hover {',
            '  background: var(--accent-2-dim);',
            '}',
            '',
            '.skill-icon {',
            '  font-size: var(--text-xl); margin-bottom: var(--space-1);',
            '}',
            '',
            '.skill-name {',
            '  font-size: var(--text-base); font-weight: var(--weight-bold);',
            '  margin-bottom: var(--space-1);',
            '}',
            '',
            '.skill-cost {',
            '  font-size: var(--text-sm);',
            '  color: var(--accent-2);',
            '  margin-bottom: var(--space-1);',
            '}',
            '',
            '.skill-desc {',
            '  font-size: var(--text-sm);',
            '  color: var(--text-secondary);',
            '  line-height: var(--leading-snug);',
            '}',
            '',
            '.skill-prereq, .skill-stat-req, .skill-lvl-req {',
            '  font-size: var(--text-xs);',
            '  color: var(--accent-1);',
            '  margin-top: var(--space-1);',
            '}',
            '',
            '.skill-learned-badge {',
            '  position: absolute; top: var(--space-1); right: var(--space-2);',
            '  color: var(--text-primary); font-size: var(--text-lg); font-weight: var(--weight-bold);',
            '}',
            '',
            '.skills-tier-separator {',
            '  border-top: 1px dashed;',
            '  opacity: 0.3;',
            '  margin: var(--space-3) 0 var(--space-2) 0;',
            '}'
        ].join('\n');

        var style = document.createElement('style');
        style.setAttribute('data-latency-screen', 'skills');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // -------------------------------------------------------------------
    // Screen lifecycle
    // -------------------------------------------------------------------

    /**
     * Mount the skills screen into the given container.
     * @param {HTMLElement} container
     * @param {Object} [params]
     */
    function mount(container, params) {
        _container = container;
        _activeTree = (params && params.tree) || 'combat';

        // Guard: SkillSystem must be available before we can render the tree
        if (!window.Latency.SkillSystem) {
            console.error('[SkillsScreen] SkillSystem not available. Cannot render skills.');
            var errEl = _el('div', 'skills-screen');
            var errMsg = _el('div', 'skills-title', 'Skills unavailable');
            errEl.appendChild(errMsg);
            _container.appendChild(errEl);
            return;
        }

        render();
    }

    /** Unmount and clean up. */
    function unmount() {
        _cleanupListeners();
        if (_container) {
            _container.innerHTML = '';
        }
        _container = null;
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    return {
        mount:   mount,
        unmount: unmount
    };
})();
