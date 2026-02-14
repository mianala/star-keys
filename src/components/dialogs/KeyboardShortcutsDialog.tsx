import { useState, useMemo } from 'react';

interface ShortcutEntry {
  action: string;
  key: string;
  group: string;
}

const SHORTCUTS: ShortcutEntry[] = [
  // Note Input
  { group: 'Note Input', action: 'Note C', key: 'C' },
  { group: 'Note Input', action: 'Note D', key: 'D' },
  { group: 'Note Input', action: 'Note E', key: 'E' },
  { group: 'Note Input', action: 'Note F', key: 'F' },
  { group: 'Note Input', action: 'Note G', key: 'G' },
  { group: 'Note Input', action: 'Note A', key: 'A' },
  { group: 'Note Input', action: 'Note B', key: 'B' },
  { group: 'Note Input', action: 'Chord note', key: 'Shift+A-G' },
  { group: 'Note Input', action: 'Rest', key: '0' },
  { group: 'Note Input', action: 'Toggle insert/replace', key: 'I' },
  { group: 'Note Input', action: 'Cycle voice', key: 'V' },

  // Duration
  { group: 'Duration', action: 'Whole note', key: '1' },
  { group: 'Duration', action: 'Half note', key: '2' },
  { group: 'Duration', action: 'Quarter note', key: '3' },
  { group: 'Duration', action: 'Eighth note', key: '4' },
  { group: 'Duration', action: '16th note', key: '5' },
  { group: 'Duration', action: '32nd note', key: '6' },
  { group: 'Duration', action: '64th note', key: '7' },

  // Modify
  { group: 'Modify', action: 'Toggle dot', key: '.' },
  { group: 'Modify', action: 'Sharp', key: '+ / =' },
  { group: 'Modify', action: 'Flat', key: '-' },
  { group: 'Modify', action: 'Toggle tie', key: 'T' },
  { group: 'Modify', action: 'Pitch up', key: 'Up' },
  { group: 'Modify', action: 'Pitch down', key: 'Down' },
  { group: 'Modify', action: 'Octave up', key: 'Shift+Up' },
  { group: 'Modify', action: 'Octave down', key: 'Shift+Down' },

  // Navigation
  { group: 'Navigation', action: 'Move left', key: 'Left' },
  { group: 'Navigation', action: 'Move right', key: 'Right' },
  { group: 'Navigation', action: 'Previous measure', key: 'Ctrl+Left' },
  { group: 'Navigation', action: 'Next measure', key: 'Ctrl+Right' },
  { group: 'Navigation', action: 'Go to start', key: 'Home' },
  { group: 'Navigation', action: 'Go to end', key: 'End' },
  { group: 'Navigation', action: 'Previous part', key: 'Ctrl+Shift+Up' },
  { group: 'Navigation', action: 'Next part', key: 'Ctrl+Shift+Down' },

  // Editing
  { group: 'Editing', action: 'Delete note', key: 'Delete / Backspace' },
  { group: 'Editing', action: 'Undo', key: 'Ctrl+Z' },
  { group: 'Editing', action: 'Redo', key: 'Ctrl+Y' },
  { group: 'Editing', action: 'Select all', key: 'Ctrl+A' },
  { group: 'Editing', action: 'Copy', key: 'Ctrl+C' },
  { group: 'Editing', action: 'Cut', key: 'Ctrl+X' },
  { group: 'Editing', action: 'Paste', key: 'Ctrl+V' },
  { group: 'Editing', action: 'Insert measure', key: 'Ctrl+Shift+M' },
  { group: 'Editing', action: 'Delete measure', key: 'Ctrl+Shift+Del' },

  // Playback
  { group: 'Playback', action: 'Play / Pause', key: 'Space' },

  // View
  { group: 'View', action: 'Zoom in', key: 'Ctrl+=' },
  { group: 'View', action: 'Zoom out', key: 'Ctrl+-' },
  { group: 'View', action: 'Reset zoom', key: 'Ctrl+0' },
  { group: 'View', action: 'Clear selection', key: 'Escape' },
];

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return SHORTCUTS;
    const q = search.toLowerCase();
    return SHORTCUTS.filter(
      (s) => s.action.toLowerCase().includes(q) || s.key.toLowerCase().includes(q) || s.group.toLowerCase().includes(q),
    );
  }, [search]);

  const groups = useMemo(() => {
    const map = new Map<string, ShortcutEntry[]>();
    for (const s of filtered) {
      const arr = map.get(s.group) ?? [];
      arr.push(s);
      map.set(s.group, arr);
    }
    return map;
  }, [filtered]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" style={{ width: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">Keyboard Shortcuts</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="shortcuts-panel">
          <input
            className="shortcuts-search"
            placeholder="Search shortcuts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          {[...groups.entries()].map(([groupName, entries]) => (
            <div key={groupName}>
              <div className="shortcuts-group-title">{groupName}</div>
              {entries.map((entry) => (
                <div key={entry.action} className="shortcuts-row">
                  <span className="shortcuts-action">{entry.action}</span>
                  <span className="shortcuts-key">{entry.key}</span>
                </div>
              ))}
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
              No shortcuts found
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <div />
          <button className="dialog-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
