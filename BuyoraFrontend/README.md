# Buyora Frontend

Developer: Vishnu

## Run locally

Use Node.js 22. Copy .env.example to .env.local and configure the API origin. Run npm ci, then npm run dev from this directory. The backend must run for catalog, accounts, cart, checkout and administration.

## Checks

- npm run typecheck
- npm run lint
- npm run test:run
- npm run build
- npm run test:e2e (requires a Playwright browser)

For installed Microsoft Edge on Windows, set PLAYWRIGHT_CHANNEL=msedge. To test an independently started production server, set PLAYWRIGHT_EXTERNAL_SERVER=true and run npm run start first. Browser smoke tests cover frontend behavior; they do not certify live payments or database transactions.

Only public configuration belongs in NEXT_PUBLIC_* variables. Payment secrets, signing keys and database credentials belong exclusively in the backend environment. IMAGE_HOSTS limits remote image sources. Local MinIO image optimization is blocked by Next.js's private-IP protection; use a trusted public media origin for production. Do not enable unrestricted remote images.

See docs/BUYORA_SYSTEM_AUDIT.md, docs/API_INTEGRATION.md and docs/BUYORA_TEST_MATRIX.md for scope and remaining acceptance work.
