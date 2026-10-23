// Particle Systems: Ambient Petals, Confetti Cannons, Dynamic Fireworks, and Click Sparkles

class ParticleCanvas {
    constructor() {
        this.ambientCanvas = document.getElementById('ambient-canvas');
        this.fireworksCanvas = document.getElementById('fireworks-canvas');
        this.actx = this.ambientCanvas ? this.ambientCanvas.getContext('2d') : null;
        this.fctx = this.fireworksCanvas ? this.fireworksCanvas.getContext('2d') : null;

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.petals = [];
        this.fireflies = [];
        this.hearts = [];
        this.confetti = [];
        this.fireworks = [];
        this.fireworkParticles = [];
        this.clickSparks = [];

        this.currentScene = 1;
        this.isFireworksActive = false;
        this.fireworkTimer = null;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Spawn initial ambient particles
        this.initAmbientParticles();

        // Start render loop
        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);

        // Click sparkle listener
        window.addEventListener('pointerdown', (e) => {
            this.createClickSparkle(e.clientX, e.clientY);
            if (window.fairytaleAudio) {
                window.fairytaleAudio.playSparkle();
            }
        });
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        if (this.ambientCanvas) {
            this.ambientCanvas.width = this.width;
            this.ambientCanvas.height = this.height;
        }
        if (this.fireworksCanvas) {
            this.fireworksCanvas.width = this.width;
            this.fireworksCanvas.height = this.height;
        }
    }

    initAmbientParticles() {
        // Petals for nature/garden scenes
        for (let i = 0; i < 28; i++) {
            this.petals.push(this.createPetal(true));
        }

        // Fireflies / sun dust
        for (let i = 0; i < 35; i++) {
            this.fireflies.push(this.createFirefly());
        }
    }

    createPetal(randomY = false) {
        const colors = [
            'rgba(255, 182, 193, 0.75)', // soft pink
            'rgba(255, 192, 203, 0.8)',  // rose pink
            'rgba(255, 240, 245, 0.85)', // lavender blush
            'rgba(255, 218, 233, 0.7)'   // pastel blush
        ];
        return {
            x: Math.random() * this.width,
            y: randomY ? Math.random() * this.height : -20,
            size: Math.random() * 8 + 6,
            speedY: Math.random() * 1.2 + 0.8,
            speedX: Math.random() * 1.5 - 0.75,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.03,
            color: colors[Math.floor(Math.random() * colors.length)],
            swayAngle: Math.random() * Math.PI * 2,
            swaySpeed: Math.random() * 0.02 + 0.01
        };
    }

    createFirefly() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 3 + 1.5,
            speedX: (Math.random() - 0.5) * 0.6,
            speedY: (Math.random() - 0.5) * 0.6,
            alpha: Math.random(),
            alphaSpeed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
            color: Math.random() > 0.4 ? 'rgba(255, 243, 176,' : 'rgba(216, 180, 254,'
        };
    }

    createHeart(x, y, rising = true) {
        return {
            x: x !== undefined ? x : Math.random() * this.width,
            y: y !== undefined ? y : this.height + 20,
            size: Math.random() * 16 + 10,
            speedY: rising ? -(Math.random() * 1.5 + 1.0) : (Math.random() * 2 - 1),
            speedX: (Math.random() - 0.5) * 1.2,
            scale: Math.random() * 0.6 + 0.7,
            alpha: 1,
            fadeSpeed: Math.random() * 0.008 + 0.004,
            hue: Math.random() > 0.3 ? 340 + Math.random() * 20 : 280 + Math.random() * 30
        };
    }

    createClickSparkle(x, y) {
        const count = 12;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.4;
            const speed = Math.random() * 4 + 2;
            this.clickSparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: `hsl(${Math.random() * 60 + 330}, 100%, 75%)`,
                life: 1,
                decay: Math.random() * 0.03 + 0.02,
                isHeart: Math.random() > 0.6
            });
        }
    }

    // Scene 3 Confetti Cannon
    burstConfetti() {
        const colors = ['#ff758f', '#ffccd5', '#ffd166', '#a8dadc', '#d8b4e2', '#c7f9cc', '#f72585'];
        for (let i = 0; i < 140; i++) {
            const x = Math.random() * this.width;
            const y = -10;
            this.confetti.push({
                x: x,
                y: y,
                w: Math.random() * 10 + 6,
                h: Math.random() * 6 + 4,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 4 + 2.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeedX: Math.random() * 0.1,
                rotSpeedY: Math.random() * 0.1,
                life: 1
            });
        }
    }

    // Scene 5 Fireworks Engine
    startFireworks() {
        if (this.isFireworksActive) return;
        this.isFireworksActive = true;

        const launchRandomFirework = () => {
            if (!this.isFireworksActive) return;

            const startX = Math.random() * (this.width * 0.8) + (this.width * 0.1);
            const targetX = startX + (Math.random() - 0.5) * 150;
            const targetY = Math.random() * (this.height * 0.45) + (this.height * 0.1);
            const isHeartShape = Math.random() > 0.45;

            this.launchRocket(startX, this.height, targetX, targetY, isHeartShape);

            if (window.fairytaleAudio) {
                window.fairytaleAudio.playFireworkSound();
            }

            const nextInterval = Math.random() * 800 + 700;
            this.fireworkTimer = setTimeout(launchRandomFirework, nextInterval);
        };

        // Launch an initial burst
        launchRandomFirework();
        setTimeout(launchRandomFirework, 400);
    }

    stopFireworks() {
        this.isFireworksActive = false;
        if (this.fireworkTimer) clearTimeout(this.fireworkTimer);
    }

    launchRocket(x, y, targetX, targetY, isHeartShape = false) {
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = Math.random() * 3 + 8;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;

        const hues = [340, 320, 280, 45, 180, 20]; // Pink, Magenta, Purple, Gold, Cyan, Coral
        const hue = hues[Math.floor(Math.random() * hues.length)];

        this.fireworks.push({
            x: x,
            y: y,
            targetY: targetY,
            vx: vx,
            vy: vy,
            hue: hue,
            isHeart: isHeartShape,
            trail: []
        });
    }

    explodeFirework(x, y, hue, isHeart) {
        const particleCount = isHeart ? 70 : 85;

        for (let i = 0; i < particleCount; i++) {
            let vx, vy;

            if (isHeart) {
                // Heart shape parametric equation:
                // x = 16 sin^3(t)
                // y = -(13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t))
                const t = (Math.PI * 2 / particleCount) * i;
                const heartX = 16 * Math.pow(Math.sin(t), 3);
                const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                const scale = 0.22 + Math.random() * 0.05;
                vx = heartX * scale;
                vy = heartY * scale;
            } else {
                const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.2;
                const speed = Math.random() * 4.5 + 1.5;
                vx = Math.cos(angle) * speed;
                vy = Math.sin(angle) * speed;
            }

            this.fireworkParticles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                color: `hsl(${hue + (Math.random() * 30 - 15)}, 100%, ${60 + Math.random() * 25}%)`,
                alpha: 1,
                decay: Math.random() * 0.016 + 0.012,
                gravity: 0.06,
                size: Math.random() * 3 + 1.5,
                twinkle: Math.random() > 0.4
            });
        }
    }

    setScene(sceneNum) {
        this.currentScene = sceneNum;
        if (sceneNum === 3) {
            this.burstConfetti();
        }
        if (sceneNum === 5) {
            this.startFireworks();
        } else {
            this.stopFireworks();
        }
    }

    drawHeart(ctx, x, y, size, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.translate(x, y);
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
        ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, (size + topCurveHeight) / 1.4, 0, size);
        ctx.bezierCurveTo(0, (size + topCurveHeight) / 1.4, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
        ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    render() {
        // --- 1. Ambient Canvas Rendering ---
        if (this.actx) {
            this.actx.clearRect(0, 0, this.width, this.height);

            // Petals (Active in scenes 1, 2, 3)
            if (this.currentScene <= 3) {
                for (let i = 0; i < this.petals.length; i++) {
                    const p = this.petals[i];
                    p.y += p.speedY;
                    p.swayAngle += p.swaySpeed;
                    p.x += Math.sin(p.swayAngle) * 0.8 + p.speedX;
                    p.rotation += p.rotSpeed;

                    if (p.y > this.height + 20) {
                        this.petals[i] = this.createPetal();
                    }

                    this.actx.save();
                    this.actx.translate(p.x, p.y);
                    this.actx.rotate(p.rotation);
                    this.actx.fillStyle = p.color;
                    this.actx.beginPath();
                    this.actx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
                    this.actx.fill();
                    this.actx.restore();
                }
            }

            // Fireflies / Magic Dust (Active in all scenes, prominent in 4 & 5)
            for (let i = 0; i < this.fireflies.length; i++) {
                const f = this.fireflies[i];
                f.x += f.speedX;
                f.y += f.speedY;
                f.alpha += f.alphaSpeed;
                if (f.alpha > 0.95 || f.alpha < 0.1) {
                    f.alphaSpeed = -f.alphaSpeed;
                }

                if (f.x < -10) f.x = this.width + 10;
                if (f.x > this.width + 10) f.x = -10;
                if (f.y < -10) f.y = this.height + 10;
                if (f.y > this.height + 10) f.y = -10;

                this.actx.save();
                this.actx.fillStyle = `${f.color} ${Math.max(0, f.alpha)})`;
                this.actx.beginPath();
                this.actx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
                this.actx.fill();
                this.actx.restore();
            }

            // Floating Hearts (Active in Scene 4 & Scene 5)
            if (this.currentScene >= 4) {
                if (Math.random() > 0.85 && this.hearts.length < 35) {
                    this.hearts.push(this.createHeart());
                }

                for (let i = this.hearts.length - 1; i >= 0; i--) {
                    const h = this.hearts[i];
                    h.y += h.speedY;
                    h.x += h.speedX;
                    h.alpha -= h.fadeSpeed;

                    if (h.alpha <= 0 || h.y < -30) {
                        this.hearts.splice(i, 1);
                        continue;
                    }

                    this.drawHeart(
                        this.actx,
                        h.x,
                        h.y,
                        h.size,
                        `hsla(${h.hue}, 90%, 75%, ${h.alpha * 0.8})`
                    );
                }
            }

            // Confetti in Scene 3
            if (this.currentScene === 3 && this.confetti.length > 0) {
                for (let i = this.confetti.length - 1; i >= 0; i--) {
                    const c = this.confetti[i];
                    c.x += c.vx;
                    c.y += c.vy;
                    c.rotation += c.rotSpeedX;

                    if (c.y > this.height + 20) {
                        this.confetti.splice(i, 1);
                        continue;
                    }

                    this.actx.save();
                    this.actx.translate(c.x, c.y);
                    this.actx.rotate(c.rotation);
                    this.actx.fillStyle = c.color;
                    this.actx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
                    this.actx.restore();
                }
            }

            // Click sparkles
            for (let i = this.clickSparks.length - 1; i >= 0; i--) {
                const s = this.clickSparks[i];
                s.x += s.vx;
                s.y += s.vy;
                s.life -= s.decay;

                if (s.life <= 0) {
                    this.clickSparks.splice(i, 1);
                    continue;
                }

                this.actx.save();
                this.actx.globalAlpha = s.life;
                if (s.isHeart) {
                    this.drawHeart(this.actx, s.x, s.y, s.size * 2, s.color);
                } else {
                    this.actx.fillStyle = s.color;
                    this.actx.beginPath();
                    this.actx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                    this.actx.fill();
                }
                this.actx.restore();
            }
        }

        // --- 2. Fireworks Canvas Rendering (Scene 5) ---
        if (this.fctx && this.currentScene === 5) {
            // Trail trail effect
            this.fctx.fillStyle = 'rgba(10, 8, 30, 0.2)';
            this.fctx.fillRect(0, 0, this.width, this.height);

            // Update & draw rocket trails
            for (let i = this.fireworks.length - 1; i >= 0; i--) {
                const r = this.fireworks[i];
                r.x += r.vx;
                r.y += r.vy;

                r.trail.push({ x: r.x, y: r.y });
                if (r.trail.length > 5) r.trail.shift();

                // Draw trail
                this.fctx.save();
                this.fctx.strokeStyle = `hsl(${r.hue}, 100%, 75%)`;
                this.fctx.lineWidth = 2.5;
                this.fctx.beginPath();
                if (r.trail.length > 1) {
                    this.fctx.moveTo(r.trail[0].x, r.trail[0].y);
                    for (let j = 1; j < r.trail.length; j++) {
                        this.fctx.lineTo(r.trail[j].x, r.trail[j].y);
                    }
                }
                this.fctx.stroke();
                this.fctx.restore();

                // Check detonation
                if (r.y <= r.targetY || r.vy >= 0) {
                    this.explodeFirework(r.x, r.y, r.hue, r.isHeart);
                    this.fireworks.splice(i, 1);
                }
            }

            // Update & draw exploding particles
            for (let i = this.fireworkParticles.length - 1; i >= 0; i--) {
                const p = this.fireworkParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= 0.98;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    this.fireworkParticles.splice(i, 1);
                    continue;
                }

                this.fctx.save();
                this.fctx.globalAlpha = p.alpha;
                this.fctx.fillStyle = p.color;
                this.fctx.shadowBlur = 8;
                this.fctx.shadowColor = p.color;
                this.fctx.beginPath();
                this.fctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.fctx.fill();
                this.fctx.restore();
            }
        } else if (this.fctx) {
            this.fctx.clearRect(0, 0, this.width, this.height);
        }

        requestAnimationFrame(this.render);
    }
}

window.particleSystem = new ParticleCanvas();
