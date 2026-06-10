# ArgueX — The Intellectual Arena

ArgueX is not a generic SaaS dashboard. It is a premium, AI-powered esports platform for the mind. Combining **WebRTC Mesh Networking**, **Decentralized Speech Recognition**, and cutting-edge **Google Gemini** language models, ArgueX provides the ultimate battleground for ideas.

Think of it as *"Chess.com meets Perplexity meets Discord."*

![ArgueX Dashboard](https://img.shields.io/badge/Status-Active_Development-brand) ![React](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Backend-green) ![WebRTC](https://img.shields.io/badge/WebRTC-P2P_Mesh-orange)

---

## 🚀 Key Features

### 🤖 ARGUS-V1: The AI Gladiator
- Step into the **Training Arena** and face off against ARGUS-V1, an advanced AI trained in logic, rhetoric, and debate tactics.
- Powered by a robust backend fallback architecture leveraging the latest Google Gemini flash models (3.5, 2.5) to ensure zero downtime even under high demand.
- The AI judges your logic, evidence, and persuasion, finding fallacies in your arguments and declaring a winner.

### 🎥 Live Multiplayer Arenas (WebRTC Mesh)
- **Peer-to-Peer Architecture**: Host live 6-player video debates with zero latency using decentralized WebRTC mesh networking.
- **Dynamic UI**: The cinematic grid automatically scales as more challengers join the lobby via secure invite links.

### 🎙️ Decentralized STT & Telemetry
- **In-Browser Speech-to-Text**: Utilize the native Web Speech API to transcribe your spoken arguments locally, preventing backend bottlenecks.
- **Live Telemetry**: Real-time logic scores, fallacy detection, and combat statistics stream directly to your Mission Control dashboard via WebSockets.

### 🏆 Season 1 Global Ladder
- Every match impacts your global Elo rating. 
- Climb from Bronze to Grandmaster on the global leaderboard.

---

## 🛠️ Tech Stack & Architecture

**Frontend (The Glassmorphic Arena):**
- React + Vite
- Tailwind CSS (Custom Design System with Neon Accents & Glassmorphism)
- Framer Motion (Fluid Micro-animations & Route Transitions)
- Lucide React (Premium Iconography)
- WebRTC & Web Speech APIs

**Backend (Mission Control Server):**
- Node.js & Express.js
- Socket.io (Low-latency Signaling & Live Telemetry)
- MongoDB Atlas (Secure Combat Logs)
- Google Gemini AI (With Exponential Backoff Retry patterns)
- JWT Authentication Guards

---

## 🏁 Quickstart Initialization

### 1. Initialize Server

From the repository root, navigate to the `server/` folder:

```bash
cd server
npm install
```

Create a `.env` file in `server/` and configure your keys:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_API_KEY=your_google_gemini_api_key
```

Execute the backend:

```bash
npm run dev
```

### 2. Initialize Client

Open a new terminal window, and from the repository root:

```bash
npm install
npm run dev
```

Access the arena at `http://localhost:5173`.

---

## 🎨 Design Philosophy
ArgueX abandons the "cookie-cutter Bootstrap dashboard" look. We prioritize a cinematic, immersive aesthetic. Deep dark modes (`#09090b`), vibrant neon brand accents, smooth hover states, and ambient background glows make the user feel intelligent, powerful, and ready for intellectual combat.
