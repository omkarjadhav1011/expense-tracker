# Telegram Bot → Expense Tracker Integration

> Implementation plan. Not yet built — this document is the spec to execute later.

## Context

Today the only way to record a transaction is the web UI. The goal is to log expenses (and income) from a Telegram chat and have them appear in the app immediately — same `transactions` table, same user, same dashboard numbers.

**Yes, this is buildable, and it needs no deployment.** The natural worry is that Telegram must reach your server, but that only applies to *webhook* mode. In **long-polling** mode the backend makes an outbound HTTPS call to `api.telegram.org` and waits for messages. All traffic is outbound, so a localhost-only backend works exactly as-is — no ngrok, no public URL, no `SecurityConfig` change to permit an unauthenticated webhook route.

Decisions locked in: **long polling**, **structured commands** (no LLM parsing), and a v1 covering **add expense, add income, read-back queries, and undo**.

### The one real design problem

`TransactionServiceImpl` gets the current user from `authUtil.getLoggedInUser()`, which reads `SecurityContextHolder`. That is request-thread bound and returns nothing on a background polling thread. Rather than fake a security context, we add user-explicit overloads to `TransactionService` and let the existing methods delegate to them. `ExpenseServiceImpl` already sets this precedent by taking a `userEmail` parameter (noted in CLAUDE.md), so this is consistent with the codebase rather than a new pattern.

### Two things that will *not* change, by design

- **Budgets still won't move.** Per CLAUDE.md, `BudgetServiceImpl` computes spend from the legacy `expenses` table, which nothing writes to. Telegram-created transactions are invisible to budgets in exactly the same way web-created ones are. That is a pre-existing issue with the two-model split, out of scope here.
- **No new Maven dependency.** The Telegram Bot API is plain JSON over HTTPS and we need only two of its methods. `java.net.http.HttpClient` (JDK 17) plus the Jackson `ObjectMapper` already on the classpath cover it. This deliberately avoids the `telegrambots` library, whose Spring Boot starter has historically pinned conflicting Spring versions.

---

## How it works end to end

**Linking** — the bot must know which app user a chat belongs to:

1. Logged into the web app, the user opens Profile → *Connect Telegram* → the frontend calls `POST /api/telegram/link-code`.
2. Backend creates a `TelegramLink` row for that user with a random 8-char code, valid 10 minutes. Response includes the code and the bot username, so the UI can render a `https://t.me/<botUsername>?start=<CODE>` deep link.
3. User taps the link. Telegram sends `/start ABC12345` to the bot. The poller matches the code, stamps `chatId` on the row, marks it linked, and clears the code.
4. From then on, every incoming `chatId` resolves to a `User`.

Unrecognised chats get one reply: *"This chat isn't linked. Open Profile → Connect Telegram in the app."* Nothing else is reachable without a link, which is what keeps a publicly-addressable bot safe.

**Polling loop** — on `ApplicationReadyEvent`, if a bot token is configured, one daemon thread loops: `getUpdates(offset, timeout=30)` → dispatch each message → `sendMessage` reply → advance offset. On startup it first calls `getUpdates(offset=-1, limit=1)` to learn the newest `update_id` and skip the backlog, so restarting doesn't replay yesterday's messages. Offset is held in memory; the startup skip makes persistence unnecessary. Network errors are logged and retried after a short backoff — the loop must never die.

---

## Commands (v1)

```
/start <CODE>            link this chat to your account
/help                    usage
/add 250 Food lunch      log an expense
250 Food lunch           same thing, no slash needed
/income 50000 Salary     log income
/today                   today's entries + total
/month                   month-to-date income / expense / net + top categories
/recent                  last 5 transactions
/undo                    delete the last transaction this bot created
/categories              list your categories
/unlink                  disconnect this chat
```

Grammar for add/income: `<amount> <category> [description...] [on YYYY-MM-DD | yesterday]`. Amount is parsed as `BigDecimal` and must be positive (matches the `@Positive` constraint on `TransactionRequest`). Date defaults to today. Anything unparseable gets a reply naming the problem plus a usage line — never a silent failure.

**Category resolution** is the subtle part. `CategoryRepository` has no name-based finder today, only `findByIdAndUser` and an `existsByUserAndNameAndType` boolean. We add a name lookup and resolve in three steps: exact case-insensitive match → unique case-insensitive prefix match (`foo` → `Food`) → otherwise reply listing the user's valid categories for that type. Note the type must be bridged: `TransactionType` and `CategoryType` are separate enums, so `CategoryType.valueOf(type.name())`.

---

## Backend changes

**New — `entity/TelegramLink.java`** (`telegram_links`). Uses Lombok like `User`/`Category`. Fields: `id`; `@ManyToOne(LAZY) User user`; `Long chatId` (unique, null until linked); `String linkCode` (unique, null once used); `LocalDateTime codeExpiresAt`; `boolean linked`; `Long lastTransactionId` (powers `/undo`); `@CreationTimestamp`/`@UpdateTimestamp`.

**New — `repository/TelegramLinkRepository.java`**: `findByChatId`, `findByLinkCode`, `findByUser`. All lookups stay user-scoped, per the manual-tenancy rule in CLAUDE.md.

**New — `telegram/` package** (bot runtime, deliberately outside the controller/service layering since none of it crosses an HTTP boundary):

