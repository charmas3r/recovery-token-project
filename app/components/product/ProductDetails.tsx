/**
 * ProductDetails Component - Etsy-style expandable product information sections
 *
 * Accordion sections for: Description, Materials, Dimensions, Care, Shipping
 * @see .cursor/skills/design-system/SKILL.md
 */

import {useState} from 'react';
import {
  ChevronDown,
  FileText,
  Gem,
  Ruler,
  Sparkles,
  Truck,
} from 'lucide-react';

interface ProductDetailsProps {
  descriptionHtml: string;
  productTitle: string;
}

interface DetailSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

export function ProductDetails({
  descriptionHtml,
  productTitle,
}: ProductDetailsProps) {
  // First section (Description) open by default
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['description']),
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sections: DetailSection[] = [
    {
      id: 'description',
      icon: <FileText className="w-5 h-5" />,
      title: 'Description',
      content: (
        <div
          className="text-body text-white/50 leading-relaxed prose prose-sm prose-invert"
          dangerouslySetInnerHTML={{__html: descriptionHtml}}
        />
      ),
    },
    {
      id: 'materials',
      icon: <Gem className="w-5 h-5" />,
      title: 'Materials & Craftsmanship',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-body-sm">
            <span className="text-white/40">Primary Material</span>
            <span className="text-white/70">Premium brass alloy</span>

            <span className="text-white/40">Finish</span>
            <span className="text-white/70">
              Antique plated with protective lacquer coating
            </span>

            <span className="text-white/40">Coloring</span>
            <span className="text-white/70">
              Hand-applied enamel accents
            </span>

            <span className="text-white/40">Edge Detail</span>
            <span className="text-white/70">
              Precision die-struck with reeded edge
            </span>
          </div>
          <p className="text-body-sm text-white/40 leading-relaxed">
            Each token is individually crafted using a multi-step process:
            die-striking, plating, enamel filling, and hand-finishing. Minor
            variations are a hallmark of the handcrafted process and make
            every token unique.
          </p>
        </div>
      ),
    },
    {
      id: 'dimensions',
      icon: <Ruler className="w-5 h-5" />,
      title: 'Dimensions & Weight',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-body-sm">
            <span className="text-white/40">Diameter</span>
            <span className="text-white/70">
              40 mm (1.57 in) — standard challenge coin size
            </span>

            <span className="text-white/40">Thickness</span>
            <span className="text-white/70">3 mm (0.12 in)</span>

            <span className="text-white/40">Weight</span>
            <span className="text-white/70">
              ~1.2 oz (34 g) — substantial feel in hand
            </span>
          </div>
          {/* Visual size reference */}
          <div className="flex items-center gap-4 pt-2">
            <div
              className="rounded-full border border-white/[0.15] flex items-center justify-center"
              style={{
                width: '48px',
                height: '48px',
                background:
                  'linear-gradient(135deg, rgba(184,118,79,0.3) 0%, rgba(184,118,79,0.1) 100%)',
              }}
            >
              <span className="text-[10px] text-white/50 font-medium">
                40mm
              </span>
            </div>
            <span className="text-body-sm text-white/40">
              Slightly larger than a U.S. half-dollar coin
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'care',
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Care Instructions',
      content: (
        <div className="space-y-3 text-body-sm text-white/50 leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="text-accent mt-0.5 flex-shrink-0">•</span>
            <span>
              Store in the included velvet pouch or display case to prevent
              scratches and tarnishing.
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent mt-0.5 flex-shrink-0">•</span>
            <span>
              Clean gently with a soft, dry cloth. Avoid abrasive cleaners
              or harsh chemicals.
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent mt-0.5 flex-shrink-0">•</span>
            <span>
              Keep away from prolonged moisture or humidity to maintain the
              finish.
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent mt-0.5 flex-shrink-0">•</span>
            <span>
              Natural patina may develop over time — many customers consider
              this part of the token&apos;s story.
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'shipping',
      icon: <Truck className="w-5 h-5" />,
      title: 'Shipping & Returns',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-body-sm">
            <span className="text-white/40">Processing</span>
            <span className="text-white/70">
              Ships within 1–3 business days
            </span>

            <span className="text-white/40">Shipping</span>
            <span className="text-white/70">
              Free standard shipping on orders over $50. USPS First Class
              (3–5 days) or Priority (1–3 days).
            </span>

            <span className="text-white/40">Returns</span>
            <span className="text-white/70">
              30-day hassle-free returns for non-engraved tokens. Engraved
              items are final sale.
            </span>

            <span className="text-white/40">Packaging</span>
            <span className="text-white/70">
              Ships in a premium velvet pouch inside a branded gift box —
              ready for gifting.
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-white mb-4">
        About This Token
      </h2>

      <div className="divide-y divide-white/[0.08]">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          return (
            <div key={section.id}>
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 py-4 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
                aria-expanded={isOpen}
                aria-controls={`details-${section.id}`}
              >
                <span className="text-accent flex-shrink-0">
                  {section.icon}
                </span>
                <span className="text-white font-semibold text-sm flex-1 group-hover:text-white/80 transition-colors">
                  {section.title}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                id={`details-${section.id}`}
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  isOpen
                    ? 'max-h-[800px] opacity-100 pb-5'
                    : 'max-h-0 opacity-0'
                }`}
                role="region"
                aria-labelledby={`details-trigger-${section.id}`}
              >
                <div className="pl-8">{section.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
