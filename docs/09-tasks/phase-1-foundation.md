# Phase 1 — Foundation

Project setup, core data model, and basic rendering.

**Goal:** Display a MusicXML score in the browser and have a basic editor shell.

---

## Tasks

### 1.1 Project Setup

- [ ] Install core dependencies:
  - `opensheetmusicdisplay` (notation rendering)
  - `vexflow` (low-level rendering, peer dep of OSMD)
  - `tonal` (music theory)
  - `jszip` (MusicXML .mxl decompression)
- [ ] Configure TypeScript paths and aliases (`@/components`, `@/core`, etc.)
- [ ] Set up folder structure:
  ```
  src/
  ├── components/
  ├── core/
  ├── hooks/
  ├── stores/
  ├── types/
  └── utils/
  ```
- [ ] Add base CSS variables for theming (light/dark mode)
- [ ] Set up basic routing (if needed) or single-page layout

### 1.2 Score Data Model

- [ ] Define TypeScript types for the internal score model:
  - `Score`, `Part`, `Measure`, `Note`, `Rest`, `Chord`
  - `Attributes` (clef, key, time signature, divisions)
  - `Pitch`, `Duration`, `Accidental`
  - `Direction` (tempo, dynamics)
  - `Barline`
- [ ] Implement score model factory functions (create empty score, add measure, add note)
- [ ] Implement undo/redo system (command pattern):
  - `CommandHistory` class with undo/redo stacks
  - Each edit operation is a `Command` with `execute()` and `undo()`
- [ ] Write unit tests for score model operations

### 1.3 MusicXML Parser

- [ ] Implement MusicXML → ScoreModel parser:
  - Parse `<score-partwise>` structure
  - Parse `<part-list>` (instruments)
  - Parse `<attributes>` (clef, key, time, divisions)
  - Parse `<note>` (pitch, duration, type, dots, accidentals)
  - Parse `<rest>`
  - Parse `<chord>` flag
  - Parse `<tie>` and `<tied>`
  - Parse `<voice>`
  - Parse `<backup>` and `<forward>`
  - Parse `<barline>` (types, repeats)
  - Parse `<direction>` (tempo, dynamics)
- [ ] Handle .mxl files (unzip with JSZip, find root XML)
- [ ] Write tests with sample MusicXML files

### 1.4 MusicXML Serializer

- [ ] Implement ScoreModel → MusicXML serializer:
  - Generate valid `<score-partwise>` XML
  - Serialize all elements parsed in 1.3
- [ ] Round-trip test: parse → serialize → parse → compare

### 1.5 Score Renderer Component

- [ ] Create `<ScoreRenderer>` React component wrapping OSMD
- [ ] Load OSMD, pass MusicXML string, render to SVG
- [ ] Handle resize (re-render on window resize)
- [ ] Support zoom level prop
- [ ] Support dark mode (invert notation colors)
- [ ] Create sample score for development/testing

### 1.6 Editor Shell

- [ ] Create main `<Editor>` layout component:
  - Menu bar (placeholder items)
  - Toolbar area (placeholder)
  - Score canvas area (uses `<ScoreRenderer>`)
  - Transport bar area (placeholder)
  - Virtual instrument area (placeholder)
- [ ] Implement basic score canvas scrolling (horizontal + vertical)
- [ ] Implement zoom controls (Ctrl+=/-, Ctrl+0)
- [ ] Parts panel skeleton (left sidebar, show part names)
- [ ] Inspector panel skeleton (right sidebar)

### 1.7 New Score Wizard

- [ ] Create dialog component for new score creation
- [ ] Step 1: Title, composer, tempo, time signature
- [ ] Step 2: Instrument picker (search + add)
- [ ] Step 3: Key signature, number of measures
- [ ] Generate empty ScoreModel from wizard inputs
- [ ] Render the new score in the editor

---

## Acceptance Criteria

- [ ] Can create a new score via the wizard
- [ ] Score renders in the browser with correct notation
- [ ] Can open an existing MusicXML file and display it
- [ ] Score re-renders on window resize
- [ ] Zoom in/out works
- [ ] Dark mode toggle changes score appearance
- [ ] Parts panel shows instrument names
- [ ] Undo/redo framework is in place (even if no edits yet)
