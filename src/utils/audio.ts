import { useState, useEffect, useCallback } from 'react';

// Synthesized Web Audio API sound effects & retro BGM
// Runs 100% offline without external audio files!

class SoundSystem {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public bgmVolume: number = 0.65; // 0.0 to 1.0 (ambient music)
  public sfxVolume: number = 0.8;  // 0.0 to 1.0 (sound effects)
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;
  public isBgmPlaying: boolean = false;
  private hasInteracted: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Restore saved audio settings from localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedBgm = localStorage.getItem('sosem_bgm_vol');
        if (savedBgm !== null) {
          const parsed = parseFloat(savedBgm);
          if (!isNaN(parsed)) this.bgmVolume = Math.max(0, Math.min(1, parsed));
        }

        const savedSfx = localStorage.getItem('sosem_sfx_vol');
        if (savedSfx !== null) {
          const parsed = parseFloat(savedSfx);
          if (!isNaN(parsed)) this.sfxVolume = Math.max(0, Math.min(1, parsed));
        }

        const savedMuted = localStorage.getItem('sosem_muted');
        if (savedMuted !== null) {
          this.isMuted = savedMuted === 'true';
        }
      }
    } catch {
      // Ignore storage restrictions
    }
  }

  // Subscribe to volume & mute changes
  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public isContextRunning(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }

  // Called on any first user gesture to unlock Web Audio API immediately
  public unlockAudio() {
    this.hasInteracted = true;
    this.initCtx();
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx
          .resume()
          .then(() => {
            if (!this.isMuted && !this.isBgmPlaying && this.bgmVolume > 0.01) {
              this.startBGM();
            }
            this.notify();
          })
          .catch(() => {});
      } else if (this.ctx.state === 'running') {
        if (!this.isMuted && !this.isBgmPlaying && this.bgmVolume > 0.01) {
          this.startBGM();
        }
      }
    }
  }

  public markUserInteracted() {
    this.unlockAudio();
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Set ambient background music volume
  public setBgmVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.bgmVolume = clamped;
    try {
      localStorage.setItem('sosem_bgm_vol', clamped.toFixed(2));
    } catch {}

    if (clamped > 0.01 && !this.isBgmPlaying && !this.isMuted && this.hasInteracted) {
      this.startBGM();
    }
    this.notify();
  }

  // Set sound effects volume
  public setSfxVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.sfxVolume = clamped;
    try {
      localStorage.setItem('sosem_sfx_vol', clamped.toFixed(2));
    } catch {}
    this.notify();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('sosem_muted', String(muted));
    } catch {}

    if (this.isMuted) {
      this.stopBGM();
    } else {
      if (this.bgmVolume > 0.01) {
        this.startBGM();
      }
    }
    this.notify();
    return this.isMuted;
  }

  // Play a simple tone with envelope
  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    gainVal: number = 0.1,
    detune: number = 0,
    isBgm: boolean = false
  ) {
    if (this.isMuted) return;
    const vol = isBgm ? this.bgmVolume : this.sfxVolume;
    if (vol <= 0.001) return;

    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (detune) osc.detune.setValueAtTime(detune, this.ctx.currentTime);

      const peakGain = Math.max(0.00001, gainVal * vol);
      gain.gain.setValueAtTime(peakGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio might be blocked before user interaction
    }
  }

  // Blip when characters talk
  public playVoiceBlip(highPitch: boolean = false) {
    const baseFreq = highPitch ? 520 : 340;
    const jitter = (Math.random() - 0.5) * 60;
    this.playTone(baseFreq + jitter, 'triangle', 0.05, 0.04, 0, false);
  }

  // UI selection blip
  public playMenuSelect() {
    this.playTone(480, 'sine', 0.06, 0.03, 0, false);
  }

  // Footstep grass/stone/wood rustle with left/right cadence and surface acoustics
  public playFootstep(isLeftFoot: boolean = true, surface: 'grass' | 'stone' | 'wood' = 'grass') {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const vol = this.sfxVolume;

      let startFreq = 220;
      let endFreq = 95;
      let duration = 0.052;
      let peakGain = 0.09 * vol;
      let oscType: OscillatorType = 'triangle';

      if (surface === 'stone') {
        startFreq = isLeftFoot ? 420 : 460;
        endFreq = 180;
        duration = 0.045;
        peakGain = 0.095 * vol;
        oscType = 'sine';
      } else if (surface === 'wood') {
        startFreq = isLeftFoot ? 290 : 320;
        endFreq = 120;
        duration = 0.055;
        peakGain = 0.11 * vol;
        oscType = 'triangle';
      } else {
        // grass / earth
        startFreq = isLeftFoot ? 230 : 255;
        endFreq = 95;
        duration = 0.05;
        peakGain = 0.095 * vol;
        oscType = 'triangle';
      }

      // 1. Primary body oscillator with snappy pitch drop (thud/patter)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = oscType;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(25, endFreq), t + duration);

      gain.gain.setValueAtTime(peakGain, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration);

      // 2. High-frequency tactile transient tap for stone pavers & wood bridge
      if (surface === 'stone' || surface === 'wood') {
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(surface === 'stone' ? 920 : 680, t);
        clickGain.gain.setValueAtTime(0.04 * vol, t);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
        clickOsc.connect(clickGain);
        clickGain.connect(this.ctx.destination);
        clickOsc.start(t);
        clickOsc.stop(t + 0.018);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Alias for backward compatibility
  public playStep() {
    this.playFootstep(true, 'grass');
  }

  // Compass Resonance activation: ethereal chord
  public playCompassChime() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.8, 0.08, 0, false);
      }, idx * 70);
    });
  }

  // Positive emotion validation / Quest solve
  public playSuccessFanfare() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    const melody = [
      { f: 440, d: 0.12 }, // A4
      { f: 554.37, d: 0.12 }, // C#5
      { f: 659.25, d: 0.15 }, // E5
      { f: 880, d: 0.4 }, // A5
    ];
    let time = 0;
    melody.forEach((m) => {
      setTimeout(() => {
        this.playTone(m.f, 'square', m.d, 0.06, 0, false);
      }, time * 1000);
      time += m.d;
    });
  }

  // Color restored: majestic warm swell
  public playColorRestore() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    const chords = [392, 493.88, 587.33, 783.99, 987.77];
    chords.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 1.2, 0.07, 0, false);
      }, i * 90);
    });
  }

  // Secret found (Professor Kotek or Secret Tree)
  public playSecretFound() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    const notes = [659.25, 783.99, 987.77, 1318.51];
    notes.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'triangle', 0.25, 0.08, 0, false);
      }, i * 60);
    });
  }

  // Ancient Tower Bell & Clock Chime: Resonant soothing cathedral chime
  public playTowerBell() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    const bellTones = [220, 440, 528, 659.25, 880];
    bellTones.forEach((freq, i) => {
      this.playTone(freq, i % 2 === 0 ? 'sine' : 'triangle', 2.4 - i * 0.3, 0.09 / (i + 1), 0, false);
    });
    setTimeout(() => {
      this.playTone(330, 'sine', 1.8, 0.05, 0, false);
      this.playTone(660, 'sine', 1.5, 0.03, 0, false);
    }, 120);
  }

  // Breathing cue: inhale ascending gentle wave, exhale descending
  public playBreatheIn() {
    if (this.isMuted) return;
    this.playTone(330, 'sine', 1.8, 0.05, 0, false);
  }

  public playBreatheOut() {
    if (this.isMuted) return;
    this.playTone(261.63, 'sine', 2.0, 0.04, 0, false);
  }

  // Sensory chime for grounding 5-4-3-2-1
  public playSensoryChime(freq = 523.25) {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    this.playTone(freq, 'sine', 0.8, 0.08, 0, false);
    setTimeout(() => {
      this.playTone(freq * 1.5, 'sine', 1.0, 0.04, 0, false);
    }, 80);
  }

  // Tension release pop / shake-out tap
  public playTensionPop() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    const f = 400 + Math.random() * 300;
    this.playTone(f, 'triangle', 0.12, 0.06, 0, false);
  }

  // Deep emergency stop brake tone
  public playStopBrake() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    this.playTone(220, 'sawtooth', 0.25, 0.05, 0, false);
    setTimeout(() => {
      this.playTone(330, 'sine', 0.6, 0.07, 0, false);
    }, 150);
  }

  // Soft audio cue when clicking on an inaccessible obstacle or solid wall
  public playBlocked() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    this.playTone(180, 'sine', 0.1, 0.035, 0, false);
  }

  // Audio test triggers for settings sliders
  public playTestSfx() {
    this.initCtx();
    this.playTone(659.25, 'sine', 0.18, 0.08, 0, false);
    setTimeout(() => {
      this.playTone(880, 'sine', 0.25, 0.08, 0, false);
    }, 120);
  }

  public playTestBgmNote() {
    this.initCtx();
    this.playTone(523.25, 'triangle', 0.35, 0.04, 0, true);
  }

  // Background procedural retro ambient melody
  public startBGM() {
    if (this.bgmInterval || this.isMuted) return;
    this.initCtx();
    this.isBgmPlaying = true;

    // Peaceful 8-bar soothing pentatonic sequence
    const melodyNotes = [
      329.63, 392.0, 440.0, 523.25, 659.25, 523.25, 440.0, 392.0,
      349.23, 440.0, 523.25, 587.33, 659.25, 587.33, 523.25, 440.0,
    ];

    const bassNotes = [164.81, 174.61, 196.0, 220.0];

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || this.bgmVolume <= 0.001) return;
      const f = melodyNotes[this.bgmStep % melodyNotes.length];

      // Ambient melody tone
      this.playTone(f, 'sine', 0.35, 0.035, 0, true);

      // Warm bass accompaniment every 4 beats
      if (this.bgmStep % 4 === 0) {
        const bass = bassNotes[Math.floor(this.bgmStep / 4) % bassNotes.length];
        this.playTone(bass, 'triangle', 0.7, 0.025, 0, true);
      }

      this.bgmStep++;
    }, 450);
  }

  public stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.isBgmPlaying = false;
  }

  public toggleMute() {
    return this.setMuted(!this.isMuted);
  }
}

