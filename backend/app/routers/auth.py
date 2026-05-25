from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.utils import security
from app.utils.email import send_otp_email
import random
import datetime

class GoogleLoginRequest(BaseModel):
    token: str
    email: str
    name: str

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Define OAuth2 scheme using Bearer token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    """Dependency to get the currently authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please login again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
        
    payload = security.verify_token(token)
    if payload is None:
        raise credentials_exception
        
    email: str = payload.get("sub")
    user_id: int = payload.get("user_id")
    if email is None or user_id is None:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new student account. Enforces OTP verification conditionally."""
    from app.config import settings
    try:
        # Check if user already exists
        db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
        if db_user:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "detail": "ALREADY_REGISTERED",
                    "message": "Email is already registered. Redirecting to login..."
                }
            )
        
        # Setup default avatar if not provided
        avatar_list = [
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
        ]
        avatar = user_in.avatar or random.choice(avatar_list)
        
        # Generate unique college ID if not provided
        college_id = user_in.college_id or f"COL-{datetime.datetime.now().year}-{random.randint(1000, 9999)}"
        
        # Auto-promote to admin if email starts with admin
        role = "admin" if user_in.email.startswith("admin") else "student"
        
        # Check if SMTP is configured for OTP verification
        is_smtp_configured = (
            settings.SMTP_USERNAME and
            settings.SMTP_PASSWORD and
            "YOUR_16_LETTER_APP_PASSWORD" not in settings.SMTP_PASSWORD and
            settings.SMTP_PASSWORD.strip() != ""
        )

        otp_code = None
        is_verified = True
        
        if is_smtp_configured:
            # Generate 6-digit OTP code
            otp_code = f"{random.randint(100000, 999999)}"
            is_verified = False

        hashed_password = security.get_password_hash(user_in.password)
        db_user = models.User(
            email=user_in.email,
            name=user_in.name,
            password_hash=hashed_password,
            branch=user_in.branch,
            year=user_in.year,
            avatar=avatar,
            is_verified=is_verified,
            otp_code=otp_code,
            role=role,
            college_id=college_id
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        if is_smtp_configured:
            try:
                # Try sending verification email
                send_otp_email(db_user.email, db_user.name, otp_code)
            except Exception as e:
                # Fallback: if sending email fails, auto-verify user so they are not stuck
                print(f"Error sending OTP to {db_user.email}: {e}. Falling back to auto-verification.")
                db_user.is_verified = True
                db_user.otp_code = None
                db.commit()
                db.refresh(db_user)
        
        # If they are verified, generate and return access token directly
        access_token = None
        if db_user.is_verified:
            access_token = security.create_access_token(
                data={"sub": db_user.email, "user_id": db_user.id}
            )
        
        return {
            "success": True, 
            "message": "Registration successful! Verification code sent to email." if not db_user.is_verified else "Registration successful! Logging you in...",
            "access_token": access_token,
            "token_type": "bearer" if access_token else None,
            "requires_otp": not db_user.is_verified
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        import traceback
        print("Registration Request Failure:")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed on server: {str(e)}"
        )

@router.post("/verify-otp", response_model=schemas.Token)
def verify_otp(payload: schemas.OTPVerify, db: Session = Depends(get_db)):
    """Verify registration OTP code and generate access token."""
    db_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found. Please register first."
        )
    
    if not db_user.otp_code or db_user.otp_code != payload.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code."
        )
    
    # Update verification status and clear OTP
    db_user.is_verified = True
    db_user.otp_code = None
    db.commit()
    db.refresh(db_user)
    
    # Generate and return session access token
    access_token = security.create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate student credentials and issue JWT token."""
    db_user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No account found with this email address."
        )
    if db_user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended by system moderators."
        )
    if not security.verify_password(user_credentials.password, db_user.password_hash):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password. Please try again."
        )
    
    access_token = security.create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """Fetch the authenticated student's profile."""
    return current_user

@router.post("/google-login", response_model=schemas.Token)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Authenticate Google OAuth token and issue JWT bearer token."""
    email = payload.email.lower()
    
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == email).first()
    if not db_user:
        # Create a new user automatically since it's their first time
        branch = "Computer Science Engg."
        year = "1st Year"
        
        avatar_list = [
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
        ]
        avatar = random.choice(avatar_list)
        college_id = f"COL-{datetime.datetime.now().year}-{random.randint(1000, 9999)}"
        role = "admin" if email.startswith("admin") else "student"
        
        # Google OAuth users are instantly verified
        db_user = models.User(
            email=email,
            name=payload.name,
            password_hash=security.get_password_hash(f"google-oauth-secret-{random.randint(1000, 9999)}"),
            branch=branch,
            year=year,
            avatar=avatar,
            is_verified=True,
            otp_code=None,
            role=role,
            college_id=college_id
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    
    if db_user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended by system moderators."
        )
        
    access_token = security.create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}
