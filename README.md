# HiggsFlow

HiggsFlow is a full-stack AI media application for creating reusable AI avatars and generating AI videos from text prompts and image references.

A user can create an avatar from an image URL, generate an AI profile image for that avatar using Google Gemini, and use the avatar as an optional reference when creating videos through OpenRouter.

## What HiggsFlow Does

The main workflow is:

```text
User
  ↓
Create account
  ↓
Create an avatar from an image
  ↓
Gemini generates an AI profile image
  ↓
Select avatar + write video prompt
  ↓
Submit video generation job
  ↓
OpenRouter processes the job
  ↓
HiggsFlow checks the job status
  ↓
Generated video is shown in the dashboard
```

## Features

### Authentication

- User signup
- User signin
- Password hashing with bcryptjs
- JWT authentication
- Protected API routes
- Protected frontend routes
- Current-user endpoint

### AI Avatar Generation

- Create an avatar using a public image URL
- Store the original image reference
- Generate a professional profile image using Google Gemini
- Store the generated image locally
- Save avatar and image metadata in PostgreSQL
- View all created avatars
- View a single avatar
- Delete avatars

### AI Video Generation

- Generate videos from text prompts
- Optionally use an existing avatar as an image reference
- Select video duration
- Select resolution
- Select aspect ratio
- Submit asynchronous video generation jobs through OpenRouter
- Store provider job IDs
- Track video generation status
- Show generated videos when available
- View previous video generations

## How It Works

### Avatar Generation

```text
Image URL
   ↓
POST /api/v1/avatar
   ↓
Validate request
   ↓
Create Avatar
   ↓
Store original image
   ↓
Download image
   ↓
Send image + prompt to Gemini
   ↓
Generate profile image
   ↓
Save generated image
   ↓
Store generated image URL
```

### Video Generation

```text
Prompt + optional avatar
        ↓
POST /api/v1/video
        ↓
Create video job in PostgreSQL
        ↓
Submit job to OpenRouter
        ↓
Store provider job ID
        ↓
Processing
        ↓
GET /api/v1/video/:videoId
        ↓
Check provider status
        ↓
Done / Error
        ↓
Show result in frontend
```

## Tech Stack

### Monorepo

- Turborepo
- Bun

### Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Axios

### Backend

- Bun
- Express 5
- TypeScript
- Zod
- JWT
- bcryptjs

### Database

- PostgreSQL
- Prisma 7
- `@prisma/adapter-pg`

### AI

- Google Gemini for profile image generation
- OpenRouter Video API for video generation

## Project Structure

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
│   │   └── prisma/
│   │       ├── migrations/
│   │       └── schema.prisma
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── lib/
│       │   └── pages/
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── packages/
├── package.json
├── turbo.json
├── bun.lockb
└── README.md
```

## Backend Structure

### `index.ts`

Main Express application.

It contains:

- server setup
- middleware
- authentication routes
- avatar routes
- video routes
- API error handling

### `auth.ts`

Authentication utilities.

It handles:

- JWT creation
- JWT verification
- protected-route middleware

### `db.ts`

Initializes Prisma with the PostgreSQL adapter.

### `types.ts`

Contains Zod schemas used to validate API requests.

### `image.ts`

Handles Gemini image generation:

1. Downloads the source image
2. Converts it to Base64
3. Sends the image to Gemini
4. Extracts the generated image
5. Saves the generated image locally

### `video.ts`

Contains the OpenRouter integration for:

- submitting video generation jobs
- checking video job status
- fetching available video models

## Frontend Structure

### Authentication

The frontend uses React Context for authentication.

Authentication state includes:

- current user
- loading state
- sign in
- sign up
- sign out

JWT is currently stored in `localStorage` and automatically attached to API requests through an Axios interceptor.

### Pages

```text
/
├── Landing
├── Signup
├── Signin
├── Dashboard
└── Video Creator
```

### Dashboard

The dashboard provides:

- avatar creation
- avatar listing
- avatar preview
- avatar deletion
- navigation to video generation

### Video Creator

The video creator allows the user to:

- write a prompt
- select an avatar
- choose duration
- choose resolution
- choose aspect ratio
- submit a video generation job
- monitor the current job
- view recent videos

## Database

Prisma manages the PostgreSQL database.

Main models:

```text
User
Avatar
AvatarImage
AvatarVideo
AvatarVideoReference
```

Relationships:

```text
User
 ├── Avatar[]
 └── AvatarVideo[]

