/**
 * Shopify Admin API — Product Metafields
 *
 * Reads and writes product metafields through Shopify's Admin API GraphQL
 * endpoint. Used by the Q&A feature to store question/answer data on products.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminApiConfig {
  url: string;
  headers: Record<string, string>;
}

interface MetafieldResult {
  productId: string;
  metafieldValue: string | null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build the Admin API URL and auth headers from environment variables.
 * Throws if required vars are missing.
 */
function getAdminApiConfig(env: Env): AdminApiConfig {
  const adminToken = env.PRIVATE_STOREFRONT_API_TOKEN;
  const storeDomain = env.PUBLIC_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    throw new Error(
      'PRIVATE_STOREFRONT_API_TOKEN and PUBLIC_STORE_DOMAIN are required for Admin API access',
    );
  }

  // Strip protocol if present — Admin API expects bare domain
  const domain = storeDomain.replace(/^https?:\/\//, '');
  const url = `https://${domain}/admin/api/2024-10/graphql.json`;

  return {
    url,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
  };
}

/**
 * Execute a GraphQL query/mutation against the Shopify Admin API.
 * Handles HTTP errors and top-level GraphQL `errors` array.
 */
async function adminQuery<T>(
  env: Env,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const {url, headers} = getAdminApiConfig(env);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({query, variables}),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(
      '[shopify-admin] Admin API HTTP error:',
      response.status,
      text.substring(0, 500),
    );
    throw new Error(
      `Shopify Admin API error (${response.status}): ${text.substring(0, 300)}`,
    );
  }

  const json = (await response.json()) as T & {
    errors?: Array<{message: string}> | string;
  };

  // Handle top-level GraphQL errors (auth failures, scope issues, etc.)
  if (json.errors) {
    const msg =
      typeof json.errors === 'string'
        ? json.errors
        : json.errors.map((e) => e.message).join(', ');
    console.error('[shopify-admin] GraphQL errors:', msg);
    throw new Error(`Shopify Admin API: ${msg}`);
  }

  return json;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a product by handle and read a single metafield value.
 *
 * @returns `{productId, metafieldValue}` or `null` if product not found.
 */
export async function getProductMetafield(
  env: Env,
  productHandle: string,
  namespace: string,
  key: string,
): Promise<MetafieldResult | null> {
  const query = `#graphql
    query ProductMetafield($handle: String!, $namespace: String!, $key: String!) {
      productByHandle(handle: $handle) {
        id
        metafield(namespace: $namespace, key: $key) {
          value
        }
      }
    }
  `;

  const json = await adminQuery<{
    data: {
      productByHandle: {
        id: string;
        metafield: {value: string} | null;
      } | null;
    };
  }>(env, query, {handle: productHandle, namespace, key});

  const product = json.data?.productByHandle;
  if (!product) {
    return null;
  }

  return {
    productId: product.id,
    metafieldValue: product.metafield?.value ?? null,
  };
}

/**
 * Create or update a JSON metafield on a product.
 *
 * @param productId - Full Shopify GID (e.g. `gid://shopify/Product/123`)
 * @param value - JSON string to store
 * @throws If the mutation returns userErrors
 */
export async function setProductMetafield(
  env: Env,
  productId: string,
  namespace: string,
  key: string,
  value: string,
): Promise<void> {
  const mutation = `#graphql
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const json = await adminQuery<{
    data: {
      metafieldsSet: {
        metafields: Array<{id: string; namespace: string; key: string}> | null;
        userErrors: Array<{field: string[]; message: string}>;
      };
    };
  }>(env, mutation, {
    metafields: [
      {
        ownerId: productId,
        namespace,
        key,
        type: 'json',
        value,
      },
    ],
  });

  const {userErrors} = json.data.metafieldsSet;
  if (userErrors?.length) {
    throw new Error(
      `Shopify metafield error: ${userErrors.map((e) => e.message).join(', ')}`,
    );
  }
}
