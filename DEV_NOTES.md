# Development notes

## Build
- `node scripts/build.mjs`
  - Generates both production (`/index.html`) and test (`/test/index.html`) outputs so main is ready immediately.

## Safety check
- `node scripts/verify-terms.mjs`
- `node scripts/verify-binary-safe.mjs`
  - Confirms `/assets` is the single source of truth and checks for binary-safe rules.
