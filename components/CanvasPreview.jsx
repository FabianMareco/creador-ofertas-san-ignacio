'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { renderToCanvas, FORMATS } from '@/lib/drawCanvas';

export default function CanvasPreview({
  templateId, imageUrl, productName, currentPrice,
  oldPrice, format, logoPosition, currency, badgeText, isMobile,
}) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const timerRef     = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 500, h: 700 });

  const fmt    = FORMATS.find(f => f.id === format) || FORMATS[0];
  const aspect = fmt.width / fmt.height;

  // Measure the container so we know the available space
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };

    const raf = requestAnimationFrame(measure);
    const ro  = new ResizeObserver(measure);
    ro.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  // Calculate the CSS display size of the canvas
  const hPad = isMobile ? 32 : 56;
  const vPad = isMobile ? 52 : 90;
  const maxW = Math.max(containerSize.w - hPad, 100);
  const maxH = Math.max(containerSize.h - vPad, 100);

  let pW, pH;
  if (maxW / maxH > aspect) {
    pH = maxH; pW = Math.round(pH * aspect);
  } else {
    pW = maxW; pH = Math.round(pW / aspect);
  }

  const doRender = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || pW < 50 || pH < 50) return;

    // DPR for crisp rendering on retina screens
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Physical canvas pixels = pW*dpr × pH*dpr
    canvas.width  = pW * dpr;
    canvas.height = pH * dpr;

    // CSS display size stays at pW × pH
    canvas.style.width  = `${pW}px`;
    canvas.style.height = `${pH}px`;

    // Scale the context so our drawing coordinates stay at pW × pH
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Pass pW/pH as the drawing coordinate space so renderToCanvas
    // uses those — NOT canvas.width which is the physical pixel count
    await renderToCanvas(canvas, {
      templateId, imageUrl, productName, currentPrice,
      oldPrice, logoPosition, currency, badgeText,
      drawWidth: pW,   // ← the coordinate space width
      drawHeight: pH,  // ← the coordinate space height
    });
  }, [templateId, imageUrl, productName, currentPrice,
      oldPrice, format, logoPosition, currency, badgeText, pW, pH]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doRender, 80);
    return () => clearTimeout(timerRef.current);
  }, [doRender]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobile ? 8 : 12,
        padding: isMobile ? '4px 16px' : '0 28px',
        boxSizing: 'border-box',
      }}
    >
      {/* Format label — desktop only */}
      {!isMobile && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid #3A3A3E', color: '#8E8E93' }}
        >
          <span>{fmt.icon}</span>
          <span style={{ fontFamily: 'Outfit', fontSize: 12 }}>
            {fmt.name} — {fmt.width}×{fmt.height}px — {fmt.label}
          </span>
        </div>
      )}

      {/* Canvas preview */}
      <div style={{
        boxShadow: isMobile
          ? '0 6px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)'
          : '0 24px 72px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
        borderRadius: isMobile ? 6 : 10,
        overflow: 'hidden',
        lineHeight: 0,
        flexShrink: 0,
      }}>
        <canvas ref={canvasRef} style={{ display: 'block' }} />
      </div>

      {/* Info */}
      <p style={{
        fontSize: isMobile ? 10 : 11,
        color: '#555',
        fontFamily: 'Outfit',
        textAlign: 'center',
        margin: 0,
      }}>
        {isMobile
          ? `${fmt.name} · ${fmt.width}×${fmt.height}px`
          : `Vista previa — export en alta resolución (${fmt.width}×${fmt.height}px)`}
      </p>
    </div>
  );
}
