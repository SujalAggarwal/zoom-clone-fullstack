# Zoom Clone - Premium Video Conferencing Web App

![Zoom Clone Preview](https://github.com/SujalAggarwal/zoom-clone-fullstack/raw/main/preview.png)

A full-stack, industry-level video conferencing application built with Next.js, FastAPI, WebSockets, and WebRTC. Designed with a modern, glassmorphic dark-mode UI to deliver a seamless and premium user experience.

## ✨ Features

*   **P2P Video Conferencing (WebRTC):** Low-latency, high-quality audio and video streaming directly between peers.
*   **Real-time Signaling (WebSockets):** Instant room joining, leaving, and signaling handled by a robust FastAPI WebSocket backend.
*   **Premium UI/UX:** Dark theme, glassmorphism, micro-animations, and fluid responsive design (Mobile, Tablet, Desktop).
*   **In-Meeting Text Chat:** Real-time chat panel built directly into the meeting room.
*   **Live Screen Sharing:** Present your screen, window, or browser tab with a single click.
*   **Host Controls:** Mute participants, disable their video, or remove them from the meeting.
*   **Dashboard & Scheduling:** View upcoming meetings, join via code, or schedule new ones.
*   **Seamless Connectivity:** Integrated TURN servers to bypass restrictive firewalls and mobile networks.

## 🛠️ Tech Stack

**Frontend:**
*   Next.js 14 (App Router)
*   React
*   Tailwind CSS (with Glassmorphism utilities)
*   Lucide Icons
*   WebRTC API

**Backend:**
*   Python 3.10+
*   FastAPI
*   WebSockets
*   SQLite / SQLAlchemy (Meeting & User Data)
*   Uvicorn

## 🚀 Live Demo

*   **Frontend (Vercel):** [https://frontend-eight-livid-03b04fqa69.vercel.app](https://frontend-eight-livid-03b04fqa69.vercel.app)
*   **Backend (Render):** [https://zoom-clone-fullstack-627l.onrender.com](https://zoom-clone-fullstack-627l.onrender.com)

## 💻 Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/SujalAggarwal/zoom-clone-fullstack.git
cd zoom-clone-fullstack
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --host 0.0.0.1 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create a .env.local file and add:
# NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

Visit `http://localhost:3000` to view the app!

## 📱 Responsiveness
The UI is built with a mobile-first approach, ensuring the application looks stunning and remains fully functional on:
*   📱 Mobile Devices (~375px) - Stacked layouts, bottom sheets, and collapsed navbars.
*   💻 Tablets (~768px) - 2-column grids and optimized touch targets.
*   🖥️ Desktops (1280px+) - Full wide-screen experience with side panels.

## 🤝 Contributing
Contributions are always welcome! Feel free to open an issue or submit a pull request.
