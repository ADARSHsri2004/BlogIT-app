# BlogIT

BlogIT is a full-stack blogging platform with a React + Vite frontend and an Express + MongoDB backend. It supports email/password auth, Google sign-in, email verification, password reset, protected author workflows, and publishing Markdown-based blog posts.

## Live Links

- Frontend: `https://blog-it-app-ymga.vercel.app/`
- API base URL: `https://blogit-app-8h16.onrender.com/api`
- API health check: `https://blogit-app-8h16.onrender.com/health`

## Features

- Public landing page, feed, and individual blog pages
- Register, login, logout, refresh-session flow with HTTP-only cookies
- Google OAuth sign-in
- Email verification and password reset flows
- Role-based protected routes for `admin` and `author`
- Create, edit, publish, and delete blog posts
- Draft-only visibility for authors and admins
- Markdown editor with live preview
- Blog likes, shares, and comments
- Profile editing with bio, avatar, and cover image
- Generated blog metadata support with Gemini or fallback processing

## AI Integration

BlogIT includes an AI-assisted metadata pipeline for blog posts. The goal is to help authors publish faster by automatically preparing SEO and repurposing content in the background after a story is saved.

### What it generates

For each blog post, the metadata engine can generate:

- SEO slug
- SEO title
- Meta description
- Categories
- Tags
- TL;DR bullet points
- Social copy for Twitter and LinkedIn

These values are stored in the blog document under `generatedMetadata` and are shown in the editor and reading experience.

### How it works

1. When an author creates or updates a post, the backend marks metadata generation as `queued`.
2. A background job starts immediately using `queueMetadataGeneration()` in [server/src/services/metadataEngine.js](/d:/BlogIT/server/src/services/metadataEngine.js).
3. The service strips markdown and noisy markup from the article, builds a structured prompt, and sends the cleaned content to the configured LLM provider.
4. The current default provider is Gemini, using:
   - `METADATA_LLM_API_URL`
   - `METADATA_LLM_API_KEY`
   - `METADATA_LLM_MODEL`
   - `METADATA_LLM_TEMPERATURE`
   - `METADATA_LLM_TIMEOUT_MS`
5. The model is asked to return strict JSON only, with fields like `seo_title`, `meta_description`, `categories`, `tags`, `tldr_bullets`, and `social_copy`.
6. The backend validates the response, trims lengths to fit limits, normalizes tags/categories, and saves the final metadata to MongoDB.
7. The blog `summary` is also updated from the generated meta description.

### Status flow

The metadata pipeline tracks processing state in `generatedMetadata.processingStatus`:

- `queued` when a save triggers generation
- `processing` while the backend is calling the model
- `completed` when the AI response passes validation
- `fallback` when the app has to use deterministic metadata instead of a clean AI result

The frontend polls while metadata is still active, so authors can see results appear shortly after saving.

### Fallback behavior

BlogIT does not block publishing if AI is unavailable.

If the LLM is not configured, times out, fails, or returns incomplete JSON, the backend falls back to a deterministic rules-based generator. That fallback:

- derives a slug from the title
- builds a short SEO title and meta description
- detects likely categories from keyword rules
- extracts tags from headings and repeated terms
- creates concise TL;DR bullets
- prepares social copy from the generated summary

This means metadata is always available, even without a working Gemini key.

### Manual regeneration

Authors and admins can manually trigger the pipeline again through:

- `POST /api/blogs/:id/metadata/regenerate`

This is useful after major content edits or when you want to retry generation after changing model settings.

### Environment variables

To enable AI metadata generation, set these backend environment variables:

```env
METADATA_LLM_PROVIDER=gemini
METADATA_LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
METADATA_LLM_API_KEY=your-gemini-api-key
METADATA_LLM_MODEL=gemini-3.5-flash
METADATA_LLM_TEMPERATURE=0.2
METADATA_LLM_TIMEOUT_MS=20000
```

If these are missing, BlogIT automatically uses the built-in deterministic fallback mode.

