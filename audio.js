// Audio Engine for Priya Verma's Birthday Surprise
// 1. Plays original "Toota Jo Kabhi Tara" (Atif Aslam & Sumedha K.) via YouTube Stream / Local MP3
// 2. Procedural Web Audio synthesizer fallback for offline or standalone file usage
// 3. Ambient nature and interactive sound effects

class FairytaleAudio {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.currentMood = 'garden';
        this.musicInterval = null;
        this.ambientInterval = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.melodyStep = 0;
        this.isMuted = false;

        // Audio Sources
        this.audioElement = null;
        this.hasMp3Loaded = false;
        this.ytPlayer = null;
        this.isYtReady = false;
        this.activeSource = 'synth'; // 'mp3', 'youtube', 'synth'

        // Musical notes for procedural fallback
        this.notes = {
            'B3': 246.94, 'C#4': 277.18, 'D4': 293.66, 'E4': 329.63,
            'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C#5': 554.37, 'D5': 587.33, 'E5': 659.25, 'F#5': 739.99
        };

        this.tootaTaraMelody = [
            ['F#4', 1.0], ['F#4', 0.8], ['F#4', 0.8], ['E4', 0.8], ['D4', 1.2], ['F#4', 1.2], ['A4', 2.0],
            ['G4', 1.0], ['F#4', 1.0], ['E4', 2.2],
            ['E4', 1.0], ['E4', 0.8], ['E4', 0.8], ['D4', 0.8], ['C#4', 1.2], ['E4', 1.2], ['G4', 2.0],
            ['F#4', 1.0], ['E4', 1.0], ['D4', 2.2],
            ['D4', 0.9], ['D4', 0.9], ['C#4', 0.9], ['B3', 1.2], ['D4', 1.2], ['F#4', 2.0],
            ['E4', 1.0], ['D4', 1.0], ['C#4', 1.0], ['D4', 2.5]
        ];

        this.tootaTaraChords = [
            [246.94, 293.66, 369.99], // Bm
            [196.00, 246.94, 293.66], // G
            [293.66, 369.99, 440.00], // D
            [220.00, 277.18, 329.63]  // A
        ];

        this.melodyNoteIndex = 0;
        this.chordIndex = 0;

