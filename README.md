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
- GET /api/auth/me — return the current authenticated profile (token validation)
- GET /api/auth/profile — return the current authenticated profile (alternative endpoint)
- GET /api/debates — list debates for the current user
- POST /api/debates — create a new debate
- POST /api/debates/:id/messages — add a message to an existing debate

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

## Phase 3 — Real Authentication Integration

ArgueX now has **REAL AUTHENTICATION**! 🎉 The frontend has been seamlessly integrated with the secure backend APIs to create a professional, robust, and secure full-stack experience.

### Key Takeaways
* ✅ **Global Auth State (`AuthContext.jsx`)** — No prop drilling needed! Authentication state and user details are globally managed and accessible by any component in the application.
* ✅ **Automatic Token Storage** — User JSON Web Tokens (JWT) and profile data are automatically saved in `localStorage` upon successful login or signup.
* ✅ **Session Restoration & Persistence** — Users stay logged in. The app automatically verifies and restores user sessions upon refresh or reopening the browser.
* ✅ **Protected Routes (`ProtectedRoute.jsx`)** — Unauthenticated users attempting to access private routes like `/dashboard`, `/debate`, or `/profile` are dynamically blocked and securely redirected to `/login`.
* ✅ **Dynamic UI (`Navbar.jsx`)** — The navigation bar dynamically adapts to the user's login state. If logged out, it exhibits sleek *Login* and *Signup* buttons. If logged in, it shows the *Dashboard* link, user profile link, and a *Logout* action.
* ✅ **Professional UX** — Zero-flicker transitions, animated loading states, and smooth session restorations create a premium user experience.
* ✅ **Scalable Architecture** — Built with clean abstraction layers, making it extremely easy to add more authenticated features or endpoints.

### You've Now Built:
1. **API Layer (`api.js`)** — A unified, robust request utility with centralized configuration, custom error logging, and automatic authorization token injection.
2. **Signup Flow (frontend + backend)** — Complete input collection, backend validation, password hashing with `bcryptjs`, database persistence in MongoDB, and automatic logging in post-signup.
3. **Login Flow (frontend + backend)** — Form submission, secure token verification, error display, and instant state transition.
4. **Global Auth State (Context)** — A top-level `<AuthProvider>` wrapper exposing state fields (`user`, `isLoggedIn`, `isLoading`, `error`) and actions (`login`, `signup`, `logout`) via a custom `useAuth()` hook.
5. **Route Protection** — Wrapper component that guards secure pages from unauthorized entry.
6. **Session Persistence** — Automatic localStorage-token validation against the backend `/api/auth/me` route at app startup.
7. **Dynamic UI** — Interactive header component that instantly shifts depending on login context.

### Folder Structure (Phase 3 Additions)

- `src/context/AuthContext.jsx` — Global state container, initialization logic, and custom hook `useAuth()`
- `src/components/ProtectedRoute.jsx` — High-Order Component (HOC) guarding private pages
- `src/components/Navbar.jsx` — State-aware main header component
- `src/services/api.js` — Centralized API call library handling endpoints, methods, payloads, and JWT insertion
- `src/services/authService.js` — Helper functions for signup, login, profile queries, and token persistence

## What you learn in Phase 3

- **State Management**: Managing state globally across multiple disjointed pages without passing props through intermediate components.
- **Session Lifecycles**: How to handle persistent user authorization securely, token validation sequences, and graceful storage management.
- **Router Guards**: Protecting specific path boundaries in SPA routers.
- **Advanced HTTP Services**: Structuring custom API managers that encapsulate headers, endpoints, request methods, and standardized response interception.

## Running the full app

To launch the full-stack app, follow these steps:

### 1. Start the Backend
From the repository root:
```bash
cd server
npm run dev
```
The backend should start on `http://localhost:5000`. Make sure you have created your `server/.env` file with proper `MONGO_URI` and `JWT_SECRET`.

### 2. Start the Frontend
From the repository root (in a separate terminal window):
```bash
npm run dev
```
Open the local address shown by Vite, usually `http://localhost:5173`.

> 💡 **Tip**: Make sure the backend is fully running before attempting to signup or log in from the frontend!

## Recent Updates (Phase 3 Complete)

✅ **Fixed Syntax Error in SignupPage.jsx** — Removed duplicate closing code that was causing parser errors

✅ **Enhanced Authentication Endpoints** — Added `/api/auth/me` endpoint for token validation and session restoration

✅ **Unified API Service Layer** — Updated `debateService.js` to use centralized API structure from `api.js`, eliminating code duplication

✅ **Full-Stack Integration Complete** — Frontend and backend now seamlessly communicate through unified service layer

The app is fully functional and ready for development!

## Notes for beginners

- `server.js` starts the Express server and registers routes.
- `dotenv` keeps secrets out of the code by loading `.env` values.
- `mongoose.connect()` opens the database connection and creates collections automatically.
- `bcryptjs` hashes passwords so plain text passwords are never stored.
- `jsonwebtoken` creates tokens the frontend stores in localStorage for authenticated requests.
- `authMiddleware.js` verifies the token and attaches `req.user` for protected routes.
- `AuthContext.jsx` provides a single source of truth for the user's login status across the entire React app.
- `ProtectedRoute.jsx` intercepts unauthorized page loads and forwards users to `/login`.
- `api.js` is the centralized HTTP service layer that handles all API communication with automatic token injection
- `authService.js` and `debateService.js` use the `api.js` layer to make requests, keeping code DRY and maintainable

## Next steps

Now that ArgueX has robust authentication, next phases will explore:
1. **Debate Creation & AI Responses** — Connecting debate inputs to AI endpoints to get real-time counter-arguments.
2. **WebSocket Integration** — Real-time debate room synchronization for multi-user experiences.
3. **Advanced Profile Customization** — Storing and displaying user stats, debate records, and ratings.