## Tech Stack

- Frontend: React 19, TypeScript, Vite, React Router, React Query, Tailwind CSS, Framer Motion, Axios
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, cookie-parser, Nodemailer
- Auth: email/password + Google OAuth
- Deployment: Vercel frontend + Render API

## Project Structure

```text
BlogIT/
- client/   # React frontend
- server/   # Express API
- README.md
```

## Local Setup

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB local instance or MongoDB Atlas connection string
- Google OAuth client ID for Google sign-in
- SMTP credentials for email verification and reset-password emails

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure the backend

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/blogit
JWT_SECRET=replace-this
JWT_ACCESS_SECRET=replace-this
JWT_REFRESH_SECRET=replace-this
CLIENT_URL=http://localhost:5173
NODE_ENV=development

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
EMAIL_FROM=BlogIT <your-email@example.com>

METADATA_LLM_PROVIDER=gemini
METADATA_LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
METADATA_LLM_API_KEY=your-gemini-api-key
METADATA_LLM_MODEL=gemini-3.5-flash
METADATA_LLM_TEMPERATURE=0.2
METADATA_LLM_TIMEOUT_MS=20000
```

Notes:

- `CLIENT_URL` must match the frontend origin exactly.
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` should be long random secrets.
- Email verification and password reset need working SMTP credentials.
- Metadata generation works best with a valid Gemini API key, but the app also includes fallback handling.

### 3. Configure the frontend

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Notes:

- `VITE_API_URL` must point to the backend `/api` base path.
- `VITE_GOOGLE_CLIENT_ID` should match the backend `GOOGLE_CLIENT_ID`.

### 4. Start the backend

```bash
cd server
npm run dev
```

The API should start on `http://localhost:5000`.

### 5. Start the frontend

```bash
cd client
npm run dev
```

The frontend should start on `http://localhost:5173`.

## Available Scripts

### Client

```bash
cd client
npm run dev
npm run build
npm run preview
npm run lint
```

### Server

```bash
cd server
npm run dev
npm start
```

## Main Routes

### Frontend routes

- `/` landing page
- `/feed` published blog feed
- `/blog/:slug` public blog reader
- `/auth` login/register
- `/verify-email` email verification page
- `/reset-password` reset password page
- `/profile` protected profile page
- `/write` protected create-post page
- `/write/:slug` protected edit-post page

### API routes

Base URL: `/api`

#### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/google`
- `POST /auth/logout`
- `GET /auth/me`
- `PUT /auth/profile`
- `POST /auth/verify-email`
- `POST /auth/resend-verification`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

#### Blogs

- `GET /blogs`
- `GET /blogs/me`
- `GET /blogs/:slug`
- `POST /blogs`
- `PUT /blogs/:id`
- `DELETE /blogs/:id`
- `POST /blogs/:id/like`
- `POST /blogs/:id/share`
- `POST /blogs/:id/comments`
- `POST /blogs/:id/metadata/regenerate`

## Authentication Notes

- The backend uses HTTP-only cookies for access and refresh tokens.
- In production, cookies are configured for cross-site delivery over HTTPS.
- Protected author actions also require a verified email.
- The frontend Axios client sends requests with `withCredentials: true`.

## Deployment Notes

- Frontend is deployed on Vercel.
- Backend is deployed on Render.
- In production, make sure:
  - `CLIENT_URL` points to the deployed frontend
  - `VITE_API_URL` points to the deployed backend `/api`
  - backend is served over HTTPS
  - Google OAuth authorized origins and redirect settings match your deployed app

## Troubleshooting

- If login works but protected requests fail, check `CLIENT_URL`, `VITE_API_URL`, and cookie settings.
- If Google sign-in fails, confirm both frontend and backend use the same Google client ID.
- If verification or reset emails do not arrive, recheck SMTP credentials and sender settings.
- If the frontend loads but no data appears, verify the backend is running and MongoDB is connected.
- If local auth works inconsistently across origins, make sure frontend and backend URLs match your env files exactly.
