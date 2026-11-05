# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@multiversx/sdk-web-wallet-cross-window-provider`: a browser signing provider that lets a dApp log in and sign transactions/messages through the MultiversX Web Wallet. It opens the wallet in a separate window and talks to it with `window.postMessage`. Published to npm from `out/` (compiled CommonJS + `.d.ts`). `@multiversx/sdk-core` is a peer dependency (`^14 || ^15 || ^16`), so the code has to work with all three majors; development and tests use v16.

## Commands

```bash
npm run compile        # tsc -> out/
npm test               # runs compile first (pretest), then jest (jsdom env)
npx jest src/CrossWindowProvider/tests/Login.test.ts   # single test file (skips the compile step)
npx jest -t 'should handle login correctly'            # single test by name
npm run lint           # eslint --fix over src (modifies files)
```

Develop on Node 24 (`.nvmrc`); the published `engines` field stays at `>=20`. CI (`build.yml`) only runs `npm ci && npm run compile` on PRs to `main`; it does not run tests or lint.

## Architecture

Two classes do the work:

- **`CrossWindowProvider`** (`src/CrossWindowProvider/CrossWindowProvider.ts`) is the public API (`init`, `login`, `logout`, `signTransaction(s)`, `guardTransactions`, `signMessage`, `cancelAction`). It's a singleton through `getInstance()`; `dispose()`/`onDestroy()` reset `_instance`. It keeps account state and turns sdk-core `Transaction`/`Message` objects into plain payloads and back (`toPlainObject` / `newFromPlainObject`). All wallet I/O goes through its `WindowManager`.
- **`WindowManager`** (`src/WindowManager/WindowManager.ts`) owns the wallet window and the postMessage protocol. Each `postMessage(request)` call:
  1. runs `handshake()`: opens the wallet window (`window.open(walletUrl, walletUrl)`), waits for `handshakeResponse`, then sends `finalizeHandshakeRequest` with the session ID;
  2. posts the request to the wallet;
  3. waits with `listenOnce(responseTypeMap[type])` for the matching response or a `cancelResponse`;
  4. closes the wallet window.

  Incoming messages are accepted only when `event.origin` matches the wallet URL's origin. `listenOnce` keeps one listener per action in `activeListeners` so duplicate listeners can't pile up. The session ID is saved in `sessionStorage` (`mx-wallet-session-id`) so it survives page reloads, and is cleared on logout. `closeConnection` has an `_isLoggingOut` guard against overlapping logouts.

- **Popup-blocked fallback:** if `window.open` returns null, `isPopupBlocked` is set and `openPopupConsent()` lazy-imports `PopupConsent` (a custom element `mxcwp-confirmation-dialog`, styles in `getStyles.ts`). It asks the user to confirm, so the window is opened from a user gesture.

### Message protocol typing

The request/response contract lives in three places that must stay in sync:
- `src/enums/windowProviderEnums.ts`: `WindowProviderRequestEnums` / `WindowProviderResponseEnums`
- `src/constants/windowProviderConstants.ts`: `responseTypeMap` (request → expected response)
- `src/types/windowProviderTypes.ts`: `ResponseTypeMap`, `RequestPayloadType`, `ReplyWithPostMessageObjectType` (payload shapes per message type)

To add a new message type, update all three. Responses use the shape `{ type, payload: { data?, error? } }`.

## Conventions

- Import sdk-core from deep paths (`@multiversx/sdk-core/out/core/transaction`, `.../address`, `.../message`, `.../interfaces`), not from the package root. This was changed on purpose in #95.
- Use `safeWindow` / `safeDocument` from `src/constants` instead of `window`/`document` directly, so the module can load outside a browser (SSR).
- Errors are custom classes in `src/errors.ts` (`Err*`); throw those, not generic `Error`.
- Prettier: single quotes, semicolons, 2 spaces, no trailing commas, 80 cols. ESLint uses flat config (`eslint.config.mjs`) and requires `curly: all` and alphabetized `import-x/order`.
- TypeScript is pinned to 6.x: `ts-jest` and `typescript-eslint` don't support TS 7 yet. `tsconfig.json` sets `rootDir` and `types` explicitly because TS 6 changed those defaults.
- Tests sit next to the code in `tests/` folders and mock `window.open` / `WindowManager.postMessage`; helpers are in `src/test-utils` (`getWalletWindowMock`, `createMockTransaction`).

## Workflow

- Work happens on `development`; PRs target `main`. Pushing to `main` publishes to npm (prerelease versions go out under the `next` tag), so bump `version` in `package.json` for releases.
- Every PR must update `CHANGELOG.md` (enforced by `changelog-enforcer`). Add entries under `## [Unreleased]` as links to the PR, following the existing format.
