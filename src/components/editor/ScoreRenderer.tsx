import { useRef, useEffect, useCallback } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';

interface ScoreRendererProps {
  musicXML: string;
  zoom?: number;
  darkMode?: boolean;
  onOsmdReady?: (osmd: OSMD) => void;
}

export function ScoreRenderer({ musicXML, zoom = 100, darkMode = false, onOsmdReady }: ScoreRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OSMD | null>(null);
  const onOsmdReadyRef = useRef(onOsmdReady);
  useEffect(() => {
    onOsmdReadyRef.current = onOsmdReady;
  }, [onOsmdReady]);

  const renderOsmd = useCallback(async (container: HTMLDivElement, xml: string, z: number, dark: boolean) => {
    let cancelled = false;

    const cleanup = () => { cancelled = true; };

    try {
      if (!osmdRef.current) {
        osmdRef.current = new OSMD(container, {
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
        // Show cursor after render
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

  // Single effect: re-render whenever musicXML, zoom, or darkMode changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !musicXML) return;

    let cleanupFn: (() => void) | undefined;

    renderOsmd(container, musicXML, zoom, darkMode).then((fn) => {
      cleanupFn = fn;
    });

    return () => {
      cleanupFn?.();
    };
  }, [musicXML, zoom, darkMode, renderOsmd]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (osmdRef.current) {
        osmdRef.current.render();
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      osmdRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="score-renderer"
      style={{
        width: '100%',
        minHeight: 200,
        overflow: 'auto',
      }}
    />
  );
}
