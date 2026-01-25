// Edge Runtime is compatible with Cloudflare Workers
export const config = {
  runtime: 'edge',
};

// Import the server build (copied during build process)
import server from './server.js';

export default async function handler(request) {
  try {
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

    // Create minimal execution context (compatible with Workers)
    const executionContext = {
      waitUntil: (promise) => {
        // In Edge Runtime, we can't truly waitUntil, but we can at least not await
        promise.catch(err => console.error('waitUntil error:', err));
      },
      passThroughOnException: () => {},
    };

    // Call the server's fetch handler (Cloudflare Workers compatible)
    const response = await server.default.fetch(request, env, executionContext);
    
    return response;
  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
