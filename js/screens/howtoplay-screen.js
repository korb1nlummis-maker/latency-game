/**
 * LATENCY - How To Play Screen
 * ============================================================
 * Terminal-styled manual with tabbed sections covering world
 * lore, character mechanics, gameplay systems, progression,
 * and tips. Accessible from the main menu.
 *
 * Transitions:
 *   BACK -> '_back' (returns to menu via StateMachine.back())
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.HowToPlayScreen = (function () {
    'use strict';

    // --------------------------------------------------------
    // Private state
    // --------------------------------------------------------
    var _container = null;
    var _listeners = [];
    var _activeTab = 'combat';

    // --------------------------------------------------------
    // ASCII decorations
    // --------------------------------------------------------
    var HEADER_ART = [
        '  ╔══════════════════════════════════════════════════╗',
        '  ║  ░▒▓  L A T E N C Y   M A N U A L  ▓▒░        ║',
        '  ║  ────────────────────────────────────────        ║',
        '  ║  SYSTEM REFERENCE v0.3.0 // CLASSIFIED          ║',
        '  ╚══════════════════════════════════════════════════╝'
    ].join('\n');

    var SECTION_BORDER_TOP    = '┌──────────────────────────────────────────────────┐';
    var SECTION_BORDER_BOTTOM = '└──────────────────────────────────────────────────┘';

    // --------------------------------------------------------
    // Tab definitions
    // --------------------------------------------------------
    var TABS = [
        { id: 'combat',    label: '1. COMBAT' },
        { id: 'stats',     label: '2. STATS & CHECKS' },
        { id: 'inventory', label: '3. INVENTORY' },
        { id: 'factions',  label: '4. FACTIONS' },
        { id: 'tips',      label: '5. TIPS' }
    ];

    // --------------------------------------------------------
    // Section content builders
    // --------------------------------------------------------

    function _buildCombatSection() {
        return '' +
            SECTION_BORDER_TOP + '\n' +
            '│  SECTION 01: COMBAT                                │\n' +
            SECTION_BORDER_BOTTOM + '\n\n' +
            '  > TURN-BASED D20 COMBAT\n' +
            '  ────────────────────────\n' +
            '  Combat uses d20 dice rolls. Each round, you and\n' +
            '  your enemy take turns choosing actions.\n\n' +
            '  > ATTACK\n' +
            '  ────────\n' +
            '  Roll d20 + your stat modifier vs enemy Armor Class.\n\n' +
            '    If Roll >= enemy AC ... HIT!\n' +
            '      -> Roll weapon damage dice (e.g. 1d8+1)\n' +
            '    If Roll <  enemy AC ... MISS\n\n' +
            '  STR modifier is used for melee weapons.\n' +
            '  DEX modifier is used for ranged weapons.\n\n' +
            '  > CRITICAL HITS & MISSES\n' +
            '  ─────────────────────────\n' +
            '    NAT 20 = CRITICAL HIT  — Always hits, double damage\n' +
            '    NAT 1  = CRITICAL MISS — Always misses\n\n' +
            '  > ENEMY ATTACKS\n' +
            '  ───────────────\n' +
            '  Enemies use the same rules against YOUR Armor Class.\n' +
            '  Equip better armor to raise your AC and avoid hits.\n\n' +
            '  > OTHER ACTIONS\n' +
            '  ───────────────\n' +
            '    [DEFEND]   — Reduce incoming damage, regain stamina\n' +
            '    [USE ITEM] — Use healing items or consumables from\n' +
            '                 your inventory mid-combat\n' +
            '    [FLEE]     — Attempt to escape (may fail based on\n' +
            '                 DEX check vs enemy)\n\n' +
            '  > DEATH\n' +
            '  ───────\n' +
            '  When HP reaches 0, you die. Some racial traits can\n' +
            '  save you from a killing blow once. Save often.\n';
    }

    function _buildStatsSection() {
        return '' +
            SECTION_BORDER_TOP + '\n' +
            '│  SECTION 02: STATS & CHECKS                        │\n' +
            SECTION_BORDER_BOTTOM + '\n\n' +
            '  > CHARACTER STATS\n' +
            '  ─────────────────\n' +
            '  Eight attributes define your character:\n\n' +
            '  STR  Strength     — Melee damage, physical checks\n' +
            '  DEX  Dexterity    — Ranged attacks, dodge, agility\n' +
            '  CON  Constitution — Max HP, stamina, endurance\n' +
            '  INT  Intelligence — Hacking, tech, knowledge checks\n' +
            '  WIS  Wisdom       — Perception, insight, awareness\n' +
            '  CHA  Charisma     — Persuasion, intimidation, social\n' +
            '  TECH Tech Affinity— Augmentation use, device control\n' +
            '  LCK  Luck         — Crit chance, random event outcomes\n\n' +
            '  > STAT MODIFIERS\n' +
            '  ────────────────\n' +
            '  Your modifier is calculated as:\n\n' +
            '      modifier = floor( (stat - 10) / 2 )\n\n' +
            '    STAT 8  -> -1    STAT 14 -> +2\n' +
            '    STAT 10 ->  0    STAT 18 -> +4\n' +
            '    STAT 12 -> +1    STAT 20 -> +5\n\n' +
            '  Your race and backstory give stat bonuses that\n' +
            '  affect all rolls throughout the game.\n\n' +
            '  > STAT CHECKS\n' +
            '  ─────────────\n' +
            '  Story choices may require stat checks.\n\n' +
            '    Roll = d20 + stat modifier\n\n' +
            '    If Roll >= DC (Difficulty Class) ... SUCCESS\n' +
            '    If Roll <  DC                   ... FAILURE\n\n' +
            '  Success opens better paths. Failure has consequences.\n\n' +
            '  Special rolls:\n' +
            '    NAT 20 = Always succeeds, regardless of DC\n' +
            '    NAT 1  = Always fails, regardless of modifier\n';
    }

    function _buildInventorySection() {
        return '' +
            SECTION_BORDER_TOP + '\n' +
            '│  SECTION 03: INVENTORY & ITEMS                     │\n' +
            SECTION_BORDER_BOTTOM + '\n\n' +
            '  > FINDING ITEMS\n' +
            '  ───────────────\n' +
            '  Find items through exploration, combat loot, and\n' +
            '  story choices. Search every corner — rare gear\n' +
            '  hides in unexpected places.\n\n' +
            '  > EQUIPMENT\n' +
            '  ───────────\n' +
            '  Equip weapons and armor to improve combat stats.\n\n' +
            '    WEAPONS — Determine your damage dice and which\n' +
            '              stat modifier applies to attack rolls\n' +
            '    ARMOR   — Raises your Armor Class (AC), making\n' +
            '              you harder to hit in combat\n\n' +
            '  > CONSUMABLES\n' +
            '  ─────────────\n' +
            '  Use items to heal and survive:\n\n' +
            '    Med Patches — Restore HP during or outside combat\n' +
            '    Stim Packs  — Boost stats temporarily\n' +
            '    Other items — Various effects found in-game\n\n' +
            '  > BACKPACK\n' +
            '  ──────────\n' +
            '  Limited to 20 inventory slots. Manage your space\n' +
            '  carefully — drop or sell what you don\'t need.\n\n' +
            '  > CREDITS\n' +
            '  ─────────\n' +
            '  Credits are the city\'s currency. Earn them through\n' +
            '  jobs, loot, and story choices. Spend at vendors\n' +
            '  for gear, items, and services.\n';
    }

    function _buildFactionsSection() {
        return '' +
            SECTION_BORDER_TOP + '\n' +
            '│  SECTION 04: FACTIONS                              │\n' +
            SECTION_BORDER_BOTTOM + '\n\n' +
            '  > FIVE FACTIONS\n' +
            '  ───────────────\n' +
            '  Five factions vie for control of the megacity:\n\n' +
            '  ■ THE IRON COLLECTIVE\n' +
            '    Militant workers fighting stack inequality.\n\n' +
            '  ■ THE NEON COURT\n' +
            '    Decadent aristocrats ruling through glamour\n' +
            '    and manipulation.\n\n' +
            '  ■ THE CIRCUIT SAINTS\n' +
            '    A techno-religious order seeking digital\n' +
            '    transcendence.\n\n' +
            '  ■ THE GHOST SYNDICATE\n' +
            '    A criminal empire of thieves, smugglers,\n' +
            '    and assassins.\n\n' +
            '  ■ THE ASHEN CIRCLE\n' +
            '    Nihilist philosophers who embrace the void.\n\n' +
            '  > REPUTATION SYSTEM\n' +
            '  ────────────────────\n' +
            '  Each faction tracks your standing from -100 to +100:\n\n' +
            '    -100 to -51  HOSTILE     — Hunted on sight\n' +
            '     -50 to -11  UNFRIENDLY  — Denied services\n' +
            '     -10 to  10  NEUTRAL     — Unknown outsider\n' +
            '      11 to  50  FRIENDLY    — Trusted ally\n' +
            '      51 to 100  ALLIED      — Inner circle\n\n' +
            '  Your actions and choices shift reputation.\n' +
            '  High rep unlocks faction quests and allies.\n' +
            '  Low rep makes factions hostile toward you.\n' +
            '  Some endings require specific faction standings.\n';
    }

    function _buildTipsSection() {
        return '' +
            SECTION_BORDER_TOP + '\n' +
            '│  SECTION 05: TIPS                                  │\n' +
            SECTION_BORDER_BOTTOM + '\n\n' +
            '  > SURVIVAL ADVICE FROM THE UNDERCITY\n' +
            '  ─────────────────────────────────────\n\n' +
            '  [!] SAVE OFTEN\n' +
            '      Choices matter and many are permanent. There is\n' +
            '      no undo. The city moves forward whether you are\n' +
            '      ready or not.\n\n' +
            '  [!] EXPLORE EVERYTHING\n' +
            '      Every location hides content — hidden rooms,\n' +
            '      secret NPCs, buried lore, and rare items. If\n' +
            '      a corridor looks like a dead end, check again.\n\n' +
            '  [!] YOUR RACE MATTERS\n' +
            '      Your species affects dialogue options, story\n' +
            '      branches, NPC reactions, and available endings.\n' +
            '      Some paths only open for specific races.\n\n' +
            '  [!] CHOICES MATTER\n' +
            '      Every decision has consequences. Multiple\n' +
            '      endings exist based on your choices, faction\n' +
            '      standings, and actions throughout the game.\n\n' +
            '  [!] NO SINGLE RIGHT PATH\n' +
            '      Some paths are locked behind stat requirements.\n' +
            '      Your character, your story. Experiment with\n' +
            '      different builds and see what opens up.\n\n' +
            '  ════════════════════════════════════════════════\n' +
            '  END OF MANUAL // ACCESS LEVEL: PUBLIC\n' +
            '  ════════════════════════════════════════════════\n';
    }

    // --------------------------------------------------------
    // Section content map
    // --------------------------------------------------------
    var SECTION_BUILDERS = {
        combat:    _buildCombatSection,
        stats:     _buildStatsSection,
        inventory: _buildInventorySection,
        factions:  _buildFactionsSection,
        tips:      _buildTipsSection
    };

    // --------------------------------------------------------
    // Helper: create a DOM element
    // --------------------------------------------------------
    function _el(tag, className, textContent) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (textContent !== undefined) el.textContent = textContent;
        return el;
    }

    // --------------------------------------------------------
    // Helper: bind event and track for cleanup
    // --------------------------------------------------------
    function _bind(element, event, handler) {
        element.addEventListener(event, handler);
        _listeners.push({ element: element, event: event, handler: handler });
    }

    // --------------------------------------------------------
    // Switch active tab
    // --------------------------------------------------------
    function _switchTab(tabId) {
        _activeTab = tabId;

        // Update tab buttons
        var tabBtns = _container.querySelectorAll('.htp-tab-btn');
        for (var i = 0; i < tabBtns.length; i++) {
            var btn = tabBtns[i];
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('htp-tab-btn--active');
            } else {
                btn.classList.remove('htp-tab-btn--active');
            }
        }

        // Update content
        var contentEl = _container.querySelector('.htp-content-body');
        if (contentEl && SECTION_BUILDERS[tabId]) {
            contentEl.textContent = SECTION_BUILDERS[tabId]();
        }
    }

    // --------------------------------------------------------
    // Build the full screen DOM
    // --------------------------------------------------------
    function _buildScreen() {
        var frag = document.createDocumentFragment();
        var screen = _el('div', 'htp-screen');

        // --- Header ASCII ---
        var header = _el('pre', 'htp-header');
        header.textContent = HEADER_ART;
        screen.appendChild(header);

        // --- Tab bar ---
        var tabBar = _el('div', 'htp-tab-bar');
        tabBar.setAttribute('role', 'tablist');
        tabBar.setAttribute('aria-label', 'Manual sections');

        for (var i = 0; i < TABS.length; i++) {
            var tab = TABS[i];
            var tabBtn = _el('button', 'htp-tab-btn', tab.label);
            tabBtn.setAttribute('type', 'button');
            tabBtn.setAttribute('role', 'tab');
            tabBtn.setAttribute('data-tab', tab.id);
            tabBtn.setAttribute('aria-selected', tab.id === _activeTab ? 'true' : 'false');

            if (tab.id === _activeTab) {
                tabBtn.classList.add('htp-tab-btn--active');
            }

            (function (id) {
                _bind(tabBtn, 'click', function () {
                    _switchTab(id);
                });
            })(tab.id);

            tabBar.appendChild(tabBtn);
        }

        screen.appendChild(tabBar);

        // --- Content area ---
        var contentWrap = _el('div', 'htp-content');
        var contentBody = _el('pre', 'htp-content-body');
        contentBody.setAttribute('role', 'tabpanel');
        contentBody.textContent = SECTION_BUILDERS[_activeTab]();
        contentWrap.appendChild(contentBody);
        screen.appendChild(contentWrap);

        // --- Back button ---
        var backBar = _el('div', 'htp-back-bar');
        var backBtn = _el('button', 'htp-back-btn', '[ BACK ]');
        backBtn.setAttribute('type', 'button');

        _bind(backBtn, 'click', function () {
            if (window.Latency.StateMachine && window.Latency.StateMachine.back) {
                window.Latency.StateMachine.back();
            }
        });

        backBar.appendChild(backBtn);
        screen.appendChild(backBar);

        frag.appendChild(screen);
        return frag;
    }

    // --------------------------------------------------------
    // Public API
    // --------------------------------------------------------
    return {
        /**
         * Mount the How To Play screen into the given container.
         * @param {HTMLElement} container
         * @param {Object} [params]
         */
        mount: function (container, params) {
            _container = container;
            _listeners = [];
            _activeTab = 'combat';

            var dom = _buildScreen();
            _container.appendChild(dom);

            // Focus first tab for keyboard accessibility
            var firstTab = _container.querySelector('.htp-tab-btn');
            if (firstTab) {
                firstTab.focus();
            }

            console.log('[HowToPlayScreen] Mounted.');
        },

        /**
         * Unmount the screen, cleaning up listeners and DOM.
         */
        unmount: function () {
            for (var i = 0; i < _listeners.length; i++) {
                var entry = _listeners[i];
                entry.element.removeEventListener(entry.event, entry.handler);
            }
            _listeners = [];

            if (_container) {
                _container.innerHTML = '';
            }
            _container = null;

            console.log('[HowToPlayScreen] Unmounted.');
        }
    };
})();
