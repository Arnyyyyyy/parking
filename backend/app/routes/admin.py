from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models, schemas
from app.core.security import require_roles

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/statistics", response_model=schemas.AdminStats)
def stats(db: Session = Depends(get_db), admin=Depends(require_roles(models.UserRole.ADMIN, models.UserRole.MODERATOR))):
    total_users = db.query(models.User).count()
    total_zones = db.query(models.ParkingZone).count()
    total_spots = db.query(models.ParkingSpot).count()
    free_spots = db.query(models.ParkingSpot).filter(models.ParkingSpot.status == models.SpotStatus.FREE).count()
    booked_spots = db.query(models.ParkingSpot).filter(models.ParkingSpot.status == models.SpotStatus.BOOKED).count()
    occupied_spots = db.query(models.ParkingSpot).filter(models.ParkingSpot.status == models.SpotStatus.OCCUPIED).count()
    active_bookings = db.query(models.Booking).filter(models.Booking.status == models.BookingStatus.ACTIVE).count()
    revenue_total = db.query(func.coalesce(func.sum(models.Payment.amount), 0)).filter(models.Payment.payment_status == models.PaymentStatus.PAID).scalar() or 0

    revenue_rows = db.query(func.date(models.Payment.created_at).label("day"), func.sum(models.Payment.amount)).filter(models.Payment.payment_status == models.PaymentStatus.PAID).group_by(func.date(models.Payment.created_at)).all()
    booking_rows = db.query(func.date(models.Booking.created_at).label("day"), func.count(models.Booking.id)).group_by(func.date(models.Booking.created_at)).all()
    zones = db.query(models.ParkingZone).all()
    zones_load = []
    for z in zones:
        occupied = db.query(models.ParkingSpot).filter(models.ParkingSpot.zone_id == z.id, models.ParkingSpot.status.in_([models.SpotStatus.BOOKED, models.SpotStatus.OCCUPIED])).count()
        zones_load.append({"zone": z.name, "load": round((occupied / z.total_spots) * 100, 1) if z.total_spots else 0})

    return schemas.AdminStats(
        total_users=total_users, total_zones=total_zones, total_spots=total_spots, free_spots=free_spots,
        booked_spots=booked_spots, occupied_spots=occupied_spots, active_bookings=active_bookings,
        revenue_total=float(revenue_total),
        revenue_by_day=[{"day": str(x[0]), "amount": float(x[1] or 0)} for x in revenue_rows],
        bookings_by_day=[{"day": str(x[0]), "count": int(x[1] or 0)} for x in booking_rows],
        zones_load=zones_load
    )

@router.get("/users", response_model=list[schemas.UserOut])
def users(db: Session = Depends(get_db), admin=Depends(require_roles(models.UserRole.ADMIN))):
    return db.query(models.User).order_by(models.User.id.desc()).all()
