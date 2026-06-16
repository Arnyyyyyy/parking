from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user, require_roles
from app.services.qr_service import generate_booking_qr
from app.services.realtime import manager

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def booking_to_out(b: models.Booking):
    return schemas.BookingOut(
        id=b.id, zone_id=b.zone_id, spot_id=b.spot_id, car_id=b.car_id, start_time=b.start_time, end_time=b.end_time,
        total_price=b.total_price, status=b.status, qr_code=b.qr_code, created_at=b.created_at,
        zone_name=b.zone.name if b.zone else None,
        spot_number=b.spot.spot_number if b.spot else None,
        plate_number=b.car.plate_number if b.car else None,
        payment_status=b.payment.payment_status.value if b.payment else "PENDING"
    )

@router.post("", response_model=schemas.BookingOut)
async def create_booking(data: schemas.BookingCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    zone = db.query(models.ParkingZone).filter(models.ParkingZone.id == data.zone_id).first()
    spot = db.query(models.ParkingSpot).filter(models.ParkingSpot.id == data.spot_id, models.ParkingSpot.zone_id == data.zone_id).first()
    if not zone or not spot: raise HTTPException(404, "Zone or spot not found")
    if spot.status != models.SpotStatus.FREE:
        raise HTTPException(400, "Spot is not free")
    if data.end_time <= data.start_time:
        raise HTTPException(400, "End time must be after start time")
    hours = max((data.end_time - data.start_time).total_seconds() / 3600, 0.5)
    total_price = round(hours * zone.price_per_hour, 2)
    car = models.Car(user_id=user.id, plate_number=data.plate_number.upper(), car_brand=data.car_brand, car_model=data.car_model)
    db.add(car); db.flush()
    booking = models.Booking(user_id=user.id, zone_id=zone.id, spot_id=spot.id, car_id=car.id, start_time=data.start_time, end_time=data.end_time, total_price=total_price)
    db.add(booking); db.flush()
    booking.qr_code = generate_booking_qr(booking.id, car.plate_number, zone.name)
    spot.status = models.SpotStatus.BOOKED
    db.commit()
    booking = db.query(models.Booking).options(joinedload(models.Booking.zone), joinedload(models.Booking.spot), joinedload(models.Booking.car), joinedload(models.Booking.payment)).get(booking.id)
    await manager.broadcast({"type":"spot_status_changed", "spot_id": spot.id, "zone_id": zone.id, "status":"BOOKED"})
    return booking_to_out(booking)

@router.get("/my", response_model=list[schemas.BookingOut])
def my_bookings(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    items = db.query(models.Booking).options(joinedload(models.Booking.zone), joinedload(models.Booking.spot), joinedload(models.Booking.car), joinedload(models.Booking.payment)).filter(models.Booking.user_id == user.id).order_by(models.Booking.id.desc()).all()
    return [booking_to_out(x) for x in items]

@router.get("/all", response_model=list[schemas.BookingOut])
def all_bookings(db: Session = Depends(get_db), admin=Depends(require_roles(models.UserRole.ADMIN, models.UserRole.MODERATOR))):
    items = db.query(models.Booking).options(joinedload(models.Booking.zone), joinedload(models.Booking.spot), joinedload(models.Booking.car), joinedload(models.Booking.payment)).order_by(models.Booking.id.desc()).all()
    return [booking_to_out(x) for x in items]

@router.put("/{booking_id}/cancel")
async def cancel_booking(booking_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking: raise HTTPException(404, "Booking not found")
    if booking.user_id != user.id and user.role == models.UserRole.USER:
        raise HTTPException(403, "Forbidden")
    booking.status = models.BookingStatus.CANCELLED
    spot = db.query(models.ParkingSpot).filter(models.ParkingSpot.id == booking.spot_id).first()
    if spot: spot.status = models.SpotStatus.FREE
    db.commit()
    await manager.broadcast({"type":"spot_status_changed", "spot_id": booking.spot_id, "zone_id": booking.zone_id, "status":"FREE"})
    return {"ok": True}
