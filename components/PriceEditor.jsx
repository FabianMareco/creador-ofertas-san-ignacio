'use client';
import { CURRENCIES, formatPY } from '@/lib/drawCanvas';

// Auto-format input to Paraguayan number style
function handleNumericInput(raw) {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits ? formatPY(digits) : '';
}

export default function PriceEditor({ productName, currentPrice, oldPrice, currency, badgeText, onChange }) {
  const currencyObj = CURRENCIES.find(c => c.symbol === currency) || CURRENCIES[0];

  const handlePriceChange = (field, val) => {
    onChange(field, handleNumericInput(val));
  };

  // Calculate discount
  const curr = parseFloat((currentPrice || '').replace(/\./g, ''));
  const old  = parseFloat((oldPrice    || '').replace(/\./g, ''));
  const showDiscount = !isNaN(curr) && !isNaN(old) && old > curr && curr > 0;
  const pct  = showDiscount ? Math.round(((old - curr) / old) * 100) : 0;
  const save = showDiscount ? (old - curr).toLocaleString('de-DE') : 0;

  return (
    <div className="flex flex-col gap-3">

      {/* Currency selector */}
      <div>
        <p className="section-label">Moneda</p>
        <div className="grid grid-cols-4 gap-1.5">
          {CURRENCIES.map(c => (
            <button key={c.id} onClick={() => onChange('currency', c.symbol)}
              style={{
                padding: '7px 4px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                background: currency === c.symbol ? 'rgba(196,30,42,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${currency === c.symbol ? '#C41E2A' : '#3A3A3E'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
              <span style={{ fontSize: 16 }}>{c.flag}</span>
              <span style={{ fontSize: 10, fontFamily: 'Outfit', fontWeight: 700,
                color: currency === c.symbol ? '#F5A623' : '#8E8E93' }}>{c.symbol}</span>
              <span style={{ fontSize: 9, fontFamily: 'Outfit',
                color: currency === c.symbol ? '#FFFFFF' : '#555' }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product name */}
      <div>
        <p className="section-label">Nombre del producto</p>
        <input type="text" className="input-field"
          placeholder="ej: Leche entera La Serenísima 1L"
          value={productName}
          onChange={e => onChange('productName', e.target.value)}
          maxLength={60} />
        {productName && (
          <p style={{ fontSize: 10, color: '#555', marginTop: 3 }}>{productName.length}/60</p>
        )}
      </div>


      {/* Badge / leyenda editable */}
      <div>
        <p className="section-label">Leyenda del badge</p>
        <input type="text" className="input-field"
          placeholder={`ej: POR PEDIDO, NOVEDAD, LIQUIDACIÓN, ¡OFERTA!…`}
          value={badgeText || ''}
          onChange={e => onChange('badgeText', e.target.value)}
          maxLength={40} />
        {!badgeText
          ? <p style={{ fontSize: 10, color: '#555', marginTop: 3, fontFamily: 'Outfit' }}>Vacío = texto predeterminado del template</p>
          : <p style={{ fontSize: 10, color: '#F5A623', marginTop: 3, fontFamily: 'Outfit' }}>✓ Texto personalizado activo</p>
        }
      </div>

      {/* Prices */}
      <div className="flex gap-2">
        {/* Current price */}
        <div className="flex-1">
          <p className="section-label" style={{ color: '#F5A623' }}>Precio actual ★</p>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '10px', fontWeight: 700, fontSize: '12px',
              color: '#F5A623', pointerEvents: 'none', zIndex: 1, userSelect: 'none',
              whiteSpace: 'nowrap', lineHeight: 1 }}>
              {currencyObj.symbol}
            </span>
            <input type="text" className="input-field"
              style={{ paddingLeft: currencyObj.symbol.length > 2 ? '38px' : '32px',
                fontWeight: 600, fontSize: '15px', color: '#F5A623', width: '100%' }}
              placeholder="1.000.000"
              value={currentPrice}
              onChange={e => handlePriceChange('currentPrice', e.target.value)}
              inputMode="numeric" />
          </div>
        </div>

        {/* Old price */}
        <div className="flex-1">
          <p className="section-label" style={{ color: '#555' }}>
            Anterior <span style={{ fontSize: '9px', textTransform: 'none', letterSpacing: 0 }}>(opcional)</span>
          </p>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '10px', fontWeight: 600, fontSize: '11px',
              color: '#555', pointerEvents: 'none', zIndex: 1, userSelect: 'none',
              whiteSpace: 'nowrap', lineHeight: 1 }}>
              {currencyObj.symbol}
            </span>
            <input type="text" className="input-field"
              style={{ paddingLeft: currencyObj.symbol.length > 2 ? '36px' : '30px',
                color: '#8E8E93', fontSize: '13px',
                textDecoration: oldPrice ? 'line-through' : 'none', width: '100%' }}
              placeholder="0"
              value={oldPrice}
              onChange={e => handlePriceChange('oldPrice', e.target.value)}
              inputMode="numeric" />
          </div>
          {oldPrice && <p style={{ fontSize: '9px', color: '#555', marginTop: 3 }}>Aparecerá tachado ↗</p>}
        </div>
      </div>

      {/* Format hint */}
      <p style={{ fontSize: 10, color: '#555', fontFamily: 'Outfit' }}>
        💡 Los miles se formatean automáticamente: 1000 → 1.000
      </p>

      {/* Discount indicator */}
      {showDiscount && (
        <div className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'rgba(92,184,92,0.1)', border: '1px solid rgba(92,184,92,0.25)' }}>
          <span style={{ fontSize: 16 }}>🎉</span>
          <span style={{ fontSize: 11, color: '#5CB85C' }}>
            Descuento del <strong>{pct}%</strong> · Ahorrás <strong>{currencyObj.symbol} {save}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
