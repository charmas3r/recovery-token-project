/**
 * Daily AI generation rate limit via Shopify shop metafield.
 *
 * Stores a JSON counter { date, count } on the shop object so the limit
 * is shared across all server instances and resets automatically each UTC day.
 */

const METAFIELD_NAMESPACE = 'custom_token';
const METAFIELD_KEY = 'daily_generation_count';

interface DailyCount {
  date: string;
  count: number;
}

/**
 * Check whether incrementBy more generations are allowed today, and if so
 * increment the counter atomically via the Admin API.
 *
 * Returns { allowed, current, limit } where `current` is the new count
 * after incrementing (or the existing count if not allowed).
 */
export async function checkAndIncrementDailyLimit(
  env: Env,
  incrementBy: number = 1,
): Promise<{allowed: boolean; current: number; limit: number}> {
  const limit = parseInt(env.AI_MAX_GENERATIONS_PER_DAY || '500', 10);
  const today = new Date().toISOString().split('T')[0];

  const current = await readDailyCount(env);
  const effectiveCount = current.date === today ? current.count : 0;

  if (effectiveCount + incrementBy > limit) {
    return {allowed: false, current: effectiveCount, limit};
  }

  await writeDailyCount(env, {date: today, count: effectiveCount + incrementBy});
  return {allowed: true, current: effectiveCount + incrementBy, limit};
}

async function readDailyCount(env: Env): Promise<DailyCount> {
  const query = `#graphql
    query ShopMetafield {
      shop {
        metafield(namespace: "${METAFIELD_NAMESPACE}", key: "${METAFIELD_KEY}") {
          value
        }
      }
    }
  `;

  const domain = env.PUBLIC_STORE_DOMAIN.replace(/^https?:\/\//, '');
  const res = await fetch(
    `https://${domain}/admin/api/2024-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_API_TOKEN!,
      },
      body: JSON.stringify({query}),
    },
  );

  const json = (await res.json()) as any;
  const value = json?.data?.shop?.metafield?.value;

  if (!value) return {date: '', count: 0};

  try {
    return JSON.parse(value) as DailyCount;
  } catch {
    return {date: '', count: 0};
  }
}

async function writeDailyCount(env: Env, data: DailyCount): Promise<void> {
  const mutation = `#graphql
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message }
      }
    }
  `;

  const domain = env.PUBLIC_STORE_DOMAIN.replace(/^https?:\/\//, '');
  await fetch(
    `https://${domain}/admin/api/2024-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_API_TOKEN!,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          metafields: [{
            namespace: METAFIELD_NAMESPACE,
            key: METAFIELD_KEY,
            type: 'json',
            value: JSON.stringify(data),
            ownerId: `gid://shopify/Shop`,
          }],
        },
      }),
    },
  );
}
