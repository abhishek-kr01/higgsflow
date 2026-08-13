# HiggsFlow

HiggsFlow is a full-stack AI media platform for generating reusable AI avatars, cinematic profile images, and asynchronous AI videos from text and image references.

It is built as a Turborepo monorepo with a React/Vite frontend and a Bun/Express backend, using PostgreSQL and Prisma for persistence and external AI providers for image and video generation.

> **HiggsFlow is an independent learning and portfolio project. It is not affiliated with Higgsfield or any other AI media company.**

---

## Features

### Authentication

* User signup
* User signin
* JWT-based authentication
* Password hashing with bcryptjs
* Current-user endpoint
* Protected backend routes
* Protected frontend routes
* Persistent authentication on page reload

### AI Avatar Generation

* Create reusable avatars from an image URL
* Store the original user image
* Generate a cinematic profile image using Google Gemini
* Store generated avatar metadata
* List user avatars
* Fetch individual avatars
* Delete avatars

### AI Video Generation

* Generate videos from text prompts
* Optionally use an AI avatar as a reference image
* Configure duration
* Configure resolution
* Configure aspect ratio
* Enable or disable generated audio
* Submit asynchronous video jobs
* Store provider job IDs
* Poll video generation status
* Persist generated video URLs
* Display previous video generations

### Frontend

* React 19
* Vite
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Router
* TanStack Query
* Axios
* Responsive dashboard UI
* Avatar library
* Video generation studio
* Video history

---

## Tech Stack

| Layer              | Technology                   |
| ------------------ | ---------------------------- |
| Monorepo           | Turborepo + Bun              |
| Frontend           | React 19 + Vite + TypeScript |
| Styling            | Tailwind CSS + shadcn/ui     |
| Routing            | React Router                 |
| Server State       | TanStack Query               |
| HTTP Client        | Axios                        |
| Backend            | Express 5 + Bun + TypeScript |
| Validation         | Zod                          |
| Authentication     | JWT + bcryptjs               |
| Database           | PostgreSQL                   |
| ORM                | Prisma 7                     |
| PostgreSQL Adapter | `@prisma/adapter-pg`         |
| Image Generation   | Google Gemini                |
| Video Generation   | OpenRouter Video API         |

---

## Architecture

```text
                         ┌──────────────────────┐
                         │      React App       │
                         │ React + Vite         │
                         │ Tailwind + shadcn    │
                         └──────────┬───────────┘
                                    │
                              HTTP / JSON
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Express API       │
                         │    Bun Runtime       │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
             ┌────────────┐  ┌────────────┐  ┌──────────────┐
             │ PostgreSQL │  │   Gemini   │  │  OpenRouter  │
             │   Prisma   │  │   Image    │  │    Video     │
             └────────────┘  └────────────┘  └──────────────┘
```

The frontend communicates only with the HiggsFlow backend.

AI provider API keys are never exposed to the browser.

---

## Monorepo Structure

```text
higgsflow/
│
├── apps/
│   │
│   ├── backend/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── image.ts
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── video.ts
│   │   ├── assets/
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   └── schema.prisma
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── lib/
│       │   ├── pages/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── public/
│       ├── index.html
│       ├── vite.config.ts
│       ├── .env.example
│       └── package.json
│
├── packages/
├── package.json
├── turbo.json
├── bun.lockb
└── README.md
```

---

## Backend Responsibilities

### `index.ts`

Main HTTP application.

It contains:

* Express application setup
* middleware configuration
* route definitions
* request/response orchestration
* avatar endpoints
* video endpoints
* authentication endpoints

### `auth.ts`

Authentication utilities.

Responsibilities include:

* password hashing
* password verification
* JWT generation
* JWT verification
* authentication middleware

### `db.ts`

Database initialization.

Responsibilities:

* create PostgreSQL adapter
* initialize Prisma Client
* expose the shared Prisma instance

### `types.ts`

Runtime request validation using Zod.

This protects the API from malformed input before business logic executes.

### `image.ts`

Gemini image generation layer.

Responsibilities:

1. Download the source image
2. Convert the image to Base64
3. Build Gemini input
4. Request image generation
5. Extract generated image data
6. Save the generated image

### `video.ts`

Video provider integration layer.

Responsibilities:

1. Build provider request
2. Submit an asynchronous generation job
3. Fetch provider job status
4. Normalize provider responses for the application

Keeping provider logic separate makes it easier to replace or add video providers later.

---

## Database Design

The application uses PostgreSQL with Prisma.

### User

Represents an authenticated account.

```text
User
 ├── Avatar[]
 └── AvatarVideo[]
```

### Avatar

Represents a reusable AI avatar owned by a user.

```text
Avatar
 └── AvatarImage[]
```

### AvatarImage

Stores avatar image metadata.

Images are classified as:

* `User` — original user-provided image
* `Model` — AI-generated profile image

### AvatarVideo

Represents an asynchronous video generation job.

It stores:

