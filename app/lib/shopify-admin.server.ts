/**
 * Shopify Admin API — Product Metafields (Write-only)
 *
 * Writes product metafields through Shopify's Admin API GraphQL endpoint.
 * Reads are done via the Storefront API (see getProductQAFromStorefront).
 * Used by the Q&A feature to store question/answer data on products.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminApiConfig {
  url: string;
  headers: Record<string, string>;
}

export interface ProductQAData {
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
// Public API — Storefront API reads
// ---------------------------------------------------------------------------

const PRODUCT_QA_QUERY = `#graphql
  query ProductQA($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      metafields(identifiers: [{namespace: "custom", key: "product_qa"}]) {
        key
        value
      }
    }
  }
` as const;

/**
 * Fetch product ID and Q&A metafield via the Storefront API.
 * This avoids needing `read_products` scope on the Admin API token.
 */
export async function getProductQAFromStorefront(
  storefront: {query: (query: string, options?: {variables?: Record<string, unknown>}) => Promise<any>},
  productHandle: string,
): Promise<ProductQAData | null> {
  const {productByHandle} = await storefront.query(PRODUCT_QA_QUERY, {
    variables: {handle: productHandle},
  });

  if (!productByHandle) return null;

  const qaMetafield = productByHandle.metafields?.find(
    (m: {key: string; value: string} | null) => m?.key === 'product_qa',
  );

  return {
    productId: productByHandle.id,
    metafieldValue: qaMetafield?.value ?? null,
  };
}

// ---------------------------------------------------------------------------
// Public API — Admin API writes
// ---------------------------------------------------------------------------

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
