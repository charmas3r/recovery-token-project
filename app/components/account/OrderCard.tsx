/**
 * OrderCard Component - Design System
 *
 * Order summary card for account orders list
 * @see .cursor/skills/design-system/SKILL.md
 */

import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import type {OrderItemFragment} from 'customer-accountapi.generated';
import {ChevronRight} from 'lucide-react';

interface OrderCardProps {
  order: OrderItemFragment;
  fulfillmentStatus?: string | null;
}

export function OrderCard({order, fulfillmentStatus}: OrderCardProps) {
  const orderUrl = `/account/orders/${btoa(order.id)}`;
  const orderDate = new Date(order.processedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden hover:border-white/[0.15] transition-colors duration-200" style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <Link
            to={orderUrl}
            className="font-display text-lg font-bold text-white hover:text-accent transition-colors"
          >
            Order #{order.number}
          </Link>
          <p className="text-body-sm text-white/50 mt-0.5">{orderDate}</p>
          {order.confirmationNumber && (
            <p className="text-caption text-white/40 mt-1">
              Confirmation: {order.confirmationNumber}
            </p>
          )}
        </div>
        <OrderStatusBadge
          financialStatus={order.financialStatus ?? undefined}
          fulfillmentStatus={fulfillmentStatus ?? undefined}
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-4 bg-white/[0.03] flex items-center justify-between border-t border-white/[0.08]">
        <div>
          <span className="text-body-sm text-white/50">Total: </span>
          <span className="font-display font-bold text-white">
            <Money data={order.totalPrice} />
          </span>
        </div>
        <Link
          to={orderUrl}
          className="inline-flex items-center gap-1 text-body-sm font-medium text-accent hover:text-accent/80 transition-colors"
        >
          View Details
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function OrderStatusBadge({
  financialStatus,
  fulfillmentStatus,
}: {
  financialStatus?: string;
  fulfillmentStatus?: string;
}) {
  // Determine status and color
  let status = fulfillmentStatus || financialStatus || 'Processing';
  let colorClass = 'bg-white/[0.08] text-white/60';

  const statusLower = status.toLowerCase();

  if (statusLower.includes('fulfilled') || statusLower.includes('paid')) {
    colorClass = 'bg-success/10 text-success';
    status = fulfillmentStatus || 'Fulfilled';
  } else if (statusLower.includes('pending') || statusLower.includes('unfulfilled')) {
    colorClass = 'bg-warning/10 text-warning';
    status = 'Processing';
  } else if (statusLower.includes('cancelled') || statusLower.includes('refunded')) {
    colorClass = 'bg-error/10 text-error';
  }

  return (
    <span className={`px-3 py-1 rounded-full text-caption font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
