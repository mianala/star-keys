# Editor Layout

Overall layout architecture and component placement.

---

## Main Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MENU BAR                                     │
│  [File] [Edit] [View]           Star Keys            [⚙ Settings]   │
├─────────────────────────────────────────────────────────────────────┤
│                         TOOLBAR                                      │
│  [Notes] [Artic.] [Dynamics] [Measures] [Text] [Layout] [Parts]    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Active palette contents...                                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
├───────────┬─────────────────────────────────────────┬───────────────┤
│           │                                         │               │
│  PARTS    │          SCORE CANVAS                   │  INSPECTOR    │
│  PANEL    │                                         │  PANEL        │
│           │    ┌─────────────────────────┐          │               │
│  Violin   │    │ 𝄞  4/4  ♩ ♩ ♩ ♩        │          │  Note: C4     │
│  Cello    │    │ 𝄢  4/4  𝅗𝅥    𝅗𝅥        │          │  Duration: ♩  │
│  Piano    │    │ 𝄞  4/4  ♩ ♪♪ ♩ ♩       │          │  Voice: 1     │
│           │    └─────────────────────────┘          │  Measure: 3   │
│           │                                         │               │
├───────────┴─────────────────────────────────────────┴───────────────┤
│                      TRANSPORT BAR                                   │
│  [|◀] [▶] [■]   ♩=120   [Loop] [Metro] [Mixer]   ──●───── 1:23    │
├─────────────────────────────────────────────────────────────────────┤
│                    VIRTUAL INSTRUMENT                                 │
│  ◀ │ ██░██░███░██░███░██░███░██░██ │ ▶   [Piano ▼] [Hide]          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Panel Details

### Parts Panel (Left Sidebar)

- List of all instruments/parts in the score
- Each item shows: instrument icon, name, visibility toggle
- Drag to reorder parts
- Click to select/focus a part
- Right-click for context menu (rename, change instrument, remove)
- "Add Instrument" button at bottom
- Collapsible (toggle with View menu or keyboard shortcut)

**Width:** 200px (resizable)

### Score Canvas (Center)

- Main rendering area using OSMD/VexFlow
- SVG-based rendering for crisp scaling
- Overlays:
  - **Cursor:** Blinking vertical line at current input position
  - **Selection:** Highlighted range of selected notes (blue tint)
  - **Playback cursor:** Moving vertical line during playback (green)
- Mouse/touch interaction layer on top of SVG
- Horizontal scrolling for long scores
- Vertical scrolling for scores with many parts

### Inspector Panel (Right Sidebar)

Shows properties of the currently selected element:

**When a note is selected:**
- Pitch (e.g., C4)
- Duration (with visual icon)
- Accidental
- Dot count
- Voice number
- Beam group
- Articulations applied
- Dynamics at this position
- Measure number and beat position

**When a measure is selected:**
- Measure number
- Key signature
- Time signature
- Clef
- Barline type
- Tempo marking

**When nothing selected:**
- Score-level properties (title, composer, parts count)

**Width:** 250px (resizable, collapsible)

---

## Score Canvas Rendering

### Zoom

| Level | Use Case |
|---|---|
| 25% | Overview of full score |
| 50% | Reading large orchestral scores |
| 75% | Comfortable reading |
| 100% | Default, 1:1 with print size |
| 150% | Detailed editing |
| 200% | Fine positioning |

- Zoom centered on cursor position
- `Ctrl+=` / `Ctrl+-` / `Ctrl+0` shortcuts
- Pinch-to-zoom on touch devices
- Zoom level shown in status bar

### Scrolling

- **Horizontal:** Primary scroll direction (score flows left to right)
- **Vertical:** For multi-part scores or zoomed-in views
- **Auto-scroll during playback:** Canvas scrolls to keep playback cursor visible
- **Auto-scroll during input:** Canvas scrolls to keep input cursor visible

### Page View vs. Continuous View

| Mode | Description |
|---|---|
| Page View | Score displayed as printed pages (with page breaks, margins) |
| Continuous View | Score as one long horizontal strip (no page breaks) |

Default to continuous view for editing, page view for print preview.

---

## Dark Mode

- Toggle via View menu or system preference (`prefers-color-scheme`)
- Score canvas: white background in light mode, dark gray (#1a1a1a) in dark mode
- Notation: black ink in light mode, white/light gray in dark mode
- OSMD supports custom color schemes for rendering
- All UI panels follow the theme

---

## New Score Wizard

Dialog flow for creating a new score:

```
Step 1: Score Info
├── Title
├── Composer
├── Tempo (BPM)
└── Time Signature

Step 2: Instruments
├── Search/browse instrument list
├── Add instruments (builds part list)
├── Reorder with drag-and-drop
└── Configure transposition, clef

Step 3: Key & Measures
├── Key signature
├── Number of initial measures
└── Pickup measure (anacrusis) toggle

[Create] → Opens new empty score in editor
```

---

## Status Bar

Thin bar at the bottom of the window:

```
┌─────────────────────────────────────────────────────────────────┐
│ Measure 12, Beat 3  │  Voice 1  │  Insert Mode  │  Zoom: 100%  │
└─────────────────────────────────────────────────────────────────┘
```

Displays: cursor position, current voice, input mode, zoom level, MIDI connection status.
