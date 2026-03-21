/**
 * LATENCY Build Script
 * Copies game files to build/, obfuscates JS, minifies CSS/HTML.
 * Run with: node scripts/build.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'build');
const SRC_JS = path.join(ROOT, 'js');
const SRC_CSS = path.join(ROOT, 'css');
const SRC_STORY = path.join(ROOT, 'story');
const SRC_ASSETS = path.join(ROOT, 'assets');
const SRC_HTML = path.join(ROOT, 'index.html');

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function rmrf(dir) {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

function mkdirp(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest) {
    mkdirp(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function findFiles(dir, ext) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...findFiles(fullPath, ext));
        } else if (entry.name.endsWith(ext)) {
            results.push(fullPath);
        }
    }
    return results;
}

// ──────────────────────────────────────────────
// Build steps
// ──────────────────────────────────────────────

console.log('╔══════════════════════════════════════════╗');
console.log('║   LATENCY - Production Build             ║');
console.log('╚══════════════════════════════════════════╝');
console.log('');

// Step 1: Clean
console.log('[1/6] Cleaning build directory...');
rmrf(BUILD);
mkdirp(BUILD);

// Step 2: Copy assets (images, audio, ascii art)
console.log('[2/6] Copying assets...');
if (fs.existsSync(SRC_ASSETS)) {
    copyDir(SRC_ASSETS, path.join(BUILD, 'assets'));
}

// Step 3: Copy story JSON files
console.log('[3/6] Copying story files...');
if (fs.existsSync(SRC_STORY)) {
    copyDir(SRC_STORY, path.join(BUILD, 'story'));
}

// Step 4: Obfuscate JavaScript
console.log('[4/6] Obfuscating JavaScript...');
const jsFiles = findFiles(SRC_JS, '.js');
let obfuscatedCount = 0;

// Load obfuscator
let JavaScriptObfuscator;
try {
    JavaScriptObfuscator = require('javascript-obfuscator');
} catch (e) {
    console.error('  ERROR: javascript-obfuscator not installed. Run: npm install');
    process.exit(1);
}

const obfuscatorOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.2,
    debugProtection: true,
    debugProtectionInterval: 2000,
    disableConsoleOutput: false, // Keep console for debugging crash reports
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false, // Keep window.Latency.* accessible (modules depend on it)
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
};

for (const srcFile of jsFiles) {
    const relPath = path.relative(SRC_JS, srcFile);
    const destFile = path.join(BUILD, 'js', relPath);
    mkdirp(path.dirname(destFile));

    const code = fs.readFileSync(srcFile, 'utf8');

    // Skip data files (JSON-like JS) — just minify, don't obfuscate
    // These contain story data, enemy stats, etc. that break if variable names change
    const isDataFile = relPath.startsWith('data' + path.sep) || relPath.startsWith('data/');

    if (isDataFile) {
        // For data files, use terser for simple minification
        try {
            const { minify } = require('terser');
            minify(code, { compress: true, mangle: false }).then(result => {
                fs.writeFileSync(destFile, result.code || code);
            });
        } catch (e) {
            // Fallback: just copy
            fs.writeFileSync(destFile, code);
        }
    } else {
        // Full obfuscation for engine, systems, screens, UI code
        try {
            const result = JavaScriptObfuscator.obfuscate(code, obfuscatorOptions);
            fs.writeFileSync(destFile, result.getObfuscatedCode());
            obfuscatedCount++;
        } catch (e) {
            console.error('  WARNING: Failed to obfuscate ' + relPath + ': ' + e.message);
            // Fallback: copy unobfuscated
            fs.writeFileSync(destFile, code);
        }
    }
}
console.log('  Obfuscated ' + obfuscatedCount + ' JS files (' + jsFiles.length + ' total)');

// Step 5: Minify CSS
console.log('[5/6] Minifying CSS...');
const cssFiles = findFiles(SRC_CSS, '.css');
let cssCount = 0;

for (const srcFile of cssFiles) {
    const relPath = path.relative(SRC_CSS, srcFile);
    const destFile = path.join(BUILD, 'css', relPath);
    mkdirp(path.dirname(destFile));

    let css = fs.readFileSync(srcFile, 'utf8');
    // Simple CSS minification: remove comments, collapse whitespace
    css = css
        .replace(/\/\*[\s\S]*?\*\//g, '')  // Remove comments
        .replace(/\s+/g, ' ')               // Collapse whitespace
        .replace(/\s*([{}:;,>+~])\s*/g, '$1') // Remove space around operators
        .replace(/;}/g, '}')                // Remove last semicolon
        .trim();
    fs.writeFileSync(destFile, css);
    cssCount++;
}
console.log('  Minified ' + cssCount + ' CSS files');

// Step 6: Process HTML
console.log('[6/6] Processing index.html...');
let html = fs.readFileSync(SRC_HTML, 'utf8');

// Remove cache-busting query strings (not needed in packaged app)
html = html.replace(/\?v=\d+/g, '');

// Add anti-inspection meta
html = html.replace('</head>',
    '  <meta http-equiv="Content-Security-Policy" content="default-src \'self\'; style-src \'self\' \'unsafe-inline\'; script-src \'self\'; img-src \'self\' data:; media-src \'self\'; font-src \'self\';">\n  </head>'
);

fs.writeFileSync(path.join(BUILD, 'index.html'), html);

console.log('');
console.log('══════════════════════════════════════════');
console.log('  Build complete!');
console.log('  Output: ' + BUILD);
console.log('  JS files: ' + jsFiles.length + ' (' + obfuscatedCount + ' obfuscated)');
console.log('  CSS files: ' + cssCount + ' (minified)');
console.log('══════════════════════════════════════════');
