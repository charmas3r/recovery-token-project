/**
 * Shopify Files API — Staged Uploads
 *
 * Uploads user photos through Shopify's Admin API staged-uploads flow
 * so they can be passed as hosted URLs to Judge.me review creation.
 */

interface StagedTarget {
  url: string;
  resourceUrl: string;
  parameters: Array<{name: string; value: string}>;
}

interface StagedUploadsResponse {
  data: {
    stagedUploadsCreate: {
      stagedTargets: StagedTarget[];
      userErrors: Array<{field: string[]; message: string}>;
    };
  };
}

/**
 * Upload an array of image Files to Shopify via staged uploads.
 * Returns an array of hosted resource URLs.
 */
export async function uploadImagesToShopify(
  files: File[],
  env: Env,
): Promise<string[]> {
  const adminToken = env.PRIVATE_STOREFRONT_API_TOKEN;
  const storeDomain = env.PUBLIC_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    throw new Error(
      'PRIVATE_STOREFRONT_API_TOKEN and PUBLIC_STORE_DOMAIN are required for photo uploads',
    );
  }

  // Strip protocol if present — Admin API expects bare domain
  const domain = storeDomain.replace(/^https?:\/\//, '');
  const adminUrl = `https://${domain}/admin/api/2024-10/graphql.json`;

  // 1. Request staged upload targets from Shopify
  const stagedInputs = files.map((file) => ({
    filename: file.name,
    mimeType: file.type,
    resource: 'FILE',
    fileSize: String(file.size),
    httpMethod: 'POST',
  }));

  const mutation = `
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const gqlResponse = await fetch(adminUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {input: stagedInputs},
    }),
  });

  if (!gqlResponse.ok) {
    const text = await gqlResponse.text();
    console.error('[shopify-uploads] Admin API HTTP error:', gqlResponse.status, text.substring(0, 500));
    throw new Error(
      `Shopify Admin API error (${gqlResponse.status}): ${text.substring(0, 300)}`,
    );
  }

  const json = (await gqlResponse.json()) as StagedUploadsResponse & {
    errors?: Array<{message: string}> | string;
  };

  // Handle top-level GraphQL errors (auth failures, scope issues, etc.)
  if (json.errors) {
    const msg = typeof json.errors === 'string'
      ? json.errors
      : json.errors.map((e) => e.message).join(', ');
    console.error('[shopify-uploads] GraphQL errors:', msg);
    throw new Error(`Shopify Admin API: ${msg}`);
  }

  if (!json.data?.stagedUploadsCreate) {
    console.error('[shopify-uploads] Unexpected response:', JSON.stringify(json).substring(0, 500));
    throw new Error('Shopify Admin API returned an unexpected response');
  }

  const {stagedTargets, userErrors} =
    json.data.stagedUploadsCreate;

  if (userErrors?.length) {
    throw new Error(
      `Shopify staged upload error: ${userErrors.map((e) => e.message).join(', ')}`,
    );
  }

  if (!stagedTargets || stagedTargets.length !== files.length) {
    throw new Error('Shopify did not return the expected number of upload targets');
  }

  // 2. Upload each file to its presigned URL
  const resourceUrls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const target = stagedTargets[i];

    const formData = new FormData();
    for (const param of target.parameters) {
      formData.append(param.name, param.value);
    }
    formData.append('file', file);

    const uploadResponse = await fetch(target.url, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const text = await uploadResponse.text();
      throw new Error(
        `Failed to upload "${file.name}" (${uploadResponse.status}): ${text.substring(0, 200)}`,
      );
    }

    resourceUrls.push(target.resourceUrl);
  }

  return resourceUrls;
}
