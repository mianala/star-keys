# MIDI Recording

Capturing notes from a physical MIDI keyboard in real time.

---

## Recording Modes

### Step Entry (Default)

The simplest and most precise input method. User controls rhythm manually.

**Flow:**
1. Select a duration in the toolbar (e.g., quarter note)
2. Press a key on the MIDI keyboard
3. Note appears at cursor with the selected duration
4. Cursor advances to the next beat position
5. To make a chord: hold first key + press additional keys before releasing

**Implementation:**
```
MIDI noteon → {
  if (isFirstNoteInGesture) {
    startNewNote(midiNote, currentDuration)
  } else {
    addToChord(midiNote)  // held notes = chord
  }
}

MIDI noteoff → {
  if (allKeysReleased) {
    commitNote()
    advanceCursor()
    isFirstNoteInGesture = true
  }
}
```

**Chord detection:** If multiple keys are pressed before any are released, they form a chord. A small debounce window (~50ms) handles slightly staggered presses.

---

### Live Recording

Real-time performance capture with automatic rhythmic quantization.

**Flow:**
1. Press Record button (or `R` key)
2. Optional: calibration prompt (first time only)
3. Metronome count-in (1 or 2 measures, configurable)
4. Playback begins, user plays along
5. System records note events with timestamps
6. User presses Stop
7. Quantization algorithm processes recorded notes
8. Quantized notes inserted into score

**Implementation:**
```
startRecording():
  startTime = audioContext.currentTime + countInDuration
  recordedNotes = []
  startMetronomeCountIn()
  startPlayback()

MIDI noteon → {
  recordedNotes.push({
    midiNote,
    velocity,
    onTime: audioContext.currentTime - startTime
  })
}

MIDI noteoff → {
  findMatchingNoteOn(midiNote).offTime = audioContext.currentTime - startTime
}

stopRecording():
  stopPlayback()
  quantizedNotes = quantize(recordedNotes, quantizeGrid)
  insertIntoScore(quantizedNotes, recordingStartPosition)
```

---

## Calibration

First-time setup for live recording. Analyzes the user's playing characteristics.

**Process:**
1. Show dialog: "Play a steady stream of quarter notes along with the metronome"
2. Play 8 beats of metronome at ♩=80
3. User plays along
4. Analyze:
   - **Average latency:** Offset between metronome beat and user's note onset
   - **Timing variance:** How steady the user plays
5. Use latency offset to compensate during quantization

**Stored in user preferences.** Can be re-run from settings.

---

## Quantization Algorithm

Convert free-form timing into snapped rhythmic values.

### Input
```typescript
interface RawNote {
  midiNote: number;
  velocity: number;
  onTime: number;   // seconds from recording start
  offTime: number;   // seconds from recording start
}
```

### Process

1. **Subtract latency offset** from all note times
2. **Build a beat grid** based on tempo and time signature:
   ```
   Grid positions at ♩=120, quantize=1/8:
   0.000, 0.250, 0.500, 0.750, 1.000, 1.250, ...
   ```
3. **Snap note onset** to nearest grid position
4. **Calculate duration** from onset to offset
5. **Snap duration** to nearest standard note value:
   ```
   Duration → Nearest:
   0.48s → 0.5s (quarter at ♩=120)
   0.23s → 0.25s (eighth at ♩=120)
   ```
6. **Resolve overlaps:** If two consecutive notes overlap after snapping, shorten the first
7. **Detect rests:** Gaps between notes become rests
8. **Pitch spelling:** Use key signature context to spell enharmonically (via `tonal`)

### Quantize Grid Options

| Grid | Musical Value | Threshold |
|---|---|---|
| 1/4 | Quarter notes only | ±125ms at ♩=120 |
| 1/8 | Up to eighth notes | ±62ms at ♩=120 |
| 1/8T | Include triplets | ±42ms at ♩=120 |
| 1/16 | Up to 16th notes | ±31ms at ♩=120 |
| 1/16T | Include 16th triplets | ±21ms at ♩=120 |

---

## "Write While Playing" Mode

A toggle that lets the user play the MIDI keyboard to hear sounds without adding notes to the score. Useful for:
- Trying out ideas before committing
- Using the keyboard as a playback instrument
- Practicing before recording

When enabled:
- MIDI noteon → play sound via InstrumentPlayer
- Do NOT create notes in the score
- Visual indicator: "Audition mode" in status bar

---

## MIDI Device Selection UI

```
┌──────────────────────────────────────────┐
│  MIDI Settings                           │
│                                          │
│  Input Device:                           │
│  ┌────────────────────────────────┐      │
│  │ USB MIDI Keyboard        ▼    │      │
│  └────────────────────────────────┘      │
│                                          │
│  Output Device:                          │
│  ┌────────────────────────────────┐      │
│  │ None (use built-in sounds) ▼  │      │
│  └────────────────────────────────┘      │
│                                          │
│  [Calibrate]  [Test Connection]          │
│                                          │
│  Status: ● Connected                     │
└──────────────────────────────────────────┘
```

- Show available MIDI devices in dropdown
- Auto-detect when devices are plugged in/removed
- Test button: play a test note to verify connection
- Status indicator: connected / disconnected / not available (no Web MIDI support)
