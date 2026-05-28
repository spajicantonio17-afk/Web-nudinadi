# E2E Tests (Playwright)

End-to-end tests that drive the real Next.js dev server against a local Supabase stack.

## What this covers

| Spec | Flow |
|---|---|
| `01-smoke.spec.ts` | Public pages load without 5xx or console errors |
| `02-auth.spec.ts` | Login, validation, password reset email, register |
| `03-search-filter.spec.ts` | Home page text search, category filter, filters modal, reset |
| `04-product-detail.spec.ts` | Seeded product page, send-message button, back, add-to-cart |
| `05-upload.spec.ts` | Logged-in upload flow (AI moderation mocked) |
| `06-favorites.spec.ts` | Toggle favorite, list view |
| `07-messages.spec.ts` | Two-user chat (Bob → Alice realtime) |
| `08-profile.spec.ts` | Profile, my-listings, logout |

## Prerequisites

- **Docker Desktop** running
- **Supabase CLI** in PATH (`supabase --version` works)
- **Node 18+** with `npm install` already done

## First-time setup

```powershell
# 1. Start the local Supabase stack (downloads ~1.5 GB on first run)
npm run db:start

# 2. Apply migrations + seed.sql
npm run db:reset

# 3. Install Playwright browsers (only needed once)
npx playwright install chromium
```

After `db:start`, take note of the output — it prints the local `anon key`. Save it to your shell or export when running tests:

```powershell
$env:E2E_SUPABASE_ANON_KEY = "eyJhbGciOi..."   # from `supabase status` output
```

## Running the tests

```powershell
# Run everything
npm run test:e2e

# Headed (watch the browser do its thing)
npm run test:e2e:headed

# Interactive UI with trace viewer
npm run test:e2e:ui

# After a run, open the HTML report
npm run test:e2e:report
```

Playwright will auto-start `next dev` on port 3000 if it's not already running.

## Test users (seeded by `supabase/seed.sql`)

| Role | Email | Password |
|---|---|---|
| Alice (seller) | `e2e-alice@nudinadi.test` | `Passw0rd!Alice` |
| Bob (buyer) | `e2e-bob@nudinadi.test` | `Passw0rd!Bob` |

Also seeded: one product `cccccccc-cccc-cccc-cccc-cccccccccccc` owned by Alice.

## Troubleshooting

**`supabase start` hangs on first run** — it's pulling ~1.5 GB of Docker images. Be patient. Subsequent starts are instant.

**Tests fail with `connect ECONNREFUSED 127.0.0.1:54321`** — Supabase stack isn't running. Run `npm run db:status` to verify. If down, `npm run db:start`.

**Tests fail because dev server didn't pick up the local DB** — check that `NEXT_PUBLIC_SUPABASE_URL` resolves to `http://127.0.0.1:54321`. The `playwright.config.ts` sets this via the `webServer.env` block, but if you start `npm run dev` separately it'll use whatever `.env.local` says (likely your prod Supabase).

**A test is skipped** — many tests skip themselves if a UI element isn't reachable (Pos. selector strategy is defensive). Open the trace (`npm run test:e2e:report`) to see why, then tighten the selector.

**State leaks between runs** — run `npm run db:reset` to re-apply migrations + seed. This is destructive; it wipes the local DB.

**Realtime test (messages) fails intermittently** — Realtime needs ~2-3 s to deliver. If still flaky, increase the `waitForTimeout` in `07-messages.spec.ts`.

## Adding new tests

1. Create `e2e/NN-name.spec.ts` (number prefix orders execution)
2. Import from `./fixtures/auth` if you need a logged-in user, or `./fixtures/i18n` for the `t()` helper
3. Prefer `getByRole` + `getByText(t('key'))` over CSS selectors
4. Never modify protected files (see `CLAUDE.md`) — escalate to user if a selector is unreachable
