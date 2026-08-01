# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent modules in one repo, no build orchestration between them:

- `backend/` — Spring Boot 3.1.6, Java 17, Maven (wrapper committed), PostgreSQL, JWT auth
- `frontend/` — React + Vite 7, plain JavaScript (no TypeScript), Axios

The root `package.json` holds only stray dependencies and defines **no scripts** — never run `npm` from the repo root; always `cd frontend` first.

## Commands

Backend (from `backend/`):

```powershell
./mvnw spring-boot:run                       # start API on :8080 (profile `dev`)
./mvnw clean package                         # build jar
./mvnw test                                  # run tests
./mvnw test -Dtest=BackendApplicationTests   # single test class
./mvnw test -Dtest=SomeTest#someMethod       # single test method
```

On Windows use `mvnw.cmd` if `./mvnw` misbehaves under PowerShell.

Frontend (from `frontend/`):

```powershell
npm install
npm run dev      # Vite dev server (:5173)
npm run build
npm run lint     # ESLint flat config
```

There is no frontend test runner configured — `npm test` does not exist.

## Database

PostgreSQL. `application.yml` sets `spring.profiles.active: dev`, so `application-dev.yml` wins: database **`expensetracker_dev`** with `ddl-auto: update` (schema is auto-created from entities; there are no migrations and no `data.sql`). The base `application.yml` block pointing at `expensetracker` with `ddl-auto: validate` only applies if the profile is overridden.

**Credentials are not committed.** All three profiles read `${DB_URL}` / `${DB_USERNAME}` / `${DB_PASSWORD}`. Url and username have localhost defaults; **`DB_PASSWORD` has no default**, so the app fails fast with a clear placeholder error rather than a confusing auth failure if it is unset. Real values live in `.env` (gitignored) — see `.env.example`.

### Running the database

`docker compose up -d` (from the repo root) starts PostgreSQL 16 plus the backend, reading `.env`. Data persists in the `pgdata` named volume; `docker compose down -v` wipes it. Inside the compose network the backend reaches the DB at `db:5432`; the host port is `DB_HOST_PORT` (set to **5433** locally, because a native `postgresql-x64-18` Windows service holds 5432).

To run the backend from an IDE against the containerized DB, set these env vars in the run configuration:

```
DB_URL=jdbc:postgresql://localhost:5433/expensetracker_dev
DB_USERNAME=postgres
DB_PASSWORD=<value from .env>
```

## Backend architecture

Layering is `controller → service (interface) → service.impl → repository`, with `dto/request` and `dto/response` types crossing the controller boundary. Entities are mapped to DTOs inside the service impls (either a private `mapToResponse` or `util/MapperUtil`).

**Current-user resolution.** JWT subject is the user's **email**. `util/AuthUtil.getLoggedInUser()` reads `SecurityContextHolder` and loads the `User` — this is the single entry point, used by every service (Transaction, Category, Dashboard, Budget). No controller takes a user id as a parameter; if you find yourself adding one, use `AuthUtil` instead.

**Per-user data scoping is manual.** There is no row-level security or tenant filter. Every repository method is explicitly user-scoped (`findByIdAndUser`, `findByUserAnd…`, `findByUser_Id…`). Any new query must be scoped the same way or it will leak across users.

**Error handling.** Service code signals business errors with bare `RuntimeException("message")`. `GlobalExceptionHandler` maps *all* `RuntimeException` to **HTTP 400** with body `{"message": "..."}`, validation failures to 400 with an `errors` field map, missing/uncoercible request params and unreadable bodies to 400, and everything else to 500.

Two consequences worth knowing: genuine server bugs that throw a RuntimeException surface as 400s, and **not-found is 400, not 404** — there are no custom exception types, so the frontend cannot tell "deleted by someone else" from "validation failed". Every error body is built with `HashMap`, never `Map.of`, because `Map.of` rejects a null value and an exception with a null message would make the handler itself throw.

**JWT configuration is property-driven.** `security/JwtTokenProvider` injects `spring.security.jwt.secret` and `spring.security.jwt.expiration` (24 hours) via `@Value`. HS256 requires a secret of **at least 32 bytes** — a shorter override fails fast with `WeakKeyException`. Override in an environment with `JWT_SECRET` / `JWT_EXPIRATION_MS`.

`SecurityConfig` is stateless, CSRF-disabled, permits only `POST /api/auth/register`, `POST /api/auth/login`, and `/error`, and allows CORS from `http://localhost:*`. It installs an `authenticationEntryPoint` returning **401** and an `accessDeniedHandler` returning **403**, both with the same `{"message": "..."}` body the controllers use. Do not remove these: without them Spring falls back to `Http403ForbiddenEntryPoint`, an expired token answers 403, and the frontend's 401-triggered redirect to `/login` never fires.

**Registration side effect.** `AuthServiceImpl.registerUser` rejects an already-registered email, then creates the user and calls `CategoryService.createDefaultCategoriesForUser`, seeding the categories in `util/DefaultCategoryProvider`. Those get `isDefault = true` and `CategoryServiceImpl.deleteCategory` refuses to delete them.

### Transactions are the only money model

`Transaction` (table `transactions`, date field `transactionDate`, `TransactionType` of INCOME/EXPENSE) backs `TransactionController`, `DashboardController`, `BudgetServiceImpl`, and the whole frontend.

There used to be a parallel `Expense` entity (table `expenses`) with no controller, which `BudgetServiceImpl` read all spend from — so budgets always reported zero. That stack was deleted and the `expenses` table dropped. If you find a stray reference to `ExpenseService` / `ExpenseRepository`, it is dead.

