# Contributing

## Setup

Use Node 20.12 or later and the pnpm version in `package.json`.
Run `corepack enable`, then `pnpm install --frozen-lockfile`.
Run `pnpm dev` from the project root.
Restart `pnpm dev` after you change core source so its built output stays current.

## Structure

- `packages/core/src/`: pure TypeScript network, prediction, and save rules. No runtime dependencies or I/O.
- `apps/web/src/`: React UI, browser storage, and the Graphlib adapter.
- `apps/web/vite.config.ts`: static build and offline cache generation.
- `apps/web/tests/config/`: validated environment settings for browser tests.
- `apps/web/tests/`: web-owned domain regression tests and Playwright gameplay tests.

The app does not need an API. Keep server infrastructure out until a feature requires it.
Use `@/` for web imports and `@homelab/core` for shared rules.
Do not change existing save keys or persistence shapes during cleanup.
Validate external data once. Use precise types within the application.
Compute derived values from raw state.

## Style

Use strict TypeScript, ESLint, and Prettier. Use single quotes, no semicolons, two spaces, and LF line endings.
Use CSS color tokens and Lucide icons. Keep the approved rack design and keyboard support.
Read environment values through `config()`. Add defaults, validation, and an example for each new variable.
Use short, clear English for comments and visible text.

## Checks

Run these commands before you submit a change:

```sh
pnpm format
pnpm typecheck
pnpm lint
pnpm test
pnpm build
HOMELAB_PRODUCTION=true HOMELAB_TEST_PORT=5185 pnpm test:browser
```

The browser suite uses system Chrome when available. Otherwise, run `pnpm exec playwright install chromium`.
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can select another installed Chromium browser.
`apps/web/tests/.env.example` documents test settings. Export values in the shell; test tools do not load `.env` files.
Keep tests focused on behavior. Keep existing scenarios when you refactor.

Do not include secrets, local agent context, generated builds, or test results in changes.

## Git Conventions

Use Conventional Commits, such as `feat: add Coolify image` or `fix: keep service worker fresh`.
Keep the subject short, specific, and imperative. Do not use an essay-style subject or a wordy body.
Add a brief body only when it records necessary context.

Name branches `<type>/<short-description>`, such as `feat/coolify-deployment` or `fix/offline-cache`.
