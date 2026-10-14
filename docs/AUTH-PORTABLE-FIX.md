# Email authentication repair — 2026-10-14

The portable review bundler replaced import.meta.env with {DEV:true}, removing
all Supabase configuration. The delivered source also had only .env.example.
Thus the client was null and both email operations failed before any request.

- Retained the verified Arcade-x public URL/publishable key in
  src/config/public-backend.json. These are public browser configuration, not
  administrative credentials. Deployment environment overrides remain supported
  as a complete URL/key pair; partial overrides do not mix projects.
- Portable builds now preserve public auth environment overrides using Vite
  loadEnv and explicit environment values.
- Callback construction preserves a hosted subpath, strips stale query/hash,
  accepts an explicit HTTPS callback, and omits redirectTo for file/content URLs.
  Supabase then uses its configured Site URL instead of throwing Invalid URL.
- No password storage, bypass of confirmation, database changes, or auth-provider
  policy changes. Guest/account data isolation is unchanged.

Verification: production build and TypeScript passed; portable-auth.mjs checks
callback cases, public configuration and intercepted real SDK signup/password
requests. Read-only live checks returned HTTP 200 for auth settings: email enabled,
signup enabled, confirmation required. The four account RPCs exist on the project.
No test account was created and no email was sent. Browser end-to-end and actual
mail delivery are not verified. Email callback hosting/allowlist still belongs to
the project's existing Auth Site URL setup; local files cannot receive callbacks.
After confirming a signup email, reopen the HTML launcher and sign in.