### Budget module specifics

- `Budget.month` is a `String` in `"YYYY-MM"` form, parsed with `YearMonth.parse` into a first-day/last-day range.
- `Budget.category` is a **category name String**, not a FK to `Category`. `category == null` means the overall monthly budget; non-null means a per-category budget. Consequence: renaming a category would orphan its budget — but there is no `PUT /categories/{id}`, so this is latent rather than live.
- `Budget.userId` is a raw `Long`, not a `@ManyToOne User` — unlike every other entity.
- Spend is **always recomputed** from the transaction ledger via `TransactionRepository.getCategoryWiseBreakdown`; there is no denormalized `usedAmount` cache. The DB column `used_amount` still exists but is unmapped and unused.
- Category names are matched **case-insensitively**, both when joining spend to caps (a `TreeMap` with `String.CASE_INSENSITIVE_ORDER`) and when upserting. Keep the two consistent.
- `POST /api/budgets` **upserts** on (user, month, category) — the request DTO deliberately carries no `id` and no `userId`, so a client cannot target another user's row. The unique constraint `uk_budget_user_month_category` does not cover overall caps, since PostgreSQL treats NULLs as distinct; the service-level upsert is the real guard.

### Entity style is inconsistent

`User`, `Category`, `Budget` use Lombok (`@Getter/@Setter/@Builder`); `Transaction` has hand-written accessors and no builder. Match whichever entity you're editing rather than normalizing opportunistically.

## Frontend architecture

- **Feature-first**: `src/features/<feature>/<Component>.jsx` (auth, budget, dashboard, expense, profile). Shared UI lives in `src/components/<Name>/<Name>.jsx` and must be re-exported from `src/components/index.js`.
- **Styling is per-component plain CSS**: each `.jsx` has a sibling `.css` it imports. Tailwind v4 is installed and `index.css` carries `@tailwind` directives, but the codebase does not use utility classes — follow the CSS-file convention.
- **API layer**: one module per domain in `src/api/*Api.js`, all calling the shared `axiosInstance`. Its `baseURL` is hardcoded to `http://localhost:8080/api` (no env var / Vite proxy), so a backend port change means editing that file.
- **Auth state is just `localStorage['token']`**. The request interceptor attaches `Bearer` from it; the response interceptor clears it and does a hard `window.location.href = '/login'` on a 401 — unless the current path is already `/login`, which would otherwise reload in a loop. `ProtectedRoute` decodes the payload segment and treats a past `exp` as logged-out, so an expired session bounces before rendering rather than after the first failed request. That decode is a UX guard only; the backend still validates every token.
- **Routes** are declared inline in `App.jsx`; `/` renders Login.

### Design system

The UI implements the NonStop design system imported from the Claude Design project *Expense Tracker UI redesign*. `src/styles/tokens.css` is a **verbatim copy** of that project's `colors_and_type.css` — treat it as generated, and re-import rather than hand-edit it. Every component styles itself from those custom properties (`--green-500`, `--fg-muted`, `--radius-lg`, `--shadow-brand`, …); do not introduce raw hex values. `index.css` pulls in the Manrope/JetBrains Mono webfonts, the tokens, the base reset and the shared `ns-*` keyframes.

Icons come from `lucide-react`. `src/lib/categoryVisuals.js` maps a category *name* to an icon and to a colour from the brand ramp, so the same category keeps its swatch in the donut, the ledger and the budget bars.

### App shell

Authenticated screens render inside `components/AppLayout` via a nested `<Route element={<AppLayout />}>`. AppLayout is the **single fetch owner** for the current user, the full transaction list and the category list, and publishes them (plus `refresh()` and `openDrawer()`) through `app/AppShellContext`. Screens call `useAppShell()` instead of fetching those themselves — a screen that re-fetches transactions independently will drift from the sidebar counts.

Creating and editing a transaction both happen in `components/TransactionDrawer`, opened from anywhere via `openDrawer(transaction?)`. The old `/add-transaction`, `/edit-transaction/:id` and `/add-category` pages are gone; those paths now redirect.

### Where numbers come from

Dashboard KPIs, the donut and the range filter are all computed client-side from the single `GET /transactions` list, so switching range does not refetch. Only the trend chart hits the server (`/dashboard/monthly-trend`).

The Budgets screen reads caps from `/budgets` but computes *spend* client-side from the shared transaction ledger rather than calling `/budgets/summary` or `/budgets/categories-summary`. Those endpoints now return the same numbers — they derive spend from the same `getCategoryWiseBreakdown` query — so either source is correct; the ledger is already in context, so deriving locally saves a round-trip and keeps the bars in step with the dashboard.

### Known frontend/backend contract gaps

- `categoryApi.getAllCategories` fans out to two `?type=`-scoped calls and merges, because `GET /categories` requires the `type` request param.
- There is no `PUT /categories/{id}` and no `GET /transactions/summary`; the corresponding api helpers were removed rather than left as dead calls.
- `dashboardApi.getSummary`, `getCategoryBreakdown`, `getRecentTransactions`, `transactionApi.getTransactionById` and `budgetApi.getAllBudgets` are exported but unused — the dashboard derives those numbers client-side and only `getMonthlyTrend` hits the server.

Check the controller before assuming an `api/` helper works.

## Git workflow

Work lands via `feature/*` → `develop` → `main` pull requests (see the `feature/phase-5-budget-module`, `feature/dashboard-analytics`, etc. remote branches). Development is organized in numbered "phases" reflected in commit messages.
