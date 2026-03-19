/**
 * LATENCY - Jobs Data
 * ============================================================
 * Six career paths, each with four ranks of progression.
 * Jobs provide salary income, stat-gated promotions, ability
 * unlocks, and tie into faction questlines.
 *
 * Rank requirements are cumulative - you must meet all listed
 * stat and level thresholds to be promoted.
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.JobsData = {

    // =========================================================================
    //  ENFORCER - Muscle for hire
    // =========================================================================

    enforcer: {
        id: 'enforcer',
        name: 'Enforcer',
        description: 'Muscle for hire. Break legs, collect debts, guard shipments. The Iron Collective always needs strong arms and stronger stomachs.',
        primaryStat: 'strength',
        secondaryStat: 'constitution',
        ranks: [
            {
                rank: 0,
                title: 'Thug',
                salary: 10,
                unlocks: [],
                requirements: {}
            },
            {
                rank: 1,
                title: 'Bruiser',
                salary: 25,
                unlocks: ['ability_intimidate'],
                requirements: { level: 3, strength: 13 }
            },
            {
                rank: 2,
                title: 'Lieutenant',
                salary: 50,
                unlocks: ['enforcer_questline'],
                requirements: { level: 7, strength: 15, constitution: 13 }
            },
            {
                rank: 3,
                title: 'Warlord',
                salary: 100,
                unlocks: ['enforcer_ending'],
                requirements: { level: 12, strength: 18, constitution: 15 }
            }
        ],
        storyFile: 'story/jobs/enforcer.json',
        associatedFaction: 'ironCollective'
    },

    // =========================================================================
    //  HACKER - Digital infiltrator
    // =========================================================================

    hacker: {
        id: 'hacker',
        name: 'Hacker',
        description: 'Digital ghost. Crack networks, steal data, rewrite reality one line of code at a time. The Ghost Network values those who can move through systems unseen.',
        primaryStat: 'tech',
        secondaryStat: 'intelligence',
        ranks: [
            {
                rank: 0,
                title: 'Script Kiddie',
                salary: 12,
                unlocks: [],
                requirements: {}
            },
            {
                rank: 1,
                title: 'Netrunner',
                salary: 30,
                unlocks: ['ability_hack_terminal'],
                requirements: { level: 3, tech: 13, intelligence: 12 }
            },
            {
                rank: 2,
                title: 'Phantom',
                salary: 60,
                unlocks: ['hacker_questline'],
                requirements: { level: 7, tech: 16, intelligence: 14 }
            },
            {
                rank: 3,
                title: 'Zero Day',
                salary: 120,
                unlocks: ['hacker_ending'],
                requirements: { level: 12, tech: 18, intelligence: 16 }
            }
        ],
        storyFile: 'story/jobs/hacker.json',
        associatedFaction: 'ghostSyndicate'
    },

    // =========================================================================
    //  MEDIC - Healer and surgeon
    // =========================================================================

    medic: {
        id: 'medic',
        name: 'Medic',
        description: 'Patch wounds, install implants, keep people alive against the odds. In a city that chews people up, healers are always in demand. Neutral by necessity.',
        primaryStat: 'wisdom',
        secondaryStat: 'intelligence',
        ranks: [
            {
                rank: 0,
                title: 'Orderly',
                salary: 8,
                unlocks: [],
                requirements: {}
            },
            {
                rank: 1,
                title: 'Field Medic',
                salary: 22,
                unlocks: ['ability_first_aid'],
                requirements: { level: 3, wisdom: 13, intelligence: 12 }
            },
            {
                rank: 2,
                title: 'Surgeon',
                salary: 55,
                unlocks: ['medic_questline'],
                requirements: { level: 7, wisdom: 15, intelligence: 14 }
            },
            {
                rank: 3,
                title: 'Chief of Medicine',
                salary: 110,
                unlocks: ['medic_ending'],
                requirements: { level: 12, wisdom: 18, intelligence: 16 }
            }
        ],
        storyFile: 'story/jobs/medic.json',
        associatedFaction: null
    },

    // =========================================================================
    //  SMUGGLER - Contraband runner
    // =========================================================================

    smuggler: {
        id: 'smuggler',
        name: 'Smuggler',
        description: 'Move contraband through the city\'s cracks. Dodge patrols, bribe officials, outrun pursuers. Quick hands and a quicker tongue keep you alive in the trade.',
        primaryStat: 'dexterity',
        secondaryStat: 'charisma',
        ranks: [
            {
                rank: 0,
                title: 'Runner',
                salary: 15,
                unlocks: [],
                requirements: {}
            },
            {
                rank: 1,
                title: 'Courier',
                salary: 35,
                unlocks: ['ability_smuggle'],
                requirements: { level: 3, dexterity: 13, charisma: 12 }
            },
            {
                rank: 2,
                title: 'Fixer',
                salary: 65,
                unlocks: ['smuggler_questline'],
                requirements: { level: 7, dexterity: 15, charisma: 14 }
            },
            {
                rank: 3,
                title: 'Kingpin',
                salary: 130,
                unlocks: ['smuggler_ending'],
                requirements: { level: 12, dexterity: 17, charisma: 16 }
            }
        ],
        storyFile: 'story/jobs/smuggler.json',
        associatedFaction: 'ghostSyndicate'
    },

    // =========================================================================
    //  GLADIATOR - Arena fighter
    // =========================================================================

    gladiator: {
        id: 'gladiator',
        name: 'Gladiator',
        description: 'Fight for fame and credits in the arena. Blood sport is the city\'s favorite entertainment. The Neon Court sponsors the best fighters and reaps the profits.',
        primaryStat: 'strength',
        secondaryStat: 'dexterity',
        ranks: [
            {
                rank: 0,
                title: 'Pit Fighter',
                salary: 12,
                unlocks: [],
                requirements: {}
            },
            {
                rank: 1,
                title: 'Arena Warrior',
                salary: 30,
                unlocks: ['ability_battle_cry'],
                requirements: { level: 3, strength: 13, dexterity: 12 }
            },
            {
                rank: 2,
                title: 'Champion',
                salary: 70,
                unlocks: ['gladiator_questline'],
                requirements: { level: 7, strength: 16, dexterity: 14 }
            },
            {
                rank: 3,
                title: 'Grand Champion',
                salary: 140,
                unlocks: ['gladiator_ending'],
                requirements: { level: 12, strength: 18, dexterity: 16 }
            }
        ],
        storyFile: 'story/jobs/gladiator.json',
        associatedFaction: 'neonCourt'
    },

    // =========================================================================
    //  DIPLOMAT - Negotiator and dealmaker
    // =========================================================================

    diplomat: {
        id: 'diplomat',
        name: 'Diplomat',
        description: 'Negotiate treaties, broker deals, manipulate factions. Words are weapons and alliances are currency. The right conversation can topple empires.',
        primaryStat: 'charisma',
        secondaryStat: 'wisdom',
        ranks: [
            {
                rank: 0,
                title: 'Aide',
                salary: 10,
                unlocks: [],
                requirements: {}
            },
            {
                rank: 1,
                title: 'Envoy',
                salary: 28,
                unlocks: ['ability_persuade'],
                requirements: { level: 3, charisma: 13, wisdom: 12 }
            },
            {
                rank: 2,
                title: 'Ambassador',
                salary: 60,
                unlocks: ['diplomat_questline'],
                requirements: { level: 7, charisma: 16, wisdom: 14 }
            },
            {
                rank: 3,
                title: 'Chancellor',
                salary: 125,
                unlocks: ['diplomat_ending'],
                requirements: { level: 12, charisma: 18, wisdom: 16 }
            }
        ],
        storyFile: 'story/jobs/diplomat.json',
        associatedFaction: null
    }
};
