export function createFakeEnv(overrides: Record<string, unknown> = {}) {
  return {
    PUBLIC_STORE_DOMAIN: 'https://example.myshopify.com',
    SHOPIFY_ADMIN_API_TOKEN: 'test-admin-token',
    AI_MAX_GENERATIONS_PER_SESSION: '7',
    AI_MAX_GENERATIONS_PER_DAY: '500',
    OPENAI_API_KEY: 'test-openai-key',
    AI_IMAGE_PROVIDER: 'openai',
    ...overrides,
  };
}
