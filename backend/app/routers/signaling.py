from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # meeting_code -> { client_id -> {"ws": WebSocket, "name": str} }
        self.active_connections: Dict[str, Dict[str, dict]] = {}

    async def connect(self, websocket: WebSocket, meeting_code: str, client_id: str, display_name: str):
        await websocket.accept()
        if meeting_code not in self.active_connections:
            self.active_connections[meeting_code] = {}
            
        self.active_connections[meeting_code][client_id] = {"ws": websocket, "name": display_name}
        
        # Notify others
        for cid, info in self.active_connections[meeting_code].items():
            if cid != client_id:
                try:
                    await info["ws"].send_text(json.dumps({
                        "type": "user-joined",
                        "client_id": client_id,
                        "display_name": display_name
                    }))
                except Exception as e:
                    pass
                # Inform new user about existing users with user-exists
                # (NOT user-joined to avoid both sides creating offers = glare)
                try:
                    await websocket.send_text(json.dumps({
                        "type": "user-exists",
                        "client_id": cid,
                        "display_name": info["name"]
                    }))
                except:
                    pass

    def disconnect(self, meeting_code: str, client_id: str):
        if meeting_code in self.active_connections:
            if client_id in self.active_connections[meeting_code]:
                del self.active_connections[meeting_code][client_id]
            if len(self.active_connections[meeting_code]) == 0:
                del self.active_connections[meeting_code]

    async def broadcast_left(self, meeting_code: str, client_id: str):
        if meeting_code in self.active_connections:
            for cid, info in self.active_connections[meeting_code].items():
                try:
                    await info["ws"].send_text(json.dumps({
                        "type": "user-left",
                        "client_id": client_id
                    }))
                except:
                    pass

    async def broadcast_force_mute(self, meeting_code: str):
        if meeting_code in self.active_connections:
            for cid, info in self.active_connections[meeting_code].items():
                try:
                    await info["ws"].send_text(json.dumps({
                        "type": "force-mute"
                    }))
                except:
                    pass

    async def force_mute_user(self, meeting_code: str, target_client_id: str):
        if meeting_code in self.active_connections and target_client_id in self.active_connections[meeting_code]:
            target_ws = self.active_connections[meeting_code][target_client_id]["ws"]
            try:
                await target_ws.send_text(json.dumps({"type": "force-mute"}))
            except:
                pass

    async def force_video_off_user(self, meeting_code: str, target_client_id: str):
        if meeting_code in self.active_connections and target_client_id in self.active_connections[meeting_code]:
            target_ws = self.active_connections[meeting_code][target_client_id]["ws"]
            try:
                await target_ws.send_text(json.dumps({"type": "force-video-off"}))
            except:
                pass
                    
    async def force_remove(self, meeting_code: str, target_client_id: str):
        if meeting_code in self.active_connections and target_client_id in self.active_connections[meeting_code]:
            target_ws = self.active_connections[meeting_code][target_client_id]["ws"]
            try:
                await target_ws.send_text(json.dumps({
                    "type": "force-remove"
                }))
                await target_ws.close()
            except:
                pass
            self.disconnect(meeting_code, target_client_id)
            await self.broadcast_left(meeting_code, target_client_id)

manager = ConnectionManager()

@router.websocket("/ws/meeting/{meeting_code}")
async def websocket_endpoint(websocket: WebSocket, meeting_code: str, client_id: str, display_name: str = "Unknown"):
    await manager.connect(websocket, meeting_code, client_id, display_name)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            target = message.get("target")
            
            message["sender"] = client_id
            if "display_name" not in message:
                message["display_name"] = display_name

            if target and meeting_code in manager.active_connections and target in manager.active_connections[meeting_code]:
                try:
                    await manager.active_connections[meeting_code][target]["ws"].send_text(json.dumps(message))
                except:
                    pass
            elif message_type in ["chat", "reaction"]:
                # Broadcast chat/reaction message to everyone in the room except sender
                if meeting_code in manager.active_connections:
                    for cid, info in manager.active_connections[meeting_code].items():
                        if cid != client_id:
                            try:
                                await info["ws"].send_text(json.dumps(message))
                            except:
                                pass
    except WebSocketDisconnect:
        manager.disconnect(meeting_code, client_id)
        await manager.broadcast_left(meeting_code, client_id)
