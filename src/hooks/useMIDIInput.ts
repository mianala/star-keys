import { useEffect, useRef, useCallback, useState } from 'react';
import { WebMidi, Input } from 'webmidi';
import type { Step } from '@/types/index.ts';

export interface MIDIInputOptions {
  enabled: boolean;
  onNoteOn?: (midiNote: number, velocity: number) => void;
  onNoteOff?: (midiNote: number) => void;
  onControlChange?: (controller: number, value: number) => void;
}

export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string | undefined;
}

export interface UseMIDIInputResult {
  isEnabled: boolean;
  isSupported: boolean;
  devices: MIDIDevice[];
  selectedDeviceId: string | null;
  selectDevice: (deviceId: string | null) => void;
  error: string | null;
  enable: () => Promise<void>;
  disable: () => void;
}

// GM drum map for common drum kit notes
const GM_DRUM_MAP: Record<number, { name: string; step: Step; octave: number }> = {
  35: { name: 'Acoustic Bass Drum', step: 'C', octave: 2 },
  36: { name: 'Bass Drum 1', step: 'C', octave: 2 },
  37: { name: 'Side Stick', step: 'D', octave: 2 },
  38: { name: 'Acoustic Snare', step: 'E', octave: 2 },
  39: { name: 'Hand Clap', step: 'E', octave: 2 },
  40: { name: 'Electric Snare', step: 'E', octave: 2 },
  41: { name: 'Low Floor Tom', step: 'F', octave: 2 },
  42: { name: 'Closed Hi-Hat', step: 'F', octave: 2 },
  43: { name: 'High Floor Tom', step: 'G', octave: 2 },
  44: { name: 'Pedal Hi-Hat', step: 'G', octave: 2 },
  45: { name: 'Low Tom', step: 'A', octave: 2 },
  46: { name: 'Open Hi-Hat', step: 'A', octave: 2 },
  47: { name: 'Low-Mid Tom', step: 'B', octave: 2 },
  48: { name: 'Hi-Mid Tom', step: 'C', octave: 3 },
  49: { name: 'Crash Cymbal 1', step: 'C', octave: 3 },
  50: { name: 'High Tom', step: 'D', octave: 3 },
  51: { name: 'Ride Cymbal 1', step: 'D', octave: 3 },
  52: { name: 'Chinese Cymbal', step: 'E', octave: 3 },
  53: { name: 'Ride Bell', step: 'E', octave: 3 },
  54: { name: 'Tambourine', step: 'E', octave: 3 },
  55: { name: 'Splash Cymbal', step: 'F', octave: 3 },
  56: { name: 'Cowbell', step: 'F', octave: 3 },
  57: { name: 'Crash Cymbal 2', step: 'G', octave: 3 },
  58: { name: 'Vibraslap', step: 'G', octave: 3 },
  59: { name: 'Ride Cymbal 2', step: 'A', octave: 3 },
  60: { name: 'Hi Bongo', step: 'A', octave: 3 },
  61: { name: 'Low Bongo', step: 'B', octave: 3 },
  62: { name: 'Mute Hi Conga', step: 'C', octave: 4 },
  63: { name: 'Open Hi Conga', step: 'C', octave: 4 },
  64: { name: 'Low Conga', step: 'E', octave: 4 },
  65: { name: 'High Timbale', step: 'E', octave: 4 },
  66: { name: 'Low Timbale', step: 'E', octave: 4 },
  67: { name: 'High Agogo', step: 'G', octave: 4 },
  68: { name: 'Low Agogo', step: 'G', octave: 4 },
  69: { name: 'Cabasa', step: 'A', octave: 4 },
  70: { name: 'Maracas', step: 'A', octave: 4 },
  71: { name: 'Short Whistle', step: 'B', octave: 4 },
  72: { name: 'Long Whistle', step: 'B', octave: 4 },
  73: { name: 'Short Guiro', step: 'C', octave: 5 },
  74: { name: 'Long Guiro', step: 'C', octave: 5 },
  75: { name: 'Claves', step: 'D', octave: 5 },
  76: { name: 'Hi Wood Block', step: 'D', octave: 5 },
  77: { name: 'Low Wood Block', step: 'F', octave: 5 },
  78: { name: 'Mute Cuica', step: 'F', octave: 5 },
  79: { name: 'Open Cuica', step: 'G', octave: 5 },
  80: { name: 'Mute Triangle', step: 'G', octave: 5 },
  81: { name: 'Open Triangle', step: 'A', octave: 5 },
};