Avatar
 ├── AvatarImage[]
 └── AvatarVideoReference[]

AvatarVideo
 └── AvatarVideoReference[]
```

### Avatar Image Types

```text
User
Model
```

`User` represents the original image supplied for the avatar.

`Model` represents the AI-generated profile image.

### Video Status

```text
Pending
Processing
Done
Error
```

## API Endpoints

### Health

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/v1/health` | No |

### Authentication

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/v1/signup` | No |
| POST | `/api/v1/signin` | No |
| GET | `/api/v1/me` | Yes |

### Avatars

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/v1/avatar` | Yes |
| GET | `/api/v1/avatars` | Yes |
| GET | `/api/v1/avatar/:avatarId` | Yes |
| DELETE | `/api/v1/avatar/:avatarId` | Yes |

### Videos

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/v1/video` | Yes |
| GET | `/api/v1/video/:videoId` | Yes |
| GET | `/api/v1/videos` | Yes |
| GET | `/api/v1/models` | No |

Protected endpoints use:

```text
Authorization: Bearer <token>
```

## Environment Variables

### Backend

Create:

```text
apps/backend/.env
```

Example:

```env
PORT=3000

FRONTEND_URL=http://localhost:5173
PUBLIC_BACKEND_URL=http://localhost:3000

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require

JWT_SECRET=your-secret-key

GOOGLE_API_KEY=your-google-api-key
GEMINI_IMAGE_MODEL=gemini-3.1-flash-image

OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_VIDEO_MODEL=google/veo-3.1-lite
```

### Frontend

Create:

```text
apps/frontend/.env
```

Example:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Never commit API keys or `.env` files.

## Local Setup

### 1. Install dependencies

From the repository root:

```bash
bun install
```

### 2. Configure environment variables

Create:

```text
apps/backend/.env
apps/frontend/.env
```

### 3. Generate Prisma Client

```bash
bun --filter backend run db:generate
```

### 4. Run database migrations

```bash
bun --filter backend run db:migrate
```

### 5. Start the application

```bash
bun run dev
```

The applications run on:

```text
Frontend → http://localhost:5173
Backend  → http://localhost:3000
```

## Prisma Commands

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

## Manual API Testing

### Health Check

```bash
curl http://localhost:3000/api/v1/health
```

### Signup

```bash
curl -X POST http://localhost:3000/api/v1/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"abhishek\",\"password\":\"password123\"}"
```

The response returns a JWT token.

### Signin

```bash
curl -X POST http://localhost:3000/api/v1/signin ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"abhishek\",\"password\":\"password123\"}"
```

### Current User

```bash
curl http://localhost:3000/api/v1/me ^
  -H "Authorization: Bearer <token>"
```

### List Avatars

```bash
curl http://localhost:3000/api/v1/avatars ^
  -H "Authorization: Bearer <token>"
```

### List Videos

```bash
curl http://localhost:3000/api/v1/videos ^
  -H "Authorization: Bearer <token>"
```

## Media Storage

Generated avatar images are currently stored locally in:

```text
apps/backend/assets/
```

They are served by the backend through:

```text
/assets/...
```

This is suitable for local development.

When using an external video provider with an avatar reference, the image URL must be accessible to the provider. A `localhost` URL is only accessible from the local machine.

## Current Status

The current implementation covers:

- authentication
- protected routes
- avatar creation
- Gemini profile-image generation
- avatar management
- OpenRouter video generation
- video status polling
- video history
- React dashboard
- video creation studio

This project is currently focused on the core application workflow and local development.
`