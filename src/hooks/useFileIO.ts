import { useCallback, useRef } from 'react';
import type { Score } from '@/types/index.ts';
import { parseMusicXML } from '@/core/musicxml/index.ts';
import { createScore, PIANO } from '@/core/score/index.ts';
import { downloadMidi, importMidi } from '@/core/midi/index.ts';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import JSZip from 'jszip';

interface UseFileIOOptions {
  setScore: (score: Score) => void;
  musicXML: string;
  scoreTitle: string;
  score?: Score;
  tempo?: number;
}

export function useFileIO({ setScore, musicXML, scoreTitle, score, tempo = 120 }: UseFileIOOptions) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const newScore = useCallback(() => {
    setScore(createScore('Untitled Score', '', [PIANO], 8));
  }, [setScore]);

  const openFile = useCallback(async (file: File) => {
    try {
      if (file.name.endsWith('.mid') || file.name.endsWith('.midi')) {
        const buffer = await file.arrayBuffer();
        const parsed = importMidi(buffer);
        setScore(parsed);
        return;
      }

      if (file.name.endsWith('.mxl')) {
        const zip = await JSZip.loadAsync(file);
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

        const parsed = parseMusicXML(xmlContent);
        setScore(parsed);
      } else {
        const text = await file.text();
        const parsed = parseMusicXML(text);
        setScore(parsed);
      }
    } catch (err) {
      console.error('Failed to open file:', err);
      throw err instanceof Error ? err : new Error('Failed to open file');
    }
  }, [setScore]);

  const triggerOpen = useCallback(() => {
    if (!fileInputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xml,.musicxml,.mxl,.mid,.midi';
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

  const exportAsMidi = useCallback(() => {
    if (!score) return;
    downloadMidi(score, tempo, `${scoreTitle || 'score'}.mid`);
  }, [score, tempo, scoreTitle]);

  const exportAsSVG = useCallback(() => {
    // Find the OSMD SVG element in the DOM
    const svgEl = document.querySelector('.score-renderer svg');
    if (!svgEl) {
      throw new Error('No score rendered to export');
      return;
    }

    const clone = svgEl.cloneNode(true) as SVGElement;
    // Inline computed styles
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const svgString = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scoreTitle || 'score'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scoreTitle]);

  const exportAsPNG = useCallback(() => {
    const svgEl = document.querySelector('.score-renderer svg');
    if (!svgEl) {
      throw new Error('No score rendered to export');
      return;
    }

    const clone = svgEl.cloneNode(true) as SVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const svgString = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const dpi = 2; // 2x for retina
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth * dpi;
      canvas.height = img.naturalHeight * dpi;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpi, dpi);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${scoreTitle || 'score'}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');

      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  }, [scoreTitle]);

  const exportAsPDF = useCallback(async () => {
    const svgEl = document.querySelector('.score-renderer svg') as SVGElement | null;
    if (!svgEl) {
      throw new Error('No score rendered to export');
    }

    const bbox = svgEl.getBoundingClientRect();
    const width = bbox.width;
    const height = bbox.height;

    // Create PDF in landscape or portrait depending on aspect ratio
    const orientation = width > height ? 'landscape' : 'portrait';
    const doc = new jsPDF({
      orientation,
      unit: 'pt',
      format: [width, height],
    });

    await doc.svg(svgEl, { x: 0, y: 0, width, height });
    doc.save(`${scoreTitle || 'score'}.pdf`);
  }, [scoreTitle]);

  const printScore = useCallback(() => {
    window.print();
  }, []);

  return { newScore, triggerOpen, saveAsXML, exportAsMXL, exportAsMidi, exportAsSVG, exportAsPNG, exportAsPDF, printScore };
}
