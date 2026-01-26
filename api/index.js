// Edge Runtime is compatible with Cloudflare Workers
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    console.log('[Handler] Starting request:', request.url);
    
    // Try to dynamically import the server module
    console.log('[Handler] Attempting to import server module...');
    const serverModule = await import('./server.js');
    console.log('[Handler] Server module imported. Keys:', Object.keys(serverModule));
    console.log('[Handler] Default export type:', typeof serverModule.default);
    
    if (serverModule.default && typeof serverModule.default === 'object') {
      console.log('[Handler] Default export keys:', Object.keys(serverModule.default));
    }
    
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

    console.log('[Handler] Environment keys:', Object.keys(env).filter(k => env[k]));

    // Create minimal execution context (compatible with Workers)
    const executionContext = {
      waitUntil: (promise) => {
        promise.catch(err => console.error('waitUntil error:', err));
      },
      passThroughOnException: () => {},
    };

    // Get the server's default export (the server object with fetch method)
    const server = serverModule.default;
    
    if (!server || typeof server.fetch !== 'function') {
      const errorDetails = {
        hasDefault: !!serverModule.default,
        defaultType: typeof serverModule.default,
        moduleKeys: Object.keys(serverModule),
        defaultKeys: serverModule.default ? Object.keys(serverModule.default) : 'N/A',
      };
      console.error('[Handler] Server structure invalid:', errorDetails);
      throw new Error(`Server module structure is unexpected: ${JSON.stringify(errorDetails)}`);
    }

    console.log('[Handler] Calling server.fetch...');
    const response = await server.fetch(request, env, executionContext);
    console.log('[Handler] Response received:', response.status);
    
    return response;
  } catch (error) {
    console.error('[Handler] Error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
