# Supabase Code Requirements

## Description
Supabase JavaScript SDK v2 usage requirements. Covers async getSession/getUser patterns, emailRedirectTo configuration for user registration, and edge function URL rules.

## Guide

# Code Requirements
1. When using Supabase JavaScript SDK, MUST use v2 version:

- NOTE that getSession and getUser methods are async, THIS IS CRUCIAL for proper user and session handling:
```jsx
// how to get session (async)
const {{ data: {{ session }} }} = await supabase.auth.getSession();
// how to get session token (ALWAYS await to get session first)
const token = session?.access_token;
// how to get user (async)
const {{ data: {{ user }} }} = await supabase.auth.getUser();
```

- NOTE that emailRedirectTo MUST be set to the current origin, THIS IS CRUCIAL for user registration:
```jsx
const {{ error }} = await supabase.auth.signUp({{email, password, options: {{emailRedirectTo: window.location.origin}} }});
```

- MUST call edge functions via {{supabaseUrl}} - NEVER use `window.location.origin`
