/**
 * LATENCY - Combat System
 * ============================================================
 * Full turn-based combat engine using D&D-style d20 mechanics.
 * Manages combat state, player/enemy actions, status effects,
 * initiative, and victory/defeat resolution.
 *
 * Dependencies:
 *   - window.Latency.EventBus        (publish/subscribe messaging)
 *   - window.Latency.CharacterSystem  (player stats, HP, stamina)
 *   - window.Latency.Dice             (dice rolling engine)
 *   - window.Latency.Enemies          (enemy data tables)
 *   - window.Latency.Items            (item data tables)
 *
 * Events emitted:
 *   combat:start       { state }
 *   combat:end         { result: 'victory'|'defeat'|'fled', xp, loot, credits }
 *   combat:turn        { turn, phase }
 *   combat:log         { text, type }
 *   combat:action      { actor: 'player'|'enemy', action, result }
 *   combat:stateChange { state }
 *   dice:roll          { sides, result, purpose, success, crit }
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.Combat = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Lazy dependency resolution
    // -------------------------------------------------------------------

    var _bus = null;
    function bus() {
        if (!_bus) { _bus = window.Latency.EventBus; }
        return _bus;
    }

    function Dice() { return window.Latency.Dice; }
    function CS() { return window.Latency.CharacterSystem; }

    // -------------------------------------------------------------------
    // Internal state
    // -------------------------------------------------------------------

    /**
     * null when not in combat. Structure:
     * {
     *   player: { name, level, stats, derived, weapon, abilities, traits, inventory },
     *   enemy:  { id, name, level, hp, maxHp, stats, abilities, weapon, loot, ai, armor, xp, description },
     *   turn: 0,
     *   phase: 'player' | 'enemy' | 'resolving' | 'victory' | 'defeat',
     *   log: [],
     *   playerCooldowns: {},
     *   enemyCooldowns: {},
     *   statusEffects: { player: [], enemy: [] },
     *   playerDefending: false,
     *   playerStunned: false,
     *   enemyStunned: false,
     *   returnNodeId: null
     * }
     */
    var _state = null;

    // -------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------

    var ENEMY_TURN_DELAY = 800; // ms before enemy acts (for dramatic pacing)

    // -------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------

    function _getStatMod(stats, statName) {
        var val = stats[statName] || 10;
        return Math.floor((val - 10) / 2);
    }

    function _clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function _log(text, type) {
        if (!_state) return;
        type = type || 'info';
        var entry = { text: text, type: type };
        _state.log.push(entry);
        bus().emit('combat:log', entry);
    }

    function _emitStateChange() {
        if (_state) {
            bus().emit('combat:stateChange', { state: _state });
        }
    }

    function _getPlayerWeapon() {
        var char = CS().getCharacter();
        if (char && char.inventory && char.inventory.equipped && char.inventory.equipped.weapon) {
            return char.inventory.equipped.weapon;
        }
        // Unarmed fallback
        return { name: 'Fists', damage: '1d4', damageStat: 'strength', stat: 'strength' };
    }

    function _getPlayerArmor() {
        var char = CS().getCharacter();
        if (!char) return 10;
        var baseArmor = 10 + _getStatMod(char.stats, 'dexterity');
        var armorBonus = char.derived ? char.derived.armor : 0;
        return baseArmor + armorBonus;
    }

    /**
     * Parse a weapon damage stat - weapons in enemies use 'stat',
     * items in the items table use 'damageStat'.
     */
    function _getWeaponStat(weapon) {
        return weapon.damageStat || weapon.stat || 'strength';
    }

    /**
     * Determine the attack stat for a weapon.
     * Melee uses STR, ranged/finesse uses DEX, tech uses TECH.
     */
    function _getAttackStat(weapon) {
        var dmgStat = _getWeaponStat(weapon);
        if (dmgStat === 'tech') return 'tech';
        if (dmgStat === 'dexterity') return 'dexterity';
        if (dmgStat === 'intelligence') return 'intelligence';
        return 'strength';
    }

    function _delay(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    // -------------------------------------------------------------------
    // Combat initiation
    // -------------------------------------------------------------------

    /**
     * Start a combat encounter.
     * @param {string} enemyId - Key into Latency.Enemies
     * @param {Object} [context] - Optional context
     * @param {string} [context.returnNodeId] - Story node to return to after combat
     * @returns {Object} The combat state
     */
    function initiate(enemyId, context) {
        context = context || {};

        var enemyData = window.Latency.Enemies[enemyId];
        if (!enemyData) {
            console.error('[Combat] Unknown enemy: ' + enemyId);
            return null;
        }

        var char = CS().getCharacter();
        if (!char) {
            console.error('[Combat] No character exists.');
            return null;
        }

        // Build enemy instance (deep copy to avoid mutating data)
        var enemy = {
            id: enemyData.id,
            name: enemyData.name,
            level: enemyData.level,
            hp: enemyData.maxHp,
            maxHp: enemyData.maxHp,
            stats: JSON.parse(JSON.stringify(enemyData.stats)),
            abilities: enemyData.abilities ? enemyData.abilities.slice() : [],
            weapon: JSON.parse(JSON.stringify(enemyData.weapon)),
            loot: JSON.parse(JSON.stringify(enemyData.loot || { credits: [0, 0], items: [] })),
            ai: enemyData.ai || 'aggressive',
            armor: enemyData.armor || 10,
            xp: enemyData.xp || 0,
            description: enemyData.description || ''
        };

        // Build player snapshot
        var player = {
            name: char.name,
            level: char.level,
            stats: JSON.parse(JSON.stringify(char.stats)),
            derived: JSON.parse(JSON.stringify(char.derived)),
            weapon: _getPlayerWeapon(),
            abilities: char.activeAbilities ? char.activeAbilities.slice() : [],
            traits: char.traits ? char.traits.slice() : []
        };

        // Create state
        _state = {
            player: player,
            enemy: enemy,
            turn: 0,
            phase: 'resolving',
            log: [],
            playerCooldowns: {},
            enemyCooldowns: {},
            statusEffects: { player: [], enemy: [] },
            playerDefending: false,
            playerStunned: false,
            enemyStunned: false,
            returnNodeId: context.returnNodeId || null,
            onFleeNodeId: context.onFleeNodeId || null,
            onLoseNodeId: context.onLoseNodeId || null
        };

        // Roll initiative
        var playerInitMod = _getStatMod(char.stats, 'dexterity') +
                            Math.floor(_getStatMod(char.stats, 'luck') / 2);
        var enemyInitMod = _getStatMod(enemy.stats, 'dexterity');

        var playerInitRoll = Dice().roll(20);
        var enemyInitRoll = Dice().roll(20);

        var playerInit = playerInitRoll + playerInitMod;
        var enemyInit = enemyInitRoll + enemyInitMod;

        _log('--- COMBAT INITIATED ---', 'info');
        _log('You face ' + enemy.name + '!', 'info');
        _log('Initiative: You [d20: ' + playerInitRoll + '+' + playerInitMod + '=' + playerInit + '] vs ' +
             enemy.name + ' [d20: ' + enemyInitRoll + '+' + enemyInitMod + '=' + enemyInit + ']', 'info');

        bus().emit('dice:roll', {
            sides: 20, result: playerInitRoll, purpose: 'initiative',
            success: playerInit >= enemyInit, crit: false
        });

        if (playerInit >= enemyInit) {
            _state.phase = 'player';
            _log('You act first!', 'info');
        } else {
            _state.phase = 'enemy';
            _log(enemy.name + ' acts first!', 'info');
        }

        _state.turn = 1;

        bus().emit('combat:start', { state: _state });
        bus().emit('combat:turn', { turn: _state.turn, phase: _state.phase });
        _emitStateChange();

        // If enemy goes first, schedule enemy turn
        if (_state.phase === 'enemy') {
            _scheduleEnemyTurn();
        }

        return _state;
    }

    // -------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------

    function getState() { return _state; }
    function isInCombat() { return _state !== null; }

    // -------------------------------------------------------------------
    // Player actions
    // -------------------------------------------------------------------

    function playerAttack() {
        if (!_state || _state.phase !== 'player') return;

        if (_state.playerStunned) {
            _log('You are stunned and cannot act!', 'status');
            _state.playerStunned = false;
            _advanceToEnemyTurn();
            return;
        }

        _state.phase = 'resolving';
        _state.playerDefending = false;
        _emitStateChange();

        var weapon = _state.player.weapon;
        var attackStat = _getAttackStat(weapon);
        var attackMod = _getStatMod(_state.player.stats, attackStat);
        var attackRoll = Dice().roll(20);
        var attackTotal = attackRoll + attackMod;

        var isNat20 = attackRoll === 20;
        var isNat1 = attackRoll === 1;

        bus().emit('dice:roll', {
            sides: 20, result: attackRoll, purpose: 'attack',
            success: isNat20 || (!isNat1 && attackTotal >= _state.enemy.armor),
            crit: isNat20
        });

        // Natural 1: Fumble
        if (isNat1) {
            _log('You attack with ' + weapon.name + '... [d20: ' + attackRoll +
                 '+' + attackMod + '=' + attackTotal + '] FUMBLE!', 'miss');
            _log('You stumble! You lose your next turn.', 'status');
            _state.playerStunned = true;
            bus().emit('combat:action', { actor: 'player', action: 'attack', result: 'fumble' });
            _advanceToEnemyTurn();
            return;
        }

        // Check hit vs armor
        if (!isNat20 && attackTotal < _state.enemy.armor) {
            _log('You attack with ' + weapon.name + '... [d20: ' + attackRoll +
                 '+' + attackMod + '=' + attackTotal + ' vs AC ' + _state.enemy.armor + '] MISS!', 'miss');
            bus().emit('combat:action', { actor: 'player', action: 'attack', result: 'miss' });
            _advanceToEnemyTurn();
            return;
        }

        // Hit! Roll damage
        var damageStat = _getWeaponStat(weapon);
        var damageMod = _getStatMod(_state.player.stats, damageStat);
        var damageResult = Dice().damageRoll(weapon.damage, damageMod);

        if (!damageResult) {
            damageResult = { rolls: [1], total: 1 + damageMod, diceTotal: 1, modifier: damageMod };
        }

        var totalDamage = damageResult.total;

        // Critical: double the dice (not modifier)
        if (isNat20) {
            var critBonus = damageResult.diceTotal; // add dice total again
            totalDamage += critBonus;
            _log('You attack with ' + weapon.name + '... [d20: ' + attackRoll +
                 '+' + attackMod + '=' + attackTotal + '] CRITICAL HIT!', 'crit');
            _log('Damage: [' + weapon.damage + ': ' + damageResult.rolls.join('+') +
                 '+' + damageMod + '] x2 dice = ' + totalDamage + ' damage!', 'crit');
        } else {
            _log('You attack with ' + weapon.name + '... [d20: ' + attackRoll +
                 '+' + attackMod + '=' + attackTotal + ' vs AC ' + _state.enemy.armor + '] HIT!', 'hit');
            _log('Damage: [' + weapon.damage + ': ' + damageResult.rolls.join('+') +
                 '+' + damageMod + '] = ' + totalDamage + ' damage.', 'hit');
        }

        // Ensure minimum 1 damage on a hit
        if (totalDamage < 1) totalDamage = 1;

        _applyDamageToEnemy(totalDamage);

        bus().emit('dice:roll', {
            sides: Dice().parseDiceString(weapon.damage).sides,
            result: damageResult.rolls[0],
            purpose: 'damage',
            success: true,
            crit: isNat20
        });

        bus().emit('combat:action', {
            actor: 'player', action: 'attack',
            result: isNat20 ? 'crit' : 'hit',
            damage: totalDamage
        });

        if (!_checkVictory()) {
            _advanceToEnemyTurn();
        }
    }

    function playerDefend() {
        if (!_state || _state.phase !== 'player') return;

        if (_state.playerStunned) {
            _log('You are stunned and cannot act!', 'status');
            _state.playerStunned = false;
            _advanceToEnemyTurn();
            return;
        }

        _state.phase = 'resolving';
        _state.playerDefending = true;
        _emitStateChange();

        // +4 AC until next turn
        _log('You brace yourself and take a defensive stance. (+4 AC)', 'info');

        // Recover stamina: 1d4
        var staminaRoll = Dice().roll(4);
        CS().restoreStamina(staminaRoll);

        // Sync state
        var char = CS().getCharacter();
        if (char) {
            _state.player.derived = JSON.parse(JSON.stringify(char.derived));
        }

        _log('You catch your breath and recover ' + staminaRoll + ' stamina.', 'heal');

        bus().emit('combat:action', { actor: 'player', action: 'defend', result: 'defend' });

        _advanceToEnemyTurn();
    }

    function playerUseAbility(abilityIndex) {
        if (!_state || _state.phase !== 'player') return;

        if (_state.playerStunned) {
            _log('You are stunned and cannot act!', 'status');
            _state.playerStunned = false;
            _advanceToEnemyTurn();
            return;
        }

        var abilities = _state.player.abilities;
        if (!abilities || abilityIndex < 0 || abilityIndex >= abilities.length) {
            _log('Invalid ability.', 'info');
            return;
        }

        var abilityId = abilities[abilityIndex];

        // Check cooldown
        if (_state.playerCooldowns[abilityId] && _state.playerCooldowns[abilityId] > 0) {
            _log('That ability is on cooldown (' + _state.playerCooldowns[abilityId] + ' turns).', 'info');
            return;
        }

        _state.phase = 'resolving';
        _state.playerDefending = false;
        _emitStateChange();

        // Resolve ability by type
        var resolved = _resolveAbility(abilityId, 'player');

        if (resolved) {
            if (!_checkVictory()) {
                _advanceToEnemyTurn();
            }
        } else {
            // Ability failed to resolve (not enough stamina, etc.) - restore phase
            _state.phase = 'player';
            _emitStateChange();
        }
    }

    function playerUseItem(itemId) {
        if (!_state || _state.phase !== 'player') return;

        if (_state.playerStunned) {
            _log('You are stunned and cannot act!', 'status');
            _state.playerStunned = false;
            _advanceToEnemyTurn();
            return;
        }

        var char = CS().getCharacter();
        if (!char || !char.inventory || !char.inventory.backpack) {
            _log('No items available.', 'info');
            return;
        }

        // Find item in backpack
        var backpack = char.inventory.backpack;
        var itemIndex = -1;
        for (var i = 0; i < backpack.length; i++) {
            var bpItem = backpack[i];
            if (typeof bpItem === 'string') {
                if (bpItem === itemId) { itemIndex = i; break; }
            } else if (bpItem.itemId === itemId) {
                itemIndex = i; break;
            }
        }

        if (itemIndex === -1) {
            _log('Item not found in inventory.', 'info');
            return;
        }

        // Look up item data
        var itemData = window.Latency.Items ? window.Latency.Items[itemId] : null;
        if (!itemData) {
            _log('Unknown item.', 'info');
            return;
        }

        if (itemData.type !== 'consumable') {
            _log('You cannot use that item in combat.', 'info');
            return;
        }

        _state.phase = 'resolving';
        _state.playerDefending = false;
        _emitStateChange();

        // Apply item effect
        var effect = itemData.effect;
        if (!effect) {
            _log('The item has no effect.', 'info');
            _state.phase = 'player';
            _emitStateChange();
            return;
        }

        // Remove from inventory via Inventory API
        if (window.Latency.Inventory && window.Latency.Inventory.removeItem) {
            window.Latency.Inventory.removeItem(itemId, 1);
        }

        _log('You use ' + itemData.name + '.', 'info');

        if (effect.type === 'heal') {
            var healAmount = effect.value;
            CS().heal(healAmount);
            var charAfter = CS().getCharacter();
            _state.player.derived = JSON.parse(JSON.stringify(charAfter.derived));
            _log('You recover ' + healAmount + ' HP!', 'heal');
        } else if (effect.type === 'heal_over_time') {
            _state.statusEffects.player.push({
                id: 'regen_' + itemId,
                name: itemData.name + ' (Regen)',
                type: 'regen',
                value: effect.value,
                duration: effect.duration,
                turnsLeft: effect.duration
            });
            _log('Regeneration: +' + effect.value + ' HP per turn for ' + effect.duration + ' turns.', 'heal');
        } else if (effect.type === 'buff') {
            _state.statusEffects.player.push({
                id: 'buff_' + effect.stat,
                name: itemData.name,
                type: 'buff',
                stat: effect.stat,
                value: effect.value,
                duration: effect.duration,
                turnsLeft: effect.duration
            });
            _state.player.stats[effect.stat] = (_state.player.stats[effect.stat] || 10) + effect.value;
            _log(effect.stat.charAt(0).toUpperCase() + effect.stat.slice(1) + ' +'
                 + effect.value + ' for ' + effect.duration + ' turns!', 'status');
        } else if (effect.type === 'buff_multi') {
            for (var s = 0; s < effect.stats.length; s++) {
                var statName = effect.stats[s];
                _state.statusEffects.player.push({
                    id: 'buff_' + statName + '_' + Date.now(),
                    name: itemData.name,
                    type: 'buff',
                    stat: statName,
                    value: effect.value,
                    duration: effect.duration,
                    turnsLeft: effect.duration
                });
                _state.player.stats[statName] = (_state.player.stats[statName] || 10) + effect.value;
            }
            _log('Multiple stats boosted for ' + effect.duration + ' turns!', 'status');
        } else if (effect.type === 'buff_complex') {
            for (var b = 0; b < effect.buffs.length; b++) {
                var buff = effect.buffs[b];
                _state.statusEffects.player.push({
                    id: 'buff_' + buff.stat + '_' + Date.now(),
                    name: itemData.name,
                    type: 'buff',
                    stat: buff.stat,
                    value: buff.value,
                    duration: effect.duration,
                    turnsLeft: effect.duration
                });
                _state.player.stats[buff.stat] = (_state.player.stats[buff.stat] || 10) + buff.value;
            }
            _log('Complex buff applied for ' + effect.duration + ' turns!', 'status');
        } else if (effect.type === 'cure') {
            // Remove matching status effects
            var removed = _removeStatusEffects('player', effect.condition);
            if (removed > 0) {
                _log('Cured ' + effect.condition + '!', 'heal');
            } else {
                _log('No matching condition to cure.', 'info');
            }
        }

        bus().emit('combat:action', { actor: 'player', action: 'item', result: 'used', itemId: itemId });

        if (!_checkVictory()) {
            _advanceToEnemyTurn();
        }
    }

    function playerFlee() {
        if (!_state || _state.phase !== 'player') return;

        if (_state.playerStunned) {
            _log('You are stunned and cannot act!', 'status');
            _state.playerStunned = false;
            _advanceToEnemyTurn();
            return;
        }

        _state.phase = 'resolving';
        _state.playerDefending = false;
        _emitStateChange();

        // DEX check: DC = 12 + enemy level
        var dc = 12 + _state.enemy.level;
        var dexValue = _state.player.stats.dexterity || 10;
        var checkResult = Dice().statCheck(dexValue, dc);

        bus().emit('dice:roll', {
            sides: 20, result: checkResult.roll, purpose: 'flee',
            success: checkResult.success, crit: checkResult.critSuccess
        });

        _log('You attempt to flee! [d20: ' + checkResult.roll + '+' + checkResult.modifier +
             '=' + checkResult.total + ' vs DC ' + dc + ']', 'info');

        if (checkResult.success) {
            _log('You successfully disengage and escape!', 'info');
            bus().emit('combat:action', { actor: 'player', action: 'flee', result: 'success' });
            bus().emit('combat:end', {
                result: 'fled',
                xp: 0,
                loot: [],
                credits: 0
            });
            _cleanup();
            return;
        }

        _log('You fail to escape! ' + _state.enemy.name + ' gets a free attack!', 'miss');
        bus().emit('combat:action', { actor: 'player', action: 'flee', result: 'fail' });

        // Enemy gets a free attack
        _enemyAttack();

        if (!_checkDefeat()) {
            _advanceToPlayerTurn();
        }
    }

    // -------------------------------------------------------------------
    // Ability resolution
    // -------------------------------------------------------------------

    /**
     * Resolve an ability for the given actor.
     * Returns true if the ability was successfully used.
     */
    function _resolveAbility(abilityId, actor) {
        var isPlayer = actor === 'player';
        var actorStats = isPlayer ? _state.player.stats : _state.enemy.stats;
        var targetHp = isPlayer ? _state.enemy.hp : CS().getCharacter().derived.currentHp;

        // Stamina cost for player abilities: 5 base
        var staminaCost = 5;
        if (isPlayer) {
            if (!CS().useStamina(staminaCost)) {
                _log('Not enough stamina! (Need ' + staminaCost + ')', 'info');
                return false;
            }
            var charSync = CS().getCharacter();
            _state.player.derived = JSON.parse(JSON.stringify(charSync.derived));
        }

        // Generic ability effects based on common patterns
        var actorName = isPlayer ? 'You' : _state.enemy.name;
        var targetName = isPlayer ? _state.enemy.name : 'you';

        // Set cooldown (3 turns)
        var cooldowns = isPlayer ? _state.playerCooldowns : _state.enemyCooldowns;
        cooldowns[abilityId] = 3;

        // Resolve based on ability ID patterns
        if (_isAttackAbility(abilityId)) {
            // Offensive ability: deal enhanced damage
            var atkStat = _getBestAttackStat(actorStats);
            var atkMod = _getStatMod(actorStats, atkStat);
            var atkRoll = Dice().roll(20);
            var atkTotal = atkRoll + atkMod + 2; // +2 ability bonus
            var targetAC = isPlayer ? _state.enemy.armor : _getPlayerArmorWithDefend();
            var isNat20 = atkRoll === 20;
            var isNat1 = atkRoll === 1;

            bus().emit('dice:roll', {
                sides: 20, result: atkRoll, purpose: 'ability_attack',
                success: isNat20 || (!isNat1 && atkTotal >= targetAC),
                crit: isNat20
            });

            if (isNat1 || (!isNat20 && atkTotal < targetAC)) {
                _log(actorName + ' use ' + _formatAbilityName(abilityId) +
                     '! [d20: ' + atkRoll + '+' + (atkMod + 2) + '=' + atkTotal + '] MISS!', 'miss');
                return true;
            }

            // Ability damage: 2d8 + stat mod
            var abilDamage = Dice().rollMultiple(2, 8, atkMod);
            var totalAbilDamage = abilDamage.total;
            if (isNat20) {
                totalAbilDamage += abilDamage.total - atkMod; // double dice
            }
            if (totalAbilDamage < 1) totalAbilDamage = 1;

            var hitType = isNat20 ? 'crit' : 'hit';
            _log(actorName + ' use ' + _formatAbilityName(abilityId) +
                 '! [d20: ' + atkRoll + '+' + (atkMod + 2) + '=' + atkTotal + '] ' +
                 (isNat20 ? 'CRITICAL!' : 'HIT!'), hitType);
            _log('Damage: [2d8: ' + abilDamage.rolls.join('+') + '+' + atkMod + '] = '
                 + totalAbilDamage, hitType);

            if (isPlayer) {
                _applyDamageToEnemy(totalAbilDamage);
            } else {
                _applyDamageToPlayer(totalAbilDamage);
            }

        } else if (_isHealAbility(abilityId)) {
            // Healing ability
            var healRoll = Dice().rollMultiple(2, 6, 0);
            var healAmount = healRoll.total;

            if (isPlayer) {
                CS().heal(healAmount);
                var charH = CS().getCharacter();
                _state.player.derived = JSON.parse(JSON.stringify(charH.derived));
            } else {
                _state.enemy.hp = Math.min(_state.enemy.maxHp, _state.enemy.hp + healAmount);
            }

            _log(actorName + ' use ' + _formatAbilityName(abilityId) +
                 '! Recovered ' + healAmount + ' HP.', 'heal');

        } else if (_isBuffAbility(abilityId)) {
            // Buff/defensive ability
            var effects = isPlayer ? _state.statusEffects.player : _state.statusEffects.enemy;
            effects.push({
                id: abilityId,
                name: _formatAbilityName(abilityId),
                type: 'buff',
                stat: 'armor_bonus',
                value: 3,
                duration: 3,
                turnsLeft: 3
            });
            _log(actorName + ' use ' + _formatAbilityName(abilityId) +
                 '! Defense increased for 3 turns.', 'status');

        } else if (_isDebuffAbility(abilityId)) {
            // Debuff/status ability
            var targetEffects = isPlayer ? _state.statusEffects.enemy : _state.statusEffects.player;
            targetEffects.push({
                id: abilityId,
                name: _formatAbilityName(abilityId),
                type: 'debuff',
                stat: 'armor_penalty',
                value: -2,
                duration: 3,
                turnsLeft: 3
            });
            _log(actorName + ' use ' + _formatAbilityName(abilityId) +
                 '! ' + (isPlayer ? _state.enemy.name : 'Your') + ' defenses weakened!', 'status');

        } else if (_isStunAbility(abilityId)) {
            // Stun attempt
            var stunDC = 12 + _getStatMod(actorStats, 'intelligence');
            var targetCon = isPlayer ? _state.enemy.stats.constitution : _state.player.stats.constitution;
            var stunCheck = Dice().statCheck(targetCon, stunDC);

            bus().emit('dice:roll', {
                sides: 20, result: stunCheck.roll, purpose: 'stun_resist',
                success: stunCheck.success, crit: false
            });

            if (!stunCheck.success) {
                if (isPlayer) {
                    _state.enemyStunned = true;
                } else {
                    _state.playerStunned = true;
                }
                _log(actorName + ' use ' + _formatAbilityName(abilityId) +
                     '! ' + (isPlayer ? _state.enemy.name + ' is' : 'You are') +
                     ' stunned!', 'status');
            } else {
                _log(actorName + ' use ' + _formatAbilityName(abilityId) +
                     '! ' + (isPlayer ? _state.enemy.name + ' resists' : 'You resist') +
                     ' the effect.', 'info');
            }

        } else {
            // Default: treat as a moderate attack
            var defDmg = Dice().rollMultiple(1, 8, _getStatMod(actorStats, 'intelligence'));
            if (defDmg.total < 1) defDmg.total = 1;

            _log(actorName + ' use ' + _formatAbilityName(abilityId) +
                 '! Deals ' + defDmg.total + ' damage.', 'hit');

            if (isPlayer) {
                _applyDamageToEnemy(defDmg.total);
            } else {
                _applyDamageToPlayer(defDmg.total);
            }
        }

        return true;
    }

    // Ability classification helpers
    function _isAttackAbility(id) {
        var attacks = ['power_attack', 'aimed_shot', 'death_strike', 'void_strike',
                       'champion_strike', 'crushing_blow', 'precise_cut', 'execution_protocol',
                       'reckless_charge', 'ground_slam', 'missile_barrage', 'chain_lightning',
                       'stomp', 'psychic_lance', 'nihil_beam', 'consume_essence',
                       'frag_grenade', 'overload', 'logic_bomb', 'rewrite_reality',
                       'net_launcher', 'suppressing_fire', 'flashbang', 'neon_flash',
                       'void_scream', 'entropy_field', 'unmaking_word', 'desperate_lunge'];
        return attacks.indexOf(id) !== -1;
    }

    function _isHealAbility(id) {
        var heals = ['self_repair', 'second_wind', 'heal_allies', 'regeneration',
                     'rebirth', 'synthetic_resilience', 'harvest'];
        return heals.indexOf(id) !== -1;
    }

    function _isBuffAbility(id) {
        var buffs = ['armored_shell', 'shield_generator', 'shield_of_faith',
                     'take_cover', 'iron_will', 'unbreakable_will', 'tough_hide',
                     'armored_hull', 'firewall', 'energy_shield', 'combat_stim',
                     'duelist_stance', 'evasion', 'adaptive_combat', 'tactical_mastery',
                     'overclock', 'rage', 'thick_skin', 'last_stand', 'counter_attack',
                     'counter_strike', 'riposte', 'shadow_step', 'phase_shift'];
        return buffs.indexOf(id) !== -1;
    }

    function _isDebuffAbility(id) {
        var debuffs = ['intimidate', 'analyze_weakness', 'mark_prey',
                       'stack_drain', 'memory_flood', 'glitch', 'memory_wipe',
                       'stack_override', 'paralyzing_dart', 'poison_blade', 'disease_bite',
                       'dazzling_display', 'existential_dread', 'charm_aura',
                       'system_scan', 'targeting_lock', 'adaptive_targeting', 'tactical_analysis',
                       'blackmail', 'poison_trap', 'smoke_bomb', 'war_cry'];
        return debuffs.indexOf(id) !== -1;
    }

    function _isStunAbility(id) {
        var stuns = ['emp_pulse', 'erratic_movement', 'stun', 'call_backup',
                     'alert_allies', 'vanish', 'phase_reality', 'dimensional_rift',
                     'flee', 'escape_plan', 'body_double', 'summon_drone',
                     'spawn_drones', 'hired_assassins', 'summon_void_stalkers',
                     'sacrifice_minion', 'rally_troops', 'inspire_troops',
                     'command_lesser', 'coordinated_fire', 'tactical_retreat',
                     'battle_cry', 'track'];
        return stuns.indexOf(id) !== -1;
    }

    function _formatAbilityName(id) {
        return id.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    function _getBestAttackStat(stats) {
        var best = 'strength';
        var bestVal = stats.strength || 10;
        var candidates = ['dexterity', 'intelligence', 'tech'];
        for (var i = 0; i < candidates.length; i++) {
            if ((stats[candidates[i]] || 10) > bestVal) {
                best = candidates[i];
                bestVal = stats[candidates[i]];
            }
        }
        return best;
    }

    // -------------------------------------------------------------------
    // Damage application
    // -------------------------------------------------------------------

    function _applyDamageToEnemy(amount) {
        if (!_state) return;
        // Check for armor buffs on enemy
        var bonusArmor = _getStatusEffectTotal('enemy', 'armor_bonus');
        if (bonusArmor > 0) {
            var reduction = Math.floor(amount * (bonusArmor / 20));
            amount = Math.max(1, amount - reduction);
        }
        _state.enemy.hp = Math.max(0, _state.enemy.hp - amount);
        _emitStateChange();
    }

    function _applyDamageToPlayer(amount) {
        if (!_state) return;
        // Check for armor buffs on player
        var bonusArmor = _getStatusEffectTotal('player', 'armor_bonus');
        if (bonusArmor > 0) {
            var reduction = Math.floor(amount * (bonusArmor / 20));
            amount = Math.max(1, amount - reduction);
        }
        CS().takeDamage(amount);
        var char = CS().getCharacter();
        if (char) {
            _state.player.derived = JSON.parse(JSON.stringify(char.derived));
        }
        _emitStateChange();
    }

    function _getPlayerArmorWithDefend() {
        var base = _getPlayerArmor();
        if (_state && _state.playerDefending) {
            base += 4;
        }
        // Add armor buff effects
        base += _getStatusEffectTotal('player', 'armor_bonus');
        return base;
    }

    function _getStatusEffectTotal(actor, type) {
        if (!_state) return 0;
        var effects = _state.statusEffects[actor] || [];
        var total = 0;
        for (var i = 0; i < effects.length; i++) {
            if (effects[i].stat === type) {
                total += effects[i].value;
            }
        }
        return total;
    }

    // -------------------------------------------------------------------
    // Enemy turn
    // -------------------------------------------------------------------

    function _scheduleEnemyTurn() {
        setTimeout(function () {
            if (_state && _state.phase === 'enemy') {
                _enemyTurn();
            }
        }, ENEMY_TURN_DELAY);
    }

    function _enemyTurn() {
        if (!_state || _state.phase !== 'enemy') return;

        _state.phase = 'resolving';
        _emitStateChange();

        // Apply status effects at start of enemy turn
        _applyStatusEffects('enemy');

        // Check if enemy is stunned
        if (_state.enemyStunned) {
            _log(_state.enemy.name + ' is stunned and cannot act!', 'status');
            _state.enemyStunned = false;
            _advanceToPlayerTurn();
            return;
        }

        // Check if enemy was killed by status effects (e.g., poison)
        if (_state.enemy.hp <= 0) {
            _checkVictory();
            return;
        }

        var enemy = _state.enemy;
        var ai = enemy.ai;
        var hpPercent = enemy.hp / enemy.maxHp;

        // AI decision-making
        var action = _decideEnemyAction(ai, hpPercent);

        switch (action) {
            case 'attack':
                _enemyAttack();
                break;
            case 'defend':
                _enemyDefend();
                break;
            case 'ability':
                _enemyUseAbility();
                break;
            case 'flee':
                _enemyFlee();
                break;
            default:
                _enemyAttack();
        }

        if (_state && !_checkDefeat()) {
            if (_state.phase !== 'defeat' && _state.phase !== 'victory') {
                _advanceToPlayerTurn();
            }
        }
    }

    function _decideEnemyAction(ai, hpPercent) {
        var hasAbilities = _state.enemy.abilities && _state.enemy.abilities.length > 0;
        var availableAbility = _getAvailableEnemyAbility();

        switch (ai) {
            case 'aggressive':
                // Always attacks with strongest available
                if (availableAbility && Math.random() < 0.3) return 'ability';
                return 'attack';

            case 'defensive':
                // Defends below 50% HP
                if (hpPercent < 0.5 && Math.random() < 0.4) return 'defend';
                if (availableAbility && Math.random() < 0.25) return 'ability';
                return 'attack';

            case 'tactical':
                // Uses abilities on cooldown, heals when low
                if (hpPercent < 0.3 && _hasHealAbility()) return 'ability';
                if (availableAbility && Math.random() < 0.5) return 'ability';
                if (hpPercent < 0.4 && Math.random() < 0.3) return 'defend';
                return 'attack';

            case 'cowardly':
                // Flees below 25% HP
                if (hpPercent < 0.25) return 'flee';
                if (hpPercent < 0.5 && Math.random() < 0.3) return 'defend';
                return 'attack';

            case 'berserker':
                // Damage increases as HP drops, never defends
                if (availableAbility && hpPercent < 0.5 && Math.random() < 0.4) return 'ability';
                return 'attack';

            case 'support':
                // Buffs/heals
                if (availableAbility && Math.random() < 0.6) return 'ability';
                return 'attack';

            default:
                return 'attack';
        }
    }

    function _getAvailableEnemyAbility() {
        if (!_state.enemy.abilities || _state.enemy.abilities.length === 0) return null;
        for (var i = 0; i < _state.enemy.abilities.length; i++) {
            var id = _state.enemy.abilities[i];
            if (!_state.enemyCooldowns[id] || _state.enemyCooldowns[id] <= 0) {
                return id;
            }
        }
        return null;
    }

    function _hasHealAbility() {
        if (!_state.enemy.abilities) return false;
        for (var i = 0; i < _state.enemy.abilities.length; i++) {
            if (_isHealAbility(_state.enemy.abilities[i])) {
                var cd = _state.enemyCooldowns[_state.enemy.abilities[i]];
                if (!cd || cd <= 0) return true;
            }
        }
        return false;
    }

    function _enemyAttack() {
        if (!_state) return;

        var enemy = _state.enemy;
        var weapon = enemy.weapon;
        var attackStat = _getAttackStat(weapon);
        var attackMod = _getStatMod(enemy.stats, attackStat);

        // Berserker bonus: damage scales as HP drops
        var berserkerBonus = 0;
        if (enemy.ai === 'berserker') {
            var hpMissing = 1 - (enemy.hp / enemy.maxHp);
            berserkerBonus = Math.floor(hpMissing * 4);
        }

        var attackRoll = Dice().roll(20);
        var attackTotal = attackRoll + attackMod;
        var playerAC = _getPlayerArmorWithDefend();

        var isNat20 = attackRoll === 20;
        var isNat1 = attackRoll === 1;

        bus().emit('dice:roll', {
            sides: 20, result: attackRoll, purpose: 'enemy_attack',
            success: isNat20 || (!isNat1 && attackTotal >= playerAC),
            crit: isNat20
        });

        if (isNat1) {
            _log(enemy.name + ' attacks with ' + weapon.name +
                 '... [d20: ' + attackRoll + '+' + attackMod + '=' + attackTotal + '] FUMBLE!', 'miss');
            _state.enemyStunned = true;
            return;
        }

        if (!isNat20 && attackTotal < playerAC) {
            _log(enemy.name + ' attacks with ' + weapon.name +
                 '... [d20: ' + attackRoll + '+' + attackMod + '=' + attackTotal +
                 ' vs AC ' + playerAC + '] MISS!', 'miss');
            bus().emit('combat:action', { actor: 'enemy', action: 'attack', result: 'miss' });
            return;
        }

        // Hit - roll damage
        var damageStat = _getWeaponStat(weapon);
        var damageMod = _getStatMod(enemy.stats, damageStat) + berserkerBonus;
        var damageResult = Dice().damageRoll(weapon.damage, damageMod);

        if (!damageResult) {
            damageResult = { rolls: [1], total: 1 + damageMod, diceTotal: 1, modifier: damageMod };
        }

        var totalDamage = damageResult.total;

        if (isNat20) {
            totalDamage += damageResult.diceTotal;
            _log(enemy.name + ' attacks with ' + weapon.name +
                 '... [d20: ' + attackRoll + '+' + attackMod + '=' + attackTotal + '] CRITICAL HIT!', 'crit');
            _log('Damage: [' + weapon.damage + ': ' + damageResult.rolls.join('+') +
                 '+' + damageMod + '] x2 dice = ' + totalDamage + '!', 'crit');
        } else {
            _log(enemy.name + ' attacks with ' + weapon.name +
                 '... [d20: ' + attackRoll + '+' + attackMod + '=' + attackTotal +
                 ' vs AC ' + playerAC + '] HIT!', 'hit');
            _log('Damage: [' + weapon.damage + ': ' + damageResult.rolls.join('+') +
                 '+' + damageMod + '] = ' + totalDamage, 'hit');
        }

        if (totalDamage < 1) totalDamage = 1;

        _applyDamageToPlayer(totalDamage);

        bus().emit('combat:action', {
            actor: 'enemy', action: 'attack',
            result: isNat20 ? 'crit' : 'hit',
            damage: totalDamage
        });
    }

    function _enemyDefend() {
        if (!_state) return;
        var enemy = _state.enemy;
        // Temporary armor boost
        _state.statusEffects.enemy.push({
            id: 'enemy_defend_' + _state.turn,
            name: 'Defensive Stance',
            type: 'buff',
            stat: 'armor_bonus',
            value: 4,
            duration: 1,
            turnsLeft: 1
        });
        // Small heal
        var healAmount = Dice().roll(4) + Math.floor(enemy.level / 3);
        _state.enemy.hp = Math.min(_state.enemy.maxHp, _state.enemy.hp + healAmount);

        _log(enemy.name + ' takes a defensive stance and recovers ' + healAmount + ' HP.', 'info');
        bus().emit('combat:action', { actor: 'enemy', action: 'defend', result: 'defend' });
    }

    function _enemyUseAbility() {
        if (!_state) return;

        var abilityId = _getAvailableEnemyAbility();
        if (!abilityId) {
            _enemyAttack();
            return;
        }

        _resolveAbility(abilityId, 'enemy');
    }

    function _enemyFlee() {
        if (!_state) return;

        var enemy = _state.enemy;
        var dc = 10 + Math.floor((_state.player.stats.dexterity - 10) / 2);
        var checkResult = Dice().statCheck(enemy.stats.dexterity || 10, dc);

        _log(enemy.name + ' attempts to flee!', 'info');

        if (checkResult.success) {
            _log(enemy.name + ' successfully escapes!', 'info');
            // Award partial XP
            var partialXp = Math.floor(enemy.xp * 0.25);
            if (partialXp > 0) {
                CS().addExperience(partialXp);
                _log('Gained ' + partialXp + ' XP (partial).', 'info');
            }
            _state.phase = 'victory';
            _emitStateChange();
            bus().emit('combat:action', { actor: 'system', action: 'victory', result: 'victory' });
            bus().emit('combat:end', {
                result: 'victory',
                xp: partialXp,
                loot: [],
                credits: 0
            });
            // State cleanup is handled by the CONTINUE button in the victory overlay
        } else {
            _log(enemy.name + ' fails to escape!', 'info');
            // Enemy wasted their turn trying to flee
        }
    }

    // -------------------------------------------------------------------
    // Turn management
    // -------------------------------------------------------------------

    function _advanceToEnemyTurn() {
        if (!_state) return;

        // Tick player cooldowns
        _tickCooldowns(_state.playerCooldowns);

        _state.phase = 'enemy';
        bus().emit('combat:turn', { turn: _state.turn, phase: 'enemy' });
        _emitStateChange();

        _scheduleEnemyTurn();
    }

    function _advanceToPlayerTurn() {
        if (!_state) return;

        // New turn
        _state.turn++;
        _state.playerDefending = false;

        // Tick enemy cooldowns
        _tickCooldowns(_state.enemyCooldowns);

        // Apply player status effects at start of turn
        _applyStatusEffects('player');

        // Check if player was killed by status effects (e.g., poison)
        if (_state && CS().getCharacter()) {
            var char = CS().getCharacter();
            _state.player.derived = JSON.parse(JSON.stringify(char.derived));
            if (char.derived.currentHp <= 0) {
                _checkDefeat();
                return;
            }
        }

        _state.phase = 'player';
        bus().emit('combat:turn', { turn: _state.turn, phase: 'player' });
        _emitStateChange();
    }

    function _tickCooldowns(cooldowns) {
        var keys = Object.keys(cooldowns);
        for (var i = 0; i < keys.length; i++) {
            if (cooldowns[keys[i]] > 0) {
                cooldowns[keys[i]]--;
            }
        }
    }

    // -------------------------------------------------------------------
    // Status effects
    // -------------------------------------------------------------------

    function _applyStatusEffects(actor) {
        if (!_state) return;
        var effects = _state.statusEffects[actor];
        if (!effects || effects.length === 0) return;

        var toRemove = [];

        for (var i = 0; i < effects.length; i++) {
            var eff = effects[i];

            // Apply per-turn effects
            if (eff.type === 'regen') {
                if (actor === 'player') {
                    CS().heal(eff.value);
                    var char = CS().getCharacter();
                    _state.player.derived = JSON.parse(JSON.stringify(char.derived));
                    _log('Regeneration heals ' + eff.value + ' HP.', 'heal');
                } else {
                    _state.enemy.hp = Math.min(_state.enemy.maxHp, _state.enemy.hp + eff.value);
                    _log(_state.enemy.name + ' regenerates ' + eff.value + ' HP.', 'heal');
                }
            } else if (eff.type === 'poison' || eff.type === 'dot') {
                var dotDmg = eff.value || 3;
                if (actor === 'player') {
                    _applyDamageToPlayer(dotDmg);
                    _log('Poison deals ' + dotDmg + ' damage!', 'status');
                } else {
                    _applyDamageToEnemy(dotDmg);
                    _log('Poison deals ' + dotDmg + ' damage to ' + _state.enemy.name + '!', 'status');
                }
            }

            // Decrement duration
            eff.turnsLeft--;
            if (eff.turnsLeft <= 0) {
                toRemove.push(i);

                // Remove buff stat changes
                if (eff.type === 'buff' && eff.stat && eff.stat !== 'armor_bonus' && eff.stat !== 'armor_penalty') {
                    if (actor === 'player' && _state.player.stats[eff.stat] !== undefined) {
                        _state.player.stats[eff.stat] -= eff.value;
                    }
                }

                _log(eff.name + ' has worn off.', 'status');
            }
        }

        // Remove expired effects (iterate in reverse to preserve indices)
        for (var r = toRemove.length - 1; r >= 0; r--) {
            effects.splice(toRemove[r], 1);
        }
    }

    function _removeStatusEffects(actor, condition) {
        if (!_state) return 0;
        var effects = _state.statusEffects[actor];
        if (!effects) return 0;

        var removed = 0;
        if (condition === 'all_debuffs') {
            for (var i = effects.length - 1; i >= 0; i--) {
                if (effects[i].type === 'debuff' || effects[i].type === 'poison' || effects[i].type === 'dot') {
                    // Undo stat changes
                    if (effects[i].stat && _state[actor] && _state[actor].stats) {
                        _state[actor].stats[effects[i].stat] -= effects[i].value;
                    }
                    effects.splice(i, 1);
                    removed++;
                }
            }
        } else {
            for (var j = effects.length - 1; j >= 0; j--) {
                if (effects[j].type === condition || effects[j].id === condition) {
                    effects.splice(j, 1);
                    removed++;
                }
            }
        }
        return removed;
    }

    // -------------------------------------------------------------------
    // Victory / Defeat checks
    // -------------------------------------------------------------------

    function _checkVictory() {
        if (!_state || _state.enemy.hp > 0) return false;

        _state.phase = 'victory';
        _emitStateChange();

        var enemy = _state.enemy;
        _log('', 'info');
        _log('--- ' + enemy.name + ' DEFEATED ---', 'info');

        // Award XP
        var xp = enemy.xp || 0;
        CS().addExperience(xp);
        _log('Gained ' + xp + ' XP!', 'info');

        // Generate loot
        var lootItems = [];
        var credits = 0;

        // Credits
        if (enemy.loot && enemy.loot.credits) {
            var minCredits = enemy.loot.credits[0] || 0;
            var maxCredits = enemy.loot.credits[1] || 0;
            if (maxCredits > 0) {
                credits = minCredits + Dice().roll(Math.max(1, maxCredits - minCredits + 1)) - 1;
                if (window.Latency.Inventory && window.Latency.Inventory.addCredits) {
                    window.Latency.Inventory.addCredits(credits);
                }
                if (credits > 0) {
                    _log('Found ' + credits + ' credits.', 'info');
                }
            }
        }

        // Item drops
        if (enemy.loot && enemy.loot.items) {
            for (var i = 0; i < enemy.loot.items.length; i++) {
                var lootEntry = enemy.loot.items[i];
                if (Math.random() < lootEntry.chance) {
                    lootItems.push(lootEntry.id);
                    // Add to player inventory via Inventory API
                    if (window.Latency.Inventory && window.Latency.Inventory.addItem) {
                        window.Latency.Inventory.addItem(lootEntry.id, 1);
                    }
                    var itemData = window.Latency.Items ? window.Latency.Items[lootEntry.id] : null;
                    var itemName = itemData ? itemData.name : lootEntry.id;
                    _log('Found: ' + itemName + '!', 'info');
                }
            }
        }

        bus().emit('combat:action', { actor: 'system', action: 'victory', result: 'victory' });
        bus().emit('combat:end', {
            result: 'victory',
            xp: xp,
            loot: lootItems,
            credits: credits
        });

        return true;
    }

    function _checkDefeat() {
        if (!_state) return false;

        var char = CS().getCharacter();
        if (!char || char.derived.currentHp > 0) return false;

        // Check for death-prevention traits
        if (CS().hasTrait('last_stand')) {
            var alreadyUsed = false;
            for (var i = 0; i < _state.statusEffects.player.length; i++) {
                if (_state.statusEffects.player[i].id === 'last_stand_used') {
                    alreadyUsed = true;
                    break;
                }
            }

            if (!alreadyUsed) {
                CS().heal(1); // Survive with 1 HP
                _state.player.derived = JSON.parse(JSON.stringify(CS().getCharacter().derived));
                _state.statusEffects.player.push({
                    id: 'last_stand_used',
                    name: 'Last Stand',
                    type: 'special',
                    stat: 'none',
                    value: 0,
                    duration: 999,
                    turnsLeft: 999
                });
                _log('LAST STAND! You refuse to fall! (1 HP)', 'crit');
                return false;
            }
        }

        if (CS().hasTrait('iron_will')) {
            // 25% chance to survive with 1 HP
            if (Math.random() < 0.25) {
                CS().heal(1);
                _state.player.derived = JSON.parse(JSON.stringify(CS().getCharacter().derived));
                _log('IRON WILL! Sheer determination keeps you standing! (1 HP)', 'crit');
                return false;
            }
        }

        _state.phase = 'defeat';
        _emitStateChange();

        _log('', 'info');
        _log('--- YOU HAVE BEEN DEFEATED ---', 'info');

        bus().emit('combat:action', { actor: 'system', action: 'defeat', result: 'defeat' });
        bus().emit('combat:end', {
            result: 'defeat',
            xp: 0,
            loot: [],
            credits: 0
        });

        return true;
    }

    // -------------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------------

    function _cleanup() {
        _state = null;
    }

    function endCombat() {
        _cleanup();
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    return {
        initiate: initiate,
        getState: getState,
        isInCombat: isInCombat,
        playerAttack: playerAttack,
        playerDefend: playerDefend,
        playerUseAbility: playerUseAbility,
        playerUseItem: playerUseItem,
        playerFlee: playerFlee,
        endCombat: endCombat
    };
})();
