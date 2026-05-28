'use client';
import { useState } from 'react';
import { TEMPLATES } from '@/lib/drawCanvas';

const CATEGORIES = [
  { id: 'clasico',   label: 'Clásicos',   icon: '⭐' },
  { id: 'neon',      label: 'Neón',       icon: '💡' },
  { id: 'pastel',    label: 'Pasteles',   icon: '🌸' },
  { id: 'navidad',   label: 'Navidad',    icon: '🎄' },
  { id: 'invierno',  label: 'Invierno',   icon: '❄️' },
  { id: 'paraguay',  label: 'Paraguay',   icon: '🇵🇾' },
  { id: 'amor',      label: 'Amor',       icon: '❤️' },
  { id: 'nanduti',   label: 'Ñanduti',    icon: '🌺' },
  { id: 'mascotas',  label: 'Mascotas',   icon: '🐾' },
];

export default function TemplateSelector({ selected, onChange }) {
  const [cat, setCat] = useState('clasico');
  const filtered = TEMPLATES.filter(t => t.category === cat);

  return (
    <div>
      <p className="section-label">Template de diseño</p>

      {/* Category tabs — scrollable */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none', marginBottom: 10 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 9px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
              transition: 'all 0.15s', whiteSpace: 'nowrap', fontFamily: 'Outfit',
              background: cat === c.id ? '#C41E2A' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${cat === c.id ? '#C41E2A' : '#3A3A3E'}`,
              color: cat === c.id ? '#FFF' : '#8E8E93',
              fontWeight: cat === c.id ? 600 : 400,
            }}>
            <span style={{ fontSize: 13 }}>{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {filtered.map(t => (
          <button key={t.id} onClick={() => onChange(t.id)}
            title={t.name}
            style={{
              padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
              transition: 'all 0.15s',
              background: selected === t.id ? 'rgba(196,30,42,0.2)' : 'rgba(255,255,255,0.04)',
              border: `2px solid ${selected === t.id ? '#C41E2A' : '#3A3A3E'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            }}>
            {/* Color swatch */}
            <div style={{
              width: 32, height: 32, borderRadius: 8, overflow: 'hidden',
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              boxShadow: selected === t.id ? `0 0 8px ${t.colors[0]}80` : 'none',
            }}>
              {t.colors.slice(0, 4).map((col, i) => (
                <div key={i} style={{ background: col }} />
              ))}
            </div>
            <span style={{
              fontSize: 8, fontFamily: 'Outfit', lineHeight: 1.2, textAlign: 'center',
              color: selected === t.id ? '#FFF' : '#8E8E93',
              fontWeight: selected === t.id ? 600 : 400,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '100%', padding: '0 2px',
            }}>{t.name}</span>
          </button>
        ))}
      </div>

      {selected && (
        <p style={{ fontSize: 10, color: '#F5A623', marginTop: 8, fontFamily: 'Outfit', textAlign: 'center' }}>
          ✓ {TEMPLATES.find(t => t.id === selected)?.name}
        </p>
      )}
    </div>
  );
}
