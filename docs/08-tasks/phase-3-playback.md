# Phase 3 — Playback

Audio playback of the score with instrument sounds.

**Goal:** Users can press Play and hear the score with realistic instrument sounds.

**Depends on:** Phase 1 (Foundation), partially Phase 2 (for a score to play)

---

## Tasks

### 3.1 Audio Engine Setup

- [ ] Install audio dependencies:
  - `tone` (Tone.js — audio scheduling and effects)
  - `smplr` (soundfont instrument samples)
- [ ] Create `AudioEngine` class:
  - Initialize `AudioContext` on first user interaction (browser autoplay policy)
  - Expose `play()`, `pause()`, `stop()`, `seek(time)` methods
  - Manage playback state: `idle`, `playing`, `paused`
  - Emit `timeUpdate` events for cursor sync

### 3.2 Playback Scheduler

- [ ] Create `PlaybackScheduler` class:
  - Input: `ScoreModel` + start position
  - Output: `ScheduledEvent[]` (flat list of timed events)
- [ ] Walk through score and calculate absolute times:
  - Respect tempo markings (convert BPM to seconds per beat)
  - Handle time signature changes (affect beat grouping)
  - Handle fermatas (multiply duration by hold factor)
- [ ] Resolve repeat structures:
  - Simple repeats (repeat barlines)
  - First/second endings (volta brackets)
  - D.C., D.S., Coda, Fine jumps
- [ ] Map dynamics to velocity values
- [ ] Generate metronome click events at beat positions

### 3.3 Instrument Loading

- [ ] Create `InstrumentManager` class:
  - Load instrument samples via `smplr` on demand
  - Cache loaded instruments
  - Track loading state per instrument
  - Expose `loadInstrument(gmProgram)` and `playNote(gmProgram, pitch, velocity, duration)`
- [ ] Load instruments for all parts in the score when score opens
- [ ] Show loading progress in UI
- [ ] Fallback to piano if an instrument fails to load

### 3.4 Note Playback

- [ ] Connect scheduler output to instrument players:
  - For each `ScheduledEvent`:
    - Schedule note-on at `event.time`
    - Schedule note-off at `event.time + event.duration`
    - Use correct instrument based on `event.partIndex`
- [ ] Handle articulations:
  - Staccato: shorten duration to 50%
  - Tenuto: full written duration
  - Accent: increase velocity by ~20%
  - Marcato: increase velocity by ~30%
- [ ] Handle dynamics:
  - Apply velocity from dynamic markings
  - Crescendo/diminuendo: interpolate velocity
- [ ] Handle swing feel:
  - Delay off-beat eighth notes by swing ratio (default ~66%)

### 3.5 Transport Controls UI

- [ ] Build `<TransportBar>` component:
  - Rewind button (jump to start)
  - Play/Pause button (Space)
  - Stop button
  - Tempo display/input (BPM spinner)
  - Loop toggle
  - Metronome toggle (off / count-in / always)
  - Mixer button (opens mixer panel)
  - Progress bar / scrubber
  - Time display (current / total)
- [ ] Wire controls to AudioEngine methods
- [ ] Progress bar updates during playback
- [ ] Click on progress bar to seek

### 3.6 Playback Cursor

- [ ] Render a moving vertical line during playback
- [ ] Cursor position synced with `AudioEngine.currentTime`
- [ ] Map time → score position (measure/beat)
- [ ] Highlight currently-playing notes (color change or glow)
- [ ] Auto-scroll score canvas to keep playback cursor visible
- [ ] Cursor is visually distinct from edit cursor (different color, e.g., green)

### 3.7 Metronome

- [ ] Implement metronome click synthesis:
  - High-pitched click on beat 1 (e.g., 1000Hz, 30ms)
  - Lower-pitched click on other beats (e.g., 800Hz, 20ms)
- [ ] Three modes:
  - Off: no metronome
  - Count-in: play 1 or 2 measures before score starts
  - Always: play throughout entire score
- [ ] Metronome follows tempo changes
- [ ] Separate volume control for metronome (in mixer)

### 3.8 Mixer Panel

- [ ] Build `<MixerPanel>` component (slide-out or modal):
  - Per-part row with:
    - Instrument name + icon
    - Volume slider (0–100%)
    - Pan knob/slider (L–C–R)
    - Mute button
    - Solo button
    - Reverb amount slider
  - Master volume slider
  - Metronome volume slider
- [ ] Wire mixer controls to AudioEngine per-part settings
- [ ] Mute/solo logic: if any part is soloed, only soloed parts play
- [ ] Persist mixer settings per score (localStorage)

### 3.9 Sound Feedback During Input

- [ ] Play the note sound when a note is entered (keyboard, mouse, or MIDI)
- [ ] Short preview of the note at the correct pitch and instrument
- [ ] Configurable: can be turned off in settings
- [ ] Don't play sound during paste or batch operations

---

## Acceptance Criteria

- [ ] Can press Play and hear the score with correct instrument sounds
- [ ] Playback cursor moves through the score in sync with audio
- [ ] Can pause and resume playback
- [ ] Can stop playback (cursor returns to start)
- [ ] Tempo control works (change BPM, playback speed changes)
- [ ] Metronome works in all three modes
- [ ] Mixer allows per-part volume, mute, solo
- [ ] Dynamics (p, f, crescendo, etc.) are audible in playback
- [ ] Repeats and jumps (D.C., D.S., codas) play in correct order
- [ ] Notes make sound when entered in the editor
