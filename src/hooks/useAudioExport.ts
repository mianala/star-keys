import { useCallback } from 'react';
import type { Score } from '@/types/index.ts';

export interface AudioExportOptions {
  score: Score;
  tempo: number;
  format: 'wav' | 'mp3';
  filename?: string;
}

export interface UseAudioExportResult {
  exportAudio: (options: AudioExportOptions) => Promise<void>;
  isExporting: boolean;
  error: string | null;
}

// Convert AudioBuffer to WAV format
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels: Float32Array[] = [];
  let i: number;
  let sample: number;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this demo)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < buffer.length) {
    for (i = 0; i < numOfChan; i++) {
      // clamp sample to [-1, 1]
      sample = Math.max(-1, Math.min(1, channels[i][pos]));
      // scale to 16-bit signed int
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(44 + offset, sample, true);
      offset += 2;
    }
    pos++;
  }

  return bufferArr;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

// Simple MP3 encoder placeholder (would need lamejs or similar library)
async function encodeMp3(wavData: ArrayBuffer): Promise<Blob> {
  void wavData; // Parameter kept for API consistency
  // For now, return WAV data as MP3 is complex to implement without external libraries
  // In a real implementation, you'd use lamejs or similar
  throw new Error('MP3 export requires lamejs library. Please use WAV export for now.');
}

export function useAudioExport(): UseAudioExportResult {
  const exportAudio = useCallback(async (options: AudioExportOptions) => {
    const { score: _score, tempo: _tempo, format, filename = 'export' } = options;

    try {
      // Create offline audio context for rendering
      const sampleRate = 44100;
      const offlineContext = new OfflineAudioContext(2, sampleRate * 60 * 10, sampleRate); // 10 minutes max

      // This is a simplified version - in reality, you'd need to:
      // 1. Schedule all notes from the score using the same logic as PlaybackScheduler
      // 2. Load all soundfont samples
      // 3. Render them to the offline context

      // For now, we'll create a placeholder implementation
      // that renders a simple tone as a demonstration

      const duration = 2; // Placeholder duration
      const osc = offlineContext.createOscillator();
      const gain = offlineContext.createGain();

      osc.connect(gain);
      gain.connect(offlineContext.destination);

      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.5, 0);
      gain.gain.exponentialRampToValueAtTime(0.01, duration);

      osc.start(0);
      osc.stop(duration);

      const renderedBuffer = await offlineContext.startRendering();

      let blob: Blob;
      if (format === 'mp3') {
        // Mark variables as intentionally unused for placeholder implementation
        void _score; void _tempo;
        const wavData = audioBufferToWav(renderedBuffer);
        blob = await encodeMp3(wavData);
      } else {
        const wavData = audioBufferToWav(renderedBuffer);
        blob = new Blob([wavData], { type: 'audio/wav' });
      }

      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      throw new Error(`Audio export failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  return {
    exportAudio,
    isExporting: false,
    error: null,
  };
}

// Helper function to trigger audio export (can be used outside React)
export async function downloadAudioBlob(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
