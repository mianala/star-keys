# Layout Settings

Customizable score layout and engraving options.

---

## Score Metadata

| Field | Description | Display Location |
|---|---|---|
| Title | Score/piece title | Top center, first page |
| Subtitle | Secondary title | Below title |
| Composer | Composer name | Top right, first page |
| Arranger | Arranger name | Below composer |
| Lyricist | Lyrics author | Top left, first page |
| Copyright | Copyright notice | Bottom of first page |

---

## System Layout

### Measures Per System

| Mode | Description |
|---|---|
| Auto | OSMD determines optimal layout based on content density |
| Fixed | User-specified number of measures per system (e.g., 4) |
| Manual | User places system breaks manually |

### System Breaks

- Insert at any barline
- Keyboard shortcut: `Enter` (when barline selected)
- Visual indicator in edit mode (dashed line)
- Not visible in print

### Page Breaks

- Insert at any barline
- Force new page at selected position
- Visual indicator in edit mode

---

## Staff Settings

### Staff Size

Scales all notation elements proportionally.

| Size | Use Case |
|---|---|
| 0.7 | Small, dense scores (orchestral) |
| 0.85 | Reduced size |
| 1.0 | Standard (default) |
| 1.2 | Large print / educational |
| 1.5 | Very large print |

### Staff Spacing

Vertical space between staves in a system.

- Default: 10mm
- Range: 5mm–30mm
- Affects readability of multi-staff instruments (piano) and lyrics placement

### System Spacing

Vertical space between systems.

- Default: 15mm
- Range: 8mm–40mm
- Affects how many systems fit per page

---

## Notation Display Options

| Option | Description | Default |
|---|---|---|
| Measure numbers | Show measure numbers at start of each system | On |
| Rehearsal marks | Display rehearsal letters/numbers | On |
| Concert pitch | Show all parts at sounding pitch | Off |
| Colored noteheads | Color notes by pitch (Boomwhackers mode) | Off |
| Note names in heads | Display letter names inside noteheads | Off |

---

## Bracket & Brace Configuration

Group instruments visually in the score:

```
┌─ Bracket (Woodwinds)
│  Flute
│  Oboe
│  Clarinet
└─

┌─ Bracket (Brass)
│  Horn
│  Trumpet
└─

{  Brace (Piano)
{  Treble staff
{  Bass staff
```

| Grouping | Symbol | Use |
|---|---|---|
| Bracket | [ | Group instrument families (winds, brass, strings) |
| Brace | { | Connect staves of a single instrument (piano, harp) |
| Square bracket | | Group voices in choral music |
| None | | No visual grouping |

User can drag brackets in the Parts panel to define groups.

---

## Engraving Rules

Automatic formatting decisions the layout engine makes:

| Rule | Description |
|---|---|
| Collision avoidance | Dynamics, articulations, and text don't overlap |
| Stem direction | Auto based on note position on staff (above middle → down, below → up) |
| Beam grouping | Based on time signature conventions |
| Accidental stacking | Multiple accidentals in a chord are offset to avoid overlap |
| Tie direction | Follows stem direction |
| Slur shape | Curved arc that avoids other notation elements |
| Lyric hyphenation | Syllables connected by hyphens |
| Rehearsal mark placement | Above the top staff of the system |
| Tempo mark placement | Above the top staff |

Most of these are handled by OSMD/VexFlow automatically. We expose overrides where useful.

---

## Print Settings

| Setting | Options | Default |
|---|---|---|
| Page size | Letter, A4, Legal, Tabloid | Letter |
| Orientation | Portrait, Landscape | Portrait |
| Margins | Top, Right, Bottom, Left (mm) | 15, 12, 15, 12 |
| Music font | Bravura, Petaluma, Leland, etc. | Bravura |
| Staff size | 0.5–2.0 | 1.0 |
| First system indent | 0–50mm | 20mm |
| Page numbers | On/Off, starting number | On, start at 1 |
