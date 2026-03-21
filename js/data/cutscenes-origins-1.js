/**
 * LATENCY - Origin Cutscene Data (Batch 1)
 * Cinematic intro sequences for: Human, Orc, Wood Elf, Dark Elf, Dwarf.
 * Plays after character creation, before gameplay begins.
 * Each cutscene is 8-12 slides of deeply emotional, present-tense narration.
 */

window.Latency = window.Latency || {};
window.Latency.CutsceneData = window.Latency.CutsceneData || {};

// =============================================================================
//  HUMAN — "Born in the Margins"
//  Theme: invisibility, adaptability, quiet determination
// =============================================================================

window.Latency.CutsceneData['origin_human'] = {
    id: 'origin_human',
    title: 'BORN IN THE MARGINS',
    music: 1,
    slides: [
        {
            art: 'assets/images/races/human.webp',
            text: 'You are born without fanfare in a lower-district clinic that smells of recycled air and antiseptic. No one sends flowers. The nurse logs your weight, your blood type, your species — human — and moves on to the next delivery. You are unremarkable from your very first breath.',
            mood: 'dark',
            duration: 0
        },
        {
            text: 'Childhood is a lesson in being overlooked. The orc children are feared. The elf children are whispered about. The cyborg kids glitter with chrome promise. You sit in the back of the district school, average height, average build, average everything, and learn the most important survival skill in the megacity: how to disappear while standing in plain sight.',
            mood: 'dark',
            duration: 0
        },
        {
            text: 'At fourteen you apply for a labor apprenticeship. The intake officer scans your biometrics and frowns. No toxin resistance. No darkvision. No machine interface. No psychic sensitivity. Just meat and bone and a heartbeat. He stamps your file GENERAL POOL and slides it into a pile three feet thick. You are one of ten thousand just like you.',
            mood: 'dark',
            duration: 0
        },
        {
            text: 'The general pool means the jobs nobody else wants. You scrub ventilation ducts too narrow for orcs, too filthy for elves, too analog for cyborgs. Your hands crack and bleed from the chemical cleaners. At the end of each shift, you count your credits and realize you are worth less per hour than the electricity that powers the lights above your head.',
            mood: 'melancholy',
            duration: 0
        },
        {
            text: 'You watch a dwarf engineer walk past your work detail one morning, toolbelt heavy with instruments that cost more than your annual wage. He does not see you. Nobody sees you. You are wallpaper. You are background noise. You are the thing that moves between the important people, invisible as gravity and just as taken for granted.',
            mood: 'melancholy',
            duration: 0
        },
        {
            text: 'But invisibility is a kind of freedom. You start to notice things. The gap in the security patrol at shift change. The ventilation shaft that connects the market district to the storage level. The way the wealthy talk freely in front of you because you are furniture to them. Information flows around you like water around a stone, and you begin to collect it.',
            mood: 'neutral',
            duration: 0
        },
        {
            text: 'One night, huddled in your bunk in a housing block shared with forty strangers, you hear a woman weeping through the thin wall. She lost her position. Replaced by an automated system. She has three children and no savings. Tomorrow she will be general pool, just like you. You press your hand flat against the wall and feel the vibrations of her grief in your fingertips.',
            mood: 'melancholy',
            duration: 0
        },
        {
            text: 'Something shifts. Not rage — you have seen what rage does to people in the lower districts. Not hope — hope is a luxury brand you cannot afford. Something quieter. A cold, patient clarity. The world was not built for you. Fine. You will walk through the cracks in its architecture. You will use every overlooked corridor and forgotten access hatch. You will make invisibility a weapon.',
            mood: 'tension',
            duration: 0
        },
        {
            art: 'assets/images/scenes/city-skyline-night.jpg',
            artAnim: 'alt',
            text: 'You stand at the threshold of your housing block as the district lights cycle to their pale imitation of dawn. The megacity stretches above you, tier upon tier of steel and light and indifference. Millions of souls stacked like cargo, and somewhere in that vertical maze, there is a version of your life that is not this.',
            mood: 'neutral',
            duration: 0
        },
        {
            text: 'You step out into the street. No one turns to look. No one ever does. But today, for the first time, you are glad of it. Let them look past you. Let them assume you are nothing. By the time they realize their mistake, you will already be gone.',
            mood: 'determination',
            duration: 0
        }
    ],
    onComplete: 'gameplay'
};

