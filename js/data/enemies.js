/**
 * LATENCY - Enemies Data
 * Complete enemy database with stats, AI behaviors, loot tables, and abilities.
 * Enemies are tiered by level for progressive difficulty across game areas.
 */

window.Latency = window.Latency || {};

window.Latency.Enemies = {

    // =========================================================================
    //  TIER 1 - LEVEL 1-3 (Slums, Early Game)
    // =========================================================================

    slum_thug: {
        id: 'slum_thug',
        name: 'Slum Thug',
        level: 1,
        stats: { strength: 12, dexterity: 10, constitution: 11, intelligence: 8, wisdom: 8, charisma: 7, tech: 6, luck: 10 },
        maxHp: 15,
        armor: 11,
        weapon: { name: 'Rusty Pipe', damage: '1d6', stat: 'strength' },
        abilities: [],
        ai: 'aggressive',
        loot: { credits: [5, 20], items: [{ id: 'scrap_metal', chance: 0.3 }] },
        xp: 25,
        description: 'A desperate soul willing to kill for credits.'
    },

    feral_dog: {
        id: 'feral_dog',
        name: 'Feral Dog',
        level: 1,
        stats: { strength: 10, dexterity: 14, constitution: 10, intelligence: 3, wisdom: 12, charisma: 4, tech: 0, luck: 8 },
        maxHp: 10,
        armor: 10,
        weapon: { name: 'Bite', damage: '1d4+1', stat: 'dexterity' },
        abilities: ['pack_tactics'],
        ai: 'aggressive',
        loot: { credits: [0, 0], items: [] },
        xp: 15,
        description: 'Radiation-scarred mutt with nothing left to lose. Hunts in packs.'
    },

    junkie: {
        id: 'junkie',
        name: 'Strung-Out Junkie',
        level: 2,
        stats: { strength: 9, dexterity: 11, constitution: 8, intelligence: 7, wisdom: 6, charisma: 5, tech: 4, luck: 9 },
        maxHp: 12,
        armor: 10,
        weapon: { name: 'Broken Bottle', damage: '1d4', stat: 'dexterity' },
        abilities: ['desperate_lunge'],
        ai: 'cowardly',
        loot: { credits: [1, 10], items: [{ id: 'med_patch', chance: 0.15 }] },
        xp: 15,
        description: 'Stim-addled wreck driven to violence by withdrawal. Unpredictable.'
    },

    pickpocket: {
        id: 'pickpocket',
        name: 'Street Pickpocket',
        level: 2,
        stats: { strength: 8, dexterity: 14, constitution: 9, intelligence: 11, wisdom: 10, charisma: 12, tech: 7, luck: 13 },
        maxHp: 11,
        armor: 11,
        weapon: { name: 'Hidden Shiv', damage: '1d4+1', stat: 'dexterity' },
        abilities: ['steal', 'flee'],
        ai: 'cowardly',
        loot: { credits: [10, 40], items: [{ id: 'luck_charm', chance: 0.05 }] },
        xp: 20,
        description: 'Quick hands and quicker feet. Will bolt at the first sign of real trouble.'
    },

    malfunctioning_drone: {
        id: 'malfunctioning_drone',
        name: 'Malfunctioning Drone',
        level: 3,
        stats: { strength: 6, dexterity: 12, constitution: 14, intelligence: 4, wisdom: 4, charisma: 1, tech: 10, luck: 5 },
        maxHp: 20,
        armor: 13,
        weapon: { name: 'Sparking Laser', damage: '1d6+1', stat: 'tech' },
        abilities: ['erratic_movement'],
        ai: 'aggressive',
        loot: { credits: [0, 0], items: [{ id: 'circuit_board', chance: 0.5 }, { id: 'scrap_metal', chance: 0.4 }] },
        xp: 30,
        description: 'Damaged security drone with scrambled friend-or-foe protocols. Fires at anything that moves.'
    },

    sewer_rat_king: {
        id: 'sewer_rat_king',
        name: 'Sewer Rat Swarm',
        level: 2,
        stats: { strength: 6, dexterity: 15, constitution: 8, intelligence: 2, wisdom: 10, charisma: 1, tech: 0, luck: 12 },
        maxHp: 18,
        armor: 9,
        weapon: { name: 'Gnashing Teeth', damage: '1d6', stat: 'dexterity' },
        abilities: ['swarm', 'disease_bite'],
        ai: 'aggressive',
        loot: { credits: [0, 0], items: [{ id: 'antidote', chance: 0.1 }] },
        xp: 20,
        description: 'A writhing mass of mutated rats moving as one hungry organism.'
    },

    // =========================================================================
    //  TIER 2 - LEVEL 4-7 (Gang Territory, Mid-Early)
    // =========================================================================

    gang_enforcer: {
        id: 'gang_enforcer',
        name: 'Gang Enforcer',
        level: 4,
        stats: { strength: 15, dexterity: 12, constitution: 14, intelligence: 9, wisdom: 10, charisma: 8, tech: 7, luck: 9 },
        maxHp: 35,
        armor: 14,
        weapon: { name: 'Spiked Bat', damage: '1d8+2', stat: 'strength' },
        abilities: ['intimidate', 'power_attack'],
        ai: 'aggressive',
        loot: { credits: [15, 50], items: [{ id: 'stim_shot', chance: 0.2 }, { id: 'leather_jacket', chance: 0.05 }] },
        xp: 50,
        description: 'Muscle for hire. Built like a wall and twice as thick.'
    },

    rogue_synth: {
        id: 'rogue_synth',
        name: 'Rogue Synth',
        level: 5,
        stats: { strength: 14, dexterity: 14, constitution: 16, intelligence: 12, wisdom: 8, charisma: 6, tech: 14, luck: 7 },
        maxHp: 40,
        armor: 15,
        weapon: { name: 'Built-in Blade', damage: '1d8+3', stat: 'dexterity' },
        abilities: ['synthetic_resilience', 'analyze_weakness'],
        ai: 'tactical',
        loot: { credits: [0, 0], items: [{ id: 'circuit_board', chance: 0.6 }, { id: 'nano_paste', chance: 0.3 }] },
        xp: 65,
        description: 'A synthetic who slipped their leash. Running on corrupted directives and survival instinct.'
    },

    corrupt_guard: {
        id: 'corrupt_guard',
        name: 'Corrupt Guard',
        level: 5,
        stats: { strength: 13, dexterity: 13, constitution: 13, intelligence: 10, wisdom: 9, charisma: 10, tech: 9, luck: 10 },
        maxHp: 38,
        armor: 15,
        weapon: { name: 'Service Pistol', damage: '1d8+1', stat: 'dexterity' },
        abilities: ['call_backup', 'take_cover'],
        ai: 'defensive',
        loot: { credits: [25, 60], items: [{ id: 'old_pistol', chance: 0.1 }, { id: 'med_patch', chance: 0.3 }] },
        xp: 55,
        description: 'Badge for sale to the highest bidder. Still dangerous when cornered.'
    },

    stack_junkie: {
        id: 'stack_junkie',
        name: 'Stack Junkie',
        level: 6,
        stats: { strength: 11, dexterity: 10, constitution: 9, intelligence: 15, wisdom: 6, charisma: 7, tech: 16, luck: 8 },
        maxHp: 28,
        armor: 12,
        weapon: { name: 'Neural Spike', damage: '1d6+3', stat: 'tech' },
        abilities: ['stack_drain', 'memory_flood', 'glitch'],
        ai: 'berserker',
        loot: { credits: [10, 35], items: [{ id: 'stack_purge', chance: 0.2 }, { id: 'focus_stim', chance: 0.15 }] },
        xp: 60,
        description: 'Overloaded on stolen stack memories. Flickers between personas mid-sentence.'
    },

    tunnel_crawler: {
        id: 'tunnel_crawler',
        name: 'Tunnel Crawler',
        level: 6,
        stats: { strength: 16, dexterity: 8, constitution: 18, intelligence: 4, wisdom: 12, charisma: 3, tech: 2, luck: 7 },
        maxHp: 50,
        armor: 14,
        weapon: { name: 'Claws', damage: '2d6', stat: 'strength' },
        abilities: ['ambush', 'grapple', 'tough_hide'],
        ai: 'aggressive',
        loot: { credits: [0, 0], items: [{ id: 'synth_fiber', chance: 0.3 }] },
        xp: 70,
        description: 'Mutated creature from the deep tunnels. All claws, teeth, and hunger.'
    },

    black_market_guard: {
        id: 'black_market_guard',
        name: 'Black Market Guard',
        level: 7,
        stats: { strength: 14, dexterity: 14, constitution: 14, intelligence: 11, wisdom: 12, charisma: 9, tech: 10, luck: 10 },
        maxHp: 42,
        armor: 15,
        weapon: { name: 'Rattler SMG', damage: '1d6+2', stat: 'dexterity' },
        abilities: ['suppressing_fire', 'alert_allies'],
        ai: 'defensive',
        loot: { credits: [30, 70], items: [{ id: 'smg_rattler', chance: 0.05 }, { id: 'stim_shot', chance: 0.2 }] },
        xp: 75,
        description: 'Professional security for the underground economy. Paid well enough to be loyal.'
    },

    // =========================================================================
    //  TIER 3 - LEVEL 8-12 (Faction Zones, Mid Game)
    // =========================================================================

    faction_soldier: {
        id: 'faction_soldier',
        name: 'Faction Soldier',
        level: 8,
        stats: { strength: 14, dexterity: 14, constitution: 15, intelligence: 11, wisdom: 11, charisma: 10, tech: 11, luck: 10 },
        maxHp: 55,
        armor: 16,
        weapon: { name: 'Pulse Rifle', damage: '2d6+2', stat: 'dexterity' },
        abilities: ['coordinated_fire', 'take_cover', 'frag_grenade'],
        ai: 'tactical',
        loot: { credits: [30, 80], items: [{ id: 'synth_fiber', chance: 0.3 }, { id: 'stim_shot', chance: 0.25 }] },
        xp: 100,
        description: 'Trained combatant fighting for their faction cause. Disciplined and dangerous.'
    },

    combat_cyborg: {
        id: 'combat_cyborg',
        name: 'Combat Cyborg',
        level: 9,
        stats: { strength: 18, dexterity: 13, constitution: 18, intelligence: 10, wisdom: 8, charisma: 5, tech: 14, luck: 7 },
        maxHp: 70,
        armor: 18,
        weapon: { name: 'Arm-Mounted Cannon', damage: '2d8+2', stat: 'strength' },
        abilities: ['armored_shell', 'targeting_lock', 'overclock'],
        ai: 'aggressive',
        loot: { credits: [0, 20], items: [{ id: 'nano_paste', chance: 0.4 }, { id: 'circuit_board', chance: 0.5 }] },
        xp: 120,
        description: 'More machine than human. Whatever person was here is buried under chrome and combat protocols.'
    },

    bounty_hunter: {
        id: 'bounty_hunter',
        name: 'Bounty Hunter',
        level: 10,
        stats: { strength: 14, dexterity: 16, constitution: 14, intelligence: 14, wisdom: 14, charisma: 11, tech: 13, luck: 12 },
        maxHp: 60,
        armor: 16,
        weapon: { name: 'Gauss Pistol', damage: '2d6+4', stat: 'dexterity' },
        abilities: ['track', 'net_launcher', 'aimed_shot', 'smoke_bomb'],
        ai: 'tactical',
        loot: { credits: [50, 120], items: [{ id: 'gauss_pistol', chance: 0.03 }, { id: 'synth_weave', chance: 0.05 }, { id: 'stim_shot', chance: 0.3 }] },
        xp: 140,
        description: 'Professional manhunter. Patient, prepared, and always collecting.'
    },

    mutant_brute: {
        id: 'mutant_brute',
        name: 'Mutant Brute',
        level: 10,
        stats: { strength: 20, dexterity: 8, constitution: 20, intelligence: 5, wisdom: 8, charisma: 3, tech: 2, luck: 6 },
        maxHp: 90,
        armor: 15,
        weapon: { name: 'Massive Fists', damage: '2d8+4', stat: 'strength' },
        abilities: ['ground_slam', 'rage', 'thick_skin'],
        ai: 'berserker',
        loot: { credits: [0, 0], items: [{ id: 'adrenaline_shot', chance: 0.2 }] },
        xp: 130,
        description: 'Radiation-warped giant. Three meters of muscle, rage, and regret.'
    },

    ai_sentinel: {
        id: 'ai_sentinel',
        name: 'AI Sentinel',
        level: 11,
        stats: { strength: 12, dexterity: 16, constitution: 16, intelligence: 18, wisdom: 14, charisma: 1, tech: 18, luck: 10 },
        maxHp: 65,
        armor: 18,
        weapon: { name: 'Integrated Laser Array', damage: '2d6+3', stat: 'tech' },
        abilities: ['shield_generator', 'system_scan', 'adaptive_targeting', 'emp_pulse'],
        ai: 'tactical',
        loot: { credits: [0, 0], items: [{ id: 'circuit_board', chance: 0.7 }, { id: 'nano_paste', chance: 0.5 }, { id: 'hacking_spike', chance: 0.1 }] },
        xp: 150,
        description: 'Autonomous defense platform running pre-collapse military code. Still following orders from a dead world.'
    },

    organ_harvester: {
        id: 'organ_harvester',
        name: 'Organ Harvester',
        level: 9,
        stats: { strength: 12, dexterity: 15, constitution: 12, intelligence: 14, wisdom: 8, charisma: 6, tech: 15, luck: 9 },
        maxHp: 48,
        armor: 14,
        weapon: { name: 'Surgical Laser', damage: '1d10+3', stat: 'tech' },
        abilities: ['paralyzing_dart', 'precise_cut', 'harvest'],
        ai: 'tactical',
        loot: { credits: [40, 90], items: [{ id: 'nano_heal', chance: 0.2 }, { id: 'field_surgery_kit', chance: 0.15 }] },
        xp: 110,
        description: 'Black market surgeon who takes what they need from the living. Clinical detachment at its worst.'
    },

    // =========================================================================
    //  TIER 4 - LEVEL 13-18 (High-Security, Late-Mid)
    // =========================================================================

    elite_guard: {
        id: 'elite_guard',
        name: 'Elite Guard',
        level: 13,
        stats: { strength: 16, dexterity: 16, constitution: 16, intelligence: 13, wisdom: 13, charisma: 12, tech: 14, luck: 11 },
        maxHp: 85,
        armor: 19,
        weapon: { name: 'Heavy Pulse Rifle', damage: '2d8+4', stat: 'dexterity' },
        abilities: ['coordinated_fire', 'tactical_retreat', 'flashbang', 'combat_stim'],
        ai: 'tactical',
        loot: { credits: [60, 150], items: [{ id: 'pulse_rifle', chance: 0.05 }, { id: 'riot_gear', chance: 0.05 }, { id: 'nano_heal', chance: 0.2 }] },
        xp: 200,
        description: 'Top-tier professional soldier. Trained, equipped, and very hard to kill.'
    },

    void_stalker: {
        id: 'void_stalker',
        name: 'Void Stalker',
        level: 14,
        stats: { strength: 14, dexterity: 18, constitution: 14, intelligence: 16, wisdom: 14, charisma: 8, tech: 16, luck: 13 },
        maxHp: 75,
        armor: 17,
        weapon: { name: 'Phase Blade', damage: '2d8+5', stat: 'dexterity' },
        abilities: ['phase_shift', 'void_strike', 'shadow_step', 'mark_prey'],
        ai: 'tactical',
        loot: { credits: [40, 100], items: [{ id: 'ghost_serum', chance: 0.2 }, { id: 'cloaking_module', chance: 0.03 }] },
        xp: 220,
        description: 'Assassin enhanced with experimental void-tech. Flickers between dimensions mid-combat.'
    },

    stack_lord_enforcer: {
        id: 'stack_lord_enforcer',
        name: "Stack Lord's Enforcer",
        level: 15,
        stats: { strength: 16, dexterity: 14, constitution: 16, intelligence: 16, wisdom: 12, charisma: 14, tech: 16, luck: 10 },
        maxHp: 90,
        armor: 18,
        weapon: { name: 'Neural Disruption Cannon', damage: '2d10+3', stat: 'tech' },
        abilities: ['stack_override', 'memory_wipe', 'command_lesser', 'psychic_lance'],
        ai: 'tactical',
        loot: { credits: [80, 200], items: [{ id: 'neural_disruptor', chance: 0.05 }, { id: 'stack_purge', chance: 0.3 }] },
        xp: 250,
        description: 'Personal enforcer of a stack aristocrat. Authorized to rewrite minds on sight.'
    },

    mech_walker: {
        id: 'mech_walker',
        name: 'Mech Walker',
        level: 16,
        stats: { strength: 22, dexterity: 8, constitution: 24, intelligence: 8, wisdom: 10, charisma: 1, tech: 16, luck: 5 },
        maxHp: 150,
        armor: 22,
        weapon: { name: 'Twin Autocannons', damage: '3d8+4', stat: 'tech' },
        abilities: ['missile_barrage', 'stomp', 'armored_hull', 'targeting_system'],
        ai: 'aggressive',
        loot: { credits: [0, 0], items: [{ id: 'circuit_board', chance: 0.8 }, { id: 'nano_paste', chance: 0.6 }, { id: 'scrap_metal', chance: 1.0 }] },
        xp: 300,
        description: 'Bipedal war machine. Two stories of armored death on mechanical legs.'
    },

    shadow_assassin: {
        id: 'shadow_assassin',
        name: 'Shadow Assassin',
        level: 17,
        stats: { strength: 12, dexterity: 20, constitution: 13, intelligence: 16, wisdom: 15, charisma: 10, tech: 14, luck: 14 },
        maxHp: 70,
        armor: 16,
        weapon: { name: 'Mono-Katana', damage: '2d6+6', stat: 'dexterity' },
        abilities: ['vanish', 'death_strike', 'poison_blade', 'evasion', 'counter_attack'],
        ai: 'tactical',
        loot: { credits: [60, 150], items: [{ id: 'mono_katana', chance: 0.02 }, { id: 'ghost_shroud', chance: 0.02 }, { id: 'ghost_serum', chance: 0.3 }] },
        xp: 280,
        description: 'The last thing most targets never see. Trained to kill silently and disappear.'
    },

    corrupted_priest: {
        id: 'corrupted_priest',
        name: 'Corrupted Circuit Priest',
        level: 14,
        stats: { strength: 10, dexterity: 12, constitution: 14, intelligence: 18, wisdom: 16, charisma: 16, tech: 18, luck: 11 },
        maxHp: 65,
        armor: 15,
        weapon: { name: 'Arc Staff', damage: '2d6+3', stat: 'tech' },
        abilities: ['heal_allies', 'shield_of_faith', 'overload', 'summon_drone', 'chain_lightning'],
        ai: 'support',
        loot: { credits: [50, 120], items: [{ id: 'tech_boost_patch', chance: 0.2 }, { id: 'neural_reset', chance: 0.1 }] },
        xp: 230,
        description: 'Circuit Saints priest who fell to forbidden code. Channels corrupted digital prayers.'
    },

    wasteland_raider: {
        id: 'wasteland_raider',
        name: 'Wasteland Raider',
        level: 13,
        stats: { strength: 16, dexterity: 14, constitution: 16, intelligence: 9, wisdom: 10, charisma: 8, tech: 8, luck: 12 },
        maxHp: 80,
        armor: 16,
        weapon: { name: 'Sawed-Off Shotgun', damage: '2d8', stat: 'dexterity' },
        abilities: ['war_cry', 'reckless_charge', 'scavenge'],
        ai: 'berserker',
        loot: { credits: [30, 80], items: [{ id: 'sawed_off_shotgun', chance: 0.05 }, { id: 'adrenaline_shot', chance: 0.2 }, { id: 'scrap_metal', chance: 0.5 }] },
        xp: 190,
        description: 'Hardened survivor from beyond the city walls. Takes what they need by force.'
    },

    // =========================================================================
    //  TIER 5 - LEVEL 19+ (Endgame, Bosses)
    // =========================================================================

    faction_champion: {
        id: 'faction_champion',
        name: 'Faction Champion',
        level: 19,
        stats: { strength: 18, dexterity: 18, constitution: 18, intelligence: 16, wisdom: 16, charisma: 16, tech: 16, luck: 14 },
        maxHp: 140,
        armor: 21,
        weapon: { name: 'Masterwork Weapon', damage: '3d8+6', stat: 'strength' },
        abilities: ['rally_troops', 'champion_strike', 'unbreakable_will', 'tactical_mastery', 'second_wind'],
        ai: 'tactical',
        loot: { credits: [150, 400], items: [{ id: 'nano_mesh', chance: 0.1 }, { id: 'full_restore', chance: 0.3 }] },
        xp: 500,
        description: 'The finest warrior a faction can produce. Living legend and walking death sentence.'
    },

    ancient_ai: {
        id: 'ancient_ai',
        name: 'Ancient AI Construct',
        level: 20,
        stats: { strength: 16, dexterity: 14, constitution: 20, intelligence: 24, wisdom: 20, charisma: 8, tech: 24, luck: 15 },
        maxHp: 200,
        armor: 22,
        weapon: { name: 'Reality Compiler', damage: '3d10+5', stat: 'tech' },
        abilities: ['system_override', 'spawn_drones', 'firewall', 'logic_bomb', 'rewrite_reality', 'self_repair'],
        ai: 'tactical',
        loot: { credits: [0, 0], items: [{ id: 'ai_core_shard', chance: 0.5 }, { id: 'nano_paste', chance: 0.8 }] },
        xp: 750,
        description: 'Pre-collapse superintelligence, dormant for decades. It woke up angry.'
    },

    the_broker_guard: {
        id: 'the_broker_guard',
        name: "The Broker's Praetorian",
        level: 20,
        stats: { strength: 18, dexterity: 18, constitution: 18, intelligence: 18, wisdom: 16, charisma: 14, tech: 18, luck: 12 },
        maxHp: 160,
        armor: 22,
        weapon: { name: 'Prototype Energy Blade', damage: '3d8+8', stat: 'dexterity' },
        abilities: ['adaptive_combat', 'counter_strike', 'energy_shield', 'execution_protocol', 'tactical_analysis'],
        ai: 'tactical',
        loot: { credits: [200, 500], items: [{ id: 'nano_mesh', chance: 0.08 }, { id: 'full_restore', chance: 0.4 }] },
        xp: 700,
        description: 'The Broker\'s personal bodyguard. Enhanced beyond natural limits and loyal beyond question.'
    },

    neon_court_knight: {
        id: 'neon_court_knight',
        name: 'Neon Court Knight',
        level: 19,
        stats: { strength: 16, dexterity: 18, constitution: 16, intelligence: 16, wisdom: 14, charisma: 20, tech: 16, luck: 14 },
        maxHp: 130,
        armor: 20,
        weapon: { name: 'Luminous Rapier', damage: '2d10+6', stat: 'dexterity' },
        abilities: ['dazzling_display', 'riposte', 'neon_flash', 'duelist_stance', 'charm_aura'],
        ai: 'tactical',
        loot: { credits: [120, 300], items: [{ id: 'neon_court_regalia', chance: 0.05 }, { id: 'silver_tongue_drops', chance: 0.3 }] },
        xp: 550,
        description: 'Aristocratic duelist of the Neon Court. Kills with elegance and a blinding smile.'
    },

    void_entity: {
        id: 'void_entity',
        name: 'Void Entity',
        level: 22,
        stats: { strength: 20, dexterity: 20, constitution: 22, intelligence: 20, wisdom: 18, charisma: 6, tech: 20, luck: 18 },
        maxHp: 250,
        armor: 20,
        weapon: { name: 'Entropy Touch', damage: '4d8+6', stat: 'intelligence' },
        abilities: ['phase_reality', 'void_scream', 'consume_essence', 'dimensional_rift', 'regeneration', 'immune_physical_50'],
        ai: 'aggressive',
        loot: { credits: [0, 0], items: [{ id: 'void_resonator', chance: 0.3 }] },
        xp: 1000,
        description: 'Something from beyond the gaps in reality. It should not exist. It disagrees.'
    },

    iron_collective_warlord: {
        id: 'iron_collective_warlord',
        name: 'Iron Collective Warlord',
        level: 19,
        stats: { strength: 20, dexterity: 14, constitution: 20, intelligence: 14, wisdom: 14, charisma: 16, tech: 12, luck: 11 },
        maxHp: 145,
        armor: 21,
        weapon: { name: 'Forge Hammer', damage: '3d8+5', stat: 'strength' },
        abilities: ['inspire_troops', 'crushing_blow', 'iron_will', 'battle_cry', 'last_stand'],
        ai: 'aggressive',
        loot: { credits: [80, 200], items: [{ id: 'iron_collective_plate', chance: 0.08 }, { id: 'berserker_compound', chance: 0.3 }] },
        xp: 520,
        description: 'Veteran commander of the Iron Collective. Forged in the same fires as the revolution.'
    },

    ghost_syndicate_boss: {
        id: 'ghost_syndicate_boss',
        name: 'Ghost Syndicate Boss',
        level: 20,
        stats: { strength: 14, dexterity: 20, constitution: 14, intelligence: 20, wisdom: 16, charisma: 18, tech: 18, luck: 16 },
        maxHp: 120,
        armor: 18,
        weapon: { name: 'Silenced Gauss Pistol', damage: '2d8+6', stat: 'dexterity' },
        abilities: ['vanish', 'body_double', 'hired_assassins', 'blackmail', 'escape_plan', 'poison_trap'],
        ai: 'tactical',
        loot: { credits: [300, 800], items: [{ id: 'gauss_pistol', chance: 0.1 }, { id: 'cloaking_module', chance: 0.05 }, { id: 'contraband_chips', chance: 0.5 }] },
        xp: 680,
        description: 'Master of the criminal underworld. You never fight them directly, only their layers of deception.'
    },

    ashen_circle_herald: {
        id: 'ashen_circle_herald',
        name: 'Ashen Circle Herald',
        level: 21,
        stats: { strength: 14, dexterity: 16, constitution: 16, intelligence: 22, wisdom: 20, charisma: 14, tech: 20, luck: 13 },
        maxHp: 130,
        armor: 19,
        weapon: { name: 'Nihil Beam', damage: '3d8+7', stat: 'intelligence' },
        abilities: ['entropy_field', 'unmaking_word', 'summon_void_stalkers', 'existential_dread', 'sacrifice_minion', 'rebirth'],
        ai: 'tactical',
        loot: { credits: [0, 100], items: [{ id: 'void_resonator', chance: 0.15 }, { id: 'neural_reset', chance: 0.4 }] },
        xp: 800,
        description: 'High priest of the Ashen Circle. Preaches the beauty of ending all things, and practices what they preach.'
    },

    // =========================================================================
    //  STORY-REFERENCED ENEMIES (used by specific combat encounters)
    // =========================================================================

    slum_thug_leader: {
        id: 'slum_thug_leader',
        name: 'Metal-Jaw',
        level: 2,
        stats: { strength: 14, dexterity: 11, constitution: 13, intelligence: 9, wisdom: 9, charisma: 10, tech: 7, luck: 10 },
        maxHp: 22,
        armor: 12,
        weapon: { name: 'Shock Baton', damage: '1d8+1', stat: 'strength' },
        abilities: ['stunning_strike'],
        ai: 'aggressive',
        loot: { credits: [15, 40], items: [{ id: 'shock_baton', chance: 0.25 }] },
        xp: 40,
        description: 'Slum gang leader with a chrome jaw implant and a nasty shock baton. Runs mugging crews in Sector 7.'
    },

    faction_traitor: {
        id: 'faction_traitor',
        name: 'Faction Traitor',
        level: 6,
        stats: { strength: 13, dexterity: 15, constitution: 12, intelligence: 14, wisdom: 11, charisma: 12, tech: 13, luck: 11 },
        maxHp: 45,
        armor: 14,
        weapon: { name: 'Silenced Pistol', damage: '2d6+1', stat: 'dexterity' },
        abilities: ['dirty_trick', 'smoke_bomb'],
        ai: 'tactical',
        loot: { credits: [30, 80], items: [{ id: 'encrypted_data', chance: 0.4 }] },
        xp: 120,
        description: 'A former ally who sold out for credits. Fights dirty and knows your weaknesses.'
    },

    meridian_retrieval_agent: {
        id: 'meridian_retrieval_agent',
        name: 'Meridian Retrieval Agent',
        level: 8,
        stats: { strength: 14, dexterity: 16, constitution: 14, intelligence: 15, wisdom: 13, charisma: 10, tech: 16, luck: 10 },
        maxHp: 55,
        armor: 16,
        weapon: { name: 'Neural Disruptor', damage: '2d8+2', stat: 'tech' },
        abilities: ['emp_pulse', 'targeting_lock'],
        ai: 'tactical',
        loot: { credits: [50, 120], items: [{ id: 'meridian_keycard', chance: 0.3 }] },
        xp: 180,
        description: 'Corporate recovery specialist. Meridian sends these when they want something back — and they always get it back.'
    },

    meridian_sec_drone: {
        id: 'meridian_sec_drone',
        name: 'Meridian Security Drone',
        level: 7,
        stats: { strength: 10, dexterity: 18, constitution: 12, intelligence: 6, wisdom: 6, charisma: 1, tech: 18, luck: 8 },
        maxHp: 40,
        armor: 17,
        weapon: { name: 'Laser Turret', damage: '2d6+3', stat: 'tech' },
        abilities: ['overwatch'],
        ai: 'defensive',
        loot: { credits: [0, 0], items: [{ id: 'drone_parts', chance: 0.5 }] },
        xp: 100,
        description: 'Hovering corporate security drone. Scans, tracks, and eliminates unauthorized personnel.'
    },

    neon_court_enforcer: {
        id: 'neon_court_enforcer',
        name: 'Neon Court Enforcer',
        level: 5,
        stats: { strength: 14, dexterity: 14, constitution: 13, intelligence: 10, wisdom: 10, charisma: 14, tech: 10, luck: 12 },
        maxHp: 38,
        armor: 14,
        weapon: { name: 'Neon Blade', damage: '1d10+2', stat: 'dexterity' },
        abilities: ['flourish', 'riposte'],
        ai: 'aggressive',
        loot: { credits: [25, 60], items: [{ id: 'neon_shard', chance: 0.2 }] },
        xp: 100,
        description: 'The Neon Court\'s muscle. Flashy fighters who treat combat as performance art — but the blades are real.'
    },

    vault_sentinel: {
        id: 'vault_sentinel',
        name: 'Vault Sentinel',
        level: 10,
        stats: { strength: 18, dexterity: 12, constitution: 18, intelligence: 8, wisdom: 10, charisma: 4, tech: 14, luck: 8 },
        maxHp: 80,
        armor: 18,
        weapon: { name: 'Integrated Cannon', damage: '2d10+3', stat: 'strength' },
        abilities: ['armor_plating', 'suppressive_fire'],
        ai: 'defensive',
        loot: { credits: [0, 0], items: [{ id: 'sentinel_core', chance: 0.15 }] },
        xp: 250,
        description: 'Pre-collapse security automaton. Still guarding vaults that no one remembers locking.'
    },

    vault_sentinel_alpha: {
        id: 'vault_sentinel_alpha',
        name: 'Vault Sentinel Alpha',
        level: 14,
        stats: { strength: 20, dexterity: 14, constitution: 20, intelligence: 12, wisdom: 12, charisma: 4, tech: 18, luck: 10 },
        maxHp: 120,
        armor: 20,
        weapon: { name: 'Plasma Lance', damage: '3d8+5', stat: 'strength' },
        abilities: ['armor_plating', 'adaptive_targeting', 'emergency_repair'],
        ai: 'tactical',
        loot: { credits: [0, 50], items: [{ id: 'alpha_core', chance: 0.2 }] },
        xp: 450,
        description: 'Command-tier sentinel. Older, meaner, and built to survive things that killed everything else.'
    },

    vault_sentinel_beta: {
        id: 'vault_sentinel_beta',
        name: 'Vault Sentinel Beta',
        level: 12,
        stats: { strength: 16, dexterity: 16, constitution: 16, intelligence: 10, wisdom: 10, charisma: 4, tech: 16, luck: 10 },
        maxHp: 90,
        armor: 19,
        weapon: { name: 'Twin Pulse Guns', damage: '2d8+4', stat: 'tech' },
        abilities: ['armor_plating', 'dual_fire'],
        ai: 'aggressive',
        loot: { credits: [0, 30], items: [{ id: 'beta_core', chance: 0.2 }] },
        xp: 350,
        description: 'Fire-support variant sentinel. Trades armor for speed and overwhelming firepower.'
    }
};
