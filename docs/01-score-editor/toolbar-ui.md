# Toolbar & Editor UI

Layout and organization of the score editor's toolbar and tool palettes.

---

## Toolbar Architecture

The editor uses a **multi-row toolbar** at the top of the screen with tab-based palette switching. This mirrors flat.io's toolbar organization.

```
┌─────────────────────────────────────────────────────────────────┐
│ [File] [Edit] [View]   Star Keys                    [Settings]  │
├─────────────────────────────────────────────────────────────────┤
│ [Notes] [Artic.] [Dynamics] [Measures] [Text] [Layout] [Parts] │
├─────────────────────────────────────────────────────────────────┤
│  ← Active palette contents (changes based on selected tab) →    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Menu Bar

### File Menu

| Item | Shortcut | Description |
|---|---|---|
| New Score | `Ctrl+N` | Create new score wizard |
| Open | `Ctrl+O` | Open MusicXML/MIDI file |
| Save | `Ctrl+S` | Save to MusicXML |
| Save As | `Ctrl+Shift+S` | Save with new name/format |
| Import | — | Import from file (MusicXML, MIDI) |
| Export as PDF | — | Generate PDF |
| Export as MIDI | — | Generate MIDI file |
| Export as PNG/SVG | — | Export score image |
| Print | `Ctrl+P` | Print score |

### Edit Menu

| Item | Shortcut | Description |
|---|---|---|
| Undo | `Ctrl+Z` | Undo last action |
| Redo | `Ctrl+Y` | Redo undone action |
| Cut | `Ctrl+X` | Cut selection |
| Copy | `Ctrl+C` | Copy selection |
| Paste | `Ctrl+V` | Paste at cursor |
| Select All | `Ctrl+A` | Select all notes |
| Transpose | `Ctrl+T` | Open transpose dialog |

### View Menu

| Item | Shortcut | Description |
|---|---|---|
| Zoom In | `Ctrl+=` | Increase zoom |
| Zoom Out | `Ctrl+-` | Decrease zoom |
| Reset Zoom | `Ctrl+0` | Reset to 100% |
| Full Screen | `Ctrl+Shift+F` | Toggle fullscreen |
| Dark Mode | — | Toggle dark/light theme |
| Concert Pitch | — | Toggle concert pitch display |
| Show Parts | — | Toggle parts panel |

---

## Tool Palettes

### Notes Palette

```
┌──────────────────────────────────────────────────────────────────┐
│ 𝅝  𝅗𝅥  ♩  ♪  𝅘𝅥𝅯  𝅘𝅥𝅰 │ 𝄾  𝄿  𝅀  𝅁 │ •  •• │ ♯  ♭  ♮  𝄪  𝄫 │ ⌒ │
│ whole half qtr 8th 16 32│ rest sizes │ dots│ accidentals     │tie│
└──────────────────────────────────────────────────────────────────┘
```

| Button | Description |
|---|---|
| Duration buttons | Select note/rest duration (1–7) |
| Rest toggle | Switch between note and rest input |
| Dot / Double dot | Toggle dotted duration |
| Accidental buttons | Sharp, flat, natural, double sharp, double flat |
| Tie button | Start/end tie from current note |
| Tuplet button | Create tuplet (opens tuplet config: 3:2, 5:4, etc.) |
| Voice selector | Switch between Voice 1 / Voice 2 |
| Insert/Replace toggle | Switch input mode |

### Articulations Palette

| Button | Description |
|---|---|
| Staccato | Add staccato dot |
| Staccatissimo | Add staccatissimo wedge |
| Accent | Add accent mark |
| Marcato | Add marcato hat |
| Tenuto | Add tenuto line |
| Fermata | Add fermata |
| Slur | Start/end slur |
| Grace note | Add grace note before selected note |
| Up bow / Down bow | String bowing indicators |

### Dynamics Palette

| Button | Description |
|---|---|
| ppp – fff | Select and place dynamic marking |
| sfz, fp, rfz | Special dynamics |
| Crescendo | Start crescendo hairpin |
| Diminuendo | Start diminuendo hairpin |
| Pedal on/off | Sustain pedal markings |

### Measures Palette

| Button | Description |
|---|---|
| Insert measure | Add empty measure at cursor |
| Delete measure | Remove selected measure |
| Barline type | Select: single, double, final, repeat L/R |
| Key signature | Change key signature |
| Time signature | Change time signature |
| Clef | Change clef |
| Tempo marking | Set tempo (BPM + text) |
| Rehearsal mark | Add rehearsal letter/number |
| Repeat jumps | Segno, Coda, D.C., D.S., Fine |
| Volta brackets | 1st/2nd endings |

### Text Palette

| Button | Description |
|---|---|
| Lyrics | Enter lyrics mode (type below notes) |
| Chord symbols | Enter chord symbol mode (type above staff) |
| Expression text | Free text annotation |
| Tempo text | Add tempo description |

### Layout Palette

| Button | Description |
|---|---|
| System break | Force new system at selected barline |
| Page break | Force new page at selected barline |
| Music font | Select from available SMuFL fonts |
| Staff spacing | Adjust space between staves |

### Parts Palette

| Button | Description |
|---|---|
| Add instrument | Add new part/instrument to score |
| Remove instrument | Remove selected part |
| Reorder | Drag to reorder parts |
| Show/hide | Toggle part visibility |
| Instrument change | Change instrument sound for part |

---

## Playback Transport Bar

Fixed at the bottom of the screen, above the virtual instrument.

```
┌─────────────────────────────────────────────────────────────────┐
│ [|◀] [▶/❚❚] [■]  ♩= 120 ▼  [🔁 Loop]  [🥁 Metro]  [🔊 Mixer] │
│  rew  play   stop  tempo     loop toggle  metronome   mixer     │
│                                                                  │
│ ───────────●──────────────────── 2:34 / 5:12                    │
│            progress bar / scrubber                                │
└─────────────────────────────────────────────────────────────────┘
```

| Control | Description |
|---|---|
| Rewind | Jump to start |
| Play/Pause | Toggle playback (`Space`) |
| Stop | Stop and return cursor to start |
| Tempo | Adjustable BPM (spinner + dropdown presets) |
| Loop | Toggle loop mode (loop selection or entire score) |
| Metronome | Toggle: off / count-in only / always |
| Mixer | Open mixer panel (per-part volume, mute, solo) |
| Progress bar | Click to seek, drag to scrub |
| Time display | Current position / total duration |

---

## Virtual Instrument Panel

Docked at the bottom, below the transport bar.

```
┌─────────────────────────────────────────────────────────────────┐
│ ◀ │ █ ░ █ ░ █ █ ░ █ ░ █ ░ █ █ ░ █ ░ █ █ ░ █ ░ █ ░ █ │ ▶ │
│   │ C  D  E F  G  A  B C  D  E F  G  A  B C  D  E F  │   │
│   │           ← 2-octave piano keyboard →              │   │
└─────────────────────────────────────────────────────────────────┘
```

- Scrollable with ◀/▶ buttons or drag
- Highlights notes during playback
- Click to input notes
- Swaps to fretboard (tab parts) or drum pads (percussion parts)

---

## Responsive Layout

| Breakpoint | Behavior |
|---|---|
| Desktop (>1200px) | Full toolbar, side panels, virtual instrument |
| Tablet (768–1200px) | Collapsible side panels, compact toolbar |
| Mobile (<768px) | Bottom sheet toolbar, minimal palettes, virtual instrument fullscreen-able |

---

## Component Structure

```
<App>
  <MenuBar />
  <Toolbar>
    <PaletteTabBar />
    <ActivePalette />     ← switches based on selected tab
  </Toolbar>
  <EditorCanvas>
    <ScoreRenderer />     ← OSMD/VexFlow SVG
    <CursorOverlay />     ← blinking cursor, selection highlights
    <InteractionLayer />  ← click/touch handlers
  </EditorCanvas>
  <TransportBar />
  <VirtualInstrument />   ← piano / fretboard / drum pads
</App>
```
