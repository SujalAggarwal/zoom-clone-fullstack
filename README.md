# Zoom Clone

A full-stack, responsive Zoom web application clone featuring instant meetings, scheduling, and peer-to-peer WebRTC video conferencing with real-time WebSocket signaling. 

## Tech Stack
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite
- **Real-Time**: WebRTC for P2P video/audio, WebSockets for signaling and host controls

## Features Implemented
### Core Features
- **Project Foundation**: Monorepo structure, unified design system (Tailwind).
- **Dashboard**: Live clock, upcoming meetings list, and quick actions.
- **Instant Meetings**: 1-click meeting creation with auto-generated unique codes and shareable invite links.
- **Join Meeting**: 2-step modal to join via Meeting ID or invite link, with automatic URL parsing and name input.
- **Schedule Meeting**: Modal with client-side validation for future dates, generating shareable invite links.
- **Video Meeting Room**: WebRTC integration! Peer-to-peer video grid that dynamically resizes as users join and leave. Functional mute and stop-video toggles.

### Bonus Features
- **Host Controls**: A dedicated Participants panel allowing the host to **Mute All** and selectively **Remove** non-host participants. Removed users are gracefully booted to the dashboard.

## Setup Instructions
### Prerequisites
- Node.js (v18+)
- Python 3.10+

### Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the seed script to create the default user and DB:
   ```bash
   python -m app.seed
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The backend will run on `http://localhost:8000`.*

### Frontend Setup
1. Open a second terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`.*

## Known Limitations / Assumptions
- **Authentication**: There is no actual authentication system. The app uses a "default user" (`alex@example.com`) established by the seed script for meeting creation. Anyone creating a meeting acts as the Host.
- **WebRTC Signaling**: Signaling is handled in-memory by the FastAPI WebSocket router. This means it will not scale across multiple backend server instances (e.g., if deployed on a platform that spins up multiple workers) without migrating to a Redis Pub/Sub adapter.
- **Peer-to-Peer Limits**: WebRTC here is purely P2P (mesh network). It works perfectly for 2-4 users but would require an SFU (Selective Forwarding Unit) like LiveKit to support larger rooms efficiently.

## Deployed Links
- **Live Frontend (Vercel)**: [https://frontend-eight-livid-03b04fqa69.vercel.app](https://frontend-eight-livid-03b04fqa69.vercel.app)
- **Live Backend (Render)**: [https://zoom-clone-fullstack-627l.onrender.com/docs](https://zoom-clone-fullstack-627l.onrender.com/docs)
- **GitHub Repository**: [https://github.com/SujalAggarwal/zoom-clone-fullstack](https://github.com/SujalAggarwal/zoom-clone-fullstack)

*(Note: The backend is deployed on Render's free tier. If it hasn't been used in a while, it may take 50 seconds to spin up on the first request.)*
