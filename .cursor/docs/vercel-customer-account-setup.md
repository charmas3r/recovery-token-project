# Vercel + Customer Account API Setup Guide

**Date**: January 25, 2026  
**Status**: Configuration Required

---

## Current Setup

✅ **Dev Store**: `recovery-token-store.myshopify.com`  
✅ **Shop ID**: `75227332779`  
✅ **Deployment**: Vercel (not Oxygen)  
✅ **Customer Account API Client ID**: `48ff7de4-9b46-4570-9af1-7cde433ace50`  
✅ **Customer Account API URL**: `https://shopify.com/75227332779`

---

## Step 1: Verify Customer Account API URL

### Option A: From Shopify Admin (Recommended)

1. Go to: `https://recovery-token-store.myshopify.com/admin/settings/customer_accounts`
2. Look for "Headless" or "New customer accounts" section
3. Find the **Customer Account API endpoint URL**
4. Copy the exact URL shown

### Option B: Common Formats

The URL is typically one of these formats:

```
# Format 1 (Most common for new customer accounts)
https://shopify.com/84869161274

# Format 2 (Legacy format)
https://recovery-token-store.myshopify.com/account/customer/api/2024-01/graphql
```

---

## Step 2: Update Environment Variables

### Local Development (.env)

Your current `.env` file should be configured:

```env
PUBLIC_STORE_DOMAIN="your-store.myshopify.com"
PUBLIC_STOREFRONT_API_TOKEN="your-public-storefront-token"
PRIVATE_STOREFRONT_API_TOKEN="your-private-storefront-token"
PUBLIC_STOREFRONT_API_VERSION="2024-01"
SESSION_SECRET="your-session-secret"

# Customer Account API
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID="48ff7de4-9b46-4570-9af1-7cde433ace50"
PUBLIC_CUSTOMER_ACCOUNT_API_URL="https://shopify.com/75227332779"
```

**Action**: If the API URL from Step 1 is different, update it in `.env`

### Vercel Deployment

1. Go to your Vercel project dashboard:
   ```
   https://vercel.com/<your-username>/<project-name>/settings/environment-variables
   ```

2. Add these environment variables for **Production**, **Preview**, and **Development**:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `PUBLIC_STORE_DOMAIN` | `recovery-token-store.myshopify.com` | Your Shopify store domain |
| `PUBLIC_STOREFRONT_API_TOKEN` | `a5c7e30c137dd5a8f4450101a315bd23` | Storefront API token |
| `PUBLIC_STOREFRONT_API_VERSION` | `2024-01` | API version |
| `SESSION_SECRET` | `<GENERATE_SECURE_SECRET>` | **⚠️ Generate new for production!** |
| `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` | `48ff7de4-9b46-4570-9af1-7cde433ace50` | Customer Account API Client ID |
| `PUBLIC_CUSTOMER_ACCOUNT_API_URL` | `https://shopify.com/75227332779` | Customer Account API endpoint |

3. **🚨 CRITICAL: Generate a secure `SESSION_SECRET` for production:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   
   ⚠️ **DO NOT use `lucid-dev-secret` in production!** This is a **launch blocker** - see [Pre-Launch Security Checklist](./pre-launch-security-checklist.md) for details.

4. Click **Save** after adding all variables

5. Redeploy your application:
   ```bash
   git commit -am "Add Customer Account API configuration"
   git push
   ```
   Or trigger a manual deployment in Vercel dashboard

---

## Step 3: Configure Customer Accounts in Shopify

Ensure Customer Accounts are properly enabled in your Shopify store:

1. Go to: **Settings** → **Customer accounts**
2. Select: **New customer accounts** (required for Customer Account API)
3. Enable: **Allow customer login from custom storefronts** or **Headless**
4. Add your Vercel domain to **Allowed domains**:
   - `https://your-app.vercel.app`
   - `https://*.vercel.app` (for preview deployments)
5. Save changes

---

## Step 4: Test Customer Account API

### Test Locally

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/account/login`

3. Check browser console for any Customer Account API errors

### Test on Vercel

1. Deploy to Vercel
2. Navigate to: `https://your-app.vercel.app/account/login`
3. Check browser console and Vercel logs

---

## Step 5: Verify Configuration

Run the test script:

```bash
node scripts/test-customer-api.js
```

This will display your current configuration and help verify settings.

---

## Common Issues & Solutions

### Issue 1: "Customer Account API not configured"

**Solution**: Ensure `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` and `PUBLIC_CUSTOMER_ACCOUNT_API_URL` are set in both `.env` (local) and Vercel dashboard (production).

### Issue 2: CORS errors in browser console

**Solution**: Add your Vercel domain to allowed domains in Shopify Admin → Settings → Customer accounts.

### Issue 3: "Invalid Customer Account API URL"

**Solution**: Verify the URL format in Shopify Admin. It should match one of these patterns:
- `https://shopify.com/{SHOP_ID}`
- `https://{STORE_DOMAIN}/account/customer/api/{VERSION}/graphql`

### Issue 4: Authentication redirects not working

**Solution**: Check that your callback URLs are correctly configured:
- Callback URL should be: `https://your-app.vercel.app/account/authorize`
- Add this to allowed callback URLs in Shopify Customer Account settings

---

## Next Steps

Once Customer Account API is properly configured:

1. ✅ **Build Login/Register Components** - Use the schemas from `lib/validation.ts`
2. ✅ **Implement Protected Routes** - Use `requireCustomerAuth()` from `lib/customer.server.ts`
3. ✅ **Test Authentication Flow** - Register → Login → Profile → Logout
4. ✅ **Build Account Dashboard** - Orders, addresses, profile management

---

## Resources

- [Shopify Customer Account API Docs](https://shopify.dev/docs/api/customer)
- [Hydrogen Customer Account Setup](https://shopify.dev/docs/custom-storefronts/building-with-the-customer-account-api/hydrogen)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

## Status Checklist

- [x] Customer Account API Client ID obtained
- [ ] Customer Account API URL verified in Shopify Admin
- [ ] Environment variables added to Vercel dashboard
- [ ] Secure `SESSION_SECRET` generated for production
- [ ] Allowed domains configured in Shopify
- [ ] Local authentication tested
- [ ] Production authentication tested on Vercel