        this.initYouTubeAPI();
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();

            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.setValueAtTime(0.48, this.ctx.currentTime);
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
            this.sfxGain.connect(this.masterGain);
        }

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        if (!this.audioElement) {
            this.setupAudioElement();
        }
    }

    initYouTubeAPI() {
        if (!window.onYouTubeIframeAPIReady) {
            window.onYouTubeIframeAPIReady = () => {
                this.setupYouTubePlayer();
            };

            // Inject YouTube IFrame API script
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScript = document.getElementsByTagName('script')[0];
            if (firstScript && firstScript.parentNode) {
                firstScript.parentNode.insertBefore(tag, firstScript);
            } else {
                document.head.appendChild(tag);
            }
        }
    }

    setupYouTubePlayer() {
        const playerDiv = document.getElementById('yt-player');
        if (!playerDiv || !window.YT) return;

        try {
            this.ytPlayer = new window.YT.Player('yt-player', {
                height: '140',
                width: '240',
                videoId: 'GTOdXVfrXF0', // Official Toota Jo Kabhi Tara (A Flying Jatt)
                playerVars: {
                    'playsinline': 1,
                    'autoplay': 0,
                    'controls': 1,
                    'loop': 1,
                    'playlist': 'GTOdXVfrXF0',
                    'rel': 0,
                    'modestbranding': 1
                },
                events: {
                    'onReady': () => {
                        this.isYtReady = true;
                        console.log('YouTube Player Ready for Toota Jo Kabhi Tara!');
                        const badge = document.querySelector('.song-status-text');
                        if (badge && !this.hasMp3Loaded) {
                            badge.textContent = 'Toota Jo Kabhi Tara (Original) 🎶';
                        }
                    },
                    'onStateChange': (event) => {
                        const playBtn = document.getElementById('yt-toggle-btn');
                        const musicWaves = document.querySelectorAll('.music-waves span');
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            this.isPlaying = true;
                            this.activeSource = 'youtube';
                            if (playBtn) playBtn.textContent = '⏸️';
                            musicWaves.forEach(w => w.style.animationPlayState = 'running');
                        } else if (event.data === window.YT.PlayerState.PAUSED) {
                            if (playBtn) playBtn.textContent = '▶️';
                            musicWaves.forEach(w => w.style.animationPlayState = 'paused');
                        }
                    }
                }
            });
        } catch (e) {
            console.log('YouTube API init error:', e);
        }
    }

    setupAudioElement() {
        this.audioElement = document.getElementById('toota-tara-audio');
        if (!this.audioElement) {
            this.audioElement = new Audio();
            this.audioElement.id = 'toota-tara-audio';
            this.audioElement.loop = true;
            this.audioElement.preload = 'auto';
            document.body.appendChild(this.audioElement);
        }

        this.audioElement.src = 'toota-jo-kabhi-tara.mp3';

        this.audioElement.addEventListener('canplaythrough', () => {
            this.hasMp3Loaded = true;
            this.activeSource = 'mp3';
            console.log('Local MP3 Toota Jo Kabhi Tara loaded!');
            const badge = document.querySelector('.song-status-text');
            if (badge) badge.textContent = 'Toota Jo Kabhi Tara (Original MP3) ❤️';
        });

        this.audioElement.addEventListener('error', () => {
            this.hasMp3Loaded = false;
            if (this.isYtReady) {
                this.activeSource = 'youtube';
            } else {
                this.activeSource = 'synth';
            }
        });
    }

    loadCustomFile(file) {
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        if (!this.audioElement) this.setupAudioElement();

        // Pause YouTube if running
        if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
            this.ytPlayer.pauseVideo();
        }

        this.audioElement.src = objectUrl;
        this.audioElement.play().then(() => {
            this.hasMp3Loaded = true;
            this.isPlaying = true;
            this.activeSource = 'mp3';
            if (this.musicInterval) clearTimeout(this.musicInterval);
            const badge = document.querySelector('.song-status-text');
            if (badge) badge.textContent = `Playing: ${file.name.replace(/\.[^/.]+$/, "")} ❤️`;
        }).catch(err => {
            console.log('Custom audio playback error:', err);
        });
    }

    start() {
        this.init();
        if (this.isPlaying) return;
        this.isPlaying = true;

        // Priority 1: Play Local MP3 if available
        if (this.hasMp3Loaded && this.audioElement) {
            this.activeSource = 'mp3';
            this.audioElement.play().catch(() => {});
        }
        // Priority 2: Play Official YouTube Song Stream
        else if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
            this.activeSource = 'youtube';
            try {
                this.ytPlayer.playVideo();
            } catch (e) {
                this.scheduleTootaTaraLoop();
            }
        }
        // Priority 3: Procedural Synthesizer
        else {
            this.activeSource = 'synth';
            this.scheduleTootaTaraLoop();
        }

        this.startAmbient();
    }

    pause() {
        this.isPlaying = false;
        if (this.audioElement) this.audioElement.pause();
        if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
            try { this.ytPlayer.pauseVideo(); } catch(e) {}
        }
        if (this.musicInterval) clearTimeout(this.musicInterval);
        if (this.ambientInterval) clearInterval(this.ambientInterval);
    }

    toggleMute() {
        if (!this.ctx) {
            this.start();
            return false;
        }

        this.isMuted = !this.isMuted;

        if (this.isMuted) {
            if (this.audioElement) this.audioElement.muted = true;
            if (this.ytPlayer && typeof this.ytPlayer.mute === 'function') {
                try { this.ytPlayer.mute(); } catch(e) {}
            }
            if (this.masterGain) this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
        } else {
            if (this.audioElement) this.audioElement.muted = false;
            if (this.ytPlayer && typeof this.ytPlayer.unMute === 'function') {
                try { this.ytPlayer.unMute(); } catch(e) {}
            }
            if (this.masterGain) this.masterGain.gain.setTargetAtTime(0.75, this.ctx.currentTime, 0.1);
            if (!this.isPlaying) this.start();
        }
        return this.isMuted;
    }

    setMood(mood) {
        this.currentMood = mood;
        if (mood === 'emotional' || mood === 'fireworks') {
            if (this.audioElement) this.audioElement.volume = 1.0;
            if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
                try { this.ytPlayer.setVolume(100); } catch(e) {}
            }
        }
    }

    // Procedural Fallback Methods
    playAcousticPluck(freq, duration = 1.6, gainLevel = 0.26) {
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const oscHarmonic = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(freq * 2, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(350, now + duration * 0.8);

        const harmGain = this.ctx.createGain();
        harmGain.gain.setValueAtTime(0.3, now);
        oscHarmonic.connect(harmGain);
        harmGain.connect(filter);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.musicGain);

        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(gainLevel, now + 0.018);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.start(now);
        oscHarmonic.start(now);
        osc.stop(now + duration);
        oscHarmonic.stop(now + duration);
    }

    playChord(frequencies, duration = 3.6) {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        frequencies.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(750, now);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.065, now + 0.8);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.start(now + idx * 0.03);
            osc.stop(now + duration);
        });
    }

    scheduleTootaTaraLoop() {
        if (this.musicInterval) clearTimeout(this.musicInterval);
        const beatMs = 450;

        const playNextNote = () => {
            if (!this.isPlaying || this.activeSource !== 'synth') return;

            if (this.melodyNoteIndex % 4 === 0) {
                const chord = this.tootaTaraChords[this.chordIndex % this.tootaTaraChords.length];
                this.playChord(chord, 3.8);
                this.chordIndex++;
            }

            const item = this.tootaTaraMelody[this.melodyNoteIndex % this.tootaTaraMelody.length];
            const noteName = item[0];
            const durationBeats = item[1];
            const freq = this.notes[noteName];

            if (freq) {
                const noteDuration = durationBeats * (beatMs / 1000) * 1.3;
                this.playAcousticPluck(freq, noteDuration, 0.28);
            }

            this.melodyNoteIndex++;
            const nextDelay = durationBeats * beatMs;
            this.musicInterval = setTimeout(playNextNote, nextDelay);
        };

        playNextNote();
    }

    startAmbient() {
        if (this.ambientInterval) clearInterval(this.ambientInterval);
        this.ambientInterval = setInterval(() => {
            if (!this.isPlaying || this.isMuted) return;
            if (this.currentMood === 'garden' || this.currentMood === 'playful') {
                if (Math.random() > 0.4) this.playBirdChirp();
            } else if (this.currentMood === 'emotional' || this.currentMood === 'fireworks') {
                if (Math.random() > 0.45) this.playWindChime();
            }
        }, 3000);
    }

    playBirdChirp() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = 2200 + Math.random() * 700;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq + 550, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(startFreq - 150, now + 0.16);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    playWindChime() {
        if (!this.ctx || this.isMuted) return;
        const notes = [1046.50, 1318.51, 1567.98, 2093.00, 2637.02];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playAcousticPluck(freq, 1.4, 0.06);
            }, idx * 110 + Math.random() * 40);
        });
    }

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
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.35);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.4);
        });
    }

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
        gain.gain.linearRampToValueAtTime(0.14, now + 0.1);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.5);

        setTimeout(() => {
            this.playAcousticPluck(1046.50, 0.3, 0.08);
        }, 150);
    }

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
        gain.gain.linearRampToValueAtTime(0.16, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    playGhungrooChime() {
        this.init();
        if (this.isMuted) return;
        const notes = [1760.00, 2093.00, 2637.02, 3135.96];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playAcousticPluck(freq, 0.4, 0.12);
            }, idx * 60);
        });
    }

    playNoodleSlurp() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.28);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.32);

        setTimeout(() => this.playSparkle(), 180);
    }

    playKDramaChime() {
        this.init();
        if (this.isMuted) return;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playAcousticPluck(freq, 1.2, 0.15);
            }, idx * 100);
        });
    }

    playBlowCandle() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;

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
        gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        noise.stop(now + 0.65);

        setTimeout(() => {
            this.playWindChime();
        }, 300);
    }

    playFireworkSound() {
        this.init();
        if (this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.5);

        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.linearRampToValueAtTime(0.07, now + 0.1);
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

        setTimeout(() => {
            if (!this.ctx || this.isMuted) return;
            const boomTime = this.ctx.currentTime;

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
            filter.frequency.setValueAtTime(320, boomTime);

            const boomGain = this.ctx.createGain();
            boomGain.gain.setValueAtTime(0.32, boomTime);
            boomGain.gain.exponentialRampToValueAtTime(0.001, boomTime + 0.7);

            noise.connect(filter);
            filter.connect(boomGain);
            boomGain.connect(this.sfxGain);

            noise.start(boomTime);
            noise.stop(boomTime + 0.8);
        }, 480);
    }
}

window.fairytaleAudio = new FairytaleAudio();
