# ArgueX — Full Stack Debate Platform

ArgueX is an AI-powered debate app. Phase 1 built the frontend UI using React, Tailwind CSS, and React Router. Phase 2 adds the backend foundation with Node.js, Express, MongoDB, Mongoose, JWT authentication, and protected debate APIs.

## Phase 1 — Frontend Prototype

This project includes:

- Multiple connected pages: Landing, Login, Signup, Dashboard, Debate, Profile
- Reusable UI components like Navbar and InputField
- Routing using `react-router-dom`
- Tailwind CSS styling and responsive layout

### Frontend tech stack

- React (Vite)
- Tailwind CSS
- React Router

### Frontend quickstart

From the repository root:

```bash
npm install
npm run dev
```

Then open the local address shown by Vite, usually `http://localhost:5173`.

## Phase 2 — Backend Foundation

A new backend is added in the server/ folder to support authentication, debate creation, and message history.

### Backend tech stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- nodemon

### Backend folder structure

- server/server.js — Express application entry point
- server/config/db.js — MongoDB connection logic
- server/models/ — Mongoose schemas (User.js, Debate.js)
- server/controllers/ — Route handlers and business logic
- server/routes/ — API endpoints for auth and debates
- server/middleware/ — Authentication and error handling middleware
- server/.env.example — Example environment configuration

This structure separates concerns so the backend is easier to understand and extend.

### Backend quickstart

From the `server/` folder:

```bash
cd server
npm install
```

Create a `.env` file in `server/` from `.env.example` and set:

- MONGO_URI — your MongoDB Atlas connection string
- JWT_SECRET — secret key for signing tokens
- PORT — optional backend port (default 5000)

Then run:

```bash
npm run dev
```

The backend should start on `http://localhost:5000`.

### Backend API overview

The backend exposes:

- POST /api/auth/signup — register a new user and return a JWT
- POST /api/auth/login — authenticate a user and return a JWT
- GET /api/auth/profile — return the current authenticated profile
- GET /api/debates — list debates for the current user
- POST /api/debates — create a new debate
- POST /api/debates/:id — add a message to an existing debate

Protected routes require an Authorization: Bearer <token> header.

## Frontend and backend integration

The frontend now includes service helpers in `src/services/`:

- `src/services/api.js` — common API URL and response handling
- `src/services/authService.js` — signup and login requests
- `src/services/debateService.js` — create debate and add messages

The React pages are wired to call backend APIs so the app becomes a full-stack experience.

## What you learn in Phase 2

- How a backend server handles HTTP requests
- How APIs connect frontend and backend
- How MongoDB stores users, debates, and messages
- How authentication tokens protect routes
- How the frontend sends JSON and receives responses
- How to structure backend folders professionally

## Running the full app

1. Start the backend:

```bash
cd server
npm run dev
```

2. Start the frontend:

```bash
npm run dev
```

3. Open the frontend in your browser and use the signup/login flow.

> Make sure the backend is running before signing up or logging in from the frontend.

## Notes for beginners

- `server.js` starts the Express server and registers routes.
- `dotenv` keeps secrets out of the code by loading `.env` values.
- `mongoose.connect()` opens the database connection and creates collections automatically.
- `bcryptjs` hashes passwords so plain text passwords are never stored.
- `jsonwebtoken` creates tokens the frontend stores in localStorage for authenticated requests.
- `authMiddleware.js` verifies the token and attaches `req.user` for protected routes.

## Next step

If you want, I can also add a short Postman testing guide for the auth and debate APIs.
