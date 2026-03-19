/**
 * LATENCY - Side Quests Data
 * ============================================================
 * 20 optional side quests spread across all four districts.
 * Each quest has multiple steps, skill checks, combat encounters,
 * moral choices, and tangible rewards.
 *
 * Quest statuses (tracked in player state):
 *   undiscovered, discovered, active, step_N, completed, failed
 *
 * Step types:
 *   narrative    — text + choices
 *   skill_check  — stat-based roll (DC = difficulty class)
 *   combat       — fight encounter(s) from Enemies data
 *   choice       — moral / branching decision
 *   fetch        — requires item in inventory
 *   puzzle       — multi-part logic or code-breaking
 *
 * Flags are written to player.questFlags and read by
 * the ConditionEval system for cross-quest / ending gates.
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.SideQuests = {

    // =========================================================================
    //  UNDERCITY — Quests 1-5
    // =========================================================================

    rat_kings_crown: {
        id: 'rat_kings_crown',
        name: "Rat King's Crown",
        description: 'The sewer network beneath the Lower Slums is overrun with mutant rats — oversized, radiation-warped, and organized under a massive alpha dubbed the Rat King. The local residents are desperate for someone brave or stupid enough to clear the infestation.',
        location: 'sewer_network',
        district: 'undercity',
        levelRecommended: 2,
        triggerCondition: { location: 'sewer_network' },
        questGiver: null,
        steps: [
            {
                id: 'rkc_step1',
                type: 'narrative',
                text: 'The stench hits you before the noise does — a chittering swarm echoing off the dripping walls. Dozens of red eyes glint from the shadows ahead. A dying scavenger slumped against the wall grabs your ankle. "The big one... deeper in... kill it and the rest scatter..."',
                choices: [
                    { label: 'Head deeper into the tunnels', next: 'rkc_step2' },
                    { label: 'Search the scavenger for supplies first', next: 'rkc_step1b' }
                ]
            },
            {
                id: 'rkc_step1b',
                type: 'skill_check',
                stat: 'wisdom',
                dc: 10,
                successText: 'You find a half-empty vial of rat poison and a crude map scratched on scrap metal. The poison might come in handy.',
                failText: 'The scavenger has nothing useful — just rags and regret.',
                successReward: { items: ['rat_poison'] },
                next: 'rkc_step2'
            },
            {
                id: 'rkc_step2',
                type: 'combat',
                enemies: ['sewer_rat', 'sewer_rat', 'sewer_rat'],
                introText: 'A wave of mutant rats pours from a cracked drainage pipe, teeth bared and glowing with bioluminescent slime.',
                victoryText: 'The first wave falls. But the chittering ahead only grows louder.',
                next: 'rkc_step3'
            },
            {
                id: 'rkc_step3',
                type: 'combat',
                enemies: ['sewer_rat_king'],
                introText: 'The tunnel opens into a vast cistern. In the center, perched atop a mound of bones and garbage, sits the Rat King — a bloated, multi-headed abomination the size of a small car. Smaller rats swarm around it like a living carpet.',
                victoryText: 'The Rat King shrieks its last breath and collapses. The lesser rats scatter into the darkness, their hive-mind shattered. Something glints in the bone pile.',
                next: 'rkc_step4'
            },
            {
                id: 'rkc_step4',
                type: 'narrative',
                text: 'Among the Rat King\'s hoard you find a stash of credits and a surprisingly well-preserved combat knife — probably belonged to a previous exterminator who wasn\'t so lucky.',
                choices: [
                    { label: 'Take the loot and leave', next: 'rkc_complete' }
                ]
            }
        ],
        rewards: {
            credits: 100,
            items: ['rusty_knife'],
            xp: 75,
            flags: { rat_king_slain: true }
        },
        flags: {
            rat_king_slain: 'Set when the Rat King is killed — referenced by Undercity sanitation events.'
        }
    },

    the_forger: {
        id: 'the_forger',
        name: 'The Forger',
        description: 'Whispers in the Upper Slums speak of an artisan who can fabricate identity documents indistinguishable from the real thing. A forged Midcity ID could open doors that brute force never will — if you can find the forger and afford the price.',
        location: 'upper_slums',
        district: 'undercity',
        levelRecommended: 3,
        triggerCondition: { npcTalk: 'mako', minRelationship: 'neutral' },
        questGiver: 'mako',
        steps: [
            {
                id: 'tfg_step1',
                type: 'narrative',
                text: 'Mako leans in close. "There\'s a forger — goes by Inkwell. Best in the district. But she doesn\'t see just anyone. You\'ll need to find her dead-drop first. Look for a red glyph near the old water tower."',
                choices: [
                    { label: 'Head to the water tower', next: 'tfg_step2' }
                ]
            },
            {
                id: 'tfg_step2',
                type: 'skill_check',
                stat: 'intelligence',
                dc: 12,
                successText: 'You spot the glyph — a stylized ink drop hidden among layers of graffiti. Behind a loose brick you find a coded note with a location: a shuttered print shop in the back alleys.',
                failText: 'The wall is covered in a hundred tags and symbols. You can\'t tell which is the one you need. Maybe someone in the market knows more.',
                failNext: 'tfg_step2b',
                next: 'tfg_step3'
            },
            {
                id: 'tfg_step2b',
                type: 'skill_check',
                stat: 'charisma',
                dc: 11,
                successText: 'A street kid points out the glyph after you slip them a few credits. You find the coded note behind the loose brick.',
                failText: 'Nobody talks. You\'ll have to be smarter or more persuasive.',
                failNext: 'tfg_step2',
                next: 'tfg_step3'
            },
            {
                id: 'tfg_step3',
                type: 'narrative',
                text: 'The print shop is dark and reeks of chemical solvents. A woman with ink-stained fingers emerges from behind stacks of paper. "You found my drop. That means you\'re either clever or connected. Either way, I can work with that." She names her price: 200 credits, or a favor.',
                choices: [
                    { label: 'Pay 200 credits', next: 'tfg_step4a', condition: { credits: 200 } },
                    { label: 'Ask about the favor', next: 'tfg_step4b' }
                ]
            },
            {
                id: 'tfg_step4a',
                type: 'narrative',
                text: 'Inkwell takes the credits and disappears into a back room. Thirty minutes later she returns with an ID card that looks absolutely authentic — holographic seal, embedded chip, the works. "Don\'t get scanned at a Meridian checkpoint. Otherwise, this\'ll fool anyone."',
                choices: [
                    { label: 'Take the ID', next: 'tfg_complete' }
                ]
            },
            {
                id: 'tfg_step4b',
                type: 'narrative',
                text: '"I need a package retrieved from the market district. Small box, locked case. My courier got picked up by corp-sec. Bring it to me and we\'re even."',
                choices: [
                    { label: 'Accept the favor', next: 'tfg_step5' }
                ]
            },
            {
                id: 'tfg_step5',
                type: 'skill_check',
                stat: 'dexterity',
                dc: 13,
                successText: 'You slip into the impound lockup, locate the small case, and extract it without tripping any alarms. Inkwell is impressed.',
                failText: 'You trip an alarm wire. A corp-sec guard spots you and draws his baton.',
                failNext: 'tfg_step5b',
                next: 'tfg_step6'
            },
            {
                id: 'tfg_step5b',
                type: 'combat',
                enemies: ['corp_security_guard'],
                introText: 'The guard charges at you, shock baton crackling.',
                victoryText: 'The guard drops. You grab the case and slip out before reinforcements arrive.',
                next: 'tfg_step6'
            },
            {
                id: 'tfg_step6',
                type: 'narrative',
                text: 'Inkwell opens the case — it\'s full of rare polymer inks. "Perfect. These are worth more than credits to me." She produces your new identity with a sly smile. "Pleasure doing business."',
                choices: [
                    { label: 'Take the forged ID', next: 'tfg_complete' }
                ]
            }
        ],
        rewards: {
            items: ['forged_id'],
            xp: 100,
            flags: { has_forged_id: true, met_inkwell: true }
        },
        flags: {
            has_forged_id: 'Unlocks Midcity access without corporate sponsorship.',
            met_inkwell: 'Inkwell becomes available as a recurring contact.'
        }
    },

    lost_medicine: {
        id: 'lost_medicine',
        name: 'Lost Medicine',
        description: 'The Undercity free clinic is running on fumes. Their last shipment of anti-rad medication was hijacked by a local gang. Without it, dozens of radiation-sick workers will die within the week. The clinic\'s doctor is desperate for someone to retrieve the stolen supply.',
        location: 'lower_slums',
        district: 'undercity',
        levelRecommended: 3,
        triggerCondition: { location: 'lower_slums', flag: '!lost_medicine_done' },
        questGiver: 'doc_mira',
        steps: [
            {
                id: 'lm_step1',
                type: 'narrative',
                text: 'Dr. Mira\'s clinic is a converted shipping container filled with groaning patients. She\'s exhausted and barely holding it together. "The Vein Runners took our entire anti-rad shipment. They\'re holed up in the old pump station. I don\'t have credits to pay you, but... people will die without that medicine."',
                choices: [
                    { label: 'Agree to help', next: 'lm_step2' },
                    { label: 'Ask if anyone else can help', next: 'lm_step1b' }
                ]
            },
            {
                id: 'lm_step1b',
                type: 'narrative',
                text: '"The Iron Collective doesn\'t care about one clinic. The Ghosts are too busy. And corp-sec?" She laughs bitterly. "They don\'t patrol down here. It\'s just you, or nobody."',
                choices: [
                    { label: 'I\'ll get the medicine', next: 'lm_step2' }
                ]
            },
            {
                id: 'lm_step2',
                type: 'skill_check',
                stat: 'dexterity',
                dc: 12,
                successText: 'You approach the pump station from the drainage side, slipping past the lookouts without being spotted. You can see the crates of medicine stacked inside.',
                failText: 'A lookout spots you approaching. The element of surprise is gone.',
                failNext: 'lm_step3_loud',
                next: 'lm_step3_stealth'
            },
            {
                id: 'lm_step3_stealth',
                type: 'skill_check',
                stat: 'wisdom',
                dc: 13,
                successText: 'You time the guards\' patrol pattern perfectly, grab two crates of medicine, and disappear back into the drains before anyone notices.',
                failText: 'You knock over a loose pipe. The gang is alerted.',
                failNext: 'lm_step3_loud',
                next: 'lm_step4'
            },
            {
                id: 'lm_step3_loud',
                type: 'combat',
                enemies: ['gang_enforcer', 'slum_thug', 'slum_thug'],
                introText: 'The Vein Runners scramble for their weapons. "Nobody steals from us!"',
                victoryText: 'The gang members lie groaning on the floor. The medicine crates are right there.',
                next: 'lm_step4'
            },
            {
                id: 'lm_step4',
                type: 'choice',
                text: 'You have the medicine. But you also notice a locked strongbox the gang was guarding. It probably contains their stash of credits and chems.',
                choices: [
                    { label: 'Take only the medicine — people need this now', next: 'lm_step5_good', flag: 'lm_altruistic' },
                    { label: 'Take the medicine AND the strongbox — you deserve payment', next: 'lm_step5_grey', flag: 'lm_pragmatic' },
                    { label: 'Keep the medicine and sell it yourself — it\'s worth a fortune', next: 'lm_step5_evil', flag: 'lm_selfish' }
                ]
            },
            {
                id: 'lm_step5_good',
                type: 'narrative',
                text: 'You return to the clinic with both crates. Dr. Mira nearly breaks down in tears. "You saved them. You saved all of them." Word of your deed spreads through the Undercity.',
                choices: [
                    { label: 'Continue', next: 'lm_complete' }
                ]
            },
            {
                id: 'lm_step5_grey',
                type: 'narrative',
                text: 'You deliver the medicine and crack open the strongbox: 150 credits and a handful of combat stims. Dr. Mira doesn\'t ask questions. The patients get their meds. Everyone wins... more or less.',
                choices: [
                    { label: 'Continue', next: 'lm_complete_grey' }
                ]
            },
            {
                id: 'lm_step5_evil',
                type: 'narrative',
                text: 'You pocket the medicine and head to the black market. The anti-rads fetch a premium price from desperate buyers. Later, you hear the clinic had to close. Some of the patients didn\'t make it.',
                choices: [
                    { label: 'Continue', next: 'lm_complete_evil' }
                ]
            }
        ],
        rewards: {
            credits: 150,
            xp: 100,
            reputation: { ashenCircle: 15 },
            flags: { lost_medicine_done: true }
        },
        alternateRewards: {
            lm_pragmatic: {
                credits: 300,
                xp: 100,
                reputation: { ashenCircle: 5 },
                flags: { lost_medicine_done: true }
            },
            lm_selfish: {
                credits: 500,
                xp: 75,
                reputation: { ashenCircle: -20 },
                flags: { lost_medicine_done: true, clinic_closed: true }
            }
        },
        flags: {
            lost_medicine_done: 'Quest completion tracker.',
            clinic_closed: 'If the player sold the medicine, the clinic closes permanently.',
            lm_altruistic: 'Player returned medicine selflessly — referenced in ending calculations.',
            lm_pragmatic: 'Player took extra payment — minor grey flag.',
            lm_selfish: 'Player sold the medicine — triggers negative reputation cascade.'
        }
    },

    fight_club: {
        id: 'fight_club',
        name: 'Fight Club',
        description: 'Deep in the industrial zone, an underground fighting ring draws the desperate and the dangerous. Three rounds. No weapons. No rules. No mercy. Win, and you walk out with credits and a reputation. Lose, and they drag you out.',
        location: 'industrial_zone',
        district: 'undercity',
        levelRecommended: 4,
        triggerCondition: { location: 'industrial_zone', level: 3 },
        questGiver: null,
        steps: [
            {
                id: 'fc_step1',
                type: 'narrative',
                text: 'A rusted door in a factory wall. A bouncer built like a vending machine looks you over. "Fifty credits to enter. You lose, you lose the entry fee. You win all three rounds, you take the pot. Simple."',
                choices: [
                    { label: 'Pay 50 credits and enter', next: 'fc_step2', condition: { credits: 50 } },
                    { label: 'Try to intimidate your way in free', next: 'fc_step1b' },
                    { label: 'Leave', next: 'fc_abort' }
                ]
            },
            {
                id: 'fc_step1b',
                type: 'skill_check',
                stat: 'charisma',
                dc: 15,
                successText: 'The bouncer sizes you up and snorts. "Fine. But you better put on a show." He waves you through.',
                failText: '"Pay or walk." He doesn\'t blink. Guess you\'re paying.',
                failNext: 'fc_step1',
                next: 'fc_step2'
            },
            {
                id: 'fc_step2',
                type: 'combat',
                enemies: ['pit_fighter_rookie'],
                introText: 'Round 1. A wiry kid with fast hands bounces on his toes across the ring. The crowd roars.',
                victoryText: 'The kid hits the floor. The crowd chants for more.',
                next: 'fc_step3'
            },
            {
                id: 'fc_step3',
                type: 'combat',
                enemies: ['pit_fighter_veteran'],
                introText: 'Round 2. A scarred brute with cybernetic knuckles steps into the ring. He cracked his last opponent\'s skull.',
                victoryText: 'The veteran staggers and falls. The crowd is going wild. One more round.',
                next: 'fc_step4'
            },
            {
                id: 'fc_step4',
                type: 'combat',
                enemies: ['pit_fighter_champion'],
                introText: 'Round 3. The champion enters — a massive figure with gang tattoos and eyes that have seen a hundred kills. "You don\'t walk out of my ring."',
                victoryText: 'The champion falls to one knee, then collapses. The crowd erupts. You are the new champion of the pit.',
                next: 'fc_step5'
            },
            {
                id: 'fc_step5',
                type: 'narrative',
                text: 'The fight master presses a wad of credits into your hand and nods with respect. "You fight like something that crawled out of the old world. Come back anytime — we\'ll always have a spot for you."',
                choices: [
                    { label: 'Take the winnings', next: 'fc_complete' }
                ]
            }
        ],
        rewards: {
            credits: 500,
            xp: 200,
            traits: ['gladiator'],
            flags: { fight_club_champion: true }
        },
        flags: {
            fight_club_champion: 'Unlocks gladiator trait. Referenced by arena quests and faction recruitment.'
        }
    },

    the_whisperer: {
        id: 'the_whisperer',
        name: 'The Whisperer',
        description: 'Someone has been leaving cryptic, coded messages etched into the sewer walls. The symbols don\'t match any known gang tags. They appear to be coordinates, timestamps, and warnings — but encoded in a cipher nobody can crack.',
        location: 'sewer_network',
        district: 'undercity',
        levelRecommended: 5,
        triggerCondition: { location: 'sewer_network', flag: 'rat_king_slain' },
        questGiver: null,
        steps: [
            {
                id: 'tw_step1',
                type: 'narrative',
                text: 'With the Rat King dead, you can explore deeper into the tunnels. On a clean section of wall, someone has carved a precise grid of symbols — too deliberate for graffiti, too complex for a simple message.',
                choices: [
                    { label: 'Examine the symbols closely', next: 'tw_step2' },
                    { label: 'Look for more carvings', next: 'tw_step2b' }
                ]
            },
            {
                id: 'tw_step2',
                type: 'skill_check',
                stat: 'tech',
                dc: 14,
                successText: 'Your tech training kicks in — it\'s a substitution cipher layered over a coordinate grid. You crack the first layer: it references a location deeper in the tunnels.',
                failText: 'The symbols swim before your eyes. You can\'t make sense of the pattern.',
                failNext: 'tw_step2b',
                next: 'tw_step3'
            },
            {
                id: 'tw_step2b',
                type: 'skill_check',
                stat: 'intelligence',
                dc: 13,
                successText: 'You find three more sets of carvings. Cross-referencing them, a pattern emerges — they\'re breadcrumbs leading deeper underground.',
                failText: 'The tunnels all look the same. You wander for an hour before giving up. Maybe with better skills you could decipher this.',
                failNext: 'tw_fail',
                next: 'tw_step3'
            },
            {
                id: 'tw_step3',
                type: 'puzzle',
                text: 'The decoded coordinates lead to a hidden alcove behind a false wall. Inside, you find a terminal with a blinking cursor. A message appears: "PROVE YOU ARE NOT THEM. COMPLETE THE SEQUENCE: 2, 3, 5, 7, 11, 13, ?"',
                solution: '17',
                successText: 'The terminal chirps. "Welcome, thinker. I am the Whisperer. I have been watching the patterns in the data streams. Something is wrong with the Stack network. Meet me at the coordinates I am transmitting."',
                failText: 'The terminal goes dark. "Wrong. The messages will move."',
                failNext: 'tw_fail',
                next: 'tw_step4'
            },
            {
                id: 'tw_step4',
                type: 'narrative',
                text: 'The coordinates lead to a cramped maintenance room. A figure draped in cables and screens sits cross-legged among a nest of jury-rigged equipment. "You found me. Good. The Ghost Syndicate needs people who can think. I\'m offering you a contact — not membership. Not yet. But access to our outer network."',
                choices: [
                    { label: 'Accept the contact', next: 'tw_complete' },
                    { label: 'Ask what they know about the Stack network', next: 'tw_step4b' }
                ]
            },
            {
                id: 'tw_step4b',
                type: 'narrative',
                text: '"Stack transfers are corrupting. Not randomly — deliberately. Someone is rewriting minds during backup. I don\'t know who yet, but I know where to start looking. Take the contact. You\'ll need it."',
                choices: [
                    { label: 'Accept the Ghost Syndicate contact', next: 'tw_complete' }
                ]
            }
        ],
        rewards: {
            xp: 150,
            reputation: { ghostSyndicate: 20 },
            flags: { ghost_contact_whisperer: true, stack_corruption_hint: true }
        },
        flags: {
            ghost_contact_whisperer: 'Unlocks Ghost Syndicate outer-network access.',
            stack_corruption_hint: 'Early hint at the main story\'s stack corruption plotline.'
        }
    },

    // =========================================================================
    //  MIDCITY — Quests 6-10
    // =========================================================================

    missing_persons: {
        id: 'missing_persons',
        name: 'Missing Persons',
        description: 'A factory worker in the market district hasn\'t come home in three days. His wife says the corp-sec told her to stop asking questions. Something is wrong, and nobody with a badge seems to care.',
        location: 'market_district',
        district: 'midcity',
        levelRecommended: 4,
        triggerCondition: { location: 'market_district' },
        questGiver: 'lena_kovac',
        steps: [
            {
                id: 'mp_step1',
                type: 'narrative',
                text: 'Lena Kovac finds you near the market stalls. Her eyes are red from crying. "My husband Orin — he worked the night shift at the Meridian processing plant. Three days ago he didn\'t come home. Corp-sec says there\'s no record of him. Like he never existed."',
                choices: [
                    { label: 'Investigate the processing plant', next: 'mp_step2' },
                    { label: 'Ask around the market first', next: 'mp_step2b' }
                ]
            },
            {
                id: 'mp_step2',
                type: 'skill_check',
                stat: 'intelligence',
                dc: 13,
                successText: 'You access the plant\'s shift logs through an unsecured maintenance terminal. Orin Kovac was signed in three nights ago — but his sign-out was manually deleted. Someone erased him from the system.',
                failText: 'The plant\'s security is tight. You can\'t find anything through official channels.',
                failNext: 'mp_step2b',
                next: 'mp_step3'
            },
            {
                id: 'mp_step2b',
                type: 'skill_check',
                stat: 'charisma',
                dc: 12,
                successText: 'A fellow worker whispers: "Orin saw something he wasn\'t supposed to. They took him to sublevel B. Nobody comes back from sublevel B."',
                failText: 'Nobody will talk. Fear is written on every face.',
                failNext: 'mp_step2',
                next: 'mp_step3'
            },
            {
                id: 'mp_step3',
                type: 'combat',
                enemies: ['corp_security_guard', 'corp_security_guard'],
                introText: 'You find the entrance to sublevel B. Two Meridian security guards block the stairwell. "This area is restricted. Turn around."',
                victoryText: 'The guards go down. You grab a keycard and descend into sublevel B.',
                next: 'mp_step4'
            },
            {
                id: 'mp_step4',
                type: 'narrative',
                text: 'Sublevel B is a detention block. You find Orin Kovac in a cell, bruised but alive. "They caught me accessing restricted files. The plant is dumping toxic waste into the Undercity water supply. I have proof on my data chip — they didn\'t find it."',
                choices: [
                    { label: 'Free Orin and take the data chip', next: 'mp_step5' },
                    { label: 'Free Orin but destroy the evidence — too dangerous', next: 'mp_step5b' }
                ]
            },
            {
                id: 'mp_step5',
                type: 'narrative',
                text: 'You break Orin out and take the evidence. This data could bring real accountability to Meridian — or it could paint a target on your back.',
                choices: [
                    { label: 'Return Orin to Lena', next: 'mp_complete' }
                ]
            },
            {
                id: 'mp_step5b',
                type: 'narrative',
                text: 'You smash the data chip underfoot. Orin stares at you, devastated. "That was the only proof..." He follows you out in silence.',
                choices: [
                    { label: 'Return Orin to Lena', next: 'mp_complete_nodata' }
                ]
            }
        ],
        rewards: {
            credits: 200,
            xp: 150,
            flags: { orin_rescued: true, meridian_evidence: true }
        },
        alternateRewards: {
            mp_complete_nodata: {
                credits: 200,
                xp: 100,
                flags: { orin_rescued: true, meridian_evidence: false }
            }
        },
        flags: {
            orin_rescued: 'Orin Kovac is alive and free.',
            meridian_evidence: 'Player has proof of Meridian toxic dumping — usable in faction quests and endings.'
        }
    },

    drone_salvage: {
        id: 'drone_salvage',
        name: 'Drone Salvage',
        description: 'A Meridian surveillance drone crashed on a rooftop in the transit hub. Its wreckage contains valuable components — sensor arrays, micro-processors, and possibly intact data logs. But corp-sec will want it back, and you\'re not the only scavenger who saw it come down.',
        location: 'transit_hub',
        district: 'midcity',
        levelRecommended: 4,
        triggerCondition: { location: 'transit_hub' },
        questGiver: null,
        steps: [
            {
                id: 'ds_step1',
                type: 'narrative',
                text: 'You spot the smoke trail from the crashed drone — it plowed into a rooftop relay station three blocks from the transit hub. A small crowd has gathered below, but nobody wants to climb up with corp-sec patrols in the area.',
                choices: [
                    { label: 'Scale the building', next: 'ds_step2' },
                    { label: 'Look for a fire escape or service ladder', next: 'ds_step2b' }
                ]
            },
            {
                id: 'ds_step2',
                type: 'skill_check',
                stat: 'dexterity',
                dc: 12,
                successText: 'You scale the exterior piping and ledges, reaching the rooftop without incident. The drone wreckage is scattered across the relay platform.',
                failText: 'You slip on a rain-slicked ledge and barely catch yourself. You make it up, but you\'re bruised and slow — and someone else is already here.',
                failNext: 'ds_step3_rival',
                next: 'ds_step3'
            },
            {
                id: 'ds_step2b',
                type: 'skill_check',
                stat: 'tech',
                dc: 11,
                successText: 'You hack the building\'s service entrance and take the maintenance elevator to the roof. Easy access.',
                failText: 'The lock is beyond your skill. You\'ll have to climb.',
                failNext: 'ds_step2',
                next: 'ds_step3'
            },
            {
                id: 'ds_step3',
                type: 'skill_check',
                stat: 'tech',
                dc: 14,
                successText: 'You disassemble the drone with practiced efficiency. You recover the sensor array, two intact micro-processors, and a partially corrupted data log. Jackpot.',
                failText: 'You manage to pull out some parts, but the delicate components crack under your hands. You salvage what you can.',
                next: 'ds_step4'
            },
            {
                id: 'ds_step3_rival',
                type: 'narrative',
                text: 'Another scavenger — a wiry kid with a satchel full of tools — is already prying open the drone\'s chassis. He sees you and tenses.',
                choices: [
                    { label: 'Offer to split the salvage', next: 'ds_step3_share' },
                    { label: 'Intimidate him into leaving', next: 'ds_step3_intimidate' },
                    { label: 'Attack', next: 'ds_step3_fight' }
                ]
            },
            {
                id: 'ds_step3_share',
                type: 'narrative',
                text: 'The kid relaxes. "Deal. You take the processors, I take the sensor array. Fair?" You work together and strip the drone efficiently.',
                choices: [
                    { label: 'Shake on it', next: 'ds_step4_half' }
                ]
            },
            {
                id: 'ds_step3_intimidate',
                type: 'skill_check',
                stat: 'charisma',
                dc: 13,
                successText: 'The kid backs off, hands raised. "Fine, fine. It\'s yours." He disappears over the edge of the roof.',
                failText: 'The kid pulls a knife. "I was here first."',
                failNext: 'ds_step3_fight',
                next: 'ds_step3'
            },
            {
                id: 'ds_step3_fight',
                type: 'combat',
                enemies: ['scavenger'],
                introText: 'The scavenger lunges at you with a makeshift blade.',
                victoryText: 'The scavenger scrambles away, bleeding. The drone is all yours.',
                next: 'ds_step3'
            },
            {
                id: 'ds_step4',
                type: 'narrative',
                text: 'You bag the salvaged components. These parts are worth serious credits on the tech market — or you could use them yourself for upgrades.',
                choices: [
                    { label: 'Keep the parts', next: 'ds_complete' }
                ]
            },
            {
                id: 'ds_step4_half',
                type: 'narrative',
                text: 'You got a fair share of the salvage. Not everything, but enough to be worthwhile — and you made a contact instead of an enemy.',
                choices: [
                    { label: 'Take your share', next: 'ds_complete_half' }
                ]
            }
        ],
        rewards: {
            items: ['drone_sensor_array', 'micro_processor', 'micro_processor'],
            xp: 125,
            skillXp: { tech: 50 },
            flags: { drone_salvaged: true }
        },
        alternateRewards: {
            ds_complete_half: {
                items: ['micro_processor'],
                xp: 125,
                skillXp: { tech: 50 },
                flags: { drone_salvaged: true, scavenger_ally: true }
            }
        },
        flags: {
            drone_salvaged: 'Drone parts recovered.',
            scavenger_ally: 'Made a friend instead of an enemy during salvage — opens a minor trade contact.'
        }
    },

    healers_dilemma: {
        id: 'healers_dilemma',
        name: "The Healer's Dilemma",
        description: 'A Midcity medic has one dose of a rare anti-viral left. Two patients are dying. One is a young mother, the other is an elderly engineer who knows how to repair the district\'s failing water purifier. There is no right answer — only a choice.',
        location: 'market_district',
        district: 'midcity',
        levelRecommended: 3,
        triggerCondition: { location: 'market_district', flag: '!healers_dilemma_done' },
        questGiver: 'medic_tomas',
        steps: [
            {
                id: 'hd_step1',
                type: 'narrative',
                text: 'Medic Tomas grabs your arm as you pass his field station. "I need an outside perspective. I have one dose of Clearvein-9. Two patients. Both die without it." He leads you to two cots. A young woman clutching a child\'s photo. An old man with grease-stained hands and a mind full of irreplaceable knowledge.',
                choices: [
                    { label: 'Ask about the young woman', next: 'hd_step2a' },
                    { label: 'Ask about the engineer', next: 'hd_step2b' },
                    { label: 'Is there no other option?', next: 'hd_step2c' }
                ]
            },
            {
                id: 'hd_step2a',
                type: 'narrative',
                text: '"Yara. Twenty-six. Single mother. Her daughter is three years old and staying with a neighbor. If Yara dies, the kid ends up in the orphan mills."',
                choices: [
                    { label: 'Ask about the engineer', next: 'hd_step2b' },
                    { label: 'Give the dose to Yara', next: 'hd_step3_yara' }
                ]
            },
            {
                id: 'hd_step2b',
                type: 'narrative',
                text: '"Aldric. Seventy-one. The only person in three districts who can fix the Model-7 water purifier. If it fails, a thousand people drink contaminated water. He\'s the only one who knows the proprietary repair codes."',
                choices: [
                    { label: 'Ask about the young woman', next: 'hd_step2a' },
                    { label: 'Give the dose to Aldric', next: 'hd_step3_aldric' }
                ]
            },
            {
                id: 'hd_step2c',
                type: 'skill_check',
                stat: 'wisdom',
                dc: 16,
                successText: 'You recall hearing about a black-market chemist who might be able to synthesize a second dose — but it would take time, credits, and there\'s no guarantee.',
                failText: '"I\'ve tried everything. This is it. One dose. Two lives. Choose."',
                failNext: 'hd_step2a',
                next: 'hd_step3_both'
            },
            {
                id: 'hd_step3_yara',
                type: 'narrative',
                text: 'Tomas administers the dose to Yara. Within hours, the color returns to her face. She\'ll live. Across the room, Aldric closes his eyes for the last time. The water purifier will fail within the month.',
                choices: [
                    { label: 'Stay with Yara until she wakes', next: 'hd_complete_yara' }
                ]
            },
            {
                id: 'hd_step3_aldric',
                type: 'narrative',
                text: 'Tomas administers the dose to Aldric. The old engineer stabilizes, mumbling repair codes even in his fever. Yara passes quietly in the night. Her daughter will grow up without a mother.',
                choices: [
                    { label: 'Ask Aldric to teach others the repair codes', next: 'hd_complete_aldric' }
                ]
            },
            {
                id: 'hd_step3_both',
                type: 'narrative',
                text: 'You explain the idea to Tomas. "A synthesized dose? It\'s a long shot. But if you can pull it off..." He gives Yara the real dose and stabilizes Aldric as best he can. You have 24 hours to find the chemist and get a second dose.',
                choices: [
                    { label: 'Race to the black market', next: 'hd_step4_both' }
                ]
            },
            {
                id: 'hd_step4_both',
                type: 'skill_check',
                stat: 'charisma',
                dc: 14,
                successText: 'You find a chemist willing to attempt the synthesis. It costs 100 credits and takes every minute of the 24 hours, but the second dose works. Both patients survive.',
                failText: 'The chemist can\'t be found in time. By the time you return, Aldric has passed. You saved one life but not both.',
                failNext: 'hd_complete_yara',
                next: 'hd_complete_both',
                costCredits: 100
            }
        ],
        rewards: {
            xp: 100,
            flags: { healers_dilemma_done: true }
        },
        alternateRewards: {
            hd_complete_yara: {
                xp: 100,
                flags: { healers_dilemma_done: true, yara_saved: true, aldric_dead: true }
            },
            hd_complete_aldric: {
                xp: 100,
                flags: { healers_dilemma_done: true, aldric_saved: true, yara_dead: true, purifier_maintained: true }
            },
            hd_complete_both: {
                xp: 150,
                flags: { healers_dilemma_done: true, yara_saved: true, aldric_saved: true, purifier_maintained: true, both_saved: true }
            }
        },
        flags: {
            yara_saved: 'Yara survives — her daughter avoids the orphan mills.',
            aldric_saved: 'Aldric survives — water purifier can be maintained.',
            purifier_maintained: 'District water purifier remains functional.',
            both_saved: 'The player found a third option — referenced in wisdom-based endings.'
        }
    },

    arena_champion: {
        id: 'arena_champion',
        name: 'Arena Champion',
        description: 'The Midcity Arena — a sanctioned bloodsport where fighters earn glory and credits in full view of cheering crowds. Five rounds against increasingly lethal opponents. The purse is enormous, but so is the body count.',
        location: 'arena_district',
        district: 'midcity',
        levelRecommended: 6,
        triggerCondition: { location: 'arena_district', level: 5 },
        questGiver: null,
        steps: [
            {
                id: 'ac_step1',
                type: 'narrative',
                text: 'The Arena master, a grinning cyborg with golden teeth, sizes you up. "Fifty credit entry. Five rounds. Kill or be killed. The crowd decides if you leave with the pot or in a box. Interested?"',
                choices: [
                    { label: 'Pay 50 credits and enter', next: 'ac_step2', condition: { credits: 50 } },
                    { label: 'Walk away', next: 'ac_abort' }
                ]
            },
            {
                id: 'ac_step2',
                type: 'combat',
                enemies: ['arena_brawler'],
                introText: 'Round 1. A tattooed brawler with augmented arms cracks his knuckles across the arena floor.',
                victoryText: 'First blood to you. The crowd cheers.',
                next: 'ac_step3'
            },
            {
                id: 'ac_step3',
                type: 'combat',
                enemies: ['arena_gunslinger'],
                introText: 'Round 2. A lean sharpshooter steps out with twin pistols. The arena master tosses you a shield. "You\'ll need it."',
                victoryText: 'The gunslinger falls. The crowd is on its feet.',
                next: 'ac_step4'
            },
            {
                id: 'ac_step4',
                type: 'combat',
                enemies: ['arena_duo_blade', 'arena_duo_shield'],
                introText: 'Round 3. Two fighters enter together — one with a vibroblade, the other with a tower shield. They move as one.',
                victoryText: 'The duo crumbles. You\'re breathing hard but standing.',
                next: 'ac_step5'
            },
            {
                id: 'ac_step5',
                type: 'combat',
                enemies: ['arena_beast'],
                introText: 'Round 4. A cage rises from the floor. Inside: a gene-spliced combat beast, all muscle, claws, and bio-engineered rage. The crowd screams.',
                victoryText: 'The beast collapses in a heap of twitching sinew. The arena falls silent in awe.',
                next: 'ac_step6'
            },
            {
                id: 'ac_step6',
                type: 'combat',
                enemies: ['arena_champion_npc'],
                introText: 'Round 5. The reigning champion enters. Full combat armor. Neural-linked weapons. A kill count in the triple digits. "Nothing personal."',
                victoryText: 'The champion falls. The arena erupts. You are the new champion of Midcity.',
                next: 'ac_step7'
            },
            {
                id: 'ac_step7',
                type: 'narrative',
                text: 'The arena master places a laurel of chromed steel on your head. Credits pour into your account. Your name will echo in these walls for years. Sponsorship offers, faction invitations, and challenges flood in.',
                choices: [
                    { label: 'Bask in glory', next: 'ac_complete' }
                ]
            }
        ],
        rewards: {
            credits: 1000,
            xp: 400,
            reputation: { neonCourt: 10, ironCollective: -5 },
            flags: { arena_champion: true }
        },
        flags: {
            arena_champion: 'Player won the Midcity Arena — fame, fortune, and faction attention.'
        }
    },

    data_courier: {
        id: 'data_courier',
        name: 'Data Courier',
        description: 'The Ghost Syndicate needs a runner — someone fast, discreet, and expendable — to deliver three encrypted data packages across the city. Each drop point is watched. Each package is time-sensitive. Failure means the data is compromised and the Ghosts lose a network node.',
        location: 'transit_hub',
        district: 'midcity',
        levelRecommended: 5,
        triggerCondition: { faction: 'ghostSyndicate', minReputation: 'neutral' },
        questGiver: 'ghost_handler',
        steps: [
            {
                id: 'dc_step1',
                type: 'narrative',
                text: 'A faceless figure in a transit hub alcove presses three sealed packets into your hands. "Three drops. Three locations. You have two hours simulated time. Don\'t open them. Don\'t get scanned. Don\'t get followed. Go."',
                choices: [
                    { label: 'Start the run', next: 'dc_step2' }
                ]
            },
            {
                id: 'dc_step2',
                type: 'skill_check',
                stat: 'dexterity',
                dc: 13,
                successText: 'Drop 1 — The Market District. You weave through the crowd and slip the packet under a vendor\'s counter without breaking stride. Clean.',
                failText: 'You fumble the handoff and have to double back. A corp-sec patrol notices you. You make the drop but you\'re being tailed.',
                failFlag: 'dc_tailed',
                next: 'dc_step3'
            },
            {
                id: 'dc_step3',
                type: 'skill_check',
                stat: 'dexterity',
                dc: 14,
                successText: 'Drop 2 — The Transit Hub restrooms. You duck in, tape the packet behind a panel, and walk out calm as a ghost. Nobody noticed.',
                failText: 'A scanner drone locks onto you as you make the drop. You get the packet in place, but the heat is rising.',
                failFlag: 'dc_scanned',
                next: 'dc_step4'
            },
            {
                id: 'dc_step4',
                type: 'skill_check',
                stat: 'dexterity',
                dc: 15,
                successText: 'Drop 3 — An Upper Slums dead-drop. You slide the final packet into a drainage grate and melt into an alley. Three for three. Perfect run.',
                failText: 'Corp-sec converges on your position. You manage to throw the packet to the contact, but you\'re caught in the open.',
                failNext: 'dc_step4b',
                next: 'dc_step5'
            },
            {
                id: 'dc_step4b',
                type: 'combat',
                enemies: ['corp_security_guard', 'security_drone'],
                introText: 'Two corp-sec officers and a patrol drone corner you in an alley.',
                victoryText: 'You put down the patrol and slip away. The drops are made, but it was messy.',
                next: 'dc_step5_messy'
            },
            {
                id: 'dc_step5',
                type: 'narrative',
                text: 'The handler meets you back at the transit hub. "All three clean. Impressive. The Syndicate remembers its friends." A credstick appears in your pocket. You didn\'t see the hand that put it there.',
                choices: [
                    { label: 'Pocket the credits', next: 'dc_complete' }
                ]
            },
            {
                id: 'dc_step5_messy',
                type: 'narrative',
                text: 'The handler is less enthusiastic. "Drops made. But you left heat. We\'ll need to relocate two nodes. Still... you got it done." A smaller credstick appears in your pocket.',
                choices: [
                    { label: 'Take what you earned', next: 'dc_complete_messy' }
                ]
            }
        ],
        rewards: {
            credits: 300,
            xp: 175,
            reputation: { ghostSyndicate: 20 },
            flags: { data_courier_done: true, ghost_runner_clean: true }
        },
        alternateRewards: {
            dc_complete_messy: {
                credits: 150,
                xp: 125,
                reputation: { ghostSyndicate: 10 },
                flags: { data_courier_done: true, ghost_runner_clean: false }
            }
        },
        flags: {
            data_courier_done: 'Courier mission completed.',
            ghost_runner_clean: 'Perfect delivery — Ghost Syndicate trusts the player as a reliable asset.'
        }
    },

    // =========================================================================
    //  HIGHCITY — Quests 11-15
    // =========================================================================

    corporate_espionage: {
        id: 'corporate_espionage',
        name: 'Corporate Espionage',
        description: 'A mid-level Meridian executive wants to defect. She has proprietary data worth millions but needs someone to extract her from a corporate gala before her employers discover the leak. Tuxedos, champagne, and assassination drones.',
        location: 'the_spire',
        district: 'highcity',
        levelRecommended: 7,
        triggerCondition: { location: 'the_spire', flag: 'has_forged_id' },
        questGiver: 'exec_voss',
        steps: [
            {
                id: 'ce_step1',
                type: 'narrative',
                text: 'A coded message arrives on a burner frequency: "I am Director Voss, Meridian Applied Sciences. I want out. The gala at the Zenith Tower is my only window. I need an escort who can blend in and fight if needed. Payment: everything I know about Project Lethe."',
                choices: [
                    { label: 'Accept the job', next: 'ce_step2' },
                    { label: 'Ask for more details first', next: 'ce_step1b' }
                ]
            },
            {
                id: 'ce_step1b',
                type: 'narrative',
                text: '"Project Lethe is a Meridian black-ops program. Stack manipulation at scale. That\'s all I\'ll say on an open channel. Get me out and I\'ll tell you everything."',
                choices: [
                    { label: 'Accept', next: 'ce_step2' }
                ]
            },
            {
                id: 'ce_step2',
                type: 'skill_check',
                stat: 'charisma',
                dc: 14,
                successText: 'Your forged ID and practiced demeanor get you past the door. You blend into the crowd of executives and socialites like you belong here.',
                failText: 'The bouncer eyes you suspiciously but lets you through after a tense moment. You\'re in, but security is watching.',
                failFlag: 'ce_flagged',
                next: 'ce_step3'
            },
            {
                id: 'ce_step3',
                type: 'skill_check',
                stat: 'intelligence',
                dc: 13,
                successText: 'You spot Voss across the room — the woman in the silver dress nursing a drink and watching every exit. You make contact without drawing attention.',
                failText: 'You approach the wrong person first, drawing a confused look. Voss finds you instead. "Subtle. Follow me."',
                next: 'ce_step4'
            },
            {
                id: 'ce_step4',
                type: 'choice',
                text: 'Voss palms you a data chip. "My insurance policy. Now, we have three ways out: the main entrance — obvious, crowded. The service tunnels — less watched but locked. Or the rooftop landing pad — my private shuttle, if we can get past the security checkpoint."',
                choices: [
                    { label: 'Main entrance — hide in the crowd', next: 'ce_step5a' },
                    { label: 'Service tunnels — hack the locks', next: 'ce_step5b' },
                    { label: 'Rooftop — fight through security', next: 'ce_step5c' }
                ]
            },
            {
                id: 'ce_step5a',
                type: 'skill_check',
                stat: 'charisma',
                dc: 15,
                successText: 'You walk Voss through the lobby arm in arm, laughing like old friends. The guards don\'t give you a second look. You\'re out.',
                failText: 'A guard recognizes Voss. "Director? You\'re not authorized to leave." Things get messy.',
                failNext: 'ce_step6_fight',
                next: 'ce_complete'
            },
            {
                id: 'ce_step5b',
                type: 'skill_check',
                stat: 'tech',
                dc: 15,
                successText: 'You bypass the electronic locks in seconds and guide Voss through the service corridors. You emerge on a quiet street three blocks away. Clean.',
                failText: 'The lock triggers a silent alarm. Security converges on the service exit.',
                failNext: 'ce_step6_fight',
                next: 'ce_complete'
            },
            {
                id: 'ce_step5c',
                type: 'combat',
                enemies: ['meridian_elite_guard', 'meridian_elite_guard'],
                introText: 'Two Meridian elite guards stand between you and the rooftop shuttle. They draw plasma sidearms.',
                victoryText: 'The guards drop. You and Voss sprint to the shuttle and take off into the neon skyline.',
                next: 'ce_complete'
            },
            {
                id: 'ce_step6_fight',
                type: 'combat',
                enemies: ['meridian_elite_guard', 'security_drone'],
                introText: 'Alarms blare. An elite guard and a security drone move to intercept.',
                victoryText: 'You fight your way out, dragging Voss behind you. Messy, but alive.',
                next: 'ce_complete'
            }
        ],
        rewards: {
            xp: 300,
            items: ['project_lethe_data'],
            reputation: { ghostSyndicate: 15, meridianCorp: -20 },
            flags: { voss_extracted: true, project_lethe_known: true }
        },
        flags: {
            voss_extracted: 'Director Voss is free — she becomes an informant.',
            project_lethe_known: 'Player knows about Meridian\'s stack manipulation program. Major plot thread.'
        }
    },

    garden_sabotage: {
        id: 'garden_sabotage',
        name: 'Garden Sabotage',
        description: 'The Celestial Gardens — a bioengineered paradise reserved for Highcity elites — is being targeted by the Iron Collective. They want you to introduce a bioagent that will wilt the gardens as a symbol of resistance. But destroying the only green space in the city has consequences.',
        location: 'celestial_gardens',
        district: 'highcity',
        levelRecommended: 6,
        triggerCondition: { faction: 'ironCollective', minReputation: 'friendly' },
        questGiver: 'commander_vex',
        steps: [
            {
                id: 'gs_step1',
                type: 'narrative',
                text: 'Commander Vex hands you a sealed vial. "Bio-defoliant. One drop in the central irrigation hub and the Celestial Gardens die in 48 hours. The rich hoard beauty while we breathe ash. Time they shared our reality."',
                choices: [
                    { label: 'Accept the mission', next: 'gs_step2' },
                    { label: 'Question the plan', next: 'gs_step1b' }
                ]
            },
            {
                id: 'gs_step1b',
                type: 'narrative',
                text: '"It\'s a symbol. The stacks give them immortality. The gardens give them paradise. We take one away, they remember what it\'s like to lose something." Vex\'s eyes are hard. "Are you in or not?"',
                choices: [
                    { label: 'I\'m in', next: 'gs_step2' },
                    { label: 'I\'ll do it my way', next: 'gs_step2_alt' }
                ]
            },
            {
                id: 'gs_step2',
                type: 'skill_check',
                stat: 'dexterity',
                dc: 14,
                successText: 'You slip into the gardens during a shift change, avoiding the patrol drones and reaching the central irrigation hub.',
                failText: 'A garden attendant spots you near a restricted zone. You talk your way past but security is heightened.',
                next: 'gs_step3'
            },
            {
                id: 'gs_step2_alt',
                type: 'skill_check',
                stat: 'tech',
                dc: 15,
                successText: 'You hack the irrigation controls remotely, rerouting the water supply to Undercity taps instead of destroying it. The gardens will brown — but the water goes where it\'s needed.',
                failText: 'The remote hack fails. You\'ll need to go in person.',
                failNext: 'gs_step2',
                next: 'gs_complete_alt'
            },
            {
                id: 'gs_step3',
                type: 'choice',
                text: 'You stand at the irrigation hub with the vial in hand. The gardens are breathtaking — real flowers, real trees, birdsong synthesized from pre-collapse recordings. Destroying this feels different than it sounded in the Foundry.',
                choices: [
                    { label: 'Use the defoliant — Vex is right, this is a symbol', next: 'gs_step4_destroy' },
                    { label: 'Dilute it — damage the gardens but don\'t kill them', next: 'gs_step4_partial' },
                    { label: 'Pour it out — you can\'t destroy this', next: 'gs_step4_refuse' }
                ]
            },
            {
                id: 'gs_step4_destroy',
                type: 'narrative',
                text: 'You empty the vial into the irrigation system. Within hours, the leaves begin to curl. By tomorrow, the Celestial Gardens will be a graveyard of withered stems. The Iron Collective celebrates. The rest of the city mourns.',
                choices: [
                    { label: 'Report to Vex', next: 'gs_complete_destroy' }
                ]
            },
            {
                id: 'gs_step4_partial',
                type: 'narrative',
                text: 'You dilute the defoliant with irrigation water before adding it. The gardens will yellow and wilt — a dramatic visual — but the root systems will survive. They\'ll recover in weeks. Vex gets her symbol. The gardens survive.',
                choices: [
                    { label: 'Report to Vex', next: 'gs_complete_partial' }
                ]
            },
            {
                id: 'gs_step4_refuse',
                type: 'narrative',
                text: 'You pour the vial into a drain. The gardens continue to bloom. You\'ll have to face Vex with a story — or the truth.',
                choices: [
                    { label: 'Lie to Vex — say you did it', next: 'gs_complete_lie' },
                    { label: 'Tell Vex the truth', next: 'gs_complete_truth' }
                ]
            }
        ],
        rewards: {
            xp: 200,
            flags: { garden_quest_done: true }
        },
        alternateRewards: {
            gs_complete_destroy: {
                xp: 200,
                reputation: { ironCollective: 25, neonCourt: -30 },
                flags: { garden_quest_done: true, gardens_destroyed: true }
            },
            gs_complete_partial: {
                xp: 200,
                reputation: { ironCollective: 10 },
                flags: { garden_quest_done: true, gardens_damaged: true }
            },
            gs_complete_lie: {
                xp: 150,
                reputation: { ironCollective: 15 },
                flags: { garden_quest_done: true, lied_to_vex: true }
            },
            gs_complete_truth: {
                xp: 200,
                reputation: { ironCollective: -15 },
                flags: { garden_quest_done: true, defied_vex: true }
            },
            gs_complete_alt: {
                xp: 250,
                reputation: { ironCollective: 5, ashenCircle: 20 },
                flags: { garden_quest_done: true, water_redirected: true }
            }
        },
        flags: {
            gardens_destroyed: 'The Celestial Gardens are dead — permanent environmental consequence.',
            gardens_damaged: 'Gardens were damaged but will recover.',
            lied_to_vex: 'Vex thinks the gardens are destroyed — discovered later, reputation penalty.',
            defied_vex: 'Openly defied the Iron Collective — affects faction standing.',
            water_redirected: 'Clever tech solution — water now flows to Undercity. Best outcome.'
        }
    },

    senate_intrigue: {
        id: 'senate_intrigue',
        name: 'Senate Intrigue',
        description: 'A member of the Highcity Senate suspects a colleague is selling classified defense data to off-world buyers. She needs someone outside the system to gather proof before the next session vote — because if the traitor suspects an investigation, the evidence vanishes.',
        location: 'senate_hall',
        district: 'highcity',
        levelRecommended: 8,
        triggerCondition: { location: 'senate_hall', level: 7 },
        questGiver: 'senator_dray',
        steps: [
            {
                id: 'si_step1',
                type: 'narrative',
                text: 'Senator Dray meets you in a private chamber behind the Senate floor. "Senator Varn is a traitor. I\'m sure of it. But I need proof — his encrypted correspondence, his meeting logs, anything that ties him to the off-world buyers known as the Pale Hand."',
                choices: [
                    { label: 'Infiltrate Varn\'s office', next: 'si_step2a' },
                    { label: 'Tap his communications first', next: 'si_step2b' }
                ]
            },
            {
                id: 'si_step2a',
                type: 'skill_check',
                stat: 'dexterity',
                dc: 15,
                successText: 'You slip into Varn\'s office during a recess. His terminal is still logged in — sloppy. You copy the encrypted files to a data chip.',
                failText: 'A senatorial aide walks in on you. You bluff your way out, but you need another approach.',
                failNext: 'si_step2b',
                next: 'si_step3'
            },
            {
                id: 'si_step2b',
                type: 'skill_check',
                stat: 'tech',
                dc: 16,
                successText: 'You plant a micro-tap on the Senate\'s communication array. Within hours, you intercept a coded transmission from Varn to an off-world frequency.',
                failText: 'The Senate\'s security encryption is military-grade. You can\'t crack it remotely.',
                failNext: 'si_step2a',
                next: 'si_step3'
            },
            {
                id: 'si_step3',
                type: 'skill_check',
                stat: 'intelligence',
                dc: 14,
                successText: 'You decrypt the files. They contain shipping manifests, defense grid coordinates, and payment receipts from the Pale Hand. This is damning.',
                failText: 'The encryption is layered. You crack half of it — enough to be suspicious but not conclusive.',
                next: 'si_step4'
            },
            {
                id: 'si_step4',
                type: 'choice',
                text: 'You have the evidence — or most of it. Senator Dray will be pleased. But you also realize the data contains defense grid vulnerabilities that the Ghost Syndicate or Iron Collective would pay handsomely for.',
                choices: [
                    { label: 'Give everything to Senator Dray', next: 'si_complete_dray' },
                    { label: 'Keep a copy for yourself before handing it over', next: 'si_complete_copy' },
                    { label: 'Sell the data to the highest bidder', next: 'si_complete_sell' }
                ]
            }
        ],
        rewards: {
            credits: 500,
            xp: 300,
            flags: { senate_intrigue_done: true, varn_exposed: true }
        },
        alternateRewards: {
            si_complete_copy: {
                credits: 500,
                xp: 300,
                items: ['defense_grid_data'],
                flags: { senate_intrigue_done: true, varn_exposed: true, has_defense_data: true }
            },
            si_complete_sell: {
                credits: 2000,
                xp: 200,
                reputation: { ghostSyndicate: 15 },
                flags: { senate_intrigue_done: true, varn_not_exposed: true, sold_defense_data: true }
            }
        },
        flags: {
            varn_exposed: 'Senator Varn is arrested — political shakeup in Highcity.',
            has_defense_data: 'Player secretly holds defense grid vulnerabilities.',
            sold_defense_data: 'Player sold classified data — major negative flag for certain endings.'
        }
    },

    stack_clinic_undercover: {
        id: 'stack_clinic_undercover',
        name: 'Stack Clinic Undercover',
        description: 'The Ashen Circle suspects that a prestigious Highcity stack clinic is performing unauthorized experiments on patients during routine backups. They need someone to go undercover as a patient and document what happens behind closed doors.',
        location: 'stack_clinic',
        district: 'highcity',
        levelRecommended: 7,
        triggerCondition: { faction: 'ashenCircle', minReputation: 'friendly' },
        questGiver: 'sister_vael',
        steps: [
            {
                id: 'scu_step1',
                type: 'narrative',
                text: 'Sister Vael of the Ashen Circle speaks in hushed tones. "The Elysium Clinic. Highcity\'s finest stack maintenance facility. Three patients this month came out... different. Changed memories. Altered personalities. We need someone on the inside."',
                choices: [
                    { label: 'Go undercover as a patient', next: 'scu_step2' },
                    { label: 'Infiltrate as staff instead', next: 'scu_step2_staff' }
                ]
            },
            {
                id: 'scu_step2',
                type: 'skill_check',
                stat: 'charisma',
                dc: 13,
                successText: 'You book an appointment under a false name. The receptionist doesn\'t question your forged credentials. You\'re in.',
                failText: 'The receptionist flags your ID. You talk your way past with a story about corporate insurance, but they\'re watching you closely.',
                next: 'scu_step3'
            },
            {
                id: 'scu_step2_staff',
                type: 'skill_check',
                stat: 'tech',
                dc: 15,
                successText: 'You fabricate staff credentials and slip in through the employee entrance. You have unrestricted access to the back rooms.',
                failText: 'The biometric scanner rejects your credentials. You\'ll need to go as a patient instead.',
                failNext: 'scu_step2',
                next: 'scu_step3_staff'
            },
            {
                id: 'scu_step3',
                type: 'narrative',
                text: 'During the "routine backup," you feel the needle in your stack port. The procedure starts normally — but then you notice the technician loading a secondary program. Your consciousness flickers. Something is being added to your backup.',
                choices: [
                    { label: 'Stay still and record everything', next: 'scu_step4_patient' },
                    { label: 'Rip out the connection', next: 'scu_step4_abort' }
                ]
            },
            {
                id: 'scu_step3_staff',
                type: 'narrative',
                text: 'From the observation room, you watch a procedure in progress. A patient lies sedated while technicians inject supplementary code into their stack backup. A second screen shows the modifications: personality dampeners and compliance protocols.',
                choices: [
                    { label: 'Download the evidence quietly', next: 'scu_step4_evidence' },
                    { label: 'Confront the technicians', next: 'scu_step4_confront' }
                ]
            },
            {
                id: 'scu_step4_patient',
                type: 'skill_check',
                stat: 'wisdom',
                dc: 14,
                successText: 'You endure the procedure while your hidden recorder captures everything — the secondary code injection, the technician\'s comments, the file names. This is airtight evidence.',
                failText: 'The foreign code disrupts your focus. You record some of it but the data is fragmented.',
                next: 'scu_step5'
            },
            {
                id: 'scu_step4_abort',
                type: 'narrative',
                text: 'You rip the connection out. The technician shouts. Alarms sound. You\'ve blown your cover, but you felt the foreign code trying to embed itself. That alone is evidence.',
                choices: [
                    { label: 'Fight your way out', next: 'scu_step4_fight' }
                ]
            },
            {
                id: 'scu_step4_fight',
                type: 'combat',
                enemies: ['clinic_security', 'clinic_security'],
                introText: 'Two clinic security guards rush in with shock prods.',
                victoryText: 'You knock them out and grab the nearest data terminal, downloading what you can before escaping.',
                next: 'scu_step5'
            },
            {
                id: 'scu_step4_evidence',
                type: 'skill_check',
                stat: 'tech',
                dc: 14,
                successText: 'You download the complete procedure logs, patient records, and the compliance code itself. This is a bombshell.',
                failText: 'You get partial logs before the system locks you out. Enough to be suspicious but not conclusive.',
                next: 'scu_step5'
            },
            {
                id: 'scu_step4_confront',
                type: 'narrative',
                text: 'The technicians freeze. One reaches for an alarm. "You don\'t understand what you\'re seeing. This is authorized by the Senate."',
                choices: [
                    { label: 'Grab the data and run', next: 'scu_step4_evidence' },
                    { label: 'Demand answers', next: 'scu_step4_answers' }
                ]
            },
            {
                id: 'scu_step4_answers',
                type: 'skill_check',
                stat: 'charisma',
                dc: 16,
                successText: '"It\'s Project Lethe. Meridian funds it. The Senate approved it. We\'re creating compliant citizens. Please... don\'t tell them I talked." The technician gives you full access to the records.',
                failText: 'The technician hits the alarm. Security is coming.',
                failNext: 'scu_step4_fight',
                next: 'scu_step5'
            },
            {
                id: 'scu_step5',
                type: 'narrative',
                text: 'You escape the clinic with the evidence. Sister Vael reads the data with growing horror. "They\'re rewriting people. This changes everything."',
                choices: [
                    { label: 'Give the evidence to the Ashen Circle', next: 'scu_complete' }
                ]
            }
        ],
        rewards: {
            xp: 300,
            reputation: { ashenCircle: 25 },
            flags: { stack_clinic_exposed: true, project_lethe_evidence: true }
        },
        flags: {
            stack_clinic_exposed: 'Elysium Clinic\'s experiments are documented.',
            project_lethe_evidence: 'Hard evidence of Project Lethe — connects to corporate espionage quest.'
        }
    },

    observatory_stargazing: {
        id: 'observatory_stargazing',
        name: 'Observatory Stargazing',
        description: 'The Zenith Observatory — one of the last places in the megacity where you can see real stars through the smog — is run by an aging astronomer who claims to have detected an anomalous signal from deep space. She needs help calibrating the equipment to confirm the finding.',
        location: 'zenith_observatory',
        district: 'highcity',
        levelRecommended: 5,
        triggerCondition: { location: 'zenith_observatory' },
        questGiver: 'dr_stellan',
        steps: [
            {
                id: 'os_step1',
                type: 'narrative',
                text: 'Dr. Stellan is ancient, her eyes magnified behind thick lenses that might once have been cutting-edge optics. "I detected something. A repeating signal from beyond the Oort cloud. Not natural. Not any known frequency. But my equipment is degrading. I need someone with tech skills to help me recalibrate."',
                choices: [
                    { label: 'Help calibrate the equipment', next: 'os_step2' },
                    { label: 'Ask about the signal', next: 'os_step1b' }
                ]
            },
            {
                id: 'os_step1b',
                type: 'narrative',
                text: '"It repeats every 73 seconds. The pattern is mathematical — prime number sequences embedded in carrier wave modulation. This isn\'t radio noise. Something intelligent sent this."',
                choices: [
                    { label: 'Help calibrate the equipment', next: 'os_step2' }
                ]
            },
            {
                id: 'os_step2',
                type: 'skill_check',
                stat: 'tech',
                dc: 13,
                successText: 'You recalibrate the antenna array and clean the signal processing software. The static clears and the repeating pattern becomes unmistakable — structured, deliberate, alien.',
                failText: 'You improve the signal marginally, but the pattern remains noisy. Dr. Stellan helps you through the trickier calibrations.',
                next: 'os_step3'
            },
            {
                id: 'os_step3',
                type: 'skill_check',
                stat: 'intelligence',
                dc: 14,
                successText: 'You analyze the signal structure and realize the prime number sequences are encoding spatial coordinates — pointing back at Earth. Something out there knows we\'re here.',
                failText: 'The signal\'s deeper structure eludes you, but the surface pattern is clearly artificial.',
                next: 'os_step4'
            },
            {
                id: 'os_step4',
                type: 'choice',
                text: 'Dr. Stellan stares at the readout. "This is... this could change everything. First contact. But if I publish this, Meridian will classify it and bury it. If I leak it, people might panic. Or hope. I don\'t know which is worse."',
                choices: [
                    { label: 'Publish it — people deserve to know', next: 'os_complete_publish' },
                    { label: 'Send it to the Ghost Syndicate for safekeeping', next: 'os_complete_ghost' },
                    { label: 'Keep it secret for now — more research needed', next: 'os_complete_secret' }
                ]
            }
        ],
        rewards: {
            xp: 200,
            flags: { observatory_quest_done: true, deep_space_signal: true }
        },
        alternateRewards: {
            os_complete_publish: {
                xp: 200,
                reputation: { ashenCircle: 10 },
                flags: { observatory_quest_done: true, deep_space_signal: true, signal_published: true }
            },
            os_complete_ghost: {
                xp: 200,
                reputation: { ghostSyndicate: 15 },
                flags: { observatory_quest_done: true, deep_space_signal: true, signal_with_ghosts: true }
            },
            os_complete_secret: {
                xp: 200,
                flags: { observatory_quest_done: true, deep_space_signal: true, signal_secret: true }
            }
        },
        flags: {
            deep_space_signal: 'An alien signal has been confirmed — potential late-game plot thread.',
            signal_published: 'The signal is public knowledge — causes unrest and hope in equal measure.',
            signal_with_ghosts: 'Ghost Syndicate holds the signal data — leverage for later.',
            signal_secret: 'Nobody knows about the signal except the player and Dr. Stellan.'
        }
    },

    // =========================================================================
    //  UNDERGROUND — Quests 16-20
    // =========================================================================

    void_rift_sealing: {
        id: 'void_rift_sealing',
        name: 'Void Rift Sealing',
        description: 'Deep in the tunnel network, a tear in reality has opened — a shimmering wound that leaks cold and whispers. The Ashen Circle believes it\'s a rift to the Void, and if it isn\'t sealed, it will expand and swallow the district whole.',
        location: 'tunnel_network',
        district: 'underground',
        levelRecommended: 8,
        triggerCondition: { location: 'tunnel_network', level: 7 },
        questGiver: null,
        steps: [
            {
                id: 'vrs_step1',
                type: 'narrative',
                text: 'The air grows cold. Frost crystallizes on the tunnel walls despite the geothermal heat. Ahead, a wound in space itself hangs suspended — edges crackling with dark energy, the interior an abyss that absorbs light. You can hear whispers from the other side. They know your name.',
                choices: [
                    { label: 'Approach the rift', next: 'vrs_step2' },
                    { label: 'Study it from a distance first', next: 'vrs_step2b' }
                ]
            },
            {
                id: 'vrs_step2b',
                type: 'skill_check',
                stat: 'intelligence',
                dc: 15,
                successText: 'The rift\'s energy signature matches nothing in known physics. But you notice the edges are anchored to three focal points — destabilize those, and the rift should collapse.',
                failText: 'The rift defies analysis. You\'ll have to get closer.',
                failNext: 'vrs_step2',
                next: 'vrs_step3_smart'
            },
            {
                id: 'vrs_step2',
                type: 'combat',
                enemies: ['void_wraith', 'void_wraith'],
                introText: 'As you approach, shapes coalesce from the darkness — void wraiths, semi-corporeal entities leaking through the tear. They drift toward you with hollow screams.',
                victoryText: 'The wraiths dissipate, but more will come as long as the rift remains open.',
                next: 'vrs_step3'
            },
            {
                id: 'vrs_step3',
                type: 'skill_check',
                stat: 'tech',
                dc: 16,
                successText: 'You jury-rig an electromagnetic pulse device from salvaged components and aim it at the rift\'s focal points. The energy disruption causes the rift to shudder and begin contracting.',
                failText: 'Your makeshift device fizzles. The rift pulses wider. You\'ll need to try something else — or get physical.',
                failNext: 'vrs_step3_force',
                next: 'vrs_step4'
            },
            {
                id: 'vrs_step3_smart',
                type: 'skill_check',
                stat: 'tech',
                dc: 14,
                successText: 'Knowing the focal points, you target each one precisely with an electromagnetic burst. The rift screams — a sound that exists only in your mind — and begins collapsing.',
                failText: 'Even knowing the theory, execution fails. The rift flares and spawns more wraiths.',
                failNext: 'vrs_step3_force',
                next: 'vrs_step4'
            },
            {
                id: 'vrs_step3_force',
                type: 'combat',
                enemies: ['void_horror'],
                introText: 'A larger entity forces its way through the rift — a void horror, a nightmare of writhing darkness and gnashing teeth. Kill it, and the rift might destabilize enough to close.',
                victoryText: 'The void horror collapses in on itself, dragging the rift shut behind it like a closing wound. The whispers stop. The temperature rises. The tunnel feels... normal again.',
                next: 'vrs_step4'
            },
            {
                id: 'vrs_step4',
                type: 'narrative',
                text: 'Where the rift was, only a faint scar in the air remains — a shimmer that might be imagination. On the ground, crystallized void-energy glints like black diamonds. The Ashen Circle will want to know about this.',
                choices: [
                    { label: 'Collect the crystals and leave', next: 'vrs_complete' }
                ]
            }
        ],
        rewards: {
            xp: 350,
            items: ['void_crystal', 'void_crystal', 'void_crystal'],
            reputation: { ashenCircle: 20 },
            flags: { void_rift_sealed: true }
        },
        flags: {
            void_rift_sealed: 'A void rift has been sealed — the Ashen Circle takes notice. Connected to endgame void storylines.'
        }
    },

    ancient_cache: {
        id: 'ancient_cache',
        name: 'Ancient Cache',
        description: 'A scavenger\'s map — purchased for too many credits in a back-alley deal — marks the location of a pre-collapse military cache deep in the abandoned subway tunnels. If even half the rumors are true, the weapons and tech inside are worth a fortune.',
        location: 'abandoned_subway',
        district: 'underground',
        levelRecommended: 6,
        triggerCondition: { location: 'abandoned_subway', item: 'scavenger_map' },
        questGiver: null,
        steps: [
            {
                id: 'anc_step1',
                type: 'narrative',
                text: 'The scavenger\'s map leads through collapsed tunnels and flooded passages to a section of subway that predates the megacity itself. Behind a sealed blast door, the map promises pre-collapse military hardware.',
                choices: [
                    { label: 'Attempt to open the blast door', next: 'anc_step2' }
                ]
            },
            {
                id: 'anc_step2',
                type: 'skill_check',
                stat: 'tech',
                dc: 15,
                successText: 'The blast door\'s locking mechanism is ancient but functional. You reroute power from a nearby junction box and the bolts retract with a grinding roar.',
                failText: 'The lock resists your efforts. You manage to force it partially open — enough to squeeze through — but you triggered a security protocol.',
                failNext: 'anc_step2b',
                next: 'anc_step3'
            },
            {
                id: 'anc_step2b',
                type: 'combat',
                enemies: ['security_bot_ancient', 'security_bot_ancient'],
                introText: 'Two pre-collapse security bots power up from dormant alcoves, red targeting lasers sweeping the corridor. They\'re old, but still lethal.',
                victoryText: 'The bots crumble into sparking wreckage. The path to the cache is open.',
                next: 'anc_step3'
            },
            {
                id: 'anc_step3',
                type: 'narrative',
                text: 'The cache is real. Sealed crates line the walls of an underground bunker. Most are corroded shut, but several are intact — military-grade equipment preserved in vacuum seal for decades.',
                choices: [
                    { label: 'Open the weapons crate', next: 'anc_step4a' },
                    { label: 'Open the tech crate', next: 'anc_step4b' },
                    { label: 'Open the medical crate', next: 'anc_step4c' }
                ]
            },
            {
                id: 'anc_step4a',
                type: 'narrative',
                text: 'Inside: a pre-collapse assault rifle in pristine condition, a crate of armor-piercing ammunition, and a set of combat armor that makes modern gear look like tin foil.',
                choices: [
                    { label: 'Take the weapons', next: 'anc_step5' }
                ]
            },
            {
                id: 'anc_step4b',
                type: 'narrative',
                text: 'Inside: a military-grade hacking deck, three EMP grenades, and a holographic mapping unit that still functions. Pre-collapse tech at its finest.',
                choices: [
                    { label: 'Take the tech', next: 'anc_step5' }
                ]
            },
            {
                id: 'anc_step4c',
                type: 'narrative',
                text: 'Inside: a field surgery kit, a dozen sealed vials of universal anti-toxin, and a portable auto-doc unit that would make any clinic weep with envy.',
                choices: [
                    { label: 'Take the medical supplies', next: 'anc_step5' }
                ]
            },
            {
                id: 'anc_step5',
                type: 'narrative',
                text: 'You load up what you can carry. This cache is a goldmine — and you can always come back for more. The scavenger\'s map was worth every credit.',
                choices: [
                    { label: 'Leave with your haul', next: 'anc_complete' }
                ]
            }
        ],
        rewards: {
            xp: 250,
            credits: 300,
            flags: { ancient_cache_found: true }
        },
        alternateRewards: {
            anc_step4a: {
                items: ['precollapse_rifle', 'combat_armor_mk2'],
                flags: { cache_weapons: true }
            },
            anc_step4b: {
                items: ['military_hack_deck', 'emp_grenade', 'emp_grenade', 'emp_grenade'],
                flags: { cache_tech: true }
            },
            anc_step4c: {
                items: ['field_surgery_kit', 'universal_antitoxin', 'auto_doc_portable'],
                flags: { cache_medical: true }
            }
        },
        flags: {
            ancient_cache_found: 'Pre-collapse cache discovered — can be revisited for remaining crates.',
            cache_weapons: 'Player chose military weapons from the cache.',
            cache_tech: 'Player chose tech equipment from the cache.',
            cache_medical: 'Player chose medical supplies from the cache.'
        }
    },

    cult_initiation: {
        id: 'cult_initiation',
        name: 'Cult Initiation',
        description: 'The Ashen Circle\'s outer ring is one thing — philosophy and ritual. But deep underground, a splinter cult called the Hollow Ones practices something darker. They claim to commune with the Void itself. Infiltrating their initiation rite might reveal whether they\'re delusional — or dangerously right.',
        location: 'deep_tunnels',
        district: 'underground',
        levelRecommended: 7,
        triggerCondition: { flag: 'void_rift_sealed' },
        questGiver: 'sister_vael',
        steps: [
            {
                id: 'ci_step1',
                type: 'narrative',
                text: 'Sister Vael pulls you aside. "The Hollow Ones. A splinter group within the Ashen Circle. They\'ve been performing rituals in the deep tunnels — blood rituals. We need to know what they\'re doing. Can you get inside their next ceremony?"',
                choices: [
                    { label: 'Infiltrate the cult', next: 'ci_step2' }
                ]
            },
            {
                id: 'ci_step2',
                type: 'skill_check',
                stat: 'charisma',
                dc: 14,
                successText: 'You approach the Hollow Ones\' recruiter with the right mix of curiosity and reverence. "You have the eyes of someone who\'s seen beyond. Come. The Hollow awaits."',
                failText: 'The recruiter is suspicious. "We don\'t take tourists." You\'ll need another way in.',
                failNext: 'ci_step2b',
                next: 'ci_step3'
            },
            {
                id: 'ci_step2b',
                type: 'skill_check',
                stat: 'dexterity',
                dc: 14,
                successText: 'You shadow a group of cultists through the tunnels, memorizing the route, and slip into the ceremony chamber through a ventilation shaft.',
                failText: 'A cultist spots you following. "Spy!" Weapons are drawn.',
                failNext: 'ci_step2c',
                next: 'ci_step3'
            },
            {
                id: 'ci_step2c',
                type: 'combat',
                enemies: ['hollow_acolyte', 'hollow_acolyte'],
                introText: 'Two cultists attack with ceremonial blades dripping with a luminescent toxin.',
                victoryText: 'The cultists fall. You take their robes as a disguise and follow the path to the ceremony chamber.',
                next: 'ci_step3'
            },
            {
                id: 'ci_step3',
                type: 'narrative',
                text: 'The ceremony chamber is carved from raw stone. Dozens of Hollow Ones kneel in concentric circles around a central pit. Their leader — the Void Speaker — stands at the edge, chanting in a language that hurts to hear. The air shimmers above the pit. Something is forming.',
                choices: [
                    { label: 'Watch and record everything', next: 'ci_step4_observe' },
                    { label: 'Participate in the ritual', next: 'ci_step4_join' },
                    { label: 'Disrupt the ritual', next: 'ci_step4_disrupt' }
                ]
            },
            {
                id: 'ci_step4_observe',
                type: 'skill_check',
                stat: 'wisdom',
                dc: 15,
                successText: 'You watch the full ritual. The pit opens — not physically but dimensionally. A presence reaches through, and for one terrifying moment, it looks directly at you. Then the connection severs. The cultists collapse, ecstatic. You have everything documented.',
                failText: 'The psychic pressure of the ritual overwhelms you. You black out momentarily. When you come to, the ceremony is ending. You captured partial documentation.',
                next: 'ci_step5'
            },
            {
                id: 'ci_step4_join',
                type: 'skill_check',
                stat: 'wisdom',
                dc: 16,
                successText: 'You kneel and join the chant. The void touches your mind — cold, vast, ancient. You glimpse something: coordinates. A location. A message. "THE LATTICE REMEMBERS." Then it\'s over. You carry knowledge the Ashen Circle will kill for.',
                failText: 'The void\'s touch is too much. You scream and collapse. The cultists drag you out, believing you were "rejected by the Hollow."',
                next: 'ci_step5'
            },
            {
                id: 'ci_step4_disrupt',
                type: 'combat',
                enemies: ['void_speaker', 'hollow_acolyte', 'hollow_acolyte', 'hollow_acolyte'],
                introText: 'You charge the Void Speaker. The cultists shriek and attack with fanatical fury.',
                victoryText: 'The Void Speaker falls and the pit snaps shut. The remaining cultists flee into the tunnels. The ritual is broken.',
                next: 'ci_step5'
            },
            {
                id: 'ci_step5',
                type: 'narrative',
                text: 'You return to Sister Vael with your report. Her face is pale. "The Hollow is real. The Void is real. This changes the Circle\'s doctrine fundamentally. Thank you — and be careful. What touches the Void is touched in return."',
                choices: [
                    { label: 'Accept her warning', next: 'ci_complete' }
                ]
            }
        ],
        rewards: {
            xp: 300,
            reputation: { ashenCircle: 20 },
            flags: { cult_infiltrated: true, void_contact: true }
        },
        flags: {
            cult_infiltrated: 'The Hollow Ones\' ritual has been witnessed.',
            void_contact: 'The player has had direct or indirect contact with the Void — affects psionic and endgame paths.'
        }
    },

    tunnel_mapping: {
        id: 'tunnel_mapping',
        name: 'Tunnel Mapping',
        description: 'The Ghost Syndicate wants a complete map of the deep tunnel network — every passage, every junction, every dead end. It\'s a massive undertaking that will take you through uncharted territory filled with hazards, hostiles, and things that have been down here longer than the city above.',
        location: 'tunnel_network',
        district: 'underground',
        levelRecommended: 5,
        triggerCondition: { location: 'tunnel_network', faction: 'ghostSyndicate', minReputation: 'neutral' },
        questGiver: 'ghost_handler',
        steps: [
            {
                id: 'tm_step1',
                type: 'narrative',
                text: 'The Ghost handler gives you a mapping device — a modified scanner that records topology, atmospheric composition, and structural integrity. "Three sectors need mapping: North Passages, East Caverns, and the Deep Bore. Each one is uncharted. Each one is dangerous. Map all three and the Syndicate pays well."',
                choices: [
                    { label: 'Start with North Passages', next: 'tm_step2_north' },
                    { label: 'Start with East Caverns', next: 'tm_step2_east' },
                    { label: 'Start with the Deep Bore', next: 'tm_step2_deep' }
                ]
            },
            {
                id: 'tm_step2_north',
                type: 'skill_check',
                stat: 'wisdom',
                dc: 12,
                successText: 'The North Passages are a maze of branching corridors, but your sense of direction holds. You map every junction and mark three potential escape routes. One sector down.',
                failText: 'You get turned around in the North Passages and waste hours retracing your steps. Eventually you complete the map, but you\'re exhausted.',
                next: 'tm_step3_check'
            },
            {
                id: 'tm_step2_east',
                type: 'combat',
                enemies: ['tunnel_crawler', 'tunnel_crawler'],
                introText: 'The East Caverns are home to tunnel crawlers — blind, chitinous predators that hunt by vibration. Two of them detect your footsteps.',
                victoryText: 'The crawlers are dead. You map the caverns in peace, documenting mineral deposits and water sources along the way.',
                next: 'tm_step3_check'
            },
            {
                id: 'tm_step2_deep',
                type: 'skill_check',
                stat: 'tech',
                dc: 14,
                successText: 'The Deep Bore is a vertical shaft descending into geothermal darkness. You use the scanner to map it remotely, bouncing signals off the walls. The data reveals a massive chamber at the bottom — uncharted and unexplained.',
                failText: 'The scanner can\'t penetrate the Deep Bore\'s magnetic interference. You\'ll have to climb down manually and map as you go. It\'s grueling work.',
                next: 'tm_step3_check'
            },
            {
                id: 'tm_step3_check',
                type: 'narrative',
                text: 'One sector mapped. Two more to go.',
                choices: [
                    { label: 'Continue to the next sector', next: 'tm_step4' }
                ]
            },
            {
                id: 'tm_step4',
                type: 'combat',
                enemies: ['feral_mutant'],
                introText: 'In the second sector, a mutant ambushes you from a side passage — feral, fast, and furious.',
                victoryText: 'The mutant drops. You map the area around its lair and discover a hidden passage connecting two sectors — the Ghosts will love this intel.',
                next: 'tm_step5'
            },
            {
                id: 'tm_step5',
                type: 'skill_check',
                stat: 'dexterity',
                dc: 13,
                successText: 'The final sector requires navigating a collapsed section — climbing over debris, squeezing through narrow gaps, and crossing a chasm on a rusted beam. Your agility sees you through. Map complete.',
                failText: 'You slip on a rusted beam and nearly fall into a chasm. You catch yourself and complete the map, but you\'re battered.',
                next: 'tm_step6'
            },
            {
                id: 'tm_step6',
                type: 'narrative',
                text: 'Three sectors mapped. The Ghost handler reviews your data with visible satisfaction. "This is worth more than you know. These tunnels are our arteries — and you just gave us a complete circulatory map. The Syndicate won\'t forget this."',
                choices: [
                    { label: 'Collect payment', next: 'tm_complete' }
                ]
            }
        ],
        rewards: {
            credits: 400,
            xp: 200,
            reputation: { ghostSyndicate: 25 },
            items: ['tunnel_map_complete'],
            flags: { tunnels_mapped: true }
        },
        flags: {
            tunnels_mapped: 'Complete tunnel map — enables fast-travel through underground and provides Ghost Syndicate intelligence.'
        }
    },

    lost_expedition: {
        id: 'lost_expedition',
        name: 'Lost Expedition',
        description: 'A research team from Meridian Corp ventured into the deepest tunnels three weeks ago. They were studying pre-collapse infrastructure. They stopped transmitting ten days ago. Meridian has written them off. But their last transmission mentioned a discovery — something that "changes everything." Someone should find out what that means.',
        location: 'deep_tunnels',
        district: 'underground',
        levelRecommended: 9,
        triggerCondition: { location: 'deep_tunnels', level: 8 },
        questGiver: null,
        steps: [
            {
                id: 'le_step1',
                type: 'narrative',
                text: 'Deep in the tunnels, you find the first sign: a Meridian equipment case, abandoned. Then another. A trail of discarded gear leading into the darkness. The expedition\'s path is clear — they went further than anyone has gone before.',
                choices: [
                    { label: 'Follow the trail', next: 'le_step2' }
                ]
            },
            {
                id: 'le_step2',
                type: 'skill_check',
                stat: 'wisdom',
                dc: 14,
                successText: 'You follow the equipment trail and environmental clues — scratches on walls, disturbed dust, abandoned pitons. The expedition was methodical but increasingly hurried.',
                failText: 'The trail goes cold in a junction. You pick a direction based on instinct.',
                next: 'le_step3'
            },
            {
                id: 'le_step3',
                type: 'combat',
                enemies: ['tunnel_crawler', 'tunnel_crawler', 'tunnel_crawler'],
                introText: 'The passage opens into a gallery infested with tunnel crawlers. Among the chitinous bodies, you spot a Meridian researcher\'s jacket. It\'s stained with blood.',
                victoryText: 'The crawlers are cleared. The jacket\'s pockets contain a data pad with partial logs. The team found something — a chamber they called "the Lattice."',
                next: 'le_step4'
            },
            {
                id: 'le_step4',
                type: 'narrative',
                text: 'The data pad logs grow increasingly frantic. "The Lattice is not natural. Repeating geometric patterns at impossible scale. Dr. Yun says it predates human settlement by millennia. We must go deeper." The final entry: "Something is in the Lattice. It spoke to Yun. She won\'t stop walking toward it."',
                choices: [
                    { label: 'Press on to the Lattice', next: 'le_step5' },
                    { label: 'Turn back — this is beyond you', next: 'le_abort' }
                ]
            },
            {
                id: 'le_step5',
                type: 'skill_check',
                stat: 'intelligence',
                dc: 16,
                successText: 'You navigate the increasingly alien geometry of the tunnels. The walls are no longer concrete — they\'re something else, something grown rather than built. Crystalline structures pulse with faint light. You reach the Lattice.',
                failText: 'The geometry of the tunnels warps your sense of direction. You wander for what feels like hours before stumbling into the Lattice chamber by accident.',
                next: 'le_step6'
            },
            {
                id: 'le_step6',
                type: 'narrative',
                text: 'The Lattice is a vast underground chamber filled with geometric structures of unknown origin — towering crystalline pillars connected by glowing filaments that form patterns too complex for the human eye to fully process. In the center, three members of the expedition sit in a trance, eyes open, mouths moving without sound. Dr. Yun stands before the largest pillar, her hand pressed against it, her body outlined in light.',
                choices: [
                    { label: 'Touch the Lattice', next: 'le_step7_touch' },
                    { label: 'Try to wake the researchers', next: 'le_step7_wake' },
                    { label: 'Document everything and pull them out by force', next: 'le_step7_force' }
                ]
            },
            {
                id: 'le_step7_touch',
                type: 'skill_check',
                stat: 'wisdom',
                dc: 17,
                successText: 'You touch the Lattice. Your mind expands. For one eternal second, you perceive the structure\'s true nature — a data storage system of incomprehensible age and capacity. A library built by something that existed before humanity. Knowledge floods into you: fragments of history, star charts, warnings. Then the connection severs. You are changed.',
                failText: 'The Lattice overwhelms your mind. You black out and wake minutes later with a nosebleed and fragmented visions — enough to know this place is ancient and important, but not enough to understand why.',
                next: 'le_step8'
            },
            {
                id: 'le_step7_wake',
                type: 'skill_check',
                stat: 'charisma',
                dc: 14,
                successText: 'You shake the researchers, shout their names, slap their faces. One by one, they come out of it — confused, terrified, but alive. Dr. Yun is the last. She stares at you with haunted eyes. "It\'s a message. The whole Lattice is a message. And we\'re running out of time to read it."',
                failText: 'Two researchers snap out of it, but Dr. Yun and one other remain locked in communion with the Lattice. You\'ll have to pull them away by force.',
                failNext: 'le_step7_force',
                next: 'le_step8'
            },
            {
                id: 'le_step7_force',
                type: 'narrative',
                text: 'You physically drag the researchers away from the Lattice. Dr. Yun screams when you break her contact — a sound of loss so profound it echoes through the chamber. The Lattice dims. The expedition is alive, but the connection is broken.',
                choices: [
                    { label: 'Get everyone out', next: 'le_step8' }
                ]
            },
            {
                id: 'le_step8',
                type: 'narrative',
                text: 'You lead the surviving expedition members back to the surface. Dr. Yun is catatonic. The others speak in fragmented sentences about "the message" and "the warning." Whatever the Lattice is, it\'s been waiting down there for a very long time. And now it\'s been found.',
                choices: [
                    { label: 'Report the discovery', next: 'le_complete' }
                ]
            }
        ],
        rewards: {
            xp: 500,
            credits: 200,
            flags: { lost_expedition_found: true, lattice_discovered: true }
        },
        alternateRewards: {
            le_step7_touch: {
                xp: 600,
                traits: ['lattice_touched'],
                flags: { lost_expedition_found: true, lattice_discovered: true, lattice_communion: true }
            }
        },
        flags: {
            lost_expedition_found: 'The Meridian research team has been recovered.',
            lattice_discovered: 'The Lattice — a pre-human data structure — has been found. Major endgame discovery.',
            lattice_communion: 'The player directly interfaced with the Lattice — grants unique knowledge and dialogue options in the finale.'
        }
    }
};