- `TelegramProperties` — `@ConfigurationProperties(prefix = "telegram.bot")` for `token`, `username`, `enabled`.
- `TelegramApiClient` — `java.net.http.HttpClient` + `ObjectMapper`; `getUpdates(long offset)` and `sendMessage(long chatId, String text)`.
- `dto/TelegramUpdate`, `dto/TelegramMessage`, `dto/TelegramChat` — all `@JsonIgnoreProperties(ignoreUnknown = true)`; Telegram's payload is large and we read four fields.
- `TelegramLongPoller` — `@EventListener(ApplicationReadyEvent)` starts the thread; `@PreDestroy` shuts it down.
- `TelegramMessageParser` — pure, no Spring deps, returns a `ParsedCommand` record. This is where the unit tests go.
- `TelegramCommandRouter` — dispatch + reply formatting; the only class that knows about both parsing and services.

**New — REST surface for the web app** (follows existing conventions exactly): `controller/TelegramController.java` at `/api/telegram` with `POST /link-code`, `GET /status`, `DELETE /link`; `service/TelegramLinkService` + `service/impl/TelegramLinkServiceImpl` resolving the user via `AuthUtil` like every other service; `dto/response/TelegramLinkResponse`. **No `SecurityConfig` edit** — these are called by the authenticated SPA and `anyRequest().authenticated()` already covers them.

**Modified — `service/TransactionService.java` + `TransactionServiceImpl`**: add `addTransactionForUser(User, TransactionRequest)` and `deleteTransactionForUser(User, Long)`. Existing `addTransaction`/`deleteTransaction` become one-line delegations passing `authUtil.getLoggedInUser()`, so web behaviour is untouched and there is no duplicated mapping logic.

**Modified — `repository/CategoryRepository.java`**: add `Optional<Category> findByUserAndTypeAndNameIgnoreCase(User, CategoryType, String)`.

Read-only commands (`/today`, `/month`, `/recent`) call `TransactionRepository` directly from the router using the existing user-scoped finders `findByUserAndTransactionDateBetween` and `findByUserOrderByTransactionDateDesc`. `DashboardService` is `AuthUtil`-bound and its response shapes don't match Telegram's text output, so overloading it would add surface for no gain.

**Modified — config**: `application.yml` gains

```yaml
telegram:
  bot:
    enabled: ${TELEGRAM_BOT_ENABLED:true}
    token: ${TELEGRAM_BOT_TOKEN:}
    username: ${TELEGRAM_BOT_USERNAME:}
```

Blank token ⇒ poller logs one line and does not start. This matters: without it, every existing dev and the `contextLoads` test would break the moment this merges. Add `TELEGRAM_BOT_TOKEN` / `TELEGRAM_BOT_USERNAME` to `.env.example` and to the `backend.environment` block in `docker-compose.yml`.

Dev runs `ddl-auto: update`, so `telegram_links` is created automatically. Prod is `validate` with no Flyway — flag in the README that prod needs the table created by hand.

**New — `src/test/.../telegram/TelegramMessageParserTest.java`**: plain JUnit, no Spring context, so it runs without Postgres (unlike the existing `contextLoads` test). Covers `/add` with and without description, the bare `250 Food lunch` form, `on <date>` and `yesterday`, negative/zero/garbage amounts, and missing category.

## Frontend changes

- **New `src/api/telegramApi.js`** — `getStatus`, `createLinkCode`, `unlink` on the shared `axiosInstance`.
- **New `src/features/profile/TelegramConnect.jsx` + `.css`** — shows connected/not-connected state; on click, fetches a code and renders the `t.me` deep link plus the raw code with a countdown. Styled from `tokens.css` custom properties only (no raw hex), lucide-react icon, sibling-CSS convention.
- **Modified `src/features/profile/Profile.jsx`** — render the new section. Profile already waits on `user` from `useAppShell()`, so it fits the existing load sequence.

No `AppShellContext` change: linking state is Profile-local and doesn't belong in the shared fetch owner.

---

## Verification

**Setup (one time, manual):** message `@BotFather` on Telegram → `/newbot` → copy the token into `.env` as `TELEGRAM_BOT_TOKEN` and the handle as `TELEGRAM_BOT_USERNAME`.

**Important:** only one process may poll a given token. Running the IDE backend and the docker-compose backend simultaneously makes Telegram return HTTP 409. Stop one, or set `TELEGRAM_BOT_ENABLED=false` on it.

1. `cd backend && ./mvnw test -Dtest=TelegramMessageParserTest` — parser tests pass with no database.
2. `docker compose up -d` then `./mvnw spring-boot:run`; log shows `Telegram long poller started`.
3. `cd frontend && npm run dev`; log in, open Profile → Connect Telegram → a code and `t.me` link appear.
4. Tap the link. Bot replies with a linked confirmation naming your account.
5. Send `/add 250 Food lunch with team`. Bot confirms with amount, category and date.
6. **The real check:** reload the Dashboard. KPIs, the donut and Recent Transactions include the new entry — it came through the same `transactions` table, and the dashboard computes client-side from `GET /transactions`.
7. `/income 50000 Salary`, then `/today`, `/month`, `/recent` — totals match the web UI.
8. `/undo` → bot confirms deletion; the transaction disappears from the ledger on reload.
9. Error paths: `/add abc Food` → amount error; `/add 250 Nonsense` → reply lists valid categories; message the bot from a second, unlinked Telegram account → only the "not linked" reply, no data access.
10. Restart the backend and send nothing — confirm no replayed messages from before the restart (startup offset skip works).

## Follow-ups (not in this change)

- Swap polling for a webhook when the backend is deployed — `TelegramApiClient` and `TelegramCommandRouter` are reused as-is; only `TelegramLongPoller` is replaced by a controller, plus a `permitAll` entry with a secret-token header check.
- Natural-language parsing via the Claude API behind the structured parser, as a fallback.
