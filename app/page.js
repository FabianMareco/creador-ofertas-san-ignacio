'use client';
import { useState, useEffect, Suspense, lazy } from 'react';
import TemplateSelector from '@/components/TemplateSelector';
import ImageSelector    from '@/components/ImageSelector';
import PriceEditor      from '@/components/PriceEditor';
import ExportPanel      from '@/components/ExportPanel';

const CanvasPreview = lazy(() => import('@/components/CanvasPreview'));

// ─── Hook responsive ──────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}

const LOGO_POSITIONS = [
  { id: 'left',   icon: '◀', label: 'Izq.' },
  { id: 'center', icon: '◆', label: 'Centro' },
  { id: 'right',  icon: '▶', label: 'Der.' },
];

const MOBILE_TABS = [
  { id: 'template', icon: '🎨', label: 'Diseño' },
  { id: 'image',    icon: '📷', label: 'Imagen' },
  { id: 'price',    icon: '💰', label: 'Precio' },
  { id: 'export',   icon: '⬇️', label: 'Exportar' },
];

const FORMATS_QUICK = [
  { id: 'story',     icon: '📱', label: 'Historia' },
  { id: 'square',    icon: '⬛', label: 'Cuadrado' },
  { id: 'landscape', icon: '🖥️', label: 'Horizontal' },
];

