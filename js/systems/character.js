/**
 * LATENCY - CharacterSystem
 * Manages character creation, stats, leveling, HP, stamina, traits,
 * reputation, and serialization.
 *
 * Dependencies:
 *   - window.Latency.Races       (race data keyed by raceId)
 *   - window.Latency.Traits      (trait data keyed by traitId)
 *   - window.Latency.EventBus    (publish/subscribe messaging)
 *
 * Events emitted:
 *   character:created  { character }
 *   stat:change        { stat, oldValue, newValue, delta }
 *   hp:change          { oldHp, newHp, maxHp, amount, type:'damage'|'heal' }
 *   stamina:change     { oldStamina, newStamina, maxStamina, amount, type:'use'|'restore' }
 *   levelup            { level, oldLevel }
 *   trait:add           { traitId, trait }
 *   trait:remove        { traitId, trait }
 *   faction:change      { factionId, oldValue, newValue, delta, tier }
 *   character:died      { character }
 */

window.Latency = window.Latency || {};

window.Latency.CharacterSystem = (function () {
    'use strict';

    var EventBus = null; // resolved lazily so load order doesn't matter

    function bus() {
        if (!EventBus) {
            EventBus = window.Latency.EventBus;
        }
        return EventBus;
    }

    // ---------------------------------------------------------------
    //  Internal state
    // ---------------------------------------------------------------

    var _character = null;

    // ---------------------------------------------------------------
    //  Character creation
    // ---------------------------------------------------------------

    /**
     * Create a brand-new character.
     * @param {string}  name            Display name.
     * @param {string}  raceId          Key into Latency.Races.
     * @param {Object}  statAllocation  Player-chosen stat point distribution.
     * @param {string}  backstoryId     Chosen backstory identifier.
     * @returns {Object} The created character object.
     */
    function create(name, raceId, statAllocation, backstoryId) {
        var race = window.Latency.Races[raceId];
        if (!race) {
            throw new Error('CharacterSystem.create: unknown race "' + raceId + '"');
        }

        var bonuses = race.statBonuses || {};
        var alloc   = statAllocation || {};

        _character = {
            name: name,
            race: raceId,
            level: 1,
            experience: 0,
            experienceToLevel: 100,

            stats: {
                strength:     10 + (bonuses.strength     || 0) + (alloc.strength     || 0),
                dexterity:    10 + (bonuses.dexterity    || 0) + (alloc.dexterity    || 0),
                constitution: 10 + (bonuses.constitution || 0) + (alloc.constitution || 0),
                intelligence: 10 + (bonuses.intelligence || 0) + (alloc.intelligence || 0),
                wisdom:       10 + (bonuses.wisdom       || 0) + (alloc.wisdom       || 0),
                charisma:     10 + (bonuses.charisma     || 0) + (alloc.charisma     || 0),
                tech:         10 + (bonuses.tech         || 0) + (alloc.tech         || 0),
                luck:         10 + (bonuses.luck         || 0) + (alloc.luck         || 0)
            },

            derived: {
                maxHp: 0,
                currentHp: 0,
                maxStamina: 0,
                currentStamina: 0,
                armor: 0,
                initiative: 0
            },

            backstory: backstoryId,
            traits: race.startingTraits ? race.startingTraits.slice() : [],
            activeAbilities: race.racialAbility ? [race.racialAbility] : [],

            inventory: {
                equipped: {
                    weapon: null,
                    armor: null,
                    accessory1: null,
                    accessory2: null,
                    stack: null
                },
                backpack: [],
                currency: 50
            },

            reputation: {
                ironCollective: 0,
                neonCourt: 0,
                circuitSaints: 0,
                ghostSyndicate: 0,
                ashenCircle: 0
            },

            job: null,
            jobRank: 0,
            relationships: {},
            flags: [],
            visitedNodes: [],
            currentNodeId: null,
            playtime: 0,
            createdAt: new Date().toISOString(),
            deathCount: 0
        };

        // Apply backstory starting bonuses from the race data
        if (backstoryId) {
            var raceData = window.Latency.Races && window.Latency.Races[raceId];
            if (raceData && raceData.backstories) {
                var bs = null;
                for (var i = 0; i < raceData.backstories.length; i++) {
                    if (raceData.backstories[i].id === backstoryId) {
                        bs = raceData.backstories[i];
                        break;
                    }
                }
                if (bs) {
                    if (bs.startingCredits) { _character.inventory.currency = bs.startingCredits; }
                    if (bs.startingItems) {
                        for (var j = 0; j < bs.startingItems.length; j++) {
                            _character.inventory.backpack.push({ itemId: bs.startingItems[j], quantity: 1 });
                        }
                    }
                }
            }
        }

        // Auto-equip the best starting weapon and armor from backpack
        var Items = window.Latency.Items || {};
        var bestWeapon = null;
        var bestWeaponIdx = -1;
        var bestArmor = null;
        var bestArmorIdx = -1;
        for (var ei = 0; ei < _character.inventory.backpack.length; ei++) {
            var entry = _character.inventory.backpack[ei];
            var itemDef = Items[entry.itemId];
            if (!itemDef) continue;
            if (itemDef.type === 'weapon' && !bestWeapon) {
                bestWeapon = itemDef;
                bestWeaponIdx = ei;
            }
            if (itemDef.type === 'armor' && !bestArmor) {
                bestArmor = itemDef;
                bestArmorIdx = ei;
            }
        }
        if (bestWeapon) {
            var wEntry = _character.inventory.backpack[bestWeaponIdx];
            wEntry.quantity -= 1;
            if (wEntry.quantity <= 0) _character.inventory.backpack.splice(bestWeaponIdx, 1);
            _character.inventory.equipped.weapon = {
                itemId: bestWeapon.id,
                name: bestWeapon.name,
                type: bestWeapon.type,
                damage: bestWeapon.damage,
                damageStat: bestWeapon.damageStat || 'strength',
                properties: bestWeapon.properties || [],
                value: bestWeapon.value || 0
            };
            // Adjust bestArmorIdx if weapon was before it and got removed
            if (bestArmorIdx > bestWeaponIdx && _character.inventory.backpack.length <= bestArmorIdx) {
                bestArmorIdx = -1; // recalculate
                for (var ai = 0; ai < _character.inventory.backpack.length; ai++) {
                    var aDef = Items[_character.inventory.backpack[ai].itemId];
                    if (aDef && aDef.type === 'armor') { bestArmorIdx = ai; break; }
                }
            }
        }
        if (bestArmor && bestArmorIdx >= 0) {
            var aEntry = _character.inventory.backpack[bestArmorIdx];
            aEntry.quantity -= 1;
            if (aEntry.quantity <= 0) _character.inventory.backpack.splice(bestArmorIdx, 1);
            _character.inventory.equipped.armor = {
                itemId: bestArmor.id,
                name: bestArmor.name,
                type: bestArmor.type,
                armor: bestArmor.armorBonus || 0,
                properties: bestArmor.properties || [],
                value: bestArmor.value || 0
            };
        }

        recalculateDerived();

        // Full HP/stamina on creation
        _character.derived.currentHp      = _character.derived.maxHp;
        _character.derived.currentStamina = _character.derived.maxStamina;

        bus().emit('character:created', { character: _character });

        return _character;
    }

    // ---------------------------------------------------------------
    //  Accessors
    // ---------------------------------------------------------------

    /** Return the current character object (or null). */
    function getCharacter() {
        return _character;
    }

    /** Replace the character object wholesale and recalculate derived stats. */
    function setCharacter(charObj) {
        _character = charObj;
        recalculateDerived();
    }

    // ---------------------------------------------------------------
    //  Stat helpers
    // ---------------------------------------------------------------

    /**
     * D&D-style modifier: floor((stat - 10) / 2).
     * @param {string} statName  Key in _character.stats.
     * @returns {number}
     */
    function getStatModifier(statName) {
        if (!_character || _character.stats[statName] === undefined) {
            return 0;
        }
        return Math.floor((_character.stats[statName] - 10) / 2);
    }

    /**
     * Adjust a stat by a signed delta and emit stat:change.
     * @param {string} statName  Key in _character.stats.
     * @param {number} delta     Amount to add (may be negative).
     */
    function modifyStat(statName, delta) {
        if (!_character || _character.stats[statName] === undefined) {
            return;
        }

        var oldValue = _character.stats[statName];
        _character.stats[statName] += delta;
        var newValue = _character.stats[statName];

        recalculateDerived();

        bus().emit('stat:change', {
            stat: statName,
            oldValue: oldValue,
            newValue: newValue,
            delta: delta
        });
    }

    // ---------------------------------------------------------------
    //  Derived-stat recalculation
    // ---------------------------------------------------------------

    function recalculateDerived() {
        if (!_character) { return; }

        var stats   = _character.stats;
        var derived = _character.derived;
        var level   = _character.level;

        // --- Base formulae ---
        var baseMaxHp      = 10 + (stats.constitution - 10) * 3 + level * 5;
        var baseMaxStamina = 10 + (stats.dexterity - 10)    * 2 + level * 3;
        var baseArmor      = 0;
        var baseInitiative = getStatModifier('dexterity') + Math.floor(getStatModifier('luck') / 2);

        // --- Equipment armor ---
        var equipped = _character.inventory.equipped;
        var slots = ['weapon', 'armor', 'accessory1', 'accessory2', 'stack'];
        for (var s = 0; s < slots.length; s++) {
            var item = equipped[slots[s]];
            if (item && typeof item.armor === 'number') {
                baseArmor += item.armor;
            }
        }

        // --- Trait bonuses ---
        var hpBonus      = sumTraitEffects('hp_bonus');
        var staminaBonus = sumTraitEffects('stamina_bonus');
        var armorBonus   = sumTraitEffects('armor_bonus');
        var initBonus    = sumTraitEffects('initiative_bonus');

        derived.maxHp      = Math.max(1, baseMaxHp + hpBonus);
        derived.maxStamina = Math.max(0, baseMaxStamina + staminaBonus);
        derived.armor      = baseArmor + armorBonus;
        derived.initiative = baseInitiative + initBonus;

        // Clamp current values to new maximums
        if (derived.currentHp > derived.maxHp) {
            derived.currentHp = derived.maxHp;
        }
        if (derived.currentStamina > derived.maxStamina) {
            derived.currentStamina = derived.maxStamina;
        }
    }

    /**
     * Internal helper: sum all numeric effects of a given type across every
     * active trait on the character.
     */
    function sumTraitEffects(effectType) {
        var total = 0;
        if (!_character || !_character.traits) { return total; }

        var Traits = window.Latency.Traits;
        if (!Traits) { return total; }

        for (var i = 0; i < _character.traits.length; i++) {
            var traitData = Traits[_character.traits[i]];
            if (traitData && traitData.effects) {
                for (var j = 0; j < traitData.effects.length; j++) {
                    var eff = traitData.effects[j];
                    if (eff.type === effectType && typeof eff.value === 'number') {
                        total += eff.value;
                    }
                }
            }
        }
        return total;
    }

    // ---------------------------------------------------------------
    //  HP management
    // ---------------------------------------------------------------

    /**
     * Apply damage to the character. Damage cannot reduce HP below 0.
     * Emits hp:change and, if HP reaches 0, character:died.
     * @param {number} amount  Positive damage value.
     */
    function takeDamage(amount) {
        if (!_character || amount <= 0) { return; }

        var derived = _character.derived;
        var oldHp   = derived.currentHp;

        derived.currentHp = Math.max(0, derived.currentHp - amount);

        bus().emit('hp:change', {
            oldHp: oldHp,
            newHp: derived.currentHp,
            maxHp: derived.maxHp,
            amount: amount,
            type: 'damage'
        });

        if (derived.currentHp <= 0) {
            _character.deathCount++;
            bus().emit('character:died', { character: _character });
        }
    }

    /**
     * Heal the character. Cannot exceed maxHp.
     * @param {number} amount  Positive heal value.
     */
    function heal(amount) {
        if (!_character || amount <= 0) { return; }

        var derived = _character.derived;
        var oldHp   = derived.currentHp;

        derived.currentHp = Math.min(derived.maxHp, derived.currentHp + amount);

        bus().emit('hp:change', {
            oldHp: oldHp,
            newHp: derived.currentHp,
            maxHp: derived.maxHp,
            amount: amount,
            type: 'heal'
        });
    }

    /**
     * Spend stamina. Returns true if the character had enough, false otherwise.
     * @param {number} amount  Positive stamina cost.
     * @returns {boolean}
     */
    function useStamina(amount) {
        if (!_character || amount <= 0) { return false; }

        var derived = _character.derived;
        if (derived.currentStamina < amount) {
            return false;
        }

        var oldStamina = derived.currentStamina;
        derived.currentStamina -= amount;

        bus().emit('stamina:change', {
            oldStamina: oldStamina,
            newStamina: derived.currentStamina,
            maxStamina: derived.maxStamina,
            amount: amount,
            type: 'use'
        });

        return true;
    }

    /**
     * Restore stamina. Cannot exceed maxStamina.
     * @param {number} amount  Positive restore value.
     */
    function restoreStamina(amount) {
        if (!_character || amount <= 0) { return; }

        var derived    = _character.derived;
        var oldStamina = derived.currentStamina;

        derived.currentStamina = Math.min(derived.maxStamina, derived.currentStamina + amount);

        bus().emit('stamina:change', {
            oldStamina: oldStamina,
            newStamina: derived.currentStamina,
            maxStamina: derived.maxStamina,
            amount: amount,
            type: 'restore'
        });
    }

    /** @returns {boolean} True if the character exists and has HP > 0. */
    function isAlive() {
        return _character !== null && _character.derived.currentHp > 0;
    }

    // ---------------------------------------------------------------
    //  Experience & Leveling
    // ---------------------------------------------------------------

    /**
     * Grant experience points (after applying xp_modifier traits).
     * Automatically triggers level-ups when the threshold is reached.
     * @param {number} amount  Base XP to grant (before modifiers).
     */
    function addExperience(amount) {
        if (!_character || amount <= 0) { return; }

        // Apply xp_modifier trait effects (additive %)
        var xpMod      = sumTraitEffects('xp_modifier');   // e.g. 0.10 means +10 %
        var finalAmount = Math.round(amount * (1 + xpMod));
        if (finalAmount < 1) { finalAmount = 1; }

        _character.experience += finalAmount;

        // Level-up loop (handles multi-level jumps from large XP grants)
        while (_character.experience >= _character.experienceToLevel) {
            _character.experience -= _character.experienceToLevel;

            var oldLevel = _character.level;
            _character.level++;

            // Next threshold: 100 * level * 1.5
            _character.experienceToLevel = Math.floor(100 * _character.level * 1.5);

            // Level-up stat boosts
            _character.derived.maxHp      += 5;
            _character.derived.currentHp  += 5;
            _character.derived.maxStamina += 3;
            _character.derived.currentStamina += 3;

            recalculateDerived();

            // Restore to full on level up
            _character.derived.currentHp      = _character.derived.maxHp;
            _character.derived.currentStamina = _character.derived.maxStamina;

            bus().emit('levelup', {
                level: _character.level,
                oldLevel: oldLevel
            });
        }
    }

    // ---------------------------------------------------------------
    //  Traits
    // ---------------------------------------------------------------

    /**
     * Add a trait to the character if not already present.
     * @param {string} traitId  Key into Latency.Traits.
     */
    function addTrait(traitId) {
        if (!_character) { return; }
        if (hasTrait(traitId)) { return; }

        _character.traits.push(traitId);
        recalculateDerived();

        var traitData = window.Latency.Traits ? window.Latency.Traits[traitId] : null;
        bus().emit('trait:add', { traitId: traitId, trait: traitData || null });
    }

    /**
     * Remove a trait from the character.
     * @param {string} traitId  Key into Latency.Traits.
     */
    function removeTrait(traitId) {
        if (!_character) { return; }

        var idx = _character.traits.indexOf(traitId);
        if (idx === -1) { return; }

        _character.traits.splice(idx, 1);
        recalculateDerived();

        var traitData = window.Latency.Traits ? window.Latency.Traits[traitId] : null;
        bus().emit('trait:remove', { traitId: traitId, trait: traitData || null });
    }

    /**
     * Check whether the character currently has a trait.
     * @param {string} traitId
     * @returns {boolean}
     */
    function hasTrait(traitId) {
        if (!_character) { return false; }
        return _character.traits.indexOf(traitId) !== -1;
    }

    /**
     * Collect every effect of a given type across all of the character's traits.
     * Returns an array of effect objects.
     * @param {string} effectType  e.g. 'hp_bonus', 'xp_modifier', etc.
     * @returns {Array<Object>}
     */
    function getTraitEffects(effectType) {
        var results = [];
        if (!_character || !_character.traits) { return results; }

        var Traits = window.Latency.Traits;
        if (!Traits) { return results; }

        for (var i = 0; i < _character.traits.length; i++) {
            var traitData = Traits[_character.traits[i]];
            if (traitData && traitData.effects) {
                for (var j = 0; j < traitData.effects.length; j++) {
                    var eff = traitData.effects[j];
                    if (eff.type === effectType) {
                        results.push(eff);
                    }
                }
            }
        }
        return results;
    }

    // ---------------------------------------------------------------
    //  Reputation
    // ---------------------------------------------------------------

    /**
     * Modify reputation with a faction. Clamped to [-100, 100].
     * @param {string} factionId  Key in _character.reputation.
     * @param {number} delta      Signed change.
     */
    function modifyReputation(factionId, delta) {
        if (!_character) { return; }
        if (_character.reputation[factionId] === undefined) { return; }

        var oldValue = _character.reputation[factionId];
        _character.reputation[factionId] = Math.max(-100, Math.min(100, oldValue + delta));
        var newValue = _character.reputation[factionId];

        bus().emit('faction:change', {
            factionId: factionId,
            oldValue: oldValue,
            newValue: newValue,
            delta: delta,
            tier: getReputationTier(factionId)
        });
    }

    /**
     * Return a human-readable reputation tier for a faction.
     *   -100 .. -51  hostile
     *    -50 .. -11  unfriendly
     *    -10 ..  10  neutral
     *     11 ..  50  friendly
     *     51 .. 100  allied
     * @param {string} factionId
     * @returns {string}
     */
    function getReputationTier(factionId) {
        if (!_character || _character.reputation[factionId] === undefined) {
            return 'neutral';
        }

        var val = _character.reputation[factionId];
        if (val <= -51) { return 'hostile'; }
        if (val <= -11) { return 'unfriendly'; }
        if (val <=  10) { return 'neutral'; }
        if (val <=  50) { return 'friendly'; }
        return 'allied';
    }

    // ---------------------------------------------------------------
    //  Serialization
    // ---------------------------------------------------------------

    /** Deep-clone the character for save data. */
    function serialize() {
        if (!_character) { return null; }
        return JSON.parse(JSON.stringify(_character));
    }

    /** Restore a character from save data and recalculate derived stats. */
    function deserialize(data) {
        _character = data;
        recalculateDerived();
    }

    // ---------------------------------------------------------------
    //  Public API
    // ---------------------------------------------------------------

    return {
        create:            create,
        getCharacter:      getCharacter,
        setCharacter:      setCharacter,

        getStatModifier:   getStatModifier,
        modifyStat:        modifyStat,

        recalculateDerived: recalculateDerived,

        takeDamage:        takeDamage,
        heal:              heal,
        useStamina:        useStamina,
        restoreStamina:    restoreStamina,
        isAlive:           isAlive,

        addExperience:     addExperience,

        addTrait:          addTrait,
        removeTrait:       removeTrait,
        hasTrait:          hasTrait,
        getTraitEffects:   getTraitEffects,

        modifyReputation:  modifyReputation,
        getReputationTier: getReputationTier,

        serialize:         serialize,
        deserialize:       deserialize
    };
})();
