import { useCallback, useRef } from 'react';
import type { Score } from '@/types/index.ts';
import { parseMusicXML } from '@/core/musicxml/index.ts';
import { createScore, GUITAR_STANDARD, DRUM_SET } from '@/core/score/index.ts';
import JSZip from 'jszip';

interface UseFileIOOptions {
  setScore: (score: Score) => void;
  musicXML: string;
  scoreTitle: string;
}

export function useFileIO({ setScore, musicXML, scoreTitle }: UseFileIOOptions) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const newScore = useCallback(() => {
    setScore(createScore('Untitled Score', '', [GUITAR_STANDARD, DRUM_SET], 8));
  }, [setScore]);

  const openFile = useCallback(async (file: File) => {
    try {
      if (file.name.endsWith('.mxl')) {
        const zip = await JSZip.loadAsync(file);
        // Find the rootfile from META-INF/container.xml or the first .xml file
        let xmlContent: string | null = null;

        const containerFile = zip.file('META-INF/container.xml');
        if (containerFile) {
          const containerXml = await containerFile.async('string');
          const parser = new DOMParser();
          const doc = parser.parseFromString(containerXml, 'application/xml');
          const rootfilePath = doc.querySelector('rootfile')?.getAttribute('full-path');
          if (rootfilePath) {
            const rootFile = zip.file(rootfilePath);
            if (rootFile) {
              xmlContent = await rootFile.async('string');
            }
          }
        }

        if (!xmlContent) {
          // Fallback: find first .xml file
          for (const [path, zipEntry] of Object.entries(zip.files)) {
            if (path.endsWith('.xml') && !path.startsWith('META-INF')) {
              xmlContent = await zipEntry.async('string');
              break;
            }
          }
        }

        if (!xmlContent) {
          throw new Error('No MusicXML file found in MXL archive');
        }

        const score = parseMusicXML(xmlContent);
        setScore(score);
      } else {
        const text = await file.text();
        const score = parseMusicXML(text);
        setScore(score);
      }
    } catch (err) {
      console.error('Failed to open file:', err);
      alert(`Failed to open file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [setScore]);

  const triggerOpen = useCallback(() => {
    if (!fileInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xml,.musicxml,.mxl';
      input.style.display = 'none';
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (file) openFile(file);
        input.value = '';
      });
      document.body.appendChild(input);
      fileInputRef.current = input;
    }
    fileInputRef.current.click();
  }, [openFile]);

  const saveAsXML = useCallback(() => {
    const blob = new Blob([musicXML], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scoreTitle || 'score'}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }, [musicXML, scoreTitle]);

  const exportAsMXL = useCallback(async () => {
    const zip = new JSZip();
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container>
  <rootfiles>
    <rootfile full-path="score.xml"/>
  </rootfiles>
</container>`;
    zip.file('META-INF/container.xml', containerXml);
    zip.file('score.xml', musicXML);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scoreTitle || 'score'}.mxl`;
    a.click();
    URL.revokeObjectURL(url);
  }, [musicXML, scoreTitle]);

  return { newScore, triggerOpen, saveAsXML, exportAsMXL };
}
