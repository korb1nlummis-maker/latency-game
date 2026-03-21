/**
 * LATENCY Screenshot Capture Script
 * Uses Puppeteer (bundled with Electron) to capture Steam store screenshots.
 * Run: node scripts/capture-screenshots.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'Steam Setup', 'screenshots');
const WIDTH = 1920;
const HEIGHT = 1080;
const GAME_URL = 'http://localhost:8085';

// Ensure output directory exists
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture(page, name, delayMs) {
    if (delayMs) await sleep(delayMs);
    const filePath = path.join(SCREENSHOT_DIR, name + '.png');
    await page.screenshot({ path: filePath, fullPage: false });
    console.log('  Captured: ' + name + '.png');
}

async function run() {
    console.log('Starting screenshot capture...');
    console.log('Make sure the dev server is running on port 8084');
    console.log('(Run: python -m http.server 8084 from D:/Latency)');
    console.log('');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox'],
        defaultViewport: { width: WIDTH, height: HEIGHT }
    });

    const page = await browser.newPage();

    try {
        await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await sleep(3000); // Wait for game modules to initialize
    } catch (e) {
        console.error('ERROR: Could not connect to ' + GAME_URL);
        console.error('Start the dev server first: python -m http.server 8084');
        await browser.close();
        process.exit(1);
    }

    // Mute audio
    await page.evaluate(() => {
        if (window.Latency && window.Latency.MusicManager) window.Latency.MusicManager.setVolume(0);
        if (window.Latency && window.Latency.SfxManager) window.Latency.SfxManager.setVolume(0);
    });
    await sleep(1000);

    // 1. Main Menu
    console.log('[1/10] Main Menu');
    await capture(page, '01_main_menu', 500);

    // 2. Click New Game -> Race Selection
    console.log('[2/10] Race Selection');
    await page.click('.menu-btn');
    await sleep(1000);
    await capture(page, '02_race_selection', 500);

    // 3. Select Human, go to stats
    console.log('[3/10] Character Stats');
    await page.click('.creation-race-card');
    await sleep(300);
    await page.click('.creation-nav-btn.next');
    await sleep(500);
    await capture(page, '03_stat_allocation', 500);

    // 4. Continue through creation to cutscene
    console.log('[4/10] Origin Cutscene');
    await page.click('.creation-nav-btn.next');
    await sleep(300);
    await page.click('.creation-backstory-card');
    await sleep(300);
    await page.click('.creation-nav-btn.next');
    await sleep(300);
    // Name input
    await page.evaluate(() => {
        var inp = document.querySelector('input');
        if (inp) { inp.value = 'Kira'; inp.dispatchEvent(new Event('input')); }
    });
    await sleep(300);
    await page.click('.creation-nav-btn.next');
    await sleep(500);
    // Confirmation screen
    await capture(page, '04_character_confirm', 500);

    // 5. Begin -> Cutscene with artwork
    console.log('[5/10] Cutscene with Art');
    await page.click('.creation-nav-btn.begin');
    await sleep(4000);
    await capture(page, '05_cutscene_art', 0);

    // 6. Skip through cutscene to gameplay
    console.log('[6/10] Gameplay Narrative');
    for (let i = 0; i < 20; i++) {
        await page.evaluate(() => {
            var screen = document.querySelector('.cutscene-screen');
            if (screen) screen.click();
        });
        await sleep(400);
    }
    await sleep(2000);

    // Wait for typewriter then skip
    await page.evaluate(() => {
        if (window.Latency.Typewriter) window.Latency.Typewriter.skip();
    });
    await sleep(1000);
    await capture(page, '06_gameplay_narrative', 0);

    // 7. Open inventory
    console.log('[7/10] Inventory Screen');
    await page.evaluate(() => {
        var btn = document.querySelector('[data-menu-id="inventory"]');
        if (btn) btn.click();
    });
    await sleep(800);
    await capture(page, '07_inventory', 0);

    // 8. Close inventory, open map
    console.log('[8/10] Map Screen');
    await page.evaluate(() => {
        var btn = document.querySelector('.inv-close-btn');
        if (btn) btn.click();
    });
    await sleep(500);
    await page.evaluate(() => {
        var btn = document.querySelector('[data-menu-id="map"]');
        if (btn) btn.click();
    });
    await sleep(800);
    await capture(page, '08_map', 0);

    // 9. Close map, navigate to combat
    console.log('[9/10] Combat Screen');
    await page.evaluate(() => {
        // Find close/back button
        var btns = document.querySelectorAll('button');
        btns.forEach(function(b) {
            if (b.textContent.includes('BACK') || b.textContent.includes('CLOSE')) b.click();
        });
    });
    await sleep(500);
    // Jump to combat node
    await page.evaluate(() => {
        window.Latency.Narrative.loadNode('shared.prologue.node_017');
    });
    await sleep(3000);
    await capture(page, '09_combat', 0);

    // 10. Attack once for dice roll screenshot
    console.log('[10/10] Combat with Dice Roll');
    await page.evaluate(() => {
        var btns = document.querySelectorAll('button');
        btns.forEach(function(b) { if (b.textContent.trim() === 'ATTACK') b.click(); });
    });
    await sleep(1500);
    await capture(page, '10_combat_dice', 0);

    await browser.close();

    console.log('');
    console.log('Done! Screenshots saved to: ' + SCREENSHOT_DIR);
    console.log('');
    console.log('Review and pick the best 5-10 for your Steam store page.');
    console.log('Required size: 1920x1080 (already captured at this resolution).');
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
