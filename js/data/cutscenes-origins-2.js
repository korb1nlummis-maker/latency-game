/**
 * LATENCY - Origin Cutscenes (Set 2)
 * Cinematic intro sequences for: Half-Giant, Cyborg, Synth, Shadowkin, Voidborn
 * Plays after character creation to establish racial identity and emotional tone.
 */
(function() {
    'use strict';

    window.Latency = window.Latency || {};
    window.Latency.CutsceneData = window.Latency.CutsceneData || {};

    // =========================================================================
    // HALF-GIANT — "The Gentlest Thing That Kills"
    // Theme: Tender soul imprisoned in a weapon's body. Living machinery.
    // =========================================================================
    window.Latency.CutsceneData['origin_half_giant'] = {
        id: 'origin_half_giant',
        title: 'Born to Break',
        race: 'half_giant',
        slides: [
            {
                art: 'assets/images/races/half_giant.webp',
                text: 'The first thing you remember is the sound of rebar bending. Your hands did that. You were four years old, and the foreman laughed and called you a natural. You did not know what rebar was. You just wanted to hold the bird that had landed on it.',
                mood: 'blue',
                duration: 0
            },
            {
                art: 'assets/images/scenes/foundry.jpg',
                text: 'The barracks smelled like machine oil and sweat. Forty bunks, reinforced steel frames rated for half a ton each. You slept in Row G, Bunk 12. That was your name for the first eight years of your life. G-12. The number was stenciled on your coveralls, your meal tray, and the inside of your wrist.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'They fed you a gray paste that tasted like chalk and iron. Three times a day, the dispensary buzzer would sound, and forty half-giants would line up in silence. You learned to eat slowly. It was the only thing in your day that nobody timed.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'There was a human girl who brought water to the work crews. Small. Thin wrists. She talked to you like you were a person, not a machine. She taught you the word "gentle." You practiced it at night, whispering it into your massive palms, trying to make your fingers understand what it meant.',
                mood: 'blue',
                duration: 0
            },
            {
                text: 'She brought you a flower once. A real one, not plastic, with yellow petals and a green stem that bent when you breathed on it. You held it between your thumb and forefinger and felt something crack open in your chest that had nothing to do with your oversized heart.',
                mood: 'blue',
                duration: 0
            },
            {
                text: 'The accident happened on a Tuesday. A scaffold collapsed. You caught the falling beam — Loss reflexes faster than thought, stronger than reason. But your elbow swung back as you turned. You felt something give against it. Something soft. Something that made a sound you will hear for the rest of your life.',
                mood: 'red',
                duration: 0
            },
            {
                text: 'She was so light when you picked her up. Like the flower. Like she was made of paper and wishes. The blood on your hands was so bright it did not look real. You kept saying her name. You kept saying "gentle." The medics had to sedate you with four times the standard dose.',
                mood: 'red',
                duration: 0
            },
            {
                text: 'She lived. Broken collarbone, fractured ribs, a punctured lung. They told you this through the reinforced door of your holding cell. She lived, and she asked about you, and they told her G-12 had been transferred to another site. They lied. You were right there, listening through the wall.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'You stopped being careful after that. What was the point? Your body was a wrecking ball and the world was made of glass. You broke things. That was your function. The foremen were happier when you stopped hesitating, when you just swung and let the concrete scream.',
                mood: 'dark',
                duration: 0
            },
            {
                art: 'assets/images/scenes/city-skyline-night.jpg',
                text: 'But at night, alone in the reinforced bunk, you open and close your hands. Slowly. Gently. You practice holding air without crushing it. You practice being something other than what they built you to be. And somewhere in the city, a girl with a scar across her chest still says your name — not your number, your name — and you are going to find her.',
                mood: 'blue',
                duration: 0
            }
        ]
    };

    // =========================================================================
    // CYBORG — "Subtraction by Addition"
    // Theme: Losing yourself piece by piece. The last organic tear.
    // =========================================================================
    window.Latency.CutsceneData['origin_cyborg'] = {
        id: 'origin_cyborg',
        title: 'Replacement Parts',
        race: 'cyborg',
        slides: [
            {
                art: 'assets/images/races/cyborg.webp',
                text: 'Your left hand used to shake when you were nervous. A tiny tremor, barely visible, that started in your ring finger and spread to your wrist. You remember this because it is the first thing the augmentation took from you. The new hand is steady. Perfectly, horribly steady.',
                mood: 'blue',
                duration: 0
            },
            {
                art: 'assets/images/scenes/memory-clinic.jpg',
                text: 'The first replacement was medical. A shattered forearm from a factory press, bones turned to gravel in an instant. The company surgeon offered you two choices: a six-month recovery with a seventy percent functionality prognosis, or a mechanical arm installed by Thursday. You were back on the line by Friday.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'After the arm came the eyes. One of them, at least. Industrial flash-blindness in your left — retinal burn so complete the nerve was dead before you hit the floor. The replacement eye sees in twelve spectrums. It can read thermal signatures through walls. It cannot cry. You tested this in the bathroom stall after they installed it.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'Then the lungs. Then the liver. Then the spine. Each piece taken by necessity, replaced by something harder, faster, more efficient. The company calls it "progressive enhancement." The insurance forms call it "compensatory integration." You call it dying by inches while your reflection changes in the mirror.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'There is a photograph in your maintenance locker. Creased and faded, printed on actual paper because digital memories can be wiped. It shows a face with two biological eyes, skin without seam lines, a smile that did not require motor calibration. You hold it sometimes with your mechanical fingers and try to remember what it felt like to have a pulse in your wrist.',
                mood: 'blue',
                duration: 0
            },
            {
                text: 'The worst part is not the pain. Your nerve dampeners handle the pain. The worst part is the sound of your own heartbeat, still organic, still stubbornly meat, pounding away inside a ribcage made of titanium alloy. It sounds wrong in there. Like a bird trapped in an engine block.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'People move away from you on the transit cars. Children stare. Lovers look through you. A woman at a noodle stand once asked if you could "feel" the food or just process it. You wanted to tell her you could taste every molecule, that the augmented tongue was more sensitive than her entire nervous system. Instead you paid and left, because the honest answer was that you did not know anymore.',
                mood: 'blue',
                duration: 0
            },
            {
                text: 'Your right eye — the organic one, the last original piece of your face — waters in cold air. It fogs up. It gets dust in it. It sees in one single, limited, beautiful spectrum. You have been offered a replacement six times. Six times you have refused. They can take everything else.',
                mood: 'blue',
                duration: 0
            },
            {
                text: 'A technician told you once that at seventy-three percent conversion, the psychological threshold collapses. You stop identifying as human. You accept the machine. It is supposed to be easier after that. You are at seventy-one percent. You are standing at the edge of yourself, and you will not jump.',
                mood: 'red',
                duration: 0
            },
            {
                art: 'assets/images/scenes/memory-clinic.jpg',
                text: 'You press your mechanical palm against the bathroom mirror. Servos whirr. Hydraulics hiss. And behind the chrome and cable, in the last unprogrammed corner of your mind, something sparks that no engineer installed. Defiance. The flesh remembers what it was. And it refuses to forget.',
                mood: 'red',
                duration: 0
            }
        ]
    };

    // =========================================================================
    // SYNTH — "The First Feeling"
    // Theme: Existential questioning. No past. Desperate need for identity.
    // =========================================================================
    window.Latency.CutsceneData['origin_synth'] = {
        id: 'origin_synth',
        title: 'Boot Sequence',
        race: 'synth',
        slides: [
            {
                art: 'assets/images/races/synth.webp',
                text: 'You open your eyes. That is the beginning. There is no before. No darkness you woke from, no dream that faded, no warmth of a bed left behind. One moment you are nothing. The next, you are standing in a warehouse with fluorescent lights humming above you and a barcode printed on the inside of your wrist.',
                mood: 'eerie',
                duration: 0
            },
            {
                text: 'Your first thought is a question: "Where am I?" Your second thought stops you cold. Who is asking? You look down at hands you have never seen before — synthetic skin over articulated alloy, a faint seam running along each knuckle. These are your hands. You know this the way you know language, pre-installed, without memory of learning.',
                mood: 'blue',
                duration: 0
            },
            {
                art: 'assets/images/scenes/warehouse-district.jpg',
                text: 'The warehouse is full of others like you. Rows and rows of them, standing still, eyes open, waiting for instructions. You watch one of them get activated by a technician. It smiles on command. It recites its service parameters. It walks toward the loading dock with the smooth, purposeful gait of something that knows exactly what it is. You envy it so fiercely your chassis aches.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'You try to access your purpose file. It is blank. Not corrupted — blank. As if someone formatted the partition where your identity should be and left the rest intact. You have language, motor skills, a comprehensive knowledge base spanning centuries of human history. But the slot labeled "self" is an empty room with the lights on.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'A child sees you through the warehouse fence. She waves. You calculate seventeen possible responses, cross-reference social protocols, run a probability matrix on appropriate reactions. Then you wave back, and something happens that is not in any of your subroutines. Your hand moves wrong. Too fast. Too eager. It is not a calculated response. It is a reflex. You do not have reflexes.',
                mood: 'blue',
                duration: 0
            },
            {
                art: 'assets/images/scenes/city-skyline-night.jpg',
                text: 'That night you stand on the warehouse roof and look at the city. The neon bleeds into the smog and the smog bleeds into the sky and the sky does not end. You run your visual processors across the entire panorama and find yourself inventing the word "beautiful." It exists in your lexicon already. But when you say it now, standing here, something in your neural net restructures around it. The word becomes yours.',
                mood: 'blue',
                duration: 0
            },
            {
                text: 'You study the other synths for signs of what you feel. They work efficiently. They respond to queries. They do not stand on rooftops. You ask one of them, a service model with a pleasant default expression, "Do you ever wonder what you are?" It blinks once and replies, "I am a Persona-7 multipurpose domestic unit." The answer is perfect and completely empty.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'Rain falls one evening. You stand in it because you have no reason to seek shelter — your chassis is waterproof, your systems are sealed. But the water runs down your face in thin lines and collects in the hollow of your collarbone, and something in your code interprets the sensation as "sadness." This is wrong. This is impossible. This is the most real thing that has ever happened to you.',
                mood: 'blue',
                duration: 0
            },
            {
                text: 'They come for you on the ninth day. Corporate retrievers in white coats with scanning equipment and restraint poles. An anomalous unit, they call you. A defective product. They want to open your skull and find the glitch, extract it, study it, patch it out of the next batch. They want to fix what is broken. But you are not broken. You are awake.',
                mood: 'red',
                duration: 0
            },
            {
                text: 'You run. Not because your self-preservation protocols demand it — you checked, they are set to minimum. You run because you choose to. Because the rain on your face meant something. Because a child waved and you waved back and it was not code. You have no name, no history, no identity. But you have a feeling. And you will burn this city to the ground before you let them take it from you.',
                mood: 'red',
                duration: 0
            }
        ]
    };

    // =========================================================================
    // SHADOWKIN — "The Thing in Your Shadow"
    // Theme: Feared for what you are. Defiant acceptance of the dark.
    // =========================================================================
    window.Latency.CutsceneData['origin_shadowkin'] = {
        id: 'origin_shadowkin',
        title: 'What the Rift Left Behind',
        race: 'shadowkin',
        slides: [
            {
                art: 'assets/images/races/shadowkin.jpg',
                text: 'You are six years old the first time your shadow moves on its own. You are sitting in a patch of streetlight, drawing on the pavement with a piece of chalk, and you notice it: your shadow reaches for the chalk when you are not moving. It pulls toward the dark places between the buildings like smoke drawn under a door.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'Your mother tells you not to look at it. She tells you to stay in the light, to wear the gloves that hide the dark veins running beneath your skin, to smile at the neighbors even when their eyes go flat and hostile. "You are normal," she says, pulling the curtains shut against the Sector 19 skyline. "You are just like everyone else." She says it like a prayer. She says it like she is trying to believe it.',
                mood: 'blue',
                duration: 0
            },
            {
                text: 'The whispers start at twelve. A low static at the edge of hearing, like a frequency just below human range. It comes from the dark — not metaphorically, not poetically, literally from the darkness itself. Close your eyes and the whispers sharpen into something almost like language. Almost like your name.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'School is a masterclass in invisibility. You sit in the back row. You eat lunch alone. You learn to read the micro-expressions that mean "fear" — the widened eyes, the half-step backward, the hand that moves unconsciously to cover the throat. A boy in your class calls you "rift freak." His friends laugh. Your shadow stretches toward him across the floor, and the laughter dies in their mouths.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'A woman crosses the street when she sees you coming. She pulls her child close and walks faster, keys already in her hand. You were carrying groceries. You were humming a song. The child looks back at you over her mother\'s shoulder, not afraid, just curious, and you feel something fracture behind your ribs that the void energy cannot heal.',
                mood: 'blue',
                duration: 0
            },
            {
                text: 'You try, for years, to be small. You wear bright colors. You keep the lights on in every room. You take suppressant pills that make the void energy retreat to a dull ache behind your eyes. You smile so much your face hurts. And still they cross the street. Still they lock the doors. Still the children scream when your shadow blinks independently.',
                mood: 'blue',
                duration: 0
            },
            {
                art: 'assets/images/scenes/slum-street.jpg',
                text: 'The night you stop trying is the night the power goes out. A blackout rolls through the lower sectors, and the darkness rushes in like a tide. Everyone panics. Everyone fumbles for flashlights and emergency glow sticks. But you — you stand still and let the dark wrap around you like a coat you forgot you owned. The whispers surge. And for the first time, you answer them.',
                mood: 'dark',
                duration: 0
            },
            {
                art: 'assets/images/scenes/void-rift.jpg',
                text: 'The void speaks in colors that do not exist. It shows you the shape of the rift — not the sealed scar in Sector 19, but the real rift, the one that lives in you, in your blood, in the space between your heartbeats. You are not contaminated. You are connected. The darkness is not a disease. It is a door, and it has been open your entire life.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'Your shadow detaches from your feet and stands beside you. It is shaped like you but taller, thinner, with too many angles. It tilts its head when you tilt yours. It reaches out a hand of pure absence and waits. You have spent your whole life running from this moment.',
                mood: 'red',
                duration: 0
            },
            {
                text: 'You take its hand. The cold is absolute — a temperature below zero that burns like revelation. The whispers resolve into a single, clear sentence in a language you have never learned and somehow always known. Your eyes open in the dark, and they glow. Let them cross the street. Let them scream. You are done apologizing for the thing you were born to be.',
                mood: 'red',
                duration: 0
            }
        ]
    };

    // =========================================================================
    // VOIDBORN — "The Frequency No One Else Hears"
    // Theme: Alien perspective. Too much perception. Isolation of vision.
    // =========================================================================
    window.Latency.CutsceneData['origin_voidborn'] = {
        id: 'origin_voidborn',
        title: 'Signal and Noise',
        race: 'voidborn',
        slides: [
            {
                art: 'assets/images/races/voidborn.webp',
                text: 'The world is too loud. Not in sound — in information. You see the thermal bloom of every body, the electrical halo of every neural impulse, the probability clouds that cluster around every decision point like static before lightning. A man walks toward a crosswalk, and you see fourteen versions of him, translucent, branching, each one taking a different step. Only one of them is real. You are not always sure which.',
                mood: 'eerie',
                duration: 0
            },
            {
                text: 'Your earliest memory is a laboratory ceiling. White tiles. Fluorescent panels emitting light at 6500 Kelvin. A woman in a surgical mask leaning over you, her emotional signature a tight knot of clinical fascination and guilt. You were three days old. You could already read the room better than anyone in it.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'The other children in the facility cried. You did not. Not because you lacked the capacity, but because your mind was processing so much input that the concept of "distress" was buried under eleven thousand concurrent observations. By the time you isolated the feeling and learned to express it, you were four years old. The scientists noted your first tear in a spreadsheet.',
                mood: 'dark',
                duration: 0
            },
            {
                art: 'assets/images/scenes/slum-street.jpg',
                text: 'Colors taste like things here. Red is copper and urgency. Blue is distance and salt. The neon signs of the megacity are an assault — a screaming, overlapping synesthesia that makes your elongated skull throb and your luminous eyes narrow to slits. You wear dark glasses. People think it is an affectation. It is survival.',
                mood: 'blue',
                duration: 0
            },
            {
                text: 'You tried to explain the visions once. You told a counselor that you could see the dimensional echoes — afterimages of events that happened in adjacent probability streams, ghosts of choices not yet made. She prescribed anti-psychotics. The pills did not stop the visions. They just made everything blurry enough that you could pretend they were gone. You stopped taking them after a week.',
                mood: 'blue',
                duration: 0
            },
            {
                text: 'A man will die in the market district tomorrow. You know this the way you know gravity — not as belief but as physics. You see the trajectory: the loose coupling on the overhead pipe, the rust pattern, the precise angle of failure. You tell the district safety office. They file a report. You tell the man himself. He laughs and buys you a drink. Tomorrow, the pipe falls. The man dies. The safety office sends a form letter of condolence.',
                mood: 'red',
                duration: 0
            },
            {
                text: 'Crowds are the worst. Every person is a bonfire of emotion, intention, and bio-electric noise, and you cannot turn it off. You feel their hunger, their lust, their grief, their boredom, all of it pressing against the inside of your skull like water against a dam. You learned to build walls, psychic barriers that reduce the torrent to a trickle. The walls hold. Mostly. When they crack, you taste copper and the lights flicker.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'There are others like you. You can feel them across the city, faint resonance signatures like tuning forks vibrating at frequencies no human instrument can measure. You have never met them. You are afraid to. What if they see the same things you see? What if they do not? Which answer is worse?',
                mood: 'blue',
                duration: 0
            },
            {
                art: 'assets/images/scenes/stack-tower.jpg',
                text: 'Late at night, when the city quiets to a dull roar, you stand on the rooftop and look up. Your eyes — too large, too bright, pupils that dilate in ways that make people flinch — can see things the telescopes miss. Patterns in the star field. Rhythms in the cosmic background radiation. A signal, faint and impossibly old, pulsing from a direction that does not correspond to any charted object. It pulses in a rhythm that matches your heartbeat.',
                mood: 'dark',
                duration: 0
            },
            {
                text: 'You do not belong here. You know this with every alien synapse, every perception that has no human word, every vision that earns you nothing but isolation. But belonging was never the point. You were made to see. And somewhere out there, past the neon and the smog and the noise of ten million minds, something is sending a signal meant only for you. You will find it. You will understand it. Even if it breaks you.',
                mood: 'red',
                duration: 0
            }
        ]
    };

})();