// =============================================================================
//  ORC — "Slag and Blood"
//  Theme: rage against exploitation, visceral rebellion
// =============================================================================

window.Latency.CutsceneData['origin_orc'] = {
    id: 'origin_orc',
    title: 'SLAG AND BLOOD',
    music: 3,
    slides: [
        {
            art: 'assets/images/races/orc.jpg',
            text: 'The foundry heat hits you before you are old enough to remember your own name. Your mother works the smelting line at Helios Foundry Six, pouring molten slag sixteen hours a day with hands that have long since lost their fingerprints. She carries you strapped to her back because there is no childcare for orc labor crews. The foremen do not care. One more body near the furnace means nothing to them.',
            mood: 'red',
            duration: 0
        },
        {
            art: 'assets/images/scenes/foundry.jpg',
            text: 'Your earliest memory is the color orange. Not a sunset. Not a flower. The blinding, liquid orange of molten metal as it pours from the crucible into the casting mold, close enough to feel the skin on your face tighten. Your mother shields you with her body. The slag splashes. She does not flinch. She never flinches.',
            mood: 'dark',
            duration: 0
        },
        {
            text: 'By six, you work. Sorting scrap in the cooling yards, your small hands pulling copper wire from the slag piles while the older orcs haul the heavy stock. The air tastes like burnt metal and ozone. A human supervisor walks the line with a shock prod, tapping it against his thigh. He calls your mother by her worker number. She has a name. He has never asked for it.',
            mood: 'anger',
            duration: 0
        },
        {
            text: 'Your father dies when you are nine. Reactor leak in Foundry Two. Seventeen orcs killed when a corroded coolant pipe bursts and floods the lower level with radioactive steam. The company sends a form letter and docks the funeral costs from your mother\'s next paycheck. She reads the letter once, folds it neatly, and goes back to work the next morning. There is no other option.',
            mood: 'dark',
            duration: 0
        },
        {
            text: 'You grow fast and heavy, the way orcs do. Dense bones, thick muscle, skin like cured leather. By twelve you are hauling full slag carts alongside the adults. The work is brutal, mindless, and endless. Pour. Cast. Cool. Repeat. The foundry eats your hours, your youth, your future, and gives back nothing but enough credits to keep you fed enough to work tomorrow.',
            mood: 'melancholy',
            duration: 0
        },
        {
            text: 'Your mother collapses on the smelting line on a Tuesday. Her lungs, saturated with decades of metal particulate, simply stop working. She falls forward, and the other workers pull her back from the edge of the casting pit with seconds to spare. The foreman tells her to finish her shift or lose the day\'s pay. She tries to stand. She cannot. They carry her out on a scrap pallet.',
            mood: 'dark',
            duration: 0
        },
        {
            text: 'She dies in the company medical bay three days later. The doctor — a human who has never set foot on a foundry floor — lists the cause as "natural organ failure." You stand over her body and feel something rupture inside your chest that has nothing to do with organs. It is hot. It is ancient. It has teeth.',
            mood: 'anger',
            duration: 0
        },
        {
            text: 'The rage does not come all at once. It builds over weeks, fed by every shift whistle, every docked credit, every human foreman who looks through you like you are part of the machinery. You feel it in the way your hands shake when you grip the slag hammer. You feel it in the grinding of your jaw when the night shift horn sounds and your body screams for rest it will not get.',
            mood: 'anger',
            duration: 0
        },
        {
            text: 'The breaking point is small. A new foreman kicks over your water ration because you took an unscheduled break. Warm water spreads across the foundry floor and evaporates in seconds. He smirks. You look down at the empty cup, then up at his face, and something behind your eyes goes perfectly, terrifyingly quiet.',
            mood: 'tension',
            duration: 0
        },
        {
            text: 'You hit him so hard his feet leave the ground. The shock prod clatters across the floor. The foundry goes silent except for the roar of the furnaces. Every orc on the line turns to look. Not at the foreman crumpled against the wall. At you. They are waiting. They have always been waiting.',
            mood: 'anger',
            duration: 0
        },
        {
            art: 'assets/images/scenes/slum-street.jpg',
            text: 'You walk out through the main gate with the foreman\'s blood drying on your knuckles and your mother\'s worker number burned into your memory. Behind you, the foundry sirens begin to wail. Ahead of you, the megacity spreads like an open wound. You are done being raw material. Whatever comes next, it will be on your terms, paid for in someone else\'s blood.',
            mood: 'determination',
            duration: 0
        }
    ],
    onComplete: 'gameplay'
};

