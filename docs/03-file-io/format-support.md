# Format Support Details

Technical details for each supported file format.

---

## MusicXML 4.0

- **Spec:** [W3C MusicXML 4.0](https://www.w3.org/2021/06/musicxml40/)
- **MIME type:** `application/vnd.recordare.musicxml+xml` (.xml), `application/vnd.recordare.musicxml` (.mxl)
- **Encoding:** UTF-8

### Score Types

| Type | Description | Our Support |
|---|---|---|
| `<score-partwise>` | Organized by parts, then measures | Full support (primary) |
| `<score-timewise>` | Organized by measures, then parts | Convert to partwise on import |

### Key Elements Coverage

| Element | Description | Priority |
|---|---|---|
| `<part-list>` | Instrument definitions | MVP |
| `<attributes>` | Clef, key, time, divisions | MVP |
| `<note>` | Pitches, rests, durations | MVP |
| `<pitch>`, `<rest>` | Note content | MVP |
| `<duration>`, `<type>` | Timing | MVP |
| `<dot>` | Dotted notes | MVP |
| `<tie>`, `<tied>` | Ties | MVP |
| `<beam>` | Beaming | MVP |
| `<accidental>` | Accidentals | MVP |
| `<chord>` | Chord (note stacking) | MVP |
| `<voice>` | Multi-voice | MVP |
| `<backup>`, `<forward>` | Voice navigation | MVP |
| `<direction>` | Dynamics, tempo, wedges | MVP |
| `<barline>` | Barline types, repeats | MVP |
| `<articulations>` | Staccato, accent, etc. | Phase 2 |
| `<dynamics>` | pp, ff, etc. | Phase 2 |
| `<ornaments>` | Trill, mordent, turn | Phase 2 |
| `<technical>` | Fingering, bowing | Phase 3 |
| `<lyric>` | Lyrics | Phase 3 |
| `<harmony>` | Chord symbols | Phase 3 |
| `<figured-bass>` | Figured bass | Post-MVP |
| `<print>` | Layout/formatting | Post-MVP |
| `<sound>` | Playback tempo, dynamics | MVP |
| `<encoding>` | Metadata | MVP |

---

## MIDI (Standard MIDI File)

- **Spec:** [MIDI Association SMF](https://www.midi.org/specifications)
- **MIME type:** `audio/midi`
- **Extension:** `.mid`, `.midi`

### Format Types

| Type | Description | Our Support |
|---|---|---|
| Format 0 | Single track, all channels merged | Import only |
| Format 1 | Multiple tracks, one per instrument | Full (import + export) |
| Format 2 | Multiple independent sequences | Not supported |

### Events We Handle

| Event | Type | Import | Export |
|---|---|---|---|
| Note On | Channel | Yes | Yes |
| Note Off | Channel | Yes | Yes |
| Program Change | Channel | Yes | Yes |
| Control Change | Channel | Partial (pedal) | Partial |
| Tempo | Meta | Yes | Yes |
| Time Signature | Meta | Yes | Yes |
| Key Signature | Meta | Yes | Yes |
| Track Name | Meta | Yes | Yes |
| End of Track | Meta | Yes | Yes |

---

## PDF

- **Library:** jsPDF + svg2pdf.js
- **Page sizes:** Letter (8.5x11"), A4 (210x297mm), Legal (8.5x14")
- **Quality:** Vector-based (from SVG), resolution-independent

### PDF Content

| Element | Description |
|---|---|
| Title page | Score title, composer, arranger (optional) |
| Score pages | Full score with all parts |
| Part pages | Individual extracted parts (optional) |
| Page numbers | Bottom center |
| Music font | Embedded as paths (from SVG) |

---

## PNG

- **DPI options:** 72 (screen), 150 (draft), 300 (print)
- **Color:** Full color with transparency
- **Use case:** Sharing score excerpts, embedding in documents

## SVG

- **Self-contained:** All styles inlined
- **Scalable:** Resolution-independent
- **Use case:** Web embedding, further editing in vector tools
