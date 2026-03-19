/**
 * LATENCY - Economy System
 * ============================================================
 * Handles pricing, buying, selling, and currency management.
 * Prices are modified by charisma, faction standing, and
 * bartering-related trait effects.
 *
 * Dependencies:
 *   - window.Latency.CharacterSystem  (stats, traits, currency)
 *   - window.Latency.EventBus         (publish/subscribe)
 *
 * Events emitted:
 *   economy:spend   { amount, remaining }
 *   economy:earn    { amount, total }
 *   economy:buy     { itemId, price, vendorFaction }
 *   economy:sell    { itemId, price }
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.Economy = (function () {
    'use strict';

    var EventBus = null;

    function bus() {
        if (!EventBus) {
            EventBus = window.Latency.EventBus;
        }
        return EventBus;
    }

    // ---------------------------------------------------------------
    //  Helpers
    // ---------------------------------------------------------------

    function _getChar() {
        if (window.Latency.CharacterSystem) {
            return window.Latency.CharacterSystem.getCharacter();
        }
        return null;
    }

    function _getCurrency() {
        var char = _getChar();
        if (!char || !char.inventory) { return 0; }
        return char.inventory.currency || 0;
    }

    function _setCurrency(amount) {
        var char = _getChar();
        if (!char) { return; }
        if (!char.inventory) { char.inventory = {}; }
        char.inventory.currency = Math.max(0, Math.floor(amount));
    }

    /**
     * Get the character's charisma-based discount multiplier.
     * CHA > 14 gives 10% discount (0.90 multiplier).
     * CHA > 17 gives 15% discount (0.85 multiplier).
     * CHA > 20 gives 20% discount (0.80 multiplier).
     * @returns {number} Multiplier (1.0 = no discount).
     */
    function _charismaDiscount() {
        var char = _getChar();
        if (!char || !char.stats) { return 1.0; }

        var cha = char.stats.charisma || 10;
        if (cha > 20) { return 0.80; }
        if (cha > 17) { return 0.85; }
        if (cha > 14) { return 0.90; }
        return 1.0;
    }

    /**
     * Get the faction-based discount multiplier.
     * Friendly = 10% discount (0.90), Allied = 20% discount (0.80).
     * Hostile = 20% surcharge (1.20), Unfriendly = 10% surcharge (1.10).
     * @param {string} vendorFaction  Faction key of the vendor.
     * @returns {number} Multiplier.
     */
    function _factionDiscount(vendorFaction) {
        if (!vendorFaction) { return 1.0; }

        var char = _getChar();
        if (!char || !char.reputation) { return 1.0; }

        var rep = char.reputation[vendorFaction];
        if (rep === undefined) { return 1.0; }

        var CS = window.Latency.CharacterSystem;
        if (CS && CS.getReputationTier) {
            var tier = CS.getReputationTier(vendorFaction);
            switch (tier) {
                case 'allied':     return 0.80;
                case 'friendly':   return 0.90;
                case 'neutral':    return 1.00;
                case 'unfriendly': return 1.10;
                case 'hostile':    return 1.20;
                default:           return 1.00;
            }
        }

        // Fallback: manual tier calculation
        if (rep > 50)  { return 0.80; }
        if (rep > 10)  { return 0.90; }
        if (rep >= -10) { return 1.00; }
        if (rep >= -50) { return 1.10; }
        return 1.20;
    }

    /**
     * Get bartering bonus from traits (additive percentage reduction).
     * e.g. a barter_bonus of 5 means 5% additional discount.
     * @returns {number} Multiplier.
     */
    function _barterBonus() {
        var CS = window.Latency.CharacterSystem;
        if (!CS || !CS.getTraitEffects) { return 1.0; }

        var effects = CS.getTraitEffects('barter_bonus');
        var totalBonus = 0;
        for (var i = 0; i < effects.length; i++) {
            if (typeof effects[i].value === 'number') {
                totalBonus += effects[i].value;
            }
        }

        if (totalBonus <= 0) { return 1.0; }
        return Math.max(0.5, 1.0 - (totalBonus / 100));
    }

    // ---------------------------------------------------------------
    //  Public API
    // ---------------------------------------------------------------

    /**
     * Calculate the final buy price of an item, applying all modifiers.
     * @param {number} basePrice       The item's base value.
     * @param {string} [vendorFaction] Faction key of the vendor (optional).
     * @returns {number} Final price (integer, minimum 1).
     */
    function getPrice(basePrice, vendorFaction) {
        if (!basePrice || basePrice <= 0) { return 0; }

        var price = basePrice;

        // Apply charisma discount
        price *= _charismaDiscount();

        // Apply faction discount/surcharge
        price *= _factionDiscount(vendorFaction);

        // Apply bartering trait bonus
        price *= _barterBonus();

        // Round and enforce minimum
        return Math.max(1, Math.round(price));
    }

    /**
     * Calculate the sell price of an item.
     * Base sell price is 50% of item value, modified by charisma.
     * @param {number} basePrice  The item's base value.
     * @returns {number} Final sell price (integer, minimum 1).
     */
    function getSellPrice(basePrice) {
        if (!basePrice || basePrice <= 0) { return 0; }

        var price = basePrice * 0.5;

        // Charisma bonus for selling (inverse of discount)
        var char = _getChar();
        if (char && char.stats) {
            var cha = char.stats.charisma || 10;
            if (cha > 20) { price *= 1.20; }
            else if (cha > 17) { price *= 1.15; }
            else if (cha > 14) { price *= 1.10; }
        }

        // Bartering bonus also helps when selling
        var barter = _barterBonus();
        if (barter < 1.0) {
            // Convert buy discount into sell bonus
            var bonus = 1.0 + (1.0 - barter) * 0.5;
            price *= bonus;
        }

        return Math.max(1, Math.round(price));
    }

    /**
     * Check if the character can afford a given price.
     * @param {number} price  Amount in credits.
     * @returns {boolean}
     */
    function canAfford(price) {
        return _getCurrency() >= price;
    }

    /**
     * Spend credits. Returns true if successful, false if insufficient funds.
     * @param {number} amount  Amount to spend.
     * @returns {boolean}
     */
    function spend(amount) {
        if (amount <= 0) { return true; }

        var current = _getCurrency();
        if (current < amount) { return false; }

        _setCurrency(current - amount);

        bus().emit('economy:spend', {
            amount: amount,
            remaining: _getCurrency()
        });

        return true;
    }

    /**
     * Add credits to the character's wallet.
     * @param {number} amount  Amount to earn.
     */
    function earn(amount) {
        if (amount <= 0) { return; }

        var current = _getCurrency();
        _setCurrency(current + amount);

        bus().emit('economy:earn', {
            amount: amount,
            total: _getCurrency()
        });
    }

    /**
     * Attempt to buy an item. Deducts the modified price from currency.
     * @param {string} itemId         Item identifier.
     * @param {number} basePrice      Base price of the item.
     * @param {string} [vendorFaction] Vendor's faction for discount calc.
     * @returns {boolean} True if purchase succeeded.
     */
    function buy(itemId, basePrice, vendorFaction) {
        var price = getPrice(basePrice, vendorFaction);

        if (!canAfford(price)) { return false; }

        if (!spend(price)) { return false; }

        bus().emit('economy:buy', {
            itemId: itemId,
            price: price,
            vendorFaction: vendorFaction || null
        });

        return true;
    }

    /**
     * Sell an item. Adds the modified sell price to currency.
     * @param {string} itemId    Item identifier.
     * @param {number} basePrice Base price of the item.
     * @returns {number} Credits earned from the sale.
     */
    function sell(itemId, basePrice) {
        var price = getSellPrice(basePrice);

        earn(price);

        bus().emit('economy:sell', {
            itemId: itemId,
            price: price
        });

        return price;
    }

    /**
     * Get the character's current credit balance.
     * @returns {number}
     */
    function getBalance() {
        return _getCurrency();
    }

    return {
        getPrice:     getPrice,
        getSellPrice: getSellPrice,
        canAfford:    canAfford,
        spend:        spend,
        earn:         earn,
        buy:          buy,
        sell:         sell,
        getBalance:   getBalance
    };
})();