export default function Home() {
  const isMobile = useIsMobile();

  const [templateId,   setTemplateId]   = useState('rojo');
  const [imageUrl,     setImageUrl]     = useState('');
  const [productName,  setProductName]  = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [oldPrice,     setOldPrice]     = useState('');
  const [badgeText,    setBadgeText]    = useState('');
  const [format,       setFormat]       = useState('story');
  const [logoPosition, setLogoPosition] = useState('center');
  const [currency,     setCurrency]     = useState('Gs.');
  const [mobileTab,    setMobileTab]    = useState('template');

  const handleText = (field, val) => {
    if (field === 'productName')  setProductName(val);
    if (field === 'currentPrice') setCurrentPrice(val);
    if (field === 'oldPrice')     setOldPrice(val);
    if (field === 'currency')     setCurrency(val);
    if (field === 'badgeText')    setBadgeText(val);
  };

  const previewProps = {
    templateId, imageUrl, productName, currentPrice,
    oldPrice, format, logoPosition, currency, badgeText
  };

  const panelStyle = {
    padding: 14, borderRadius: 12,
    background: '#252528', border: '1px solid #2A2A2E',
  };

  // ── Secciones de control (compartidas mobile/desktop) ─────────────────────

  const SectionTemplate = () => (
    <>
      <section style={panelStyle}>
        <TemplateSelector selected={templateId} onChange={setTemplateId} />
      </section>
      <section style={panelStyle}>
        <p className="section-label">Posición del logo</p>
        <div className="flex gap-2">
          {LOGO_POSITIONS.map(p => (
            <button key={p.id} onClick={() => setLogoPosition(p.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
              style={{
                background: logoPosition === p.id ? 'rgba(196,30,42,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${logoPosition === p.id ? '#C41E2A' : '#3A3A3E'}`,
              }}>
              <span style={{ fontSize: 16, color: logoPosition === p.id ? '#F5A623' : '#8E8E93' }}>{p.icon}</span>
              <span style={{ fontSize: 10, color: logoPosition === p.id ? '#FFF' : '#8E8E93', fontFamily: 'Outfit' }}>{p.label}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );

  const SectionImage = () => (
    <section style={panelStyle}>
      <ImageSelector onImageChange={setImageUrl} productName={productName}
        currentPrice={currentPrice} oldPrice={oldPrice} currency={currency} />
    </section>
  );

  const SectionPrice = () => (
    <section style={panelStyle}>
      <PriceEditor productName={productName} currentPrice={currentPrice}
        oldPrice={oldPrice} currency={currency} badgeText={badgeText} onChange={handleText} />
    </section>
  );

  const SectionExport = () => (
    <section style={panelStyle}>
      <ExportPanel format={format} onFormatChange={setFormat}
        templateId={templateId} imageUrl={imageUrl}
        productName={productName} currentPrice={currentPrice}
        oldPrice={oldPrice} logoPosition={logoPosition}
        currency={currency} badgeText={badgeText} />
    </section>
  );

  const CanvasArea = ({ mobile }) => (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <span style={{ color: '#8E8E93', fontSize: 12, fontFamily: 'Outfit' }}>Cargando…</span>
      </div>
    }>
      <CanvasPreview {...previewProps} isMobile={mobile} />
    </Suspense>
  );

  // ── MOBILE LAYOUT ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#1C1C1E', overflow: 'hidden' }}>

        {/* Mobile Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #2A2A2E', background: '#1C1C1E', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#C41E2A', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: '#FFF' }}>Despensa San Ignacio</span>
          </div>
          {/* Format quick switch */}
          <div style={{ display: 'flex', gap: 4 }}>
            {FORMATS_QUICK.map(f => (
              <button key={f.id} onClick={() => setFormat(f.id)}
                style={{ padding: '5px 8px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                  background: format === f.id ? 'rgba(196,30,42,0.2)' : 'transparent',
                  border: `1px solid ${format === f.id ? 'rgba(196,30,42,0.5)' : '#3A3A3E'}` }}>
                {f.icon}
              </button>
            ))}
          </div>
        </header>

        {/* Canvas Preview — ocupa la mitad de la pantalla */}
        <div style={{
          height: '50dvh',
          minHeight: 220,
          flexShrink: 0,
          background: 'radial-gradient(ellipse at center, #252528 0%, #1C1C1E 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Grid decorativo */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
          <CanvasArea mobile={true} />
        </div>

        {/* Mobile Tab Bar */}
        <div style={{ display: 'flex', background: '#1C1C1E', borderTop: '1px solid #2A2A2E', borderBottom: '1px solid #2A2A2E', flexShrink: 0 }}>
          {MOBILE_TABS.map(t => (
            <button key={t.id} onClick={() => setMobileTab(t.id)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 4px', cursor: 'pointer', transition: 'all 0.15s',
                background: mobileTab === t.id ? 'rgba(196,30,42,0.12)' : 'transparent',
                borderBottom: `2px solid ${mobileTab === t.id ? '#C41E2A' : 'transparent'}` }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 10, fontFamily: 'Outfit', color: mobileTab === t.id ? '#FFF' : '#8E8E93', fontWeight: mobileTab === t.id ? 600 : 400 }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Section content (scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mobileTab === 'template' && <><SectionTemplate /></>}
          {mobileTab === 'image'    && <SectionImage />}
          {mobileTab === 'price'    && <SectionPrice />}
          {mobileTab === 'export'   && <SectionExport />}
          <div style={{ height: 16 }} />
        </div>
      </div>
    );
  }

  // ── DESKTOP LAYOUT ─────────────────────────────────────────────────────────
  return (
    <main style={{ display: 'grid', gridTemplateColumns: '375px 1fr', gridTemplateRows: 'auto 1fr', height: '100vh', overflow: 'hidden', background: '#1C1C1E' }}>

      {/* Desktop Header */}
      <header style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', height: 52, borderBottom: '1px solid #2A2A2E', background: '#1C1C1E', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 8, background: 'rgba(196,30,42,0.12)', border: '1px solid rgba(196,30,42,0.3)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C41E2A', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: '#FFF', letterSpacing: '0.3px' }}>Despensa San Ignacio</span>
          <span style={{ fontSize: 10, color: '#C41E2A', background: 'rgba(196,30,42,0.2)', padding: '1px 6px', borderRadius: 10 }}>🇵🇾 Publicaciones</span>
        </div>
        <div style={{ flex: 1 }} />
        {FORMATS_QUICK.map(f => (
          <button key={f.id} onClick={() => setFormat(f.id)} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
            background: format === f.id ? 'rgba(196,30,42,0.2)' : 'transparent',
            border: `1px solid ${format === f.id ? 'rgba(196,30,42,0.5)' : '#2A2A2E'}`,
            color: format === f.id ? '#FFF' : '#8E8E93', fontFamily: 'Outfit', transition: 'all 0.15s',
          }}>{f.icon} {f.label}</button>
        ))}
      </header>

      {/* Desktop Left Panel */}
      <aside style={{ borderRight: '1px solid #2A2A2E', overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14, background: '#1C1C1E' }}>
        <SectionTemplate />
        <SectionImage />
        <SectionPrice />
        <SectionExport />
        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)' }}>
          <p style={{ fontSize: 11, color: '#F5A623', fontFamily: 'Outfit', lineHeight: 1.6 }}>
            🇵🇾 El precio se auto-ajusta al 90% del ancho. Miles con punto: 1.000.000 Gs.
          </p>
        </div>
        <div style={{ height: 8 }} />
      </aside>

      {/* Desktop Canvas Area */}
      <section style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #252528 0%, #1C1C1E 70%)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        <CanvasArea mobile={false} />
      </section>
    </main>
  );
}
