import hashlib
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from ..database import get_db
from ..models import User, FarmerProfile
from ..schemas import UserSignup, UserLogin, TokenResponse
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

FIXED_SALT = "krishivani_sih2025_secure_salt"

def hash_password(password: str) -> str:
    return hashlib.sha256((password.strip() + FIXED_SALT).encode()).hexdigest()

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authorization header")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.post("/signup", response_model=TokenResponse)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    clean_phone = payload.phone.strip().replace(" ", "").replace("-", "")
    if clean_phone.startswith("+91"):
        clean_phone = clean_phone[3:]
        
    existing_user = db.query(User).filter(User.phone == clean_phone).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this phone number already exists. Please log in."
        )
        
    pwd_hash = hash_password(payload.password)
    new_user = User(
        name=payload.name.strip(),
        phone=clean_phone,
        password_hash=pwd_hash,
        has_completed_profile=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token({"user_id": new_user.id, "phone": new_user.phone})
    return TokenResponse(
        access_token=token,
        user_id=new_user.id,
        name=new_user.name,
        phone=new_user.phone,
        has_completed_profile=False
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    clean_phone = payload.phone.strip().replace(" ", "").replace("-", "")
    if clean_phone.startswith("+91"):
        clean_phone = clean_phone[3:]
        
    user = db.query(User).filter(User.phone == clean_phone).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this phone number. Please sign up."
        )
        
    pwd_hash = hash_password(payload.password)
    if user.password_hash != pwd_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your password."
        )
        
    token = create_access_token({"user_id": user.id, "phone": user.phone})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        name=user.name,
        phone=user.phone,
        has_completed_profile=user.has_completed_profile
    )

@router.get("/me")
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
    return {
        "user_id": user.id,
        "name": user.name,
        "phone": user.phone,
        "has_completed_profile": user.has_completed_profile,
        "profile": profile
    }
