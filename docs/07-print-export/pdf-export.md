# PDF Export

Generating print-quality PDF output from the rendered score.

---

## Export Pipeline

```
ScoreModel
  → OSMD/VexFlow renders SVG (per page)
  → Apply page layout settings
  → Add headers (title, composer, page numbers)
  → Convert SVG → PDF pages using jsPDF + svg2pdf.js
  → Output .pdf file
```

---

## Page Layout

### Page Size Options

| Size | Dimensions | Default |
|---|---|---|
| US Letter | 215.9 × 279.4 mm (8.5 × 11") | Yes (US) |
| A4 | 210 × 297 mm | Yes (International) |
| Legal | 215.9 × 355.6 mm | No |
| Tabloid | 279.4 × 431.8 mm | No |

### Margins

| Margin | Default | Range |
|---|---|---|
| Top | 15mm | 5–50mm |
| Bottom | 15mm | 5–50mm |
| Left | 12mm | 5–50mm |
| Right | 12mm | 5–50mm |

### Orientation

- Portrait (default for most scores)
- Landscape (useful for scores with many parts)

---

## Score Layout Settings

| Setting | Description | Default |
|---|---|---|
| Staff size | Scaling factor for notation | 1.0 |
| System spacing | Vertical space between systems | 15mm |
| Staff spacing | Space between staves within a system | 10mm |
| Measures per system | Max measures per line (auto by default) | Auto |
| First system indent | Extra indent for first system (title) | 20mm |

---

## Music Fonts (SMuFL)

The score can be rendered in different music notation fonts. All are SMuFL-compliant.

| Font | Style | Source |
|---|---|---|
| Bravura | Traditional engraved, bold | Steinberg |
| Petaluma | Handwritten, jazz-style | Steinberg |
| Leland | Based on SCORE software | MuseScore |
| Leipzig | Classical engraving | RISM Digital |
| Gootville | Handwritten style | MuseScore |

All fonts are open source (SIL Open Font License).

### Implementation

- OSMD/VexFlow supports SMuFL fonts
- Bundle font files (WOFF2) with the application
- User selects font in Layout palette or Settings
- Font affects: noteheads, clefs, accidentals, rests, flags, dynamics

---

## Header/Footer Content

### First Page

```
┌─────────────────────────────────────┐
│                                     │
│           Score Title               │  (centered, large)
│           Composer Name             │  (centered, medium)
│           Arranger: Name            │  (centered, small, italic)
│                                     │
│  ┌───────────────────────────────┐  │
│  │     First system of music     │  │
│  └───────────────────────────────┘  │
│                                     │
│                                     │
│                                     │
│              — 1 —                  │  (page number, bottom center)
└─────────────────────────────────────┘
```

### Subsequent Pages

```
┌─────────────────────────────────────┐
│  Score Title          (top left)    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │       Systems of music        │  │
│  └───────────────────────────────┘  │
│                                     │
│              — 2 —                  │
└─────────────────────────────────────┘
```

---

## Part Extraction

Export individual parts instead of the full score.

### Options

| Option | Description |
|---|---|
| Full score | All parts on all pages |
| Individual part | Single instrument extracted |
| Selected parts | Subset of parts |
| Tab only | Guitar tab without standard notation staff |

### Part-Specific Adjustments

When extracting a part:
- Multi-measure rests are collapsed (e.g., 8 empty measures → one measure with "8" above)
- Page breaks may differ from full score
- Part name appears at top of first page
- Cue notes (optional) show other instruments' passages during long rests

---

## Export Settings Dialog

```
┌──────────────────────────────────────────┐
│  Export as PDF                            │
│                                          │
│  Page Size:    [US Letter ▼]             │
│  Orientation:  [Portrait ▼]              │
│                                          │
│  Parts:  ○ Full score                    │
│          ○ Individual parts              │
│          ○ Selected: [Violin ✓] [Cello]  │
│                                          │
│  ☐ Tab only (suppress standard notation) │
│  ☑ Include page numbers                  │
│  ☐ Multi-measure rests                   │
│                                          │
│  Music Font:  [Bravura ▼]               │
│  Staff Size:  [──●──────] 1.0            │
│                                          │
│  [Preview]              [Export PDF]      │
└──────────────────────────────────────────┘
```

---

## Performance Considerations

- Multi-page scores can take several seconds to render to PDF
- Show progress indicator ("Rendering page 3 of 12...")
- Consider using a Web Worker for PDF generation to avoid blocking UI
- Cache rendered SVG pages when score hasn't changed
