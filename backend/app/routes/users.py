from fastapi import UploadFile, File
import os
import shutil
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas, models
from app.database import get_db
from app.core.security import (
    get_current_user,
    verify_password,
    hash_password
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=schemas.UserOut)
def me(user: models.User = Depends(get_current_user)):
    return user


@router.put("/update-profile", response_model=schemas.UserOut)
def update_profile(
    data: schemas.UpdateProfileRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    existing = db.query(models.User).filter(
        models.User.email == data.email,
        models.User.id != user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")

    user.first_name = data.first_name
    user.last_name = data.last_name
    user.email = data.email
    user.phone = data.phone

    db.commit()
    db.refresh(user)

    return user


@router.put("/change-password")
def change_password(
    data: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    if not verify_password(data.old_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Старый пароль неверный")

    user.password_hash = hash_password(data.new_password)

    db.commit()

    return {"message": "Пароль успешно изменён"}
@router.post("/upload-avatar")
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user)
):
    os.makedirs("uploads", exist_ok=True)

    file_path = f"uploads/{user.id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    user.avatar = f"http://127.0.0.1:8000/{file_path}"

    db.commit()

    return {
        "avatar": user.avatar
    }