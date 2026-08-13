# HiggsFlow Backend

Express + Bun + Prisma + PostgreSQL backend for HiggsFlow.

## Features

- JWT authentication with bcrypt password hashing
- Avatar creation and AI profile image generation with Gemini
- Avatar listing, detail and deletion
- Asynchronous video generation through OpenRouter
- Video job persistence and provider-status polling
- Video history
- Public static asset serving for local development
- Zod validation

## Setup

```bash
bun install
cp .env.example .env
bun run db:generate
bun run db:migrate
bun run dev
```

The API runs at `http://localhost:3000`.

## Environment

See `.env.example` for all required values.

## Prisma migration

The repository contains an initial schema migration plus a follow-up migration for auth/video metadata. If you already have the old development database, run:

```bash
bun run db:migrate
```

If the database is disposable:

```bash
bunx prisma migrate reset
```

`PUBLIC_BACKEND_URL` must be reachable by third-party video providers when you use generated local media as a reference. For production, use object storage and store public URLs in `AvatarImage.url`.
