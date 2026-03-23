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
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.value, option.id)}
          style={{
            borderRadius: '1rem',
            border: selected === option.value
              ? '1px solid #B8764F'
              : '1px solid rgba(255,255,255,0.08)',
            padding: '1.5rem',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            background: selected === option.value
              ? 'rgba(184,118,79,0.1)'
              : 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          }}
          onMouseEnter={(e) => {
            if (selected !== option.value) {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (selected !== option.value) {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }
          }}
        >
          <h3 style={{color: '#fff', fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem'}}>{option.label}</h3>
          <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', marginBottom: '0.5rem'}}>{option.description}</p>
          <p style={{color: '#B8764F', fontWeight: 600}}>{option.price}</p>
        </button>
      ))}
    </div>
  );
}
