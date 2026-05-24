'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { renderToCanvas, FORMATS } from '@/lib/drawCanvas';

export default function CanvasPreview({ templateId, imageUrl, productName, currentPrice, oldPrice, format, logoPosition, currency, badgeText, isMobile }) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const timerRef     = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 500, h: 700 });

  const fmt = FORMATS.find(f => f.id === format) || FORMATS[0];
  const aspect = fmt.width / fmt.height;

  // Dynamic sizing based on container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Calculate optimal preview size
  const padding = isMobile ? 24 : 56;
  const labelH  = isMobile ? 70 : 90;
  const maxW = Math.max(containerSize.w - padding, 140);
  const maxH = Math.max(containerSize.h - labelH, 100);

  let pW, pH;
  if (maxW / maxH > aspect) {
    // Height-constrained
    pH = maxH; pW = Math.round(pH * aspect);
  } else {
    // Width-constrained
    pW = maxW; pH = Math.round(pW / aspect);
  }

  // Mobile: cap story height to avoid taking too much space
  if (isMobile && format === 'story') {
    const cap = Math.round(window?.innerHeight * 0.35) || 250;
    if (pH > cap) { pH = cap; pW = Math.round(pH * aspect); }
  }

  const doRender = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || pW <= 0 || pH <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = pW * dpr; canvas.height = pH * dpr;
    canvas.style.width = `${pW}px`; canvas.style.height = `${pH}px`;
    canvas.getContext('2d').scale(dpr, dpr);
    await renderToCanvas(canvas, { templateId, imageUrl, productName, currentPrice, oldPrice, logoPosition, currency, badgeText });
  }, [templateId, imageUrl, productName, currentPrice, oldPrice, format, logoPosition, currency, badgeText, pW, pH]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doRender, 80);
    return () => clearTimeout(timerRef.current);
  }, [doRender]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 8 : 12, padding: isMobile ? '0 12px' : '0 28px' }}>

      {/* Format label */}
      {!isMobile && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #3A3A3E', color: '#8E8E93' }}>
          <span>{fmt.icon}</span>
          <span style={{ fontFamily: 'Outfit' }}>{fmt.name} — {fmt.width}×{fmt.height}px — {fmt.label}</span>
        </div>
      )}

      {/* Canvas */}
      <div style={{
        boxShadow: isMobile
          ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)'
          : '0 24px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
        borderRadius: isMobile ? 6 : 10, overflow: 'hidden', lineHeight: 0, flexShrink: 0,
      }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />
      </div>

      {/* Info */}
      {isMobile ? (
        <p style={{ fontSize: 10, color: '#555', fontFamily: 'Outfit', textAlign: 'center' }}>
          {fmt.name} {fmt.width}×{fmt.height}px
        </p>
      ) : (
        <p style={{ fontSize: 11, color: '#555', fontFamily: 'Outfit', textAlign: 'center' }}>
          Vista previa — el export es en alta resolución ({fmt.width}×{fmt.height}px)
        </p>
      )}
    </div>
  );
}
