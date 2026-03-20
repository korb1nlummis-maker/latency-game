window.Latency = window.Latency || {};

window.Latency.AchievementsData = (function() {
    'use strict';

    var _achievements = {};

    // ── Race names for generation ──
    var RACES = ['human','orc','wood_elf','dark_elf','dwarf','half_giant','cyborg','synth','shadowkin','voidborn'];
    var RACE_NAMES = { human:'Human', orc:'Orc', wood_elf:'Wood Elf', dark_elf:'Dark Elf', dwarf:'Dwarf', half_giant:'Half-Giant', cyborg:'Cyborg', synth:'Synth', shadowkin:'Shadowkin', voidborn:'Voidborn' };
    var FACTIONS = ['ironCollective','neonCourt','circuitSaints','ghostSyndicate','ashenCircle'];
    var FACTION_NAMES = { ironCollective:'The Iron Collective', neonCourt:'The Neon Court', circuitSaints:'The Circuit Saints', ghostSyndicate:'The Ghost Syndicate', ashenCircle:'The Ashen Circle' };
    var JOBS = ['enforcer','hacker','medic','smuggler','gladiator','diplomat'];
    var JOB_NAMES = { enforcer:'Enforcer', hacker:'Hacker', medic:'Medic', smuggler:'Smuggler', gladiator:'Gladiator', diplomat:'Diplomat' };

    function _add(id, name, desc, category, secret, condition, reward, rarity) {
        _achievements[id] = {
            id: id, name: name, description: desc, category: category,
            secret: secret || false, hint: null,
            condition: condition,
            reward: reward || { xp: 25 },
            rarity: rarity || 'common'
        };
    }

    // ══════════════════════════════════════════
    // RACE ACHIEVEMENTS (10 races x 30 each = 300)
    // ══════════════════════════════════════════
    RACES.forEach(function(race) {
        var rn = RACE_NAMES[race];
        var cat = 'race';

        // Complete each act (5 per race = 50 total)
        for (var act = 1; act <= 5; act++) {
            _add(race + '_act' + act, rn + ': Act ' + act, 'Complete Act ' + act + ' as ' + rn + '.', cat, false,
                { type: 'combo', all: [{ type: 'flag', flag: 'act' + act + '.completed' }, { type: 'race', race: race }] },
                { xp: 100 * act }, act <= 2 ? 'common' : act <= 4 ? 'uncommon' : 'rare');
        }

        // Kill milestones (6 per race = 60 total)
        [10, 25, 50, 100, 250, 500].forEach(function(n, i) {
            var rarities = ['common', 'common', 'uncommon', 'uncommon', 'rare', 'epic'];
            _add(race + '_kills_' + n, rn + ': ' + n + ' Kills', 'Defeat ' + n + ' enemies as ' + rn + '.', cat, false,
                { type: 'combo', all: [{ type: 'count', counter: 'kills', min: n }, { type: 'race', race: race }] },
                { xp: n * 2 }, rarities[i]);
        });

        // Level milestones (5 per race = 50 total)
        [5, 10, 15, 20, 25].forEach(function(lvl, i) {
            var rarities = ['common', 'uncommon', 'uncommon', 'rare', 'epic'];
            _add(race + '_level_' + lvl, rn + ': Level ' + lvl, 'Reach level ' + lvl + ' as ' + rn + '.', cat, false,
                { type: 'combo', all: [{ type: 'stat', stat: 'level', min: lvl }, { type: 'race', race: race }] },
                { xp: lvl * 20 }, rarities[i]);
        });

        // Join each faction (5 per race = 50 total)
        FACTIONS.forEach(function(fac) {
            _add(race + '_faction_' + fac, rn + ': ' + FACTION_NAMES[fac] + ' Ally', 'Reach allied status with ' + FACTION_NAMES[fac] + ' as ' + rn + '.', cat, false,
                { type: 'combo', all: [{ type: 'faction', faction: fac, tier: 'allied' }, { type: 'race', race: race }] },
                { xp: 150 }, 'rare');
        });

        // Complete each job as race (6 per race = 60 total)
        JOBS.forEach(function(job) {
            _add(race + '_job_' + job, rn + ': Master ' + JOB_NAMES[job], 'Reach rank 3 in ' + JOB_NAMES[job] + ' career as ' + rn + '.', cat, false,
                { type: 'combo', all: [{ type: 'flag', flag: 'job.' + job + '.rank_3' }, { type: 'race', race: race }] },
                { xp: 200 }, 'rare');
        });

        // Use racial ability milestones (3 per race = 30 total)
        [10, 50, 100].forEach(function(n, i) {
            var rarities = ['uncommon', 'rare', 'epic'];
            _add(race + '_ability_' + n, rn + ': Ability Master (' + n + ')', 'Use racial ability ' + n + ' times as ' + rn + '.', cat, false,
                { type: 'combo', all: [{ type: 'count', counter: 'racial_ability_uses', min: n }, { type: 'race', race: race }] },
                { xp: n * 3 }, rarities[i]);
        });
    });

    // ══════════════════════════════════════════
    // COMBAT ACHIEVEMENTS (~120)
    // ══════════════════════════════════════════

    // Hand-crafted combat achievements (20)
    var combatAchs = [
        ['first_blood', 'First Blood', 'Win your first combat.', 'common'],
        ['untouchable', 'Untouchable', 'Win a combat without taking damage.', 'rare'],
        ['nat20_streak', 'Critical Streak', 'Roll 3 natural 20s in one combat.', 'epic'],
        ['pacifist_act1', 'Pacifist', 'Complete Act 1 without killing anyone.', 'epic'],
        ['genocide', 'No Mercy', 'Kill every killable NPC in the game.', 'legendary', true],
        ['overkill', 'Overkill', 'Deal 50+ damage in a single hit.', 'uncommon'],
        ['close_call', 'Close Call', 'Win a combat with 1 HP remaining.', 'rare'],
        ['flee_master', 'Tactical Retreat', 'Successfully flee from 10 combats.', 'uncommon'],
        ['defender', 'Iron Defense', 'Use Defend 50 times in combat.', 'uncommon'],
        ['item_warrior', 'Combat Chemist', 'Use 25 items during combat.', 'uncommon'],
        ['boss_slayer', 'Boss Slayer', 'Defeat a level 19+ enemy.', 'epic'],
        ['underdog', 'Underdog', 'Defeat an enemy 10+ levels above you.', 'legendary'],
        ['flawless_10', 'Flawless Fighter', 'Win 10 combats without taking damage.', 'epic'],
        ['crit_king', 'Critical King', 'Land 100 critical hits total.', 'rare'],
        ['survivor', 'Survivor', 'Win a combat while poisoned.', 'uncommon'],
        ['one_punch', 'One Punch', 'Kill an enemy in a single hit.', 'rare'],
        ['combo_master', 'Combo Master', 'Use 3 different abilities in one combat.', 'uncommon'],
        ['fumble_recovery', 'Fumble Recovery', 'Win after rolling a natural 1.', 'uncommon'],
        ['tank', 'Living Shield', 'Take 1000 total damage across all combats.', 'rare'],
        ['glass_cannon', 'Glass Cannon', 'Deal 500 total damage with under 20 max HP.', 'epic']
    ];
    combatAchs.forEach(function(a) {
        _add(a[0], a[1], a[2], 'combat', a[4] || false, { type: 'flag', flag: 'achievement.' + a[0] }, { xp: 50 }, a[3]);
    });

    // Kill milestones (14)
    [1, 5, 10, 25, 50, 75, 100, 150, 200, 300, 400, 500, 750, 1000].forEach(function(k) {
        _add('total_kills_' + k, k + ' Kills', 'Defeat ' + k + ' enemies total.', 'combat', false,
            { type: 'count', counter: 'total_kills', min: k }, { xp: k * 2 },
            k < 50 ? 'common' : k < 200 ? 'uncommon' : k < 500 ? 'rare' : 'epic');
    });

    // Damage dealt milestones (10)
    [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000].forEach(function(d) {
        _add('total_damage_' + d, 'Damage Dealer (' + d + ')', 'Deal ' + d + ' total damage.', 'combat', false,
            { type: 'count', counter: 'total_damage_dealt', min: d }, { xp: Math.min(d, 500) },
            d < 500 ? 'common' : d < 2500 ? 'uncommon' : d < 25000 ? 'rare' : 'epic');
    });

    // Heal milestones (8)
    [50, 100, 250, 500, 1000, 2500, 5000, 10000].forEach(function(h) {
        _add('total_healed_' + h, 'Healer (' + h + ')', 'Heal ' + h + ' total HP.', 'combat', false,
            { type: 'count', counter: 'total_healed', min: h }, { xp: Math.min(h, 500) },
            h < 250 ? 'common' : h < 1000 ? 'uncommon' : h < 5000 ? 'rare' : 'epic');
    });

    // Damage taken milestones (8)
    [100, 250, 500, 1000, 2500, 5000, 10000, 25000].forEach(function(t) {
        _add('total_damage_taken_' + t, 'Damage Sponge (' + t + ')', 'Take ' + t + ' total damage.', 'combat', false,
            { type: 'count', counter: 'total_damage_taken', min: t }, { xp: Math.min(t, 500) },
            t < 500 ? 'common' : t < 2500 ? 'uncommon' : t < 10000 ? 'rare' : 'epic');
    });

    // Consecutive wins (6)
    [3, 5, 10, 15, 20, 50].forEach(function(n, i) {
        var rarities = ['common', 'uncommon', 'uncommon', 'rare', 'epic', 'legendary'];
        _add('win_streak_' + n, n + ' Win Streak', 'Win ' + n + ' combats in a row without losing.', 'combat', false,
            { type: 'count', counter: 'win_streak', min: n }, { xp: n * 10 }, rarities[i]);
    });

    // Combat turns survived (6)
    [50, 100, 250, 500, 1000, 5000].forEach(function(n) {
        _add('combat_turns_' + n, n + ' Turns', 'Survive ' + n + ' total combat turns.', 'combat', false,
            { type: 'count', counter: 'combat_turns', min: n }, { xp: Math.min(n, 300) },
            n < 250 ? 'common' : n < 1000 ? 'uncommon' : 'rare');
    });

    // Abilities used milestones (6)
    [10, 25, 50, 100, 250, 500].forEach(function(n) {
        _add('abilities_used_' + n, 'Ability User (' + n + ')', 'Use ' + n + ' abilities in combat.', 'combat', false,
            { type: 'count', counter: 'abilities_used', min: n }, { xp: n * 2 },
            n < 50 ? 'common' : n < 250 ? 'uncommon' : 'rare');
    });

    // Items used in combat (6)
    [5, 10, 25, 50, 100, 250].forEach(function(n) {
        _add('combat_items_' + n, 'Item Tactician (' + n + ')', 'Use ' + n + ' items during combat.', 'combat', false,
            { type: 'count', counter: 'combat_items_used', min: n }, { xp: n * 2 },
            n < 25 ? 'common' : n < 100 ? 'uncommon' : 'rare');
    });

    // Dodges (6)
    [5, 10, 25, 50, 100, 250].forEach(function(n) {
        _add('dodges_' + n, 'Dodge Master (' + n + ')', 'Dodge ' + n + ' attacks in combat.', 'combat', false,
            { type: 'count', counter: 'dodges', min: n }, { xp: n * 2 },
            n < 25 ? 'common' : n < 100 ? 'uncommon' : 'rare');
    });

    // Crits landed (6)
    [5, 10, 25, 50, 100, 250].forEach(function(n) {
        _add('crits_landed_' + n, 'Critical Striker (' + n + ')', 'Land ' + n + ' critical hits.', 'combat', false,
            { type: 'count', counter: 'crits_landed', min: n }, { xp: n * 3 },
            n < 25 ? 'common' : n < 100 ? 'uncommon' : 'rare');
    });

    // ══════════════════════════════════════════
    // EXPLORATION ACHIEVEMENTS (~100)
    // ══════════════════════════════════════════
    var LOCATIONS = [
        'lower_slums', 'upper_slums', 'sewer_network', 'industrial_zone', 'the_foundry',
        'black_market_bazaar', 'abandoned_subway', 'scrap_yards', 'market_district', 'residential_blocks',
        'transit_hub', 'medical_quarter', 'deep_net_cafe', 'job_center', 'arena_district',
        'neon_strip', 'cloud_towers', 'corporate_spires', 'the_spire', 'stack_clinic',
        'skyport', 'gardens_of_eternity', 'observatory', 'senate_hall', 'tunnel_network',
        'the_ossuary', 'hidden_labs', 'vault', 'catacombs', 'void_chamber'
    ];

    // Visit each location (30)
    LOCATIONS.forEach(function(loc) {
        var name = loc.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
        _add('visit_' + loc, 'Discovered: ' + name, 'Visit ' + name + ' for the first time.', 'exploration', false,
            { type: 'flag', flag: 'visited.' + loc }, { xp: 25 }, 'common');
    });

    // Visit all locations (1)
    _add('explorer_all', 'World Explorer', 'Visit every location in the megacity.', 'exploration', false,
        { type: 'flag', flag: 'visited_all_locations' }, { xp: 500 }, 'epic');

    // Discovery milestones (6)
    [5, 10, 15, 20, 25, 30].forEach(function(n, i) {
        var rarities = ['common', 'common', 'uncommon', 'uncommon', 'rare', 'epic'];
        _add('explore_' + n, 'Explorer (' + n + ')', 'Discover ' + n + ' locations.', 'exploration', false,
            { type: 'count', counter: 'locations_visited', min: n }, { xp: n * 10 }, rarities[i]);
    });

    // Secret area discoveries (30)
    for (var si = 1; si <= 30; si++) {
        _add('secret_area_' + si, 'Hidden Place #' + si, 'Find hidden area #' + si + '.', 'exploration', true,
            { type: 'flag', flag: 'secret_area.' + si }, { xp: 75 }, 'rare');
    }

    // Steps walked milestones (7)
    [100, 500, 1000, 5000, 10000, 25000, 50000].forEach(function(n) {
        _add('steps_' + n, 'Traveler (' + n + ')', 'Walk ' + n + ' steps.', 'exploration', false,
            { type: 'count', counter: 'steps_walked', min: n }, { xp: Math.min(n / 10, 300) },
            n < 1000 ? 'common' : n < 10000 ? 'uncommon' : n < 25000 ? 'rare' : 'epic');
    });

    // Fast travel uses (5)
    [1, 10, 25, 50, 100].forEach(function(n, i) {
        var rarities = ['common', 'common', 'uncommon', 'rare', 'epic'];
        _add('fast_travel_' + n, 'Fast Traveler (' + n + ')', 'Use fast travel ' + n + ' times.', 'exploration', false,
            { type: 'count', counter: 'fast_travel_uses', min: n }, { xp: n * 3 }, rarities[i]);
    });

    // NPC conversations (6)
    [1, 10, 25, 50, 100, 200].forEach(function(n) {
        _add('conversations_' + n, 'Conversationalist (' + n + ')', 'Have ' + n + ' conversations with NPCs.', 'exploration', false,
            { type: 'count', counter: 'npc_conversations', min: n }, { xp: n * 2 },
            n < 25 ? 'common' : n < 100 ? 'uncommon' : 'rare');
    });

    // Shops visited (5)
    [1, 3, 5, 8, 12].forEach(function(n, i) {
        var rarities = ['common', 'common', 'uncommon', 'rare', 'epic'];
        _add('shops_visited_' + n, 'Window Shopper (' + n + ')', 'Visit ' + n + ' different shops.', 'exploration', false,
            { type: 'count', counter: 'shops_visited', min: n }, { xp: n * 15 }, rarities[i]);
    });

    // Locked doors opened (5)
    [1, 5, 10, 20, 30].forEach(function(n, i) {
        var rarities = ['common', 'uncommon', 'uncommon', 'rare', 'epic'];
        _add('doors_unlocked_' + n, 'Locksmith (' + n + ')', 'Unlock ' + n + ' locked doors.', 'exploration', false,
            { type: 'count', counter: 'doors_unlocked', min: n }, { xp: n * 5 }, rarities[i]);
    });

    // ══════════════════════════════════════════
    // FACTION ACHIEVEMENTS (~80)
    // ══════════════════════════════════════════
    FACTIONS.forEach(function(fac) {
        var fn = FACTION_NAMES[fac];

        // Rep milestones (7 per faction = 35)
        [-100, -50, 25, 50, 75, 100].forEach(function(rep) {
            var tier = rep <= -50 ? 'hostile' : rep < 0 ? 'unfriendly' : rep <= 25 ? 'friendly' : rep <= 75 ? 'allied' : 'exalted';
            _add('faction_' + fac + '_rep_' + Math.abs(rep) + (rep < 0 ? 'neg' : 'pos'),
                fn + ': ' + tier.charAt(0).toUpperCase() + tier.slice(1),
                (rep < 0 ? 'Drop to ' : 'Reach ') + rep + ' reputation with ' + fn + '.', 'faction', false,
                { type: 'faction_rep', faction: fac, minRep: rep },
                { xp: Math.abs(rep) + 25 }, Math.abs(rep) < 50 ? 'common' : Math.abs(rep) < 100 ? 'uncommon' : 'rare');
        });

        // Betray faction (1 per faction = 5)
        _add('betray_' + fac, 'Betrayer: ' + fn, 'Betray ' + fn + ' after reaching friendly status.', 'faction', true,
            { type: 'flag', flag: 'faction.' + fac + '.betrayed' }, { xp: 200 }, 'epic');

        // Complete faction questline (1 per faction = 5)
        _add('questline_' + fac, fn + ' Champion', 'Complete the ' + fn + ' questline.', 'faction', false,
            { type: 'flag', flag: 'faction.' + fac + '.questline_complete' }, { xp: 300 }, 'rare');

        // Faction missions completed (5 per faction = 25)
        [1, 5, 10, 20, 30].forEach(function(n, i) {
            var rarities = ['common', 'uncommon', 'uncommon', 'rare', 'epic'];
            _add('faction_missions_' + fac + '_' + n, fn + ': ' + n + ' Missions', 'Complete ' + n + ' missions for ' + fn + '.', 'faction', false,
                { type: 'combo', all: [{ type: 'count', counter: 'faction_missions.' + fac, min: n }] },
                { xp: n * 10 }, rarities[i]);
        });

        // Faction rank milestones (3 per faction = 15)
        [1, 2, 3].forEach(function(rank) {
            var rankNames = ['Initiate', 'Officer', 'Commander'];
            _add('faction_rank_' + fac + '_' + rank, fn + ': ' + rankNames[rank - 1], 'Reach rank ' + rank + ' in ' + fn + '.', 'faction', false,
                { type: 'flag', flag: 'faction.' + fac + '.rank_' + rank },
                { xp: rank * 100 }, rank === 1 ? 'uncommon' : rank === 2 ? 'rare' : 'epic');
        });
    });

    // Cross-faction achievements (2)
    _add('faction_all_allied', 'Diplomat Supreme', 'Reach allied with all factions simultaneously.', 'faction', true,
        { type: 'flag', flag: 'all_factions_allied' }, { xp: 1000 }, 'legendary');
    _add('faction_all_hostile', 'Public Enemy', 'Make all factions hostile simultaneously.', 'faction', true,
        { type: 'flag', flag: 'all_factions_hostile' }, { xp: 500 }, 'legendary');

    // ══════════════════════════════════════════
    // STORY ACHIEVEMENTS (~150)
    // ══════════════════════════════════════════

    // Ending achievements (110)
    for (var ei = 1; ei <= 110; ei++) {
        var eRarity = ei <= 30 ? 'uncommon' : ei <= 70 ? 'rare' : 'epic';
        _add('ending_' + ei, 'Ending #' + ei, 'Discover ending #' + ei + '.', 'story', ei > 70,
            { type: 'flag', flag: 'ending.' + ei + '.reached' }, { xp: 100 }, eRarity);
    }

    // Endings seen milestones (7)
    [1, 5, 10, 25, 50, 75, 100].forEach(function(n, i) {
        var rarities = ['common', 'common', 'uncommon', 'uncommon', 'rare', 'epic', 'legendary'];
        _add('endings_seen_' + n, n + ' Endings Seen', 'Discover ' + n + ' unique endings.', 'story', false,
            { type: 'count', counter: 'endings_seen', min: n }, { xp: n * 20 }, rarities[i]);
    });

    // Key story decisions (30)
    var storyDecisions = [
        'spare_martinez', 'save_mako', 'destroy_stack_lab', 'reveal_truth', 'side_with_rebels',
        'accept_stack', 'refuse_stack', 'betray_mentor', 'save_orphans', 'sacrifice_self',
        'confront_archon', 'free_prisoners', 'hack_mainframe', 'start_revolution', 'crown_yourself',
        'merge_consciousness', 'destroy_cloud_towers', 'cure_stack_disease', 'assassinate_leader', 'forge_alliance',
        'discover_origin', 'embrace_void', 'reject_humanity', 'upload_mind', 'build_sanctuary',
        'burn_it_all', 'find_eden', 'become_legend', 'transcend', 'choose_oblivion'
    ];
    storyDecisions.forEach(function(dec, i) {
        var name = dec.replace(/_/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
        _add('decision_' + dec, name, 'Make the "' + name + '" decision.', 'story', i > 20,
            { type: 'flag', flag: 'decision.' + dec }, { xp: 75 }, i < 10 ? 'common' : i < 20 ? 'uncommon' : 'rare');
    });

    // ══════════════════════════════════════════
    // JOB / CAREER ACHIEVEMENTS (~80)
    // ══════════════════════════════════════════
    JOBS.forEach(function(job) {
        var jn = JOB_NAMES[job];

        // Job rank milestones (3 per job = 18)
        [1, 2, 3].forEach(function(rank) {
            var rankNames = ['Apprentice', 'Journeyman', 'Master'];
            _add('job_rank_' + job + '_' + rank, jn + ': ' + rankNames[rank - 1], 'Reach rank ' + rank + ' as ' + jn + '.', 'job', false,
                { type: 'flag', flag: 'job.' + job + '.rank_' + rank },
                { xp: rank * 75 }, rank === 1 ? 'common' : rank === 2 ? 'uncommon' : 'rare');
        });

        // Job missions completed (5 per job = 30)
        [1, 5, 10, 25, 50].forEach(function(n, i) {
            var rarities = ['common', 'common', 'uncommon', 'rare', 'epic'];
            _add('job_missions_' + job + '_' + n, jn + ': ' + n + ' Jobs Done', 'Complete ' + n + ' ' + jn + ' missions.', 'job', false,
                { type: 'combo', all: [{ type: 'count', counter: 'job_missions.' + job, min: n }] },
                { xp: n * 8 }, rarities[i]);
        });

        // Job earnings milestones (4 per job = 24)
        [100, 500, 2500, 10000].forEach(function(n, i) {
            var rarities = ['common', 'uncommon', 'rare', 'epic'];
            _add('job_earnings_' + job + '_' + n, jn + ': ' + n + ' Credits Earned', 'Earn ' + n + ' credits from ' + jn + ' work.', 'job', false,
                { type: 'combo', all: [{ type: 'count', counter: 'job_earnings.' + job, min: n }] },
                { xp: Math.min(n / 5, 200) }, rarities[i]);
        });
    });

    // Cross-job achievements (5)
    _add('jack_of_all_trades', 'Jack of All Trades', 'Reach rank 1 in all 6 jobs.', 'job', false,
        { type: 'flag', flag: 'job.all_rank1' }, { xp: 250 }, 'rare');
    _add('master_of_all', 'Master of All Trades', 'Reach rank 3 in all 6 jobs.', 'job', false,
        { type: 'flag', flag: 'job.all_rank3' }, { xp: 1000 }, 'legendary');
    _add('career_change_3', 'Career Hopper', 'Change jobs 3 times.', 'job', false,
        { type: 'count', counter: 'job_changes', min: 3 }, { xp: 50 }, 'common');
    _add('career_change_10', 'Indecisive', 'Change jobs 10 times.', 'job', false,
        { type: 'count', counter: 'job_changes', min: 10 }, { xp: 100 }, 'uncommon');
    _add('career_change_25', 'Identity Crisis', 'Change jobs 25 times.', 'job', true,
        { type: 'count', counter: 'job_changes', min: 25 }, { xp: 200 }, 'rare');

    // ══════════════════════════════════════════
    // ECONOMY ACHIEVEMENTS (~50)
    // ══════════════════════════════════════════

    // Credits earned milestones (8)
    [100, 500, 1000, 5000, 10000, 50000, 100000, 1000000].forEach(function(n) {
        _add('credits_earned_' + n, n + ' Credits Earned', 'Earn ' + n + ' total credits.', 'economy', false,
            { type: 'count', counter: 'credits_earned', min: n }, { xp: Math.min(n / 10, 500) },
            n < 1000 ? 'common' : n < 10000 ? 'uncommon' : n < 100000 ? 'rare' : 'epic');
    });

    // Credits spent milestones (8)
    [100, 500, 1000, 5000, 10000, 50000, 100000, 500000].forEach(function(n) {
        _add('credits_spent_' + n, 'Big Spender (' + n + ')', 'Spend ' + n + ' total credits.', 'economy', false,
            { type: 'count', counter: 'credits_spent', min: n }, { xp: Math.min(n / 10, 500) },
            n < 1000 ? 'common' : n < 10000 ? 'uncommon' : n < 100000 ? 'rare' : 'epic');
    });

    // Items purchased (6)
    [1, 10, 25, 50, 100, 250].forEach(function(n) {
        _add('items_bought_' + n, 'Shopper (' + n + ')', 'Purchase ' + n + ' items from shops.', 'economy', false,
            { type: 'count', counter: 'items_purchased', min: n }, { xp: n * 2 },
            n < 25 ? 'common' : n < 100 ? 'uncommon' : 'rare');
    });

    // Items sold (6)
    [1, 10, 25, 50, 100, 250].forEach(function(n) {
        _add('items_sold_' + n, 'Merchant (' + n + ')', 'Sell ' + n + ' items to shops.', 'economy', false,
            { type: 'count', counter: 'items_sold', min: n }, { xp: n * 2 },
            n < 25 ? 'common' : n < 100 ? 'uncommon' : 'rare');
    });

    // Gambling milestones (6)
    [1, 5, 10, 25, 50, 100].forEach(function(n) {
        _add('gambles_' + n, 'Gambler (' + n + ')', 'Place ' + n + ' bets in gambling.', 'economy', false,
            { type: 'count', counter: 'gambles_placed', min: n }, { xp: n * 3 },
            n < 10 ? 'common' : n < 50 ? 'uncommon' : 'rare');
    });

    // Loot found (6)
    [5, 10, 25, 50, 100, 250].forEach(function(n) {
        _add('loot_found_' + n, 'Scavenger (' + n + ')', 'Find ' + n + ' items as loot.', 'economy', false,
            { type: 'count', counter: 'loot_found', min: n }, { xp: n * 2 },
            n < 25 ? 'common' : n < 100 ? 'uncommon' : 'rare');
    });

    // Special economy
    _add('broke', 'Penniless', 'Have exactly 0 credits.', 'economy', false,
        { type: 'flag', flag: 'economy.broke' }, { xp: 25 }, 'common');
    _add('millionaire', 'Millionaire', 'Accumulate 1,000,000 credits.', 'economy', false,
        { type: 'count', counter: 'credits_earned', min: 1000000 }, { xp: 500 }, 'epic');
    _add('black_market_10', 'Black Market Regular', 'Buy 10 items from the black market.', 'economy', false,
        { type: 'count', counter: 'black_market_buys', min: 10 }, { xp: 100 }, 'uncommon');

    // ══════════════════════════════════════════
    // SECRET ACHIEVEMENTS (~100)
    // ══════════════════════════════════════════
    var secrets = [
        ['pet_the_dog', 'Good Person', 'Find and pet the stray dog in the slums.', 'rare'],
        ['dance_in_rain', 'Rain Dancer', 'Stand in the rain for 5 minutes without moving.', 'uncommon'],
        ['hack_yourself', 'Self-Aware', 'As a Synth, hack your own systems.', 'epic'],
        ['orc_poet', 'Unlikely Poet', 'As an Orc, choose every diplomatic option in Act 1.', 'epic'],
        ['elf_technology', 'Nature Meets Machine', 'As a Wood Elf, reach max Tech stat.', 'rare'],
        ['giant_stealth', 'Surprisingly Quiet', 'As a Half-Giant, successfully stealth past 10 encounters.', 'epic'],
        ['all_drinks', 'Bartender', 'Try every drink at every bar in the city.', 'rare'],
        ['read_all_datapads', 'Knowledge Seeker', 'Read every datapad in the game.', 'epic'],
        ['die_to_rat', 'Inglorious', 'Die to the weakest enemy in the game.', 'uncommon'],
        ['max_all_stats', 'Perfection', 'Max out all 8 stats on one character.', 'legendary'],
        ['zero_kills_complete', 'True Pacifist', 'Complete the entire game without killing anyone.', 'legendary'],
        ['speed_run', 'Speed Runner', 'Complete the game in under 2 hours.', 'legendary'],
        ['talk_to_everyone', 'Social Butterfly', 'Talk to every NPC in the game.', 'epic'],
        ['collect_all_items', 'Hoarder', 'Have every item in your inventory at once.', 'legendary'],
        ['romantic_all', 'Heartbreaker', 'Pursue every romance option.', 'epic'],
        ['betray_everyone', 'Trust No One', 'Betray every faction and every NPC ally.', 'legendary'],
        ['stack_collector', 'Stack Collector', 'Collect 10 unique memory stacks.', 'rare'],
        ['void_touched', 'Void Touched', 'As a Voidborn, enter the Void Chamber 10 times.', 'rare'],
        ['fall_from_spire', 'Long Way Down', 'Fall from the top of the Spire.', 'uncommon'],
        ['eat_everything', 'Iron Stomach', 'Consume every consumable item in the game.', 'rare']
    ];
    secrets.forEach(function(s) {
        _add(s[0], s[1], s[2], 'secret', true, { type: 'flag', flag: 'secret.' + s[0] }, { xp: 100 }, s[3]);
    });

    // Generated hidden secrets (80)
    for (var sec = 1; sec <= 80; sec++) {
        _add('secret_' + sec, '???', 'This achievement is hidden.', 'secret', true,
            { type: 'flag', flag: 'secret.hidden_' + sec }, { xp: 75 },
            sec < 30 ? 'rare' : sec < 60 ? 'epic' : 'legendary');
    }

    // ══════════════════════════════════════════
    // META ACHIEVEMENTS (~50)
    // ══════════════════════════════════════════

    // Play as each race (10)
    RACES.forEach(function(race) {
        _add('played_' + race, 'Played as ' + RACE_NAMES[race], 'Start a game as ' + RACE_NAMES[race] + '.', 'meta', false,
            { type: 'flag', flag: 'meta.played_' + race }, { xp: 25 }, 'common');
    });
    _add('play_all_races', 'Shapeshifter', 'Play as all 10 races.', 'meta', false,
        { type: 'flag', flag: 'meta.played_all_races' }, { xp: 500 }, 'epic');

    // Playtime milestones (7)
    [1, 5, 10, 25, 50, 100, 200].forEach(function(hrs, i) {
        var rarities = ['common', 'common', 'uncommon', 'uncommon', 'rare', 'epic', 'legendary'];
        _add('playtime_' + hrs, hrs + 'h Played', 'Play for ' + hrs + ' hours total.', 'meta', false,
            { type: 'count', counter: 'playtime_hours', min: hrs }, { xp: hrs * 5 }, rarities[i]);
    });

    // Death milestones (6)
    [1, 5, 10, 25, 50, 100].forEach(function(n, i) {
        var rarities = ['common', 'common', 'uncommon', 'uncommon', 'rare', 'epic'];
        var names = ['First Death', '5 Deaths', '10 Deaths', '25 Deaths', '50 Deaths', 'Immortal Irony'];
        _add('deaths_' + n, names[i], 'Die ' + n + ' times.', 'meta', false,
            { type: 'count', counter: 'death_count', min: n }, { xp: n * 5 }, rarities[i]);
    });

    // Save milestones (4)
    [1, 10, 50, 100].forEach(function(n, i) {
        var rarities = ['common', 'uncommon', 'rare', 'epic'];
        _add('saves_' + n, 'Save Scummer (' + n + ')', 'Save the game ' + n + ' times.', 'meta', n > 10,
            { type: 'count', counter: 'save_count', min: n }, { xp: n * 3 }, rarities[i]);
    });

    // Load milestones (4)
    [1, 10, 50, 100].forEach(function(n, i) {
        var rarities = ['common', 'uncommon', 'rare', 'epic'];
        _add('loads_' + n, 'Time Traveler (' + n + ')', 'Load a save ' + n + ' times.', 'meta', n > 10,
            { type: 'count', counter: 'load_count', min: n }, { xp: n * 3 }, rarities[i]);
    });

    // Choices made milestones (5)
    [10, 50, 100, 250, 500].forEach(function(n) {
        _add('choices_made_' + n, 'Decision Maker (' + n + ')', 'Make ' + n + ' choices.', 'meta', false,
            { type: 'count', counter: 'choices_made', min: n }, { xp: n },
            n < 50 ? 'common' : n < 250 ? 'uncommon' : 'rare');
    });

    // Playthroughs completed (5)
    [1, 2, 3, 5, 10].forEach(function(n, i) {
        var rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
        _add('playthroughs_' + n, n + ' Playthrough' + (n > 1 ? 's' : ''), 'Complete ' + n + ' full playthrough' + (n > 1 ? 's' : '') + '.', 'meta', false,
            { type: 'count', counter: 'playthroughs_completed', min: n }, { xp: n * 100 }, rarities[i]);
    });

    // Achievement milestones (7)
    [10, 50, 100, 250, 500, 750, 1000].forEach(function(n, i) {
        var rarities = ['common', 'common', 'uncommon', 'rare', 'epic', 'epic', 'legendary'];
        _add('achievements_unlocked_' + n, 'Achievement Hunter (' + n + ')', 'Unlock ' + n + ' achievements.', 'meta', false,
            { type: 'count', counter: 'achievements_unlocked', min: n }, { xp: n }, rarities[i]);
    });

    // ══════════════════════════════════════════
    // SKILL & STAT ACHIEVEMENTS (~60)
    // ══════════════════════════════════════════
    var STATS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'tech', 'luck'];
    STATS.forEach(function(stat) {
        var sn = stat.charAt(0).toUpperCase() + stat.slice(1);

        // Stat milestones (4 per stat = 32)
        [12, 15, 18, 20].forEach(function(val, i) {
            var rarities = ['common', 'uncommon', 'rare', 'epic'];
            _add('stat_' + stat + '_' + val, sn + ': ' + val, 'Reach ' + val + ' ' + sn + '.', 'stat', false,
                { type: 'stat', stat: stat, min: val }, { xp: val * 10 }, rarities[i]);
        });
    });

    // Total stat points milestones (6)
    [20, 40, 60, 80, 100, 120].forEach(function(n, i) {
        var rarities = ['common', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
        _add('total_stats_' + n, 'Total Stats: ' + n, 'Have ' + n + ' total stat points.', 'stat', false,
            { type: 'count', counter: 'total_stat_points', min: n }, { xp: n * 3 }, rarities[i]);
    });

    // Skill checks passed (6)
    [1, 10, 25, 50, 100, 200].forEach(function(n) {
        _add('skill_checks_' + n, 'Skill Checker (' + n + ')', 'Pass ' + n + ' skill checks.', 'stat', false,
            { type: 'count', counter: 'skill_checks_passed', min: n }, { xp: n * 3 },
            n < 25 ? 'common' : n < 100 ? 'uncommon' : 'rare');
    });

    // Skill checks failed (6)
    [1, 5, 10, 25, 50, 100].forEach(function(n) {
        _add('skill_checks_failed_' + n, 'Try Again (' + n + ')', 'Fail ' + n + ' skill checks.', 'stat', false,
            { type: 'count', counter: 'skill_checks_failed', min: n }, { xp: n * 2 },
            n < 10 ? 'common' : n < 50 ? 'uncommon' : 'rare');
    });

    // ══════════════════════════════════════════
    // Count total and log
    // ══════════════════════════════════════════
    var _count = Object.keys(_achievements).length;
    if (typeof console !== 'undefined') {
        console.log('[AchievementsData] Total achievements loaded: ' + _count);
        var cats = {};
        Object.values(_achievements).forEach(function(a) { cats[a.category] = (cats[a.category] || 0) + 1; });
        console.log('[AchievementsData] By category:', JSON.stringify(cats));
    }

    return {
        getAll: function() { return Object.values(_achievements); },
        get: function(id) { return _achievements[id] || null; },
        getByCategory: function(cat) {
            return Object.values(_achievements).filter(function(a) { return a.category === cat || a.category.indexOf(cat) === 0; });
        },
        count: function() { return _count; },
        categories: function() {
            var cats = {};
            Object.values(_achievements).forEach(function(a) { cats[a.category] = (cats[a.category] || 0) + 1; });
            return cats;
        }
    };
})();
