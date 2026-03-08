import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/account.circle.gifts';
import {AccountLayout} from '~/components/account/AccountLayout';
import {CUSTOMER_METAFIELDS_QUERY} from '~/graphql/customer-account/CustomerMetafieldsQuery';
import {CUSTOMER_ORDERS_WITH_ITEMS_QUERY} from '~/graphql/customer-account/CustomerOrdersWithItemsQuery';
import {
  parseRecoveryCircle,
  getRelationshipLabel,
  calculateDaysSober,
  type RecoveryCircleMember,
} from '~/lib/recoveryCircle';
import {Image, Money} from '@shopify/hydrogen';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {Button} from '~/components/ui/Button';
import {Gift, Package, ShoppingBag, ChevronDown, ChevronUp, Users} from 'lucide-react';
import {useState} from 'react';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Gift History'}];
};

interface GiftLineItem {
  title: string;
  variantTitle: string | null;
  quantity: number;
  image: {altText?: string | null; url: string; width?: number; height?: number} | null;
  price: {amount: string; currencyCode: CurrencyCode};
  engravingPreview?: string;
  orderName: string;
  processedAt: string;
}

interface RecipientGiftGroup {
  memberId: string | null;
  memberName: string;
  member: RecoveryCircleMember | null;
  gifts: GiftLineItem[];
}

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  customerAccount.handleAuthStatus();

  try {
    // Fetch circle and orders in parallel
    const [{data: metafieldsData}, {data: ordersData}] = await Promise.all([
      customerAccount.query(CUSTOMER_METAFIELDS_QUERY, {
        variables: {language: customerAccount.i18n.language},
      }),
      customerAccount.query(CUSTOMER_ORDERS_WITH_ITEMS_QUERY, {
        variables: {language: customerAccount.i18n.language, first: 50},
      }),
    ]);

    // Parse circle
    const metafields = metafieldsData?.customer?.metafields ?? [];
    const circleRaw = metafields?.find(
      (m: any) => m?.key === 'recovery_circle',
    )?.value ?? null;
    const circle = parseRecoveryCircle(circleRaw);

    // Build circle lookup by ID
    const circleById = new Map(circle.map((m) => [m.id, m]));

    // Group gifts by recipient
    const groupsMap = new Map<string, RecipientGiftGroup>();

    const orders = ordersData?.customer?.orders?.nodes ?? [];
    for (const order of orders) {
      const lineItems = order.lineItems?.nodes ?? [];
      for (const item of lineItems) {
        const attrs = (item as any).customAttributes ?? [];
        const recipientAttr = attrs.find(
          (a: {key: string}) => a.key === 'Recipient',
        );
        if (!recipientAttr?.value) continue;

        const circleIdAttr = attrs.find(
          (a: {key: string}) => a.key === '_Recipient Circle ID',
        );
        const engravingAttr = attrs.find(
          (a: {key: string}) => a.key === 'Engraving Preview',
        );

        const memberId = circleIdAttr?.value ?? null;
        const groupKey = memberId ?? `other:${recipientAttr.value}`;

        if (!groupsMap.has(groupKey)) {
          const member = memberId ? circleById.get(memberId) ?? null : null;
          groupsMap.set(groupKey, {
            memberId,
            memberName: member?.name ?? recipientAttr.value,
            member,
            gifts: [],
          });
        }

        groupsMap.get(groupKey)!.gifts.push({
          title: item.title,
          variantTitle: item.variantTitle,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          engravingPreview: engravingAttr?.value ?? undefined,
          orderName: order.name,
          processedAt: order.processedAt,
        });
      }
    }

    const giftGroups = Array.from(groupsMap.values());

    return {giftGroups, circle};
  } catch (error) {
    console.error('Failed to fetch gift history:', error);
    return {giftGroups: [] as RecipientGiftGroup[], circle: []};
  }
}

