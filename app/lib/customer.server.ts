import type {CustomerAccount} from '@shopify/hydrogen';
import {
  CUSTOMER_DETAILS_QUERY,
  CUSTOMER_FRAGMENT,
} from '~/graphql/customer-account/CustomerDetailsQuery';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';
import {
  CREATE_ADDRESS_MUTATION,
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

/**
 * Customer Account API Helper Functions
 * 
 * This module provides utility functions for interacting with the
 * Shopify Customer Account API through Hydrogen's customerAccount object.
 * 
 * Authentication is handled by Hydrogen automatically via the customerAccount
 * object passed from the loader context.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerAddress {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  territoryCode: string; // Province/State code
  zoneCode?: string; // Country code
  zip: string;
  phoneNumber?: string;
}

export interface CustomerUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface OrdersQueryOptions {
  first?: number;
  last?: number;
  startCursor?: string;
  endCursor?: string;
  query?: string; // Filter query (e.g., "fulfillment_status:fulfilled")
}

export interface CustomerError {
  code?: string;
  field?: string[];
  message: string;
}

export interface CustomerOperationResult<T> {
  data?: T;
  errors?: CustomerError[];
  success: boolean;
}

// ============================================================================
// CUSTOMER DETAILS
// ============================================================================

/**
 * Get the current customer's details including addresses
 */
export async function getCustomerDetails(
  customerAccount: CustomerAccount,
): Promise<CustomerOperationResult<any>> {
  try {
    const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY);

    if (errors?.length) {
      return {
        success: false,
        errors: errors.map((e) => ({message: e.message})),
      };
    }

    return {
      success: true,
      data: data?.customer,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{message: 'Failed to fetch customer details'}],
    };
  }
}

/**
 * Update customer profile information
 */
export async function updateCustomerProfile(
  customerAccount: CustomerAccount,
  input: CustomerUpdateInput,
): Promise<CustomerOperationResult<any>> {
  try {
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer: input,
        },
      },
    );

    if (errors?.length || data?.customerUpdate?.userErrors?.length) {
      return {
        success: false,
        errors: [
          ...(errors?.map((e) => ({message: e.message})) || []),
          ...(data?.customerUpdate?.userErrors || []),
        ],
      };
    }

    return {
      success: true,
      data: data?.customerUpdate?.customer,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{message: 'Failed to update customer profile'}],
    };
  }
}

// ============================================================================
// ADDRESS MANAGEMENT
// ============================================================================

/**
 * Create a new customer address
 */
export async function createCustomerAddress(
  customerAccount: CustomerAccount,
  address: CustomerAddress,
  setAsDefault = false,
): Promise<CustomerOperationResult<any>> {
  try {
    const {data, errors} = await customerAccount.mutate(
      CREATE_ADDRESS_MUTATION,
      {
        variables: {
          address: {
            firstName: address.firstName,
            lastName: address.lastName,
            company: address.company,
            address1: address.address1,
            address2: address.address2,
            city: address.city,
            territoryCode: address.territoryCode,
            zoneCode: address.zoneCode,
            zip: address.zip,
            phoneNumber: address.phoneNumber,
          },
          defaultAddress: setAsDefault,
        },
      },
    );

    if (errors?.length || data?.customerAddressCreate?.userErrors?.length) {
      return {
        success: false,
        errors: [
          ...(errors?.map((e) => ({message: e.message})) || []),
          ...(data?.customerAddressCreate?.userErrors || []),
        ],
      };
    }

    return {
      success: true,
      data: data?.customerAddressCreate?.customerAddress,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{message: 'Failed to create address'}],
    };
  }
}

/**
 * Update an existing customer address
 */
export async function updateCustomerAddress(
  customerAccount: CustomerAccount,
  addressId: string,
  address: CustomerAddress,
  setAsDefault = false,
): Promise<CustomerOperationResult<any>> {
  try {
    const {data, errors} = await customerAccount.mutate(
      UPDATE_ADDRESS_MUTATION,
      {
        variables: {
          addressId,
          address: {
            firstName: address.firstName,
            lastName: address.lastName,
            company: address.company,
            address1: address.address1,
            address2: address.address2,
            city: address.city,
            territoryCode: address.territoryCode,
            zoneCode: address.zoneCode,
            zip: address.zip,
            phoneNumber: address.phoneNumber,
          },
          defaultAddress: setAsDefault,
        },
      },
    );

    if (errors?.length || data?.customerAddressUpdate?.userErrors?.length) {
      return {
        success: false,
        errors: [
          ...(errors?.map((e) => ({message: e.message})) || []),
          ...(data?.customerAddressUpdate?.userErrors || []),
        ],
      };
    }

    return {
      success: true,
      data: data?.customerAddressUpdate?.customerAddress,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{message: 'Failed to update address'}],
    };
  }
}

