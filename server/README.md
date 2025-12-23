# BlogIT Backend

Node.js + Express API for the BlogIT Medium-like platform. Provides authentication and blog CRUD with MongoDB.

## What it does
- Exposes REST APIs for signup/login/logout and profile fetch.
- Manages blog creation, updates, deletion, and public feed with slug-based URLs.
- Issues HTTP-only JWT cookies for session security.

## Why it exists
- Separates core business logic from the frontend, keeping the React app lean.
- Encapsulates data validation and authorization in one place for safety.

## How it works
1. Express app (`src/app.js`) wires middleware (CORS, JSON, cookies) and routes.
2. MongoDB is connected in `src/server.js` via Mongoose.
3. Auth flow uses bcrypt-hashed passwords and JWT stored in an HTTP-only cookie.
4. Blogs are stored with unique slugs, status (`draft`/`published`), and author ownership checks.

## Running locally
Prereqs: Node 18+, MongoDB running locally.

```bash
cd server
cp .env.example .env   # set real values
npm install
npm run dev            # hot reload
# or: npm start
```

## Common mistakes to avoid
- Forgetting to set `CLIENT_URL` to match the frontend origin (CORS + cookies).
- Using a weak `JWT_SECRET` in production.
- Not enabling `secure` cookies behind HTTPS in production.
- Missing MongoDB connection; ensure the database is running before `npm run dev`.

## API routes (base: `/api`)
- `POST /auth/register` – body: `{name, email, password}`
- `POST /auth/login` – body: `{email, password}`
- `POST /auth/logout` – clears session cookie (auth required)
- `GET /auth/me` – returns current user (auth required)
- `GET /blogs` – list published blogs
- `GET /blogs/me` – list authenticated user's blogs (drafts + published)
- `GET /blogs/:slug` – fetch blog by slug (draft visible only to author)
- `POST /blogs` – create blog `{title, content, status?, summary?}` (auth required)
- `PUT /blogs/:id` – update blog fields (author only)
- `DELETE /blogs/:id` – delete blog (author only)

## Auth flow
1. User registers or logs in; server issues JWT in HTTP-only cookie.
2. Client sends cookies with `withCredentials` requests.
3. Protected routes read and verify the cookie; user payload is attached to `req.user`.
4. Logout clears the cookie.

## Database schema
- `User`: name, email (unique), password (hashed), bio, timestamps.
- `Blog`: title, slug (unique), content, summary, status, author ref, publishedAt, timestamps.

