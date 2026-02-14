# Tech Stack & Library Selection

## Application Framework

| Concern | Choice | Rationale |
|---|---|---|
| UI Framework | **React 19** | Already configured in the project, React Compiler enabled |
| Language | **TypeScript** (strict mode) | Already configured, type safety for complex music data structures |
| Build Tool | **Vite 8** | Already configured with HMR |
| Package Manager | **pnpm** | Already configured |
| Styling | **Plain CSS** | Already configured, light/dark mode via `prefers-color-scheme` |

## Core Music Libraries

### Notation Rendering — OpenSheetMusicDisplay (OSMD)

- **Package:** `opensheetmusicdisplay`
- **GitHub:** [opensheetmusicdisplay/opensheetmusicdisplay](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay)
- **Stars:** ~1,800
- **Why:** Built on VexFlow, reads MusicXML natively, handles layout/pagination automatically. Best balance of ease-of-use and rendering quality.
- **Role:** Renders the score from our internal MusicXML representation to SVG.

### Low-Level Rendering — VexFlow

- **Package:** `vexflow`
- **GitHub:** [vexflow/vexflow](https://github.com/vexflow/vexflow)
- **Stars:** ~4,200
- **Why:** OSMD uses VexFlow under the hood. We may need direct VexFlow access for custom interactive editing features (note dragging, selection highlighting, cursor rendering).
- **Role:** Fine-grained control over individual notation elements when OSMD's API isn't enough.

### MusicXML Parsing

- **Approach:** Use OSMD's built-in MusicXML parser for rendering. For programmatic score manipulation (adding/removing notes, transposition), maintain our own internal score model and serialize to/from MusicXML.
- **Fallback:** `musicxml-interfaces` for TypeScript type definitions of MusicXML elements.

## Audio & Playback

### Soundfont Playback — smplr

- **Package:** `smplr`
- **GitHub:** [danigb/smplr](https://github.com/danigb/smplr)
- **Stars:** ~274
- **Why:** Modern, actively maintained. Loads instrument samples from CDN with zero server setup. Successor to the popular `soundfont-player`.
- **Role:** Primary instrument sound source for playback.

### Audio Framework — Tone.js

- **Package:** `tone`
- **GitHub:** [Tonejs/Tone.js](https://github.com/Tonejs/Tone.js)
- **Stars:** ~14,700
- **Why:** Industry-standard Web Audio framework. Provides transport/scheduling, effects (reverb, panning), and precise timing — critical for music playback.
- **Role:** Audio scheduling, transport control (play/pause/stop), metronome, effects bus, mixer.

### Alternative: SpessaSynth

- **Package:** `spessasynth_lib`
- **GitHub:** [spessasus/SpessaSynth](https://github.com/spessasus/SpessaSynth)
- **Stars:** ~304
- **Why:** Full MIDI player + SF2 synthesizer. Could replace both smplr and Tone.js for a simpler architecture. Actively maintained, TypeScript.
- **Role:** Considered as a unified alternative if smplr + Tone.js proves too complex.

## MIDI

### MIDI Keyboard Input — WEBMIDI.js

- **Package:** `webmidi`
- **GitHub:** [djipco/webmidi](https://github.com/djipco/webmidi)
- **Stars:** ~1,700
- **Why:** Definitive Web MIDI API wrapper. Clean event API for `noteon`, `noteoff`, `controlchange`. TypeScript support.
- **Role:** Connects physical MIDI keyboards for step-entry and live recording input.

### MIDI File I/O — MidiPlayerJS + custom

- **Package:** `midi-player-js`
- **Role:** Parse MIDI files for import. For export, we'll convert our internal score model to MIDI events.

## Music Theory — tonal

- **Package:** `tonal`
- **GitHub:** [tonaljs/tonal](https://github.com/tonaljs/tonal)
- **Stars:** ~4,100
- **Why:** The only serious music theory library in JS. Covers notes, intervals, scales, chords, keys, transposition.
- **Role:** Transposition, enharmonic spelling, chord symbol parsing, interval calculations.

## Real-Time Collaboration — Yjs

- **Package:** `yjs`
- **GitHub:** [yjs/yjs](https://github.com/yjs/yjs)
- **Stars:** ~21,200
- **Why:** Most mature CRDT library. Offline editing, undo/redo, awareness (cursors/presence). Network-agnostic.
- **Role:** Post-MVP. Model score document as Yjs shared types for real-time multi-user editing.

## PDF Export — jsPDF

- **Package:** `jspdf`
- **GitHub:** [parallax/jsPDF](https://github.com/parallax/jsPDF)
- **Stars:** ~31,100
- **Why:** Most popular client-side PDF generator. Can embed SVG output from OSMD/VexFlow.
- **Role:** Export print-quality PDF of the rendered score.

## Audio Recording — Native APIs

- **Approach:** Use `navigator.mediaDevices.getUserMedia()` + `MediaRecorder` for microphone recording. Lightweight, no library needed.
- **Fallback:** `RecordRTC` if cross-browser format support becomes an issue.

## State Management

- **Approach:** React Context + `useReducer` for editor state (current tool, selection, cursor position). The score document itself is a custom data model (not stored in React state directly) to avoid re-render overhead on every note edit.
- **Post-MVP:** Integrate with Yjs shared types for collaborative state.

## File Structure (Planned)

```
src/
├── components/         # React UI components
│   ├── editor/         # Score editor canvas, cursor, selection
│   ├── toolbar/        # Note input, articulations, dynamics palettes
│   ├── playback/       # Transport controls, mixer, metronome
│   ├── sidebar/        # Instruments panel, parts list
│   └── dialogs/        # New score, import/export, settings
├── core/               # Non-React business logic
│   ├── score/          # Internal score data model
│   ├── musicxml/       # MusicXML serialization/deserialization
│   ├── midi/           # MIDI file I/O and device input
│   ├── audio/          # Playback engine (Tone.js + smplr)
│   └── theory/         # Music theory utilities (wraps tonal)
├── hooks/              # Custom React hooks
├── stores/             # State management (context + reducers)
├── types/              # Shared TypeScript types
└── utils/              # General utilities
```
