/**
 * LATENCY - Inventory System
 * ============================================================
 * Manages the player's inventory, equipment, item usage,
 * currency, and shop transactions.
 *
 * All inventory data lives on the character object at character.inventory:
 *   { equipped: { weapon, armor, accessory1, accessory2, stack },
 *     backpack: [],
 *     currency: 0 }
 *
 * Backpack entries are objects: { itemId: string, quantity: number }
 * Equipped slots hold item definition objects (from Latency.Items) or null.
 *
 * Dependencies:
 *   - window.Latency.Items            (item database)
 *   - window.Latency.CharacterSystem  (character state + derived recalc)
 *   - window.Latency.EventBus         (publish/subscribe messaging)
 *   - window.Latency.FactionsData     (faction discount lookups)
 *
 * Events emitted:
 *   inventory:add       { itemId, quantity, name }
 *   inventory:remove    { itemId, quantity, name }
 *   inventory:equip     { itemId, slot, item }
 *   inventory:unequip   { itemId, slot, item }
 *   inventory:use       { itemId, target, effect }
 *   inventory:buy       { itemId, price, name }
 *   inventory:sell      { itemId, price, name }
 *   inventory:full      {}
 *   currency:change     { oldAmount, newAmount, delta }
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.Inventory = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Lazy-resolved references
    // -------------------------------------------------------------------

    var EventBus = null;

    function bus() {
        if (!EventBus) { EventBus = window.Latency.EventBus; }
        return EventBus;
    }

    // -------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------

    var MAX_BACKPACK_SLOTS = 20;
    var MAX_STACK_SIZE     = 99;
    var SELL_PRICE_RATIO   = 0.5;  // sell at 50 % of base value

    // Item types that can be stacked in a single backpack slot
    var STACKABLE_TYPES = ['consumable', 'misc'];

    // Map from item.type to equipment slot name
    var TYPE_TO_SLOT = {
        weapon:    'weapon',
        armor:     'armor',
        accessory: null    // accessory -> accessory1 or accessory2 (dynamic)
    };

    // The eight core stats used for requirement checks
    var STAT_NAMES = [
        'strength', 'dexterity', 'constitution', 'intelligence',
        'wisdom', 'charisma', 'tech', 'luck'
    ];

    // -------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------

    /**
     * Retrieve the inventory sub-object from the current character.
     * @returns {Object|null}
     */
    function _getInventory() {
        var char = window.Latency.CharacterSystem.getCharacter();
        return char ? char.inventory : null;
    }

    /**
     * Look up an item definition from the master item table.
     * @param {string} itemId
     * @returns {Object|null}
     */
    function _getItemDef(itemId) {
        return window.Latency.Items ? window.Latency.Items[itemId] || null : null;
    }

    /**
     * Determine whether an item type is stackable.
     * @param {string} type
     * @returns {boolean}
     */
    function _isStackable(type) {
        return STACKABLE_TYPES.indexOf(type) !== -1;
    }

    /**
     * Find the index of an itemId in the backpack array.
     * Returns -1 if not found.
     */
    function _findBackpackIndex(backpack, itemId) {
        for (var i = 0; i < backpack.length; i++) {
            if (backpack[i].itemId === itemId) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Count the number of occupied backpack slots (not total quantity).
     */
    function _countSlots(backpack) {
        return backpack.length;
    }

    // -------------------------------------------------------------------
    // Backpack management
    // -------------------------------------------------------------------

    /**
     * Add an item to the backpack.
     * Stackable items merge into existing stacks; non-stackable items
     * each occupy their own slot.
     *
     * @param {string} itemId   - Key into Latency.Items.
     * @param {number} [quantity=1] - How many to add.
     * @returns {boolean} True if the item(s) were successfully added.
     */
    function addItem(itemId, quantity) {
        var inv = _getInventory();
        if (!inv) { return false; }

        var def = _getItemDef(itemId);
        if (!def) {
            console.warn('[Inventory] Unknown item: ' + itemId);
            return false;
        }

        quantity = (typeof quantity === 'number' && quantity > 0) ? quantity : 1;

        var backpack  = inv.backpack;
        var stackable = _isStackable(def.type);

        if (stackable) {
            var idx = _findBackpackIndex(backpack, itemId);
            if (idx !== -1) {
                // Merge into existing stack (cap at MAX_STACK_SIZE)
                var space = MAX_STACK_SIZE - backpack[idx].quantity;
                if (space <= 0) {
                    // Stack is full — need a new slot
                    if (_countSlots(backpack) >= MAX_BACKPACK_SLOTS) {
                        bus().emit('inventory:full', {});
                        return false;
                    }
                    backpack.push({ itemId: itemId, quantity: quantity });
                } else {
                    var toAdd = Math.min(quantity, space);
                    backpack[idx].quantity += toAdd;
                    var remainder = quantity - toAdd;
                    if (remainder > 0) {
                        if (_countSlots(backpack) >= MAX_BACKPACK_SLOTS) {
                            bus().emit('inventory:full', {});
                            // Partial add succeeded
                        } else {
                            backpack.push({ itemId: itemId, quantity: remainder });
                        }
                    }
                }
            } else {
                // New stack
                if (_countSlots(backpack) >= MAX_BACKPACK_SLOTS) {
                    bus().emit('inventory:full', {});
                    return false;
                }
                backpack.push({ itemId: itemId, quantity: quantity });
            }
        } else {
            // Non-stackable: each unit occupies its own slot
            for (var n = 0; n < quantity; n++) {
                if (_countSlots(backpack) >= MAX_BACKPACK_SLOTS) {
                    bus().emit('inventory:full', {});
                    return n > 0; // partial success
                }
                backpack.push({ itemId: itemId, quantity: 1 });
            }
        }

        bus().emit('inventory:add', {
            itemId: itemId,
            quantity: quantity,
            name: def.name
        });

        return true;
    }

    /**
     * Remove items from the backpack.
     * @param {string} itemId
     * @param {number} [quantity=1]
     * @returns {boolean} True if enough items were available and removed.
     */
    function removeItem(itemId, quantity) {
        var inv = _getInventory();
        if (!inv) { return false; }

        quantity = (typeof quantity === 'number' && quantity > 0) ? quantity : 1;

        var backpack = inv.backpack;
        var idx = _findBackpackIndex(backpack, itemId);
        if (idx === -1) { return false; }

        var entry = backpack[idx];
        if (entry.quantity < quantity) { return false; }

        entry.quantity -= quantity;
        if (entry.quantity <= 0) {
            backpack.splice(idx, 1);
        }

        var def = _getItemDef(itemId);
        bus().emit('inventory:remove', {
            itemId: itemId,
            quantity: quantity,
            name: def ? def.name : itemId
        });

        return true;
    }

    /**
     * Check if the player has at least one of the given item.
     * @param {string} itemId
     * @returns {boolean}
     */
    function hasItem(itemId) {
        return getItemCount(itemId) > 0;
    }

    /**
     * Get the total quantity of an item in the backpack.
     * @param {string} itemId
     * @returns {number}
     */
    function getItemCount(itemId) {
        var inv = _getInventory();
        if (!inv) { return 0; }

        var total = 0;
        for (var i = 0; i < inv.backpack.length; i++) {
            if (inv.backpack[i].itemId === itemId) {
                total += inv.backpack[i].quantity;
            }
        }
        return total;
    }

    /**
     * Return a copy of the backpack array.
     * Each entry: { itemId, quantity }
     * @returns {Array}
     */
    function getBackpack() {
        var inv = _getInventory();
        if (!inv) { return []; }
        return inv.backpack.slice();
    }

    // -------------------------------------------------------------------
    // Equipment
    // -------------------------------------------------------------------

    /**
     * Determine which equipment slot an item should occupy.
     * @param {Object} itemDef
     * @returns {string|null} Slot name or null if not equippable.
     */
    function _resolveSlot(itemDef) {
        if (itemDef.type === 'weapon')  { return 'weapon'; }
        if (itemDef.type === 'armor')   { return 'armor'; }
        if (itemDef.type === 'accessory') {
            var inv = _getInventory();
            if (!inv) { return null; }
            // Prefer empty slot; otherwise fill accessory1 first
            if (inv.equipped.accessory1 === null) { return 'accessory1'; }
            if (inv.equipped.accessory2 === null) { return 'accessory2'; }
            return 'accessory1'; // replace accessory1 by default
        }
        // Stack-type equipment (cortical stacks, etc.)
        if (itemDef.type === 'stack') { return 'stack'; }
        return null;
    }

    /**
     * Check whether the character meets an item's stat/level requirements.
     * @param {Object} requirements - e.g. { strength: 14, level: 8 }
     * @returns {{ met: boolean, failures: string[] }}
     */
    function _checkRequirements(requirements) {
        var char = window.Latency.CharacterSystem.getCharacter();
        var failures = [];

        if (!requirements || !char) {
            return { met: true, failures: failures };
        }

        for (var key in requirements) {
            if (!requirements.hasOwnProperty(key)) { continue; }

            var required = requirements[key];

            if (key === 'level') {
                if (char.level < required) {
                    failures.push('Level ' + required + ' required');
                }
            } else if (char.stats && char.stats[key] !== undefined) {
                if (char.stats[key] < required) {
                    var label = key.charAt(0).toUpperCase() + key.slice(1);
                    failures.push(label + ' ' + required + ' required');
                }
            }
        }

        return { met: failures.length === 0, failures: failures };
    }

    /**
     * Equip an item from the backpack.
     * If the target slot is occupied, the current item is unequipped first.
     *
     * @param {string} itemId    - Key into Latency.Items.
     * @param {string} [slotOverride] - Force a specific slot (e.g. 'accessory2').
     * @returns {{ success: boolean, message: string }}
     */
    function equip(itemId, slotOverride) {
        var inv = _getInventory();
        if (!inv) { return { success: false, message: 'No inventory available.' }; }

        var def = _getItemDef(itemId);
        if (!def) { return { success: false, message: 'Unknown item.' }; }

        // Determine slot
        var slot = slotOverride || _resolveSlot(def);
        if (!slot) { return { success: false, message: 'This item cannot be equipped.' }; }

        // Check requirements
        var reqCheck = _checkRequirements(def.requirements);
        if (!reqCheck.met) {
            return { success: false, message: reqCheck.failures.join(', ') };
        }

        // Must be in backpack
        var bpIdx = _findBackpackIndex(inv.backpack, itemId);
        if (bpIdx === -1) {
            return { success: false, message: 'Item not in backpack.' };
        }

        // Unequip current item in slot (if any)
        if (inv.equipped[slot] !== null) {
            var unequipResult = unequip(slot);
            if (!unequipResult.success) {
                return { success: false, message: 'Cannot unequip current item: ' + unequipResult.message };
            }
        }

        // Remove one from backpack
        var entry = inv.backpack[bpIdx];
        entry.quantity -= 1;
        if (entry.quantity <= 0) {
            inv.backpack.splice(bpIdx, 1);
        }

        // Place in equipment slot — store as a reference object with the itemId
        var equipped = Object.create(null);
        equipped.itemId = def.id;
        // Copy relevant stats for quick access during combat / stat calc
        if (def.armorBonus !== undefined) { equipped.armor = def.armorBonus; }
        if (def.damage)                   { equipped.damage = def.damage; }
        if (def.damageStat)               { equipped.damageStat = def.damageStat; }
        if (def.effects)                  { equipped.effects = def.effects; }
        if (def.properties)               { equipped.properties = def.properties; }
        equipped.name = def.name;
        equipped.type = def.type;
        equipped.value = def.value || 0;

        inv.equipped[slot] = equipped;

        // Recalculate derived stats
        window.Latency.CharacterSystem.recalculateDerived();

        bus().emit('inventory:equip', {
            itemId: itemId,
            slot: slot,
            item: equipped
        });

        return { success: true, message: def.name + ' equipped.' };
    }

    /**
     * Unequip an item from a slot, returning it to the backpack.
     * @param {string} slot - One of: weapon, armor, accessory1, accessory2, stack.
     * @returns {{ success: boolean, message: string }}
     */
    function unequip(slot) {
        var inv = _getInventory();
        if (!inv) { return { success: false, message: 'No inventory available.' }; }

        var equipped = inv.equipped[slot];
        if (!equipped) { return { success: false, message: 'Nothing equipped in that slot.' }; }

        // Make sure there is room in backpack
        if (_countSlots(inv.backpack) >= MAX_BACKPACK_SLOTS) {
            return { success: false, message: 'Backpack is full.' };
        }

        var itemId = equipped.itemId;

        // Clear the slot
        inv.equipped[slot] = null;

        // Return to backpack
        addItem(itemId, 1);

        // Recalculate derived stats
        window.Latency.CharacterSystem.recalculateDerived();

        bus().emit('inventory:unequip', {
            itemId: itemId,
            slot: slot,
            item: equipped
        });

        return { success: true, message: (equipped.name || itemId) + ' unequipped.' };
    }

    /**
     * Return the equipped items object.
     * @returns {Object} { weapon, armor, accessory1, accessory2, stack }
     */
    function getEquipped() {
        var inv = _getInventory();
        if (!inv) { return { weapon: null, armor: null, accessory1: null, accessory2: null, stack: null }; }
        return inv.equipped;
    }

    /**
     * Return the currently equipped weapon (or null).
     * @returns {Object|null}
     */
    function getEquippedWeapon() {
        var inv = _getInventory();
        return inv ? inv.equipped.weapon : null;
    }

    // -------------------------------------------------------------------
    // Item usage (consumables)
    // -------------------------------------------------------------------

    /**
     * Use a consumable item.
     * @param {string} itemId   - Key into Latency.Items.
     * @param {string} [target='self'] - 'self' or an enemy reference (for combat).
     * @returns {{ success: boolean, message: string }}
     */
    function useItem(itemId, target) {
        var inv = _getInventory();
        if (!inv) { return { success: false, message: 'No inventory available.' }; }

        var def = _getItemDef(itemId);
        if (!def) { return { success: false, message: 'Unknown item.' }; }

        if (def.type !== 'consumable') {
            return { success: false, message: 'This item cannot be used.' };
        }

        if (!hasItem(itemId)) {
            return { success: false, message: 'Item not in inventory.' };
        }

        target = target || 'self';
        var effect = def.effect;
        var message = '';
        var CS = window.Latency.CharacterSystem;

        if (!effect) {
            return { success: false, message: 'This item has no effect.' };
        }

        // Apply effect based on type
        switch (effect.type) {
            case 'heal':
                CS.heal(effect.value);
                message = def.name + ' restored ' + effect.value + ' HP.';
                break;

            case 'heal_over_time':
                // Apply the first tick immediately
                CS.heal(effect.value);
                // Register remaining ticks with BuffSystem
                if (Latency.BuffSystem) {
                    Latency.BuffSystem.applyBuff({
                        id: 'hot_' + itemId,
                        name: def.name,
                        effects: [{ type: 'hp_regen', value: effect.healPerTurn }],
                        duration: effect.duration,
                        category: 'chemical'
                    });
                }
                message = def.name + ' began restoring HP (' + effect.value + '/turn for ' + effect.duration + ' turns).';
                break;

            case 'buff':
                if (Latency.BuffSystem) {
                    Latency.BuffSystem.applyBuff({
                        id: 'item_' + itemId + '_' + effect.stat,
                        name: def.name + ' boost',
                        stat: effect.stat,
                        value: effect.value,
                        duration: effect.duration || 5,
                        category: 'chemical'
                    });
                } else {
                    CS.modifyStat(effect.stat, effect.value);
                }
                message = def.name + ' boosted ' + effect.stat + ' by +' + effect.value + '.';
                break;

            case 'buff_multi':
                if (effect.stats && effect.stats.length) {
                    for (var i = 0; i < effect.stats.length; i++) {
                        if (Latency.BuffSystem) {
                            Latency.BuffSystem.applyBuff({
                                id: 'item_' + itemId + '_' + effect.stats[i],
                                name: def.name + ' boost',
                                stat: effect.stats[i],
                                value: effect.value,
                                duration: effect.duration || 5,
                                category: 'chemical'
                            });
                        } else {
                            CS.modifyStat(effect.stats[i], effect.value);
                        }
                    }
                    message = def.name + ' boosted ' + effect.stats.join(', ') + ' by +' + effect.value + '.';
                }
                break;

            case 'buff_complex':
                if (effect.buffs && effect.buffs.length) {
                    var parts = [];
                    for (var b = 0; b < effect.buffs.length; b++) {
                        var buff = effect.buffs[b];
                        if (Latency.BuffSystem) {
                            Latency.BuffSystem.applyBuff({
                                id: 'item_' + itemId + '_' + buff.stat,
                                name: def.name + ' boost',
                                stat: buff.stat,
                                value: buff.value,
                                duration: buff.duration || effect.duration || 5,
                                category: 'chemical'
                            });
                        } else {
                            CS.modifyStat(buff.stat, buff.value);
                        }
                        var sign = buff.value >= 0 ? '+' : '';
                        parts.push(buff.stat + ' ' + sign + buff.value);
                    }
                    message = def.name + ': ' + parts.join(', ') + '.';
                }
                break;

            case 'cure':
                if (Latency.BuffSystem && Latency.BuffSystem.cureAll) {
                    Latency.BuffSystem.cureAll();
                }
                message = def.name + ' applied. Condition "' + effect.condition + '" cured.';
                break;

            case 'damage':
                // Offensive consumables used in combat on a target
                message = def.name + ' dealt damage.';
                break;

            default:
                message = def.name + ' used.';
                break;
        }

        // Consume the item
        removeItem(itemId, 1);

        bus().emit('inventory:use', {
            itemId: itemId,
            target: target,
            effect: effect
        });

        return { success: true, message: message };
    }

    // -------------------------------------------------------------------
    // Currency
    // -------------------------------------------------------------------

    /**
     * Get current credit balance.
     * @returns {number}
     */
    function getCredits() {
        var inv = _getInventory();
        return inv ? inv.currency : 0;
    }

    /**
     * Add credits.
     * @param {number} amount - Positive value.
     */
    function addCredits(amount) {
        var inv = _getInventory();
        if (!inv || amount <= 0) { return; }

        var old = inv.currency;
        inv.currency += amount;

        bus().emit('currency:change', {
            oldAmount: old,
            newAmount: inv.currency,
            delta: amount
        });
    }

    /**
     * Spend credits. Returns false if insufficient funds.
     * @param {number} amount
     * @returns {boolean}
     */
    function spendCredits(amount) {
        var inv = _getInventory();
        if (!inv || amount <= 0) { return false; }

        if (inv.currency < amount) { return false; }

        var old = inv.currency;
        inv.currency -= amount;

        bus().emit('currency:change', {
            oldAmount: old,
            newAmount: inv.currency,
            delta: -amount
        });

        return true;
    }

    /**
     * Check if the player can afford a given amount.
     * @param {number} amount
     * @returns {boolean}
     */
    function canAfford(amount) {
        var inv = _getInventory();
        return inv ? inv.currency >= amount : false;
    }

    // -------------------------------------------------------------------
    // Shop / trading
    // -------------------------------------------------------------------

    /**
     * Calculate the charisma discount multiplier.
     * Each point of CHA modifier reduces price by 2%, max 20% discount.
     * @returns {number} Multiplier (e.g. 0.96 for CHA mod +2).
     */
    function _charismaDiscount() {
        var CS = window.Latency.CharacterSystem;
        var mod = CS.getStatModifier('charisma');
        var discount = Math.min(mod * 0.02, 0.20); // cap at 20 %
        if (discount < 0) { discount = 0; }
        return 1 - discount;
    }

    /**
     * Calculate a faction-based discount multiplier.
     * friendly = 10% off, allied = 20% off.
     * @param {string} [vendorFaction]
     * @returns {number}
     */
    function _factionDiscount(vendorFaction) {
        if (!vendorFaction) { return 1; }

        var CS = window.Latency.CharacterSystem;
        if (typeof CS.getReputationTier !== 'function') { return 1; }

        var tier = CS.getReputationTier(vendorFaction);
        if (tier === 'allied')   { return 0.80; }
        if (tier === 'friendly') { return 0.90; }
        if (tier === 'unfriendly') { return 1.15; }
        if (tier === 'hostile')  { return 1.30; }
        return 1;
    }

    /**
     * Get the effective purchase price of an item considering
     * charisma and faction modifiers.
     *
     * @param {string} itemId
     * @param {string} [vendorFaction]
     * @returns {number} Final price (floored to integer).
     */
    function getPrice(itemId, vendorFaction) {
        var def = _getItemDef(itemId);
        if (!def) { return 0; }

        var base = def.value || 0;
        var price = base * _charismaDiscount() * _factionDiscount(vendorFaction);
        return Math.max(1, Math.floor(price));
    }

    /**
     * Buy an item from a vendor.
     * @param {string} itemId
     * @param {string} [vendorFaction]
     * @returns {{ success: boolean, message: string }}
     */
    function buyItem(itemId, vendorFaction) {
        var def = _getItemDef(itemId);
        if (!def) { return { success: false, message: 'Unknown item.' }; }

        var price = getPrice(itemId, vendorFaction);

        if (!canAfford(price)) {
            return { success: false, message: 'Not enough credits. Need ' + price + ' \u00A2.' };
        }

        // Check backpack space before spending credits
        var inv = _getInventory();
        if (!inv) { return { success: false, message: 'No inventory.' }; }

        var stackable = _isStackable(def.type);
        var bpIdx = _findBackpackIndex(inv.backpack, itemId);

        if (!stackable || bpIdx === -1) {
            // Would need a new slot
            if (_countSlots(inv.backpack) >= MAX_BACKPACK_SLOTS) {
                return { success: false, message: 'Backpack is full.' };
            }
        }

        spendCredits(price);
        addItem(itemId, 1);

        bus().emit('inventory:buy', {
            itemId: itemId,
            price: price,
            name: def.name
        });

        return { success: true, message: 'Bought ' + def.name + ' for ' + price + ' \u00A2.' };
    }

    /**
     * Sell an item from the backpack.
     * Sell price is 50 % of base value.
     * @param {string} itemId
     * @returns {{ success: boolean, message: string }}
     */
    function sellItem(itemId) {
        var def = _getItemDef(itemId);
        if (!def) { return { success: false, message: 'Unknown item.' }; }

        if (def.type === 'key_item') {
            return { success: false, message: 'Key items cannot be sold.' };
        }

        if (!hasItem(itemId)) {
            return { success: false, message: 'Item not in inventory.' };
        }

        var sellPrice = Math.max(1, Math.floor((def.value || 0) * SELL_PRICE_RATIO));

        removeItem(itemId, 1);
        addCredits(sellPrice);

        bus().emit('inventory:sell', {
            itemId: itemId,
            price: sellPrice,
            name: def.name
        });

        return { success: true, message: 'Sold ' + def.name + ' for ' + sellPrice + ' \u00A2.' };
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    return {
        // Constants (read-only exposure)
        MAX_BACKPACK_SLOTS: MAX_BACKPACK_SLOTS,

        // Backpack
        addItem:      addItem,
        removeItem:   removeItem,
        hasItem:      hasItem,
        getItemCount: getItemCount,
        getBackpack:  getBackpack,

        // Equipment
        equip:            equip,
        unequip:          unequip,
        getEquipped:      getEquipped,
        getEquippedWeapon: getEquippedWeapon,

        // Item usage
        useItem: useItem,

        // Currency
        getCredits:   getCredits,
        addCredits:   addCredits,
        spendCredits: spendCredits,
        canAfford:    canAfford,

        // Shop
        buyItem:  buyItem,
        sellItem: sellItem,
        getPrice: getPrice
    };
})();
