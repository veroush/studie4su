# Auth & database migration notes — read before merging

## Heads up: schema.prisma collision on `main`

`main` already had a `prisma/schema.prisma` committed with the old JWT shape
(`User.id: Int`, a `password` column, `PasswordResetToken`) — looks like it
was written to match the ported Express→Hono routes. This PR replaces it
with a Better Auth-compatible version (`User.id: String`, credentials in a
separate `Account` table, no `password` column on `User`).

**This is safe** — there's no `prisma/migrations` folder anywhere in the repo
and the committed `src/generated/prisma` client still only reflects the
original CLI placeholder (`Todo`). Nothing has actually been generated or
migrated against the old schema yet. But it was a deliberate commit by a
teammate, not dead scaffolding, so give them a heads-up before merging this
rather than letting them discover it via a conflict.

## Missing auth route

The dedicated `/api/auth/$.ts` TanStack route (which called
`auth.handler(request)` directly) has been replaced at some point by a
single catch-all `src/routes/api/$.ts` that forwards everything to the Hono
`app`. That means Better Auth currently has **no live endpoint** anywhere —
`app.ts` never calls `auth.handler`. Add this near the top of `app.ts`,
before the other routes:

```ts
import { auth } from "#/lib/auth";

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
```

## The JWT vs. Better Auth conflict

`src/server/routes/auth.ts` and `src/server/middleware/auth.ts` are a
working port of the **old JWT/bcrypt system**: `User.password`, integer
`user.id`, `jsonwebtoken`, bearer tokens, `PasswordResetToken`. That doesn't
match the new schema. I didn't touch those files — they're not mine to
rewrite unilaterally — but here's exactly what breaks and the fix direction:

| File | What breaks | Fix direction |
|---|---|---|
| `src/server/routes/auth.ts` | `db.user.create({ data: { password } })`, `PasswordResetToken` model gone | Delete this file's logic — Better Auth's `/api/auth/sign-up`, `/sign-in`, `/forget-password`, `/reset-password` endpoints replace it. The reset-email HTML template is worth keeping — wire it into `sendResetPassword` in `src/lib/auth.ts` (already has a `// TODO` marking where). |
| `src/server/middleware/auth.ts` | Verifies a JWT that no longer exists | Use `src/server/middleware/session.ts` instead (new file, added here) — same exported names (`requireAuth`, `optionalAuth`, `adminOnly`), so `app.ts` only needs a one-line import swap. |
| `src/server/routes/favorites.ts` | `getUserFromToken` verifies a JWT bearer token; `userId: string \| number` types | Replace `getUserFromToken` with `c.get("user")` from `attachSession`; userId is now always a `string`. |
| `src/server/routes/open-houses.ts` | `Variables = { userId?: number }`, `c.get("userId")` | Same swap — use the session middleware's `user` context instead of a raw JWT-decoded number. |
| `src/server/routes/admin.ts` | `db.user.update({ where: { id: Number.parseInt(...) } })` | Drop the `Number.parseInt` — `id` is a string now. |

To switch over, once the team's ready:

```diff
- import { adminOnly, optionalAuth, requireAuth } from "./middleware/auth";
+ import { adminOnly, optionalAuth, requireAuth } from "./middleware/session";
```

and add `app.use("*", attachSession)` near the top of `app.ts`, before any
route reads `c.get("user")`.

## Known pre-existing gap (not new, just flagging)

`Question`/`AnswerOption` (read by the live quiz in `quiz.ts`) and
`QuizQuestion`/`QuizAnswer` (managed by the admin panel in `admin.ts`) are two
separate, disconnected tables — already true in the v1 MySQL schema. Kept
both as-is since `admin.ts` is built against `QuizQuestion`/`QuizAnswer`.
Worth a team decision on which is canonical before the admin quiz-builder
and the live quiz are expected to affect each other.

## Setup (once you pull this)

```bash
cp .env.example .env.local   # fill in DATABASE_URL / BETTER_AUTH_SECRET
docker compose up -d         # local Postgres
pnpm db:migrate               # creates the migration + applies it
pnpm db:seed                  # loads schools/programs/quiz questions/open houses
pnpm db:studio                # optional — inspect the data in the browser
```