// =============================================================================
//  WOOD ELF — "The Last Grove"
//  Theme: loss, nature reclaiming, fierce vow to survive
// =============================================================================

window.Latency.CutsceneData['origin_wood_elf'] = {
    id: 'origin_wood_elf',
    title: 'THE LAST GROVE',
    music: 0,
    slides: [
        {
            art: 'assets/images/races/wood_elf.jpg',
            text: 'You grow up in the green silence of Sector 41, where the megacity\'s concrete bones have cracked open and the earth has pushed through. Vines thick as cable conduits strangle the rusted scaffolding. Ferns unfurl from shattered windows thirty stories high. Your mother teaches you to read the forest\'s language — the way moss grows toward clean water, the way birdsong changes when predators are near. This is home. This is the only world that matters.',
            mood: 'peaceful',
            duration: 0
        },
        {
            art: 'assets/images/scenes/forest-ruins.jpg',
            text: 'The grove is a cathedral of green light filtering through a canopy that took decades to grow. At its heart stands the Mother Tree, a mutant oak whose roots have threaded through three sublevels of abandoned infrastructure, drawing nutrients from the chemical soup beneath the city. Your elders say she is alive in ways that go beyond biology. You believe them. You have felt her pulse through the soles of your bare feet since before you could walk.',
            mood: 'peaceful',
            duration: 0
        },
        {
            text: 'You learn to hunt in the overgrown corridors, stalking mutant rodents and feral maintenance drones with a bow carved from reclaimed rebar and sinew. Your fingers know the tension of the string the way a musician knows their instrument. The ruins provide everything your people need — shelter in the hollowed towers, water filtered through root systems, medicine brewed from flora that grows nowhere else on earth.',
            mood: 'neutral',
            duration: 0
        },
        {
            text: 'The surveyors arrive in spring. You spot their orange vests from a watchtower — four humans with scanning equipment, marking trees with spray paint. Your scouts shadow them for three days. On the fourth day, the lead surveyor plants a flag bearing the Meridian Industries logo at the edge of the grove. Your elder reads the attached notice. The sector has been rezoned for industrial development. You have ninety days to vacate.',
            mood: 'tension',
            duration: 0
        },
        {
            text: 'Your people do not vacate. They send delegations to the city council. They file injunctions through sympathetic human lawyers. They appeal to environmental protections that were defunded twenty years ago. The elders exhaust every legal avenue while the forest holds its breath. On day eighty-eight, the first bulldozers arrive at the sector perimeter, flanked by corporate security in full riot gear.',
            mood: 'tension',
            duration: 0
        },
        {
            art: 'assets/images/scenes/wasteland.jpg',
            text: 'The clearing begins at the outer ring. You hear it before you see it — a sound like bones breaking, amplified a thousandfold, as the industrial cutters chew through trunks that took thirty years to grow. The canopy shudders. Birds explode from the treetops in panicked clouds. The air fills with the smell of sap and sawdust and diesel exhaust, and something deep in your chest begins to scream without making a sound.',
            mood: 'dark',
            duration: 0
        },
        {
            text: 'Your people fight. Arrows against riot shields. Herbal smoke against gas masks. You loose shaft after shaft from the upper branches, aiming for the joints in their armor, the treads of their machines. It is not enough. It was never going to be enough. The corporate line advances meter by meter, and behind it, the forest becomes stumps and splinters and silence.',
            mood: 'anger',
            duration: 0
        },
        {
            text: 'They reach the Mother Tree at dusk. The industrial cutter is a massive thing, all spinning teeth and hydraulic arms, and it takes the first bite from her trunk with a shriek of metal on living wood. You feel it in your spine. Your knees buckle. Sap runs from the wound like blood, catching the last light, and you understand with absolute certainty that something irreplaceable is dying in front of you and there is nothing you can do to stop it.',
            mood: 'dark',
            duration: 0
        },
        {
            text: 'The Mother Tree falls at twenty-three minutes past sunset. The impact shakes the ground for a hundred meters in every direction. Dust and leaf fragments fill the air like green snow. In the silence that follows, you hear a sound you have never heard before — every surviving elf in the grove, keening. A raw, harmonic wail that resonates in frequencies you feel in your teeth. You open your mouth and add your voice to theirs.',
            mood: 'melancholy',
            duration: 0
        },
        {
            text: 'In the wreckage, while the corporate crews celebrate with thermoses of coffee and the security teams stand down, you press your hand into the shattered heartwood of the Mother Tree. The grain is still warm. Deep inside the splintered trunk, nestled in a hollow no machine could reach, you find a single seed pod, luminous and green and pulsing with faint bioluminescence. You close your fingers around it and feel the last heartbeat of your home against your palm.',
            mood: 'melancholy',
            duration: 0
        },
        {
            text: 'You slip away before dawn, carrying nothing but your bow, the seed pod pressed against your chest, and a vow that sits in your stomach like a stone. The megacity swallowed your forest. It will not swallow you. Somewhere in this wasteland of steel and glass, there is soil deep enough and dark enough and forgotten enough for one small seed to take root. You will find it. And you will never stop fighting for what grows.',
            mood: 'determination',
            duration: 0
        }
    ],
    onComplete: 'gameplay'
};

