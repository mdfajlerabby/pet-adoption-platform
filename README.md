# Pawfect Home — Pet Adoption Platform

## Purpose

Pawfect Home helps people discover pets looking for a home, send adoption requests, and manage pet listings through a responsive, full-stack adoption experience.

## Live URL

Not deployed yet. Deploy the Next.js client to Vercel and the Express API to Render, then add both public URLs here.

## Features

- Browse available pets with server-backed name search, species filters, sorting, and pagination.
- View protected pet profiles and send adoption requests with a preferred pickup date and personal message.
- Create, edit, and delete pet listings; owners can review requests and approve or reject them.
- Enforce listing ownership, prevent owners from adopting their own pets, and allow only one approved request per pet.
- Register and sign in with email/password or Google; persist sessions with a signed JWT in an HTTP-only cookie.
- Manage listings, incoming requests, and personal adoption requests in a responsive dashboard.
- Save favorite pets on this device and switch between light and dark themes.
- Use accessible loading states, a custom not-found page, and in-app toast notifications.
- Load six optional example listings into MongoDB with the included seed script.

## Technology and NPM packages

**Client:** Next.js 16, React 19, Tailwind CSS 4

**Server:** Express 5, Mongoose, MongoDB, bcryptjs, jsonwebtoken, Google Auth Library, Helmet, CORS, cookie-parser, express-rate-limit, dotenv

## Local development

1. Install client dependencies from the repository root:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_API_URL` to the API URL and, if using Google sign-in, set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

3. Install server dependencies:

   ```bash
   cd server
   npm install
   ```

4. Copy `server/.env.example` to `server/.env`. Set `MONGODB_URI`, a unique `JWT_SECRET` of at least 32 characters, and `CLIENT_URL`. To load example pets, also set `SEED_OWNER_EMAIL` and a private `SEED_OWNER_PASSWORD` of at least 12 characters.

5. Start the API in one terminal:

   ```bash
   cd server
   npm run dev
   ```

6. To load six example pets into the configured database, run `npm run seed` from `server/` once.

7. Start the client in another terminal:

   ```bash
   npm run dev
   ```

   Visit <http://localhost:3000>. The API health check is available at <http://localhost:5000/api/health>.

8. Run the API route checks (these do not require a MongoDB connection):

   ```bash
   npm test --prefix server
   ```

## Deployment notes

- Deploy the client as a Next.js app and the `server/` directory as a separate Node.js web service.
- Configure `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in the client deployment environment.
- Configure `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `GOOGLE_CLIENT_ID`, and `NODE_ENV=production` in the API environment. Never commit `.env` files or real secrets.
- In production, `CLIENT_URL` must exactly match the client origin and use HTTPS. The API sets secure, HTTP-only cookies; use a shared parent `COOKIE_DOMAIN` only when both deployments support it.
- Add the deployed client URL to the authorized origins in the Google OAuth client settings when enabling Google sign-in.

## GitHub submission note

This connected repository is the client repository. The API currently lives in `server/` in this repository for local development. The assignment submission asks for separate client and server repositories; create a dedicated server repository and push the contents of `server/` there before submitting.
