# Root README.md

# Studie4SU

Studie4SU is a web platform that helps students in Suriname explore higher-education options. It lets users browse schools and study programs, compare programs side by side, take a study-choice quiz that recommends programs based on their interests, view and register for open house events, save favorites, and manage their account — all backed by an admin panel for managing schools, programs, quiz content, open houses, users, and platform settings.

## Description

Choosing the right school or field of study in Suriname can be confusing, with information scattered across many different sources. Studie4SU brings this information together in one place: students can search and compare schools and programs, discover upcoming open houses, and take an interactive quiz that matches their interests and academic background to relevant study programs. Administrators can manage all platform content — schools, programs, quiz questions, open houses, users, and site settings — through a dedicated admin dashboard, and can review platform usage statistics.

The project is organized as a monorepo with two main workspaces:

- **`web/`** — the main application: a TanStack Start (React) frontend with a Hono API backend, Prisma ORM, and PostgreSQL database. This is where all the core functionality (schools, programs, quiz, open houses, favorites, auth, admin panel) lives. See [`web/README.md`](./web/README.md) for detailed setup and usage instructions.
- **`docs/`** — a documentation site built with Astro Starlight, containing project overview docs, API references, database schema notes, setup guides, and QA/testing guidelines.

## Components

- **Frontend (Web App)** — TanStack Start UI with React and Tailwind CSS, providing the public-facing pages (home, schools, programs, quiz, open houses, favorites, about, auth) and the admin dashboard (schools, programs, quiz questions, open houses, users, settings, statistics).
- **Backend API** — A Hono-based API layer mounted inside the TanStack Start app, handling schools, programs, quiz logic and recommendations, open houses, favorites, authentication, and admin CRUD/reporting endpoints.
- **Database** — PostgreSQL, accessed via Prisma ORM, storing schools, study programs, quiz questions/answers, quiz results, open houses, users, favorites, and admin settings. Hosted on Railway.
- **Authentication** — Better Auth handles user registration, login, password reset, and session management.
- **Documentation Site** — An Astro Starlight site (in `docs/`) containing guides, API documentation, database schema notes, and QA/testing procedures for the project.

## Deployment

The application's database is hosted on Railway, and the web application itself is deployed to Railway as well.