/**
 * Delete a customer address
 */
export async function deleteCustomerAddress(
  customerAccount: CustomerAccount,
  addressId: string,
): Promise<CustomerOperationResult<string>> {
  try {
    const {data, errors} = await customerAccount.mutate(
      DELETE_ADDRESS_MUTATION,
      {
        variables: {
          addressId,
        },
      },
    );

    if (errors?.length || data?.customerAddressDelete?.userErrors?.length) {
      return {
        success: false,
        errors: [
          ...(errors?.map((e) => ({message: e.message})) || []),
          ...(data?.customerAddressDelete?.userErrors || []),
        ],
      };
    }

    return {
      success: true,
      data: data?.customerAddressDelete?.deletedAddressId ?? undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{message: 'Failed to delete address'}],
    };
  }
}

// ============================================================================
// ORDER MANAGEMENT
// ============================================================================

/**
 * Get customer orders with pagination and filtering
 */
export async function getCustomerOrders(
  customerAccount: CustomerAccount,
  options: OrdersQueryOptions = {},
): Promise<CustomerOperationResult<any>> {
  const {first = 10, last, startCursor, endCursor, query} = options;

  try {
    const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
      variables: {
        first: last ? undefined : first,
        last,
        startCursor,
        endCursor,
        query,
      },
    });

    if (errors?.length) {
      return {
        success: false,
        errors: errors.map((e) => ({message: e.message})),
      };
    }

    return {
      success: true,
      data: {
        orders: data?.customer?.orders?.nodes || [],
        pageInfo: data?.customer?.orders?.pageInfo,
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [{message: 'Failed to fetch orders'}],
    };
  }
}

/**
 * Get a specific order by ID
 */
export async function getCustomerOrder(
  customerAccount: CustomerAccount,
  orderId: string,
): Promise<CustomerOperationResult<any>> {
  try {
    const {data, errors} = await customerAccount.query(CUSTOMER_ORDER_QUERY, {
      variables: {
        orderId,
      },
    });

    if (errors?.length) {
      return {
        success: false,
        errors: errors.map((e) => ({message: e.message})),
      };
    }

    return {
      success: true,
      data: data?.order,
    };
  } catch (error) {
    return {
      success: false,
      errors: [{message: 'Failed to fetch order details'}],
    };
  }
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Check if the customer is currently logged in
 * 
 * @returns Promise<boolean> - True if logged in, false otherwise
 */
export async function isCustomerLoggedIn(
  customerAccount: CustomerAccount,
): Promise<boolean> {
  return customerAccount.isLoggedIn();
}

/**
 * Require authentication - redirect to login if not authenticated
 * Use this in loaders for protected routes
 * 
 * @throws {Response} - Redirects to login page if not authenticated
 */
export async function requireCustomerAuth(
  customerAccount: CustomerAccount,
  redirectTo?: string,
): Promise<void> {
  const isLoggedIn = await customerAccount.isLoggedIn();

  if (!isLoggedIn) {
    const loginUrl = redirectTo
      ? `/account/login?redirect=${encodeURIComponent(redirectTo)}`
      : '/account/login';

    throw new Response(null, {
      status: 302,
      headers: {
        Location: loginUrl,
      },
    });
  }
}

// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================

/**
 * Format customer API errors for display
 */
export function formatCustomerErrors(errors: CustomerError[]): string {
  if (!errors || errors.length === 0) {
    return 'An unknown error occurred';
  }

  return errors.map((error) => error.message).join('. ');
}

/**
 * Check if an error is an authentication error
 */
export function isAuthenticationError(errors: CustomerError[]): boolean {
  return errors.some(
    (error) =>
      error.code === 'UNAUTHORIZED' ||
      error.code === 'UNAUTHENTICATED' ||
      error.message?.toLowerCase().includes('authentication'),
  );
}
