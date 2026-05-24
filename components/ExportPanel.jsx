'use client';
import { useState } from 'react';
import { FORMATS, renderToCanvas } from '@/lib/drawCanvas';

export default function ExportPanel({ format, onFormatChange, templateId, imageUrl, productName, currentPrice, oldPrice, logoPosition, currency, badgeText, tagline, showTagline }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exported,    setExported]    = useState(false);

  const handleExport = async () => {
    setIsExporting(true); setExported(false);
    try {
      const fmt = FORMATS.find(f => f.id === format) || FORMATS[0];
      const canvas = document.createElement('canvas');
      canvas.width = fmt.width; canvas.height = fmt.height;
      await renderToCanvas(canvas, { templateId, imageUrl, productName, currentPrice, oldPrice, logoPosition, currency, badgeText, tagline, showTagline });
      canvas.toBlob(blob => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safe = (productName || 'oferta').replace(/[^a-zA-Z0-9]/g,'_').slice(0,20);
        a.download = `DSI_${safe}_${format}.png`;
        a.click(); URL.revokeObjectURL(url);
        setExported(true); setTimeout(() => setExported(false), 3000);
      }, 'image/png', 1.0);
    } finally { setIsExporting(false); }
  };

  return (
    <div>
      <p className="section-label mb-2">Formato de exportación</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {FORMATS.map(f => (
          <button key={f.id} onClick={() => onFormatChange(f.id)}
            className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-1.5 transition-all"
            style={{
              background: format === f.id ? 'rgba(196,30,42,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${format === f.id ? '#C41E2A' : '#3A3A3E'}`,
            }}>
            <span style={{ fontSize: 18 }}>{f.icon}</span>
            <span style={{ fontSize: 11, fontWeight: format === f.id ? 700 : 400, color: format === f.id ? '#FFF' : '#8E8E93', fontFamily: 'Outfit', textAlign: 'center', lineHeight: 1.2 }}>{f.name}</span>
            <span style={{ fontSize: 9, color: '#555', fontFamily: 'Outfit' }}>{f.width}×{f.height}</span>
          </button>
        ))}
      </div>
      <button onClick={handleExport} disabled={isExporting}
        className="w-full btn-gold flex items-center justify-center gap-2 py-3" style={{ borderRadius: 12, fontSize: 15 }}>
        {isExporting ? <><span className="spinner" style={{ borderTopColor: '#1C1C1E' }} /> Generando…</>
          : exported ? <>✅ ¡Imagen descargada!</>
          :             <>⬇️ Descargar en alta calidad</>}
      </button>
      {exported && <p className="text-center text-xs mt-2" style={{ color: '#5CB85C', fontFamily: 'Outfit' }}>Lista para WhatsApp / Instagram / Facebook</p>}
    </div>
  );
}
