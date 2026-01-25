import serverBuild from '../dist/server/index.js';

export default async function handler(req, res) {
  try {
    // Convert Vercel request to standard Request object
    const url = new URL(req.url || '/', `https://${req.headers.host}`);
    const request = new Request(url.toString(), {
      method: req.method,
      headers: new Headers(req.headers),
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    });

    // Create minimal env object
    const env = {
      SESSION_SECRET: process.env.SESSION_SECRET || 'default-secret',
      PUBLIC_STOREFRONT_API_TOKEN: process.env.PUBLIC_STOREFRONT_API_TOKEN,
      PRIVATE_STOREFRONT_API_TOKEN: process.env.PRIVATE_STOREFRONT_API_TOKEN,
      PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN,
      PUBLIC_STOREFRONT_ID: process.env.PUBLIC_STOREFRONT_ID,
      PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: process.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
      PUBLIC_CUSTOMER_ACCOUNT_API_URL: process.env.PUBLIC_CUSTOMER_ACCOUNT_API_URL,
    };

    // Create minimal execution context
    const executionContext = {
      waitUntil: (promise) => promise,
      passThroughOnException: () => {},
    };

    // Call the server's fetch handler
    const response = await serverBuild.default.fetch(request, env, executionContext);

    // Convert Response to Vercel response
    res.status(response.status);
    
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Internal Server Error');
  }
}
