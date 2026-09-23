import { useState, useEffect, useCallback } from 'react';

// Synthesized Web Audio API sound effects & dynamic 3-phase BGM
// Runs 100% offline without external audio files!
// Phase 1 ('fog'): Masa Kabut Kelabu - Muffled slow piano, gentle ambient wind, distant mysterious pings, no percussion.
// Phase 2 ('restoring'): Momen Warna Kembali - Emotional accelerando bridge, single guitar plucks, glistening wind chimes.
// Phase 3 ('restored'): Setelah Lingkungan Pulih - Fully blooming cheerful & warm, light acoustic guitar, singing seruling melody.

export type BgmPhase = 'fog' | 'restoring' | 'restored';

class SoundSystem {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public masterVolume: number = 0.85; // 0.0 to 1.0 (overall game volume)
  public bgmVolume: number = 0.65;    // 0.0 to 1.0 (ambient music)
  public sfxVolume: number = 0.8;     // 0.0 to 1.0 (sound effects)
  public voiceVolume: number = 0.85;  // 0.0 to 1.0 (narration & dialogue voice)

  // BGM Engine Nodes & State
  public bgmPhase: BgmPhase = 'fog';
  public isBgmPlaying: boolean = false;
  public isRestoringTransition: boolean = false;
  private hasInteracted: boolean = false;
  private listeners: Set<() => void> = new Set();

  private masterGain: GainNode | null = null;
  private masterBgmGain: GainNode | null = null;
  private masterSfxGain: GainNode | null = null;
  private masterVoiceGain: GainNode | null = null;
  private bgmFilterNode: BiquadFilterNode | null = null;

  // Ambient Wind Synth (for Masa Kabut Kelabu)
  private windGainNode: GainNode | null = null;
  private windFilterNode: BiquadFilterNode | null = null;
  private windSourceNode: AudioBufferSourceNode | null = null;

  // Step scheduling
  private bgmTimeoutId: number | null = null;
  private restoringTimeoutId: number | null = null;
  private currentStep: number = 0;
  private restoringStep: number = 0;

