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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.value, option.id)}
          className={`rounded-2xl border p-lg text-left transition-colors ${
            selected === option.value
              ? 'border-accent bg-accent/10'
              : 'border-white/[0.08] hover:border-white/[0.15]'
          }`}
          style={{
            background: selected === option.value
              ? undefined
              : 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)',
          }}
        >
          <h3 className="text-white font-bold text-lg mb-xs">{option.label}</h3>
          <p className="text-white/50 text-sm mb-sm">{option.description}</p>
          <p className="text-accent font-semibold">{option.price}</p>
        </button>
      ))}
    </div>
  );
}
