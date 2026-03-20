/**
 * LATENCY - Narrative
 * ============================================================
 * The story node processor — the HEART of the game.
 *
 * Parses dot-delimited node IDs into file paths, loads story
 * JSON via AssetLoader, processes conditional text, filters
 * choices by player conditions, handles stat checks with dice
 * rolls, and executes story actions (flags, items, combat, etc).
 *
 * Depends on:
 *   Latency.EventBus
 *   Latency.AssetLoader
 *   Latency.ConditionEval
 *
 * Usage:
 *   var node = await Latency.Narrative.loadNode('shared.prologue.node_001');
 *   await Latency.Narrative.makeChoice(0);
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.Narrative = (function () {
    'use strict';

    // -----------------------------------------------------------------------
    // Internal state
    // -----------------------------------------------------------------------

    /** @type {Object|null} The currently loaded and processed story node. */
    var _currentNode = null;

    /** @type {string|null} The raw nodeId of the current node. */
    var _currentNodeId = null;

    /** @type {Object[]|null} The filtered choices for the current node. */
    var _currentChoices = null;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Parse a dot-delimited nodeId into a file path and node key.
     *
     * Format: "category.file.nodeKey"
     *   "shared.prologue.node_001"  -> file "story/shared/prologue", key "node_001"
     *   "cyborg.act1.node_003"      -> file "story/cyborg/act1",     key "node_003"
     *
     * Supports deeper paths with 3+ segments — the last segment is always
     * the node key and everything before it forms the file path.
     *
     * @param {string} nodeId
     * @returns {{filePath: string, nodeKey: string}}
     */
    function _parseNodeId(nodeId) {
        var parts = nodeId.split('.');

        if (parts.length < 3) {
            throw new Error(
                '[Narrative] Invalid nodeId "' + nodeId +
                '". Expected format: "category.file.nodeKey"'
            );
        }

        var nodeKey = parts[parts.length - 1];
        var pathParts = parts.slice(0, parts.length - 1);

        return {
            filePath: 'story/' + pathParts.join('/'),
            nodeKey: nodeKey
        };
    }

    /**
     * Retrieve the current player character object.
     * Looks for it on Latency.GameState or Latency.Player — adapt as needed.
     * @returns {Object}
     */
    function _getCharacter() {
        // Support multiple possible locations for the character data
        if (window.Latency.CharacterSystem && typeof window.Latency.CharacterSystem.getCharacter === 'function') {
            var csChar = window.Latency.CharacterSystem.getCharacter();
            if (csChar) { return csChar; }
        }
        if (window.Latency.GameState && window.Latency.GameState.character) {
            return window.Latency.GameState.character;
        }
        if (window.Latency.Player && window.Latency.Player.character) {
            return window.Latency.Player.character;
        }
        if (window.Latency.Player) {
            return window.Latency.Player;
        }
        // Fallback: empty character so things don't crash during early dev
        return {
            name: 'Unknown',
            race: '',
            job: '',
            backstory: '',
            stats: {},
            flags: [],
            factions: {},
            inventory: [],
            traits: [],
            experience: 0,
            health: 100,
            maxHealth: 100
        };
    }

    /**
     * Emit an EventBus event if the EventBus is available.
     * @param {string} event
     * @param {*} [data]
     */
    function _emit(event, data) {
        if (window.Latency.EventBus && typeof window.Latency.EventBus.emit === 'function') {
            window.Latency.EventBus.emit(event, data);
        }
    }

    /**
     * Roll a d20 (1-20).
     * @returns {number}
     */
    function _rollD20() {
        return Math.floor(Math.random() * 20) + 1;
    }

    /**
     * Calculate the stat modifier for a given stat value.
     * Uses a simple floor((stat - 10) / 2) formula.
     * @param {number} statValue
     * @returns {number}
     */
    function _statModifier(statValue) {
        return Math.floor((statValue - 10) / 2);
    }

    // -----------------------------------------------------------------------
    // Text processing
    // -----------------------------------------------------------------------

    /**
     * Replace template variables in a string.
     *
     * Supports dotted paths:
     *   "{{character.name}}"             -> character.name
     *   "{{character.stats.strength}}"   -> character.stats.strength
     *
     * @param {string} text - Text containing {{...}} placeholders.
     * @param {Object} character - Player character data.
     * @returns {string}
     */
    function interpolate(text, character) {
        if (typeof text !== 'string') {
            return text;
        }

        return text.replace(/\{\{(.+?)\}\}/g, function (match, path) {
            var trimmed = path.trim();

            // Strip leading "character." if present — we resolve against character anyway
            if (trimmed.indexOf('character.') === 0) {
                trimmed = trimmed.substring('character.'.length);
            }

            // Walk the dotted path on the character object
            var parts = trimmed.split('.');
            var current = character;

            for (var i = 0; i < parts.length; i++) {
                if (current === null || current === undefined) {
                    return match; // leave placeholder if path is invalid
                }
                current = current[parts[i]];
            }

            return (current !== null && current !== undefined) ? String(current) : match;
        });
    }

    /**
     * Process an array of text blocks, resolving conditional entries and
     * interpolating template variables.
     *
     * A text block can be:
     *   - A plain string: always included
     *   - An object with { condition, text }: included only if condition passes
     *     Condition shorthand: "race:cyborg" -> { race: "cyborg" }
     *
     * @param {Array<string|Object>} textArray
     * @param {Object} character
     * @returns {string[]} Array of resolved text strings.
     */
    function processText(textArray, character) {
        if (!Array.isArray(textArray)) {
            if (typeof textArray === 'string') {
                return [interpolate(textArray, character)];
            }
            return [];
        }

        var result = [];

        for (var i = 0; i < textArray.length; i++) {
            var block = textArray[i];

            // Plain string — always include
            if (typeof block === 'string') {
                result.push(interpolate(block, character));
                continue;
            }

            // Conditional text object
            if (block && typeof block === 'object' && block.text !== undefined) {
                var conditionPasses = true;

                if (block.condition !== undefined) {
                    var cond = _parseShorthandCondition(block.condition);
                    conditionPasses = window.Latency.ConditionEval.evaluate(cond, character);
                }
                if (block.conditions !== undefined) {
                    var conds = block.conditions;
                    if (Array.isArray(conds)) {
                        conds = conds.map(_parseShorthandCondition);
                    } else {
                        conds = _parseShorthandCondition(conds);
                    }
                    conditionPasses = window.Latency.ConditionEval.evaluate(conds, character);
                }

                if (conditionPasses) {
                    result.push(interpolate(block.text, character));
                }
            }
        }

        return result;
    }

    /**
     * Parse a shorthand condition string into a condition object.
     * Format: "type:value"  e.g. "race:cyborg" -> { race: "cyborg" }
     *                            "flag:met_razor" -> { flag: "met_razor" }
     *
     * If the input is already an object, returns it as-is.
     *
     * @param {string|Object} cond
     * @returns {Object}
     */
    function _parseShorthandCondition(cond) {
        if (typeof cond !== 'string') {
            return cond;
        }

        var colonIdx = cond.indexOf(':');
        if (colonIdx === -1) {
            // Treat the entire string as a flag check
            return { flag: cond };
        }

        var type = cond.substring(0, colonIdx).trim();
        var value = cond.substring(colonIdx + 1).trim();

        var obj = {};
        obj[type] = value;
        return obj;
    }

    // -----------------------------------------------------------------------
    // Choice filtering
    // -----------------------------------------------------------------------

    /**
     * Filter an array of choices, returning only those whose conditions
     * the character satisfies. Annotates each choice with stat-check
     * metadata when applicable.
     *
     * @param {Object[]} choices - Raw choices from the story node.
     * @param {Object} character - Player character data.
     * @returns {Object[]} Filtered and annotated choices.
     */
    function filterChoices(choices, character) {
        if (!Array.isArray(choices)) {
            return [];
        }

        var filtered = [];

        for (var i = 0; i < choices.length; i++) {
            var choice = choices[i];

            // Evaluate visibility conditions
            var conditions = choice.conditions || choice.condition || null;
            if (conditions !== null) {
                var parsed = Array.isArray(conditions)
                    ? conditions.map(_parseShorthandCondition)
                    : _parseShorthandCondition(conditions);

                if (!window.Latency.ConditionEval.evaluate(parsed, character)) {
                    continue;
                }
            }

            // Clone the choice so we don't mutate the original data
            var filtered_choice = {};
            for (var key in choice) {
                if (choice.hasOwnProperty(key)) {
                    filtered_choice[key] = choice[key];
                }
            }

            // Annotate stat-check metadata
            if (choice.statCheck) {
                filtered_choice.isStatCheck = true;
                filtered_choice.requiredStat = choice.statCheck.stat;
                filtered_choice.dc = Number(choice.statCheck.dc) || 10;

                // Calculate current modifier for UI display
                var statValue = Number((character.stats || {})[choice.statCheck.stat]) || 10;
                filtered_choice.modifier = _statModifier(statValue);
            } else {
                filtered_choice.isStatCheck = false;
            }

            // Interpolate the choice text
            if (filtered_choice.text) {
                filtered_choice.text = interpolate(filtered_choice.text, character);
            }

            // Preserve the original index so makeChoice can reference it
            filtered_choice._originalIndex = i;

            filtered.push(filtered_choice);
        }

        return filtered;
    }

    // -----------------------------------------------------------------------
    // Action execution
    // -----------------------------------------------------------------------

    /**
     * Execute an array of story actions. These modify the game state
     * (flags, stats, inventory, etc.) and can trigger engine events
     * (combat, cutscenes, music changes).
     *
     * @param {Object[]} actions - Array of action descriptors.
     */
    function executeActions(actions) {
        if (!Array.isArray(actions) || actions.length === 0) {
            return;
        }

        var character = _getCharacter();

        for (var i = 0; i < actions.length; i++) {
            var action = actions[i];
            var actionType = action ? (action.type || action.action) : null;
            if (!action || !actionType) {
                continue;
            }

            switch (actionType) {

                // ── Flags ─────────────────────────────────────────────
                case 'set_flag':
                    if (!character.flags) { character.flags = []; }
                    if (character.flags.indexOf(action.flag) === -1) {
                        character.flags.push(action.flag);
                    }
                    _emit('narrative:flag', { flag: action.flag, set: true });
                    break;

                case 'remove_flag':
                    if (character.flags) {
                        var flagIdx = character.flags.indexOf(action.flag);
                        if (flagIdx !== -1) {
                            character.flags.splice(flagIdx, 1);
                        }
                    }
                    _emit('narrative:flag', { flag: action.flag, set: false });
                    break;

                // ── Experience ────────────────────────────────────────
                case 'add_experience':
                case 'add_xp':
                    if (window.Latency.CharacterSystem && typeof window.Latency.CharacterSystem.addExperience === 'function') {
                        window.Latency.CharacterSystem.addExperience(Number(action.amount || 0));
                    } else {
                        character.experience = (character.experience || 0) + Number(action.amount || 0);
                    }
                    _emit('narrative:experience', {
                        amount: action.amount,
                        total: character.experience
                    });
                    break;

                // ── Currency ─────────────────────────────────────────
                case 'modify_currency':
                    var currencyAmount = Number(action.amount || 0);
                    if (window.Latency.Inventory) {
                        if (currencyAmount >= 0) {
                            window.Latency.Inventory.addCredits(currencyAmount);
                        } else {
                            window.Latency.Inventory.spendCredits(-currencyAmount);
                        }
                    }
                    _emit('narrative:currency', { amount: currencyAmount });
                    break;

                // ── Stats ─────────────────────────────────────────────
                case 'modify_stat':
                    if (!character.stats) { character.stats = {}; }
                    var oldStat = Number(character.stats[action.stat]) || 0;
                    character.stats[action.stat] = oldStat + Number(action.amount || 0);
                    _emit('narrative:stat', {
                        stat: action.stat,
                        oldValue: oldStat,
                        newValue: character.stats[action.stat]
                    });
                    break;

                // ── Faction reputation ────────────────────────────────
                case 'modify_reputation':
                    if (window.Latency.FactionSystem && typeof window.Latency.FactionSystem.modifyReputation === 'function') {
                        window.Latency.FactionSystem.modifyReputation(action.faction, Number(action.amount || 0));
                    } else {
                        if (!character.factions) { character.factions = {}; }
                        var oldRep = Number(character.factions[action.faction]) || 0;
                        character.factions[action.faction] = oldRep + Number(action.amount || 0);
                    }
                    _emit('narrative:reputation', {
                        faction: action.faction,
                        amount: Number(action.amount || 0)
                    });
                    break;

                // ── Inventory ─────────────────────────────────────────
                case 'add_item':
                    var addItemId = action.itemId || (action.item && action.item.id) || action.item;
                    if (window.Latency.Inventory && typeof window.Latency.Inventory.addItem === 'function') {
                        window.Latency.Inventory.addItem(addItemId);
                    } else {
                        if (!character.inventory) { character.inventory = []; }
                        character.inventory.push({ id: addItemId, name: action.name || addItemId });
                    }
                    _emit('narrative:item', { action: 'add', itemId: addItemId });
                    break;

                case 'remove_item':
                    var rmItemId = action.itemId || (action.item && action.item.id) || action.item;
                    if (window.Latency.Inventory && typeof window.Latency.Inventory.removeItem === 'function') {
                        window.Latency.Inventory.removeItem(rmItemId);
                    } else if (character.inventory) {
                        for (var r = 0; r < character.inventory.length; r++) {
                            var inv = character.inventory[r];
                            if (inv === rmItemId || (inv && inv.id === rmItemId)) {
                                character.inventory.splice(r, 1);
                                break;
                            }
                        }
                    }
                    _emit('narrative:item', { action: 'remove', itemId: rmItemId });
                    break;

                // ── Health ────────────────────────────────────────────
                case 'heal':
                    var healAmount = Number(action.amount) || 0;
                    var maxHp = character.maxHealth || 100;
                    var oldHp = character.health || 0;
                    character.health = Math.min(oldHp + healAmount, maxHp);
                    _emit('narrative:heal', {
                        amount: healAmount,
                        oldHealth: oldHp,
                        newHealth: character.health
                    });
                    break;

                case 'damage':
                    var dmgAmount = Number(action.amount) || 0;
                    var beforeHp = character.health || 0;
                    character.health = Math.max(beforeHp - dmgAmount, 0);
                    _emit('narrative:damage', {
                        amount: dmgAmount,
                        oldHealth: beforeHp,
                        newHealth: character.health
                    });
                    break;

                // ── Combat trigger ────────────────────────────────────
                case 'start_combat':
                    if (window.Latency.Combat && action.enemyId) {
                        var combatContext = {
                            returnNodeId: action.returnNodeId || action.onWin || action.winNext || null,
                            onFleeNodeId: action.onFlee || null,
                            onLoseNodeId: action.onLose || action.loseNext || null
                        };
                        window.Latency.Combat.initiate(action.enemyId, combatContext);
                        if (window.Latency.StateMachine) {
                            window.Latency.StateMachine.transition('combat');
                        }
                    }
                    break;

                // ── Cutscene ──────────────────────────────────────────
                case 'play_cutscene':
                    _emit('cutscene:play', {
                        id: action.cutsceneId || action.id,
                        data: action.data || null
                    });
                    break;

                // ── Music ─────────────────────────────────────────────
                case 'change_music':
                    if (window.Latency.MusicManager) {
                        if (action.trackIndex !== undefined) {
                            window.Latency.MusicManager.skipTo(action.trackIndex);
                        } else if (action.action === 'fadeOut') {
                            window.Latency.MusicManager.fadeOut(action.duration);
                        } else if (action.action === 'fadeIn') {
                            window.Latency.MusicManager.fadeIn(action.duration);
                        } else if (action.action === 'stop') {
                            window.Latency.MusicManager.stop();
                        } else if (action.action === 'play') {
                            window.Latency.MusicManager.play();
                        }
                    }
                    _emit('narrative:music', action);
                    break;

                // ── Job / class ───────────────────────────────────────
                case 'set_job':
                    character.job = action.job;
                    _emit('narrative:job', { job: action.job });
                    break;

                // ── Relationship ──────────────────────────────────────
                case 'modify_relationship':
                    if (!character.relationships) { character.relationships = {}; }
                    var oldRelVal = Number(character.relationships[action.npc]) || 0;
                    character.relationships[action.npc] = oldRelVal + Number(action.amount || 0);
                    _emit('narrative:relationship', {
                        npc: action.npc,
                        oldValue: oldRelVal,
                        newValue: character.relationships[action.npc]
                    });
                    break;

                default:
                    console.warn('[Narrative] Unknown action type: "' + actionType + '"');
                    break;
            }
        }
    }

    // -----------------------------------------------------------------------
    // Core node loading
    // -----------------------------------------------------------------------

    /**
     * Load, process, and return a story node.
     *
     * 1. Parse the nodeId into a file path and node key
     * 2. Load the story file via AssetLoader
     * 3. Execute onEnter actions
     * 4. Process conditional text
     * 5. Filter choices by conditions
     * 6. Emit story:node event
     * 7. Auto-save bookmark
     * 8. Return the processed node
     *
     * @param {string} nodeId - Dot-delimited node identifier.
     * @returns {Promise<Object>} The processed story node.
     */
    async function loadNode(nodeId) {
        var parsed = _parseNodeId(nodeId);
        var character = _getCharacter();

        // 1. Load the story file
        var fileData = await window.Latency.AssetLoader.loadStoryFile(parsed.filePath);

        // 2. Find the node in the file (support nested "nodes" container or flat)
        var rawNode = null;
        if (fileData.nodes && fileData.nodes[parsed.nodeKey]) {
            rawNode = fileData.nodes[parsed.nodeKey];
        } else if (fileData[parsed.nodeKey]) {
            rawNode = fileData[parsed.nodeKey];
        }

        if (!rawNode) {
            throw new Error(
                '[Narrative] Node "' + parsed.nodeKey + '" not found in "' +
                parsed.filePath + '.json"'
            );
        }

        // 3. Execute onEnter actions (before processing text, so flags can
        //    affect conditional text in the same node)
        if (rawNode.onEnter) {
            executeActions(rawNode.onEnter);
        }

        // Re-fetch character in case onEnter actions modified it
        character = _getCharacter();

        // 4. Process text
        var processedText = processText(rawNode.text || rawNode.content || [], character);

        // 5. Filter choices
        var processedChoices = filterChoices(rawNode.choices || [], character);

        // 6. Build the processed node
        var processedNode = {
            id: nodeId,
            text: processedText,
            choices: processedChoices,
            speaker: rawNode.speaker || null,
            mood: rawNode.mood || null,
            ascii: rawNode.ascii || null,
            music: rawNode.music !== undefined ? rawNode.music : null,
            background: rawNode.background || null,
            raw: rawNode
        };

        _currentNode = processedNode;
        _currentNodeId = nodeId;
        _currentChoices = processedChoices;

        // 7. Emit event for UI and other systems
        _emit('story:node', {
            nodeId: nodeId,
            node: processedNode
        });

        // 8. Auto-save bookmark
        _emit('autosave:request', {
            nodeId: nodeId,
            timestamp: Date.now()
        });

        // 9. Handle music change if the node specifies one
        if (rawNode.music !== undefined && rawNode.music !== null && window.Latency.MusicManager) {
            if (typeof rawNode.music === 'number') {
                window.Latency.MusicManager.skipTo(rawNode.music);
            } else if (typeof rawNode.music === 'string' && window.Latency.MusicManager.playByCategory) {
                window.Latency.MusicManager.playByCategory(rawNode.music);
            }
        }

        return processedNode;
    }

    // -----------------------------------------------------------------------
    // Choice execution
    // -----------------------------------------------------------------------

    /**
     * Execute a player's choice by index (relative to the filtered list).
     *
     * If the choice involves a stat check, a d20 is rolled, the modifier
     * is applied, and the result is compared against the DC. On success
     * the choice's 'next' node is loaded; on failure, 'failNext' is loaded.
     *
     * Non-stat-check choices simply execute their consequences and load
     * the next node.
     *
     * @param {number} choiceIndex - Index into the current filtered choices array.
     * @returns {Promise<Object|null>} The next processed node, or null.
     */
    async function makeChoice(choiceIndex) {
        if (!_currentChoices || choiceIndex < 0 || choiceIndex >= _currentChoices.length) {
            console.error('[Narrative] Invalid choice index: ' + choiceIndex);
            return null;
        }

        var choice = _currentChoices[choiceIndex];
        var character = _getCharacter();
        var nextNodeId = choice.next || null;

        // ── Stat check ────────────────────────────────────────────────────
        if (choice.isStatCheck && choice.statCheck) {
            var stat = choice.statCheck.stat;
            var dc = choice.dc || Number(choice.statCheck.dc) || 10;
            var statValue = Number((character.stats || {})[stat]) || 10;
            var modifier = _statModifier(statValue);
            var roll = _rollD20();
            var total = roll + modifier;
            var success = total >= dc;

            _emit('dice:roll', {
                stat: stat,
                roll: roll,
                modifier: modifier,
                total: total,
                dc: dc,
                success: success,
                choiceIndex: choiceIndex,
                choiceText: choice.text
            });

            // Execute choice.actions regardless of pass/fail
            if (choice.actions) {
                executeActions(choice.actions);
            }

            if (success) {
                // Execute success consequences
                if (choice.consequences) {
                    executeActions(choice.consequences);
                }
                if (choice.onSuccess) {
                    executeActions(choice.onSuccess);
                }
                nextNodeId = choice.next || nextNodeId;
            } else {
                // Execute failure consequences
                if (choice.onFailure) {
                    executeActions(choice.onFailure);
                }
                nextNodeId = choice.failNext || choice.next || nextNodeId;
            }
        } else {
            // ── Normal choice (no stat check) ─────────────────────────────
            if (choice.consequences) {
                executeActions(choice.consequences);
            }
            if (choice.actions) {
                executeActions(choice.actions);
            }
        }

        // Emit the choice event
        _emit('story:choice', {
            choiceIndex: choiceIndex,
            choice: choice,
            nodeId: _currentNodeId
        });

        // Load the next node (if specified)
        if (nextNodeId) {
            return loadNode(nextNodeId);
        }

        return null;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    return {
        /** @internal exposed for testing/debugging */
        _currentNode: _currentNode,
        _currentNodeId: _currentNodeId,

        loadNode: loadNode,
        processText: processText,
        filterChoices: filterChoices,
        makeChoice: makeChoice,
        executeActions: executeActions,
        interpolate: interpolate,

        /**
         * @returns {Object|null} The currently loaded processed node.
         */
        getCurrentNode: function () { return _currentNode; },

        /**
         * @returns {string|null} The current node ID.
         */
        getCurrentNodeId: function () { return _currentNodeId; }
    };
})();
