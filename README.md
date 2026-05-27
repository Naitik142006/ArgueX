# ArgueX — Frontend Prototype (Phase 1)

This repository contains the frontend prototype for ArgueX — an AI-powered debate platform. In Phase 1 we focus on a clean, navigable React UI using Tailwind CSS and React Router. There is no backend or authentication logic yet; the goal is to learn by building.

## What's included

- Multiple connected pages (Landing, Login, Signup, Dashboard, Debate, Profile)
- Reusable components (`Navbar`, `InputField`, etc.)
- Routing with `react-router-dom`
- Styling with Tailwind CSS

## Tech stack

- React (Vite)
- Tailwind CSS
- React Router

## Quickstart

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview a production build:

```bash
npm run preview
```

Open the app at the address shown by Vite (commonly `http://localhost:5173`).

## Folder structure (key files)

Project layout (important files you'll work with):

- `index.html` — App host
- `src/main.jsx` — App entry, `BrowserRouter` is mounted here
- `src/App.jsx` — Route definitions and page wiring
- `src/index.css` — Tailwind imports and global styles
- `src/layouts/Layout.jsx` — Shared layout that renders `Navbar` and page `Outlet`
- `src/components/` — Reusable UI components
	- `Navbar.jsx`
	- `Form/InputField.jsx`
- `src/pages/` — Page components for routing
	- `LandingPage.jsx`
	- `LoginPage.jsx`
	- `SignupPage.jsx` ← start here for Phase 1
	- `DashboardPage.jsx`
	- `DebatePage.jsx`
	- `ProfilePage.jsx`

Why this structure? Separating `components`, `pages`, and `layouts` keeps UI pieces small, reusable, and easier to reason about as your app grows.

## Routing and navigation (how pages connect)

- We use `react-router-dom`'s `BrowserRouter`, `Routes`, and `Route` to map URLs to React components.
- Links and navigation use the `Link` component (client-side) and `useNavigate` for programmatic redirects.
- Route flow in Phase 1:

	Landing → Login / Signup → Dashboard → Debate → Profile

Files to inspect: `src/App.jsx` sets up the `Routes` and `src/layouts/Layout.jsx` provides the persistent `Navbar`.

## Signup page (what to learn first)

- The signup page uses React `useState` to manage controlled inputs.
- Form fields are validated in the UI (required fields, password match).
- Successful signup simulates navigation to `/dashboard` using `useNavigate`.
- See `src/pages/SignupPage.jsx` and `src/components/Form/InputField.jsx` to follow the implementation.

## Development tips (Tailwind + React)

- Use utility classes like `flex`, `grid`, `gap-*`, `px-*`, `py-*` to build responsive layouts.
- Keep components small: pass data via `props` and avoid duplicating UI logic.
- For interactive UI (chat/messages) use arrays in state and `map()` to render lists.

## Next steps (suggested learning path)

1. Review `src/pages/SignupPage.jsx` and try editing labels/placeholders.
2. Add a small validation rule (e.g., password minimum length).
3. Build the Landing page hero or improve the Navbar responsiveness.

If you'd like, I can walk you line-by-line through the `Signup` implementation now or implement the Landing page next.