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
  const adminToken = env.SHOPIFY_ADMIN_API_TOKEN;
  const storeDomain = env.PUBLIC_STORE_DOMAIN;

  if (!adminToken || !storeDomain) {
    throw new Error(
      'SHOPIFY_ADMIN_API_TOKEN and PUBLIC_STORE_DOMAIN are required for photo uploads',
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

// ---------------------------------------------------------------------------
// Single-file upload with Shopify File GID return
// ---------------------------------------------------------------------------

export interface ShopifyFileUploadResult {
  url: string;
  fileId: string;
}

/**
 * Upload a single image (from a File object or a remote URL) to Shopify's
 * staged-uploads flow, then register it as a Shopify File via fileCreate.
 * Returns both the CDN resource URL and the Shopify File GID.
 */
export async function uploadImageToShopifyFiles(
  input: File | {url: string; filename: string} | {b64Data: string; filename: string},
  env: Env,
): Promise<ShopifyFileUploadResult> {
  let file: File;
  if (input instanceof File) {
    file = input;
  } else if ('b64Data' in input) {
    // Convert base64 to File directly (works on all runtimes)
    const binaryString = atob(input.b64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    file = new File([bytes], input.filename, {type: 'image/png'});
  } else {
    // URL input — fetch and convert to File
    const res = await fetch(input.url);
    if (!res.ok) throw new Error(`Failed to fetch image from ${input.url}`);
    const blob = await res.blob();
    file = new File([blob], input.filename, {type: blob.type || 'image/png'});
  }

  const urls = await uploadImagesToShopify([file], env);
  if (!urls.length) throw new Error('Upload failed: no URL returned');

  const fileId = await registerFileInShopify(urls[0], file.name, env);
  return {url: urls[0], fileId};
}

/**
 * Register a staged-upload resource URL as a Shopify File (fileCreate mutation).
 * Returns the Shopify File GID.
 */
async function registerFileInShopify(
  resourceUrl: string,
  filename: string,
  env: Env,
): Promise<string> {
  const mutation = `
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          ... on MediaImage {
            id
            image {
              url
            }
          }
        }
        userErrors {
          field
          message
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
      body: JSON.stringify({
        query: mutation,
        variables: {
          files: [{
            alt: `Custom token design: ${filename}`,
            contentType: 'IMAGE',
            originalSource: resourceUrl,
          }],
        },
      }),
    },
  );

  const json = (await res.json()) as any;
  const fileData = json?.data?.fileCreate;

  if (fileData?.userErrors?.length) {
    throw new Error(`Shopify file create error: ${fileData.userErrors[0].message}`);
  }

  return fileData.files[0].id;
}

// ---------------------------------------------------------------------------
// Batch resolver: Shopify File GIDs → CDN URLs
// ---------------------------------------------------------------------------

/**
 * Given an array of Shopify File GIDs, resolve them to their CDN URLs.
 * Returns a map of { [gid]: url }.
 */
export async function resolveShopifyFileIds(
  ids: string[],
  env: Env,
): Promise<Record<string, string>> {
  if (!ids.length) return {};

  const query = `
    query ResolveFiles($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on MediaImage {
          id
          image {
            url
          }
        }
        ... on GenericFile {
          id
          url
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
      body: JSON.stringify({query, variables: {ids}}),
    },
  );

  const json = (await res.json()) as any;
  const result: Record<string, string> = {};

  for (const node of json?.data?.nodes ?? []) {
    if (node?.id) {
      const url = node.image?.url ?? node.url;
      if (url) result[node.id] = url;
    }
  }

  return result;
}
