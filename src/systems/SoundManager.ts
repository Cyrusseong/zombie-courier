/**
 * SoundManager - Procedural Web Audio API sound system
 * All sounds are generated programmatically to match the retro/CRT aesthetic.
 * No external audio files needed.
 */

type SoundName =
  | 'jump'
  | 'slide'
  | 'attack'
  | 'zombieHit'
  | 'zombieKill'
  | 'coinCollect'
  | 'fuelCollect'
  | 'healthCollect'
  | 'playerHit'
  | 'gameOver'
  | 'comboAlert'
  | 'menuSelect'
  | 'menuStart'
  | 'buttonHover'
  | 'engineLoop'
  | 'lowFuelWarning';

export class SoundManager {
  private static instance: SoundManager;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private _muted = false;
  private _volume = 0.6;
  private _sfxVolume = 0.8;
  private _musicVolume = 0.4;

  // Engine loop nodes
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineRunning = false;

  // Low fuel warning
  private lowFuelOsc: OscillatorNode | null = null;
  private lowFuelGain: GainNode | null = null;
  private lowFuelActive = false;

  // BGM
  private bgmNodes: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private bgmPlaying = false;
  private bgmInterval: ReturnType<typeof setInterval> | null = null;

  private initialized = false;

  private constructor() {
    // Load saved preferences
    const saved = localStorage.getItem('zc_sound');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        this._muted = prefs.muted ?? false;
        this._volume = prefs.volume ?? 0.6;
      } catch { /* ignore */ }
    }
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Must be called from a user gesture (tap/click) to unlock audio on mobile.
   */
  async init(): Promise<void> {
    if (this.initialized && this.ctx?.state === 'running') return;

    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._muted ? 0 : this._volume;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this._sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this._musicVolume;
      this.musicGain.connect(this.masterGain);

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.initialized = true;
    } catch {
      // Web Audio not supported
    }
  }

  /**
   * Resume audio context (needed for mobile after user interaction)
   */
  async resume(): Promise<void> {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // ─── PUBLIC API ──────────────────────────────────

  play(name: SoundName): void {
    if (!this.ctx || !this.sfxGain) return;

    switch (name) {
      case 'jump': this.playJump(); break;
      case 'slide': this.playSlide(); break;
      case 'attack': this.playAttack(); break;
      case 'zombieHit': this.playZombieHit(); break;
      case 'zombieKill': this.playZombieKill(); break;
      case 'coinCollect': this.playCoinCollect(); break;
      case 'fuelCollect': this.playFuelCollect(); break;
      case 'healthCollect': this.playHealthCollect(); break;
      case 'playerHit': this.playPlayerHit(); break;
      case 'gameOver': this.playGameOver(); break;
      case 'comboAlert': this.playComboAlert(); break;
      case 'menuSelect': this.playMenuSelect(); break;
      case 'menuStart': this.playMenuStart(); break;
      case 'buttonHover': this.playButtonHover(); break;
    }
  }

  startEngine(): void {
    if (!this.ctx || !this.sfxGain || this.engineRunning) return;
    this.engineRunning = true;

    const now = this.ctx.currentTime;

    // Main engine oscillator (low frequency hum)
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 55;

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0;
    this.engineGain.gain.linearRampToValueAtTime(0.08, now + 0.3);

    // Low-pass filter for muffled engine sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 2;

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.sfxGain);
    this.engineOsc.start(now);
  }

  stopEngine(): void {
    if (!this.engineRunning) return;
    this.engineRunning = false;

    if (this.engineGain && this.ctx) {
      this.engineGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    }
    setTimeout(() => {
      this.engineOsc?.stop();
      this.engineOsc?.disconnect();
      this.engineOsc = null;
      this.engineGain?.disconnect();
      this.engineGain = null;
    }, 400);
  }

  /**
   * Update engine pitch based on game speed (call from game loop)
   */
  updateEngineSpeed(speed: number): void {
    if (!this.engineOsc) return;
    // Map speed 300-600 to frequency 55-90
    const freq = 55 + ((speed - 300) / 300) * 35;
    this.engineOsc.frequency.value = Math.min(90, Math.max(55, freq));
  }

  setLowFuelWarning(active: boolean): void {
    if (!this.ctx || !this.sfxGain) return;

    if (active && !this.lowFuelActive) {
      this.lowFuelActive = true;
      this.lowFuelOsc = this.ctx.createOscillator();
      this.lowFuelOsc.type = 'square';
      this.lowFuelOsc.frequency.value = 440;

      this.lowFuelGain = this.ctx.createGain();
      this.lowFuelGain.gain.value = 0;
      this.lowFuelOsc.connect(this.lowFuelGain);
      this.lowFuelGain.connect(this.sfxGain);
      this.lowFuelOsc.start();

      // Pulsing warning beep
      const pulse = () => {
        if (!this.lowFuelActive || !this.lowFuelGain || !this.ctx) return;
        const t = this.ctx.currentTime;
        this.lowFuelGain.gain.setValueAtTime(0, t);
        this.lowFuelGain.gain.linearRampToValueAtTime(0.06, t + 0.05);
        this.lowFuelGain.gain.linearRampToValueAtTime(0, t + 0.15);
      };
      pulse();
      this.bgmInterval = setInterval(pulse, 800);

    } else if (!active && this.lowFuelActive) {
      this.lowFuelActive = false;
      if (this.bgmInterval) {
        clearInterval(this.bgmInterval);
        this.bgmInterval = null;
      }
      this.lowFuelOsc?.stop();
      this.lowFuelOsc?.disconnect();
      this.lowFuelOsc = null;
      this.lowFuelGain?.disconnect();
      this.lowFuelGain = null;
    }
  }

  // ─── BGM ─────────────────────────────────────────

  startBGM(): void {
    if (!this.ctx || !this.musicGain || this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.playBGMLoop();
  }

  stopBGM(): void {
    this.bgmPlaying = false;
    this.bgmNodes.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch { /* ignore */ }
    });
    this.bgmNodes = [];
    if (this.bgmGain) {
      this.bgmGain.disconnect();
      this.bgmGain = null;
    }
  }

  private playBGMLoop(): void {
    if (!this.bgmPlaying || !this.ctx || !this.musicGain) return;

    // Simple retro bass line pattern (minor key, ominous)
    const notes = [55, 55, 65.41, 55, 73.42, 69.3, 55, 55, // Am bass
                   49, 49, 58.27, 49, 65.41, 61.74, 49, 49]; // Em bass
    const noteDuration = 0.2;
    const now = this.ctx.currentTime;

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.15;
    this.bgmGain.connect(this.musicGain);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    filter.connect(this.bgmGain);

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;

      const noteGain = this.ctx!.createGain();
      const start = now + i * noteDuration;
      noteGain.gain.setValueAtTime(0, start);
      noteGain.gain.linearRampToValueAtTime(0.8, start + 0.01);
      noteGain.gain.exponentialRampToValueAtTime(0.01, start + noteDuration - 0.02);

      osc.connect(noteGain);
      noteGain.connect(filter);

      osc.start(start);
      osc.stop(start + noteDuration);
      this.bgmNodes.push(osc);
    });

    // Schedule next loop
    const loopDuration = notes.length * noteDuration;
    setTimeout(() => this.playBGMLoop(), loopDuration * 1000);
  }

  // ─── MENU BGM ────────────────────────────────────

  private menuBgmPlaying = false;
  private menuBgmTimeout: ReturnType<typeof setTimeout> | null = null;

  startMenuBGM(): void {
    if (!this.ctx || !this.musicGain || this.menuBgmPlaying) return;
    this.menuBgmPlaying = true;
    this.playMenuBGMLoop();
  }

  stopMenuBGM(): void {
    this.menuBgmPlaying = false;
    if (this.menuBgmTimeout) {
      clearTimeout(this.menuBgmTimeout);
      this.menuBgmTimeout = null;
    }
  }

  private playMenuBGMLoop(): void {
    if (!this.menuBgmPlaying || !this.ctx || !this.musicGain) return;

    // Eerie ambient pad with arpeggiated minor chords
    const now = this.ctx.currentTime;

    // Pad (low drone)
    const padOsc = this.ctx.createOscillator();
    padOsc.type = 'sine';
    padOsc.frequency.value = 82.41; // E2
    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0, now);
    padGain.gain.linearRampToValueAtTime(0.08, now + 0.5);
    padGain.gain.linearRampToValueAtTime(0.08, now + 3);
    padGain.gain.linearRampToValueAtTime(0, now + 3.8);
    padOsc.connect(padGain);
    padGain.connect(this.musicGain);
    padOsc.start(now);
    padOsc.stop(now + 4);

    // Arpeggio notes (Am: A C E)
    const arpNotes = [220, 261.63, 329.63, 261.63, 220, 196, 220, 261.63];
    arpNotes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const g = this.ctx!.createGain();
      const t = now + i * 0.45;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.04, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(g);
      g.connect(this.musicGain!);
      osc.start(t);
      osc.stop(t + 0.45);
    });

    this.menuBgmTimeout = setTimeout(() => this.playMenuBGMLoop(), 3800);
  }

  // ─── VOLUME CONTROL ──────────────────────────────

  get muted(): boolean { return this._muted; }

  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this._muted ? 0 : this._volume;
    }
    this.savePrefs();
    return this._muted;
  }

  setVolume(v: number): void {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && !this._muted) {
      this.masterGain.gain.value = this._volume;
    }
    this.savePrefs();
  }

  get volume(): number { return this._volume; }

  private savePrefs(): void {
    localStorage.setItem('zc_sound', JSON.stringify({
      muted: this._muted,
      volume: this._volume,
    }));
  }

  // ─── CLEANUP ─────────────────────────────────────

  stopAll(): void {
    this.stopEngine();
    this.setLowFuelWarning(false);
    this.stopBGM();
    this.stopMenuBGM();
  }

  // ─── SOUND GENERATORS ────────────────────────────

  private playJump(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Quick ascending frequency sweep
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  private playSlide(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Noise burst (white noise through filter)
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  private playAttack(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Whoosh: descending noise sweep
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
  }

  private playZombieHit(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Thud impact
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  private playZombieKill(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Impact + splat combo
    // Low thud
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(180, now);
    osc1.frequency.exponentialRampToValueAtTime(40, now + 0.15);
    const gain1 = this.ctx.createGain();
    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Splat noise
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.15, now + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    noise.connect(filter);
    filter.connect(gain2);
    gain2.connect(this.sfxGain);
    noise.start(now + 0.02);
  }

  private playCoinCollect(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Classic coin: two quick ascending tones
    [880, 1320].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;

      const gain = this.ctx!.createGain();
      const t = now + i * 0.06;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  private playFuelCollect(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Refuel: ascending sweep with sustain
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.15);
    osc.frequency.setValueAtTime(600, now + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.setValueAtTime(0.2, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  private playHealthCollect(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Heal chime: three ascending tones (major triad)
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx!.createGain();
      const t = now + i * 0.08;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  private playPlayerHit(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Harsh impact: distorted low hit + noise burst
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

    const dist = this.ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = (Math.PI + 50) * x / (Math.PI + 50 * Math.abs(x));
    }
    dist.curve = curve;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(dist);
    dist.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.25);

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    noise.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
  }

  private playGameOver(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Descending doom: three descending tones + sustained low
    const notes = [440, 330, 220, 110];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;

      const gain = this.ctx!.createGain();
      const t = now + i * 0.2;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.4);
    });

    // Low rumble
    const rumble = this.ctx.createOscillator();
    rumble.type = 'sawtooth';
    rumble.frequency.value = 40;
    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0, now + 0.6);
    rumbleGain.gain.linearRampToValueAtTime(0.15, now + 0.8);
    rumbleGain.gain.linearRampToValueAtTime(0, now + 1.5);
    rumble.connect(rumbleGain);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100;
    rumbleGain.connect(filter);
    filter.connect(this.sfxGain);
    rumble.start(now + 0.6);
    rumble.stop(now + 1.5);
  }

  private playComboAlert(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Quick ascending power-up arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;

      const gain = this.ctx!.createGain();
      const t = now + i * 0.04;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.08);
    });
  }

  private playMenuSelect(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Quick blip
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 660;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  private playMenuStart(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Rising power-up: fast ascending arpeggio
    const notes = [262, 330, 392, 523, 660, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;

      const gain = this.ctx!.createGain();
      const t = now + i * 0.04;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.08);
    });
  }

  private playButtonHover(): void {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Subtle tick
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1200;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.03);
  }
}
