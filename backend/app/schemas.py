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
    role: Optional[str] = "student"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str


class UserResponse(UserBase):
    id: int
    is_verified: bool
    is_banned: bool
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
    status: Optional[str] = "active"
    is_sold: Optional[bool] = False

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    seller_id: int
    seller: UserResponse
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class SellerDashboardProductResponse(BaseModel):
    id: int
    title: str
    price: float
    original_price: Optional[float] = None
    condition: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    status: str
    is_sold: bool
    created_at: datetime.datetime
    buyer_count: int

    class Config:
        from_attributes = True


# --- Chat Message Schemas ---
class ChatMessageBase(BaseModel):
    conversation_id: int
    text: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    text: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Conversation Schemas ---
class ConversationCreate(BaseModel):
    product_id: int

class ConversationResponse(BaseModel):
    id: int
    buyer_id: int
    seller_id: int
    product_id: int
    created_at: datetime.datetime
    product: ProductResponse
    seller: UserResponse
    buyer: UserResponse

    class Config:
        from_attributes = True

class BuyerDashboardConversationResponse(BaseModel):
    id: int
    buyer_id: int
    seller_id: int
    product_id: int
    created_at: datetime.datetime
    product: ProductResponse
    seller: UserResponse
    last_message: Optional[str] = None
    last_message_time: Optional[str] = None
    unread: bool = False

    class Config:
        from_attributes = True

# --- Channel Schemas ---
class ChannelBase(BaseModel):
    name: str

class ChannelCreate(ChannelBase):
    pass

class ChannelResponse(ChannelBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Channel Message Schemas ---
class ChannelMessageBase(BaseModel):
    text: str

class ChannelMessageCreate(ChannelMessageBase):
    pass

class ChannelMessageResponse(ChannelMessageBase):
    id: int
    channel_id: int
    sender_id: int
    sender: UserResponse
    created_at: datetime.datetime

    class Config:
        from_attributes = True
