from datetime import datetime, timedelta
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

# Demo-хранилище reset токенов.
# Для диплома подходит. Для production лучше отдельная таблица в БД.
RESET_TOKENS = {}


@router.post("/register", response_model=schemas.UserOut)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    exists = db.query(models.User).filter(models.User.email == data.email).first()

    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role=models.UserRole.USER,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=schemas.Token)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return schemas.Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=schemas.Token)
def refresh(refresh_token: str, db: Session = Depends(get_db)):
    payload = decode_token(refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(models.User).filter(models.User.id == int(payload.get("sub"))).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return schemas.Token(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/forgot-password")
def forgot_password(data: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Пользователь с таким email не найден")

    token = secrets.token_urlsafe(32)

    RESET_TOKENS[token] = {
        "user_id": user.id,
        "expires_at": datetime.utcnow() + timedelta(minutes=20),
    }

    reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={token}"

    return {
        "message": "Ссылка для восстановления создана",
        "reset_link": reset_link,
        "token": token,
    }


@router.post("/reset-password")
def reset_password(data: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    token_data = RESET_TOKENS.get(data.token)

    if not token_data:
        raise HTTPException(status_code=400, detail="Неверный или устаревший токен")

    if token_data["expires_at"] < datetime.utcnow():
        RESET_TOKENS.pop(data.token, None)
        raise HTTPException(status_code=400, detail="Срок действия токена истёк")

    user = db.query(models.User).filter(models.User.id == token_data["user_id"]).first()

    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    user.password_hash = hash_password(data.new_password)

    db.commit()

    RESET_TOKENS.pop(data.token, None)

    return {
        "message": "Пароль успешно изменён"
    }