* prompt
* generation settings
* status
* provider job ID
* output URL
* error information
* timestamps

### Video Status

```text
Pending
   ↓
Processing
   ↓
Done
```

or:

```text
Pending
   ↓
Processing
   ↓
Error
```

This state model is required because AI video generation is asynchronous.

---

## Authentication Flow

### Signup

```text
Frontend
   ↓
POST /api/v1/signup
   ↓
Zod validation
   ↓
Check username
   ↓
Hash password
   ↓
Create PostgreSQL record
   ↓
Create JWT
   ↓
Return token
```

### Signin

```text
Frontend
   ↓
POST /api/v1/signin
   ↓
Validate credentials
   ↓
Find user
   ↓
Compare password hash
   ↓
Create JWT
   ↓
Return token
```

### Protected Request

```text
Frontend
   ↓
Authorization: Bearer <token>
   ↓
JWT middleware
   ↓
Verify token
   ↓
Extract user ID
   ↓
Execute protected handler
```

---

## Avatar Generation Flow

```text
User selects image URL
        ↓
POST /api/v1/avatar
        ↓
Authenticate user
        ↓
Validate request
        ↓
Create Avatar record
        ↓
Store original image metadata
        ↓
Download image
        ↓
Convert image to Base64
        ↓
Send image + prompt to Gemini
        ↓
Receive generated image
        ↓
Save generated image
        ↓
Store generated image metadata
        ↓
Return avatar
```

---

## Video Generation Flow

Video generation is asynchronous.

```text
User enters prompt
        ↓
Select avatar
        ↓
POST /api/v1/video
        ↓
Create Pending video job
        ↓
Submit request to OpenRouter
        ↓
Receive provider job ID
        ↓
Store provider job ID
        ↓
Mark job as Processing
        ↓
Frontend polls /api/v1/video/:videoId
        ↓
Backend checks provider
        ↓
Provider finishes generation
        ↓
Store output URL
        ↓
Mark job as Done
        ↓
Frontend displays video
```

If the provider fails:

```text
Processing
    ↓
Error
```

and the error message is stored with the video job.

---

## Environment Variables

### Backend

Create:

```text
apps/backend/.env
```

using:

```text
apps/backend/.env.example
```

Example:

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

### Frontend

Create:

```text
apps/frontend/.env
```

using:

```text
apps/frontend/.env.example
```

Example:

```env
VITE_BACKEND_URL=http://localhost:3000
```

### Important

Never commit:

```text
.env
.env.local
.env.production.local
```

Never expose:

```text
GOOGLE_API_KEY
OPENROUTER_API_KEY
DATABASE_URL
JWT_SECRET
```

to the frontend.

---

## Local Development

### Requirements

Install:

* Bun
* PostgreSQL
* Git

You also need API access for:

* Google Gemini
* OpenRouter

---

### Install dependencies

From the repository root:

```bash
bun install
```

---

### Generate Prisma Client

```bash
bun --filter backend run db:generate
```

---

### Run database migrations

```bash
bun --filter backend run db:migrate
```

---

### Start the complete project

From the repository root:

```bash
bun run dev
```

This starts the Turborepo development tasks.

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3000
```

---

## Database Commands

Generate Prisma Client:

```bash
bun --filter backend run db:generate
```

Create and apply a development migration:

```bash
bun --filter backend run db:migrate
```

Open Prisma Studio:

```bash
bun --filter backend run db:studio
```

---

## API Reference

### Health

| Method | Endpoint         | Auth | Description      |
| ------ | ---------------- | ---- | ---------------- |
| GET    | `/api/v1/health` | No   | API health check |

### Authentication

| Method | Endpoint         | Auth | Description      |
| ------ | ---------------- | ---- | ---------------- |
| POST   | `/api/v1/signup` | No   | Create account   |
| POST   | `/api/v1/signin` | No   | Sign in          |
| GET    | `/api/v1/me`     | Yes  | Get current user |

### Avatars

| Method | Endpoint                   | Auth | Description                              |
| ------ | -------------------------- | ---- | ---------------------------------------- |
| POST   | `/api/v1/avatar`           | Yes  | Create avatar and generate profile image |
| GET    | `/api/v1/avatars`          | Yes  | List user's avatars                      |
| GET    | `/api/v1/avatar/:avatarId` | Yes  | Get one avatar                           |
| DELETE | `/api/v1/avatar/:avatarId` | Yes  | Delete an avatar                         |

### Videos

| Method | Endpoint                 | Auth | Description                   |
| ------ | ------------------------ | ---- | ----------------------------- |
| POST   | `/api/v1/video`          | Yes  | Submit video generation job   |
| GET    | `/api/v1/video/:videoId` | Yes  | Get/poll video generation job |
| GET    | `/api/v1/videos`         | Yes  | List user's video jobs        |
| GET    | `/api/v1/models`         | No   | List supported video models   |

---

## Manual API Testing

These commands are useful for verifying the backend before testing the frontend.

### 1. Health Check

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{
  "status": "ok"
}
```

