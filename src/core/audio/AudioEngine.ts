import type { Score } from '@/types/index.ts';
import { Soundfont } from 'smplr';
import { PlaybackScheduler } from './PlaybackScheduler.ts';
import type { ScheduledNoteEvent, PositionEvent } from './PlaybackScheduler.ts';

export type PlaybackState = 'idle' | 'playing' | 'paused';

/** @deprecated Use ScheduledNoteEvent from PlaybackScheduler instead */
export type ScheduledEvent = ScheduledNoteEvent;

interface PlaybackListener {
  onStateChange?: (state: PlaybackState) => void;
  onTimeUpdate?: (currentTime: number, totalTime: number) => void;
  onPositionUpdate?: (measureIndex: number, noteIndex: number) => void;
}

interface ChannelState {
  volume: number; // 0-127
  muted: boolean;
  solo: boolean;
}

export class AudioEngine {
  #state: PlaybackState = 'idle';
  #audioContext: AudioContext | null = null;
  #instruments: Map<number, Soundfont> = new Map();
  #percussionInstrument: Soundfont | null = null;
  #startTime = 0;
  #pauseTime = 0;
  #scheduler = new PlaybackScheduler();
  #totalTime = 0;
  #animFrameId = 0;
  #listeners: PlaybackListener[] = [];
  #metronomeEnabled = false;
  #metronomGain: GainNode | null = null;

  // Mixer state
  #channels: Map<number, ChannelState> = new Map();
  #masterVolume = 100;
  #score: Score | null = null;

