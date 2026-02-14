import { useEditor } from '@/stores/EditorContext.tsx';
import type { NoteDuration, ArticulationType, OrnamentType } from '@/types/index.ts';
import {
  WholeNoteIcon,
  HalfNoteIcon,
  QuarterNoteIcon,
  EighthNoteIcon,
  SixteenthNoteIcon,
  ThirtySecondNoteIcon,
  RestIcon,
  SharpIcon,
  FlatIcon,
  NaturalIcon,
  TieIcon,
  StaccatoIcon,
  AccentIcon,
  MarcatoIcon,
  TenutoIcon,
  FermataIcon,
  TrillIcon,
  MordentIcon,
  TurnIcon,
  TremoloIcon,
} from './icons.tsx';

const DURATIONS: { icon: React.ReactNode; value: NoteDuration; key: string }[] = [
  { icon: <WholeNoteIcon />, value: 'whole', key: '1' },
  { icon: <HalfNoteIcon />, value: 'half', key: '2' },
  { icon: <QuarterNoteIcon />, value: 'quarter', key: '3' },
  { icon: <EighthNoteIcon />, value: 'eighth', key: '4' },
  { icon: <SixteenthNoteIcon />, value: '16th', key: '5' },
  { icon: <ThirtySecondNoteIcon />, value: '32nd', key: '6' },
];

const ARTICULATIONS: { icon: React.ReactNode; value: ArticulationType; title: string }[] = [
  { icon: <StaccatoIcon />, value: 'staccato', title: 'Staccato' },
  { icon: <AccentIcon />, value: 'accent', title: 'Accent' },
  { icon: <MarcatoIcon />, value: 'marcato', title: 'Marcato' },
  { icon: <TenutoIcon />, value: 'tenuto', title: 'Tenuto' },
  { icon: <FermataIcon />, value: 'fermata', title: 'Fermata' },
];

const ORNAMENTS: { icon: React.ReactNode; value: OrnamentType; title: string }[] = [
  { icon: <TrillIcon />, value: 'trill', title: 'Trill' },
  { icon: <MordentIcon />, value: 'mordent', title: 'Mordent' },
  { icon: <MordentIcon />, value: 'inverted-mordent', title: 'Inverted Mordent' },
  { icon: <TurnIcon />, value: 'turn', title: 'Turn' },
  { icon: <TurnIcon />, value: 'inverted-turn', title: 'Inverted Turn' },
  { icon: <TremoloIcon beams={1} />, value: 'tremolo-1', title: 'Tremolo (1 beam)' },
  { icon: <TremoloIcon beams={2} />, value: 'tremolo-2', title: 'Tremolo (2 beams)' },
  { icon: <TremoloIcon beams={3} />, value: 'tremolo-3', title: 'Tremolo (3 beams)' },
];

interface ToolbarProps {
  onArticulation?: (art: ArticulationType) => void;
  onOrnament?: (orn: OrnamentType) => void;
  onDot?: () => void;
  onSharp?: () => void;
  onFlat?: () => void;
  onNatural?: () => void;
  onTie?: () => void;
}

