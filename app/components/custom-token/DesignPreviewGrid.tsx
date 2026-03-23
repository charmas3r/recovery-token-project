interface DesignPreviewGridProps {
  images: Array<{url: string; id: string}>;
  selectedId?: string;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export function DesignPreviewGrid({images, selectedId, onSelect, loading}: DesignPreviewGridProps) {
  if (loading) {
    return (
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}} aria-busy="true">
        {Array.from({length: 4}).map((_, i) => (
          <div key={i} style={{
            aspectRatio: '1/1',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }} />
        ))}
      </div>
    );
  }
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
      {images.map((image) => (
        <button key={image.id} type="button" onClick={() => onSelect(image.id)}
          style={{
            position: 'relative',
            aspectRatio: '1/1',
            borderRadius: '1rem',
            border: selectedId === image.id ? '2px solid #B8764F' : '2px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
            cursor: 'pointer',
            padding: 0,
            background: 'none',
            transition: 'border-color 0.2s',
            ...(selectedId === image.id ? {boxShadow: '0 0 0 2px rgba(184,118,79,0.3)'} : {}),
          }}
          onMouseEnter={(e) => { if (selectedId !== image.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          onMouseLeave={(e) => { if (selectedId !== image.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <img src={image.url} alt="Generated token design option" style={{height: '100%', width: '100%', objectFit: 'cover'}} />
          {selectedId === image.id && (
            <div style={{position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#B8764F', borderRadius: '9999px', padding: '0.25rem'}}>
              <svg style={{height: '1rem', width: '1rem', color: '#fff'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
