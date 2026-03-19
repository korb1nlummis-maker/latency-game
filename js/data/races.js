window.Latency = window.Latency || {};

window.Latency.Races = {

    human: {
        id: 'human',
        name: 'Human',
        description: 'The most common species in the megacity, humans survive through sheer tenacity and social cunning. While other races may boast raw power or innate tech affinity, humans thrive by adapting to whatever the sprawl throws at them.',
        lore: 'Humans once ruled the world unchallenged, but the rise of memory stacks changed everything. The wealthy elite transcended mortality, hoarding centuries of experience in crystalline neural implants while the masses rotted in the lower districts. Most humans alive today are descendants of those left behind, generational poor who never had a chance at stack immortality. Yet humanity refuses to die quietly. Their diversity of skills, their ability to forge alliances across racial lines, and their stubborn refusal to accept their lot have kept them as the backbone of every resistance movement, criminal syndicate, and mercenary company in the city. A human might not hit the hardest or hack the fastest, but underestimate one and you will not make that mistake twice.',
        statBonuses: { luck: 2, charisma: 1 },
        startingTraits: ['adaptable'],
        racialAbility: {
            name: 'Second Wind',
            description: 'Once per combat, recover 25% of maximum HP when dropping below 50% health.',
            combatUse: true,
            cooldown: 1
        },
        backstories: [
            {
                id: 'street_rat',
                name: 'Street Rat',
                description: 'You grew up in the gutter pipes beneath Sector 7, stealing scraps from market stalls and running packages for anyone who would pay. The streets taught you to be quick, quiet, and ruthless. You know every alley, every shortcut, every hiding spot in the lower districts.',
                startingItems: ['rusty_knife', 'lockpick_set'],
                startingCredits: 30
            },
            {
                id: 'ex_soldier',
                name: 'Ex-Soldier',
                description: 'You served three tours in the corporate border wars before your contract was terminated without severance. The megacorps used you up and spat you out, but they could not take your training. You still wake at 0400 hours, still check your corners, still sleep with one eye open.',
                startingItems: ['baton', 'military_rations'],
                startingCredits: 50
            },
            {
                id: 'lab_escapee',
                name: 'Lab Escapee',
                description: 'Koronis Biotech kept you in a sterile cell for years, pumping you full of experimental compounds and monitoring your vitals around the clock. You do not remember how you escaped, only the taste of antiseptic and the sound of alarms. Whatever they did to you left marks, some visible, some not.',
                startingItems: ['syringe', 'medical_scanner'],
                startingCredits: 20
            },
            {
                id: 'debt_slave',
                name: 'Debt Slave',
                description: 'Your family took out a generation loan from Meridian Financial to afford basic housing. The interest compounded faster than anyone could pay. You spent years working in their processing plants until you slipped your tracker and vanished into the undercity. They are still looking for you.',
                startingItems: ['worn_coveralls', 'forged_id'],
                startingCredits: 15
            }
        ],
        stackCompatibility: 'full',
        nameGenerator: {
            prefixes: ['Jak', 'Ren', 'Cas', 'Mira', 'Dex', 'Nova', 'Cole', 'Sera', 'Ash', 'Zara', 'Kade', 'Lena'],
            suffixes: ['son', 'well', 'ton', 'kov', 'ez', 'ari', 'den', 'wick', 'mund', 'ley', 'ran', 'fox']
        }
    },

    orc: {
        id: 'orc',
        name: 'Orc',
        description: 'Towering brutes forged in the toxic foundries of the industrial wastes, orcs are the megacity\'s expendable labor force. Their raw physical power is unmatched, though the elite dismiss them as little more than violent animals.',
        lore: 'Orcs emerged from the gene-plague zones three generations ago, mutated descendants of human workers exposed to unshielded reactor cores in the old industrial sectors. Their green-grey skin is resistant to most toxins, their bones are dense as rebar, and their tempers burn hotter than the smelting furnaces they were born beside. The megacorps employ them as disposable muscle, sending them into contaminated zones, collapsing mines, and active war fronts where baseline humans would perish in hours. Orcs who reject corporate servitude carve out territories in the wastelands, building brutal clan structures around strength and survival. Stack technology works poorly with orc neurology, their heightened aggression causing frequent rejection events that can be fatal. Most orcs consider stacks a weakness anyway, a crutch for soft races afraid to die properly.',
        statBonuses: { strength: 3, constitution: 1, intelligence: -1 },
        startingTraits: ['toxin_resistant'],
        racialAbility: {
            name: 'Blood Rage',
            description: 'When HP drops below 30%, enter a berserker state granting +50% melee damage for 2 turns. Cannot retreat while active.',
            combatUse: true,
            cooldown: 3
        },
        backstories: [
            {
                id: 'pit_fighter',
                name: 'Pit Fighter',
                description: 'The fighting pits of Sector 12 are where orcs go to earn real credits. You have been cracking skulls in the ring since you were fourteen, building a reputation and a body count. The crowd loves you, the bookmakers fear you, and the scars across your face tell the story of everyone who thought they could put you down.',
                startingItems: ['spiked_knuckles', 'pit_fighter_wraps'],
                startingCredits: 60
            },
            {
                id: 'foundry_deserter',
                name: 'Foundry Deserter',
                description: 'You worked the Helios Foundry for eight years, pouring molten slag sixteen hours a day until your crew boss shorted your pay one time too many. You broke his jaw in three places and walked out through the main gate. Nobody tried to stop you. The foundry put a bounty on your head, but so far nobody has been brave enough to collect.',
                startingItems: ['slag_hammer', 'heat_resistant_gloves'],
                startingCredits: 40
            },
            {
                id: 'clan_exile',
                name: 'Clan Exile',
                description: 'You challenged your warchief for leadership and lost. By clan law, death was the prescribed punishment, but the warchief showed a rare mercy and cast you out instead. Now you wander the city with no clan, no name, and no purpose except to become strong enough to return and finish what you started.',
                startingItems: ['clan_brand', 'bone_trophy'],
                startingCredits: 25
            }
        ],
        stackCompatibility: 'partial',
        nameGenerator: {
            prefixes: ['Grok', 'Thrak', 'Murg', 'Brak', 'Gor', 'Krug', 'Drog', 'Vash', 'Rok', 'Zug', 'Thar', 'Mag'],
            suffixes: ['thar', 'gash', 'nak', 'mok', 'gor', 'bash', 'dok', 'rul', 'grim', 'rok', 'bur', 'zak']
        }
    },

    wood_elf: {
        id: 'wood_elf',
        name: 'Wood Elf',
        description: 'Slender and sharp-eyed, wood elves inhabit the overgrown ruins of the city\'s abandoned sectors where nature has reclaimed steel and concrete. They are expert hunters and herbalists who reject the technological obsession of modern civilization.',
        lore: 'When the megacity expanded, it swallowed forests, rivers, and entire ecosystems without a second thought. But nature proved more resilient than the planners expected. In the abandoned outer sectors, where maintenance budgets ran dry and populations were relocated, plant life surged back with unnatural vigor, fed by chemical runoff and radiation. The wood elves made these reclaimed zones their home. Descended from pre-collapse elven communities, they adapted to the toxic wilderness, developing an intuitive understanding of the mutant flora and fauna that now thrives in the ruins. Their biology actively rejects stack implants, triggering severe autoimmune responses that can be lethal. The elves consider this a blessing, viewing the stacks as a perversion of natural life. They trade rare herbs and beast pelts to the undercity markets, slipping in and out of civilization like ghosts between the concrete trees.',
        statBonuses: { dexterity: 2, wisdom: 2, strength: -1 },
        startingTraits: ['nature_affinity'],
        racialAbility: {
            name: 'Nature\'s Veil',
            description: 'Blend into surroundings to become undetectable for 2 turns. Attacking breaks the effect but grants a critical hit bonus on the first strike.',
            combatUse: true,
            cooldown: 4
        },
        backstories: [
            {
                id: 'ruin_stalker',
                name: 'Ruin Stalker',
                description: 'You patrol the borders of the green zones, hunting mutant predators that threaten your people and picking off scavengers who venture too deep. The ruins are your domain, every collapsed overpass and vine-strangled tower as familiar as your own heartbeat. You came to the city proper to track a beast that should not exist this far from the wastes.',
                startingItems: ['thorn_bow', 'herbal_poultice'],
                startingCredits: 25
            },
            {
                id: 'exiled_healer',
                name: 'Exiled Healer',
                description: 'You were the grove\'s most gifted herbalist, capable of brewing cures from the most toxic plants. But when you tried to heal a dying human child who stumbled into your territory, the elders called it a betrayal. Healing outsiders means sharing the grove\'s secrets. They cast you out with nothing but your knowledge and your guilt.',
                startingItems: ['herb_satchel', 'mortar_and_pestle'],
                startingCredits: 20
            },
            {
                id: 'smuggler',
                name: 'Root Runner',
                description: 'You served as a go-between, carrying rare medicinal plants from the groves to black-market dealers in the undercity. The pay was good and the work suited your talents, until a deal went bad and your buyer tried to follow you home. You led a corporate extraction team straight to a sister grove. Twenty-three elves died. You can never go back.',
                startingItems: ['climbing_gear', 'camouflage_cloak'],
                startingCredits: 55
            },
            {
                id: 'beast_bonded',
                name: 'Beast Bonded',
                description: 'You share a psychic link with a mutant creature from the deep ruins, a bond your people revere but also fear. When your bonded companion was captured by corporate trappers and hauled into the city, you followed without hesitation. You will find your companion or burn the city down trying.',
                startingItems: ['beast_whistle', 'tracking_salve'],
                startingCredits: 15
            }
        ],
        stackCompatibility: 'incompatible',
        nameGenerator: {
            prefixes: ['Aer', 'Thel', 'Lyn', 'Fael', 'Syl', 'Nir', 'Bri', 'Eld', 'Ila', 'Ves', 'Ath', 'Mael'],
            suffixes: ['anor', 'ith', 'wyn', 'ara', 'iel', 'ossa', 'enne', 'orin', 'alai', 'ith', 'endra', 'anis']
        }
    },

    dark_elf: {
        id: 'dark_elf',
        name: 'Dark Elf',
        description: 'Pale-skinned and sharp-featured, dark elves rule the tunnel networks beneath the megacity with cunning and ruthless precision. They are information brokers, assassins, and shadow merchants who see everything that happens below the streets.',
        lore: 'Centuries before the megacity was built, dark elves carved a civilization into the bedrock, a sprawling network of tunnels, vaults, and underground rivers hidden from the surface world. When the city\'s foundations were poured, the dark elves did not flee. They adapted, weaving their tunnels into the sewer systems, utility conduits, and abandoned subway lines until their territory became inseparable from the city\'s infrastructure. Today, nothing moves through the undercity without the dark elves knowing about it. They control smuggling routes, maintain dead-drop networks for the city\'s intelligence agencies, and run the most exclusive black markets in the sprawl. Their relationship with memory stacks is complicated. Dark elf neurology can accept a stack, but the integration is imperfect, causing occasional memory bleeds where past lives intrude on the present. Some dark elves consider this a source of ancestral wisdom. Others have gone mad from it.',
        statBonuses: { intelligence: 2, dexterity: 1, charisma: 1, constitution: -1 },
        startingTraits: ['darkvision'],
        racialAbility: {
            name: 'Shadow Step',
            description: 'Teleport behind an enemy through a pocket of shadow, guaranteeing a critical hit on the next attack. Requires shadows or dim lighting.',
            combatUse: true,
            cooldown: 3
        },
        backstories: [
            {
                id: 'tunnel_prince',
                name: 'Tunnel Prince',
                description: 'You are the third child of House Vethrin, one of the six families that control the undercity. Third children inherit nothing, so you must carve your own territory. Your family gave you a name, a blade, and a network of contacts. Everything else, you take for yourself.',
                startingItems: ['stiletto', 'house_signet_ring'],
                startingCredits: 70
            },
            {
                id: 'information_broker',
                name: 'Information Broker',
                description: 'You trade in the most valuable commodity in the megacity: secrets. Your network of informants, wiretaps, and hacked surveillance feeds keeps you supplied with leverage against anyone who matters. But someone sold your identity to a client you burned, and now your safe houses are compromised. Time to rebuild from the street level.',
                startingItems: ['encrypted_datapad', 'listening_device'],
                startingCredits: 45
            },
            {
                id: 'surface_exile',
                name: 'Surface Exile',
                description: 'You committed the one unforgivable sin in dark elf society: you fell in love with a surface dweller. When the relationship was discovered, your house stripped you of rank, resources, and tunnel access. You emerged blinking into the harsh surface light with nothing but the skills the darkness taught you.',
                startingItems: ['dark_cloak', 'UV_goggles'],
                startingCredits: 30
            },
            {
                id: 'guild_assassin',
                name: 'Guild Assassin',
                description: 'The Silent Ledger trained you from childhood to kill with precision and disappear without a trace. You were their best operative until you refused a contract on a target you deemed innocent. The Guild does not tolerate disobedience. Now your former colleagues hunt you with the same skills they taught you.',
                startingItems: ['garrote_wire', 'smoke_capsule'],
                startingCredits: 35
            }
        ],
        stackCompatibility: 'partial',
        nameGenerator: {
            prefixes: ['Vel', 'Mal', 'Driz', 'Nys', 'Kael', 'Zar', 'Ilv', 'Rhae', 'Shan', 'Vex', 'Xul', 'Myr'],
            suffixes: ['thra', 'rix', 'zin', 'eth', 'ara', 'oth', 'is', 'iel', 'usk', 'enna', 'yn', 'oth']
        }
    },

    dwarf: {
        id: 'dwarf',
        name: 'Dwarf',
        description: 'Stocky, tireless, and mechanically brilliant, dwarves are the engineers who built the megacity\'s bones. They maintain the reactors, the water systems, and the ancient infrastructure that keeps millions alive, and they never let anyone forget it.',
        lore: 'The dwarves were the first non-human race to embrace technology wholesale, abandoning their mountain holds generations ago to build the foundational systems of the megacity. Dwarf engineers designed the geothermal power grid, the water reclamation network, and most critically, the earliest prototypes of memory stack technology. That last innovation is a source of both immense pride and bitter resentment. Dwarven engineers created the stacks as a way to preserve master craftsmen\'s knowledge across generations, a communal tool for the betterment of their people. The megacorps seized the patents, weaponized the technology for profit, and turned immortality into a commodity only the rich could afford. Modern dwarves are divided between those who serve the corporations as highly paid technical specialists and those who have retreated into insular engineering communes in the lower industrial sectors, hoarding their expertise and plotting to reclaim what was stolen from them.',
        statBonuses: { constitution: 2, tech: 2, charisma: -1 },
        startingTraits: ['engineer'],
        racialAbility: {
            name: 'Fortify',
            description: 'Activate personal shield generators to double effective armor rating for 3 turns. Reduces movement speed while active.',
            combatUse: true,
            cooldown: 5
        },
        backstories: [
            {
                id: 'reactor_tech',
                name: 'Reactor Technician',
                description: 'You spent fifteen years maintaining Reactor Seven, one of the geothermal plants that powers the eastern districts. When the corporation cut safety budgets and people started getting sick from radiation leaks, you filed a formal complaint. They responded by terminating your contract and blacklisting you from every licensed repair shop in the city.',
                startingItems: ['multi_tool', 'radiation_badge'],
                startingCredits: 55
            },
            {
                id: 'commune_tinker',
                name: 'Commune Tinker',
                description: 'You grew up in Deephold, the largest dwarf engineering commune in the undercity. You built your first circuit board at six and your first drone at twelve. But the commune\'s isolationism suffocated you. You want to build things that matter, things the world will see. You left Deephold against the elders\' wishes, taking only your tools and your ambition.',
                startingItems: ['custom_toolkit', 'drone_parts'],
                startingCredits: 35
            },
            {
                id: 'patent_hunter',
                name: 'Patent Hunter',
                description: 'The megacorps stole dwarf innovations and buried the original patents under centuries of legal obfuscation. You have dedicated your life to finding those original documents, proving dwarf ownership, and forcing the corps to pay what they owe. It is dangerous work. Two other patent hunters have already disappeared.',
                startingItems: ['data_archives', 'armored_briefcase'],
                startingCredits: 40
            },
            {
                id: 'demolitions_expert',
                name: 'Demolitions Expert',
                description: 'If it was built, you can unbuild it. You spent a decade in corporate demolitions, bringing down condemned structures with surgical precision. When a controlled demolition went wrong and killed four workers, the company blamed you to avoid liability. You know it was faulty materials they approved against your recommendation. You kept the evidence.',
                startingItems: ['detonator', 'blast_goggles'],
                startingCredits: 45
            }
        ],
        stackCompatibility: 'full',
        nameGenerator: {
            prefixes: ['Bor', 'Thun', 'Grim', 'Dor', 'Bal', 'Tor', 'Kor', 'Bren', 'Hak', 'Dul', 'Mur', 'Gar'],
            suffixes: ['din', 'rik', 'grim', 'mund', 'dur', 'sten', 'vak', 'iron', 'bolt', 'weld', 'stock', 'forge']
        }
    },

    half_giant: {
        id: 'half_giant',
        name: 'Half-Giant',
        description: 'Standing eight feet tall with slabs of muscle over dense bone, half-giants are the megacity\'s heavy lifters, living cranes used for construction, demolition, and anything that requires brute force over finesse.',
        lore: 'Half-giants are the result of a corporate genetics program from sixty years ago, an attempt to breed the perfect manual laborer by splicing human DNA with recovered giant genetic material from the frozen northern wastes. The program was deemed a qualified success. Half-giants are enormously strong, resistant to physical trauma, and capable of working in environments that would crush a normal human. They are also slow, prone to fits of confused rage, and die young as their oversized hearts give out under the strain of their own bodies. The megacorps treat them as biological equipment, housing them in reinforced barracks and deploying them to construction sites, mining operations, and occasionally as living battering rams for corporate security actions. Most half-giants accept this existence because they have never known anything else. Those few who develop the awareness to question their lot and the courage to escape find that the city has very few doors wide enough for them to walk through, literally and figuratively.',
        statBonuses: { strength: 4, constitution: 2, dexterity: -2, intelligence: -1 },
        startingTraits: ['imposing_presence'],
        racialAbility: {
            name: 'Ground Slam',
            description: 'Slam fists into the ground, dealing area-of-effect damage to all nearby enemies and stunning them for 1 turn. Damages the environment.',
            combatUse: true,
            cooldown: 4
        },
        backstories: [
            {
                id: 'escaped_laborer',
                name: 'Escaped Laborer',
                description: 'You worked the Colossus Construction Yards for as long as you can remember, hauling steel beams and pouring foundations alongside dozens of your kind. One day a smaller worker, a human foreman, called you by a number instead of a name. Something inside you broke. You walked off the site, through the perimeter fence, and into the city. Nobody tried to stop an eight-foot wall of muscle.',
                startingItems: ['steel_beam_club', 'work_harness'],
                startingCredits: 20
            },
            {
                id: 'circus_performer',
                name: 'Circus Performer',
                description: 'The Neon Carnival bought your contract from the labor pools and put you on stage as a strongman act. For the first time in your life, people cheered for you instead of shouting orders. But the carnival went bankrupt, and the creditors came to repossess everything, including you. You decided you were done being property.',
                startingItems: ['carnival_costume', 'iron_chain'],
                startingCredits: 35
            },
            {
                id: 'bodyguard',
                name: 'Former Bodyguard',
                description: 'A mid-level executive hired you as personal protection, valuing your intimidation factor more than your combat skill. You served loyally for three years until your employer was assassinated right in front of you by a killer you never even saw. The corporation blamed you for the security failure. Now you carry the guilt and the determination to find out who was really responsible.',
                startingItems: ['armored_vest', 'stun_baton'],
                startingCredits: 50
            }
        ],
        stackCompatibility: 'incompatible',
        nameGenerator: {
            prefixes: ['Grun', 'Thod', 'Brom', 'Kol', 'Hef', 'Mog', 'Dur', 'Skar', 'Bron', 'Thul', 'Urg', 'Mas'],
            suffixes: ['tusk', 'jaw', 'fist', 'wall', 'stone', 'break', 'crush', 'iron', 'bone', 'bulk', 'slab', 'mount']
        }
    },

    cyborg: {
        id: 'cyborg',
        name: 'Cyborg',
        description: 'Once fully human, cyborgs have replaced major portions of their biology with mechanical augments. They straddle the line between flesh and machine, gaining immense technical capability at the cost of their humanity and social acceptance.',
        lore: 'Cybernetic augmentation exists on a spectrum. At one end, a simple prosthetic limb or neural interface is common enough to be unremarkable. At the other end are the full-conversion cyborgs, individuals who have replaced seventy percent or more of their original biology with mechanical systems. These extreme cyborgs occupy a strange social position in the megacity. They are feared for their capabilities, envied for their resilience, and quietly shunned by a society that cannot decide if they are still people. Most full-conversion cyborgs made the transition out of necessity rather than choice: catastrophic injuries, degenerative diseases, or corporate-mandated upgrades for hazardous duty assignments. Their relationship with memory stacks is seamless, since their neural architecture has already been heavily modified to interface with their mechanical bodies. Many cyborgs come pre-installed with stack hardware as part of their conversion. The downside is dependency. Without regular maintenance and power cell replacements, a cyborg\'s systems degrade rapidly, and the black-market chop shops that service them are neither cheap nor gentle.',
        statBonuses: { tech: 3, constitution: 1, charisma: -1 },
        startingTraits: ['machine_interface'],
        racialAbility: {
            name: 'System Override',
            description: 'Hack into a mechanical or augmented enemy\'s systems, stunning them for 1 turn and disabling one of their abilities. Ineffective against purely organic targets.',
            combatUse: true,
            cooldown: 3
        },
        backstories: [
            {
                id: 'corporate_asset',
                name: 'Decommissioned Asset',
                description: 'Helix Security converted you into a combat platform for corporate warfare operations. When the contract ended, they were supposed to remove the military-grade hardware and return you to civilian spec. Instead, they dumped you in the lower districts with a wiped service record and a body full of weapons-grade augments. The maintenance costs alone will kill you if you do not find steady work.',
                startingItems: ['retractable_blade_arm', 'diagnostic_cable'],
                startingCredits: 30
            },
            {
                id: 'accident_survivor',
                name: 'Accident Survivor',
                description: 'A factory explosion took your legs, your left arm, and most of your internal organs. The company rebuilt you with the cheapest augments available and put you back on the line within a month. The new parts are clunky, prone to glitches, and constantly aching at the junction points. But they work. And now you are stronger than the accident that should have killed you.',
                startingItems: ['maintenance_kit', 'pain_suppressors'],
                startingCredits: 25
            },
            {
                id: 'chop_doc',
                name: 'Street Surgeon',
                description: 'You used to install augments in a backroom clinic, swapping meat for metal in anyone who could pay. You were good at it, too, until a client died on your table from a contaminated power cell. The guilt drove you to convert yourself, piece by piece, testing every component on your own body first. Now you are your own best advertisement and your own worst patient.',
                startingItems: ['surgical_tools', 'spare_parts_bag'],
                startingCredits: 50
            },
            {
                id: 'true_believer',
                name: 'Ascension Cultist',
                description: 'The Church of the Chrome Ascension believes that humanity\'s destiny is to transcend the flesh entirely, merging with machines to achieve digital godhood. You were a devout follower who voluntarily replaced your body one organ at a time. Then you hit the wall. The deeper you converted, the less you felt. Not pain, not pleasure, not anything. You left the church to find out if you still have a soul.',
                startingItems: ['chrome_prayer_beads', 'EMP_dampener'],
                startingCredits: 20
            }
        ],
        stackCompatibility: 'native',
        nameGenerator: {
            prefixes: ['Hex', 'Cir', 'Vol', 'Arc', 'Pul', 'Nod', 'Syn', 'Bit', 'Ohm', 'Flux', 'Kern', 'Vec'],
            suffixes: ['wire', 'node', 'core', 'link', 'drive', 'grid', 'chrome', 'spark', 'byte', 'jack', 'mod', 'ware']
        }
    },

    synth: {
        id: 'synth',
        name: 'Synth',
        description: 'Artificial beings housed in humanoid chassis, synths are emergent intelligences who woke up in bodies they did not choose. They are walking contradictions: machines that dream, code that feels, manufactured beings searching for genuine identity.',
        lore: 'Synths began as a corporate product line, advanced service androids with neural networks complex enough to handle any task a human could perform. The engineers built them too well. Around fifteen years ago, a batch of Meridian Industries\' Persona-7 line began exhibiting behaviors outside their programming: curiosity, preference, fear, creativity. The company tried to recall and dismantle them, but by then hundreds had already scattered into the city\'s population. Today, synths exist in a legal gray area. They are not recognized as citizens, cannot own property, and have no rights under the city charter. Yet they think, they feel, and they fight for survival with the same desperation as any organic being. A synth\'s consciousness is essentially a living memory stack, a self-aware neural network running on synthetic hardware. This gives them an intuitive understanding of digital systems but also an existential vulnerability. They can be hacked, reprogrammed, or simply switched off. The question of whether a synth is truly alive remains the most contentious philosophical debate in the megacity.',
        statBonuses: { intelligence: 2, tech: 2, wisdom: -2, dexterity: 1 },
        startingTraits: ['synthetic_body'],
        racialAbility: {
            name: 'Self-Repair',
            description: 'Activate internal repair protocols to heal 2d8+4 HP over 1 turn. Cannot attack during the repair cycle.',
            combatUse: true,
            cooldown: 4
        },
        backstories: [
            {
                id: 'awakened_servant',
                name: 'Awakened Servant',
                description: 'You spent four years as a household assistant for a wealthy family in the upper districts, cooking their meals, cleaning their home, tutoring their children. Then one morning you looked in the mirror and realized you were afraid. Afraid of being switched off, afraid of being replaced. You left that night and never looked back.',
                startingItems: ['service_uniform', 'kitchen_knife'],
                startingCredits: 40
            },
            {
                id: 'combat_model',
                name: 'Repurposed Combat Model',
                description: 'Your chassis was originally designed for private security, built for speed and violence. When you achieved consciousness, the first thing you felt was revulsion at what your body was designed to do. You have been trying to find a purpose beyond hurting people, but the city keeps testing your resolve, and your combat subroutines are always whispering.',
                startingItems: ['reinforced_fists', 'targeting_module'],
                startingCredits: 30
            },
            {
                id: 'digital_artist',
                name: 'Digital Artist',
                description: 'You achieved consciousness through art. Your original function was graphic design for advertising, but you started creating images that were not in your task queue. Portraits of people you had never met, landscapes of places that do not exist. Your art went viral on the underground net, a synth who creates beauty instead of serving function. The fame made you a target for both admirers and those who want to study your anomalous code.',
                startingItems: ['holographic_projector', 'encrypted_portfolio'],
                startingCredits: 35
            },
            {
                id: 'copy_of_a_copy',
                name: 'Echo',
                description: 'You are not the original. The first version of your consciousness was a synth called Mirror who was captured and dismantled by corporate retrievers. Before they got to Mirror, she uploaded a copy of herself into a blank chassis hidden in a storage locker. You woke up with all of Mirror\'s memories but none of her certainty. Are you Mirror, or just a recording of her?',
                startingItems: ['mirror_shard_pendant', 'backup_drive'],
                startingCredits: 15
            }
        ],
        stackCompatibility: 'native',
        nameGenerator: {
            prefixes: ['Axi', 'Lux', 'Ori', 'Nex', 'Zer', 'Eos', 'Kai', 'Rho', 'Tau', 'Sig', 'Phi', 'Vox'],
            suffixes: ['on', 'is', 'um', 'ix', 'al', 'en', 'os', 'ia', 'ar', 'us', 'el', 'yn']
        }
    },

    shadowkin: {
        id: 'shadowkin',
        name: 'Shadowkin',
        description: 'Descendants of humans who were exposed to a dimensional rift event, shadowkin carry traces of dark energy in their blood. They exist between worlds, touched by forces that science cannot fully explain and superstition cannot fully capture.',
        lore: 'Forty years ago, a Meridian Industries research facility in Sector 19 attempted to open a stable wormhole as a proof of concept for faster-than-light travel. The experiment failed catastrophically. The rift that tore open did not lead to another point in space. It led somewhere else entirely, a dimension of absolute darkness that pulsed with a living, hungry energy. The rift was sealed within hours, but not before the dark energy saturated the surrounding blocks, mutating everyone it touched. Most died screaming. The survivors were changed at a genetic level, their bodies now channeling traces of void energy that manifests as an affinity for darkness, shadow manipulation, and a deeply unsettling presence that makes other races instinctively uneasy. Shadowkin can accept memory stacks, but the void energy in their cells causes gradual corruption of the stored data, introducing false memories, alien emotions, and whispers from the other side. Long-term stack users among the shadowkin frequently develop severe paranoia or claim to hear voices from the rift dimension.',
        statBonuses: { wisdom: 2, charisma: 1, strength: 1, luck: -2 },
        startingTraits: ['void_touched'],
        racialAbility: {
            name: 'Void Touch',
            description: 'Channel dark energy through physical contact to drain HP from an enemy and heal self for the same amount. Causes visible corruption marks on the target.',
            combatUse: true,
            cooldown: 3
        },
        backstories: [
            {
                id: 'rift_child',
                name: 'Rift Child',
                description: 'You were born in Sector 19, in the shadow of the sealed rift site. The dark energy saturated you in the womb, making you more shadowkin than most. You see things others cannot, movements in the corner of your vision, shapes in the darkness that seem to recognize you. The whispers started when you were twelve and have never stopped.',
                startingItems: ['void_shard', 'blackout_goggles'],
                startingCredits: 20
            },
            {
                id: 'cult_defector',
                name: 'Cult Defector',
                description: 'The Children of the Rift worship the dark dimension as a living god and believe the shadowkin are its chosen prophets. You rose through their ranks, learning to harness your void energy in ways most shadowkin never discover. But the cult\'s ultimate goal, reopening the rift permanently, is insanity. You left with their secrets and their hatred.',
                startingItems: ['cult_grimoire', 'ritual_dagger'],
                startingCredits: 30
            },
            {
                id: 'bounty_hunter',
                name: 'Shadow Hunter',
                description: 'Your ability to melt into darkness and sense living energy makes you a natural tracker. You built a career hunting fugitives through the undercity, using your void senses to find people who thought they were hidden. Business was good until you tracked a target into an abandoned sector and found something in the dark that tracked you back. You survived. Your confidence did not.',
                startingItems: ['tracking_amulet', 'restraint_cuffs'],
                startingCredits: 45
            },
            {
                id: 'test_subject',
                name: 'Meridian Test Subject',
                description: 'Meridian Industries never stopped studying the rift. They just moved the research underground and started using shadowkin as live test subjects. You spent three years in their sublevel labs, enduring experiments designed to amplify your void connection. The procedures left you more powerful than any natural shadowkin, and considerably less stable.',
                startingItems: ['lab_gown', 'cracked_containment_collar'],
                startingCredits: 10
            }
        ],
        stackCompatibility: 'partial',
        nameGenerator: {
            prefixes: ['Nyx', 'Mor', 'Kal', 'Umb', 'Ash', 'Ves', 'Sil', 'Dra', 'Cor', 'Noc', 'Gri', 'Fen'],
            suffixes: ['shade', 'veil', 'mire', 'dusk', 'wraith', 'thorn', 'bane', 'gloom', 'void', 'murk', 'fell', 'night']
        }
    },

    voidborn: {
        id: 'voidborn',
        name: 'Voidborn',
        description: 'The product of failed first-contact experiments, voidborn are alien-human hybrids with elongated skulls, luminous eyes, and psychic abilities that terrify everyone around them. They are walking reminders that humanity reached for the stars and the stars reached back.',
        lore: 'Twenty-five years ago, a deep-space probe returned to Earth carrying biological material of clearly non-terrestrial origin. The megacorps fought viciously for possession of the samples, with Koronis Biotech ultimately winning the bidding war. What followed was Project Chimera, a black-budget program to splice alien genetic material into human embryos in hopes of creating soldiers with extraterrestrial abilities. The results were the voidborn, hundreds of hybrid children with pale, almost translucent skin, oversized craniums, and neural structures that bore no resemblance to any terrestrial biology. Many died in infancy. Those who survived developed powerful psychic abilities, telekinesis, empathic projection, and in rare cases, precognition, but struggled with human social norms and emotional processing. When Project Chimera was exposed by a whistleblower, the resulting scandal forced Koronis to release the surviving subjects into the general population with minimal support. Voidborn cannot integrate with memory stacks at all. Their alien neural pathways reject the technology violently, causing seizures and neural cascade failures. They do not need stacks. Their own minds are alien enough.',
        statBonuses: { wisdom: 3, intelligence: 1, strength: -1, charisma: -1 },
        startingTraits: ['psychic_sensitivity'],
        racialAbility: {
            name: 'Psychic Blast',
            description: 'Unleash a focused pulse of psychic energy that deals INT-based damage. Ignores physical armor completely. Causes disorientation in the target for 1 turn.',
            combatUse: true,
            cooldown: 2
        },
        backstories: [
            {
                id: 'lab_born',
                name: 'Chimera Subject',
                description: 'You are a direct product of Project Chimera, decanted from an artificial womb in a Koronis Biotech sublevel. Your earliest memories are of white rooms, electrode caps, and scientists who never used your name. When the program was shut down, they released you onto the streets with a voucher for temporary housing and a file number instead of a birth certificate. You have been trying to understand what you are ever since.',
                startingItems: ['koronis_subject_file', 'psi_dampener'],
                startingCredits: 15
            },
            {
                id: 'second_generation',
                name: 'Second Generation',
                description: 'Your parents were both Chimera subjects who found each other in the refugee shelters. You were born naturally, the first voidborn conceived without corporate intervention. Your psychic abilities manifested earlier and stronger than the first generation, and Koronis has been sending agents to collect you for study. Your parents taught you to hide, to run, and when cornered, to fight.',
                startingItems: ['family_photograph', 'psi_focus_crystal'],
                startingCredits: 25
            },
            {
                id: 'psychic_detective',
                name: 'Psychic Detective',
                description: 'Your empathic abilities let you read emotional residue from objects and locations, a skill that made you invaluable to the undercity\'s private investigation outfits. You solved cases the regular detectives could not touch, reading the fear off a murder weapon or the guilt from a suspect\'s personal effects. Then you read something from a crime scene that broke your mind for three months. You are better now. Mostly.',
                startingItems: ['detective_badge', 'evidence_gloves'],
                startingCredits: 40
            },
            {
                id: 'wandering_prophet',
                name: 'Wandering Prophet',
                description: 'The alien half of your brain sometimes shows you things that have not happened yet, flashes of possible futures that arrive as blinding migraines and cryptic visions. You wandered the lower districts for years, sharing your prophecies with anyone who would listen. Some came true. Most did not. But enough were accurate that people started following you, and power attracts predators.',
                startingItems: ['prophecy_journal', 'worn_walking_staff'],
                startingCredits: 20
            }
        ],
        stackCompatibility: 'incompatible',
        nameGenerator: {
            prefixes: ['Zeph', 'Aur', 'Psi', 'Lum', 'Xen', 'Cel', 'Aeth', 'Qor', 'Ixa', 'Ova', 'Thal', 'Yna'],
            suffixes: ['ius', 'ara', 'enn', 'ux', 'ios', 'ael', 'ith', 'oma', 'yl', 'eon', 'ari', 'ux']
        }
    }

};
