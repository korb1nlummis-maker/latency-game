/**
 * LATENCY - Cinematic Renderer
 * ============================================================
 * Canvas-based animated background effects for cutscene screens.
 * Renders atmospheric particle effects behind narrative text to
 * create mood-appropriate visual ambiance.
 *
 * Supported effects:
 *   rain       — Falling raindrops with splash, cyan-tinted
 *   datastream — Matrix-style falling characters, green phosphor
 *   embers     — Floating embers drifting upward, orange/red
 *   snow       — Gentle falling snowflakes, varying sizes
 *   sparks     — Electric arcs across the screen
 *   fog        — Drifting mist layers, semi-transparent
 *   void       — Spiraling dark-purple particles
 *   neon       — Pulsing colored light glows
 *   smoke      — Rising smoke wisps, dark gray
 *   stars      — Twinkling starfield for night scenes
 *
 * API:
 *   CinematicRenderer.init(canvas)
 *   CinematicRenderer.setEffect(name, opts)
 *   CinematicRenderer.stop()
 *   CinematicRenderer.destroy()
 * ============================================================
 */

window.Latency = window.Latency || {};

window.Latency.CinematicRenderer = (function () {
    'use strict';

    // --------------------------------------------------------
    // Private state
    // --------------------------------------------------------
    var _canvas = null;
    var _ctx = null;
    var _animFrameId = null;
    var _particles = [];
    var _activeEffect = null;
    var _effectOptions = {};
    var _width = 0;
    var _height = 0;
    var _time = 0;
    var _lastTime = 0;
    var _resizeHandler = null;
    var _initialized = false;

    // Fog state
    var _fogLayers = [];

    // Neon state
    var _neonPulses = [];

    // Sparks state
    var _sparkArcs = [];
    var _sparkTimer = 0;

    // Stars state — persistent so they twinkle stably
    var _stars = [];

    // DataStream columns
    var _dataColumns = [];

    // --------------------------------------------------------
    // Utility
    // --------------------------------------------------------
    function _rand(min, max) {
        return min + Math.random() * (max - min);
    }

    function _randInt(min, max) {
        return Math.floor(_rand(min, max + 1));
    }

    function _hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }

    function _resize() {
        if (!_canvas || !_canvas.parentElement) return;
        var rect = _canvas.parentElement.getBoundingClientRect();
        _width = rect.width;
        _height = rect.height;
        _canvas.width = _width;
        _canvas.height = _height;
    }

    // --------------------------------------------------------
    // Particle factory
    // --------------------------------------------------------
    function _createParticle(type) {
        var p = {
            type: type,
            x: 0, y: 0,
            vx: 0, vy: 0,
            life: 1,
            maxLife: 1,
            size: 1,
            alpha: 1,
            color: '#ffffff',
            phase: 0
        };
        return p;
    }

    // --------------------------------------------------------
    // RAIN effect
    // --------------------------------------------------------
    function _spawnRain(intensity) {
        var color = _effectOptions.color || '#00d4ff';
        var count = Math.floor(3 + intensity * 8);
        for (var i = 0; i < count; i++) {
            var p = _createParticle('rain');
            p.x = _rand(-50, _width + 50);
            p.y = _rand(-100, -10);
            var speed = _rand(400, 900) * (0.5 + intensity * 0.5);
            var wind = _rand(-30, -80);
            p.vx = wind;
            p.vy = speed;
            p.size = _rand(1, 2.5);
            p.length = _rand(12, 30) * (0.5 + intensity * 0.5);
            p.color = color;
            p.alpha = _rand(0.3, 0.8);
            p.life = 1;
            p.maxLife = 1;
            p.splashed = false;
            _particles.push(p);
        }
    }

    function _updateRain(p, dt) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.y > _height - 20 && !p.splashed) {
            p.splashed = true;
            // Spawn splash particles
            for (var i = 0; i < 3; i++) {
                var sp = _createParticle('rainsplash');
                sp.x = p.x;
                sp.y = _height - _rand(5, 20);
                sp.vx = _rand(-60, 60);
                sp.vy = _rand(-80, -30);
                sp.life = 1;
                sp.maxLife = _rand(0.2, 0.4);
                sp.size = _rand(1, 2);
                sp.color = p.color;
                sp.alpha = 0.6;
                _particles.push(sp);
            }
        }

        return p.y < _height + 50;
    }

    function _drawRain(p) {
        _ctx.strokeStyle = p.color;
        _ctx.globalAlpha = p.alpha;
        _ctx.lineWidth = p.size;
        _ctx.beginPath();
        var dx = p.vx * 0.02;
        var dy = p.vy * 0.02;
        var len = p.length;
        var nx = dx / Math.sqrt(dx * dx + dy * dy);
        var ny = dy / Math.sqrt(dx * dx + dy * dy);
        _ctx.moveTo(p.x, p.y);
        _ctx.lineTo(p.x + nx * len, p.y + ny * len);
        _ctx.stroke();
    }

    function _updateRainSplash(p, dt) {
        p.vx *= 0.95;
        p.vy += 200 * dt; // gravity
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt / p.maxLife;
        p.alpha = Math.max(0, p.life * 0.6);
        return p.life > 0;
    }

    function _drawRainSplash(p) {
        _ctx.fillStyle = p.color;
        _ctx.globalAlpha = p.alpha;
        _ctx.beginPath();
        _ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        _ctx.fill();
    }

    // --------------------------------------------------------
    // DATASTREAM effect (Matrix-style)
    // --------------------------------------------------------
    var _dataChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ';

    function _initDataStream(intensity) {
        _dataColumns = [];
        var colWidth = 20;
        var cols = Math.floor(_width / colWidth);
        var activeCount = Math.floor(cols * (0.15 + intensity * 0.35));
        var indices = [];
        for (var i = 0; i < cols; i++) indices.push(i);
        // Shuffle and pick
        for (var j = indices.length - 1; j > 0; j--) {
            var k = _randInt(0, j);
            var tmp = indices[j]; indices[j] = indices[k]; indices[k] = tmp;
        }
        var color = _effectOptions.color || '#00ff41';
        for (var c = 0; c < activeCount; c++) {
            _dataColumns.push({
                x: indices[c] * colWidth + colWidth / 2,
                y: _rand(-_height, 0),
                speed: _rand(80, 250) * (0.5 + intensity * 0.5),
                chars: [],
                charCount: _randInt(8, 25),
                color: color,
                spacing: _rand(16, 22),
                lastCharTime: 0,
                charInterval: _rand(0.04, 0.1)
            });
        }
    }

    function _updateDataStream(dt, intensity) {
        var color = _effectOptions.color || '#00ff41';
        var rgb = _hexToRgb(color);

        for (var i = 0; i < _dataColumns.length; i++) {
            var col = _dataColumns[i];
            col.y += col.speed * dt;
            col.lastCharTime += dt;

            if (col.lastCharTime >= col.charInterval) {
                col.lastCharTime = 0;
                col.chars.push({
                    ch: _dataChars[_randInt(0, _dataChars.length - 1)],
                    y: col.y,
                    alpha: 1,
                    bright: Math.random() < 0.1
                });
                if (col.chars.length > col.charCount) {
                    col.chars.shift();
                }
            }

            // Draw column
            for (var j = 0; j < col.chars.length; j++) {
                var ch = col.chars[j];
                var fade = j / col.chars.length;
                var a = fade * (0.4 + intensity * 0.6);
                if (ch.bright) a = 1;

                _ctx.globalAlpha = a;
                if (j === col.chars.length - 1) {
                    // Head character — bright white-green
                    _ctx.fillStyle = '#ffffff';
                    _ctx.shadowColor = color;
                    _ctx.shadowBlur = 12;
                } else {
                    _ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + a + ')';
                    _ctx.shadowColor = color;
                    _ctx.shadowBlur = 4;
                }
                _ctx.font = '14px monospace';
                _ctx.fillText(ch.ch, col.x, ch.y);
            }
            _ctx.shadowBlur = 0;

            // Reset column when it goes off screen
            if (col.y > _height + col.charCount * col.spacing) {
                col.y = _rand(-200, -50);
                col.chars = [];
                col.speed = _rand(80, 250) * (0.5 + intensity * 0.5);
            }
        }
    }

    // --------------------------------------------------------
    // EMBERS effect
    // --------------------------------------------------------
    function _spawnEmbers(intensity) {
        var count = Math.floor(1 + intensity * 3);
        var color = _effectOptions.color || '#ff6a00';
        for (var i = 0; i < count; i++) {
            var p = _createParticle('ember');
            p.x = _rand(0, _width);
            p.y = _height + _rand(10, 50);
            p.vx = _rand(-20, 20);
            p.vy = _rand(-100, -40) * (0.5 + intensity * 0.5);
            p.size = _rand(1.5, 4);
            p.life = 1;
            p.maxLife = _rand(2, 5);
            p.color = color;
            p.alpha = _rand(0.6, 1);
            p.phase = _rand(0, Math.PI * 2);
            p.wobbleSpeed = _rand(1.5, 4);
            p.wobbleAmp = _rand(15, 40);
            _particles.push(p);
        }
    }

    function _updateEmber(p, dt) {
        p.phase += p.wobbleSpeed * dt;
        p.x += (p.vx + Math.sin(p.phase) * p.wobbleAmp) * dt;
        p.y += p.vy * dt;
        p.life -= dt / p.maxLife;
        p.alpha = Math.max(0, p.life * 0.9);
        p.size *= (1 - dt * 0.15);
        return p.life > 0 && p.y > -50;
    }

    function _drawEmber(p) {
        var rgb = _hexToRgb(p.color);
        _ctx.globalAlpha = p.alpha;
        _ctx.shadowColor = p.color;
        _ctx.shadowBlur = 10 + p.size * 3;

        // Core
        _ctx.fillStyle = 'rgba(255,255,' + Math.floor(150 + p.life * 105) + ',' + p.alpha + ')';
        _ctx.beginPath();
        _ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        _ctx.fill();

        // Outer glow
        _ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (p.alpha * 0.4) + ')';
        _ctx.beginPath();
        _ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        _ctx.fill();

        _ctx.shadowBlur = 0;
    }

    // --------------------------------------------------------
    // SNOW effect
    // --------------------------------------------------------
    function _spawnSnow(intensity) {
        var count = Math.floor(1 + intensity * 3);
        var color = _effectOptions.color || '#e0e8ff';
        for (var i = 0; i < count; i++) {
            var p = _createParticle('snow');
            p.x = _rand(-20, _width + 20);
            p.y = _rand(-30, -5);
            p.vx = _rand(-15, 15);
            p.vy = _rand(30, 80) * (0.4 + intensity * 0.6);
            p.size = _rand(1.5, 5);
            p.color = color;
            p.alpha = _rand(0.4, 0.9);
            p.phase = _rand(0, Math.PI * 2);
            p.wobbleSpeed = _rand(0.5, 2);
            p.wobbleAmp = _rand(20, 50);
            p.life = 1;
            p.maxLife = 1;
            _particles.push(p);
        }
    }

    function _updateSnow(p, dt) {
        p.phase += p.wobbleSpeed * dt;
        p.x += (p.vx + Math.sin(p.phase) * p.wobbleAmp) * dt;
        p.y += p.vy * dt;
        // Fade near bottom
        if (p.y > _height - 50) {
            p.alpha *= (1 - dt * 2);
        }
        return p.y < _height + 20 && p.alpha > 0.01;
    }

    function _drawSnow(p) {
        _ctx.globalAlpha = p.alpha;
        _ctx.fillStyle = p.color;
        _ctx.shadowColor = '#ffffff';
        _ctx.shadowBlur = p.size * 2;
        _ctx.beginPath();
        _ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.shadowBlur = 0;
    }

    // --------------------------------------------------------
    // SPARKS effect
    // --------------------------------------------------------
    function _updateSparks(dt, intensity) {
        _sparkTimer -= dt;

        // Spawn new arc intermittently
        if (_sparkTimer <= 0) {
            _sparkTimer = _rand(0.3, 2.0) / (0.3 + intensity * 0.7);
            var color = _effectOptions.color || '#88ccff';
            var arc = {
                points: [],
                life: _rand(0.1, 0.3),
                maxLife: _rand(0.1, 0.3),
                color: color,
                width: _rand(1, 3)
            };

            // Generate jagged arc path
            var startX = _rand(0, _width);
            var startY = _rand(0, _height);
            var endX = startX + _rand(-200, 200);
            var endY = startY + _rand(-200, 200);
            var segments = _randInt(5, 12);
            for (var i = 0; i <= segments; i++) {
                var t = i / segments;
                var baseX = startX + (endX - startX) * t;
                var baseY = startY + (endY - startY) * t;
                if (i > 0 && i < segments) {
                    baseX += _rand(-30, 30);
                    baseY += _rand(-30, 30);
                }
                arc.points.push({ x: baseX, y: baseY });
            }
            arc.life = arc.maxLife;
            _sparkArcs.push(arc);

            // Spawn spark particles at arc endpoints
            for (var s = 0; s < 5; s++) {
                var sp = _createParticle('sparkdot');
                var pt = arc.points[_randInt(0, arc.points.length - 1)];
                sp.x = pt.x;
                sp.y = pt.y;
                sp.vx = _rand(-150, 150);
                sp.vy = _rand(-150, 150);
                sp.life = 1;
                sp.maxLife = _rand(0.2, 0.5);
                sp.size = _rand(1, 3);
                sp.color = color;
                sp.alpha = 1;
                _particles.push(sp);
            }
        }

        // Draw arcs
        for (var a = _sparkArcs.length - 1; a >= 0; a--) {
            var arc2 = _sparkArcs[a];
            arc2.life -= dt;
            if (arc2.life <= 0) {
                _sparkArcs.splice(a, 1);
                continue;
            }

            var alpha = arc2.life / arc2.maxLife;
            var rgb = _hexToRgb(arc2.color);
            _ctx.globalAlpha = alpha;
            _ctx.strokeStyle = arc2.color;
            _ctx.lineWidth = arc2.width;
            _ctx.shadowColor = arc2.color;
            _ctx.shadowBlur = 15;
            _ctx.beginPath();
            _ctx.moveTo(arc2.points[0].x, arc2.points[0].y);
            for (var j = 1; j < arc2.points.length; j++) {
                _ctx.lineTo(arc2.points[j].x, arc2.points[j].y);
            }
            _ctx.stroke();

            // Bright core
            _ctx.globalAlpha = alpha * 0.5;
            _ctx.strokeStyle = '#ffffff';
            _ctx.lineWidth = arc2.width * 0.5;
            _ctx.beginPath();
            _ctx.moveTo(arc2.points[0].x, arc2.points[0].y);
            for (var j2 = 1; j2 < arc2.points.length; j2++) {
                _ctx.lineTo(arc2.points[j2].x, arc2.points[j2].y);
            }
            _ctx.stroke();
            _ctx.shadowBlur = 0;
        }
    }

    function _updateSparkDot(p, dt) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= dt / p.maxLife;
        p.alpha = Math.max(0, p.life);
        return p.life > 0;
    }

    function _drawSparkDot(p) {
        _ctx.globalAlpha = p.alpha;
        _ctx.fillStyle = p.color;
        _ctx.shadowColor = p.color;
        _ctx.shadowBlur = 8;
        _ctx.beginPath();
        _ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.shadowBlur = 0;
    }

    // --------------------------------------------------------
    // FOG effect
    // --------------------------------------------------------
    function _initFog(intensity) {
        _fogLayers = [];
        var layerCount = 3 + Math.floor(intensity * 3);
        var color = _effectOptions.color || '#667788';
        var rgb = _hexToRgb(color);

        for (var i = 0; i < layerCount; i++) {
            _fogLayers.push({
                x: _rand(-200, _width),
                y: _rand(_height * 0.3, _height),
                width: _rand(300, 700),
                height: _rand(80, 200),
                speed: _rand(-30, 30) * (0.3 + intensity * 0.7),
                alpha: _rand(0.03, 0.1) * (0.5 + intensity * 0.5),
                phase: _rand(0, Math.PI * 2),
                pulseSpeed: _rand(0.2, 0.6),
                rgb: rgb
            });
        }
    }

    function _updateFog(dt) {
        for (var i = 0; i < _fogLayers.length; i++) {
            var f = _fogLayers[i];
            f.x += f.speed * dt;
            f.phase += f.pulseSpeed * dt;

            // Wrap horizontally
            if (f.speed > 0 && f.x > _width + 100) f.x = -f.width - 50;
            if (f.speed < 0 && f.x < -f.width - 100) f.x = _width + 50;

            var pulsedAlpha = f.alpha * (0.7 + 0.3 * Math.sin(f.phase));

            _ctx.globalAlpha = pulsedAlpha;
            var grad = _ctx.createRadialGradient(
                f.x + f.width / 2, f.y + f.height / 2, 0,
                f.x + f.width / 2, f.y + f.height / 2, f.width / 2
            );
            grad.addColorStop(0, 'rgba(' + f.rgb.r + ',' + f.rgb.g + ',' + f.rgb.b + ',' + pulsedAlpha + ')');
            grad.addColorStop(1, 'rgba(' + f.rgb.r + ',' + f.rgb.g + ',' + f.rgb.b + ',0)');
            _ctx.fillStyle = grad;
            _ctx.fillRect(f.x, f.y, f.width, f.height);
        }
    }

    // --------------------------------------------------------
    // VOID effect
    // --------------------------------------------------------
    function _spawnVoid(intensity) {
        var count = Math.floor(1 + intensity * 3);
        var color = _effectOptions.color || '#8833cc';
        var cx = _width / 2;
        var cy = _height / 2;

        for (var i = 0; i < count; i++) {
            var p = _createParticle('void');
            var angle = _rand(0, Math.PI * 2);
            var dist = _rand(200, Math.max(_width, _height) * 0.7);
            p.x = cx + Math.cos(angle) * dist;
            p.y = cy + Math.sin(angle) * dist;
            p.angle = angle;
            p.dist = dist;
            p.angularSpeed = _rand(0.2, 0.6) * (Math.random() < 0.5 ? 1 : -1);
            p.inwardSpeed = _rand(30, 80) * (0.5 + intensity * 0.5);
            p.size = _rand(1, 4);
            p.color = color;
            p.alpha = _rand(0.3, 0.8);
            p.life = 1;
            p.maxLife = _rand(3, 7);
            p.trail = [];
            _particles.push(p);
        }
    }

    function _updateVoid(p, dt) {
        var cx = _width / 2;
        var cy = _height / 2;

        p.angle += p.angularSpeed * dt;
        p.dist -= p.inwardSpeed * dt;
        p.x = cx + Math.cos(p.angle) * p.dist;
        p.y = cy + Math.sin(p.angle) * p.dist;

        // Track trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.shift();

        p.life -= dt / p.maxLife;
        p.alpha = Math.max(0, p.life * 0.8);

        return p.dist > 5 && p.life > 0;
    }

    function _drawVoid(p) {
        var rgb = _hexToRgb(p.color);

        // Draw trail
        for (var i = 0; i < p.trail.length; i++) {
            var t = i / p.trail.length;
            _ctx.globalAlpha = t * p.alpha * 0.3;
            _ctx.fillStyle = p.color;
            _ctx.beginPath();
            _ctx.arc(p.trail[i].x, p.trail[i].y, p.size * t, 0, Math.PI * 2);
            _ctx.fill();
        }

        // Core particle
        _ctx.globalAlpha = p.alpha;
        _ctx.fillStyle = '#ddaaff';
        _ctx.shadowColor = p.color;
        _ctx.shadowBlur = 12;
        _ctx.beginPath();
        _ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        _ctx.fill();
        _ctx.shadowBlur = 0;
    }

    // --------------------------------------------------------
    // NEON effect
    // --------------------------------------------------------
    function _initNeon(intensity) {
        _neonPulses = [];
        var colors = ['#ff0066', '#00ffcc', '#ff9900', '#cc33ff', '#33ccff'];
        var baseColor = _effectOptions.color;
        var count = 3 + Math.floor(intensity * 4);

        for (var i = 0; i < count; i++) {
            var c = baseColor || colors[i % colors.length];
            _neonPulses.push({
                x: _rand(0, _width),
                y: _rand(0, _height),
                radius: _rand(60, 200),
                color: c,
                rgb: _hexToRgb(c),
                phase: _rand(0, Math.PI * 2),
                speed: _rand(0.3, 1.2),
                driftX: _rand(-20, 20),
                driftY: _rand(-20, 20),
                baseAlpha: _rand(0.04, 0.12) * (0.5 + intensity * 0.5)
            });
        }
    }

    function _updateNeon(dt) {
        for (var i = 0; i < _neonPulses.length; i++) {
            var n = _neonPulses[i];
            n.phase += n.speed * dt;
            n.x += n.driftX * dt;
            n.y += n.driftY * dt;

            // Soft wrap
            if (n.x < -n.radius) n.x = _width + n.radius;
            if (n.x > _width + n.radius) n.x = -n.radius;
            if (n.y < -n.radius) n.y = _height + n.radius;
            if (n.y > _height + n.radius) n.y = -n.radius;

            var pulse = 0.5 + 0.5 * Math.sin(n.phase);
            var alpha = n.baseAlpha * pulse;

            _ctx.globalAlpha = alpha;
            var grad = _ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
            grad.addColorStop(0, 'rgba(' + n.rgb.r + ',' + n.rgb.g + ',' + n.rgb.b + ',' + alpha + ')');
            grad.addColorStop(0.5, 'rgba(' + n.rgb.r + ',' + n.rgb.g + ',' + n.rgb.b + ',' + (alpha * 0.4) + ')');
            grad.addColorStop(1, 'rgba(' + n.rgb.r + ',' + n.rgb.g + ',' + n.rgb.b + ',0)');
            _ctx.fillStyle = grad;
            _ctx.beginPath();
            _ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            _ctx.fill();
        }
    }

    // --------------------------------------------------------
    // SMOKE effect
    // --------------------------------------------------------
    function _spawnSmoke(intensity) {
        if (Math.random() > 0.3 + intensity * 0.5) return;
        var color = _effectOptions.color || '#444444';
        var rgb = _hexToRgb(color);

        var p = _createParticle('smoke');
        p.x = _rand(_width * 0.1, _width * 0.9);
        p.y = _height + _rand(20, 60);
        p.vx = _rand(-15, 15);
        p.vy = _rand(-40, -20) * (0.5 + intensity * 0.5);
        p.size = _rand(20, 60);
        p.growRate = _rand(10, 30);
        p.life = 1;
        p.maxLife = _rand(4, 8);
        p.color = color;
        p.rgb = rgb;
        p.alpha = 0;
        p.maxAlpha = _rand(0.05, 0.15) * (0.5 + intensity * 0.5);
        p.phase = _rand(0, Math.PI * 2);
        _particles.push(p);
    }

    function _updateSmoke(p, dt) {
        p.phase += 0.3 * dt;
        p.x += (p.vx + Math.sin(p.phase) * 10) * dt;
        p.y += p.vy * dt;
        p.size += p.growRate * dt;
        p.life -= dt / p.maxLife;

        // Fade in then out
        if (p.life > 0.8) {
            p.alpha = (1 - p.life) / 0.2 * p.maxAlpha;
        } else if (p.life < 0.3) {
            p.alpha = (p.life / 0.3) * p.maxAlpha;
        } else {
            p.alpha = p.maxAlpha;
        }

        return p.life > 0;
    }

    function _drawSmoke(p) {
        _ctx.globalAlpha = p.alpha;
        var grad = _ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, 'rgba(' + p.rgb.r + ',' + p.rgb.g + ',' + p.rgb.b + ',' + p.alpha + ')');
        grad.addColorStop(1, 'rgba(' + p.rgb.r + ',' + p.rgb.g + ',' + p.rgb.b + ',0)');
        _ctx.fillStyle = grad;
        _ctx.beginPath();
        _ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        _ctx.fill();
    }

    // --------------------------------------------------------
    // STARS effect
    // --------------------------------------------------------
    function _initStars(intensity) {
        _stars = [];
        var count = Math.floor(80 + intensity * 200);
        var color = _effectOptions.color || '#ffffff';

        for (var i = 0; i < count; i++) {
            _stars.push({
                x: _rand(0, _width),
                y: _rand(0, _height),
                size: _rand(0.5, 2.5),
                baseAlpha: _rand(0.3, 1),
                phase: _rand(0, Math.PI * 2),
                speed: _rand(0.5, 3),
                color: color,
                twinkleIntensity: _rand(0.2, 0.8)
            });
        }
    }

    function _updateStars(dt) {
        for (var i = 0; i < _stars.length; i++) {
            var s = _stars[i];
            s.phase += s.speed * dt;
            var twinkle = s.baseAlpha * (1 - s.twinkleIntensity * 0.5 + s.twinkleIntensity * 0.5 * Math.sin(s.phase));

            _ctx.globalAlpha = twinkle;
            _ctx.fillStyle = s.color;

            // Bright stars get a glow
            if (s.size > 1.8) {
                _ctx.shadowColor = s.color;
                _ctx.shadowBlur = 6;
            }

            _ctx.beginPath();
            _ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            _ctx.fill();
            _ctx.shadowBlur = 0;

            // Occasional bright flare on largest stars
            if (s.size > 2 && Math.sin(s.phase) > 0.95) {
                _ctx.globalAlpha = twinkle * 0.3;
                _ctx.strokeStyle = s.color;
                _ctx.lineWidth = 0.5;
                // Cross flare
                _ctx.beginPath();
                _ctx.moveTo(s.x - s.size * 3, s.y);
                _ctx.lineTo(s.x + s.size * 3, s.y);
                _ctx.moveTo(s.x, s.y - s.size * 3);
                _ctx.lineTo(s.x, s.y + s.size * 3);
                _ctx.stroke();
            }
        }
    }

    // --------------------------------------------------------
    // Effect initializers
    // --------------------------------------------------------
    function _startEffect(name, opts) {
        _particles = [];
        _sparkArcs = [];
        _sparkTimer = 0;
        _fogLayers = [];
        _neonPulses = [];
        _stars = [];
        _dataColumns = [];
        _activeEffect = name;
        _effectOptions = opts || {};

        var intensity = _effectOptions.intensity !== undefined ? _effectOptions.intensity : 0.6;

        switch (name) {
            case 'fog':
                _initFog(intensity);
                break;
            case 'neon':
                _initNeon(intensity);
                break;
            case 'stars':
                _initStars(intensity);
                break;
            case 'datastream':
                _initDataStream(intensity);
                break;
        }
    }

    // --------------------------------------------------------
    // Main update loop
    // --------------------------------------------------------
    function _update(timestamp) {
        if (!_canvas || !_ctx) return;

        _animFrameId = requestAnimationFrame(_update);

        // Delta time in seconds, clamped to prevent spiral-of-death
        if (_lastTime === 0) _lastTime = timestamp;
        var dt = Math.min((timestamp - _lastTime) / 1000, 0.05);
        _lastTime = timestamp;
        _time += dt;

        if (!_activeEffect) return;

        var intensity = _effectOptions.intensity !== undefined ? _effectOptions.intensity : 0.6;

        // Clear canvas
        _ctx.clearRect(0, 0, _width, _height);

        // Use lighter compositing for glowing effects
        var glowEffects = { rain: 1, embers: 1, sparks: 1, void: 1, neon: 1, stars: 1, datastream: 1 };
        if (glowEffects[_activeEffect]) {
            _ctx.globalCompositeOperation = 'lighter';
        } else {
            _ctx.globalCompositeOperation = 'source-over';
        }

        // Spawn new particles for continuous effects
        switch (_activeEffect) {
            case 'rain':
                _spawnRain(intensity);
                break;
            case 'embers':
                _spawnEmbers(intensity);
                break;
            case 'snow':
                _spawnSnow(intensity);
                break;
            case 'smoke':
                _spawnSmoke(intensity);
                break;
            case 'void':
                _spawnVoid(intensity);
                break;
        }

        // Update effect-specific non-particle systems
        switch (_activeEffect) {
            case 'fog':
                _updateFog(dt);
                break;
            case 'neon':
                _updateNeon(dt);
                break;
            case 'stars':
                _updateStars(dt);
                break;
            case 'sparks':
                _updateSparks(dt, intensity);
                break;
            case 'datastream':
                _updateDataStream(dt, intensity);
                break;
        }

        // Update and draw particles
        for (var i = _particles.length - 1; i >= 0; i--) {
            var p = _particles[i];
            var alive = true;

            switch (p.type) {
                case 'rain':
                    alive = _updateRain(p, dt);
                    if (alive) _drawRain(p);
                    break;
                case 'rainsplash':
                    alive = _updateRainSplash(p, dt);
                    if (alive) _drawRainSplash(p);
                    break;
                case 'ember':
                    alive = _updateEmber(p, dt);
                    if (alive) _drawEmber(p);
                    break;
                case 'snow':
                    alive = _updateSnow(p, dt);
                    if (alive) _drawSnow(p);
                    break;
                case 'sparkdot':
                    alive = _updateSparkDot(p, dt);
                    if (alive) _drawSparkDot(p);
                    break;
                case 'void':
                    alive = _updateVoid(p, dt);
                    if (alive) _drawVoid(p);
                    break;
                case 'smoke':
                    alive = _updateSmoke(p, dt);
                    if (alive) _drawSmoke(p);
                    break;
            }

            if (!alive) {
                _particles.splice(i, 1);
            }
        }

        // Reset composite mode
        _ctx.globalCompositeOperation = 'source-over';
        _ctx.globalAlpha = 1;
    }

    // --------------------------------------------------------
    // Public API
    // --------------------------------------------------------
    return {
        /**
         * Initialize the renderer with a canvas element.
         * @param {HTMLCanvasElement} canvasElement
         */
        init: function (canvasElement) {
            if (_initialized) this.destroy();

            _canvas = canvasElement;
            _ctx = _canvas.getContext('2d');
            _particles = [];
            _activeEffect = null;
            _effectOptions = {};
            _time = 0;
            _lastTime = 0;
            _sparkArcs = [];
            _sparkTimer = 0;
            _fogLayers = [];
            _neonPulses = [];
            _stars = [];
            _dataColumns = [];

            // Size canvas to parent
            _resize();

            // Listen for resize
            _resizeHandler = function () { _resize(); };
            window.addEventListener('resize', _resizeHandler);

            // Start render loop
            _animFrameId = requestAnimationFrame(_update);
            _initialized = true;
        },

        /**
         * Set the active visual effect.
         * @param {string} name - Effect name (rain, datastream, embers, etc.)
         * @param {Object} [opts] - Options { intensity: 0-1, color: '#hex' }
         */
        setEffect: function (name, opts) {
            if (!_initialized) return;
            _startEffect(name, opts);
        },

        /**
         * Stop all effects and clear the canvas.
         */
        stop: function () {
            _activeEffect = null;
            _particles = [];
            _sparkArcs = [];
            _fogLayers = [];
            _neonPulses = [];
            _stars = [];
            _dataColumns = [];
            if (_ctx) {
                _ctx.clearRect(0, 0, _width, _height);
            }
        },

        /**
         * Full cleanup — stop animation, remove listeners, release references.
         */
        destroy: function () {
            this.stop();

            if (_animFrameId) {
                cancelAnimationFrame(_animFrameId);
                _animFrameId = null;
            }

            if (_resizeHandler) {
                window.removeEventListener('resize', _resizeHandler);
                _resizeHandler = null;
            }

            _canvas = null;
            _ctx = null;
            _initialized = false;
        }
    };
})();
