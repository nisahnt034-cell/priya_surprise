// Web Audio API Procedural Fairytale Music & Sound Effects Generator
// 100% self-contained, no external MP3 dependencies required.

class FairytaleAudio {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.currentMood = 'garden'; // 'garden', 'playful', 'celebration', 'emotional', 'fireworks'
        this.musicInterval = null;
        this.ambientInterval = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.melodyStep = 0;
        this.isMuted = false;

        // Pentatonic & Lydian magical scales (Hz)
        this.scales = {
            garden: [
                261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99 // C major / pentatonic
            ],
            playful: [
                329.63, 369.99, 392.00, 440.00, 493.88, 587.33, 659.25, 739.99, 783.99 // E melodic / bright
            ],
            celebration: [
                261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50 // celebratory arpeggio
            ],
            emotional: [
                220.00, 261.63, 329.63, 392.00, 440.00, 523.25, 659.25, 783.99 // A minor / warm emotional
            ],
            fireworks: [
                261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 987.77, 1046.50 // Grand celestial
            ]
        };

        // Chords for emotional & sweet pads
        this.chords = {
            garden: [
                [261.63, 329.63, 392.00], // C
                [220.00, 261.63, 329.63], // Am
                [174.61, 220.00, 261.63], // F
                [196.00, 246.94, 293.66]  // G
            ],
            celebration: [
                [261.63, 329.63, 392.00], // C
                [196.00, 246.94, 293.66], // G
                [220.00, 261.63, 329.63], // Am
                [174.61, 220.00, 261.63]  // F
            ],
            emotional: [
                [220.00, 261.63, 329.63], // Am
                [174.61, 220.00, 261.63], // F
                [261.63, 329.63, 392.00], // C
                [196.00, 246.94, 293.66]  // G
            ]
        };

