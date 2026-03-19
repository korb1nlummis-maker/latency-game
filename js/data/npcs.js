/**
 * LATENCY - NPC Data
 * ============================================================
 * Named NPCs with personality, location, faction affiliation,
 * available services, dialogue lines, and quest-giver status.
 *
 * Dialogue keys map to relationship tiers:
 *   hostile, unfriendly, neutral/greeting, friendly, romantic
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.NpcsData = {

    // =========================================================================
    //  UNDERCITY NPCs
    // =========================================================================

    mako: {
        id: 'mako',
        name: 'Mako',
        title: 'Mechanic & Info Broker',
        race: 'human',
        location: 'lower_slums',
        faction: 'ghostSyndicate',
        personality: 'Cautious but kind. Speaks in clipped sentences. Trusts actions over words.',
        dialogue: {
            hostile: 'We\'re done talking.',
            unfriendly: 'I don\'t know you. Keep walking.',
            greeting: 'What do you need?',
            neutral: 'What do you need?',
            friendly: 'Good to see you. Got something interesting.',
            romantic: 'You\'re the only good thing in this rusted-out hell.'
        },
        services: ['repair', 'info'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/mako.txt'
    },

    commander_vex: {
        id: 'commander_vex',
        name: 'Commander Vex',
        title: 'Leader of the Iron Collective',
        race: 'human',
        location: 'the_foundry',
        faction: 'ironCollective',
        personality: 'Fierce, principled, and uncompromising. Carries the weight of every worker who died under stack-lord negligence.',
        dialogue: {
            hostile: 'You stand with the oppressors. Leave before I make you.',
            unfriendly: 'Actions speak. Yours have been lacking.',
            greeting: 'The Collective watches everyone. What do you want?',
            neutral: 'The Collective watches everyone. What do you want?',
            friendly: 'Comrade. The revolution needs you.',
            romantic: 'In another life, maybe. This one belongs to the cause.'
        },
        services: ['faction_quests', 'iron_missions'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/vex.txt'
    },

    archon_luminara: {
        id: 'archon_luminara',
        name: 'Archon Luminara',
        title: 'The Radiant Queen',
        race: 'cyborg',
        location: 'the_spire',
        faction: 'neonCourt',
        personality: 'Elegant, calculating, centuries old. Every word is a chess move. Her beauty is engineered and her cruelty is refined.',
        dialogue: {
            hostile: 'How quaint. You think you matter enough to oppose me.',
            unfriendly: 'You bore me. Do better.',
            greeting: 'Another supplicant. Entertain me.',
            neutral: 'Another supplicant. Entertain me.',
            friendly: 'You have potential. A rare commodity.',
            romantic: 'Careful. My affections have consumed stronger souls than yours.'
        },
        services: ['faction_quests', 'neon_missions'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/luminara.txt'
    },

    zero: {
        id: 'zero',
        name: 'Zero',
        title: 'Ghost Network Operative',
        race: 'synth',
        location: 'deep_net_cafe',
        faction: 'ghostSyndicate',
        personality: 'Paranoid, brilliant, always scanning exits. Communicates in data-dense bursts. Trusts no one fully.',
        dialogue: {
            hostile: 'Connection terminated. Permanently.',
            unfriendly: 'Your threat assessment is elevated. Maintain distance.',
            greeting: 'Scanning. State your purpose.',
            neutral: 'Scanning. State your purpose.',
            friendly: 'Clean signal. I have work if you want it.',
            romantic: 'My emotional subroutines are... experiencing unexpected output around you.'
        },
        services: ['hacking', 'info', 'black_market'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/zero.txt'
    },

    the_broker: {
        id: 'the_broker',
        name: 'The Broker',
        title: 'Master of the Ghost Syndicate',
        race: 'shadowkin',
        location: 'deep_net_cafe',
        faction: 'ghostSyndicate',
        personality: 'Unknown. Multiple voices, multiple faces. May be an AI, a collective, or something else entirely. Every word has a price.',
        dialogue: {
            hostile: 'Your file has been flagged. Every contact you have will know.',
            unfriendly: 'You owe more than you can pay. This meeting is over.',
            greeting: 'Everyone comes to the Broker eventually. What can you afford?',
            neutral: 'Everyone comes to the Broker eventually. What can you afford?',
            friendly: 'A valued client. I have opportunities others would kill for.',
            romantic: 'Love is a vulnerability I do not permit. But your account is in excellent standing.'
        },
        services: ['faction_quests', 'ghost_missions', 'exclusive_deals'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/broker.txt'
    },

    high_priestess_sable: {
        id: 'high_priestess_sable',
        name: 'High Priestess Sable',
        title: 'Voice of the Ashen Circle',
        race: 'human',
        location: 'the_ossuary',
        faction: 'ashenCircle',
        personality: 'Serene in a way that unsettles. Speaks of annihilation with the tenderness of a lullaby. Has seen beyond the veil and returned changed.',
        dialogue: {
            hostile: 'You cling to a world that has already ended. How sad.',
            unfriendly: 'The void does not judge. But I do.',
            greeting: 'Welcome to the ending, child. Are you ready to listen?',
            neutral: 'Welcome to the ending, child. Are you ready to listen?',
            friendly: 'You begin to see. The dissolution is not death. It is release.',
            romantic: 'Even in the void, there is warmth. You are that warmth.'
        },
        services: ['faction_quests', 'ashen_missions', 'void_training'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/sable.txt'
    },

    high_compiler_ezra: {
        id: 'high_compiler_ezra',
        name: 'High Compiler Ezra-7',
        title: 'Leader of the Circuit Saints',
        race: 'cyborg',
        location: 'observatory',
        faction: 'circuitSaints',
        personality: 'Speaks in riddles that are compressed data. Half his consciousness runs on the city network. Genuinely wants to preserve knowledge.',
        dialogue: {
            hostile: 'You corrupt the data stream. Purging contact.',
            unfriendly: 'Your logic trees are malformed. Seek clarity.',
            greeting: 'A new process enters the queue. State your function.',
            neutral: 'A new process enters the queue. State your function.',
            friendly: 'Your runtime has been exemplary. The machine spirit smiles upon you.',
            romantic: 'My distributed consciousness converges on a single focus when you are near. This is... inefficient. I do not wish it to stop.'
        },
        services: ['faction_quests', 'circuit_missions', 'tech_training'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/ezra.txt'
    },

    // =========================================================================
    //  VENDOR & SERVICE NPCs
    // =========================================================================

    hammer: {
        id: 'hammer',
        name: 'Hammer',
        title: 'Iron Collective Armorer',
        race: 'human',
        location: 'the_foundry',
        faction: 'ironCollective',
        personality: 'Gruff, practical, proud of her work. Tests every piece of armor by wearing it into a fight.',
        dialogue: {
            hostile: 'Collective steel isn\'t for sale to enemies.',
            unfriendly: 'Prove yourself first.',
            greeting: 'Need gear? I forge it strong.',
            neutral: 'Need gear? I forge it strong.',
            friendly: 'Comrade. Best iron in the city, right here.'
        },
        services: ['shop_armor', 'shop_weapons', 'repair'],
        questGiver: false,
        ascii: 'assets/ascii/npcs/hammer.txt'
    },

    doc_rivet: {
        id: 'doc_rivet',
        name: 'Doc Rivet',
        title: 'Iron Collective Field Medic',
        race: 'human',
        location: 'the_foundry',
        faction: 'ironCollective',
        personality: 'Tired, compassionate, gallows humor. Has patched more wounds than any licensed doctor in the city.',
        dialogue: {
            hostile: 'I took an oath. But don\'t test it.',
            unfriendly: 'Bleeding? Fine. Sit down.',
            greeting: 'Who needs patching up?',
            neutral: 'Who needs patching up?',
            friendly: 'Hey, try not to get killed out there. I\'m running low on synth-blood.'
        },
        services: ['heal', 'shop_medical', 'cure'],
        questGiver: false,
        ascii: 'assets/ascii/npcs/rivet.txt'
    },

    silk: {
        id: 'silk',
        name: 'Silk',
        title: 'Neon Court Couturier',
        race: 'synth',
        location: 'the_spire',
        faction: 'neonCourt',
        personality: 'Flamboyant, judgmental about fashion, secretly kind. Designs armor that looks like haute couture.',
        dialogue: {
            hostile: 'Ugh. Please leave before you ruin the aesthetic.',
            unfriendly: 'I don\'t dress just anyone, darling.',
            greeting: 'Hmm. You need work. Lots of work. Lucky for you, I\'m brilliant.',
            neutral: 'Hmm. You need work. Lots of work. Lucky for you, I\'m brilliant.',
            friendly: 'Darling! I have something fabulous for you.'
        },
        services: ['shop_armor', 'shop_accessories'],
        questGiver: false,
        ascii: 'assets/ascii/npcs/silk.txt'
    },

    whisper: {
        id: 'whisper',
        name: 'Whisper',
        title: 'Black Market Arms Dealer',
        race: 'shadowkin',
        location: 'black_market_bazaar',
        faction: 'ghostSyndicate',
        personality: 'Speaks softly. Sells loudly. Never reveals sources. Has connections everywhere and enemies in equal measure.',
        dialogue: {
            hostile: 'Your credit is no good here. Ever.',
            unfriendly: 'Cash only. No names. No promises.',
            greeting: 'Looking for something the corps don\'t want you to have?',
            neutral: 'Looking for something the corps don\'t want you to have?',
            friendly: 'Special stock, just for you. Don\'t ask where I got it.'
        },
        services: ['shop_weapons', 'shop_contraband'],
        questGiver: false,
        ascii: 'assets/ascii/npcs/whisper.txt'
    },

    patch: {
        id: 'patch',
        name: 'Patch',
        title: 'Back-Alley Doc',
        race: 'human',
        location: 'black_market_bazaar',
        faction: 'ghostSyndicate',
        personality: 'Steady hands, questionable ethics, reasonable prices. Lost her medical license for treating people the corps wanted dead.',
        dialogue: {
            hostile: 'Find another doctor. Oh wait, you can\'t afford one.',
            unfriendly: 'Cash up front. I don\'t do charity.',
            greeting: 'On the table. Show me where it hurts.',
            neutral: 'On the table. Show me where it hurts.',
            friendly: 'Usual check-up? I\'ll throw in a stim shot, on the house.'
        },
        services: ['heal', 'shop_medical', 'implant_surgery'],
        questGiver: false,
        ascii: 'assets/ascii/npcs/patch.txt'
    },

    brother_ohm: {
        id: 'brother_ohm',
        name: 'Brother Ohm',
        title: 'Circuit Saints Techsmith',
        race: 'cyborg',
        location: 'observatory',
        faction: 'circuitSaints',
        personality: 'Reverent toward technology. Treats every circuit board like a holy relic. Hums while he works.',
        dialogue: {
            hostile: 'The machine spirit rejects you. As do I.',
            unfriendly: 'You lack proper reverence for the technology.',
            greeting: 'The circuit provides. What do you seek?',
            neutral: 'The circuit provides. What do you seek?',
            friendly: 'Blessed be your processes. Let me show you the latest offerings.'
        },
        services: ['shop_tech', 'shop_weapons', 'repair'],
        questGiver: false,
        ascii: 'assets/ascii/npcs/ohm.txt'
    },

    sister_flux: {
        id: 'sister_flux',
        name: 'Sister Flux',
        title: 'Circuit Saints Implant Specialist',
        race: 'cyborg',
        location: 'observatory',
        faction: 'circuitSaints',
        personality: 'Precise, methodical, deeply spiritual about the merger of flesh and machine. Her surgical suite is also a chapel.',
        dialogue: {
            hostile: 'Your body rejects the divine circuit. I cannot help you.',
            unfriendly: 'Pray to the machine spirit first. Then we talk.',
            greeting: 'The body is hardware. The soul is software. I optimize both.',
            neutral: 'The body is hardware. The soul is software. I optimize both.',
            friendly: 'I have been meditating on improvements for you. Shall we begin?'
        },
        services: ['shop_implants', 'implant_surgery', 'shop_accessories'],
        questGiver: false,
        ascii: 'assets/ascii/npcs/flux.txt'
    },

    // =========================================================================
    //  STORY NPCs
    // =========================================================================

    kira: {
        id: 'kira',
        name: 'Kira',
        title: 'Runaway Stack Heir',
        race: 'human',
        location: 'upper_slums',
        faction: null,
        personality: 'Sheltered but determined. Ran from privilege to find meaning. Naive but learning fast. Sees the best in people until proven wrong.',
        dialogue: {
            hostile: 'I thought you were different. I was wrong.',
            unfriendly: 'I\'m still figuring things out. Give me space.',
            greeting: 'Hey. This place is... not what I expected.',
            neutral: 'Hey. This place is... not what I expected.',
            friendly: 'You make this city feel less terrifying. Thank you.',
            romantic: 'I never believed in fate. But meeting you makes me wonder.'
        },
        services: [],
        questGiver: true,
        ascii: 'assets/ascii/npcs/kira.txt'
    },

    rust: {
        id: 'rust',
        name: 'Rust',
        title: 'Veteran Scavenger',
        race: 'cyborg',
        location: 'scrap_yards',
        faction: 'ironCollective',
        personality: 'Old, scarred, missing an arm he never replaced. Knows the undercity better than anyone alive. Tells stories that might be true.',
        dialogue: {
            hostile: 'Bad move, kid. I\'ve buried better than you.',
            unfriendly: 'Don\'t touch my stuff.',
            greeting: 'Another scrapper? Watch your step. Ground shifts down here.',
            neutral: 'Another scrapper? Watch your step. Ground shifts down here.',
            friendly: 'Kid, let me tell you about what\'s really buried under this city.'
        },
        services: ['info', 'guide'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/rust.txt'
    },

    jade: {
        id: 'jade',
        name: 'Jade',
        title: 'Arena Manager',
        race: 'human',
        location: 'arena_district',
        faction: 'neonCourt',
        personality: 'All business, sharp tongue, respects only strength and showmanship. Runs the arena with an iron fist in a velvet glove.',
        dialogue: {
            hostile: 'You\'re banned. Get out before security throws you out.',
            unfriendly: 'You want to fight? Pay the entry fee like everyone else.',
            greeting: 'Fresh meat. Think you can handle the arena?',
            neutral: 'Fresh meat. Think you can handle the arena?',
            friendly: 'My favorite fighter. I\'ve got a special match lined up for you.'
        },
        services: ['arena_fights', 'arena_bets'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/jade.txt'
    },

    ember: {
        id: 'ember',
        name: 'Ember',
        title: 'Neon Strip Bartender',
        race: 'synth',
        location: 'neon_strip',
        faction: null,
        personality: 'Warm, observant, hears everything. The best info broker in the city is the one everyone talks to without thinking about it.',
        dialogue: {
            hostile: 'Bar\'s closed. For you.',
            unfriendly: 'Drink or leave. Your choice.',
            greeting: 'What\'ll it be? I mix drinks and keep secrets.',
            neutral: 'What\'ll it be? I mix drinks and keep secrets.',
            friendly: 'Usual spot\'s open. And I heard something you might want to know.',
            romantic: 'You know, most people tell me their problems. With you, I just want to listen.'
        },
        services: ['info', 'shop_drinks', 'rumors'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/ember.txt'
    },

    sentinel: {
        id: 'sentinel',
        name: 'Sentinel',
        title: 'Corporate Security Chief',
        race: 'synth',
        location: 'corporate_spires',
        faction: null,
        personality: 'By the book, incorruptible, programmed with a rigid sense of justice. The rarest thing in the city: an honest cop.',
        dialogue: {
            hostile: 'You are flagged for immediate detention. Surrender.',
            unfriendly: 'Move along, citizen. You are being monitored.',
            greeting: 'Citizen. State your business in the corporate sector.',
            neutral: 'Citizen. State your business in the corporate sector.',
            friendly: 'I have reviewed your record. You are... an anomaly I respect.'
        },
        services: ['bounties', 'security_clearance'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/sentinel.txt'
    },

    hollow: {
        id: 'hollow',
        name: 'The Hollow',
        title: 'Void Merchant',
        race: 'shadowkin',
        location: 'the_ossuary',
        faction: 'ashenCircle',
        personality: 'Speaks in echoes. Sells items that should not exist. May be partially dissolved into the void. Prices are fair, considering.',
        dialogue: {
            hostile: 'The void remembers your offense. It does not forgive.',
            unfriendly: 'You are too solid for this place. Leave.',
            greeting: 'What you seek finds you. I merely facilitate.',
            neutral: 'What you seek finds you. I merely facilitate.',
            friendly: 'The void whispers your name with something approaching warmth.'
        },
        services: ['shop_void_items', 'shop_weapons'],
        questGiver: false,
        ascii: 'assets/ascii/npcs/hollow.txt'
    },

    dr_chen: {
        id: 'dr_chen',
        name: 'Dr. Chen',
        title: 'Stack Clinic Director',
        race: 'human',
        location: 'stack_clinic',
        faction: null,
        personality: 'Brilliant, ethical within her own framework, deeply conflicted about immortality being restricted to the wealthy.',
        dialogue: {
            hostile: 'Security has been notified. This is a sterile environment.',
            unfriendly: 'This facility serves registered clients only.',
            greeting: 'The Stack Clinic maintains consciousness. How can I help?',
            neutral: 'The Stack Clinic maintains consciousness. How can I help?',
            friendly: 'Between you and me, the things I\'ve seen in these stacks... we need to talk.'
        },
        services: ['stack_maintenance', 'heal', 'info'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/chen.txt'
    },

    rook: {
        id: 'rook',
        name: 'Rook',
        title: 'Transit Hub Fixer',
        race: 'human',
        location: 'transit_hub',
        faction: 'ghostSyndicate',
        personality: 'Always moving, always watching. Knows every schedule, every guard rotation, every blind spot in the transit system.',
        dialogue: {
            hostile: 'Your face is on every scanner in the hub. Disappear.',
            unfriendly: 'I don\'t know you. That\'s deliberate.',
            greeting: 'Need to move something? Or someone? I know the routes.',
            neutral: 'Need to move something? Or someone? I know the routes.',
            friendly: 'Got a window in the security rotation. Forty seconds. Interested?'
        },
        services: ['fast_travel', 'smuggling', 'info'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/rook.txt'
    },

    oracle: {
        id: 'oracle',
        name: 'Oracle',
        title: 'Sewer Prophet',
        race: 'shadowkin',
        location: 'sewer_network',
        faction: 'ashenCircle',
        personality: 'Mad or enlightened, nobody is sure. Speaks prophecies in the dark. Some of them come true. Lives in the sewers by choice.',
        dialogue: {
            hostile: 'The patterns scream when you are near. Leave.',
            unfriendly: 'The future avoids you. Interesting.',
            greeting: 'I see you. All the versions of you. Most of them end badly.',
            neutral: 'I see you. All the versions of you. Most of them end badly.',
            friendly: 'The timeline bends around you like light around a star. You are important.'
        },
        services: ['prophecy', 'info'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/oracle.txt'
    },

    prism: {
        id: 'prism',
        name: 'Prism',
        title: 'Neon Court Stimulant Dealer',
        race: 'human',
        location: 'the_spire',
        faction: 'neonCourt',
        personality: 'Smooth, always smiling, never blinks enough. Samples his own product but functions perfectly. The Court\'s favorite pharmacist.',
        dialogue: {
            hostile: 'Your invitation has been revoked. Permanently.',
            unfriendly: 'I deal in experiences, not charity.',
            greeting: 'Looking to expand your consciousness? I have just the thing.',
            neutral: 'Looking to expand your consciousness? I have just the thing.',
            friendly: 'My best customer. I\'ve been saving something special for you.'
        },
        services: ['shop_stims', 'shop_consumables'],
        questGiver: false,
        ascii: 'assets/ascii/npcs/prism.txt'
    },

    senator_cross: {
        id: 'senator_cross',
        name: 'Senator Cross',
        title: 'Reformist Politician',
        race: 'human',
        location: 'senate_hall',
        faction: null,
        personality: 'Idealistic, increasingly desperate. One of the few genuine politicians left. Surrounded by enemies and running out of allies.',
        dialogue: {
            hostile: 'Even my enemies are more subtle than you.',
            unfriendly: 'I don\'t have time for distractions.',
            greeting: 'Another citizen. I wish I had better news for you.',
            neutral: 'Another citizen. I wish I had better news for you.',
            friendly: 'I need someone I can trust. That list gets shorter every day.'
        },
        services: ['political_quests', 'info'],
        questGiver: true,
        ascii: 'assets/ascii/npcs/cross.txt'
    },

    ash: {
        id: 'ash',
        name: 'Ash',
        title: 'Nihilist Apothecary',
        race: 'human',
        location: 'the_ossuary',
        faction: 'ashenCircle',
        personality: 'Calm acceptance of oblivion. Mixes medicines and poisons with equal care. Genuinely does not care if you live or die, but will sell you either outcome.',
        dialogue: {
            hostile: 'All things end. Your welcome here ended first.',
            unfriendly: 'Buy something or dissolve. I don\'t mind which.',
            greeting: 'Healing or hurting? Both are temporary.',
            neutral: 'Healing or hurting? Both are temporary.',
            friendly: 'For you, I mixed something that delays the inevitable a little longer.'
        },
        services: ['shop_medical', 'shop_poisons', 'cure'],
        questGiver: false,
        ascii: 'assets/ascii/npcs/ash.txt'
    }
};