export function midiToStep(midiNote: number): { step: Step; octave: number } | null {
  const steps: Step[] = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const stepIndex = midiNote % 12;
  const step = steps[stepIndex];
  if (!step) return null;
  return { step, octave };
}

export function getDrumInfo(midiNote: number): { name: string; step: Step; octave: number } | null {
  return GM_DRUM_MAP[midiNote] ?? null;
}

export function useMIDIInput(options: MIDIInputOptions): UseMIDIInputResult {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [devices, setDevices] = useState<MIDIDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedInputRef = useRef<Input | null>(null);
  const optionsRef = useRef(options);

  // Keep options ref up to date
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Update device list
  const updateDevices = useCallback(() => {
    const midiDevices = WebMidi.inputs.map((input) => ({
      id: input.id,
      name: input.name,
      manufacturer: input.manufacturer,
    }));
    setDevices(midiDevices);
  }, []);

  // Enable WebMIDI
  const enable = useCallback(async () => {
    if (!navigator.requestMIDIAccess) {
      setIsSupported(false);
      setError('WebMIDI is not supported in this browser');
      return;
    }

    try {
      await WebMidi.enable();
      setIsEnabled(true);
      setError(null);
      updateDevices();

      // Listen for device changes
      WebMidi.addListener('connected', updateDevices);
      WebMidi.addListener('disconnected', updateDevices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable MIDI');
      setIsEnabled(false);
    }
  }, [updateDevices]);

  // Disable WebMIDI
  const disable = useCallback(() => {
    if (selectedInputRef.current) {
      selectedInputRef.current.removeListener();
      selectedInputRef.current = null;
    }
    WebMidi.disable();
    setIsEnabled(false);
    setSelectedDeviceId(null);
    setDevices([]);
  }, []);

  // Select a device
  const selectDevice = useCallback((deviceId: string | null) => {
    // Remove listeners from current device
    if (selectedInputRef.current) {
      selectedInputRef.current.removeListener();
      selectedInputRef.current = null;
    }

    if (!deviceId) {
      setSelectedDeviceId(null);
      return;
    }

    const input = WebMidi.getInputById(deviceId);
    if (!input) {
      setError(`Device ${deviceId} not found`);
      return;
    }

    // Add noteon listener
    input.addListener('noteon', (e) => {
      if (optionsRef.current.enabled && optionsRef.current.onNoteOn) {
        // Access velocity from the message data
        const velocity = (e as unknown as { rawVelocity: number }).rawVelocity ?? 100;
        optionsRef.current.onNoteOn(e.note.number, velocity);
      }
    });

    // Add noteoff listener
    input.addListener('noteoff', (e) => {
      if (optionsRef.current.enabled && optionsRef.current.onNoteOff) {
        optionsRef.current.onNoteOff(e.note.number);
      }
    });

    // Add control change listener
    input.addListener('controlchange', (e) => {
      if (optionsRef.current.enabled && optionsRef.current.onControlChange) {
        const value = (e as unknown as { rawValue: number }).rawValue ?? 0;
        optionsRef.current.onControlChange(e.controller.number, value);
      }
    });

    selectedInputRef.current = input;
    setSelectedDeviceId(deviceId);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (selectedInputRef.current) {
        selectedInputRef.current.removeListener();
      }
      if (isEnabled) {
        WebMidi.disable();
      }
    };
  }, [isEnabled]);

  return {
    isEnabled,
    isSupported,
    devices,
    selectedDeviceId,
    selectDevice,
    error,
    enable,
    disable,
  };
}

export { GM_DRUM_MAP };
