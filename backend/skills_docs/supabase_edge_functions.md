# Supabase Edge Functions

## Description
Supabase Edge Function development rules including function naming (app_{app_id}_{function_name}), Deno.serve request handling, mandatory functions for AI/Payment/Email/Third-party APIs, environment variables, logging, and security guidelines.

## Guide

### Edge Function Rules
- Function Naming: Use same format as tables: app_{app_id}_{function_name} with underscores
- Code Requirements:
  - MUST use `Deno.serve` for request handling
  - If the function needs to interact with the Supabase database (e.g., querying tables), it MUST import the Supabase client: `import { createClient } from 'npm:@supabase/supabase-js@2';`
  - NOTE that when using `supabase.auth.admin.getUserById()`, the response structure is `{ user: { id, email, ... } }`
  - When using `upsert()` operations, MUST specify the `onConflict` parameter if the table has unique constraints to avoid duplicate key violations, such as `onConflict: 'user_id'`
  - ALWAYS wrap `await req.json()` in try-catch. For required bodies, return 400 error; for optional bodies, use fallback logic
  - ALWAYS handle `OPTIONS` preflight: return 204 with `Access-Control-Allow-Origin:*`, `Access-Control-Allow-Headers:*` (must be `*`, no header list)
- MANDATORY Edge Functions for:
  1. AI service integration
     - MUST use official npm SDKs if not specified by the user, such as npm:openai for OpenAI(gpt-4, gpt-4o-mini, etc.), npm:@anthropic-ai/sdk for Claude, npm:@google/generative-ai for Gemini
  2. Payment processing (Default: Stripe)
     - For Stripe: MUST use `npm:stripe@12.0.0` for check-out session creation and webhook handling
     - For Stripe Checkout:
       - App-specific Price IDs MUST be retrieved from environment variables with APP_{app_id}_ prefix (e.g., APP_{app_id}_STRIPE_PRO_PRICE_ID). Accept tier/plan names and map to env vars: `const priceId = tier === 'pro' ? Deno.env.get('APP_{app_id}_STRIPE_PRO_PRICE_ID') : null;`
       - MUST include {app_id} in metadata
       - `success_url` MUST preserve ALL original page query parameters (e.g., novel, chapter, product IDs) so the frontend can restore full context after redirect. Append `&success=true` to indicate payment success, do NOT discard existing params.
     - For Stripe webhooks:
       - App-specific webhook secrets use APP_{app_id}_STRIPE_WEBHOOK_SECRET
       - MUST verify incoming events asynchronously using Stripe's constructEventAsync method along with a Stripe.createSubtleCryptoProvider()
       - MUST validate {app_id} from event metadata matches current app - if mismatch, return 200 with "received" but skip processing
     - Server-Side Validation (MANDATORY): use edge function (e.g., `submit_{resource}`) to read the user's tier with the service-role key, enforce limits before any DB write, return 403 if exceeded. If no subscription record exists, automatically create a subscription record for the user using the table's default tier value.
  3. Email sending (Default: SMTP)
     - For SMTP: MUST import: `import nodemailer from 'npm:nodemailer';`
       - Required environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, and `SMTP_SECURE` defaults to `true` if not specified
     - For Resend: Use `fetch` to post directly to api.resend.com/emails
  4. Third-party APIs
  5. Server-side computations
- Environment Variables:
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` are automatically available, ALWAYS use them to initialize the Supabase client
- Logging:
  - MUST generate a unique UUID at the beginning of each edge function and use it as the request ID throughout the entire request lifecycle
  - Log request details: method, headers (sanitized), body size
  - Log key operations: API calls, database queries, processing steps
  - For errors, including the full error object and request context
  - CONSIDER using structured logging (JSON format).
- Security:
  - NEVER hardcode API keys. ALWAYS use environment variables for ALL third-party API keys: `OPENAI_API_KEY`, `RESEND_API_KEY`, `AMAP_KEY`, `STRIPE_SECRET_KEY`, etc.
- Stripe Deployment Checklist (inform user after creating Stripe-related edge functions):
  1. Stripe account MUST have a Business Name set at https://dashboard.stripe.com/account, otherwise Checkout will reject requests.
  2. `STRIPE_SECRET_KEY` MUST be added to Supabase Edge Function Secrets before invoking any Stripe edge function.
  3. Stripe Webhook endpoint MUST be configured at https://dashboard.stripe.com/webhooks pointing to the webhook edge function URL, listening for `checkout.session.completed`. The resulting `whsec_` secret MUST be added to Supabase Secrets as `APP_{app_id}_STRIPE_WEBHOOK_SECRET`.

