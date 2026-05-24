import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, field_validator

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None


# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    branch: Optional[str] = None
    year: Optional[str] = None
    avatar: Optional[str] = None
    college_id: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_verified: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Product Schemas ---
class ProductBase(BaseModel):
    title: str
    price: float
    original_price: Optional[float] = None
    condition: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    seller_id: int
    seller: UserResponse
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Chat Message Schemas ---
class ChatMessageBase(BaseModel):
    receiver_id: int
    product_id: Optional[int] = None
    text: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: int
    sender_id: int
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Aggregated Chat representing a conversation with another user
class ChatConversationResponse(BaseModel):
    id: str  # chat_1, etc.
    user: UserResponse  # the other user
    product: Optional[dict] = None  # {title, price}
    lastMessage: str
    lastMessageTime: str
    unread: bool
    messages: List[dict]  # [{sender: "me"|"them", text, time}]
