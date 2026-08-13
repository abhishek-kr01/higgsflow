# HiggsFlow

HiggsFlow is a full-stack AI creative platform inspired by modern AI image/video products. It combines reusable AI avatars, profile-image generation, and asynchronous text/image-to-video generation in a Turborepo monorepo.

> HiggsFlow is an independent portfolio/learning project and is not affiliated with Higgsfield.

## Stack

- **Monorepo:** Turborepo + Bun
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Express 5 + Bun + TypeScript
- **Database:** PostgreSQL + Prisma 7 + `@prisma/adapter-pg`
- **Image generation:** Google Gemini `gemini-3.1-flash-image`
- **Video generation:** OpenRouter Video API (default: `google/veo-3.1-lite`)
- **Auth:** JWT + bcryptjs
- **Client data fetching:** TanStack Query + Axios

## Monorepo

```text
higgsflow/
├── apps/
│   ├── backend/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── image.ts
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── video.ts
│   │   └── prisma/
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── lib/
│       │   └── pages/
│       ├── index.html
│       └── vite.config.ts
├── packages/
├── package.json
├── turbo.json
└── README.md
```

## Features

### Authentication

- Sign up
- Sign in
- JWT access token
- Password hashing
- Current-user endpoint
- Protected frontend routes

### Avatar workflow

1. User submits an image URL and avatar name.
2. HiggsFlow stores the original image as a `User` image.
3. Gemini generates a reusable cinematic profile image.
4. The generated image is stored in local `assets/` for development.
5. Avatar metadata is stored in PostgreSQL.

### Video workflow

1. User writes a prompt.
2. User optionally selects an avatar.
3. HiggsFlow submits the request to OpenRouter's asynchronous video endpoint.
4. The provider returns a job ID.
5. HiggsFlow stores the provider job ID in PostgreSQL.
6. The client polls the HiggsFlow video endpoint.
7. HiggsFlow polls OpenRouter and stores the completed video URL.

## Environment

Create `apps/backend/.env` from `apps/backend/.env.example`:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
PUBLIC_BACKEND_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
GOOGLE_API_KEY=your-google-ai-studio-key
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_VIDEO_MODEL=google/veo-3.1-lite
```

Create `apps/frontend/.env` from its example:

```env
VITE_BACKEND_URL=http://localhost:3000
```

## Local development

From the repository root:

```bash
bun install
bun --filter backend run db:generate
bun --filter backend run db:migrate
bun run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:3000`

## Database

Generate Prisma Client:

```bash
bun --filter backend run db:generate
```

Create/apply a migration:

```bash
bun --filter backend run db:migrate
```

Open Prisma Studio:

```bash
bun --filter backend run db:studio
```

## API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/health` | No | Health check |
| POST | `/api/v1/signup` | No | Create user |
| POST | `/api/v1/signin` | No | Sign in |
| GET | `/api/v1/me` | Yes | Current user |
| POST | `/api/v1/avatar` | Yes | Create avatar and generate profile image |
| GET | `/api/v1/avatars` | Yes | List avatars |
| GET | `/api/v1/avatar/:avatarId` | Yes | Get avatar |
| DELETE | `/api/v1/avatar/:avatarId` | Yes | Delete avatar |
| POST | `/api/v1/video` | Yes | Submit video job |
| GET | `/api/v1/video/:videoId` | Yes | Get/poll video job |
| GET | `/api/v1/videos` | Yes | List video jobs |
| GET | `/api/v1/models` | No | List OpenRouter video models |

## Important media-hosting note

Local generated avatar images are served from `http://localhost:3000/assets/...`. Third-party video providers cannot fetch localhost URLs. For production, move generated assets to public object storage (for example S3/R2) and store their public URLs in `AvatarImage.url`.

## Testing the backend manually

Health check:

```bash
curl http://localhost:3000/api/v1/health
```

Create a user:

```bash
curl -X POST http://localhost:3000/api/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"abhishek","password":"password123"}'
```

Then use the returned token as:

```text
Authorization: Bearer <token>
```

## Production considerations

- Use httpOnly secure cookies instead of localStorage JWT storage for a hardened web deployment.
- Add rate limiting and request logging.
- Add object storage for images/videos.
- Use a background worker/queue for long-running video jobs.
- Add webhooks from OpenRouter instead of client polling when the product grows.
- Add per-user quotas, billing, and audit logging.
- Never commit `.env` files or API keys.

## Git workflow

Suggested branches:

```text
main
├── feature/auth
├── feature/avatar-generation
├── feature/video-generation
└── feature/frontend-studio
```

Suggested commits:

```bash
git add .
git commit -m "feat: implement video generation workflow"
git push
```

## Disclaimer

HiggsFlow is a learning and portfolio project inspired by AI media products. Brand names, provider names, and example URLs belong to their respective owners.
