# Report 03: Coolify Deployment

The repository deployment layer is complete and verified locally. Public deployment is not complete.

## Changes

- Added a pinned two-stage `Dockerfile`.
- Added an unprivileged nginx runtime on port 8080.
- Added long-term caching for hashed assets and no-cache behavior for application entry files.
- Added security headers and a `/healthz` endpoint.
- Added a short deployment section to `README.md`.

## Architecture

The build stage uses Node 20.12.2 and pnpm 8.6.1. It installs the locked workspace dependencies,
builds core, and creates the `apps/web/dist/` output. The runtime stage contains only nginx,
its configuration, and the static build. The application has no runtime environment variables,
server process, database, or persistent volume.

## Verification

These checks passed:

- `pnpm format`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`: 12 domain tests
- `pnpm build`
- production Playwright suite: 9 browser tests
- `docker build -t homelab-weave:test .`
- nginx startup as an unprivileged container on port 8080
- `200` responses for `/`, `/sw.js`, `/healthz`, a hashed asset, and an SPA fallback path
- `Cache-Control: no-cache` for `/`, `/sw.js`, `/healthz`, and the SPA fallback
- `Cache-Control: public, max-age=31536000, immutable` for hashed assets
- CSP, permissions, referrer, content-type, and frame headers
- service-worker registration in headless Chrome with no pre-offline console or page errors
- interaction under the strict CSP and an offline reload that reported `Playing offline`

Chrome reported `ERR_INTERNET_DISCONNECTED` after the test deliberately disabled networking.
The service worker still returned the application. This browser event is expected for the offline check.

## Open Work

The operator must create and push the Git repository, configure the Coolify application,
choose the public hostname, configure DNS and tunnel ingress, and start the deployment.
Public-edge HTTPS, certificate, cache, service-worker, offline, and saved-progress checks remain open.
