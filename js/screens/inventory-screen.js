/**
 * LATENCY - Inventory Screen
 * ============================================================
 * Full character sheet + inventory management screen.
 *
 * Layout:
 *   Left column:  Equipped items, Stats (8 stats + modifiers), Traits
 *   Right column: Backpack grid, Credits, Action buttons, Item details
 *
 * Interactions:
 *   - Click backpack item  -> show details, enable action buttons
 *   - USE                  -> consume a consumable item
 *   - EQUIP                -> equip a weapon/armor/accessory
 *   - DROP                 -> discard an item
 *   - Click equipped item  -> unequip it
 *   - BACK / X             -> StateMachine.back()
 *
 * Dependencies:
 *   - Latency.Inventory         (inventory operations)
 *   - Latency.CharacterSystem   (character data, stats, traits)
 *   - Latency.Items             (item database)
 *   - Latency.Traits            (trait definitions)
 *   - Latency.EventBus          (events)
 *   - Latency.StateMachine      (navigation)
 *   - Latency.ScreenManager     (fallback navigation)
 *
 * Screen contract: implements mount(container, params) and unmount()
 * ============================================================
 */

window.Latency = window.Latency || {};
window.Latency.Screens = window.Latency.Screens || {};

window.Latency.Screens.InventoryScreen = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Private state
    // -------------------------------------------------------------------

    var _container = null;
    var _listeners = [];   // DOM event bindings for cleanup
    var _unsubs    = [];   // EventBus unsubscribe functions
    var _selectedItemId  = null;
    var _selectedIsEquipped = false;
    var _selectedSlot = null;

    // Cached DOM references
    var _els = {};

    // -------------------------------------------------------------------
    // Stat labels
    // -------------------------------------------------------------------

    var STAT_ORDER = [
        'strength', 'dexterity', 'constitution', 'intelligence',
        'wisdom', 'charisma', 'tech', 'luck'
    ];

    var STAT_ABBR = {
        strength:     'STR',
        dexterity:    'DEX',
        constitution: 'CON',
        intelligence: 'INT',
        wisdom:       'WIS',
        charisma:     'CHA',
        tech:         'TECH',
        luck:         'LCK'
    };

    var SLOT_LABELS = {
        weapon:     'Weapon',
        armor:      'Armor',
        accessory1: 'Acc 1',
        accessory2: 'Acc 2',
        stack:      'Stack'
    };

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

    function _cleanDetachedListeners() {
        _listeners = _listeners.filter(function (entry) {
            if (!document.contains(entry.element)) {
                entry.element.removeEventListener(entry.event, entry.handler);
                return false;
            }
            return true;
        });
    }

    function _getChar() {
        return window.Latency.CharacterSystem
            ? window.Latency.CharacterSystem.getCharacter()
            : null;
    }

    function _getItemDef(itemId) {
        return window.Latency.Items ? window.Latency.Items[itemId] || null : null;
    }

    function _getStatModifier(statName) {
        if (!window.Latency.CharacterSystem) return 0;
        return window.Latency.CharacterSystem.getStatModifier(statName);
    }

    function _formatModifier(mod) {
        return mod >= 0 ? '(+' + mod + ')' : '(' + mod + ')';
    }

    // -------------------------------------------------------------------
    // DOM construction
    // -------------------------------------------------------------------

    function _buildScreen() {
        var frag = document.createDocumentFragment();
        var screen = _el('div', 'inv-screen');

        // ---- Header ----
        var header = _el('div', 'inv-header');
        header.appendChild(_el('span', 'inv-header-title', 'CHARACTER SHEET'));
        var closeBtn = _el('button', 'inv-close-btn', '[ X CLOSE ]');
        closeBtn.setAttribute('type', 'button');
        _bind(closeBtn, 'click', _onBack);
        header.appendChild(closeBtn);
        screen.appendChild(header);

        // ---- Separator ----
        screen.appendChild(_el('div', 'inv-separator',
            '\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550'));

        // ---- Body (two-column layout) ----
        var body = _el('div', 'inv-body');

        // LEFT COLUMN
        var leftCol = _el('div', 'inv-col-left');
        leftCol.appendChild(_buildEquippedPanel());
        leftCol.appendChild(_buildStatsPanel());
        leftCol.appendChild(_buildTraitsPanel());
        body.appendChild(leftCol);

        // RIGHT COLUMN
        var rightCol = _el('div', 'inv-col-right');
        rightCol.appendChild(_buildBackpackPanel());
        rightCol.appendChild(_buildCreditsRow());
        rightCol.appendChild(_buildActionButtons());
        rightCol.appendChild(_buildDetailPanel());
        body.appendChild(rightCol);

        screen.appendChild(body);

        // ---- Footer / Back ----
        var backBtn = _el('button', 'inv-back-btn', '[ BACK ]');
        backBtn.setAttribute('type', 'button');
        _bind(backBtn, 'click', _onBack);
        screen.appendChild(backBtn);

        frag.appendChild(screen);
        return frag;
    }

    // ---- Equipped Panel ----

    function _buildEquippedPanel() {
        var panel = _el('div', 'inv-panel inv-equipped-panel');
        panel.appendChild(_el('div', 'inv-panel-title', 'EQUIPPED'));
        var slots = _el('div', 'inv-equipped-slots');
        slots.setAttribute('data-ref', 'equippedSlots');
        panel.appendChild(slots);
        return panel;
    }

    function _renderEquippedSlots() {
        var container = _els.equippedSlots;
        if (!container) return;
        container.innerHTML = '';

        var equipped = window.Latency.Inventory
            ? window.Latency.Inventory.getEquipped()
            : { weapon: null, armor: null, accessory1: null, accessory2: null, stack: null };

        var slotKeys = ['weapon', 'armor', 'accessory1', 'accessory2', 'stack'];

        for (var i = 0; i < slotKeys.length; i++) {
            var key  = slotKeys[i];
            var item = equipped[key];
            var row  = _el('div', 'inv-equip-slot');

            var label = _el('span', 'inv-equip-label', SLOT_LABELS[key] + ':');
            row.appendChild(label);

            if (item) {
                var info = _el('span', 'inv-equip-info');

                var nameSpan = _el('span', 'inv-equip-name', item.name);

                // Color-code by type
                if (item.type === 'weapon')    { nameSpan.classList.add('inv-type-weapon'); }
                if (item.type === 'armor')     { nameSpan.classList.add('inv-type-armor'); }
                if (item.type === 'accessory') { nameSpan.classList.add('inv-type-accessory'); }

                info.appendChild(nameSpan);

                // Show key stat
                if (item.damage) {
                    info.appendChild(_el('span', 'inv-equip-stat', ' ' + item.damage));
                }
                if (item.armor !== undefined) {
                    info.appendChild(_el('span', 'inv-equip-stat', ' +' + item.armor + ' AC'));
                }

                row.appendChild(info);
                row.classList.add('inv-equip-slot--filled');

                // Click to unequip
                (function (slotKey, itm) {
                    _bind(row, 'click', function () {
                        _selectEquippedItem(slotKey, itm);
                    });
                })(key, item);
            } else {
                row.appendChild(_el('span', 'inv-equip-empty', '---'));
            }

            container.appendChild(row);
        }
    }

    // ---- Stats Panel ----

    function _buildStatsPanel() {
        var panel = _el('div', 'inv-panel inv-stats-panel');
        panel.appendChild(_el('div', 'inv-panel-title', 'STATS'));
        var list = _el('div', 'inv-stats-list');
        list.setAttribute('data-ref', 'statsList');
        panel.appendChild(list);
        return panel;
    }

    function _renderStats() {
        var container = _els.statsList;
        if (!container) return;
        container.innerHTML = '';

        var char = _getChar();
        if (!char) return;

        for (var i = 0; i < STAT_ORDER.length; i++) {
            var key = STAT_ORDER[i];
            var val = char.stats[key] || 10;
            var mod = _getStatModifier(key);
            var row = _el('div', 'inv-stat-row');
            row.appendChild(_el('span', 'inv-stat-abbr', STAT_ABBR[key] + ':'));
            row.appendChild(_el('span', 'inv-stat-val', '' + val));
            row.appendChild(_el('span', 'inv-stat-mod', _formatModifier(mod)));
            container.appendChild(row);
        }

        // Also show derived stats
        var sep = _el('div', 'inv-stat-divider', '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
        container.appendChild(sep);

        var derived = char.derived;
        var derivedRows = [
            { label: 'HP',      value: derived.currentHp + '/' + derived.maxHp },
            { label: 'STAMINA', value: derived.currentStamina + '/' + derived.maxStamina },
            { label: 'ARMOR',   value: '' + derived.armor },
            { label: 'INIT',    value: '' + derived.initiative }
        ];

        for (var d = 0; d < derivedRows.length; d++) {
            var dRow = _el('div', 'inv-stat-row');
            dRow.appendChild(_el('span', 'inv-stat-abbr', derivedRows[d].label + ':'));
            dRow.appendChild(_el('span', 'inv-stat-val inv-stat-derived', derivedRows[d].value));
            container.appendChild(dRow);
        }
    }

    // ---- Traits Panel ----

    function _buildTraitsPanel() {
        var panel = _el('div', 'inv-panel inv-traits-panel');
        panel.appendChild(_el('div', 'inv-panel-title', 'TRAITS'));
        var list = _el('div', 'inv-traits-list');
        list.setAttribute('data-ref', 'traitsList');
        panel.appendChild(list);
        return panel;
    }

    function _renderTraits() {
        var container = _els.traitsList;
        if (!container) return;
        container.innerHTML = '';

        var char = _getChar();
        if (!char || !char.traits || char.traits.length === 0) {
            container.appendChild(_el('div', 'inv-trait-none', 'No active traits.'));
            return;
        }

        var TraitData = window.Latency.Traits;

        for (var i = 0; i < char.traits.length; i++) {
            var traitId = char.traits[i];
            var tDef = TraitData ? TraitData[traitId] : null;
            var name = tDef ? tDef.name : traitId;
            var row = _el('div', 'inv-trait-row', '\u2022 ' + name);
            if (tDef && tDef.description) {
                row.title = tDef.description;
            }
            container.appendChild(row);
        }
    }

    // ---- Backpack Panel ----

    function _buildBackpackPanel() {
        var panel = _el('div', 'inv-panel inv-backpack-panel');
        var titleRow = _el('div', 'inv-backpack-header');
        var titleLabel = _el('span', 'inv-panel-title', 'BACKPACK');
        titleRow.appendChild(titleLabel);
        var countSpan = _el('span', 'inv-backpack-count', '(0/20)');
        countSpan.setAttribute('data-ref', 'backpackCount');
        titleRow.appendChild(countSpan);
        panel.appendChild(titleRow);

        var list = _el('div', 'inv-backpack-list');
        list.setAttribute('data-ref', 'backpackList');
        panel.appendChild(list);
        return panel;
    }

    function _renderBackpack() {
        var container = _els.backpackList;
        var countEl   = _els.backpackCount;
        if (!container) return;
        container.innerHTML = '';

        var backpack = window.Latency.Inventory
            ? window.Latency.Inventory.getBackpack()
            : [];

        var maxSlots = window.Latency.Inventory
            ? window.Latency.Inventory.MAX_BACKPACK_SLOTS
            : 20;

        if (countEl) {
            countEl.textContent = '(' + backpack.length + '/' + maxSlots + ')';
        }

        if (backpack.length === 0) {
            container.appendChild(_el('div', 'inv-backpack-empty', 'Backpack is empty.'));
            return;
        }

        for (var i = 0; i < backpack.length; i++) {
            var entry = backpack[i];
            var def = _getItemDef(entry.itemId);
            var name = def ? def.name : entry.itemId;
            var qty  = entry.quantity;

            var row = _el('div', 'inv-backpack-item');

            // Color-code
            if (def) {
                if (def.type === 'weapon')     row.classList.add('inv-type-weapon');
                if (def.type === 'armor')      row.classList.add('inv-type-armor');
                if (def.type === 'consumable')  row.classList.add('inv-type-consumable');
                if (def.type === 'key_item')    row.classList.add('inv-type-key');
                if (def.type === 'accessory')   row.classList.add('inv-type-accessory');
                if (def.type === 'misc')        row.classList.add('inv-type-misc');
            }

            var label = name;
            if (qty > 1) { label += ' (x' + qty + ')'; }
            row.textContent = label;

            // Highlight if selected
            if (_selectedItemId === entry.itemId && !_selectedIsEquipped) {
                row.classList.add('inv-item-selected');
            }

            (function (itemId) {
                _bind(row, 'click', function () {
                    _selectBackpackItem(itemId);
                });
            })(entry.itemId);

            container.appendChild(row);
        }
    }

    // ---- Credits Row ----

    function _buildCreditsRow() {
        var row = _el('div', 'inv-credits-row');
        row.appendChild(_el('span', 'inv-credits-label', 'Credits:'));
        var val = _el('span', 'inv-credits-value', '0 \u00A2');
        val.setAttribute('data-ref', 'creditsValue');
        row.appendChild(val);
        return row;
    }

    function _renderCredits() {
        var el = _els.creditsValue;
        if (!el) return;
        var credits = window.Latency.Inventory
            ? window.Latency.Inventory.getCredits()
            : 0;
        el.textContent = credits + ' \u00A2';
    }

    // ---- Action Buttons ----

    function _buildActionButtons() {
        var bar = _el('div', 'inv-action-bar');

        var useBtn = _el('button', 'inv-action-btn inv-btn-use', '[ USE ]');
        useBtn.setAttribute('type', 'button');
        useBtn.disabled = true;
        useBtn.setAttribute('data-ref', 'btnUse');
        _bind(useBtn, 'click', _onUse);
        bar.appendChild(useBtn);

        var equipBtn = _el('button', 'inv-action-btn inv-btn-equip', '[ EQUIP ]');
        equipBtn.setAttribute('type', 'button');
        equipBtn.disabled = true;
        equipBtn.setAttribute('data-ref', 'btnEquip');
        _bind(equipBtn, 'click', _onEquip);
        bar.appendChild(equipBtn);

        var dropBtn = _el('button', 'inv-action-btn inv-btn-drop', '[ DROP ]');
        dropBtn.setAttribute('type', 'button');
        dropBtn.disabled = true;
        dropBtn.setAttribute('data-ref', 'btnDrop');
        _bind(dropBtn, 'click', _onDrop);
        bar.appendChild(dropBtn);

        return bar;
    }

    function _updateActionButtons() {
        var btnUse   = _els.btnUse;
        var btnEquip = _els.btnEquip;
        var btnDrop  = _els.btnDrop;

        if (!btnUse || !btnEquip || !btnDrop) return;

        btnUse.disabled   = true;
        btnEquip.disabled = true;
        btnDrop.disabled  = true;

        // Reset button text
        btnEquip.textContent = '[ EQUIP ]';

        if (!_selectedItemId) return;

        var def = _getItemDef(_selectedItemId);
        if (!def) return;

        if (_selectedIsEquipped) {
            // Equipped item selected -> show UNEQUIP
            btnEquip.textContent = '[ UNEQUIP ]';
            btnEquip.disabled = false;
            return;
        }

        // Backpack item selected
        if (def.type === 'consumable') {
            btnUse.disabled = false;
        }
        if (def.type === 'weapon' || def.type === 'armor' || def.type === 'accessory' || def.type === 'stack') {
            btnEquip.disabled = false;
        }
        if (def.type !== 'key_item') {
            btnDrop.disabled = false;
        }
    }

    // ---- Detail Panel ----

    function _buildDetailPanel() {
        var panel = _el('div', 'inv-panel inv-detail-panel');
        panel.appendChild(_el('div', 'inv-panel-title', 'ITEM DETAILS'));
        var content = _el('div', 'inv-detail-content');
        content.setAttribute('data-ref', 'detailContent');
        content.appendChild(_el('div', 'inv-detail-empty', 'Select an item to view details.'));
        panel.appendChild(content);
        return panel;
    }

    function _renderDetail() {
        var container = _els.detailContent;
        if (!container) return;
        container.innerHTML = '';

        if (!_selectedItemId) {
            container.appendChild(_el('div', 'inv-detail-empty', 'Select an item to view details.'));
            return;
        }

        var def = _getItemDef(_selectedItemId);
        if (!def) {
            container.appendChild(_el('div', 'inv-detail-empty', 'Unknown item.'));
            return;
        }

        // Item name
        var nameEl = _el('div', 'inv-detail-name', def.name);
        if (def.type === 'weapon')     nameEl.classList.add('inv-type-weapon');
        if (def.type === 'armor')      nameEl.classList.add('inv-type-armor');
        if (def.type === 'consumable') nameEl.classList.add('inv-type-consumable');
        if (def.type === 'key_item')   nameEl.classList.add('inv-type-key');
        if (def.type === 'accessory')  nameEl.classList.add('inv-type-accessory');
        container.appendChild(nameEl);

        // Type line
        var typeLine = def.type.replace(/_/g, ' ');
        if (def.subtype) { typeLine += ' (' + def.subtype + ')'; }
        container.appendChild(_el('div', 'inv-detail-type', typeLine.toUpperCase()));

        // Separator
        container.appendChild(_el('div', 'inv-detail-sep',
            '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'));

        // Weapon stats
        if (def.damage) {
            container.appendChild(_el('div', 'inv-detail-stat', 'Damage: ' + def.damage));
        }
        if (def.damageStat) {
            container.appendChild(_el('div', 'inv-detail-stat',
                'Scales with: ' + def.damageStat.charAt(0).toUpperCase() + def.damageStat.slice(1)));
        }

        // Armor stats
        if (def.armorBonus !== undefined) {
            container.appendChild(_el('div', 'inv-detail-stat', 'Armor: +' + def.armorBonus));
        }

        // Consumable effect
        if (def.effect) {
            var effectStr = '';
            switch (def.effect.type) {
                case 'heal':
                    effectStr = 'Heals ' + def.effect.value + ' HP';
                    break;
                case 'heal_over_time':
                    effectStr = 'Heals ' + def.effect.value + ' HP/turn for ' + def.effect.duration + ' turns';
                    break;
                case 'buff':
                    effectStr = '+' + def.effect.value + ' ' + def.effect.stat + ' for ' + def.effect.duration + ' turns';
                    break;
                case 'buff_multi':
                    effectStr = '+' + def.effect.value + ' ' + def.effect.stats.join(', ') + ' for ' + def.effect.duration + ' turns';
                    break;
                case 'buff_complex':
                    var parts = [];
                    for (var b = 0; b < def.effect.buffs.length; b++) {
                        var bf = def.effect.buffs[b];
                        var sign = bf.value >= 0 ? '+' : '';
                        parts.push(sign + bf.value + ' ' + bf.stat);
                    }
                    effectStr = parts.join(', ') + ' for ' + def.effect.duration + ' turns';
                    break;
                case 'cure':
                    effectStr = 'Cures: ' + def.effect.condition.replace(/_/g, ' ');
                    break;
                default:
                    effectStr = def.effect.type;
            }
            container.appendChild(_el('div', 'inv-detail-stat inv-detail-effect', 'Effect: ' + effectStr));
        }

        // Accessory effects
        if (def.effects && def.effects.length) {
            for (var e = 0; e < def.effects.length; e++) {
                var eff = def.effects[e];
                var prefix = eff.value >= 0 ? '+' : '';
                container.appendChild(_el('div', 'inv-detail-stat',
                    eff.stat.replace(/_/g, ' ') + ': ' + prefix + eff.value));
            }
        }

        // Properties
        if (def.properties && def.properties.length) {
            var propsStr = def.properties.map(function (p) {
                return p.replace(/_/g, ' ');
            }).join(', ');
            container.appendChild(_el('div', 'inv-detail-props', 'Properties: ' + propsStr));
        }

        // Requirements
        if (def.requirements && Object.keys(def.requirements).length > 0) {
            var reqs = [];
            for (var rKey in def.requirements) {
                if (!def.requirements.hasOwnProperty(rKey)) continue;
                var rLabel = rKey.charAt(0).toUpperCase() + rKey.slice(1);
                reqs.push(rLabel + ' ' + def.requirements[rKey]);
            }
            var reqEl = _el('div', 'inv-detail-reqs', 'Requires: ' + reqs.join(', '));

            // Check if requirements are met
            if (window.Latency.CharacterSystem) {
                var char = _getChar();
                if (char) {
                    var met = true;
                    for (var rk in def.requirements) {
                        if (!def.requirements.hasOwnProperty(rk)) continue;
                        if (rk === 'level' && char.level < def.requirements[rk]) { met = false; break; }
                        if (char.stats && char.stats[rk] !== undefined && char.stats[rk] < def.requirements[rk]) { met = false; break; }
                    }
                    if (!met) {
                        reqEl.classList.add('inv-req-unmet');
                    }
                }
            }

            container.appendChild(reqEl);
        }

        // Value
        if (def.value !== undefined && def.type !== 'key_item') {
            container.appendChild(_el('div', 'inv-detail-value', 'Value: ' + def.value + ' \u00A2'));
        }

        // Description
        if (def.description) {
            container.appendChild(_el('div', 'inv-detail-sep',
                '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500'));
            container.appendChild(_el('div', 'inv-detail-desc', '"' + def.description + '"'));
        }
    }

    // -------------------------------------------------------------------
    // Selection
    // -------------------------------------------------------------------

    function _selectBackpackItem(itemId) {
        _selectedItemId = itemId;
        _selectedIsEquipped = false;
        _selectedSlot = null;
        _refreshDisplay();
    }

    function _selectEquippedItem(slot, item) {
        _selectedItemId = item.itemId;
        _selectedIsEquipped = true;
        _selectedSlot = slot;
        _refreshDisplay();
    }

    function _clearSelection() {
        _selectedItemId = null;
        _selectedIsEquipped = false;
        _selectedSlot = null;
    }

    // -------------------------------------------------------------------
    // Action handlers
    // -------------------------------------------------------------------

    function _onUse() {
        if (!_selectedItemId || _selectedIsEquipped) return;
        var Inv = window.Latency.Inventory;
        if (!Inv) return;

        var result = Inv.useItem(_selectedItemId);

        if (result.success) {
            // Check if item is used up
            if (!Inv.hasItem(_selectedItemId)) {
                _clearSelection();
            }
        }

        _refreshDisplay();

        // Show feedback via notification if available
        if (window.Latency.Notification && result.message) {
            window.Latency.Notification.show(result.message, result.success ? 'success' : 'warning');
        }
    }

    function _onEquip() {
        if (!_selectedItemId) return;
        var Inv = window.Latency.Inventory;
        if (!Inv) return;

        var result;

        if (_selectedIsEquipped) {
            // UNEQUIP
            result = Inv.unequip(_selectedSlot);
            if (result.success) {
                _clearSelection();
            }
        } else {
            // EQUIP
            result = Inv.equip(_selectedItemId);
            if (result.success) {
                _clearSelection();
            }
        }

        _refreshDisplay();

        if (window.Latency.Notification && result && result.message) {
            window.Latency.Notification.show(result.message, result.success ? 'success' : 'warning');
        }
    }

    function _onDrop() {
        if (!_selectedItemId || _selectedIsEquipped) return;
        var Inv = window.Latency.Inventory;
        if (!Inv) return;

        var def = _getItemDef(_selectedItemId);
        if (def && def.type === 'key_item') return; // safety

        var removed = Inv.removeItem(_selectedItemId, 1);
        if (removed) {
            if (!Inv.hasItem(_selectedItemId)) {
                _clearSelection();
            }
            _refreshDisplay();
        }
    }

    function _onBack() {
        if (window.Latency.StateMachine && typeof window.Latency.StateMachine.back === 'function') {
            window.Latency.StateMachine.back();
            return;
        }
        if (window.Latency.ScreenManager && typeof window.Latency.ScreenManager.show === 'function') {
            window.Latency.ScreenManager.show('gameplay');
        }
    }

    // -------------------------------------------------------------------
    // Refresh
    // -------------------------------------------------------------------

    /**
     * Cache data-ref elements for efficient updates.
     */
    function _cacheRefs() {
        if (!_container) return;
        var refs = _container.querySelectorAll('[data-ref]');
        _els = {};
        for (var i = 0; i < refs.length; i++) {
            _els[refs[i].getAttribute('data-ref')] = refs[i];
        }
    }

    /**
     * Re-render all dynamic sections.
     */
    function _refreshDisplay() {
        // Clean listeners pointing to detached DOM nodes (old backpack rows, equipped slots)
        _cleanDetachedListeners();

        _renderEquippedSlots();
        _renderBackpack();
        _renderStats();
        _renderTraits();
        _renderCredits();
        _renderDetail();
        _updateActionButtons();
    }

    // -------------------------------------------------------------------
    // EventBus subscriptions
    // -------------------------------------------------------------------

    function _subscribeEvents() {
        var b = window.Latency.EventBus;
        if (!b) return;

        _unsubs.push(b.on('inventory:add',     _refreshDisplay));
        _unsubs.push(b.on('inventory:remove',  _refreshDisplay));
        _unsubs.push(b.on('inventory:equip',   _refreshDisplay));
        _unsubs.push(b.on('inventory:unequip', _refreshDisplay));
        _unsubs.push(b.on('inventory:use',     _refreshDisplay));
        _unsubs.push(b.on('currency:change',   _refreshDisplay));
        _unsubs.push(b.on('stat:change',       _refreshDisplay));
        _unsubs.push(b.on('hp:change',         _refreshDisplay));
        _unsubs.push(b.on('stamina:change',    _refreshDisplay));
        _unsubs.push(b.on('trait:add',         _refreshDisplay));
        _unsubs.push(b.on('trait:remove',      _refreshDisplay));
        _unsubs.push(b.on('levelup',           _refreshDisplay));
    }

    // -------------------------------------------------------------------
    // Public API - Screen contract
    // -------------------------------------------------------------------

    return {
        /**
         * Mount the inventory screen into the given container.
         * @param {HTMLElement} container
         * @param {Object} [params]
         */
        mount: function (container, params) {
            _container = container;
            _listeners = [];
            _unsubs    = [];
            _selectedItemId = null;
            _selectedIsEquipped = false;
            _selectedSlot = null;
            _els = {};

            var dom = _buildScreen();
            _container.appendChild(dom);

            _cacheRefs();
            _subscribeEvents();
            _refreshDisplay();

            console.log('[InventoryScreen] Mounted.');
        },

        /**
         * Unmount the inventory screen, cleaning up all listeners and DOM.
         */
        unmount: function () {
            // Unsubscribe EventBus
            for (var u = 0; u < _unsubs.length; u++) {
                if (typeof _unsubs[u] === 'function') {
                    _unsubs[u]();
                }
            }
            _unsubs = [];

            // Remove DOM listeners
            for (var i = 0; i < _listeners.length; i++) {
                var entry = _listeners[i];
                entry.element.removeEventListener(entry.event, entry.handler);
            }
            _listeners = [];

            // Clear DOM
            if (_container) {
                _container.innerHTML = '';
            }
            _container = null;
            _els = {};
            _selectedItemId = null;
            _selectedIsEquipped = false;
            _selectedSlot = null;

            console.log('[InventoryScreen] Unmounted.');
        }
    };
})();
