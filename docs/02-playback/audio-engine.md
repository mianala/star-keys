# Audio Engine

Architecture for the score playback system.

---

## Overview

The audio engine converts the internal score model into timed audio events using Web Audio API. It handles scheduling, tempo changes, repeats, dynamics, and instrument switching.

```
ScoreModel ──► PlaybackScheduler ──► AudioEngine ──► Web Audio Output
                    │                      │
                    │                      ├── InstrumentPlayer (smplr)
                    │                      ├── MetronomePlayer (Tone.js)
                    │                      └── EffectsChain (reverb, etc.)
                    │
                    └── CursorSync (highlight current note in UI)
```

---

## Components

### 1. PlaybackScheduler

Converts score data into a flat timeline of audio events.

**Responsibilities:**
- Walk through the score measure by measure, part by part
- Resolve repeats (D.C., D.S., codas, volta brackets, repeat barlines)
- Calculate absolute time (in seconds) for each note based on tempo markings
- Handle tempo changes (accelerando, ritardando) as interpolated tempo curves
- Handle fermatas (configurable hold multiplier, default 2x)
- Interpret swing feel (delay off-beat 8th notes)
- Resolve dynamics to velocity values (pp=40, mp=64, mf=80, f=100, ff=120, etc.)
- Generate metronome click events at beat positions
- Output: `ScheduledEvent[]`

```typescript
interface ScheduledEvent {
  type: 'note' | 'rest' | 'metronome';
  time: number;          // absolute time in seconds
  duration: number;      // duration in seconds
  pitch?: string;        // e.g., "C4", "Bb3"
  midiNote?: number;     // MIDI note number 0-127
  velocity: number;      // 0-127
  partIndex: number;     // which instrument/part
  instrumentId: string;  // soundfont instrument name
  articulation?: string; // staccato, accent, etc.
}
```

### 2. AudioEngine

Manages Web Audio context and routes events to instrument players.

**Responsibilities:**
- Initialize and resume `AudioContext` (handle browser autoplay policy)
- Maintain playback state: playing, paused, stopped
- Schedule events using look-ahead buffer (schedule 100ms ahead for glitch-free audio)
- Handle play, pause, stop, seek commands
- Route events to correct instrument player by `partIndex`
- Apply master volume
- Emit `currentTime` updates for cursor sync

### 3. InstrumentPlayer

Wraps `smplr` (or `SpessaSynth`) to play individual instrument sounds.

**Responsibilities:**
- Load instrument samples on demand (lazy loading from CDN)
- Play notes with correct pitch, velocity, and duration
- Handle articulations:
  - Staccato: reduce duration to 50%
  - Tenuto: full duration
  - Accent: increase velocity by 20%
  - Marcato: increase velocity by 30%
  - Fermata: handled by scheduler (extended duration)
- Support per-part volume, pan, mute, solo
- Handle sustain pedal (hold notes until pedal off)

### 4. MetronomePlayer

Generates click sounds on beat positions.

**Modes:**
- **Off** — no metronome
- **Count-in only** — plays 1 or 2 measures before score starts, then stops
- **Always on** — plays throughout entire playback

**Sound:** Short click synthesized with Tone.js oscillator (high pitch for beat 1, lower for other beats). Alternatively, use a sample.

### 5. MixerState

Per-part audio settings.

```typescript
interface PartMixerSettings {
  volume: number;   // 0.0 – 1.0
  pan: number;      // -1.0 (left) to 1.0 (right)
  mute: boolean;
  solo: boolean;
  reverb: number;   // 0.0 – 1.0 (wet/dry mix)
}
```

---

## Playback Flow

### Start Playback

1. User presses Play (or `Space`)
2. Resume `AudioContext` if suspended (browser autoplay policy)
3. `PlaybackScheduler` generates `ScheduledEvent[]` from current cursor position to end
4. `AudioEngine` begins scheduling events using look-ahead loop
5. UI cursor begins advancing in sync with `currentTime`

### Pause

1. `AudioEngine` stops scheduling new events
2. All currently sounding notes are released (noteOff)
3. Store current time position
4. UI cursor stops

### Stop

1. Same as Pause
2. Reset time position to start (or to the position where Play was initiated)
3. UI cursor returns to start position

### Seek

1. If playing: pause, update position, resume
2. If stopped: just update cursor position

---

## Tempo Handling

```
BPM Timeline:
  m.1: ♩=120  →  m.5: rit.  →  m.8: ♩=80  →  m.9: a tempo (♩=120)

Scheduler converts this to:
  [0s - 10s]:   120 BPM (constant)
  [10s - 16s]:  120→80 BPM (linear interpolation over 3 measures)
  [16s - 18s]:  80 BPM (constant)
  [18s+]:       120 BPM (constant)
```

Each note's absolute time is calculated by integrating the tempo curve.

---

## Dynamics Mapping

| Dynamic | Velocity (0–127) |
|---|---|
| ppp | 20 |
| pp | 36 |
| p | 52 |
| mp | 68 |
| mf | 84 |
| f | 100 |
| ff | 116 |
| fff | 127 |
| sfz | 120 (then return to previous) |
| fp | 120 then 52 |

Crescendo/diminuendo: linearly interpolate velocity between start and end dynamic over the spanned notes.

---

## Repeat & Jump Resolution

The scheduler must resolve the playback order before generating events:

```
Example: ‖: m.1 | m.2 | m.3 :‖ m.4 | m.5 D.S. al Coda | m.6 (Coda)

Playback order:
  m.1 → m.2 → m.3 → m.1 → m.2 → m.3 → m.4 → m.5 → (jump to Segno)
  → m.1 → m.2 → (jump to Coda) → m.6
```

Algorithm:
1. Build a measure-order list resolving all repeats first
2. Then process D.C./D.S. jumps
3. Then generate events from the resolved measure sequence

---

## Latency & Performance

- **Look-ahead scheduling:** Schedule 100–200ms of events ahead of current time. This prevents audio glitches while keeping latency low enough for interactive scrubbing.
- **Lazy instrument loading:** Only load soundfont data for instruments present in the score. Show loading indicator for first playback.
- **Web Worker (future):** Move scheduler computation to a Web Worker to prevent UI thread blocking on large scores.
- **AudioWorklet (future):** Use AudioWorklet for custom synthesis or effects that need sample-accurate timing.
