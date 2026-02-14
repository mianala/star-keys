import { useState, useCallback } from 'react';
import type { NoteDuration } from '@/types/index.ts';
import { useEditor } from '@/stores/EditorContext.tsx';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'audio' | 'display';

interface AppSettings {
  autoSaveInterval: number;
  defaultNoteDuration: NoteDuration;
  notePreviewOnInput: boolean;
  defaultTempo: number;
  darkMode: boolean;
  defaultZoom: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoSaveInterval: 30,
  defaultNoteDuration: 'quarter',
  defaultTempo: 120,
  notePreviewOnInput: true,
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  defaultZoom: 100,
};

const STORAGE_KEY = 'star-keys-settings';

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors, fall through to defaults
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

const NOTE_DURATION_OPTIONS: { value: NoteDuration; label: string }[] = [
  { value: 'whole', label: 'Whole' },
  { value: 'half', label: 'Half' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'eighth', label: 'Eighth' },
  { value: '16th', label: '16th' },
  { value: '32nd', label: '32nd' },
  { value: '64th', label: '64th' },
];

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const { editorState, dispatch } = useEditor();

  // Derive effective settings: merge stored settings with live editor state
  const effectiveSettings = { ...settings, darkMode: editorState.isDarkMode };

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...loadSettings(), [key]: value };
    setSettings(updated);
    saveSettings(updated);

    // Sync dark mode toggle with editorState
    if (key === 'darkMode' && value !== editorState.isDarkMode) {
      dispatch({ type: 'TOGGLE_DARK_MODE' });
    }

    // Sync zoom with editorState
    if (key === 'defaultZoom') {
      dispatch({ type: 'SET_ZOOM', zoom: value as number });
    }
  }, [editorState.isDarkMode, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">Settings</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          <div className="settings-tabs">
            <button
              className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`settings-tab ${activeTab === 'audio' ? 'active' : ''}`}
              onClick={() => setActiveTab('audio')}
            >
              Audio
            </button>
            <button
              className={`settings-tab ${activeTab === 'display' ? 'active' : ''}`}
              onClick={() => setActiveTab('display')}
            >
              Display
            </button>
          </div>

          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="settings-row">
                <span className="settings-label">Auto-save interval</span>
                <div className="settings-control">
                  <select
                    value={effectiveSettings.autoSaveInterval}
                    onChange={(e) => updateSetting('autoSaveInterval', Number(e.target.value))}
                  >
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>60 seconds</option>
                  </select>
                </div>
              </div>
              <div className="settings-row">
                <span className="settings-label">Default note duration</span>
                <div className="settings-control">
                  <select
                    value={effectiveSettings.defaultNoteDuration}
                    onChange={(e) => updateSetting('defaultNoteDuration', e.target.value as NoteDuration)}
                  >
                    {NOTE_DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="settings-section">
              <div className="settings-row">
                <span className="settings-label">Note preview on input</span>
                <div className="settings-control">
                  <input
                    type="checkbox"
                    checked={effectiveSettings.notePreviewOnInput}
                    onChange={(e) => updateSetting('notePreviewOnInput', e.target.checked)}
                  />
                </div>
              </div>
              <div className="settings-row">
                <span className="settings-label">Default tempo (BPM)</span>
                <div className="settings-control">
                  <input
                    type="number"
                    value={effectiveSettings.defaultTempo}
                    min={20}
                    max={300}
                    onChange={(e) => updateSetting('defaultTempo', Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="settings-section">
              <div className="settings-row">
                <span className="settings-label">Dark mode</span>
                <div className="settings-control">
                  <input
                    type="checkbox"
                    checked={effectiveSettings.darkMode}
                    onChange={(e) => updateSetting('darkMode', e.target.checked)}
                  />
                </div>
              </div>
              <div className="settings-row">
                <span className="settings-label">Default zoom (%)</span>
                <div className="settings-control">
                  <input
                    type="number"
                    value={effectiveSettings.defaultZoom}
                    min={25}
                    max={300}
                    onChange={(e) => updateSetting('defaultZoom', Number(e.target.value))}
                  />
                </div>
              </div>
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
