interface BackPresetOption {
  id: string;
  label: string;
  imageUrl: string;
}

interface BackPresetSelectorProps {
  presets: BackPresetOption[];
  selected?: string;
  onChange: (presetId: string) => void;
  disabled?: boolean;
}

export function BackPresetSelector({presets, selected, onChange, disabled = false}: BackPresetSelectorProps) {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
      {presets.map((preset) => {
        const isSelected = selected === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(preset.id)}
            style={{
              position: 'relative',
              borderRadius: '1rem',
              border: isSelected ? '2px solid #B8764F' : '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              textAlign: 'left',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              background: isSelected
                ? 'rgba(184,118,79,0.1)'
                : 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
              boxShadow: isSelected ? '0 0 0 3px rgba(184,118,79,0.2)' : 'none',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  background: '#B8764F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div style={{aspectRatio: '1', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '0.75rem'}}>
              <img
                src={preset.imageUrl}
                alt={preset.label}
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
            </div>
            <h3 style={{color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0}}>{preset.label}</h3>
          </button>
        );
      })}
    </div>
  );
}