// =============================================================================
//  DARK ELF — "What the Tunnels Teach"
//  Theme: cunning born from betrayal, cold calculation, hidden wound
// =============================================================================

window.Latency.CutsceneData['origin_dark_elf'] = {
    id: 'origin_dark_elf',
    title: 'WHAT THE TUNNELS TEACH',
    music: 2,
    slides: [
        {
            art: 'assets/images/races/dark_elf.jpg',
            text: 'You are born underground, in a chamber carved from bedrock so deep that the concept of sky is an abstraction you will not encounter for years. The tunnel air is cool and still and tastes of limestone. Your mother holds you for exactly one hour — the traditional bonding period — then hands you to the crèche keeper. Attachment is a vulnerability. This is the first lesson, taught before you can understand words.',
            mood: 'dark',
            duration: 0
        },
        {
            art: 'assets/images/scenes/tunnel-network.jpg',
            text: 'The crèche is a long, lightless hall where dark elf children learn to navigate by sound, by touch, by the faint currents of air that map the tunnel network like a circulatory system. You crawl before you walk. You listen before you speak. By the time you are three, you can identify twenty-seven different tunnel junctions by the echo pattern of a dropped stone. The dark is not empty. It is full of information for those who know how to read it.',
            mood: 'dark',
            duration: 0
        },
        {
            text: 'At seven, you are assigned a mentor. Her name is Yvenne, and she is the most dangerous person you have ever met. She moves through the tunnels like smoke, appearing behind you without a sound, correcting your posture with a tap of her blade against your spine. She teaches you to pick locks, to read micro-expressions in dim light, to lie with your entire body. She never praises you. She never needs to. The fact that you are still alive is praise enough.',
            mood: 'neutral',
            duration: 0
        },
        {
            text: 'Trust no one completely, Yvenne tells you on the first day. Trust is a resource to be managed, not given freely. She demonstrates by leading you to a dead-drop where a fellow operative has left a message. The message is a trap — a contact grenade rigged to the seal. Yvenne knew it was coming. She used you as bait to confirm the betrayal. You spend three days in the infirmary with chemical burns on your hands. She visits once, bringing a salve she mixed herself.',
            mood: 'tension',
            duration: 0
        },
        {
            text: 'Years pass in the perpetual twilight of the undercity. You learn the trade routes, the smuggling channels, the invisible economy that flows beneath the megacity like a shadow river. You learn which houses control which tunnels, where the dead drops are, who can be bought and who must be broken. Yvenne shapes you into something sharp and quiet and useful, and despite everything she taught you about trust, you begin to trust her.',
            mood: 'neutral',
            duration: 0
        },
        {
            text: 'You are sixteen when the house war begins. A territorial dispute between House Vethrin and House Malcori erupts into open violence in the deep tunnels. Yvenne is recalled to active service. She tells you to stay in the safe house and wait. You wait for nine days. On the tenth day, a runner arrives with Yvenne\'s signet ring in a velvet pouch and no explanation.',
            mood: 'tension',
            duration: 0
        },
        {
            text: 'You find her in a maintenance corridor between Sectors 8 and 9, slumped against a utility pipe with three blade wounds in her back. Back wounds. She was running from someone she did not expect to attack. Her face is composed, even in death, as if she is merely thinking through a problem. You kneel beside her and feel something crack open in the center of your chest — a hollow, freezing emptiness that you know, with absolute certainty, will never completely fill again.',
            mood: 'dark',
            duration: 0
        },
        {
            text: 'You do not weep. You catalog. Three wounds, angled upward — the killer was shorter than Yvenne. A Malcori blade style, but the entry points are too precise, too surgical. This was not a house soldier. This was someone trained the same way you were trained. By Yvenne herself. One of her other students. Someone she trusted enough to turn her back on.',
            mood: 'tension',
            duration: 0
        },
        {
            text: 'You take her blade, her cipher book, and the locket she wore against her skin that she never let you see the inside of. You open it in the darkness of an abandoned service tunnel. Inside is a photograph, faded and creased. Two dark elf children standing in a shaft of artificial light, smiling. You recognize the younger face. It is your own. The other child is someone you have never seen. On the back, in Yvenne\'s precise hand: my students. You close the locket and put it on.',
            mood: 'melancholy',
            duration: 0
        },
        {
            text: 'The tunnels taught you everything. How to move without sound. How to read a room in the time it takes to blink. How to wear a face that gives nothing away while your mind runs calculations three moves ahead. Yvenne taught you all of this, and then she taught you the final lesson without meaning to — that even the sharpest blade can be undone by the hand it trusts.',
            mood: 'dark',
            duration: 0
        },
        {
            art: 'assets/images/scenes/underground-market.jpg',
            text: 'You emerge from the tunnel mouth into the sodium-lit sprawl of the lower districts. The surface world is loud and bright and full of people who wear their intentions on their faces like open books. Somewhere up here is the other student in Yvenne\'s locket. Somewhere up here is a debt that needs settling. You pull your hood forward, adjust the blade at your hip, and step into the crowd. The tunnels made you. The surface will learn what that means.',
            mood: 'determination',
            duration: 0
        }
    ],
    onComplete: 'gameplay'
};

