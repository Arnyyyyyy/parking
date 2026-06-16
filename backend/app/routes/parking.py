from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas
from app.core.security import require_roles
from app.services.realtime import manager

router = APIRouter(prefix="/parking", tags=["Parking"])

def enrich_zone(zone: models.ParkingZone):
    free = sum(1 for s in zone.spots if s.status == models.SpotStatus.FREE)
    occupied = sum(1 for s in zone.spots if s.status == models.SpotStatus.OCCUPIED)
    booked = sum(1 for s in zone.spots if s.status == models.SpotStatus.BOOKED)
    return schemas.ParkingZoneOut(
        id=zone.id, name=zone.name, address=zone.address, latitude=zone.latitude, longitude=zone.longitude,
        total_spots=zone.total_spots, price_per_hour=zone.price_per_hour, status=zone.status,
        description=zone.description, free_spots=free, occupied_spots=occupied, booked_spots=booked, spots=zone.spots
    )

@router.get("/zones", response_model=list[schemas.ParkingZoneOut])
def list_zones(db: Session = Depends(get_db)):
    zones = db.query(models.ParkingZone).options(joinedload(models.ParkingZone.spots)).all()
    return [enrich_zone(z) for z in zones]

@router.post("/zones", response_model=schemas.ParkingZoneOut)
def create_zone(data: schemas.ParkingZoneCreate, db: Session = Depends(get_db), admin=Depends(require_roles(models.UserRole.ADMIN, models.UserRole.MODERATOR))):
    zone = models.ParkingZone(**data.model_dump())
    db.add(zone); db.flush()
    for i in range(1, data.total_spots + 1):
        db.add(models.ParkingSpot(zone_id=zone.id, spot_number=f"A-{i:02d}"))
    db.commit(); db.refresh(zone)
    zone = db.query(models.ParkingZone).options(joinedload(models.ParkingZone.spots)).get(zone.id)
    return enrich_zone(zone)

@router.put("/zones/{zone_id}", response_model=schemas.ParkingZoneOut)
def update_zone(zone_id: int, data: schemas.ParkingZoneUpdate, db: Session = Depends(get_db), admin=Depends(require_roles(models.UserRole.ADMIN, models.UserRole.MODERATOR))):
    zone = db.query(models.ParkingZone).filter(models.ParkingZone.id == zone_id).first()
    if not zone: raise HTTPException(404, "Zone not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(zone, k, v)
    db.commit(); db.refresh(zone)
    zone = db.query(models.ParkingZone).options(joinedload(models.ParkingZone.spots)).get(zone.id)
    return enrich_zone(zone)

@router.delete("/zones/{zone_id}")
def delete_zone(zone_id: int, db: Session = Depends(get_db), admin=Depends(require_roles(models.UserRole.ADMIN))):
    zone = db.query(models.ParkingZone).filter(models.ParkingZone.id == zone_id).first()
    if not zone: raise HTTPException(404, "Zone not found")
    db.delete(zone); db.commit()
    return {"ok": True}

@router.put("/spots/{spot_id}/status", response_model=schemas.ParkingSpotOut)
async def update_spot_status(spot_id: int, data: schemas.SpotStatusUpdate, db: Session = Depends(get_db), admin=Depends(require_roles(models.UserRole.ADMIN, models.UserRole.MODERATOR))):
    spot = db.query(models.ParkingSpot).filter(models.ParkingSpot.id == spot_id).first()
    if not spot: raise HTTPException(404, "Spot not found")
    spot.status = data.status
    db.commit(); db.refresh(spot)
    await manager.broadcast({"type":"spot_status_changed", "spot_id": spot.id, "zone_id": spot.zone_id, "status": spot.status.value})
    return spot
