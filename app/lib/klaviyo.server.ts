/**
 * Klaviyo API Client
 *
 * Provides functions for interacting with Klaviyo's API:
 * - Create events (for triggering flows like contact form notifications)
 * - Subscribe profiles to lists (for newsletter signups)
 *
 * @see https://developers.klaviyo.com/en/reference/api_overview
 */

const KLAVIYO_API_URL = 'https://a.klaviyo.com/api';
// Use a stable API revision - check https://developers.klaviyo.com/en/docs/api_versioning_and_deprecation_policy
const KLAVIYO_API_REVISION = '2024-10-15';

interface KlaviyoConfig {
  privateApiKey: string;
  newsletterListId?: string;
}

interface KlaviyoEventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

interface CreateEventInput {
  /** The event/metric name (e.g., 'Contact Form Submitted') */
  event: string;
  /** Customer email address */
  email: string;
  /** Optional: Customer's first name */
  firstName?: string;
  /** Optional: Customer's last name */
  lastName?: string;
  /** Custom event properties */
  properties?: KlaviyoEventProperties;
  /** Optional: Unique ID to prevent duplicates */
  uniqueId?: string;
}

interface SubscribeToListInput {
  /** The Klaviyo list ID */
  listId: string;
  /** Subscriber's email */
  email: string;
  /** Optional: First name */
  firstName?: string;
  /** Optional: Last name */
  lastName?: string;
  /** Optional: Source of signup (e.g., 'Website Footer', 'Contact Form') */
  source?: string;
}

interface KlaviyoApiError {
  id: string;
  status: number;
  code: string;
  title: string;
  detail: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
}

interface KlaviyoErrorResponse {
  errors: KlaviyoApiError[];
}

export class KlaviyoError extends Error {
  public readonly statusCode: number;
  public readonly errors: KlaviyoApiError[];

  constructor(message: string, statusCode: number, errors: KlaviyoApiError[]) {
    super(message);
    this.name = 'KlaviyoError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export function createKlaviyoClient(config: KlaviyoConfig) {
  const {privateApiKey, newsletterListId} = config;

  async function request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${KLAVIYO_API_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Klaviyo-API-Key ${privateApiKey}`,
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
        revision: KLAVIYO_API_REVISION,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData: KlaviyoErrorResponse | null = null;
      let rawBody = '';
      try {
        rawBody = await response.text();
        errorData = JSON.parse(rawBody) as KlaviyoErrorResponse;
      } catch {
        // Response body might not be JSON
      }

      const errorMessage =
        errorData?.errors?.[0]?.detail ||
        `Klaviyo API error: ${response.status}`;
      throw new KlaviyoError(
        errorMessage,
        response.status,
        errorData?.errors || [],
      );
    }

    // Some endpoints return 202/204 with no body
    if (
      response.status === 202 ||
      response.status === 204 ||
      response.headers.get('content-length') === '0'
    ) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Create an event in Klaviyo
   *
   * Events trigger flows (like sending a notification email for contact form submissions)
   * The event creates or updates the profile automatically.
   *
   * @see https://developers.klaviyo.com/en/reference/create_event
   */
  async function createEvent(input: CreateEventInput): Promise<void> {
    const {event, email, firstName, lastName, properties = {}, uniqueId} = input;

    const payload = {
      data: {
        type: 'event',
        attributes: {
          properties: {
            ...properties,
          },
          metric: {
            data: {
              type: 'metric',
              attributes: {
                name: event,
              },
            },
          },
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email,
                ...(firstName && {first_name: firstName}),
                ...(lastName && {last_name: lastName}),
              },
            },
          },
          time: new Date().toISOString(),
          ...(uniqueId && {unique_id: uniqueId}),
        },
      },
    };

    await request('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Subscribe a profile to a list
   *
   * Used for newsletter signups. Respects list's double opt-in settings.
   *
   * @see https://developers.klaviyo.com/en/reference/bulk_subscribe_profiles
   */
  async function subscribeToList(input: SubscribeToListInput): Promise<void> {
    const {listId, email, firstName, lastName, source} = input;

    const payload = {
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          profiles: {
            data: [
              {
                type: 'profile',
                attributes: {
                  email,
                  ...(firstName && {first_name: firstName}),
                  ...(lastName && {last_name: lastName}),
                  ...(source && {
                    properties: {
                      signup_source: source,
                    },
                  }),
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: 'SUBSCRIBED',
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: listId,
            },
          },
        },
      },
    };

    await request('/profile-subscription-bulk-create-jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Subscribe to the default newsletter list
   *
   * Convenience method using the configured newsletter list ID
   */
  async function subscribeToNewsletter(
    email: string,
    options?: {firstName?: string; lastName?: string; source?: string},
  ): Promise<void> {
    if (!newsletterListId) {
      throw new Error(
        'Newsletter list ID not configured. Set KLAVIYO_NEWSLETTER_LIST_ID environment variable.',
      );
    }

    return subscribeToList({
      listId: newsletterListId,
      email,
      ...options,
    });
  }

  return {
    createEvent,
    subscribeToList,
    subscribeToNewsletter,
  };
}

/**
 * Create a Klaviyo client from environment variables
 */
export function getKlaviyoClient(env: {
  KLAVIYO_PRIVATE_API_KEY?: string;
  KLAVIYO_NEWSLETTER_LIST_ID?: string;
}) {
  if (!env.KLAVIYO_PRIVATE_API_KEY) {
    throw new Error(
      'KLAVIYO_PRIVATE_API_KEY environment variable is not set',
    );
  }

  return createKlaviyoClient({
    privateApiKey: env.KLAVIYO_PRIVATE_API_KEY,
    newsletterListId: env.KLAVIYO_NEWSLETTER_LIST_ID,
  });
}
