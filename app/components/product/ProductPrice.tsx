/**
 * ProductPrice Component - Design System
 * 
 * Price display with sale price support
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

interface ProductPriceProps {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  className?: string;
}

export function ProductPrice({
  price,
  compareAtPrice,
  className = '',
}: ProductPriceProps) {
  const isOnSale = compareAtPrice && parseFloat(compareAtPrice.amount) > parseFloat(price?.amount || '0');

  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      {price ? (
        <span className={`font-display text-2xl md:text-3xl font-bold ${isOnSale ? 'text-error' : 'text-primary'}`}>
          <Money data={price} />
        </span>
      ) : (
        <span className="font-display text-2xl md:text-3xl font-bold text-primary">
          &nbsp;
        </span>
      )}
      
      {isOnSale && compareAtPrice && (
        <span className="text-body text-secondary line-through">
          <Money data={compareAtPrice} />
        </span>
      )}
    </div>
  );
}
