from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("", response_model=schemas.PaymentOut)
def pay(data: schemas.PaymentCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    booking = db.query(models.Booking).filter(models.Booking.id == data.booking_id).first()
    if not booking: raise HTTPException(404, "Booking not found")
    if booking.user_id != user.id and user.role == models.UserRole.USER:
        raise HTTPException(403, "Forbidden")
    existing = db.query(models.Payment).filter(models.Payment.booking_id == booking.id).first()
    if existing:
        existing.payment_status = models.PaymentStatus.PAID
        db.commit(); db.refresh(existing)
        return existing
    payment = models.Payment(booking_id=booking.id, user_id=booking.user_id, amount=booking.total_price, payment_method=data.payment_method, payment_status=models.PaymentStatus.PAID, transaction_id=str(uuid4())[:12].upper())
    db.add(payment); db.commit(); db.refresh(payment)
    return payment
