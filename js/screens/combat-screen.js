/**
 * LATENCY - Combat Screen
 * ============================================================
 * Full combat UI with split player/enemy view, HP bars,
 * scrolling combat log, action buttons, dice animations,
 * and victory/defeat overlays.
 *
 * Dependencies:
 *   - window.Latency.EventBus         (event system)
 *   - window.Latency.Combat           (combat engine)
 *   - window.Latency.CharacterSystem  (player data)
 *   - window.Latency.DiceAnimator     (dice roll visuals)
 *   - window.Latency.Items            (item lookup for names)
 *   - window.Latency.ScreenManager    (screen transitions)
 *
 * Listens for:
 *   combat:start       -> build initial state
 *   combat:stateChange -> update HP bars, enable/disable actions
 *   combat:log         -> append to combat log
 *   combat:turn        -> toggle action button states
 *   combat:end         -> show victory/defeat overlay
 *   dice:roll          -> trigger dice animation
 *
 * Screen contract:
 *   mount(container, params): void
 *   unmount(): void
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.CombatScreen = (function () {
    'use strict';

    // --------------------------------------------------------
    // Private state
    // --------------------------------------------------------
    var _container = null;
    var _listeners = [];   // { element, event, handler }
    var _unsubs = [];       // EventBus unsubscribe functions
    var _els = {};          // DOM element references
    var _diceQueue = [];    // Queue dice animations
    var _animatingDice = false;
    var _abilitySubmenuOpen = false;
    var _itemSubmenuOpen = false;
    var _pendingTimers = [];    // tracked setTimeout IDs for cleanup

    // --------------------------------------------------------
    // Helpers
    // --------------------------------------------------------

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

    function _subscribe(event, handler) {
        var unsub = window.Latency.EventBus.on(event, handler);
        _unsubs.push(unsub);
    }

    function _buildBar(current, max, width) {
        if (max <= 0) return '░'.repeat(width);
        var filled = Math.round((current / max) * width);
        if (filled < 0) filled = 0;
        if (filled > width) filled = width;
        return '█'.repeat(filled) + '░'.repeat(width - filled);
    }

    function _getHpColorClass(current, max) {
        if (max <= 0) return 'cb-bar-low';
        var pct = current / max;
        if (pct > 0.6) return 'cb-bar-high';
        if (pct > 0.3) return 'cb-bar-mid';
        return 'cb-bar-low';
    }

    function _getLogEntryClass(type) {
        switch (type) {
            case 'hit':    return 'cb-log-hit';
            case 'miss':   return 'cb-log-miss';
            case 'crit':   return 'cb-log-crit';
            case 'heal':   return 'cb-log-heal';
            case 'status': return 'cb-log-status';
            default:       return 'cb-log-info';
        }
    }

    // --------------------------------------------------------
    // Build: Combat Header
    // --------------------------------------------------------
    function _buildHeader() {
        var header = _el('div', 'cb-header');
        var title = _el('div', 'cb-title', 'COMBAT ENCOUNTER');
        header.appendChild(title);

        var turnInfo = _el('div', 'cb-turn-info', 'Turn 1');
        _els.turnInfo = turnInfo;
        header.appendChild(turnInfo);

        return header;
    }

    // --------------------------------------------------------
    // Build: Combatant panels (player + enemy)
    // --------------------------------------------------------
    function _buildCombatantsArea() {
        var area = _el('div', 'cb-combatants');

        // Player panel
        var playerPanel = _el('div', 'cb-combatant cb-player-panel');

        var playerLabel = _el('div', 'cb-combatant-label', 'PLAYER');
        playerPanel.appendChild(playerLabel);

        var playerName = _el('div', 'cb-combatant-name', '---');
        _els.playerName = playerName;
        playerPanel.appendChild(playerName);

        // Player HP bar
        var playerHpBlock = _el('div', 'cb-bar-block');
        playerHpBlock.innerHTML =
            '<span class="cb-bar-label">HP:</span> ' +
            '<span class="cb-bar cb-hp-bar cb-player-hp-bar">████████░░</span> ' +
            '<span class="cb-bar-numbers cb-player-hp-numbers">0/0</span>';
        _els.playerHpBar = playerHpBlock.querySelector('.cb-player-hp-bar');
        _els.playerHpNumbers = playerHpBlock.querySelector('.cb-player-hp-numbers');
        playerPanel.appendChild(playerHpBlock);

        // Player STA bar
        var playerStaBlock = _el('div', 'cb-bar-block');
        playerStaBlock.innerHTML =
            '<span class="cb-bar-label">STA:</span> ' +
            '<span class="cb-bar cb-sta-bar cb-player-sta-bar">████████░░</span> ' +
            '<span class="cb-bar-numbers cb-player-sta-numbers">0/0</span>';
        _els.playerStaBar = playerStaBlock.querySelector('.cb-player-sta-bar');
        _els.playerStaNumbers = playerStaBlock.querySelector('.cb-player-sta-numbers');
        playerPanel.appendChild(playerStaBlock);

        // Player status effects
        var playerEffects = _el('div', 'cb-status-effects cb-player-effects');
        _els.playerEffects = playerEffects;
        playerPanel.appendChild(playerEffects);

        area.appendChild(playerPanel);

        // VS divider
        var vsDiv = _el('div', 'cb-vs-divider', 'VS');
        area.appendChild(vsDiv);

        // Enemy panel
        var enemyPanel = _el('div', 'cb-combatant cb-enemy-panel');

        var enemyLabel = _el('div', 'cb-combatant-label', 'ENEMY');
        enemyPanel.appendChild(enemyLabel);

        var enemyName = _el('div', 'cb-combatant-name cb-enemy-name', '---');
        _els.enemyName = enemyName;
        enemyPanel.appendChild(enemyName);

        // Enemy HP bar
        var enemyHpBlock = _el('div', 'cb-bar-block');
        enemyHpBlock.innerHTML =
            '<span class="cb-bar-label">HP:</span> ' +
            '<span class="cb-bar cb-hp-bar cb-enemy-hp-bar">████████░░</span> ' +
            '<span class="cb-bar-numbers cb-enemy-hp-numbers">0/0</span>';
        _els.enemyHpBar = enemyHpBlock.querySelector('.cb-enemy-hp-bar');
        _els.enemyHpNumbers = enemyHpBlock.querySelector('.cb-enemy-hp-numbers');
        enemyPanel.appendChild(enemyHpBlock);

        // Enemy level/armor info
        var enemyInfo = _el('div', 'cb-enemy-info');
        enemyInfo.innerHTML =
            '<span class="cb-enemy-detail">LVL: <span class="cb-enemy-level">?</span></span> ' +
            '<span class="cb-enemy-detail">AC: <span class="cb-enemy-ac">?</span></span>';
        _els.enemyLevel = enemyInfo.querySelector('.cb-enemy-level');
        _els.enemyAC = enemyInfo.querySelector('.cb-enemy-ac');
        enemyPanel.appendChild(enemyInfo);

        // Enemy status effects
        var enemyEffects = _el('div', 'cb-status-effects cb-enemy-effects');
        _els.enemyEffects = enemyEffects;
        enemyPanel.appendChild(enemyEffects);

        area.appendChild(enemyPanel);

        return area;
    }

    // --------------------------------------------------------
    // Build: Combat log
    // --------------------------------------------------------
    function _buildCombatLog() {
        var logSection = _el('div', 'cb-log-section');

        var logHeader = _el('div', 'cb-log-header', 'Combat Log:');
        logSection.appendChild(logHeader);

        var logContainer = _el('div', 'cb-log-container');
        _els.logContainer = logContainer;
        logSection.appendChild(logContainer);

        return logSection;
    }

    // --------------------------------------------------------
    // Build: Dice animation area
    // --------------------------------------------------------
    function _buildDiceArea() {
        var diceArea = _el('div', 'cb-dice-area');
        _els.diceArea = diceArea;
        return diceArea;
    }

    // --------------------------------------------------------
    // Build: Action buttons
    // --------------------------------------------------------
    function _buildActionBar() {
        var actionBar = _el('div', 'cb-action-bar');

        // ATTACK button
        var atkBtn = _el('button', 'cb-action-btn cb-btn-attack', 'ATTACK');
        atkBtn.setAttribute('type', 'button');
        _bind(atkBtn, 'click', function () {
            _closeSubmenus();
            window.Latency.Combat.playerAttack();
        });
        _els.btnAttack = atkBtn;
        actionBar.appendChild(atkBtn);

        // DEFEND button
        var defBtn = _el('button', 'cb-action-btn cb-btn-defend', 'DEFEND');
        defBtn.setAttribute('type', 'button');
        _bind(defBtn, 'click', function () {
            _closeSubmenus();
            window.Latency.Combat.playerDefend();
        });
        _els.btnDefend = defBtn;
        actionBar.appendChild(defBtn);

        // ABILITY button (with submenu)
        var abilWrapper = _el('div', 'cb-action-wrapper');
        var abilBtn = _el('button', 'cb-action-btn cb-btn-ability', 'ABILITY');
        abilBtn.setAttribute('type', 'button');
        _bind(abilBtn, 'click', function () {
            _itemSubmenuOpen = false;
            if (_els.itemSubmenu) _els.itemSubmenu.style.display = 'none';
            _abilitySubmenuOpen = !_abilitySubmenuOpen;
            _toggleAbilitySubmenu();
        });
        _els.btnAbility = abilBtn;
        abilWrapper.appendChild(abilBtn);

        var abilSubmenu = _el('div', 'cb-submenu cb-ability-submenu');
        abilSubmenu.style.display = 'none';
        _els.abilitySubmenu = abilSubmenu;
        abilWrapper.appendChild(abilSubmenu);

        actionBar.appendChild(abilWrapper);

        // ITEM button (with submenu)
        var itemWrapper = _el('div', 'cb-action-wrapper');
        var itemBtn = _el('button', 'cb-action-btn cb-btn-item', 'ITEM');
        itemBtn.setAttribute('type', 'button');
        _bind(itemBtn, 'click', function () {
            _abilitySubmenuOpen = false;
            if (_els.abilitySubmenu) _els.abilitySubmenu.style.display = 'none';
            _itemSubmenuOpen = !_itemSubmenuOpen;
            _toggleItemSubmenu();
        });
        _els.btnItem = itemBtn;
        itemWrapper.appendChild(itemBtn);

        var itemSubmenu = _el('div', 'cb-submenu cb-item-submenu');
        itemSubmenu.style.display = 'none';
        _els.itemSubmenu = itemSubmenu;
        itemWrapper.appendChild(itemSubmenu);

        actionBar.appendChild(itemWrapper);

        // FLEE button
        var fleeBtn = _el('button', 'cb-action-btn cb-btn-flee', 'FLEE');
        fleeBtn.setAttribute('type', 'button');
        _bind(fleeBtn, 'click', function () {
            _closeSubmenus();
            window.Latency.Combat.playerFlee();
        });
        _els.btnFlee = fleeBtn;
        actionBar.appendChild(fleeBtn);

        return actionBar;
    }

    // --------------------------------------------------------
    // Submenus
    // --------------------------------------------------------
    function _closeSubmenus() {
        _abilitySubmenuOpen = false;
        _itemSubmenuOpen = false;
        if (_els.abilitySubmenu) _els.abilitySubmenu.style.display = 'none';
        if (_els.itemSubmenu) _els.itemSubmenu.style.display = 'none';
    }

    function _toggleAbilitySubmenu() {
        if (!_els.abilitySubmenu) return;

        // Clean listeners pointing to detached DOM nodes (old submenu items)
        _cleanDetachedListeners();

        if (!_abilitySubmenuOpen) {
            _els.abilitySubmenu.style.display = 'none';
            return;
        }

        _els.abilitySubmenu.innerHTML = '';
        _els.abilitySubmenu.style.display = 'block';

        var state = window.Latency.Combat.getState();
        if (!state || !state.player.abilities || state.player.abilities.length === 0) {
            var noAbil = _el('div', 'cb-submenu-item cb-submenu-empty', 'No abilities');
            _els.abilitySubmenu.appendChild(noAbil);
            return;
        }

        for (var i = 0; i < state.player.abilities.length; i++) {
            var abilId = state.player.abilities[i];
            var name = _formatAbilityName(abilId);
            var cooldown = state.playerCooldowns[abilId] || 0;

            var item = _el('button', 'cb-submenu-item', name);
            item.setAttribute('type', 'button');

            if (cooldown > 0) {
                item.textContent = name + ' (CD: ' + cooldown + ')';
                item.classList.add('cb-submenu-disabled');
                item.disabled = true;
            } else {
                (function (idx) {
                    _bind(item, 'click', function () {
                        _closeSubmenus();
                        window.Latency.Combat.playerUseAbility(idx);
                    });
                })(i);
            }

            _els.abilitySubmenu.appendChild(item);
        }
    }

    function _toggleItemSubmenu() {
        if (!_els.itemSubmenu) return;

        // Clean listeners pointing to detached DOM nodes (old submenu items)
        _cleanDetachedListeners();

        if (!_itemSubmenuOpen) {
            _els.itemSubmenu.style.display = 'none';
            return;
        }

        _els.itemSubmenu.innerHTML = '';
        _els.itemSubmenu.style.display = 'block';

        var char = window.Latency.CharacterSystem
            ? window.Latency.CharacterSystem.getCharacter()
            : null;

        if (!char || !char.inventory || !char.inventory.backpack || char.inventory.backpack.length === 0) {
            var noItems = _el('div', 'cb-submenu-item cb-submenu-empty', 'No items');
            _els.itemSubmenu.appendChild(noItems);
            return;
        }

        var Items = window.Latency.Items || {};
        var backpack = char.inventory.backpack;

        // Build count map for consumables
        var consumables = {};
        for (var i = 0; i < backpack.length; i++) {
            var bpItem = backpack[i];
            var id = (typeof bpItem === 'string') ? bpItem : (bpItem.itemId || bpItem);
            var itemData = Items[id];
            if (!itemData || itemData.type !== 'consumable') continue;
            if (!consumables[id]) {
                consumables[id] = { id: id, name: itemData.name, count: 0 };
            }
            consumables[id].count++;
        }

        var consumableIds = Object.keys(consumables);
        if (consumableIds.length === 0) {
            var noConsumables = _el('div', 'cb-submenu-item cb-submenu-empty', 'No usable items');
            _els.itemSubmenu.appendChild(noConsumables);
            return;
        }

        for (var c = 0; c < consumableIds.length; c++) {
            var cItem = consumables[consumableIds[c]];
            var itemBtn = _el('button', 'cb-submenu-item');
            itemBtn.setAttribute('type', 'button');
            itemBtn.textContent = cItem.name + ' x' + cItem.count;

            (function (itemId) {
                _bind(itemBtn, 'click', function () {
                    _closeSubmenus();
                    window.Latency.Combat.playerUseItem(itemId);
                });
            })(cItem.id);

            _els.itemSubmenu.appendChild(itemBtn);
        }
    }

    function _formatAbilityName(id) {
        return id.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    // --------------------------------------------------------
    // Visual Feedback: Screen Shake
    // --------------------------------------------------------
    function _triggerShake() {
        var screen = _container ? _container.querySelector('.combat-screen') : null;
        if (!screen) return;
        screen.classList.remove('cb-shake');
        // Force reflow so re-adding the class restarts the animation
        void screen.offsetWidth;
        screen.classList.add('cb-shake');
        _pendingTimers.push(setTimeout(function () {
            screen.classList.remove('cb-shake');
        }, 350));
    }

    // --------------------------------------------------------
    // Visual Feedback: Floating Damage Numbers
    // --------------------------------------------------------
    /**
     * Show a floating damage number above a target panel.
     * @param {'player'|'enemy'} target - which panel to attach to
     * @param {number} amount - damage or heal value
     * @param {boolean} isCrit - whether this was a critical hit
     * @param {'damage'|'heal'} [kind='damage'] - type of number
     */
    function _showDamageNumber(target, amount, isCrit, kind) {
        var panel = null;
        var colorClass = '';

        if (target === 'enemy') {
            panel = _container ? _container.querySelector('.cb-enemy-panel') : null;
            colorClass = isCrit ? 'cb-dmg-crit' : 'cb-dmg-dealt';
        } else {
            panel = _container ? _container.querySelector('.cb-player-panel') : null;
            colorClass = (kind === 'heal') ? 'cb-dmg-heal' : 'cb-dmg-taken';
        }
        if (isCrit && target === 'enemy') colorClass = 'cb-dmg-crit';

        if (!panel) return;

        // Ensure the panel has relative positioning for absolute child
        if (getComputedStyle(panel).position === 'static') {
            panel.style.position = 'relative';
        }

        var numEl = _el('div', 'cb-dmg-number ' + colorClass);
        var prefix = (kind === 'heal') ? '+' : '-';
        numEl.textContent = prefix + amount;
        if (isCrit) numEl.textContent += ' CRIT!';

        // Position randomly within the panel's upper area
        numEl.style.top = (10 + Math.random() * 20) + 'px';
        numEl.style.left = (20 + Math.random() * 40) + '%';

        panel.appendChild(numEl);

        // Remove after animation completes
        _pendingTimers.push(setTimeout(function () {
            if (numEl.parentNode) numEl.parentNode.removeChild(numEl);
        }, 850));
    }

    // --------------------------------------------------------
    // Visual Feedback: HP Bar Flash on Big Hits
    // --------------------------------------------------------
    function _flashHpBar(target) {
        var bar = (target === 'player') ? _els.playerHpBar : _els.enemyHpBar;
        if (!bar) return;
        bar.classList.remove('cb-bar-flash');
        void bar.offsetWidth;
        bar.classList.add('cb-bar-flash');
        _pendingTimers.push(setTimeout(function () {
            bar.classList.remove('cb-bar-flash');
        }, 550));
    }

    // --------------------------------------------------------
    // Visual Feedback: Turn Indicator Banner
    // --------------------------------------------------------
    function _showTurnBanner(phase) {
        var screen = _container ? _container.querySelector('.combat-screen') : null;
        if (!screen) return;

        // Remove any existing banner
        var existing = screen.querySelector('.cb-turn-banner');
        if (existing) existing.parentNode.removeChild(existing);

        var isPlayer = (phase === 'player');
        var banner = _el('div', 'cb-turn-banner ' +
            (isPlayer ? 'cb-turn-banner-player' : 'cb-turn-banner-enemy'));
        banner.textContent = isPlayer ? '>>> YOUR TURN <<<' : '>>> ENEMY TURN <<<';

        screen.appendChild(banner);

        // Auto-remove after animation
        _pendingTimers.push(setTimeout(function () {
            if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 1300));
    }

    // --------------------------------------------------------
    // Visual Feedback: combat:action handler
    // --------------------------------------------------------
    function _onCombatAction(data) {
        if (!data) return;

        var result = data.result;
        var actor = data.actor;
        var damage = data.damage || 0;

        // Screen shake on crits
        if (result === 'crit') {
            _triggerShake();
        }

        // Floating damage numbers
        if ((result === 'hit' || result === 'crit') && damage > 0) {
            if (actor === 'player') {
                // Player dealt damage to enemy
                _showDamageNumber('enemy', damage, result === 'crit');
                _flashHpBar('enemy');
            } else if (actor === 'enemy') {
                // Enemy dealt damage to player
                _showDamageNumber('player', damage, result === 'crit');
                _flashHpBar('player');
                if (result === 'crit') _triggerShake();
            }
        }
    }

    // --------------------------------------------------------
    // Build: Victory overlay
    // --------------------------------------------------------
    function _buildVictoryOverlay(data) {
        var overlay = _el('div', 'cb-overlay cb-victory-overlay');

        var title = _el('div', 'cb-overlay-title cb-victory-title', 'VICTORY');
        overlay.appendChild(title);

        var details = _el('div', 'cb-overlay-details');

        // XP counter that ticks up
        if (data.xp > 0) {
            var xpLine = _el('div', 'cb-overlay-line cb-xp-line cb-xp-tick', 'XP Gained: +0');
            details.appendChild(xpLine);
            // Animate the XP counter ticking up
            _pendingTimers.push(setTimeout(function () {
                _animateCounter(xpLine, 'XP Gained: +', 0, data.xp, 600);
            }, 300));
        }

        if (data.credits > 0) {
            var creditsLine = _el('div', 'cb-overlay-line cb-credits-line cb-xp-tick', 'Credits: +0');
            details.appendChild(creditsLine);
            _pendingTimers.push(setTimeout(function () {
                _animateCounter(creditsLine, 'Credits: +', 0, data.credits, 400);
            }, 600));
        }

        // Loot items appearing one by one
        if (data.loot && data.loot.length > 0) {
            var lootHeader = _el('div', 'cb-overlay-line', 'Loot Found:');
            lootHeader.style.opacity = '0';
            details.appendChild(lootHeader);

            var Items = window.Latency.Items || {};
            var lootItems = [];
            for (var i = 0; i < data.loot.length; i++) {
                var itemData = Items[data.loot[i]];
                var itemName = itemData ? itemData.name : data.loot[i];
                var lootLine = _el('div', 'cb-overlay-loot-item cb-loot-reveal', '  > ' + itemName);
                lootLine.style.opacity = '0';
                lootLine.style.animationPlayState = 'paused';
                details.appendChild(lootLine);
                lootItems.push(lootLine);
            }

            // Stagger loot reveals
            var lootBaseDelay = data.xp > 0 ? 900 : 300;
            _pendingTimers.push(setTimeout(function () {
                lootHeader.style.opacity = '1';
            }, lootBaseDelay));

            for (var li = 0; li < lootItems.length; li++) {
                (function (idx) {
                    _pendingTimers.push(setTimeout(function () {
                        lootItems[idx].style.opacity = '1';
                        lootItems[idx].style.animationPlayState = 'running';
                    }, lootBaseDelay + 200 + (idx * 200)));
                })(li);
            }
        }

        overlay.appendChild(details);

        var continueBtn = _el('button', 'cb-action-btn cb-btn-continue', 'CONTINUE');
        continueBtn.setAttribute('type', 'button');
        _bind(continueBtn, 'click', function () {
            window.Latency.Combat.endCombat();
            _returnToGameplay();
        });
        overlay.appendChild(continueBtn);

        return overlay;
    }

    /**
     * Animate a numeric counter from start to end inside an element.
     */
    function _animateCounter(el, prefix, start, end, durationMs) {
        var startTime = null;
        var diff = end - start;

        function step(ts) {
            if (!startTime) startTime = ts;
            var elapsed = ts - startTime;
            var progress = Math.min(elapsed / durationMs, 1);
            // Ease-out quad
            var eased = 1 - (1 - progress) * (1 - progress);
            var current = Math.round(start + diff * eased);
            el.textContent = prefix + current;
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }

    // --------------------------------------------------------
    // Build: Defeat overlay
    // --------------------------------------------------------
    function _buildDefeatOverlay() {
        var overlay = _el('div', 'cb-overlay cb-defeat-overlay');

        // CRT static noise layer
        var staticLayer = _el('div', 'cb-defeat-static');
        overlay.appendChild(staticLayer);

        // SIGNAL LOST text
        var signalLost = _el('div', 'cb-signal-lost', 'SIGNAL LOST');
        overlay.appendChild(signalLost);

        var title = _el('div', 'cb-overlay-title cb-defeat-title', 'GAME OVER');
        overlay.appendChild(title);

        var subtitle = _el('div', 'cb-overlay-subtitle', 'You have been defeated.');
        overlay.appendChild(subtitle);

        var btnRow = _el('div', 'cb-overlay-buttons');

        var loadBtn = _el('button', 'cb-action-btn cb-btn-load', 'LOAD SAVE');
        loadBtn.setAttribute('type', 'button');
        _bind(loadBtn, 'click', function () {
            window.Latency.Combat.endCombat();
            if (window.Latency.StateMachine && window.Latency.StateMachine._forceState) {
                window.Latency.StateMachine._forceState('saveload');
            } else if (window.Latency.ScreenManager && window.Latency.ScreenManager.show) {
                window.Latency.ScreenManager.show('saveload');
            }
        });
        btnRow.appendChild(loadBtn);

        var menuBtn = _el('button', 'cb-action-btn cb-btn-menu', 'MAIN MENU');
        menuBtn.setAttribute('type', 'button');
        _bind(menuBtn, 'click', function () {
            window.Latency.Combat.endCombat();
            if (window.Latency.StateMachine && window.Latency.StateMachine._forceState) {
                window.Latency.StateMachine._forceState('menu');
            } else if (window.Latency.ScreenManager && window.Latency.ScreenManager.show) {
                window.Latency.ScreenManager.show('menu');
            }
        });
        btnRow.appendChild(menuBtn);

        overlay.appendChild(btnRow);

        return overlay;
    }

    // --------------------------------------------------------
    // Return to gameplay
    // --------------------------------------------------------
    function _returnToGameplay() {
        if (window.Latency.StateMachine && window.Latency.StateMachine.transition) {
            window.Latency.StateMachine.transition('gameplay');
        } else if (window.Latency.ScreenManager && window.Latency.ScreenManager.show) {
            window.Latency.ScreenManager.show('gameplay');
        }
    }

    // --------------------------------------------------------
    // Refresh: HP bars and status
    // --------------------------------------------------------
    function _refreshCombatants() {
        var state = window.Latency.Combat.getState();
        if (!state) return;

        var BAR_WIDTH = 10;

        // Player name
        if (_els.playerName) {
            _els.playerName.textContent = state.player.name || 'Player';
        }

        // Player HP
        var playerHp = state.player.derived.currentHp;
        var playerMaxHp = state.player.derived.maxHp;
        if (_els.playerHpBar) {
            _els.playerHpBar.textContent = _buildBar(playerHp, playerMaxHp, BAR_WIDTH);
            _els.playerHpBar.className = 'cb-bar cb-hp-bar cb-player-hp-bar ' +
                _getHpColorClass(playerHp, playerMaxHp);
        }
        if (_els.playerHpNumbers) {
            _els.playerHpNumbers.textContent = playerHp + '/' + playerMaxHp;
        }

        // Player STA
        var playerSta = state.player.derived.currentStamina;
        var playerMaxSta = state.player.derived.maxStamina;
        if (_els.playerStaBar) {
            _els.playerStaBar.textContent = _buildBar(playerSta, playerMaxSta, BAR_WIDTH);
        }
        if (_els.playerStaNumbers) {
            _els.playerStaNumbers.textContent = playerSta + '/' + playerMaxSta;
        }

        // Enemy name
        if (_els.enemyName) {
            _els.enemyName.textContent = state.enemy.name || 'Enemy';
        }

        // Enemy HP
        var enemyHp = state.enemy.hp;
        var enemyMaxHp = state.enemy.maxHp;
        if (_els.enemyHpBar) {
            _els.enemyHpBar.textContent = _buildBar(enemyHp, enemyMaxHp, BAR_WIDTH);
            _els.enemyHpBar.className = 'cb-bar cb-hp-bar cb-enemy-hp-bar ' +
                _getHpColorClass(enemyHp, enemyMaxHp);
        }
        if (_els.enemyHpNumbers) {
            _els.enemyHpNumbers.textContent = enemyHp + '/' + enemyMaxHp;
        }

        // Enemy level / AC
        if (_els.enemyLevel) {
            _els.enemyLevel.textContent = String(state.enemy.level);
        }
        if (_els.enemyAC) {
            _els.enemyAC.textContent = String(state.enemy.armor);
        }

        // Turn info
        if (_els.turnInfo) {
            _els.turnInfo.textContent = 'Turn ' + state.turn + ' - ' +
                (state.phase === 'player' ? 'YOUR TURN' :
                 state.phase === 'enemy' ? 'ENEMY TURN' :
                 state.phase === 'resolving' ? 'RESOLVING...' :
                 state.phase.toUpperCase());
        }

        // Status effects
        _refreshStatusEffects();

        // Action button states
        _refreshActionButtons();
    }

    function _refreshStatusEffects() {
        var state = window.Latency.Combat.getState();
        if (!state) return;

        // Player effects
        if (_els.playerEffects) {
            _els.playerEffects.innerHTML = '';
            var pEffects = state.statusEffects.player;
            for (var i = 0; i < pEffects.length; i++) {
                var eff = pEffects[i];
                if (eff.type === 'special') continue; // hide internal markers
                var tag = _el('span', 'cb-effect-tag cb-effect-' + eff.type);
                tag.textContent = eff.name + ' (' + eff.turnsLeft + ')';
                tag.setAttribute('title', eff.name + ' - ' + eff.turnsLeft + ' turns remaining');
                _els.playerEffects.appendChild(tag);
            }
            if (state.playerStunned) {
                var stunTag = _el('span', 'cb-effect-tag cb-effect-debuff', 'STUNNED');
                _els.playerEffects.appendChild(stunTag);
            }
            if (state.playerDefending) {
                var defTag = _el('span', 'cb-effect-tag cb-effect-buff', 'DEFENDING (+4 AC)');
                _els.playerEffects.appendChild(defTag);
            }
        }

        // Enemy effects
        if (_els.enemyEffects) {
            _els.enemyEffects.innerHTML = '';
            var eEffects = state.statusEffects.enemy;
            for (var j = 0; j < eEffects.length; j++) {
                var eEff = eEffects[j];
                var eTag = _el('span', 'cb-effect-tag cb-effect-' + eEff.type);
                eTag.textContent = eEff.name + ' (' + eEff.turnsLeft + ')';
                _els.enemyEffects.appendChild(eTag);
            }
            if (state.enemyStunned) {
                var eStunTag = _el('span', 'cb-effect-tag cb-effect-debuff', 'STUNNED');
                _els.enemyEffects.appendChild(eStunTag);
            }
        }
    }

    function _refreshActionButtons() {
        var state = window.Latency.Combat.getState();
        if (!state) return;

        var isPlayerTurn = state.phase === 'player';
        var buttons = [_els.btnAttack, _els.btnDefend, _els.btnAbility, _els.btnItem, _els.btnFlee];

        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i]) {
                buttons[i].disabled = !isPlayerTurn;
                if (isPlayerTurn) {
                    buttons[i].classList.remove('cb-btn-disabled');
                } else {
                    buttons[i].classList.add('cb-btn-disabled');
                }
            }
        }

        // Close submenus when not player turn
        if (!isPlayerTurn) {
            _closeSubmenus();
        }
    }

    // --------------------------------------------------------
    // Combat log rendering
    // --------------------------------------------------------
    function _appendLogEntry(data) {
        if (!_els.logContainer) return;

        var entry = _el('div', 'cb-log-entry ' + _getLogEntryClass(data.type));
        entry.textContent = '> ' + data.text;

        _els.logContainer.appendChild(entry);

        // Auto-scroll to bottom
        _els.logContainer.scrollTop = _els.logContainer.scrollHeight;
    }

    // --------------------------------------------------------
    // Dice animation
    // --------------------------------------------------------
    function _onDiceRoll(data) {
        if (!_els.diceArea || !window.Latency.DiceAnimator) return;

        var sides = data.sides || 20;
        var result = data.result || 1;
        var opts = {
            success: data.success || false,
            fail: !data.success,
            crit: data.crit || false
        };

        // Clear previous dice after a delay
        var area = _els.diceArea;
        area.innerHTML = '';

        window.Latency.DiceAnimator.animate(sides, result, area, opts);
    }

    // --------------------------------------------------------
    // Event Handlers
    // --------------------------------------------------------
    function _onCombatStart() {
        _refreshCombatants();
    }

    function _onStateChange() {
        _refreshCombatants();
    }

    function _onCombatLog(data) {
        _appendLogEntry(data);
    }

    function _onCombatTurn(data) {
        _refreshCombatants();
        // Show turn indicator banner
        if (data && data.phase) {
            _showTurnBanner(data.phase);
        }
    }

    function _onCombatEnd(data) {
        if (!_container) return;

        _refreshCombatants();

        if (data.result === 'victory') {
            var victoryOverlay = _buildVictoryOverlay(data);
            _container.querySelector('.combat-screen').appendChild(victoryOverlay);
            // Trigger animation
            _pendingTimers.push(setTimeout(function () {
                victoryOverlay.classList.add('cb-overlay-visible');
            }, 50));
        } else if (data.result === 'defeat') {
            var defeatOverlay = _buildDefeatOverlay();
            _container.querySelector('.combat-screen').appendChild(defeatOverlay);
            _pendingTimers.push(setTimeout(function () {
                defeatOverlay.classList.add('cb-overlay-visible');
            }, 50));
        } else if (data.result === 'fled') {
            // Return to gameplay after a brief delay
            _pendingTimers.push(setTimeout(function () {
                _returnToGameplay();
            }, 800));
        }
    }

    // --------------------------------------------------------
    // Public API: mount / unmount
    // --------------------------------------------------------
    return {
        /**
         * Mount the combat screen into the given container.
         * @param {HTMLElement} container
         * @param {Object} [params]
         */
        mount: function (container, params) {
            _container = container;
            _listeners = [];
            _unsubs = [];
            _els = {};
            _abilitySubmenuOpen = false;
            _itemSubmenuOpen = false;

            // Build screen
            var screen = _el('div', 'combat-screen');

            // Header
            screen.appendChild(_buildHeader());

            // Combatant panels
            screen.appendChild(_buildCombatantsArea());

            // Dice animation area
            screen.appendChild(_buildDiceArea());

            // Combat log
            screen.appendChild(_buildCombatLog());

            // Action bar
            screen.appendChild(_buildActionBar());

            _container.appendChild(screen);

            // Subscribe to events
            _subscribe('combat:start', _onCombatStart);
            _subscribe('combat:stateChange', _onStateChange);
            _subscribe('combat:log', _onCombatLog);
            _subscribe('combat:turn', _onCombatTurn);
            _subscribe('combat:end', _onCombatEnd);
            _subscribe('combat:action', _onCombatAction);
            _subscribe('dice:roll', _onDiceRoll);

            // If combat is already in progress, populate immediately
            if (window.Latency.Combat && window.Latency.Combat.isInCombat()) {
                var state = window.Latency.Combat.getState();
                _refreshCombatants();
                // Replay existing log
                if (state && state.log) {
                    for (var i = 0; i < state.log.length; i++) {
                        _appendLogEntry(state.log[i]);
                    }
                }
            }

            console.log('[CombatScreen] Mounted.');
        },

        /**
         * Unmount the combat screen.
         */
        unmount: function () {
            // Clear pending timers
            for (var t = 0; t < _pendingTimers.length; t++) {
                clearTimeout(_pendingTimers[t]);
            }
            _pendingTimers = [];

            // Remove DOM event listeners
            for (var i = 0; i < _listeners.length; i++) {
                var entry = _listeners[i];
                entry.element.removeEventListener(entry.event, entry.handler);
            }
            _listeners = [];

            // Unsubscribe from EventBus
            for (var j = 0; j < _unsubs.length; j++) {
                _unsubs[j]();
            }
            _unsubs = [];

            // Clear DOM references
            _els = {};

            // Clear container
            if (_container) {
                _container.innerHTML = '';
            }
            _container = null;

            console.log('[CombatScreen] Unmounted.');
        }
    };
})();
