# FairDev MVP

FairDev is a monorepo SaaS application that evaluates whether a software salary offer is fair using:
- Public GitHub profile signals
- Resume parsing (PDF upload)
- Portfolio website ingestion (project/demo link extraction + tech signal extraction)
- LLM-driven code evaluation
- Seeded US salary market benchmarks

## Monorepo Structure

- `apps/web`: Next.js App Router frontend
- `apps/api`: Express + Prisma + pg-boss backend API and worker
- `packages/shared`: Shared Zod schemas and TypeScript types

## Implemented API Endpoints

- `POST /auth/magic-link/request`
- `POST /auth/magic-link/verify`
- `POST /upload-resume`
- `POST /analyze`
- `GET /results/:id`
- `GET /results/:id/report.pdf`
- `GET /analyses`

## Local Setup

### 1) Install dependencies

```bash
cd fairdev
npm install
```

### 2) Configure environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 3) Database

Point `apps/api/.env` to Postgres, then run:

```bash
npm run prisma:generate --workspace @fairdev/api
npm run prisma:push --workspace @fairdev/api
npm run prisma:seed --workspace @fairdev/api
```

### 4) Run everything

```bash
npm run dev
```

Services:
- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## Auth Flow (MVP)

- Request magic link on `/login`
- In development, API returns `devToken` for quick login
- Verify token to receive JWT and access dashboard

## Salary Dataset

Salary ranges are seeded into `salary_data` using deterministic multipliers by:
- `location_tier`
- `company_type`
- `skill_level`
- `years_exp_bucket`

A sample extract is in `apps/api/src/data/salary-data.sample.json`.

## Test Commands

```bash
npm run test
npm run typecheck
```

## Deployment Targets

- Web: Vercel
- API + Worker: Railway
- Database: Neon Postgres

## Notes

- GitHub analysis currently uses top 3 public repositories by stars.
- `portfolioUrl` can be provided in `/analyze` when no resume PDF is available.
- Portfolio pages are parsed for summary text, tech keywords, project links, and embedded external project sites.
- `LLM_PROVIDER` supports `gemini`, `openai`, or `auto`. Gemini is configured by default in `.env.example`.
- If no valid LLM key is configured, the system uses deterministic fallback scoring.
- Resume PDF bytes are parsed in-memory and not persisted.
