export default async function handler(req, res) {
  try {
    console.log('Handler invoked:', req.method, req.url);
    
    // Dynamic import for server build
    const serverBuildPath = new URL('../dist/server/index.js', import.meta.url).pathname;
    console.log('Loading server build from:', serverBuildPath);
    
    const serverBuild = await import(serverBuildPath);
    console.log('Server build loaded, keys:', Object.keys(serverBuild));
    
    // Convert Vercel request to standard Request object
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const url = new URL(req.url || '/', `${protocol}://${host}`);
    
    console.log('Request URL:', url.toString());
    
    const request = new Request(url.toString(), {
      method: req.method,
      headers: new Headers(req.headers),
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
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

    console.log('Environment configured:', Object.keys(env).filter(k => env[k]));

    // Create minimal execution context
    const executionContext = {
      waitUntil: (promise) => promise,
      passThroughOnException: () => {},
    };

    // Call the server's fetch handler
    const fetchHandler = serverBuild.default?.fetch || serverBuild.default;
    console.log('Calling fetch handler:', typeof fetchHandler);
    
    const response = await fetchHandler(request, env, executionContext);
    console.log('Response received:', response.status);

    // Convert Response to Vercel response
    res.status(response.status);
    
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await response.text();
    res.send(body);
  } catch (error) {
    console.error('Server error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