// =============================================================================
//  DWARF — "The Bones of the City"
//  Theme: pride in craft, legacy, stubborn determination
// =============================================================================

window.Latency.CutsceneData['origin_dwarf'] = {
    id: 'origin_dwarf',
    title: 'THE BONES OF THE CITY',
    music: 1,
    slides: [
        {
            art: 'assets/images/races/dwarf.jpg',
            text: 'Your grandmother\'s hands are your first memory. Broad, scarred, permanently blackened around the nails from decades of machine grease that no soap can fully remove. She holds a wrench the way a surgeon holds a scalpel — with absolute precision and a steadiness that belies her seventy years. She is showing you how to calibrate a pressure valve on a water reclamation unit, and her voice is patient and warm and certain. This is the work, she says. This is what we do.',
            mood: 'warm',
            duration: 0
        },
        {
            art: 'assets/images/scenes/engineering-workshop.jpg',
            text: 'The engineering commune of Deephold sits in the lower industrial sector, carved into the foundations the dwarves themselves poured a hundred years ago. Every pipe in the district bears dwarf maker\'s marks. Every junction box has a dwarf serial number stamped into its casing. Your people built the geothermal grid that powers the eastern half of the megacity. They designed the water filtration system that keeps twelve million people alive. They invented the memory stack. They have the blueprints to prove it.',
            mood: 'neutral',
            duration: 0
        },
        {
            text: 'Nobody cares. The corporations filed the patents. The history books credit human engineers. The politicians cut ribbons on dwarf-built infrastructure and never mention the hands that welded the beams. Your grandmother tells you this without bitterness — she is too proud for bitterness — but you notice the way her jaw tightens when the district news shows another executive taking credit for a reactor design she recognizes from her own master\'s original schematics.',
            mood: 'melancholy',
            duration: 0
        },
        {
            text: 'You apprentice at twelve, the way every dwarf child does. Your master is a reactor technician named Borik Ironweld, a squat, silent dwarf with forearms like bridge cables and a gift for making turbines sing. He puts a wrench in your hand on the first day and does not let you touch anything else for six months. You learn the weight of it, the balance, the way it becomes an extension of your arm. Tools first, he says. Everything else follows.',
            mood: 'neutral',
            duration: 0
        },
        {
            text: 'The work is invisible and essential. You descend into the guts of the city before dawn and surface after dark, maintaining systems that the people above take for granted the way they take gravity for granted. Water pressure. Power distribution. Waste processing. Thermal regulation. If you stopped working for seventy-two hours, the eastern districts would begin to die. Nobody above knows your name. Nobody above thinks about you at all.',
            mood: 'melancholy',
            duration: 0
        },
        {
            text: 'Your grandmother dies on a maintenance shift. Her heart stops while she is elbow-deep in a coolant exchanger on sublevel fourteen. The other technicians find her with the repair half-finished, her tools laid out in perfect order on the access panel. She was eighty-three. She had been maintaining that same exchanger since before your mother was born. The company does not send a letter. They send a work order for her replacement.',
            mood: 'dark',
            duration: 0
        },
        {
            text: 'You finish her repair. You clean her tools and arrange them in her workshop the way she liked them — wrenches by size, diagnostic equipment by function, personal projects on the top shelf where the light is best. Among her things you find a leather-bound journal filled with schematics in her tight, precise handwriting. The last entry is a design for an improved memory stack architecture, more efficient and more stable than anything on the market. In the margin she has written: They\'ll steal this too. Let them try.',
            mood: 'melancholy',
            duration: 0
        },
        {
            text: 'You carry her journal in your toolbelt now, next to the multi-wrench she gave you on your first apprentice day. At night, in the humming quiet of the maintenance tunnels, you trace her schematics with your fingertip and feel the weight of every dwarf engineer who ever built something brilliant and watched someone else take the credit. The weight is not crushing. It is fuel. It has always been fuel.',
            mood: 'tension',
            duration: 0
        },
        {
            text: 'A pipe bursts in Sector 9 on a Wednesday — main water line, thirty-inch diameter, feeding a residential block of forty thousand. You are the closest qualified technician. You wade through chest-high water in a flooded service tunnel, locate the fracture by feel in total darkness, and weld a patch with a plasma torch held between your teeth while bracing the pipe with both hands. It takes four hours. The residents above never know how close they came to losing water for a week.',
            mood: 'neutral',
            duration: 0
        },
        {
            art: 'assets/images/scenes/stack-tower.jpg',
            text: 'On the way back to Deephold, soaked and exhausted, you pass through a market district. A wallscreen is playing a news segment about infrastructure investment. A human executive in a tailored suit is explaining how his company\'s innovative engineering solutions keep the city running. Behind him, you can see the maker\'s mark on the junction box over his shoulder. It belongs to your grandmother. You stop and stare at the screen until it cycles to the next story.',
            mood: 'melancholy',
            duration: 0
        },
        {
            text: 'You keep walking. You will always keep walking, down into the deep places where the real work gets done, where the pipes groan and the reactors hum and the bones of the city depend on hands like yours. They can take the credit. They can take the patents. They can pretend the city built itself. But they cannot take the craft. They cannot take what your grandmother put in your hands. And one day, when every stolen blueprint is reclaimed and every maker\'s mark is read aloud, the world will know who really kept the lights on.',
            mood: 'determination',
            duration: 0
        }
    ],
    onComplete: 'gameplay'
};