### 2. Signup

```bash
curl -X POST http://localhost:3000/api/v1/signup \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"abhishek\",\"password\":\"password123\"}"
```

The response contains an authentication token.

### 3. Signin

```bash
curl -X POST http://localhost:3000/api/v1/signin \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"abhishek\",\"password\":\"password123\"}"
```

Copy the returned token.

### 4. Current User

Use:

```text
Authorization: Bearer <token>
```

Example:

```bash
curl http://localhost:3000/api/v1/me \
  -H "Authorization: Bearer <token>"
```

### 5. List Avatars

```bash
curl http://localhost:3000/api/v1/avatars \
  -H "Authorization: Bearer <token>"
```

### 6. List Video Jobs

```bash
curl http://localhost:3000/api/v1/videos \
  -H "Authorization: Bearer <token>"
```

### Why keep manual testing?

The manual API section is useful because it allows you to verify:

* backend availability
* authentication
* JWT middleware
* database connection
* API responses

without depending on the frontend.

---

## Media Storage

During development, generated avatar images are stored locally under:

```text
apps/backend/assets/
```

and exposed through:

```text
/assets/...
```

This is suitable for local development only.

### Production architecture

Use persistent object storage such as:

* Amazon S3
* Cloudflare R2
* Supabase Storage
* Cloudinary

Recommended flow:

```text
Gemini
  ↓
Generated image
  ↓
Object storage
  ↓
Public/private asset URL
  ↓
PostgreSQL
```

The same principle should be used for generated videos.

---

## Important Video Provider Limitation

External video providers cannot access:

```text
http://localhost:3000/...
```

because `localhost` is only available on your own machine.

Therefore, avatar reference images used by external providers must eventually be hosted at a publicly accessible URL.

Development:

```text
localhost
```

Production:

```text
https://cdn.example.com/avatar.png
```

---

## Security Considerations

The current project is designed for learning and portfolio use.

For a production deployment, consider:

* httpOnly secure cookies instead of localStorage JWT storage
* CSRF protection when using cookies
* API rate limiting
* request logging
* structured application logging
* centralized error handling
* input size limits
* provider timeouts
* provider retry policies
* background workers
* usage quotas
* billing and credits
* audit logs
* object storage
* webhook-based job updates

---

## Scalability Roadmap

The current architecture can evolve into:

```text
                           React Frontend
                                  │
                                  ▼
                              API Server
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
               PostgreSQL       Redis         Object Storage
                    │             │             │
                    │             ▼             │
                    │         Job Queue         │
                    │             │             │
                    │             ▼             │
                    │          Workers           │
                    │             │               │
                    └─────────────┼───────────────┘
                                  ▼
                             AI Providers
```

Future services could include:

* video worker
* image worker
* generation queue
* billing service
* notification service
* analytics
* provider fallback
* usage tracking

---

## Possible Future Features

* Text-to-video
* Image-to-video
* Multiple video providers
* Provider fallback
* AI model selection
* Video templates
* Generation credits
* Stripe subscriptions
* Project/workspace support
* Saved prompts
* Generation history
* Asset management
* Team collaboration
* Shareable generation links
* Webhooks
* Redis/BullMQ workers
* S3/R2 media storage
* Real-time generation updates

---

## Project Status

### Completed

* [x] Turborepo monorepo
* [x] Backend setup
* [x] Frontend setup
* [x] PostgreSQL + Prisma
* [x] Database migrations
* [x] Authentication
* [x] JWT middleware
* [x] Avatar creation
* [x] Gemini image generation
* [x] Avatar library
* [x] Video generation job creation
* [x] Video status polling
* [x] Video history
* [x] React dashboard
* [x] Video generation studio

### Planned

* [ ] Production object storage
* [ ] Background workers
* [ ] Redis queue
* [ ] Provider webhooks
* [ ] Rate limiting
* [ ] Credits and usage tracking
* [ ] Billing
* [ ] Multi-provider fallback
* [ ] Production deployment

---

## Running in Production

A typical deployment can look like:

```text
Frontend
   ↓
Vercel / Static Hosting

Backend
   ↓
Render / Railway / Fly.io / VPS

Database
   ↓
Managed PostgreSQL

Media
   ↓
S3 / R2 / Cloudinary

AI
   ↓
Gemini + OpenRouter
```

Keep all secrets on the backend/server environment.

---

## Contributing

For learning purposes, the project can be extended through feature branches and pull requests.

Before opening a pull request:

```bash
bun install
bun run check-types
bun run lint
bun run build
```

Make sure:

* environment variables are not committed
* database migrations are committed
* generated secrets are not included
* API keys are never exposed to frontend code

---

## Disclaimer

HiggsFlow is an independent learning and portfolio project inspired by modern AI media platforms.

It is not affiliated with Higgsfield or any other third-party AI media company.

All third-party product names, provider names, trademarks, models, and example URLs belong to their respective owners.
