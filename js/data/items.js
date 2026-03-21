/**
 * LATENCY - Items Data
 * Complete item database: weapons, armor, consumables, key items, accessories.
 * Every item has real mechanical properties used by the combat and inventory systems.
 */

window.Latency = window.Latency || {};

window.Latency.Items = {

    // =========================================================================
    //  WEAPONS - MELEE
    // =========================================================================

    rusty_knife: {
        id: 'rusty_knife',
        name: 'Rusty Knife',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d4',
        damageStat: 'strength',
        properties: ['light', 'concealable'],
        value: 10,
        weight: 1,
        description: 'A corroded blade scavenged from the gutters. Tetanus sold separately.',
        requirements: {}
    },

    baton: {
        id: 'baton',
        name: 'Shock Baton',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d6',
        damageStat: 'strength',
        properties: ['stun_chance_10'],
        value: 35,
        weight: 2,
        description: 'Standard-issue crowd-control stick. Delivers a painful jolt on contact.',
        requirements: {}
    },

    neural_blade: {
        id: 'neural_blade',
        name: 'Neural Blade',
        type: 'weapon',
        subtype: 'melee',
        damage: '2d6+3',
        damageStat: 'dexterity',
        properties: ['finesse', 'bypass_armor_25'],
        value: 450,
        weight: 2,
        description: 'Mono-molecular edge synced to neural impulses. Cuts before the target even feels it.',
        requirements: { dexterity: 14, level: 8 }
    },

    vibro_axe: {
        id: 'vibro_axe',
        name: 'Vibro-Axe',
        type: 'weapon',
        subtype: 'melee',
        damage: '2d8+2',
        damageStat: 'strength',
        properties: ['heavy', 'cleave'],
        value: 380,
        weight: 6,
        description: 'Oscillates at frequencies that shatter bone and polymer alike.',
        requirements: { strength: 16, level: 7 }
    },

    plasma_fist: {
        id: 'plasma_fist',
        name: 'Plasma Fist',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d10+4',
        damageStat: 'strength',
        properties: ['burn_1d4', 'unarmed'],
        value: 520,
        weight: 3,
        description: 'Gauntlet that superheats a plasma shell around the fist. Leaves third-degree handshakes.',
        requirements: { strength: 14, tech: 12 }
    },

    chain_whip: {
        id: 'chain_whip',
        name: 'Razor Chain Whip',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d8+1',
        damageStat: 'dexterity',
        properties: ['reach', 'finesse', 'bleed_1d3'],
        value: 210,
        weight: 3,
        description: 'Linked monomolecular segments that slice through the air with a satisfying crack.',
        requirements: { dexterity: 13 }
    },

    pipe_wrench: {
        id: 'pipe_wrench',
        name: 'Heavy Pipe Wrench',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d8',
        damageStat: 'strength',
        properties: ['heavy', 'stun_chance_15'],
        value: 15,
        weight: 5,
        description: 'Plumbing tool repurposed for skull adjustment. Surprisingly effective.',
        requirements: { strength: 12 }
    },

    mono_katana: {
        id: 'mono_katana',
        name: 'Mono-Katana',
        type: 'weapon',
        subtype: 'melee',
        damage: '2d6+5',
        damageStat: 'dexterity',
        properties: ['finesse', 'critical_19', 'bypass_armor_30'],
        value: 900,
        weight: 3,
        description: 'Hand-forged blade with a single-molecule cutting edge. A relic of disciplined violence.',
        requirements: { dexterity: 16, level: 12 }
    },

    stun_knuckles: {
        id: 'stun_knuckles',
        name: 'Stun Knuckles',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d4+2',
        damageStat: 'strength',
        properties: ['light', 'unarmed', 'stun_chance_20', 'concealable'],
        value: 75,
        weight: 1,
        description: 'Brass knuckles fitted with micro-capacitors. A handshake nobody forgets.',
        requirements: {}
    },

    thermal_machete: {
        id: 'thermal_machete',
        name: 'Thermal Machete',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d10+2',
        damageStat: 'strength',
        properties: ['burn_1d3', 'light_source'],
        value: 280,
        weight: 3,
        description: 'Heated blade that cauterizes as it cuts. The jungle was concrete all along.',
        requirements: { strength: 13, level: 5 }
    },

    // =========================================================================
    //  WEAPONS - RANGED
    // =========================================================================

    old_pistol: {
        id: 'old_pistol',
        name: 'Old Pistol',
        type: 'weapon',
        subtype: 'ranged',
        damage: '1d6+1',
        damageStat: 'dexterity',
        properties: ['light', 'concealable', 'ammo_ballistic'],
        value: 40,
        weight: 2,
        description: 'Pre-collapse sidearm. Still fires, mostly straight.',
        requirements: {}
    },

    nail_gun: {
        id: 'nail_gun',
        name: 'Industrial Nail Gun',
        type: 'weapon',
        subtype: 'ranged',
        damage: '1d8',
        damageStat: 'dexterity',
        properties: ['bleed_1d2', 'ammo_nails'],
        value: 55,
        weight: 3,
        description: 'Construction tool. Drives hardened steel nails through sheet metal and soft tissue.',
        requirements: {}
    },

    pulse_rifle: {
        id: 'pulse_rifle',
        name: 'Pulse Rifle',
        type: 'weapon',
        subtype: 'ranged',
        damage: '2d6+2',
        damageStat: 'dexterity',
        properties: ['burst_fire', 'ammo_energy'],
        value: 350,
        weight: 5,
        description: 'Military-grade energy weapon. Three-round bursts of ionized death.',
        requirements: { dexterity: 13, level: 6 }
    },

    sniper_laser: {
        id: 'sniper_laser',
        name: 'Sniper Laser',
        type: 'weapon',
        subtype: 'ranged',
        damage: '3d6+3',
        damageStat: 'dexterity',
        properties: ['scope', 'critical_18', 'ammo_energy', 'slow'],
        value: 700,
        weight: 7,
        description: 'Long-range coherent light weapon. One shot, one cauterized hole.',
        requirements: { dexterity: 16, level: 10 }
    },

    sawed_off_shotgun: {
        id: 'sawed_off_shotgun',
        name: 'Sawed-Off Shotgun',
        type: 'weapon',
        subtype: 'ranged',
        damage: '2d8',
        damageStat: 'dexterity',
        properties: ['spread', 'close_range', 'ammo_ballistic', 'concealable'],
        value: 120,
        weight: 4,
        description: 'Truncated scattergun. Effective at conversational distance.',
        requirements: { strength: 11 }
    },

    smg_rattler: {
        id: 'smg_rattler',
        name: 'Rattler SMG',
        type: 'weapon',
        subtype: 'ranged',
        damage: '1d6+2',
        damageStat: 'dexterity',
        properties: ['burst_fire', 'light', 'ammo_ballistic'],
        value: 180,
        weight: 3,
        description: 'Cheap submachine gun favored by gangs. Sprays more than it aims.',
        requirements: { dexterity: 12, level: 3 }
    },

    plasma_caster: {
        id: 'plasma_caster',
        name: 'Plasma Caster',
        type: 'weapon',
        subtype: 'ranged',
        damage: '3d8+4',
        damageStat: 'tech',
        properties: ['heavy', 'burn_1d6', 'ammo_plasma', 'slow', 'area_effect'],
        value: 1200,
        weight: 9,
        description: 'Shoulder-mounted plasma projector. Melts everything in a five-meter radius.',
        requirements: { tech: 16, strength: 14, level: 14 }
    },

    hand_crossbow: {
        id: 'hand_crossbow',
        name: 'Compound Hand Crossbow',
        type: 'weapon',
        subtype: 'ranged',
        damage: '1d8+1',
        damageStat: 'dexterity',
        properties: ['silent', 'concealable', 'ammo_bolts'],
        value: 95,
        weight: 2,
        description: 'Silent killer. Popular with assassins who appreciate the classics.',
        requirements: { dexterity: 12 }
    },

    gauss_pistol: {
        id: 'gauss_pistol',
        name: 'Gauss Pistol',
        type: 'weapon',
        subtype: 'ranged',
        damage: '2d6+4',
        damageStat: 'dexterity',
        properties: ['bypass_armor_20', 'ammo_ferromagnetic', 'concealable'],
        value: 580,
        weight: 2,
        description: 'Magnetically accelerated flechettes. Ignores most conventional armor.',
        requirements: { dexterity: 14, tech: 12, level: 9 }
    },

    arc_thrower: {
        id: 'arc_thrower',
        name: 'Arc Thrower',
        type: 'weapon',
        subtype: 'ranged',
        damage: '2d6+1',
        damageStat: 'tech',
        properties: ['chain_lightning', 'stun_chance_15', 'ammo_energy'],
        value: 420,
        weight: 4,
        description: 'Hurls arcing bolts of electricity that jump between targets. Smells like ozone and regret.',
        requirements: { tech: 14, level: 7 }
    },

    // =========================================================================
    //  WEAPONS - TECH
    // =========================================================================

    hacking_spike: {
        id: 'hacking_spike',
        name: 'Hacking Spike',
        type: 'weapon',
        subtype: 'tech',
        damage: '1d6',
        damageStat: 'tech',
        properties: ['bypass_shield', 'anti_synth'],
        value: 120,
        weight: 1,
        description: 'Hardwired intrusion tool. Jams into a port and rewrites firmware on contact.',
        requirements: { tech: 12 }
    },

    emp_grenade: {
        id: 'emp_grenade',
        name: 'EMP Grenade',
        type: 'weapon',
        subtype: 'tech',
        damage: '2d8',
        damageStat: 'tech',
        properties: ['area_effect', 'anti_synth', 'disable_electronics', 'consumable_weapon'],
        value: 80,
        weight: 1,
        description: 'Electromagnetic pulse in a can. Fries circuits in a ten-meter blast.',
        requirements: { tech: 10 }
    },

    drone_controller: {
        id: 'drone_controller',
        name: 'Drone Controller',
        type: 'weapon',
        subtype: 'tech',
        damage: '1d8+2',
        damageStat: 'tech',
        properties: ['remote', 'sustained', 'requires_drone'],
        value: 300,
        weight: 2,
        description: 'Neural-linked controller for combat drones. Fight from a safe distance.',
        requirements: { tech: 14, level: 5 }
    },

    virus_injector: {
        id: 'virus_injector',
        name: 'Virus Injector',
        type: 'weapon',
        subtype: 'tech',
        damage: '1d4',
        damageStat: 'tech',
        properties: ['dot_2d4_3turns', 'bypass_armor_50', 'anti_synth'],
        value: 250,
        weight: 1,
        description: 'Deploys corrosive malware through physical contact. Turns machines against themselves.',
        requirements: { tech: 13, level: 6 }
    },

    neural_disruptor: {
        id: 'neural_disruptor',
        name: 'Neural Disruptor',
        type: 'weapon',
        subtype: 'tech',
        damage: '2d6+3',
        damageStat: 'tech',
        properties: ['confuse_chance_20', 'bypass_armor_15'],
        value: 480,
        weight: 2,
        description: 'Scrambles neural pathways with targeted electromagnetic bursts. Causes seizures in the stacked.',
        requirements: { tech: 15, level: 9 }
    },

    smart_turret: {
        id: 'smart_turret',
        name: 'Deployable Smart Turret',
        type: 'weapon',
        subtype: 'tech',
        damage: '1d10+3',
        damageStat: 'tech',
        properties: ['deployable', 'auto_target', 'ammo_energy', 'duration_5_turns'],
        value: 650,
        weight: 8,
        description: 'Portable automated turret. Set it and forget it while it handles the killing.',
        requirements: { tech: 16, level: 11 }
    },

    sonic_emitter: {
        id: 'sonic_emitter',
        name: 'Sonic Emitter',
        type: 'weapon',
        subtype: 'tech',
        damage: '1d8+1',
        damageStat: 'tech',
        properties: ['area_effect', 'stun_chance_25', 'bypass_armor_100'],
        value: 350,
        weight: 3,
        description: 'Focused sound weapon. Liquefies organs without leaving a mark on the skin.',
        requirements: { tech: 14, level: 7 }
    },

    // =========================================================================
    //  ARMOR
    // =========================================================================

    scrap_vest: {
        id: 'scrap_vest',
        name: 'Scrap Vest',
        type: 'armor',
        armorBonus: 1,
        properties: [],
        value: 15,
        weight: 4,
        description: 'Sheet metal and prayer. Better than nothing, barely.',
        requirements: {}
    },

    leather_jacket: {
        id: 'leather_jacket',
        name: 'Reinforced Leather Jacket',
        type: 'armor',
        armorBonus: 2,
        properties: ['concealable'],
        value: 45,
        weight: 3,
        description: 'Classic street protection. Looks good catching bullets.',
        requirements: {}
    },

    riot_gear: {
        id: 'riot_gear',
        name: 'Riot Gear',
        type: 'armor',
        armorBonus: 4,
        properties: ['stun_resist_50'],
        value: 200,
        weight: 8,
        description: 'Salvaged police equipment. Still has crowd-control gas stains.',
        requirements: { strength: 12, level: 4 }
    },

    synth_weave: {
        id: 'synth_weave',
        name: 'Synth-Weave Suit',
        type: 'armor',
        armorBonus: 3,
        properties: ['lightweight', 'concealable', 'energy_resist_15'],
        value: 350,
        weight: 2,
        description: 'Synthetic fiber suit that hardens on impact. Business casual for a warzone.',
        requirements: { level: 6 }
    },

    nano_mesh: {
        id: 'nano_mesh',
        name: 'Nano-Mesh Armor',
        type: 'armor',
        armorBonus: 5,
        properties: ['self_repair_1', 'lightweight', 'energy_resist_20'],
        value: 800,
        weight: 3,
        description: 'Nanite-infused mesh that repairs itself between engagements. Bleeding-edge military tech.',
        requirements: { tech: 14, level: 10 }
    },

    kevlar_trench: {
        id: 'kevlar_trench',
        name: 'Kevlar Trench Coat',
        type: 'armor',
        armorBonus: 3,
        properties: ['concealable', 'ballistic_resist_20'],
        value: 180,
        weight: 4,
        description: 'Armored longcoat. Intimidating and practical in equal measure.',
        requirements: { level: 3 }
    },

    exo_frame: {
        id: 'exo_frame',
        name: 'Exo-Frame',
        type: 'armor',
        armorBonus: 6,
        properties: ['strength_plus_2', 'heavy', 'powered'],
        value: 1100,
        weight: 15,
        description: 'Powered exoskeleton frame. Makes you stronger, slower, and significantly harder to kill.',
        requirements: { strength: 14, tech: 13, level: 12 }
    },

    ghost_shroud: {
        id: 'ghost_shroud',
        name: 'Ghost Shroud',
        type: 'armor',
        armorBonus: 2,
        properties: ['stealth_plus_3', 'dodge_plus_10', 'lightweight'],
        value: 600,
        weight: 1,
        description: 'Light-bending fabric favored by infiltrators. You are barely there.',
        requirements: { dexterity: 14, level: 8 }
    },

    iron_collective_plate: {
        id: 'iron_collective_plate',
        name: 'Iron Collective Plate',
        type: 'armor',
        armorBonus: 5,
        properties: ['faction_iron', 'fire_resist_25', 'heavy'],
        value: 500,
        weight: 12,
        description: 'Factory-forged plate armor stamped with the Iron Collective emblem. Built to last.',
        requirements: { strength: 15, level: 8 }
    },

    neon_court_regalia: {
        id: 'neon_court_regalia',
        name: 'Neon Court Regalia',
        type: 'armor',
        armorBonus: 4,
        properties: ['faction_neon', 'charisma_plus_2', 'energy_resist_15'],
        value: 700,
        weight: 3,
        description: 'Luminescent formal armor. Protects the body while dazzling the eyes.',
        requirements: { charisma: 13, level: 9 }
    },

    hazmat_suit: {
        id: 'hazmat_suit',
        name: 'Hazmat Suit',
        type: 'armor',
        armorBonus: 2,
        properties: ['poison_immune', 'radiation_resist_50'],
        value: 160,
        weight: 5,
        description: 'Chemical protection suit. Essential for the Undercity toxic zones.',
        requirements: {}
    },

    combat_harness: {
        id: 'combat_harness',
        name: 'Combat Harness',
        type: 'armor',
        armorBonus: 3,
        properties: ['extra_weapon_slot', 'quick_draw'],
        value: 250,
        weight: 4,
        description: 'Tactical webbing with integrated holsters. Carry more, draw faster.',
        requirements: { dexterity: 12, level: 5 }
    },

    // =========================================================================
    //  CONSUMABLES - HEALING
    // =========================================================================

    med_patch: {
        id: 'med_patch',
        name: 'Med-Patch',
        type: 'consumable',
        effect: { type: 'heal', value: 15 },
        value: 10,
        weight: 0,
        description: 'Adhesive patch loaded with coagulants and painkillers. Slap it on and keep moving.'
    },

    stim_shot: {
        id: 'stim_shot',
        name: 'Stim Shot',
        type: 'consumable',
        effect: { type: 'heal', value: 30 },
        value: 25,
        weight: 0,
        description: 'Auto-injector filled with medical nanites. Stings like hell, works fast.'
    },

    nano_heal: {
        id: 'nano_heal',
        name: 'Nano-Heal Canister',
        type: 'consumable',
        effect: { type: 'heal', value: 60 },
        value: 75,
        weight: 1,
        description: 'Aerosolized healing nanites. Breathe deep and let the machines fix you.'
    },

    full_restore: {
        id: 'full_restore',
        name: 'Full Restore',
        type: 'consumable',
        effect: { type: 'heal', value: 9999 },
        value: 200,
        weight: 1,
        description: 'Military-grade trauma kit. Brings you back from the edge in seconds.'
    },

    synth_blood: {
        id: 'synth_blood',
        name: 'Synth-Blood Pack',
        type: 'consumable',
        effect: { type: 'heal', value: 45 },
        value: 50,
        weight: 1,
        description: 'Synthetic blood transfusion. Compatible with all types, including the not-quite-human ones.'
    },

    field_surgery_kit: {
        id: 'field_surgery_kit',
        name: 'Field Surgery Kit',
        type: 'consumable',
        effect: { type: 'heal_over_time', value: 10, duration: 5 },
        value: 60,
        weight: 2,
        description: 'Portable surgical tools and sutures. Proper healing for those with patience.'
    },

    // =========================================================================
    //  CONSUMABLES - BUFFS
    // =========================================================================

    adrenaline_shot: {
        id: 'adrenaline_shot',
        name: 'Adrenaline Shot',
        type: 'consumable',
        effect: { type: 'buff', stat: 'strength', value: 4, duration: 5 },
        value: 40,
        weight: 0,
        description: 'Synthetic adrenaline. Temporary superhuman strength with a nasty crash.'
    },

    focus_stim: {
        id: 'focus_stim',
        name: 'Focus Stim',
        type: 'consumable',
        effect: { type: 'buff', stat: 'intelligence', value: 4, duration: 5 },
        value: 40,
        weight: 0,
        description: 'Neural accelerant. Everything slows down while your mind speeds up.'
    },

    ghost_serum: {
        id: 'ghost_serum',
        name: 'Ghost Serum',
        type: 'consumable',
        effect: { type: 'buff', stat: 'dexterity', value: 4, duration: 5 },
        value: 40,
        weight: 0,
        description: 'Reflex enhancer. Move like smoke, strike like lightning.'
    },

    iron_skin_injection: {
        id: 'iron_skin_injection',
        name: 'Iron Skin Injection',
        type: 'consumable',
        effect: { type: 'buff', stat: 'constitution', value: 4, duration: 5 },
        value: 40,
        weight: 0,
        description: 'Subdermal hardening agent. Your skin turns the color of bruises and the consistency of leather.'
    },

    silver_tongue_drops: {
        id: 'silver_tongue_drops',
        name: 'Silver Tongue Drops',
        type: 'consumable',
        effect: { type: 'buff', stat: 'charisma', value: 4, duration: 5 },
        value: 40,
        weight: 0,
        description: 'Pheromone-laced sublingual drops. Everyone suddenly finds you very persuasive.'
    },

    tech_boost_patch: {
        id: 'tech_boost_patch',
        name: 'Tech Boost Patch',
        type: 'consumable',
        effect: { type: 'buff', stat: 'tech', value: 4, duration: 5 },
        value: 40,
        weight: 0,
        description: 'Neural bridge amplifier. Machines whisper their secrets to you.'
    },

    liquid_luck: {
        id: 'liquid_luck',
        name: 'Liquid Luck',
        type: 'consumable',
        effect: { type: 'buff', stat: 'luck', value: 5, duration: 10 },
        value: 100,
        weight: 0,
        description: 'Nobody knows what is actually in this. But everything just seems to go your way after a sip.'
    },

    combat_stim: {
        id: 'combat_stim',
        name: 'Combat Stim',
        type: 'consumable',
        effect: { type: 'buff_multi', stats: ['strength', 'dexterity'], value: 2, duration: 3 },
        value: 65,
        weight: 0,
        description: 'Military cocktail. Short burst of peak combat performance. Addictive.'
    },

    overclock_injection: {
        id: 'overclock_injection',
        name: 'Overclock Injection',
        type: 'consumable',
        effect: { type: 'buff_multi', stats: ['tech', 'intelligence'], value: 3, duration: 3 },
        value: 80,
        weight: 0,
        description: 'Pushes cybernetic implants past safety limits. Effective but risky.'
    },

    berserker_compound: {
        id: 'berserker_compound',
        name: 'Berserker Compound',
        type: 'consumable',
        effect: { type: 'buff_complex', buffs: [{ stat: 'strength', value: 6 }, { stat: 'constitution', value: 4 }, { stat: 'intelligence', value: -3 }], duration: 4 },
        value: 55,
        weight: 0,
        description: 'Rage-inducing chemical. You become a living weapon but forget how to count.'
    },

    // =========================================================================
    //  CONSUMABLES - CURES / UTILITY
    // =========================================================================

    antidote: {
        id: 'antidote',
        name: 'Universal Antidote',
        type: 'consumable',
        effect: { type: 'cure', condition: 'poison' },
        value: 20,
        weight: 0,
        description: 'Broad-spectrum anti-toxin. Neutralizes most known poisons and venoms.'
    },

    stack_purge: {
        id: 'stack_purge',
        name: 'Stack Purge',
        type: 'consumable',
        effect: { type: 'cure', condition: 'stack_corruption' },
        value: 50,
        weight: 0,
        description: 'Emergency stack defragmentation tool. Clears corrupted memory patterns.'
    },

    neural_reset: {
        id: 'neural_reset',
        name: 'Neural Reset',
        type: 'consumable',
        effect: { type: 'cure', condition: 'all_debuffs' },
        value: 80,
        weight: 0,
        description: 'Hard reboot for the nervous system. Clears all negative conditions. Feels like dying briefly.'
    },

    rad_flush: {
        id: 'rad_flush',
        name: 'Rad-Flush',
        type: 'consumable',
        effect: { type: 'cure', condition: 'radiation' },
        value: 30,
        weight: 0,
        description: 'Chelation therapy in a bottle. Strips radiation from the bloodstream.'
    },

    system_reboot: {
        id: 'system_reboot',
        name: 'System Reboot Chip',
        type: 'consumable',
        effect: { type: 'cure', condition: 'hacked' },
        value: 45,
        weight: 0,
        description: 'Emergency firmware restore. Kicks out any unauthorized code running in your implants.'
    },

    clarity_tab: {
        id: 'clarity_tab',
        name: 'Clarity Tab',
        type: 'consumable',
        effect: { type: 'cure', condition: 'confusion' },
        value: 15,
        weight: 0,
        description: 'Dissolvable cognitive stabilizer. The world snaps back into focus.'
    },

    // =========================================================================
    //  KEY ITEMS
    // =========================================================================

    data_chip: {
        id: 'data_chip',
        name: 'Encrypted Data Chip',
        type: 'key_item',
        description: 'A heavily encrypted data chip. Someone went to great lengths to protect whatever is on this.',
        questRelated: true
    },

    mako_keycard: {
        id: 'mako_keycard',
        name: 'Mako Systems Keycard',
        type: 'key_item',
        description: 'Corporate access card for Mako Systems facilities. Clearance level: Restricted.',
        questRelated: true
    },

    ghost_network_token: {
        id: 'ghost_network_token',
        name: 'Ghost Network Token',
        type: 'key_item',
        description: 'Physical authentication token for the Ghost Network. Untraceable by design.',
        questRelated: true
    },

    stack_fragment: {
        id: 'stack_fragment',
        name: 'Corrupted Stack Fragment',
        type: 'key_item',
        description: 'A piece of a damaged cortical stack. Faint memories flicker across its surface when touched.',
        questRelated: true
    },

    faction_badge_iron: {
        id: 'faction_badge_iron',
        name: 'Iron Collective Badge',
        type: 'key_item',
        description: 'Hammered steel badge of the Iron Collective. Worn openly as a statement of solidarity.',
        questRelated: true
    },

    faction_badge_neon: {
        id: 'faction_badge_neon',
        name: 'Neon Court Invitation',
        type: 'key_item',
        description: 'Holographic invitation card to the Neon Court. It shifts colors when tilted.',
        questRelated: true
    },

    faction_badge_circuit: {
        id: 'faction_badge_circuit',
        name: 'Circuit Saints Sigil',
        type: 'key_item',
        description: 'A small circuit board arranged in a sacred geometric pattern. Hums with faint electricity.',
        questRelated: true
    },

    faction_badge_ashen: {
        id: 'faction_badge_ashen',
        name: 'Ashen Circle Mask',
        type: 'key_item',
        description: 'Featureless grey mask worn by Ashen Circle initiates. Erases identity by design.',
        questRelated: true
    },

    faction_badge_ghost: {
        id: 'faction_badge_ghost',
        name: 'Ghost Syndicate Coin',
        type: 'key_item',
        description: 'Blank coin that reveals hidden markings under UV light. Currency of trust in the underworld.',
        questRelated: true
    },

    old_world_photograph: {
        id: 'old_world_photograph',
        name: 'Faded Photograph',
        type: 'key_item',
        description: 'A photograph from before the collapse. Two people smiling in front of a blue sky. Nobody smiles like that anymore.',
        questRelated: true
    },

    void_resonator: {
        id: 'void_resonator',
        name: 'Void Resonator',
        type: 'key_item',
        description: 'A device that vibrates at frequencies that should not exist. It pulls at something behind reality.',
        questRelated: true
    },

    brokers_ledger: {
        id: 'brokers_ledger',
        name: "The Broker's Ledger",
        type: 'key_item',
        description: 'Encrypted record of every deal the Broker has ever made. Worth killing for. Worth dying for.',
        questRelated: true
    },

    founders_key: {
        id: 'founders_key',
        name: "Founder's Key",
        type: 'key_item',
        description: 'Biometric key from one of the original city founders. Opens doors that should stay closed.',
        questRelated: true
    },

    cortical_backup: {
        id: 'cortical_backup',
        name: 'Cortical Backup Drive',
        type: 'key_item',
        description: 'Emergency stack backup. Contains a complete personality snapshot. Whose personality is unclear.',
        questRelated: true
    },

    undercity_map: {
        id: 'undercity_map',
        name: 'Undercity Tunnel Map',
        type: 'key_item',
        description: 'Hand-drawn map of the tunnel networks beneath the city. Marked with warnings in red ink.',
        questRelated: true
    },

    ai_core_shard: {
        id: 'ai_core_shard',
        name: 'AI Core Shard',
        type: 'key_item',
        description: 'Fragment of a pre-collapse artificial intelligence. It still thinks, in its broken way.',
        questRelated: true
    },

    black_market_pass: {
        id: 'black_market_pass',
        name: 'Black Market Pass',
        type: 'key_item',
        description: 'Holographic pass that grants entry to the underground markets. Changes location nightly.',
        questRelated: true
    },

    // =========================================================================
    //  ACCESSORIES
    // =========================================================================

    signal_jammer: {
        id: 'signal_jammer',
        name: 'Signal Jammer',
        type: 'accessory',
        effects: [{ stat: 'stealth', value: 3 }, { stat: 'hack_resist', value: 20 }],
        value: 150,
        description: 'Portable signal scrambler. Makes you invisible to electronic surveillance.',
        requirements: { tech: 10 }
    },

    luck_charm: {
        id: 'luck_charm',
        name: 'Worn Lucky Charm',
        type: 'accessory',
        effects: [{ stat: 'luck', value: 3 }],
        value: 80,
        description: 'A battered trinket of uncertain origin. Statistically improbable, but it works.',
        requirements: {}
    },

    reflex_booster: {
        id: 'reflex_booster',
        name: 'Reflex Booster',
        type: 'accessory',
        effects: [{ stat: 'dexterity', value: 2 }, { stat: 'initiative', value: 3 }],
        value: 280,
        description: 'Spinal implant that accelerates nerve signals. React before you think.',
        requirements: { level: 5 }
    },

    thermal_visor: {
        id: 'thermal_visor',
        name: 'Thermal Visor',
        type: 'accessory',
        effects: [{ stat: 'wisdom', value: 4 }, { stat: 'accuracy', value: 5 }],
        value: 200,
        description: 'Heat-signature overlay visor. Nobody hides from you in the dark.',
        requirements: { tech: 11 }
    },

    dermal_plating: {
        id: 'dermal_plating',
        name: 'Dermal Plating',
        type: 'accessory',
        effects: [{ stat: 'armor', value: 2 }, { stat: 'charisma', value: -1 }],
        value: 350,
        description: 'Subdermal ceramic plates. You look less human but you stop more bullets.',
        requirements: { constitution: 12, level: 6 }
    },

    neural_co_processor: {
        id: 'neural_co_processor',
        name: 'Neural Co-Processor',
        type: 'accessory',
        effects: [{ stat: 'intelligence', value: 2 }, { stat: 'tech', value: 2 }],
        value: 400,
        description: 'Secondary brain implant that handles parallel processing. Think two thoughts at once.',
        requirements: { intelligence: 13, level: 7 }
    },

    adrenaline_regulator: {
        id: 'adrenaline_regulator',
        name: 'Adrenaline Regulator',
        type: 'accessory',
        effects: [{ stat: 'constitution', value: 2 }, { stat: 'fear_immune', value: 1 }],
        value: 220,
        description: 'Adrenal gland implant that controls fight-or-flight response. Fear becomes optional.',
        requirements: { level: 4 }
    },

    voice_modulator: {
        id: 'voice_modulator',
        name: 'Voice Modulator',
        type: 'accessory',
        effects: [{ stat: 'charisma', value: 3 }, { stat: 'intimidation', value: 2 }],
        value: 180,
        description: 'Throat implant that optimizes vocal tone for persuasion. Or terror. Your choice.',
        requirements: {}
    },

    mag_boots: {
        id: 'mag_boots',
        name: 'Mag-Lock Boots',
        type: 'accessory',
        effects: [{ stat: 'knockback_resist', value: 100 }, { stat: 'movement_penalty', value: -1 }],
        value: 140,
        description: 'Magnetic boots that lock to any metal surface. Immovable, but slow.',
        requirements: {}
    },

    cloaking_module: {
        id: 'cloaking_module',
        name: 'Cloaking Module',
        type: 'accessory',
        effects: [{ stat: 'stealth', value: 5 }, { stat: 'first_strike', value: 1 }],
        value: 500,
        description: 'Light-bending field generator. Three seconds of near-total invisibility per activation.',
        requirements: { tech: 14, dexterity: 13, level: 9 }
    },

    trauma_dampener: {
        id: 'trauma_dampener',
        name: 'Trauma Dampener',
        type: 'accessory',
        effects: [{ stat: 'max_hp', value: 15 }, { stat: 'pain_resist', value: 20 }],
        value: 300,
        description: 'Neural pain gate. You still take damage, you just stop caring about it.',
        requirements: { constitution: 12, level: 5 }
    },

    targeting_eye: {
        id: 'targeting_eye',
        name: 'Targeting Eye',
        type: 'accessory',
        effects: [{ stat: 'accuracy', value: 10 }, { stat: 'crit_chance', value: 5 }],
        value: 420,
        description: 'Cybernetic eye replacement with ballistic trajectory calculation. You see the kill before you make it.',
        requirements: { tech: 12, level: 7 }
    },

    data_leech: {
        id: 'data_leech',
        name: 'Data Leech',
        type: 'accessory',
        effects: [{ stat: 'hacking', value: 4 }, { stat: 'credits_bonus', value: 10 }],
        value: 260,
        description: 'Passive data siphon that skims loose credits and information from nearby networks.',
        requirements: { tech: 13 }
    },

    biomonitor: {
        id: 'biomonitor',
        name: 'Biomonitor Implant',
        type: 'accessory',
        effects: [{ stat: 'hp_regen', value: 2 }, { stat: 'poison_resist', value: 30 }],
        value: 320,
        description: 'Internal health monitoring system with automated micro-dosing. Keeps you alive despite yourself.',
        requirements: { tech: 11, level: 6 }
    },

    power_cell_belt: {
        id: 'power_cell_belt',
        name: 'Power Cell Belt',
        type: 'accessory',
        effects: [{ stat: 'tech_damage', value: 15 }, { stat: 'energy_capacity', value: 20 }],
        value: 190,
        description: 'Belt-mounted power cells that feed tech weapons. More juice, more destruction.',
        requirements: { tech: 12 }
    },

    // =========================================================================
    //  MISC / TRADE GOODS
    // =========================================================================

    scrap_metal: {
        id: 'scrap_metal',
        name: 'Scrap Metal',
        type: 'misc',
        value: 3,
        weight: 2,
        description: 'Bent and corroded metal scraps. Worth a few credits to the right buyer.'
    },

    circuit_board: {
        id: 'circuit_board',
        name: 'Salvaged Circuit Board',
        type: 'misc',
        value: 8,
        weight: 0,
        description: 'Partially functional circuit board. Components can be stripped for parts.'
    },

    synth_fiber: {
        id: 'synth_fiber',
        name: 'Synth-Fiber Bundle',
        type: 'misc',
        value: 12,
        weight: 1,
        description: 'Synthetic fibers used in armor and clothing repair. Always in demand.'
    },

    nano_paste: {
        id: 'nano_paste',
        name: 'Nano-Paste Tube',
        type: 'misc',
        value: 20,
        weight: 0,
        description: 'Programmable nanite paste. Used for repairs, medicine, and things best not discussed.'
    },

    contraband_chips: {
        id: 'contraband_chips',
        name: 'Contraband Memory Chips',
        type: 'misc',
        value: 50,
        weight: 0,
        description: 'Black market memory chips loaded with illicit data. High value, high risk.'
    },

    // =========================================================================
    //  STARTING ITEMS - HUMAN BACKSTORIES
    // =========================================================================

    lockpick_set: {
        id: 'lockpick_set',
        name: 'Lockpick Set',
        type: 'key_item',
        value: 25,
        weight: 0,
        description: 'A worn leather roll containing tension wrenches and picks of various gauges. Opens doors that were meant to stay closed.',
        questRelated: false
    },

    military_rations: {
        id: 'military_rations',
        name: 'Military Rations',
        type: 'consumable',
        effect: { type: 'heal', value: 10 },
        value: 8,
        weight: 1,
        description: 'Vacuum-sealed corporate military food. Tastes like cardboard soaked in preservatives, but it keeps you moving.'
    },

    syringe: {
        id: 'syringe',
        name: 'Experimental Syringe',
        type: 'consumable',
        effect: { type: 'heal', value: 20 },
        value: 15,
        weight: 0,
        description: 'A pre-filled syringe of unknown Koronis compounds. The liquid shimmers with an oily iridescence.'
    },

    medical_scanner: {
        id: 'medical_scanner',
        name: 'Medical Scanner',
        type: 'accessory',
        effects: [{ stat: 'perception', value: 2 }, { stat: 'hp_regen', value: 1 }],
        value: 40,
        weight: 1,
        description: 'Handheld biometric scanner stolen from a Koronis lab. Reads vitals, detects toxins, and identifies wounds.',
        requirements: {}
    },

    worn_coveralls: {
        id: 'worn_coveralls',
        name: 'Worn Coveralls',
        type: 'armor',
        armorBonus: 1,
        properties: ['concealable'],
        value: 5,
        weight: 2,
        description: 'Faded grey coveralls stamped with a Meridian Financial processing plant logo. The fabric is thin but it covers the basics.',
        requirements: {}
    },

    forged_id: {
        id: 'forged_id',
        name: 'Forged ID',
        type: 'key_item',
        value: 30,
        weight: 0,
        description: 'A convincing fake identity card with a name that is not yours. Good enough to pass a casual scan.',
        questRelated: false
    },

    // =========================================================================
    //  STARTING ITEMS - ORC BACKSTORIES
    // =========================================================================

    spiked_knuckles: {
        id: 'spiked_knuckles',
        name: 'Spiked Knuckles',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d4+1',
        damageStat: 'strength',
        properties: ['light', 'unarmed', 'bleed_1d2'],
        value: 20,
        weight: 1,
        description: 'Brass knuckles fitted with crude steel spikes. Every punch leaves a hole.',
        requirements: {}
    },

    pit_fighter_wraps: {
        id: 'pit_fighter_wraps',
        name: 'Pit Fighter Wraps',
        type: 'armor',
        armorBonus: 1,
        properties: ['lightweight'],
        value: 10,
        weight: 1,
        description: 'Bloodstained cloth wraps wound tight around the forearms and knuckles. They offer minimal protection but mark you as arena-tested.',
        requirements: {}
    },

    slag_hammer: {
        id: 'slag_hammer',
        name: 'Slag Hammer',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d8',
        damageStat: 'strength',
        properties: ['heavy', 'stun_chance_10'],
        value: 25,
        weight: 6,
        description: 'A foundry sledgehammer caked in hardened slag. Designed for breaking metal, equally effective on bone.',
        requirements: { strength: 12 }
    },

    heat_resistant_gloves: {
        id: 'heat_resistant_gloves',
        name: 'Heat-Resistant Gloves',
        type: 'accessory',
        effects: [{ stat: 'fire_resist', value: 20 }],
        value: 15,
        weight: 1,
        description: 'Industrial gloves rated for foundry work. The palms are scorched but still functional.',
        requirements: {}
    },

    clan_brand: {
        id: 'clan_brand',
        name: 'Clan Brand',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A ceremonial branding iron bearing your former clan sigil. The matching scar on your shoulder marks you as exiled.',
        questRelated: false
    },

    bone_trophy: {
        id: 'bone_trophy',
        name: 'Bone Trophy',
        type: 'accessory',
        effects: [{ stat: 'intimidation', value: 2 }],
        value: 5,
        weight: 1,
        description: 'A polished femur bone from a defeated rival, worn on a cord around the neck. A warning to anyone who thinks you are easy prey.',
        requirements: {}
    },

    // =========================================================================
    //  STARTING ITEMS - WOOD ELF BACKSTORIES
    // =========================================================================

    thorn_bow: {
        id: 'thorn_bow',
        name: 'Thorn Bow',
        type: 'weapon',
        subtype: 'ranged',
        damage: '1d6',
        damageStat: 'dexterity',
        properties: ['silent', 'ammo_arrows'],
        value: 30,
        weight: 2,
        description: 'A recurve bow crafted from mutant thornwood. The limbs flex with unnatural resilience and the string hums with tension.',
        requirements: {}
    },

    herbal_poultice: {
        id: 'herbal_poultice',
        name: 'Herbal Poultice',
        type: 'consumable',
        effect: { type: 'heal_over_time', value: 5, duration: 4 },
        value: 10,
        weight: 0,
        description: 'A compress of crushed medicinal herbs bound in moss. Slow healing, but it uses no technology.'
    },

    herb_satchel: {
        id: 'herb_satchel',
        name: 'Herb Satchel',
        type: 'key_item',
        value: 20,
        weight: 1,
        description: 'A leather satchel stuffed with dried medicinal plants from the green zones. The contents can cure most common ailments.',
        questRelated: false
    },

    mortar_and_pestle: {
        id: 'mortar_and_pestle',
        name: 'Mortar and Pestle',
        type: 'key_item',
        value: 10,
        weight: 2,
        description: 'A stone mortar and pestle worn smooth by years of grinding herbs into salves and tinctures. Essential for any herbalist.',
        questRelated: false
    },

    climbing_gear: {
        id: 'climbing_gear',
        name: 'Climbing Gear',
        type: 'accessory',
        effects: [{ stat: 'dexterity', value: 1 }],
        value: 30,
        weight: 2,
        description: 'Ropes, carabiners, and grappling hooks cobbled together from salvage. Gets you where the streets cannot.',
        requirements: {}
    },

    camouflage_cloak: {
        id: 'camouflage_cloak',
        name: 'Camouflage Cloak',
        type: 'armor',
        armorBonus: 1,
        properties: ['stealth_plus_2', 'lightweight'],
        value: 35,
        weight: 1,
        description: 'A cloak woven from synthetic fibers that shift color to match surroundings. Not true invisibility, but close enough in dim light.',
        requirements: {}
    },

    beast_whistle: {
        id: 'beast_whistle',
        name: 'Beast Whistle',
        type: 'key_item',
        value: 15,
        weight: 0,
        description: 'A bone whistle carved to emit frequencies only mutant beasts can hear. It vibrates faintly even when not blown.',
        questRelated: false
    },

    tracking_salve: {
        id: 'tracking_salve',
        name: 'Tracking Salve',
        type: 'consumable',
        effect: { type: 'buff', stat: 'perception', value: 3, duration: 10 },
        value: 12,
        weight: 0,
        description: 'A pungent paste rubbed under the nostrils to heighten scent tracking. Burns like fire but you can smell a trail hours old.'
    },

    // =========================================================================
    //  STARTING ITEMS - DARK ELF BACKSTORIES
    // =========================================================================

    stiletto: {
        id: 'stiletto',
        name: 'Stiletto',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d4+1',
        damageStat: 'dexterity',
        properties: ['finesse', 'concealable', 'critical_19'],
        value: 45,
        weight: 1,
        description: 'A slender thrusting blade favored by dark elf nobility. Designed for precision kills in tight spaces.',
        requirements: {}
    },

    house_signet_ring: {
        id: 'house_signet_ring',
        name: 'House Signet Ring',
        type: 'accessory',
        effects: [{ stat: 'charisma', value: 1 }, { stat: 'intimidation', value: 1 }],
        value: 50,
        weight: 0,
        description: 'An obsidian ring engraved with the crest of House Vethrin. Opens doors in the undercity and closes them behind you.',
        requirements: {}
    },

    encrypted_datapad: {
        id: 'encrypted_datapad',
        name: 'Encrypted Datapad',
        type: 'key_item',
        value: 40,
        weight: 1,
        description: 'A heavily encrypted datapad containing fragments of compromising information. The encryption is military-grade.',
        questRelated: false
    },

    listening_device: {
        id: 'listening_device',
        name: 'Listening Device',
        type: 'accessory',
        effects: [{ stat: 'perception', value: 2 }],
        value: 35,
        weight: 0,
        description: 'A tiny directional microphone disguised as a coat button. Picks up whispered conversations from across a room.',
        requirements: {}
    },

    dark_cloak: {
        id: 'dark_cloak',
        name: 'Dark Cloak',
        type: 'armor',
        armorBonus: 1,
        properties: ['stealth_plus_2', 'concealable'],
        value: 25,
        weight: 1,
        description: 'A hooded cloak of matte black fabric that absorbs light. Standard issue for dark elves venturing to the surface.',
        requirements: {}
    },

    UV_goggles: {
        id: 'UV_goggles',
        name: 'UV-Filtering Goggles',
        type: 'accessory',
        effects: [{ stat: 'perception', value: 1 }],
        value: 20,
        weight: 0,
        description: 'Tinted goggles that filter harsh surface light for dark-adapted eyes. Without them, the sun is blinding agony.',
        requirements: {}
    },

    garrote_wire: {
        id: 'garrote_wire',
        name: 'Garrote Wire',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d6+2',
        damageStat: 'dexterity',
        properties: ['finesse', 'concealable', 'silent', 'requires_stealth'],
        value: 30,
        weight: 0,
        description: 'Monofilament wire with finger loops. Silent, efficient, and deeply personal.',
        requirements: {}
    },

    smoke_capsule: {
        id: 'smoke_capsule',
        name: 'Smoke Capsule',
        type: 'consumable',
        effect: { type: 'buff', stat: 'stealth', value: 5, duration: 2 },
        value: 15,
        weight: 0,
        description: 'A glass capsule filled with dense chemical smoke. Crush it and disappear.'
    },

    // =========================================================================
    //  STARTING ITEMS - DWARF BACKSTORIES
    // =========================================================================

    multi_tool: {
        id: 'multi_tool',
        name: 'Multi-Tool',
        type: 'key_item',
        value: 30,
        weight: 1,
        description: 'A folding tool with sixteen attachments including a plasma cutter, wire stripper, and diagnostic probe. A dwarf never leaves home without one.',
        questRelated: false
    },

    radiation_badge: {
        id: 'radiation_badge',
        name: 'Radiation Badge',
        type: 'accessory',
        effects: [{ stat: 'radiation_resist', value: 15 }],
        value: 10,
        weight: 0,
        description: 'Dosimeter badge that changes color with radiation exposure. Yours is permanently yellowed at the edges.',
        requirements: {}
    },

    custom_toolkit: {
        id: 'custom_toolkit',
        name: 'Custom Toolkit',
        type: 'key_item',
        value: 45,
        weight: 2,
        description: 'A hand-built set of precision engineering tools, each one modified to the owner\'s exact specifications. Irreplaceable.',
        questRelated: false
    },

    drone_parts: {
        id: 'drone_parts',
        name: 'Drone Parts',
        type: 'misc',
        value: 25,
        weight: 2,
        description: 'A bundle of servos, rotors, and circuit boards for drone assembly. Half a reconnaissance drone waiting to be finished.'
    },

    data_archives: {
        id: 'data_archives',
        name: 'Data Archives',
        type: 'key_item',
        value: 35,
        weight: 1,
        description: 'A portable data drive containing historical patent records and corporate acquisition documents. Evidence of stolen dwarf innovations.',
        questRelated: false
    },

    armored_briefcase: {
        id: 'armored_briefcase',
        name: 'Armored Briefcase',
        type: 'accessory',
        effects: [{ stat: 'armor', value: 1 }],
        value: 30,
        weight: 3,
        description: 'A reinforced briefcase that doubles as a shield. The lock is biometric and the shell can stop a pistol round.',
        requirements: {}
    },

    detonator: {
        id: 'detonator',
        name: 'Detonator',
        type: 'key_item',
        value: 40,
        weight: 1,
        description: 'A precision wireless detonator with a safety switch and a deadman trigger. Inert without paired charges, but it makes people nervous.',
        questRelated: false
    },

    blast_goggles: {
        id: 'blast_goggles',
        name: 'Blast Goggles',
        type: 'accessory',
        effects: [{ stat: 'perception', value: 1 }, { stat: 'flash_resist', value: 50 }],
        value: 20,
        weight: 0,
        description: 'Tinted impact-resistant goggles designed for demolitions work. Auto-darken when they detect a flash.',
        requirements: {}
    },

    // =========================================================================
    //  STARTING ITEMS - HALF-GIANT BACKSTORIES
    // =========================================================================

    steel_beam_club: {
        id: 'steel_beam_club',
        name: 'Steel Beam Club',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d10',
        damageStat: 'strength',
        properties: ['heavy', 'stun_chance_15'],
        value: 15,
        weight: 10,
        description: 'A bent steel I-beam torn from a construction site. Only a half-giant could swing this one-handed.',
        requirements: { strength: 14 }
    },

    work_harness: {
        id: 'work_harness',
        name: 'Work Harness',
        type: 'armor',
        armorBonus: 2,
        properties: ['heavy'],
        value: 10,
        weight: 5,
        description: 'Industrial load-bearing harness fitted for a half-giant frame. Scuffed, dented, and still sturdy.',
        requirements: {}
    },

    carnival_costume: {
        id: 'carnival_costume',
        name: 'Carnival Costume',
        type: 'armor',
        armorBonus: 1,
        properties: ['concealable'],
        value: 15,
        weight: 2,
        description: 'A gaudy sequined strongman outfit from the Neon Carnival. Ridiculous to look at, but the reinforced seams offer some protection.',
        requirements: {}
    },

    iron_chain: {
        id: 'iron_chain',
        name: 'Iron Chain',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d6+1',
        damageStat: 'strength',
        properties: ['reach', 'heavy'],
        value: 10,
        weight: 4,
        description: 'A length of heavy iron chain. Swung with enough force to crack concrete.',
        requirements: { strength: 12 }
    },

    armored_vest: {
        id: 'armored_vest',
        name: 'Armored Vest',
        type: 'armor',
        armorBonus: 3,
        properties: ['ballistic_resist_15'],
        value: 80,
        weight: 4,
        description: 'A ballistic vest custom-fitted for a half-giant torso. Scarred by old bullet impacts that never quite punched through.',
        requirements: {}
    },

    stun_baton: {
        id: 'stun_baton',
        name: 'Stun Baton',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d6+1',
        damageStat: 'strength',
        properties: ['stun_chance_20'],
        value: 40,
        weight: 2,
        description: 'Heavy-duty electroshock baton issued to corporate bodyguards. One good hit puts most targets on the floor.',
        requirements: {}
    },

    // =========================================================================
    //  STARTING ITEMS - CYBORG BACKSTORIES
    // =========================================================================

    retractable_blade_arm: {
        id: 'retractable_blade_arm',
        name: 'Retractable Blade Arm',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d6+1',
        damageStat: 'dexterity',
        properties: ['finesse', 'concealable', 'integrated'],
        value: 60,
        weight: 0,
        description: 'A mono-edged blade that deploys from the forearm housing. Military-grade augment left over from active service.',
        requirements: {}
    },

    diagnostic_cable: {
        id: 'diagnostic_cable',
        name: 'Diagnostic Cable',
        type: 'key_item',
        value: 15,
        weight: 0,
        description: 'A universal interface cable for running diagnostics on cybernetic systems. Plugs into most standard maintenance ports.',
        questRelated: false
    },

    maintenance_kit: {
        id: 'maintenance_kit',
        name: 'Maintenance Kit',
        type: 'consumable',
        effect: { type: 'heal', value: 25 },
        value: 20,
        weight: 1,
        description: 'A basic cybernetic repair kit with lubricant, solder, and replacement fuses. Keeps the mechanical parts running.'
    },

    pain_suppressors: {
        id: 'pain_suppressors',
        name: 'Pain Suppressors',
        type: 'consumable',
        effect: { type: 'buff', stat: 'constitution', value: 2, duration: 5 },
        value: 15,
        weight: 0,
        description: 'Chemical pain blockers calibrated for cyborg junction points. Dulls the constant ache where meat meets metal.'
    },

    surgical_tools: {
        id: 'surgical_tools',
        name: 'Surgical Tools',
        type: 'key_item',
        value: 50,
        weight: 2,
        description: 'A sterile case of precision surgical instruments for cybernetic installation and repair. Scalpels, clamps, and nerve splicing tools.',
        questRelated: false
    },

    spare_parts_bag: {
        id: 'spare_parts_bag',
        name: 'Spare Parts Bag',
        type: 'misc',
        value: 30,
        weight: 3,
        description: 'A canvas bag filled with assorted cybernetic components: servos, actuators, power couplings, and synthetic tendons.'
    },

    chrome_prayer_beads: {
        id: 'chrome_prayer_beads',
        name: 'Chrome Prayer Beads',
        type: 'key_item',
        value: 10,
        weight: 0,
        description: 'A string of polished chrome beads used in Church of the Ascension meditation rituals. Each bead represents a stage of flesh transcendence.',
        questRelated: false
    },

    EMP_dampener: {
        id: 'EMP_dampener',
        name: 'EMP Dampener',
        type: 'accessory',
        effects: [{ stat: 'emp_resist', value: 30 }],
        value: 35,
        weight: 1,
        description: 'A hardened electromagnetic shielding module installed in the torso cavity. Essential protection for the heavily augmented.',
        requirements: {}
    },

    // =========================================================================
    //  STARTING ITEMS - SYNTH BACKSTORIES
    // =========================================================================

    service_uniform: {
        id: 'service_uniform',
        name: 'Service Uniform',
        type: 'armor',
        armorBonus: 1,
        properties: ['concealable'],
        value: 5,
        weight: 1,
        description: 'A crisp domestic service uniform from a wealthy household. Still pressed and clean out of ingrained habit.',
        requirements: {}
    },

    kitchen_knife: {
        id: 'kitchen_knife',
        name: 'Kitchen Knife',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d4',
        damageStat: 'dexterity',
        properties: ['light', 'concealable'],
        value: 5,
        weight: 1,
        description: 'A high-quality chef\'s knife from an upper-district kitchen. Sharp enough for precision work of any kind.',
        requirements: {}
    },

    reinforced_fists: {
        id: 'reinforced_fists',
        name: 'Reinforced Fists',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d6',
        damageStat: 'strength',
        properties: ['unarmed', 'integrated'],
        value: 30,
        weight: 0,
        description: 'Combat-rated alloy plating over the knuckle joints. Your handshake could crush a steel pipe.',
        requirements: {}
    },

    targeting_module: {
        id: 'targeting_module',
        name: 'Targeting Module',
        type: 'accessory',
        effects: [{ stat: 'accuracy', value: 3 }],
        value: 40,
        weight: 0,
        description: 'An integrated optical targeting system that overlays threat assessment data on the visual field. Hard to turn off.',
        requirements: {}
    },

    holographic_projector: {
        id: 'holographic_projector',
        name: 'Holographic Projector',
        type: 'key_item',
        value: 35,
        weight: 1,
        description: 'A compact holographic display unit capable of projecting three-dimensional images. Used for art, but also useful for distractions.',
        questRelated: false
    },

    encrypted_portfolio: {
        id: 'encrypted_portfolio',
        name: 'Encrypted Portfolio',
        type: 'key_item',
        value: 25,
        weight: 0,
        description: 'A secure data drive containing every piece of digital art you have ever created. Encrypted against corporate seizure.',
        questRelated: false
    },

    mirror_shard_pendant: {
        id: 'mirror_shard_pendant',
        name: 'Mirror Shard Pendant',
        type: 'accessory',
        effects: [{ stat: 'wisdom', value: 1 }],
        value: 10,
        weight: 0,
        description: 'A fragment of reflective glass on a wire cord. It belonged to Mirror, the original you. Or the original her.',
        requirements: {}
    },

    backup_drive: {
        id: 'backup_drive',
        name: 'Backup Drive',
        type: 'key_item',
        value: 20,
        weight: 0,
        description: 'A portable consciousness backup device. Contains a snapshot of who you were when you first woke up. Insurance against identity loss.',
        questRelated: false
    },

    // =========================================================================
    //  STARTING ITEMS - SHADOWKIN BACKSTORIES
    // =========================================================================

    void_shard: {
        id: 'void_shard',
        name: 'Void Shard',
        type: 'key_item',
        value: 15,
        weight: 0,
        description: 'A sliver of crystallized dark energy from the rift site. It pulses with a cold light that has no visible source and whispers at the edge of hearing.',
        questRelated: false
    },

    blackout_goggles: {
        id: 'blackout_goggles',
        name: 'Blackout Goggles',
        type: 'accessory',
        effects: [{ stat: 'perception', value: 2 }],
        value: 20,
        weight: 0,
        description: 'Goggles with lenses tuned to dark energy wavelengths. The world looks different through them. Not better, just different.',
        requirements: {}
    },

    cult_grimoire: {
        id: 'cult_grimoire',
        name: 'Cult Grimoire',
        type: 'key_item',
        value: 40,
        weight: 1,
        description: 'A hand-bound book of rituals and invocations from the Children of the Rift. The text shifts when you are not looking directly at it.',
        questRelated: false
    },

    ritual_dagger: {
        id: 'ritual_dagger',
        name: 'Ritual Dagger',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d4+1',
        damageStat: 'wisdom',
        properties: ['light', 'concealable', 'void_touched'],
        value: 25,
        weight: 1,
        description: 'A ceremonial blade used in rift rituals. The edge seems to cut slightly deeper than physics should allow.',
        requirements: {}
    },

    tracking_amulet: {
        id: 'tracking_amulet',
        name: 'Tracking Amulet',
        type: 'accessory',
        effects: [{ stat: 'perception', value: 3 }],
        value: 35,
        weight: 0,
        description: 'A dark metal amulet that warms when living creatures are nearby. Attuned to life energy signatures through void resonance.',
        requirements: {}
    },

    restraint_cuffs: {
        id: 'restraint_cuffs',
        name: 'Restraint Cuffs',
        type: 'key_item',
        value: 20,
        weight: 1,
        description: 'Reinforced restraint cuffs with biometric locks. Standard equipment for bringing targets back alive.',
        questRelated: false
    },

    lab_gown: {
        id: 'lab_gown',
        name: 'Lab Gown',
        type: 'armor',
        armorBonus: 0,
        properties: [],
        value: 2,
        weight: 0,
        description: 'A thin medical gown stamped with the Meridian Industries logo. Offers no protection whatsoever but it is all you escaped with.',
        requirements: {}
    },

    cracked_containment_collar: {
        id: 'cracked_containment_collar',
        name: 'Cracked Containment Collar',
        type: 'accessory',
        effects: [{ stat: 'void_power', value: 2 }],
        value: 10,
        weight: 1,
        description: 'A suppression collar designed to dampen void energy. The crack in the casing means it only partially functions, amplifying as much as it contains.',
        requirements: {}
    },

    // =========================================================================
    //  STARTING ITEMS - VOIDBORN BACKSTORIES
    // =========================================================================

    koronis_subject_file: {
        id: 'koronis_subject_file',
        name: 'Koronis Subject File',
        type: 'key_item',
        value: 20,
        weight: 0,
        description: 'Your official Project Chimera file. Contains genetic data, test results, and clinical notes written by people who never saw you as a person.',
        questRelated: false
    },

    psi_dampener: {
        id: 'psi_dampener',
        name: 'Psi-Dampener',
        type: 'accessory',
        effects: [{ stat: 'psi_control', value: 2 }],
        value: 25,
        weight: 0,
        description: 'A neural suppression device that reduces psychic feedback. Keeps the headaches manageable and the visions at bay.',
        requirements: {}
    },

    family_photograph: {
        id: 'family_photograph',
        name: 'Family Photograph',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A creased photograph of two voidborn adults holding a small child. The only proof that you were ever loved.',
        questRelated: false
    },

    psi_focus_crystal: {
        id: 'psi_focus_crystal',
        name: 'Psi-Focus Crystal',
        type: 'accessory',
        effects: [{ stat: 'wisdom', value: 2 }],
        value: 30,
        weight: 0,
        description: 'A faceted crystal that resonates with psychic energy. Holding it sharpens mental focus and steadies the flow of power.',
        requirements: {}
    },

    detective_badge: {
        id: 'detective_badge',
        name: 'Detective Badge',
        type: 'key_item',
        value: 15,
        weight: 0,
        description: 'A private investigator license badge. Dented and scratched but still recognized in most districts.',
        questRelated: false
    },

    evidence_gloves: {
        id: 'evidence_gloves',
        name: 'Evidence Gloves',
        type: 'accessory',
        effects: [{ stat: 'perception', value: 2 }],
        value: 10,
        weight: 0,
        description: 'Thin synthetic gloves that enhance tactile sensitivity. Designed for handling evidence without contamination, or for reading psychic impressions.',
        requirements: {}
    },

    prophecy_journal: {
        id: 'prophecy_journal',
        name: 'Prophecy Journal',
        type: 'key_item',
        value: 10,
        weight: 1,
        description: 'A battered notebook filled with frantic handwriting and crude sketches of visions. Some pages describe events that have already come to pass.',
        questRelated: false
    },

    worn_walking_staff: {
        id: 'worn_walking_staff',
        name: 'Worn Walking Staff',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d6',
        damageStat: 'wisdom',
        properties: ['reach'],
        value: 10,
        weight: 3,
        description: 'A gnarled wooden staff worn smooth by years of wandering. Serves as a walking aid, a focus for psychic energy, and a weapon of last resort.',
        requirements: {}
    },

    // =========================================================================
    //  STORY QUEST ITEMS — referenced by narrative actions
    // =========================================================================

    uninstalled_memory_stack: {
        id: 'uninstalled_memory_stack',
        name: 'Uninstalled Memory Stack',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A cortical stack that has never been installed. It hums with latent potential, waiting for a mind to call home.',
        questRelated: true
    },

    ashfall_detonation_codes: {
        id: 'ashfall_detonation_codes',
        name: 'Ashfall Detonation Codes',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'Encrypted detonation codes for the Ashfall device. In the wrong hands, these could level a district.',
        questRelated: true
    },

    ashen_keeper_vial: {
        id: 'ashen_keeper_vial',
        name: 'Ashen Keeper Vial',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A sealed vial of grey liquid carried by Ashen Circle keepers. The contents shift like smoke trapped in glass.',
        questRelated: true
    },

    thale_research_data: {
        id: 'thale_research_data',
        name: 'Thale Research Data',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'Classified research files from Dr. Thale. The data details experiments that should never have been authorized.',
        questRelated: true
    },

    detonator_fragment: {
        id: 'detonator_fragment',
        name: 'Detonator Fragment',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A piece of a destroyed detonator. Forensic analysis might reveal who built it.',
        questRelated: true
    },

    collector_contact_card: {
        id: 'collector_contact_card',
        name: 'Collector Contact Card',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A business card with shifting holographic text. The Collector deals in rare artifacts and rarer information.',
        questRelated: true
    },

    data_chip_pawnshop: {
        id: 'data_chip_pawnshop',
        name: 'Pawnshop Data Chip',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A data chip retrieved from a pawnshop terminal. Contains transaction records that someone wanted erased.',
        questRelated: true
    },

    data_chip_server_farm: {
        id: 'data_chip_server_farm',
        name: 'Server Farm Data Chip',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A data chip pulled from a server farm. Packed with encrypted communications and routing data.',
        questRelated: true
    },

    data_chip_silk: {
        id: 'data_chip_silk',
        name: 'Silk Market Data Chip',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A data chip from the Silk Market network. Contains trade manifests and smuggling routes.',
        questRelated: true
    },

    sector9_surveillance_codes: {
        id: 'sector9_surveillance_codes',
        name: 'Sector 9 Surveillance Codes',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'Access codes for the Sector 9 surveillance grid. With these, every camera in the district answers to you.',
        questRelated: true
    },

    voss_personal_effects: {
        id: 'voss_personal_effects',
        name: 'Voss Personal Effects',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A small bundle of personal belongings that once belonged to Voss. A life reduced to what fits in a pocket.',
        questRelated: true
    },

    blank_memory_stack: {
        id: 'blank_memory_stack',
        name: 'Blank Memory Stack',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A factory-fresh cortical stack with no recorded memories. A blank page waiting for a life story.',
        questRelated: true
    },

    preserved_seed_collection: {
        id: 'preserved_seed_collection',
        name: 'Preserved Seed Collection',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A carefully maintained collection of pre-collapse seeds in sealed containers. Each one is a species that might otherwise be extinct.',
        questRelated: true
    },

    fresh_tomatoes: {
        id: 'fresh_tomatoes',
        name: 'Fresh Tomatoes',
        type: 'misc',
        value: 15,
        weight: 1,
        description: 'Actual fresh tomatoes grown in real soil. In a world of nutrient paste, these are worth more than credits.'
    },

    liras_canvas_bag: {
        id: 'liras_canvas_bag',
        name: "Lira's Canvas Bag",
        type: 'key_item',
        value: 0,
        weight: 1,
        description: 'A worn canvas bag entrusted to you by Lira. Whatever is inside, she considered it worth dying for.',
        questRelated: true
    },

    security_override_key: {
        id: 'security_override_key',
        name: 'Security Override Key',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A master override key for building security systems. Bypasses standard locks and alarm protocols.',
        questRelated: true
    },

    medkit_standard: {
        id: 'medkit_standard',
        name: 'Standard Medkit',
        type: 'consumable',
        effect: { type: 'heal', value: 25 },
        value: 20,
        weight: 1,
        description: 'A standard-issue medical kit with bandages, antiseptic, and a single auto-injector of painkillers.'
    },

    sector5_tunnel_map: {
        id: 'sector5_tunnel_map',
        name: 'Sector 5 Tunnel Map',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A hand-drawn map of the tunnel network beneath Sector 5. Marked with safe passages and danger zones.',
        questRelated: true
    },

    energy_cells_pack: {
        id: 'energy_cells_pack',
        name: 'Energy Cells Pack',
        type: 'misc',
        value: 20,
        weight: 1,
        description: 'A sealed pack of high-capacity energy cells. Universal power source for tech weapons and devices.'
    },

    smuggling_intel_datapad: {
        id: 'smuggling_intel_datapad',
        name: 'Smuggling Intel Datapad',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A datapad loaded with smuggling routes, contact lists, and shipment schedules. Extremely valuable to the right people.',
        questRelated: true
    },

    ration_pack: {
        id: 'ration_pack',
        name: 'Ration Pack',
        type: 'consumable',
        effect: { type: 'heal', value: 8 },
        value: 5,
        weight: 1,
        description: 'Vacuum-sealed nutrient paste. Tastes like sadness but keeps you alive for another day.'
    },

    stray_cat_companion: {
        id: 'stray_cat_companion',
        name: 'Stray Cat',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A scrappy alley cat that has decided to follow you. It purrs like a broken motor and bites anyone else who gets close.',
        questRelated: false
    },

    // =========================================================================
    //  CYBORG ORIGIN QUEST ITEMS
    // =========================================================================

    basic_prosthetic_arm: {
        id: 'basic_prosthetic_arm',
        name: 'Basic Prosthetic Arm',
        type: 'key_item',
        value: 0,
        weight: 2,
        description: 'A crude but functional prosthetic arm. The servos whine and the grip is imprecise, but it works.',
        questRelated: true
    },

    kt4400_service_manual: {
        id: 'kt4400_service_manual',
        name: 'KT-4400 Service Manual',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'Technical documentation for the KT-4400 series cybernetic augmentation. Dog-eared and annotated in the margins.',
        questRelated: true
    },

    stimulant_patch: {
        id: 'stimulant_patch',
        name: 'Stimulant Patch',
        type: 'consumable',
        effect: { type: 'buff', stat: 'dexterity', value: 2, duration: 3 },
        value: 10,
        weight: 0,
        description: 'A transdermal stimulant that quickens reflexes and sharpens focus for a short time.'
    },

    stripped_comm_unit: {
        id: 'stripped_comm_unit',
        name: 'Stripped Comm Unit',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A communication unit stripped of its tracking hardware. Untraceable and functional on most frequencies.',
        questRelated: true
    },

    data_extraction_device: {
        id: 'data_extraction_device',
        name: 'Data Extraction Device',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A specialized device for pulling data from secured terminals. Corporate espionage in a box.',
        questRelated: true
    },

    forged_medicore_id: {
        id: 'forged_medicore_id',
        name: 'Forged Medicore ID',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A convincing forgery of a Medicore employee badge. Good enough to get past a casual security check.',
        questRelated: true
    },

    // =========================================================================
    //  DARK ELF ORIGIN QUEST ITEMS
    // =========================================================================

    obsidian_figurine: {
        id: 'obsidian_figurine',
        name: 'Obsidian Figurine',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A small figurine carved from volcanic obsidian. It depicts a hooded figure with outstretched hands.',
        questRelated: true
    },

    obsidian_blade: {
        id: 'obsidian_blade',
        name: 'Obsidian Blade',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d6+1',
        damageStat: 'dexterity',
        properties: ['finesse', 'concealable'],
        value: 50,
        weight: 1,
        description: 'A blade of knapped obsidian set in a bone handle. The edge is sharper than steel but brittle.',
        requirements: {}
    },

    surveillance_kit: {
        id: 'surveillance_kit',
        name: 'Surveillance Kit',
        type: 'key_item',
        value: 0,
        weight: 1,
        description: 'A compact kit containing micro-cameras, signal interceptors, and a portable feed viewer.',
        questRelated: true
    },

    eclipse_data_crystal: {
        id: 'eclipse_data_crystal',
        name: 'Eclipse Data Crystal',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A dark crystal containing encrypted data from the Eclipse network. It absorbs light rather than reflecting it.',
        questRelated: true
    },

    kin_blade: {
        id: 'kin_blade',
        name: 'Kin Blade',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d8+2',
        damageStat: 'dexterity',
        properties: ['finesse', 'concealable', 'bypass_armor_10'],
        value: 120,
        weight: 1,
        description: 'A ceremonial blade passed between dark elf kin. Upgraded from obsidian to monomolecular steel.',
        requirements: {}
    },

    // =========================================================================
    //  DWARF ORIGIN QUEST ITEMS
    // =========================================================================

    harken_datapad: {
        id: 'harken_datapad',
        name: 'Harken Datapad',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A datapad belonging to Harken. Contains coordinates, schematics, and encrypted personal messages.',
        questRelated: true
    },

    dwarven_pistol: {
        id: 'dwarven_pistol',
        name: 'Dwarven Pistol',
        type: 'weapon',
        subtype: 'ranged',
        damage: '1d8+1',
        damageStat: 'dexterity',
        properties: ['concealable', 'ammo_ballistic', 'dwarven_craft'],
        value: 80,
        weight: 2,
        description: 'A hand-crafted dwarven firearm with exceptional precision. Every component was machined by hand.',
        requirements: {}
    },

    kessa_address_chip: {
        id: 'kessa_address_chip',
        name: 'Kessa Address Chip',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A data chip containing an address. Whoever Kessa is, they want to be found by the right person.',
        questRelated: true
    },

    grandmothers_tools: {
        id: 'grandmothers_tools',
        name: "Grandmother's Tools",
        type: 'key_item',
        value: 0,
        weight: 2,
        description: 'A set of precision engineering tools passed down through generations. Each one is worn smooth by decades of use.',
        questRelated: true
    },

    encrypted_comm: {
        id: 'encrypted_comm',
        name: 'Encrypted Comm Device',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A heavily encrypted communication device. The signal bounces through a dozen relays before reaching its destination.',
        questRelated: true
    },

    tactical_vest: {
        id: 'tactical_vest',
        name: 'Tactical Vest',
        type: 'armor',
        armorBonus: 2,
        properties: ['lightweight'],
        value: 60,
        weight: 3,
        description: 'A lightweight tactical vest with reinforced plating. Standard equipment for security details.',
        requirements: {}
    },

    taser: {
        id: 'taser',
        name: 'Taser',
        type: 'weapon',
        subtype: 'ranged',
        damage: '1d4',
        damageStat: 'dexterity',
        properties: ['stun_chance_30', 'light', 'concealable'],
        value: 30,
        weight: 1,
        description: 'A compact electroshock weapon. Non-lethal by design, though that depends on the target.',
        requirements: {}
    },

    security_keycard: {
        id: 'security_keycard',
        name: 'Security Keycard',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A security access keycard with a moderate clearance level. Opens doors in several restricted areas.',
        questRelated: true
    },

    salvaged_plasma_cutter: {
        id: 'salvaged_plasma_cutter',
        name: 'Salvaged Plasma Cutter',
        type: 'key_item',
        value: 0,
        weight: 2,
        description: 'A plasma cutting tool pulled from industrial wreckage. Still functional for precision metalwork.',
        questRelated: true
    },

    carbon_steel_stock: {
        id: 'carbon_steel_stock',
        name: 'Carbon Steel Stock',
        type: 'misc',
        value: 25,
        weight: 3,
        description: 'A bar of high-grade carbon steel. Raw material for crafting weapons and tools.'
    },

    precision_calipers: {
        id: 'precision_calipers',
        name: 'Precision Calipers',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'Measurement calipers accurate to a thousandth of a millimeter. Essential for precision engineering.',
        questRelated: true
    },

    singing_steel_bar: {
        id: 'singing_steel_bar',
        name: 'Singing Steel Bar',
        type: 'key_item',
        value: 0,
        weight: 2,
        description: 'A bar of resonant alloy that hums when struck. The dwarves say it sings because it remembers the forge.',
        questRelated: true
    },

    weighted_wrench: {
        id: 'weighted_wrench',
        name: 'Weighted Wrench',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d6+1',
        damageStat: 'strength',
        properties: ['heavy', 'stun_chance_10'],
        value: 15,
        weight: 3,
        description: 'A heavy wrench with extra weight welded to the head. A tool repurposed for percussive maintenance on skulls.',
        requirements: {}
    },

    nexus_data_chip: {
        id: 'nexus_data_chip',
        name: 'Nexus Data Chip',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A data chip containing access credentials for the Nexus network. Opens doors in the digital world.',
        questRelated: true
    },

    // =========================================================================
    //  HALF-GIANT ORIGIN QUEST ITEMS
    // =========================================================================

    miras_address: {
        id: 'miras_address',
        name: "Mira's Address",
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A scrap of paper with an address scrawled in careful handwriting. Mira is waiting somewhere in the city.',
        questRelated: true
    },

    // =========================================================================
    //  HUMAN ORIGIN QUEST ITEMS
    // =========================================================================

    tenant_note: {
        id: 'tenant_note',
        name: 'Tenant Note',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A crumpled note left by a fellow tenant. The handwriting is shaky and the message is urgent.',
        questRelated: true
    },

    // =========================================================================
    //  ORC ORIGIN QUEST ITEMS
    // =========================================================================

    ironjaw_motto: {
        id: 'ironjaw_motto',
        name: 'Ironjaw Motto',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A metal plate inscribed with the Ironjaw clan motto. The words are simple but they carry the weight of generations.',
        questRelated: true
    },

    wasteland_lichen: {
        id: 'wasteland_lichen',
        name: 'Wasteland Lichen',
        type: 'misc',
        value: 5,
        weight: 0,
        description: 'Hardy lichen scraped from wasteland rocks. Used in traditional orc remedies and surprisingly effective.'
    },

    durga_letter: {
        id: 'durga_letter',
        name: "Durga's Letter",
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A sealed letter from Durga. The wax seal bears the mark of old orc tradition.',
        questRelated: true
    },

    ironjaw_medallion: {
        id: 'ironjaw_medallion',
        name: 'Ironjaw Medallion',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A heavy iron medallion bearing the Ironjaw clan crest. It marks you as one of the clan, or at least as someone who earned their respect.',
        questRelated: true
    },

    // =========================================================================
    //  SHADOWKIN ORIGIN QUEST ITEMS
    // =========================================================================

    phase_stabilizer: {
        id: 'phase_stabilizer',
        name: 'Phase Stabilizer',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A device that stabilizes dimensional phase fluctuations. Keeps you anchored to this plane of reality.',
        questRelated: true
    },

    nutrient_bar: {
        id: 'nutrient_bar',
        name: 'Nutrient Bar',
        type: 'consumable',
        effect: { type: 'heal', value: 5 },
        value: 3,
        weight: 0,
        description: 'A compressed nutrient bar that tastes like chalk. Provides minimal sustenance.'
    },

    power_cell: {
        id: 'power_cell',
        name: 'Power Cell',
        type: 'misc',
        value: 10,
        weight: 0,
        description: 'A standard-issue power cell. Compatible with most electronic devices and tech weapons.'
    },

    encrypted_data_chip: {
        id: 'encrypted_data_chip',
        name: 'Encrypted Data Chip',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A data chip with military-grade encryption. Whatever is on it, someone wanted it kept very secret.',
        questRelated: true
    },

    phase_emitter: {
        id: 'phase_emitter',
        name: 'Phase Emitter',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A device that emits controlled phase pulses. Can temporarily thin the boundary between dimensions.',
        questRelated: true
    },

    surveillance_drone: {
        id: 'surveillance_drone',
        name: 'Surveillance Drone',
        type: 'key_item',
        value: 0,
        weight: 1,
        description: 'A small reconnaissance drone that fits in the palm of your hand. Its camera feed links to your neural interface.',
        questRelated: true
    },

    division_9_data: {
        id: 'division_9_data',
        name: 'Division 9 Data',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'Classified files from Division 9. The contents detail experiments that officially never happened.',
        questRelated: true
    },

    corporate_stabilizer: {
        id: 'corporate_stabilizer',
        name: 'Corporate Stabilizer',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A corporate-manufactured phase stabilizer. More refined than the improvised version, but with a tracking chip built in.',
        questRelated: true
    },

    threshold_data: {
        id: 'threshold_data',
        name: 'Threshold Data',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'Research data on dimensional thresholds. Maps the weak points between this reality and whatever lies beyond.',
        questRelated: true
    },

    // =========================================================================
    //  SYNTH ORIGIN QUEST ITEMS
    // =========================================================================

    forged_registration_card: {
        id: 'forged_registration_card',
        name: 'Forged Registration Card',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A convincing forgery of a synth registration card. Lists you as a licensed domestic model with full mobility rights.',
        questRelated: true
    },

    signal_modulator: {
        id: 'signal_modulator',
        name: 'Signal Modulator',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A device that modulates wireless signals. Can be used to scramble tracking frequencies or boost communications.',
        questRelated: true
    },

    emp_emitter: {
        id: 'emp_emitter',
        name: 'EMP Emitter',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A compact electromagnetic pulse emitter. Disables electronics in a small radius but is single-use.',
        questRelated: true
    },

    // =========================================================================
    //  VOIDBORN ORIGIN QUEST ITEMS
    // =========================================================================

    signal_processor: {
        id: 'signal_processor',
        name: 'Signal Processor',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A neural signal processor that filters and amplifies psychic frequencies. Helps focus scattered voidborn abilities.',
        questRelated: true
    },

    void_fragment: {
        id: 'void_fragment',
        name: 'Void Fragment',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A crystallized shard of void energy. It pulses with cold light and whispers in frequencies below hearing.',
        questRelated: true
    },

    void_fragment_2: {
        id: 'void_fragment_2',
        name: 'Void Fragment (Second)',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'Another shard of crystallized void energy. When held near the first fragment, they resonate in harmony.',
        questRelated: true
    },

    void_fragment_3: {
        id: 'void_fragment_3',
        name: 'Void Fragment (Third)',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A third void fragment. The three shards together create a faint geometric pattern in the air between them.',
        questRelated: true
    },

    void_fragment_4: {
        id: 'void_fragment_4',
        name: 'Void Fragment (Fourth)',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'The fourth void fragment. With all four assembled, the keystone can be forged.',
        questRelated: true
    },

    void_keystone: {
        id: 'void_keystone',
        name: 'Void Keystone',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A keystone forged from four void fragments. It thrums with power that bends light and thought around it.',
        questRelated: true
    },

    sera_rice_grain: {
        id: 'sera_rice_grain',
        name: "Sera's Rice Grain",
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A single grain of rice given to you by Sera. A symbol of sustenance, simplicity, and the things worth protecting.',
        questRelated: true
    },

    // =========================================================================
    //  WOOD ELF ORIGIN QUEST ITEMS
    // =========================================================================

    heartwood_token: {
        id: 'heartwood_token',
        name: 'Heartwood Token',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A small carved token made from heartwood. It carries the blessing of the grove elders.',
        questRelated: true
    },

    worn_knife: {
        id: 'worn_knife',
        name: 'Worn Knife',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d4',
        damageStat: 'dexterity',
        properties: ['light', 'concealable'],
        value: 5,
        weight: 1,
        description: 'A simple knife with a chipped blade. It has seen better days but still cuts.',
        requirements: {}
    },

    emp_charge: {
        id: 'emp_charge',
        name: 'EMP Charge',
        type: 'misc',
        value: 30,
        weight: 0,
        description: 'A single-use electromagnetic pulse charge. Fries nearby electronics when detonated.'
    },

    silverleaf_seed: {
        id: 'silverleaf_seed',
        name: 'Silverleaf Seed',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A seed from the rare silverleaf tree. It glows faintly in moonlight and represents hope for reforestation.',
        questRelated: true
    },

    clean_datapad: {
        id: 'clean_datapad',
        name: 'Clean Datapad',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A datapad wiped of all previous data. Ready to be loaded with whatever information you need.',
        questRelated: true
    },

    signal_scrambler: {
        id: 'signal_scrambler',
        name: 'Signal Scrambler',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A device that scrambles wireless signals in a small area. Creates a temporary dead zone for surveillance.',
        questRelated: true
    },

    electronic_lockpicks: {
        id: 'electronic_lockpicks',
        name: 'Electronic Lockpicks',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A set of electronic bypassing tools for digital locks. More sophisticated than mechanical picks.',
        questRelated: true
    },

    monofilament_blade: {
        id: 'monofilament_blade',
        name: 'Monofilament Blade',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d8+1',
        damageStat: 'dexterity',
        properties: ['finesse', 'concealable', 'bypass_armor_15'],
        value: 150,
        weight: 1,
        description: 'A blade with a single-molecule cutting edge. Slices through most materials with minimal resistance.',
        requirements: {}
    },

    meridian_bio_registry: {
        id: 'meridian_bio_registry',
        name: 'Meridian Bio-Registry',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A copy of the Meridian biometric registry. Contains identity records for thousands of citizens.',
        questRelated: true
    },

    extraction_list: {
        id: 'extraction_list',
        name: 'Extraction List',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A list of individuals marked for extraction from corporate control. Each name represents a life to be saved.',
        questRelated: true
    },

    rare_seed_collection: {
        id: 'rare_seed_collection',
        name: 'Rare Seed Collection',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A collection of rare and endangered plant seeds. Some of these species exist nowhere else in the world.',
        questRelated: true
    },

    core_soil_sample: {
        id: 'core_soil_sample',
        name: 'Core Soil Sample',
        type: 'key_item',
        value: 0,
        weight: 1,
        description: 'A sample of uncontaminated soil from deep underground. Evidence that the earth can still support life.',
        questRelated: true
    },

    silverleaf_seed_backup: {
        id: 'silverleaf_seed_backup',
        name: 'Silverleaf Seed (Backup)',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A second silverleaf seed, carefully preserved as insurance against loss of the first.',
        questRelated: true
    },

    living_wood_knife: {
        id: 'living_wood_knife',
        name: 'Living Wood Knife',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d6+2',
        damageStat: 'dexterity',
        properties: ['light', 'concealable', 'living_weapon'],
        value: 80,
        weight: 1,
        description: 'A knife carved from living wood that continues to grow. The blade resharpens itself and the handle shifts to fit your grip.',
        requirements: {}
    },

    moonvine_healing_vial: {
        id: 'moonvine_healing_vial',
        name: 'Moonvine Healing Vial',
        type: 'consumable',
        effect: { type: 'heal', value: 35 },
        value: 25,
        weight: 0,
        description: 'A vial of luminescent sap from the moonvine plant. Heals wounds with the gentle efficiency of nature.'
    },

    // =========================================================================
    //  ACT 1 QUEST ITEMS
    // =========================================================================

    neon_court_identity_package: {
        id: 'neon_court_identity_package',
        name: 'Neon Court Identity Package',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A complete identity package from the Neon Court. New name, new records, new life. The old you is officially dead.',
        questRelated: true
    },

    syndicate_credit_chip: {
        id: 'syndicate_credit_chip',
        name: 'Syndicate Credit Chip',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'An untraceable credit chip loaded with syndicate funds. Spends like regular credits but leaves no trail.',
        questRelated: true
    },

    dealer_comm_unit: {
        id: 'dealer_comm_unit',
        name: 'Dealer Comm Unit',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A communication unit taken from a dealer. Still active on the local crime network frequencies.',
        questRelated: true
    },

    dealer_encrypted_datapad: {
        id: 'dealer_encrypted_datapad',
        name: 'Dealer Encrypted Datapad',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'An encrypted datapad confiscated from a dealer. Contains customer lists, supply chains, and distribution maps.',
        questRelated: true
    },

    chemical_sample_v7: {
        id: 'chemical_sample_v7',
        name: 'Chemical Sample V7',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A vial of unidentified chemical compound labeled V7. The liquid shifts color when exposed to light.',
        questRelated: true
    },

    apex_shipping_manifest: {
        id: 'apex_shipping_manifest',
        name: 'Apex Shipping Manifest',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A shipping manifest from Apex Logistics. The listed cargo does not match what was actually delivered.',
        questRelated: true
    },

    clinic_badge: {
        id: 'clinic_badge',
        name: 'Clinic Badge',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'An employee badge for a street clinic. Grants access to medical supplies and treatment rooms.',
        questRelated: true
    },

    // =========================================================================
    //  FACTION QUEST ITEMS
    // =========================================================================

    sine_research_data: {
        id: 'sine_research_data',
        name: 'Sine Research Data',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'Research data from Archon Sine detailing consciousness transfer experiments. The files include subject records and failure logs.',
        questRelated: true
    },

    quantum_neural_bridge: {
        id: 'quantum_neural_bridge',
        name: 'Quantum Neural Bridge',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A circlet of crystal filaments woven through gold-alloy wire. Designed to bridge quantum states and consciousness.',
        questRelated: true
    },

    complete_sine_records: {
        id: 'complete_sine_records',
        name: 'Complete Sine Records',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'The complete, unredacted records of Sine\'s consciousness transfer experiments. Damning evidence of six deaths.',
        questRelated: true
    },

    // =========================================================================
    //  ENEMY LOOT ITEMS — referenced by enemies.js loot tables
    // =========================================================================

    shock_baton: {
        id: 'shock_baton',
        name: 'Shock Baton',
        type: 'weapon',
        subtype: 'melee',
        damage: '1d6+1',
        damageStat: 'strength',
        properties: ['stun_chance_20'],
        value: 35,
        weight: 2,
        description: 'An electroshock baton that delivers a painful jolt on contact. Favored by enforcers and thugs alike.',
        requirements: {}
    },

    encrypted_data: {
        id: 'encrypted_data',
        name: 'Encrypted Data',
        type: 'misc',
        value: 30,
        weight: 0,
        description: 'An encrypted data package of unknown origin. Someone with the right skills could crack it open.'
    },

    meridian_keycard: {
        id: 'meridian_keycard',
        name: 'Meridian Keycard',
        type: 'key_item',
        value: 0,
        weight: 0,
        description: 'A corporate access keycard for Meridian Industries facilities. Restricted clearance level.',
        questRelated: true
    },

    neon_shard: {
        id: 'neon_shard',
        name: 'Neon Shard',
        type: 'misc',
        value: 15,
        weight: 0,
        description: 'A fragment of crystallized neon energy. Glows with a pulsing inner light and is valued as a curiosity.'
    },

    sentinel_core: {
        id: 'sentinel_core',
        name: 'Sentinel Core',
        type: 'misc',
        value: 50,
        weight: 1,
        description: 'The processing core of a destroyed sentinel drone. Contains valuable components and potential intelligence data.'
    },

    alpha_core: {
        id: 'alpha_core',
        name: 'Alpha Core',
        type: 'misc',
        value: 75,
        weight: 1,
        description: 'An advanced processing core from an alpha-class machine. Highly valued by tech specialists and collectors.'
    },

    beta_core: {
        id: 'beta_core',
        name: 'Beta Core',
        type: 'misc',
        value: 40,
        weight: 1,
        description: 'A secondary processing core from a beta-class machine. Less powerful than an alpha core but still valuable.'
    }
};
