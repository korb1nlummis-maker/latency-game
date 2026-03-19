/**
 * LATENCY - Journal / Quest Log System
 * ============================================================
 * Tracks active quests, completed quests, failed quests, and
 * lore entries (codex). Subscribes to flag:set events to
 * auto-update quest objectives and auto-discover lore.
 *
 * Quest types: main, side, faction
 * Lore categories: world, faction, tech, people
 *
 * Dependencies:
 *   - window.Latency.EventBus       (publish/subscribe)
 *   - window.Latency.CharacterSystem (XP rewards)
 *
 * Events emitted:
 *   journal:quest:added      { quest }
 *   journal:quest:updated    { quest }
 *   journal:quest:completed  { quest }
 *   journal:quest:failed     { quest }
 *   journal:lore:discovered  { entry }
 *   notify                   { message, type, duration }
 *
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.Journal = (function () {
    'use strict';

    // ------------------------------------------------------------------
    //  Constants
    // ------------------------------------------------------------------

    var QUEST_STATUS = {
        ACTIVE:    'active',
        COMPLETED: 'completed',
        FAILED:    'failed'
    };

    var QUEST_TYPES = ['main', 'side', 'faction'];

    var LORE_CATEGORIES = ['world', 'faction', 'tech', 'people'];

    // ------------------------------------------------------------------
    //  Private state
    // ------------------------------------------------------------------

    /** @type {Object<string, Object>} questId -> quest object */
    var _quests = {};

    /** @type {Object<string, Object>} entryId -> lore entry object */
    var _lore = {};

    /** @type {Function[]} EventBus unsubscribe handles */
    var _unsubs = [];

    // ------------------------------------------------------------------
    //  Helpers
    // ------------------------------------------------------------------

    function _bus() {
        return window.Latency.EventBus;
    }

    function _emit(event, data) {
        var b = _bus();
        if (b) { b.emit(event, data); }
    }

    function _notify(message, type) {
        _emit('notify', { message: message, type: type || 'info', duration: 4000 });
    }

    // ------------------------------------------------------------------
    //  Pre-defined lore entries (all locked until discovered via flags)
    // ------------------------------------------------------------------

    var _LORE_DEFINITIONS = {
        lore_memory_stacks: {
            id: 'lore_memory_stacks',
            title: 'Memory Stacks',
            text: 'Towering crystalline data arrays that store the digitized consciousness of millions. ' +
                  'Each stack hums with the faint resonance of trapped minds, their neural patterns ' +
                  'compressed into quantum lattice structures. The stacks are maintained by the ' +
                  'Circuit Saints, who believe consciousness persists in the data long after ' +
                  'the original body has decayed. Unauthorized access to the stacks carries ' +
                  'a sentence worse than death — forced upload without backup.',
            category: 'tech',
            discoverFlag: 'lore_memory_stacks'
        },
        lore_megacity: {
            id: 'lore_megacity',
            title: 'The Megacity',
            text: 'A sprawling urban nightmare stretching from the old coastline to the ' +
                  'irradiated wastelands. Fifty million souls crammed into vertical towers ' +
                  'that scrape poisoned clouds. The upper spires belong to the corporations — ' +
                  'gleaming chrome and filtered air. Below, the Undercity festers in perpetual ' +
                  'twilight, where neon signs flicker over markets selling bootleg implants ' +
                  'and synthetic memories. No one remembers the city\'s real name anymore. ' +
                  'Everyone just calls it The Megacity.',
            category: 'world',
            discoverFlag: 'lore_megacity'
        },
        lore_cloud_towers: {
            id: 'lore_cloud_towers',
            title: 'Cloud Towers',
            text: 'The network backbone of the modern world. Massive server farms housed ' +
                  'inside fortified skyscrapers, each one a self-contained ecosystem with ' +
                  'its own power grid, cooling systems, and armed garrison. The Cloud Towers ' +
                  'process every transaction, every communication, every thought uploaded to ' +
                  'the net. Controlling even one tower grants access to secrets that could ' +
                  'topple governments. The five factions have been fighting over them for decades.',
            category: 'tech',
            discoverFlag: 'lore_cloud_towers'
        },
        lore_five_factions: {
            id: 'lore_five_factions',
            title: 'The Five Factions',
            text: 'After the corporate wars collapsed the old order, five factions rose from ' +
                  'the ashes to fill the power vacuum. The Iron Collective controls manufacturing ' +
                  'and military hardware. The Neon Court runs entertainment, vice, and information ' +
                  'brokering. The Circuit Saints worship technology as divinity and maintain the ' +
                  'infrastructure. The Ghost Syndicate operates in the shadows — assassins, ' +
                  'smugglers, and data thieves. The Ashen Circle are the outcasts and ' +
                  'revolutionaries who want to burn it all down and start over.',
            category: 'faction',
            discoverFlag: 'lore_five_factions'
        },
        lore_project_latency: {
            id: 'lore_project_latency',
            title: 'Project LATENCY',
            text: 'A classified research initiative originally funded by a consortium of ' +
                  'corporations before the wars. Project LATENCY sought to eliminate the delay ' +
                  'between thought and digital action — true zero-latency neural integration. ' +
                  'The project was officially shut down after catastrophic test failures that ' +
                  'left subjects brain-dead or worse. But rumors persist that the research ' +
                  'continued in secret, and that someone finally cracked the code. The ' +
                  'implications would change everything.',
            category: 'world',
            discoverFlag: 'lore_project_latency'
        },
        lore_the_vault: {
            id: 'lore_the_vault',
            title: 'The Vault',
            text: 'A mythical repository said to contain the original source code of human ' +
                  'consciousness — the base template from which all uploaded minds are derived. ' +
                  'Some believe it holds the key to true digital immortality, others claim it ' +
                  'contains a weapon capable of wiping every connected mind simultaneously. ' +
                  'Every faction wants it. No one knows where it is. The few who claimed to ' +
                  'have found it were never heard from again.',
            category: 'world',
            discoverFlag: 'lore_the_vault'
        },
        lore_dr_volkov: {
            id: 'lore_dr_volkov',
            title: 'Dr. Volkov',
            text: 'Dr. Elena Volkov, former lead researcher of Project LATENCY. A brilliant ' +
                  'neuroscientist who vanished after the project was officially terminated. ' +
                  'Some say she uploaded herself into the net and exists as a ghost in the ' +
                  'system. Others claim she is alive and working with one of the factions. ' +
                  'Her research notes are the most sought-after documents in the Megacity. ' +
                  'Those who have read fragments describe equations that defy known physics — ' +
                  'mathematics that describes the shape of consciousness itself.',
            category: 'people',
            discoverFlag: 'lore_dr_volkov'
        }
    };

    // ------------------------------------------------------------------
    //  Pre-defined main quest tracking (triggered by story flags)
    // ------------------------------------------------------------------

    var _QUEST_FLAG_RULES = [
        // Prologue main quest
        {
            flag: 'prologue_started',
            action: 'add',
            questId: 'mq_awakening',
            title: 'Awakening',
            description: 'You have been activated. Discover who you are and why you are here.',
            type: 'main',
            objective: 'Explore your surroundings and gather information.'
        },
        {
            flag: 'prologue_complete',
            action: 'update',
            questId: 'mq_awakening',
            objective: 'The prologue is complete. Seek answers in the Megacity.'
        },
        {
            flag: 'act1_started',
            action: 'complete',
            questId: 'mq_awakening',
            xp: 50
        },
        // Act 1 main quest
        {
            flag: 'act1_started',
            action: 'add',
            questId: 'mq_into_the_city',
            title: 'Into the City',
            description: 'The Megacity awaits. Navigate its dangers and find allies.',
            type: 'main',
            objective: 'Make contact with one of the five factions.'
        },
        {
            flag: 'faction_contact_made',
            action: 'update',
            questId: 'mq_into_the_city',
            objective: 'You have made contact with a faction. Earn their trust.'
        },
        {
            flag: 'act1_complete',
            action: 'complete',
            questId: 'mq_into_the_city',
            xp: 100
        },
        // Vault quest
        {
            flag: 'vault_rumor_heard',
            action: 'add',
            questId: 'mq_the_vault',
            title: 'The Vault',
            description: 'Rumors speak of a hidden repository containing the source code of consciousness.',
            type: 'main',
            objective: 'Investigate the rumors about the Vault.'
        },
        {
            flag: 'vault_location_found',
            action: 'update',
            questId: 'mq_the_vault',
            objective: 'You know where the Vault is. Prepare for the journey.'
        },
        // Dr. Volkov quest
        {
            flag: 'volkov_mentioned',
            action: 'add',
            questId: 'sq_find_volkov',
            title: 'The Ghost Doctor',
            description: 'Dr. Volkov, creator of Project LATENCY, has disappeared. Find her.',
            type: 'side',
            objective: 'Search for traces of Dr. Volkov in the Megacity.'
        },
        {
            flag: 'volkov_found',
            action: 'update',
            questId: 'sq_find_volkov',
            objective: 'You have located Dr. Volkov. Speak with her.'
        },
        {
            flag: 'volkov_quest_complete',
            action: 'complete',
            questId: 'sq_find_volkov',
            xp: 75
        }
    ];

    // ------------------------------------------------------------------
    //  Core Quest API
    // ------------------------------------------------------------------

    /**
     * Add a new quest to the journal.
     * @param {string} id - Unique quest identifier.
     * @param {string} title - Display title.
     * @param {string} description - Full quest description.
     * @param {string} type - 'main', 'side', or 'faction'.
     * @param {Object} [opts] - Optional: { objective, xpReward }
     * @returns {boolean} True if added successfully.
     */
    function addQuest(id, title, description, type, opts) {
        if (!id || !title) {
            console.warn('[Journal] addQuest: id and title are required.');
            return false;
        }

        if (_quests[id]) {
            console.warn('[Journal] Quest "' + id + '" already exists.');
            return false;
        }

        if (QUEST_TYPES.indexOf(type) === -1) {
            type = 'side';
        }

        opts = opts || {};

        var quest = {
            id: id,
            title: title,
            description: description,
            type: type,
            status: QUEST_STATUS.ACTIVE,
            objective: opts.objective || '',
            xpReward: opts.xpReward || 0,
            addedAt: Date.now(),
            completedAt: null,
            objectiveHistory: []
        };

        _quests[id] = quest;

        _emit('journal:quest:added', { quest: quest });

        var typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
        _notify('New ' + typeLabel + ' Quest: ' + title, 'info');

        console.log('[Journal] Quest added: ' + title + ' (' + type + ')');
        return true;
    }

    /**
     * Update the current objective text for a quest.
     * @param {string} id - Quest identifier.
     * @param {string} newObjective - New objective text.
     * @returns {boolean} True if updated.
     */
    function updateQuest(id, newObjective) {
        var quest = _quests[id];
        if (!quest) {
            console.warn('[Journal] updateQuest: Quest "' + id + '" not found.');
            return false;
        }

        if (quest.status !== QUEST_STATUS.ACTIVE) {
            console.warn('[Journal] updateQuest: Quest "' + id + '" is not active.');
            return false;
        }

        // Archive old objective
        if (quest.objective) {
            quest.objectiveHistory.push({
                text: quest.objective,
                timestamp: Date.now()
            });
        }

        quest.objective = newObjective;

        _emit('journal:quest:updated', { quest: quest });
        _notify('Quest Updated: ' + quest.title, 'info');

        console.log('[Journal] Quest updated: ' + quest.title + ' -> ' + newObjective);
        return true;
    }

    /**
     * Mark a quest as completed and optionally award XP.
     * @param {string} id - Quest identifier.
     * @param {number} [xp] - XP to award (overrides quest.xpReward if provided).
     * @returns {boolean} True if completed.
     */
    function completeQuest(id, xp) {
        var quest = _quests[id];
        if (!quest) {
            console.warn('[Journal] completeQuest: Quest "' + id + '" not found.');
            return false;
        }

        if (quest.status !== QUEST_STATUS.ACTIVE) {
            console.warn('[Journal] completeQuest: Quest "' + id + '" is already ' + quest.status + '.');
            return false;
        }

        quest.status = QUEST_STATUS.COMPLETED;
        quest.completedAt = Date.now();

        // Award XP
        var xpAmount = (typeof xp === 'number') ? xp : quest.xpReward;
        if (xpAmount > 0 && window.Latency.CharacterSystem &&
            typeof window.Latency.CharacterSystem.addExperience === 'function') {
            window.Latency.CharacterSystem.addExperience(xpAmount);
        }

        _emit('journal:quest:completed', { quest: quest, xp: xpAmount });
        _notify('Quest Completed: ' + quest.title + (xpAmount > 0 ? ' (+' + xpAmount + ' XP)' : ''), 'success');

        console.log('[Journal] Quest completed: ' + quest.title);
        return true;
    }

    /**
     * Mark a quest as failed.
     * @param {string} id - Quest identifier.
     * @returns {boolean} True if failed.
     */
    function failQuest(id) {
        var quest = _quests[id];
        if (!quest) {
            console.warn('[Journal] failQuest: Quest "' + id + '" not found.');
            return false;
        }

        if (quest.status !== QUEST_STATUS.ACTIVE) {
            console.warn('[Journal] failQuest: Quest "' + id + '" is already ' + quest.status + '.');
            return false;
        }

        quest.status = QUEST_STATUS.FAILED;
        quest.completedAt = Date.now();

        _emit('journal:quest:failed', { quest: quest });
        _notify('Quest Failed: ' + quest.title, 'warning');

        console.log('[Journal] Quest failed: ' + quest.title);
        return true;
    }

    // ------------------------------------------------------------------
    //  Quest queries
    // ------------------------------------------------------------------

    /**
     * Get a specific quest by ID.
     * @param {string} id
     * @returns {Object|null}
     */
    function getQuest(id) {
        return _quests[id] || null;
    }

    /**
     * Get all active quests, sorted by type (main first, then side, then faction).
     * @returns {Object[]}
     */
    function getActiveQuests() {
        var result = [];
        var keys = Object.keys(_quests);
        for (var i = 0; i < keys.length; i++) {
            if (_quests[keys[i]].status === QUEST_STATUS.ACTIVE) {
                result.push(_quests[keys[i]]);
            }
        }
        return _sortQuests(result);
    }

    /**
     * Get all completed quests.
     * @returns {Object[]}
     */
    function getCompletedQuests() {
        var result = [];
        var keys = Object.keys(_quests);
        for (var i = 0; i < keys.length; i++) {
            if (_quests[keys[i]].status === QUEST_STATUS.COMPLETED) {
                result.push(_quests[keys[i]]);
            }
        }
        return _sortQuests(result);
    }

    /**
     * Get all failed quests.
     * @returns {Object[]}
     */
    function getFailedQuests() {
        var result = [];
        var keys = Object.keys(_quests);
        for (var i = 0; i < keys.length; i++) {
            if (_quests[keys[i]].status === QUEST_STATUS.FAILED) {
                result.push(_quests[keys[i]]);
            }
        }
        return _sortQuests(result);
    }

    /**
     * Sort quests by type priority: main > side > faction.
     */
    function _sortQuests(quests) {
        var priority = { main: 0, side: 1, faction: 2 };
        return quests.sort(function (a, b) {
            var pa = priority[a.type] !== undefined ? priority[a.type] : 9;
            var pb = priority[b.type] !== undefined ? priority[b.type] : 9;
            if (pa !== pb) return pa - pb;
            return (a.addedAt || 0) - (b.addedAt || 0);
        });
    }

    // ------------------------------------------------------------------
    //  Lore / Codex API
    // ------------------------------------------------------------------

    /**
     * Add a lore entry to the codex.
     * @param {string} id - Unique lore entry identifier.
     * @param {string} title - Display title.
     * @param {string} text - Full lore text.
     * @param {string} category - 'world', 'faction', 'tech', or 'people'.
     * @returns {boolean} True if added.
     */
    function addLoreEntry(id, title, text, category) {
        if (!id || !title) {
            console.warn('[Journal] addLoreEntry: id and title are required.');
            return false;
        }

        if (LORE_CATEGORIES.indexOf(category) === -1) {
            category = 'world';
        }

        // Mark as discovered if it was a pre-defined but undiscovered entry
        if (_lore[id] && _lore[id].discovered) {
            // Already discovered
            return false;
        }

        _lore[id] = {
            id: id,
            title: title,
            text: text,
            category: category,
            discovered: true,
            discoveredAt: Date.now()
        };

        _emit('journal:lore:discovered', { entry: _lore[id] });
        _notify('Codex Entry Discovered: ' + title, 'info');

        console.log('[Journal] Lore discovered: ' + title + ' (' + category + ')');
        return true;
    }

    /**
     * Get all lore entries, optionally filtered by category.
     * Returns both discovered and undiscovered entries.
     * @param {string} [category] - Filter by category; omit for all.
     * @returns {Object[]}
     */
    function getLoreEntries(category) {
        var result = [];
        var keys = Object.keys(_lore);

        for (var i = 0; i < keys.length; i++) {
            var entry = _lore[keys[i]];
            if (!category || entry.category === category) {
                result.push(entry);
            }
        }

        // Sort: discovered first, then alphabetical
        result.sort(function (a, b) {
            if (a.discovered !== b.discovered) {
                return a.discovered ? -1 : 1;
            }
            return a.title.localeCompare(b.title);
        });

        return result;
    }

    /**
     * Get all lore categories that have at least one entry.
     * @returns {string[]}
     */
    function getLoreCategories() {
        var cats = {};
        var keys = Object.keys(_lore);
        for (var i = 0; i < keys.length; i++) {
            cats[_lore[keys[i]].category] = true;
        }
        // Return in canonical order
        var result = [];
        for (var c = 0; c < LORE_CATEGORIES.length; c++) {
            if (cats[LORE_CATEGORIES[c]]) {
                result.push(LORE_CATEGORIES[c]);
            }
        }
        return result;
    }

    /**
     * Check if a specific lore entry has been discovered.
     * @param {string} id
     * @returns {boolean}
     */
    function isLoreDiscovered(id) {
        return _lore[id] ? _lore[id].discovered : false;
    }

    // ------------------------------------------------------------------
    //  Flag-based auto-tracking
    // ------------------------------------------------------------------

    /**
     * Called when a flag is set. Checks against quest rules and lore rules.
     * @param {Object} data - { flag: string, value: * }
     */
    function _onFlagSet(data) {
        if (!data || !data.flag) return;
        var flag = data.flag;

        // Check quest flag rules
        for (var i = 0; i < _QUEST_FLAG_RULES.length; i++) {
            var rule = _QUEST_FLAG_RULES[i];
            if (rule.flag !== flag) continue;

            switch (rule.action) {
                case 'add':
                    if (!_quests[rule.questId]) {
                        addQuest(rule.questId, rule.title, rule.description, rule.type, {
                            objective: rule.objective,
                            xpReward: rule.xp || 0
                        });
                    }
                    break;

                case 'update':
                    if (_quests[rule.questId] && _quests[rule.questId].status === QUEST_STATUS.ACTIVE) {
                        updateQuest(rule.questId, rule.objective);
                    }
                    break;

                case 'complete':
                    if (_quests[rule.questId] && _quests[rule.questId].status === QUEST_STATUS.ACTIVE) {
                        completeQuest(rule.questId, rule.xp);
                    }
                    break;

                case 'fail':
                    if (_quests[rule.questId] && _quests[rule.questId].status === QUEST_STATUS.ACTIVE) {
                        failQuest(rule.questId);
                    }
                    break;
            }
        }

        // Check lore discovery flags
        var loreDefs = Object.keys(_LORE_DEFINITIONS);
        for (var l = 0; l < loreDefs.length; l++) {
            var def = _LORE_DEFINITIONS[loreDefs[l]];
            if (def.discoverFlag === flag && _lore[def.id] && !_lore[def.id].discovered) {
                addLoreEntry(def.id, def.title, def.text, def.category);
            }
        }
    }

    // ------------------------------------------------------------------
    //  Serialization
    // ------------------------------------------------------------------

    /**
     * Serialize journal state for saving.
     * @returns {Object}
     */
    function serialize() {
        return {
            quests: JSON.parse(JSON.stringify(_quests)),
            lore: JSON.parse(JSON.stringify(_lore))
        };
    }

    /**
     * Deserialize journal state from a save.
     * @param {Object} data
     */
    function deserialize(data) {
        if (!data) return;

        if (data.quests) {
            _quests = data.quests;
        }

        if (data.lore) {
            _lore = data.lore;
        } else {
            // If no lore data in save, re-populate undiscovered entries
            _populateDefaultLore();
        }
    }

    // ------------------------------------------------------------------
    //  Initialization
    // ------------------------------------------------------------------

    /**
     * Populate the lore registry with all pre-defined entries as undiscovered.
     */
    function _populateDefaultLore() {
        var keys = Object.keys(_LORE_DEFINITIONS);
        for (var i = 0; i < keys.length; i++) {
            var def = _LORE_DEFINITIONS[keys[i]];
            if (!_lore[def.id]) {
                _lore[def.id] = {
                    id: def.id,
                    title: def.title,
                    text: def.text,
                    category: def.category,
                    discovered: false,
                    discoveredAt: null
                };
            }
        }
    }

    /**
     * Initialize the journal system.
     */
    function init() {
        _quests = {};
        _lore = {};

        // Populate default lore entries as undiscovered
        _populateDefaultLore();

        // Subscribe to flag events for auto-tracking
        var EB = _bus();
        if (EB) {
            _unsubs.push(EB.on('flag:set', _onFlagSet));
        }

        console.log('[Journal] Initialized. ' +
            Object.keys(_LORE_DEFINITIONS).length + ' lore entries registered.');
    }

    /**
     * Tear down event subscriptions.
     */
    function destroy() {
        for (var i = 0; i < _unsubs.length; i++) {
            if (typeof _unsubs[i] === 'function') {
                _unsubs[i]();
            }
        }
        _unsubs = [];
    }

    /**
     * Reset all journal data (e.g. on new game).
     */
    function reset() {
        _quests = {};
        _lore = {};
        _populateDefaultLore();
    }

    // ------------------------------------------------------------------
    //  Public API
    // ------------------------------------------------------------------

    return {
        // Constants
        QUEST_STATUS: QUEST_STATUS,
        QUEST_TYPES: QUEST_TYPES,
        LORE_CATEGORIES: LORE_CATEGORIES,

        // Lifecycle
        init: init,
        destroy: destroy,
        reset: reset,

        // Quest API
        addQuest: addQuest,
        updateQuest: updateQuest,
        completeQuest: completeQuest,
        failQuest: failQuest,
        getQuest: getQuest,
        getActiveQuests: getActiveQuests,
        getCompletedQuests: getCompletedQuests,
        getFailedQuests: getFailedQuests,

        // Lore API
        addLoreEntry: addLoreEntry,
        getLoreEntries: getLoreEntries,
        getLoreCategories: getLoreCategories,
        isLoreDiscovered: isLoreDiscovered,

        // Save/Load
        serialize: serialize,
        deserialize: deserialize
    };
})();
