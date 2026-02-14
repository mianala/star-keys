import { useState, useCallback } from 'react';
import { useEditor } from '@/stores/EditorContext.tsx';

interface ChannelState {
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
}

interface MixerPanelProps {
  onClose: () => void;
  onVolumeChange?: (partIndex: number, volume: number) => void;
  onMuteToggle?: (partIndex: number) => void;
  onSoloToggle?: (partIndex: number) => void;
}

export function MixerPanel({ onClose, onVolumeChange, onMuteToggle, onSoloToggle }: MixerPanelProps) {
  const { score } = useEditor();
  const [channels, setChannels] = useState<ChannelState[]>(() =>
    score.parts.map(() => ({ volume: 80, pan: 0, muted: false, solo: false })),
  );
  const [masterVolume, setMasterVolume] = useState(100);
  const [metronomeVolume, setMetronomeVolume] = useState(50);

  const hasSolo = channels.some((c) => c.solo);

  const updateChannel = useCallback((index: number, update: Partial<ChannelState>) => {
    setChannels((prev) => prev.map((ch, i) => (i === index ? { ...ch, ...update } : ch)));
  }, []);

  return (
    <div className="mixer-panel">
      <div className="mixer-header">
        <span className="mixer-title">Mixer</span>
        <button className="dialog-close" onClick={onClose}>×</button>
      </div>

      {score.parts.map((part, i) => {
        const ch = channels[i];
        if (!ch) return null;
        const isAudible = !ch.muted && (!hasSolo || ch.solo);
        return (
          <div key={part.id} className="mixer-channel" style={{ opacity: isAudible ? 1 : 0.5 }}>
            <span className="mixer-channel-name">{part.instrument.name}</span>
            <input
              type="range"
              className="mixer-slider"
              min={0}
              max={127}
              value={ch.volume}
              onChange={(e) => {
                const vol = Number(e.target.value);
                updateChannel(i, { volume: vol });
                onVolumeChange?.(i, vol);
              }}
              title={`Volume: ${ch.volume}`}
            />
            <button
              className={`mixer-btn ${ch.muted ? 'muted' : ''}`}
              onClick={() => {
                updateChannel(i, { muted: !ch.muted });
                onMuteToggle?.(i);
              }}
              title="Mute"
            >
              M
            </button>
            <button
              className={`mixer-btn ${ch.solo ? 'active' : ''}`}
              onClick={() => {
                updateChannel(i, { solo: !ch.solo });
                onSoloToggle?.(i);
              }}
              title="Solo"
            >
              S
            </button>
          </div>
        );
      })}

      <div className="mixer-channel" style={{ borderTop: '1px solid var(--border-color)', paddingTop: 8, marginTop: 4 }}>
        <span className="mixer-channel-name">Master</span>
        <input
          type="range"
          className="mixer-slider"
          min={0}
          max={127}
          value={masterVolume}
          onChange={(e) => setMasterVolume(Number(e.target.value))}
          title={`Master: ${masterVolume}`}
        />
      </div>

      <div className="mixer-channel">
        <span className="mixer-channel-name">Metronome</span>
        <input
          type="range"
          className="mixer-slider"
          min={0}
          max={127}
          value={metronomeVolume}
          onChange={(e) => setMetronomeVolume(Number(e.target.value))}
          title={`Metronome: ${metronomeVolume}`}
        />
      </div>
    </div>
  );
}
