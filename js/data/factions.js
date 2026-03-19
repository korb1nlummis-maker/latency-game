/**
 * LATENCY - Factions Data
 * Five major factions with reputation tiers, perks, penalties, and inter-faction dynamics.
 * Reputation ranges from -100 (hostile) to +100 (allied).
 */

window.Latency = window.Latency || {};

window.Latency.FactionsData = {

    // =========================================================================
    //  THE IRON COLLECTIVE
    // =========================================================================

    ironCollective: {
        id: 'ironCollective',
        name: 'The Iron Collective',
        description: 'A militant workers movement born in the factories and forges of the lower city. They believe cortical stacks are tools of oppression, granting immortality only to the wealthy while the poor die permanent deaths. They fight for equality through force, sabotage, and revolution.',
        ideology: 'Egalitarian, anti-stack, militant',
        leader: 'Commander Vex',
        leaderDescription: 'Former factory foreman who lost her entire shift crew to a stack-lord\'s negligence. Rebuilt herself as a symbol of resistance.',
        headquarters: 'The Foundry (abandoned factory district)',
        color: '#c0392b',
        motto: 'No gods. No stacks. Only iron.',
        joinRequirements: { level: 3, minReputation: 15 },
        recruitmentMethod: 'Prove your worth through action against stack inequality. The Collective watches before they invite.',
        tiers: {
            hostile: {
                min: -100,
                max: -51,
                label: 'Enemy of the People',
                perks: [],
                penalties: ['iron_bounty', 'foundry_barred', 'iron_ambush_chance']
            },
            unfriendly: {
                min: -50,
                max: -11,
                label: 'Capitalist Sympathizer',
                perks: [],
                penalties: ['iron_price_increase']
            },
            neutral: {
                min: -10,
                max: 10,
                label: 'Unknown',
                perks: [],
                penalties: []
            },
            friendly: {
                min: 11,
                max: 50,
                label: 'Comrade',
                perks: ['iron_safehouse', 'iron_discount', 'iron_medic_access'],
                penalties: []
            },
            allied: {
                min: 51,
                max: 100,
                label: 'Forgeborn',
                perks: ['iron_army', 'iron_ending_access', 'iron_plate_access', 'iron_commander_missions', 'iron_rally_ability'],
                penalties: []
            }
        },
        rivals: {
            neonCourt: -0.5,
            ashenCircle: -0.1,
            ghostSyndicate: -0.2,
            circuitSaints: 0.1
        },
        vendors: [
            { name: 'Hammer', role: 'Armorer', requiredTier: 'friendly', inventory: ['iron_collective_plate', 'riot_gear', 'scrap_vest', 'pipe_wrench', 'vibro_axe'] },
            { name: 'Doc Rivet', role: 'Field Medic', requiredTier: 'friendly', inventory: ['med_patch', 'stim_shot', 'synth_blood', 'antidote', 'adrenaline_shot'] }
        ],
        questlines: [
            { id: 'iron_spark', name: 'The Spark', description: 'Sabotage a stack-lord\'s cortical backup facility.', minTier: 'friendly' },
            { id: 'iron_forge', name: 'Forging Ahead', description: 'Arm the workers of Sector 7 for the coming uprising.', minTier: 'friendly' },
            { id: 'iron_revolution', name: 'The Iron Revolution', description: 'Lead the final assault on the Stack Spire.', minTier: 'allied' }
        ]
    },

    // =========================================================================
    //  THE NEON COURT
    // =========================================================================

    neonCourt: {
        id: 'neonCourt',
        name: 'The Neon Court',
        description: 'An aristocratic elite who control the city\'s entertainment, media, and cultural sectors from their glittering towers. They believe beauty, art, and pleasure are the highest virtues, and that those with taste and ambition deserve to rule. Beneath the glamour lies ruthless political maneuvering.',
        ideology: 'Hedonistic, elitist, culturally dominant',
        leader: 'The Radiant Queen Lysara',
        leaderDescription: 'A centuries-old stack aristocrat who has worn dozens of bodies. Her current sleeve is a masterwork of bioengineering and vanity.',
        headquarters: 'The Spire (upper city entertainment megaplex)',
        color: '#9b59b6',
        motto: 'Shine bright. Burn brighter.',
        joinRequirements: { level: 5, minReputation: 20, charisma: 12 },
        recruitmentMethod: 'Invitation only. Demonstrate taste, influence, or exceptional usefulness to catch the Court\'s eye.',
        tiers: {
            hostile: {
                min: -100,
                max: -51,
                label: 'Philistine',
                perks: [],
                penalties: ['neon_blacklisted', 'upper_city_barred', 'neon_assassin_chance']
            },
            unfriendly: {
                min: -50,
                max: -11,
                label: 'Dull',
                perks: [],
                penalties: ['neon_social_penalty']
            },
            neutral: {
                min: -10,
                max: 10,
                label: 'Unremarkable',
                perks: [],
                penalties: []
            },
            friendly: {
                min: 11,
                max: 50,
                label: 'Favored',
                perks: ['neon_club_access', 'neon_social_bonus', 'neon_fashion_discount'],
                penalties: []
            },
            allied: {
                min: 51,
                max: 100,
                label: 'Luminary',
                perks: ['neon_ending_access', 'neon_regalia_access', 'neon_court_missions', 'neon_charm_ability', 'neon_penthouse_safehouse'],
                penalties: []
            }
        },
        rivals: {
            ironCollective: -0.5,
            ashenCircle: -0.3,
            ghostSyndicate: 0.0,
            circuitSaints: -0.1
        },
        vendors: [
            { name: 'Silk', role: 'Couturier', requiredTier: 'friendly', inventory: ['synth_weave', 'neon_court_regalia', 'ghost_shroud', 'leather_jacket'] },
            { name: 'Prism', role: 'Stimulant Dealer', requiredTier: 'friendly', inventory: ['silver_tongue_drops', 'ghost_serum', 'focus_stim', 'liquid_luck', 'combat_stim'] }
        ],
        questlines: [
            { id: 'neon_debut', name: 'The Grand Debut', description: 'Attend the Neon Gala and survive the politics.', minTier: 'friendly' },
            { id: 'neon_scandal', name: 'A Beautiful Scandal', description: 'Dig up blackmail on a rival courtier.', minTier: 'friendly' },
            { id: 'neon_coronation', name: 'The New Radiance', description: 'Choose the next ruler of the Neon Court.', minTier: 'allied' }
        ]
    },

    // =========================================================================
    //  THE CIRCUIT SAINTS
    // =========================================================================

    circuitSaints: {
        id: 'circuitSaints',
        name: 'The Circuit Saints',
        description: 'A techno-religious order that worships the machine spirit they believe dwells within all networked systems. They maintain the city\'s aging infrastructure and guard ancient pre-collapse technology. Part monks, part engineers, entirely devoted to the digital divine.',
        ideology: 'Techno-theocratic, preservation-focused, neutral mediators',
        leader: 'High Compiler Ezra-7',
        leaderDescription: 'A heavily augmented human whose consciousness is partially distributed across the city\'s network. Speaks in riddles that are actually compressed data.',
        headquarters: 'The Observatory (converted server farm)',
        color: '#2980b9',
        motto: 'In the circuit, truth. In the code, salvation.',
        joinRequirements: { level: 4, minReputation: 15, tech: 12 },
        recruitmentMethod: 'Bring a piece of pre-collapse technology to the Cathedral as an offering. The Saints test your reverence for the machine.',
        tiers: {
            hostile: {
                min: -100,
                max: -51,
                label: 'Heretic',
                perks: [],
                penalties: ['circuit_excommunicated', 'tech_vendor_barred', 'circuit_curse']
            },
            unfriendly: {
                min: -50,
                max: -11,
                label: 'Uninitiated',
                perks: [],
                penalties: ['circuit_repair_refusal']
            },
            neutral: {
                min: -10,
                max: 10,
                label: 'Seeker',
                perks: [],
                penalties: []
            },
            friendly: {
                min: 11,
                max: 50,
                label: 'Acolyte',
                perks: ['circuit_repair_service', 'circuit_tech_discount', 'circuit_blessing'],
                penalties: []
            },
            allied: {
                min: 51,
                max: 100,
                label: 'Ordained',
                perks: ['circuit_ending_access', 'circuit_sigil_access', 'circuit_saint_missions', 'circuit_overclock_ability', 'circuit_ancient_tech_vendor'],
                penalties: []
            }
        },
        rivals: {
            ironCollective: 0.1,
            neonCourt: -0.1,
            ghostSyndicate: -0.2,
            ashenCircle: -0.5
        },
        vendors: [
            { name: 'Brother Ohm', role: 'Techsmith', requiredTier: 'friendly', inventory: ['hacking_spike', 'drone_controller', 'emp_grenade', 'neural_disruptor', 'smart_turret'] },
            { name: 'Sister Flux', role: 'Implant Specialist', requiredTier: 'friendly', inventory: ['neural_co_processor', 'targeting_eye', 'reflex_booster', 'biomonitor', 'data_leech'] }
        ],
        questlines: [
            { id: 'circuit_pilgrimage', name: 'Digital Pilgrimage', description: 'Recover a lost server node from the Undercity.', minTier: 'friendly' },
            { id: 'circuit_schism', name: 'The Schism', description: 'Heal the rift between orthodox and reformist Saints.', minTier: 'friendly' },
            { id: 'circuit_ascension', name: 'The Great Compilation', description: 'Help the High Compiler achieve digital transcendence.', minTier: 'allied' }
        ]
    },

    // =========================================================================
    //  THE GHOST SYNDICATE
    // =========================================================================

    ghostSyndicate: {
        id: 'ghostSyndicate',
        name: 'The Ghost Syndicate',
        description: 'The city\'s organized crime network, dealing in everything from contraband and information to black-market stacks and illegal body modifications. They operate through layers of intermediaries and deniability. In a city of surveillance, the Ghosts are the ones nobody can find.',
        ideology: 'Pragmatic, profit-driven, libertarian underworld',
        leader: 'The Broker',
        leaderDescription: 'Nobody has ever seen the Broker\'s real face. Some say they are a distributed AI. Others say they are everyone and no one. All deals flow through them.',
        headquarters: 'The Deep Net Cafe (shifting network of safehouses and tunnels)',
        color: '#7f8c8d',
        motto: 'Everything has a price. Everyone is for sale.',
        joinRequirements: { level: 3, minReputation: 10 },
        recruitmentMethod: 'Complete a job for a Syndicate contact. If you survive and stay quiet, more work follows. Trust is earned in silence.',
        tiers: {
            hostile: {
                min: -100,
                max: -51,
                label: 'Marked',
                perks: [],
                penalties: ['ghost_contract', 'black_market_barred', 'ghost_poison_chance']
            },
            unfriendly: {
                min: -50,
                max: -11,
                label: 'Liability',
                perks: [],
                penalties: ['ghost_price_hike']
            },
            neutral: {
                min: -10,
                max: 10,
                label: 'Nobody',
                perks: [],
                penalties: []
            },
            friendly: {
                min: 11,
                max: 50,
                label: 'Associate',
                perks: ['ghost_black_market', 'ghost_fence', 'ghost_info_broker'],
                penalties: []
            },
            allied: {
                min: 51,
                max: 100,
                label: 'Made',
                perks: ['ghost_ending_access', 'ghost_coin_access', 'ghost_syndicate_missions', 'ghost_vanish_ability', 'ghost_smuggler_network'],
                penalties: []
            }
        },
        rivals: {
            ironCollective: -0.2,
            neonCourt: 0.0,
            circuitSaints: -0.2,
            ashenCircle: -0.3
        },
        vendors: [
            { name: 'Whisper', role: 'Black Market Dealer', requiredTier: 'friendly', inventory: ['gauss_pistol', 'sniper_laser', 'hand_crossbow', 'arc_thrower', 'virus_injector', 'contraband_chips'] },
            { name: 'Patch', role: 'Back-Alley Doc', requiredTier: 'friendly', inventory: ['nano_heal', 'full_restore', 'overclock_injection', 'neural_reset', 'dermal_plating', 'trauma_dampener'] }
        ],
        questlines: [
            { id: 'ghost_initiation', name: 'Dead Drop', description: 'Deliver a package with no questions asked.', minTier: 'friendly' },
            { id: 'ghost_heist', name: 'The Big Score', description: 'Pull off the heist of the century on a stack-lord vault.', minTier: 'friendly' },
            { id: 'ghost_broker', name: 'Meeting the Broker', description: 'Earn an audience with the Broker and learn the truth behind the Syndicate.', minTier: 'allied' }
        ]
    },

    // =========================================================================
    //  THE ASHEN CIRCLE
    // =========================================================================

    ashenCircle: {
        id: 'ashenCircle',
        name: 'The Ashen Circle',
        description: 'A nihilistic cult that believes the world ended long ago and everything since is a corrupted echo. They seek to accelerate the final dissolution of reality through forbidden technology and void manipulation. To outsiders they are terrorists. To themselves, they are mercy.',
        ideology: 'Nihilistic, apocalyptic, void-obsessed',
        leader: 'The Ashen Voice',
        leaderDescription: 'A figure wrapped in grey who speaks with the voice of everyone who ever believed in nothing. May not be a single person at all.',
        headquarters: 'The Ossuary (ruined district at the city edge, half-consumed by void anomalies)',
        color: '#95a5a6',
        motto: 'All things end. We are the ending.',
        joinRequirements: { level: 7, minReputation: 25, wisdom: 13 },
        recruitmentMethod: 'Survive exposure to a void anomaly. Those who return unchanged were never worthy. Those who return changed are welcomed.',
        tiers: {
            hostile: {
                min: -100,
                max: -51,
                label: 'Clinger',
                perks: [],
                penalties: ['ashen_void_attacks', 'ashfall_lethal', 'ashen_curse']
            },
            unfriendly: {
                min: -50,
                max: -11,
                label: 'Deluded',
                perks: [],
                penalties: ['ashen_unease']
            },
            neutral: {
                min: -10,
                max: 10,
                label: 'Unawakened',
                perks: [],
                penalties: []
            },
            friendly: {
                min: 11,
                max: 50,
                label: 'Awakened',
                perks: ['ashen_void_resist', 'ashen_meditation', 'ashen_safe_passage'],
                penalties: []
            },
            allied: {
                min: 51,
                max: 100,
                label: 'Herald',
                perks: ['ashen_ending_access', 'ashen_mask_access', 'ashen_circle_missions', 'ashen_void_touch_ability', 'ashen_entropy_field'],
                penalties: []
            }
        },
        rivals: {
            ironCollective: -0.1,
            neonCourt: -0.3,
            circuitSaints: -0.5,
            ghostSyndicate: -0.3
        },
        vendors: [
            { name: 'The Hollow', role: 'Void Merchant', requiredTier: 'friendly', inventory: ['void_resonator', 'neural_disruptor', 'sonic_emitter', 'plasma_caster', 'ghost_serum'] },
            { name: 'Ash', role: 'Nihilist Apothecary', requiredTier: 'friendly', inventory: ['neural_reset', 'stack_purge', 'berserker_compound', 'rad_flush', 'clarity_tab', 'nano_heal'] }
        ],
        questlines: [
            { id: 'ashen_witness', name: 'Witness the Void', description: 'Enter the Ashfall and survive what you see.', minTier: 'friendly' },
            { id: 'ashen_unmaking', name: 'The Unmaking', description: 'Destroy a pre-collapse facility sustaining the city\'s reality anchor.', minTier: 'friendly' },
            { id: 'ashen_ending', name: 'The Final Frequency', description: 'Choose whether to accelerate or prevent the dissolution of everything.', minTier: 'allied' }
        ]
    }
};
