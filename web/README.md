# web/README.md

# Studie4SU — Web Application

Studie4SU is a web platform for students in Suriname to discover schools, compare study programs, take a study-choice quiz, browse and register for open house events, and save favorites. This package contains the full-stack application: a TanStack Start (React) frontend, a Hono API backend, and a Prisma/PostgreSQL database, along with an admin dashboard for managing platform content.

## Tech Stack

**Frontend**
- [TanStack Start](https://tanstack.com/start) (React, file-based routing via TanStack Router)
- [TanStack Query](https://tanstack.com/query) for data fetching
- React 19
- Tailwind CSS
- Recharts (admin statistics charts)
- Lucide React (icons)

**Backend**
- [Hono](https://hono.dev/) API, mounted inside the TanStack Start server routes
- [Prisma ORM](https://www.prisma.io/) with the PostgreSQL driver adapter (`@prisma/adapter-pg`)
- PostgreSQL (hosted on Railway)
- [Better Auth](https://www.better-auth.com/) for authentication (email/password, sessions, password reset)
- Nodemailer for transactional (password reset) emails

**Tooling**
- Vite
- Biome (linting and formatting)
- Vitest (testing)
- Wrangler / Cloudflare Vite plugin (available for Cloudflare Workers deployment, not used in the Railway deployment)
- pnpm (package manager)

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [pnpm](https://pnpm.io/)
- A PostgreSQL database (locally via Docker, or a hosted instance such as [Railway](https://railway.app/))
- (Optional, for local DB) [Docker](https://www.docker.com/) and Docker Compose

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-org>/studie4su.git
cd studie4su/web
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example environment file and fill in real values:

```bash
cp .env.example .env.local
```

At minimum, set:

```env
# PostgreSQL connection string (local Docker service or Railway database URL)
DATABASE_URL="postgresql://studie4su:studie4su@localhost:5432/studie4su?schema=public"

# Better Auth
BETTER_AUTH_SECRET="replace-with-a-long-random-string"
WEB_URL="http://localhost:3000"
```

You can generate a secure `BETTER_AUTH_SECRET` with:

```bash
pnpm dlx @better-auth/cli secret
```

If you need email delivery for password resets, also configure SMTP variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).

### 4. Start a local database (optional)

If you don't already have a PostgreSQL instance (e.g. on Railway) to point `DATABASE_URL` at, you can spin one up locally with Docker:

```bash
docker compose up -d
```

### 5. Set up the database schema and seed data

```bash
pnpm db:generate   # generate the Prisma client
pnpm db:migrate     # create and apply migrations
pnpm db:seed        # seed schools, programs, quiz questions, and open houses
```

You can inspect the database at any time with:

```bash
pnpm db:studio
```

## Usage

### Running in development

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Building for production

```bash
pnpm build
```

### Running the production build

```bash
pnpm start
```

### Linting and formatting

```bash
pnpm lint
pnpm format
pnpm check
```

### Running tests

```bash
pnpm test
```

### Key application routes

- `/` — home page
- `/schools` — school directory
- `/schools/$schoolId` — school detail page with programs and open houses
- `/programs/$programId` — study program detail page
- `/program-compare` — side-by-side program comparison
- `/quiz` — interactive study-choice quiz with recommendations
- `/open-houses` — open house listings and registration
- `/favorites` — saved schools, programs, and open houses
- `/about` — about page (content editable from admin settings)
- `/login`, `/forgot-password`, `/reset-password` — authentication flow
- `/settings` — user account settings

### Admin dashboard

Accessible under `/admin` (requires an authenticated user with the `admin` role):

- `/admin/dashboard` — overview and quick stats
- `/admin/schools` — manage schools
- `/admin/programs` — manage study programs
- `/admin/quiz` — manage quiz questions and answers
- `/admin/openhouses` — manage open house events
- `/admin/users` — manage user roles
- `/admin/settings` — platform and About page content settings
- `/admin/statistics` — quiz submission and engagement statistics

### Deployment

This application's database and web app are both deployed on [Railway](https://railway.app/). Set the environment variables listed above (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `WEB_URL`, and SMTP settings if needed) in your Railway project, then use `pnpm build` and `pnpm start` as the build/start commands.