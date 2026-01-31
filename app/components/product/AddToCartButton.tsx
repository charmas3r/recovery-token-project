/**
 * AddToCartButton Component - Design System
 * 
 * Primary CTA button using design system Button component
 * @see .cursor/skills/design-system/SKILL.md
 */

import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {Button} from '~/components/ui';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
            className="w-full"
          >
            {fetcher.state !== 'idle' ? 'Adding...' : children}
          </Button>
        </>
      )}
    </CartForm>
  );
}