export const sound = new SoundSystem();

// Auto-bind one-touch/click/key global gesture listener so the very first interaction immediately resumes audio!
if (typeof window !== 'undefined') {
  const unlockOnFirstGesture = () => {
    sound.unlockAudio();
    if (sound.isContextRunning()) {
      window.removeEventListener('pointerdown', unlockOnFirstGesture);
      window.removeEventListener('touchstart', unlockOnFirstGesture);
      window.removeEventListener('keydown', unlockOnFirstGesture);
      window.removeEventListener('click', unlockOnFirstGesture);
    }
  };
  window.addEventListener('pointerdown', unlockOnFirstGesture, { passive: true });
  window.addEventListener('touchstart', unlockOnFirstGesture, { passive: true });
  window.addEventListener('keydown', unlockOnFirstGesture, { passive: true });
  window.addEventListener('click', unlockOnFirstGesture, { passive: true });
}

// Reactive hook for components to read and update volume settings in real-time
export function useAudioSettings() {
  const [bgmVolume, setBgm] = useState(() => sound.bgmVolume);
  const [sfxVolume, setSfx] = useState(() => sound.sfxVolume);
  const [isMuted, setIsMuted] = useState(() => sound.isMuted);

  useEffect(() => {
    const unsub = sound.subscribe(() => {
      setBgm(sound.bgmVolume);
      setSfx(sound.sfxVolume);
      setIsMuted(sound.isMuted);
    });
    return unsub;
  }, []);

  const updateBgm = useCallback((v: number) => sound.setBgmVolume(v), []);
  const updateSfx = useCallback((v: number) => sound.setSfxVolume(v), []);
  const toggleMute = useCallback(() => sound.toggleMute(), []);
  const setMuted = useCallback((m: boolean) => sound.setMuted(m), []);

  return {
    bgmVolume,
    sfxVolume,
    isMuted,
    setBgmVolume: updateBgm,
    setSfxVolume: updateSfx,
    toggleMute,
    setMuted,
    playTestSfx: () => sound.playTestSfx(),
    playTestBgm: () => sound.playTestBgmNote(),
  };
}

