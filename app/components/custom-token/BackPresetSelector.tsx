export interface BackDesignOption {
  id: string;
  label: string;
  imageUrl?: string;
  accentColor?: string;
  /** Renders an icon tile instead of a photo, for the "design your own" option. */
  isCustom?: boolean;
  description?: string;
}

interface BackPresetSelectorProps {
  options: BackDesignOption[];
  selected?: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

const DEFAULT_ACCENT = '#B8764F';

export function BackPresetSelector({options, selected, onChange, disabled = false}: BackPresetSelectorProps) {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
      {options.map((option) => {
        const isSelected = selected === option.id;
        const accent = option.accentColor ?? DEFAULT_ACCENT;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            style={{
              position: 'relative',
              borderRadius: '1rem',
              border: isSelected ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              textAlign: 'left',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              background: isSelected
                ? `${accent}1A`
                : 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
              boxShadow: isSelected ? `0 0 0 3px ${accent}33` : 'none',
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
                  background: accent,
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
            <div
              style={{
                aspectRatio: '1',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                marginBottom: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {option.imageUrl ? (
                <img
                  src={option.imageUrl}
                  alt={option.label}
                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
                />
              ) : option.isCustom ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
                </svg>
              ) : (
                <div style={{width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)'}} />
              )}
            </div>
            <h3 style={{color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0}}>{option.label}</h3>
            {option.description && (
              <p style={{color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: '0.25rem 0 0'}}>
                {option.description}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