  constructor() {
    // Restore saved audio settings from localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedMaster = localStorage.getItem('sosem_master_vol');
        if (savedMaster !== null) {
          const parsed = parseFloat(savedMaster);
          if (!isNaN(parsed)) this.masterVolume = Math.max(0, Math.min(1, parsed));
        }

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

        const savedVoice = localStorage.getItem('sosem_voice_vol');
        if (savedVoice !== null) {
          const parsed = parseFloat(savedVoice);
          if (!isNaN(parsed)) this.voiceVolume = Math.max(0, Math.min(1, parsed));
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

  // Subscribe to audio state & phase changes
  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(() => {
        this.listeners.forEach((fn) => fn());
      });
    } else {
      setTimeout(() => {
        this.listeners.forEach((fn) => fn());
      }, 0);
    }
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
            this.updateNodeGains();
            if (!this.isMuted && !this.isBgmPlaying && this.bgmVolume > 0.01) {
              this.startBGM();
            }
            this.notify();
          })
          .catch(() => {});
      } else if (this.ctx.state === 'running') {
        this.updateNodeGains();
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
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      // Initialize Master Output Gain (Master Volume)
      if (!this.masterGain) {
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      // Initialize Master SFX Gain
      if (!this.masterSfxGain) {
        this.masterSfxGain = this.ctx.createGain();
        this.masterSfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.masterSfxGain.connect(this.masterGain);
      }

      // Initialize Master Voice / Narration Gain
      if (!this.masterVoiceGain) {
        this.masterVoiceGain = this.ctx.createGain();
        this.masterVoiceGain.gain.setValueAtTime(this.voiceVolume, this.ctx.currentTime);
        this.masterVoiceGain.connect(this.masterGain);
      }

      // Initialize Master BGM Gain & Dynamic Atmosphere Filter
      if (!this.masterBgmGain) {
        this.masterBgmGain = this.ctx.createGain();
        this.masterBgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
        this.masterBgmGain.connect(this.masterGain);
      }

      if (!this.bgmFilterNode) {
        this.bgmFilterNode = this.ctx.createBiquadFilter();
        this.bgmFilterNode.type = 'lowpass';
        const initialCutoff =
          this.bgmPhase === 'fog' ? 680 : this.bgmPhase === 'restoring' ? 2400 : 14000;
        this.bgmFilterNode.frequency.setValueAtTime(initialCutoff, this.ctx.currentTime);
        this.bgmFilterNode.Q.setValueAtTime(1.1, this.ctx.currentTime);
        this.bgmFilterNode.connect(this.masterBgmGain);
      }

      // Initialize Gentle Whispering Wind Synthesizer
      this.initWindNoise();
    }
  }

  // Create smooth procedural mountain breeze noise loop for Grey Fog phase
  private initWindNoise() {
    if (!this.ctx || !this.masterBgmGain || this.windSourceNode) return;
    try {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate * 4; // 4 second loop
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Warm brown-pink noise filter
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.96 * b1 + white * 0.11;
        b2 = 0.86 * b2 + white * 0.25;
        data[i] = (b0 + b1 + b2) * 0.14;
      }

      this.windSourceNode = this.ctx.createBufferSource();
      this.windSourceNode.buffer = noiseBuffer;
      this.windSourceNode.loop = true;

      this.windFilterNode = this.ctx.createBiquadFilter();
      this.windFilterNode.type = 'bandpass';
      this.windFilterNode.frequency.setValueAtTime(320, this.ctx.currentTime);
      this.windFilterNode.Q.setValueAtTime(2.4, this.ctx.currentTime);

      this.windGainNode = this.ctx.createGain();
      const initialGain =
        !this.isMuted && this.bgmPhase === 'fog' && this.isBgmPlaying ? 0.016 : 0.00001;
      this.windGainNode.gain.setValueAtTime(initialGain, this.ctx.currentTime);

      // Slow organic swell LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.075, this.ctx.currentTime); // ~13s breathing period
      lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(this.windFilterNode.frequency);
      lfo.start();

      this.windSourceNode.connect(this.windFilterNode);
      this.windFilterNode.connect(this.windGainNode);
      this.windGainNode.connect(this.masterBgmGain);

      this.windSourceNode.start();
    } catch {
      // Audio context might still be suspended before user interaction
    }
  }

  private updateNodeGains() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.masterVolume, t, 0.05);
    }
    if (this.masterBgmGain) {
      this.masterBgmGain.gain.setTargetAtTime(this.bgmVolume, t, 0.05);
    }
    if (this.masterSfxGain) {
      this.masterSfxGain.gain.setTargetAtTime(this.sfxVolume, t, 0.05);
    }
    if (this.masterVoiceGain) {
      this.masterVoiceGain.gain.setTargetAtTime(this.voiceVolume, t, 0.05);
    }
    if (this.windGainNode) {
      const windTarget =
        !this.isMuted && this.bgmPhase === 'fog' && this.isBgmPlaying ? 0.016 : 0.00001;
      this.windGainNode.gain.setTargetAtTime(windTarget, t, 0.6);
    }
  }

  // Set overall master game volume
  public setMasterVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.masterVolume = clamped;
    try {
      localStorage.setItem('sosem_master_vol', clamped.toFixed(2));
    } catch {}

    this.updateNodeGains();
    if (clamped > 0.01 && !this.isBgmPlaying && !this.isMuted && this.bgmVolume > 0.01 && this.hasInteracted) {
      this.startBGM();
    }
    this.notify();
  }

  // Set ambient background music volume
  public setBgmVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.bgmVolume = clamped;
    try {
      localStorage.setItem('sosem_bgm_vol', clamped.toFixed(2));
    } catch {}

    this.updateNodeGains();
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

    this.updateNodeGains();
    this.notify();
  }

  // Set narration / dialogue voice volume
  public setVoiceVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.voiceVolume = clamped;
    try {
      localStorage.setItem('sosem_voice_vol', clamped.toFixed(2));
    } catch {}

    this.updateNodeGains();
    this.notify();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('sosem_muted', String(muted));
    } catch {}

    this.updateNodeGains();
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

  public toggleMute() {
    return this.setMuted(!this.isMuted);
  }

  // Set the active musical phase smoothly
  public setBgmPhase(phase: BgmPhase, force: boolean = false) {
    if (this.bgmPhase === phase && !force) return;
    if (this.isRestoringTransition && phase !== 'restored' && !force) {
      // Allow the emotional restoration transition bridge to complete naturally
      return;
    }

    this.bgmPhase = phase;
    this.currentStep = 0;
    this.restoringStep = 0;

    if (this.ctx && this.bgmFilterNode) {
      const t = this.ctx.currentTime;
      if (phase === 'fog') {
        // Muffled, distant lowpass filter
        this.bgmFilterNode.frequency.setTargetAtTime(680, t, 0.7);
        if (this.windGainNode) {
          this.windGainNode.gain.setTargetAtTime(this.isMuted ? 0 : 0.016, t, 1.2);
        }
      } else if (phase === 'restoring') {
        // Accelerando bridge: filter sweeps open gradually
        this.bgmFilterNode.frequency.setValueAtTime(800, t);
        this.bgmFilterNode.frequency.exponentialRampToValueAtTime(3600, t + 10.5);
        if (this.windGainNode) {
          this.windGainNode.gain.setTargetAtTime(0.00001, t, 1.2);
        }
      } else {
        // Restored: fully bright, wide open, joyful
        this.bgmFilterNode.frequency.setTargetAtTime(14000, t, 0.6);
        if (this.windGainNode) {
          this.windGainNode.gain.setTargetAtTime(0.00001, t, 0.8);
        }
      }
    }

    this.notify();
  }

  // Triggered when a village zone is restored (emotional bridge)
  public triggerColorRestorationTransition() {
    if (this.isMuted) return;
    this.isRestoringTransition = true;
    this.setBgmPhase('restoring', true);

    if (this.restoringTimeoutId) {
      window.clearTimeout(this.restoringTimeoutId);
    }

    // 12-second accelerando crescendo bridge, then blooming into warm restored village theme
    this.restoringTimeoutId = window.setTimeout(() => {
      this.isRestoringTransition = false;
      this.setBgmPhase('restored', true);
    }, 11800);
  }

  // ----------------------------------------------------
  // INSTRUMENT SYNTHESIZERS (FOG / RESTORING / RESTORED)
  // ----------------------------------------------------

  // 1. Piano: Felt hammer, muffled, slow decay, warm stereo-chorus
  private playPianoNote(freq: number, duration: number, velocity: number = 0.038) {
    if (this.isMuted || this.bgmVolume <= 0.001 || !this.ctx || !this.bgmFilterNode) return;
    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, t);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq, t);
      osc2.detune.setValueAtTime(2.2, t);

      gain.gain.setValueAtTime(0.00001, t);
      gain.gain.linearRampToValueAtTime(velocity, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.00001, t + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.bgmFilterNode);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + duration);
      osc2.stop(t + duration);
    } catch {}
  }

  // 2. Solitary Glass/Dew Chime (Denting pelan bergema)
  private playMistyChime(freq: number, velocity: number = 0.02) {
    if (this.isMuted || this.bgmVolume <= 0.001 || !this.ctx || !this.bgmFilterNode) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const oscHarm = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      oscHarm.type = 'sine';
      oscHarm.frequency.setValueAtTime(freq * 2.756, t); // inharmonic crystal chime

      gain.gain.setValueAtTime(0.00001, t);
      gain.gain.linearRampToValueAtTime(velocity, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.00001, t + 3.8);

      osc.connect(gain);
      oscHarm.connect(gain);
      gain.connect(this.bgmFilterNode);

      osc.start(t);
      oscHarm.start(t);
      osc.stop(t + 3.8);
      oscHarm.stop(t + 3.8);
    } catch {}
  }

  // 3. Plucked Acoustic Guitar (Petikan gitar tunggal / petikan gitar ringan)
  private playGuitarPluck(freq: number, duration: number, velocity: number = 0.042) {
    if (this.isMuted || this.bgmVolume <= 0.001 || !this.ctx || !this.bgmFilterNode) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const pluckFilter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      pluckFilter.type = 'lowpass';
      pluckFilter.frequency.setValueAtTime(2600, t);
      pluckFilter.frequency.exponentialRampToValueAtTime(650, t + Math.min(duration, 0.35));

      gain.gain.setValueAtTime(0.00001, t);
      gain.gain.linearRampToValueAtTime(velocity, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.00001, t + duration);

      osc.connect(pluckFilter);
      pluckFilter.connect(gain);
      gain.connect(this.bgmFilterNode);

      osc.start(t);
      osc.stop(t + duration);
    } catch {}
  }

  // 4. Sparkling Wind Chimes (Dentingan lonceng angin berkilau)
  private playWindChime(freq: number, delayMs: number = 0) {
    if (this.isMuted || this.bgmVolume <= 0.001 || !this.ctx) return;
    setTimeout(() => {
      if (!this.ctx || !this.bgmFilterNode) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.00001, t);
        gain.gain.linearRampToValueAtTime(0.024, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.00001, t + 1.8);

        osc.connect(gain);
        gain.connect(this.bgmFilterNode);

        osc.start(t);
        osc.stop(t + 1.8);
      } catch {}
    }, delayMs);
  }

  // 5. Joyful Pastoral Flute / Seruling with Singing Vibrato
  private playFluteNote(freq: number, duration: number, velocity: number = 0.038) {
    if (this.isMuted || this.bgmVolume <= 0.001 || !this.ctx || !this.bgmFilterNode) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Singing woodwind vibrato kicks in smoothly after 0.12s
      if (duration > 0.28) {
        const vibrato = this.ctx.createOscillator();
        const vibGain = this.ctx.createGain();
        vibrato.frequency.setValueAtTime(5.4, t);
        vibGain.gain.setValueAtTime(0, t);
        vibGain.gain.setValueAtTime(0, t + 0.12);
        vibGain.gain.linearRampToValueAtTime(12, t + 0.35); // 12 cents vibrato depth

        vibrato.connect(vibGain);
        vibGain.connect(osc.detune);
        vibrato.start(t);
        vibrato.stop(t + duration);
      }

      gain.gain.setValueAtTime(0.00001, t);
      gain.gain.linearRampToValueAtTime(velocity, t + 0.035);
      gain.gain.setValueAtTime(velocity * 0.85, t + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.00001, t + duration);

      osc.connect(gain);
      gain.connect(this.bgmFilterNode);

      osc.start(t);
      osc.stop(t + duration);
    } catch {}
  }

  // 6. Warm Acoustic Bass
  private playAcousticBass(freq: number, duration: number, velocity: number = 0.032) {
    if (this.isMuted || this.bgmVolume <= 0.001 || !this.ctx || !this.bgmFilterNode) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.00001, t);
      gain.gain.linearRampToValueAtTime(velocity, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.00001, t + duration);

      osc.connect(gain);
      gain.connect(this.bgmFilterNode);

      osc.start(t);
      osc.stop(t + duration);
    } catch {}
  }

  // ----------------------------------------------------
  // MAIN BGM PROCEDURAL SEQUENCING ENGINE
  // ----------------------------------------------------

  public startBGM() {
    if (this.isBgmPlaying || this.isMuted) return;
    this.initCtx();
    this.isBgmPlaying = true;
    this.currentStep = 0;
    this.restoringStep = 0;
    this.updateNodeGains();
    this.scheduleNextStep();
  }

  public stopBGM() {
    if (this.bgmTimeoutId) {
      window.clearTimeout(this.bgmTimeoutId);
      this.bgmTimeoutId = null;
    }
    if (this.restoringTimeoutId) {
      window.clearTimeout(this.restoringTimeoutId);
      this.restoringTimeoutId = null;
    }
    this.isBgmPlaying = false;
    this.isRestoringTransition = false;
    this.updateNodeGains();
  }

  private scheduleNextStep() {
    if (!this.isBgmPlaying || this.isMuted) return;

    let stepDelay = 820; // Default slow fog pacing

    if (this.bgmPhase === 'fog') {
      stepDelay = 820; // Slow, contemplative pulse
      this.playFogStep(this.currentStep);
      this.currentStep = (this.currentStep + 1) % 32;
    } else if (this.bgmPhase === 'restoring') {
      // Emotional accelerando bridge: 480ms -> 240ms
      stepDelay = Math.max(240, 480 - this.restoringStep * 11);
      this.playRestoringStep(this.restoringStep);
      this.restoringStep++;
      if (this.restoringStep >= 24) {
        // Transition finished, advance to restored
        this.isRestoringTransition = false;
        this.setBgmPhase('restored', true);
      }
    } else {
      // Restored: Cheerful, upbeat 4/4 folk tempo (~109 BPM 8th-notes)
      stepDelay = 275;
      this.playRestoredStep(this.currentStep);
      this.currentStep = (this.currentStep + 1) % 32;
    }

    this.bgmTimeoutId = window.setTimeout(() => {
      this.scheduleNextStep();
    }, stepDelay);
  }

  // PHASE 1: MASA KABUT KELABU
  // Hampa, misterius, sepi, nada piano sangat lambat bergema teredam, tanpa perkusi, desiran angin lembut
  private playFogStep(step: number) {
    // 32-step cycle (~26.2 seconds)
    // Spaced contemplative chord arpeggios every 4 steps (~3.3s each)
    switch (step) {
      case 0:
        // Chord 1: A minor (hampa, melankolis)
        this.playPianoNote(110.0, 3.8, 0.038); // A2
        this.playPianoNote(164.81, 3.6, 0.034); // E3
        this.playPianoNote(261.63, 3.4, 0.032); // C4
        break;
      case 4:
        // Chord 2: F major (lembut, sunyi)
        this.playPianoNote(87.31, 3.8, 0.038); // F2
        this.playPianoNote(130.81, 3.6, 0.034); // C3
        this.playPianoNote(220.0, 3.4, 0.032); // A3
        break;
      case 6:
        // Dentingan pelan bergema tinggi keheningan
        this.playMistyChime(659.25, 0.02); // E5
        break;
      case 8:
        // Chord 3: D minor (misterius)
        this.playPianoNote(146.83, 3.8, 0.038); // D3
        this.playPianoNote(220.0, 3.6, 0.034); // A3
        this.playPianoNote(349.23, 3.4, 0.032); // F4
        break;
      case 12:
        // Chord 4: E minor (tenang, dingin)
        this.playPianoNote(82.41, 3.8, 0.038); // E2
        this.playPianoNote(123.47, 3.6, 0.034); // B2
        this.playPianoNote(196.0, 3.4, 0.032); // G3
        this.playPianoNote(329.63, 3.2, 0.028); // E4
        break;
      case 16:
        // Chord 5: Dm/F
        this.playPianoNote(87.31, 3.8, 0.038); // F2
        this.playPianoNote(146.83, 3.6, 0.034); // D3
        this.playPianoNote(220.0, 3.4, 0.032); // A3
        break;
      case 20:
        // Chord 6: G major
        this.playPianoNote(98.0, 3.8, 0.038); // G2
        this.playPianoNote(146.83, 3.6, 0.034); // D3
        this.playPianoNote(246.94, 3.4, 0.032); // B3
        break;
      case 22:
        // Dentingan kristal bergema kedua
        this.playMistyChime(987.77, 0.022); // B5
        break;
      case 24:
        // Chord 7: C major
        this.playPianoNote(130.81, 3.8, 0.038); // C3
        this.playPianoNote(196.0, 3.6, 0.034); // G3
        this.playPianoNote(329.63, 3.4, 0.032); // E4
        break;
      case 28:
        // Chord 8: Asus2 (nada menggantung sebelum berulang kembali)
        this.playPianoNote(110.0, 4.2, 0.038); // A2
        this.playPianoNote(164.81, 4.0, 0.034); // E3
        this.playPianoNote(246.94, 3.8, 0.032); // B3
        break;
      default:
        break;
    }
  }

  // PHASE 2: MOMEN WARNA KEMBALI
  // Jembatan emosional, tempo menaik, petikan gitar tunggal, dentingan lonceng angin bersemi
  private playRestoringStep(step: number) {
    // Ascending arpeggio progressions of emerging life
    const guitarNotes: { [k: number]: number } = {
      0: 130.81, // C3
      1: 196.0,  // G3
      2: 261.63, // C4
      3: 329.63, // E4
      4: 392.0,  // G4
      5: 523.25, // C5
      6: 146.83, // D3
      7: 220.0,  // A3
      8: 293.66, // D4
      9: 369.99, // F#4
      10: 440.0, // A4
      11: 587.33,// D5
      12: 164.81,// E3
      13: 246.94,// B3
      14: 329.63,// E4
      15: 392.0, // G4
      16: 493.88,// B4
      17: 659.25,// E5
      18: 196.0, // G3
      19: 293.66,// D4
      20: 392.0, // G4
      21: 493.88,// B4
      22: 587.33,// D5
      23: 783.99 // G5 (Crescendo apex!)
    };

    if (guitarNotes[step]) {
      this.playGuitarPluck(guitarNotes[step], 0.65, 0.045);
    }

    // Glistening wind chimes entering like beams of golden sunlight
    if (step === 4) {
      this.playWindChime(783.99, 0);
      this.playWindChime(1046.5, 60);
    } else if (step === 10) {
      this.playWindChime(880.0, 0);
      this.playWindChime(1174.66, 50);
      this.playWindChime(1318.51, 100);
    } else if (step === 16) {
      this.playWindChime(987.77, 0);
      this.playWindChime(1318.51, 50);
      this.playWindChime(1567.98, 100);
    } else if (step === 22) {
      // Grand shimmering cascade
      this.playWindChime(1046.5, 0);
      this.playWindChime(1318.51, 40);
      this.playWindChime(1567.98, 80);
      this.playWindChime(2093.0, 120);
    }
  }

  // PHASE 3: SETELAH LINGKUNGAN PULIH
  // Mekar sepenuhnya, hangat, ceria, petikan gitar akustik ringan, tiupan seruling gembira penuh rasa syukur
  private playRestoredStep(step: number) {
    // 32-step cycle (4 bars in 4/4)

    // 1. Acoustic Upright Bass on downbeats
    const bassMap: { [k: number]: number } = {
      0: 98.0,   // G2 (Bar 1)
      4: 146.83, // D3
      8: 130.81, // C3 (Bar 2)
      12: 196.0, // G3
      16: 146.83,// D3 (Bar 3)
      20: 164.81,// E3
      24: 130.81,// C3 (Bar 4)
      28: 98.0,  // G2
    };
    if (bassMap[step]) {
      this.playAcousticBass(bassMap[step], 0.35, 0.034);
    }

    // 2. Light Acoustic Guitar Fingerpicking
    const guitarArp: { [k: number]: number } = {
      1: 246.94, // B3
      2: 293.66, // D4
      3: 392.0,  // G4
      5: 246.94, // B3
      6: 293.66, // D4
      7: 392.0,  // G4
      9: 329.63, // E4
      10: 392.0, // G4
      11: 523.25,// C5
      13: 329.63,// E4
      14: 392.0, // G4
      15: 523.25,// C5
      17: 369.99,// F#4
      18: 440.0, // A4
      19: 587.33,// D5
      21: 392.0, // G4
      22: 493.88,// B4
      23: 659.25,// E5
      25: 392.0, // G4
      26: 440.0, // A4
      27: 587.33,// D5
      29: 246.94,// B3
      30: 293.66,// D4
      31: 392.0, // G4
    };
    if (guitarArp[step]) {
      this.playGuitarPluck(guitarArp[step], 0.32, 0.038);
    }

    // 3. Tiupan Seruling yang Gembira (Expressive Folk Woodwind Melody)
    // Membawa suasana optimis, hangat, dan penuh rasa syukur
    const fluteMelody: { [k: number]: { f: number; d: number } } = {
      0: { f: 392.0, d: 0.52 },   // G4
      2: { f: 493.88, d: 0.52 },  // B4
      4: { f: 587.33, d: 0.52 },  // D5
      6: { f: 659.25, d: 0.26 },  // E5
      7: { f: 587.33, d: 0.26 },  // D5
      8: { f: 493.88, d: 0.52 },  // B4
      10: { f: 440.0, d: 0.26 },  // A4
      11: { f: 392.0, d: 0.26 },  // G4
      12: { f: 440.0, d: 0.52 },  // A4
      14: { f: 493.88, d: 0.52 }, // B4
      16: { f: 587.33, d: 0.52 }, // D5
      18: { f: 659.25, d: 0.52 }, // E5
      20: { f: 783.99, d: 0.95 }, // G5 (Puncak melodi sukacita!)
      24: { f: 659.25, d: 0.26 }, // E5
      25: { f: 587.33, d: 0.26 }, // D5
      26: { f: 493.88, d: 0.52 }, // B4
      28: { f: 392.0, d: 1.05 },  // G4 (Resolusi hangat dan bersyukur)
    };

    if (fluteMelody[step]) {
      const note = fluteMelody[step];
      this.playFluteNote(note.f, note.d, 0.042);
    }

    // 4. Sparkling wind chime cadence flourish
    if (step === 30) {
      this.playWindChime(987.77, 0);
      this.playWindChime(1174.66, 50);
      this.playWindChime(1567.98, 100);
    }
  }

  // ----------------------------------------------------
  // GENERAL SOUND EFFECTS (SFX)
  // ----------------------------------------------------

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
      if (isBgm && this.bgmFilterNode) {
        gain.connect(this.bgmFilterNode);
      } else if (this.masterSfxGain) {
        gain.connect(this.masterSfxGain);
      } else {
        gain.connect(this.ctx.destination);
      }

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio might be blocked before user interaction
    }
  }

  // Blip when characters talk
  public playVoiceBlip(highPitch: boolean = false) {
    if (this.isMuted || this.voiceVolume <= 0.001) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const baseFreq = highPitch ? 520 : 340;
      const jitter = (Math.random() - 0.5) * 60;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq + jitter, this.ctx.currentTime);

      const peak = Math.max(0.00001, 0.06 * this.voiceVolume);
      gain.gain.setValueAtTime(peak, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      if (this.masterVoiceGain) {
        gain.connect(this.masterVoiceGain);
      } else if (this.masterGain) {
        gain.connect(this.masterGain);
      } else {
        gain.connect(this.ctx.destination);
      }

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
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
        startFreq = isLeftFoot ? 230 : 255;
        endFreq = 95;
        duration = 0.05;
        peakGain = 0.095 * vol;
        oscType = 'triangle';
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = oscType;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(25, endFreq), t + duration);

      gain.gain.setValueAtTime(peakGain, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      if (this.masterSfxGain) {
        gain.connect(this.masterSfxGain);
      } else {
        gain.connect(this.ctx.destination);
      }

      osc.start(t);
      osc.stop(t + duration);

      if (surface === 'stone' || surface === 'wood') {
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(surface === 'stone' ? 920 : 680, t);
        clickGain.gain.setValueAtTime(0.04 * vol, t);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
        clickOsc.connect(clickGain);
        if (this.masterSfxGain) {
          clickGain.connect(this.masterSfxGain);
        } else {
          clickGain.connect(this.ctx.destination);
        }
        clickOsc.start(t);
        clickOsc.stop(t + 0.018);
      }
    } catch {}
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

  // Smooth Day / Night ambient transition chime
  public playDayNightTransition(toNight: boolean) {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    if (toNight) {
      // Descending soothing twilight chimes
      const nightChimes = [880.0, 659.25, 523.25, 392.0]; // A5, E5, C5, G4
      nightChimes.forEach((f, idx) => {
        setTimeout(() => {
          this.playTone(f, 'sine', 1.2, 0.045, 0, false);
        }, idx * 110);
      });
    } else {
      // Ascending crisp morning dawn chimes
      const dayChimes = [392.0, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
      dayChimes.forEach((f, idx) => {
        setTimeout(() => {
          this.playTone(f, 'sine', 1.1, 0.045, 0, false);
        }, idx * 95);
      });
    }
  }

  // Positive emotion validation / Quest solve
  public playSuccessFanfare() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    const melody = [
      { f: 440, d: 0.12 },   // A4
      { f: 554.37, d: 0.12 },// C#5
      { f: 659.25, d: 0.15 },// E5
      { f: 880, d: 0.4 },    // A5
    ];
    let time = 0;
    melody.forEach((m) => {
      setTimeout(() => {
        this.playTone(m.f, 'square', m.d, 0.06, 0, false);
      }, time * 1000);
      time += m.d;
    });
  }

  // Grand celebratory fanfare when all 10 badges are unlocked
  public playAllBadgesFanfare() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    // Triumphant multi-stage ascending fanfare
    const fanfareNotes = [
      { f: 523.25, d: 0.16, type: 'triangle' as OscillatorType }, // C5
      { f: 659.25, d: 0.16, type: 'triangle' as OscillatorType }, // E5
      { f: 783.99, d: 0.18, type: 'triangle' as OscillatorType }, // G5
      { f: 1046.5, d: 0.35, type: 'square' as OscillatorType },   // C6
      { f: 880.0, d: 0.18, type: 'triangle' as OscillatorType },  // A5
      { f: 1046.5, d: 0.18, type: 'triangle' as OscillatorType }, // C6
      { f: 1174.66, d: 0.22, type: 'square' as OscillatorType },  // D6
      { f: 1318.51, d: 0.65, type: 'sine' as OscillatorType },    // E6
    ];

    let delay = 0;
    fanfareNotes.forEach((n) => {
      setTimeout(() => {
        this.playTone(n.f, n.type, n.d, 0.08, 0, false);
      }, delay * 1000);
      delay += n.d * 0.78;
    });

    // Golden wind chimes cascade during the climax
    setTimeout(() => {
      const chimes = [1046.5, 1318.51, 1567.98, 2093.0, 2637.02];
      chimes.forEach((f, idx) => {
        setTimeout(() => {
          this.playWindChime(f, 0);
        }, idx * 65);
      });
    }, 1100);
  }

  // Sound effect and vibration for incorrect quiz answer
  public playQuizWrong() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    try {
      // First low dissonance tone
      const osc1 = this.ctx.createOscillator();
      const g1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(180, t);
      osc1.frequency.exponentialRampToValueAtTime(130, t + 0.16);
      g1.gain.setValueAtTime(0.08 * this.sfxVolume, t);
      g1.gain.linearRampToValueAtTime(0.001, t + 0.16);
      osc1.connect(g1);
      g1.connect(this.masterSfxGain || this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.17);

      // Second downward buzz
      setTimeout(() => {
        if (!this.ctx) return;
        const t2 = this.ctx.currentTime;
        const osc2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(140, t2);
        osc2.frequency.exponentialRampToValueAtTime(95, t2 + 0.22);
        g2.gain.setValueAtTime(0.09 * this.sfxVolume, t2);
        g2.gain.linearRampToValueAtTime(0.001, t2 + 0.22);
        osc2.connect(g2);
        g2.connect(this.masterSfxGain || this.ctx.destination);
        osc2.start(t2);
        osc2.stop(t2 + 0.23);
      }, 120);

      // Device vibration if available
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 60, 120]);
        } catch {
          // ignore
        }
      }
    } catch {
      // fallback
    }
  }

  // Realistic synthesized applause (handclaps) & joyful cheer chords
  public playApplause() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      // 1. Festive melody chord progression
      const chords = [
        { f: 523.25, d: 0.14 }, // C5
        { f: 659.25, d: 0.14 }, // E5
        { f: 783.99, d: 0.16 }, // G5
        { f: 1046.5, d: 0.35 }, // C6
      ];
      let delay = 0;
      chords.forEach((c) => {
        setTimeout(() => {
          this.playTone(c.f, 'triangle', c.d, 0.07, 0, false);
        }, delay * 1000);
        delay += c.d * 0.8;
      });

      // 2. Handclap bursts simulating a cheering crowd of children
      const clapCount = 18;
      for (let i = 0; i < clapCount; i++) {
        const clapDelay = 40 + i * 65 + (Math.random() * 30 - 15);
        setTimeout(() => {
          if (!this.ctx) return;
          try {
            const ct = this.ctx.currentTime;
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.045);
            const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let j = 0; j < bufferSize; j++) {
              data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.28));
            }

            const noiseSource = this.ctx.createBufferSource();
            noiseSource.buffer = noiseBuffer;

            // Bandpass filter centered around 1000-1400Hz (human handclap resonance)
            const clapFilter = this.ctx.createBiquadFilter();
            clapFilter.type = 'bandpass';
            clapFilter.frequency.setValueAtTime(1000 + Math.random() * 400, ct);
            clapFilter.Q.setValueAtTime(2.2, ct);

            const clapGain = this.ctx.createGain();
            clapGain.gain.setValueAtTime(0.06 * this.sfxVolume, ct);
            clapGain.gain.exponentialRampToValueAtTime(0.001, ct + 0.045);

            noiseSource.connect(clapFilter);
            clapFilter.connect(clapGain);
            clapGain.connect(this.masterSfxGain || this.ctx.destination);

            noiseSource.start(ct);
            noiseSource.stop(ct + 0.05);
          } catch {
            // ignore
          }
        }, clapDelay);
      }

      // 3. Gentle cheering vibration
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([60, 40, 60, 40, 80]);
        } catch {
          // ignore
        }
      }
    } catch {
      // fallback
    }
  }

  // Camera shutter click & flash sparkle for Abadikan Momen
  public playCameraShutter() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    try {
      // First mechanical click (shutter open)
      const osc1 = this.ctx.createOscillator();
      const g1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1600, t);
      osc1.frequency.exponentialRampToValueAtTime(300, t + 0.04);
      g1.gain.setValueAtTime(0.08, t);
      g1.gain.linearRampToValueAtTime(0.0001, t + 0.04);
      osc1.connect(g1);
      g1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.05);

      // Second mechanical click (shutter close)
      const osc2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1200, t + 0.06);
      osc2.frequency.exponentialRampToValueAtTime(200, t + 0.11);
      g2.gain.setValueAtTime(0.06, t + 0.06);
      g2.gain.linearRampToValueAtTime(0.0001, t + 0.12);
      osc2.connect(g2);
      g2.connect(this.ctx.destination);
      osc2.start(t + 0.06);
      osc2.stop(t + 0.13);

      // Flash sparkle chime
      setTimeout(() => {
        this.playWindChime(1760, 0);
        this.playWindChime(2637, 0.08);
      }, 90);
    } catch {}
  }

  // Color restored: majestic warm swell & fanfare chime
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

  // Ancient Tower Bell & Clock Chime
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

  // Breathing cues
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

  // Tension release pop
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

  // Soft audio cue when clicking on an inaccessible obstacle
  public playBlocked() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    this.playTone(180, 'sine', 0.1, 0.035, 0, false);
  }

  // Soothing waterfall rush & splash sound effect
  public playWaterfallSplash() {
    if (this.isMuted || this.sfxVolume <= 0.001) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // White noise buffer for rushing whitewater cascade
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Bandpass resonant filter to simulate rushing mountain water cascade
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(450, t + 0.45);
      filter.Q.setValueAtTime(1.8, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.06 * this.sfxVolume, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      whiteNoise.connect(filter);
      filter.connect(gain);
      if (this.masterSfxGain) {
        gain.connect(this.masterSfxGain);
      } else {
        gain.connect(this.ctx.destination);
      }
      whiteNoise.start(t);
      whiteNoise.stop(t + 0.46);

      // Delicate melodic droplet splash tones
      [587.33, 880, 1174.66].forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 'sine', 0.22, 0.035, 0, false);
        }, idx * 75 + 40);
      });
    } catch {}
  }

  // Test triggers for settings sliders & testing specific phases
  public playTestMaster() {
    this.initCtx();
    this.playCompassChime();
  }

  public playTestSfx() {
    this.initCtx();
    this.playTone(659.25, 'sine', 0.18, 0.08, 0, false);
    setTimeout(() => {
      this.playTone(880, 'sine', 0.25, 0.08, 0, false);
    }, 120);
  }

  public playTestVoice() {
    this.initCtx();
    // Warm, friendly speaking syllable triplet
    this.playVoiceBlip(false);
    setTimeout(() => {
      this.playVoiceBlip(true);
    }, 110);
    setTimeout(() => {
      this.playVoiceBlip(false);
    }, 220);
  }

  public playTestBgmNote() {
    this.initCtx();
    if (this.bgmPhase === 'fog') {
      this.playPianoNote(261.63, 1.8, 0.045);
      setTimeout(() => this.playMistyChime(659.25, 0.025), 180);
    } else if (this.bgmPhase === 'restoring') {
      this.playGuitarPluck(392.0, 0.6, 0.05);
      setTimeout(() => this.playWindChime(1046.5, 0), 100);
    } else {
      this.playFluteNote(587.33, 0.6, 0.05);
      setTimeout(() => this.playGuitarPluck(392.0, 0.4, 0.04), 120);
    }
  }

  public playTestBgmPhase(phase: BgmPhase) {
    this.setBgmPhase(phase, true);
    if (!this.isBgmPlaying && !this.isMuted) {
      this.startBGM();
    }
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

// Reactive hook for components to read and update volume & BGM phase in real-time
export function useAudioSettings() {
  const [masterVolume, setMaster] = useState(() => sound.masterVolume);
  const [bgmVolume, setBgm] = useState(() => sound.bgmVolume);
  const [sfxVolume, setSfx] = useState(() => sound.sfxVolume);
  const [voiceVolume, setVoice] = useState(() => sound.voiceVolume);
  const [isMuted, setIsMuted] = useState(() => sound.isMuted);
  const [bgmPhase, setPhase] = useState<BgmPhase>(() => sound.bgmPhase);

  useEffect(() => {
    const unsub = sound.subscribe(() => {
      setMaster(sound.masterVolume);
      setBgm(sound.bgmVolume);
      setSfx(sound.sfxVolume);
      setVoice(sound.voiceVolume);
      setIsMuted(sound.isMuted);
      setPhase(sound.bgmPhase);
    });
    return unsub;
  }, []);

  const updateMaster = useCallback((v: number) => sound.setMasterVolume(v), []);
  const updateBgm = useCallback((v: number) => sound.setBgmVolume(v), []);
  const updateSfx = useCallback((v: number) => sound.setSfxVolume(v), []);
  const updateVoice = useCallback((v: number) => sound.setVoiceVolume(v), []);
  const toggleMute = useCallback(() => sound.toggleMute(), []);
  const setMuted = useCallback((m: boolean) => sound.setMuted(m), []);
  const setBgmPhase = useCallback((p: BgmPhase) => sound.setBgmPhase(p, true), []);
  const triggerRestoring = useCallback(() => sound.triggerColorRestorationTransition(), []);

  return {
    masterVolume,
    bgmVolume,
    sfxVolume,
    voiceVolume,
    isMuted,
    bgmPhase,
    setMasterVolume: updateMaster,
    setBgmVolume: updateBgm,
    setSfxVolume: updateSfx,
    setVoiceVolume: updateVoice,
    toggleMute,
    setMuted,
    setBgmPhase,
    triggerRestoring,
    playTestMaster: () => sound.playTestMaster(),
    playTestSfx: () => sound.playTestSfx(),
    playTestBgm: () => sound.playTestBgmNote(),
    playTestVoice: () => sound.playTestVoice(),
    playTestBgmPhase: (p: BgmPhase) => sound.playTestBgmPhase(p),
  };
}
