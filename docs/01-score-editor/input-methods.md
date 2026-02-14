# Input Methods

All the ways a user can enter and edit notes in the score editor.

---

## 1. Computer Keyboard Input

The primary input method. Keys A–G enter notes, number keys select duration.

### Note Entry Keys

| Key | Action |
|---|---|
| `A`–`G` | Enter note at current cursor position |
| `0` | Enter rest at current duration |
| `1`–`7` | Select duration (1=whole, 2=half, 3=quarter, 4=eighth, 5=16th, 6=32nd, 7=64th) |
| `.` | Toggle dot on current duration |
| `+` / `-` | Raise/lower selected note by a semitone |
| `Shift+Up/Down` | Raise/lower by an octave |
| `Up/Down` | Move note up/down by a step (diatonic) |
| `Left/Right` | Move cursor to previous/next note |
| `Ctrl+Left/Right` | Move cursor to previous/next measure |
| `Home/End` | Jump to beginning/end of score |
| `Space` | Toggle playback |
| `Delete/Backspace` | Delete selected note(s) |
| `T` | Toggle tie from current note |
| `I` | Toggle insert/replace mode |

### Modifier Keys

| Modifier | Action |
|---|---|
| `Shift+A–G` | Add note to current chord (instead of moving cursor) |
| `Shift+Left/Right` | Extend selection |
| `Ctrl+G` | Go to measure number |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+A` | Select all |
| `Ctrl+C/V/X` | Copy/paste/cut |

### Implementation Notes

- Keyboard shortcuts should be fully customizable (store in user preferences)
- Context-sensitive shortcuts: pitched input vs. unpitched (percussion) vs. tablature
- Show shortcut reference panel (toggled with `?` key)

---

## 2. Mouse / Pointer Input

Click-to-place notes on the staff.

| Action | Behavior |
|---|---|
| Click on staff | Place note at clicked pitch and position |
| Click on existing note | Select that note |
| Click + drag | Select a range of notes |
| Double-click on text | Edit lyrics/chord/expression text |
| Right-click | Context menu (delete, cut, copy, properties) |
| Scroll wheel | Scroll score horizontally |
| Ctrl + scroll | Zoom in/out |

### Implementation Notes

- Need hit-testing against rendered SVG elements to map click coordinates → staff position → pitch
- Use VexFlow's bounding box data or custom overlay grid
- Snap-to-staff-line behavior for pitch determination

---

## 3. MIDI Keyboard Input

Physical MIDI controller connected via Web MIDI API.

### Step Entry Mode (Default)

1. Select a duration using number keys (1–7)
2. Press a key on the MIDI keyboard
3. Note is placed at cursor with the selected duration
4. Cursor advances automatically
5. Pressing multiple keys simultaneously creates a chord

### Live Recording Mode

1. Press record button (or `R` key)
2. Metronome count-in plays (configurable: 1 or 2 measures)
3. Play freely — system records with real-time quantization
4. Press stop — recorded notes are placed in the score

### Configuration

| Setting | Description |
|---|---|
| Input device | Select from available MIDI devices |
| Output device | Route playback to external MIDI device |
| Velocity sensitivity | Enable/disable, sensitivity curve |
| Quantization | Snap recorded notes to nearest grid value |
| "Write while playing" | Toggle: hear note without adding to score |

### Implementation Notes

- Use `WEBMIDI.js` for device enumeration and event handling
- Listen for `noteon` / `noteoff` events
- Map MIDI note numbers → pitch names using `tonal`
- Handle velocity for dynamics (optional)
- Calibration step for live recording (analyze user's timing)

---

## 4. Virtual On-Screen Instruments

### Virtual Piano

- Displayed at the bottom of the editor
- 2-octave keyboard (scrollable range)
- Click/tap keys to enter notes
- Highlights currently playing notes during playback
- Shows note names on keys (toggleable)

### Virtual Guitar Fretboard (Post-MVP)

- Shown instead of piano when a tablature part is selected
- Displays current tuning and capo
- Click on string/fret to enter tab number
- Visual feedback for selected notes

### Virtual Drum Pad (Post-MVP)

- Shown instead of piano when a percussion part is selected
- Grid of pads mapped to percussion instruments
- Click/tap to enter percussion notes
- Customizable pad assignments

### Implementation Notes

- Virtual instruments are React components
- State: which keys/pads are pressed (for visual feedback)
- Same note entry pipeline as keyboard/MIDI — they all emit "note input" events

---

## 5. Touch Input

For tablet/touch devices.

| Gesture | Action |
|---|---|
| Tap on staff | Place note (same as mouse click) |
| Tap on note | Select note |
| Long press | Context menu |
| Pinch | Zoom in/out |
| Two-finger drag | Scroll/pan |
| Swipe on virtual piano | Scroll octave range |

### Implementation Notes

- Use pointer events (unified mouse + touch API)
- Virtual piano/fretboard/drum pads are touch-optimized
- Toolbar should be touch-friendly (large tap targets)

---

## Input Mode State Machine

```
┌──────────────┐
│   IDLE       │◄────── ESC / click empty area
│  (selection)  │
└──────┬───────┘
       │ press note key / click staff / MIDI noteon
       ▼
┌──────────────┐
│  NOTE INPUT  │──── duration key ──► stay in NOTE INPUT
│  (insert or  │──── note key ──────► place note, advance cursor
│   replace)   │──── Shift+note ───► add to chord
└──────┬───────┘
       │ I key
       ▼
┌──────────────┐
│  REPLACE     │  (overwrites existing note at cursor)
│  MODE        │
└──────────────┘

┌──────────────┐
│  RECORDING   │──── R key / record button
│  (live MIDI) │──── stop button ──► quantize & commit
└──────────────┘
```

Each input method feeds into the same command pipeline:

```
Input Event → NoteInputCommand → ScoreModel.applyEdit() → Re-render
```
