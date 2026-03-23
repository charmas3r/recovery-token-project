interface MaterialOption {
  id: string;
  label: string;
  value: 'brass' | 'color';
  price: string;
  description: string;
}

interface MaterialSelectorProps {
  options: MaterialOption[];
  selected?: string;
  onChange: (value: string, variantId: string) => void;
}

export function MaterialSelector({options, selected, onChange}: MaterialSelectorProps) {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem'}}>
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.value, option.id)}
            style={{
              position: 'relative',
              borderRadius: '1rem',
              border: isSelected
                ? '2px solid #B8764F'
                : '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              background: isSelected
                ? 'rgba(184,118,79,0.1)'
                : 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
              boxShadow: isSelected ? '0 0 0 3px rgba(184,118,79,0.2)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }
            }}
          >
            {isSelected && (
              <div style={{
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
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <h3 style={{color: '#fff', fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem'}}>{option.label}</h3>
            <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: '0.5rem'}}>{option.description}</p>
            <p style={{color: '#B8764F', fontWeight: 600}}>{option.price}</p>
          </button>
        );
      })}
    </div>
  );
}
