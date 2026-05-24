from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict
import datetime
from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user
from app.utils import security

router = APIRouter(prefix="/api/chat", tags=["Chat & WebSockets"])

# --- WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        # Maps user_id -> Active WebSocket connection
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)

manager = ConnectionManager()


# --- REST API Endpoints ---

@router.get("/conversations", response_model=List[schemas.ChatConversationResponse])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieve all chat conversations grouped by (partner, product) for the logged-in student."""
    # Fetch all messages where current user is sender or receiver
    messages = db.query(models.ChatMessage).filter(
        or_(
            models.ChatMessage.sender_id == current_user.id,
            models.ChatMessage.receiver_id == current_user.id
        )
    ).order_by(models.ChatMessage.created_at.asc()).all()

    # Group messages by (partner_id, product_id)
    conversations_map = {}
    for msg in messages:
        partner_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        product_id = msg.product_id
        conv_key = f"{partner_id}_{product_id or 0}"
        
        if conv_key not in conversations_map:
            partner = db.query(models.User).filter(models.User.id == partner_id).first()
            product = db.query(models.Product).filter(models.Product.id == product_id).first() if product_id else None
            
            conversations_map[conv_key] = {
                "id": f"chat_{conv_key}",
                "partner": partner,
                "product": product,
                "messages": []
            }
        
        conversations_map[conv_key]["messages"].append(msg)

    result = []
    for conv_key, conv in conversations_map.items():
        msgs = conv["messages"]
        last_msg = msgs[-1]
        
        # Format messages according to UI expectations
        formatted_messages = []
        unread = False
        for m in msgs:
            sender_label = "me" if m.sender_id == current_user.id else "them"
            formatted_messages.append({
                "sender": sender_label,
                "text": m.text,
                "time": m.created_at.strftime("%I:%M %p") if m.created_at.date() == datetime.date.today() else m.created_at.strftime("%b %d")
            })
            
            if m.receiver_id == current_user.id and not m.is_read:
                unread = True

        partner = conv["partner"]
        product = conv["product"]
        
        if not partner:
            continue
            
        result.append({
            "id": conv["id"],
            "user": schemas.UserResponse.from_attributes(partner),
            "product": {
                "title": product.title,
                "price": product.price
            } if product else None,
            "lastMessage": last_msg.text,
            "lastMessageTime": last_msg.created_at.strftime("%I:%M %p") if last_msg.created_at.date() == datetime.date.today() else last_msg.created_at.strftime("%b %d"),
            "unread": unread,
            "messages": formatted_messages
        })
        
    return result

@router.post("/messages", response_model=schemas.ChatMessageResponse)
def send_message(
    msg_in: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """HTTP Post endpoint to send a message (fallback if WebSocket is not used)."""
    db_msg = models.ChatMessage(
        sender_id=current_user.id,
        receiver_id=msg_in.receiver_id,
        product_id=msg_in.product_id,
        text=msg_in.text
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg


# --- WebSocket Bidirectional Route ---

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    """WebSocket connection handler that authorizes via JWT token parameters."""
    payload = security.verify_token(token)
    if not payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    user_id = payload.get("user_id")
    if not user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    await manager.connect(user_id, websocket)
    try:
        while True:
            # Expecting message JSON format: {"receiver_id": int, "product_id": int/null, "text": str}
            data = await websocket.receive_json()
            receiver_id = data.get("receiver_id")
            product_id = data.get("product_id")
            text = data.get("text")
            
            if not receiver_id or not text:
                continue
                
            db_msg = models.ChatMessage(
                sender_id=user_id,
                receiver_id=receiver_id,
                product_id=product_id,
                text=text
            )
            db.add(db_msg)
            db.commit()
            db.refresh(db_msg)
            
            msg_payload = {
                "id": db_msg.id,
                "sender_id": user_id,
                "receiver_id": receiver_id,
                "product_id": product_id,
                "text": text,
                "created_at": db_msg.created_at.isoformat(),
                "time": db_msg.created_at.strftime("%I:%M %p")
            }
            
            # Send the message in real-time to receiver (if active) and sender
            await manager.send_personal_message(msg_payload, receiver_id)
            await manager.send_personal_message(msg_payload, user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
