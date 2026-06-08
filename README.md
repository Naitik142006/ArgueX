# ArgueX — The AI-Powered Multiplayer Debate Platform

ArgueX is a next-generation debate platform that combines **WebRTC Mesh Networking**, **Decentralized Speech Recognition**, and **Google Gemini AI** to create immersive 1v1 and Group Debates. 

Whether you want to train against historical AI personas or invite up to 5 friends for a live video debate judged by an AI, ArgueX provides the ultimate battleground for ideas.

![ArgueX Dashboard](https://img.shields.io/badge/Status-Active_Development-brand) ![React](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Backend-green) ![WebRTC](https://img.shields.io/badge/WebRTC-P2P_Mesh-orange)

---

## 🚀 Key Features

### 🤖 Train Against AI Personas
- Debate against powerful LLM-driven personas (e.g., The Logical Spock, The Emotional Artist, The Aggressive Challenger).
- Uses Google Gemini to generate dynamic, contextual, and persona-driven arguments in real-time.
- Built-in **AI Judge** evaluates your logic, evidence, and persuasion, declaring a winner and providing constructive feedback.

### 🎥 N-Way Group Video Debates (WebRTC Mesh)
- **Peer-to-Peer Mesh Network**: Play with up to 6 participants simultaneously without needing expensive central video servers (SFU). Video and audio are tunneled directly between browsers!
- **Dynamic Grid UI**: The video arena automatically scales from 1v1 split-screen to a full 3x2 grid as more friends join via invite links.
- **Hardware Optimized**: Intelligent connection management prevents memory leaks and manages device hardware efficiently.

### 🎙️ Live Decentralized Transcription & Judging
- **Local Speech-to-Text**: Uses your browser's native Web Speech API to transcribe your voice locally, preventing backend bottlenecking.
- **Socket Transcript Pipeline**: Completed sentences are beamed to the server and broadcasted to the room, creating a live scrolling chat transcript of the video call.
- **Group AI Verdict**: When the debate concludes, the master transcript is analyzed by Gemini. Every participant is ranked (1st to Last place) and receives an individual Logic Score and feedback on their arguments.

### 🏆 Elo Ratings & Leaderboards
- Every time you debate against the AI or humans, your performance impacts your global Elo rating.
- Climb the global leaderboard and track your win/loss statistics on your profile.

### ⏪ Debate Replays
- Access a historical archive of all your past debates.
- Review transcripts, re-read the AI's feedback, and analyze your logical fallacies to improve your skills.

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (Custom Design System & Glassmorphism)
- React Router (Protected Routing)
- WebRTC API (MediaStreams & RTCPeerConnections)
- Web Speech API (Live Transcription)

**Backend:**
- Node.js & Express.js
- Socket.io (Signaling Server & Live Transcripts)
- MongoDB Atlas & Mongoose (Schema Validation)
- Google Gemini API (AI Persona Generation & Transcript Judging)
- JWT (Authentication)

---

## 🏁 Quickstart

### 1. Backend Setup

From the repository root, navigate to the `server/` folder:

```bash
cd server
npm install
```

Create a `.env` file in `server/` (use `.env.example` as a template) and add the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_API_KEY=your_google_gemini_api_key
```

Start the backend:

```bash
npm run dev
```

The backend signaling and API server will start on `http://localhost:5000`.

### 2. Frontend Setup

Open a new terminal window, and from the repository root:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📚 API Architecture

### REST Endpoints
- `POST /api/auth/signup` — Register and return JWT.
- `POST /api/auth/login` — Authenticate and return JWT.
- `GET /api/auth/me` — Return the current user's profile and Elo.
- `GET /api/debates` — List a user's debate history.
- `POST /api/debates` — Create a new AI debate instance.
- `GET /api/debates/leaderboard` — Fetch the global Elo rankings.
- `POST /api/debates/group/evaluate` — Submit a multiplayer transcript for AI ranking.

### Socket.io Events (WebRTC Signaling)
- `joinRoom` / `leaveRoom` — Manage multiplayer lobbies.
- `webrtc-offer` / `webrtc-answer` / `webrtc-ice-candidate` — P2P connection handshakes.
- `multiplayer-message` — Broadcast live transcript sentences to the room.

---

## 🎨 Design Philosophy
ArgueX prioritizes a premium, immersive aesthetic. It utilizes a deep dark mode (`bg-zinc-950`), vibrant brand accents (`brand-500`), smooth micro-animations, and glassmorphic overlays to make the debating experience feel cutting-edge and responsive.
