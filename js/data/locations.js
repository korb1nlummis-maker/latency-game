/**
 * LATENCY - Locations Data
 * ============================================================
 * Complete location database for the megacity. Organized into
 * four districts: Undercity, Midcity, Highcity, Underground.
 *
 * Each location defines its connections (for fast-travel),
 * available vendors, possible encounters, ASCII art path,
 * ambient music track index, and discoverability.
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.Locations = {

    // =========================================================================
    //  UNDERCITY - The lowest levels. Industry, poverty, resistance.
    // =========================================================================

    lower_slums: {
        id: 'lower_slums',
        name: 'The Lower Slums',
        description: 'The lowest level of the city. Rain, rust, and desperation. Makeshift shelters crowd every alley, and the air tastes of copper and decay. Nobody comes here by choice.',
        district: 'undercity',
        connections: ['upper_slums', 'sewer_network', 'industrial_zone'],
        vendors: ['street_vendor'],
        encounters: ['slum_thug', 'feral_dog', 'pickpocket'],
        ascii: 'assets/ascii/locations/lower-slums.txt',
        ambientTrack: 0,
        discoverable: false
    },

    upper_slums: {
        id: 'upper_slums',
        name: 'The Upper Slums',
        description: 'Marginally less wretched than below. Jury-rigged power lines crackle overhead. Street vendors hawk synthetic food and stolen tech. The people here still have hope. Barely.',
        district: 'undercity',
        connections: ['lower_slums', 'market_district', 'black_market_bazaar', 'industrial_zone'],
        vendors: ['scrap_dealer', 'food_vendor'],
        encounters: ['pickpocket', 'gang_enforcer', 'junkie'],
        ascii: 'assets/ascii/locations/upper-slums.txt',
        ambientTrack: 0,
        discoverable: false
    },

    sewer_network: {
        id: 'sewer_network',
        name: 'Sewer Network',
        description: 'A labyrinth of crumbling tunnels beneath the slums. Toxic runoff glows in the dark. Smugglers use these paths to move contraband. So do things that stopped being human.',
        district: 'undercity',
        connections: ['lower_slums', 'tunnel_network', 'abandoned_subway'],
        vendors: [],
        encounters: ['sewer_rat_king', 'feral_dog', 'junkie'],
        ascii: 'assets/ascii/locations/sewer-network.txt',
        ambientTrack: 2,
        discoverable: true
    },

    industrial_zone: {
        id: 'industrial_zone',
        name: 'Industrial Zone',
        description: 'Massive factory complexes belch smoke into the perpetual overcast. Automated assembly lines produce goods for the upper city while human workers maintain what the robots cannot.',
        district: 'undercity',
        connections: ['lower_slums', 'upper_slums', 'the_foundry', 'scrap_yards'],
        vendors: ['tool_merchant'],
        encounters: ['malfunctioning_drone', 'rogue_synth', 'slum_thug'],
        ascii: 'assets/ascii/locations/industrial-zone.txt',
        ambientTrack: 1,
        discoverable: false
    },

    the_foundry: {
        id: 'the_foundry',
        name: 'The Foundry',
        description: 'Headquarters of the Iron Collective. A converted mega-factory where the flames of revolution are forged alongside weapons and armor. Commander Vex holds court among the furnaces.',
        district: 'undercity',
        connections: ['industrial_zone', 'scrap_yards'],
        vendors: ['hammer_armorer', 'doc_rivet'],
        encounters: ['gang_enforcer', 'corrupt_guard', 'slum_thug'],
        ascii: 'assets/ascii/locations/the-foundry.txt',
        ambientTrack: 1,
        discoverable: true,
        faction: 'ironCollective',
        requiredReputation: { ironCollective: -10 }
    },

    black_market_bazaar: {
        id: 'black_market_bazaar',
        name: 'Black Market Bazaar',
        description: 'A sprawling underground marketplace where anything can be bought for the right price. Neon signs advertise illegal augmentations and stolen corporate secrets. No questions asked.',
        district: 'undercity',
        connections: ['upper_slums', 'abandoned_subway', 'tunnel_network'],
        vendors: ['whisper_dealer', 'patch_doc', 'contraband_merchant'],
        encounters: ['black_market_guard', 'pickpocket', 'gang_enforcer'],
        ascii: 'assets/ascii/locations/black-market.txt',
        ambientTrack: 3,
        discoverable: true
    },

    abandoned_subway: {
        id: 'abandoned_subway',
        name: 'Abandoned Subway',
        description: 'Pre-collapse transit tunnels repurposed as shelter for those with nowhere else to go. Faded advertisements for products that no longer exist line the walls. Trains that will never run again rust on dead tracks.',
        district: 'undercity',
        connections: ['sewer_network', 'black_market_bazaar', 'transit_hub'],
        vendors: ['scavenger_trader'],
        encounters: ['tunnel_crawler', 'feral_dog', 'sewer_rat_king'],
        ascii: 'assets/ascii/locations/abandoned-subway.txt',
        ambientTrack: 2,
        discoverable: true
    },

    scrap_yards: {
        id: 'scrap_yards',
        name: 'Scrap Yards',
        description: 'Mountains of discarded technology and broken machines stretch to the horizon. Scavengers pick through the refuse for anything salvageable. One person\'s trash is another\'s survival.',
        district: 'undercity',
        connections: ['industrial_zone', 'the_foundry'],
        vendors: ['scrap_merchant', 'junk_tech'],
        encounters: ['malfunctioning_drone', 'feral_dog', 'rogue_synth'],
        ascii: 'assets/ascii/locations/scrap-yards.txt',
        ambientTrack: 1,
        discoverable: false
    },

    // =========================================================================
    //  MIDCITY - The working middle. Commerce, transit, entertainment.
    // =========================================================================

    market_district: {
        id: 'market_district',
        name: 'Market District',
        description: 'The commercial heart of the city. Licensed vendors sell everything from synth-food to second-hand implants. Holographic advertisements flicker above the crowds. Corporate security keeps the peace. Mostly.',
        district: 'midcity',
        connections: ['upper_slums', 'residential_blocks', 'transit_hub', 'neon_strip'],
        vendors: ['general_merchant', 'weapons_dealer', 'armor_shop', 'med_vendor'],
        encounters: ['pickpocket', 'corrupt_guard', 'gang_enforcer'],
        ascii: 'assets/ascii/locations/market-district.txt',
        ambientTrack: 3,
        discoverable: false
    },

    residential_blocks: {
        id: 'residential_blocks',
        name: 'Residential Blocks',
        description: 'Towering hab-stacks housing millions in cramped apartments. Laundry hangs between buildings. Children play in narrow corridors. A thin veneer of normalcy over quiet desperation.',
        district: 'midcity',
        connections: ['market_district', 'medical_quarter', 'transit_hub'],
        vendors: ['corner_store'],
        encounters: ['gang_enforcer', 'junkie', 'corrupt_guard'],
        ascii: 'assets/ascii/locations/residential-blocks.txt',
        ambientTrack: 4,
        discoverable: false
    },

    transit_hub: {
        id: 'transit_hub',
        name: 'Transit Hub',
        description: 'The central transportation nexus connecting all districts. Mag-lev trains scream through transparent tubes. Security checkpoints scan everyone passing between city levels. The lifeblood of urban movement.',
        district: 'midcity',
        connections: ['market_district', 'residential_blocks', 'abandoned_subway', 'arena_district', 'cloud_towers', 'skyport'],
        vendors: ['transit_kiosk'],
        encounters: ['corrupt_guard', 'faction_soldier', 'rogue_synth'],
        ascii: 'assets/ascii/locations/transit-hub.txt',
        ambientTrack: 3,
        discoverable: false
    },

    medical_quarter: {
        id: 'medical_quarter',
        name: 'Medical Quarter',
        description: 'Licensed clinics and unlicensed back-alley surgeons operate side by side. The sterile white of corporate hospitals contrasts with the flickering neon of street-level chop shops. Health has a price.',
        district: 'midcity',
        connections: ['residential_blocks', 'job_center', 'neon_strip'],
        vendors: ['clinic_pharmacy', 'implant_surgeon'],
        encounters: ['organ_harvester', 'stack_junkie', 'corrupt_guard'],
        ascii: 'assets/ascii/locations/medical-quarter.txt',
        ambientTrack: 4,
        discoverable: false
    },

    deep_net_cafe: {
        id: 'deep_net_cafe',
        name: 'The Deep Net Cafe',
        description: 'Headquarters of the Ghost Network, disguised as an unremarkable data cafe. Rows of terminals flicker with encrypted connections. The real business happens in the servers hidden beneath the floor.',
        district: 'midcity',
        connections: ['neon_strip', 'market_district'],
        vendors: ['data_broker', 'software_vendor'],
        encounters: ['stack_junkie', 'rogue_synth', 'bounty_hunter'],
        ascii: 'assets/ascii/locations/deep-net-cafe.txt',
        ambientTrack: 5,
        discoverable: true,
        faction: 'ghostSyndicate',
        requiredReputation: { ghostSyndicate: -10 }
    },

    job_center: {
        id: 'job_center',
        name: 'Job Center',
        description: 'A government-run employment bureau where citizens find legitimate work. Holographic boards display available positions. The reality of most jobs is far grimmer than the descriptions suggest.',
        district: 'midcity',
        connections: ['medical_quarter', 'residential_blocks', 'arena_district'],
        vendors: [],
        encounters: ['corrupt_guard', 'gang_enforcer', 'pickpocket'],
        ascii: 'assets/ascii/locations/job-center.txt',
        ambientTrack: 4,
        discoverable: false
    },

    arena_district: {
        id: 'arena_district',
        name: 'Arena District',
        description: 'The blood sport capital of the city. Gladiatorial combat draws massive crowds. Fighters risk death for credits and glory. The Neon Court sponsors the grandest matches.',
        district: 'midcity',
        connections: ['transit_hub', 'job_center', 'neon_strip'],
        vendors: ['arena_weaponsmith', 'betting_booth'],
        encounters: ['faction_soldier', 'combat_cyborg', 'bounty_hunter'],
        ascii: 'assets/ascii/locations/arena-district.txt',
        ambientTrack: 6,
        discoverable: false
    },

    neon_strip: {
        id: 'neon_strip',
        name: 'Neon Strip',
        description: 'The entertainment district. Bars, clubs, and pleasure houses pulse with light and bass. Synth-music fills the air. Everyone comes here to forget what the city really is, at least for a few hours.',
        district: 'midcity',
        connections: ['market_district', 'medical_quarter', 'deep_net_cafe', 'arena_district', 'cloud_towers'],
        vendors: ['bartender', 'stim_dealer', 'info_broker'],
        encounters: ['gang_enforcer', 'bounty_hunter', 'corrupt_guard'],
        ascii: 'assets/ascii/locations/neon-strip.txt',
        ambientTrack: 3,
        discoverable: false
    },

    // =========================================================================
    //  HIGHCITY - The elite levels. Wealth, power, corruption.
    // =========================================================================

    cloud_towers: {
        id: 'cloud_towers',
        name: 'Cloud Towers',
        description: 'Residential mega-structures for the wealthy that pierce the smog layer into actual sunlight. Clean air, real food, and armed security. A different world from the streets below.',
        district: 'highcity',
        connections: ['transit_hub', 'neon_strip', 'corporate_spires', 'gardens_of_eternity', 'skyport'],
        vendors: ['luxury_merchant'],
        encounters: ['elite_guard', 'faction_soldier', 'shadow_assassin'],
        ascii: 'assets/ascii/locations/cloud-towers.txt',
        ambientTrack: 7,
        discoverable: false
    },

    corporate_spires: {
        id: 'corporate_spires',
        name: 'Corporate Spires',
        description: 'The towering headquarters of the megacorporations that truly run the city. Glass and steel monuments to profit and power. Every floor is a battlefield of boardroom politics.',
        district: 'highcity',
        connections: ['cloud_towers', 'the_spire', 'senate_hall', 'stack_clinic'],
        vendors: ['corporate_vendor'],
        encounters: ['elite_guard', 'combat_cyborg', 'bounty_hunter'],
        ascii: 'assets/ascii/locations/corporate-spires.txt',
        ambientTrack: 7,
        discoverable: false
    },

    the_spire: {
        id: 'the_spire',
        name: 'The Spire',
        description: 'The Neon Court\'s glittering palace. A tower of light and excess where the elite play their deadly games of influence. Every surface shimmers. Every smile hides a knife.',
        district: 'highcity',
        connections: ['corporate_spires', 'gardens_of_eternity'],
        vendors: ['silk_couturier', 'prism_dealer'],
        encounters: ['shadow_assassin', 'void_stalker', 'elite_guard'],
        ascii: 'assets/ascii/locations/the-spire.txt',
        ambientTrack: 8,
        discoverable: true,
        faction: 'neonCourt',
        requiredReputation: { neonCourt: 10 }
    },

    stack_clinic: {
        id: 'stack_clinic',
        name: 'Stack Clinic',
        description: 'High-end cortical stack maintenance facility. Only the wealthy can afford to back up their consciousness here. Rows of pristine pods hold the sleeping rich while their minds are defragmented.',
        district: 'highcity',
        connections: ['corporate_spires', 'observatory'],
        vendors: ['stack_technician', 'premium_medic'],
        encounters: ['stack_lord_enforcer', 'elite_guard', 'organ_harvester'],
        ascii: 'assets/ascii/locations/stack-clinic.txt',
        ambientTrack: 7,
        discoverable: true
    },

    skyport: {
        id: 'skyport',
        name: 'Skyport',
        description: 'The city\'s aerial transit station. VTOL craft and cargo drones fill the sky. The only legal way in or out of the city. Heavily monitored, heavily armed, heavily corrupt.',
        district: 'highcity',
        connections: ['transit_hub', 'cloud_towers'],
        vendors: ['skyport_merchant', 'import_dealer'],
        encounters: ['elite_guard', 'faction_soldier', 'wasteland_raider'],
        ascii: 'assets/ascii/locations/skyport.txt',
        ambientTrack: 7,
        discoverable: false
    },

    gardens_of_eternity: {
        id: 'gardens_of_eternity',
        name: 'Gardens of Eternity',
        description: 'A bio-dome of real plants maintained for the elite. Trees that haven\'t existed outside these walls for decades. The air is clean. The silence is deafening. A monument to what was lost.',
        district: 'highcity',
        connections: ['cloud_towers', 'the_spire', 'observatory'],
        vendors: [],
        encounters: ['corrupted_priest', 'void_stalker', 'mutant_brute'],
        ascii: 'assets/ascii/locations/gardens.txt',
        ambientTrack: 8,
        discoverable: true
    },

    observatory: {
        id: 'observatory',
        name: 'Observatory',
        description: 'An ancient astronomical facility repurposed as a research center. The telescope still works but there is nothing left worth looking at in the sky. The Circuit Saints maintain the equipment.',
        district: 'highcity',
        connections: ['stack_clinic', 'gardens_of_eternity', 'senate_hall'],
        vendors: ['research_vendor'],
        encounters: ['corrupted_priest', 'ai_sentinel', 'combat_cyborg'],
        ascii: 'assets/ascii/locations/observatory.txt',
        ambientTrack: 8,
        discoverable: true,
        faction: 'circuitSaints',
        requiredReputation: { circuitSaints: -10 }
    },

    senate_hall: {
        id: 'senate_hall',
        name: 'Senate Hall',
        description: 'The nominal seat of government. Elected officials debate while corporate puppeteers pull the strings. The architecture is pre-collapse grandeur. The politics are post-collapse rot.',
        district: 'highcity',
        connections: ['corporate_spires', 'observatory'],
        vendors: [],
        encounters: ['elite_guard', 'bounty_hunter', 'faction_soldier'],
        ascii: 'assets/ascii/locations/senate-hall.txt',
        ambientTrack: 7,
        discoverable: true
    },

    // =========================================================================
    //  UNDERGROUND - Hidden places beneath and between.
    // =========================================================================

    tunnel_network: {
        id: 'tunnel_network',
        name: 'Tunnel Network',
        description: 'A vast web of forgotten maintenance tunnels, smuggling routes, and collapsed infrastructure. Maps are unreliable. The darkness hides things that prefer not to be found.',
        district: 'underground',
        connections: ['sewer_network', 'black_market_bazaar', 'the_ossuary', 'catacombs', 'hidden_labs'],
        vendors: [],
        encounters: ['tunnel_crawler', 'mutant_brute', 'void_stalker'],
        ascii: 'assets/ascii/locations/tunnel-network.txt',
        ambientTrack: 2,
        discoverable: true
    },

    the_ossuary: {
        id: 'the_ossuary',
        name: 'The Ossuary',
        description: 'Headquarters of the Ashen Circle. A cathedral of bone and silence built in a cavern beneath the city. Void anomalies flicker at the edges of perception. The air itself feels thin, as if reality is worn through.',
        district: 'underground',
        connections: ['tunnel_network', 'catacombs', 'void_chamber'],
        vendors: ['hollow_merchant', 'ash_apothecary'],
        encounters: ['ashen_circle_herald', 'void_stalker', 'corrupted_priest'],
        ascii: 'assets/ascii/locations/the-ossuary.txt',
        ambientTrack: 9,
        discoverable: true,
        faction: 'ashenCircle',
        requiredReputation: { ashenCircle: 0 }
    },

    hidden_labs: {
        id: 'hidden_labs',
        name: 'Hidden Labs',
        description: 'Pre-collapse research facilities sealed beneath the city. Some still have power. Some still have active experiments. The things growing in the vats were not part of any approved protocol.',
        district: 'underground',
        connections: ['tunnel_network', 'vault'],
        vendors: ['lab_terminal'],
        encounters: ['ai_sentinel', 'combat_cyborg', 'mech_walker'],
        ascii: 'assets/ascii/locations/hidden-labs.txt',
        ambientTrack: 5,
        discoverable: true
    },

    vault: {
        id: 'vault',
        name: 'The Vault',
        description: 'A sealed pre-collapse bunker containing technology and records from before the fall. Multiple factions want access. The security systems are still active and lethally effective.',
        district: 'underground',
        connections: ['hidden_labs', 'catacombs'],
        vendors: [],
        encounters: ['ancient_ai', 'mech_walker', 'ai_sentinel'],
        ascii: 'assets/ascii/locations/vault.txt',
        ambientTrack: 5,
        discoverable: true
    },

    catacombs: {
        id: 'catacombs',
        name: 'Catacombs',
        description: 'Ancient burial tunnels that predate the city. Bones line the walls in geometric patterns. Something down here still remembers the dead. The whispers are not your imagination.',
        district: 'underground',
        connections: ['tunnel_network', 'the_ossuary', 'vault', 'void_chamber'],
        vendors: [],
        encounters: ['mutant_brute', 'void_stalker', 'faction_champion'],
        ascii: 'assets/ascii/locations/catacombs.txt',
        ambientTrack: 9,
        discoverable: true
    },

    void_chamber: {
        id: 'void_chamber',
        name: 'The Void Chamber',
        description: 'The deepest point beneath the city. A cavern where reality itself breaks down. Void energy pulses from a rift in space. The Ashen Circle believes this is where the world ends. They may be right.',
        district: 'underground',
        connections: ['the_ossuary', 'catacombs'],
        vendors: [],
        encounters: ['void_entity', 'ashen_circle_herald', 'ancient_ai'],
        ascii: 'assets/ascii/locations/void-chamber.txt',
        ambientTrack: 9,
        discoverable: true,
        dangerLevel: 'extreme'
    }
};
