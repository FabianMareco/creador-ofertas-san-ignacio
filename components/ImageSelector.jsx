'use client';
import { useState, useRef, useCallback, lazy, Suspense } from 'react';

// Lazy-load the heavy editor
const ImageEditor = lazy(() => import('./ImageEditor'));

export default function ImageSelector({ onImageChange, productName, currentPrice, oldPrice, currency }) {
  const [mode,         setMode]         = useState('upload');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [results,      setResults]      = useState([]);
  const [isSearching,  setIsSearching]  = useState(false);
  const [searchError,  setSearchError]  = useState('');
  const [dragOver,     setDragOver]     = useState(false);
  const [selectedUrl,  setSelectedUrl]  = useState('');
  const [uploadedName, setUploadedName] = useState('');
  const [showEditor,   setShowEditor]   = useState(false);
  const fileRef = useRef(null);

  // ── File handling ──────────────────────────────────────────────────────────

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSearchError('Solo se aceptan imágenes (JPG, PNG, WebP, etc.)'); return;
    }
    if (selectedUrl?.startsWith('blob:')) URL.revokeObjectURL(selectedUrl);
    const url = URL.createObjectURL(file);
    setSelectedUrl(url);
    setUploadedName(file.name);
    setSearchError('');
    onImageChange(url);
  }, [onImageChange, selectedUrl]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  // ── Search ─────────────────────────────────────────────────────────────────

  const handleSearch = async (q) => {
    const query = (q || searchQuery).trim();
    if (!query) return;
    setIsSearching(true); setSearchError('');
    try {
      const res = await fetch(`/api/search-images?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.error) { setSearchError(data.error); setResults([]); }
      else setResults(data.photos || []);
    } catch { setSearchError('Error de conexión al buscar imágenes.'); }
    finally   { setIsSearching(false); }
  };


  const selectSearchImage = (photo) => {
    setSelectedUrl(photo.url);
    setUploadedName('');
    onImageChange(photo.url);
  };

  // ── Editor apply ───────────────────────────────────────────────────────────

  const handleEditorApply = (editedUrl) => {
    setSelectedUrl(editedUrl);
    setUploadedName('imagen editada');
    onImageChange(editedUrl);
  };

  const hasImage = Boolean(selectedUrl);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p className="section-label" style={{ marginBottom: 0 }}>Imagen del producto</p>
        {hasImage && (
          <button onClick={() => setShowEditor(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer', transition: 'all 0.15s', background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.35)', color: '#F5A623', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
            <span>✏️</span>
            <span>Editar imagen</span>
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-lg p-0.5 mb-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #3A3A3E' }}>
        {[['upload', '⬆️ Subir archivo'], ['search', '🔍 Buscar en web']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className="flex-1 text-xs py-1.5 rounded-md font-medium transition-all"
            style={{ background: mode === m ? '#C41E2A' : 'transparent', color: mode === m ? '#FFFFFF' : '#8E8E93', fontFamily: 'Outfit, sans-serif' }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Upload tab ──────────────────────────────────────────────────────── */}
      {mode === 'upload' && (
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="rounded-xl cursor-pointer flex flex-col items-center justify-center gap-2 transition-all"
            style={{
              height: 95,
              border: `2px dashed ${dragOver ? '#C41E2A' : uploadedName ? '#5CB85C' : '#3A3A3E'}`,
              background: dragOver ? 'rgba(196,30,42,0.08)' : uploadedName ? 'rgba(92,184,92,0.05)' : 'rgba(255,255,255,0.03)',
            }}>
            <span style={{ fontSize: 22 }}>{uploadedName ? '✅' : '📷'}</span>
            <span className="text-xs text-center px-3" style={{ color: uploadedName ? '#5CB85C' : '#8E8E93' }}>
              {uploadedName ? `${uploadedName}` : 'Arrastrá o hacé click para subir'}
            </span>
          </div>
          <input key={uploadedName} ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
          {searchError && (
            <p className="text-xs mt-2 rounded-lg px-3 py-2"
              style={{ background: 'rgba(196,30,42,0.1)', color: '#FF6B6B', border: '1px solid rgba(196,30,42,0.3)' }}>
              {searchError}
            </p>
          )}
        </div>
      )}

      {/* ── Search tab ──────────────────────────────────────────────────────── */}
      {mode === 'search' && (
        <div>
          <div className="flex gap-2 mb-2">
            <input type="text" className="input-field flex-1"
              placeholder="ej: leche, arroz, jabón..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button onClick={() => handleSearch()} disabled={isSearching} className="btn-primary" style={{ minWidth: 40, padding: '0 12px' }}>
              {isSearching ? <span className="spinner" /> : '→'}
            </button>
          </div>

          {searchError && (
            <div className="text-xs rounded-lg p-2 mb-2" style={{ background: 'rgba(196,30,42,0.1)', color: '#FF6B6B', border: '1px solid rgba(196,30,42,0.3)' }}>
              {searchError}
            </div>
          )}

          {results.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5 overflow-y-auto rounded-lg" style={{ maxHeight: 175 }}>
              {results.map(photo => (
                <button key={photo.id} onClick={() => selectSearchImage(photo)}
                  className="relative rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                  style={{ aspectRatio: '1', outline: selectedUrl === photo.url ? '2px solid #C41E2A' : 'none', outlineOffset: 2 }}
                  title={`Foto por ${photo.photographer}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt={photo.alt} className="w-full h-full object-cover" />
                  {selectedUrl === photo.url && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(196,30,42,0.45)' }}>
                      <span style={{ fontSize: 20 }}>✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : !isSearching && !searchError ? (
            <div className="text-xs text-center py-4 rounded-lg" style={{ color: '#8E8E93', background: 'rgba(255,255,255,0.03)', border: '1px solid #3A3A3E' }}>
              Buscá una foto para el producto
              <br /><span style={{ color: '#444' }}>Powered by Pexels</span>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Edit hint ───────────────────────────────────────────────────────── */}
      {hasImage && (
        <button onClick={() => setShowEditor(true)}
          style={{ width: '100%', marginTop: 10, padding: '8px 0', borderRadius: 8, background: 'transparent', border: '1px dashed rgba(245,166,35,0.25)', color: '#8E8E93', fontFamily: 'Outfit, sans-serif', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,166,35,0.6)'; e.currentTarget.style.color = '#F5A623'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(245,166,35,0.25)'; e.currentTarget.style.color = '#8E8E93'; }}>
          ✂️ Quitar fondo · 🔍 Encuadrar · 🎛️ Ajustar · ✨ Asistente IA
        </button>
      )}

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {showEditor && (
        <Suspense fallback={null}>
          <ImageEditor
            imageUrl={selectedUrl}
            productName={productName}
            currentPrice={currentPrice}
            oldPrice={oldPrice}
            currency={currency}
            onApply={handleEditorApply}
            onClose={() => setShowEditor(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
