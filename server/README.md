# ArgueX Backend — Quick Setup

This document describes how to run the ArgueX backend locally and prepare for production.

Prerequisites
- Node.js 18+ (tested with Node 22)
- MongoDB (Atlas or local)

1) Create environment file
- Copy `server/.env.example` → `server/.env` and fill the values.

2) Development run (no DB required)
- To run without a MongoDB (socket-only mode) for quick front-end integration tests:

```powershell
cd server
$env:MONGO_URI=''
$env:ALLOW_SOCKET_NOAUTH='true'  # OPTIONAL: dev-only, allows socket clients without JWT
node server.js
```

3) Full run with MongoDB
- Set `MONGO_URI` to your MongoDB connection string in `server/.env` (required in production)
- Ensure `JWT_SECRET` is set to a strong secret

```powershell
cd server
node server.js
```

4) Production recommendations
- Do NOT enable `ALLOW_SOCKET_NOAUTH` in production.
- Run behind a reverse proxy (Nginx) and enable HTTPS.
- Use a process manager like `pm2` or run in Docker with a proper `Dockerfile`.
- Ensure `NODE_ENV=production` and `MONGO_URI` is present. The server will refuse to start without DB in production.

6) Docker (recommended for local full-stack testing)

Build and run the app with MongoDB locally:

```bash
docker-compose build
docker-compose up -d
```

Run the seed script once (after containers are up):

```bash
docker-compose exec backend npm run seed
```

Then visit http://localhost:5173 for frontend and http://localhost:5000 for API.

5) Additional
- `server/testSocketClient.js` is a minimal test client for smoke-testing socket events.
- Use `npm run dev` (from `server`) to run with `nodemon` for development.

If you'd like, I can add a Dockerfile and a `pm2` ecosystem file next. Tell me which you'd prefer.
