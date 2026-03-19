/**
 * LATENCY - Traits Data
 * Passive abilities/perks that modify gameplay mechanics.
 * Each trait has real mechanical effects applied through the effect system.
 */

window.Latency = window.Latency || {};

window.Latency.Traits = {

    // =========================================================================
    //  GENERAL TRAITS
    // =========================================================================

    adaptable: {
        id: 'adaptable',
        name: 'Adaptable',
        category: 'general',
        description: 'Quick learner who thrives in any situation. +10% XP from all sources.',
        effects: [
            { type: 'xp_modifier', value: 0.1 }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: null
    },

    lucky: {
        id: 'lucky',
        name: 'Lucky',
        category: 'general',
        description: 'Fortune favors you. +3% crit chance and +5% dodge chance.',
        effects: [
            { type: 'crit_chance', value: 0.03 },
            { type: 'dodge_chance', value: 0.05 }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: null
    },

    iron_will: {
        id: 'iron_will',
        name: 'Iron Will',
        category: 'general',
        description: 'Unbreakable mental fortitude. +2 Willpower, 10% resist to tech damage.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 2 },
            { type: 'damage_resist', damageType: 'tech', value: 0.1 }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: null
    },

    quick_learner: {
        id: 'quick_learner',
        name: 'Quick Learner',
        category: 'general',
        description: 'Absorb knowledge at an accelerated rate. +20% XP from all sources.',
        effects: [
            { type: 'xp_modifier', value: 0.2 }
        ],
        prerequisites: { level: 3 },
        exclusive: ['adaptable'],
        raceRestriction: null
    },

    survivor: {
        id: 'survivor',
        name: 'Survivor',
        category: 'general',
        description: 'You\'ve lived through the worst the wasteland offers. +15 HP, +5% healing received.',
        effects: [
            { type: 'hp_bonus', value: 15 },
            { type: 'heal_bonus', value: 0.05 }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: null
    },

    ambitious: {
        id: 'ambitious',
        name: 'Ambitious',
        category: 'general',
        description: 'Relentless drive to be the best. +15% XP, +10% faction reputation gains.',
        effects: [
            { type: 'xp_modifier', value: 0.15 },
            { type: 'faction_rep_modifier', faction: 'all', value: 0.1 }
        ],
        prerequisites: { level: 5 },
        exclusive: null,
        raceRestriction: null
    },

    paranoid: {
        id: 'paranoid',
        name: 'Paranoid',
        category: 'general',
        description: 'Trust no one, suspect everything. Detect traps and hidden dangers. +2 Perception.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 2 },
            { type: 'unlock_choice', flag: 'trait_paranoid' }
        ],
        prerequisites: null,
        exclusive: ['charming'],
        raceRestriction: null
    },

    charming: {
        id: 'charming',
        name: 'Charming',
        category: 'general',
        description: 'Magnetic personality that draws people in. +2 Charisma, 10% cheaper prices.',
        effects: [
            { type: 'stat_bonus', stat: 'charisma', value: 2 },
            { type: 'price_modifier', value: -0.1 }
        ],
        prerequisites: null,
        exclusive: ['paranoid'],
        raceRestriction: null
    },

    tough: {
        id: 'tough',
        name: 'Tough',
        category: 'general',
        description: 'Built to take punishment. +20 HP and 5% physical damage resistance.',
        effects: [
            { type: 'hp_bonus', value: 20 },
            { type: 'damage_resist', damageType: 'physical', value: 0.05 }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: null
    },

    resourceful: {
        id: 'resourceful',
        name: 'Resourceful',
        category: 'general',
        description: 'Make the most of every situation. +5% XP, 5% cheaper prices, +5 stamina.',
        effects: [
            { type: 'xp_modifier', value: 0.05 },
            { type: 'price_modifier', value: -0.05 },
            { type: 'stamina_bonus', value: 5 }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: null
    },

    // =========================================================================
    //  COMBAT TRAITS
    // =========================================================================

    berserker: {
        id: 'berserker',
        name: 'Berserker',
        category: 'combat',
        description: 'Unleash primal fury in battle. +20% melee damage, -10% dodge chance.',
        effects: [
            { type: 'damage_bonus', weaponType: 'melee', value: 0.2 },
            { type: 'dodge_chance', value: -0.1 }
        ],
        prerequisites: { stat: { strength: 12 } },
        exclusive: ['sharpshooter'],
        raceRestriction: null
    },

    sharpshooter: {
        id: 'sharpshooter',
        name: 'Sharpshooter',
        category: 'combat',
        description: 'Deadly accuracy at any range. +15% ranged damage, +5% crit chance with ranged.',
        effects: [
            { type: 'damage_bonus', weaponType: 'ranged', value: 0.15 },
            { type: 'crit_chance', value: 0.05 }
        ],
        prerequisites: { stat: { wisdom: 12 } },
        exclusive: ['berserker'],
        raceRestriction: null
    },

    dual_wielder: {
        id: 'dual_wielder',
        name: 'Dual Wielder',
        category: 'combat',
        description: 'Fight with a weapon in each hand. +10% melee damage, +2 initiative.',
        effects: [
            { type: 'damage_bonus', weaponType: 'melee', value: 0.1 },
            { type: 'initiative_bonus', value: 2 }
        ],
        prerequisites: { stat: { dexterity: 10 } },
        exclusive: ['tank'],
        raceRestriction: null
    },

    tank: {
        id: 'tank',
        name: 'Tank',
        category: 'combat',
        description: 'Immovable object. +30 HP, 10% physical damage resistance, -2 initiative.',
        effects: [
            { type: 'hp_bonus', value: 30 },
            { type: 'damage_resist', damageType: 'physical', value: 0.1 },
            { type: 'initiative_bonus', value: -2 }
        ],
        prerequisites: { stat: { strength: 14 } },
        exclusive: ['dual_wielder', 'assassins_instinct'],
        raceRestriction: null
    },

    assassins_instinct: {
        id: 'assassins_instinct',
        name: 'Assassin\'s Instinct',
        category: 'combat',
        description: 'Strike from the shadows with lethal precision. +8% crit chance, +4 initiative.',
        effects: [
            { type: 'crit_chance', value: 0.08 },
            { type: 'initiative_bonus', value: 4 }
        ],
        prerequisites: { stat: { dexterity: 13 } },
        exclusive: ['tank'],
        raceRestriction: null
    },

    heavy_hitter: {
        id: 'heavy_hitter',
        name: 'Heavy Hitter',
        category: 'combat',
        description: 'Every blow lands with devastating force. +15% melee damage, +2 Strength.',
        effects: [
            { type: 'damage_bonus', weaponType: 'melee', value: 0.15 },
            { type: 'stat_bonus', stat: 'strength', value: 2 }
        ],
        prerequisites: { stat: { strength: 11 } },
        exclusive: null,
        raceRestriction: null
    },

    quick_reflexes: {
        id: 'quick_reflexes',
        name: 'Quick Reflexes',
        category: 'combat',
        description: 'React before others can think. +5 initiative, +5% dodge chance.',
        effects: [
            { type: 'initiative_bonus', value: 5 },
            { type: 'dodge_chance', value: 0.05 }
        ],
        prerequisites: { stat: { dexterity: 11 } },
        exclusive: null,
        raceRestriction: null
    },

    battle_hardened: {
        id: 'battle_hardened',
        name: 'Battle Hardened',
        category: 'combat',
        description: 'Scarred by countless fights. +10 HP, 5% resist all damage types.',
        effects: [
            { type: 'hp_bonus', value: 10 },
            { type: 'damage_resist', damageType: 'physical', value: 0.05 },
            { type: 'damage_resist', damageType: 'tech', value: 0.05 },
            { type: 'damage_resist', damageType: 'energy', value: 0.05 }
        ],
        prerequisites: { level: 8 },
        exclusive: null,
        raceRestriction: null
    },

    last_stand: {
        id: 'last_stand',
        name: 'Last Stand',
        category: 'combat',
        description: 'Most dangerous when cornered. +25% damage and 15% resist when below 25% HP.',
        effects: [
            { type: 'damage_bonus', weaponType: 'all', value: 0.25, condition: 'low_hp' },
            { type: 'damage_resist', damageType: 'physical', value: 0.15, condition: 'low_hp' }
        ],
        prerequisites: { level: 6, stat: { wisdom: 12 } },
        exclusive: null,
        raceRestriction: null
    },

    relentless: {
        id: 'relentless',
        name: 'Relentless',
        category: 'combat',
        description: 'Never stop pushing forward. +10 stamina, +3% crit chance, +10% heal bonus.',
        effects: [
            { type: 'stamina_bonus', value: 10 },
            { type: 'crit_chance', value: 0.03 },
            { type: 'heal_bonus', value: 0.1 }
        ],
        prerequisites: { level: 4 },
        exclusive: null,
        raceRestriction: null
    },

    // =========================================================================
    //  TECH TRAITS
    // =========================================================================

    hackers_mind: {
        id: 'hackers_mind',
        name: 'Hacker\'s Mind',
        category: 'tech',
        description: 'See the digital world like no one else. +3 Intelligence, unlocks hacking dialogue.',
        effects: [
            { type: 'stat_bonus', stat: 'intelligence', value: 3 },
            { type: 'unlock_choice', flag: 'trait_hacker' }
        ],
        prerequisites: { stat: { intelligence: 13 } },
        exclusive: null,
        raceRestriction: null
    },

    circuit_breaker: {
        id: 'circuit_breaker',
        name: 'Circuit Breaker',
        category: 'tech',
        description: 'Disable tech with surgical precision. +20% damage to tech enemies, +15% tech damage.',
        effects: [
            { type: 'damage_bonus', weaponType: 'tech', value: 0.2 },
            { type: 'damage_resist', damageType: 'tech', value: 0.15 }
        ],
        prerequisites: { stat: { intelligence: 11 } },
        exclusive: null,
        raceRestriction: null
    },

    drone_master: {
        id: 'drone_master',
        name: 'Drone Master',
        category: 'tech',
        description: 'Expert drone operator. +2 Perception, unlocks drone combat options.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 2 },
            { type: 'unlock_choice', flag: 'trait_drone_master' }
        ],
        prerequisites: { stat: { intelligence: 10 } },
        exclusive: null,
        raceRestriction: ['human', 'cyborg']
    },

    stack_whisperer: {
        id: 'stack_whisperer',
        name: 'Stack Whisperer',
        category: 'tech',
        description: 'Manipulate neural stacks with ease. +2 Intelligence, unlocks stack-related choices.',
        effects: [
            { type: 'stat_bonus', stat: 'intelligence', value: 2 },
            { type: 'unlock_choice', flag: 'trait_stack_whisperer' }
        ],
        prerequisites: { level: 5, stat: { intelligence: 14 } },
        exclusive: null,
        raceRestriction: null
    },

    emp_resistant: {
        id: 'emp_resistant',
        name: 'EMP Resistant',
        category: 'tech',
        description: 'Hardened against electromagnetic pulses. 20% tech damage resistance, +10 HP.',
        effects: [
            { type: 'damage_resist', damageType: 'tech', value: 0.2 },
            { type: 'hp_bonus', value: 10 }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: ['cyborg', 'synth']
    },

    neural_link: {
        id: 'neural_link',
        name: 'Neural Link',
        category: 'tech',
        description: 'Direct brain-machine interface. +2 Intelligence, +3 initiative, unlocks neural options.',
        effects: [
            { type: 'stat_bonus', stat: 'intelligence', value: 2 },
            { type: 'initiative_bonus', value: 3 },
            { type: 'unlock_choice', flag: 'trait_neural_link' }
        ],
        prerequisites: { level: 7, stat: { intelligence: 12 } },
        exclusive: null,
        raceRestriction: ['human', 'cyborg']
    },

    code_runner: {
        id: 'code_runner',
        name: 'Code Runner',
        category: 'tech',
        description: 'Execute programs on the fly in combat. +15% tech weapon damage, +2 initiative.',
        effects: [
            { type: 'damage_bonus', weaponType: 'tech', value: 0.15 },
            { type: 'initiative_bonus', value: 2 }
        ],
        prerequisites: { stat: { intelligence: 11 } },
        exclusive: null,
        raceRestriction: null
    },

    system_admin: {
        id: 'system_admin',
        name: 'System Admin',
        category: 'tech',
        description: 'Root access to everything. 15% cheaper prices at tech vendors, unlocks admin choices.',
        effects: [
            { type: 'price_modifier', value: -0.15 },
            { type: 'unlock_choice', flag: 'trait_sysadmin' }
        ],
        prerequisites: { stat: { intelligence: 13 } },
        exclusive: null,
        raceRestriction: null
    },

    overclocker: {
        id: 'overclocker',
        name: 'Overclocker',
        category: 'tech',
        description: 'Push hardware beyond its limits. +4 initiative, +5% crit chance, -5 HP.',
        effects: [
            { type: 'initiative_bonus', value: 4 },
            { type: 'crit_chance', value: 0.05 },
            { type: 'hp_bonus', value: -5 }
        ],
        prerequisites: { stat: { intelligence: 12 } },
        exclusive: ['firewall'],
        raceRestriction: ['cyborg', 'synth']
    },

    firewall: {
        id: 'firewall',
        name: 'Firewall',
        category: 'tech',
        description: 'Impenetrable digital defense. 15% tech damage resist, 5% energy resist, +10 HP.',
        effects: [
            { type: 'damage_resist', damageType: 'tech', value: 0.15 },
            { type: 'damage_resist', damageType: 'energy', value: 0.05 },
            { type: 'hp_bonus', value: 10 }
        ],
        prerequisites: { stat: { intelligence: 11 } },
        exclusive: ['overclocker'],
        raceRestriction: null
    },

    // =========================================================================
    //  SOCIAL TRAITS
    // =========================================================================

    silver_tongue: {
        id: 'silver_tongue',
        name: 'Silver Tongue',
        category: 'social',
        description: 'Talk your way out of anything. +3 Charisma, unlocks persuasion dialogue options.',
        effects: [
            { type: 'stat_bonus', stat: 'charisma', value: 3 },
            { type: 'unlock_choice', flag: 'trait_silver_tongue' }
        ],
        prerequisites: { stat: { charisma: 13 } },
        exclusive: ['intimidator'],
        raceRestriction: null
    },

    intimidator: {
        id: 'intimidator',
        name: 'Intimidator',
        category: 'social',
        description: 'Your presence alone makes others comply. +2 Strength, unlocks intimidation dialogue.',
        effects: [
            { type: 'stat_bonus', stat: 'strength', value: 2 },
            { type: 'unlock_choice', flag: 'trait_intimidator' }
        ],
        prerequisites: { stat: { strength: 12 } },
        exclusive: ['silver_tongue'],
        raceRestriction: null
    },

    street_cred: {
        id: 'street_cred',
        name: 'Street Cred',
        category: 'social',
        description: 'Known and respected in the underworld. +15% faction rep with criminal factions, 10% cheaper black market.',
        effects: [
            { type: 'faction_rep_modifier', faction: 'criminal', value: 0.15 },
            { type: 'price_modifier', value: -0.1 }
        ],
        prerequisites: { level: 3 },
        exclusive: null,
        raceRestriction: null
    },

    faction_diplomat: {
        id: 'faction_diplomat',
        name: 'Faction Diplomat',
        category: 'social',
        description: 'Bridge divides between warring groups. +20% reputation gains with all factions.',
        effects: [
            { type: 'faction_rep_modifier', faction: 'all', value: 0.2 }
        ],
        prerequisites: { stat: { charisma: 14 } },
        exclusive: ['gang_leader'],
        raceRestriction: null
    },

    black_market_contact: {
        id: 'black_market_contact',
        name: 'Black Market Contact',
        category: 'social',
        description: 'Know a guy who knows a guy. 20% cheaper prices, unlocks black market inventory.',
        effects: [
            { type: 'price_modifier', value: -0.2 },
            { type: 'unlock_choice', flag: 'trait_black_market' }
        ],
        prerequisites: { level: 4 },
        exclusive: null,
        raceRestriction: null
    },

    information_broker: {
        id: 'information_broker',
        name: 'Information Broker',
        category: 'social',
        description: 'Trade in secrets and intel. +2 Intelligence, +2 Perception, unlocks intel options.',
        effects: [
            { type: 'stat_bonus', stat: 'intelligence', value: 2 },
            { type: 'stat_bonus', stat: 'wisdom', value: 2 },
            { type: 'unlock_choice', flag: 'trait_info_broker' }
        ],
        prerequisites: { level: 6, stat: { intelligence: 12 } },
        exclusive: null,
        raceRestriction: null
    },

    gang_leader: {
        id: 'gang_leader',
        name: 'Gang Leader',
        category: 'social',
        description: 'Command respect through force. +2 Strength, +2 Charisma, +10% faction rep with gangs.',
        effects: [
            { type: 'stat_bonus', stat: 'strength', value: 2 },
            { type: 'stat_bonus', stat: 'charisma', value: 2 },
            { type: 'faction_rep_modifier', faction: 'gang', value: 0.1 }
        ],
        prerequisites: { level: 5, stat: { charisma: 11, strength: 11 } },
        exclusive: ['faction_diplomat'],
        raceRestriction: null
    },

    smooth_talker: {
        id: 'smooth_talker',
        name: 'Smooth Talker',
        category: 'social',
        description: 'Always say the right thing. +2 Charisma, 5% cheaper prices.',
        effects: [
            { type: 'stat_bonus', stat: 'charisma', value: 2 },
            { type: 'price_modifier', value: -0.05 }
        ],
        prerequisites: { stat: { charisma: 10 } },
        exclusive: null,
        raceRestriction: null
    },

    empath: {
        id: 'empath',
        name: 'Empath',
        category: 'social',
        description: 'Read emotions and intentions. +2 Perception, +1 Charisma, unlocks empathy dialogue.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 2 },
            { type: 'stat_bonus', stat: 'charisma', value: 1 },
            { type: 'unlock_choice', flag: 'trait_empath' }
        ],
        prerequisites: { stat: { wisdom: 12 } },
        exclusive: ['deception_master'],
        raceRestriction: ['human']
    },

    deception_master: {
        id: 'deception_master',
        name: 'Deception Master',
        category: 'social',
        description: 'Lies come naturally. +2 Charisma, +2 Intelligence, unlocks deception dialogue.',
        effects: [
            { type: 'stat_bonus', stat: 'charisma', value: 2 },
            { type: 'stat_bonus', stat: 'intelligence', value: 2 },
            { type: 'unlock_choice', flag: 'trait_deception' }
        ],
        prerequisites: { stat: { charisma: 12, intelligence: 11 } },
        exclusive: ['empath'],
        raceRestriction: null
    },

    // =========================================================================
    //  SURVIVAL TRAITS
    // =========================================================================

    scavenger: {
        id: 'scavenger',
        name: 'Scavenger',
        category: 'survival',
        description: 'Find useful items where others see junk. +2 Perception, unlocks scavenging options.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 2 },
            { type: 'unlock_choice', flag: 'trait_scavenger' }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: null
    },

    first_aid_expert: {
        id: 'first_aid_expert',
        name: 'First Aid Expert',
        category: 'survival',
        description: 'Expert at patching wounds in the field. +25% healing received and given.',
        effects: [
            { type: 'heal_bonus', value: 0.25 }
        ],
        prerequisites: { stat: { intelligence: 10 } },
        exclusive: null,
        raceRestriction: null
    },

    stealth_master: {
        id: 'stealth_master',
        name: 'Stealth Master',
        category: 'survival',
        description: 'Move unseen through any environment. +3 Agility, +5% dodge chance, unlocks stealth routes.',
        effects: [
            { type: 'stat_bonus', stat: 'dexterity', value: 3 },
            { type: 'dodge_chance', value: 0.05 },
            { type: 'unlock_choice', flag: 'trait_stealth' }
        ],
        prerequisites: { stat: { dexterity: 13 } },
        exclusive: null,
        raceRestriction: null
    },

    lockpicker: {
        id: 'lockpicker',
        name: 'Lockpicker',
        category: 'survival',
        description: 'No lock can keep you out. +2 Agility, unlocks locked doors and containers.',
        effects: [
            { type: 'stat_bonus', stat: 'dexterity', value: 2 },
            { type: 'unlock_choice', flag: 'trait_lockpicker' }
        ],
        prerequisites: { stat: { dexterity: 10 } },
        exclusive: null,
        raceRestriction: null
    },

    poison_resistant: {
        id: 'poison_resistant',
        name: 'Poison Resistant',
        category: 'survival',
        description: 'Toxins barely affect you. 20% chemical damage resistance, +10 HP.',
        effects: [
            { type: 'damage_resist', damageType: 'chemical', value: 0.2 },
            { type: 'hp_bonus', value: 10 }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: ['human', 'shadowkin']
    },

    night_vision: {
        id: 'night_vision',
        name: 'Night Vision',
        category: 'survival',
        description: 'See clearly in the dark. +3 Perception, unlocks night-time options.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 3 },
            { type: 'unlock_choice', flag: 'trait_night_vision' }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: ['cyborg', 'synth', 'shadowkin']
    },

    endurance_runner: {
        id: 'endurance_runner',
        name: 'Endurance Runner',
        category: 'survival',
        description: 'Tireless on the move. +15 stamina, +2 Agility.',
        effects: [
            { type: 'stamina_bonus', value: 15 },
            { type: 'stat_bonus', stat: 'dexterity', value: 2 }
        ],
        prerequisites: { stat: { dexterity: 10 } },
        exclusive: null,
        raceRestriction: null
    },

    trap_setter: {
        id: 'trap_setter',
        name: 'Trap Setter',
        category: 'survival',
        description: 'Expert at laying and detecting traps. +2 Intelligence, unlocks trap options.',
        effects: [
            { type: 'stat_bonus', stat: 'intelligence', value: 2 },
            { type: 'unlock_choice', flag: 'trait_trap_setter' }
        ],
        prerequisites: { stat: { intelligence: 10, wisdom: 10 } },
        exclusive: null,
        raceRestriction: null
    },

    urban_hunter: {
        id: 'urban_hunter',
        name: 'Urban Hunter',
        category: 'survival',
        description: 'The city is your hunting ground. +2 Perception, +3% crit chance, +2 initiative.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 2 },
            { type: 'crit_chance', value: 0.03 },
            { type: 'initiative_bonus', value: 2 }
        ],
        prerequisites: { stat: { wisdom: 11 } },
        exclusive: ['wasteland_walker'],
        raceRestriction: null
    },

    wasteland_walker: {
        id: 'wasteland_walker',
        name: 'Wasteland Walker',
        category: 'survival',
        description: 'Born outside the city walls. +15 HP, +10 stamina, 10% chemical damage resistance.',
        effects: [
            { type: 'hp_bonus', value: 15 },
            { type: 'stamina_bonus', value: 10 },
            { type: 'damage_resist', damageType: 'chemical', value: 0.1 }
        ],
        prerequisites: null,
        exclusive: ['urban_hunter'],
        raceRestriction: null
    },

    // =========================================================================
    //  RACIAL TRAITS (starting traits granted by race selection)
    // =========================================================================

    toxin_resistant: {
        id: 'toxin_resistant',
        name: 'Toxin Resistant',
        category: 'racial',
        description: 'Mutated biology grants natural resistance to poisons and toxins. 15% chemical damage resistance, +5 HP.',
        effects: [
            { type: 'damage_resist', damageType: 'chemical', value: 0.15 },
            { type: 'hp_bonus', value: 5 }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: ['orc'],
        icon: 'toxin_resistant'
    },

    nature_affinity: {
        id: 'nature_affinity',
        name: 'Nature Affinity',
        category: 'racial',
        description: 'Deep connection to the natural world grants intuitive understanding of plants, animals, and survival. +2 Wisdom, +5 stamina.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 2 },
            { type: 'stamina_bonus', value: 5 },
            { type: 'unlock_choice', flag: 'trait_nature_affinity' }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: ['wood_elf'],
        icon: 'nature_affinity'
    },

    darkvision: {
        id: 'darkvision',
        name: 'Darkvision',
        category: 'racial',
        description: 'Eyes adapted to the perpetual darkness of the undercity tunnels. Can see clearly in darkness, +2 Wisdom.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 2 },
            { type: 'unlock_choice', flag: 'trait_darkvision' }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: ['dark_elf'],
        icon: 'darkvision'
    },

    engineer: {
        id: 'engineer',
        name: 'Engineer',
        category: 'racial',
        description: 'Innate mechanical genius honed through generations of craftsmanship. +2 Tech, +1 Intelligence, unlocks engineering dialogue options.',
        effects: [
            { type: 'stat_bonus', stat: 'tech', value: 2 },
            { type: 'stat_bonus', stat: 'intelligence', value: 1 },
            { type: 'unlock_choice', flag: 'trait_engineer' }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: ['dwarf'],
        icon: 'engineer'
    },

    imposing_presence: {
        id: 'imposing_presence',
        name: 'Imposing Presence',
        category: 'racial',
        description: 'Sheer physical size intimidates enemies before a blow is struck. +2 Strength, +5% dodge chance from enemies hesitating, unlocks intimidation options.',
        effects: [
            { type: 'stat_bonus', stat: 'strength', value: 2 },
            { type: 'dodge_chance', value: 0.05 },
            { type: 'unlock_choice', flag: 'trait_imposing_presence' }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: ['half_giant'],
        icon: 'imposing_presence'
    },

    machine_interface: {
        id: 'machine_interface',
        name: 'Machine Interface',
        category: 'racial',
        description: 'Cybernetic augments allow direct interaction with machines, terminals, and networked systems. +2 Tech, +2 initiative, unlocks machine interaction options.',
        effects: [
            { type: 'stat_bonus', stat: 'tech', value: 2 },
            { type: 'initiative_bonus', value: 2 },
            { type: 'unlock_choice', flag: 'trait_machine_interface' }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: ['cyborg'],
        icon: 'machine_interface'
    },

    synthetic_body: {
        id: 'synthetic_body',
        name: 'Synthetic Body',
        category: 'racial',
        description: 'Artificial physiology requires no food or water and resists chemical agents. 15% chemical damage resistance, +10 HP, +10 stamina.',
        effects: [
            { type: 'damage_resist', damageType: 'chemical', value: 0.15 },
            { type: 'hp_bonus', value: 10 },
            { type: 'stamina_bonus', value: 10 }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: ['synth'],
        icon: 'synthetic_body'
    },

    void_touched: {
        id: 'void_touched',
        name: 'Void Touched',
        category: 'racial',
        description: 'Traces of dark dimensional energy grant the ability to sense anomalies and exert minor psychic influence. +2 Wisdom, +3% crit chance, unlocks void-sense options.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 2 },
            { type: 'crit_chance', value: 0.03 },
            { type: 'unlock_choice', flag: 'trait_void_touched' }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: ['shadowkin'],
        icon: 'void_touched'
    },

    psychic_sensitivity: {
        id: 'psychic_sensitivity',
        name: 'Psychic Sensitivity',
        category: 'racial',
        description: 'Alien neural pathways allow reading surface thoughts and sensing emotional residue. +3 Wisdom, unlocks psychic dialogue options.',
        effects: [
            { type: 'stat_bonus', stat: 'wisdom', value: 3 },
            { type: 'unlock_choice', flag: 'trait_psychic_sensitivity' }
        ],
        prerequisites: null,
        exclusive: null,
        raceRestriction: ['voidborn'],
        icon: 'psychic_sensitivity'
    },

    // =========================================================================
    //  HELPER METHODS
    // =========================================================================

    /**
     * Get a trait by its ID.
     * @param {string} traitId
     * @returns {object|null}
     */
    getTrait: function(traitId) {
        var trait = this[traitId];
        if (trait && typeof trait === 'object' && trait.id) {
            return trait;
        }
        return null;
    },

    /**
     * Get all traits in a given category.
     * @param {string} category - 'general', 'combat', 'tech', 'social', 'survival'
     * @returns {object[]}
     */
    getByCategory: function(category) {
        var results = [];
        for (var key in this) {
            if (this.hasOwnProperty(key) && typeof this[key] === 'object' && this[key].category === category) {
                results.push(this[key]);
            }
        }
        return results;
    },

    /**
     * Get all traits as a flat array.
     * @returns {object[]}
     */
    getAll: function() {
        var results = [];
        for (var key in this) {
            if (this.hasOwnProperty(key) && typeof this[key] === 'object' && this[key].id) {
                results.push(this[key]);
            }
        }
        return results;
    },

    /**
     * Get traits available for a given race.
     * @param {string} race
     * @returns {object[]}
     */
    getByRace: function(race) {
        var results = [];
        for (var key in this) {
            if (this.hasOwnProperty(key) && typeof this[key] === 'object' && this[key].id) {
                var trait = this[key];
                if (!trait.raceRestriction || trait.raceRestriction.indexOf(race) !== -1) {
                    results.push(trait);
                }
            }
        }
        return results;
    },

    /**
     * Check if a character meets the prerequisites for a trait.
     * @param {string} traitId
     * @param {object} character - { level, stats: { strength, dexterity, ... } }
     * @returns {boolean}
     */
    meetsPrerequisites: function(traitId, character) {
        var trait = this.getTrait(traitId);
        if (!trait || !trait.prerequisites) {
            return true;
        }
        var prereqs = trait.prerequisites;
        if (prereqs.level && character.level < prereqs.level) {
            return false;
        }
        if (prereqs.stat) {
            for (var stat in prereqs.stat) {
                if (prereqs.stat.hasOwnProperty(stat)) {
                    if (!character.stats || !character.stats[stat] || character.stats[stat] < prereqs.stat[stat]) {
                        return false;
                    }
                }
            }
        }
        return true;
    },

    /**
     * Check if a trait conflicts with any traits the character already has.
     * @param {string} traitId
     * @param {string[]} currentTraits - array of trait IDs the character has
     * @returns {boolean} true if conflict exists
     */
    hasConflict: function(traitId, currentTraits) {
        var trait = this.getTrait(traitId);
        if (!trait || !trait.exclusive) {
            return false;
        }
        for (var i = 0; i < trait.exclusive.length; i++) {
            if (currentTraits.indexOf(trait.exclusive[i]) !== -1) {
                return true;
            }
        }
        return false;
    },

    /**
     * Compute aggregated effects from a list of trait IDs.
     * @param {string[]} traitIds
     * @returns {object[]} flat array of all effect objects
     */
    computeEffects: function(traitIds) {
        var effects = [];
        for (var i = 0; i < traitIds.length; i++) {
            var trait = this.getTrait(traitIds[i]);
            if (trait && trait.effects) {
                for (var j = 0; j < trait.effects.length; j++) {
                    effects.push(trait.effects[j]);
                }
            }
        }
        return effects;
    }
};
