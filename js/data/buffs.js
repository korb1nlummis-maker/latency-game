/**
 * LATENCY - Buffs & Debuffs Data
 * 100+ buffs/debuffs across 5 categories: combat, chemical, stack, environmental, social.
 * Each buff has BOTH positive AND negative effects to create interesting trade-offs.
 */

window.Latency = window.Latency || {};

window.Latency.BuffsData = {

    // =========================================================================
    //  COMBAT BUFFS (20+)
    // =========================================================================

    adrenaline_rush: {
        id: 'adrenaline_rush',
        name: 'Adrenaline Rush',
        category: 'combat',
        description: 'Surge of adrenaline. Increased strength but decreased focus.',
        effects: [
            { stat: 'strength', value: 3 },
            { stat: 'wisdom', value: -2 }
        ],
        duration: 5,
        stackable: false,
        source: 'consumable',
        icon: '💉',
        curable: true
    },

    berserker_rage: {
        id: 'berserker_rage',
        name: 'Berserker Rage',
        category: 'combat',
        description: 'Uncontrollable fury. Massive damage boost but cannot defend.',
        effects: [
            { stat: 'strength', value: 5 },
            { stat: 'damage_bonus', value: 0.3 },
            { stat: 'dodge_chance', value: -0.15 },
            { stat: 'armor', value: -5 }
        ],
        duration: 3,
        stackable: false,
        source: 'ability',
        icon: '🔥',
        curable: false
    },

    defensive_stance: {
        id: 'defensive_stance',
        name: 'Defensive Stance',
        category: 'combat',
        description: 'Braced for impact. High armor but reduced movement.',
        effects: [
            { stat: 'armor', value: 8 },
            { stat: 'dodge_chance', value: 0.05 },
            { stat: 'initiative', value: -5 },
            { stat: 'damage_bonus', value: -0.1 }
        ],
        duration: 4,
        stackable: false,
        source: 'ability',
        icon: '🛡️',
        curable: true
    },

    focused_aim: {
        id: 'focused_aim',
        name: 'Focused Aim',
        category: 'combat',
        description: 'Perfect concentration. Enhanced accuracy but tunnel vision.',
        effects: [
            { stat: 'crit_chance', value: 0.15 },
            { stat: 'dexterity', value: 3 },
            { stat: 'dodge_chance', value: -0.1 },
            { stat: 'initiative', value: -3 }
        ],
        duration: 3,
        stackable: false,
        source: 'ability',
        icon: '🎯',
        curable: true
    },

    shield_wall: {
        id: 'shield_wall',
        name: 'Shield Wall',
        category: 'combat',
        description: 'Impenetrable barrier. Cannot be damaged but cannot attack.',
        effects: [
            { stat: 'armor', value: 20 },
            { stat: 'damage_bonus', value: -1.0 },
            { stat: 'initiative', value: -10 }
        ],
        duration: 2,
        stackable: false,
        source: 'ability',
        icon: '🧱',
        curable: true
    },

    blood_fury: {
        id: 'blood_fury',
        name: 'Blood Fury',
        category: 'combat',
        description: 'Pain feeds power. Damage increases as HP decreases.',
        effects: [
            { stat: 'strength', value: 4 },
            { stat: 'damage_bonus', value: 0.2 },
            { stat: 'constitution', value: -2 },
            { stat: 'wisdom', value: -3 }
        ],
        duration: 5,
        stackable: false,
        source: 'ability',
        icon: '🩸',
        curable: true
    },

    battle_focus: {
        id: 'battle_focus',
        name: 'Battle Focus',
        category: 'combat',
        description: 'Heightened combat awareness. Faster reflexes, strained body.',
        effects: [
            { stat: 'initiative', value: 5 },
            { stat: 'dexterity', value: 2 },
            { stat: 'stamina_drain', value: 2 },
            { stat: 'constitution', value: -1 }
        ],
        duration: 4,
        stackable: false,
        source: 'ability',
        icon: '⚡',
        curable: true
    },

    intimidating_presence: {
        id: 'intimidating_presence',
        name: 'Intimidating Presence',
        category: 'combat',
        description: 'Terrifying aura. Enemies weakened but allies uneasy.',
        effects: [
            { stat: 'strength', value: 2 },
            { stat: 'charisma', value: -3 },
            { stat: 'enemy_damage', value: -0.1 }
        ],
        duration: 4,
        stackable: false,
        source: 'ability',
        icon: '😈',
        curable: true
    },

    second_wind: {
        id: 'second_wind',
        name: 'Second Wind',
        category: 'combat',
        description: 'Renewed vigor mid-fight. HP regen but stamina drain increased.',
        effects: [
            { stat: 'hp_regen', value: 5 },
            { stat: 'stamina_drain', value: 3 },
            { stat: 'constitution', value: 1 }
        ],
        duration: 4,
        stackable: false,
        source: 'ability',
        icon: '🌬️',
        curable: true
    },

    warcry_buff: {
        id: 'warcry_buff',
        name: 'Warcry',
        category: 'combat',
        description: 'Battle shout echoes. Boosted morale but drew attention.',
        effects: [
            { stat: 'strength', value: 2 },
            { stat: 'initiative', value: 3 },
            { stat: 'stealth', value: -5 }
        ],
        duration: 4,
        stackable: false,
        source: 'ability',
        icon: '📣',
        curable: true
    },

    wounded: {
        id: 'wounded',
        name: 'Wounded',
        category: 'combat',
        description: 'Bleeding injury. Losing HP each turn, reduced combat ability.',
        effects: [
            { stat: 'hp_drain', value: 3 },
            { stat: 'strength', value: -2 },
            { stat: 'dexterity', value: -1 }
        ],
        duration: 6,
        stackable: true,
        source: 'event',
        icon: '🩸',
        curable: true
    },

    stunned: {
        id: 'stunned',
        name: 'Stunned',
        category: 'combat',
        description: 'Dazed from a heavy blow. Cannot act, reduced defenses.',
        effects: [
            { stat: 'initiative', value: -10 },
            { stat: 'dodge_chance', value: -0.2 },
            { stat: 'armor', value: -3 }
        ],
        duration: 1,
        stackable: false,
        source: 'event',
        icon: '💫',
        curable: true
    },

    overcharged: {
        id: 'overcharged',
        name: 'Overcharged',
        category: 'combat',
        description: 'Systems running hot. Enhanced output at the cost of stability.',
        effects: [
            { stat: 'damage_bonus', value: 0.15 },
            { stat: 'tech', value: 2 },
            { stat: 'hp_drain', value: 2 },
            { stat: 'constitution', value: -1 }
        ],
        duration: 4,
        stackable: false,
        source: 'ability',
        icon: '⚡',
        curable: true
    },

    evasive: {
        id: 'evasive',
        name: 'Evasive Maneuvers',
        category: 'combat',
        description: 'Dodging everything. Hard to hit but hard to hit back.',
        effects: [
            { stat: 'dodge_chance', value: 0.2 },
            { stat: 'damage_bonus', value: -0.15 },
            { stat: 'crit_chance', value: -0.05 }
        ],
        duration: 3,
        stackable: false,
        source: 'ability',
        icon: '💨',
        curable: true
    },

    enraged: {
        id: 'enraged',
        name: 'Enraged',
        category: 'combat',
        description: 'Blind fury. Higher damage but reckless and unfocused.',
        effects: [
            { stat: 'strength', value: 4 },
            { stat: 'intelligence', value: -3 },
            { stat: 'wisdom', value: -3 },
            { stat: 'crit_chance', value: 0.1 }
        ],
        duration: 3,
        stackable: false,
        source: 'event',
        icon: '😡',
        curable: true
    },

    marked_target: {
        id: 'marked_target',
        name: 'Marked Target',
        category: 'combat',
        description: 'Targeted by enemies. Take more damage but gain awareness.',
        effects: [
            { stat: 'armor', value: -5 },
            { stat: 'initiative', value: 3 },
            { stat: 'wisdom', value: 2 }
        ],
        duration: 3,
        stackable: false,
        source: 'event',
        icon: '🎯',
        curable: true
    },

    fortified: {
        id: 'fortified',
        name: 'Fortified',
        category: 'combat',
        description: 'Dug in and braced. Excellent defense but immobile.',
        effects: [
            { stat: 'armor', value: 12 },
            { stat: 'hp_regen', value: 2 },
            { stat: 'initiative', value: -8 },
            { stat: 'dodge_chance', value: -0.1 }
        ],
        duration: 3,
        stackable: false,
        source: 'ability',
        icon: '🏰',
        curable: true
    },

    combat_high: {
        id: 'combat_high',
        name: 'Combat High',
        category: 'combat',
        description: 'Thriving in battle. Everything feels sharper, crash coming later.',
        effects: [
            { stat: 'dexterity', value: 2 },
            { stat: 'strength', value: 1 },
            { stat: 'initiative', value: 2 },
            { stat: 'wisdom', value: -2 }
        ],
        duration: 5,
        stackable: false,
        source: 'event',
        icon: '✨',
        curable: true
    },

    exhausted: {
        id: 'exhausted',
        name: 'Exhausted',
        category: 'combat',
        description: 'Completely drained. Everything suffers.',
        effects: [
            { stat: 'strength', value: -3 },
            { stat: 'dexterity', value: -3 },
            { stat: 'initiative', value: -5 },
            { stat: 'damage_bonus', value: -0.1 }
        ],
        duration: 8,
        stackable: false,
        source: 'event',
        icon: '😩',
        curable: true
    },

    precision_mode: {
        id: 'precision_mode',
        name: 'Precision Mode',
        category: 'combat',
        description: 'Surgical accuracy. Higher crits but slower reactions.',
        effects: [
            { stat: 'crit_chance', value: 0.2 },
            { stat: 'crit_damage', value: 0.3 },
            { stat: 'initiative', value: -4 },
            { stat: 'dodge_chance', value: -0.05 }
        ],
        duration: 3,
        stackable: false,
        source: 'ability',
        icon: '🔬',
        curable: true
    },

    // =========================================================================
    //  CHEMICAL BUFFS (20+)
    // =========================================================================

    neon_high: {
        id: 'neon_high',
        name: 'Neon High',
        category: 'chemical',
        description: 'Neon Court party drug. Enhanced charisma, impaired judgment.',
        effects: [
            { stat: 'charisma', value: 4 },
            { stat: 'luck', value: 2 },
            { stat: 'intelligence', value: -3 },
            { stat: 'wisdom', value: -2 }
        ],
        duration: 8,
        stackable: false,
        source: 'consumable',
        icon: '🌈',
        curable: true
    },

    stim_overdose: {
        id: 'stim_overdose',
        name: 'Stim Overdose',
        category: 'chemical',
        description: 'Too many stims. Wired but crashing hard. HP drain per turn.',
        effects: [
            { stat: 'dexterity', value: 3 },
            { stat: 'initiative', value: 5 },
            { stat: 'hp_drain', value: 4 },
            { stat: 'wisdom', value: -4 }
        ],
        duration: 6,
        stackable: false,
        source: 'consumable',
        icon: '💊',
        curable: true
    },

    focus_stim: {
        id: 'focus_stim',
        name: 'Focus Stim',
        category: 'chemical',
        description: 'Laser-sharp concentration. Enhanced Tech but social impairment.',
        effects: [
            { stat: 'tech', value: 3 },
            { stat: 'intelligence', value: 2 },
            { stat: 'charisma', value: -3 },
            { stat: 'luck', value: -1 }
        ],
        duration: 6,
        stackable: false,
        source: 'consumable',
        icon: '🧪',
        curable: true
    },

    pain_killer: {
        id: 'pain_killer',
        name: 'Pain Killer',
        category: 'chemical',
        description: 'Numbed to pain. Resist damage but dulled reflexes.',
        effects: [
            { stat: 'armor', value: 5 },
            { stat: 'constitution', value: 2 },
            { stat: 'dexterity', value: -2 },
            { stat: 'initiative', value: -3 }
        ],
        duration: 8,
        stackable: false,
        source: 'consumable',
        icon: '💊',
        curable: true
    },

    toxin_exposure: {
        id: 'toxin_exposure',
        name: 'Toxin Exposure',
        category: 'chemical',
        description: 'Poisoned. Draining health and strength over time.',
        effects: [
            { stat: 'hp_drain', value: 3 },
            { stat: 'strength', value: -2 },
            { stat: 'constitution', value: -2 },
            { stat: 'dexterity', value: -1 }
        ],
        duration: 8,
        stackable: true,
        source: 'event',
        icon: '☠️',
        curable: true
    },

    radiation_sickness: {
        id: 'radiation_sickness',
        name: 'Radiation Sickness',
        category: 'chemical',
        description: 'Radiation exposure. Stats deteriorating, rare mutation possible.',
        effects: [
            { stat: 'constitution', value: -3 },
            { stat: 'strength', value: -2 },
            { stat: 'hp_drain', value: 2 },
            { stat: 'luck', value: 1 }
        ],
        duration: 12,
        stackable: false,
        source: 'environment',
        icon: '☢️',
        curable: true
    },

    combat_stim: {
        id: 'combat_stim',
        name: 'Combat Stim',
        category: 'chemical',
        description: 'Military-grade stimulant. Enhanced combat ability, harsh crash.',
        effects: [
            { stat: 'strength', value: 3 },
            { stat: 'dexterity', value: 3 },
            { stat: 'initiative', value: 4 },
            { stat: 'wisdom', value: -3 },
            { stat: 'hp_drain', value: 1 }
        ],
        duration: 4,
        stackable: false,
        source: 'consumable',
        icon: '💉',
        curable: true
    },

    liquid_luck: {
        id: 'liquid_luck',
        name: 'Liquid Luck',
        category: 'chemical',
        description: 'Probability-altering compound. Incredible luck, reality distortion.',
        effects: [
            { stat: 'luck', value: 5 },
            { stat: 'crit_chance', value: 0.1 },
            { stat: 'wisdom', value: -4 },
            { stat: 'intelligence', value: -2 }
        ],
        duration: 5,
        stackable: false,
        source: 'consumable',
        icon: '🍀',
        curable: true
    },

    synth_blood: {
        id: 'synth_blood',
        name: 'Synth Blood',
        category: 'chemical',
        description: 'Artificial blood infusion. Regeneration at the cost of organic function.',
        effects: [
            { stat: 'hp_regen', value: 5 },
            { stat: 'constitution', value: 2 },
            { stat: 'charisma', value: -2 },
            { stat: 'wisdom', value: -1 }
        ],
        duration: 8,
        stackable: false,
        source: 'consumable',
        icon: '🩸',
        curable: true
    },

    neurotoxin: {
        id: 'neurotoxin',
        name: 'Neurotoxin',
        category: 'chemical',
        description: 'Neural poison. Devastating mental stat reduction.',
        effects: [
            { stat: 'intelligence', value: -4 },
            { stat: 'wisdom', value: -4 },
            { stat: 'tech', value: -3 },
            { stat: 'initiative', value: -3 }
        ],
        duration: 6,
        stackable: false,
        source: 'event',
        icon: '🧠',
        curable: true
    },

    berserker_compound: {
        id: 'berserker_compound',
        name: 'Berserker Compound',
        category: 'chemical',
        description: 'Rage-inducing drug. Extreme strength, complete loss of control.',
        effects: [
            { stat: 'strength', value: 6 },
            { stat: 'damage_bonus', value: 0.25 },
            { stat: 'intelligence', value: -5 },
            { stat: 'wisdom', value: -5 },
            { stat: 'charisma', value: -4 }
        ],
        duration: 3,
        stackable: false,
        source: 'consumable',
        icon: '🔴',
        curable: false
    },

    clarity_tab: {
        id: 'clarity_tab',
        name: 'Clarity Tab',
        category: 'chemical',
        description: 'Mental clarity drug. Enhanced perception at physical cost.',
        effects: [
            { stat: 'intelligence', value: 3 },
            { stat: 'wisdom', value: 3 },
            { stat: 'strength', value: -2 },
            { stat: 'constitution', value: -1 }
        ],
        duration: 6,
        stackable: false,
        source: 'consumable',
        icon: '💎',
        curable: true
    },

    adrenaline_shot: {
        id: 'adrenaline_shot',
        name: 'Adrenaline Shot',
        category: 'chemical',
        description: 'Emergency stimulant. Revives from near-death, heart strain.',
        effects: [
            { stat: 'hp_regen', value: 8 },
            { stat: 'strength', value: 2 },
            { stat: 'constitution', value: -3 },
            { stat: 'hp_drain', value: 1 }
        ],
        duration: 3,
        stackable: false,
        source: 'consumable',
        icon: '💉',
        curable: true
    },

    rad_flush: {
        id: 'rad_flush',
        name: 'Rad Flush',
        category: 'chemical',
        description: 'Radiation purge compound. Clears radiation but weakens temporarily.',
        effects: [
            { stat: 'constitution', value: -2 },
            { stat: 'strength', value: -1 },
            { stat: 'rad_resist', value: 0.5 }
        ],
        duration: 4,
        stackable: false,
        source: 'consumable',
        icon: '💧',
        curable: true
    },

    silver_tongue_drops: {
        id: 'silver_tongue_drops',
        name: 'Silver Tongue Drops',
        category: 'chemical',
        description: 'Charisma-enhancing tincture. Smoother words, foggier thoughts.',
        effects: [
            { stat: 'charisma', value: 5 },
            { stat: 'intelligence', value: -2 },
            { stat: 'dexterity', value: -1 }
        ],
        duration: 6,
        stackable: false,
        source: 'consumable',
        icon: '👅',
        curable: true
    },

    ghost_serum: {
        id: 'ghost_serum',
        name: 'Ghost Serum',
        category: 'chemical',
        description: 'Stealth compound. Near-invisible but physically weakened.',
        effects: [
            { stat: 'dodge_chance', value: 0.2 },
            { stat: 'stealth', value: 5 },
            { stat: 'strength', value: -3 },
            { stat: 'constitution', value: -2 }
        ],
        duration: 5,
        stackable: false,
        source: 'consumable',
        icon: '👻',
        curable: true
    },

    overclock_injection: {
        id: 'overclock_injection',
        name: 'Overclock Injection',
        category: 'chemical',
        description: 'Implant boost serum. Tech systems enhanced, biological systems strained.',
        effects: [
            { stat: 'tech', value: 4 },
            { stat: 'initiative', value: 3 },
            { stat: 'constitution', value: -3 },
            { stat: 'hp_drain', value: 2 }
        ],
        duration: 5,
        stackable: false,
        source: 'consumable',
        icon: '🔌',
        curable: true
    },

    neural_suppressant: {
        id: 'neural_suppressant',
        name: 'Neural Suppressant',
        category: 'chemical',
        description: 'Emotion blocker. No fear, no empathy. Cold efficiency.',
        effects: [
            { stat: 'wisdom', value: -4 },
            { stat: 'charisma', value: -3 },
            { stat: 'damage_bonus', value: 0.1 },
            { stat: 'armor', value: 3 }
        ],
        duration: 8,
        stackable: false,
        source: 'consumable',
        icon: '❄️',
        curable: true
    },

    metabolic_booster: {
        id: 'metabolic_booster',
        name: 'Metabolic Booster',
        category: 'chemical',
        description: 'Hyper-metabolism. Rapid healing but burning through resources.',
        effects: [
            { stat: 'hp_regen', value: 6 },
            { stat: 'stamina_regen', value: 3 },
            { stat: 'stamina_drain', value: 5 },
            { stat: 'constitution', value: -1 }
        ],
        duration: 5,
        stackable: false,
        source: 'consumable',
        icon: '🔥',
        curable: true
    },

    withdrawal: {
        id: 'withdrawal',
        name: 'Withdrawal',
        category: 'chemical',
        description: 'Drug withdrawal symptoms. Everything hurts, everything is worse.',
        effects: [
            { stat: 'strength', value: -2 },
            { stat: 'dexterity', value: -2 },
            { stat: 'intelligence', value: -2 },
            { stat: 'wisdom', value: -2 },
            { stat: 'charisma', value: -2 }
        ],
        duration: 10,
        stackable: false,
        source: 'event',
        icon: '🤢',
        curable: true
    },

    // =========================================================================
    //  STACK BUFFS (20+)
    // =========================================================================

    stack_overload: {
        id: 'stack_overload',
        name: 'Stack Overload',
        category: 'stack',
        description: 'Cortical stack processing beyond capacity. Enhanced mind, body failing.',
        effects: [
            { stat: 'intelligence', value: 5 },
            { stat: 'tech', value: 3 },
            { stat: 'constitution', value: -3 },
            { stat: 'hp_drain', value: 3 }
        ],
        duration: 4,
        stackable: false,
        source: 'ability',
        icon: '🧠',
        curable: true
    },

    stack_sickness: {
        id: 'stack_sickness',
        name: 'Stack Sickness',
        category: 'stack',
        description: 'Cortical stack rejection. Mind-body disconnect, nausea, confusion.',
        effects: [
            { stat: 'dexterity', value: -3 },
            { stat: 'wisdom', value: -3 },
            { stat: 'initiative', value: -4 },
            { stat: 'dodge_chance', value: -0.05 }
        ],
        duration: 8,
        stackable: false,
        source: 'event',
        icon: '🤮',
        curable: true
    },

    memory_bleed: {
        id: 'memory_bleed',
        name: 'Memory Bleed',
        category: 'stack',
        description: 'Past life memories leaking through. Gain knowledge, lose identity.',
        effects: [
            { stat: 'intelligence', value: 3 },
            { stat: 'wisdom', value: 2 },
            { stat: 'charisma', value: -3 },
            { stat: 'luck', value: -2 }
        ],
        duration: 6,
        stackable: false,
        source: 'event',
        icon: '💭',
        curable: true
    },

    neural_boost: {
        id: 'neural_boost',
        name: 'Neural Boost',
        category: 'stack',
        description: 'Stack-assisted cognitive enhancement. Faster thinking, headaches.',
        effects: [
            { stat: 'intelligence', value: 4 },
            { stat: 'initiative', value: 3 },
            { stat: 'hp_drain', value: 1 },
            { stat: 'constitution', value: -1 }
        ],
        duration: 6,
        stackable: false,
        source: 'ability',
        icon: '⚡',
        curable: true
    },

    consciousness_split: {
        id: 'consciousness_split',
        name: 'Consciousness Split',
        category: 'stack',
        description: 'Running two threads of consciousness. Process more, strain everything.',
        effects: [
            { stat: 'intelligence', value: 4 },
            { stat: 'tech', value: 4 },
            { stat: 'wisdom', value: -4 },
            { stat: 'charisma', value: -3 },
            { stat: 'hp_drain', value: 2 }
        ],
        duration: 4,
        stackable: false,
        source: 'ability',
        icon: '🔀',
        curable: true
    },

    ego_fragmentation: {
        id: 'ego_fragmentation',
        name: 'Ego Fragmentation',
        category: 'stack',
        description: 'Identity breakdown. Random stat shifts as personalities compete.',
        effects: [
            { stat: 'strength', value: 2 },
            { stat: 'charisma', value: -4 },
            { stat: 'wisdom', value: -3 },
            { stat: 'luck', value: 3 }
        ],
        duration: 8,
        stackable: false,
        source: 'event',
        icon: '🪞',
        curable: true
    },

    stack_echo: {
        id: 'stack_echo',
        name: 'Stack Echo',
        category: 'stack',
        description: 'Residual memories from previous sleeve user. Foreign skills, foreign fears.',
        effects: [
            { stat: 'dexterity', value: 2 },
            { stat: 'tech', value: 2 },
            { stat: 'wisdom', value: -2 },
            { stat: 'charisma', value: -2 }
        ],
        duration: 10,
        stackable: false,
        source: 'event',
        icon: '📡',
        curable: true
    },

    digital_transcendence: {
        id: 'digital_transcendence',
        name: 'Digital Transcendence',
        category: 'stack',
        description: 'Partially uploaded to the net. Godlike tech, fading physical form.',
        effects: [
            { stat: 'tech', value: 6 },
            { stat: 'intelligence', value: 4 },
            { stat: 'strength', value: -4 },
            { stat: 'constitution', value: -3 },
            { stat: 'dexterity', value: -2 }
        ],
        duration: 4,
        stackable: false,
        source: 'ability',
        icon: '🌐',
        curable: true
    },

    stack_corruption: {
        id: 'stack_corruption',
        name: 'Stack Corruption',
        category: 'stack',
        description: 'Corrupted cortical data. Erratic behavior, glitching perception.',
        effects: [
            { stat: 'intelligence', value: -3 },
            { stat: 'wisdom', value: -3 },
            { stat: 'luck', value: -2 },
            { stat: 'tech', value: -2 }
        ],
        duration: 8,
        stackable: false,
        source: 'event',
        icon: '⚠️',
        curable: true
    },

    resleeve_shock: {
        id: 'resleeve_shock',
        name: 'Resleeve Shock',
        category: 'stack',
        description: 'Adjusting to a new body. Everything feels wrong temporarily.',
        effects: [
            { stat: 'dexterity', value: -4 },
            { stat: 'strength', value: -2 },
            { stat: 'initiative', value: -5 },
            { stat: 'constitution', value: 1 }
        ],
        duration: 10,
        stackable: false,
        source: 'event',
        icon: '🔄',
        curable: true
    },

    psychic_link: {
        id: 'psychic_link',
        name: 'Psychic Link',
        category: 'stack',
        description: 'Stack-to-stack communication. Share thoughts, share pain.',
        effects: [
            { stat: 'wisdom', value: 4 },
            { stat: 'charisma', value: 3 },
            { stat: 'hp_drain', value: 2 },
            { stat: 'constitution', value: -2 }
        ],
        duration: 5,
        stackable: false,
        source: 'ability',
        icon: '🔗',
        curable: true
    },

    backup_loaded: {
        id: 'backup_loaded',
        name: 'Backup Loaded',
        category: 'stack',
        description: 'Restored from old backup. Missing recent memories, gained old skills.',
        effects: [
            { stat: 'intelligence', value: 2 },
            { stat: 'strength', value: 1 },
            { stat: 'wisdom', value: -3 },
            { stat: 'luck', value: -2 }
        ],
        duration: 12,
        stackable: false,
        source: 'event',
        icon: '💾',
        curable: true
    },

    ghost_in_machine: {
        id: 'ghost_in_machine',
        name: 'Ghost in the Machine',
        category: 'stack',
        description: 'Another consciousness sharing your stack. Alien thoughts intrude.',
        effects: [
            { stat: 'tech', value: 3 },
            { stat: 'intelligence', value: 2 },
            { stat: 'charisma', value: -4 },
            { stat: 'wisdom', value: -3 }
        ],
        duration: -1,
        stackable: false,
        source: 'event',
        icon: '👻',
        curable: true
    },

    stack_sync: {
        id: 'stack_sync',
        name: 'Stack Sync',
        category: 'stack',
        description: 'Perfect mind-body calibration. Everything enhanced slightly, unstable.',
        effects: [
            { stat: 'strength', value: 1 },
            { stat: 'dexterity', value: 1 },
            { stat: 'intelligence', value: 1 },
            { stat: 'wisdom', value: 1 },
            { stat: 'hp_drain', value: 1 }
        ],
        duration: 8,
        stackable: false,
        source: 'ability',
        icon: '🔄',
        curable: true
    },

    void_touched_stack: {
        id: 'void_touched_stack',
        name: 'Void-Touched Stack',
        category: 'stack',
        description: 'Stack exposed to void energy. Unpredictable powers, creeping entropy.',
        effects: [
            { stat: 'luck', value: 5 },
            { stat: 'tech', value: 3 },
            { stat: 'constitution', value: -4 },
            { stat: 'hp_drain', value: 3 }
        ],
        duration: 6,
        stackable: false,
        source: 'event',
        icon: '🕳️',
        curable: true
    },

    overwritten: {
        id: 'overwritten',
        name: 'Overwritten',
        category: 'stack',
        description: 'Someone wrote to your stack. Foreign skills but lost memories.',
        effects: [
            { stat: 'tech', value: 3 },
            { stat: 'dexterity', value: 2 },
            { stat: 'wisdom', value: -5 },
            { stat: 'charisma', value: -2 }
        ],
        duration: 10,
        stackable: false,
        source: 'event',
        icon: '📝',
        curable: true
    },

    stack_resonance: {
        id: 'stack_resonance',
        name: 'Stack Resonance',
        category: 'stack',
        description: 'Stack vibrating at unusual frequency. Enhanced senses, painful feedback.',
        effects: [
            { stat: 'wisdom', value: 4 },
            { stat: 'initiative', value: 4 },
            { stat: 'hp_drain', value: 2 },
            { stat: 'strength', value: -2 }
        ],
        duration: 5,
        stackable: false,
        source: 'event',
        icon: '〰️',
        curable: true
    },

    multi_threaded: {
        id: 'multi_threaded',
        name: 'Multi-Threaded',
        category: 'stack',
        description: 'Processing multiple thought streams. Superior intellect, fragmented self.',
        effects: [
            { stat: 'intelligence', value: 5 },
            { stat: 'tech', value: 3 },
            { stat: 'charisma', value: -5 },
            { stat: 'wisdom', value: -2 }
        ],
        duration: 4,
        stackable: false,
        source: 'ability',
        icon: '🔀',
        curable: true
    },

    stack_purge_effect: {
        id: 'stack_purge_effect',
        name: 'Stack Purge',
        category: 'stack',
        description: 'Stack wiped clean. Pure but empty. Slowly rebuilding.',
        effects: [
            { stat: 'intelligence', value: -3 },
            { stat: 'wisdom', value: -3 },
            { stat: 'tech', value: -2 },
            { stat: 'luck', value: 3 }
        ],
        duration: 8,
        stackable: false,
        source: 'consumable',
        icon: '🧹',
        curable: true
    },

    // =========================================================================
    //  ENVIRONMENTAL BUFFS (20+)
    // =========================================================================

    acid_rain_exposure: {
        id: 'acid_rain_exposure',
        name: 'Acid Rain Exposure',
        category: 'environmental',
        description: 'Caught in acid rain. Corrosive damage, armor degradation.',
        effects: [
            { stat: 'hp_drain', value: 2 },
            { stat: 'armor', value: -4 },
            { stat: 'charisma', value: -2 },
            { stat: 'dexterity', value: 1 }
        ],
        duration: 6,
        stackable: false,
        source: 'environment',
        icon: '🌧️',
        curable: true
    },

    toxic_air: {
        id: 'toxic_air',
        name: 'Toxic Air',
        category: 'environmental',
        description: 'Breathing contaminated atmosphere. Slow poisoning, adapted lungs.',
        effects: [
            { stat: 'constitution', value: -2 },
            { stat: 'hp_drain', value: 1 },
            { stat: 'stamina_drain', value: 2 },
            { stat: 'poison_resist', value: 0.1 }
        ],
        duration: 10,
        stackable: false,
        source: 'environment',
        icon: '☁️',
        curable: true
    },

    extreme_cold: {
        id: 'extreme_cold',
        name: 'Extreme Cold',
        category: 'environmental',
        description: 'Freezing temperatures. Slower reactions, numbed pain.',
        effects: [
            { stat: 'dexterity', value: -3 },
            { stat: 'initiative', value: -4 },
            { stat: 'armor', value: 2 },
            { stat: 'constitution', value: 1 }
        ],
        duration: 8,
        stackable: false,
        source: 'environment',
        icon: '❄️',
        curable: true
    },

    scanner_detected: {
        id: 'scanner_detected',
        name: 'Scanner Detected',
        category: 'environmental',
        description: 'Pinged by surveillance. Tracked by systems, heightened alertness.',
        effects: [
            { stat: 'stealth', value: -5 },
            { stat: 'dodge_chance', value: -0.05 },
            { stat: 'initiative', value: 2 },
            { stat: 'wisdom', value: 1 }
        ],
        duration: 6,
        stackable: false,
        source: 'environment',
        icon: '📡',
        curable: true
    },

    dark_adaptation: {
        id: 'dark_adaptation',
        name: 'Dark Adaptation',
        category: 'environmental',
        description: 'Eyes adjusted to darkness. See in the dark, blinded by light.',
        effects: [
            { stat: 'wisdom', value: 2 },
            { stat: 'initiative', value: 2 },
            { stat: 'charisma', value: -2 },
            { stat: 'dexterity', value: 1 }
        ],
        duration: 8,
        stackable: false,
        source: 'environment',
        icon: '🌑',
        curable: true
    },

    extreme_heat: {
        id: 'extreme_heat',
        name: 'Extreme Heat',
        category: 'environmental',
        description: 'Sweltering heat. Faster metabolism but rapid dehydration.',
        effects: [
            { stat: 'stamina_drain', value: 3 },
            { stat: 'initiative', value: -2 },
            { stat: 'dexterity', value: 1 },
            { stat: 'strength', value: -1 }
        ],
        duration: 8,
        stackable: false,
        source: 'environment',
        icon: '🔥',
        curable: true
    },

    emp_aftershock: {
        id: 'emp_aftershock',
        name: 'EMP Aftershock',
        category: 'environmental',
        description: 'Residual electromagnetic disruption. Tech disabled, cleared mind.',
        effects: [
            { stat: 'tech', value: -5 },
            { stat: 'intelligence', value: -2 },
            { stat: 'wisdom', value: 2 },
            { stat: 'strength', value: 1 }
        ],
        duration: 4,
        stackable: false,
        source: 'environment',
        icon: '⚡',
        curable: true
    },

    void_proximity: {
        id: 'void_proximity',
        name: 'Void Proximity',
        category: 'environmental',
        description: 'Near a void anomaly. Reality bends, enhanced luck, HP drain.',
        effects: [
            { stat: 'luck', value: 4 },
            { stat: 'hp_drain', value: 3 },
            { stat: 'wisdom', value: -3 },
            { stat: 'constitution', value: -2 }
        ],
        duration: 6,
        stackable: false,
        source: 'environment',
        icon: '🕳️',
        curable: true
    },

    elevated_position: {
        id: 'elevated_position',
        name: 'Elevated Position',
        category: 'environmental',
        description: 'High ground advantage. Better accuracy, exposed to ranged.',
        effects: [
            { stat: 'crit_chance', value: 0.1 },
            { stat: 'initiative', value: 3 },
            { stat: 'armor', value: -3 },
            { stat: 'dodge_chance', value: -0.05 }
        ],
        duration: -1,
        stackable: false,
        source: 'environment',
        icon: '⛰️',
        curable: false
    },

    underground: {
        id: 'underground',
        name: 'Underground',
        category: 'environmental',
        description: 'In tunnels or sewers. Cramped but concealed.',
        effects: [
            { stat: 'stealth', value: 3 },
            { stat: 'dodge_chance', value: -0.05 },
            { stat: 'initiative', value: -2 },
            { stat: 'constitution', value: 1 }
        ],
        duration: -1,
        stackable: false,
        source: 'environment',
        icon: '🕳️',
        curable: false
    },

    smog_cover: {
        id: 'smog_cover',
        name: 'Smog Cover',
        category: 'environmental',
        description: 'Thick smog blanket. Hidden from sight, breathing difficulties.',
        effects: [
            { stat: 'stealth', value: 3 },
            { stat: 'dodge_chance', value: 0.05 },
            { stat: 'constitution', value: -1 },
            { stat: 'stamina_drain', value: 1 }
        ],
        duration: 8,
        stackable: false,
        source: 'environment',
        icon: '🌫️',
        curable: true
    },

    neon_glare: {
        id: 'neon_glare',
        name: 'Neon Glare',
        category: 'environmental',
        description: 'Blinding neon lights. Disorienting but visually spectacular.',
        effects: [
            { stat: 'wisdom', value: -2 },
            { stat: 'initiative', value: -2 },
            { stat: 'charisma', value: 2 },
            { stat: 'luck', value: 1 }
        ],
        duration: 4,
        stackable: false,
        source: 'environment',
        icon: '💡',
        curable: true
    },

    contaminated_water: {
        id: 'contaminated_water',
        name: 'Contaminated Water',
        category: 'environmental',
        description: 'Drank bad water. Illness spreading but immune system adapting.',
        effects: [
            { stat: 'constitution', value: -3 },
            { stat: 'strength', value: -2 },
            { stat: 'hp_drain', value: 2 },
            { stat: 'poison_resist', value: 0.05 }
        ],
        duration: 8,
        stackable: false,
        source: 'environment',
        icon: '🚰',
        curable: true
    },

    power_surge_area: {
        id: 'power_surge_area',
        name: 'Power Surge Area',
        category: 'environmental',
        description: 'Unstable power grid. Tech boosted, shock hazard.',
        effects: [
            { stat: 'tech', value: 3 },
            { stat: 'hp_drain', value: 1 },
            { stat: 'initiative', value: 2 },
            { stat: 'armor', value: -2 }
        ],
        duration: 4,
        stackable: false,
        source: 'environment',
        icon: '⚡',
        curable: true
    },

    ash_storm: {
        id: 'ash_storm',
        name: 'Ash Storm',
        category: 'environmental',
        description: 'Blinding ash storm from the wastes. Poor visibility, choking air.',
        effects: [
            { stat: 'wisdom', value: -3 },
            { stat: 'dexterity', value: -2 },
            { stat: 'stealth', value: 4 },
            { stat: 'stamina_drain', value: 2 }
        ],
        duration: 6,
        stackable: false,
        source: 'environment',
        icon: '🌪️',
        curable: true
    },

    gravity_well: {
        id: 'gravity_well',
        name: 'Gravity Well',
        category: 'environmental',
        description: 'Abnormal gravity zone. Heavier but more grounded.',
        effects: [
            { stat: 'strength', value: 2 },
            { stat: 'dexterity', value: -3 },
            { stat: 'initiative', value: -3 },
            { stat: 'armor', value: 3 }
        ],
        duration: -1,
        stackable: false,
        source: 'environment',
        icon: '🌀',
        curable: false
    },

    signal_noise: {
        id: 'signal_noise',
        name: 'Signal Noise',
        category: 'environmental',
        description: 'Heavy electronic interference. Tech scrambled, forced to think organically.',
        effects: [
            { stat: 'tech', value: -4 },
            { stat: 'wisdom', value: 2 },
            { stat: 'intelligence', value: 1 },
            { stat: 'initiative', value: -2 }
        ],
        duration: 6,
        stackable: false,
        source: 'environment',
        icon: '📶',
        curable: true
    },

    sanctified_ground: {
        id: 'sanctified_ground',
        name: 'Sanctified Ground',
        category: 'environmental',
        description: 'Circuit Saints blessed area. Tech enhanced, void damage resist.',
        effects: [
            { stat: 'tech', value: 2 },
            { stat: 'wisdom', value: 1 },
            { stat: 'strength', value: -1 },
            { stat: 'luck', value: 1 }
        ],
        duration: -1,
        stackable: false,
        source: 'environment',
        icon: '✝️',
        curable: false
    },

    flooded: {
        id: 'flooded',
        name: 'Flooded',
        category: 'environmental',
        description: 'Waist-deep water. Movement hampered, electricity dangerous.',
        effects: [
            { stat: 'dexterity', value: -3 },
            { stat: 'initiative', value: -4 },
            { stat: 'stealth', value: -3 },
            { stat: 'armor', value: 1 }
        ],
        duration: -1,
        stackable: false,
        source: 'environment',
        icon: '🌊',
        curable: false
    },

    zero_visibility: {
        id: 'zero_visibility',
        name: 'Zero Visibility',
        category: 'environmental',
        description: 'Complete darkness. Blind combat, rely on hearing.',
        effects: [
            { stat: 'wisdom', value: 3 },
            { stat: 'dexterity', value: -4 },
            { stat: 'crit_chance', value: -0.1 },
            { stat: 'stealth', value: 4 }
        ],
        duration: -1,
        stackable: false,
        source: 'environment',
        icon: '🌑',
        curable: false
    },

    // =========================================================================
    //  SOCIAL BUFFS (20+)
    // =========================================================================

    intimidated: {
        id: 'intimidated',
        name: 'Intimidated',
        category: 'social',
        description: 'Shaken by a threat. Reduced confidence but heightened caution.',
        effects: [
            { stat: 'charisma', value: -3 },
            { stat: 'strength', value: -1 },
            { stat: 'dodge_chance', value: 0.05 },
            { stat: 'initiative', value: 2 }
        ],
        duration: 6,
        stackable: false,
        source: 'event',
        icon: '😰',
        curable: true
    },

    charmed: {
        id: 'charmed',
        name: 'Charmed',
        category: 'social',
        description: 'Under someone\'s influence. Cooperative but vulnerable.',
        effects: [
            { stat: 'charisma', value: 2 },
            { stat: 'wisdom', value: -4 },
            { stat: 'dodge_chance', value: -0.05 },
            { stat: 'luck', value: 1 }
        ],
        duration: 6,
        stackable: false,
        source: 'ability',
        icon: '💕',
        curable: true
    },

    inspired: {
        id: 'inspired',
        name: 'Inspired',
        category: 'social',
        description: 'Motivated by a leader. Enhanced performance, overconfidence.',
        effects: [
            { stat: 'strength', value: 2 },
            { stat: 'charisma', value: 2 },
            { stat: 'initiative', value: 3 },
            { stat: 'wisdom', value: -2 }
        ],
        duration: 8,
        stackable: false,
        source: 'ability',
        icon: '✨',
        curable: true
    },

    faction_favor: {
        id: 'faction_favor',
        name: 'Faction Favor',
        category: 'social',
        description: 'A faction owes you. Better prices, worse standing with rivals.',
        effects: [
            { stat: 'charisma', value: 2 },
            { stat: 'luck', value: 2 },
            { stat: 'stealth', value: -2 },
            { stat: 'dodge_chance', value: -0.03 }
        ],
        duration: 12,
        stackable: false,
        source: 'event',
        icon: '🤝',
        curable: true
    },

    bounty_hunted: {
        id: 'bounty_hunted',
        name: 'Bounty Hunted',
        category: 'social',
        description: 'A price on your head. Hunted by mercenaries, survival instincts sharpen.',
        effects: [
            { stat: 'initiative', value: 3 },
            { stat: 'wisdom', value: 2 },
            { stat: 'charisma', value: -3 },
            { stat: 'stealth', value: -3 }
        ],
        duration: -1,
        stackable: false,
        source: 'event',
        icon: '🎯',
        curable: true
    },

    blacklisted: {
        id: 'blacklisted',
        name: 'Blacklisted',
        category: 'social',
        description: 'Banned from legitimate commerce. Higher black market access, no shops.',
        effects: [
            { stat: 'charisma', value: -4 },
            { stat: 'luck', value: -2 },
            { stat: 'stealth', value: 2 },
            { stat: 'dexterity', value: 1 }
        ],
        duration: -1,
        stackable: false,
        source: 'event',
        icon: '🚫',
        curable: true
    },

    respected: {
        id: 'respected',
        name: 'Respected',
        category: 'social',
        description: 'Earned community respect. Better deals, higher expectations.',
        effects: [
            { stat: 'charisma', value: 3 },
            { stat: 'wisdom', value: 1 },
            { stat: 'stealth', value: -2 },
            { stat: 'luck', value: 1 }
        ],
        duration: 12,
        stackable: false,
        source: 'event',
        icon: '🏅',
        curable: true
    },

    feared: {
        id: 'feared',
        name: 'Feared',
        category: 'social',
        description: 'People are afraid of you. Intimidation works, persuasion fails.',
        effects: [
            { stat: 'strength', value: 2 },
            { stat: 'charisma', value: -3 },
            { stat: 'wisdom', value: 1 },
            { stat: 'luck', value: -1 }
        ],
        duration: 10,
        stackable: false,
        source: 'event',
        icon: '😱',
        curable: true
    },

    indebted: {
        id: 'indebted',
        name: 'Indebted',
        category: 'social',
        description: 'You owe someone big. Protected but controlled.',
        effects: [
            { stat: 'armor', value: 3 },
            { stat: 'charisma', value: -2 },
            { stat: 'wisdom', value: -2 },
            { stat: 'luck', value: -2 }
        ],
        duration: -1,
        stackable: false,
        source: 'event',
        icon: '⛓️',
        curable: true
    },

    celebrated: {
        id: 'celebrated',
        name: 'Celebrated',
        category: 'social',
        description: 'Local hero status. Loved by many, envied by some.',
        effects: [
            { stat: 'charisma', value: 4 },
            { stat: 'luck', value: 2 },
            { stat: 'stealth', value: -4 },
            { stat: 'initiative', value: -1 }
        ],
        duration: 10,
        stackable: false,
        source: 'event',
        icon: '🎉',
        curable: true
    },

    suspicious: {
        id: 'suspicious',
        name: 'Under Suspicion',
        category: 'social',
        description: 'Authorities watching you. Paranoid but alert.',
        effects: [
            { stat: 'wisdom', value: 3 },
            { stat: 'initiative', value: 2 },
            { stat: 'charisma', value: -3 },
            { stat: 'stealth', value: -2 }
        ],
        duration: 8,
        stackable: false,
        source: 'event',
        icon: '🔍',
        curable: true
    },

    smooth_talker: {
        id: 'smooth_talker',
        name: 'Smooth Talker',
        category: 'social',
        description: 'On a social roll. Words flow but substance thins.',
        effects: [
            { stat: 'charisma', value: 4 },
            { stat: 'luck', value: 1 },
            { stat: 'intelligence', value: -2 },
            { stat: 'wisdom', value: -1 }
        ],
        duration: 5,
        stackable: false,
        source: 'ability',
        icon: '😎',
        curable: true
    },

    outcast: {
        id: 'outcast',
        name: 'Outcast',
        category: 'social',
        description: 'Shunned by society. Lonely but self-reliant.',
        effects: [
            { stat: 'charisma', value: -5 },
            { stat: 'constitution', value: 2 },
            { stat: 'wisdom', value: 2 },
            { stat: 'strength', value: 1 }
        ],
        duration: -1,
        stackable: false,
        source: 'event',
        icon: '🚷',
        curable: true
    },

    networked: {
        id: 'networked',
        name: 'Networked',
        category: 'social',
        description: 'Well-connected in the city. Information flows, attention follows.',
        effects: [
            { stat: 'charisma', value: 2 },
            { stat: 'luck', value: 3 },
            { stat: 'stealth', value: -3 },
            { stat: 'tech', value: 1 }
        ],
        duration: 10,
        stackable: false,
        source: 'event',
        icon: '🌐',
        curable: true
    },

    debt_collector: {
        id: 'debt_collector',
        name: 'Debt Collector',
        category: 'social',
        description: 'Someone wants their money. Pressured but motivated.',
        effects: [
            { stat: 'initiative', value: 2 },
            { stat: 'strength', value: 1 },
            { stat: 'luck', value: -3 },
            { stat: 'charisma', value: -2 }
        ],
        duration: -1,
        stackable: false,
        source: 'event',
        icon: '💸',
        curable: true
    },

    trusted_informant: {
        id: 'trusted_informant',
        name: 'Trusted Informant',
        category: 'social',
        description: 'Insiders share secrets with you. Knowledge is power and a burden.',
        effects: [
            { stat: 'wisdom', value: 3 },
            { stat: 'intelligence', value: 2 },
            { stat: 'charisma', value: -2 },
            { stat: 'luck', value: -1 }
        ],
        duration: 8,
        stackable: false,
        source: 'event',
        icon: '🤫',
        curable: true
    },

    rallied: {
        id: 'rallied',
        name: 'Rallied',
        category: 'social',
        description: 'Fired up by a speech. Ready for anything, maybe too ready.',
        effects: [
            { stat: 'strength', value: 2 },
            { stat: 'constitution', value: 1 },
            { stat: 'charisma', value: 1 },
            { stat: 'wisdom', value: -3 }
        ],
        duration: 6,
        stackable: false,
        source: 'ability',
        icon: '🔥',
        curable: true
    },

    shamed: {
        id: 'shamed',
        name: 'Shamed',
        category: 'social',
        description: 'Public humiliation. Weakened socially but burning to prove yourself.',
        effects: [
            { stat: 'charisma', value: -4 },
            { stat: 'strength', value: 2 },
            { stat: 'dexterity', value: 1 },
            { stat: 'wisdom', value: -1 }
        ],
        duration: 8,
        stackable: false,
        source: 'event',
        icon: '😶',
        curable: true
    },

    protected: {
        id: 'protected',
        name: 'Protected',
        category: 'social',
        description: 'Under a powerful patron\'s protection. Safe but obligated.',
        effects: [
            { stat: 'armor', value: 4 },
            { stat: 'luck', value: 2 },
            { stat: 'charisma', value: -1 },
            { stat: 'initiative', value: -2 }
        ],
        duration: 12,
        stackable: false,
        source: 'event',
        icon: '🛡️',
        curable: true
    },

    street_cred: {
        id: 'street_cred',
        name: 'Street Cred',
        category: 'social',
        description: 'Known in the underground. Respect from criminals, scrutiny from law.',
        effects: [
            { stat: 'charisma', value: 2 },
            { stat: 'stealth', value: 2 },
            { stat: 'luck', value: 1 },
            { stat: 'wisdom', value: -2 }
        ],
        duration: 10,
        stackable: false,
        source: 'event',
        icon: '💎',
        curable: true
    },

    manipulated: {
        id: 'manipulated',
        name: 'Manipulated',
        category: 'social',
        description: 'Someone is pulling your strings. Acting against your interests unknowingly.',
        effects: [
            { stat: 'wisdom', value: -4 },
            { stat: 'charisma', value: 2 },
            { stat: 'luck', value: -2 },
            { stat: 'intelligence', value: -1 }
        ],
        duration: 8,
        stackable: false,
        source: 'event',
        icon: '🎭',
        curable: true
    },

    well_fed: {
        id: 'well_fed',
        name: 'Well Fed',
        category: 'environmental',
        description: 'Properly nourished. Better stamina recovery but sluggish.',
        effects: [
            { stat: 'constitution', value: 2 },
            { stat: 'stamina_regen', value: 3 },
            { stat: 'initiative', value: -2 },
            { stat: 'dexterity', value: -1 }
        ],
        duration: 8,
        stackable: false,
        source: 'consumable',
        icon: '🍖',
        curable: true
    }
};
