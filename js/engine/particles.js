/**
 * LATENCY - Particles
 * ============================================================
 * Ambient particle effects rendered on the #particle-canvas element.
 * Provides atmospheric visual overlays that change based on the
 * current screen or location.
 *
 * Depends on: Latency.EventBus
 *
 * Modes:
 *   menu        - Slow falling green characters (subtle digital rain)
 *   slum        - Falling rain drops (thin white lines)
 *   combat      - Red sparks flying outward from center
 *   highcity    - Floating golden motes rising upward
 *   underground - Dim blue floating particles
 *   void        - Purple swirling vortex particles
 *
 * Usage:
 *   Latency.Particles.init();          // binds to #particle-canvas
 *   Latency.Particles.setMode('menu'); // switch effect
 *   Latency.Particles.stop();          // pause rendering
 *   Latency.Particles.start();         // resume rendering
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.Particles = (function () {
    'use strict';

    // -------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------

    var MAX_PARTICLES = 100;
    var SPAWN_RATE    = 3;          // particles spawned per frame (max)
    var CHAR_SET      = '01アイウエオカキクケコサシスセソ';

    // -------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------

    /** @type {HTMLCanvasElement|null} */
    var _canvas  = null;
    /** @type {CanvasRenderingContext2D|null} */
    var _ctx     = null;
    var _running = false;
    var _rafId   = null;
    var _mode    = 'menu';
    var _width   = 0;
    var _height  = 0;

    /** @type {Array<Object>} */
    var _particles = [];

    // -------------------------------------------------------------------
    // Mode configurations
    // -------------------------------------------------------------------

    var _modes = {
        menu: {
            color: 'rgba(0, 255, 70, 0.6)',
            type: 'char',
            speed: { min: 0.3, max: 1.2 },
            size: { min: 10, max: 16 },
            direction: 'down',
            spawnRate: 2
        },
        slum: {
            color: 'rgba(200, 210, 220, 0.4)',
            type: 'line',
            speed: { min: 4, max: 8 },
            size: { min: 8, max: 20 },
            direction: 'down',
            spawnRate: 3
        },
        combat: {
            color: 'rgba(255, 60, 30, 0.7)',
            type: 'dot',
            speed: { min: 1.5, max: 4 },
            size: { min: 1.5, max: 3.5 },
            direction: 'outward',
            spawnRate: 3
        },
        highcity: {
            color: 'rgba(255, 210, 80, 0.5)',
            type: 'dot',
            speed: { min: 0.3, max: 1.0 },
            size: { min: 1, max: 3 },
            direction: 'up',
            spawnRate: 2
        },
        underground: {
            color: 'rgba(60, 120, 220, 0.35)',
            type: 'dot',
            speed: { min: 0.15, max: 0.6 },
            size: { min: 1.5, max: 3 },
            direction: 'float',
            spawnRate: 1
        },
        void: {
            color: 'rgba(160, 60, 255, 0.55)',
            type: 'dot',
            speed: { min: 0.5, max: 2 },
            size: { min: 1, max: 3 },
            direction: 'vortex',
            spawnRate: 2
        }
    };

    // -------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randomChar() {
        return CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)];
    }

    // -------------------------------------------------------------------
    // Particle creation
    // -------------------------------------------------------------------

    function createParticle() {
        var cfg = _modes[_mode] || _modes.menu;
        var p = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            size: rand(cfg.size.min, cfg.size.max),
            alpha: rand(0.3, 1),
            life: 1,
            decay: rand(0.001, 0.006),
            type: cfg.type,
            color: cfg.color,
            char: cfg.type === 'char' ? randomChar() : null,
            angle: 0
        };

        var speed = rand(cfg.speed.min, cfg.speed.max);

        switch (cfg.direction) {
            case 'down':
                p.x = rand(0, _width);
                p.y = -p.size;
                p.vx = rand(-0.2, 0.2);
                p.vy = speed;
                break;

            case 'up':
                p.x = rand(0, _width);
                p.y = _height + p.size;
                p.vx = rand(-0.3, 0.3);
                p.vy = -speed;
                break;

            case 'outward':
                p.x = _width / 2 + rand(-40, 40);
                p.y = _height / 2 + rand(-40, 40);
                p.angle = rand(0, Math.PI * 2);
                p.vx = Math.cos(p.angle) * speed;
                p.vy = Math.sin(p.angle) * speed;
                p.decay = rand(0.008, 0.02);
                break;

            case 'float':
                p.x = rand(0, _width);
                p.y = rand(0, _height);
                p.angle = rand(0, Math.PI * 2);
                p.vx = Math.cos(p.angle) * speed;
                p.vy = Math.sin(p.angle) * speed;
                p.decay = rand(0.001, 0.004);
                break;

            case 'vortex':
                p.angle = rand(0, Math.PI * 2);
                var radius = rand(50, Math.min(_width, _height) * 0.4);
                p.x = _width / 2 + Math.cos(p.angle) * radius;
                p.y = _height / 2 + Math.sin(p.angle) * radius;
                p.vx = 0; // updated each frame
                p.vy = 0;
                p._radius = radius;
                p._angularSpeed = speed * 0.01;
                p._drift = rand(-0.3, -0.1); // spiral inward
                p.decay = rand(0.002, 0.006);
                break;
        }

        return p;
    }

    // -------------------------------------------------------------------
    // Update logic
    // -------------------------------------------------------------------

    function updateParticle(p) {
        var cfg = _modes[_mode] || _modes.menu;

        if (cfg.direction === 'vortex') {
            p.angle += p._angularSpeed;
            p._radius += p._drift;
            p.x = _width / 2 + Math.cos(p.angle) * p._radius;
            p.y = _height / 2 + Math.sin(p.angle) * p._radius;
            if (p._radius < 5) p.life = 0;
        } else if (cfg.direction === 'float') {
            // gentle sine wave drift
            p.x += p.vx + Math.sin(p.y * 0.01) * 0.15;
            p.y += p.vy;
        } else {
            p.x += p.vx;
            p.y += p.vy;
        }

        p.life -= p.decay;

        // Off-screen check
        if (p.x < -20 || p.x > _width + 20 || p.y < -20 || p.y > _height + 20) {
            p.life = 0;
        }
    }

    // -------------------------------------------------------------------
    // Render logic
    // -------------------------------------------------------------------

    function drawParticle(p) {
        var alpha = p.life * p.alpha;
        if (alpha <= 0) return;

        _ctx.globalAlpha = alpha;

        switch (p.type) {
            case 'char':
                _ctx.fillStyle = p.color;
                _ctx.font = Math.round(p.size) + 'px monospace';
                _ctx.fillText(p.char, p.x, p.y);
                break;

            case 'line':
                _ctx.strokeStyle = p.color;
                _ctx.lineWidth = 1;
                _ctx.beginPath();
                _ctx.moveTo(p.x, p.y);
                _ctx.lineTo(p.x + p.vx * 0.5, p.y + p.size);
                _ctx.stroke();
                break;

            case 'dot':
                _ctx.fillStyle = p.color;
                _ctx.beginPath();
                _ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                _ctx.fill();
                break;
        }
    }

    // -------------------------------------------------------------------
    // Main loop
    // -------------------------------------------------------------------

    function loop() {
        if (!_running) return;

        _ctx.clearRect(0, 0, _width, _height);

        var cfg = _modes[_mode] || _modes.menu;

        // Spawn new particles
        if (_particles.length < MAX_PARTICLES) {
            var toSpawn = Math.min(cfg.spawnRate || SPAWN_RATE,
                                    MAX_PARTICLES - _particles.length);
            for (var s = 0; s < toSpawn; s++) {
                _particles.push(createParticle());
            }
        }

        // Update and draw
        var alive = [];
        for (var i = 0; i < _particles.length; i++) {
            var p = _particles[i];
            updateParticle(p);
            if (p.life > 0) {
                drawParticle(p);
                alive.push(p);
            }
        }
        _particles = alive;

        _ctx.globalAlpha = 1;
        _rafId = requestAnimationFrame(loop);
    }

    // -------------------------------------------------------------------
    // Resize handler
    // -------------------------------------------------------------------

    function resize() {
        if (!_canvas) return;
        _width  = window.innerWidth;
        _height = window.innerHeight;
        _canvas.width  = _width;
        _canvas.height = _height;
    }

    // -------------------------------------------------------------------
    // Event listeners
    // -------------------------------------------------------------------

    /** Map screen names to particle modes. */
    var _screenToMode = {
        menu:      'menu',
        creation:  'menu',
        gameplay:  'slum',
        combat:    'combat',
        inventory: 'slum',
        skills:    'slum',
        map:       'slum',
        cutscene:  'menu'
    };

    function onScreenChange(data) {
        if (!data || !data.screen) return;
        var mapped = _screenToMode[data.screen] || 'menu';
        setMode(mapped);
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    function init() {
        _canvas = document.getElementById('particle-canvas');
        if (!_canvas) {
            console.warn('[Particles] #particle-canvas not found.');
            return;
        }
        _ctx = _canvas.getContext('2d');

        resize();
        window.addEventListener('resize', resize);

        // Listen for screen changes
        if (window.Latency.EventBus) {
            window.Latency.EventBus.on('screen:change', onScreenChange);
        }

        start();
    }

    function setMode(mode) {
        if (!_modes[mode]) {
            console.warn('[Particles] Unknown mode: ' + mode + ', defaulting to menu.');
            mode = 'menu';
        }
        if (mode === _mode) return;
        _mode = mode;
        // Clear existing particles for an immediate transition
        _particles = [];
    }

    function start() {
        if (_running) return;
        _running = true;
        _rafId = requestAnimationFrame(loop);
    }

    function stop() {
        _running = false;
        if (_rafId) {
            cancelAnimationFrame(_rafId);
            _rafId = null;
        }
        // Clear the canvas
        if (_ctx) {
            _ctx.clearRect(0, 0, _width, _height);
        }
    }

    function getMode() {
        return _mode;
    }

    function isRunning() {
        return _running;
    }

    return {
        init:      init,
        setMode:   setMode,
        start:     start,
        stop:      stop,
        getMode:   getMode,
        isRunning: isRunning
    };

})();
