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
    <div className="rounded-2xl border border-white/[0.08] overflow-hidden"
      style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}>
      <div className="px-lg py-md border-b border-white/[0.08]">
        <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold">
          {path === 'we-design' ? 'We Design It For You' : 'You Design It'}
        </span>
        <h3 className="text-white font-bold text-lg mt-xs">Order Summary</h3>
      </div>
      <div className="divide-y divide-white/[0.05]">
        {items.map((item, i) => (
          <div key={i} className="px-lg py-md">
            <dt className="text-white/40 text-xs uppercase tracking-wider mb-xs">{item.label}</dt>
            {item.type === 'image' ? (
              <img src={item.value} alt={item.label} className="h-32 w-32 rounded-lg object-cover border border-white/[0.08]" />
            ) : (
              <dd className="text-white text-sm">{item.value}</dd>
            )}
          </div>
        ))}
      </div>
      {variantPrice && (
        <div className="px-lg py-md border-t border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Total</span>
            <span className="text-accent font-bold text-lg">{variantPrice}</span>
          </div>
        </div>
      )}
    </div>
  );
}
