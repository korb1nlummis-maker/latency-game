/**
 * LATENCY - Character Creation Screen
 * ============================================================
 * Multi-step wizard (5 steps) for creating a new character.
 *
 * Steps:
 *   1. Race Selection
 *   2. Stat Allocation
 *   3. Backstory Selection
 *   4. Name Entry
 *   5. Confirmation
 *
 * Integrates with:
 *   - window.Latency.Races           (race definitions)
 *   - window.Latency.CharacterSystem (character creation)
 *   - window.Latency.StateMachine    (screen transitions)
 *   - window.Latency.EventBus        (events)
 *
 * Namespace: window.Latency.Screens.CharacterCreation
 * Public API: mount(container, params), unmount()
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.CharacterCreation = (function () {
    'use strict';

    // ================================================================
    // PRIVATE STATE
    // ================================================================

    var _container = null;
    var _listeners = [];
    var _intervals = [];
    var _currentStep = 1;
    var TOTAL_STEPS = 5;
    var POINTS_TO_DISTRIBUTE = 15;
    var STAT_MIN = 8;
    var STAT_MAX = 18;
    var BASE_STAT = 10;

    // Stat definitions: internal key -> display abbreviation
    var STAT_KEYS = [
        'strength', 'dexterity', 'constitution', 'intelligence',
        'wisdom', 'charisma', 'tech', 'luck'
    ];
    var STAT_ABBR = {
        strength: 'STR', dexterity: 'DEX', constitution: 'CON',
        intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA',
        tech: 'TECH', luck: 'LUCK'
    };
    var STAT_FULL = {
        strength: 'Strength', dexterity: 'Dexterity', constitution: 'Constitution',
        intelligence: 'Intelligence', wisdom: 'Wisdom', charisma: 'Charisma',
        tech: 'Technology', luck: 'Luck'
    };

    // Character data being built
    var _character = {
        raceId: null,
        raceObj: null,
        allocation: {},   // player-allocated points per stat key (delta from base)
        pointsSpent: 0,
        backstoryId: null,
        backstoryObj: null,
        name: ''
    };

    // ================================================================
    // STEP TITLES
    // ================================================================

    var STEP_TITLES = [
        '',
        'SELECT YOUR RACE',
        'ALLOCATE STATS',
        'CHOOSE YOUR BACKSTORY',
        'ENTER YOUR NAME',
        'CONFIRM YOUR IDENTITY'
    ];

    // ================================================================
    // RACE HELPERS
    // ================================================================

    /** Get all race objects as an array from Latency.Races. */
    function _getRaceList() {
        var Races = window.Latency.Races;
        if (!Races) return [];
        var list = [];
        var keys = Object.keys(Races);
        for (var i = 0; i < keys.length; i++) {
            list.push(Races[keys[i]]);
        }
        return list;
    }

    /** Get racial bonus for a stat key. */
    function _getRacialBonus(raceObj, statKey) {
        if (!raceObj || !raceObj.statBonuses) return 0;
        return raceObj.statBonuses[statKey] || 0;
    }

    /** Build a short bonus preview string like "STR+3 CON+1 INT-1". */
    function _bonusPreview(raceObj) {
        if (!raceObj || !raceObj.statBonuses) return '';
        var parts = [];
        var keys = Object.keys(raceObj.statBonuses);
        for (var i = 0; i < keys.length; i++) {
            var val = raceObj.statBonuses[keys[i]];
            var abbr = STAT_ABBR[keys[i]] || keys[i].toUpperCase();
            parts.push(abbr + (val >= 0 ? '+' + val : '' + val));
        }
        return parts.join(' ');
    }

    /** Generate a random name from a race's nameGenerator. */
    function _generateName(raceObj) {
        if (!raceObj || !raceObj.nameGenerator) return 'Unknown';
        var gen = raceObj.nameGenerator;
        if (typeof gen === 'function') return gen();
        // Object-based generator: { prefixes: [], suffixes: [] }
        if (gen.prefixes && gen.suffixes) {
            var pre = gen.prefixes[Math.floor(Math.random() * gen.prefixes.length)];
            var suf = gen.suffixes[Math.floor(Math.random() * gen.suffixes.length)];
            return pre + suf;
        }
        return 'Unknown';
    }

    // ================================================================
    // DOM HELPERS
    // ================================================================

    function _el(tag, className, text) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (text !== undefined) el.textContent = text;
        return el;
    }

    function _bind(element, event, handler) {
        element.addEventListener(event, handler);
        _listeners.push({ element: element, event: event, handler: handler });
    }

    function _calcModifier(value) {
        return Math.floor((value - 10) / 2);
    }

    function _modStr(mod) {
        return mod >= 0 ? '+' + mod : '' + mod;
    }

    function _initAllocation() {
        _character.allocation = {};
        _character.pointsSpent = 0;
        for (var i = 0; i < STAT_KEYS.length; i++) {
            _character.allocation[STAT_KEYS[i]] = 0;
        }
    }

    /** Effective stat = base(10) + racial bonus + player allocation. */
    function _getEffectiveStat(statKey) {
        var racial = _getRacialBonus(_character.raceObj, statKey);
        var alloc = _character.allocation[statKey] || 0;
        return BASE_STAT + racial + alloc;
    }

    /** The allocatable base (before racial) = 10 + allocation. */
    function _getAllocBase(statKey) {
        return BASE_STAT + (_character.allocation[statKey] || 0);
    }

    function _repeat(ch, n) {
        var s = '';
        for (var i = 0; i < n; i++) s += ch;
        return s;
    }

    // ================================================================
    // STEP INDICATOR
    // ================================================================

    function _buildStepIndicator() {
        var wrap = _el('div', 'creation-step-indicator');
        for (var i = 1; i <= TOTAL_STEPS; i++) {
            var pip = _el('div', 'creation-step-pip');
            if (i < _currentStep) pip.classList.add('completed');
            if (i === _currentStep) pip.classList.add('active');
            pip.setAttribute('data-step', i);
            wrap.appendChild(pip);
        }
        var label = _el('span', 'creation-step-label', 'STEP ' + _currentStep + '/' + TOTAL_STEPS);
        wrap.appendChild(label);
        return wrap;
    }

    // ================================================================
    // NAVIGATION BAR
    // ================================================================

    function _buildNav(opts) {
        var nav = _el('div', 'creation-nav');

        if (opts.showBack) {
            var backBtn = _el('button', 'creation-nav-btn back', opts.backLabel || '< BACK');
            backBtn.type = 'button';
            _bind(backBtn, 'click', function () {
                if (opts.onBack) opts.onBack();
                _currentStep--;
                _renderStep();
            });
            nav.appendChild(backBtn);
        } else {
            nav.appendChild(_el('div', 'creation-nav-spacer'));
        }

        if (opts.showNext) {
            var nextBtn = _el('button', 'creation-nav-btn ' + (opts.nextClass || 'next'), opts.nextLabel || 'NEXT >');
            nextBtn.type = 'button';
            if (opts.nextDisabled) nextBtn.disabled = true;
            nextBtn.setAttribute('data-role', 'nav-next');
            _bind(nextBtn, 'click', function () {
                if (nextBtn.disabled) return;
                if (opts.onNext) {
                    var proceed = opts.onNext();
                    if (proceed === false) return;
                }
                if (opts.nextAction) {
                    opts.nextAction();
                } else {
                    _currentStep++;
                    _renderStep();
                }
            });
            nav.appendChild(nextBtn);
        }

        return nav;
    }

    // ================================================================
    // STEP 1: RACE SELECTION
    // ================================================================

    function _buildStep1() {
        var content = _el('div', 'creation-step-content');
        var races = _getRaceList();

        var layout = _el('div', 'creation-race-layout');

        // Grid of race cards
        var grid = _el('div', 'creation-race-grid');

        // Detail panel (right side)
        var detail = _el('div', 'creation-race-detail');
        var detailPlaceholder = _el('div', 'creation-race-detail-placeholder', '< SELECT A RACE TO VIEW DETAILS >');
        detail.appendChild(detailPlaceholder);

        for (var i = 0; i < races.length; i++) {
            (function (race) {
                var card = _el('div', 'creation-race-card');
                card.setAttribute('data-race-id', race.id);

                if (_character.raceId === race.id) {
                    card.classList.add('selected');
                    _showRaceDetail(detail, race);
                }

                var nameEl = _el('div', 'creation-race-card-name', race.name);
                card.appendChild(nameEl);

                var descEl = _el('div', 'creation-race-card-desc', race.description);
                card.appendChild(descEl);

                var bonusEl = _el('div', 'creation-race-card-bonuses', _bonusPreview(race));
                card.appendChild(bonusEl);

                _bind(card, 'click', function () {
                    var allCards = grid.querySelectorAll('.creation-race-card');
                    for (var j = 0; j < allCards.length; j++) {
                        allCards[j].classList.remove('selected');
                    }
                    card.classList.add('selected');
                    _character.raceId = race.id;
                    _character.raceObj = race;
                    // Reset backstory when race changes
                    _character.backstoryId = null;
                    _character.backstoryObj = null;
                    _showRaceDetail(detail, race);

                    var nextBtn = content.querySelector('[data-role="nav-next"]');
                    if (nextBtn) nextBtn.disabled = false;
                });

                grid.appendChild(card);
            })(races[i]);
        }

        layout.appendChild(grid);
        layout.appendChild(detail);
        content.appendChild(layout);

        // Nav
        var nav = _buildNav({
            showBack: false,
            showNext: true,
            nextDisabled: !_character.raceObj,
            onNext: function () {
                if (!_character.raceObj) return false;
                _initAllocation();
            }
        });
        content.appendChild(nav);

        return content;
    }

    function _showRaceDetail(detailEl, race) {
        detailEl.innerHTML = '';

        var nameEl = _el('div', 'creation-race-detail-name', race.name);
        detailEl.appendChild(nameEl);

        var loreEl = _el('div', 'creation-race-detail-lore', race.lore);
        detailEl.appendChild(loreEl);

        // Stat bonuses
        var bonusSec = _el('div', 'creation-race-detail-section');
        bonusSec.appendChild(_el('div', 'creation-race-detail-section-title', 'STAT BONUSES'));
        bonusSec.appendChild(_el('div', 'creation-race-detail-section-body', _bonusPreview(race) || 'None'));
        detailEl.appendChild(bonusSec);

        // Racial ability
        if (race.racialAbility) {
            var abilitySec = _el('div', 'creation-race-detail-section');
            abilitySec.appendChild(_el('div', 'creation-race-detail-section-title', 'RACIAL ABILITY'));
            var abilityText = race.racialAbility.name + ': ' + race.racialAbility.description;
            abilitySec.appendChild(_el('div', 'creation-race-detail-section-body', abilityText));
            detailEl.appendChild(abilitySec);
        }

        // Traits
        if (race.startingTraits && race.startingTraits.length > 0) {
            var traitSec = _el('div', 'creation-race-detail-section');
            traitSec.appendChild(_el('div', 'creation-race-detail-section-title', 'STARTING TRAITS'));
            traitSec.appendChild(_el('div', 'creation-race-detail-section-body', race.startingTraits.join(', ')));
            detailEl.appendChild(traitSec);
        }

        // Stack compatibility
        if (race.stackCompatibility) {
            var stackSec = _el('div', 'creation-race-detail-section');
            stackSec.appendChild(_el('div', 'creation-race-detail-section-title', 'STACK COMPATIBILITY'));
            stackSec.appendChild(_el('div', 'creation-race-detail-section-body', race.stackCompatibility.toUpperCase()));
            detailEl.appendChild(stackSec);
        }
    }

    // ================================================================
    // STEP 2: STAT ALLOCATION
    // ================================================================

    function _buildStep2() {
        var content = _el('div', 'creation-step-content');
        var race = _character.raceObj;

        // Header bar
        var header = _el('div', 'creation-stats-header');
        var raceLabel = _el('div', 'creation-stats-race-label');
        raceLabel.innerHTML = 'RACE: <span>' + _escHtml(race.name.toUpperCase()) + '</span>';
        header.appendChild(raceLabel);

        var pointsRemaining = POINTS_TO_DISTRIBUTE - _character.pointsSpent;
        var pointsEl = _el('div', 'creation-stats-points', 'POINTS REMAINING: ' + pointsRemaining);
        pointsEl.setAttribute('data-role', 'points-display');
        if (pointsRemaining === 0) pointsEl.classList.add('zero');
        header.appendChild(pointsEl);
        content.appendChild(header);

        // Stats table
        var table = _el('div', 'creation-stats-table');

        for (var i = 0; i < STAT_KEYS.length; i++) {
            (function (key) {
                var row = _el('div', 'creation-stat-row');
                var abbr = STAT_ABBR[key];

                // Stat name
                var nameEl = _el('div', 'creation-stat-name', abbr);
                nameEl.title = STAT_FULL[key];
                row.appendChild(nameEl);

                // Value display: effective = base + racial + allocation
                var effective = _getEffectiveStat(key);
                var racialBonus = _getRacialBonus(race, key);
                var valueEl = _el('div', 'creation-stat-value');
                valueEl.setAttribute('data-stat-value', key);
                valueEl.textContent = effective;
                if (racialBonus !== 0) {
                    var racialSpan = _el('span', 'creation-stat-racial',
                        '(' + (racialBonus >= 0 ? '+' : '') + racialBonus + ')');
                    valueEl.appendChild(racialSpan);
                }
                row.appendChild(valueEl);

                // Controls
                var controls = _el('div', 'creation-stat-controls');

                var allocBase = _getAllocBase(key);
                var curRemaining = POINTS_TO_DISTRIBUTE - _character.pointsSpent;

                var minusBtn = _el('button', 'creation-stat-btn', '-');
                minusBtn.type = 'button';
                minusBtn.setAttribute('data-stat-minus', key);
                if (allocBase <= STAT_MIN) minusBtn.disabled = true;

                var plusBtn = _el('button', 'creation-stat-btn', '+');
                plusBtn.type = 'button';
                plusBtn.setAttribute('data-stat-plus', key);
                if (allocBase >= STAT_MAX || curRemaining <= 0) plusBtn.disabled = true;

                _bind(minusBtn, 'click', function () {
                    if (_getAllocBase(key) <= STAT_MIN) return;
                    _character.allocation[key]--;
                    _character.pointsSpent--;
                    _updateStatDisplay(content);
                });

                _bind(plusBtn, 'click', function () {
                    var rem = POINTS_TO_DISTRIBUTE - _character.pointsSpent;
                    if (_getAllocBase(key) >= STAT_MAX || rem <= 0) return;
                    _character.allocation[key]++;
                    _character.pointsSpent++;
                    _updateStatDisplay(content);
                });

                controls.appendChild(minusBtn);
                controls.appendChild(plusBtn);
                row.appendChild(controls);

                // Modifier preview
                var mod = _calcModifier(effective);
                var modEl = _el('div', 'creation-stat-modifier', _modStr(mod));
                modEl.setAttribute('data-stat-mod', key);
                if (mod > 0) modEl.classList.add('positive');
                else if (mod < 0) modEl.classList.add('negative');
                row.appendChild(modEl);

                table.appendChild(row);
            })(STAT_KEYS[i]);
        }

        content.appendChild(table);

        // Nav
        var nav = _buildNav({
            showBack: true,
            showNext: true
        });
        content.appendChild(nav);

        return content;
    }

    function _updateStatDisplay(contentRoot) {
        var race = _character.raceObj;
        var pointsRemaining = POINTS_TO_DISTRIBUTE - _character.pointsSpent;

        // Update points counter
        var pointsEl = contentRoot.querySelector('[data-role="points-display"]');
        if (pointsEl) {
            pointsEl.textContent = 'POINTS REMAINING: ' + pointsRemaining;
            pointsEl.classList.remove('zero', 'negative');
            if (pointsRemaining === 0) pointsEl.classList.add('zero');
            else if (pointsRemaining < 0) pointsEl.classList.add('negative');
        }

        for (var i = 0; i < STAT_KEYS.length; i++) {
            var key = STAT_KEYS[i];
            var effective = _getEffectiveStat(key);
            var racialBonus = _getRacialBonus(race, key);

            // Update value
            var valEl = contentRoot.querySelector('[data-stat-value="' + key + '"]');
            if (valEl) {
                valEl.textContent = effective;
                if (racialBonus !== 0) {
                    var span = _el('span', 'creation-stat-racial',
                        '(' + (racialBonus >= 0 ? '+' : '') + racialBonus + ')');
                    valEl.appendChild(span);
                }
            }

            // Update modifier
            var mod = _calcModifier(effective);
            var modEl = contentRoot.querySelector('[data-stat-mod="' + key + '"]');
            if (modEl) {
                modEl.textContent = _modStr(mod);
                modEl.classList.remove('positive', 'negative');
                if (mod > 0) modEl.classList.add('positive');
                else if (mod < 0) modEl.classList.add('negative');
            }

            // Update button states
            var allocBase = _getAllocBase(key);
            var minusBtn = contentRoot.querySelector('[data-stat-minus="' + key + '"]');
            if (minusBtn) minusBtn.disabled = (allocBase <= STAT_MIN);

            var plusBtn = contentRoot.querySelector('[data-stat-plus="' + key + '"]');
            if (plusBtn) plusBtn.disabled = (allocBase >= STAT_MAX || pointsRemaining <= 0);
        }
    }

    // ================================================================
    // STEP 3: BACKSTORY SELECTION
    // ================================================================

    function _buildStep3() {
        var content = _el('div', 'creation-step-content');
        var race = _character.raceObj;
        var backstories = race.backstories || [];

        var grid = _el('div', 'creation-backstory-grid');

        for (var i = 0; i < backstories.length; i++) {
            (function (bs, idx) {
                var card = _el('div', 'creation-backstory-card');
                card.setAttribute('data-bs-id', bs.id);

                if (_character.backstoryId === bs.id) {
                    card.classList.add('selected');
                }

                var nameEl = _el('div', 'creation-backstory-name', bs.name);
                card.appendChild(nameEl);

                var descEl = _el('div', 'creation-backstory-desc', bs.description);
                card.appendChild(descEl);

                var meta = _el('div', 'creation-backstory-meta');

                // Starting items
                var itemsRow = _el('div', 'creation-backstory-meta-row');
                itemsRow.appendChild(_el('span', '', 'STARTING ITEMS'));
                var itemCount = bs.startingItems ? bs.startingItems.length : 0;
                itemsRow.appendChild(_el('span', 'creation-backstory-meta-value', itemCount + ' items'));
                meta.appendChild(itemsRow);

                // Starting credits
                var creditsRow = _el('div', 'creation-backstory-meta-row');
                creditsRow.appendChild(_el('span', '', 'CREDITS'));
                creditsRow.appendChild(_el('span', 'creation-backstory-meta-value',
                    (bs.startingCredits || 0) + ' CR'));
                meta.appendChild(creditsRow);

                card.appendChild(meta);

                _bind(card, 'click', function () {
                    var allCards = grid.querySelectorAll('.creation-backstory-card');
                    for (var j = 0; j < allCards.length; j++) {
                        allCards[j].classList.remove('selected');
                    }
                    card.classList.add('selected');
                    _character.backstoryId = bs.id;
                    _character.backstoryObj = bs;

                    var nextBtn = content.querySelector('[data-role="nav-next"]');
                    if (nextBtn) nextBtn.disabled = false;
                });

                grid.appendChild(card);
            })(backstories[i], i);
        }

        content.appendChild(grid);

        // Nav
        var nav = _buildNav({
            showBack: true,
            showNext: true,
            nextDisabled: !_character.backstoryId
        });
        content.appendChild(nav);

        return content;
    }

    // ================================================================
    // STEP 4: NAME ENTRY
    // ================================================================

    function _buildStep4() {
        var content = _el('div', 'creation-step-content');
        var race = _character.raceObj;

        var container = _el('div', 'creation-name-container');

        // Terminal prompt
        var prompt = _el('div', 'creation-name-prompt');
        var prefix = _el('span', 'creation-name-prefix', '> ENTER YOUR NAME:');
        prompt.appendChild(prefix);

        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'creation-name-input';
        input.placeholder = 'Type a name...';
        input.maxLength = 20;
        input.value = _character.name || '';
        input.setAttribute('data-role', 'name-input');
        prompt.appendChild(input);

        var cursor = _el('span', 'creation-name-cursor');
        prompt.appendChild(cursor);

        container.appendChild(prompt);

        // Generate button
        var genBtn = _el('button', 'creation-name-generate-btn', '[ GENERATE RANDOM NAME ]');
        genBtn.type = 'button';
        _bind(genBtn, 'click', function () {
            var generated = _generateName(race);
            input.value = generated;
            _character.name = generated;
            cursor.style.display = 'none';
            _validateName(validationEl, content);
        });
        container.appendChild(genBtn);

        // Validation message
        var validationEl = _el('div', 'creation-name-validation');
        validationEl.setAttribute('data-role', 'name-validation');
        container.appendChild(validationEl);

        content.appendChild(container);

        // Input handler
        _bind(input, 'input', function () {
            _character.name = input.value;
            _validateName(validationEl, content);
        });

        _bind(input, 'focus', function () {
            cursor.style.display = 'none';
        });
        _bind(input, 'blur', function () {
            if (!input.value) cursor.style.display = 'inline-block';
        });

        if (input.value) cursor.style.display = 'none';

        // Nav
        var nav = _buildNav({
            showBack: true,
            showNext: true,
            nextDisabled: !_isValidName(_character.name),
            onNext: function () {
                if (!_isValidName(_character.name)) return false;
            }
        });
        content.appendChild(nav);

        // Focus input after animation
        setTimeout(function () { input.focus(); }, 350);

        return content;
    }

    function _isValidName(name) {
        if (!name || typeof name !== 'string') return false;
        var trimmed = name.trim();
        if (trimmed.length < 1 || trimmed.length > 20) return false;
        return /^[a-zA-Z0-9 \-']+$/.test(trimmed);
    }

    function _validateName(validationEl, contentRoot) {
        var name = _character.name;
        var nextBtn = contentRoot.querySelector('[data-role="nav-next"]');

        if (!name || name.trim().length === 0) {
            validationEl.textContent = '';
            if (nextBtn) nextBtn.disabled = true;
            return;
        }

        if (name.trim().length > 20) {
            validationEl.textContent = 'ERROR: NAME EXCEEDS 20 CHARACTERS';
            if (nextBtn) nextBtn.disabled = true;
            return;
        }

        if (!/^[a-zA-Z0-9 \-']+$/.test(name.trim())) {
            validationEl.textContent = 'ERROR: INVALID CHARACTERS DETECTED';
            if (nextBtn) nextBtn.disabled = true;
            return;
        }

        validationEl.textContent = '';
        if (nextBtn) nextBtn.disabled = false;
    }

    // ================================================================
    // STEP 5: CONFIRMATION
    // ================================================================

    function _buildStep5() {
        var content = _el('div', 'creation-step-content');
        var race = _character.raceObj;
        var bs = _character.backstoryObj;

        var sheet = _el('div', 'creation-confirm-sheet');

        // ASCII border top
        sheet.appendChild(_el('div', 'creation-confirm-border-top',
            '+' + _repeat('=', 54) + '+'));

        // Header
        var header = _el('div', 'creation-confirm-header');
        header.appendChild(_el('div', 'creation-confirm-name',
            _character.name.trim().toUpperCase()));
        header.appendChild(_el('div', 'creation-confirm-race',
            race.name.toUpperCase() + ' | ' + bs.name.toUpperCase()));
        sheet.appendChild(header);

        // Stats section
        var statsSec = _el('div', 'creation-confirm-section');
        statsSec.appendChild(_el('div', 'creation-confirm-section-title', 'ATTRIBUTES'));
        var statsGrid = _el('div', 'creation-confirm-stats-grid');

        for (var i = 0; i < STAT_KEYS.length; i++) {
            var key = STAT_KEYS[i];
            var effective = _getEffectiveStat(key);
            var mod = _calcModifier(effective);

            var statEl = _el('div', 'creation-confirm-stat');
            statEl.appendChild(_el('div', 'creation-confirm-stat-name', STAT_ABBR[key]));
            statEl.appendChild(_el('div', 'creation-confirm-stat-value', '' + effective));

            var modEl = _el('div', 'creation-confirm-stat-mod', _modStr(mod));
            if (mod > 0) modEl.classList.add('positive');
            else if (mod < 0) modEl.classList.add('negative');
            statEl.appendChild(modEl);

            statsGrid.appendChild(statEl);
        }
        statsSec.appendChild(statsGrid);
        sheet.appendChild(statsSec);

        // Racial ability
        if (race.racialAbility) {
            var abilitySec = _el('div', 'creation-confirm-section');
            abilitySec.appendChild(_el('div', 'creation-confirm-section-title', 'RACIAL ABILITY'));
            abilitySec.appendChild(_el('div', 'creation-confirm-text',
                race.racialAbility.name + ': ' + race.racialAbility.description));
            sheet.appendChild(abilitySec);
        }

        // Traits
        if (race.startingTraits && race.startingTraits.length > 0) {
            var traitsSec = _el('div', 'creation-confirm-section');
            traitsSec.appendChild(_el('div', 'creation-confirm-section-title', 'STARTING TRAITS'));
            traitsSec.appendChild(_el('div', 'creation-confirm-text',
                race.startingTraits.join(', ')));
            sheet.appendChild(traitsSec);
        }

        // Backstory
        var bsSec = _el('div', 'creation-confirm-section');
        bsSec.appendChild(_el('div', 'creation-confirm-section-title', 'BACKSTORY'));
        var bsText = _el('div', 'creation-confirm-text');
        var strong = _el('strong', '', bs.name + ': ');
        bsText.appendChild(strong);
        bsText.appendChild(document.createTextNode(bs.description));
        bsSec.appendChild(bsText);
        sheet.appendChild(bsSec);

        // Starting items
        if (bs.startingItems && bs.startingItems.length > 0) {
            var itemsSec = _el('div', 'creation-confirm-section');
            itemsSec.appendChild(_el('div', 'creation-confirm-section-title', 'STARTING EQUIPMENT'));
            var itemsList = _el('ul', 'creation-confirm-items-list');
            for (var j = 0; j < bs.startingItems.length; j++) {
                // Format item IDs nicely: "rusty_knife" -> "Rusty Knife"
                var itemName = bs.startingItems[j].replace(/_/g, ' ').replace(/\b\w/g, function (c) {
                    return c.toUpperCase();
                });
                itemsList.appendChild(_el('li', '', itemName));
            }
            itemsSec.appendChild(itemsList);

            var creditsLine = _el('div', 'creation-confirm-text');
            creditsLine.style.marginTop = '0.5rem';
            var creditsStrong = _el('strong', '', (bs.startingCredits || 0) + ' CR');
            creditsLine.appendChild(document.createTextNode('Starting Credits: '));
            creditsLine.appendChild(creditsStrong);
            itemsSec.appendChild(creditsLine);
            sheet.appendChild(itemsSec);
        }

        // ASCII border bottom
        sheet.appendChild(_el('div', 'creation-confirm-border-bottom',
            '+' + _repeat('=', 54) + '+'));

        content.appendChild(sheet);

        // Nav
        var nav = _buildNav({
            showBack: true,
            showNext: true,
            nextLabel: 'BEGIN YOUR JOURNEY',
            nextClass: 'begin',
            nextAction: function () {
                _beginJourney();
            }
        });
        content.appendChild(nav);

        return content;
    }

    // ================================================================
    // BEGIN JOURNEY
    // ================================================================

    function _beginJourney() {
        var race = _character.raceObj;
        var bs = _character.backstoryObj;
        var name = _character.name.trim();

        // Build statAllocation object (the *delta* from base 10)
        // CharacterSystem.create expects this format
        var statAllocation = {};
        for (var i = 0; i < STAT_KEYS.length; i++) {
            var key = STAT_KEYS[i];
            var alloc = _character.allocation[key] || 0;
            if (alloc !== 0) {
                statAllocation[key] = alloc;
            }
        }

        // Use CharacterSystem if available
        var characterData = null;
        if (window.Latency.CharacterSystem && typeof window.Latency.CharacterSystem.create === 'function') {
            try {
                characterData = window.Latency.CharacterSystem.create(
                    name,
                    _character.raceId,
                    statAllocation,
                    _character.backstoryId
                );
                console.log('[CharacterCreation] Character created via CharacterSystem:', characterData);
            } catch (err) {
                console.error('[CharacterCreation] CharacterSystem.create error:', err);
            }
        } else {
            // Fallback: build a simple data object
            var finalStats = {};
            for (var j = 0; j < STAT_KEYS.length; j++) {
                finalStats[STAT_KEYS[j]] = _getEffectiveStat(STAT_KEYS[j]);
            }
            characterData = {
                name: name,
                race: _character.raceId,
                stats: finalStats,
                backstory: _character.backstoryId
            };
            window.Latency._newCharacter = characterData;
            console.log('[CharacterCreation] Character created (fallback):', characterData);
        }

        // Transition to origin cutscene if one exists, otherwise straight to gameplay
        var SM = window.Latency.StateMachine;
        if (SM) {
            // Determine starting node: origin story if one exists, otherwise prologue
            var originNodePrefixes = {
                human: 'human', orc: 'orc', wood_elf: 'welf',
                dark_elf: 'delf', dwarf: 'dwf', half_giant: 'hgnt',
                cyborg: 'cyb', synth: 'syn', shadowkin: 'shd', voidborn: 'vbd'
            };
            var raceId = _character.raceId;
            var prefix = originNodePrefixes[raceId];
            // Always start at origin story if race has a known prefix — the
            // Narrative system will lazy-load the JSON file via fetch.
            var startNodeId = prefix
                ? 'origins.' + raceId + '.' + prefix + '_001'
                : 'shared.prologue.node_001';
            console.log('[CharacterCreation] Start node for ' + raceId + ': ' + startNodeId);

            var char = window.Latency.CharacterSystem.getCharacter();
            if (char) {
                char.currentNodeId = startNodeId;
            }

            var cutsceneId = 'origin_' + raceId;
            var hasCS = window.Latency.CutsceneData && window.Latency.CutsceneData[cutsceneId];
            if (hasCS) {
                // Transition to race-specific origin cutscene
                if (SM.transition) {
                    SM.transition('cutscene', { cutsceneId: cutsceneId, character: characterData, nodeId: startNodeId });
                } else if (window.Latency.ScreenManager) {
                    window.Latency.ScreenManager.show('cutscene', { cutsceneId: cutsceneId, character: characterData, nodeId: startNodeId });
                }
            } else {
                // No cutscene for this race, go straight to gameplay
                SM.transition('gameplay', { character: characterData, nodeId: startNodeId });
            }
        }
    }

    // ================================================================
    // HTML ESCAPE (for innerHTML safety)
    // ================================================================

    function _escHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ================================================================
    // RENDER STEP
    // ================================================================

    function _renderStep() {
        if (!_container) return;

        // Cleanup existing listeners before re-render
        _cleanupListeners();

        _container.innerHTML = '';

        var screen = _el('div', 'creation-screen');

        // Step indicator
        screen.appendChild(_buildStepIndicator());

        // Step title
        screen.appendChild(_el('div', 'creation-step-title', STEP_TITLES[_currentStep]));

        // Step content
        var stepContent;
        switch (_currentStep) {
            case 1: stepContent = _buildStep1(); break;
            case 2: stepContent = _buildStep2(); break;
            case 3: stepContent = _buildStep3(); break;
            case 4: stepContent = _buildStep4(); break;
            case 5: stepContent = _buildStep5(); break;
            default:
                stepContent = _el('div', 'creation-step-content', 'Unknown step.');
        }

        screen.appendChild(stepContent);
        _container.appendChild(screen);
    }

    function _cleanupListeners() {
        for (var i = 0; i < _listeners.length; i++) {
            var entry = _listeners[i];
            if (entry.element) {
                entry.element.removeEventListener(entry.event, entry.handler);
            }
        }
        _listeners = [];
    }

    // ================================================================
    // PUBLIC API
    // ================================================================

    return {
        mount: function (container, params) {
            _container = container;
            _listeners = [];
            _intervals = [];
            _currentStep = 1;

            // Reset character data
            _character = {
                raceId: null,
                raceObj: null,
                allocation: {},
                pointsSpent: 0,
                backstoryId: null,
                backstoryObj: null,
                name: ''
            };

            _renderStep();

            console.log('[CharacterCreation] Mounted.');
        },

        unmount: function () {
            _cleanupListeners();

            for (var j = 0; j < _intervals.length; j++) {
                clearInterval(_intervals[j]);
            }
            _intervals = [];

            _container = null;

            console.log('[CharacterCreation] Unmounted.');
        }
    };
})();
