// @vitest-environment jsdom
import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter} from 'react-router';
import {AddedToCartPanel} from '~/components/custom-token/AddedToCartPanel';

vi.mock('~/lib/ga4', () => ({trackEvent: vi.fn(), toGa4Items: vi.fn(() => []), ga4ItemsValue: vi.fn(() => 0)}));
vi.mock('~/lib/metaPixel', () => ({trackPixelEvent: vi.fn(), toMetaPixelContents: vi.fn(() => ({}))}));

function renderPanel(props: Partial<React.ComponentProps<typeof AddedToCartPanel>>) {
  window.scrollTo = vi.fn();
  window.matchMedia = vi.fn(() => ({matches: false})) as any;
  return render(
    <MemoryRouter>
      <AddedToCartPanel path="you-design" adding={false} {...props} />
    </MemoryRouter>,
  );
}

describe('AddedToCartPanel', () => {
  it('shows a loading state while the cart add is in flight', () => {
    renderPanel({adding: true});
    expect(screen.getByText(/Adding your token to the cart/)).toBeInTheDocument();
  });

  it('offers checkout (to the cart checkoutUrl) and designing another token once added', () => {
    renderPanel({
      cartResult: {cart: {checkoutUrl: 'https://shop.test/cart/c/abc', totalQuantity: 2}, errors: []},
    });
    expect(screen.getByRole('link', {name: 'Checkout'})).toHaveAttribute('href', 'https://shop.test/cart/c/abc');
    expect(screen.getByRole('link', {name: 'Design another token'})).toHaveAttribute('href', '/custom-token');
    expect(screen.getByRole('link', {name: 'View cart (2 items)'})).toHaveAttribute('href', '/cart');
  });

  it('shows the cart error instead of the success prompt when the add fails', () => {
    renderPanel({cartResult: {cart: null, errors: [{message: 'Variant is sold out'}]}});
    expect(screen.getByRole('alert')).toHaveTextContent('Variant is sold out');
    expect(screen.queryByRole('link', {name: 'Checkout'})).toBeNull();
  });
});
