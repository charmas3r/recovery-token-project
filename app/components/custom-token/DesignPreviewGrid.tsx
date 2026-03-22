interface DesignPreviewGridProps {
  images: Array<{url: string; id: string}>;
  selectedId?: string;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export function DesignPreviewGrid({images, selectedId, onSelect, loading}: DesignPreviewGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-md" aria-busy="true">
        {Array.from({length: 4}).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl border border-white/[0.08] animate-pulse"
            style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-md">
      {images.map((image) => (
        <button key={image.id} type="button" onClick={() => onSelect(image.id)}
          className={`relative aspect-square rounded-2xl border-2 overflow-hidden transition-all ${
            selectedId === image.id ? 'border-accent ring-2 ring-accent/30' : 'border-white/[0.08] hover:border-white/[0.15]'
          }`}>
          <img src={image.url} alt="Generated token design option" className="h-full w-full object-cover" />
          {selectedId === image.id && (
            <div className="absolute top-sm right-sm bg-accent rounded-full p-xs">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
