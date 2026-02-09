import {useLoaderData, useFetcher, Link} from 'react-router';
import {data} from 'react-router';
import type {Route} from './+types/account.wishlist';
import {AccountLayout} from '~/components/account/AccountLayout';
import {ProductItem} from '~/components/product/ProductItem';
import {CUSTOMER_METAFIELDS_QUERY} from '~/graphql/customer-account/CustomerMetafieldsQuery';
import {CUSTOMER_METAFIELDS_SET_MUTATION} from '~/graphql/customer-account/CustomerMetafieldsMutation';
import {parseWishlist, serializeWishlist, type Wishlist} from '~/lib/wishlist';
import {Heart, X} from 'lucide-react';
import {Button} from '~/components/ui/Button';

export const meta: Route.MetaFunction = () => {
  return [{title: 'My Wishlist | Recovery Token Store'}];
};

const WISHLIST_PRODUCT_QUERY = `#graphql
  query WishlistProduct(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      featuredImage {
        id
        url
        altText
        width
        height
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
` as const;

export async function loader({context}: Route.LoaderArgs) {
  const {customerAccount, storefront} = context;
  customerAccount.handleAuthStatus();

  try {
    const {data: metafieldsData} = await customerAccount.query(
      CUSTOMER_METAFIELDS_QUERY,
      {variables: {language: customerAccount.i18n.language}},
    );

    const metafields = metafieldsData?.customer?.metafields ?? [];
    const wishlistRaw =
      metafields?.find((m: any) => m?.key === 'wishlist')?.value ?? null;

    const wishlist = parseWishlist(wishlistRaw);

    // Fetch product data for each wishlist item
    const productResults = await Promise.allSettled(
      wishlist.map((item) =>
        storefront.query(WISHLIST_PRODUCT_QUERY, {
          variables: {handle: item.productHandle},
        }),
      ),
    );

    const products = productResults
      .map((result) => {
        if (result.status === 'fulfilled' && result.value?.product) {
          return result.value.product;
        }
        return null;
      })
      .filter(Boolean);

    return {products, wishlist};
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
    return {products: [], wishlist: [] as Wishlist};
  }
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;
  const form = await request.formData();
  const formAction = form.get('formAction')?.toString();
  const productHandle = form.get('productHandle')?.toString();

  if (!productHandle) {
    return data(
      {error: 'Product handle is required', success: false},
      {status: 400},
    );
  }

  try {
    // Read current wishlist
    const {data: metafieldsData} = await customerAccount.query(
      CUSTOMER_METAFIELDS_QUERY,
      {variables: {language: customerAccount.i18n.language}},
    );

    const customerId = metafieldsData?.customer?.id;
    if (!customerId) throw new Error('Could not determine customer ID');

    const metafields = metafieldsData?.customer?.metafields ?? [];
    const wishlistRaw =
      metafields?.find((m: any) => m?.key === 'wishlist')?.value ?? null;

    let wishlist = parseWishlist(wishlistRaw);

    if (formAction === 'add') {
      // Don't add duplicates
      if (!wishlist.some((item) => item.productHandle === productHandle)) {
        wishlist.push({
          productHandle,
          addedAt: new Date().toISOString(),
        });
      }
    } else if (formAction === 'remove') {
      wishlist = wishlist.filter(
        (item) => item.productHandle !== productHandle,
      );
    } else {
      return data({error: 'Invalid action', success: false}, {status: 400});
    }

    // Write updated wishlist back to metafield
    const {data: mutationData, errors} = await customerAccount.mutate(
      CUSTOMER_METAFIELDS_SET_MUTATION,
      {
        variables: {
          metafields: [
            {
              key: 'wishlist',
              namespace: 'custom',
              value: serializeWishlist(wishlist),
              type: 'json',
              ownerId: customerId,
            },
          ],
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length || mutationData?.metafieldsSet?.userErrors?.length) {
      const errMsg =
        mutationData?.metafieldsSet?.userErrors?.[0]?.message ||
        errors?.[0]?.message ||
        'Failed to update wishlist';
      console.error('Wishlist mutation error:', errMsg, {errors, userErrors: mutationData?.metafieldsSet?.userErrors});
      throw new Error(errMsg);
    }

    return data({success: true, error: null});
  } catch (error: any) {
    console.error('Wishlist action error:', error);
    return data(
      {success: false, error: error.message || 'Something went wrong'},
      {status: 400},
    );
  }
}

export default function WishlistPage() {
  const {products, wishlist} = useLoaderData<typeof loader>();

  return (
    <AccountLayout
      heading="My Wishlist"
      subheading="Tokens you've saved for later"
    >
      {products.length > 0 ? (
        <>
          <p className="text-body text-secondary mb-6">
            <strong className="text-primary">{products.length}</strong>{' '}
            {products.length === 1 ? 'token' : 'tokens'} saved
          </p>
          <div className="products-grid">
            {products.map((product: any) => (
              <WishlistProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <WishlistEmptyState />
      )}
    </AccountLayout>
  );
}

function WishlistProductCard({product}: {product: any}) {
  const fetcher = useFetcher();
  const isRemoving =
    fetcher.state !== 'idle' &&
    fetcher.formData?.get('formAction') === 'remove';

  if (isRemoving) return null;

  return (
    <div className="relative group/card">
      <ProductItem product={product} />
      <fetcher.Form method="POST" className="absolute top-3 right-3 z-10">
        <input type="hidden" name="formAction" value="remove" />
        <input type="hidden" name="productHandle" value={product.handle} />
        <button
          type="submit"
          className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-black/10 shadow-sm flex items-center justify-center text-secondary hover:text-error hover:bg-white transition-all duration-200 opacity-0 group-hover/card:opacity-100 focus:opacity-100"
          aria-label={`Remove ${product.title} from wishlist`}
        >
          <X className="w-4 h-4" />
        </button>
      </fetcher.Form>
    </div>
  );
}

function WishlistEmptyState() {
  return (
    <div style={{textAlign: 'center'}} className="py-16">
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
        <Heart className="w-10 h-10 text-accent" />
      </div>
      <h3 className="font-display text-2xl font-bold text-primary mb-3">
        Your Wishlist Is Empty
      </h3>
      <p
        style={{
          maxWidth: '28rem',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: '2rem',
          fontSize: '1.125rem',
          lineHeight: 1.6,
          color: '#4A5568',
        }}
      >
        Save tokens you love by tapping the heart icon on any product page.
        They'll be waiting here when you're ready.
      </p>
      <Link to="/collections">
        <Button variant="primary" size="lg">
          Browse Tokens
        </Button>
      </Link>
    </div>
  );
}
