'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Canvas flood-fill background removal ────────────────────────────────────
// Same algorithm used in Python for the logo — works great on uniform/light backgrounds

async function canvasRemoveBg(imageUrl, onProgress) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:') && !imageUrl.startsWith('/')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      onProgress?.('Analizando imagen…', 30);
      const W = img.naturalWidth || 300, H = img.naturalHeight || 300;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, W, H);
      const d = imageData.data;

      // Sample background color from multiple edge points
      const samplePx = (x, y) => {
        const i = (y * W + x) * 4;
        return [d[i], d[i+1], d[i+2]];
      };
      const edgeSamples = [
        samplePx(0,0), samplePx(W-1,0), samplePx(0,H-1), samplePx(W-1,H-1),
        samplePx(Math.floor(W/2),0), samplePx(Math.floor(W/2),H-1),
        samplePx(0,Math.floor(H/2)), samplePx(W-1,Math.floor(H/2)),
        samplePx(Math.floor(W/4),0), samplePx(Math.floor(3*W/4),0),
      ];
      const bg = edgeSamples.reduce((a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]]).map(v=>v/edgeSamples.length);

      const threshold = 40;
      const colorDist = (i) => {
        const dr = d[i]-bg[0], dg = d[i+1]-bg[1], db = d[i+2]-bg[2];
        return Math.sqrt(dr*dr+dg*dg+db*db);
      };

      onProgress?.('Eliminando fondo…', 55);

      // Flood fill from all edges
      const visited = new Uint8Array(W * H);
      const queue = [];
      for (let x = 0; x < W; x++) { queue.push([x,0]); queue.push([x,H-1]); }
      for (let y = 1; y < H-1; y++) { queue.push([0,y]); queue.push([W-1,y]); }

      let qi = 0;
      while (qi < queue.length) {
        const [x,y] = queue[qi++];
        if (x<0||x>=W||y<0||y>=H) continue;
        const idx = y*W+x;
        if (visited[idx]) continue;
        visited[idx] = 1;
        const pi = idx*4;
        if (colorDist(pi) > threshold) continue;
        d[pi+3] = 0; // make transparent
        queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
      }

      // Soften edges slightly
      onProgress?.('Suavizando bordes…', 80);
      for (let y = 1; y < H-1; y++) {
        for (let x = 1; x < W-1; x++) {
          const i = (y*W+x)*4;
          if (d[i+3] === 0) continue;
          const n = [
            d[((y-1)*W+x)*4+3], d[((y+1)*W+x)*4+3],
            d[(y*W+(x-1))*4+3], d[(y*W+(x+1))*4+3],
          ].filter(a=>a===0).length;
          if (n >= 2) d[i+3] = Math.max(0, d[i+3] - 80);
        }
      }

      onProgress?.('Finalizando…', 95);
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Error al procesar'));
        resolve(URL.createObjectURL(blob));
      }, 'image/png');
    };

    img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    img.src = imageUrl;
  });
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function CheckerBg({ children, style }) {
  return (
    <div style={{
      backgroundImage: `linear-gradient(45deg,#2e2e2e 25%,transparent 25%),linear-gradient(-45deg,#2e2e2e 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#2e2e2e 75%),linear-gradient(-45deg,transparent 75%,#2e2e2e 75%)`,
      backgroundSize: '14px 14px',
      backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0px',
      backgroundColor: '#252528',
      borderRadius: 10, overflow: 'hidden', ...style,
    }}>{children}</div>
  );
}

