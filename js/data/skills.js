/**
 * LATENCY - Skills Data
 * 200+ acquirable skills across 5 trees: combat, tech, social, survival, crafting.
 * Each skill has real mechanical effects applied through the SkillSystem.
 *
 * Effect types:
 *   damage_bonus, defense_bonus, stat_bonus, hp_bonus, stamina_bonus,
 *   crit_chance, dodge_chance, price_modifier, xp_modifier, heal_bonus,
 *   initiative_bonus, unlock_choice, skill_unlock, ability_grant,
 *   resist_bonus, cooldown_reduction
 */

window.Latency = window.Latency || {};

window.Latency.SkillsData = {

    // =========================================================================
    //  COMBAT TREE - TIER 1
    // =========================================================================

    blade_mastery_1: {
        id: 'blade_mastery_1',
        name: 'Blade Mastery I',
        tree: 'combat',
        tier: 1,
        description: 'Basic sword techniques. +10% melee damage.',
        effects: [
            { type: 'damage_bonus', subtype: 'melee', value: 0.1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '⚔️'
    },

    marksmanship_1: {
        id: 'marksmanship_1',
        name: 'Marksmanship I',
        tree: 'combat',
        tier: 1,
        description: 'Fundamental ranged combat training. +10% ranged damage.',
        effects: [
            { type: 'damage_bonus', subtype: 'ranged', value: 0.1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🎯'
    },

    shield_training: {
        id: 'shield_training',
        name: 'Shield Training',
        tree: 'combat',
        tier: 1,
        description: 'Learn to use shields effectively. +5 armor when shield equipped.',
        effects: [
            { type: 'defense_bonus', subtype: 'shield', value: 5 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🛡️'
    },

    quick_draw: {
        id: 'quick_draw',
        name: 'Quick Draw',
        tree: 'combat',
        tier: 1,
        description: 'Lightning-fast weapon draw. +3 initiative.',
        effects: [
            { type: 'initiative_bonus', value: 3 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '⚡'
    },

    power_strike: {
        id: 'power_strike',
        name: 'Power Strike',
        tree: 'combat',
        tier: 1,
        description: 'Channel raw force into devastating blows. Grants Power Strike ability.',
        effects: [
            { type: 'ability_grant', ability: 'power_strike' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: { strength: 12 },
        icon: '💪'
    },

    heavy_armor_prof: {
        id: 'heavy_armor_prof',
        name: 'Heavy Armor Proficiency',
        tree: 'combat',
        tier: 1,
        description: 'Wear heavy armor without speed penalty. +3 armor.',
        effects: [
            { type: 'defense_bonus', subtype: 'armor', value: 3 },
            { type: 'unlock_choice', subtype: 'heavy_armor' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 2,
        statRequired: { strength: 13 },
        icon: '🪖'
    },

    light_armor_prof: {
        id: 'light_armor_prof',
        name: 'Light Armor Proficiency',
        tree: 'combat',
        tier: 1,
        description: 'Move fluidly in light armor. +3% dodge chance.',
        effects: [
            { type: 'dodge_chance', value: 0.03 },
            { type: 'unlock_choice', subtype: 'light_armor' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🧥'
    },

    dual_wield_basics: {
        id: 'dual_wield_basics',
        name: 'Dual Wield Basics',
        tree: 'combat',
        tier: 1,
        description: 'Fight with a weapon in each hand. -20% off-hand penalty (from -50%).',
        effects: [
            { type: 'unlock_choice', subtype: 'dual_wield' },
            { type: 'damage_bonus', subtype: 'offhand', value: 0.3 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 2,
        statRequired: { dexterity: 12 },
        icon: '🗡️'
    },

    weapon_focus: {
        id: 'weapon_focus',
        name: 'Weapon Focus',
        tree: 'combat',
        tier: 1,
        description: 'Focused training with your primary weapon. +5% crit chance.',
        effects: [
            { type: 'crit_chance', value: 0.05 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🔪'
    },

    battle_cry: {
        id: 'battle_cry',
        name: 'Battle Cry',
        tree: 'combat',
        tier: 1,
        description: 'Intimidating war shout. Grants Battle Cry ability (debuffs enemies).',
        effects: [
            { type: 'ability_grant', ability: 'battle_cry' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: { charisma: 11 },
        icon: '📣'
    },

    toughness: {
        id: 'toughness',
        name: 'Toughness',
        tree: 'combat',
        tier: 1,
        description: 'Hardened body from years of fighting. +15 max HP.',
        effects: [
            { type: 'hp_bonus', value: 15 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '❤️'
    },

    combat_reflexes: {
        id: 'combat_reflexes',
        name: 'Combat Reflexes',
        tree: 'combat',
        tier: 1,
        description: 'Heightened battlefield awareness. +2 initiative, +2% dodge chance.',
        effects: [
            { type: 'initiative_bonus', value: 2 },
            { type: 'dodge_chance', value: 0.02 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '👁️'
    },

    // =========================================================================
    //  COMBAT TREE - TIER 2
    // =========================================================================

    blade_mastery_2: {
        id: 'blade_mastery_2',
        name: 'Blade Mastery II',
        tree: 'combat',
        tier: 2,
        description: 'Advanced blade techniques. +15% melee damage, +3% crit.',
        effects: [
            { type: 'damage_bonus', subtype: 'melee', value: 0.15 },
            { type: 'crit_chance', value: 0.03 }
        ],
        cost: 2,
        prerequisites: ['blade_mastery_1'],
        levelRequired: 5,
        statRequired: { strength: 13 },
        icon: '⚔️'
    },

    marksmanship_2: {
        id: 'marksmanship_2',
        name: 'Marksmanship II',
        tree: 'combat',
        tier: 2,
        description: 'Steady hand, keen eye. +15% ranged damage, +3% crit.',
        effects: [
            { type: 'damage_bonus', subtype: 'ranged', value: 0.15 },
            { type: 'crit_chance', value: 0.03 }
        ],
        cost: 2,
        prerequisites: ['marksmanship_1'],
        levelRequired: 5,
        statRequired: { dexterity: 13 },
        icon: '🎯'
    },

    riposte: {
        id: 'riposte',
        name: 'Riposte',
        tree: 'combat',
        tier: 2,
        description: 'Counter-attack after a successful parry. Grants Riposte ability.',
        effects: [
            { type: 'ability_grant', ability: 'riposte' }
        ],
        cost: 2,
        prerequisites: ['blade_mastery_1'],
        levelRequired: 4,
        statRequired: { dexterity: 13 },
        icon: '↩️'
    },

    cleave: {
        id: 'cleave',
        name: 'Cleave',
        tree: 'combat',
        tier: 2,
        description: 'Sweep attack that hits multiple enemies. Grants Cleave ability.',
        effects: [
            { type: 'ability_grant', ability: 'cleave' }
        ],
        cost: 2,
        prerequisites: ['power_strike'],
        levelRequired: 5,
        statRequired: { strength: 14 },
        icon: '🪓'
    },

    aimed_shot: {
        id: 'aimed_shot',
        name: 'Aimed Shot',
        tree: 'combat',
        tier: 2,
        description: 'Precise shot targeting weak points. Grants Aimed Shot ability.',
        effects: [
            { type: 'ability_grant', ability: 'aimed_shot' }
        ],
        cost: 2,
        prerequisites: ['marksmanship_1'],
        levelRequired: 4,
        statRequired: null,
        icon: '🎯'
    },

    shield_bash: {
        id: 'shield_bash',
        name: 'Shield Bash',
        tree: 'combat',
        tier: 2,
        description: 'Slam your shield into an enemy to stun. Grants Shield Bash ability.',
        effects: [
            { type: 'ability_grant', ability: 'shield_bash' }
        ],
        cost: 2,
        prerequisites: ['shield_training'],
        levelRequired: 5,
        statRequired: { strength: 13 },
        icon: '🛡️'
    },

    berserker_strike: {
        id: 'berserker_strike',
        name: 'Berserker Strike',
        tree: 'combat',
        tier: 2,
        description: 'Reckless all-out attack. +25% damage, -10% dodge for 2 turns.',
        effects: [
            { type: 'ability_grant', ability: 'berserker_strike' }
        ],
        cost: 2,
        prerequisites: ['power_strike'],
        levelRequired: 5,
        statRequired: { strength: 14 },
        icon: '🔥'
    },

    counter_attack: {
        id: 'counter_attack',
        name: 'Counter Attack',
        tree: 'combat',
        tier: 2,
        description: '15% chance to automatically counter-attack when hit.',
        effects: [
            { type: 'ability_grant', ability: 'counter_attack' },
            { type: 'crit_chance', value: 0.02 }
        ],
        cost: 2,
        prerequisites: ['combat_reflexes'],
        levelRequired: 5,
        statRequired: { dexterity: 13 },
        icon: '⚡'
    },

    weapon_specialization: {
        id: 'weapon_specialization',
        name: 'Weapon Specialization',
        tree: 'combat',
        tier: 2,
        description: 'Deep mastery of your favored weapon. +8% all weapon damage.',
        effects: [
            { type: 'damage_bonus', subtype: 'all', value: 0.08 }
        ],
        cost: 2,
        prerequisites: ['weapon_focus'],
        levelRequired: 5,
        statRequired: null,
        icon: '🔪'
    },

    armor_piercing: {
        id: 'armor_piercing',
        name: 'Armor Piercing',
        tree: 'combat',
        tier: 2,
        description: 'Attacks ignore 15% of enemy armor.',
        effects: [
            { type: 'damage_bonus', subtype: 'armor_pen', value: 0.15 }
        ],
        cost: 2,
        prerequisites: ['weapon_focus'],
        levelRequired: 6,
        statRequired: null,
        icon: '🔩'
    },

    adrenaline_surge: {
        id: 'adrenaline_surge',
        name: 'Adrenaline Surge',
        tree: 'combat',
        tier: 2,
        description: 'Gain +5 initiative and +10 stamina when combat starts.',
        effects: [
            { type: 'initiative_bonus', value: 5 },
            { type: 'stamina_bonus', value: 10 }
        ],
        cost: 2,
        prerequisites: ['quick_draw'],
        levelRequired: 5,
        statRequired: null,
        icon: '💉'
    },

    // =========================================================================
    //  COMBAT TREE - TIER 3
    // =========================================================================

    blade_mastery_3: {
        id: 'blade_mastery_3',
        name: 'Blade Mastery III',
        tree: 'combat',
        tier: 3,
        description: 'Master swordsman. +20% melee damage, +5% crit, +2% dodge.',
        effects: [
            { type: 'damage_bonus', subtype: 'melee', value: 0.2 },
            { type: 'crit_chance', value: 0.05 },
            { type: 'dodge_chance', value: 0.02 }
        ],
        cost: 3,
        prerequisites: ['blade_mastery_2'],
        levelRequired: 10,
        statRequired: { strength: 15 },
        icon: '⚔️'
    },

    marksmanship_3: {
        id: 'marksmanship_3',
        name: 'Marksmanship III',
        tree: 'combat',
        tier: 3,
        description: 'Expert marksman. +20% ranged damage, +5% crit.',
        effects: [
            { type: 'damage_bonus', subtype: 'ranged', value: 0.2 },
            { type: 'crit_chance', value: 0.05 }
        ],
        cost: 3,
        prerequisites: ['marksmanship_2'],
        levelRequired: 10,
        statRequired: { dexterity: 15 },
        icon: '🎯'
    },

    whirlwind_attack: {
        id: 'whirlwind_attack',
        name: 'Whirlwind Attack',
        tree: 'combat',
        tier: 3,
        description: 'Devastating spinning attack hitting all enemies. Grants Whirlwind ability.',
        effects: [
            { type: 'ability_grant', ability: 'whirlwind_attack' }
        ],
        cost: 3,
        prerequisites: ['cleave'],
        levelRequired: 10,
        statRequired: { strength: 16 },
        icon: '🌪️'
    },

    lethal_strike: {
        id: 'lethal_strike',
        name: 'Lethal Strike',
        tree: 'combat',
        tier: 3,
        description: 'Strike vital points for massive damage. +15% crit damage multiplier.',
        effects: [
            { type: 'damage_bonus', subtype: 'crit_mult', value: 0.15 },
            { type: 'crit_chance', value: 0.05 }
        ],
        cost: 3,
        prerequisites: ['weapon_specialization'],
        levelRequired: 10,
        statRequired: { dexterity: 15 },
        icon: '💀'
    },

    snipers_eye: {
        id: 'snipers_eye',
        name: "Sniper's Eye",
        tree: 'combat',
        tier: 3,
        description: 'Headshot targeting. +10% ranged crit chance, ignore 20% armor at range.',
        effects: [
            { type: 'crit_chance', value: 0.1 },
            { type: 'damage_bonus', subtype: 'armor_pen_ranged', value: 0.2 }
        ],
        cost: 3,
        prerequisites: ['aimed_shot'],
        levelRequired: 10,
        statRequired: { dexterity: 16 },
        icon: '👁️'
    },

    iron_fortress: {
        id: 'iron_fortress',
        name: 'Iron Fortress',
        tree: 'combat',
        tier: 3,
        description: 'Immovable defensive stance. +10 armor, +20 max HP, -5% dodge.',
        effects: [
            { type: 'defense_bonus', subtype: 'armor', value: 10 },
            { type: 'hp_bonus', value: 20 },
            { type: 'dodge_chance', value: -0.05 }
        ],
        cost: 3,
        prerequisites: ['shield_bash', 'heavy_armor_prof'],
        levelRequired: 10,
        statRequired: { constitution: 16 },
        icon: '🏰'
    },

    death_from_above: {
        id: 'death_from_above',
        name: 'Death From Above',
        tree: 'combat',
        tier: 3,
        description: 'Devastating aerial attack from elevation. Grants ability with +50% damage.',
        effects: [
            { type: 'ability_grant', ability: 'death_from_above' }
        ],
        cost: 3,
        prerequisites: ['berserker_strike'],
        levelRequired: 10,
        statRequired: { strength: 15, dexterity: 13 },
        icon: '☄️'
    },

    execute: {
        id: 'execute',
        name: 'Execute',
        tree: 'combat',
        tier: 3,
        description: 'Finish wounded enemies. Instant kill on targets below 20% HP.',
        effects: [
            { type: 'ability_grant', ability: 'execute' }
        ],
        cost: 3,
        prerequisites: ['lethal_strike'],
        levelRequired: 11,
        statRequired: { strength: 15 },
        icon: '⚰️'
    },

    master_parry: {
        id: 'master_parry',
        name: 'Master Parry',
        tree: 'combat',
        tier: 3,
        description: 'Deflect almost any attack. +10% dodge, +5 armor.',
        effects: [
            { type: 'dodge_chance', value: 0.1 },
            { type: 'defense_bonus', subtype: 'armor', value: 5 }
        ],
        cost: 3,
        prerequisites: ['riposte', 'counter_attack'],
        levelRequired: 10,
        statRequired: { dexterity: 16 },
        icon: '🤺'
    },

    unstoppable: {
        id: 'unstoppable',
        name: 'Unstoppable',
        tree: 'combat',
        tier: 3,
        description: 'Cannot be slowed, stunned or knocked down. +30 max HP.',
        effects: [
            { type: 'resist_bonus', subtype: 'stun', value: 1.0 },
            { type: 'resist_bonus', subtype: 'knockdown', value: 1.0 },
            { type: 'hp_bonus', value: 30 }
        ],
        cost: 3,
        prerequisites: ['toughness', 'heavy_armor_prof'],
        levelRequired: 10,
        statRequired: { constitution: 16 },
        icon: '🦾'
    },

    // =========================================================================
    //  COMBAT TREE - TIER 4
    // =========================================================================

    blade_master: {
        id: 'blade_master',
        name: 'Blade Master',
        tree: 'combat',
        tier: 4,
        description: 'Legendary swordsman. +30% melee damage, +10% crit, auto-riposte.',
        effects: [
            { type: 'damage_bonus', subtype: 'melee', value: 0.3 },
            { type: 'crit_chance', value: 0.1 },
            { type: 'ability_grant', ability: 'auto_riposte' }
        ],
        cost: 4,
        prerequisites: ['blade_mastery_3'],
        levelRequired: 15,
        statRequired: { strength: 18, dexterity: 15 },
        icon: '⚔️'
    },

    deadeye: {
        id: 'deadeye',
        name: 'Deadeye',
        tree: 'combat',
        tier: 4,
        description: 'Never miss. +35% ranged damage, +15% crit, ignore 30% armor.',
        effects: [
            { type: 'damage_bonus', subtype: 'ranged', value: 0.35 },
            { type: 'crit_chance', value: 0.15 },
            { type: 'damage_bonus', subtype: 'armor_pen_ranged', value: 0.3 }
        ],
        cost: 4,
        prerequisites: ['marksmanship_3', 'snipers_eye'],
        levelRequired: 15,
        statRequired: { dexterity: 18 },
        icon: '🎯'
    },

    one_man_army: {
        id: 'one_man_army',
        name: 'One Man Army',
        tree: 'combat',
        tier: 4,
        description: 'Unstoppable warrior. +50 max HP, +8 armor, +5% all damage.',
        effects: [
            { type: 'hp_bonus', value: 50 },
            { type: 'defense_bonus', subtype: 'armor', value: 8 },
            { type: 'damage_bonus', subtype: 'all', value: 0.05 }
        ],
        cost: 4,
        prerequisites: ['unstoppable', 'iron_fortress'],
        levelRequired: 16,
        statRequired: { strength: 17, constitution: 17 },
        icon: '🏆'
    },

    avatar_of_war: {
        id: 'avatar_of_war',
        name: 'Avatar of War',
        tree: 'combat',
        tier: 4,
        description: 'Become war incarnate. +20% all damage, +20% crit damage, +10 initiative.',
        effects: [
            { type: 'damage_bonus', subtype: 'all', value: 0.2 },
            { type: 'damage_bonus', subtype: 'crit_mult', value: 0.2 },
            { type: 'initiative_bonus', value: 10 }
        ],
        cost: 4,
        prerequisites: ['whirlwind_attack', 'lethal_strike'],
        levelRequired: 17,
        statRequired: { strength: 18, dexterity: 16 },
        icon: '👹'
    },

    // =========================================================================
    //  TECH TREE - TIER 1
    // =========================================================================

    basic_hacking: {
        id: 'basic_hacking',
        name: 'Basic Hacking',
        tree: 'tech',
        tier: 1,
        description: 'Fundamental hacking skills. Unlocks basic hack dialogue options.',
        effects: [
            { type: 'unlock_choice', subtype: 'hack_basic' },
            { type: 'stat_bonus', stat: 'tech', value: 1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '💻'
    },

    circuit_analysis: {
        id: 'circuit_analysis',
        name: 'Circuit Analysis',
        tree: 'tech',
        tier: 1,
        description: 'Understand electronic systems. +10% tech damage, reveal enemy tech weaknesses.',
        effects: [
            { type: 'damage_bonus', subtype: 'tech', value: 0.1 },
            { type: 'unlock_choice', subtype: 'tech_scan' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🔌'
    },

    drone_pilot: {
        id: 'drone_pilot',
        name: 'Drone Pilot',
        tree: 'tech',
        tier: 1,
        description: 'Operate basic recon drones. Grants Drone Scout ability.',
        effects: [
            { type: 'ability_grant', ability: 'drone_scout' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: { tech: 11 },
        icon: '🤖'
    },

    stack_reading: {
        id: 'stack_reading',
        name: 'Stack Reading',
        tree: 'tech',
        tier: 1,
        description: 'Read basic cortical stack data. Unlocks stack-related dialogue.',
        effects: [
            { type: 'unlock_choice', subtype: 'stack_read' },
            { type: 'stat_bonus', stat: 'intelligence', value: 1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: { intelligence: 11 },
        icon: '💾'
    },

    emp_basics: {
        id: 'emp_basics',
        name: 'EMP Basics',
        tree: 'tech',
        tier: 1,
        description: 'Use EMP grenades effectively. +15% EMP damage.',
        effects: [
            { type: 'damage_bonus', subtype: 'emp', value: 0.15 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '⚡'
    },

    digital_lockpick: {
        id: 'digital_lockpick',
        name: 'Digital Lockpick',
        tree: 'tech',
        tier: 1,
        description: 'Bypass electronic locks. Unlocks digital lock dialogue options.',
        effects: [
            { type: 'unlock_choice', subtype: 'digital_lock' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🔓'
    },

    code_injection: {
        id: 'code_injection',
        name: 'Code Injection',
        tree: 'tech',
        tier: 1,
        description: 'Inject malicious code into systems. Grants Code Inject ability.',
        effects: [
            { type: 'ability_grant', ability: 'code_inject' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 2,
        statRequired: { tech: 12 },
        icon: '💉'
    },

    network_scan: {
        id: 'network_scan',
        name: 'Network Scan',
        tree: 'tech',
        tier: 1,
        description: 'Scan local networks for useful data. +5% XP from tech encounters.',
        effects: [
            { type: 'xp_modifier', value: 0.05 },
            { type: 'unlock_choice', subtype: 'net_scan' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '📡'
    },

    firewall_basics: {
        id: 'firewall_basics',
        name: 'Firewall Basics',
        tree: 'tech',
        tier: 1,
        description: 'Basic cyber defense. +10% resist to tech damage.',
        effects: [
            { type: 'resist_bonus', subtype: 'tech', value: 0.1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🧱'
    },

    overclock: {
        id: 'overclock',
        name: 'Overclock',
        tree: 'tech',
        tier: 1,
        description: 'Push implants beyond safe limits. +2 to any one stat for 3 turns (ability).',
        effects: [
            { type: 'ability_grant', ability: 'overclock' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 2,
        statRequired: { tech: 11 },
        icon: '🔧'
    },

    data_mining: {
        id: 'data_mining',
        name: 'Data Mining',
        tree: 'tech',
        tier: 1,
        description: 'Extract valuable data from terminals. +10% currency from tech sources.',
        effects: [
            { type: 'price_modifier', subtype: 'tech_loot', value: 0.1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '⛏️'
    },

    tech_savvy: {
        id: 'tech_savvy',
        name: 'Tech Savvy',
        tree: 'tech',
        tier: 1,
        description: 'Natural affinity for technology. +2 Tech stat.',
        effects: [
            { type: 'stat_bonus', stat: 'tech', value: 2 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🧠'
    },

    // =========================================================================
    //  TECH TREE - TIER 2
    // =========================================================================

    advanced_hacking: {
        id: 'advanced_hacking',
        name: 'Advanced Hacking',
        tree: 'tech',
        tier: 2,
        description: 'Breach secured systems. Unlocks advanced hack options, +2 Tech.',
        effects: [
            { type: 'unlock_choice', subtype: 'hack_advanced' },
            { type: 'stat_bonus', stat: 'tech', value: 2 }
        ],
        cost: 2,
        prerequisites: ['basic_hacking'],
        levelRequired: 5,
        statRequired: { tech: 14 },
        icon: '💻'
    },

    neural_interface: {
        id: 'neural_interface',
        name: 'Neural Interface',
        tree: 'tech',
        tier: 2,
        description: 'Direct brain-to-machine link. +3 Intelligence, +2 Tech.',
        effects: [
            { type: 'stat_bonus', stat: 'intelligence', value: 3 },
            { type: 'stat_bonus', stat: 'tech', value: 2 }
        ],
        cost: 2,
        prerequisites: ['circuit_analysis'],
        levelRequired: 5,
        statRequired: { intelligence: 13 },
        icon: '🧠'
    },

    drone_strike: {
        id: 'drone_strike',
        name: 'Drone Strike',
        tree: 'tech',
        tier: 2,
        description: 'Armed combat drone. Grants Drone Strike ability.',
        effects: [
            { type: 'ability_grant', ability: 'drone_strike' }
        ],
        cost: 2,
        prerequisites: ['drone_pilot'],
        levelRequired: 6,
        statRequired: { tech: 14 },
        icon: '🤖'
    },

    stack_manipulation: {
        id: 'stack_manipulation',
        name: 'Stack Manipulation',
        tree: 'tech',
        tier: 2,
        description: 'Alter cortical stack data. Unlocks stack manipulation dialogue.',
        effects: [
            { type: 'unlock_choice', subtype: 'stack_manipulate' },
            { type: 'stat_bonus', stat: 'intelligence', value: 2 }
        ],
        cost: 2,
        prerequisites: ['stack_reading'],
        levelRequired: 6,
        statRequired: { intelligence: 14, tech: 13 },
        icon: '💾'
    },

    emp_mastery: {
        id: 'emp_mastery',
        name: 'EMP Mastery',
        tree: 'tech',
        tier: 2,
        description: 'Maximum EMP effectiveness. +30% EMP damage, wider blast radius.',
        effects: [
            { type: 'damage_bonus', subtype: 'emp', value: 0.3 },
            { type: 'ability_grant', ability: 'emp_blast' }
        ],
        cost: 2,
        prerequisites: ['emp_basics'],
        levelRequired: 6,
        statRequired: { tech: 13 },
        icon: '⚡'
    },

    system_exploit: {
        id: 'system_exploit',
        name: 'System Exploit',
        tree: 'tech',
        tier: 2,
        description: 'Find and leverage system vulnerabilities. +15% tech damage.',
        effects: [
            { type: 'damage_bonus', subtype: 'tech', value: 0.15 },
            { type: 'unlock_choice', subtype: 'exploit' }
        ],
        cost: 2,
        prerequisites: ['code_injection'],
        levelRequired: 5,
        statRequired: { tech: 14 },
        icon: '🐛'
    },

    virus_upload: {
        id: 'virus_upload',
        name: 'Virus Upload',
        tree: 'tech',
        tier: 2,
        description: 'Deploy custom viruses. Grants Virus Upload ability (DoT tech damage).',
        effects: [
            { type: 'ability_grant', ability: 'virus_upload' }
        ],
        cost: 2,
        prerequisites: ['code_injection'],
        levelRequired: 6,
        statRequired: { tech: 14 },
        icon: '🦠'
    },

    signal_intercept: {
        id: 'signal_intercept',
        name: 'Signal Intercept',
        tree: 'tech',
        tier: 2,
        description: 'Eavesdrop on communications. Unlocks intercept dialogue options.',
        effects: [
            { type: 'unlock_choice', subtype: 'signal_intercept' },
            { type: 'xp_modifier', value: 0.05 }
        ],
        cost: 2,
        prerequisites: ['network_scan'],
        levelRequired: 5,
        statRequired: { tech: 13 },
        icon: '📡'
    },

    cyber_defense: {
        id: 'cyber_defense',
        name: 'Cyber Defense',
        tree: 'tech',
        tier: 2,
        description: 'Hardened digital defenses. +20% tech resist, +5 max HP.',
        effects: [
            { type: 'resist_bonus', subtype: 'tech', value: 0.2 },
            { type: 'hp_bonus', value: 5 }
        ],
        cost: 2,
        prerequisites: ['firewall_basics'],
        levelRequired: 5,
        statRequired: null,
        icon: '🧱'
    },

    turbo_charge: {
        id: 'turbo_charge',
        name: 'Turbo Charge',
        tree: 'tech',
        tier: 2,
        description: 'Supercharge implants. Grants Turbo Charge ability (+4 to chosen stat, 3 turns).',
        effects: [
            { type: 'ability_grant', ability: 'turbo_charge' }
        ],
        cost: 2,
        prerequisites: ['overclock'],
        levelRequired: 6,
        statRequired: { tech: 14 },
        icon: '🔧'
    },

    // =========================================================================
    //  TECH TREE - TIER 3
    // =========================================================================

    master_hacking: {
        id: 'master_hacking',
        name: 'Master Hacking',
        tree: 'tech',
        tier: 3,
        description: 'Breach any system. Unlocks master-level hack options, +3 Tech.',
        effects: [
            { type: 'unlock_choice', subtype: 'hack_master' },
            { type: 'stat_bonus', stat: 'tech', value: 3 }
        ],
        cost: 3,
        prerequisites: ['advanced_hacking'],
        levelRequired: 10,
        statRequired: { tech: 17 },
        icon: '💻'
    },

    neural_domination: {
        id: 'neural_domination',
        name: 'Neural Domination',
        tree: 'tech',
        tier: 3,
        description: 'Hack enemy neural systems. Grants Neural Domination ability (enemy confusion).',
        effects: [
            { type: 'ability_grant', ability: 'neural_domination' }
        ],
        cost: 3,
        prerequisites: ['neural_interface'],
        levelRequired: 11,
        statRequired: { intelligence: 16, tech: 15 },
        icon: '🧠'
    },

    drone_swarm: {
        id: 'drone_swarm',
        name: 'Drone Swarm',
        tree: 'tech',
        tier: 3,
        description: 'Deploy multiple combat drones simultaneously. Grants Drone Swarm ability.',
        effects: [
            { type: 'ability_grant', ability: 'drone_swarm' }
        ],
        cost: 3,
        prerequisites: ['drone_strike'],
        levelRequired: 10,
        statRequired: { tech: 16 },
        icon: '🤖'
    },

    stack_theft: {
        id: 'stack_theft',
        name: 'Stack Theft',
        tree: 'tech',
        tier: 3,
        description: 'Copy or steal stack data. Unlocks stack theft dialogue and abilities.',
        effects: [
            { type: 'unlock_choice', subtype: 'stack_steal' },
            { type: 'ability_grant', ability: 'stack_theft' }
        ],
        cost: 3,
        prerequisites: ['stack_manipulation'],
        levelRequired: 11,
        statRequired: { intelligence: 16, tech: 15 },
        icon: '💾'
    },

    emp_pulse: {
        id: 'emp_pulse',
        name: 'EMP Pulse',
        tree: 'tech',
        tier: 3,
        description: 'Devastating area EMP. Grants EMP Pulse ability (shuts down all tech).',
        effects: [
            { type: 'ability_grant', ability: 'emp_pulse' }
        ],
        cost: 3,
        prerequisites: ['emp_mastery'],
        levelRequired: 10,
        statRequired: { tech: 16 },
        icon: '⚡'
    },

    zero_day: {
        id: 'zero_day',
        name: 'Zero Day',
        tree: 'tech',
        tier: 3,
        description: 'Exploit unknown vulnerabilities. +25% tech damage, bypass firewalls.',
        effects: [
            { type: 'damage_bonus', subtype: 'tech', value: 0.25 },
            { type: 'unlock_choice', subtype: 'zero_day' }
        ],
        cost: 3,
        prerequisites: ['system_exploit'],
        levelRequired: 10,
        statRequired: { tech: 17 },
        icon: '🐛'
    },

    trojan_horse: {
        id: 'trojan_horse',
        name: 'Trojan Horse',
        tree: 'tech',
        tier: 3,
        description: 'Plant deep-cover programs. Grants Trojan Horse ability (delayed sabotage).',
        effects: [
            { type: 'ability_grant', ability: 'trojan_horse' }
        ],
        cost: 3,
        prerequisites: ['virus_upload'],
        levelRequired: 10,
        statRequired: { tech: 16 },
        icon: '🐴'
    },

    ghost_signal: {
        id: 'ghost_signal',
        name: 'Ghost Signal',
        tree: 'tech',
        tier: 3,
        description: 'Become invisible to electronic detection. +10% dodge, unlocks ghost paths.',
        effects: [
            { type: 'dodge_chance', value: 0.1 },
            { type: 'unlock_choice', subtype: 'ghost_signal' }
        ],
        cost: 3,
        prerequisites: ['signal_intercept'],
        levelRequired: 10,
        statRequired: { tech: 16 },
        icon: '👻'
    },

    quantum_shield: {
        id: 'quantum_shield',
        name: 'Quantum Shield',
        tree: 'tech',
        tier: 3,
        description: 'Probabilistic energy barrier. +8 armor, +30% tech resist.',
        effects: [
            { type: 'defense_bonus', subtype: 'armor', value: 8 },
            { type: 'resist_bonus', subtype: 'tech', value: 0.3 }
        ],
        cost: 3,
        prerequisites: ['cyber_defense'],
        levelRequired: 10,
        statRequired: { tech: 16 },
        icon: '🔮'
    },

    overload: {
        id: 'overload',
        name: 'Overload',
        tree: 'tech',
        tier: 3,
        description: 'Push all systems to critical. +20% all tech damage, +5 initiative.',
        effects: [
            { type: 'damage_bonus', subtype: 'tech', value: 0.2 },
            { type: 'initiative_bonus', value: 5 }
        ],
        cost: 3,
        prerequisites: ['turbo_charge'],
        levelRequired: 10,
        statRequired: { tech: 16 },
        icon: '🔧'
    },

    // =========================================================================
    //  TECH TREE - TIER 4
    // =========================================================================

    digital_god: {
        id: 'digital_god',
        name: 'Digital God',
        tree: 'tech',
        tier: 4,
        description: 'Total digital supremacy. +5 Tech, +5 Intelligence, hack anything.',
        effects: [
            { type: 'stat_bonus', stat: 'tech', value: 5 },
            { type: 'stat_bonus', stat: 'intelligence', value: 5 },
            { type: 'unlock_choice', subtype: 'hack_god' }
        ],
        cost: 4,
        prerequisites: ['master_hacking', 'zero_day'],
        levelRequired: 15,
        statRequired: { tech: 19, intelligence: 17 },
        icon: '👁️'
    },

    singularity: {
        id: 'singularity',
        name: 'Singularity',
        tree: 'tech',
        tier: 4,
        description: 'Merge with the network. +40% tech damage, grants Singularity ability.',
        effects: [
            { type: 'damage_bonus', subtype: 'tech', value: 0.4 },
            { type: 'ability_grant', ability: 'singularity' }
        ],
        cost: 4,
        prerequisites: ['neural_domination', 'stack_theft'],
        levelRequired: 16,
        statRequired: { intelligence: 18, tech: 18 },
        icon: '🌐'
    },

    machine_lord: {
        id: 'machine_lord',
        name: 'Machine Lord',
        tree: 'tech',
        tier: 4,
        description: 'Command all machines. Grants Machine Lord ability (control any drone/turret).',
        effects: [
            { type: 'ability_grant', ability: 'machine_lord' },
            { type: 'stat_bonus', stat: 'tech', value: 4 }
        ],
        cost: 4,
        prerequisites: ['drone_swarm', 'overload'],
        levelRequired: 15,
        statRequired: { tech: 19 },
        icon: '🤖'
    },

    the_architect: {
        id: 'the_architect',
        name: 'The Architect',
        tree: 'tech',
        tier: 4,
        description: 'Reshape digital reality. +50% tech damage, create virtual constructs.',
        effects: [
            { type: 'damage_bonus', subtype: 'tech', value: 0.5 },
            { type: 'ability_grant', ability: 'architect_construct' },
            { type: 'stat_bonus', stat: 'tech', value: 3 }
        ],
        cost: 4,
        prerequisites: ['trojan_horse', 'quantum_shield'],
        levelRequired: 17,
        statRequired: { tech: 20, intelligence: 17 },
        icon: '🏗️'
    },

    // =========================================================================
    //  SOCIAL TREE - TIER 1
    // =========================================================================

    persuasion: {
        id: 'persuasion',
        name: 'Persuasion',
        tree: 'social',
        tier: 1,
        description: 'Convince others through reason. Unlocks persuasion dialogue options.',
        effects: [
            { type: 'unlock_choice', subtype: 'persuade' },
            { type: 'stat_bonus', stat: 'charisma', value: 1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🗣️'
    },

    intimidation: {
        id: 'intimidation',
        name: 'Intimidation',
        tree: 'social',
        tier: 1,
        description: 'Coerce through fear. Unlocks intimidation dialogue options.',
        effects: [
            { type: 'unlock_choice', subtype: 'intimidate' },
            { type: 'stat_bonus', stat: 'strength', value: 1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '😠'
    },

    deception: {
        id: 'deception',
        name: 'Deception',
        tree: 'social',
        tier: 1,
        description: 'Lie convincingly. Unlocks deception dialogue options.',
        effects: [
            { type: 'unlock_choice', subtype: 'deceive' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🎭'
    },

    bartering: {
        id: 'bartering',
        name: 'Bartering',
        tree: 'social',
        tier: 1,
        description: 'Negotiate better prices. Buy 10% cheaper, sell 10% higher.',
        effects: [
            { type: 'price_modifier', subtype: 'buy', value: -0.1 },
            { type: 'price_modifier', subtype: 'sell', value: 0.1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '💰'
    },

    leadership: {
        id: 'leadership',
        name: 'Leadership',
        tree: 'social',
        tier: 1,
        description: 'Inspire allies in combat. +5% party damage when leading.',
        effects: [
            { type: 'damage_bonus', subtype: 'party', value: 0.05 },
            { type: 'unlock_choice', subtype: 'lead' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: { charisma: 12 },
        icon: '👑'
    },

    seduction: {
        id: 'seduction',
        name: 'Seduction',
        tree: 'social',
        tier: 1,
        description: 'Use charm and allure. Unlocks seduction dialogue options.',
        effects: [
            { type: 'unlock_choice', subtype: 'seduce' },
            { type: 'stat_bonus', stat: 'charisma', value: 1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 2,
        statRequired: { charisma: 12 },
        icon: '💋'
    },

    diplomacy: {
        id: 'diplomacy',
        name: 'Diplomacy',
        tree: 'social',
        tier: 1,
        description: 'Resolve conflicts peacefully. +5% faction reputation gains.',
        effects: [
            { type: 'xp_modifier', value: 0.05 },
            { type: 'unlock_choice', subtype: 'diplomacy' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🤝'
    },

    street_smarts: {
        id: 'street_smarts',
        name: 'Street Smarts',
        tree: 'social',
        tier: 1,
        description: 'Know how the city works. Unlocks street-smart dialogue options, +1 Luck.',
        effects: [
            { type: 'unlock_choice', subtype: 'street_smart' },
            { type: 'stat_bonus', stat: 'luck', value: 1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🏙️'
    },

    interrogation: {
        id: 'interrogation',
        name: 'Interrogation',
        tree: 'social',
        tier: 1,
        description: 'Extract information from unwilling subjects. Unlocks interrogation options.',
        effects: [
            { type: 'unlock_choice', subtype: 'interrogate' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 2,
        statRequired: { wisdom: 11 },
        icon: '🔍'
    },

    command: {
        id: 'command',
        name: 'Command',
        tree: 'social',
        tier: 1,
        description: 'Give orders that are obeyed. Unlocks command dialogue. +2 initiative.',
        effects: [
            { type: 'unlock_choice', subtype: 'command' },
            { type: 'initiative_bonus', value: 2 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: { charisma: 11 },
        icon: '📢'
    },

    empathy: {
        id: 'empathy',
        name: 'Empathy',
        tree: 'social',
        tier: 1,
        description: 'Read emotions and motivations. Unlocks empathy options, +1 Wisdom.',
        effects: [
            { type: 'unlock_choice', subtype: 'empathy' },
            { type: 'stat_bonus', stat: 'wisdom', value: 1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '💙'
    },

    streetwise: {
        id: 'streetwise',
        name: 'Streetwise',
        tree: 'social',
        tier: 1,
        description: 'Know the underworld. +5% discount at black market vendors.',
        effects: [
            { type: 'price_modifier', subtype: 'black_market', value: -0.05 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🌃'
    },

    // =========================================================================
    //  SOCIAL TREE - TIER 2
    // =========================================================================

    silver_tongue: {
        id: 'silver_tongue',
        name: 'Silver Tongue',
        tree: 'social',
        tier: 2,
        description: 'Words are your weapon. +3 Charisma, unlock advanced persuasion.',
        effects: [
            { type: 'stat_bonus', stat: 'charisma', value: 3 },
            { type: 'unlock_choice', subtype: 'persuade_advanced' }
        ],
        cost: 2,
        prerequisites: ['persuasion'],
        levelRequired: 5,
        statRequired: { charisma: 14 },
        icon: '🗣️'
    },

    iron_gaze: {
        id: 'iron_gaze',
        name: 'Iron Gaze',
        tree: 'social',
        tier: 2,
        description: 'Your stare breaks wills. Advanced intimidation, +2 Strength.',
        effects: [
            { type: 'unlock_choice', subtype: 'intimidate_advanced' },
            { type: 'stat_bonus', stat: 'strength', value: 2 }
        ],
        cost: 2,
        prerequisites: ['intimidation'],
        levelRequired: 5,
        statRequired: { strength: 13 },
        icon: '😠'
    },

    con_artist: {
        id: 'con_artist',
        name: 'Con Artist',
        tree: 'social',
        tier: 2,
        description: 'Master of the long con. Advanced deception, +15% sell prices.',
        effects: [
            { type: 'unlock_choice', subtype: 'deceive_advanced' },
            { type: 'price_modifier', subtype: 'sell', value: 0.15 }
        ],
        cost: 2,
        prerequisites: ['deception'],
        levelRequired: 5,
        statRequired: { charisma: 13 },
        icon: '🎭'
    },

    merchant_prince: {
        id: 'merchant_prince',
        name: 'Merchant Prince',
        tree: 'social',
        tier: 2,
        description: 'Master negotiator. Buy 20% cheaper, sell 20% higher.',
        effects: [
            { type: 'price_modifier', subtype: 'buy', value: -0.2 },
            { type: 'price_modifier', subtype: 'sell', value: 0.2 }
        ],
        cost: 2,
        prerequisites: ['bartering'],
        levelRequired: 5,
        statRequired: { charisma: 13 },
        icon: '💰'
    },

    warlord: {
        id: 'warlord',
        name: 'Warlord',
        tree: 'social',
        tier: 2,
        description: 'Battle commander. +10% party damage, +3 party initiative.',
        effects: [
            { type: 'damage_bonus', subtype: 'party', value: 0.1 },
            { type: 'initiative_bonus', value: 3 }
        ],
        cost: 2,
        prerequisites: ['leadership'],
        levelRequired: 6,
        statRequired: { charisma: 14 },
        icon: '👑'
    },

    siren: {
        id: 'siren',
        name: 'Siren',
        tree: 'social',
        tier: 2,
        description: 'Irresistible charm. Advanced seduction, +2 Charisma.',
        effects: [
            { type: 'unlock_choice', subtype: 'seduce_advanced' },
            { type: 'stat_bonus', stat: 'charisma', value: 2 }
        ],
        cost: 2,
        prerequisites: ['seduction'],
        levelRequired: 5,
        statRequired: { charisma: 14 },
        icon: '💋'
    },

    negotiator: {
        id: 'negotiator',
        name: 'Negotiator',
        tree: 'social',
        tier: 2,
        description: 'Expert peace broker. +10% faction reputation gains, unlock faction quests.',
        effects: [
            { type: 'xp_modifier', value: 0.1 },
            { type: 'unlock_choice', subtype: 'negotiate' }
        ],
        cost: 2,
        prerequisites: ['diplomacy'],
        levelRequired: 5,
        statRequired: { charisma: 13, wisdom: 13 },
        icon: '🤝'
    },

    info_broker: {
        id: 'info_broker',
        name: 'Info Broker',
        tree: 'social',
        tier: 2,
        description: 'Buy and sell information. Unlock info broker dialogue, +2 Luck.',
        effects: [
            { type: 'unlock_choice', subtype: 'info_broker' },
            { type: 'stat_bonus', stat: 'luck', value: 2 }
        ],
        cost: 2,
        prerequisites: ['street_smarts'],
        levelRequired: 5,
        statRequired: null,
        icon: '🏙️'
    },

    mind_reader: {
        id: 'mind_reader',
        name: 'Mind Reader',
        tree: 'social',
        tier: 2,
        description: 'Read people like books. +3 Wisdom, reveal NPC hidden motives.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 3 },
            { type: 'unlock_choice', subtype: 'read_minds' }
        ],
        cost: 2,
        prerequisites: ['empathy'],
        levelRequired: 5,
        statRequired: { wisdom: 14 },
        icon: '💙'
    },

    rally: {
        id: 'rally',
        name: 'Rally',
        tree: 'social',
        tier: 2,
        description: 'Rally allies in dire situations. Grants Rally ability (heal + buff party).',
        effects: [
            { type: 'ability_grant', ability: 'rally' }
        ],
        cost: 2,
        prerequisites: ['command'],
        levelRequired: 5,
        statRequired: { charisma: 14 },
        icon: '📢'
    },

    // =========================================================================
    //  SOCIAL TREE - TIER 3
    // =========================================================================

    orator: {
        id: 'orator',
        name: 'Orator',
        tree: 'social',
        tier: 3,
        description: 'Move crowds with words. Master persuasion, +5 Charisma.',
        effects: [
            { type: 'stat_bonus', stat: 'charisma', value: 5 },
            { type: 'unlock_choice', subtype: 'persuade_master' }
        ],
        cost: 3,
        prerequisites: ['silver_tongue'],
        levelRequired: 10,
        statRequired: { charisma: 17 },
        icon: '🗣️'
    },

    terror: {
        id: 'terror',
        name: 'Terror',
        tree: 'social',
        tier: 3,
        description: 'Your presence causes dread. Enemies may flee, master intimidation.',
        effects: [
            { type: 'unlock_choice', subtype: 'intimidate_master' },
            { type: 'ability_grant', ability: 'terror_aura' }
        ],
        cost: 3,
        prerequisites: ['iron_gaze'],
        levelRequired: 10,
        statRequired: { strength: 15, charisma: 14 },
        icon: '😈'
    },

    master_manipulator: {
        id: 'master_manipulator',
        name: 'Master Manipulator',
        tree: 'social',
        tier: 3,
        description: 'Puppet master of social situations. Master deception, +3 Charisma.',
        effects: [
            { type: 'unlock_choice', subtype: 'deceive_master' },
            { type: 'stat_bonus', stat: 'charisma', value: 3 }
        ],
        cost: 3,
        prerequisites: ['con_artist'],
        levelRequired: 10,
        statRequired: { charisma: 16 },
        icon: '🎭'
    },

    faction_diplomat: {
        id: 'faction_diplomat',
        name: 'Faction Diplomat',
        tree: 'social',
        tier: 3,
        description: 'Respected by all factions. +20% faction reputation gains, reduced hostility.',
        effects: [
            { type: 'xp_modifier', value: 0.2 },
            { type: 'unlock_choice', subtype: 'faction_diplomat' }
        ],
        cost: 3,
        prerequisites: ['negotiator'],
        levelRequired: 10,
        statRequired: { charisma: 16, wisdom: 15 },
        icon: '🤝'
    },

    spymaster: {
        id: 'spymaster',
        name: 'Spymaster',
        tree: 'social',
        tier: 3,
        description: 'Control a network of informants. +3 Luck, +3 Wisdom, reveal all secrets.',
        effects: [
            { type: 'stat_bonus', stat: 'luck', value: 3 },
            { type: 'stat_bonus', stat: 'wisdom', value: 3 },
            { type: 'unlock_choice', subtype: 'spymaster' }
        ],
        cost: 3,
        prerequisites: ['info_broker', 'mind_reader'],
        levelRequired: 11,
        statRequired: { wisdom: 16 },
        icon: '🕵️'
    },

    war_hero: {
        id: 'war_hero',
        name: 'War Hero',
        tree: 'social',
        tier: 3,
        description: 'Legendary battlefield commander. +15% party damage, +5 party initiative.',
        effects: [
            { type: 'damage_bonus', subtype: 'party', value: 0.15 },
            { type: 'initiative_bonus', value: 5 }
        ],
        cost: 3,
        prerequisites: ['warlord', 'rally'],
        levelRequired: 10,
        statRequired: { charisma: 16 },
        icon: '🎖️'
    },

    enchantress: {
        id: 'enchantress',
        name: 'Enchantress',
        tree: 'social',
        tier: 3,
        description: 'Bewitch anyone. Master seduction, charm enemies in combat.',
        effects: [
            { type: 'unlock_choice', subtype: 'seduce_master' },
            { type: 'ability_grant', ability: 'charm' }
        ],
        cost: 3,
        prerequisites: ['siren'],
        levelRequired: 10,
        statRequired: { charisma: 17 },
        icon: '✨'
    },

    kingmaker: {
        id: 'kingmaker',
        name: 'Kingmaker',
        tree: 'social',
        tier: 3,
        description: 'Put people in power. Buy 30% cheaper, sell 30% higher.',
        effects: [
            { type: 'price_modifier', subtype: 'buy', value: -0.3 },
            { type: 'price_modifier', subtype: 'sell', value: 0.3 }
        ],
        cost: 3,
        prerequisites: ['merchant_prince'],
        levelRequired: 10,
        statRequired: { charisma: 16 },
        icon: '💰'
    },

    psychologist: {
        id: 'psychologist',
        name: 'Psychologist',
        tree: 'social',
        tier: 3,
        description: 'Understand the human psyche. +5 Wisdom, master interrogation.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 5 },
            { type: 'unlock_choice', subtype: 'interrogate_master' }
        ],
        cost: 3,
        prerequisites: ['mind_reader'],
        levelRequired: 10,
        statRequired: { wisdom: 16, intelligence: 14 },
        icon: '🧠'
    },

    demagogue: {
        id: 'demagogue',
        name: 'Demagogue',
        tree: 'social',
        tier: 3,
        description: 'Incite mobs and control masses. Grants Incite Riot ability.',
        effects: [
            { type: 'ability_grant', ability: 'incite_riot' },
            { type: 'stat_bonus', stat: 'charisma', value: 3 }
        ],
        cost: 3,
        prerequisites: ['orator', 'terror'],
        levelRequired: 11,
        statRequired: { charisma: 16 },
        icon: '🔥'
    },

    // =========================================================================
    //  SOCIAL TREE - TIER 4
    // =========================================================================

    faction_leader: {
        id: 'faction_leader',
        name: 'Faction Leader',
        tree: 'social',
        tier: 4,
        description: 'Lead a faction to dominance. +30% faction rep gains, unlock faction endings.',
        effects: [
            { type: 'unlock_choice', subtype: 'faction_leader' },
            { type: 'stat_bonus', stat: 'charisma', value: 5 }
        ],
        cost: 4,
        prerequisites: ['faction_diplomat', 'war_hero'],
        levelRequired: 15,
        statRequired: { charisma: 19 },
        icon: '👑'
    },

    shadow_broker: {
        id: 'shadow_broker',
        name: 'Shadow Broker',
        tree: 'social',
        tier: 4,
        description: 'Control the flow of information. +5 Luck, +5 Wisdom, reveal everything.',
        effects: [
            { type: 'stat_bonus', stat: 'luck', value: 5 },
            { type: 'stat_bonus', stat: 'wisdom', value: 5 },
            { type: 'unlock_choice', subtype: 'shadow_broker' }
        ],
        cost: 4,
        prerequisites: ['spymaster', 'master_manipulator'],
        levelRequired: 16,
        statRequired: { wisdom: 18, charisma: 17 },
        icon: '🕵️'
    },

    silver_emperor: {
        id: 'silver_emperor',
        name: 'Silver Emperor',
        tree: 'social',
        tier: 4,
        description: 'The ultimate social power. +5 Charisma, buy/sell at 40% bonus, control anyone.',
        effects: [
            { type: 'stat_bonus', stat: 'charisma', value: 5 },
            { type: 'price_modifier', subtype: 'buy', value: -0.4 },
            { type: 'price_modifier', subtype: 'sell', value: 0.4 }
        ],
        cost: 4,
        prerequisites: ['enchantress', 'kingmaker'],
        levelRequired: 15,
        statRequired: { charisma: 20 },
        icon: '👸'
    },

    voice_of_god: {
        id: 'voice_of_god',
        name: 'Voice of God',
        tree: 'social',
        tier: 4,
        description: 'Your words reshape reality. Grants Voice of God ability (absolute command).',
        effects: [
            { type: 'ability_grant', ability: 'voice_of_god' },
            { type: 'stat_bonus', stat: 'charisma', value: 5 },
            { type: 'stat_bonus', stat: 'wisdom', value: 3 }
        ],
        cost: 4,
        prerequisites: ['demagogue', 'psychologist'],
        levelRequired: 17,
        statRequired: { charisma: 20, wisdom: 17 },
        icon: '🗣️'
    },

    // =========================================================================
    //  SURVIVAL TREE - TIER 1
    // =========================================================================

    scavenging: {
        id: 'scavenging',
        name: 'Scavenging',
        tree: 'survival',
        tier: 1,
        description: 'Find useful items in debris. +15% loot from scavenging.',
        effects: [
            { type: 'price_modifier', subtype: 'loot', value: 0.15 },
            { type: 'unlock_choice', subtype: 'scavenge' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🔍'
    },

    first_aid: {
        id: 'first_aid',
        name: 'First Aid',
        tree: 'survival',
        tier: 1,
        description: 'Basic wound treatment. Grants First Aid ability (+20% heal effectiveness).',
        effects: [
            { type: 'heal_bonus', value: 0.2 },
            { type: 'ability_grant', ability: 'first_aid' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🩹'
    },

    stealth: {
        id: 'stealth',
        name: 'Stealth',
        tree: 'survival',
        tier: 1,
        description: 'Move without being noticed. Unlocks stealth dialogue options, +3% dodge.',
        effects: [
            { type: 'dodge_chance', value: 0.03 },
            { type: 'unlock_choice', subtype: 'stealth' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🥷'
    },

    lockpicking: {
        id: 'lockpicking',
        name: 'Lockpicking',
        tree: 'survival',
        tier: 1,
        description: 'Open mechanical locks. Unlocks lockpick dialogue options.',
        effects: [
            { type: 'unlock_choice', subtype: 'lockpick' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: { dexterity: 11 },
        icon: '🔐'
    },

    tracking: {
        id: 'tracking',
        name: 'Tracking',
        tree: 'survival',
        tier: 1,
        description: 'Follow tracks and trails. Unlocks tracking dialogue options, +1 Wisdom.',
        effects: [
            { type: 'unlock_choice', subtype: 'track' },
            { type: 'stat_bonus', stat: 'wisdom', value: 1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🐾'
    },

    cooking: {
        id: 'cooking',
        name: 'Cooking',
        tree: 'survival',
        tier: 1,
        description: 'Prepare food for bonuses. Cooked food heals 25% more.',
        effects: [
            { type: 'heal_bonus', value: 0.25 },
            { type: 'unlock_choice', subtype: 'cook' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🍳'
    },

    trap_setting: {
        id: 'trap_setting',
        name: 'Trap Setting',
        tree: 'survival',
        tier: 1,
        description: 'Set and disarm traps. Grants Set Trap ability, detect traps.',
        effects: [
            { type: 'ability_grant', ability: 'set_trap' },
            { type: 'unlock_choice', subtype: 'detect_trap' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🪤'
    },

    navigation: {
        id: 'navigation',
        name: 'Navigation',
        tree: 'survival',
        tier: 1,
        description: 'Never get lost. Reveals hidden paths, +5% XP from exploration.',
        effects: [
            { type: 'xp_modifier', value: 0.05 },
            { type: 'unlock_choice', subtype: 'navigate' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🧭'
    },

    poison_knowledge: {
        id: 'poison_knowledge',
        name: 'Poison Knowledge',
        tree: 'survival',
        tier: 1,
        description: 'Identify and resist poisons. +15% poison resist.',
        effects: [
            { type: 'resist_bonus', subtype: 'poison', value: 0.15 },
            { type: 'unlock_choice', subtype: 'poison_identify' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '☠️'
    },

    endurance: {
        id: 'endurance',
        name: 'Endurance',
        tree: 'survival',
        tier: 1,
        description: 'Superior physical stamina. +15 max stamina, +5 max HP.',
        effects: [
            { type: 'stamina_bonus', value: 15 },
            { type: 'hp_bonus', value: 5 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🏃'
    },

    urban_survival: {
        id: 'urban_survival',
        name: 'Urban Survival',
        tree: 'survival',
        tier: 1,
        description: 'Thrive in the concrete jungle. +1 Constitution, +1 Luck.',
        effects: [
            { type: 'stat_bonus', stat: 'constitution', value: 1 },
            { type: 'stat_bonus', stat: 'luck', value: 1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🏚️'
    },

    awareness: {
        id: 'awareness',
        name: 'Awareness',
        tree: 'survival',
        tier: 1,
        description: 'Heightened senses. +3 initiative, detect hidden enemies.',
        effects: [
            { type: 'initiative_bonus', value: 3 },
            { type: 'unlock_choice', subtype: 'detect_hidden' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '👂'
    },

    // =========================================================================
    //  SURVIVAL TREE - TIER 2
    // =========================================================================

    master_scavenger: {
        id: 'master_scavenger',
        name: 'Master Scavenger',
        tree: 'survival',
        tier: 2,
        description: 'Find treasure in trash. +30% loot, find rare items.',
        effects: [
            { type: 'price_modifier', subtype: 'loot', value: 0.3 },
            { type: 'unlock_choice', subtype: 'rare_scavenge' }
        ],
        cost: 2,
        prerequisites: ['scavenging'],
        levelRequired: 5,
        statRequired: { luck: 13 },
        icon: '🔍'
    },

    field_medic: {
        id: 'field_medic',
        name: 'Field Medic',
        tree: 'survival',
        tier: 2,
        description: 'Advanced wound care. +40% heal effectiveness, cure minor debuffs.',
        effects: [
            { type: 'heal_bonus', value: 0.4 },
            { type: 'ability_grant', ability: 'cure_minor' }
        ],
        cost: 2,
        prerequisites: ['first_aid'],
        levelRequired: 5,
        statRequired: { wisdom: 13 },
        icon: '🩹'
    },

    shadow_walk: {
        id: 'shadow_walk',
        name: 'Shadow Walk',
        tree: 'survival',
        tier: 2,
        description: 'Move through shadows unseen. +8% dodge, advanced stealth options.',
        effects: [
            { type: 'dodge_chance', value: 0.08 },
            { type: 'unlock_choice', subtype: 'stealth_advanced' }
        ],
        cost: 2,
        prerequisites: ['stealth'],
        levelRequired: 5,
        statRequired: { dexterity: 14 },
        icon: '🥷'
    },

    master_lockpick: {
        id: 'master_lockpick',
        name: 'Master Lockpick',
        tree: 'survival',
        tier: 2,
        description: 'Open any mechanical lock. Unlocks advanced lockpick options.',
        effects: [
            { type: 'unlock_choice', subtype: 'lockpick_advanced' }
        ],
        cost: 2,
        prerequisites: ['lockpicking'],
        levelRequired: 5,
        statRequired: { dexterity: 14 },
        icon: '🔐'
    },

    hunter: {
        id: 'hunter',
        name: 'Hunter',
        tree: 'survival',
        tier: 2,
        description: 'Expert tracker and hunter. +10% damage to tracked targets.',
        effects: [
            { type: 'damage_bonus', subtype: 'tracked', value: 0.1 },
            { type: 'unlock_choice', subtype: 'track_advanced' }
        ],
        cost: 2,
        prerequisites: ['tracking'],
        levelRequired: 5,
        statRequired: { wisdom: 13 },
        icon: '🐾'
    },

    poisoner: {
        id: 'poisoner',
        name: 'Poisoner',
        tree: 'survival',
        tier: 2,
        description: 'Create and apply poisons. Grants Poison Weapon ability, +25% poison resist.',
        effects: [
            { type: 'ability_grant', ability: 'poison_weapon' },
            { type: 'resist_bonus', subtype: 'poison', value: 0.25 }
        ],
        cost: 2,
        prerequisites: ['poison_knowledge'],
        levelRequired: 6,
        statRequired: { intelligence: 13 },
        icon: '☠️'
    },

    survivalist: {
        id: 'survivalist',
        name: 'Survivalist',
        tree: 'survival',
        tier: 2,
        description: 'Adapt to any environment. +20 max stamina, +10 max HP.',
        effects: [
            { type: 'stamina_bonus', value: 20 },
            { type: 'hp_bonus', value: 10 }
        ],
        cost: 2,
        prerequisites: ['endurance'],
        levelRequired: 5,
        statRequired: { constitution: 14 },
        icon: '🏃'
    },

    trap_master: {
        id: 'trap_master',
        name: 'Trap Master',
        tree: 'survival',
        tier: 2,
        description: 'Expert trap work. +50% trap damage, auto-detect traps.',
        effects: [
            { type: 'damage_bonus', subtype: 'trap', value: 0.5 },
            { type: 'ability_grant', ability: 'advanced_trap' }
        ],
        cost: 2,
        prerequisites: ['trap_setting'],
        levelRequired: 5,
        statRequired: { dexterity: 13 },
        icon: '🪤'
    },

    pathfinder: {
        id: 'pathfinder',
        name: 'Pathfinder',
        tree: 'survival',
        tier: 2,
        description: 'Find the fastest route. +10% XP from exploration, reveal shortcuts.',
        effects: [
            { type: 'xp_modifier', value: 0.1 },
            { type: 'unlock_choice', subtype: 'shortcut' }
        ],
        cost: 2,
        prerequisites: ['navigation'],
        levelRequired: 5,
        statRequired: null,
        icon: '🧭'
    },

    danger_sense: {
        id: 'danger_sense',
        name: 'Danger Sense',
        tree: 'survival',
        tier: 2,
        description: 'Sixth sense for threats. +5 initiative, +5% dodge, cannot be surprised.',
        effects: [
            { type: 'initiative_bonus', value: 5 },
            { type: 'dodge_chance', value: 0.05 },
            { type: 'resist_bonus', subtype: 'surprise', value: 1.0 }
        ],
        cost: 2,
        prerequisites: ['awareness'],
        levelRequired: 5,
        statRequired: { wisdom: 14 },
        icon: '👂'
    },

    // =========================================================================
    //  SURVIVAL TREE - TIER 3
    // =========================================================================

    ghost_walk: {
        id: 'ghost_walk',
        name: 'Ghost Walk',
        tree: 'survival',
        tier: 3,
        description: 'Become nearly invisible. +15% dodge, master stealth options.',
        effects: [
            { type: 'dodge_chance', value: 0.15 },
            { type: 'unlock_choice', subtype: 'stealth_master' }
        ],
        cost: 3,
        prerequisites: ['shadow_walk'],
        levelRequired: 10,
        statRequired: { dexterity: 16 },
        icon: '👻'
    },

    combat_medic: {
        id: 'combat_medic',
        name: 'Combat Medic',
        tree: 'survival',
        tier: 3,
        description: 'Heal under fire. +60% heal effectiveness, cure all debuffs.',
        effects: [
            { type: 'heal_bonus', value: 0.6 },
            { type: 'ability_grant', ability: 'cure_all' }
        ],
        cost: 3,
        prerequisites: ['field_medic'],
        levelRequired: 10,
        statRequired: { wisdom: 16 },
        icon: '⚕️'
    },

    bounty_hunter: {
        id: 'bounty_hunter',
        name: 'Bounty Hunter',
        tree: 'survival',
        tier: 3,
        description: 'Expert at finding targets. +20% damage to tracked, +5 initiative vs tracked.',
        effects: [
            { type: 'damage_bonus', subtype: 'tracked', value: 0.2 },
            { type: 'initiative_bonus', value: 5 }
        ],
        cost: 3,
        prerequisites: ['hunter', 'danger_sense'],
        levelRequired: 10,
        statRequired: { wisdom: 15, dexterity: 14 },
        icon: '🎯'
    },

    master_poisoner: {
        id: 'master_poisoner',
        name: 'Master Poisoner',
        tree: 'survival',
        tier: 3,
        description: 'Lethal toxicologist. +50% poison resist, deadly poison crafting.',
        effects: [
            { type: 'resist_bonus', subtype: 'poison', value: 0.5 },
            { type: 'ability_grant', ability: 'deadly_poison' }
        ],
        cost: 3,
        prerequisites: ['poisoner'],
        levelRequired: 10,
        statRequired: { intelligence: 15 },
        icon: '💀'
    },

    iron_body: {
        id: 'iron_body',
        name: 'Iron Body',
        tree: 'survival',
        tier: 3,
        description: 'Unbreakable physical conditioning. +40 max HP, +30 max stamina, +3 Constitution.',
        effects: [
            { type: 'hp_bonus', value: 40 },
            { type: 'stamina_bonus', value: 30 },
            { type: 'stat_bonus', stat: 'constitution', value: 3 }
        ],
        cost: 3,
        prerequisites: ['survivalist'],
        levelRequired: 10,
        statRequired: { constitution: 16 },
        icon: '💪'
    },

    saboteur: {
        id: 'saboteur',
        name: 'Saboteur',
        tree: 'survival',
        tier: 3,
        description: 'Expert in destruction. +100% trap damage, grants Sabotage ability.',
        effects: [
            { type: 'damage_bonus', subtype: 'trap', value: 1.0 },
            { type: 'ability_grant', ability: 'sabotage' }
        ],
        cost: 3,
        prerequisites: ['trap_master'],
        levelRequired: 10,
        statRequired: { dexterity: 15, tech: 13 },
        icon: '💣'
    },

    wasteland_sage: {
        id: 'wasteland_sage',
        name: 'Wasteland Sage',
        tree: 'survival',
        tier: 3,
        description: 'Know every corner of the wastes. +20% XP, reveal all hidden areas.',
        effects: [
            { type: 'xp_modifier', value: 0.2 },
            { type: 'unlock_choice', subtype: 'all_hidden' }
        ],
        cost: 3,
        prerequisites: ['pathfinder', 'master_scavenger'],
        levelRequired: 10,
        statRequired: { wisdom: 15 },
        icon: '🧙'
    },

    escape_artist: {
        id: 'escape_artist',
        name: 'Escape Artist',
        tree: 'survival',
        tier: 3,
        description: 'No cage can hold you. Master lockpick, grants Escape ability (flee combat).',
        effects: [
            { type: 'unlock_choice', subtype: 'lockpick_master' },
            { type: 'ability_grant', ability: 'escape' }
        ],
        cost: 3,
        prerequisites: ['master_lockpick'],
        levelRequired: 10,
        statRequired: { dexterity: 16 },
        icon: '🏃'
    },

    sixth_sense: {
        id: 'sixth_sense',
        name: 'Sixth Sense',
        tree: 'survival',
        tier: 3,
        description: 'Precognitive awareness. +8 initiative, +10% dodge, sense all dangers.',
        effects: [
            { type: 'initiative_bonus', value: 8 },
            { type: 'dodge_chance', value: 0.1 }
        ],
        cost: 3,
        prerequisites: ['danger_sense'],
        levelRequired: 10,
        statRequired: { wisdom: 16 },
        icon: '🔮'
    },

    rad_resistance: {
        id: 'rad_resistance',
        name: 'Rad Resistance',
        tree: 'survival',
        tier: 3,
        description: 'Body adapted to radiation. +50% radiation resist, +10 max HP.',
        effects: [
            { type: 'resist_bonus', subtype: 'radiation', value: 0.5 },
            { type: 'hp_bonus', value: 10 }
        ],
        cost: 3,
        prerequisites: ['survivalist', 'poison_knowledge'],
        levelRequired: 10,
        statRequired: { constitution: 15 },
        icon: '☢️'
    },

    // =========================================================================
    //  SURVIVAL TREE - TIER 4
    // =========================================================================

    ghost: {
        id: 'ghost',
        name: 'Ghost',
        tree: 'survival',
        tier: 4,
        description: 'You are invisible. +25% dodge, pass through any detection unnoticed.',
        effects: [
            { type: 'dodge_chance', value: 0.25 },
            { type: 'unlock_choice', subtype: 'ghost_mode' }
        ],
        cost: 4,
        prerequisites: ['ghost_walk', 'escape_artist'],
        levelRequired: 15,
        statRequired: { dexterity: 18 },
        icon: '👻'
    },

    survivor_supreme: {
        id: 'survivor_supreme',
        name: 'Survivor Supreme',
        tree: 'survival',
        tier: 4,
        description: 'Cannot be kept down. +60 max HP, +40 max stamina, +5 Constitution.',
        effects: [
            { type: 'hp_bonus', value: 60 },
            { type: 'stamina_bonus', value: 40 },
            { type: 'stat_bonus', stat: 'constitution', value: 5 }
        ],
        cost: 4,
        prerequisites: ['iron_body', 'rad_resistance'],
        levelRequired: 16,
        statRequired: { constitution: 18 },
        icon: '🏆'
    },

    urban_legend: {
        id: 'urban_legend',
        name: 'Urban Legend',
        tree: 'survival',
        tier: 4,
        description: 'Mythical figure of the wastes. +30% XP, +5 Luck, +5 Wisdom.',
        effects: [
            { type: 'xp_modifier', value: 0.3 },
            { type: 'stat_bonus', stat: 'luck', value: 5 },
            { type: 'stat_bonus', stat: 'wisdom', value: 5 }
        ],
        cost: 4,
        prerequisites: ['wasteland_sage', 'bounty_hunter'],
        levelRequired: 15,
        statRequired: { wisdom: 18 },
        icon: '🌟'
    },

    unkillable: {
        id: 'unkillable',
        name: 'Unkillable',
        tree: 'survival',
        tier: 4,
        description: 'Cheat death itself. Auto-revive once per combat at 25% HP. +50 max HP.',
        effects: [
            { type: 'ability_grant', ability: 'auto_revive' },
            { type: 'hp_bonus', value: 50 }
        ],
        cost: 4,
        prerequisites: ['combat_medic', 'sixth_sense'],
        levelRequired: 17,
        statRequired: { constitution: 18, wisdom: 16 },
        icon: '💀'
    },

    // =========================================================================
    //  CRAFTING TREE - TIER 1
    // =========================================================================

    basic_repair: {
        id: 'basic_repair',
        name: 'Basic Repair',
        tree: 'crafting',
        tier: 1,
        description: 'Fix broken equipment. Grants Repair ability (restore item durability).',
        effects: [
            { type: 'ability_grant', ability: 'repair' },
            { type: 'unlock_choice', subtype: 'repair_basic' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🔧'
    },

    weapon_modding: {
        id: 'weapon_modding',
        name: 'Weapon Modding',
        tree: 'crafting',
        tier: 1,
        description: 'Modify weapons with attachments. +5% weapon damage from mods.',
        effects: [
            { type: 'damage_bonus', subtype: 'modded', value: 0.05 },
            { type: 'unlock_choice', subtype: 'weapon_mod' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🔫'
    },

    armor_patching: {
        id: 'armor_patching',
        name: 'Armor Patching',
        tree: 'crafting',
        tier: 1,
        description: 'Repair and reinforce armor. +2 armor from patches.',
        effects: [
            { type: 'defense_bonus', subtype: 'crafted_armor', value: 2 },
            { type: 'unlock_choice', subtype: 'armor_patch' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🧵'
    },

    drug_synthesis: {
        id: 'drug_synthesis',
        name: 'Drug Synthesis',
        tree: 'crafting',
        tier: 1,
        description: 'Brew basic chemicals and drugs. Grants Synthesize ability.',
        effects: [
            { type: 'ability_grant', ability: 'synthesize' },
            { type: 'unlock_choice', subtype: 'drug_craft' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: { intelligence: 11 },
        icon: '⚗️'
    },

    ammo_crafting: {
        id: 'ammo_crafting',
        name: 'Ammo Crafting',
        tree: 'crafting',
        tier: 1,
        description: 'Manufacture ammunition. Craft basic ammo types.',
        effects: [
            { type: 'unlock_choice', subtype: 'ammo_craft' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🔩'
    },

    stack_engineering: {
        id: 'stack_engineering',
        name: 'Stack Engineering',
        tree: 'crafting',
        tier: 1,
        description: 'Basic cortical stack maintenance. Unlock stack repair options.',
        effects: [
            { type: 'unlock_choice', subtype: 'stack_repair' },
            { type: 'stat_bonus', stat: 'tech', value: 1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 2,
        statRequired: { tech: 12 },
        icon: '💾'
    },

    explosive_making: {
        id: 'explosive_making',
        name: 'Explosive Making',
        tree: 'crafting',
        tier: 1,
        description: 'Create basic explosives. Grants Craft Grenade ability.',
        effects: [
            { type: 'ability_grant', ability: 'craft_grenade' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 2,
        statRequired: null,
        icon: '💣'
    },

    tech_salvage: {
        id: 'tech_salvage',
        name: 'Tech Salvage',
        tree: 'crafting',
        tier: 1,
        description: 'Recover useful components from tech. +10% components from salvage.',
        effects: [
            { type: 'price_modifier', subtype: 'salvage', value: 0.1 },
            { type: 'unlock_choice', subtype: 'tech_salvage' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '♻️'
    },

    blueprint_reading: {
        id: 'blueprint_reading',
        name: 'Blueprint Reading',
        tree: 'crafting',
        tier: 1,
        description: 'Understand technical blueprints. Unlock blueprint-gated crafting.',
        effects: [
            { type: 'unlock_choice', subtype: 'blueprint' },
            { type: 'stat_bonus', stat: 'intelligence', value: 1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '📐'
    },

    tool_making: {
        id: 'tool_making',
        name: 'Tool Making',
        tree: 'crafting',
        tier: 1,
        description: 'Craft basic tools. Crafted tools give +5% crafting quality.',
        effects: [
            { type: 'unlock_choice', subtype: 'craft_tools' },
            { type: 'damage_bonus', subtype: 'crafted', value: 0.05 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🛠️'
    },

    jury_rig: {
        id: 'jury_rig',
        name: 'Jury Rig',
        tree: 'crafting',
        tier: 1,
        description: 'Quick-fix anything in a pinch. Grants Jury Rig ability (temporary repair).',
        effects: [
            { type: 'ability_grant', ability: 'jury_rig' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🔨'
    },

    material_knowledge: {
        id: 'material_knowledge',
        name: 'Material Knowledge',
        tree: 'crafting',
        tier: 1,
        description: 'Understand material properties. +10% crafted item quality.',
        effects: [
            { type: 'damage_bonus', subtype: 'crafted', value: 0.1 },
            { type: 'stat_bonus', stat: 'intelligence', value: 1 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🧪'
    },

    // =========================================================================
    //  CRAFTING TREE - TIER 2
    // =========================================================================

    advanced_repair: {
        id: 'advanced_repair',
        name: 'Advanced Repair',
        tree: 'crafting',
        tier: 2,
        description: 'Fix anything. Full item restoration, repair unique items.',
        effects: [
            { type: 'ability_grant', ability: 'advanced_repair' },
            { type: 'unlock_choice', subtype: 'repair_advanced' }
        ],
        cost: 2,
        prerequisites: ['basic_repair'],
        levelRequired: 5,
        statRequired: { tech: 13 },
        icon: '🔧'
    },

    weapon_engineering: {
        id: 'weapon_engineering',
        name: 'Weapon Engineering',
        tree: 'crafting',
        tier: 2,
        description: 'Design custom weapons. +15% weapon damage from mods, craft rare mods.',
        effects: [
            { type: 'damage_bonus', subtype: 'modded', value: 0.15 },
            { type: 'unlock_choice', subtype: 'weapon_engineer' }
        ],
        cost: 2,
        prerequisites: ['weapon_modding'],
        levelRequired: 5,
        statRequired: { tech: 13 },
        icon: '🔫'
    },

    armor_smithing: {
        id: 'armor_smithing',
        name: 'Armor Smithing',
        tree: 'crafting',
        tier: 2,
        description: 'Forge custom armor. +5 armor from crafted pieces.',
        effects: [
            { type: 'defense_bonus', subtype: 'crafted_armor', value: 5 },
            { type: 'unlock_choice', subtype: 'armor_smith' }
        ],
        cost: 2,
        prerequisites: ['armor_patching'],
        levelRequired: 5,
        statRequired: { strength: 13 },
        icon: '🛡️'
    },

    pharmacist: {
        id: 'pharmacist',
        name: 'Pharmacist',
        tree: 'crafting',
        tier: 2,
        description: 'Advanced drug creation. Craft powerful stims and chems.',
        effects: [
            { type: 'heal_bonus', value: 0.2 },
            { type: 'unlock_choice', subtype: 'drug_advanced' }
        ],
        cost: 2,
        prerequisites: ['drug_synthesis'],
        levelRequired: 5,
        statRequired: { intelligence: 14 },
        icon: '⚗️'
    },

    demolitions: {
        id: 'demolitions',
        name: 'Demolitions',
        tree: 'crafting',
        tier: 2,
        description: 'Advanced explosives. +30% explosive damage, craft advanced grenades.',
        effects: [
            { type: 'damage_bonus', subtype: 'explosive', value: 0.3 },
            { type: 'unlock_choice', subtype: 'demo_advanced' }
        ],
        cost: 2,
        prerequisites: ['explosive_making'],
        levelRequired: 6,
        statRequired: { tech: 13 },
        icon: '💣'
    },

    stack_technician: {
        id: 'stack_technician',
        name: 'Stack Technician',
        tree: 'crafting',
        tier: 2,
        description: 'Advanced stack work. Modify and upgrade cortical stacks.',
        effects: [
            { type: 'unlock_choice', subtype: 'stack_upgrade' },
            { type: 'stat_bonus', stat: 'tech', value: 2 }
        ],
        cost: 2,
        prerequisites: ['stack_engineering'],
        levelRequired: 6,
        statRequired: { tech: 14 },
        icon: '💾'
    },

    special_ammo: {
        id: 'special_ammo',
        name: 'Special Ammo',
        tree: 'crafting',
        tier: 2,
        description: 'Craft special ammunition types (incendiary, armor piercing, EMP).',
        effects: [
            { type: 'damage_bonus', subtype: 'special_ammo', value: 0.1 },
            { type: 'unlock_choice', subtype: 'ammo_special' }
        ],
        cost: 2,
        prerequisites: ['ammo_crafting'],
        levelRequired: 5,
        statRequired: null,
        icon: '🔩'
    },

    tech_recycler: {
        id: 'tech_recycler',
        name: 'Tech Recycler',
        tree: 'crafting',
        tier: 2,
        description: 'Maximum component recovery. +25% components, find rare parts.',
        effects: [
            { type: 'price_modifier', subtype: 'salvage', value: 0.25 },
            { type: 'unlock_choice', subtype: 'salvage_advanced' }
        ],
        cost: 2,
        prerequisites: ['tech_salvage'],
        levelRequired: 5,
        statRequired: { tech: 13 },
        icon: '♻️'
    },

    schematic_design: {
        id: 'schematic_design',
        name: 'Schematic Design',
        tree: 'crafting',
        tier: 2,
        description: 'Create your own blueprints. Design custom items.',
        effects: [
            { type: 'unlock_choice', subtype: 'design_schematic' },
            { type: 'stat_bonus', stat: 'intelligence', value: 2 }
        ],
        cost: 2,
        prerequisites: ['blueprint_reading'],
        levelRequired: 5,
        statRequired: { intelligence: 14 },
        icon: '📐'
    },

    precision_tools: {
        id: 'precision_tools',
        name: 'Precision Tools',
        tree: 'crafting',
        tier: 2,
        description: 'Craft fine precision tools. +15% all crafted item quality.',
        effects: [
            { type: 'damage_bonus', subtype: 'crafted', value: 0.15 },
            { type: 'defense_bonus', subtype: 'crafted_armor', value: 2 }
        ],
        cost: 2,
        prerequisites: ['tool_making', 'material_knowledge'],
        levelRequired: 5,
        statRequired: { dexterity: 13 },
        icon: '🛠️'
    },

    // =========================================================================
    //  CRAFTING TREE - TIER 3
    // =========================================================================

    master_weaponsmith: {
        id: 'master_weaponsmith',
        name: 'Master Weaponsmith',
        tree: 'crafting',
        tier: 3,
        description: 'Forge legendary weapons. +25% modded damage, craft unique weapons.',
        effects: [
            { type: 'damage_bonus', subtype: 'modded', value: 0.25 },
            { type: 'unlock_choice', subtype: 'weapon_master_craft' }
        ],
        cost: 3,
        prerequisites: ['weapon_engineering'],
        levelRequired: 10,
        statRequired: { tech: 16 },
        icon: '🔫'
    },

    master_armorsmith: {
        id: 'master_armorsmith',
        name: 'Master Armorsmith',
        tree: 'crafting',
        tier: 3,
        description: 'Create legendary armor. +10 crafted armor bonus, craft unique armor.',
        effects: [
            { type: 'defense_bonus', subtype: 'crafted_armor', value: 10 },
            { type: 'unlock_choice', subtype: 'armor_master_craft' }
        ],
        cost: 3,
        prerequisites: ['armor_smithing'],
        levelRequired: 10,
        statRequired: { strength: 15, tech: 14 },
        icon: '🛡️'
    },

    chemist: {
        id: 'chemist',
        name: 'Chemist',
        tree: 'crafting',
        tier: 3,
        description: 'Master chemist. Craft any drug, +50% drug effectiveness.',
        effects: [
            { type: 'heal_bonus', value: 0.5 },
            { type: 'unlock_choice', subtype: 'drug_master' }
        ],
        cost: 3,
        prerequisites: ['pharmacist'],
        levelRequired: 10,
        statRequired: { intelligence: 16 },
        icon: '⚗️'
    },

    master_demolitions: {
        id: 'master_demolitions',
        name: 'Master Demolitions',
        tree: 'crafting',
        tier: 3,
        description: 'Explosive expert. +60% explosive damage, craft devastating charges.',
        effects: [
            { type: 'damage_bonus', subtype: 'explosive', value: 0.6 },
            { type: 'ability_grant', ability: 'detonate' }
        ],
        cost: 3,
        prerequisites: ['demolitions'],
        levelRequired: 10,
        statRequired: { tech: 15 },
        icon: '💣'
    },

    stack_architect: {
        id: 'stack_architect',
        name: 'Stack Architect',
        tree: 'crafting',
        tier: 3,
        description: 'Build and redesign cortical stacks. Craft custom stacks, +4 Tech.',
        effects: [
            { type: 'stat_bonus', stat: 'tech', value: 4 },
            { type: 'unlock_choice', subtype: 'stack_architect' }
        ],
        cost: 3,
        prerequisites: ['stack_technician'],
        levelRequired: 11,
        statRequired: { tech: 17, intelligence: 15 },
        icon: '💾'
    },

    master_engineer: {
        id: 'master_engineer',
        name: 'Master Engineer',
        tree: 'crafting',
        tier: 3,
        description: 'Build anything from nothing. +30% all crafted quality, repair anything.',
        effects: [
            { type: 'damage_bonus', subtype: 'crafted', value: 0.3 },
            { type: 'defense_bonus', subtype: 'crafted_armor', value: 5 }
        ],
        cost: 3,
        prerequisites: ['advanced_repair', 'precision_tools'],
        levelRequired: 10,
        statRequired: { tech: 16, intelligence: 15 },
        icon: '🏗️'
    },

    invention: {
        id: 'invention',
        name: 'Invention',
        tree: 'crafting',
        tier: 3,
        description: 'Create entirely new device types. Grants Invent ability.',
        effects: [
            { type: 'ability_grant', ability: 'invent' },
            { type: 'stat_bonus', stat: 'intelligence', value: 3 }
        ],
        cost: 3,
        prerequisites: ['schematic_design'],
        levelRequired: 10,
        statRequired: { intelligence: 16, tech: 15 },
        icon: '💡'
    },

    munitions_expert: {
        id: 'munitions_expert',
        name: 'Munitions Expert',
        tree: 'crafting',
        tier: 3,
        description: 'Master of all ammunition. +20% special ammo damage, craft exotic rounds.',
        effects: [
            { type: 'damage_bonus', subtype: 'special_ammo', value: 0.2 },
            { type: 'unlock_choice', subtype: 'ammo_exotic' }
        ],
        cost: 3,
        prerequisites: ['special_ammo'],
        levelRequired: 10,
        statRequired: { tech: 15 },
        icon: '🔩'
    },

    recycling_master: {
        id: 'recycling_master',
        name: 'Recycling Master',
        tree: 'crafting',
        tier: 3,
        description: 'Extract maximum value. +50% salvage, find legendary components.',
        effects: [
            { type: 'price_modifier', subtype: 'salvage', value: 0.5 },
            { type: 'unlock_choice', subtype: 'salvage_master' }
        ],
        cost: 3,
        prerequisites: ['tech_recycler'],
        levelRequired: 10,
        statRequired: { tech: 15 },
        icon: '♻️'
    },

    augmentation: {
        id: 'augmentation',
        name: 'Augmentation',
        tree: 'crafting',
        tier: 3,
        description: 'Install and modify cybernetic augmentations. +3 to Tech and Intelligence.',
        effects: [
            { type: 'stat_bonus', stat: 'tech', value: 3 },
            { type: 'stat_bonus', stat: 'intelligence', value: 3 },
            { type: 'unlock_choice', subtype: 'augment' }
        ],
        cost: 3,
        prerequisites: ['precision_tools', 'stack_technician'],
        levelRequired: 10,
        statRequired: { tech: 16 },
        icon: '🦾'
    },

    // =========================================================================
    //  CRAFTING TREE - TIER 4
    // =========================================================================

    master_artificer: {
        id: 'master_artificer',
        name: 'Master Artificer',
        tree: 'crafting',
        tier: 4,
        description: 'Create items of legend. +40% all crafted quality, unique item creation.',
        effects: [
            { type: 'damage_bonus', subtype: 'crafted', value: 0.4 },
            { type: 'defense_bonus', subtype: 'crafted_armor', value: 15 },
            { type: 'unlock_choice', subtype: 'legendary_craft' }
        ],
        cost: 4,
        prerequisites: ['master_weaponsmith', 'master_armorsmith'],
        levelRequired: 15,
        statRequired: { tech: 18, intelligence: 16 },
        icon: '🏆'
    },

    stack_god: {
        id: 'stack_god',
        name: 'Stack God',
        tree: 'crafting',
        tier: 4,
        description: 'Absolute mastery over cortical stacks. +5 Tech, +5 Intelligence, create stacks from scratch.',
        effects: [
            { type: 'stat_bonus', stat: 'tech', value: 5 },
            { type: 'stat_bonus', stat: 'intelligence', value: 5 },
            { type: 'unlock_choice', subtype: 'stack_god' }
        ],
        cost: 4,
        prerequisites: ['stack_architect', 'augmentation'],
        levelRequired: 16,
        statRequired: { tech: 20, intelligence: 18 },
        icon: '💾'
    },

    arms_dealer: {
        id: 'arms_dealer',
        name: 'Arms Dealer',
        tree: 'crafting',
        tier: 4,
        description: 'Mass-produce weapons. +50% weapon crafting, sell weapons at 50% premium.',
        effects: [
            { type: 'damage_bonus', subtype: 'crafted', value: 0.5 },
            { type: 'price_modifier', subtype: 'sell_weapons', value: 0.5 }
        ],
        cost: 4,
        prerequisites: ['master_weaponsmith', 'munitions_expert'],
        levelRequired: 15,
        statRequired: { tech: 18 },
        icon: '🔫'
    },

    creator: {
        id: 'creator',
        name: 'Creator',
        tree: 'crafting',
        tier: 4,
        description: 'Build anything imaginable. +5 Tech, +5 Int, unlock all crafting recipes.',
        effects: [
            { type: 'stat_bonus', stat: 'tech', value: 5 },
            { type: 'stat_bonus', stat: 'intelligence', value: 5 },
            { type: 'unlock_choice', subtype: 'craft_anything' }
        ],
        cost: 4,
        prerequisites: ['master_engineer', 'invention'],
        levelRequired: 17,
        statRequired: { tech: 20, intelligence: 18 },
        icon: '🌟'
    },

    // =========================================================================
    //  ADDITIONAL COMBAT SKILLS
    // =========================================================================

    vital_strike: {
        id: 'vital_strike',
        name: 'Vital Strike',
        tree: 'combat',
        tier: 2,
        description: 'Target vital organs. +10% crit damage multiplier.',
        effects: [
            { type: 'damage_bonus', subtype: 'crit_mult', value: 0.1 }
        ],
        cost: 2,
        prerequisites: ['blade_mastery_1'],
        levelRequired: 4,
        statRequired: { dexterity: 13 },
        icon: '🫀'
    },

    bulwark: {
        id: 'bulwark',
        name: 'Bulwark',
        tree: 'combat',
        tier: 2,
        description: 'Immovable in defense. +6 armor, +10 max HP.',
        effects: [
            { type: 'defense_bonus', subtype: 'armor', value: 6 },
            { type: 'hp_bonus', value: 10 }
        ],
        cost: 2,
        prerequisites: ['shield_training', 'toughness'],
        levelRequired: 5,
        statRequired: { constitution: 14 },
        icon: '🏛️'
    },

    feint: {
        id: 'feint',
        name: 'Feint',
        tree: 'combat',
        tier: 1,
        description: 'Deceptive combat technique. +3% crit, +2% dodge.',
        effects: [
            { type: 'crit_chance', value: 0.03 },
            { type: 'dodge_chance', value: 0.02 }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 2,
        statRequired: { dexterity: 11 },
        icon: '🤺'
    },

    combat_roll: {
        id: 'combat_roll',
        name: 'Combat Roll',
        tree: 'combat',
        tier: 2,
        description: 'Evasive tumble. Grants Combat Roll ability (dodge + reposition).',
        effects: [
            { type: 'ability_grant', ability: 'combat_roll' },
            { type: 'dodge_chance', value: 0.03 }
        ],
        cost: 2,
        prerequisites: ['light_armor_prof'],
        levelRequired: 5,
        statRequired: { dexterity: 14 },
        icon: '🔄'
    },

    // =========================================================================
    //  ADDITIONAL TECH SKILLS
    // =========================================================================

    biometric_scan: {
        id: 'biometric_scan',
        name: 'Biometric Scan',
        tree: 'tech',
        tier: 1,
        description: 'Scan biometrics for weaknesses. +1 Wisdom, reveal enemy HP.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 1 },
            { type: 'unlock_choice', subtype: 'bio_scan' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '📊'
    },

    decryption: {
        id: 'decryption',
        name: 'Decryption',
        tree: 'tech',
        tier: 2,
        description: 'Break encryption on data. Unlocks encrypted terminal options.',
        effects: [
            { type: 'unlock_choice', subtype: 'decrypt' },
            { type: 'stat_bonus', stat: 'intelligence', value: 1 }
        ],
        cost: 2,
        prerequisites: ['basic_hacking'],
        levelRequired: 4,
        statRequired: { tech: 13 },
        icon: '🔑'
    },

    remote_access: {
        id: 'remote_access',
        name: 'Remote Access',
        tree: 'tech',
        tier: 2,
        description: 'Hack systems from a distance. +5% tech damage, unlock remote options.',
        effects: [
            { type: 'damage_bonus', subtype: 'tech', value: 0.05 },
            { type: 'unlock_choice', subtype: 'remote_hack' }
        ],
        cost: 2,
        prerequisites: ['network_scan'],
        levelRequired: 5,
        statRequired: { tech: 13 },
        icon: '📶'
    },

    hardware_exploit: {
        id: 'hardware_exploit',
        name: 'Hardware Exploit',
        tree: 'tech',
        tier: 3,
        description: 'Exploit hardware vulnerabilities. +20% damage to mechanical enemies.',
        effects: [
            { type: 'damage_bonus', subtype: 'mechanical', value: 0.2 }
        ],
        cost: 3,
        prerequisites: ['system_exploit', 'circuit_analysis'],
        levelRequired: 10,
        statRequired: { tech: 16 },
        icon: '🔩'
    },

    // =========================================================================
    //  ADDITIONAL SOCIAL SKILLS
    // =========================================================================

    fast_talk: {
        id: 'fast_talk',
        name: 'Fast Talk',
        tree: 'social',
        tier: 1,
        description: 'Talk your way out of trouble. Unlocks fast-talk options.',
        effects: [
            { type: 'unlock_choice', subtype: 'fast_talk' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '💬'
    },

    bribery: {
        id: 'bribery',
        name: 'Bribery',
        tree: 'social',
        tier: 2,
        description: 'Know who to grease. Unlocks bribery options, -10% bribe costs.',
        effects: [
            { type: 'price_modifier', subtype: 'bribe', value: -0.1 },
            { type: 'unlock_choice', subtype: 'bribe' }
        ],
        cost: 2,
        prerequisites: ['bartering'],
        levelRequired: 4,
        statRequired: { charisma: 12 },
        icon: '💵'
    },

    body_language: {
        id: 'body_language',
        name: 'Body Language',
        tree: 'social',
        tier: 2,
        description: 'Read and project body language. +2 Wisdom, +1 Charisma.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 2 },
            { type: 'stat_bonus', stat: 'charisma', value: 1 }
        ],
        cost: 2,
        prerequisites: ['empathy'],
        levelRequired: 4,
        statRequired: null,
        icon: '🧍'
    },

    propaganda: {
        id: 'propaganda',
        name: 'Propaganda',
        tree: 'social',
        tier: 3,
        description: 'Spread your message. +15% faction rep gains, grants Broadcast ability.',
        effects: [
            { type: 'ability_grant', ability: 'broadcast' },
            { type: 'stat_bonus', stat: 'charisma', value: 2 }
        ],
        cost: 3,
        prerequisites: ['orator'],
        levelRequired: 10,
        statRequired: { charisma: 16 },
        icon: '📺'
    },

    // =========================================================================
    //  ADDITIONAL SURVIVAL SKILLS
    // =========================================================================

    foraging: {
        id: 'foraging',
        name: 'Foraging',
        tree: 'survival',
        tier: 1,
        description: 'Find edible resources. Unlock foraging options, +5% heal from food.',
        effects: [
            { type: 'heal_bonus', value: 0.05 },
            { type: 'unlock_choice', subtype: 'forage' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🌿'
    },

    camouflage: {
        id: 'camouflage',
        name: 'Camouflage',
        tree: 'survival',
        tier: 2,
        description: 'Blend with surroundings. +5% dodge, advanced stealth in wilderness.',
        effects: [
            { type: 'dodge_chance', value: 0.05 },
            { type: 'unlock_choice', subtype: 'camouflage' }
        ],
        cost: 2,
        prerequisites: ['stealth'],
        levelRequired: 5,
        statRequired: { dexterity: 13 },
        icon: '🪖'
    },

    wound_cauterize: {
        id: 'wound_cauterize',
        name: 'Wound Cauterize',
        tree: 'survival',
        tier: 2,
        description: 'Burn wounds shut. Grants Cauterize ability (stop bleeding, costs HP).',
        effects: [
            { type: 'ability_grant', ability: 'cauterize' }
        ],
        cost: 2,
        prerequisites: ['first_aid'],
        levelRequired: 5,
        statRequired: { constitution: 13 },
        icon: '🔥'
    },

    scavenger_instinct: {
        id: 'scavenger_instinct',
        name: 'Scavenger Instinct',
        tree: 'survival',
        tier: 3,
        description: 'Sense valuable loot. +40% loot, auto-detect containers.',
        effects: [
            { type: 'price_modifier', subtype: 'loot', value: 0.4 },
            { type: 'unlock_choice', subtype: 'detect_containers' }
        ],
        cost: 3,
        prerequisites: ['master_scavenger'],
        levelRequired: 10,
        statRequired: { luck: 15, wisdom: 14 },
        icon: '💎'
    },

    // =========================================================================
    //  ADDITIONAL CRAFTING SKILLS
    // =========================================================================

    disassemble: {
        id: 'disassemble',
        name: 'Disassemble',
        tree: 'crafting',
        tier: 1,
        description: 'Break items into components. Grants Disassemble ability.',
        effects: [
            { type: 'ability_grant', ability: 'disassemble' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🔨'
    },

    improvised_weapons: {
        id: 'improvised_weapons',
        name: 'Improvised Weapons',
        tree: 'crafting',
        tier: 1,
        description: 'Craft weapons from junk. +10% improvised weapon damage.',
        effects: [
            { type: 'damage_bonus', subtype: 'improvised', value: 0.1 },
            { type: 'unlock_choice', subtype: 'improvise_weapon' }
        ],
        cost: 1,
        prerequisites: [],
        levelRequired: 1,
        statRequired: null,
        icon: '🪛'
    },

    field_modification: {
        id: 'field_modification',
        name: 'Field Modification',
        tree: 'crafting',
        tier: 2,
        description: 'Modify gear in the field without a workbench. +8% mod quality.',
        effects: [
            { type: 'damage_bonus', subtype: 'modded', value: 0.08 },
            { type: 'unlock_choice', subtype: 'field_mod' }
        ],
        cost: 2,
        prerequisites: ['weapon_modding', 'jury_rig'],
        levelRequired: 5,
        statRequired: { tech: 13 },
        icon: '🔧'
    },

    nano_fabrication: {
        id: 'nano_fabrication',
        name: 'Nano Fabrication',
        tree: 'crafting',
        tier: 3,
        description: 'Use nanobots for precision crafting. +20% crafted quality, +2 Tech.',
        effects: [
            { type: 'damage_bonus', subtype: 'crafted', value: 0.2 },
            { type: 'stat_bonus', stat: 'tech', value: 2 }
        ],
        cost: 3,
        prerequisites: ['precision_tools', 'schematic_design'],
        levelRequired: 10,
        statRequired: { tech: 16, intelligence: 15 },
        icon: '🔬'
    }
};

// =========================================================================
//  Helper methods
// =========================================================================

window.Latency.SkillsData.getSkill = function(id) { return window.Latency.SkillsData[id] || null; };

window.Latency.SkillsData.getByTree = function(tree) {
    var result = [];
    var data = window.Latency.SkillsData;
    for (var key in data) {
        if (data.hasOwnProperty(key) && typeof data[key] === 'object' && data[key].tree === tree) {
            result.push(data[key]);
        }
    }
    return result;
};

window.Latency.SkillsData.getByTier = function(tier) {
    var result = [];
    var data = window.Latency.SkillsData;
    for (var key in data) {
        if (data.hasOwnProperty(key) && typeof data[key] === 'object' && data[key].tier === tier) {
            result.push(data[key]);
        }
    }
    return result;
};

window.Latency.SkillsData.getAll = function() {
    var result = [];
    var data = window.Latency.SkillsData;
    for (var key in data) {
        if (data.hasOwnProperty(key) && typeof data[key] === 'object' && data[key].id) {
            result.push(data[key]);
        }
    }
    return result;
};

window.Latency.SkillsData.count = function() {
    return window.Latency.SkillsData.getAll().length;
};
