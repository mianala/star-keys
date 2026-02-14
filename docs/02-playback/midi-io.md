# MIDI I/O

MIDI input from physical devices and MIDI file import/export.

---

## MIDI Device Input

### Web MIDI API via WEBMIDI.js

```typescript
// Device enumeration
import { WebMidi } from 'webmidi';

await WebMidi.enable();
const inputs = WebMidi.inputs;   // available MIDI input devices
const outputs = WebMidi.outputs; // available MIDI output devices
```

### Event Handling

| Event | Data | Use |
|---|---|---|
| `noteon` | note, velocity, channel | Place note in score (step mode) or record (live mode) |
| `noteoff` | note, channel | End note in live recording mode |
| `controlchange` | controller#, value | Sustain pedal (CC64), modulation, etc. |
| `pitchbend` | value | Not used for notation (ignored) |
| `programchange` | program | Could switch instrument |

### Step Entry Flow

```
1. User selects duration (e.g., quarter note) via keyboard/toolbar
2. User presses key on MIDI controller
3. System receives `noteon` event
4. Map MIDI note number → pitch name (e.g., 60 → "C4")
5. Create note in score at cursor position with selected duration
6. Advance cursor
7. If multiple keys pressed simultaneously → create chord
```

### Live Recording Flow

```
1. User presses Record button
2. Metronome count-in plays (1-2 measures)
3. Transport starts, clock begins
4. For each `noteon`:
   - Record {midiNote, timestamp, velocity}
5. For each `noteoff`:
   - Record {midiNote, timestamp}
6. User presses Stop
7. Quantization pass:
   - Snap note start times to nearest grid (e.g., 16th note)
   - Calculate note durations from on/off pairs
   - Snap durations to nearest standard duration
8. Insert quantized notes into score at recording start position
```

### Quantization Settings

| Grid | Description |
|---|---|
| 1/4 | Quarter note grid (loose) |
| 1/8 | Eighth note grid (standard) |
| 1/16 | Sixteenth note grid (tight) |
| 1/32 | 32nd note grid (very tight) |
| None | No quantization (raw input) |

---

## MIDI Output

Route score playback to external MIDI devices.

### Use Cases

- Send notes to external synthesizers/keyboards
- Route to DAW software (Logic, Ableton, etc.)
- Drive virtual instruments (VSTi)

### Implementation

```
PlaybackScheduler events
    → for each note event:
        → send MIDI noteOn to selected output port
        → schedule MIDI noteOff after note duration
```

**Constraint:** A MIDI port cannot be used as both input and output simultaneously.

---

## MIDI File Import

Parse standard MIDI files (.mid) and convert to internal score model.

### Challenges

MIDI files contain:
- Note on/off events with timing (ticks, not beats)
- Tempo changes (microseconds per quarter note)
- Program changes (instrument selection)
- Control changes

MIDI files do NOT contain:
- Pitch spelling (is it F# or Gb?)
- Beam grouping
- Articulations, dynamics (only velocity)
- Slurs, ties (only note durations)
- Key signature (sometimes included but unreliable)
- Part names (only track names)

### Import Algorithm

1. Parse MIDI file into track/event data
2. Resolve timing: convert ticks → beats → measures
3. Detect time signature from MIDI meta events (or assume 4/4)
4. Detect key signature from MIDI meta events (or use heuristic)
5. For each track:
   a. Identify instrument from program change
   b. Group note-on/note-off pairs into notes
   c. Quantize to nearest standard duration
   d. Determine pitch spelling using key context
   e. Assign beaming based on time signature
   f. Map velocity → dynamic markings
6. Build score model from collected data

### Library

Use `midi-player-js` or write a custom parser using the Web MIDI file spec. The MIDI file format is well-documented and relatively simple to parse.

---

## MIDI File Export

Convert internal score model to standard MIDI file.

### Export Algorithm

1. Create MIDI file header (format 1, one track per part + tempo track)
2. Write tempo track:
   - Time signature meta events
   - Key signature meta events
   - Tempo meta events (BPM → microseconds per quarter)
3. For each part, write note track:
   - Program change (instrument selection)
   - For each note:
     - Note on event (with velocity from dynamics)
     - Note off event (after note duration)
   - Handle repeats by expanding them
4. Encode as binary MIDI file
5. Offer as download

### MIDI Timing

```
MIDI uses "ticks" as its time unit.
Standard: 480 ticks per quarter note (PPQ)

Quarter note = 480 ticks
Eighth note  = 240 ticks
16th note    = 120 ticks
Dotted quarter = 720 ticks
Triplet eighth = 160 ticks
```
