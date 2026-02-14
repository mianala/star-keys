import type { Score, Note, NoteOrRest } from '@/types/index.ts';
import { Soundfont } from 'smplr';

export type PlaybackState = 'idle' | 'playing' | 'paused';

export interface ScheduledEvent {
  time: number;       // seconds from start
  duration: number;   // seconds
  pitch: number;      // MIDI note number
  velocity: number;   // 0-127
  partIndex: number;
}

interface PlaybackListener {
  onStateChange?: (state: PlaybackState) => void;
  onTimeUpdate?: (currentTime: number, totalTime: number) => void;
  onPositionUpdate?: (measureIndex: number, noteIndex: number) => void;
}

const STEP_TO_MIDI: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

function noteToMidi(note: Note): number {
  const step = STEP_TO_MIDI[note.pitch.step] ?? 0;
  const octave = note.pitch.octave;
  const alter = note.pitch.alter ?? 0;
  return (octave + 1) * 12 + step + alter;
}

const DURATION_BEATS: Record<string, number> = {
  whole: 4, half: 2, quarter: 1, eighth: 0.5,
  '16th': 0.25, '32nd': 0.125, '64th': 0.0625,
};

function noteDurationBeats(noteOrRest: NoteOrRest): number {
  let base = DURATION_BEATS[noteOrRest.duration] ?? 1;
  let add = base;
  for (let i = 0; i < noteOrRest.dots; i++) {
    add /= 2;
    base += add;
  }
  return base;
}

export class AudioEngine {
  #state: PlaybackState = 'idle';
  #audioContext: AudioContext | null = null;
  #instruments: Map<number, Soundfont> = new Map();
  #startTime = 0;
  #pauseTime = 0;
  #events: ScheduledEvent[] = [];
  #totalTime = 0;
  #animFrameId = 0;
  #listeners: PlaybackListener[] = [];
  #metronomeEnabled = false;
  #metronomGain: GainNode | null = null;

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

  #gmProgramName(program: number): string {
    // Map GM program numbers to smplr instrument names
    const names: Record<number, string> = {
      0: 'acoustic_grand_piano',
      25: 'acoustic_guitar_nylon',
      27: 'electric_guitar_clean',
      33: 'electric_bass_finger',
    };
    return names[program] ?? 'acoustic_grand_piano';
  }

  scheduleScore(score: Score, bpm: number): ScheduledEvent[] {
    const events: ScheduledEvent[] = [];
    const secPerBeat = 60 / bpm;

    for (let p = 0; p < score.parts.length; p++) {
      const part = score.parts[p];
      if (part.instrument.isPercussion) continue; // Skip percussion for now

      let beatPos = 0;
      for (const measure of part.measures) {
        // Check for tempo direction
        for (const dir of measure.directions) {
          if (dir.kind === 'tempo') {
            // Would update secPerBeat - simplified for now
          }
        }

        for (const noteOrRest of measure.notes) {
          const durBeats = noteDurationBeats(noteOrRest);

          if (noteOrRest.type === 'note') {
            const note = noteOrRest as Note;
            const midi = noteToMidi(note);
            const velocity = 80;
            events.push({
              time: beatPos * secPerBeat,
              duration: durBeats * secPerBeat * 0.9, // slight detach
              pitch: midi,
              velocity,
              partIndex: p,
            });
          }

          beatPos += durBeats;
        }
      }
    }

    return events;
  }

  async play(score: Score, bpm: number, metronome = false): Promise<void> {
    if (this.#state === 'playing') return;

    const ctx = await this.ensureContext();
    this.#metronomeEnabled = metronome;

    // Load instruments for all parts
    for (const part of score.parts) {
      if (!part.instrument.isPercussion) {
        await this.loadInstrument(part.instrument.gmProgram);
      }
    }

    this.#events = this.scheduleScore(score, bpm);
    this.#totalTime = this.#events.reduce(
      (max, e) => Math.max(max, e.time + e.duration),
      0,
    );

    const offset = this.#state === 'paused' ? this.#pauseTime : 0;
    this.#startTime = ctx.currentTime - offset;

    // Schedule all events
    for (const event of this.#events) {
      if (event.time < offset) continue;
      const part = score.parts[event.partIndex];
      if (!part) continue;
      const sf = this.#instruments.get(part.instrument.gmProgram);
      if (!sf) continue;

      const startAt = this.#startTime + event.time;
      sf.start({
        note: event.pitch,
        velocity: event.velocity,
        time: startAt,
        duration: event.duration,
      });
    }

    // Schedule metronome
    if (this.#metronomeEnabled) {
      this.#scheduleMetronome(ctx, score, bpm, offset);
    }

    this.#setState('playing');
    this.#startTimeUpdate(ctx);
  }

  #scheduleMetronome(ctx: AudioContext, score: Score, bpm: number, offset: number) {
    const secPerBeat = 60 / bpm;
    const firstPart = score.parts[0];
    if (!firstPart) return;

    this.#metronomGain = ctx.createGain();
    this.#metronomGain.gain.value = 0.3;
    this.#metronomGain.connect(ctx.destination);

    let beatPos = 0;
    for (const measure of firstPart.measures) {
      const time = measure.attributes?.time;
      const beatsInMeasure = time?.beats ?? 4;

      for (let b = 0; b < beatsInMeasure; b++) {
        const t = beatPos * secPerBeat;
        if (t < offset) {
          beatPos += 1;
          continue;
        }

        const startAt = this.#startTime + t;
        const freq = b === 0 ? 1000 : 800;
        const dur = b === 0 ? 0.03 : 0.02;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(this.#metronomGain!);
        gain.gain.setValueAtTime(0.5, startAt);
        gain.gain.exponentialRampToValueAtTime(0.01, startAt + dur);
        osc.start(startAt);
        osc.stop(startAt + dur);

        beatPos += 1;
      }
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
    // Stop all instruments
    for (const sf of this.#instruments.values()) {
      sf.stop();
    }
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

  dispose(): void {
    this.stop();
    this.#audioContext?.close();
    this.#audioContext = null;
    this.#instruments.clear();
  }
}
