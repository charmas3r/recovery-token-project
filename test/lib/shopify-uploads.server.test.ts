import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {uploadImageToShopifyFiles, resolveShopifyFileIds} from '~/lib/shopify-uploads.server';

const env = {
  SHOPIFY_ADMIN_API_TOKEN: 'test-token',
  PUBLIC_STORE_DOMAIN: 'https://example.myshopify.com',
} as any;

describe('shopify-uploads.server', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stages, uploads, and registers a base64 image as a Shopify File', async () => {
    (fetch as any)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              stagedUploadsCreate: {
                stagedTargets: [
                  {
                    url: 'https://staged.example.com/upload',
                    resourceUrl: 'https://staged.example.com/resource',
                    parameters: [{name: 'key', value: 'abc'}],
                  },
                ],
                userErrors: [],
              },
            },
          }),
        ),
      )
      .mockResolvedValueOnce(new Response('', {status: 200}))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              fileCreate: {
                files: [{id: 'gid://shopify/MediaImage/999'}],
                userErrors: [],
              },
            },
          }),
        ),
      );

    const result = await uploadImageToShopifyFiles(
      {b64Data: Buffer.from('fake-image-bytes').toString('base64'), filename: 'test.png'},
      env,
    );

    expect(result).toEqual({url: 'https://staged.example.com/resource', fileId: 'gid://shopify/MediaImage/999'});
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('resolves Shopify File GIDs to CDN URLs', async () => {
    (fetch as any).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            nodes: [
              {id: 'gid://shopify/MediaImage/1', image: {url: 'https://cdn.shopify.com/1.png'}},
              {id: 'gid://shopify/MediaImage/2', url: 'https://cdn.shopify.com/2.png'},
            ],
          },
        }),
      ),
    );

    const result = await resolveShopifyFileIds(
      ['gid://shopify/MediaImage/1', 'gid://shopify/MediaImage/2'],
      env,
    );

    expect(result).toEqual({
      'gid://shopify/MediaImage/1': 'https://cdn.shopify.com/1.png',
      'gid://shopify/MediaImage/2': 'https://cdn.shopify.com/2.png',
    });
  });

  it('returns an empty map when given no ids, without calling fetch', async () => {
    const result = await resolveShopifyFileIds([], env);
    expect(result).toEqual({});
    expect(fetch).not.toHaveBeenCalled();
  });
});