  get state() { return this.#state; }

  subscribe(listener: PlaybackListener): () => void {
    this.#listeners.push(listener);
    return () => {
      this.#listeners = this.#listeners.filter((l) => l !== listener);
    };
  }

  async ensureContext(): Promise<AudioContext> {
    if (!this.#audioContext) {
      this.#audioContext = new AudioContext();
    }
    if (this.#audioContext.state === 'suspended') {
      await this.#audioContext.resume();
    }
    return this.#audioContext;
  }

  async loadInstrument(gmProgram: number): Promise<Soundfont> {
    if (this.#instruments.has(gmProgram)) {
      return this.#instruments.get(gmProgram)!;
    }
    const ctx = await this.ensureContext();
    const sf = new Soundfont(ctx, { instrument: this.#gmProgramName(gmProgram) });
    await sf.load;
    this.#instruments.set(gmProgram, sf);
    return sf;
  }

  async #loadPercussion(): Promise<Soundfont> {
    if (this.#percussionInstrument) return this.#percussionInstrument;
    const ctx = await this.ensureContext();
    const sf = new Soundfont(ctx, { instrument: 'synth_drum' });
    await sf.load;
    this.#percussionInstrument = sf;
    return sf;
  }

  #gmProgramName(program: number): string {
    const names: Record<number, string> = {
      0: 'acoustic_grand_piano',
      1: 'bright_acoustic_piano',
      2: 'electric_grand_piano',
      4: 'electric_piano_1',
      5: 'electric_piano_2',
      6: 'harpsichord',
      7: 'clavinet',
      8: 'celesta',
      11: 'vibraphone',
      12: 'marimba',
      13: 'xylophone',
      16: 'drawbar_organ',
      19: 'church_organ',
      24: 'acoustic_guitar_nylon',
      25: 'acoustic_guitar_nylon',
      26: 'electric_guitar_jazz',
      27: 'electric_guitar_clean',
      28: 'electric_guitar_muted',
      29: 'overdriven_guitar',
      30: 'distortion_guitar',
      32: 'acoustic_bass',
      33: 'electric_bass_finger',
      34: 'electric_bass_pick',
      35: 'fretless_bass',
      36: 'slap_bass_1',
      40: 'violin',
      41: 'viola',
      42: 'cello',
      43: 'contrabass',
      44: 'tremolo_strings',
      46: 'orchestral_harp',
      48: 'string_ensemble_1',
      50: 'synth_strings_1',
      52: 'choir_aahs',
      56: 'trumpet',
      57: 'trombone',
      58: 'tuba',
      59: 'muted_trumpet',
      60: 'french_horn',
      61: 'brass_section',
      64: 'soprano_sax',
      65: 'alto_sax',
      66: 'tenor_sax',
      67: 'baritone_sax',
      68: 'oboe',
      69: 'english_horn',
      70: 'bassoon',
      71: 'clarinet',
      72: 'piccolo',
      73: 'flute',
      74: 'recorder',
      75: 'pan_flute',
    };
    return names[program] ?? 'acoustic_grand_piano';
  }

  scheduleScore(score: Score, bpm: number): ScheduledNoteEvent[] {
    this.#scheduler.schedule(score, bpm);
    return this.#scheduler.events;
  }

  get positionEvents(): PositionEvent[] {
    return this.#scheduler.positionEvents;
  }

  async play(score: Score, bpm: number, metronome = false): Promise<void> {
    if (this.#state === 'playing') return;

    this.#score = score;
    const ctx = await this.ensureContext();
    this.#metronomeEnabled = metronome;

    // Load instruments for all parts
    const loadPromises: Promise<unknown>[] = [];
    for (const part of score.parts) {
      if (part.instrument.isPercussion) {
        loadPromises.push(this.#loadPercussion());
      } else {
        loadPromises.push(this.loadInstrument(part.instrument.gmProgram));
      }
    }
    await Promise.all(loadPromises);

    // Schedule all events via PlaybackScheduler
    this.#scheduler.schedule(score, bpm);
    this.#totalTime = this.#scheduler.totalTime;

    const offset = this.#state === 'paused' ? this.#pauseTime : 0;
    this.#startTime = ctx.currentTime - offset;

    // Schedule all note events
    for (const event of this.#scheduler.events) {
      if (event.time < offset) continue;
      const part = score.parts[event.partIndex];
      if (!part) continue;

      let sf: Soundfont | undefined;
      if (part.instrument.isPercussion) {
        sf = this.#percussionInstrument ?? undefined;
      } else {
        sf = this.#instruments.get(part.instrument.gmProgram);
      }
      if (!sf) continue;

      // Apply mixer settings to velocity
      const effectiveVelocity = this.#calculateVelocity(event.partIndex, event.velocity);
      if (effectiveVelocity <= 0) continue; // Skip silent notes

      const startAt = this.#startTime + event.time;
      sf.start({
        note: event.pitch,
        velocity: effectiveVelocity,
        time: startAt,
        duration: event.duration,
      });
    }

    // Schedule metronome
    if (this.#metronomeEnabled) {
      this.#scheduleMetronome(ctx, score, offset);
    }

    this.#setState('playing');
    this.#startTimeUpdate(ctx);
  }

  #scheduleMetronome(ctx: AudioContext, score: Score, offset: number) {
    this.#metronomGain = ctx.createGain();
    this.#metronomGain.gain.value = 0.3;
    this.#metronomGain.connect(ctx.destination);

    const beats = this.#scheduler.getMetronomeBeats(score);

    for (const beat of beats) {
      if (beat.time < offset) continue;

      const startAt = this.#startTime + beat.time;
      const isDownbeat = beat.beat === 0;
      const freq = isDownbeat ? 1000 : 800;
      const dur = isDownbeat ? 0.03 : 0.02;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(this.#metronomGain!);
      gain.gain.setValueAtTime(0.5, startAt);
      gain.gain.exponentialRampToValueAtTime(0.01, startAt + dur);
      osc.start(startAt);
      osc.stop(startAt + dur);
    }
  }

  pause(): void {
    if (this.#state !== 'playing') return;
    if (this.#audioContext) {
      this.#pauseTime = this.#audioContext.currentTime - this.#startTime;
    }
    this.#stopAll();
    this.#setState('paused');
  }

  stop(): void {
    this.#stopAll();
    this.#pauseTime = 0;
    this.#setState('idle');
  }

  seek(time: number): void {
    this.#pauseTime = time;
  }

  get currentTime(): number {
    if (this.#state === 'playing' && this.#audioContext) {
      return this.#audioContext.currentTime - this.#startTime;
    }
    return this.#pauseTime;
  }

  get totalTime(): number {
    return this.#totalTime;
  }

  get currentScore(): Score | null {
    return this.#score;
  }

  playNotePreview(gmProgram: number, midi: number, duration = 0.3): void {
    const sf = this.#instruments.get(gmProgram);
    if (!sf || !this.#audioContext) return;
    sf.start({
      note: midi,
      velocity: 80,
      duration,
    });
  }

  #stopAll(): void {
    cancelAnimationFrame(this.#animFrameId);
    for (const sf of this.#instruments.values()) {
      sf.stop();
    }
    this.#percussionInstrument?.stop();
  }

  #setState(state: PlaybackState): void {
    this.#state = state;
    for (const l of this.#listeners) {
      l.onStateChange?.(state);
    }
  }

  #startTimeUpdate(ctx: AudioContext): void {
    const tick = () => {
      if (this.#state !== 'playing') return;
      const current = ctx.currentTime - this.#startTime;

      // Fire position update via binary search
      const pos = this.#scheduler.getPositionAtTime(current);
      if (pos) {
        for (const l of this.#listeners) {
          l.onPositionUpdate?.(pos.measureIndex, pos.noteIndex);
        }
      }

      for (const l of this.#listeners) {
        l.onTimeUpdate?.(current, this.#totalTime);
      }

      if (current >= this.#totalTime) {
        this.stop();
        return;
      }

      this.#animFrameId = requestAnimationFrame(tick);
    };
    this.#animFrameId = requestAnimationFrame(tick);
  }

  // ─── Mixer Controls ───────────────────────────────────────

  setChannelVolume(partIndex: number, volume: number): void {
    const ch = this.#channels.get(partIndex) ?? { volume: 80, muted: false, solo: false };
    ch.volume = Math.max(0, Math.min(127, volume));
    this.#channels.set(partIndex, ch);
  }

  setChannelMute(partIndex: number, muted: boolean): void {
    const ch = this.#channels.get(partIndex) ?? { volume: 80, muted: false, solo: false };
    ch.muted = muted;
    this.#channels.set(partIndex, ch);
  }

  setChannelSolo(partIndex: number, solo: boolean): void {
    const ch = this.#channels.get(partIndex) ?? { volume: 80, muted: false, solo: false };
    ch.solo = solo;
    this.#channels.set(partIndex, ch);
  }

  setMasterVolume(volume: number): void {
    this.#masterVolume = Math.max(0, Math.min(127, volume));
  }

  getChannelState(partIndex: number): ChannelState {
    return this.#channels.get(partIndex) ?? { volume: 80, muted: false, solo: false };
  }

  // Calculate effective velocity for a note based on mixer settings
  #calculateVelocity(partIndex: number, baseVelocity: number): number {
    const ch = this.#channels.get(partIndex);
    if (!ch) return baseVelocity;

    const hasSolo = Array.from(this.#channels.values()).some((c) => c.solo);
    const isAudible = !ch.muted && (!hasSolo || ch.solo);

    if (!isAudible) return 0;

    const channelGain = ch.volume / 127;
    const masterGain = this.#masterVolume / 127;
    return Math.round(baseVelocity * channelGain * masterGain);
  }

  dispose(): void {
    this.stop();
    this.#audioContext?.close();
    this.#audioContext = null;
    this.#instruments.clear();
    this.#percussionInstrument = null;
    this.#channels.clear();
  }
}
