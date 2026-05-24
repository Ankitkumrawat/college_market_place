from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Dict, Optional
import datetime
from app.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user
from app.utils import security

router = APIRouter(prefix="/api/chat", tags=["Chat & WebSockets"])
buyer_router = APIRouter(prefix="/api/buyer", tags=["Buyer Dashboard"])
seller_router = APIRouter(prefix="/api/seller", tags=["Seller Dashboard"])

# --- Private Conversation WebSocket Rooms Manager ---
class ConversationConnectionManager:
    def __init__(self):
        # Maps conversation_id -> List of active WebSockets
        self.active_rooms: Dict[int, List[WebSocket]] = {}

    async def connect(self, conversation_id: int, websocket: WebSocket):
        await websocket.accept()
        if conversation_id not in self.active_rooms:
            self.active_rooms[conversation_id] = []
        self.active_rooms[conversation_id].append(websocket)

    def disconnect(self, conversation_id: int, websocket: WebSocket):
        if conversation_id in self.active_rooms:
            if websocket in self.active_rooms[conversation_id]:
                self.active_rooms[conversation_id].remove(websocket)
            if not self.active_rooms[conversation_id]:
                del self.active_rooms[conversation_id]

    async def broadcast(self, message: dict, conversation_id: int):
        if conversation_id in self.active_rooms:
            for connection in self.active_rooms[conversation_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

conversation_manager = ConversationConnectionManager()


# --- Private Conversation REST API Endpoints ---

@router.post("/conversations", response_model=schemas.ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conv_in: schemas.ConversationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Start a new item-specific conversation with the seller of a product."""
    product = db.query(models.Product).filter(models.Product.id == conv_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
        
    if product.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot start a conversation with yourself.")
        
    # Check if conversation already exists
    conv = db.query(models.Conversation).filter(
        models.Conversation.buyer_id == current_user.id,
        models.Conversation.seller_id == product.seller_id,
        models.Conversation.product_id == conv_in.product_id
    ).first()
    
    if not conv:
        conv = models.Conversation(
            buyer_id=current_user.id,
            seller_id=product.seller_id,
            product_id=conv_in.product_id
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
        
    return conv


@router.get("/conversations/{conversation_id}/messages", response_model=List[schemas.ChatMessageResponse])
def get_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetch message history for a specific conversation."""
    conv = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
        
    if conv.buyer_id != current_user.id and conv.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this conversation.")
        
    return db.query(models.ChatMessage).filter(models.ChatMessage.conversation_id == conversation_id).order_by(models.ChatMessage.created_at.asc()).all()


@router.post("/conversations/{conversation_id}/messages", response_model=schemas.ChatMessageResponse)
async def send_conversation_message_http(
    conversation_id: int,
    msg_in: schemas.ChannelMessageCreate,  # reusing text schema
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Send a message to a conversation via HTTP (fallback)."""
    conv = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
        
    if conv.buyer_id != current_user.id and conv.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to message in this conversation.")
        
    db_msg = models.ChatMessage(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        text=msg_in.text
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    
    # Broadcast to WebSocket
    msg_payload = {
        "id": db_msg.id,
        "conversation_id": conversation_id,
        "sender_id": current_user.id,
        "text": db_msg.text,
        "created_at": db_msg.created_at.isoformat(),
        "time": db_msg.created_at.strftime("%I:%M %p")
    }
    await conversation_manager.broadcast(msg_payload, conversation_id)
    return db_msg


# --- WebSocket Route for private item-specific conversation ---
@router.websocket("/ws/conversation/{conversation_id}/{token}")
async def conversation_websocket_endpoint(
    websocket: WebSocket,
    conversation_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    """WebSocket connection handler for a specific conversation room."""
    payload = security.verify_token(token)
    if not payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    user_id = payload.get("user_id")
    if not user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Check if conversation exists and user is part of it
    conversation = db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()
    if not conversation or (conversation.buyer_id != user_id and conversation.seller_id != user_id):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await conversation_manager.connect(conversation_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            text = data.get("text")
            if not text or not text.strip():
                continue
                
            db_msg = models.ChatMessage(
                conversation_id=conversation_id,
                sender_id=user_id,
                text=text
            )
            db.add(db_msg)
            db.commit()
            db.refresh(db_msg)
            
            msg_payload = {
                "id": db_msg.id,
                "conversation_id": conversation_id,
                "sender_id": user_id,
                "text": text,
                "created_at": db_msg.created_at.isoformat(),
                "time": db_msg.created_at.strftime("%I:%M %p")
            }
            await conversation_manager.broadcast(msg_payload, conversation_id)
            
    except WebSocketDisconnect:
        conversation_manager.disconnect(conversation_id, websocket)


# --- Buyer Dashboard Route ---

@buyer_router.get("/dashboard", response_model=List[schemas.BuyerDashboardConversationResponse])
def get_buyer_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetches all active conversations where the current user is the buyer, along with last message details."""
    conversations = db.query(models.Conversation).filter(
        models.Conversation.buyer_id == current_user.id
    ).all()
    
    result = []
    for conv in conversations:
        last_msg_obj = db.query(models.ChatMessage).filter(
            models.ChatMessage.conversation_id == conv.id
        ).order_by(models.ChatMessage.created_at.desc()).first()
        
        last_message = last_msg_obj.text if last_msg_obj else None
        last_message_time = last_msg_obj.created_at.strftime("%I:%M %p") if last_msg_obj else None
        unread = any(not m.is_read and m.sender_id != current_user.id for m in conv.messages)
        
        result.append({
            "id": conv.id,
            "buyer_id": conv.buyer_id,
            "seller_id": conv.seller_id,
            "product_id": conv.product_id,
            "created_at": conv.created_at,
            "product": conv.product,
            "seller": conv.seller,
            "last_message": last_message,
            "last_message_time": last_message_time,
            "unread": unread
        })
        
    return result


# --- Seller Dashboard Routes ---

@seller_router.get("/dashboard", response_model=List[schemas.SellerDashboardProductResponse])
def get_seller_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetch all products uploaded by the current user along with conversation (interested buyer) count."""
    products = db.query(models.Product).filter(models.Product.seller_id == current_user.id).order_by(models.Product.created_at.desc()).all()
    
    result = []
    for prod in products:
        buyer_count = db.query(models.Conversation).filter(models.Conversation.product_id == prod.id).count()
        result.append({
            "id": prod.id,
            "title": prod.title,
            "price": prod.price,
            "original_price": prod.original_price,
            "condition": prod.condition,
            "category": prod.category,
            "image_url": prod.image_url,
            "description": prod.description,
            "tags": prod.tags,
            "status": prod.status,
            "is_sold": prod.is_sold,
            "created_at": prod.created_at,
            "buyer_count": buyer_count
        })
    return result


@seller_router.get("/conversations", response_model=List[schemas.ConversationResponse])
def get_seller_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetch all active chat conversations where the current user is the seller, so they can reply to interested buyers."""
    return db.query(models.Conversation).filter(models.Conversation.seller_id == current_user.id).order_by(models.Conversation.created_at.desc()).all()


# --- Public Channel Chat Rooms Manager & Routes ---

class ChannelConnectionManager:
    def __init__(self):
        # Maps channel_id -> List of active WebSockets
        self.active_rooms: Dict[int, List[WebSocket]] = {}

    async def connect(self, channel_id: int, websocket: WebSocket):
        await websocket.accept()
        if channel_id not in self.active_rooms:
            self.active_rooms[channel_id] = []
        self.active_rooms[channel_id].append(websocket)

    def disconnect(self, channel_id: int, websocket: WebSocket):
        if channel_id in self.active_rooms:
            if websocket in self.active_rooms[channel_id]:
                self.active_rooms[channel_id].remove(websocket)
            if not self.active_rooms[channel_id]:
                del self.active_rooms[channel_id]

    async def broadcast(self, message: dict, channel_id: int):
        if channel_id in self.active_rooms:
            for connection in self.active_rooms[channel_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

channel_manager = ChannelConnectionManager()


@router.get("/channels", response_model=List[schemas.ChannelResponse])
def get_channels(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Retrieve all available public community chat channels."""
    return db.query(models.Channel).all()


@router.post("/channels", response_model=schemas.ChannelResponse)
def create_channel(
    channel_in: schemas.ChannelCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new public community chat channel."""
    name = channel_in.name.strip()
    if not name.startswith("#"):
        name = f"#{name}"
        
    existing = db.query(models.Channel).filter(models.Channel.name == name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A channel with this name already exists."
        )
        
    db_channel = models.Channel(name=name)
    db.add(db_channel)
    db.commit()
    db.refresh(db_channel)
    return db_channel


@router.get("/channels/{channel_id}/messages", response_model=List[schemas.ChannelMessageResponse])
def get_channel_messages(
    channel_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Retrieve all historical messages for a specific channel."""
    return db.query(models.ChannelMessage).filter(models.ChannelMessage.channel_id == channel_id).order_by(models.ChannelMessage.created_at.asc()).all()


@router.post("/channels/{channel_id}/messages", response_model=schemas.ChannelMessageResponse)
async def send_channel_message_http(
    channel_id: int,
    msg_in: schemas.ChannelMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Send a message to a public channel via REST API."""
    db_msg = models.ChannelMessage(
        channel_id=channel_id,
        sender_id=current_user.id,
        text=msg_in.text
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    
    # Broadcast to websocket room
    msg_payload = {
        "id": db_msg.id,
        "channel_id": channel_id,
        "sender_id": current_user.id,
        "sender": {
            "id": current_user.id,
            "name": current_user.name,
            "avatar": current_user.avatar,
            "branch": current_user.branch,
            "year": current_user.year,
            "role": current_user.role,
            "is_verified": current_user.is_verified,
            "is_banned": current_user.is_banned,
            "email": current_user.email,
            "created_at": current_user.created_at.isoformat()
        },
        "text": db_msg.text,
        "created_at": db_msg.created_at.isoformat(),
        "time": db_msg.created_at.strftime("%I:%M %p")
    }
    await channel_manager.broadcast(msg_payload, channel_id)
    return db_msg


@router.websocket("/ws/channel/{channel_id}/{token}")
async def channel_websocket_endpoint(
    websocket: WebSocket,
    channel_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    """WebSocket connection handler for a specific public channel room."""
    payload = security.verify_token(token)
    if not payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    user_id = payload.get("user_id")
    if not user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await channel_manager.connect(channel_id, websocket)
    try:
        while True:
            # Receive client message JSON: {"text": str}
            data = await websocket.receive_json()
            text = data.get("text")
            if not text or not text.strip():
                continue
                
            db_msg = models.ChannelMessage(
                channel_id=channel_id,
                sender_id=user_id,
                text=text
            )
            db.add(db_msg)
            db.commit()
            db.refresh(db_msg)
            
            msg_payload = {
                "id": db_msg.id,
                "channel_id": channel_id,
                "sender_id": user_id,
                "sender": {
                    "id": user.id,
                    "name": user.name,
                    "avatar": user.avatar,
                    "branch": user.branch,
                    "year": user.year,
                    "role": user.role,
                    "is_verified": user.is_verified,
                    "is_banned": user.is_banned,
                    "email": user.email,
                    "created_at": user.created_at.isoformat()
                },
                "text": text,
                "created_at": db_msg.created_at.isoformat(),
                "time": db_msg.created_at.strftime("%I:%M %p")
            }
            await channel_manager.broadcast(msg_payload, channel_id)
            
    except WebSocketDisconnect:
        channel_manager.disconnect(channel_id, websocket)
