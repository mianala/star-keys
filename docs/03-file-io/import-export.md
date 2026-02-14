# Import & Export

File format support for loading and saving scores.

---

## Supported Formats

| Format | Import | Export | Priority |
|---|---|---|---|
| MusicXML (.xml, .mxl) | Yes | Yes | MVP |
| MIDI (.mid) | Yes | Yes | MVP |
| PDF | No | Yes | MVP |
| PNG | No | Yes | MVP |
| SVG | No | Yes | MVP |
| MP3 | No | Yes | Post-MVP |
| WAV | No | Yes | Post-MVP |

---

## MusicXML (Primary Format)

MusicXML is the standard interchange format for music notation. It's our primary save/load format.

### Import (.xml / .mxl)

**Uncompressed (.xml):** Plain XML file. Parse with browser's `DOMParser`.

**Compressed (.mxl):** ZIP archive containing:
- `META-INF/container.xml` — points to the root file
- `*.xml` — the actual MusicXML score

Use `JSZip` or similar library to extract.

### Import Pipeline

```
File upload → detect format (.xml or .mxl)
  → if .mxl: unzip → extract .xml
  → parse XML with DOMParser
  → walk DOM tree → build internal ScoreModel
  → render with OSMD
```

### Key MusicXML Elements to Parse

```xml
<score-partwise>
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
      <midi-instrument>
        <midi-channel>1</midi-channel>
        <midi-program>1</midi-program>
      </midi-instrument>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
    </measure>
  </part>
</score-partwise>
```

### Export

Serialize our internal `ScoreModel` back to MusicXML XML string, then:
- For `.xml`: offer as download
- For `.mxl`: create ZIP with JSZip, add container.xml + score.xml, offer as download

### Validation

Validate exported MusicXML against the DTD/schema (optional but recommended).

---

## PDF Export

Generate print-quality PDF from the rendered score.

### Approach 1: SVG → PDF (Recommended)

1. OSMD renders score as SVG
2. For multi-page: render each page as a separate SVG
3. Use `jsPDF` with `svg2pdf.js` plugin to embed SVG in PDF
4. Add page numbers, title, composer info
5. Generate and download

### Approach 2: Canvas → PDF

1. Render SVG to Canvas using `canvg` or `OffscreenCanvas`
2. Use `jsPDF.addImage()` to embed
3. Lower quality (rasterized), not recommended for music notation

### Approach 3: Verovio Direct PDF

If using Verovio instead of OSMD, it can generate PDF directly via its C++ engine (compiled to WASM).

### Page Layout for PDF

```typescript
interface PageLayout {
  pageSize: 'letter' | 'a4' | 'legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;    // mm
    right: number;
    bottom: number;
    left: number;
  };
  staffSize: number;      // scaling factor
  systemSpacing: number;  // space between systems
  musicFont: string;      // SMuFL font name
}
```

---

## PNG / SVG Export

Export score (or selection) as image.

### SVG Export

1. Get SVG element from OSMD renderer
2. Clone the SVG node
3. Inline all styles (so the SVG is self-contained)
4. Serialize with `XMLSerializer`
5. Create download blob

### PNG Export

1. Get SVG (as above)
2. Draw SVG onto a `<canvas>` element
3. Use `canvas.toBlob('image/png')` to generate PNG
4. Configurable DPI/resolution (default: 300 DPI for print)
5. Create download

---

## Audio Export (Post-MVP)

Export playback as MP3 or WAV.

### Approach: Offline Rendering

1. Create an `OfflineAudioContext` with desired sample rate and duration
2. Schedule all playback events (same as real-time playback, but on offline context)
3. Render to `AudioBuffer`
4. Encode:
   - **WAV:** Raw PCM → WAV header + data (simple, no library needed)
   - **MP3:** Use `lamejs` (JS port of LAME encoder) to encode PCM → MP3
5. Create download blob

### Considerations

- Offline rendering can take several seconds for long scores
- Show progress indicator
- All instrument samples must be loaded before rendering begins
- Reverb/effects should be included in the offline render

---

## File Management (Browser-Based)

### Local Storage

For quick save/load without file dialogs:
- Store recent scores in IndexedDB
- Auto-save every 30 seconds
- Restore from auto-save on crash/tab close

### File System Access API

For modern browsers (Chrome, Edge):
- Use `showOpenFilePicker()` / `showSaveFilePicker()`
- Enables "Save" (overwrite same file) instead of always "Save As"
- Falls back to `<input type="file">` and download links on unsupported browsers

### Drag & Drop

Support drag-and-drop of `.xml`, `.mxl`, `.mid` files onto the editor to import.