        this.chordStep = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);
        }

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    start() {
        this.init();
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.scheduleMelodyLoop();
        this.startAmbient();
    }

    pause() {
        this.isPlaying = false;
        if (this.musicInterval) clearInterval(this.musicInterval);
        if (this.ambientInterval) clearInterval(this.ambientInterval);
    }

    toggleMute() {
        if (!this.ctx) {
            this.start();
            return false;
        }
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
        } else {
            this.masterGain.gain.setTargetAtTime(0.7, this.ctx.currentTime, 0.1);
            if (!this.isPlaying) this.start();
        }
        return this.isMuted;
    }

    setMood(mood) {
        this.currentMood = mood;
        this.melodyStep = 0;
        this.chordStep = 0;
    }

    // Play a single soft bell / music box tone
    playBell(freq, duration = 1.2, gainLevel = 0.3) {
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        // Music box / celesta tone: sine + gentle overtone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2.01, now); // slight shimmer detune

        const overtoneGain = this.ctx.createGain();
        overtoneGain.gain.setValueAtTime(0.2, now);
        osc2.connect(overtoneGain);
        overtoneGain.connect(noteGain);

        osc.connect(noteGain);
        noteGain.connect(this.musicGain);

        // Bell envelope
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + duration);
        osc2.stop(now + duration);
    }

    // Play an emotional warm pad chord
    playChord(frequencies, duration = 3.5) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        frequencies.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 1.0);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.start(now);
            osc.stop(now + duration);
        });
    }

    // Melodic sequence loop that adapts to scene mood
    scheduleMelodyLoop() {
        if (this.musicInterval) clearInterval(this.musicInterval);

        const tempoMs = {
            garden: 480,
            playful: 360,
            celebration: 320,
            emotional: 640,
            fireworks: 420
        };

        const tick = () => {
            if (!this.isPlaying) return;

            const scale = this.scales[this.currentMood] || this.scales.garden;
            const chords = this.chords[this.currentMood] || this.chords.garden;

            // Trigger chord every 8 steps
            if (this.melodyStep % 8 === 0 && chords) {
                const chord = chords[this.chordStep % chords.length];
                this.playChord(chord, (tempoMs[this.currentMood] * 8) / 1000);
                this.chordStep++;
            }

            // Generate musical arpeggio pattern
            const patterns = {
                garden: [0, 2, 4, 7, 5, 4, 2, 0, 1, 3, 5, 8, 7, 5, 3, 1],
                playful: [0, 4, 2, 5, 4, 7, 6, 8, 7, 5, 4, 2, 3, 5, 7, 8],
                celebration: [0, 2, 4, 6, 4, 2, 4, 6, 0, 3, 5, 6, 5, 3, 2, 0],
                emotional: [0, 2, 4, 5, 4, 2, 0, 3, 2, 0, 4, 5, 4, 3, 2, 0],
                fireworks: [0, 3, 5, 7, 8, 7, 5, 3, 0, 4, 6, 8, 7, 6, 4, 2]
            };

            const pattern = patterns[this.currentMood] || patterns.garden;
            const noteIdx = pattern[this.melodyStep % pattern.length];
            const baseFreq = scale[noteIdx % scale.length];

            // Add occasional sparkle octave
            const freq = (this.melodyStep % 4 === 0 && Math.random() > 0.4) ? baseFreq * 2 : baseFreq;
            const duration = this.currentMood === 'emotional' ? 1.8 : 1.1;
            const volume = this.currentMood === 'celebration' ? 0.28 : 0.22;

            this.playBell(freq, duration, volume);

            this.melodyStep++;
            this.musicInterval = setTimeout(tick, tempoMs[this.currentMood] || 480);
        };

        tick();
    }

    // Ambient nature sounds (gentle birds, magical wind)
    startAmbient() {
        if (this.ambientInterval) clearInterval(this.ambientInterval);

        this.ambientInterval = setInterval(() => {
            if (!this.isPlaying || this.isMuted) return;

            if (this.currentMood === 'garden' || this.currentMood === 'playful') {
                if (Math.random() > 0.4) {
                    this.playBirdChirp();
                }
            } else if (this.currentMood === 'emotional') {
                if (Math.random() > 0.5) {
                    this.playWindChime();
                }
            }
        }, 3200);
    }

    // Cute bird chirp SFX
    playBirdChirp() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = 2200 + Math.random() * 800;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq + 600, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(startFreq - 200, now + 0.16);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Sparkly wind chime / fairy dust SFX
    playWindChime() {
        if (!this.ctx || this.isMuted) return;
        const notes = [1046.50, 1318.51, 1567.98, 2093.00, 2637.02];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playBell(freq, 1.5, 0.08);
            }, idx * 120 + Math.random() * 50);
        });
    }

    // Interactive Tap / Heart Sparkle SFX
    playSparkle() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        const notes = [1318.51, 1567.98, 2093.00];

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);

            gain.gain.setValueAtTime(0.001, now + i * 0.05);
            gain.gain.linearRampToValueAtTime(0.12, now + i * 0.05 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.4);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.45);
        });
    }

    // Purr / pet sound effect for kitty
    playCatPurr() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.2);
        osc.frequency.linearRampToValueAtTime(85, now + 0.4);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.5);

        // Add a cute high meow tone
        setTimeout(() => {
            this.playBell(1046.50, 0.3, 0.1);
        }, 150);
    }

    // Puppy happy chirp / bark SFX
    playDogBark() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.2);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.26);
    }

    // Candle blow-out whoosh sound
    playBlowCandle() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;

        // Noise buffer for gentle breath whoosh
        const bufferSize = this.ctx.sampleRate * 0.6;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(300, now + 0.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        noise.stop(now + 0.65);

        // Followed by fanfare sparkle
        setTimeout(() => {
            this.playWindChime();
        }, 300);
    }

    // Realistic Firework sound (Whistle up + Boom rumble)
    playFireworkSound() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;

        // 1. Whistle rocket launch
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.5);

        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.linearRampToValueAtTime(0.08, now + 0.1);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        const whistleFilter = this.ctx.createBiquadFilter();
        whistleFilter.type = 'bandpass';
        whistleFilter.frequency.setValueAtTime(900, now);
        whistleFilter.Q.setValueAtTime(4, now);

        osc.connect(whistleFilter);
        whistleFilter.connect(oscGain);
        oscGain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.52);

        // 2. Boom detonation at peak
        setTimeout(() => {
            if (!this.ctx || this.isMuted) return;
            const boomTime = this.ctx.currentTime;

            // Noise burst for crackle
            const bufferSize = this.ctx.sampleRate * 0.8;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.2));
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(350, boomTime);

            const boomGain = this.ctx.createGain();
            boomGain.gain.setValueAtTime(0.35, boomTime);
            boomGain.gain.exponentialRampToValueAtTime(0.001, boomTime + 0.7);

            noise.connect(filter);
            filter.connect(boomGain);
            boomGain.connect(this.sfxGain);

            noise.start(boomTime);
            noise.stop(boomTime + 0.8);
        }, 480);
    }
}

// Global audio instance
window.fairytaleAudio = new FairytaleAudio();
