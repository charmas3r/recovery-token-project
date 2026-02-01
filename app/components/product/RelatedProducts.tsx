/**
 * RelatedProducts Component - Design System
 * 
 * Related/recommended products section for PDP
 * @see .cursor/skills/design-system/SKILL.md
 */

import {ProductItem} from './ProductItem';
import type {RelatedProductFragment} from 'storefrontapi.generated';
import {Link} from 'react-router';
import {Button} from '~/components/ui/Button';

interface RelatedProductsProps {
  products: RelatedProductFragment[];
  currentProductId: string;
}

export function RelatedProducts({products, currentProductId}: RelatedProductsProps) {
  // Filter out current product and limit to 4
  const filteredProducts = products
    .filter(p => p.id !== currentProductId)
    .slice(0, 4);
  
  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="container-standard">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block text-accent text-caption uppercase tracking-[0.25em] font-semibold mb-4">
              You May Also Like
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary leading-tight">
              Related Tokens
            </h2>
          </div>
          <Link to="/collections" className="hidden md:block">
            <Button variant="secondary" size="md">
              View All Tokens
            </Button>
          </Link>
        </div>
        
        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              loading="lazy"
            />
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-10 md:hidden">
          <Link to="/collections">
            <Button variant="secondary" size="md">
              View All Tokens
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