function Slider({ label, icon, value, min, max, onChange, defaultValue = 100 }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#FFFFFF', fontFamily: 'Outfit' }}>{icon} {label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#8E8E93', fontFamily: 'Outfit', minWidth: 38, textAlign: 'right' }}>{value}%</span>
          {value !== defaultValue && (
            <button onClick={() => onChange(defaultValue)}
              style={{ fontSize: 12, color: '#F5A623', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}
              title="Resetear">↺</button>
          )}
        </div>
      </div>
      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 4, background: '#3A3A3E', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#C41E2A,#F5A623)', transition: 'width 0.05s' }} />
        </div>
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', left: 0, right: 0, opacity: 0, cursor: 'pointer', height: 20, width: '100%', margin: 0 }} />
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function TabFondo({ originalUrl, workingUrl, onBgRemoved }) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress]     = useState({ stage: '', pct: 0 });
  const [error, setError]           = useState('');
  const [done, setDone]             = useState(false);

  const handleRemoveBg = async () => {
    setProcessing(true); setError(''); setDone(false);
    setProgress({ stage: 'Iniciando…', pct: 10 });
    try {
      const url = await canvasRemoveBg(originalUrl, (stage, pct) => setProgress({ stage, pct }));
      onBgRemoved(url);
      setDone(true);
    } catch (err) {
      setError('No se pudo procesar. Funciona mejor con fondos claros y uniformes.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'ORIGINAL', url: originalUrl, checker: false },
          { label: 'SIN FONDO', url: workingUrl, checker: true },
        ].map(({ label, url, checker }) => (
          <div key={label}>
            <p style={{ fontSize: 10, color: checker ? '#F5A623' : '#8E8E93', fontFamily: 'Outfit', textAlign: 'center', marginBottom: 5, letterSpacing: '0.08em' }}>{label}</p>
            {checker ? (
              <CheckerBg style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 130 }}>
                {processing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 16 }}>
                    <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
                    <p style={{ fontSize: 10, color: '#F5A623', fontFamily: 'Outfit', textAlign: 'center', lineHeight: 1.4 }}>{progress.stage}</p>
                    <div style={{ width: 100, height: 4, background: '#3A3A3E', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${progress.pct}%`, height: '100%', background: '#F5A623', transition: 'width 0.4s' }} />
                    </div>
                  </div>
                ) : url ? (
                  <img src={url} alt="Sin fondo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: 8 }} />
                ) : (
                  <p style={{ fontSize: 11, color: '#555', fontFamily: 'Outfit', textAlign: 'center', padding: 16 }}>Presioná el botón↓</p>
                )}
              </CheckerBg>
            ) : (
              <div style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#252528', border: '1px solid #3A3A3E', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 130 }}>
                <img src={url} alt="Original" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: 4 }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleRemoveBg} disabled={processing}
        style={{ width: '100%', padding: '12px 16px', borderRadius: 10, cursor: processing ? 'default' : 'pointer',
          background: done ? 'rgba(92,184,92,0.12)' : 'rgba(196,30,42,0.12)',
          border: `1px solid ${done ? 'rgba(92,184,92,0.4)' : 'rgba(196,30,42,0.4)'}`,
          color: processing ? '#555' : '#FFFFFF', fontFamily: 'Outfit', fontWeight: 600, fontSize: 13,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 0.2s' }}>
        {processing ? <><span className="spinner" style={{ borderTopColor: '#FFF' }} /> Procesando…</> 
          : done ? <>✅ Fondo eliminado — podés volver a procesar</>
          : <>✂️ Quitar fondo (algoritmo de relleno inteligente)</>}
      </button>

      {error && <p style={{ fontSize: 11, color: '#FF6B6B', textAlign: 'center', fontFamily: 'Outfit', background: 'rgba(196,30,42,0.08)', padding: '8px 12px', borderRadius: 8 }}>{error}</p>}

      <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)' }}>
        <p style={{ fontSize: 11, color: '#F5A623', fontFamily: 'Outfit', lineHeight: 1.5 }}>
          💡 <strong>Funciona mejor</strong> con fotos de fondo blanco o de un solo color. El algoritmo detecta el fondo desde los bordes de la imagen.
        </p>
      </div>
    </div>
  );
}

function TabEncuadre({ workingUrl, zoom, setZoom, panX, setPanX, panY, setPanY }) {
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ sx: 0, sy: 0, spx: 0, spy: 0 });
  const containerRef = useRef(null);

  const startDrag = (cx, cy) => { setDragging(true); dragRef.current = { sx: cx, sy: cy, spx: panX, spy: panY }; };
  const moveDrag  = (cx, cy) => { if (!dragging) return; const { sx, sy, spx, spy } = dragRef.current; setPanX(spx + cx - sx); setPanY(spy + cy - sy); };
  const endDrag   = () => setDragging(false);

  const handleWheel = useCallback(e => { e.preventDefault(); setZoom(z => Math.max(0.5, Math.min(5, z - e.deltaY * 0.001))); }, [setZoom]);
  useEffect(() => { const el = containerRef.current; if (!el) return; el.addEventListener('wheel', handleWheel, { passive: false }); return () => el.removeEventListener('wheel', handleWheel); }, [handleWheel]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['🖱️ Arrastrá para mover', '🖱️ Scroll para zoom'].map(t => (
          <span key={t} style={{ fontSize: 10, color: '#8E8E93', background: '#252528', border: '1px solid #3A3A3E', padding: '3px 8px', borderRadius: 20, fontFamily: 'Outfit' }}>{t}</span>
        ))}
      </div>

      <div ref={containerRef}
        onMouseDown={e => startDrag(e.clientX, e.clientY)}
        onMouseMove={e => moveDrag(e.clientX, e.clientY)}
        onMouseUp={endDrag} onMouseLeave={endDrag}
        onTouchStart={e => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); }}
        onTouchMove={e => { const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }}
        onTouchEnd={endDrag}
        style={{ width: '100%', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#252528',
          border: `2px solid ${dragging ? '#C41E2A' : '#3A3A3E'}`, cursor: dragging ? 'grabbing' : 'grab',
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.15s', userSelect: 'none' }}>
        {workingUrl && (
          <img src={workingUrl} alt="Encuadre" draggable={false}
            style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none',
              transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: 'center center',
              transition: dragging ? 'none' : 'transform 0.05s' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '33.3% 33.3%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }} />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#FFF', fontFamily: 'Outfit' }}>🔍 Zoom</span>
          <span style={{ fontSize: 11, color: '#8E8E93', fontFamily: 'Outfit' }}>{Math.round(zoom * 100)}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} style={{ width: 28, height: 28, borderRadius: 6, background: '#252528', border: '1px solid #3A3A3E', color: '#FFF', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
          <div style={{ flex: 1, position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 4, background: '#3A3A3E', overflow: 'hidden' }}>
              <div style={{ width: `${((zoom - 0.5) / 4.5) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#C41E2A,#F5A623)' }} />
            </div>
            <input type="range" min={50} max={500} step={5} value={Math.round(zoom * 100)} onChange={e => setZoom(Number(e.target.value) / 100)}
              style={{ position: 'absolute', left: 0, right: 0, opacity: 0, cursor: 'pointer', height: 20, width: '100%', margin: 0 }} />
          </div>
          <button onClick={() => setZoom(z => Math.min(5, z + 0.1))} style={{ width: 28, height: 28, borderRadius: 6, background: '#252528', border: '1px solid #3A3A3E', color: '#FFF', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
        </div>
      </div>

      <button onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #3A3A3E', borderRadius: 8, color: '#8E8E93', fontFamily: 'Outfit', fontSize: 12, padding: '8px 16px', cursor: 'pointer', width: '100%' }}>
        ↺ Resetear posición
      </button>
    </div>
  );
}

function TabAjustes({ workingUrl, brightness, setBrightness, contrast, setContrast, saturation, setSaturation }) {
  const cssFilter = `brightness(${brightness/100}) contrast(${contrast/100}) saturate(${saturation/100})`;
  const anyChanged = brightness !== 100 || contrast !== 100 || saturation !== 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <p style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'Outfit', marginBottom: 6, textAlign: 'center', letterSpacing: '0.08em' }}>VISTA PREVIA</p>
        <div style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#252528', border: '1px solid #3A3A3E', maxHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {workingUrl && <img src={workingUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: cssFilter, transition: 'filter 0.1s' }} />}
        </div>
      </div>
      <div style={{ background: '#252528', borderRadius: 10, padding: '14px 16px', border: '1px solid #3A3A3E' }}>
        <Slider label="Brillo"     icon="☀️" value={brightness} min={40}  max={180} onChange={setBrightness} defaultValue={100} />
        <Slider label="Contraste"  icon="◐"  value={contrast}   min={50}  max={200} onChange={setContrast}   defaultValue={100} />
        <Slider label="Saturación" icon="🎨" value={saturation} min={0}   max={220} onChange={setSaturation} defaultValue={100} />
      </div>
      {anyChanged && (
        <button onClick={() => { setBrightness(100); setContrast(100); setSaturation(100); }}
          style={{ background: 'transparent', border: '1px solid #3A3A3E', borderRadius: 8, color: '#8E8E93', fontFamily: 'Outfit', fontSize: 12, padding: '8px 16px', cursor: 'pointer', width: '100%' }}>
          ↺ Resetear todos
        </button>
      )}
    </div>
  );
}


// ─── Modal Principal ──────────────────────────────────────────────────────────

export default function ImageEditor({ imageUrl, productName, currentPrice, oldPrice, currency, onApply, onClose }) {
  const [tab,        setTab]        = useState('encuadre');
  const [workingUrl, setWorkingUrl] = useState(imageUrl);
  const [zoom,       setZoom]       = useState(1);
  const [panX,       setPanX]       = useState(0);
  const [panY,       setPanY]       = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast,   setContrast]   = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [applying,   setApplying]   = useState(false);
  const containerRef = useRef(null);

  const TABS = [
    { id: 'encuadre', label: 'Encuadre',  icon: '🔍' },
    { id: 'fondo',    label: 'Fondo',     icon: '✂️' },
    { id: 'ajustes',  label: 'Ajustes',   icon: '🎛️' },
  ];

  const handleApply = async () => {
    setApplying(true);
    try {
      const src = workingUrl;
      const img = new Image();
      if (!src.startsWith('blob:') && !src.startsWith('data:') && !src.startsWith('/')) img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });

      const MAX = 1200;
      const aspect = img.naturalWidth / img.naturalHeight;
      let outW = Math.min(img.naturalWidth, MAX);
      let outH = Math.round(outW / aspect);

      const canvas = document.createElement('canvas');
      canvas.width = outW; canvas.height = outH;
      const ctx = canvas.getContext('2d');

      ctx.filter = `brightness(${brightness/100}) contrast(${contrast/100}) saturate(${saturation/100})`;
      const coverScale = Math.max(outW / img.naturalWidth, outH / img.naturalHeight);
      const totalScale = coverScale * zoom;
      const dw = img.naturalWidth * totalScale, dh = img.naturalHeight * totalScale;
      const containerW = containerRef.current?.clientWidth  || outW;
      const containerH = containerRef.current?.clientHeight || outH;
      const dx = (outW - dw) / 2 + panX * (outW / containerW);
      const dy = (outH - dh) / 2 + panY * (outH / containerH);

      ctx.drawImage(img, dx, dy, dw, dh);
      canvas.toBlob(blob => {
        if (blob) { const url = URL.createObjectURL(blob); onApply(url); onClose(); }
      }, 'image/png', 1.0);
    } catch { onApply(workingUrl); onClose(); }
    finally { setApplying(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#1C1C1E', borderRadius: 18, width: 560, maxWidth: '96vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', border: '1px solid #3A3A3E', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid #2A2A2E', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(196,30,42,0.15)', border: '1px solid rgba(196,30,42,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🖼️</div>
            <div>
              <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: '#FFF', margin: 0 }}>Editor de Imagen</p>
              <p style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'Outfit', margin: 0 }}>Encuadrá, editá y mejorá con IA</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, background: '#252528', border: '1px solid #3A3A3E', color: '#8E8E93', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '10px 14px', borderBottom: '1px solid #2A2A2E', flexShrink: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '7px 4px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                background: tab===t.id ? 'rgba(196,30,42,0.15)' : 'transparent',
                border: `1px solid ${tab===t.id ? 'rgba(196,30,42,0.4)' : 'transparent'}` }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <span style={{ fontSize: 9, fontFamily: 'Outfit', color: tab===t.id ? '#FFF' : '#8E8E93', fontWeight: tab===t.id ? 600 : 400 }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
          {tab==='fondo'    && <TabFondo originalUrl={imageUrl} workingUrl={workingUrl} onBgRemoved={setWorkingUrl} />}
          {tab==='encuadre' && <TabEncuadre workingUrl={workingUrl} zoom={zoom} setZoom={setZoom} panX={panX} setPanX={setPanX} panY={panY} setPanY={setPanY} />}
          {tab==='ajustes'  && <TabAjustes workingUrl={workingUrl} brightness={brightness} setBrightness={setBrightness} contrast={contrast} setContrast={setContrast} saturation={saturation} setSaturation={setSaturation} />}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 18px', borderTop: '1px solid #2A2A2E', flexShrink: 0 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
          <button onClick={handleApply} disabled={applying} className="btn-gold"
            style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {applying ? <><span className="spinner" style={{ borderTopColor: '#1C1C1E' }} /> Aplicando…</> : '✅ Aplicar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
