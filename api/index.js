// Edge Runtime is compatible with Cloudflare Workers
export const config = {
  runtime: 'edge',
};

// Create a no-op Cache API polyfill for Vercel Edge Runtime
// This prevents stream reuse errors while allowing Hydrogen to call cache methods
class CacheStorage {
  async open(cacheName) {
    return new Cache();
  }

  async delete(cacheName) {
    return true;
  }

  async has(cacheName) {
    return false;
  }

  async keys() {
    return [];
  }

  async match(request) {
    return undefined;
  }
}

class Cache {
  // No-op cache that doesn't actually store anything
  // This prevents "Cannot perform I/O on behalf of a different request" errors
  async match(request) {
    return undefined;
  }

  async put(request, response) {
    // Don't actually store - just accept the call
    return undefined;
  }

  async delete(request) {
    return false;
  }

  async keys() {
    return [];
  }
}

// Polyfill the global caches object if it doesn't exist
if (typeof globalThis.caches === 'undefined') {
  globalThis.caches = new CacheStorage();
}

export default async function handler(request) {
  try {
    // Dynamically import the server module
    const serverModule = await import('./server.js');
    
    // Create env object from environment variables
    const env = {
      SESSION_SECRET: process.env.SESSION_SECRET || 'default-secret',
      PUBLIC_STOREFRONT_API_TOKEN: process.env.PUBLIC_STOREFRONT_API_TOKEN,
      PRIVATE_STOREFRONT_API_TOKEN: process.env.PRIVATE_STOREFRONT_API_TOKEN,
      PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN,
      PUBLIC_STOREFRONT_API_VERSION: process.env.PUBLIC_STOREFRONT_API_VERSION,
      PUBLIC_STOREFRONT_ID: process.env.PUBLIC_STOREFRONT_ID,
      PUBLIC_CHECKOUT_DOMAIN: process.env.PUBLIC_CHECKOUT_DOMAIN,
      PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: process.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
      SHOP_ID: process.env.SHOP_ID,
      // Judge.me Reviews
      JUDGEME_PUBLIC_TOKEN: process.env.JUDGEME_PUBLIC_TOKEN,
      JUDGEME_PRIVATE_TOKEN: process.env.JUDGEME_PRIVATE_TOKEN,
      PUBLIC_JUDGEME_SHOP_DOMAIN: process.env.PUBLIC_JUDGEME_SHOP_DOMAIN,
      JUDGEME_CDN_HOST: process.env.JUDGEME_CDN_HOST,
    };

    // Create execution context (compatible with Workers)
    const executionContext = {
      waitUntil: (promise) => {
        promise.catch(err => console.error('waitUntil error:', err));
      },
      passThroughOnException: () => {},
    };

    // Get the server's default export and call fetch
    const server = serverModule.default;
    
    if (!server || typeof server.fetch !== 'function') {
      throw new Error('Server module does not export a fetch function');
    }

    const response = await server.fetch(request, env, executionContext);
    
    return response;
  } catch (error) {
    console.error('Server error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: error.stack,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
