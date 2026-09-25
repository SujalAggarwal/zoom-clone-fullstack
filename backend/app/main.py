from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import meetings, signaling
from app.routers.signaling import manager

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zoom Clone API")

# Configure CORS — list all allowed origins explicitly
origins = [
    "http://localhost:3000",
    "https://frontend-eight-livid-03b04fqa69.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router, prefix="/meetings", tags=["Meetings"])
# NOTE: signaling HTTP routes (mute/remove) are already in meetings.py
# The WebSocket endpoint is registered directly below to avoid APIRouter + CORS issues

@app.websocket("/ws/meeting/{meeting_code}")
async def websocket_endpoint(websocket: WebSocket, meeting_code: str, client_id: str, display_name: str = "Unknown"):
    await manager.connect(websocket, meeting_code, client_id, display_name)
    try:
        while True:
            data = await websocket.receive_text()
            import json
            message = json.loads(data)
            target = message.get("target")
            if target and meeting_code in manager.active_connections and target in manager.active_connections[meeting_code]:
                message["sender"] = client_id
                if "display_name" not in message:
                    message["display_name"] = display_name
                try:
                    await manager.active_connections[meeting_code][target]["ws"].send_text(json.dumps(message))
                except:
                    pass
    except WebSocketDisconnect:
        manager.disconnect(meeting_code, client_id)
        await manager.broadcast_left(meeting_code, client_id)

@app.get("/health")
def health_check():
    return {"status": "ok"}
