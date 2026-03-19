/**
 * LATENCY - Encounter System
 * ============================================================
 * Random encounter engine triggered during map travel. Rolls
 * for encounters based on location danger, player level, luck,
 * and stealth traits. Resolves combat encounters by pulling
 * from location enemy pools, event encounters from the
 * RandomEvents data, or safe-travel flavor text.
 *
 * Dependencies:
 *   - window.Latency.EventBus        (publish/subscribe messaging)
 *   - window.Latency.CharacterSystem  (player stats, traits, level)
 *   - window.Latency.Dice             (dice rolling engine)
 *   - window.Latency.Locations        (location data, encounter pools)
 *   - window.Latency.Enemies          (enemy data tables)
 *   - window.Latency.RandomEvents     (event encounter data)
 *   - window.Latency.Combat           (initiate combat)
 *   - window.Latency.Inventory        (grant items)
 *
 * Events emitted:
 *   encounter:roll       { from, to, roll, type, chance }
 *   encounter:combat     { enemyId, enemy, location }
 *   encounter:event      { event, choiceIndex, outcome }
 *   encounter:nothing    { text }
 *   encounter:resolved   { type, result }
 *
 * Listens for:
 *   map:travel            { from, to, location }
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.EncounterSystem = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Lazy dependency resolution
    // -------------------------------------------------------------------

    var _bus = null;
    function bus() {
        if (!_bus) { _bus = window.Latency.EventBus; }
        return _bus;
    }

    function Dice()    { return window.Latency.Dice; }
    function CS()      { return window.Latency.CharacterSystem; }
    function Locs()    { return window.Latency.Locations; }
    function Enemies() { return window.Latency.Enemies; }
    function Events()  { return window.Latency.RandomEvents; }
    function Combat()  { return window.Latency.Combat; }
    function Inv()     { return window.Latency.Inventory; }

    // -------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------

    /** Base encounter type weights (must sum to 1.0) */
    var BASE_COMBAT_CHANCE  = 0.30;
    var BASE_EVENT_CHANCE   = 0.20;
    // BASE_NOTHING_CHANCE  = 0.50 (remainder)

    /** District danger tiers — higher = more dangerous */
    var DISTRICT_TIER = {
        undercity:    1,
        midcity:      2,
        highcity:     3,
        underground:  4
    };

    /** Danger level overrides for specific locations */
    var DANGER_LEVEL_MODIFIER = {
        low:      -0.10,
        moderate:  0.00,
        high:      0.10,
        extreme:   0.20
    };

    /** Safe travel flavor text by district */
    var NOTHING_TEXT = {
        undercity: [
            'Rain drips from rusted pipes as you make your way through the slums. Uneventful, for once.',
            'The usual smog and distant machinery. You arrive without incident.',
            'A stray cat watches you from a fire escape. It seems unimpressed. You reach your destination safely.',
            'Flickering neon signs light your path through the lower levels. Nothing stirs in the shadows this time.',
            'The smell of synthetic food and engine oil follows you, but nothing else does.',
            'Someone painted "WE REMEMBER" on a wall in fresh red. You keep moving.',
            'A puddle of something luminescent blocks the alley. You step around it and continue.',
            'The pipes overhead hiss and groan. Normal sounds. You arrive without trouble.'
        ],
        midcity: [
            'The crowds part and flow around you. Just another face in the midcity press. Safe travels.',
            'Holographic ads flicker overhead as you navigate the transit corridors without incident.',
            'A security drone scans you briefly, then moves on. You are not interesting enough today.',
            'The hum of the transit system fills the air. You arrive at your destination on schedule.',
            'Commuters shuffle past with dead eyes and sealed lips. The midcity moves, indifferent.',
            'A food vendor calls out prices. Real meat, allegedly. You keep walking.',
            'The lights flicker once, twice. Power surge. Nobody even flinches anymore.',
            'Rain on glass fifty stories above. Down here, only the sound reaches you. Quiet journey.'
        ],
        highcity: [
            'Clean air and polished surfaces. The high city hums with quiet efficiency. You pass through unmolested.',
            'Security cameras track your movement but no alarms sound. You are tolerated, for now.',
            'The silence up here is almost oppressive after the noise below. You reach your destination undisturbed.',
            'A corporate shuttle passes overhead, its wake ruffling your clothes. The elite move in a different world.',
            'Manicured gardens line the walkway. Real flowers. You almost stop to smell them.',
            'A butler-drone offers you a beverage sample. You decline and move on.',
            'Glass and chrome everywhere. Your reflection follows you like a ghost. Quiet transit.',
            'The air tastes different up here. Clean. Almost sweet. You arrive without incident.'
        ],
        underground: [
            'The tunnel stretches dark and silent. Your footsteps echo. Nothing answers. You arrive safely.',
            'Dripping water and distant rumbles. The underground breathes around you, but does not bite. Not this time.',
            'Faint bioluminescence marks your path. The tunnels are quiet today. An unsettling kind of quiet.',
            'You follow the smuggler marks scratched into the walls. They lead you true.',
            'The darkness is absolute between the glow-markers. You count your steps and arrive intact.',
            'Something skitters in the distance. It does not come closer. You do not investigate.',
            'The air grows cold, then warm again. Thermal vents. You navigate by their patterns.',
            'Old cables hang from the ceiling like dead vines. You duck under them and press on.'
        ]
    };

    // -------------------------------------------------------------------
    // Internal state
    // -------------------------------------------------------------------

    var _initialized = false;
    var _lastEncounterType = null;
    var _encounterActive = false;
    var _pendingEvent = null;

    // -------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------

    function init() {
        if (_initialized) { return; }

        bus().on('map:travel', _onMapTravel);
        _initialized = true;

        console.log('[EncounterSystem] Initialized. Listening for map:travel events.');
    }

    // -------------------------------------------------------------------
    // Core encounter roll
    // -------------------------------------------------------------------

    /**
     * Handle map:travel event. Roll for encounter and resolve.
     * @param {Object} data - { from, to, location }
     */
    function _onMapTravel(data) {
        if (_encounterActive) { return; }

        var fromId     = data.from;
        var toId       = data.to;
        var locData    = data.location;
        var character  = CS() ? CS().getCharacter() : null;

        if (!locData || !character) { return; }

        // Calculate modified encounter chances
        var chances = _calculateChances(locData, character);

        // Roll d100 to determine encounter type
        var roll = Dice().roll(100);

        var type;
        if (roll <= chances.combat) {
            type = 'combat';
        } else if (roll <= chances.combat + chances.event) {
            type = 'event';
        } else {
            type = 'nothing';
        }

        // Emit the roll result
        bus().emit('encounter:roll', {
            from: fromId,
            to: toId,
            roll: roll,
            type: type,
            chance: chances
        });

        // Resolve the encounter
        _lastEncounterType = type;

        switch (type) {
            case 'combat':
                _resolveCombat(locData, character);
                break;
            case 'event':
                _resolveEvent(locData, character);
                break;
            case 'nothing':
                _resolveNothing(locData);
                break;
        }
    }

    // -------------------------------------------------------------------
    // Chance calculation
    // -------------------------------------------------------------------

    /**
     * Calculate modified encounter chances based on context.
     * @param {Object} locData   - Destination location data
     * @param {Object} character - Player character object
     * @returns {{ combat: number, event: number, nothing: number }}
     *     Percentages (0-100) for each encounter type.
     */
    function _calculateChances(locData, character) {
        var combatChance  = BASE_COMBAT_CHANCE;
        var eventChance   = BASE_EVENT_CHANCE;

        // --- District tier modifier ---
        // Higher tiers increase combat chance, lower tiers increase event chance
        var district = locData.district || 'undercity';
        var tier = DISTRICT_TIER[district] || 1;
        var tierMod = (tier - 2) * 0.05;  // tier 1: -5%, tier 2: 0%, tier 3: +5%, tier 4: +10%
        combatChance += tierMod;

        // --- Location danger level modifier ---
        if (locData.dangerLevel && DANGER_LEVEL_MODIFIER[locData.dangerLevel] !== undefined) {
            combatChance += DANGER_LEVEL_MODIFIER[locData.dangerLevel];
        }

        // --- Player level vs location tier ---
        // If player level significantly exceeds the area's expected level,
        // reduce combat chance (enemies avoid you)
        var expectedLevel = _getExpectedLevel(district);
        var levelDiff = character.level - expectedLevel;
        if (levelDiff > 3) {
            // Player overleveled: reduce combat chance by 3% per level over
            var overReduction = Math.min(0.15, (levelDiff - 3) * 0.03);
            combatChance -= overReduction;
            eventChance += overReduction * 0.5;  // some combat becomes events
        } else if (levelDiff < -2) {
            // Player underleveled: area is more dangerous
            var underIncrease = Math.min(0.10, Math.abs(levelDiff + 2) * 0.02);
            combatChance += underIncrease;
        }

        // --- Luck stat modifier ---
        // Higher luck reduces combat chance slightly
        var luckMod = CS().getStatModifier('luck');
        if (luckMod > 0) {
            combatChance -= luckMod * 0.01;  // -1% per luck modifier point
            eventChance  += luckMod * 0.005; // +0.5% event per luck modifier point
        }

        // --- Stealth trait modifier ---
        // Characters with stealth traits are less likely to be detected
        if (_hasStealthTrait(character)) {
            combatChance -= 0.08;  // -8% combat chance
            eventChance  += 0.03;  // +3% event (you find things instead of fighting)
        }

        // --- Clamp values ---
        combatChance = Math.max(0.05, Math.min(0.60, combatChance));
        eventChance  = Math.max(0.05, Math.min(0.40, eventChance));

        // Ensure total does not exceed 100
        if (combatChance + eventChance > 0.90) {
            var excess = (combatChance + eventChance) - 0.90;
            combatChance -= excess * 0.6;
            eventChance  -= excess * 0.4;
        }

        var nothingChance = 1.0 - combatChance - eventChance;
        nothingChance = Math.max(0.10, nothingChance);

        // Normalize to percentages (1-100 scale for d100 roll)
        return {
            combat:  Math.round(combatChance  * 100),
            event:   Math.round(eventChance   * 100),
            nothing: Math.round(nothingChance * 100)
        };
    }

    /**
     * Get the expected player level for a district.
     */
    function _getExpectedLevel(district) {
        switch (district) {
            case 'undercity':    return 3;
            case 'midcity':      return 7;
            case 'highcity':     return 14;
            case 'underground':  return 10;
            default:             return 5;
        }
    }

    /**
     * Check if the character has any stealth-related traits.
     */
    function _hasStealthTrait(character) {
        if (!character || !character.traits) { return false; }

        var stealthTraits = [
            'stealth_master',
            'assassins_instinct',
            'shadow_walk',
            'ghost_in_machine',
            'night_vision',
            'infiltrator'
        ];

        for (var i = 0; i < character.traits.length; i++) {
            if (stealthTraits.indexOf(character.traits[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    // -------------------------------------------------------------------
    // Combat encounter resolution
    // -------------------------------------------------------------------

    /**
     * Pick a random enemy from the location's encounter pool and start combat.
     */
    function _resolveCombat(locData, character) {
        var encounters = locData.encounters;
        if (!encounters || encounters.length === 0) {
            // No enemies defined for this location, fall back to nothing
            _resolveNothing(locData);
            return;
        }

        var enemies = Enemies();
        if (!enemies) {
            _resolveNothing(locData);
            return;
        }

        // Pick a random enemy ID from the location's pool
        var enemyId = encounters[Dice().roll(encounters.length) - 1];
        var enemyData = enemies[enemyId];

        if (!enemyData) {
            console.warn('[EncounterSystem] Enemy not found: ' + enemyId);
            _resolveNothing(locData);
            return;
        }

        _encounterActive = true;

        bus().emit('encounter:combat', {
            enemyId: enemyId,
            enemy: enemyData,
            location: locData
        });

        // Start combat through the Combat system
        if (Combat() && Combat().start) {
            Combat().start(enemyId);
        }

        // Listen for combat end to mark encounter complete
        bus().once('combat:end', function () {
            _encounterActive = false;
            bus().emit('encounter:resolved', {
                type: 'combat',
                result: 'complete'
            });
        });
    }

    // -------------------------------------------------------------------
    // Event encounter resolution
    // -------------------------------------------------------------------

    /**
     * Pick a random event matching the destination district and present it.
     */
    function _resolveEvent(locData, character) {
        var events = Events();
        if (!events) {
            _resolveNothing(locData);
            return;
        }

        var district = locData.district || 'undercity';
        var level = character.level || 1;

        // Filter events matching this district and level range
        var eligible = [];
        var eventKeys = Object.keys(events);
        for (var i = 0; i < eventKeys.length; i++) {
            var evt = events[eventKeys[i]];
            if (evt.district !== district) { continue; }

            var minLvl = evt.minLevel || 1;
            var maxLvl = evt.maxLevel || 99;
            if (level < minLvl || level > maxLvl) { continue; }

            // Check requirements
            if (evt.requires) {
                if (evt.requires.flag && character.flags.indexOf(evt.requires.flag) === -1) {
                    continue;
                }
                if (evt.requires.trait && character.traits.indexOf(evt.requires.trait) === -1) {
                    continue;
                }
                if (evt.requires.stat) {
                    var statName = Object.keys(evt.requires.stat)[0];
                    var statReq = evt.requires.stat[statName];
                    if (!character.stats || (character.stats[statName] || 0) < statReq) {
                        continue;
                    }
                }
            }

            eligible.push(evt);
        }

        if (eligible.length === 0) {
            _resolveNothing(locData);
            return;
        }

        // Pick a random eligible event
        var chosenEvent = eligible[Dice().roll(eligible.length) - 1];

        _encounterActive = true;
        _pendingEvent = chosenEvent;

        bus().emit('encounter:event', {
            event: chosenEvent,
            choiceIndex: null,
            outcome: null
        });

        console.log('[EncounterSystem] Event triggered: ' + chosenEvent.name);
    }

    /**
     * Process a player's choice for the current pending event.
     * Called by the UI when the player selects a choice.
     *
     * @param {number} choiceIndex - Index into the event's choices array.
     * @returns {Object|null} The outcome object, or null if no event pending.
     */
    function resolveEventChoice(choiceIndex) {
        if (!_pendingEvent) { return null; }

        var event = _pendingEvent;
        var choices = event.choices;

        if (!choices || choiceIndex < 0 || choiceIndex >= choices.length) {
            _encounterActive = false;
            _pendingEvent = null;
            return null;
        }

        var choice = choices[choiceIndex];
        var outcome;

        // If the choice has a stat check, roll for it
        if (choice.check) {
            var character = CS() ? CS().getCharacter() : null;
            if (character && character.stats) {
                var statValue = character.stats[choice.check.stat] || 10;
                var dc = choice.check.dc || 12;
                var result = Dice().statCheck(statValue, dc);

                // Emit the dice roll for the UI
                bus().emit('dice:roll', {
                    sides: 20,
                    result: result.roll,
                    purpose: 'encounter_check',
                    success: result.success,
                    crit: result.critSuccess
                });

                outcome = result.success ? choice.success : choice.failure;
            } else {
                outcome = choice.failure || choice.success;
            }
        } else {
            // No check, automatic success
            outcome = choice.success;
        }

        if (!outcome) {
            outcome = { text: 'Nothing happens.', xp: 5 };
        }

        // Apply outcome effects
        _applyOutcome(outcome);

        // Emit resolved event
        bus().emit('encounter:event', {
            event: event,
            choiceIndex: choiceIndex,
            outcome: outcome
        });

        bus().emit('encounter:resolved', {
            type: 'event',
            result: outcome
        });

        _encounterActive = false;
        _pendingEvent = null;

        return outcome;
    }

    /**
     * Apply an outcome's mechanical effects to the character.
     */
    function _applyOutcome(outcome) {
        if (!outcome) { return; }

        var character = CS() ? CS().getCharacter() : null;
        if (!character) { return; }

        // XP
        if (outcome.xp && CS().addExperience) {
            CS().addExperience(outcome.xp);
        }

        // Credits
        if (outcome.credits) {
            if (character.inventory) {
                character.inventory.currency = Math.max(0,
                    (character.inventory.currency || 0) + outcome.credits
                );
                bus().emit('currency:change', {
                    oldAmount: character.inventory.currency - outcome.credits,
                    newAmount: character.inventory.currency,
                    delta: outcome.credits
                });
            }
        }

        // Items
        if (outcome.items && outcome.items.length > 0 && Inv()) {
            for (var i = 0; i < outcome.items.length; i++) {
                if (Inv().addItem) {
                    Inv().addItem(outcome.items[i], 1);
                }
            }
        }

        // Damage
        if (outcome.damage && outcome.damage > 0 && CS().takeDamage) {
            CS().takeDamage(outcome.damage);
        }

        // Heal
        if (outcome.heal && outcome.heal > 0 && CS().heal) {
            CS().heal(outcome.heal);
        }

        // Reputation
        if (outcome.reputation) {
            var factions = Object.keys(outcome.reputation);
            for (var r = 0; r < factions.length; r++) {
                if (CS().modifyReputation) {
                    CS().modifyReputation(factions[r], outcome.reputation[factions[r]]);
                }
            }
        }

        // Flags
        if (outcome.flags && outcome.flags.length > 0) {
            for (var f = 0; f < outcome.flags.length; f++) {
                if (character.flags && character.flags.indexOf(outcome.flags[f]) === -1) {
                    character.flags.push(outcome.flags[f]);
                }
            }
        }

        // Trait
        if (outcome.trait && CS().addTrait) {
            CS().addTrait(outcome.trait);
        }
    }

    // -------------------------------------------------------------------
    // Nothing encounter resolution
    // -------------------------------------------------------------------

    /**
     * Emit safe-travel flavor text.
     */
    function _resolveNothing(locData) {
        var district = (locData && locData.district) ? locData.district : 'undercity';
        var pool = NOTHING_TEXT[district] || NOTHING_TEXT.undercity;

        var text = pool[Dice().roll(pool.length) - 1];

        bus().emit('encounter:nothing', { text: text });

        bus().emit('encounter:resolved', {
            type: 'nothing',
            result: { text: text }
        });
    }

    // -------------------------------------------------------------------
    // Public query methods
    // -------------------------------------------------------------------

    /**
     * Check if an encounter is currently active (waiting for resolution).
     * @returns {boolean}
     */
    function isActive() {
        return _encounterActive;
    }

    /**
     * Get the current pending event (if any).
     * @returns {Object|null}
     */
    function getPendingEvent() {
        return _pendingEvent;
    }

    /**
     * Get the type of the last encounter that occurred.
     * @returns {string|null} 'combat', 'event', or 'nothing'
     */
    function getLastEncounterType() {
        return _lastEncounterType;
    }

    /**
     * Preview encounter chances for a given location without triggering.
     * Useful for displaying danger indicators on the map.
     *
     * @param {string} locationId - Key in Locations data.
     * @returns {{ combat: number, event: number, nothing: number }|null}
     */
    function previewChances(locationId) {
        var locations = Locs();
        var character = CS() ? CS().getCharacter() : null;

        if (!locations || !locations[locationId] || !character) {
            return null;
        }

        return _calculateChances(locations[locationId], character);
    }

    /**
     * Force a specific encounter type for testing/scripted events.
     * @param {string} type - 'combat', 'event', or 'nothing'
     * @param {string} locationId - Key in Locations data.
     */
    function forceEncounter(type, locationId) {
        var locations = Locs();
        var character = CS() ? CS().getCharacter() : null;

        if (!locations || !locations[locationId] || !character) { return; }

        var locData = locations[locationId];

        switch (type) {
            case 'combat':
                _resolveCombat(locData, character);
                break;
            case 'event':
                _resolveEvent(locData, character);
                break;
            case 'nothing':
                _resolveNothing(locData);
                break;
        }
    }

    /**
     * Cancel any active encounter (e.g., if the player navigates away).
     */
    function cancel() {
        _encounterActive = false;
        _pendingEvent = null;
    }

    // -------------------------------------------------------------------
    // Serialization support
    // -------------------------------------------------------------------

    /**
     * Return serializable state for save games.
     */
    function serialize() {
        return {
            lastEncounterType: _lastEncounterType,
            pendingEventId: _pendingEvent ? _pendingEvent.id : null
        };
    }

    /**
     * Restore state from save data.
     */
    function deserialize(data) {
        if (!data) { return; }
        _lastEncounterType = data.lastEncounterType || null;

        if (data.pendingEventId && Events()) {
            _pendingEvent = Events()[data.pendingEventId] || null;
            _encounterActive = !!_pendingEvent;
        }
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    return {
        init:                init,

        // Event choice resolution
        resolveEventChoice:  resolveEventChoice,

        // Query methods
        isActive:            isActive,
        getPendingEvent:     getPendingEvent,
        getLastEncounterType: getLastEncounterType,
        previewChances:      previewChances,

        // Manual control
        forceEncounter:      forceEncounter,
        cancel:              cancel,

        // Save/load
        serialize:           serialize,
        deserialize:         deserialize
    };
})();
