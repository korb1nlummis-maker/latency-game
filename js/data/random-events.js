/**
 * LATENCY - Random Events Data
 * ============================================================
 * Mini-story encounters triggered during map travel. Organized
 * by district (undercity, midcity, highcity, underground) with
 * each event providing 2-3 choices and meaningful consequences.
 *
 * Event structure:
 *   id          {string}   Unique event identifier
 *   name        {string}   Short title for the encounter
 *   district    {string}   Which district pool this belongs to
 *   text        {string}   Narrative description shown to the player
 *   minLevel    {number}   Minimum player level to trigger (default 1)
 *   maxLevel    {number}   Maximum player level to trigger (default 99)
 *   requires    {Object}   Optional conditions: { flag, trait, stat }
 *   choices     {Array}    2-3 player options, each with:
 *     .label    {string}   Button/choice text
 *     .check    {Object}   Optional stat check: { stat, dc }
 *     .success  {Object}   Outcome on success (or if no check)
 *     .failure  {Object}   Outcome on failed check
 *
 * Outcome fields (all optional):
 *   text        {string}   Result narrative
 *   xp          {number}   XP gained
 *   credits     {number}   Credits gained (negative = lost)
 *   items       {Array}    Item IDs added to inventory
 *   reputation  {Object}   { factionId: delta }
 *   flags       {Array}    Story flags to set
 *   damage      {number}   HP damage taken
 *   heal        {number}   HP restored
 *   trait       {string}   Trait ID to add
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.RandomEvents = {

    // =========================================================================
    //  UNDERCITY EVENTS
    // =========================================================================

    scrap_find: {
        id: 'scrap_find',
        name: 'Scrap Discovery',
        district: 'undercity',
        text: 'You spot a glint of metal among the refuse. A half-buried panel looks like it might have salvageable components inside, but prying it open will take time and make noise.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Pry it open',
                check: { stat: 'strength', dc: 10 },
                success: {
                    text: 'The panel gives way with a satisfying crack. Inside you find usable scrap metal and a few corroded credits.',
                    xp: 10,
                    credits: 15,
                    items: ['scrap_metal']
                },
                failure: {
                    text: 'The panel is stuck fast. You cut your hand trying to force it open and attract unwanted attention. Nothing gained but a wound.',
                    damage: 3,
                    xp: 5
                }
            },
            {
                label: 'Use a tool to extract carefully',
                check: { stat: 'tech', dc: 12 },
                success: {
                    text: 'Your careful approach pays off. You extract a circuit board and some scrap without making a sound.',
                    xp: 15,
                    items: ['circuit_board', 'scrap_metal']
                },
                failure: {
                    text: 'Your tool slips and shorts out the panel. A small spark, nothing salvageable. At least you learned something.',
                    xp: 8
                }
            },
            {
                label: 'Leave it alone',
                success: {
                    text: 'You move on. Not everything shiny is worth the risk down here.',
                    xp: 5
                }
            }
        ]
    },

    mugged: {
        id: 'mugged',
        name: 'Ambush in the Dark',
        district: 'undercity',
        text: 'A figure steps from the shadows ahead, blade glinting. "Credits. All of them. Now." Two more shapes materialize behind you. This was planned.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Fight back',
                check: { stat: 'strength', dc: 13 },
                success: {
                    text: 'You knock the lead attacker flat. The others scatter like rats. You take what the leader dropped.',
                    xp: 25,
                    credits: 20,
                    items: ['med_patch']
                },
                failure: {
                    text: 'They overwhelm you. A boot to the ribs, hands rifling your pockets. They leave you bleeding in the gutter.',
                    credits: -25,
                    damage: 8,
                    xp: 10
                }
            },
            {
                label: 'Talk your way out',
                check: { stat: 'charisma', dc: 14 },
                success: {
                    text: 'You convince them you are connected to a local gang and that robbing you would bring heat. They back off, muttering threats.',
                    xp: 20
                },
                failure: {
                    text: 'They do not buy your bluff. A fist connects with your jaw, and they help themselves to your credits.',
                    credits: -20,
                    damage: 5,
                    xp: 10
                }
            },
            {
                label: 'Hand over some credits',
                success: {
                    text: 'You toss a handful of credits and back away. They grab the money and vanish. Cheaper than a funeral.',
                    credits: -15,
                    xp: 5
                }
            }
        ]
    },

    lost_child: {
        id: 'lost_child',
        name: 'Lost Child',
        district: 'undercity',
        text: 'A small child sits crying against a rusted wall. Filthy clothes, hollow eyes. They are looking for their parent who went scavenging and never came back.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Help them search',
                check: { stat: 'wisdom', dc: 11 },
                success: {
                    text: 'You follow the child\'s description and find their parent trapped under debris but alive. The family reunites, tearfully grateful. They press a small token into your hand.',
                    xp: 30,
                    items: ['luck_charm'],
                    reputation: { ironCollective: 3 }
                },
                failure: {
                    text: 'You search for an hour but find nothing. The child eventually wanders off, still crying. The slums swallow people without a trace.',
                    xp: 15
                }
            },
            {
                label: 'Give them food and credits',
                success: {
                    text: 'You hand over some credits and a ration. The child stares at you like you are something from a fairy tale. Small kindnesses feel enormous down here.',
                    credits: -10,
                    xp: 20,
                    reputation: { ironCollective: 2 }
                }
            },
            {
                label: 'Keep moving',
                success: {
                    text: 'You walk past. You cannot save everyone. The crying fades behind you, replaced by the usual sounds of the slums.',
                    xp: 5
                }
            }
        ]
    },

    street_preacher: {
        id: 'street_preacher',
        name: 'Street Preacher',
        district: 'undercity',
        text: 'A wild-eyed figure stands on a crate, ranting about the coming void and the end of all code. Circuit tattoos glow faintly on their skin. A small crowd watches, half-fascinated, half-terrified.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Listen to their sermon',
                check: { stat: 'intelligence', dc: 12 },
                success: {
                    text: 'Beneath the madness, you catch fragments of real insight about the city\'s hidden systems. Data the corporations do not want public. You memorize what you can.',
                    xp: 25,
                    flags: ['heard_void_prophecy'],
                    reputation: { ashenCircle: 2 }
                },
                failure: {
                    text: 'The words blur together into nonsensical raving. You leave with a headache and nothing useful. Some truths are wrapped in too much noise.',
                    xp: 10
                }
            },
            {
                label: 'Ask about the Circuit Saints',
                check: { stat: 'charisma', dc: 11 },
                success: {
                    text: 'The preacher leans close and whispers a location where true believers gather. "Seek the machine-god\'s light." Could be useful, could be a trap.',
                    xp: 20,
                    flags: ['circuit_saints_rumor'],
                    reputation: { circuitSaints: 2 }
                },
                failure: {
                    text: 'The preacher screams that you are a corporate spy and the crowd turns hostile. You leave quickly.',
                    xp: 5,
                    reputation: { circuitSaints: -1 }
                }
            },
            {
                label: 'Ignore and move on',
                success: {
                    text: 'Another doomsayer in a city full of them. You keep walking.',
                    xp: 5
                }
            }
        ]
    },

    drug_deal: {
        id: 'drug_deal',
        name: 'Backstreet Deal',
        district: 'undercity',
        text: 'You stumble upon two figures exchanging a glowing vial in a dead-end alley. They freeze when they see you. One has a hand on a concealed weapon.',
        minLevel: 2,
        maxLevel: 99,
        choices: [
            {
                label: 'Walk away, pretend you saw nothing',
                success: {
                    text: 'You back off slowly, hands visible. They let you go. In the undercity, minding your own business is a survival skill.',
                    xp: 10
                }
            },
            {
                label: 'Offer to buy some',
                check: { stat: 'charisma', dc: 12 },
                success: {
                    text: 'They relax and sell you a stim at a "friend" price. Not the purest stuff, but it will do the job.',
                    credits: -20,
                    items: ['stim_shot'],
                    xp: 15,
                    reputation: { ghostSyndicate: 1 }
                },
                failure: {
                    text: 'They think you are a narc. The dealer pulls the weapon. You barely escape the alley unscathed.',
                    damage: 5,
                    xp: 10
                }
            },
            {
                label: 'Threaten to report them unless they pay you off',
                check: { stat: 'charisma', dc: 16 },
                success: {
                    text: 'Risky play, but it works. They toss you some credits to keep quiet. You have made enemies, though.',
                    credits: 30,
                    xp: 20,
                    reputation: { ghostSyndicate: -3 }
                },
                failure: {
                    text: 'Bad move. They do not take kindly to threats. You catch a beating and barely crawl away.',
                    damage: 12,
                    credits: -10,
                    xp: 10,
                    reputation: { ghostSyndicate: -2 }
                }
            }
        ]
    },

    sewer_shortcut: {
        id: 'sewer_shortcut',
        name: 'Sewer Shortcut',
        district: 'undercity',
        text: 'A half-open grate reveals a tunnel that might cut your travel time. The smell is vile and something is moving in the darkness below, but it would save valuable time.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Take the shortcut',
                check: { stat: 'dexterity', dc: 12 },
                success: {
                    text: 'You navigate the tunnels without incident, picking up a few things others dropped along the way. Not pleasant, but efficient.',
                    xp: 15,
                    credits: 8,
                    items: ['antidote']
                },
                failure: {
                    text: 'You slip on something unspeakable and twist your ankle. Whatever is down here heard you fall. You scramble out, battered.',
                    damage: 6,
                    xp: 10
                }
            },
            {
                label: 'Stay on the surface',
                success: {
                    text: 'The longer route is the safer one. Sometimes boring is good.',
                    xp: 5
                }
            }
        ]
    },

    scavenger_cache: {
        id: 'scavenger_cache',
        name: 'Hidden Cache',
        district: 'undercity',
        text: 'Behind a loose wall panel, you spot a wrapped bundle. Someone hid supplies here and never came back for them.',
        minLevel: 1,
        maxLevel: 10,
        choices: [
            {
                label: 'Take it',
                success: {
                    text: 'A few credits, a med-patch, and a half-eaten ration bar. Someone else\'s loss is your gain.',
                    xp: 15,
                    credits: 12,
                    items: ['med_patch']
                }
            },
            {
                label: 'Leave it in case they return',
                success: {
                    text: 'You leave the cache untouched. Maybe its owner will come back. Maybe not. Either way, your conscience is clean.',
                    xp: 10,
                    reputation: { ironCollective: 1 }
                }
            }
        ]
    },

    rust_storm: {
        id: 'rust_storm',
        name: 'Rust Storm',
        district: 'undercity',
        text: 'The air fills with orange-brown particles as a rust storm blows through the lower levels. Visibility drops to nothing. Corrosive dust stings exposed skin.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Find shelter and wait it out',
                check: { stat: 'wisdom', dc: 10 },
                success: {
                    text: 'You duck into a doorway and cover your face. The storm passes in minutes. You emerge unharmed, if a bit orange.',
                    xp: 10
                },
                failure: {
                    text: 'The shelter you chose has a collapsed roof. Dust gets everywhere. Your lungs burn for hours.',
                    damage: 4,
                    xp: 8
                }
            },
            {
                label: 'Push through it',
                check: { stat: 'constitution', dc: 14 },
                success: {
                    text: 'You power through the storm, breathing through your sleeve. Tough, but you make it through while others cower.',
                    xp: 20
                },
                failure: {
                    text: 'The dust is worse than you thought. Your eyes burn, your skin itches, and you inhale things you should not have.',
                    damage: 8,
                    xp: 10
                }
            }
        ]
    },

    // =========================================================================
    //  MIDCITY EVENTS
    // =========================================================================

    corporate_recruiter: {
        id: 'corporate_recruiter',
        name: 'Corporate Recruiter',
        district: 'midcity',
        text: 'A woman in a crisp suit intercepts you with a holographic business card. "Omnidyne Solutions is looking for capable operatives. Discretion required. Compensation generous." She smiles too perfectly.',
        minLevel: 3,
        maxLevel: 99,
        choices: [
            {
                label: 'Take the card and listen',
                success: {
                    text: 'She outlines a corporate extraction job. The details are vague but the pay is real. She says to contact her when you are ready. Another thread in the city\'s web of power.',
                    xp: 20,
                    flags: ['omnidyne_contact'],
                    reputation: { neonCourt: 2 }
                }
            },
            {
                label: 'Decline politely',
                success: {
                    text: 'You hand the card back. "Not interested." Her smile does not waver. "Everyone is eventually." She vanishes into the crowd.',
                    xp: 10
                }
            },
            {
                label: 'Tell her what the corps can do with their offers',
                success: {
                    text: 'She blinks once, then walks away without a word. Somewhere, a file with your name gets a new note. Worth it.',
                    xp: 15,
                    reputation: { ironCollective: 2, neonCourt: -2 }
                }
            }
        ]
    },

    protest_march: {
        id: 'protest_march',
        name: 'Protest March',
        district: 'midcity',
        text: 'A crowd fills the street, chanting against the latest corporate decree. Signs wave. Drones circle overhead. Riot police are forming a line at the far end. Things could escalate fast.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Join the protest',
                check: { stat: 'constitution', dc: 12 },
                success: {
                    text: 'You march with the crowd, adding your voice. The energy is electric. The protest disperses before the police charge, and you slip away invigorated.',
                    xp: 25,
                    reputation: { ironCollective: 3, neonCourt: -2 }
                },
                failure: {
                    text: 'The police advance with shock batons. You take a hit before escaping into a side street. The bruises will remind you for days.',
                    damage: 7,
                    xp: 15,
                    reputation: { ironCollective: 2, neonCourt: -1 }
                }
            },
            {
                label: 'Observe from a safe distance',
                success: {
                    text: 'You watch from an alley. When the gas canisters fly, you are already gone. You note the protest leaders for future reference.',
                    xp: 15,
                    flags: ['witnessed_protest']
                }
            },
            {
                label: 'Use the confusion to pick pockets',
                check: { stat: 'dexterity', dc: 14 },
                success: {
                    text: 'Chaos is opportunity. Your fingers find several wallets before you fade into the crowd. Nobody notices.',
                    credits: 35,
                    xp: 20,
                    reputation: { ghostSyndicate: 1, ironCollective: -2 }
                },
                failure: {
                    text: 'Someone grabs your wrist. "THIEF!" The crowd turns on you. You barely escape with a black eye and empty pockets.',
                    damage: 5,
                    xp: 10,
                    reputation: { ironCollective: -3 }
                }
            }
        ]
    },

    drone_malfunction: {
        id: 'drone_malfunction',
        name: 'Drone Malfunction',
        district: 'midcity',
        text: 'A corporate surveillance drone spirals out of control overhead, trailing sparks. It crashes into a wall nearby and lies twitching on the ground. Its camera eye blinks red.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Salvage it for parts',
                check: { stat: 'tech', dc: 13 },
                success: {
                    text: 'You strip the drone efficiently, pulling a circuit board and some rare components before anyone else arrives.',
                    xp: 20,
                    items: ['circuit_board', 'scrap_metal'],
                    reputation: { neonCourt: -1 }
                },
                failure: {
                    text: 'The drone zaps you when you touch it. Self-defense protocol, even in death. Your fingers tingle for hours.',
                    damage: 4,
                    xp: 10
                }
            },
            {
                label: 'Check its data storage',
                check: { stat: 'intelligence', dc: 15 },
                success: {
                    text: 'You extract a data chip before wiping the drone\'s memory. The surveillance footage could be valuable to the right buyer.',
                    xp: 25,
                    flags: ['drone_data_chip'],
                    reputation: { ghostSyndicate: 2 }
                },
                failure: {
                    text: 'The encryption is beyond you. The data self-destructs as you fumble with the interface. A waste.',
                    xp: 10
                }
            },
            {
                label: 'Leave it. Corporate will send retrieval.',
                success: {
                    text: 'You step around the wreckage and keep walking. Messing with corp property is how people disappear.',
                    xp: 5
                }
            }
        ]
    },

    street_performer: {
        id: 'street_performer',
        name: 'Street Performer',
        district: 'midcity',
        text: 'A musician plays a haunting melody on a synth-violin. The sound cuts through the city noise like a blade. A few people have stopped to listen, transfixed.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Stop and listen',
                success: {
                    text: 'The music washes over you, and for a moment the city is almost beautiful. You feel rested, centered. The musician nods as you leave.',
                    xp: 15,
                    heal: 5
                }
            },
            {
                label: 'Tip generously',
                success: {
                    text: 'You drop credits into the case. The musician smiles and plays a private flourish just for you. "Stay safe out there, friend." The words feel like a blessing.',
                    credits: -10,
                    xp: 20,
                    heal: 8
                }
            },
            {
                label: 'Keep walking',
                success: {
                    text: 'You pass by. Beauty is a luxury in this city, and you have places to be.',
                    xp: 5
                }
            }
        ]
    },

    info_broker_tip: {
        id: 'info_broker_tip',
        name: 'Information for Sale',
        district: 'midcity',
        text: 'A nervous-looking figure sidles up to you in the transit corridor. "I have information. Good information. About the faction war. Fifty credits and it is yours."',
        minLevel: 3,
        maxLevel: 99,
        choices: [
            {
                label: 'Pay for the information',
                success: {
                    text: 'The tip checks out. Details about a faction supply route and a hidden weapons cache. Knowledge is power in this city.',
                    credits: -50,
                    xp: 30,
                    flags: ['faction_war_intel']
                }
            },
            {
                label: 'Intimidate them into giving it free',
                check: { stat: 'strength', dc: 14 },
                success: {
                    text: 'You lean in close. They pale and talk fast. You get the intel and keep your credits. Not your proudest moment.',
                    xp: 25,
                    flags: ['faction_war_intel'],
                    reputation: { ghostSyndicate: -2 }
                },
                failure: {
                    text: 'They are tougher than they look. A concealed shock device zaps you and they bolt. No intel, no dignity.',
                    damage: 6,
                    xp: 10
                }
            },
            {
                label: 'Decline',
                success: {
                    text: '"Your loss," they mutter, and disappear into the crowd. Information flows like water here. There will be other chances.',
                    xp: 5
                }
            }
        ]
    },

    transit_delay: {
        id: 'transit_delay',
        name: 'Transit Delay',
        district: 'midcity',
        text: 'The transit line is shut down. "Security incident," the automated voice drones. A crowd mills about, restless. You overhear two guards arguing about something they found on the tracks.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Eavesdrop on the guards',
                check: { stat: 'dexterity', dc: 12 },
                success: {
                    text: 'You catch fragments of their conversation. Something about a body, corporate markings, and a data drive. The kind of thing people pay to know about.',
                    xp: 20,
                    flags: ['transit_murder_clue']
                },
                failure: {
                    text: 'One of the guards notices you lingering. "Move along, citizen." You comply before it becomes an incident.',
                    xp: 5
                }
            },
            {
                label: 'Find an alternate route',
                success: {
                    text: 'You know the side streets well enough. The detour costs you time but nothing else.',
                    xp: 10
                }
            }
        ]
    },

    neon_gambler: {
        id: 'neon_gambler',
        name: 'The Gambler',
        district: 'midcity',
        text: 'A sharp-dressed figure runs a shell game on a folding table. "Find the queen, double your money. Simple as that." Their hands move like water.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Play the game',
                check: { stat: 'luck', dc: 15 },
                success: {
                    text: 'Your eyes track the queen. You point. The gambler flips the cup and grimaces. "Lucky one, you are." They pay up reluctantly.',
                    credits: 25,
                    xp: 15
                },
                failure: {
                    text: 'You were sure it was the left cup. It was not. The gambler grins. "Better luck next time." Your credits disappear into their pocket.',
                    credits: -25,
                    xp: 10
                }
            },
            {
                label: 'Expose the con',
                check: { stat: 'intelligence', dc: 14 },
                success: {
                    text: 'You spot the palming technique and call it out. The crowd turns on the gambler, who bolts. A few grateful bystanders toss you credits.',
                    credits: 15,
                    xp: 20
                },
                failure: {
                    text: 'You accuse them but cannot prove it. The crowd sides with the gambler. You slink away, embarrassed.',
                    xp: 5
                }
            },
            {
                label: 'Walk past',
                success: {
                    text: 'The house always wins. You know better.',
                    xp: 5
                }
            }
        ]
    },

    black_market_whisper: {
        id: 'black_market_whisper',
        name: 'Black Market Tip',
        district: 'midcity',
        text: 'A stranger bumps into you and slips a note into your pocket. It reads: "Fresh shipment tonight. B-7 warehouse. Tell them Whisper sent you." The handwriting is precise.',
        minLevel: 4,
        maxLevel: 99,
        choices: [
            {
                label: 'Keep the note for later',
                success: {
                    text: 'You pocket the note. Could be an opportunity. Could be a setup. Either way, the information has value.',
                    xp: 15,
                    flags: ['whisper_invitation'],
                    reputation: { ghostSyndicate: 1 }
                }
            },
            {
                label: 'Destroy the note immediately',
                success: {
                    text: 'You tear it up and scatter the pieces. Whatever game Whisper is playing, you want no part of it.',
                    xp: 10
                }
            },
            {
                label: 'Report it to the nearest security terminal',
                success: {
                    text: 'You feed the note into a security scanner. A reward credit pings to your account. Somewhere, Whisper will not be happy.',
                    credits: 20,
                    xp: 15,
                    reputation: { ghostSyndicate: -3, neonCourt: 2 }
                }
            }
        ]
    },

    // =========================================================================
    //  HIGHCITY EVENTS
    // =========================================================================

    security_checkpoint: {
        id: 'security_checkpoint',
        name: 'Security Checkpoint',
        district: 'highcity',
        text: 'An elite security checkpoint blocks the corridor. Scanners, armed guards, biometric readers. "Identification and purpose of visit," the lead guard demands flatly.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Present credentials and comply',
                check: { stat: 'charisma', dc: 12 },
                success: {
                    text: 'Your composure passes muster. They wave you through with minimal delay. "Move along." The upper city tolerates the useful.',
                    xp: 15
                },
                failure: {
                    text: 'They pull you aside for an "enhanced screening." Uncomfortable questions, uncomfortable scanning. They let you go eventually, but you feel watched.',
                    xp: 10,
                    flags: ['security_flagged']
                }
            },
            {
                label: 'Forge a bypass with tech',
                check: { stat: 'tech', dc: 16 },
                success: {
                    text: 'A subtle hack spoofs the scanner. You walk through like you own the place. The guards never blink.',
                    xp: 30,
                    reputation: { ghostSyndicate: 2 }
                },
                failure: {
                    text: 'The system catches the hack attempt. Alarms blare. You run. They do not chase far, but you are definitely on a list now.',
                    xp: 15,
                    damage: 3,
                    reputation: { neonCourt: -3 }
                }
            },
            {
                label: 'Turn around and find another way',
                success: {
                    text: 'Discretion over valor. You take the long route around. Sometimes the best way through a wall is around it.',
                    xp: 5
                }
            }
        ]
    },

    wealthy_patron: {
        id: 'wealthy_patron',
        name: 'Wealthy Patron',
        district: 'highcity',
        text: 'A richly dressed figure watches you from a skybridge. They beckon you over. "You have an interesting look about you. Someone who has seen the real city. I could use that perspective."',
        minLevel: 5,
        maxLevel: 99,
        choices: [
            {
                label: 'Hear them out',
                success: {
                    text: 'They want someone to retrieve a personal item from the lower levels. Too dangerous for their usual staff, they say. The offered payment is generous.',
                    xp: 20,
                    credits: 50,
                    flags: ['patron_retrieval_quest'],
                    reputation: { neonCourt: 2 }
                }
            },
            {
                label: 'Ask what they really want',
                check: { stat: 'wisdom', dc: 14 },
                success: {
                    text: 'Your directness catches them off guard. They admit they need a rival\'s data files stolen. The honesty earns you a better deal and a useful contact.',
                    xp: 25,
                    credits: 75,
                    flags: ['patron_real_job'],
                    reputation: { neonCourt: 3, ghostSyndicate: 1 }
                },
                failure: {
                    text: 'They smile thinly. "So suspicious. Perhaps you are not the right fit after all." They turn away, conversation over.',
                    xp: 10
                }
            },
            {
                label: 'Decline respectfully',
                success: {
                    text: '"A shame," they murmur, already looking past you. In the high city, you are either useful or invisible.',
                    xp: 10
                }
            }
        ]
    },

    data_leak: {
        id: 'data_leak',
        name: 'Data Leak',
        district: 'highcity',
        text: 'A public terminal glitches, briefly displaying what looks like classified corporate data. Financial records, security protocols, names. It flickers, about to reset.',
        minLevel: 3,
        maxLevel: 99,
        choices: [
            {
                label: 'Download as much as possible',
                check: { stat: 'tech', dc: 15 },
                success: {
                    text: 'Your fingers fly across the interface. You capture a significant data packet before the system locks down. This could be worth a fortune to the right people.',
                    xp: 35,
                    flags: ['corporate_data_stolen'],
                    reputation: { ghostSyndicate: 3, neonCourt: -3 }
                },
                failure: {
                    text: 'The terminal resets before you finish. Worse, the system logged your biometrics during the attempt. Not ideal.',
                    xp: 15,
                    flags: ['security_flagged'],
                    reputation: { neonCourt: -2 }
                }
            },
            {
                label: 'Memorize key details',
                check: { stat: 'intelligence', dc: 13 },
                success: {
                    text: 'You scan the data quickly, committing names and numbers to memory. No digital trail. Smart.',
                    xp: 25,
                    flags: ['corporate_data_memorized']
                },
                failure: {
                    text: 'Too much data, too little time. You retain fragments but nothing coherent enough to use.',
                    xp: 10
                }
            },
            {
                label: 'Report the glitch to corporate security',
                success: {
                    text: 'You flag down a security officer. They lock down the terminal and thank you curtly. A small bounty pings to your account.',
                    credits: 30,
                    xp: 20,
                    reputation: { neonCourt: 3, ghostSyndicate: -2 }
                }
            }
        ]
    },

    rooftop_view: {
        id: 'rooftop_view',
        name: 'Rooftop Vista',
        district: 'highcity',
        text: 'A maintenance door stands ajar, leading to an open rooftop above the smog line. Actual sunlight streams through. The city sprawls below like a circuit board stretching to the horizon.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Take a moment to breathe',
                success: {
                    text: 'You stand in real sunlight for the first time in weeks. The warmth on your face feels alien. Beautiful. You remember what sky looks like. A rare gift in this city.',
                    xp: 15,
                    heal: 10
                }
            },
            {
                label: 'Search the rooftop',
                check: { stat: 'wisdom', dc: 13 },
                success: {
                    text: 'Someone has been using this spot. You find a stash hidden under a ventilation unit. Emergency supplies, probably forgotten.',
                    xp: 20,
                    items: ['stim_shot', 'med_patch']
                },
                failure: {
                    text: 'Nothing up here but sky and wind. Still, the view alone was worth the detour.',
                    xp: 10,
                    heal: 5
                }
            }
        ]
    },

    elite_party: {
        id: 'elite_party',
        name: 'High Society Gathering',
        district: 'highcity',
        text: 'Music and laughter spill from an open penthouse door. Holographic decorations shimmer. A distracted doorman barely glances at newcomers. This is clearly an exclusive event.',
        minLevel: 5,
        maxLevel: 99,
        choices: [
            {
                label: 'Blend in and mingle',
                check: { stat: 'charisma', dc: 15 },
                success: {
                    text: 'You adopt the right posture and vocabulary. Nobody questions your presence. You overhear valuable gossip and pocket a few hors d\'oeuvres. Real food.',
                    xp: 30,
                    heal: 5,
                    flags: ['elite_party_infiltrated'],
                    reputation: { neonCourt: 2 }
                },
                failure: {
                    text: 'Someone spots you as an outsider. Security escorts you out firmly but quietly. They do not want a scene. Neither do you.',
                    xp: 15,
                    reputation: { neonCourt: -1 }
                }
            },
            {
                label: 'Sneak in through the service entrance',
                check: { stat: 'dexterity', dc: 14 },
                success: {
                    text: 'The kitchen staff are too busy to notice one more face. You grab a server uniform and move through the party freely, ears open.',
                    xp: 25,
                    credits: 20,
                    flags: ['elite_party_infiltrated']
                },
                failure: {
                    text: 'A chef spots you and raises the alarm. You escape through a window, minus your dignity.',
                    xp: 10,
                    damage: 3
                }
            },
            {
                label: 'Keep walking',
                success: {
                    text: 'Their world, not yours. You move on.',
                    xp: 5
                }
            }
        ]
    },

    corporate_spy: {
        id: 'corporate_spy',
        name: 'Corporate Dead Drop',
        district: 'highcity',
        text: 'You notice a woman in a maintenance uniform placing something behind a ventilation panel. She sees you watching. Her hand moves toward her belt.',
        minLevel: 4,
        maxLevel: 99,
        choices: [
            {
                label: 'Offer to help',
                check: { stat: 'charisma', dc: 14 },
                success: {
                    text: 'She relaxes marginally. "I need a lookout. Five minutes. Fifty credits." Easy money if she is telling the truth.',
                    credits: 50,
                    xp: 20,
                    reputation: { ghostSyndicate: 2 }
                },
                failure: {
                    text: 'She does not trust you. A flash of light and your vision blurs. When it clears, she is gone. Your head pounds.',
                    damage: 5,
                    xp: 10
                }
            },
            {
                label: 'Check the dead drop after she leaves',
                check: { stat: 'dexterity', dc: 13 },
                success: {
                    text: 'She leaves quickly. Behind the panel you find a data chip. Whatever is on it, someone wanted it badly enough to risk this.',
                    xp: 25,
                    flags: ['intercepted_dead_drop'],
                    reputation: { ghostSyndicate: -1 }
                },
                failure: {
                    text: 'The panel is booby-trapped. A small charge zaps you. The chip self-destructs. Paranoid professionals.',
                    damage: 8,
                    xp: 10
                }
            },
            {
                label: 'Pretend you saw nothing',
                success: {
                    text: 'You avert your eyes and keep moving. In this city, curiosity and obituaries share a column.',
                    xp: 5
                }
            }
        ]
    },

    // =========================================================================
    //  UNDERGROUND EVENTS
    // =========================================================================

    cave_in: {
        id: 'cave_in',
        name: 'Tunnel Collapse',
        district: 'underground',
        text: 'A deep rumble shakes the tunnel. Dust cascades from the ceiling. A section of the passage ahead groans and begins to give way. You have seconds to react.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Sprint through before it collapses',
                check: { stat: 'dexterity', dc: 14 },
                success: {
                    text: 'You dive through as tons of rock crash down behind you. Close. Very close. But you are through, and there is no going back.',
                    xp: 25
                },
                failure: {
                    text: 'Debris catches you. You pull yourself free, bruised and bleeding, but the tunnel ahead is blocked. You find an alternate path.',
                    damage: 10,
                    xp: 15
                }
            },
            {
                label: 'Brace and shield yourself',
                check: { stat: 'constitution', dc: 13 },
                success: {
                    text: 'You press against the wall and let the rubble fall around you. When the dust settles, you are battered but alive. The tunnel is narrower now.',
                    damage: 3,
                    xp: 20
                },
                failure: {
                    text: 'A chunk of ceiling catches your shoulder. Pain explodes through your body. You dig yourself out slowly, painfully.',
                    damage: 12,
                    xp: 15
                }
            },
            {
                label: 'Retreat immediately',
                success: {
                    text: 'You backpedal fast, letting the tunnel collapse ahead. The safe choice. You will need to find another route.',
                    xp: 10
                }
            }
        ]
    },

    glowing_fungus: {
        id: 'glowing_fungus',
        name: 'Bioluminescent Garden',
        district: 'underground',
        text: 'The tunnel opens into a cavern coated in softly glowing fungus. Blues, greens, and purples pulse in slow rhythms. The air is warm and thick with spores. Beautiful, but nature underground is rarely benign.',
        minLevel: 1,
        maxLevel: 99,
        choices: [
            {
                label: 'Harvest some fungus samples',
                check: { stat: 'intelligence', dc: 13 },
                success: {
                    text: 'You carefully extract samples without disturbing the colony. These have medicinal properties. A pharmacist or researcher would pay well for them.',
                    xp: 25,
                    items: ['antidote'],
                    credits: 15
                },
                failure: {
                    text: 'You disturb a spore cluster. A cloud of luminous particles engulfs you. Your vision swims and your lungs burn. The beauty has teeth.',
                    damage: 6,
                    xp: 10
                }
            },
            {
                label: 'Study the growth patterns',
                check: { stat: 'wisdom', dc: 12 },
                success: {
                    text: 'The fungus follows the water table and marks old structural weaknesses. You memorize the pattern. It is a natural map of the tunnels, if you can read it.',
                    xp: 30,
                    flags: ['fungus_map_knowledge']
                },
                failure: {
                    text: 'You stare at the patterns but they mean nothing to you. Pretty lights in the dark. Nothing more.',
                    xp: 10
                }
            },
            {
                label: 'Admire briefly and move on',
                success: {
                    text: 'You pause to take in the alien beauty. A moment of wonder in the endless dark. Then you continue, leaving the garden undisturbed.',
                    xp: 10,
                    heal: 3
                }
            }
        ]
    },

    ancient_terminal: {
        id: 'ancient_terminal',
        name: 'Pre-Collapse Terminal',
        district: 'underground',
        text: 'A dusty terminal embedded in the wall still has power. Its screen flickers with corrupted data. Pre-collapse technology, possibly decades old. The interface is archaic but functional.',
        minLevel: 3,
        maxLevel: 99,
        choices: [
            {
                label: 'Attempt to access the data',
                check: { stat: 'tech', dc: 14 },
                success: {
                    text: 'You navigate the ancient OS and pull fragments of pre-collapse records. Research data, personnel files, project codenames. History the corporations buried.',
                    xp: 35,
                    flags: ['pre_collapse_data'],
                    reputation: { circuitSaints: 3 }
                },
                failure: {
                    text: 'The system triggers a defense protocol. An electric shock courses through the interface. The terminal goes dark permanently.',
                    damage: 7,
                    xp: 15
                }
            },
            {
                label: 'Salvage the hardware',
                check: { stat: 'tech', dc: 12 },
                success: {
                    text: 'Pre-collapse components are worth their weight in gold. You extract a still-functional processing chip and some connectors.',
                    xp: 20,
                    items: ['circuit_board'],
                    credits: 25
                },
                failure: {
                    text: 'You crack the casing but the components inside have degraded beyond salvage. Decades of moisture took their toll.',
                    xp: 10,
                    items: ['scrap_metal']
                }
            },
            {
                label: 'Leave it undisturbed',
                success: {
                    text: 'Some things are better left buried. You mark the location mentally and move on.',
                    xp: 5
                }
            }
        ]
    },

    void_whisper: {
        id: 'void_whisper',
        name: 'Whispers from the Void',
        district: 'underground',
        text: 'The air grows cold. Static fills your ears, resolving into something that sounds almost like words. A void anomaly pulses in the darkness ahead, a tear in reality edged with impossible colors.',
        minLevel: 5,
        maxLevel: 99,
        choices: [
            {
                label: 'Approach and listen',
                check: { stat: 'wisdom', dc: 16 },
                success: {
                    text: 'The whispers coalesce into something comprehensible. Fragments of knowledge from beyond. Your mind expands painfully, but you retain something important. Something that changes how you see the city.',
                    xp: 40,
                    flags: ['void_whisper_heard'],
                    reputation: { ashenCircle: 3 }
                },
                failure: {
                    text: 'The whispers become screaming. Your vision fractures. You stagger back, bleeding from the nose. The void gives nothing freely.',
                    damage: 10,
                    xp: 20,
                    reputation: { ashenCircle: 1 }
                }
            },
            {
                label: 'Reach into the anomaly',
                check: { stat: 'luck', dc: 18 },
                success: {
                    text: 'Your hand passes through reality and closes on something solid. You pull back a small object that should not exist. It pulses with void energy.',
                    xp: 50,
                    items: ['ghost_serum'],
                    flags: ['void_touched'],
                    reputation: { ashenCircle: 5 }
                },
                failure: {
                    text: 'Pain like nothing you have felt before. The anomaly bites back, and you wrench your hand free. The fingertips are numb and faintly translucent.',
                    damage: 15,
                    xp: 25,
                    reputation: { ashenCircle: 2 }
                }
            },
            {
                label: 'Back away slowly',
                success: {
                    text: 'You retreat from the anomaly. The whispers fade reluctantly, as if disappointed. The cold lingers in your bones for hours.',
                    xp: 15,
                    flags: ['void_anomaly_seen']
                }
            }
        ]
    },

    lost_expedition: {
        id: 'lost_expedition',
        name: 'Lost Expedition',
        district: 'underground',
        text: 'You find the remains of a scavenger expedition. Three bedrolls, scattered supplies, and hastily scratched notes on the wall. No bodies. The final note reads: "They come from the walls."',
        minLevel: 3,
        maxLevel: 99,
        choices: [
            {
                label: 'Search the campsite thoroughly',
                check: { stat: 'wisdom', dc: 13 },
                success: {
                    text: 'Among the scattered gear you find a sealed container with medical supplies and some credits. Their loss, your survival.',
                    xp: 25,
                    credits: 30,
                    items: ['med_patch', 'antidote']
                },
                failure: {
                    text: 'You are so focused on searching that you almost miss the scraping sound behind you. Something is watching from a crack in the wall. You grab what you can and run.',
                    items: ['scrap_metal'],
                    damage: 3,
                    xp: 15
                }
            },
            {
                label: 'Read the expedition notes',
                check: { stat: 'intelligence', dc: 12 },
                success: {
                    text: 'The notes map several tunnels and mark danger zones. Crude but useful. One passage is circled with the word "SAFE" and an arrow pointing deeper.',
                    xp: 30,
                    flags: ['expedition_notes_found']
                },
                failure: {
                    text: 'Most of the notes are too damaged to read. You make out a few tunnel names but nothing actionable.',
                    xp: 10
                }
            },
            {
                label: 'Leave immediately',
                success: {
                    text: 'Whatever happened here, you do not want to be next. You leave the camp and its ghosts behind.',
                    xp: 10
                }
            }
        ]
    },

    underground_market: {
        id: 'underground_market',
        name: 'Hidden Bazaar',
        district: 'underground',
        text: 'Torchlight flickers ahead. A small market has sprung up in a wide cavern, populated by tunnel dwellers trading goods no surface vendor would touch.',
        minLevel: 2,
        maxLevel: 99,
        choices: [
            {
                label: 'Browse and trade',
                success: {
                    text: 'The vendors are wary but willing. You find some useful items at fair prices and hear rumors about deeper tunnels.',
                    xp: 15,
                    credits: -15,
                    items: ['med_patch'],
                    reputation: { ironCollective: 1 }
                }
            },
            {
                label: 'Ask about work',
                check: { stat: 'charisma', dc: 11 },
                success: {
                    text: 'A grizzled trader has a delivery job. Simple route, decent pay. "Just do not open the package." You agree.',
                    credits: 40,
                    xp: 20,
                    flags: ['underground_courier_job']
                },
                failure: {
                    text: 'Nobody here trusts a stranger asking questions. Conversations die as you approach. You buy a ration and leave.',
                    xp: 10
                }
            },
            {
                label: 'Move through quickly',
                success: {
                    text: 'You nod to the tunnel dwellers and keep walking. This is their territory. Respect is the price of safe passage.',
                    xp: 5
                }
            }
        ]
    },

    echo_chamber: {
        id: 'echo_chamber',
        name: 'Echo Chamber',
        district: 'underground',
        text: 'The tunnel opens into a vast natural cavern where sound behaves strangely. Your footsteps echo for seconds, layering over each other. Somewhere in the distance, you hear what might be voices, or might be your own echoes returning from impossible angles.',
        minLevel: 4,
        maxLevel: 99,
        choices: [
            {
                label: 'Navigate by sound',
                check: { stat: 'wisdom', dc: 14 },
                success: {
                    text: 'You close your eyes and let the echoes guide you. The cavern reveals its geometry through sound alone. You find the safest path and something others missed: a niche with old supplies.',
                    xp: 30,
                    items: ['focus_stim'],
                    credits: 20
                },
                failure: {
                    text: 'The echoes confuse you. You walk in circles for what feels like hours before finding the exit. Disoriented and drained.',
                    xp: 15,
                    damage: 3
                }
            },
            {
                label: 'Mark your path and proceed carefully',
                success: {
                    text: 'You scratch marks on the walls as you go. Slow progress, but you make it through without getting lost. Patience has its rewards.',
                    xp: 20
                }
            }
        ]
    },

    ritual_site: {
        id: 'ritual_site',
        name: 'Ashen Circle Shrine',
        district: 'underground',
        text: 'Candles arranged in geometric patterns surround a crude altar made from salvaged metal. Void symbols are carved into every surface. This is an Ashen Circle worship site. It was active recently.',
        minLevel: 5,
        maxLevel: 99,
        choices: [
            {
                label: 'Examine the altar',
                check: { stat: 'intelligence', dc: 14 },
                success: {
                    text: 'The symbols describe a ritual for "thinning the boundary." You memorize the patterns. The Circuit Saints or the Ashen Circle themselves would want this knowledge.',
                    xp: 30,
                    flags: ['ashen_ritual_knowledge'],
                    reputation: { ashenCircle: 2, circuitSaints: 1 }
                },
                failure: {
                    text: 'The symbols blur and shift as you stare at them. A wave of nausea hits you. This knowledge resists the uninitiated.',
                    damage: 5,
                    xp: 15,
                    reputation: { ashenCircle: 1 }
                }
            },
            {
                label: 'Desecrate the shrine',
                success: {
                    text: 'You kick over the altar and scatter the candles. The Ashen Circle worships entropy. Let them start with their own shrine.',
                    xp: 15,
                    reputation: { ashenCircle: -5, circuitSaints: 2 }
                }
            },
            {
                label: 'Leave it alone',
                success: {
                    text: 'You back away from the shrine. Whatever power the Ashen Circle channels, you want no part of it. Not today.',
                    xp: 10
                }
            }
        ]
    }
};
