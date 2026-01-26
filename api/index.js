// Edge Runtime is compatible with Cloudflare Workers
export const config = {
  runtime: 'edge',
};

// Create a minimal Cache API polyfill for Vercel Edge Runtime
class CacheStorage {
  constructor() {
    this.caches = new Map();
  }

  async open(cacheName) {
    if (!this.caches.has(cacheName)) {
      this.caches.set(cacheName, new Cache());
    }
    return this.caches.get(cacheName);
  }

  async delete(cacheName) {
    return this.caches.delete(cacheName);
  }

  async has(cacheName) {
    return this.caches.has(cacheName);
  }

  async keys() {
    return Array.from(this.caches.keys());
  }

  async match(request) {
    for (const cache of this.caches.values()) {
      const response = await cache.match(request);
      if (response) return response;
    }
    return undefined;
  }
}

class Cache {
  constructor() {
    this.store = new Map();
  }

  async match(request) {
    const key = typeof request === 'string' ? request : request.url;
    return this.store.get(key);
  }

  async put(request, response) {
    const key = typeof request === 'string' ? request : request.url;
    // Clone the response so it can be read multiple times
    this.store.set(key, response.clone());
  }

  async delete(request) {
    const key = typeof request === 'string' ? request : request.url;
    return this.store.delete(key);
  }

  async keys() {
    return Array.from(this.store.keys());
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
      PUBLIC_STOREFRONT_ID: process.env.PUBLIC_STOREFRONT_ID,
      PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: process.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
      PUBLIC_CUSTOMER_ACCOUNT_API_URL: process.env.PUBLIC_CUSTOMER_ACCOUNT_API_URL,
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
