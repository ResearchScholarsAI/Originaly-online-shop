# Originaly Release Gate

A release is not considered complete until all gates pass:

1. Dependencies install from the committed lockfile.
2. TypeScript and production build complete successfully.
3. Lint completes without blocking errors.
4. SPA routes load directly on the deployed host.
5. Browser smoke tests cover Home, Shop, Product, Cart and Admin entry.
6. Supabase migrations are applied and verified in the target project.
7. OTP and payment remain disabled rather than falsely reporting success when provider secrets are absent.
8. No service-role keys or payment/SMS secrets are shipped to the browser.
9. Android CI produces an APK only after the web build succeeds.
10. Only then is a public preview promoted.
