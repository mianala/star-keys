# Responsive Design

Adapting the editor UI across device sizes.

---

## Breakpoints

| Name | Width | Target Device |
|---|---|---|
| Desktop Large | > 1440px | Large monitors |
| Desktop | 1200–1440px | Standard monitors |
| Tablet Landscape | 1024–1199px | iPad landscape, small laptops |
| Tablet Portrait | 768–1023px | iPad portrait |
| Mobile | < 768px | Phones (limited editing) |

---

## Desktop (> 1200px)

Full layout with all panels visible:

- Menu bar: full text labels
- Toolbar: all palette buttons visible, active palette fully expanded
- Parts panel: visible (left sidebar)
- Inspector panel: visible (right sidebar)
- Score canvas: fills remaining space
- Transport bar: full controls
- Virtual instrument: visible (collapsible)

---

## Tablet Landscape (1024–1199px)

Compact layout:

- Menu bar: icon-only for some items
- Toolbar: palette tabs as icons, palette content scrollable
- Parts panel: collapsed by default, slide-out overlay
- Inspector panel: collapsed by default, slide-out overlay
- Score canvas: full width
- Transport bar: compact (icons only)
- Virtual instrument: visible, 1.5 octave range

---

## Tablet Portrait (768–1023px)

Touch-optimized:

- Menu bar: hamburger menu
- Toolbar: bottom sheet (swipe up to expand)
- Parts panel: hidden, accessible via button
- Inspector panel: hidden, accessible via button
- Score canvas: full screen, pinch to zoom
- Transport bar: floating mini controls
- Virtual instrument: full-width bottom panel, toggleable

---

## Mobile (< 768px)

Minimal editing, mostly viewing/playback:

- Menu bar: minimal (app name + hamburger)
- Toolbar: bottom action bar with most common actions only
- Side panels: full-screen overlays when opened
- Score canvas: full screen, swipe to scroll
- Transport bar: simple play/pause/stop
- Virtual instrument: full-screen overlay when active

---

## Touch Adaptations

| Desktop Interaction | Touch Equivalent |
|---|---|
| Mouse hover (tooltips) | Long press for tooltip |
| Right-click (context menu) | Long press for context menu |
| Scroll wheel zoom | Pinch to zoom |
| Drag (reorder) | Touch and hold → drag |
| Double-click (edit text) | Double tap |
| Keyboard shortcuts | Toolbar buttons / gestures |

---

## Accessibility

| Feature | Implementation |
|---|---|
| Screen reader | ARIA labels on all interactive elements |
| Keyboard navigation | Tab order through all controls |
| Focus indicators | Visible focus ring on all interactive elements |
| High contrast | Respect `prefers-contrast` media query |
| Reduced motion | Respect `prefers-reduced-motion` for animations |
| Font scaling | UI respects browser font size settings |
| Color-blind safe | Don't rely solely on color for information |
