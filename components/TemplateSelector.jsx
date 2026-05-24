'use client';
import { useState } from 'react';
import { TEMPLATES } from '@/lib/drawCanvas';

const CATEGORIES = [
  { id: 'all',     label: 'Todos',      icon: '🎨' },
  { id: 'clasico', label: 'Clásicos',   icon: '🏪' },
  { id: 'neon',    label: 'Neón',       icon: '💡' },
  { id: 'pastel',  label: 'Pasteles',   icon: '🌸' },
];

export default function TemplateSelector({ selected, onChange }) {
  const [cat, setCat] = useState('all');
  const filtered = cat === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === cat);

  return (
    <div>
      <p className="section-label">Diseño del template</p>

      {/* Category tabs */}
      <div className="flex gap-1 mb-3 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #3A3A3E' }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              background: cat === c.id ? '#C41E2A' : 'transparent',
              color: cat === c.id ? '#FFFFFF' : '#8E8E93',
              fontFamily: 'Outfit, sans-serif',
            }}>
            <span>{c.icon}</span>
            <span className="hidden sm:inline">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-5 gap-1.5 max-h-52 overflow-y-auto pr-0.5">
        {filtered.map(t => (
          <button key={t.id} onClick={() => onChange(t.id)}
            className={`template-card flex flex-col items-center gap-1 p-1 ${selected === t.id ? 'selected' : ''}`}
            title={t.name}>
            <div className="w-full rounded-lg overflow-hidden" style={{ height: 48 }}>
              <div style={{
                width: '100%', height: '100%',
                background: `linear-gradient(135deg, ${t.colors[0]} 45%, ${t.colors[1]} 45%)`,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 4,
              }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: t.colors[2], flexShrink: 0,
                  boxShadow: t.category === 'neon' ? `0 0 8px ${t.colors[1]}` : 'none' }} />
              </div>
            </div>
            <span style={{
              fontSize: '9px', textAlign: 'center', lineHeight: 1.2,
              color: selected === t.id ? '#F5A623' : '#8E8E93',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: selected === t.id ? 700 : 400,
            }}>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Selected label */}
      {selected && (
        <p className="text-xs mt-2 text-center" style={{ color: '#F5A623', fontFamily: 'Outfit, sans-serif' }}>
          ✓ {TEMPLATES.find(t => t.id === selected)?.name}
        </p>
      )}
    </div>
  );
}
