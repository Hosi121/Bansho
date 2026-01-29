'use client';

import mermaid from 'mermaid';
import type React from 'react';
import { useEffect, useId, useRef, useState } from 'react';

// Initialize mermaid with dark theme configuration
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

interface MermaidDiagramProps {
  chart: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const uniqueId = useId().replace(/:/g, '-');

  useEffect(() => {
    const renderChart = async () => {
      if (!chart.trim()) {
        setSvg('');
        setError('');
        return;
      }

      try {
        // Clear previous errors
        setError('');

        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(`mermaid-${uniqueId}`, chart);

        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'ダイアグラムの描画に失敗しました');
        setSvg('');
      }
    };

    renderChart();
  }, [chart, uniqueId]);

  if (error) {
    return (
      <div className="my-4 rounded-md border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Mermaidエラー: {error}</p>
        <pre className="mt-2 overflow-x-auto text-xs text-muted-foreground">
          <code>{chart}</code>
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 flex items-center justify-center rounded-md border bg-muted p-4">
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center overflow-x-auto rounded-md border bg-card p-4"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid SVG output is trusted
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidDiagram;
