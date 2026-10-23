// Application Logic, Scene Progression, Animations & Interactivity

class BirthdayExperience {
    constructor() {
        this.currentScene = 1;
        this.totalScenes = 5;
        this.scenes = [];
        this.dots = [];
        this.isCandleBlown = false;
        this.autoPlayTimer = null;

        this.sceneTitles = [
            'Enchanted Garden 🌸',
            'Playful Moments 🐾',
            'Birthday Surprise 🎂',
            'From The Heart 💗',
            'Fireworks Finale 🎆'
        ];

        this.init();
    }

    init() {
        // Collect DOM elements
        this.scenes = document.querySelectorAll('.scene');
        this.dots = document.querySelectorAll('.scene-dot');
        this.titleBadge = document.querySelector('.scene-title-badge');
        this.musicToggleBtn = document.getElementById('music-toggle');

        // Setup Event Listeners
        this.setupNavigation();
        this.setupInteractiveCharacters();
        this.setupBirthdayCake();
        this.setupAudioControls();

        // Keyboard navigation
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') {
                this.nextScene();
            } else if (e.key === 'ArrowLeft') {
                this.prevScene();
            }
        });

        // Touch swipe navigation
        let touchStartX = 0;
        let touchEndX = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 60) {
                this.nextScene();
            } else if (touchEndX - touchStartX > 60) {
                this.prevScene();
            }
        }, { passive: true });

        // Show initial scene
        this.goToScene(1);
    }

    setupNavigation() {
        // Scene 1 Start Button
        const startBtn = document.getElementById('btn-start-surprise');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (window.fairytaleAudio) {
                    window.fairytaleAudio.start();
                }
                this.goToScene(2);
            });
        }

        // Generic Next & Prev Buttons
        document.querySelectorAll('[data-next-scene]').forEach(btn => {
            btn.addEventListener('click', () => this.nextScene());
        });

        document.querySelectorAll('[data-prev-scene]').forEach(btn => {
            btn.addEventListener('click', () => this.prevScene());
        });

        // Navigation dots
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToScene(index + 1);
            });
        });

        // Replay Button in Scene 5
        const replayBtn = document.getElementById('btn-replay');
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                this.goToScene(1);
            });
        }
    }

    setupAudioControls() {
        if (this.musicToggleBtn) {
            this.musicToggleBtn.addEventListener('click', () => {
                if (window.fairytaleAudio) {
                    const muted = window.fairytaleAudio.toggleMute();
                    if (muted) {
                        this.musicToggleBtn.classList.add('muted');
                        this.musicToggleBtn.setAttribute('title', 'Music is Muted (Click to Play)');
                    } else {
                        this.musicToggleBtn.classList.remove('muted');
                        this.musicToggleBtn.setAttribute('title', 'Music is Playing (Click to Mute)');
                    }
                }
            });
        }

        const uploadBtn = document.getElementById('btn-upload-song');
        const fileInput = document.getElementById('song-file-input');
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    if (window.fairytaleAudio) {
                        window.fairytaleAudio.loadCustomFile(e.target.files[0]);
                    }
                }
            });
        }
    }

    setupInteractiveCharacters() {
        // Priya interactions
        const priya = document.getElementById('char-priya');
        if (priya) {
            priya.addEventListener('click', () => {
                priya.classList.add('laughing');
                if (window.fairytaleAudio) {
                    window.fairytaleAudio.playSparkle();
                }
                setTimeout(() => priya.classList.remove('laughing'), 2500);
            });
        }

        // Kitten interactions
        const kitty = document.getElementById('actor-cat');
        const yarn = document.getElementById('yarn-ball');
        const catReaction = () => {
            if (kitty) {
                kitty.style.transform = 'scale(1.25) rotate(-10deg) translateY(-15px)';
                setTimeout(() => kitty.style.transform = '', 600);
            }
            if (yarn) {
                yarn.style.transform = 'translateX(60px) rotate(720deg)';
                setTimeout(() => yarn.style.transform = '', 1000);
            }
            if (window.fairytaleAudio) {
                window.fairytaleAudio.playCatPurr();
            }
        };

        if (kitty) kitty.addEventListener('click', catReaction);
        if (yarn) yarn.addEventListener('click', catReaction);

        // Puppy interactions
        const puppy = document.getElementById('actor-dog');
        if (puppy) {
            puppy.addEventListener('click', () => {
                puppy.style.transform = 'scale(1.3) translateY(-25px) rotate(8deg)';
                setTimeout(() => puppy.style.transform = '', 600);
                if (window.fairytaleAudio) {
                    window.fairytaleAudio.playDogBark();
                }
            });
        }

        // Squirrel interactions
        const squirrel = document.getElementById('actor-squirrel');
        if (squirrel) {
            squirrel.addEventListener('click', () => {
                squirrel.style.transform = 'scale(1.3) rotate(-12deg) translateY(-10px)';
                setTimeout(() => squirrel.style.transform = '', 500);
                if (window.fairytaleAudio) {
                    window.fairytaleAudio.playSparkle();
                }
            });
        }

        // Bunny interactions
        const bunny = document.getElementById('actor-bunny');
        if (bunny) {
            bunny.addEventListener('click', () => {
                bunny.style.transform = 'scale(1.25) translateY(-20px)';
                setTimeout(() => bunny.style.transform = '', 500);
                if (window.fairytaleAudio) {
                    window.fairytaleAudio.playSparkle();
                }
            });
        }
    }

    setupBirthdayCake() {
        const cake = document.getElementById('birthday-cake');
        const hintTag = document.getElementById('cake-hint');
        if (!cake) return;

        cake.addEventListener('click', () => {
            if (this.isCandleBlown) return;
            this.isCandleBlown = true;

            // Extinguish flames
            document.querySelectorAll('.candle-flame').forEach(f => {
                f.classList.add('extinguished');
            });

            if (hintTag) {
                hintTag.innerHTML = '✨ Wishes sent to the stars! 🌟';
                hintTag.style.background = '#d8f3dc';
                hintTag.style.color = '#2d6a4f';
            }

            if (window.fairytaleAudio) {
                window.fairytaleAudio.playBlowCandle();
            }

            if (window.particleSystem) {
                window.particleSystem.burstConfetti();
            }
        });
    }

    nextScene() {
        if (this.currentScene < this.totalScenes) {
            this.goToScene(this.currentScene + 1);
        }
    }

    prevScene() {
        if (this.currentScene > 1) {
            this.goToScene(this.currentScene - 1);
        }
    }

    goToScene(sceneNum) {
        if (sceneNum < 1 || sceneNum > this.totalScenes) return;

        this.currentScene = sceneNum;

        // Update active class on scene sections
        this.scenes.forEach((scene, index) => {
            if (index + 1 === sceneNum) {
                scene.classList.add('active');
            } else {
                scene.classList.remove('active');
            }
        });

        // Update navigation dots & badge
        this.dots.forEach((dot, index) => {
            if (index + 1 === sceneNum) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        if (this.titleBadge) {
            this.titleBadge.textContent = this.sceneTitles[sceneNum - 1];
        }

        // Notify Particle System
        if (window.particleSystem) {
            window.particleSystem.setScene(sceneNum);
        }

        // Update Audio Mood
        if (window.fairytaleAudio) {
            const moods = ['garden', 'playful', 'celebration', 'emotional', 'fireworks'];
            window.fairytaleAudio.setMood(moods[sceneNum - 1]);
        }

        // Trigger scene specific animations
        this.handleSceneEnter(sceneNum);
    }

    handleSceneEnter(sceneNum) {
        if (sceneNum === 3) {
            // Sequenced reveal of birthday wishes
            const cards = document.querySelectorAll('.wish-card');
            cards.forEach((card, idx) => {
                card.classList.remove('show');
                setTimeout(() => {
                    card.classList.add('show');
                }, 400 + idx * 750);
            });
        }

        if (sceneNum === 4) {
            // Sequenced reveal of emotional messages
            const lines = document.querySelectorAll('.emotional-line');
            lines.forEach((line, idx) => {
                line.classList.remove('show');
                setTimeout(() => {
                    line.classList.add('show');
                }, 500 + idx * 1200);
            });
        }

        if (sceneNum === 5) {
            // Sequenced reveal of grand fireworks typography
            const burstText = document.getElementById('finale-burst');
            const subText = document.getElementById('finale-sub');
            const blessingText = document.getElementById('finale-blessing');
            const madeTag = document.getElementById('made-with-love');
            const finaleCtrls = document.getElementById('finale-actions');

            if (burstText) burstText.classList.remove('show');
            if (subText) subText.classList.remove('show');
            if (blessingText) blessingText.classList.remove('show');
            if (madeTag) madeTag.classList.remove('show');
            if (finaleCtrls) finaleCtrls.classList.remove('show');

            setTimeout(() => {
                if (burstText) burstText.classList.add('show');
            }, 800);

            setTimeout(() => {
                if (subText) subText.classList.add('show');
            }, 2400);

            setTimeout(() => {
                if (blessingText) blessingText.classList.add('show');
            }, 4200);

            setTimeout(() => {
                if (madeTag) madeTag.classList.add('show');
                if (finaleCtrls) finaleCtrls.classList.add('show');
            }, 6800);
        }
    }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    window.birthdayApp = new BirthdayExperience();
});
