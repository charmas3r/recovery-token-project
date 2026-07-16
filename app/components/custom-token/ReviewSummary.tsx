interface ReviewItem {
  label: string;
  value: string;
  type?: 'text' | 'image';
}

interface ReviewSummaryProps {
  path: 'we-design' | 'you-design';
  items: ReviewItem[];
  variantPrice?: string;
}

export function ReviewSummary({path, items, variantPrice}: ReviewSummaryProps) {
  return (
    <div style={{borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}>
      <div style={{padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
        <span style={{display: 'inline-block', color: '#B8764F', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 600}}>
          {path === 'we-design' ? 'We Design It For You' : 'AI Generated Design'}
        </span>
        <h3 style={{color: '#fff', fontWeight: 700, fontSize: '1.125rem', marginTop: '0.25rem'}}>Order Summary</h3>
      </div>
      <div>
        {items.map((item, i) => (
          <div key={i} style={{padding: '1rem 1.5rem', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined}}>
            <dt style={{color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem'}}>{item.label}</dt>
            {item.type === 'image' ? (
              <img src={item.value} alt={item.label} style={{height: '8rem', width: '8rem', borderRadius: '0.5rem', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)'}} />
            ) : (
              <dd style={{color: '#fff', fontSize: '0.875rem', margin: 0}}>{item.value}</dd>
            )}
          </div>
        ))}
      </div>
      {variantPrice && (
        <div style={{padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <span style={{color: '#fff', fontWeight: 500}}>Total</span>
            <span style={{color: '#B8764F', fontWeight: 700, fontSize: '1.125rem'}}>{variantPrice}</span>
          </div>
        </div>
      )}
    </div>
  );
}
