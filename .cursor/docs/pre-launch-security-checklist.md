# 🚨 Pre-Launch Security Checklist

**DO NOT DEPLOY TO PRODUCTION UNTIL ALL ITEMS ARE CHECKED** ✅

---

## Critical Security Items

### 🔴 1. SESSION_SECRET (BLOCKER)

**Current Status**: ⚠️ Using development secret `lucid-dev-secret`

**REQUIRED BEFORE LAUNCH**:

```bash
# Generate secure production secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

- [ ] Generated cryptographically secure SESSION_SECRET (32+ bytes)
- [ ] Added to Vercel environment variables
- [ ] Verified it's different from `lucid-dev-secret`
- [ ] Confirmed secret is NOT committed to git
- [ ] All environments use different secrets (dev, staging, prod)

**Why This Matters**: A weak SESSION_SECRET allows attackers to forge authentication cookies and access customer accounts.

---

### 🟠 2. Environment Variables

- [ ] All production environment variables configured in Vercel
- [ ] `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID` set correctly
- [ ] `PUBLIC_CUSTOMER_ACCOUNT_API_URL` verified: `https://shopify.com/75227332779`
- [ ] `PUBLIC_STORE_DOMAIN` set to: `recovery-token-store.myshopify.com`
- [ ] `PUBLIC_STOREFRONT_API_TOKEN` configured
- [ ] No secrets committed in `.env` file to version control

---

### 🟡 3. HTTPS & Security Headers

- [ ] SSL/TLS certificate active on production domain
- [ ] HTTP automatically redirects to HTTPS
- [ ] HSTS header configured (max-age=31536000)
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Referrer-Policy configured

---

### 🟢 4. Customer Account API

- [ ] Customer Account API enabled in Shopify Admin
- [ ] Production domain added to "Allowed domains"
- [ ] Callback URL configured: `https://your-domain.com/account/authorize`
- [ ] Tested authentication flow on production URL

---

## Testing Checklist

### Authentication & Authorization
- [ ] Can register new account
- [ ] Can log in with valid credentials
- [ ] Cannot log in with invalid credentials
- [ ] Password reset email sent successfully
- [ ] Can reset password with valid token
- [ ] Protected routes redirect to login when not authenticated
- [ ] Session persists across navigation
- [ ] Logout properly clears session

### Security
- [ ] Session cookies are HTTP-only
- [ ] Session cookies have Secure flag
- [ ] CSRF tokens present on all forms
- [ ] Rate limiting active on auth endpoints
- [ ] Honeypot fields catching spam on contact form
- [ ] No sensitive data in browser console
- [ ] No API tokens exposed in client-side code

### General
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] All dependencies up to date
- [ ] No console errors on production build
- [ ] Lighthouse security score > 90

---

## Deployment Checklist

### Before Deployment
- [ ] All critical security items above are completed
- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Production environment variables verified
- [ ] Backup of current production state (if applicable)

### After Deployment
- [ ] Verify site loads over HTTPS
- [ ] Test authentication flow end-to-end
- [ ] Check session cookies in DevTools (HTTP-only, Secure)
- [ ] Monitor error logs for first 24 hours
- [ ] Test on multiple browsers/devices

---

## Emergency Procedures

### If SESSION_SECRET is Compromised

1. **Immediately** generate new secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. Update in Vercel environment variables

3. Redeploy application (this will invalidate all sessions)

4. Force all users to re-authenticate

5. Review logs for suspicious activity during compromise window

6. Document incident and update security procedures

---

## Quick Commands

### Generate SESSION_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Security Audit
```bash
npm audit
npm audit fix
```

### Check for Secrets in Git History
```bash
git log -p | grep -i "secret\|password\|token\|key" | head -20
```

### Verify HTTPS
```bash
curl -I https://your-domain.com | grep -i "strict-transport"
```

---

## Documentation

Full details in PRD Section 15: [Pre-Launch Security Checklist](../../../prd.md#15-pre-launch-security-checklist)

---

**Last Updated**: January 25, 2026  
**Review Before Every Production Deployment**
