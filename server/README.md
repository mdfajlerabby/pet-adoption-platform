# Pawfect Home API

Express and MongoDB service for the Pawfect Home pet-adoption client.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, a private `JWT_SECRET` (at least 32 characters), and `CLIENT_URL`.
3. To load the six example listings, set `SEED_OWNER_EMAIL`, `SEED_OWNER_PASSWORD` (at least 12 characters), and optionally `SEED_OWNER_NAME`; run `npm run seed`.
4. Start the API with `npm run dev`. The health check is `GET /api/health`.
5. Run the database-independent API checks with `npm test`.

## API routes

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/pets`, `GET /api/pets/:id`, `POST /api/pets`, `GET /api/pets/mine`, `PATCH /api/pets/:id`, `DELETE /api/pets/:id`
- `POST /api/requests`, `GET /api/requests/mine`, `GET /api/requests/pet/:petId`, `PATCH /api/requests/:id`, `DELETE /api/requests/:id`

Sessions use a signed JWT in an HTTP-only cookie. Protected API routes verify the cookie and enforce pet ownership before listing or request changes.

## Deployment

Run `npm start` with `NODE_ENV=production`. Set `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and `GOOGLE_CLIENT_ID` in the hosting provider; configure the client origin exactly and use HTTPS so cross-site session cookies remain secure.
