import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from '~/components/cart/CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';
import {useFetcher} from 'react-router';
import type {FetcherWithComponents} from 'react-router';
import {ga4ItemsValue, toGa4Items, trackEvent} from '~/lib/ga4';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  const subtotal = cart?.cost?.subtotalAmount;

  // Calculate total discount from line-level discount allocations
  const totalDiscount = cart?.lines?.nodes?.reduce((sum, line) => {
    const lineDiscount = line?.discountAllocations?.reduce(
      (lineSum: number, alloc: any) =>
        lineSum + parseFloat(alloc.discountedAmount?.amount || '0'),
      0,
    );
    return sum + (lineDiscount || 0);
  }, 0) || 0;

  const hasDiscount = totalDiscount > 0;
  const currencyCode = subtotal?.currencyCode || 'USD';

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <h4>Totals</h4>
      <dl className="cart-subtotal">
        <dt>Subtotal</dt>
        <dd>
          {subtotal?.amount ? <Money data={subtotal} /> : '-'}
        </dd>
      </dl>
      {hasDiscount && (
        <dl className="cart-subtotal">
          <dt>Order discount</dt>
          <dd style={{color: '#22c55e'}}>
            &minus;{' '}
            <Money
              data={{
                amount: totalDiscount.toFixed(2),
                currencyCode,
              }}
            />
          </dd>
        </dl>
      )}
      <CartDiscounts discountCodes={cart?.discountCodes} />
      <CartGiftCard giftCardCodes={cart?.appliedGiftCards} />
      {hasDiscount && subtotal && (
        <dl className="cart-subtotal" style={{fontWeight: 700}}>
          <dt>Total</dt>
          <dd>
            <Money
              data={{
                amount: (parseFloat(subtotal.amount) - totalDiscount).toFixed(2),
                currencyCode,
              }}
            />
          </dd>
        </dl>
      )}
      <CartCheckoutActions cart={cart} checkoutUrl={cart?.checkoutUrl} />
    </div>
  );
}

function CartCheckoutActions({
  cart,
  checkoutUrl,
}: {
  cart: CartSummaryProps['cart'];
  checkoutUrl?: string;
}) {
  if (!checkoutUrl) return null;

  // Fire GA4 begin_checkout before the browser navigates off-domain to the
  // Shopify checkout. Guarded via trackEvent (no-ops until analytics consent).
  function handleCheckoutClick() {
    const items = toGa4Items(
      (cart?.lines?.nodes ?? []).map((line) => ({
        id: line?.merchandise?.product?.id ?? line?.merchandise?.id,
        title: line?.merchandise?.product?.title,
        vendor: line?.merchandise?.product?.vendor,
        price: line?.merchandise?.price,
        variantId: line?.merchandise?.id,
        variantTitle: line?.merchandise?.title,
        quantity: line?.quantity,
      })),
    );
    const currency = cart?.cost?.totalAmount?.currencyCode;
    const totalAmount = cart?.cost?.totalAmount?.amount;
    const value =
      totalAmount != null
        ? Number.parseFloat(String(totalAmount))
        : ga4ItemsValue(items);
    trackEvent('begin_checkout', {
      items,
      value: Number.isNaN(value) ? ga4ItemsValue(items) : value,
      ...(currency ? {currency} : {}),
    });
  }

  return (
    <div>
      <a href={checkoutUrl} target="_self" onClick={handleCheckoutClick}>
        <p>Continue to Checkout &rarr;</p>
      </a>
      <br />
    </div>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div>
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt>
          <UpdateDiscountForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button>Remove</button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div>
          <input type="text" name="discountCode" placeholder="Discount code" />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});

  // Clear the gift card code input after the gift card is added
  useEffect(() => {
    if (giftCardAddFetcher.data) {
      giftCardCodeInput.current!.value = '';
    }
  }, [giftCardAddFetcher.data]);

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
  }

  return (
    <div>
      {/* Display applied gift cards with individual remove buttons */}
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt>Applied Gift Card(s)</dt>
          {giftCardCodes.map((giftCard) => (
            <RemoveGiftCardForm key={giftCard.id} giftCardId={giftCard.id}>
              <div className="cart-discount">
                <code>***{giftCard.lastCharacters}</code>
                &nbsp;
                <Money data={giftCard.amountUsed} />
                &nbsp;
                <button type="submit">Remove</button>
              </div>
            </RemoveGiftCardForm>
          ))}
        </dl>
      )}

      {/* Show an input to apply a gift card */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
        fetcherKey="gift-card-add"
      >
        <div>
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
          />
          &nbsp;
          <button type="submit" disabled={giftCardAddFetcher.state !== 'idle'}>
            Apply
          </button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  fetcherKey,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return children;
      }}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  children,
}: {
  giftCardId: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
    </CartForm>
  );
}
