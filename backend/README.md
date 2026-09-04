# Supabase Backend Development Guide

Supabase is enabled, use it as the backend service (provides Auth, Database, File Storage, Edge Functions and Real-time Updates features).

## Step 0: Verify Supabase Connection

**Before proceeding, call `SupabaseManager.check_status()` to verify Supabase is connected.**
- If connected: use the returned Project URL, Anon Key, Project Ref, and Session ID as the source of truth, then continue to Step 1.
- If NOT connected: ask the user to connect their Supabase project from the platform integrations/settings entry, then call `SupabaseManager.check_status()` again before continuing.

## Supabase Configuration

Do NOT rely on static README placeholders for Supabase connection info.

- Always call `SupabaseManager.check_status()` to get the latest Project URL, Anon Key, Project Ref, and Session ID.
- If the user reconnects or switches their Supabase project in the UI, call `SupabaseManager.check_status()` again before making implementation decisions.

## CRITICAL: DATABASE SETUP MUST BE COMPLETED BEFORE ANY CODE IMPLEMENTATION OR MODIFICATION

Follow These Steps in Order:

### Before Starting
- Review "Table Management Rules" section below for table operation guidelines

### For New Project Development
1. Install Dependencies (REQUIRED before writing any Supabase-related code):
   - MUST run: `pnpm install @supabase/supabase-js`
   - Use `@supabase/supabase-js` for ALL frontend data access. Do NOT use `@metagptx/web-sdk` — it is not for Supabase projects.
   - The template ships with `src/lib/api.ts` (imports `@metagptx/web-sdk`) — ignore and overwrite it with your own Supabase client.
2. Database First (if you need to create tables)
   - Create all necessary tables using SupabaseManager.create_tables
3. Edge Functions (if needed):
   - Create new edge functions using SupabaseManager.create_function

### For Incremental Development
1. Database Changes (if needed):
   - Check existing tables using SupabaseManager.get_schemas
   - Create new tables or modify existing ones as needed using SupabaseManager.create_tables
2. Edge Function Changes (if needed)
   - Update the edge functions using SupabaseManager.create_function

## Table Management Rules
- IMPORTANT: DO NOT CREATE ANY USER TABLES. User management is FULLY handled by Supabase auth.users table
- Table format: app_{session_id}_{entity_name}
- ALWAYS use Row Level Security

## Privacy / Header UI
- By default, do NOT display the logged-in user's email/name/userId in the header/top-right area.
- Use an avatar/person icon only, unless the user explicitly asks to show user info.

---

## Development Guides

### Step 1: Read Frontend README
After reading this file, use `Editor.read` to also load the frontend README:
- `README.md` — Frontend tech stack, component usage, and build commands.

**Note:** The frontend template files (`AuthCallback.tsx`, `config.ts`, `src/lib/api.ts`) use `@metagptx/web-sdk` which is NOT for Supabase. You must rewrite auth-related files to use `@supabase/supabase-js` instead.

### Step 2: Read Skill Guides

**Must-read for ALL Supabase projects** (read immediately after the frontend README):
- **Supabase Code Requirements**: Supabase JavaScript SDK v2 usage: async getSession/getUser, emailRedirectTo config, edge function URL rules.
  - Document: `/workspace/app/backend/skills_docs/supabase_code_requirements.md`

**Read on demand** (use `Editor.read` to load when your project needs edge functions):
- **Supabase Edge Functions**: Edge Function development rules: function naming, Deno.serve patterns, mandatory functions for AI/Payment/Email, env vars, logging, and security.
  - Document: `/workspace/app/backend/skills_docs/supabase_edge_functions.md`