export function Toolbar({ onArticulation, onOrnament, onDot, onSharp, onFlat, onNatural, onTie }: ToolbarProps) {
  const { editorState, dispatch } = useEditor();

  return (
    <div className="toolbar" role="toolbar" aria-label="Score editing toolbar">
      <div className="toolbar-group" role="group" aria-label="Duration">
        <span className="toolbar-label">Duration</span>
        {DURATIONS.map((d) => (
          <button
            key={d.value}
            className={`toolbar-btn ${editorState.selectedDuration === d.value ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'SET_DURATION', duration: d.value })}
            title={`${d.value} (${d.key})`}
            aria-label={`${d.value} note duration`}
            aria-pressed={editorState.selectedDuration === d.value}
          >
            {d.icon}
          </button>
        ))}
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group" role="group" aria-label="Input tool">
        <span className="toolbar-label">Tool</span>
        <button
          className={`toolbar-btn ${editorState.activeTool === 'note' ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TOOL', tool: 'note' })}
          title="Note input"
          aria-label="Note input tool"
          aria-pressed={editorState.activeTool === 'note'}
        >
          N
        </button>
        <button
          className={`toolbar-btn ${editorState.activeTool === 'rest' ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TOOL', tool: 'rest' })}
          title="Rest input (0)"
          aria-label="Rest input tool"
          aria-pressed={editorState.activeTool === 'rest'}
        >
          <RestIcon />
        </button>
        <button
          className={`toolbar-btn ${editorState.activeTool === 'select' ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_ACTIVE_TOOL', tool: 'select' })}
          title="Select"
          aria-label="Selection tool"
          aria-pressed={editorState.activeTool === 'select'}
        >
          S
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group" role="group" aria-label="Note modifiers">
        <span className="toolbar-label">Modify</span>
        <button className="toolbar-btn" title="Dot (.)" aria-label="Toggle dot" onClick={onDot}>.</button>
        <button className="toolbar-btn" title="Sharp (+)" aria-label="Sharpen note" onClick={onSharp}>
          <SharpIcon />
        </button>
        <button className="toolbar-btn" title="Flat (-)" aria-label="Flatten note" onClick={onFlat}>
          <FlatIcon />
        </button>
        <button className="toolbar-btn" title="Natural" aria-label="Natural" onClick={onNatural}>
          <NaturalIcon />
        </button>
        <button className="toolbar-btn" title="Tie (T)" aria-label="Toggle tie" onClick={onTie}>
          <TieIcon />
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group" role="group" aria-label="Articulations">
        <span className="toolbar-label">Articulation</span>
        {ARTICULATIONS.map((a) => (
          <button
            key={a.value}
            className="articulation-btn"
            title={a.title}
            aria-label={a.title}
            onClick={() => onArticulation?.(a.value)}
          >
            {a.icon}
          </button>
        ))}
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group" role="group" aria-label="Ornaments">
        <span className="toolbar-label">Ornament</span>
        {ORNAMENTS.map((o) => (
          <button
            key={o.value}
            className="articulation-btn"
            title={o.title}
            aria-label={o.title}
            onClick={() => onOrnament?.(o.value)}
          >
            {o.icon}
          </button>
        ))}
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group" role="group" aria-label="Voice selection">
        <span className="toolbar-label">Voice</span>
        <button
          className={`toolbar-btn ${editorState.cursor.voice === 1 ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_CURSOR', cursor: { ...editorState.cursor, voice: 1 } })}
          title="Voice 1"
          aria-label="Voice 1"
          aria-pressed={editorState.cursor.voice === 1}
        >
          1
        </button>
        <button
          className={`toolbar-btn ${editorState.cursor.voice === 2 ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_CURSOR', cursor: { ...editorState.cursor, voice: 2 } })}
          title="Voice 2"
          aria-label="Voice 2"
          aria-pressed={editorState.cursor.voice === 2}
        >
          2
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group" role="group" aria-label="Input mode">
        <span className="toolbar-label">Mode</span>
        <button
          className={`toolbar-btn ${editorState.inputMode === 'insert' ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'SET_INPUT_MODE', mode: editorState.inputMode === 'insert' ? 'replace' : 'insert' })}
          title="Insert/Replace (I)"
          aria-label={`${editorState.inputMode} mode, click to toggle`}
        >
          {editorState.inputMode === 'insert' ? 'INS' : 'REP'}
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group" role="group" aria-label="View controls">
        <span className="toolbar-label">View</span>
        <button
          className="toolbar-btn"
          onClick={() => dispatch({ type: 'SET_ZOOM', zoom: editorState.zoom - 10 })}
          title="Zoom out (Ctrl+-)"
        >
          −
        </button>
        <span className="toolbar-zoom">{editorState.zoom}%</span>
        <button
          className="toolbar-btn"
          onClick={() => dispatch({ type: 'SET_ZOOM', zoom: editorState.zoom + 10 })}
          title="Zoom in (Ctrl+=)"
        >
          +
        </button>
        <button
          className="toolbar-btn"
          onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
          title="Toggle dark mode"
        >
          {editorState.isDarkMode ? 'Light' : 'Dark'}
        </button>
      </div>
    </div>
  );
}
