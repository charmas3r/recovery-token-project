import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import type {Route} from './+types/account.orders._index';
import {useRef} from 'react';
import {
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
  type OrderFilterParams,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
} from 'customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/layout/PaginatedResourceSection';
import {AccountLayout} from '~/components/account/AccountLayout';
import {OrderCard} from '~/components/account/OrderCard';
import {Button} from '~/components/ui/Button';
import {Input} from '~/components/ui/Input';
import {Search, X, Package} from 'lucide-react';

type OrdersLoaderData = {
  customer: CustomerOrdersFragment;
  filters: OrderFilterParams;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  const {customer, filters} = useLoaderData<OrdersLoaderData>();
  const {orders} = customer;
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <AccountLayout
      heading="Your Orders"
      subheading="Track your orders and view your purchase history"
    >
      {/* Search Form */}
      <OrderSearchForm currentFilters={filters} />
      
      {/* Orders List */}
      {orders?.nodes.length ? (
        <div className="mt-6">
          <PaginatedResourceSection connection={orders}>
            {({node: order}) => {
              const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status ?? null;
              return (
                <div className="mb-4">
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    fulfillmentStatus={fulfillmentStatus}
                  />
                </div>
              );
            }}
          </PaginatedResourceSection>
        </div>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </AccountLayout>
  );
}

function EmptyOrders({hasFilters = false}: {hasFilters?: boolean}) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface mb-4">
        <Package className="w-8 h-8 text-secondary" />
      </div>
      {hasFilters ? (
        <>
          <h3 className="font-display text-xl font-bold text-primary mb-2">
            No orders found
          </h3>
          <p className="text-body text-secondary mb-6">
            No orders match your search criteria.
          </p>
          <Link to="/account/orders">
            <Button variant="secondary">Clear Filters</Button>
          </Link>
        </>
      ) : (
        <>
          <h3 className="font-display text-xl font-bold text-primary mb-2">
            No orders yet
          </h3>
          <p className="text-body text-secondary mb-6">
            You haven't placed any orders yet. Start shopping to celebrate your milestones!
          </p>
          <Link to="/collections">
            <Button variant="primary">Browse Tokens</Button>
          </Link>
        </>
      )}
    </div>
  );
}

function OrderSearchForm({
  currentFilters,
}: {
  currentFilters: OrderFilterParams;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters = currentFilters.name || currentFilters.confirmationNumber;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-surface rounded-xl p-4"
      aria-label="Search orders"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="search"
            name={ORDER_FILTER_FIELDS.NAME}
            placeholder="Search by order #"
            aria-label="Order number"
            defaultValue={currentFilters.name || ''}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <Input
            type="search"
            name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
            placeholder="Search by confirmation #"
            aria-label="Confirmation number"
            defaultValue={currentFilters.confirmationNumber || ''}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={isSearching}>
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
          {hasFilters && (
            <Button
              type="button"
              variant="secondary"
              disabled={isSearching}
              onClick={() => {
                setSearchParams(new URLSearchParams());
                formRef.current?.reset();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
