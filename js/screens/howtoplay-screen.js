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
    var _activeTab = 'world';

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
        { id: 'world',       label: '1. THE WORLD' },
        { id: 'character',   label: '2. YOUR CHARACTER' },
        { id: 'gameplay',    label: '3. GAMEPLAY' },
        { id: 'progression', label: '4. PROGRESSION' },
        { id: 'tips',        label: '5. TIPS' }
    ];

    // --------------------------------------------------------
    // Section content builders
    // --------------------------------------------------------

    function _buildWorldSection() {
        return '' +
            SECTION_BORDER_TOP + '\n' +
            '│  SECTION 01: THE WORLD                            │\n' +
            SECTION_BORDER_BOTTOM + '\n\n' +
            '  > THE MEGACITY\n' +
            '  ──────────────\n' +
            '  In the sprawling megacity, death is optional — for those\n' +
            '  who can afford it. Cortical memory stacks allow the\n' +
            '  wealthy elite to cheat mortality, backing up their\n' +
            '  consciousness into crystalline implants while the poor\n' +
            '  die permanent deaths in the toxic slums below.\n\n' +
            '  The Cloud Towers pierce the smog ceiling, gleaming\n' +
            '  fortresses of the immortal elite. Below, the lower\n' +
            '  districts rot — a labyrinth of neon-lit alleys,\n' +
            '  abandoned sectors reclaimed by nature, and tunnel\n' +
            '  networks ruled by those the surface forgot.\n\n' +
            '  > FACTIONS\n' +
            '  ──────────\n' +
            '  Five factions vie for control of the megacity:\n\n' +
            '  ■ THE IRON COLLECTIVE        [color: #c0392b]\n' +
            '    Militant workers fighting against stack inequality.\n' +
            '    "No gods. No stacks. Only iron."\n\n' +
            '  ■ THE NEON COURT             [color: #9b59b6]\n' +
            '    Decadent aristocrats who rule through glamour,\n' +
            '    manipulation, and exquisite cruelty.\n\n' +
            '  ■ THE CIRCUIT SAINTS         [color: #2980b9]\n' +
            '    A techno-religious order that worships the Machine\n' +
            '    God and seeks digital transcendence.\n\n' +
            '  ■ THE GHOST SYNDICATE        [color: #7f8c8d]\n' +
            '    A criminal empire of thieves, smugglers, and\n' +
            '    assassins led by the enigmatic Broker.\n\n' +
            '  ■ THE ASHEN CIRCLE           [color: #95a5a6]\n' +
            '    Nihilist philosophers who believe reality itself\n' +
            '    is unraveling and embrace the void.\n';
    }

    function _buildCharacterSection() {
        return '' +
            SECTION_BORDER_TOP + '\n' +
            '│  SECTION 02: YOUR CHARACTER                        │\n' +
            SECTION_BORDER_BOTTOM + '\n\n' +
            '  > RACES\n' +
            '  ───────\n' +
            '  Ten species inhabit the megacity:\n\n' +
            '  01. HUMAN      — Adaptable survivors who thrive through\n' +
            '                   tenacity and social cunning.\n' +
            '  02. ORC        — Toxic-foundry mutants with unmatched\n' +
            '                   strength and short tempers.\n' +
            '  03. WOOD ELF   — Sharp-eyed hunters dwelling in the\n' +
            '                   overgrown ruins where nature reclaimed steel.\n' +
            '  04. DARK ELF   — Tunnel rulers who trade in secrets,\n' +
            '                   shadows, and ruthless precision.\n' +
            '  05. DWARF      — Stocky engineers who built the city\'s\n' +
            '                   bones and never let anyone forget it.\n' +
            '  06. HALF-GIANT — Eight-foot heavy lifters used as\n' +
            '                   living cranes and expendable muscle.\n' +
            '  07. CYBORG     — Once human, now more machine — immense\n' +
            '                   tech ability at the cost of humanity.\n' +
            '  08. SYNTH      — Artificial beings who woke up in bodies\n' +
            '                   they didn\'t choose, searching for identity.\n' +
            '  09. SHADOWKIN  — Rift-touched descendants carrying dark\n' +
            '                   energy in their blood, existing between worlds.\n' +
            '  10. VOIDBORN   — Alien-human hybrids with psychic powers\n' +
            '                   that terrify everyone around them.\n\n' +
            '  > STATS\n' +
            '  ───────\n' +
            '  Eight attributes define your character:\n\n' +
            '  STR  Strength     — Physical power, melee damage, carry weight\n' +
            '  DEX  Dexterity    — Agility, dodge chance, ranged accuracy\n' +
            '  CON  Constitution — Durability, max HP, poison/toxin resist\n' +
            '  INT  Intelligence — Tech skill, hacking, knowledge checks\n' +
            '  WIS  Wisdom       — Perception, willpower, mental resistance\n' +
            '  CHA  Charisma     — Persuasion, intimidation, faction influence\n' +
            '  TECH Tech Affinity— Cybernetic compatibility, device mastery\n' +
            '  LCK  Luck         — Critical chance, loot quality, random events\n\n' +
            '  > STAT MODIFIERS\n' +
            '  ────────────────\n' +
            '  Your modifier for any stat is calculated as:\n\n' +
            '      modifier = floor( (stat - 10) / 2 )\n\n' +
            '  Examples:\n' +
            '    STAT 8  -> modifier -1    STAT 14 -> modifier +2\n' +
            '    STAT 10 -> modifier  0    STAT 18 -> modifier +4\n' +
            '    STAT 12 -> modifier +1    STAT 20 -> modifier +5\n';
    }

    function _buildGameplaySection() {
        return '' +
            SECTION_BORDER_TOP + '\n' +
            '│  SECTION 03: GAMEPLAY                              │\n' +
            SECTION_BORDER_BOTTOM + '\n\n' +
            '  > CHOICES\n' +
            '  ─────────\n' +
            '  Click or tap to select your response. Some choices\n' +
            '  are always available. Others require passing a stat\n' +
            '  check — these are marked with the stat and DC\n' +
            '  (Difficulty Class) needed.\n\n' +
            '  > STAT CHECKS\n' +
            '  ─────────────\n' +
            '  When a choice requires a stat check:\n\n' +
            '    Roll = d20 + stat modifier\n\n' +
            '    If Roll >= DC ... SUCCESS\n' +
            '    If Roll <  DC ... FAILURE\n\n' +
            '  Special rolls:\n' +
            '    NAT 20 (natural 20) = Automatic success, always\n' +
            '    NAT 1  (natural 1)  = Automatic failure, always\n\n' +
            '  > COMBAT\n' +
            '  ────────\n' +
            '  Combat is turn-based. Each round you choose:\n\n' +
            '    [ATTACK]  — Strike with your equipped weapon\n' +
            '    [DEFEND]  — Brace for impact, reducing damage taken\n' +
            '    [ABILITY] — Use a racial or class special ability\n' +
            '    [ITEM]    — Consume a healing item or throwable\n' +
            '    [FLEE]    — Attempt to escape (DEX check vs enemy)\n\n' +
            '  > DEATH\n' +
            '  ───────\n' +
            '  When your HP reaches 0, you die. Death is permanent\n' +
            '  unless you have a cortical stack or a trait that\n' +
            '  prevents it (some racial traits trigger once to\n' +
            '  save you from a killing blow).\n\n' +
            '  WARNING: Save often. The city does not forgive.\n';
    }

    function _buildProgressionSection() {
        return '' +
            SECTION_BORDER_TOP + '\n' +
            '│  SECTION 04: PROGRESSION                           │\n' +
            SECTION_BORDER_BOTTOM + '\n\n' +
            '  > XP & LEVELING\n' +
            '  ───────────────\n' +
            '  Earn XP through combat, quests, and exploration.\n' +
            '  XP required for each level:\n\n' +
            '      threshold = 100 * level * 1.5\n\n' +
            '    Level 2:  300 XP     Level 5:  750 XP\n' +
            '    Level 3:  450 XP     Level 10: 1500 XP\n\n' +
            '  > SKILLS\n' +
            '  ────────\n' +
            '  Gain 2 skill points per level.\n' +
            '  Invest them across 5 skill trees:\n\n' +
            '    [COMBAT]   — Weapon mastery, critical strikes\n' +
            '    [STEALTH]  — Evasion, ambush, lockpicking\n' +
            '    [TECH]     — Hacking, crafting, device control\n' +
            '    [SOCIAL]   — Persuasion, deception, leadership\n' +
            '    [SURVIVAL] — Healing, scavenging, resistance\n\n' +
            '  > JOBS\n' +
            '  ──────\n' +
            '  Six careers are available, each with 4 ranks:\n\n' +
            '    Mercenary   — Fight for credits and reputation\n' +
            '    Smuggler    — Move contraband through the city\n' +
            '    Technician  — Repair, hack, and build for pay\n' +
            '    Medic       — Heal the wounded (and the desperate)\n' +
            '    Enforcer    — Corporate muscle with authority\n' +
            '    Fixer       — Broker deals and arrange meetings\n\n' +
            '  Complete job tasks to rank up and unlock perks.\n\n' +
            '  > FACTION REPUTATION\n' +
            '  ────────────────────\n' +
            '  Each faction tracks your standing from -100 to +100:\n\n' +
            '    -100 to -51  HOSTILE     — Hunted on sight\n' +
            '     -50 to -11  UNFRIENDLY  — Denied services\n' +
            '     -10 to  10  NEUTRAL     — Unknown outsider\n' +
            '      11 to  50  FRIENDLY    — Trusted ally\n' +
            '      51 to 100  ALLIED      — Inner circle\n\n' +
            '  Actions, quests, and dialogue shift reputation.\n' +
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
            '  [!] 116 ENDINGS EXIST\n' +
            '      Some are easy to find. Others require very\n' +
            '      specific choices, faction standings, stats, or\n' +
            '      items. Experiment with different builds.\n\n' +
            '  [!] THE TRUE ENDING\n' +
            '      Requires completing every major questline,\n' +
            '      maxing all faction reputations, and making a\n' +
            '      choice that only appears when everything else\n' +
            '      is done. Good luck.\n\n' +
            '  ════════════════════════════════════════════════\n' +
            '  END OF MANUAL // ACCESS LEVEL: PUBLIC\n' +
            '  ════════════════════════════════════════════════\n';
    }

    // --------------------------------------------------------
    // Section content map
    // --------------------------------------------------------
    var SECTION_BUILDERS = {
        world:       _buildWorldSection,
        character:   _buildCharacterSection,
        gameplay:    _buildGameplaySection,
        progression: _buildProgressionSection,
        tips:        _buildTipsSection
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
            _activeTab = 'world';

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
