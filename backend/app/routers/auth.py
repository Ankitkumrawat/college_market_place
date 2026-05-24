from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.utils import security

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

@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new student account. Enforces .edu / .ac.in email domains."""
    try:
        # Check if user already exists
        db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists."
            )
        
        # Auto-verify all email accounts in development
        is_verified = True
        
        # Setup default avatar if not provided
        avatar_list = [
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
        ]
        import random
        avatar = user_in.avatar or random.choice(avatar_list)
        
        # Generate unique college ID if not provided
        import datetime
        college_id = user_in.college_id or f"COL-{datetime.datetime.now().year}-{random.randint(1000, 9999)}"
        
        hashed_password = security.get_password_hash(user_in.password)
        db_user = models.User(
            email=user_in.email,
            name=user_in.name,
            password_hash=hashed_password,
            branch=user_in.branch,
            year=user_in.year,
            avatar=avatar,
            is_verified=is_verified,
            college_id=college_id
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create and return access token
        access_token = security.create_access_token(
            data={"sub": db_user.email, "user_id": db_user.id}
        )
        return {"access_token": access_token, "token_type": "bearer"}
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

@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate student credentials and issue JWT token."""
    db_user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No account found with this email address."
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
