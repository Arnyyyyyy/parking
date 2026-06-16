from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.realtime import manager

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/parking")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