export default function GiftHistoryPage() {
  const {giftGroups, circle} = useLoaderData<typeof loader>();

  const totalGifts = giftGroups.reduce((sum, g) => sum + g.gifts.length, 0);

  return (
    <AccountLayout
      heading="Gift History"
      subheading="Tokens you've purchased for others"
      backLink={{to: '/account/circle', label: 'Back to Recovery Circle'}}
    >

      {giftGroups.length > 0 ? (
        <>
          {/* Summary */}
          <div className="flex items-center gap-4 mb-8 p-4 bg-accent/5 rounded-xl border border-accent/10">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white">
                {totalGifts} {totalGifts === 1 ? 'gift' : 'gifts'} sent to{' '}
                {giftGroups.length}{' '}
                {giftGroups.length === 1 ? 'person' : 'people'}
              </p>
              <p className="text-body-sm text-white/50">
                Every token carries meaning on someone's journey
              </p>
            </div>
          </div>

          {/* Gift Groups */}
          <div className="space-y-6">
            {giftGroups.map((group) => (
              <RecipientGiftSection key={group.memberId ?? group.memberName} group={group} />
            ))}
          </div>
        </>
      ) : (
        /* Empty State */
        <div style={{textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem'}}>
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-accent" />
          </div>
          <h3 className="font-display text-2xl font-bold text-white mb-3">
            No Gifts Yet
          </h3>
          <p style={{maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: '2rem', fontSize: '1.125rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)'}}>
            When you purchase tokens as gifts for someone in your circle, they'll
            appear here.
          </p>
          <Link to="/collections">
            <Button variant="primary" size="lg">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Browse Tokens
            </Button>
          </Link>
        </div>
      )}
    </AccountLayout>
  );
}

function RecipientGiftSection({group}: {group: RecipientGiftGroup}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden" style={{background: 'linear-gradient(180deg, #111 0%, #0A0A0A 40%, #080808 100%)'}}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-bold">
            {group.memberName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              {group.memberName}
            </h3>
            <div className="flex items-center gap-3 text-caption text-white/50">
              {group.member && (
                <>
                  <span>
                    <Users className="w-3.5 h-3.5 inline mr-1" />
                    {getRelationshipLabel(group.member.relationship)}
                  </span>
                  <span>{calculateDaysSober(group.member.cleanDate).toLocaleString()} days sober</span>
                </>
              )}
              {!group.member && !group.memberId && (
                <span className="text-white/40">Not in circle</span>
              )}
              {group.memberId && !group.member && (
                <span className="text-white/40">Removed from circle</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-caption font-medium">
            {group.gifts.length} {group.gifts.length === 1 ? 'gift' : 'gifts'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-white/50" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/50" />
          )}
        </div>
      </button>

      {/* Gift Timeline */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-white/[0.08]">
          <div className="space-y-3 mt-4">
            {group.gifts.map((gift, index) => (
              <div
                key={`${gift.orderName}-${index}`}
                className="flex gap-4 p-3 bg-white/[0.03] rounded-lg"
              >
                {gift.image && (
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/[0.05] flex-shrink-0">
                    <Image
                      data={gift.image}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-bold text-white">
                    {gift.title}
                  </p>
                  {gift.variantTitle && gift.variantTitle !== 'Default Title' && (
                    <p className="text-caption text-white/50">{gift.variantTitle}</p>
                  )}
                  {gift.engravingPreview && (
                    <p className="text-caption text-accent mt-0.5">
                      Engraving: {gift.engravingPreview}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-caption text-white/50">
                    <span>
                      <Package className="w-3 h-3 inline mr-1" />
                      {gift.orderName}
                    </span>
                    <span>
                      {new Date(gift.processedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-sm font-bold text-white">
                    <Money data={gift.price} />
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Shop CTA for this member */}
          {group.member && (
            <div className="mt-4 pt-4 border-t border-white/[0.08]">
              <Link to="/collections">
                <Button variant="secondary" size="sm">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Send Another Token
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
