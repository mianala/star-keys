import { useRef, useEffect, useCallback, useState } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import type { Step } from '@/types/index.ts';

interface ScoreRendererProps {
  musicXML: string;
  zoom?: number;
  darkMode?: boolean;
  onOsmdReady?: (osmd: OSMD) => void;
  onClick?: (measureIndex: number, pitchStep: Step, octave: number) => void;
  hoverEnabled?: boolean;
}

// Map Y positions to staff lines (simplified - assumes treble clef for now)
const TREBLE_LINES: { step: Step; octave: number; lineOffset: number }[] = [
  { step: 'F', octave: 5, lineOffset: -1 },   // Above staff
  { step: 'E', octave: 5, lineOffset: -1 },
  { step: 'D', octave: 5, lineOffset: 0 },    // Top line
  { step: 'C', octave: 5, lineOffset: 0 },
  { step: 'B', octave: 4, lineOffset: 1 },
  { step: 'A', octave: 4, lineOffset: 1 },
  { step: 'G', octave: 4, lineOffset: 2 },
  { step: 'F', octave: 4, lineOffset: 2 },
  { step: 'E', octave: 4, lineOffset: 3 },
  { step: 'D', octave: 4, lineOffset: 3 },
  { step: 'C', octave: 4, lineOffset: 4 },
  { step: 'B', octave: 3, lineOffset: 4 },
  { step: 'A', octave: 3, lineOffset: 5 },
  { step: 'G', octave: 3, lineOffset: 5 },
  { step: 'F', octave: 3, lineOffset: 6 },    // Below staff
  { step: 'E', octave: 3, lineOffset: 6 },
];

export function ScoreRenderer({ 
  musicXML, 
  zoom = 100, 
  darkMode = false, 
  onOsmdReady,
  onClick,
  hoverEnabled = false
}: ScoreRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdContainerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OSMD | null>(null);
  const onOsmdReadyRef = useRef(onOsmdReady);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number; measureIndex: number; step: Step; octave: number } | null>(null);
  
  useEffect(() => {
    onOsmdReadyRef.current = onOsmdReady;
  }, [onOsmdReady]);

  // Calculate pitch from Y position (simplified calculation)
  const calculatePitchFromY = useCallback((clientX: number, clientY: number, containerRect: DOMRect): { step: Step; octave: number; measureIndex: number } | null => {
    // This is a simplified calculation - in reality we'd need to analyze the OSMD SVG
    // For now, estimate based on position within container
    const relativeY = clientY - containerRect.top;
    
    // Map to pitch (this is a rough approximation)
    const pitchIndex = Math.max(0, Math.min(TREBLE_LINES.length - 1, Math.floor(relativeY / 12)));
    const pitch = TREBLE_LINES[pitchIndex];
    
    if (!pitch) return null;
    
    // Estimate measure based on X position
    const relativeX = clientX - containerRect.left;
    const measureWidth = containerRect.width / 4; // Approximate
    const measureIndex = Math.max(0, Math.floor(relativeX / measureWidth));
    
    return { step: pitch.step, octave: pitch.octave, measureIndex };
  }, []);

  const renderOsmd = useCallback(async (xml: string, z: number, dark: boolean) => {
    let cancelled = false;
    const cleanup = () => { cancelled = true; };

    const osmdContainer = osmdContainerRef.current;
    if (!osmdContainer) return cleanup;

    try {
      if (!osmdRef.current) {
        osmdRef.current = new OSMD(osmdContainer, {
          autoResize: false,
          drawTitle: false,
          drawComposer: false,
          drawPartNames: true,
          drawPartAbbreviations: false,
          drawingParameters: 'default',
          cursorsOptions: [{ type: 0, color: '#4a7cff', alpha: 0.5, follow: true }],
        });
      }

      const osmd = osmdRef.current;
      osmd.zoom = z / 100;

      const colorOpts = dark
        ? {
            defaultColorNotehead: '#e0e0e0',
            defaultColorStem: '#e0e0e0',
            defaultColorRest: '#e0e0e0',
            defaultColorLabel: '#e0e0e0',
            defaultColorTitle: '#e0e0e0',
          }
        : {
            defaultColorNotehead: '#000000',
            defaultColorStem: '#000000',
            defaultColorRest: '#000000',
            defaultColorLabel: '#000000',
            defaultColorTitle: '#000000',
          };
      osmd.setOptions(colorOpts);

      await osmd.load(xml);
      if (!cancelled) {
        osmd.render();
        if (osmd.cursors && osmd.cursors.length > 0) {
          const cursor = osmd.cursors[0];
          cursor.show();
        }
        onOsmdReadyRef.current?.(osmd);
      }
    } catch (err) {
      console.error('OSMD render error:', err);
    }

    return cleanup;
  }, []);

  useEffect(() => {
    if (!musicXML) return;

    let cleanupFn: (() => void) | undefined;

    renderOsmd(musicXML, zoom, darkMode).then((fn) => {
      cleanupFn = fn;
    });

    return () => {
      cleanupFn?.();
    };
  }, [musicXML, zoom, darkMode, renderOsmd]);

  useEffect(() => {
    const handleResize = () => {
      if (osmdRef.current) {
        osmdRef.current.render();
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (osmdContainerRef.current) {
      observer.observe(osmdContainerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      osmdRef.current = null;
    };
  }, []);

  // Mouse event handlers for click-to-insert
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!hoverEnabled || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const pitch = calculatePitchFromY(e.clientX, e.clientY, rect);
    
    if (pitch) {
      setHoverPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        measureIndex: pitch.measureIndex,
        step: pitch.step,
        octave: pitch.octave
      });
    }
  }, [hoverEnabled, calculatePitchFromY]);

  const handleMouseLeave = useCallback(() => {
    setHoverPos(null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!onClick || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const pitch = calculatePitchFromY(e.clientX, e.clientY, rect);
    
    if (pitch) {
      onClick(pitch.measureIndex, pitch.step, pitch.octave);
    }
  }, [onClick, calculatePitchFromY]);

  return (
    <div
      ref={containerRef}
      className="score-renderer"
      style={{
        width: '100%',
        minHeight: 200,
        overflow: 'auto',
        position: 'relative',
        cursor: hoverEnabled ? 'crosshair' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* OSMD container - this gets cleared by OSMD */}
      <div ref={osmdContainerRef} style={{ width: '100%' }} />
      
      {/* Hover preview - sibling element, not child of OSMD container */}
      {hoverEnabled && hoverPos && (
        <div
          className="note-preview"
          style={{
            position: 'absolute',
            left: hoverPos.x - 10,
            top: hoverPos.y - 8,
            width: 20,
            height: 16,
            borderRadius: '50%',
            backgroundColor: darkMode ? '#4a7cff' : '#4a7cff',
            opacity: 0.6,
            pointerEvents: 'none',
            zIndex: 100,
            transition: 'none',
          }}
          title={`${hoverPos.step}${hoverPos.octave} (Measure ${hoverPos.measureIndex + 1})`}
        />
      )}
    </div>
  );
}
