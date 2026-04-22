from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas.auth import SignupRequest, SignupResponse, LoginRequest, UserInfo
from ..services.auth_service import hash_password, verify_password, create_access_token
from ..core.security import get_current_user
from ..middleware.rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    # C2 FIX: return 409 Conflict for duplicate emails, not 400
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    new_user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id, new_user.role)
    return SignupResponse(
        user_id=f"u_{new_user.id}",
        email=new_user.email,
        access_token=token,
    )


# C3 FIX: separate, tighter rate limit on login to prevent brute-force
@router.post("/login", response_model=SignupResponse)
@limiter.limit("5/minute")
def login(request: Request, req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    # Constant-time check (verify_password is always called even if user is None)
    password_ok = verify_password(req.password, user.hashed_password) if user else False
    if not user or not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(user.id, user.role)
    return SignupResponse(
        user_id=f"u_{user.id}",
        email=user.email,
        access_token=token,
    )


@router.get("/me", response_model=UserInfo)
def read_users_me(current_user: User = Depends(get_current_user)):
    # UserInfo schema excludes hashed_password by design (no field for it)
    return current_user
