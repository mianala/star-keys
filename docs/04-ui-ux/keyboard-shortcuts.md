# Keyboard Shortcuts

Full keyboard shortcut map for the editor.

---

## Note Entry

| Shortcut | Action |
|---|---|
| `A` – `G` | Enter note (C, D, E, F, G, A, B) |
| `Shift + A–G` | Add note to chord |
| `0` | Enter rest |
| `1` | Whole note/rest |
| `2` | Half note/rest |
| `3` | Quarter note/rest |
| `4` | Eighth note/rest |
| `5` | 16th note/rest |
| `6` | 32nd note/rest |
| `7` | 64th note/rest |
| `.` | Toggle dotted |
| `T` | Toggle tie |
| `I` | Toggle insert/replace mode |
| `V` | Switch voice (cycle 1 → 2 → 1) |

## Pitch Adjustment

| Shortcut | Action |
|---|---|
| `Up` | Move note up one step (diatonic) |
| `Down` | Move note down one step (diatonic) |
| `Shift + Up` | Move note up one octave |
| `Shift + Down` | Move note down one octave |
| `+` or `=` | Sharpen by semitone |
| `-` | Flatten by semitone |

## Navigation

| Shortcut | Action |
|---|---|
| `Left` | Previous note/rest |
| `Right` | Next note/rest |
| `Ctrl + Left` | Previous measure |
| `Ctrl + Right` | Next measure |
| `Ctrl + Shift + Up` | Previous staff |
| `Ctrl + Shift + Down` | Next staff |
| `Home` | Beginning of score |
| `End` | End of score |
| `Ctrl + G` | Go to measure number |

## Selection

| Shortcut | Action |
|---|---|
| `Shift + Left` | Extend selection left |
| `Shift + Right` | Extend selection right |
| `Ctrl + A` | Select all |
| `Escape` | Clear selection |

## Editing

| Shortcut | Action |
|---|---|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + X` | Cut |
| `Ctrl + C` | Copy |
| `Ctrl + V` | Paste |
| `Delete` | Delete selected |
| `Backspace` | Delete selected (same as Delete) |

## Playback

| Shortcut | Action |
|---|---|
| `Space` | Play / Pause |
| `Ctrl + Space` | Play from beginning |
| `Escape` (during playback) | Stop |

## Articulations (Quick Keys)

| Shortcut | Action |
|---|---|
| `Shift + S` | Toggle staccato |
| `Shift + >` | Toggle accent |
| `Shift + ^` | Toggle marcato |
| `Shift + -` | Toggle tenuto |
| `Shift + .` | Toggle fermata |
| `L` | Start/end slur |

## View

| Shortcut | Action |
|---|---|
| `Ctrl + =` | Zoom in |
| `Ctrl + -` | Zoom out |
| `Ctrl + 0` | Reset zoom |
| `Ctrl + Shift + F` | Toggle fullscreen |
| `?` | Show keyboard shortcut reference |

## Toolbar Palette Switching

| Shortcut | Action |
|---|---|
| `Ctrl + 1` | Notes palette |
| `Ctrl + 2` | Articulations palette |
| `Ctrl + 3` | Dynamics palette |
| `Ctrl + 4` | Measures palette |
| `Ctrl + 5` | Text palette |
| `Ctrl + 6` | Layout palette |
| `Ctrl + 7` | Parts palette |

## File Operations

| Shortcut | Action |
|---|---|
| `Ctrl + N` | New score |
| `Ctrl + O` | Open file |
| `Ctrl + S` | Save |
| `Ctrl + Shift + S` | Save as |
| `Ctrl + P` | Print |

---

## Customization

All shortcuts are customizable. Stored in `localStorage` as a JSON map:

```typescript
interface ShortcutMap {
  [actionId: string]: {
    key: string;           // e.g., "a", "space", "delete"
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;     // Cmd on macOS
  };
}
```

### Customization UI

- Settings → Keyboard Shortcuts
- Searchable list of all actions
- Click on shortcut field → press new key combination → saves
- "Reset to defaults" button
- Conflict detection (warn if two actions share the same shortcut)

### Platform Considerations

- `Ctrl` on Windows/Linux maps to `Cmd` on macOS
- Display appropriate modifier key names per platform
- Some browser shortcuts cannot be overridden (e.g., `Ctrl+W`, `Ctrl+T`)
