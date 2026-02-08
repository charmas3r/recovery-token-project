import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/account.orders.$id';
import {Money, Image} from '@shopify/hydrogen';
import type {
  OrderLineItemFullFragment,
  OrderQuery,
} from 'customer-accountapi.generated';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {AccountLayout} from '~/components/account/AccountLayout';
import {Button} from '~/components/ui/Button';
import {ArrowLeft, ExternalLink, Package, MapPin, CreditCard, Gift, Type} from 'lucide-react';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors}: {data: OrderQuery; errors?: Array<{message: string}>} =
    await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
        language: customerAccount.i18n.language,
      },
    });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;
  const lineItems = order.lineItems.nodes;
  const discountApplications = order.discountApplications.nodes;
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  const firstDiscount = discountApplications[0]?.value;
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2'
      ? (firstDiscount as Extract<typeof firstDiscount, {__typename: 'MoneyV2'}>)
      : null;
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? (firstDiscount as Extract<typeof firstDiscount, {__typename: 'PricingPercentageValue'}>).percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>();
  
  const orderDate = new Date(order.processedAt!).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AccountLayout
      heading={`Order ${order.name}`}
      subheading={`Placed on ${orderDate}`}
    >
      {/* Back Link */}
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-2 text-body text-secondary hover:text-accent transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Order Status */}
      <div className="bg-surface rounded-xl p-6 mb-8 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-body text-secondary mb-1">Status</p>
            <p className="font-display text-lg font-bold text-primary">{fulfillmentStatus}</p>
          </div>
        </div>
        {order.confirmationNumber && (
          <div>
            <p className="text-body text-secondary mb-1">Confirmation</p>
            <p className="font-display text-lg font-bold text-primary">{order.confirmationNumber}</p>
          </div>
        )}
        <a
          href={order.statusPageUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2"
        >
          <Button variant="secondary" size="lg">
            Track Order
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-bold text-primary mb-5">
          Items Ordered
        </h2>
        <div className="space-y-4">
          {lineItems.map((lineItem, index) => (
            <OrderLineItem key={index} lineItem={lineItem} />
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-surface rounded-xl p-6 mb-8">
        <h2 className="font-display text-xl font-bold text-primary mb-5">
          Order Summary
        </h2>
        <div className="space-y-3">
          {((discountValue && discountValue.amount) || discountPercentage) && (
            <div className="flex justify-between text-body">
              <span className="text-secondary">Discount</span>
              <span className="text-success font-medium">
                {discountPercentage ? (
                  `-${discountPercentage}%`
                ) : (
                  discountValue && <>-<Money data={discountValue} /></>
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between text-body">
            <span className="text-secondary">Subtotal</span>
            <span className="text-primary"><Money data={order.subtotal!} /></span>
          </div>
          <div className="flex justify-between text-body">
            <span className="text-secondary">Tax</span>
            <span className="text-primary"><Money data={order.totalTax!} /></span>
          </div>
          <div className="flex justify-between text-body-lg font-bold pt-4 border-t border-black/5">
            <span className="text-primary">Total</span>
            <span className="text-primary"><Money data={order.totalPrice!} /></span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl font-bold text-primary">
              Shipping Address
            </h2>
          </div>
          {order.shippingAddress ? (
            <address className="text-body text-secondary not-italic space-y-1">
              <p className="font-medium text-primary mb-2">{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted && (
                <p>{order.shippingAddress.formatted}</p>
              )}
              {order.shippingAddress.formattedArea && (
                <p>{order.shippingAddress.formattedArea}</p>
              )}
            </address>
          ) : (
            <p className="text-body text-secondary">No shipping address</p>
          )}
        </div>

        <div className="bg-surface rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-accent" />
            <h2 className="font-display text-xl font-bold text-primary">
              Payment
            </h2>
          </div>
          <p className="text-body text-secondary">
            Paid
          </p>
        </div>
      </div>
    </AccountLayout>
  );
}

function OrderLineItem({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  // Extract custom attributes
  const customAttributes = (lineItem as any).customAttributes ?? [];
  const recipientAttr = customAttributes.find((a: any) => a.key === 'Recipient');
  const engravingPreviewAttr = customAttributes.find((a: any) => a.key === 'Engraving Preview');

  return (
    <div className="flex gap-5 bg-white rounded-xl p-5 border border-black/5">
      {lineItem.image && (
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface flex-shrink-0">
          <Image
            data={lineItem.image}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-base font-bold text-primary mb-1">{lineItem.title}</h3>
        {lineItem.variantTitle && lineItem.variantTitle !== 'Default Title' && (
          <p className="text-body text-secondary mb-2">{lineItem.variantTitle}</p>
        )}
        <p className="text-body text-secondary">Qty: {lineItem.quantity}</p>

        {/* Recipient Badge */}
        {recipientAttr && (
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
            <Gift className="w-3.5 h-3.5" />
            Gift for {recipientAttr.value}
          </div>
        )}

        {/* Engraving Badge */}
        {engravingPreviewAttr && (
          <div className="inline-flex items-center gap-1.5 mt-2 ml-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-semibold">
            <Type className="w-3.5 h-3.5" />
            Engraved: "{engravingPreviewAttr.value}"
          </div>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-display text-lg font-bold text-primary">
          <Money data={lineItem.price!} />
        </p>
      </div>
    </div>
  );
}
