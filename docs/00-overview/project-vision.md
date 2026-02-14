# Project Vision — Star Keys

## Goal

Recreate the core functionality of [flat.io](https://flat.io) — a collaborative online music notation editor — using open-source libraries within a React + TypeScript + Vite stack.

## What is Flat.io?

Flat.io is a web-based music notation platform that lets users compose, edit, play back, and share sheet music in the browser. Key capabilities:

- Full-featured score editor (notes, rests, clefs, dynamics, articulations, lyrics, tablature, percussion)
- Real-time audio playback with 180+ instrument sounds
- MusicXML / MIDI / PDF import and export
- MIDI keyboard input and virtual on-screen instruments
- Real-time collaboration (Google Docs-style simultaneous editing)
- Print-quality PDF output with multiple music fonts

## Scope

### In Scope

| Area | Description |
|---|---|
| Guitar Tab | Tablature notation (6-line staff, fret numbers), fretboard input, custom tuning, capo, bends, slides, hammer-on/pull-off, harmonics, palm mute, let ring, chord diagrams, tab-only and tab+standard notation views |
| Percussion | Drum set notation (5-line percussion staff), custom percussion maps, noteheads (X, diamond, normal), drum pad input, GM drum map, custom instrument mapping |
| Playback | Web Audio playback with soundfont-based guitar and percussion sounds, tempo control, metronome, play/pause/stop, mixer (per-part volume) |
| File I/O | Import/export MusicXML (.mxl, .xml), import/export MIDI (.mid), export PDF, export PNG/SVG |
| MIDI Input | Connect physical MIDI keyboards/pads for step-entry and live recording |
| Virtual Input | On-screen guitar fretboard and drum pad grid |
| Instruments | Guitar family (acoustic, electric, bass, ukulele, banjo) and percussion (drum set, individual drums/cymbals) using free soundfonts |
| UI | Toolbar with note/tab/percussion palettes, score navigation, zoom, dark mode, keyboard shortcuts |
| Print/Layout | Page size, margins, staff spacing, music font selection, part extraction, tab-only print mode |

### Out of Scope

- Full standard notation editor (pitched instruments like piano, strings, woodwinds, brass, voice)
- Lyrics, chord symbol input, expression text, figured bass
- Ornaments and articulations beyond guitar-specific ones (trills, mordents, turns, etc.)
- Real-time collaboration (Yjs/CRDT multi-user editing)
- Education features (assignments, worksheets, LMS integration)
- Community features (public sharing, browsing, likes/comments)
- Audio recording (microphone-based performance capture)
- Audio export (MP3/WAV)
- Native mobile apps (iOS/Android)
- PDF OCR import
- Paid subscription/billing system
- Guitar Pro file format support
- Non-guitar/percussion instruments and sounds

## Success Criteria

1. User can create a guitar tab score, input fret numbers, and hear playback with guitar sounds
2. User can create a percussion score, input drum hits via pad or keyboard, and hear playback
3. Guitar-specific notation (bends, slides, harmonics, palm mute, let ring) works correctly
4. Chord diagrams can be placed above the tab staff
5. Scores can be saved/loaded as MusicXML and exported as PDF
6. MIDI keyboard/pad input works for both tab and percussion entry
7. The editor is responsive and feels snappy
