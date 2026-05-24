'use client';
import { CURRENCIES, formatPY } from '@/lib/drawCanvas';

function handleNumericInput(raw) {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits ? formatPY(digits) : '';
}

// Toggle switch component
function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', userSelect:'none' }}>
      <span style={{ fontSize:11, color: checked ? '#FFFFFF' : '#8E8E93', fontFamily:'Outfit', transition:'color 0.15s' }}>
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width:36, height:20, borderRadius:10, cursor:'pointer', border:'none',
          background: checked ? '#C41E2A' : '#3A3A3E',
          position:'relative', transition:'background 0.2s', flexShrink:0,
          padding:0,
        }}
        aria-checked={checked}
        role="switch"
      >
        <span style={{
          position:'absolute', top:2, width:16, height:16, borderRadius:'50%',
          background:'#FFF', transition:'left 0.2s',
          left: checked ? 18 : 2,
          boxShadow:'0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
    </label>
  );
}

export default function PriceEditor({
  productName, currentPrice, oldPrice, currency,
  badgeText, tagline, showTagline, onChange,
}) {
  const currencyObj = CURRENCIES.find(c => c.symbol === currency) || CURRENCIES[0];

  const curr = parseFloat((currentPrice || '').replace(/\./g, ''));
  const old  = parseFloat((oldPrice    || '').replace(/\./g, ''));
  const showDiscount = !isNaN(curr) && !isNaN(old) && old > curr && curr > 0;
  const pct  = showDiscount ? Math.round(((old - curr) / old) * 100) : 0;
  const save = showDiscount ? (old - curr).toLocaleString('de-DE') : 0;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Moneda ── */}
      <div>
        <p className="section-label">Moneda</p>
        <div className="grid grid-cols-4 gap-1.5">
          {CURRENCIES.map(c => (
            <button key={c.id} onClick={() => onChange('currency', c.symbol)}
              style={{ padding:'7px 4px', borderRadius:8, cursor:'pointer', transition:'all 0.15s',
                background: currency===c.symbol ? 'rgba(196,30,42,0.15)' : 'rgba(255,255,255,0.04)',
                border:`1.5px solid ${currency===c.symbol?'#C41E2A':'#3A3A3E'}`,
                display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
              <span style={{ fontSize:16 }}>{c.flag}</span>
              <span style={{ fontSize:10, fontFamily:'Outfit', fontWeight:700, color:currency===c.symbol?'#F5A623':'#8E8E93' }}>{c.symbol}</span>
              <span style={{ fontSize:9, fontFamily:'Outfit', color:currency===c.symbol?'#FFF':'#555' }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Nombre del producto ── */}
      <div>
        <p className="section-label">Nombre del producto</p>
        <input
          type="text"
          className="input-field"
          placeholder="ej: Leche entera La Serenísima 1L"
          value={productName}
          onChange={e => onChange('productName', e.target.value)}
          maxLength={60}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        {productName && (
          <p style={{ fontSize:10, color:'#555', marginTop:3 }}>{productName.length}/60</p>
        )}
      </div>

      {/* ── Precios ── */}
      <div className="flex gap-2">
        <div className="flex-1">
          <p className="section-label" style={{ color:'#F5A623' }}>Precio actual ★</p>
          <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
            <span style={{ position:'absolute', left:10, fontWeight:700, fontSize:12, color:'#F5A623', pointerEvents:'none', zIndex:1, userSelect:'none', whiteSpace:'nowrap', lineHeight:1 }}>
              {currencyObj.symbol}
            </span>
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: currencyObj.symbol.length > 2 ? 38 : 32, fontWeight:600, fontSize:15, color:'#F5A623', width:'100%' }}
              placeholder="1.000.000"
              value={currentPrice}
              onChange={e => onChange('currentPrice', handleNumericInput(e.target.value))}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
        </div>
        <div className="flex-1">
          <p className="section-label" style={{ color:'#555' }}>
            Anterior <span style={{ fontSize:9, textTransform:'none', letterSpacing:0 }}>(opcional)</span>
          </p>
          <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
            <span style={{ position:'absolute', left:10, fontWeight:600, fontSize:11, color:'#555', pointerEvents:'none', zIndex:1, userSelect:'none', whiteSpace:'nowrap', lineHeight:1 }}>
              {currencyObj.symbol}
            </span>
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: currencyObj.symbol.length > 2 ? 36 : 30, color:'#8E8E93', fontSize:13, textDecoration: oldPrice ? 'line-through' : 'none', width:'100%' }}
              placeholder="0"
              value={oldPrice}
              onChange={e => onChange('oldPrice', handleNumericInput(e.target.value))}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
          {oldPrice && <p style={{ fontSize:9, color:'#555', marginTop:3 }}>Aparecerá tachado ↗</p>}
        </div>
      </div>

      <p style={{ fontSize:10, color:'#555', fontFamily:'Outfit' }}>
        💡 Los miles se formatean automáticamente: 1000 → 1.000
      </p>

      {showDiscount && (
        <div className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background:'rgba(92,184,92,0.1)', border:'1px solid rgba(92,184,92,0.25)' }}>
          <span style={{ fontSize:16 }}>🎉</span>
          <span style={{ fontSize:11, color:'#5CB85C' }}>
            Descuento del <strong>{pct}%</strong> · Ahorrás <strong>{currencyObj.symbol} {save}</strong>
          </span>
        </div>
      )}

      {/* ── Leyenda del badge ── */}
      <div>
        <p className="section-label">Leyenda del badge</p>
        <input
          type="text"
          className="input-field"
          placeholder="ej: POR PEDIDO, NOVEDAD, LIQUIDACIÓN, ¡OFERTA!…"
          value={badgeText || ''}
          onChange={e => onChange('badgeText', e.target.value)}
          maxLength={40}
          autoComplete="off"
        />
        {!badgeText
          ? <p style={{ fontSize:10, color:'#555', marginTop:3 }}>Vacío = texto predeterminado del template</p>
          : <p style={{ fontSize:10, color:'#F5A623', marginTop:3 }}>✓ Texto personalizado activo</p>
        }
      </div>

      {/* ── Frase adicional (tagline) ── */}
      <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, border:'1px solid #2A2A2E', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:12, fontFamily:'Outfit', fontWeight:600, color:'#FFF', margin:0, letterSpacing:'0.04em' }}>Frase adicional</p>
            <p style={{ fontSize:10, color:'#555', fontFamily:'Outfit', margin:'2px 0 0' }}>Aparece en la banda inferior del diseño</p>
          </div>
          <Toggle
            checked={showTagline}
            onChange={val => onChange('showTagline', val)}
            label={showTagline ? 'Visible' : 'Oculta'}
          />
        </div>

        {showTagline && (
          <input
            type="text"
            className="input-field"
            placeholder="ej: ¡No te lo pierdas! Oferta por tiempo limitado"
            value={tagline || ''}
            onChange={e => onChange('tagline', e.target.value)}
            maxLength={80}
            autoComplete="off"
          />
        )}
      </div>

    </div>
  );
}
